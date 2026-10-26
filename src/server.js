'use strict';

// SIRKULA local demo server — Node.js built-ins only, no database or external packages.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendJson(res, statusCode, body) {
  const payload = Buffer.from(JSON.stringify(body, null, 2));
  res.writeHead(statusCode, {
    'Content-Type': MIME_TYPES['.json'],
    'Content-Length': payload.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  res.end(payload);
}

function createServer() {
  return http.createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-cache');

    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      res.setHeader('Allow', 'GET, HEAD');
      return sendJson(res, 405, { success: false, error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
    }

    let pathname;
    try {
      // Decode the raw request path before filesystem resolution. URL.pathname normalizes
      // encoded dot-segments, which can hide traversal attempts from the guard below.
      const rawPath = String(req.url || '/').split('?')[0];
      pathname = decodeURIComponent(rawPath);
    } catch (_error) {
      return sendJson(res, 400, { success: false, error: 'Invalid URL', code: 'BAD_REQUEST' });
    }

    if (pathname === '/api/v1/health') {
      return sendJson(res, 200, { success: true, status: 'ok', mode: 'demo-localstorage', database: 'disabled' });
    }
    if (pathname === '/api/v1/demo-info') {
      return sendJson(res, 200, {
        success: true,
        mode: 'demo-localstorage',
        message: 'SIRKULA runs locally. Demo data is stored in this browser and is not shared between devices.',
        authentication: 'simulation-only',
        accounts: [
          { role: 'SELLER', email: 'seller@demo.sirkula' },
          { role: 'RECEIVER', email: 'receiver@demo.sirkula' },
          { role: 'ADMIN', email: 'admin@demo.sirkula' },
        ],
      });
    }
    if (pathname.startsWith('/api/')) {
      return sendJson(res, 404, { success: false, error: 'Demo API route not found', code: 'NOT_FOUND' });
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const targetPath = path.resolve(PUBLIC_DIR, relativePath);
    const relativeCheck = path.relative(PUBLIC_DIR, targetPath);
    if (relativeCheck.startsWith('..') || path.isAbsolute(relativeCheck)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    fs.stat(targetPath, (statError, stats) => {
      if (!statError && stats.isDirectory()) {
        return serveFile(path.join(targetPath, 'index.html'), req, res);
      }
      serveFile(targetPath, req, res);
    });
  });
}

function serveFile(filePath, req, res) {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      if ((req.url || '').startsWith('/api/')) {
        return sendJson(res, 404, { success: false, error: 'Route not found', code: 'NOT_FOUND' });
      }
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      return fs.readFile(notFoundPath, (readError, content) => {
        if (readError) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('404 — Page not found');
        }
        res.writeHead(404, { 'Content-Type': MIME_TYPES['.html'], 'Content-Length': content.length });
        return res.end(req.method === 'HEAD' ? undefined : content);
      });
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Last-Modified': stats.mtime.toUTCString(),
      'Cache-Control': extension.match(/\.(html|css|js)$/) ? 'no-cache' : 'public, max-age=86400',
    });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Unable to read file');
    });
    stream.pipe(res);
  });
}

if (require.main === module) {
  const configuredPort = process.env.PORT;
  const port = configuredPort ? Number(configuredPort) : 5000;
  const server = createServer();
  server.listen(port, '127.0.0.1', () => {
    const address = server.address();
    console.log('🌱 SIRKULA demo server started');
    console.log(`   Local:  http://localhost:${address.port}`);
    console.log('   Mode:   localStorage demo — database disabled');
    console.log('   Start:  open /index.html in your browser');
  });
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Close the other server or set PORT to another port.`);
    } else {
      console.error('Failed to start SIRKULA:', error.message);
    }
    process.exitCode = 1;
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createServer, PUBLIC_DIR };
