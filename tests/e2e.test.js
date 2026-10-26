'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const http = require('node:http');
const { createServer, PUBLIC_DIR } = require('../src/server');

const ROOT = path.resolve(__dirname, '..');
let server;
let baseUrl;

test.before(async () => {
  server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('demo health endpoint confirms database is disabled', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.mode, 'demo-localstorage');
  assert.equal(data.database, 'disabled');
});

test('demo info describes browser-local data and role switching', async () => {
  const response = await fetch(`${baseUrl}/api/v1/demo-info`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.mode, 'demo-localstorage');
  assert.equal(data.accounts.length, 3);
  assert.equal(data.authentication, 'simulation-only');
});

test('main pages are served as HTML', async () => {
  for (const page of ['/', '/index.html', '/login.html', '/register.html', '/marketplace.html', '/dashboard.html', '/seller-inventory.html', '/create-listing.html', '/listing-detail.html', '/reservations.html', '/notifications.html', '/profile.html', '/impact.html', '/admin.html']) {
    const response = await fetch(`${baseUrl}${page}`);
    assert.equal(response.status, 200, `${page} should exist`);
    assert.match(response.headers.get('content-type') || '', /text\/html/);
    assert.match(await response.text(), /<html/i);
  }
});

test('shared component styles include icon sizing on every page', async () => {
  const response = await fetch(`${baseUrl}/css/components.css`);
  assert.equal(response.status, 200);
  const css = await response.text();
  assert.match(css, /\.icon-wrap\s*\{/);
  assert.match(css, /\.icon-wrap\s*>\s*svg/);
});

test('shared listing styles and local food photos are served', async () => {
  const cssResponse = await fetch(`${baseUrl}/css/listings.css`);
  assert.equal(cssResponse.status, 200);
  assert.match(await cssResponse.text(), /\.listing-grid/);
  for (const name of ['bakery.jpg', 'produce.jpg', 'prepared.jpg', 'dairy.jpg', 'snacks.jpg']) {
    const response = await fetch(`${baseUrl}/images/food/${name}`);
    assert.equal(response.status, 200, `${name} should load`);
    assert.match(response.headers.get('content-type') || '', /image\/jpeg/);
    assert.ok(Number(response.headers.get('content-length')) > 10000, `${name} should not be an empty placeholder`);
  }
});

test('all frontend JavaScript files pass Node syntax checks', () => {
  const jsDir = path.join(PUBLIC_DIR, 'js');
  const files = fs.readdirSync(jsDir).filter((file) => file.endsWith('.js'));
  assert.ok(files.length >= 10, 'expected the main frontend scripts to be present');
  for (const file of files) {
    const fullPath = path.join(jsDir, file);
    const result = spawnSync(process.execPath, ['--check', fullPath], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr || result.stdout}`);
  }
});

test('demo project no longer requires a database configuration or dependencies', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.deepEqual(pkg.dependencies || {}, {});
  assert.deepEqual(pkg.devDependencies || {}, {});
  assert.ok(fs.existsSync(path.join(ROOT, 'public/js/storage.js')));
  assert.ok(fs.existsSync(path.join(ROOT, 'src/server.js')));
  assert.ok(!fs.existsSync(path.join(ROOT, 'prisma')));
  assert.ok(!fs.existsSync(path.join(ROOT, 'src/app.js')));
  assert.doesNotMatch(fs.readFileSync(path.join(PUBLIC_DIR, 'impact.html'), 'utf8'), /<script[^>]+src=["']https?:/i);
  for (const page of fs.readdirSync(PUBLIC_DIR).filter((name) => name.endsWith('.html'))) {
    assert.doesNotMatch(fs.readFileSync(path.join(PUBLIC_DIR, page), 'utf8'), /cdn\.jsdelivr\.net|unpkg\.com/i, `${page} should not require a remote CDN`);
  }
});


test('unknown API routes do not fall through to file serving', async () => {
  const response = await fetch(`${baseUrl}/api/v1/not-a-real-route`);
  assert.equal(response.status, 404);
  const data = await response.json();
  assert.equal(data.code, 'NOT_FOUND');
});

test('method and traversal guards are active', async () => {
  const post = await fetch(`${baseUrl}/api/v1/health`, { method: 'POST' });
  assert.equal(post.status, 405);
  // Use the raw HTTP request path: fetch/WHATWG URL normalizes dot segments before sending.
  const port = Number(new URL(baseUrl).port);
  const traversalStatus = await new Promise((resolve, reject) => {
    const request = http.request({ host: '127.0.0.1', port, path: '/%2e%2e/package.json', method: 'GET' }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.end();
  });
  assert.equal(traversalStatus, 403);
});
