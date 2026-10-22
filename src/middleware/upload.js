/**
 * Secure file upload middleware.
 *
 * Handles multipart/form-data uploads using only Node built-ins (fs, path)
 * to avoid extra dependencies. Enforces:
 *  - file extension allow-list
 *  - MIME type check via magic-byte inspection (first bytes)
 *  - file size limit
 *  - randomized filenames (no original names on disk)
 *  - no executable extensions
 *
 * Parses a single file field named "image". Non-file fields are collected
 * into req.body as strings.
 */

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../public/uploads');
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_MIME_PREFIXES = ['image/'];

const MAGIC_BYTES = [
  { sig: [0xff, 0xd8, 0xff], mime: 'image/jpeg' },
  { sig: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png' },
  { sig: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp' }, // RIFF (webp starts with RIFF)
  { sig: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif' },
];

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function randomName(ext) {
  return `${require('crypto').randomBytes(16).toString('hex')}${ext}`;
}

function detectMime(buffer) {
  for (const { sig, mime } of MAGIC_BYTES) {
    let match = true;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) { match = false; break; }
    }
    if (match) return mime;
  }
  return null;
}

function parseMultipart(req, boundary) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks);
        const fields = {};
        const files = [];

        const delim = Buffer.from(`--${boundary}`);

        // Split the raw body on the boundary delimiter. Buffer has no
        // `split` method, so the segments are located by hand.
        const segments = [];
        let cursor = 0;
        while (cursor < body.length) {
          const next = body.indexOf(delim, cursor);
          if (next === -1) break;
          if (next > cursor) segments.push(body.subarray(cursor, next));
          cursor = next + delim.length;
        }

        for (const segment of segments) {
          // A segment starts with CRLF after the delimiter and ends with CRLF
          // before the next one; the final segment ends with "--".
          let clean = segment;
          if (clean.subarray(0, 2).equals(Buffer.from('\r\n'))) clean = clean.subarray(2);
          if (clean.subarray(0, 2).equals(Buffer.from('\n'))) clean = clean.subarray(1);
          if (clean.length >= 2 && clean.subarray(clean.length - 2).equals(Buffer.from('\r\n'))) {
            clean = clean.subarray(0, clean.length - 2);
          }
          if (clean.length >= 2 && clean.subarray(clean.length - 2).equals(Buffer.from('--'))) {
            clean = clean.subarray(0, clean.length - 2);
          }
          if (!clean.length) continue;

          const headerEnd = clean.indexOf('\r\n\r\n');
          if (headerEnd === -1) continue;
          const headerBlock = clean.subarray(0, headerEnd).toString('latin1');
          const content = clean.subarray(headerEnd + 4);

          const nameMatch = headerBlock.match(/name="([^"]+)"/);
          const filenameMatch = headerBlock.match(/filename="([^"]+)"/);

          const fieldName = nameMatch ? nameMatch[1] : null;

          if (filenameMatch) {
            // file field
            const originalName = filenameMatch[1];
            const ext = path.extname(originalName).toLowerCase();
            if (!ALLOWED_EXTENSIONS.has(ext)) {
              return reject(new Error(`File type not allowed: ${ext}`));
            }
            const mime = detectMime(content);
            // ALLOWED_MIME_PREFIXES holds *prefixes* (e.g. "image/"), so the
            // detected mime type must start with one of them.
            const mimeAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mime && mime.startsWith(prefix));
            if (!mime || !mimeAllowed) {
              return reject(new Error('Invalid image file (content does not match an allowed image type).'));
            }
            if (content.length > MAX_FILE_SIZE) {
              return reject(new Error(`File too large. Max ${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB.`));
            }
            const storedName = randomName(ext);
            const storedPath = path.join(UPLOAD_DIR, storedName);
            fs.writeFileSync(storedPath, content);
            files.push({
              fieldname: fieldName,
              originalname: originalName,
              filename: storedName,
              path: storedPath,
              url: `/uploads/${storedName}`,
              mimetype: mime,
              size: content.length,
            });
            if (fieldName) fields[fieldName] = storedName; // store just the filename for DB
          } else if (fieldName) {
            fields[fieldName] = content.toString('utf8');
          }
        }

        resolve({ fields, files });
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function uploadSingle(fieldName = 'image') {
  return async (req, res, next) => {
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
      return next();
    }

    const match = req.headers['content-type'].match(/boundary=([^;\s]+)/);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: 'Missing multipart boundary',
        code: 'MISSING_BOUNDARY',
      });
    }

    try {
      const { fields, files } = await parseMultipart(req, match[1]);
      req.body = { ...req.body, ...fields };
      req.files = files;
      const uploaded = files.find((f) => f.fieldname === fieldName);
      if (uploaded) {
        req.file = uploaded;
        // expose a stable field for controllers
        req.body.image = uploaded.filename;
      }
      next();
    } catch (err) {
      // cleanup any partially written files
      (req.files || []).forEach((f) => {
        try { fs.unlinkSync(f.path); } catch (_) {}
      });
      next({
        statusCode: 400,
        message: err.message || 'Upload failed',
        code: 'UPLOAD_ERROR',
      });
    }
  };
}

module.exports = { uploadSingle, UPLOAD_DIR };
