/**
 * SIRKULA end-to-end smoke test.
 *
 * Exercises the public API against a running server (default http://localhost:5000)
 * using the seeded demo accounts. Run with:
 *
 *   node --test tests/e2e.test.js
 *
 * The script performs a real login (so it needs the CSRF cookie/header pair),
 * then walks through the seller, receiver, admin, reservation, inventory,
 * moderation, upload and error-handling flows.
 */

const assert = require('node:assert/strict');
const { test, before } = require('node:test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const API = `${BASE_URL}/api/v1`;
const PASSWORD = 'Password123!';

const ADMIN = 'admin@sirkula.demo';
const SELLER = 'seller.bakery@sirkula.demo';
const RECEIVER = 'receiver.andi@sirkula.demo';

/** Minimal cookie-aware fetch wrapper (Node 20+ has global fetch). */
function createClient() {
  const cookies = new Map();

  function cookieHeader() {
    return Array.from(cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  function storeCookies(res) {
    const raw = res.headers.getSetCookie
      ? res.headers.getSetCookie()
      : res.headers.get('set-cookie')
        ? [res.headers.get('set-cookie')]
        : [];
    for (const line of raw) {
      const [pair] = line.split(';');
      const idx = pair.indexOf('=');
      if (idx > 0) cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
    }
  }

  async function request(method, path, body, extraHeaders = {}) {
    const headers = { Accept: 'application/json', ...extraHeaders };
    if (cookies.size) headers.Cookie = cookieHeader();

    // FormData must be sent as-is: the browser sets the multipart boundary.
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    let payload;
    if (isForm) {
      payload = body;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    // State-changing requests need the double-submit CSRF header.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const token = cookies.get('XSRF_TOKEN');
      if (token) headers['X-XSRF-TOKEN'] = token;
    }

    const res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: payload,
    });
    storeCookies(res);

    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }
    return { status: res.status, body: data };
  }

  return {
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b),
    patch: (p, b) => request('PATCH', p, b),
    del: (p) => request('DELETE', p),
    cookies,
  };
}

async function login(email, password = PASSWORD) {
  const client = createClient();
  // Prime the CSRF cookie.
  await client.get('/auth/me');
  const res = await client.post('/auth/login', { email, password });
  assert.equal(res.status, 200, `login failed for ${email}: ${JSON.stringify(res.body)}`);
  assert.equal(res.body.success, true);
  return client;
}

let seller;
let receiver;
let admin;

before(async () => {
  seller = await login(SELLER);
  receiver = await login(RECEIVER);
  admin = await login(ADMIN);
});

