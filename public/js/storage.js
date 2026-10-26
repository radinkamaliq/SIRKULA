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
  {
    "id": "listing_demo_001",
    "title": "Paket Roti & Pastri Segar",
    "description": "Pilihan roti dan pastri yang masih layak dinikmati dari etalase pagi.",
    "category": "Bakery",
    "quantity": 25,
    "availableQuantity": 20,
    "unit": "pieces",
    "condition": "Fresh",
    "price": 15000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Depan toko, Jl. Melati No. 10, Jakarta Pusat",
    "pickupLat": -6.2088,
    "pickupLng": 106.8456,
    "pickupDeadline": "2026-10-27T14:08:31.011Z",
    "images": [
      "/images/food/bakery.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-20T14:08:31.011Z",
    "updatedAt": "2026-10-20T14:08:31.011Z"
  },
  {
    "id": "listing_demo_002",
    "title": "Paket Buah Segar",
    "description": "Buah segar pilihan dari stok pasar hari ini.",
    "category": "Produce",
    "quantity": 12,
    "availableQuantity": 8,
    "unit": "kg",
    "condition": "Near-expiry",
    "price": 25000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Gudang belakang, Jl. Melati No. 10, Jakarta Pusat",
    "pickupLat": -6.2088,
    "pickupLng": 106.8456,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/mixed-fruit.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-22T14:08:31.013Z",
    "updatedAt": "2026-10-22T14:08:31.013Z"
  },
  {
    "id": "listing_demo_003",
    "title": "Paket Hidangan Catering",
    "description": "Hidangan siap santap berlebih dari acara yang selesai.",
    "category": "Prepared Food",
    "quantity": 30,
    "availableQuantity": 30,
    "unit": "packs",
    "condition": "Packaged",
    "price": null,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Loket utama, Gedung Office Park, Sudirman",
    "pickupLat": -6.2115,
    "pickupLng": 106.8052,
    "pickupDeadline": "2026-10-26T02:08:31.013Z",
    "images": [
      "/images/food/prepared.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_004",
    "title": "Paket Susu UHT",
    "description": "Susu UHT kemasan utuh dengan tanggal terbaik yang perlu segera diperhatikan.",
    "category": "Dairy",
    "quantity": 50,
    "availableQuantity": 45,
    "unit": "boxes",
    "condition": "Near-expiry",
    "price": 12000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Tempat pengiriman, Jl. Sudirman Kav 50",
    "pickupLat": -6.2115,
    "pickupLng": 106.8052,
    "pickupDeadline": "2026-10-28T14:08:31.013Z",
    "images": [
      "/images/food/milk.jpg"
    ],
    "status": "UNAVAILABLE",
    "createdAt": "2026-10-15T14:08:31.013Z",
    "updatedAt": "2026-10-15T14:08:31.013Z"
  },
  {
    "id": "listing_demo_005",
    "title": "Paket Croissant & Danish",
    "description": "Croissant dan danish segar sisa produksi pagi, masih renyah.",
    "category": "Bakery",
    "quantity": 18,
    "availableQuantity": 14,
    "unit": "pieces",
    "condition": "Fresh",
    "price": 20000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Bakery Corner, Jl. Sabang No. 12, Jakarta Pusat",
    "pickupLat": -6.185,
    "pickupLng": 106.83,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/croissants.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-23T14:08:31.013Z",
    "updatedAt": "2026-10-23T14:08:31.013Z"
  },
  {
    "id": "listing_demo_006",
    "title": "Roti Tawar Premium",
    "description": "Roti tawar kemasan dengan tanggal terbaik yang perlu segera diperhatikan.",
    "category": "Bakery",
    "quantity": 10,
    "availableQuantity": 10,
    "unit": "loaves",
    "condition": "Near-expiry",
    "price": 18000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Toko Roti Melati, Jl. Melati No. 10, Jakarta Pusat",
    "pickupLat": -6.2088,
    "pickupLng": 106.8456,
    "pickupDeadline": "2026-10-27T14:08:31.013Z",
    "images": [
      "/images/food/bread.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-21T14:08:31.013Z",
    "updatedAt": "2026-10-21T14:08:31.013Z"
  },
  {
    "id": "listing_demo_007",
    "title": "Sayur Hijau Organik",
    "description": "Sayuran hijau organik segar dari kebun lokal.",
    "category": "Produce",
    "quantity": 8,
    "availableQuantity": 5,
    "unit": "kg",
    "condition": "Fresh",
    "price": 30000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Pasar Segar, Jl. Barito No. 8, Jakarta Selatan",
    "pickupLat": -6.26,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/greens.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-23T14:08:31.013Z",
    "updatedAt": "2026-10-23T14:08:31.013Z"
  },
  {
    "id": "listing_demo_008",
    "title": "Buah Campur Potong",
    "description": "Campuran buah potong segar dalam kemasan higienis.",
    "category": "Produce",
    "quantity": 6,
    "availableQuantity": 6,
    "unit": "packs",
    "condition": "Packaged",
    "price": 22000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Dapur Sehat, Jl. Anggrek No. 5, Jakarta Selatan",
    "pickupLat": -6.25,
    "pickupLng": 106.81,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/mixed-fruit.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_009",
    "title": "Tomat & Wortel Segar",
    "description": "Tomat dan wortel segar dengan kualitas baik.",
    "category": "Produce",
    "quantity": 15,
    "availableQuantity": 12,
    "unit": "kg",
    "condition": "Near-expiry",
    "price": 15000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Gudang Pasar, Jl. Hayam Wuruk, Jakarta Barat",
    "pickupLat": -6.16,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-10-27T14:08:31.013Z",
    "images": [
      "/images/food/tomatoes-carrots.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-22T14:08:31.013Z",
    "updatedAt": "2026-10-22T14:08:31.013Z"
  },
  {
    "id": "listing_demo_010",
    "title": "Nasi Box Ayam",
    "description": "Nasi box ayam siap santap dari dapur catering.",
    "category": "Prepared Food",
    "quantity": 40,
    "availableQuantity": 35,
    "unit": "packs",
    "condition": "Packaged",
    "price": 25000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Kantin Office Park, Jakarta Pusat",
    "pickupLat": -6.2115,
    "pickupLng": 106.8052,
    "pickupDeadline": "2026-10-26T02:08:31.013Z",
    "images": [
      "/images/food/nasi-box.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_011",
    "title": "Pasta Bolognese",
    "description": "Pasta bolognese segar siap santap.",
    "category": "Prepared Food",
    "quantity": 20,
    "availableQuantity": 18,
    "unit": "packs",
    "condition": "Fresh",
    "price": 30000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Kafe Pasta, Jl. Senopati No. 20, Jakarta Selatan",
    "pickupLat": -6.23,
    "pickupLng": 106.81,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/pasta.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-23T14:08:31.013Z",
    "updatedAt": "2026-10-23T14:08:31.013Z"
  },
  {
    "id": "listing_demo_012",
    "title": "Snack Box Meeting",
    "description": "Snack box isi beragam untuk acara, gratis untuk komunitas.",
    "category": "Prepared Food",
    "quantity": 50,
    "availableQuantity": 50,
    "unit": "boxes",
    "condition": "Packaged",
    "price": null,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Ruang Meeting, Jl. Gatot Subroto, Jakarta",
    "pickupLat": -6.22,
    "pickupLng": 106.82,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/chips.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_013",
    "title": "Yogurt Plain",
    "description": "Yogurt plain kemasan dengan tanggal terbaik segera.",
    "category": "Dairy",
    "quantity": 24,
    "availableQuantity": 20,
    "unit": "cups",
    "condition": "Near-expiry",
    "price": 14000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Kulkas Toko, Jl. Melati No. 10, Jakarta Pusat",
    "pickupLat": -6.2088,
    "pickupLng": 106.8456,
    "pickupDeadline": "2026-10-27T14:08:31.013Z",
    "images": [
      "/images/food/yogurt.jpg"
    ],
    "status": "UNAVAILABLE",
    "createdAt": "2026-10-20T14:08:31.013Z",
    "updatedAt": "2026-10-20T14:08:31.013Z"
  },
  {
    "id": "listing_demo_014",
    "title": "Keju Cheddar",
    "description": "Keju cheddar blok berkualitas.",
    "category": "Dairy",
    "quantity": 12,
    "availableQuantity": 10,
    "unit": "blocks",
    "condition": "Fresh",
    "price": 35000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Dairy Shelf, Jl. Anggrek No. 5, Jakarta Selatan",
    "pickupLat": -6.25,
    "pickupLng": 106.81,
    "pickupDeadline": "2026-10-30T14:08:31.013Z",
    "images": [
      "/images/food/cheese.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-19T14:08:31.013Z",
    "updatedAt": "2026-10-19T14:08:31.013Z"
  },
  {
    "id": "listing_demo_015",
    "title": "Susu Kedelai",
    "description": "Susu kedelai kemasan siap minum.",
    "category": "Beverages",
    "quantity": 30,
    "availableQuantity": 30,
    "unit": "bottles",
    "condition": "Packaged",
    "price": 16000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Minimarket, Jl. Hayam Wuruk, Jakarta Barat",
    "pickupLat": -6.16,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-10-29T14:08:31.013Z",
    "images": [
      "/images/food/soy-milk.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-22T14:08:31.013Z",
    "updatedAt": "2026-10-22T14:08:31.013Z"
  },
  {
    "id": "listing_demo_016",
    "title": "Kue Kering Lebaran",
    "description": "Kue kering asinan berbagai rasa.",
    "category": "Snacks",
    "quantity": 100,
    "availableQuantity": 80,
    "unit": "boxes",
    "condition": "Fresh",
    "price": 45000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Toko Kue, Jl. Sabang No. 12, Jakarta Pusat",
    "pickupLat": -6.185,
    "pickupLng": 106.83,
    "pickupDeadline": "2026-11-01T14:08:31.013Z",
    "images": [
      "/images/food/cookies.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-18T14:08:31.013Z",
    "updatedAt": "2026-10-18T14:08:31.013Z"
  },
  {
    "id": "listing_demo_017",
    "title": "Keripik Singkong",
    "description": "Keripik singkong renyah kemasan.",
    "category": "Snacks",
    "quantity": 60,
    "availableQuantity": 55,
    "unit": "packs",
    "condition": "Packaged",
    "price": 12000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Snack Corner, Jl. Barito No. 8, Jakarta Selatan",
    "pickupLat": -6.26,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-11-04T14:08:31.013Z",
    "images": [
      "/images/food/chips.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-21T14:08:31.013Z",
    "updatedAt": "2026-10-21T14:08:31.013Z"
  },
  {
    "id": "listing_demo_018",
    "title": "Beras Pulen 5kg",
    "description": "Beras pulen kualitas premium.",
    "category": "Pantry",
    "quantity": 20,
    "availableQuantity": 18,
    "unit": "bags",
    "condition": "Fresh",
    "price": 65000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Gudang Sembako, Jl. Gatot Subroto, Jakarta",
    "pickupLat": -6.22,
    "pickupLng": 106.82,
    "pickupDeadline": "2026-11-24T14:08:31.013Z",
    "images": [
      "/images/food/rice.jpg"
    ],
    "status": "UNAVAILABLE",
    "createdAt": "2026-10-17T14:08:31.013Z",
    "updatedAt": "2026-10-17T14:08:31.013Z"
  },
  {
    "id": "listing_demo_019",
    "title": "Minyak Goreng 2L",
    "description": "Minyak goreng kemasan 2 liter.",
    "category": "Pantry",
    "quantity": 15,
    "availableQuantity": 12,
    "unit": "bottles",
    "condition": "Packaged",
    "price": 28000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Rak Sembako, Jl. Hayam Wuruk, Jakarta Barat",
    "pickupLat": -6.16,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-12-24T14:08:31.013Z",
    "images": [
      "/images/food/cooking-oil.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-16T14:08:31.013Z",
    "updatedAt": "2026-10-16T14:08:31.013Z"
  },
  {
    "id": "listing_demo_020",
    "title": "Jus Buah Segar",
    "description": "Jus buah segar tanpa pengawet.",
    "category": "Beverages",
    "quantity": 30,
    "availableQuantity": 25,
    "unit": "bottles",
    "condition": "Fresh",
    "price": 15000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Juice Bar, Jl. Senopati No. 20, Jakarta Selatan",
    "pickupLat": -6.23,
    "pickupLng": 106.81,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/juice.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_021",
    "title": "Daging Ayam Potong",
    "description": "Daging ayam potong segar.",
    "category": "Meat",
    "quantity": 10,
    "availableQuantity": 8,
    "unit": "kg",
    "condition": "Fresh",
    "price": 45000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Pasar Daging, Jl. Barito No. 8, Jakarta Selatan",
    "pickupLat": -6.26,
    "pickupLng": 106.8,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/chicken.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-23T14:08:31.013Z",
    "updatedAt": "2026-10-23T14:08:31.013Z"
  },
  {
    "id": "listing_demo_022",
    "title": "Paket Sembako",
    "description": "Paket sembako hemat untuk keluarga.",
    "category": "Other",
    "quantity": 25,
    "availableQuantity": 20,
    "unit": "packs",
    "condition": "Packaged",
    "price": 80000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Posko Bantuan, Jl. Anggrek No. 5, Jakarta Selatan",
    "pickupLat": -6.25,
    "pickupLng": 106.81,
    "pickupDeadline": "2026-10-28T14:08:31.013Z",
    "images": [
      "/images/food/grocery.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-20T14:08:31.013Z",
    "updatedAt": "2026-10-20T14:08:31.013Z"
  },
  {
    "id": "listing_demo_023",
    "title": "Donat Cokelat",
    "description": "Donat cokelat lembut sisa produksi.",
    "category": "Bakery",
    "quantity": 36,
    "availableQuantity": 30,
    "unit": "pieces",
    "condition": "Fresh",
    "price": 12000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Donut Shop, Jl. Sabang No. 12, Jakarta Pusat",
    "pickupLat": -6.185,
    "pickupLng": 106.83,
    "pickupDeadline": "2026-10-26T14:08:31.013Z",
    "images": [
      "/images/food/donuts.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-24T14:08:31.013Z",
    "updatedAt": "2026-10-24T14:08:31.013Z"
  },
  {
    "id": "listing_demo_024",
    "title": "Apel Fuji",
    "description": "Apel Fuji segar impor.",
    "category": "Produce",
    "quantity": 50,
    "availableQuantity": 45,
    "unit": "kg",
    "condition": "Near-expiry",
    "price": 12000,
    "currency": "IDR",
    "sellerId": "user_demo_seller_001",
    "pickupLocation": "Buah Segar, Jl. Melati No. 10, Jakarta Pusat",
    "pickupLat": -6.2088,
    "pickupLng": 106.8456,
    "pickupDeadline": "2026-10-29T14:08:31.013Z",
    "images": [
      "/images/food/apples.jpg"
    ],
    "status": "AVAILABLE",
    "createdAt": "2026-10-23T14:08:31.013Z",
    "updatedAt": "2026-10-23T14:08:31.013Z"
  }
];

  const DEMO_RESERVATIONS = [
    { id: 'res_demo_001', listingId: 'listing_demo_002', receiverId: 'user_demo_receiver_001', quantity: 5, status: 'PENDING', notes: 'Mohon konfirmasi', pickupInstructions: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'res_demo_002', listingId: 'listing_demo_001', receiverId: 'user_demo_receiver_001', quantity: 5, status: 'PENDING', notes: 'Mohon konfirmasi', pickupInstructions: null, createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];

  const DEMO_NOTIFICATIONS = [
    { id: 'notif_demo_001', title: 'Permintaan Reservasi Baru', message: 'Siti Rahayu meminta 5 pieces Paket Roti & Pastri Segar.', type: 'RESERVATION_REQUEST', read: false, userId: 'user_demo_seller_001', listingId: 'listing_demo_001', reservationId: 'res_demo_002', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'notif_demo_002', title: 'Reservasi Disetujui', message: 'Permintaan Anda untuk Paket Buah Segar telah disetujui.', type: 'RESERVATION_APPROVED', read: true, userId: 'user_demo_receiver_001', listingId: 'listing_demo_002', reservationId: 'res_demo_001', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
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
      // Migrate seeded demo records in place without deleting any user-created data.
      let changed = false;
      const seedById = new Map(DEMO_LISTINGS.map((listing) => [listing.id, listing]));
      const oldSeedTitles = new Set(['Roti Tantan Segar', 'Buah-organisasi Segar', 'Makanan Siap Pakai Bekas Catering', 'Susu UHT Dekat Expired']);
      (existing.listings || []).forEach((listing) => {
        const seed = seedById.get(listing.id);
        if (!seed) return;
        const repairImages = existing._version !== 6 || !Array.isArray(listing.images) || listing.images.length === 0;
        if (repairImages) { listing.images = _clone(seed.images); changed = true; }
        if (oldSeedTitles.has(listing.title)) { listing.title = seed.title; listing.description = seed.description; changed = true; }
      });
      (existing.notifications || []).forEach((notification) => {
        if (String(notification.message || '').includes('Buah-organisasi Segar')) { notification.message = notification.message.replace(/Buah-organisasi Segar/g, 'Paket Buah Segar'); changed = true; }
        if (String(notification.message || '').includes('Roti Tantan Segar')) { notification.message = notification.message.replace(/Roti Tantan Segar/g, 'Paket Roti & Pastri Segar'); changed = true; }
      });
      const existingListingIds = new Set((existing.listings || []).map((item) => item.id));
      DEMO_LISTINGS.forEach((seed) => {
        if (!existingListingIds.has(seed.id)) {
          (existing.listings = existing.listings || []).push(_clone(seed));
          changed = true;
        }
      });
      const existingUserIds = new Set((existing.users || []).map((item) => item.id));
      DEMO_USERS.forEach((seed) => {
        if (!existingUserIds.has(seed.id)) {
          (existing.users = existing.users || []).push(_clone(seed));
          changed = true;
        }
      });
      if (existing._version !== 6) { existing._version = 6; changed = true; }
      if (changed) _write(existing);
      _store = existing;
      return;
    }
    _store = { users: _clone(DEMO_USERS), listings: _clone(DEMO_LISTINGS), reservations: _clone(DEMO_RESERVATIONS), notifications: _clone(DEMO_NOTIFICATIONS), reports: [], auditLogs: [], _version: 6, _createdAt: _nowISO() };
    _write(_store);
  }
  const storage = {
    init: function () { _initStore(); },
    reset: function () {
      _store = { users: _clone(DEMO_USERS), listings: _clone(DEMO_LISTINGS), reservations: _clone(DEMO_RESERVATIONS), notifications: _clone(DEMO_NOTIFICATIONS), reports: [], auditLogs: [], _version: 6, _createdAt: _nowISO() };
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
        if (filter.q) { const q = String(filter.q).trim().toLowerCase(); items = items.filter((l) => [l.title, l.description, l.category, l.pickupLocation, l.condition].some((value) => String(value || '').toLowerCase().includes(q))); }
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return _clone(items);
    },
    getListingById: function (id) { return _store ? _clone(_findById(_store.listings, id)) : null; },
    createListing: function (data) {
      if (!_store) return null;
      const listing = { id: _generateId('listing'), title: data.title || '', description: data.description || null, category: data.category || 'Other', quantity: Number(data.quantity) || 0, availableQuantity: Number(data.availableQuantity != null ? data.availableQuantity : data.quantity) || 0, unit: data.unit || 'pieces', condition: data.condition || 'Fresh', price: data.price != null ? Number(data.price) : null, currency: data.currency || 'IDR', sellerId: data.sellerId, pickupLocation: data.pickupLocation || '', pickupLat: data.pickupLat != null ? Number(data.pickupLat) : null, pickupLng: data.pickupLng != null ? Number(data.pickupLng) : null, pickupDeadline: data.pickupDeadline || _nowISO(), images: Array.isArray(data.images) ? data.images : [], status: data.status || 'AVAILABLE', createdAt: _nowISO(), updatedAt: _nowISO() };
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
      if (!_store || !data) return null;
      const listing = _findById(_store.listings, data.listingId);
      const receiver = _findById(_store.users, data.receiverId);
      const quantity = Number(data.quantity);
      if (!listing || listing.status !== 'AVAILABLE') throw new Error('Listing ini sudah tidak tersedia.');
      if (!receiver || receiver.role !== 'RECEIVER') throw new Error('Hanya akun Receiver yang dapat membuat reservasi.');
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Jumlah reservasi harus lebih besar dari 0.');
      const available = Number(listing.availableQuantity != null ? listing.availableQuantity : listing.quantity) || 0;
      const pendingForListing = _store.reservations
        .filter((reservation) => reservation.listingId === listing.id && reservation.status === 'PENDING')
        .reduce((sum, reservation) => sum + (Number(reservation.quantity) || 0), 0);
      if (quantity + pendingForListing > available) throw new Error('Jumlah melebihi stok tersedia setelah memperhitungkan permintaan yang menunggu.');
      const reservation = { id: _generateId('res'), listingId: data.listingId, receiverId: data.receiverId, quantity, status: 'PENDING', notes: data.notes || null, pickupInstructions: data.pickupInstructions || null, createdAt: _nowISO(), updatedAt: _nowISO() };
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
      const trimmedEmail = String(email || '').trim();
      if (!trimmedEmail) return { ok: false, error: 'Email/username harus diisi.' };
      if (!String(password || '').trim()) return { ok: false, error: 'Password harus diisi.' };
      if (!['SELLER', 'RECEIVER', 'ADMIN'].includes(role)) return { ok: false, error: 'Pilih role demo terlebih dahulu.' };

      // Demo-only role switching: use a local demo profile and never persist a password.
      if (!_store) _initStore();
      const emailKey = trimmedEmail.toLowerCase();
      const registeredProfile = _store.users.find((user) => user.role === role && String(user.email || '').toLowerCase() === emailKey);
      const demoProfile = registeredProfile || _store.users.find((user) => user.role === role);
      if (!demoProfile) return { ok: false, error: 'Profil demo untuk role ini tidak tersedia.' };
      if (!registeredProfile) {
        const typedName = trimmedEmail.split('@')[0].replace(/[._-]+/g, ' ').trim();
        const displayName = typedName.replace(/\b\w/g, (letter) => letter.toUpperCase()) || demoProfile.name;
        Object.assign(demoProfile, { email: trimmedEmail, name: displayName, updatedAt: _nowISO() });
        _persist();
      }
      const sessionUser = {
        id: demoProfile.id,
        email: demoProfile.email,
        name: demoProfile.name,
        role: demoProfile.role,
        status: demoProfile.status || 'ACTIVE',
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
