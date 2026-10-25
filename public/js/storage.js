/*!
 * SIRKULA — LocalStorage Demo Storage Service
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'sirkula_demo_v1';
  const SESSION_KEY = 'sirkula_demo_session';

  const DEMO_USERS = [
    { id: 'user_demo_seller_001', email: 'seller@demo.sirkula', name: 'Budi Santoso', role: 'SELLER', status: 'ACTIVE', phone: '+62 812-3456-7890', address: 'Jl. Melati No. 10, Jakarta Pusat', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
    { id: 'user_demo_receiver_001', email: 'receiver@demo.sirkula', name: 'Siti Rahayu', role: 'RECEIVER', status: 'ACTIVE', phone: '+62 813-9876-5432', address: 'Jl. Anggrek No. 5, Jakarta Selatan', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
    { id: 'user_demo_admin_001', email: 'admin@demo.sirkula', name: 'Administrator', role: 'ADMIN', status: 'ACTIVE', phone: '+62 811-1111-1111', address: 'Kantor Pusat SIRKULA', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  ];

  const DEMO_LISTINGS = [
    { id: 'listing_demo_001', title: 'Roti Tantan Segar', description: 'Sisa roti panggan dari pembukaan pagi.', category: 'Bakery', quantity: 25, availableQuantity: 20, unit: 'pieces', condition: 'Fresh', price: 15000, currency: 'IDR', sellerId: 'user_demo_seller_001', pickupLocation: 'Depan toko, Jl. Melati No. 10, Jakarta Pusat', pickupLat: -6.2088, pickupLng: 106.8456, pickupDeadline: new Date(Date.now() + 86400000 * 2).toISOString(), images: ['/images/food/bakery.jpg'], status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'listing_demo_002', title: 'Buah-organisasi Segar', description: 'Potongan buah segar dari pasar.', category: 'Produce', quantity: 12, availableQuantity: 8, unit: 'kg', condition: 'Near-expiry', price: 25000, currency: 'IDR', sellerId: 'user_demo_seller_001', pickupLocation: 'Gudang belakang, Jl. Melati No. 10, Jakarta Pusat', pickupLat: -6.2088, pickupLng: 106.8456, pickupDeadline: new Date(Date.now() + 86400000 * 1).toISOString(), images: ['/images/food/produce.jpg'], status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'listing_demo_003', title: 'Makanan Siap Pakai Bekas Catering', description: 'Makanan siap saji dari event corporate.', category: 'Prepared Food', quantity: 30, availableQuantity: 30, unit: 'packs', condition: 'Packaged', price: null, currency: 'IDR', sellerId: 'user_demo_seller_001', pickupLocation: 'Loket utama, Gedung Office Park, Sudirman', pickupLat: -6.2115, pickupLng: 106.8052, pickupDeadline: new Date(Date.now() + 86400000 * 0.5).toISOString(), images: ['/images/food/prepared.jpg'], status: 'AVAILABLE', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'listing_demo_004', title: 'Susu UHT Dekat Expired', description: 'Karton susu UHT dengan tanggal kadaluarsa mendekat.', category: 'Dairy', quantity: 50, availableQuantity: 45, unit: 'boxes', condition: 'Near-expiry', price: 12000, currency: 'IDR', sellerId: 'user_demo_seller_001', pickupLocation: 'Tempat pengiriman, Jl. Sudirman Kav 50', pickupLat: -6.2115, pickupLng: 106.8052, pickupDeadline: new Date(Date.now() + 86400000 * 3).toISOString(), images: ['/images/food/dairy.jpg'], status: 'UNAVAILABLE', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  ];

  const DEMO_RESERVATIONS = [
    { id: 'res_demo_001', listingId: 'listing_demo_002', receiverId: 'user_demo_receiver_001', quantity: 5, status: 'PENDING', notes: 'Mohon konfirmasi', pickupInstructions: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'res_demo_002', listingId: 'listing_demo_001', receiverId: 'user_demo_receiver_001', quantity: 5, status: 'PENDING', notes: 'Mohon konfirmasi', pickupInstructions: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];

  const DEMO_NOTIFICATIONS = [
    { id: 'notif_demo_001', title: 'Permintaan Reservasi Baru', message: 'Siti Rahayu meminta 5 kg Roti Tantan Segar.', type: 'RESERVATION_REQUEST', read: false, userId: 'user_demo_seller_001', listingId: 'listing_demo_001', reservationId: 'res_demo_002', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'notif_demo_002', title: 'Reservasi Disetujui', message: 'Permintaan Anda untuk Buah-organisasi Segar telah disetujui.', type: 'RESERVATION_APPROVED', read: true, userId: 'user_demo_receiver_001', listingId: 'listing_demo_002', reservationId: 'res_demo_001', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'notif_demo_003', title: 'Sistem', message: 'Selamat datang di SIRKULA demo. Semua data disimpan di browser Anda.', type: 'SYSTEM', read: false, userId: 'user_demo_receiver_001', listingId: null, reservationId: null, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  ];

  function _generateId(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36); }
  function _nowISO() { return new Date().toISOString(); }
  function _clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  const _ls = (function () {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const testKey = '__sirkula_ls_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) { return null; }
  })();

  function _read() {
    if (!_ls) return null;
    try { const raw = _ls.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw) || null; } catch (e) { return null; }
  }
  function _write(data) {
    if (!_ls) return false;
    try { _ls.setItem(STORAGE_KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function _persist() { if (!_store) return; _write(_store); }
  function _findById(arr, id) { return arr.find((item) => item.id === id); }
  function _indexById(arr, id) { return arr.findIndex((item) => item.id === id); }

  let _store = null;
  function _initStore() {
    const existing = _read();
    if (existing) {
      // Demo data migration: ensure seeded listings carry local food photos
      if (!existing._version || existing._version < 2) {
        const byId = {};
        DEMO_LISTINGS.forEach((l) => { byId[l.id] = l; });
        (existing.listings || []).forEach((l) => {
          const seed = byId[l.id];
          if (seed && (!Array.isArray(l.images) || l.images.length === 0)) {
            l.images = _clone(seed.images);
          }
        });
        existing._version = 2;
        _write(existing);
      }
      _store = existing;
      return;
    }
    _store = { users: _clone(DEMO_USERS), listings: _clone(DEMO_LISTINGS), reservations: _clone(DEMO_RESERVATIONS), notifications: _clone(DEMO_NOTIFICATIONS), reports: [], auditLogs: [], _version: 2, _createdAt: _nowISO() };
    _write(_store);
  }
  const storage = {
    init: function () { _initStore(); },
    reset: function () {
      _store = { users: _clone(DEMO_USERS), listings: _clone(DEMO_LISTINGS), reservations: _clone(DEMO_RESERVATIONS), notifications: _clone(DEMO_NOTIFICATIONS), reports: [], auditLogs: [], _version: 2, _createdAt: _nowISO() };
      _persist(); return _clone(_store);
    },
    dump: function () { return _store ? _clone(_store) : null; },

    getUsers: function () { return _store ? _clone(_store.users) : []; },
    getUserById: function (id) { return _store ? _clone(_findById(_store.users, id)) : null; },
    getUserByEmail: function (email) { return _store ? _clone(_store.users.find((u) => u.email === email)) : null; },
    createUser: function (data) {
      if (!_store) return null;
      const user = { id: _generateId('user'), email: data.email, name: data.name || '', role: data.role || 'RECEIVER', status: 'ACTIVE', phone: data.phone || null, address: data.address || null, createdAt: _nowISO(), updatedAt: _nowISO() };
      _store.users.push(user); _persist(); return _clone(user);
    },
    updateUser: function (id, data) {
      if (!_store) return null;
      const idx = _indexById(_store.users, id);
      if (idx === -1) return null;
      Object.assign(_store.users[idx], data); _store.users[idx].updatedAt = _nowISO(); _persist(); return _clone(_store.users[idx]);
    },
    deleteUser: function (id) {
      if (!_store) return false;
      const idx = _indexById(_store.users, id);
      if (idx === -1) return false;
      _store.users.splice(idx, 1); _persist(); return true;
    },
    getListings: function (filter) {
      if (!_store) return [];
      let items = _store.listings.slice();
      if (filter) {
        if (filter.status) items = items.filter((l) => l.status === filter.status);
        if (filter.sellerId) items = items.filter((l) => l.sellerId === filter.sellerId);
        if (filter.category) items = items.filter((l) => l.category === filter.category);
        if (filter.q) { const q = filter.q.toLowerCase(); items = items.filter((l) => (l.title || '').toLowerCase().includes(q) || (l.category || '').toLowerCase().includes(q)); }
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return _clone(items);
    },
    getListingById: function (id) { return _store ? _clone(_findById(_store.listings, id)) : null; },
    createListing: function (data) {
      if (!_store) return null;
      const listing = { id: _generateId('listing'), title: data.title || '', description: data.description || null, category: data.category || 'Other', quantity: Number(data.quantity) || 0, availableQuantity: Number(data.availableQuantity || data.quantity) || 0, unit: data.unit || 'pieces', condition: data.condition || 'Fresh', price: data.price != null ? Number(data.price) : null, currency: data.currency || 'IDR', sellerId: data.sellerId, pickupLocation: data.pickupLocation || '', pickupLat: data.pickupLat != null ? Number(data.pickupLat) : null, pickupLng: data.pickupLng != null ? Number(data.pickupLng) : null, pickupDeadline: data.pickupDeadline || _nowISO(), images: Array.isArray(data.images) ? data.images : [], status: data.status || 'AVAILABLE', createdAt: _nowISO(), updatedAt: _nowISO() };
      _store.listings.push(listing); _persist(); return _clone(listing);
    },
    updateListing: function (id, data) {
      if (!_store) return null;
      const idx = _indexById(_store.listings, id);
      if (idx === -1) return null;
      Object.assign(_store.listings[idx], data); _store.listings[idx].updatedAt = _nowISO(); _persist(); return _clone(_store.listings[idx]);
    },
    deleteListing: function (id) {
      if (!_store) return false;
      const idx = _indexById(_store.listings, id);
      if (idx === -1) return false;
      _store.listings.splice(idx, 1); _persist(); return true;
    },
    getReservations: function (filter) {
      if (!_store) return [];
      let items = _store.reservations.slice();
      if (filter) {
        if (filter.status) items = items.filter((r) => r.status === filter.status);
        if (filter.receiverId) items = items.filter((r) => r.receiverId === filter.receiverId);
        if (filter.listingId) items = items.filter((r) => r.listingId === filter.listingId);
        if (filter.sellerId) { items = items.filter((r) => { const l = _findById(_store.listings, r.listingId); return l && l.sellerId === filter.sellerId; }); }
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return _clone(items);
    },
    getReservationById: function (id) { return _store ? _clone(_findById(_store.reservations, id)) : null; },
    createReservation: function (data) {
      if (!_store) return null;
      const reservation = { id: _generateId('res'), listingId: data.listingId, receiverId: data.receiverId, quantity: Number(data.quantity) || 0, status: 'PENDING', notes: data.notes || null, pickupInstructions: data.pickupInstructions || null, createdAt: _nowISO(), updatedAt: _nowISO() };
      _store.reservations.push(reservation); _persist(); return _clone(reservation);
    },
    updateReservation: function (id, data) {
      if (!_store) return null;
      const idx = _indexById(_store.reservations, id);
      if (idx === -1) return null;
      Object.assign(_store.reservations[idx], data); _store.reservations[idx].updatedAt = _nowISO(); _persist(); return _clone(_store.reservations[idx]);
    },
    deleteReservation: function (id) {
      if (!_store) return false;
      const idx = _indexById(_store.reservations, id);
      if (idx === -1) return false;
      _store.reservations.splice(idx, 1); _persist(); return true;
    },
    getNotifications: function (filter) {
      if (!_store) return [];
      let items = _store.notifications.slice();
      if (filter) {
        if (filter.userId) items = items.filter((n) => n.userId === filter.userId);
        if (filter.unreadOnly) items = items.filter((n) => !n.read);
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return _clone(items);
    },
    getNotificationById: function (id) { return _store ? _clone(_findById(_store.notifications, id)) : null; },
    createNotification: function (data) {
      if (!_store) return null;
      const notif = { id: _generateId('notif'), title: data.title || '', message: data.message || '', type: data.type || 'SYSTEM', read: false, userId: data.userId, listingId: data.listingId || null, reservationId: data.reservationId || null, createdAt: _nowISO() };
      _store.notifications.push(notif); _persist(); return _clone(notif);
    },
    markNotificationRead: function (id) {
      if (!_store) return null;
      const idx = _indexById(_store.notifications, id);
      if (idx === -1) return null;
      _store.notifications[idx].read = true; _persist(); return _clone(_store.notifications[idx]);
    },
    markAllNotificationsRead: function (userId) {
      if (!_store) return 0;
      let count = 0;
      _store.notifications.forEach((n) => { if (n.userId === userId && !n.read) { n.read = true; count++; } });
      if (count > 0) _persist();
      return count;
    },
    getReports: function () { return _store ? _clone(_store.reports) : []; },
    createReport: function (data) {
      if (!_store) return null;
      const report = { id: _generateId('report'), reason: data.reason || '', description: data.description || null, status: 'PENDING', listingId: data.listingId, reporterId: data.reporterId, createdAt: _nowISO() };
      _store.reports.push(report); _persist(); return _clone(report);
    },
    updateReport: function (id, data) {
      if (!_store) return null;
      const idx = _indexById(_store.reports, id);
      if (idx === -1) return null;
      Object.assign(_store.reports[idx], data); _persist(); return _clone(_store.reports[idx]);
    },
    getAuditLogs: function () { return _store ? _clone(_store.auditLogs) : []; },
    addAuditLog: function (data) {
      if (!_store) return null;
      const log = { id: _generateId('audit'), action: data.action || '', targetType: data.targetType || null, targetId: data.targetId || null, details: data.details || null, adminId: data.adminId || null, createdAt: _nowISO() };
      _store.auditLogs.push(log); _persist(); return _clone(log);
    },
  };
  const session = {
    get: function () {
      try { const raw = sessionStorage.getItem(SESSION_KEY); if (!raw) return null; return JSON.parse(raw); } catch (e) { return null; }
    },
    set: function (user) {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch (e) { /* ignore */ }
    },
    clear: function () {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
    },
  };

  const auth = {
    login: function (email, password, role) {
      if (!email || !String(email).trim()) return { ok: false, error: 'Email/username harus diisi.' };
      if (!password || !String(password).trim()) return { ok: false, error: 'Password harus diisi.' };
      if (!role) return { ok: false, error: 'Pilih role terlebih dahulu.' };
      var demoUserIdMap = {
        SELLER: 'user_demo_seller_001',
        RECEIVER: 'user_demo_receiver_001',
        ADMIN: 'user_demo_admin_001',
      };
      var trimmedEmail = String(email).trim();
      var sessionUser = {
        id: demoUserIdMap[role] || ('demo_' + String(role).toLowerCase() + '_' + Date.now()),
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0] || role,
        role: role,
        status: 'ACTIVE',
      };
      session.set(sessionUser);
      return { ok: true, user: sessionUser };
    },
    logout: function () { session.clear(); },
    currentUser: function () { return session.get(); },
    isAuthenticated: function () { return !!session.get(); },
    requireRole: function (roles) {
      const u = session.get();
      if (!u) return false;
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(u.role);
    },
  };

  window.SIRKULA = window.SIRKULA || {};
  window.SIRKULA.storage = storage;
  window.SIRKULA.session = session;
  window.SIRKULA.auth = auth;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => storage.init());
    } else {
      storage.init();
    }
  }

})();