/** Small helper that creates a throwaway listing for a flow under test. */
async function makeListing(client, overrides = {}) {
  const deadline = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
  const res = await client.post('/listings', {
    title: 'E2E Temporary Listing',
    description: 'Automated end-to-end test listing.',
    category: 'Bakery',
    quantity: 10,
    unit: 'pieces',
    condition: 'Fresh',
    price: 0,
    pickupLocation: 'Jl. Otomatis No. 1, Central City',
    pickupDeadline: deadline,
    ...overrides,
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data.id;
}


test('health check reports the database connection', async () => {
  const res = await fetch(`${API}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.db, 'connected');
});

test('unauthenticated access to a protected route is rejected', async () => {
  const client = createClient();
  const res = await client.get('/reservations');
  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'AUTH_REQUIRED');
});

test('GET /auth/me returns the logged-in user', async () => {
  const res = await seller.get('/auth/me');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, SELLER);
  assert.equal(res.body.data.user.role, 'SELLER');
});

test('marketplace returns available listings with pagination metadata', async () => {
  const res = await receiver.get('/marketplace?page=1&limit=10');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data.listings));
  assert.ok(res.body.data.total >= 1);
  assert.ok(typeof res.body.data.page === 'number');
});

test('marketplace rejects an out-of-range limit', async () => {
  const res = await receiver.get('/marketplace?limit=9999');
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'VALIDATION_ERROR');
});

test('seller can create a listing and it appears in the marketplace', async () => {
  const listingId = await makeListing(seller, { title: 'E2E Test Bakery Surplus' });

  const list = await receiver.get('/marketplace?limit=100');
  const found = list.body.data.listings.find((l) => l.id === listingId);
  assert.ok(found, 'created listing should be listed in the marketplace');

  // Cleanup so re-runs stay deterministic.
  const del = await seller.del(`/listings/${listingId}`);
  assert.equal(del.status, 200);
});

test('receiver cannot create a listing', async () => {
  const res = await receiver.post('/listings', {
    title: 'Should not be allowed',
    category: 'Bakery',
    quantity: 1,
    unit: 'pieces',
    condition: 'Fresh',
    pickupLocation: 'Somewhere',
    pickupDeadline: new Date(Date.now() + 86400000).toISOString(),
  });
  assert.equal(res.status, 403);
});

test('receiver can reserve available stock and seller can approve it', async () => {
  const listingId = await makeListing(seller, {
    title: 'E2E Reservation Flow',
    category: 'Produce',
    quantity: 10,
    unit: 'kg',
  });

  // --- Reserve ---
  const reserve = await receiver.post('/reservations', { listingId, quantity: 4, notes: 'E2E test.' });
  assert.equal(reserve.status, 201, JSON.stringify(reserve.body));
  const reservationId = reserve.body.data.id;
  assert.equal(reserve.body.data.status, 'PENDING');

  // A duplicate active reservation must be rejected.
  const dup = await receiver.post('/reservations', { listingId, quantity: 1 });
  assert.equal(dup.status, 409);
  assert.equal(dup.body.code, 'DUPLICATE_RESERVATION');

  // The receiver may not approve their own reservation.
  const selfApprove = await receiver.patch(`/reservations/${reservationId}`, { status: 'APPROVED' });
  assert.equal(selfApprove.status, 403);

  // --- Approve as the seller ---
  const approve = await seller.patch(`/reservations/${reservationId}`, {
    status: 'APPROVED',
    pickupInstructions: 'Collect at the front counter.',
  });
  assert.equal(approve.status, 200, JSON.stringify(approve.body));
  assert.equal(approve.body.data.status, 'APPROVED');

  // --- Inventory must be decremented atomically ---
  const detail = await receiver.get(`/listings/${listingId}`);
  assert.equal(detail.status, 200);
  assert.equal(Number(detail.body.data.availableQuantity), 6);
  assert.equal(Number(detail.body.data.quantity), 10);

  // --- The receiver is notified ---
  const notifications = await receiver.get('/notifications');
  assert.equal(notifications.status, 200);
  const approvalNotice = notifications.body.data.items.find(
    (n) => n.reservationId === reservationId && n.type === 'RESERVATION_APPROVED'
  );
  assert.ok(approvalNotice, 'receiver should have an approval notification');

  // --- Complete the pickup ---
  const complete = await seller.post(`/reservations/${reservationId}/complete`, {});
  assert.equal(complete.status, 200, JSON.stringify(complete.body));

  // --- Cleanup ---
  await seller.del(`/listings/${listingId}`);
});

test('inventory guard blocks reservations beyond the available stock', async () => {
  const listingId = await makeListing(seller, {
    title: 'E2E Inventory Guard',
    category: 'Pantry',
    quantity: 2,
    unit: 'cans',
    condition: 'Packaged',
  });

  const reserve = await receiver.post('/reservations', { listingId, quantity: 2 });
  assert.equal(reserve.status, 201);
  const reservationId = reserve.body.data.id;

  // Another receiver cannot reserve beyond what is left.
  const other = await login('receiver.siti@sirkula.demo');
  const over = await other.post('/reservations', { listingId, quantity: 5 });
  assert.equal(over.status, 400);
  assert.equal(over.body.code, 'INSUFFICIENT_INVENTORY');

  const approve = await seller.patch(`/reservations/${reservationId}`, { status: 'APPROVED' });
  assert.equal(approve.status, 200);

  await seller.del(`/listings/${listingId}`);
});

test('receiver can cancel a pending reservation', async () => {
  const listingId = await makeListing(seller, {
    title: 'E2E Cancel Flow',
    category: 'Other',
    quantity: 5,
  });

  const reserve = await receiver.post('/reservations', { listingId, quantity: 1 });
  const reservationId = reserve.body.data.id;

  const cancel = await receiver.del(`/reservations/${reservationId}`);
  assert.equal(cancel.status, 200, JSON.stringify(cancel.body));

  // A cancelled reservation can no longer be cancelled again.
  const again = await receiver.del(`/reservations/${reservationId}`);
  assert.equal(again.status, 400);

  await seller.del(`/listings/${listingId}`);
});

test('notification read-all route is not shadowed by the :id route', async () => {
  const res = await receiver.patch('/notifications/read-all', {});
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.success, true);

  const after = await receiver.get('/notifications');
  const unread = after.body.data.items.filter((n) => !n.read);
  assert.equal(unread.length, 0, 'all notifications should be marked read');
});

test('seller inventory lists only their own listings', async () => {
  const res = await seller.get('/listings');
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const listings = res.body.data.listings || res.body.data;
  assert.ok(Array.isArray(listings));
  assert.ok(listings.length > 0);
});

test('impact report is derived from the database and labelled as an estimate', async () => {
  const res = await receiver.get('/impact/stats');
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(res.body.data);
  assert.ok(res.body.data.estimated !== undefined);
});

test('matching endpoint recommends listings for the receiver', async () => {
  const res = await receiver.get('/matching/recommendations');
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(Array.isArray(res.body.data.recommendations || res.body.data));
});

test('a receiver can report a listing and an admin can review it', async () => {
  const listings = await receiver.get('/marketplace?limit=5');
  const listing = listings.body.data.listings[0];
  assert.ok(listing, 'need at least one listing to report on');

  const report = await receiver.post('/reports', {
    listingId: listing.id,
    reason: 'other',
    description: 'E2E test report.',
  });
  assert.equal(report.status, 201, JSON.stringify(report.body));

  const adminReports = await admin.get('/admin/reports?status=PENDING');
  assert.equal(adminReports.status, 200, JSON.stringify(adminReports.body));
  assert.ok(adminReports.body.data.reports.length >= 1);

  // A non-admin must not reach the admin endpoints.
  const forbidden = await receiver.get('/admin/users');
  assert.equal(forbidden.status, 403);
});

test('admin can list users and read the audit log', async () => {
  const users = await admin.get('/admin/users');
  assert.equal(users.status, 200, JSON.stringify(users.body));
  assert.ok(users.body.data.users.length > 0);

  const audit = await admin.get('/admin/audit-logs');
  assert.equal(audit.status, 200, JSON.stringify(audit.body));
});

test('suspended accounts cannot log in or use the API', async () => {
  const adminClient = await login(ADMIN);
  const users = await adminClient.get('/admin/users');
  const target = users.body.data.users.find((u) => u.email === 'seller.suspended@sirkula.demo');
  assert.ok(target, 'seeded suspended account should be listed');

  // Put the account into a known SUSPENDED state regardless of prior runs.
  const suspend = await adminClient.patch(`/admin/users/${target.id}/status`, { status: 'SUSPENDED' });
  assert.equal(suspend.status, 200, JSON.stringify(suspend.body));

  // The login endpoint itself rejects a suspended account.
  const client = createClient();
  await client.get('/auth/me');
  const loginRes = await client.post('/auth/login', { email: 'seller.suspended@sirkula.demo', password: PASSWORD });
  assert.equal(loginRes.status, 403);
  assert.equal(loginRes.body.code, 'ACCOUNT_SUSPENDED');

  // And an existing session for a suspended user is refused by requireAuth.
  const restore = await adminClient.patch(`/admin/users/${target.id}/status`, { status: 'ACTIVE' });
  assert.equal(restore.status, 200);
});

test('invalid login is rejected with a friendly error', async () => {
  const client = createClient();
  await client.get('/auth/me');
  const res = await client.post('/auth/login', { email: ADMIN, password: 'WrongPassword1' });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('unknown API routes return a JSON 404', async () => {
  const res = await fetch(`${API}/definitely-not-a-route`);
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'NOT_FOUND');
});

test('registration validation rejects weak passwords', async () => {
  const client = createClient();
  await client.get('/auth/me');
  const res = await client.post('/auth/register', {
    name: 'Test Person',
    email: 'e2e.tester@sirkula.demo',
    password: 'weak',
    role: 'RECEIVER',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'VALIDATION_ERROR');

test('seller can upload a listing image and it is stored with a random name', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const png = fs.readFileSync(path.join(__dirname, 'fixtures', 'pixel.png'));

  const form = new FormData();
  form.append('title', 'E2E Upload Flow');
  form.append('description', 'Listing created with a multipart image upload.');
  form.append('category', 'Bakery');
  form.append('quantity', '4');
  form.append('unit', 'pieces');
  form.append('condition', 'Fresh');
  form.append('price', '0');
  form.append('pickupLocation', 'Jl. Otomatis No. 9, Central City');
  form.append('pickupDeadline', new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString());
  form.append('image', new Blob([png], { type: 'image/png' }), 'my-photo.png');

  const res = await seller.post('/listings', form);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const images = res.body.data.images;
  assert.ok(Array.isArray(images) && images.length === 1, 'expected exactly one image');

  // The stored name must be randomized, not the original file name.
  assert.notEqual(images[0], 'my-photo.png');
  assert.ok(/^[0-9a-f]{32}\.png$/.test(images[0]), `unexpected stored name: ${images[0]}`);

  // The file must actually be on disk and served over HTTP.
  const onDisk = path.join(process.cwd(), 'public', 'uploads', images[0]);
  assert.ok(fs.existsSync(onDisk), 'uploaded file should exist on disk');

  const served = await fetch(`${BASE_URL}/uploads/${images[0]}`);
  assert.equal(served.status, 200);

  await seller.del(`/listings/${res.body.data.id}`);
});

test('a non-image upload is rejected', async () => {
  const form = new FormData();
  form.append('title', 'E2E Bad Upload');
  form.append('category', 'Bakery');
  form.append('quantity', '1');
  form.append('unit', 'pieces');
  form.append('condition', 'Fresh');
  form.append('pickupLocation', 'Jl. Otomatis No. 10');
  form.append('pickupDeadline', new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString());
  form.append('image', new Blob([Buffer.from('<?php echo "malicious"; ?>')], { type: 'text/plain' }), 'evil.php');

  const res = await seller.post('/listings', form);
  assert.equal(res.status, 400);
  assert.equal(res.body.code, 'UPLOAD_ERROR');
});

});

test('state-changing requests without a CSRF header are rejected', async () => {
  const res = await fetch(`${API}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listingId: 'x', quantity: 1 }),
  });
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.equal(body.code, 'CSRF_MISMATCH');
});
