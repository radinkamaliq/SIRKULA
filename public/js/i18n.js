(function () {
  "use strict";
  const STORAGE_KEY = "sirkula_lang";
  const DEFAULT_LANG = "id";
  const SUPPORTED = ["id", "en"];
  const PHRASES = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "401": "401",
  "403": "403",
  "404": "404",
  "500": "500",
  ">": ">",
  "*": "*",
  "+ New Listing": "+ Listing Baru",
  "Access denied": "Akses ditolak",
  "Access denied • SIRKULA": "Akses ditolak • SIRKULA",
  "Access safe, affordable surplus food.": "Akses makanan surplus yang aman dan terjangkau.",
  "Account": "Akun",
  "Address / pickup location": "Alamat / lokasi pengambilan",
  "Address:": "Alamat:",
  "Admin": "Admin",
  "Admin Dashboard": "Dasbor Admin",
  "Admin access is available from the demo Login page.": "Akses admin tersedia dari halaman Masuk demo.",
  "Admin • SIRKULA": "Admin • SIRKULA",
  "All": "Semua",
  "All categories": "Semua kategori",
  "All statuses": "Semua status",
  "Already have an account?": "Sudah punya akun?",
  "Angka dihitung dari data contoh yang tersimpan di browser ini. Statistik ini hanya untuk demonstrasi, bukan hasil nyata yang telah diaudit.": "Angka dihitung dari data contoh yang tersimpan di browser ini. Statistik ini hanya untuk demonstrasi, bukan hasil nyata yang telah diaudit.",
  "Approved": "Disetujui",
  "Audit Log": "Log Audit",
  "Available": "Tersedia",
  "Available listings posted by sellers on SIRKULA.": "Listing tersedia yang diposting penjual di SIRKULA.",
  "Available: --": "Tersedia: --",
  "Back to Inventory": "Kembali ke Inventori",
  "Back to Marketplace": "Kembali ke Pasar",
  "Bakery": "Roti & Kue",
  "Beverages": "Minuman",
  "Browse surplus food available in this SIRKULA demo. Listings and changes are saved in this browser.": "Jelajahi makanan surplus yang tersedia di demo SIRKULA ini. Listing dan perubahan disimpan di browser ini.",
  "Cancelled": "Dibatalkan",
  "Category": "Kategori",
  "Choose a JPG, PNG, or WEBP image up to 5 MB. It will be resized and saved in this browser for the demo.": "Pilih gambar JPG, PNG, atau WEBP hingga 5 MB. Gambar akan diubah ukurannya dan disimpan di browser ini untuk demo.",
  "Community Impact": "Dampak Komunitas",
  "Community:": "Komunitas:",
  "Completed": "Selesai",
  "Completed Pickups • Last 14 Days": "Pengambilan Selesai • 14 Hari Terakhir",
  "Condition": "Kondisi",
  "Contact (placeholder)": "Kontak (placeholder)",
  "Create Listing": "Buat Listing",
  "Create a local demo profile to explore SIRKULA.": "Buat profil demo lokal untuk menjelajahi SIRKULA.",
  "Create account": "Buat akun",
  "Create an account": "Buat akun",
  "Create, edit, and manage your surplus food listings.": "Buat, edit, dan kelola listing makanan surplus Anda.",
  "Dairy": "Susu & Olahan",
  "Dashboard": "Dasbor",
  "Dashboard • SIRKULA": "Dasbor • SIRKULA",
  "Dashboard,": "Dasbor,",
  "Data impact dapat berubah saat kamu mencoba fitur demo. Tidak ada data yang dikirim ke server atau dibagikan antarperangkat.": "Data impact dapat berubah saat kamu mencoba fitur demo. Tidak ada data yang dikirim ke server atau dibagikan antarperangkat.",
  "Deadline:": "Batas waktu:",
  "Demo Access • No Registration Required": "Akses Demo • Tanpa Registrasi",
  "Demo account": "Akun demo",
  "Demo figures are calculated from sample data stored in this browser. They are estimates, not verified real-world results.": "Angka demo dihitung dari data contoh yang tersimpan di browser ini. Ini estimasi, bukan hasil nyata yang terverifikasi.",
  "Demo mode (no database):": "Mode demo (tanpa database):",
  "Demo only • Profile data is stored in this browser.": "Khusus demo • Data profil disimpan di browser ini.",
  "Demo profile only. Changes are saved locally in this browser; login and password actions are simulations.": "Profil demo saja. Perubahan disimpan lokal di browser ini; aksi login dan kata sandi adalah simulasi.",
  "Description": "Deskripsi",
  "Do not expose private home addresses unnecessarily.": "Jangan sembarangan menampilkan alamat rumah pribadi.",
  "Earliest deadline": "Batas waktu terdekat",
  "Edit profile": "Edit profil",
  "Email / Username": "Email / Nama pengguna",
  "Email address": "Alamat email",
  "Enter any email/username and password, then select a role:": "Masukkan email/nama pengguna dan kata sandi apa saja, lalu pilih peran:",
  "Expired": "Kedaluwarsa",
  "Explore Surplus Food": "Jelajahi Makanan Surplus",
  "Explore food": "Jelajahi makanan",
  "Featured Surplus Food": "Makanan Surplus Unggulan",
  "Figures computed from sample activity in this browser. These are demo estimates, not audited real-world outcomes.": "Angka dihitung dari aktivitas contoh di browser ini. Ini estimasi demo, bukan hasil nyata yang diaudit.",
  "Filter by status": "Filter berdasarkan status",
  "Food Security • S-Tech 2026": "Ketahanan Pangan • S-Tech 2026",
  "Food name": "Nama makanan",
  "For this demo, enter any password you like. It is not saved or verified.": "Untuk demo ini, masukkan kata sandi apa saja. Kata sandi tidak disimpan atau diverifikasi.",
  "Fresh": "Segar",
  "Frozen": "Beku",
  "Full name": "Nama lengkap",
  "GOOD FOOD, SECOND CHANCE": "MAKANAN BAIK, KESEMPATAN KEDUA",
  "Go home": "Ke beranda",
  "Good Food Deserves Another Chance.": "Makanan Baik Berhak Mendapat Kesempatan Lain.",
"FOOD RESCUE · CIRCULAR ECONOMY": "RESCUE MAKANAN · EKONOMI SIRKULAR",
"Good Food. Second Chance.": "Makanan Baik. Kesempatan Kedua.",
"SIRKULA connects surplus food with people who can use it, before good food becomes waste.": "SIRKULA menghubungkan makanan surplus dengan orang yang dapat memanfaatkannya, sebelum makanan baik menjadi limbah.",
"Explore Food": "Jelajahi Makanan",
"How SIRKULA Works": "Cara Kerja SIRKULA",
"Rescue more. Waste less.": "Selamatkan lebih banyak. Buang lebih sedikit.",
"Turn surplus into a useful next meal.": "Ubah surplus menjadi makanan berguna berikutnya.",
"One simple loop": "Satu alur sederhana",
"List · Reserve · Pick up": "Daftar · Reservasi · Ambil",
  "Home": "Beranda",
  "How SIRKULA works": "Cara SIRKULA bekerja",
  "I want to join as": "Saya ingin bergabung sebagai",
  "Impact": "Dampak",
  "Impact Dashboard": "Dasbor Dampak",
  "Impact • SIRKULA": "Dampak • SIRKULA",
  "Inventory": "Inventori",
  "Inventory Management": "Pengelolaan Inventori",
  "Inventory • SIRKULA": "Inventori • SIRKULA",
  "Join": "Gabung",
  "Join SIRKULA": "Gabung dengan SIRKULA",
  "Join SIRKULA • Register": "Gabung dengan SIRKULA • Daftar",
  "Jumlah listing demo berdasarkan kategori, bukan berat makanan.": "Jumlah listing demo berdasarkan kategori, bukan berat makanan.",
  "Jumlah reservasi yang ditandai selesai dalam demo browser ini.": "Jumlah reservasi yang ditandai selesai dalam demo browser ini.",
  "Latitude (optional)": "Lintang (opsional)",
  "Less food waste, better food security.": "Lebih sedikit limbah makanan, ketahanan pangan lebih baik.",
  "List safe surplus food for redistribution.": "Daftarkan makanan surplus yang aman untuk didistribusikan ulang.",
  "List surplus": "Daftarkan surplus",
  "List • Reserve • Pick up": "Daftar • Reservasi • Ambil",
  "Listing Moderation": "Moderasi Listing",
  "Listing • SIRKULA": "Listing • SIRKULA",
  "Listings": "Listing",
  "Listings by Category": "Listing berdasarkan Kategori",
  "Loading...": "Memuat...",
  "Location:": "Lokasi:",
  "Log in": "Masuk",
  "Log in • SIRKULA": "Masuk • SIRKULA",
  "Log out": "Keluar",
  "Longitude (optional)": "Bujur (opsional)",
  "Mark all read": "Tandai semua dibaca",
  "Marketplace": "Pasar",
  "Marketplace • SIRKULA": "Pasar • SIRKULA",
  "Meat": "Daging",
  "Near-expiry": "Mendekati kedaluwarsa",
  "Nearest (Jakarta demo)": "Terdekat (demo Jakarta)",
  "Never claim a listing is certified safe without verification.": "Jangan pernah menyatakan listing bersertifikat aman tanpa verifikasi.",
  "New Listing": "Listing Baru",
  "New Listing • SIRKULA": "Listing Baru • SIRKULA",
  "Newest": "Terbaru",
  "Notes (optional)": "Catatan (opsional)",
  "Notifications": "Notifikasi",
  "Notifications • SIRKULA": "Notifikasi • SIRKULA",
  "One simple loop": "Satu alur sederhana",
  "Other": "Lainnya",
  "Overview": "Ringkasan",
  "Packaged": "Dikemas",
  "Page not found": "Halaman tidak ditemukan",
  "Page not found • SIRKULA": "Halaman tidak ditemukan • SIRKULA",
  "Pantry": "Sembako",
  "Password": "Kata sandi",
  "Pending": "Menunggu",
  "Phone": "Telepon",
  "Phone:": "Telepon:",
  "Photo (optional)": "Foto (opsional)",
  "Pick up": "Ambil",
  "Pickup deadline": "Batas waktu pengambilan",
  "Pickup deadlines help users prioritize listings that need attention.": "Batas waktu pengambilan membantu pengguna memprioritaskan listing yang perlu perhatian.",
  "Pickup details": "Detail pengambilan",
  "Pickup location": "Lokasi pengambilan",
  "Platform": "Platform",
  "Platform-wide moderation. Admin-only area.": "Moderasi seluruh platform. Area khusus admin.",
  "Please log in again to continue.": "Silakan masuk lagi untuk melanjutkan.",
  "Prepared Food": "Makanan Siap Saji",
  "Price (optional; leave blank for free)": "Harga (opsional; kosongkan untuk gratis)",
  "Price:": "Harga:",
  "Produce": "Produk Segar",
  "Profile": "Profil",
  "Profile & Settings": "Profil & Pengaturan",
  "Profile • SIRKULA": "Profil • SIRKULA",
  "Quantity": "Jumlah",
  "Quantity:": "Jumlah:",
  "Quick Actions": "Aksi Cepat",
  "RESCUE • REDISTRIBUTE • REPEAT": "RESCUE • REDISTRIBUTE • REPEAT",
  "Receiver": "Penerima",
  "Receiver (request food)": "Penerima (meminta makanan)",
  "Receiver picks up; seller marks completion.": "Penerima mengambil; penjual menandai selesai.",
  "Receiver requests an available quantity.": "Penerima meminta jumlah yang tersedia.",
  "Receivers browse, search, and request available food near them.": "Penerima menjelajah, mencari, dan meminta makanan yang tersedia di sekitar mereka.",
  "Receivers:": "Penerima:",
  "Recent Activity": "Aktivitas Terbaru",
  "Recent Listings / Reservations": "Listing / Reservasi Terbaru",
  "Reduce waste disposal costs; reach community buyers.": "Kurangi biaya pembuangan limbah; jangkau pembeli komunitas.",
  "Rejected": "Ditolak",
  "Reports": "Laporan",
  "Request food": "Minta makanan",
  "Request quantity": "Jumlah permintaan",
  "Rescue Food. Rethink Waste.": "Selamatkan Makanan. Pikir Ulang Limbah.",
  "Rescue more. Waste less.": "Selamatkan lebih banyak. Kurangi limbah.",
  "Reservations": "Reservasi",
  "Reservations • SIRKULA": "Reservasi • SIRKULA",
  "Reserve": "Reservasi",
  "Reserved": "Direservasi",
  "Role": "Peran",
  "Role:": "Peran:",
  "S": "S",
  "S-Tech 2026 • Web Development": "S-Tech 2026 • Pengembangan Web",
  "SIRKULA": "SIRKULA",
  "SIRKULA Admin": "Admin SIRKULA",
  "SIRKULA demo platform. Sample data clearly labeled; no unverified real-world impact claimed.": "Platform demo SIRKULA. Data contoh diberi label jelas; tidak ada klaim dampak nyata yang tidak terverifikasi.",
  "SIRKULA does not replace official food safety inspections or regulations. Listings are not certified safe without verification.": "SIRKULA tidak menggantikan inspeksi atau regulasi keamanan pangan resmi. Listing tidak bersertifikat aman tanpa verifikasi.",
  "SIRKULA • Rescue Food. Rethink Waste.": "SIRKULA • Selamatkan Makanan. Pikir Ulang Limbah.",
  "Save changes": "Simpan perubahan",
  "Select": "Pilih",
  "Select a role": "Pilih peran",
  "Seller": "Penjual",
  "Seller (list surplus food)": "Penjual (mendaftarkan makanan surplus)",
  "Seller approves or rejects; the demo updates available stock locally.": "Penjual menyetujui atau menolak; demo memperbarui stok yang tersedia secara lokal.",
  "Seller lists surplus food with condition & pickup deadline.": "Penjual mendaftarkan makanan surplus dengan kondisi & batas waktu pengambilan.",
  "Seller:": "Penjual:",
  "Sellers approve, receivers collect, and both confirm the redistribution.": "Penjual menyetujui, penerima mengambil, dan keduanya mengonfirmasi redistribusi.",
  "Sellers list safe surplus food with quantity, pickup location, and deadline.": "Penjual mendaftarkan makanan surplus yang aman dengan jumlah, lokasi pengambilan, dan batas waktu.",
  "Sellers:": "Penjual:",
  "Server error": "Kesalahan server",
  "Server error • SIRKULA": "Kesalahan server • SIRKULA",
  "Session expired": "Sesi berakhir",
  "Session expired • SIRKULA": "Sesi berakhir • SIRKULA",
  "Sign In": "Masuk",
  "Sign in to your account to continue.": "Masuk ke akun Anda untuk melanjutkan.",
  "Something went wrong on our end. Please try again later.": "Terjadi kesalahan pada sistem kami. Silakan coba lagi nanti.",
  "Sort": "Urutkan",
  "Status": "Status",
  "Status:": "Status:",
  "Surplus Marketplace": "Pasar Makanan Surplus",
  "The food redistribution process": "Proses redistribusi makanan",
  "The page you're looking for doesn't exist.": "Halaman yang Anda cari tidak ditemukan.",
  "Three steps to rescue surplus food.": "Tiga langkah untuk menyelamatkan makanan surplus.",
  "Turn surplus into a useful next meal.": "Ubah surplus menjadi makanan berikutnya yang bermanfaat.",
  "U": "U",
  "Unavailable": "Tidak Tersedia",
  "Unit": "Satuan",
  "Updates on your reservations and listings.": "Pembaruan pada reservasi dan listing Anda.",
  "User Management": "Pengelolaan Pengguna",
  "Users": "Pengguna",
  "View all listings": "Lihat semua listing",
  "Welcome back": "Selamat datang kembali",
  "Who benefits": "Siapa yang diuntungkan",
  "You don't have permission to view this page.": "Anda tidak memiliki izin untuk melihat halaman ini.",
  "bags": "tas",
  "boxes": "kotak",
  "cans": "kaleng",
  "kg": "kg",
  "liter": "liter",
  "packs": "paket",
  "pieces": "potong",
  "support@sirkula.example": "support@sirkula.example",
  "•": "•",
  "• Select role •": "• Pilih peran •",
  "• browse & reserve food": "• jelajahi & reservasi makanan",
  "• manage inventory & listings": "• kelola inventori & listing",
  "• platform oversight": "• pengawasan platform",
  "?": "?",
  "Access denied — SIRKULA": "Akses ditolak — SIRKULA",
  "Admin — SIRKULA": "Admin — SIRKULA",
  "Completed Pickups · Last 14 Days": "Pengambilan Selesai · 14 Hari Terakhir",
  "Dashboard — SIRKULA": "Dasbor — SIRKULA",
  "Demo Access — No Registration Required": "Akses Demo — Tanpa Registrasi",
  "Demo only • Profile data is stored in this browser.": "Khusus demo • Data profil disimpan di browser ini.",
  "Impact — SIRKULA": "Dampak — SIRKULA",
  "Inventory — SIRKULA": "Inventori — SIRKULA",
  "Join SIRKULA — Register": "Gabung dengan SIRKULA — Daftar",
  "List · Reserve · Pick up": "Daftar · Reservasi · Ambil",
  "Listing — SIRKULA": "Listing — SIRKULA",
  "Log in — SIRKULA": "Masuk — SIRKULA",
  "Marketplace — SIRKULA": "Pasar — SIRKULA",
  "New Listing — SIRKULA": "Listing Baru — SIRKULA",
  "Notifications — SIRKULA": "Notifikasi — SIRKULA",
  "Page not found — SIRKULA": "Halaman tidak ditemukan — SIRKULA",
  "Profile — SIRKULA": "Profil — SIRKULA",
  "RESCUE • REDISTRIBUTE • REPEAT": "RESCUE • REDISTRIBUTE • REPEAT",
  "Reservations — SIRKULA": "Reservasi — SIRKULA",
  "SIRKULA — Rescue Food. Rethink Waste.": "SIRKULA — Selamatkan Makanan. Pikir Ulang Limbah.",
  "Server error — SIRKULA": "Kesalahan server — SIRKULA",
  "Session expired — SIRKULA": "Sesi berakhir — SIRKULA",
  "—": "—",
  "— Select role —": "— Pilih peran —",
  "— browse & reserve food": "— jelajahi & reservasi makanan",
  "— manage inventory & listings": "— kelola inventori & listing",
  "— platform oversight": "— pengawasan platform",
  "•": "•",
  "✓": "✓",
  "AVAILABLE": "Tersedia",
  "PRODUCE": "PRODUK SEGAR",
  "BAKERY": "ROTI DAN KUE",
  "MEAT": "DAGING",
  "UNAVAILABLE": "Tidak Tersedia",
  "SOLD_OUT": "Stok Habis",
  "PENDING": "Menunggu",
  "APPROVED": "Disetujui",
  "REJECTED": "Ditolak",
  "CANCELLED": "Dibatalkan",
  "COMPLETED": "Selesai",
  "EXPIRED": "Kedaluwarsa",
  "SELLER": "Penjual",
  "RECEIVER": "Penerima",
  "ADMIN": "Admin",
  "Foto surplus makanan": "Foto surplus makanan",
  "Surplus food available for pickup.": "Makanan surplus tersedia untuk diambil.",
  "Untitled listing": "Listing tanpa judul",
  "View details": "Lihat detail",
  "View": "Lihat",
  "Similar": "Produk Serupa",
  "items": "item",
  "Logged out.": "Berhasil keluar.",
  "No listings match your filters.": "Tidak ada listing yang sesuai filter.",
  "Try another category or clear your search to see more surplus food.": "Coba kategori lain atau hapus pencarian untuk melihat lebih banyak makanan surplus.",
  "Prev": "Sebelumnya",
  "Next": "Berikutnya",
  "No notifications yet.": "Belum ada notifikasi.",
  "marked as read": "ditandai dibaca",
  "unread": "belum dibaca",
  "Nothing here": "Tidak ada di sini",
  "No data available.": "Tidak ada data tersedia.",
  "Free": "Gratis",
  "Reservation Request": "Permintaan Reservasi",
  "Reservation Update": "Pembaruan Reservasi",
  "Reservation Approved": "Reservasi Disetujui",
  "Reservation Rejected": "Reservasi Ditolak",
  "System": "Sistem",
  "No featured listings available yet.": "Belum ada listing unggulan.",
  "Featured listings are temporarily unavailable.": "Listing unggulan sementara tidak tersedia.",
  "units in completed demo pickups": "unit dalam pengambilan demo yang selesai",
  "completed pickups": "pengambilan selesai",
  "available listings": "listing tersedia",
  "demo sellers": "penjual demo",
  "demo receivers": "penerima demo",
  "Sample impact data is unavailable.": "Data dampak contoh tidak tersedia.",
  "surplus food listings": "listing makanan surplus",
  "My Listings": "Listing Saya",
  "Incoming Reservations": "Reservasi Masuk",
  "Pending Requests": "Permintaan Menunggu",
  "Units in Completed Pickups": "Unit dalam Pengambilan Selesai",
  "Total Listings": "Total Listing",
  "Demo Users": "Pengguna Demo",
  "Completed Pickups": "Pengambilan Selesai",
  "Available Listings": "Listing Tersedia",
  "My Reservations": "Reservasi Saya",
  "Item": "Item",
  "Listing": "Listing",
  "Qty": "Jml",
  "Date": "Tanggal",
  "Missing listing ID.": "ID listing tidak ditemukan.",
  "Listing not found.": "Listing tidak ditemukan.",
  "Failed to load listing.": "Gagal memuat listing.",
  "No description provided.": "Tidak ada deskripsi.",
  "Available for new requests: {qty} {unit}": "Tersedia untuk permintaan baru: {qty} {unit}",
  "All remaining stock is currently held by pending requests.": "Seluruh stok yang tersedia sedang menunggu konfirmasi reservasi.",
  "Not available for reservation": "Tidak tersedia untuk reservasi",
  "Log in to request": "Masuk untuk meminta",
  "Edit your listing": "Edit listing Anda",
  "Reservation request sent": "Permintaan reservasi terkirim",
  "Request failed.": "Permintaan gagal.",
  "Request failed": "Permintaan gagal",
  "No listings yet. Create your first listing.": "Belum ada listing. Buat listing pertamamu.",
  "Archive this listing?": "Arsipkan listing ini?",
  "Listing archived": "Listing diarsipkan",
  "Archive failed": "Gagal mengarsipkan",
  "Delete this listing? (only allowed if no active reservations)": "Hapus listing ini? (hanya diizinkan jika tidak ada reservasi aktif)",
  "Cannot delete listing with active reservations": "Tidak dapat menghapus listing dengan reservasi aktif",
  "Listing deleted": "Listing dihapus",
  "Delete failed": "Gagal menghapus",
  "Edit Listing": "Edit Listing",
  "Listing updated": "Listing diperbarui",
  "Listing created": "Listing dibuat",
  "sellers": "penjual",
  "receivers": "penerima",
  "active listings": "listing aktif",
  "reports": "laporan",
  "Name": "Nama",
  "Email": "Email",
  "Action": "Aksi",
  "Title": "Judul",
  "Reason": "Alasan",
  "Reporter": "Pelapor",
  "Suspend": "Tangguhkan",
  "Reactivate": "Aktifkan",
  "Moderate": "Moderasi",
  "Update": "Perbarui",
  "Reviewed": "Ditinjau",
  "Resolved": "Diselesaikan",
  "Dismissed": "Ditolak",
  "User": "Pengguna",
  "Failed": "Gagal",
  "Report updated": "Laporan diperbarui",
  "pending requests": "permintaan menunggu",
  "listings": "listing",
  "Demo User": "Pengguna Demo",
  "ACTIVE": "Aktif",
  "SUSPENDED": "Ditangguhkan",
  "Avatar": "Avatar",
"Signed in successfully": "Berhasil masuk",
"Profile created": "Profil dibuat",
"This email is already registered. Please sign in.": "Email ini sudah terdaftar. Silakan masuk.",
"Account could not be created. Please try again.": "Akun tidak dapat dibuat. Silakan coba lagi.",
"Profile information is saved to your account.": "Informasi profil disimpan ke akun Anda.",
"Account security": "Keamanan akun",
"Profile changes are saved to your account. Password changes are not available in this version.": "Perubahan profil disimpan ke akun Anda. Perubahan kata sandi tidak tersedia pada versi ini.",
"Choose your role to continue.": "Pilih peran Anda untuk melanjutkan.",
"Profile saved successfully.": "Profil berhasil disimpan.",
"Profile updated": "Profil diperbarui",
"Profile could not be saved.": "Profil tidak dapat disimpan.",
"Full name is required.": "Nama lengkap wajib diisi.",
"Profile could not be found.": "Profil tidak dapat ditemukan.",
"Photo exceeds the allowed size.": "Foto melebihi ukuran yang diizinkan.",
"Listing could not be saved.": "Listing tidak dapat disimpan.",
"Listing not found or does not belong to your account.": "Listing tidak ditemukan atau bukan milik akun Anda.",
"Maximum ": "Maksimal ",
"Enter a quantity between 1 and {max}.": "Masukkan jumlah antara 1 dan {max}.",
"This listing is no longer available for reservation.": "Listing ini sudah tidak tersedia untuk reservasi.",
"All available stock is currently held by pending requests.": "Seluruh stok yang tersedia sedang menunggu konfirmasi reservasi.",
"Sign in as a Receiver to create a reservation.": "Masuk sebagai Receiver untuk membuat reservasi.",
"Select the Receiver role to request this item.": "Pilih peran Receiver untuk meminta item ini.",
"Reservation could not be saved.": "Reservasi tidak dapat disimpan.",
"Review, approve, or reject requests for your listings.": "Tinjau, setujui, atau tolak permintaan untuk listing milik Anda.",
"View reservation status and pickup instructions.": "Lihat status reservasi dan petunjuk pengambilan.",
"Monitor reservation activity across the platform.": "Pantau aktivitas reservasi di seluruh platform.",
"No reservations yet": "Belum ada reservasi",
"New requests from receivers will appear here.": "Permintaan baru dari penerima akan muncul di sini.",
"Browse the marketplace to find surplus food.": "Jelajahi marketplace untuk menemukan makanan surplus.",
"Open Marketplace": "Buka Marketplace",
"Location unavailable": "Lokasi tidak tersedia",
"Pickup instructions: ": "Petunjuk pengambilan: ",
"Reservation could not be updated.": "Reservasi tidak berhasil diperbarui.",
"Reservation approved": "Reservasi disetujui",
"Request for": "Permintaan untuk",
"has been approved.": "telah disetujui.",
"Reservation approved; stock updated.": "Reservasi disetujui; stok sudah diperbarui.",
"Only pending reservations can be rejected.": "Hanya reservasi pending yang dapat ditolak.",
"Reject this reservation request?": "Tolak permintaan reservasi ini?",
"Reservation rejected": "Reservasi ditolak",
"was rejected.": "ditolak.",
"Request rejected.": "Permintaan ditolak.",
"Only pending reservations can be cancelled.": "Hanya reservasi pending yang dapat dibatalkan.",
"Cancel this reservation request?": "Batalkan permintaan reservasi ini?",
"Request cancelled": "Permintaan dibatalkan",
"has been cancelled.": "telah dibatalkan.",
"Request cancelled.": "Permintaan dibatalkan.",
"Only approved reservations can be completed.": "Hanya reservasi yang disetujui yang dapat diselesaikan.",
"Mark this pickup as completed?": "Tandai pengambilan ini selesai?",
"Pickup completed": "Pengambilan selesai",
"Pickup for": "Pengambilan untuk",
"marked as completed.": "ditandai selesai.",
"Pickup marked as completed.": "Pengambilan ditandai selesai.",
"New Reservation Request": "Permintaan Reservasi Baru",
"Reservation request sent": "Permintaan reservasi terkirim",
"Impact data is unavailable. Please reload the page.": "Data impact tidak dapat ditampilkan. Silakan muat ulang halaman.",
"No listings yet": "Belum ada listing",
"No categories to display.": "Belum ada kategori untuk ditampilkan.",
"Profile saved successfully.": "Profil berhasil disimpan.",
"Profile could not be found.": "Profil tidak dapat ditemukan.",
"Profile could not be saved.": "Profil tidak dapat disimpan.",
"Figures reflect recorded platform activity.": "Angka mencerminkan aktivitas platform yang tercatat.",
"Impact data is unavailable.": "Data impact tidak tersedia.",
"Profile information is saved to your account.": "Informasi profil disimpan ke akun Anda.",
  };
  function getLanguage() {
    try { const value = localStorage.getItem(STORAGE_KEY); if (SUPPORTED.includes(value)) return value; } catch (e) {}
    return DEFAULT_LANG;
  }
  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang)) return false;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    try { document.documentElement.lang = lang === "id" ? "id" : "en"; } catch (e) {}
    applyTranslations(document);
    try { window.dispatchEvent(new CustomEvent("sirkula:languagechange", { detail: { lang } })); } catch (e) {}
    updateSwitcher();
    return true;
  }
  function t(value) {
    if (value == null) return "";
    const text = String(value);
    if (getLanguage() === "en") return text;
    return Object.prototype.hasOwnProperty.call(PHRASES, text) ? PHRASES[text] : text;
  }
  const originalTextNodes = new WeakMap();
  function translateTextNode(node) {
  const parent = node.parentElement;
    if (parent && typeof parent.closest === "function" && parent.closest("[data-i18n]")) return;
    const value = node.nodeValue;
    if (value == null) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    let original = originalTextNodes.get(node);
    if (!original) { original = trimmed; originalTextNodes.set(node, original); }
    const translated = getLanguage() === "en" ? original : (PHRASES[original] || original);
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    node.nodeValue = leading + translated + trailing;
  }
  function translateAttributes(el) {
    ["placeholder", "aria-label", "title", "alt"].forEach((attr) => {
      if (!el.hasAttribute || !el.hasAttribute(attr)) return;
      const current = el.getAttribute(attr);
      if (current == null) return;
      const trimmed = current.trim();
      const dataKey = "i18nOrig" + attr.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
      let original = (el.dataset && el.dataset[dataKey]) ? el.dataset[dataKey] : null;
      if (!original) { original = trimmed; if (el.dataset) el.dataset[dataKey] = original; }
      const translated = getLanguage() === "en" ? original : (PHRASES[original] || original);
      el.setAttribute(attr, translated);
    });
  }
  function applyTranslations(root) {
    if (!root) root = document;
    try { root.querySelectorAll("[data-i18n]").forEach((el) => { const key = el.getAttribute("data-i18n"); if (key) { const tr = t(key); if (tr) { const label = el.querySelector && el.querySelector(".btn-label"); if (label) label.textContent = tr; else el.textContent = tr; } } }); } catch (e) {}
    try { root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")))); } catch (e) {}
    try { root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")))); } catch (e) {}
    try { root.querySelectorAll("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.getAttribute("data-i18n-title")))); } catch (e) {}
    try { root.querySelectorAll("[data-i18n-alt]").forEach((el) => el.setAttribute("alt", t(el.getAttribute("data-i18n-alt")))); } catch (e) {}
    try { root.querySelectorAll("*").forEach(translateAttributes); } catch (e) {}
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent) continue;
        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;
        translateTextNode(node);
      }
    } catch (e) {}
  }
  function updateSwitcher() {
    const current = getLanguage();
    document.querySelectorAll(".lang-switcher").forEach((el) => {
      const btn = el.querySelector(".lang-switcher-btn");
      if (btn) btn.textContent = current === "id" ? "ID | Indonesia" : "EN | English";
      el.querySelectorAll(".lang-option").forEach((opt) => {
        opt.classList.toggle("active", opt.getAttribute("data-lang") === current);
      });
    });
  }
  function renderLanguageSwitcher() {
    document.querySelectorAll(".header-actions").forEach((container) => {
      if (container.querySelector(".lang-switcher")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "lang-switcher";
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";
      const btn = document.createElement("button");
      btn.className = "btn btn-outline lang-switcher-btn";
      btn.type = "button";
      btn.textContent = getLanguage() === "id" ? "ID | Indonesia" : "EN | English";
      const menu = document.createElement("div");
      menu.className = "lang-switcher-menu";
      menu.style.display = "none";
      menu.style.position = "absolute";
      menu.style.right = "0";
      menu.style.top = "100%";
      menu.style.zIndex = "1000";
      menu.style.background = "var(--color-surface, #fff)";
      menu.style.border = "1px solid var(--color-border, #ddd)";
      menu.style.borderRadius = "0.5rem";
      menu.style.minWidth = "10rem";
      menu.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      menu.style.maxWidth = "calc(100vw - 2rem)";
      menu.style.boxSizing = "border-box";
      [{lang:"id",label:"ID | Indonesia"},{lang:"en",label:"EN | English"}].forEach((item) => {
        const opt = document.createElement("button");
        opt.className = "lang-option";
        opt.type = "button";
        opt.setAttribute("data-lang", item.lang);
        opt.textContent = item.label;
        opt.style.display = "block";
        opt.style.width = "100%";
        opt.style.textAlign = "left";
        opt.style.padding = "0.5rem 0.75rem";
        opt.style.border = "0";
        opt.style.background = "transparent";
        opt.style.cursor = "pointer";
        opt.addEventListener("click", () => { setLanguage(item.lang); menu.style.display = "none"; });
        menu.appendChild(opt);
      });
      btn.addEventListener("click", (e) => { e.stopPropagation(); menu.style.display = menu.style.display === "block" ? "none" : "block"; });
      document.addEventListener("click", (e) => { if (!wrapper.contains(e.target)) menu.style.display = "none"; });
      wrapper.appendChild(btn);
      wrapper.appendChild(menu);
      container.appendChild(wrapper);
    });
  }
  window.SIRKULA = window.SIRKULA || {};
  window.SIRKULA.i18n = { t, getLanguage, setLanguage, applyTranslations };
  window.SIRKULA.t = t;
  function init() {
    try { document.documentElement.lang = getLanguage() === "id" ? "id" : "en"; } catch (e) {}
    renderLanguageSwitcher();
    applyTranslations(document);
    updateSwitcher();
    try {
      let applying = false;
      const observer = new MutationObserver((mutations) => {
        if (applying) return;
        applying = true;
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) applyTranslations(node);
            else if (node.nodeType === 3 && node.parentElement) translateTextNode(node);
          });
        });
        applying = false;
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
