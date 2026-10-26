# SIRKULA — Catatan versi demo

- Aplikasi berjalan memakai server statis Node.js bawaan di `src/server.js`; tidak membutuhkan Express, PostgreSQL, Prisma, atau install package.
- `public/js/storage.js` menyediakan data demo dan persistensi browser melalui `localStorage`; sesi demo berada di `sessionStorage`.
- `public/css/listings.css` dipakai bersama oleh homepage dan marketplace untuk kartu produk/grid responsif.
- Foto kategori berada di `public/images/food/` sehingga halaman tidak memerlukan host foto eksternal.
- Grafik impact memakai native canvas, tanpa CDN grafik.
- Login role-switching hanya simulasi lokal; jangan gunakan untuk data pengguna sungguhan.

Alur presentasi: `/` → Marketplace → Log in dengan role Receiver/Seller/Admin → Dashboard dan fitur terkait. Sebelum demo, jalankan `npm.cmd test`, lalu `npm.cmd run dev`.
