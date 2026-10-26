# SIRKULA — Rescue Food. Rethink Waste.

SIRKULA adalah prototipe web untuk demo lomba tentang distribusi surplus makanan. Pengunjung dapat melihat listing, lalu mencoba alur Seller, Receiver, dan Admin melalui login simulasi. Foto makanan disimpan lokal sehingga halaman utama tidak bergantung pada host gambar eksternal.

## Jalankan di Windows

Persyaratan: Node.js 20 atau lebih baru. **Tidak perlu menginstal package, membuat database, menjalankan Prisma, atau mengisi file `.env`.**

1. Ekstrak folder project.
2. Buka folder itu di VS Code.
3. Buka terminal VS Code di folder project, lalu jalankan:

   ```powershell
   npm.cmd run dev
   ```

4. Buka **http://localhost:5000** di browser.

Untuk berhenti, tekan `Ctrl + C` di terminal.

## Alur demo

- **Explore Surplus Food** membuka marketplace; pengunjung bisa melihat dan memfilter listing tanpa login.
- **Log in** menerima username/email apa pun dan password apa pun selama keduanya tidak kosong. Pilih role Seller, Receiver, atau Admin.
- **Seller** dapat membuat dan mengubah listing, mengelola stok, menyetujui/menolak reservasi, lalu menandai pickup selesai.
- **Receiver** dapat mencari listing, membuat permintaan reservasi, membatalkan permintaan pending, dan melihat notifikasi.
- **Admin** dapat melihat ringkasan pengguna, listing, laporan, dan aktivitas demo.

Login adalah simulasi untuk presentasi, bukan autentikasi sungguhan. Password tidak diverifikasi maupun disimpan. Jangan deploy versi ini sebagai aplikasi produksi.

## Data demo

Listing, profil, reservasi, notifikasi, laporan, dan log aktivitas disimpan di `localStorage` browser. Sesi login disimpan di `sessionStorage`. Data hanya ada di browser/perangkat yang sama, tidak dibagikan ke pengguna lain, dan bukan salinan server.

Untuk mengembalikan data demo awal: buka DevTools browser → Application/Storage → Local Storage untuk `http://localhost:5000`, hapus key `sirkula_demo_v1`, lalu refresh halaman. Ini hanya menghapus data demo lokal pada browser tersebut.

Foto makanan berada di `public/images/food/`. Grafik impact digambar memakai canvas browser, tanpa Chart.js/CDN eksternal.

## Pemeriksaan

```powershell
npm.cmd test
```

Test memeriksa server lokal, halaman utama, foto lokal, dan syntax JavaScript. Tes tidak membutuhkan database atau dependensi npm tambahan.

## Struktur project

- `public/` — HTML, CSS, JavaScript, dan aset foto lokal.
- `src/server.js` — server file statis berbasis Node.js bawaan; tidak menggunakan Express atau database.
- `tests/` — pengujian smoke test dan data demo.

Angka impact, akun, listing, dan aktivitas yang terlihat merupakan data simulasi. Jangan mempresentasikannya sebagai hasil nyata atau dampak lingkungan yang telah diaudit.
