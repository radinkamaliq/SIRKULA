"use strict";

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
  clear() { this.values.clear(); }
}

function createStorageContext() {
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  const window = { localStorage, SIRKULA: {} };
  const document = { readyState: 'complete', addEventListener() {} };
  const context = { window, document, localStorage, sessionStorage, console, Date, Math, JSON, Map, Set, Number, String, Object, Array, RegExp, Error };
  const source = fs.readFileSync(path.join(__dirname, '../public/js/storage.js'), 'utf8');
  vm.runInNewContext(source, context, { filename: 'storage.js' });
  return { window, localStorage, sessionStorage, storage: window.SIRKULA.storage, auth: window.SIRKULA.auth, session: window.SIRKULA.session };
}

test('seed data includes working local food image paths', () => {
  const { storage } = createStorageContext();
  const listings = storage.getListings();
  assert.equal(listings.length, 24);
  for (const listing of listings) {
    assert.ok(Array.isArray(listing.images) && listing.images.length > 0, `${listing.title} should have an image`);
    assert.match(listing.images[0], /^\/images\/food\//);
  }
  assert.ok(listings.some((listing) => listing.title === 'Paket Roti & Pastri Segar'));
});

test('demo login accepts non-empty credentials and stores no password', () => {
  const { auth, sessionStorage } = createStorageContext();
  assert.equal(auth.login('', 'demo', 'SELLER').ok, false);
  assert.equal(auth.login('demo@sirkula.test', '', 'SELLER').ok, false);
  assert.equal(auth.login('demo@sirkula.test', 'anything', 'NOT_A_ROLE').ok, false);
  const result = auth.login('radinka@example.test', 'anything', 'SELLER');
  assert.equal(result.ok, true);
  assert.equal(result.user.role, 'SELLER');
  assert.equal(result.user.name, 'Radinka');
  assert.doesNotMatch(sessionStorage.getItem('sirkula_demo_session'), /anything/);
});

test('marketplace search includes description and pickup location', () => {
  const { storage } = createStorageContext();
  assert.equal(storage.getListings({ q: 'Sudirman' }).length, 2);
  assert.equal(storage.getListings({ q: 'pastri' }).length, 1);
});

test('reservation requests enforce role and pending stock commitments', () => {
  const { storage, auth } = createStorageContext();
  const seller = auth.login('seller@demo.sirkula', 'anything', 'SELLER').user;
  assert.throws(() => storage.createReservation({ listingId: 'listing_demo_001', receiverId: seller.id, quantity: 1 }), /Receiver/);
  const receiver = auth.login('receiver@demo.sirkula', 'anything', 'RECEIVER').user;
  assert.throws(() => storage.createReservation({ listingId: 'listing_demo_002', receiverId: receiver.id, quantity: 4 }), /melebihi stok/);
  const created = storage.createReservation({ listingId: 'listing_demo_002', receiverId: receiver.id, quantity: 3, notes: 'Test' });
  assert.equal(created.status, 'PENDING');
  assert.equal(storage.getReservations({ listingId: 'listing_demo_002' }).some((reservation) => reservation.id === created.id), true);
});

test('local listings persist and preserve a true zero available quantity', () => {
  const { storage, localStorage } = createStorageContext();
  const created = storage.createListing({ title: 'Test', quantity: 4, availableQuantity: 0, category: 'Other', sellerId: 'user_demo_seller_001' });
  assert.equal(created.availableQuantity, 0);
  const saved = JSON.parse(localStorage.getItem('sirkula_demo_v1'));
  assert.equal(saved.listings.find((listing) => listing.id === created.id).availableQuantity, 0);
});
