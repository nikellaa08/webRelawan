# Web Relawan - Volunteer Platform

Platform web untuk manajemen relawan dan kegiatan sosial.

## Prerequisites

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:
- **Node.js** (versi 18 atau lebih baru)
- **MySQL** atau **XAMPP** (untuk database)

## Instalasi

1. **Clone repository dari GitHub:**
   ```bash
   git clone <repository-url>
   cd webRelawan
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Database:**
   - Pastikan MySQL/XAMPP sudah berjalan
   - Buat database dengan nama `relawan_nusantara`
   - Import struktur database (jika ada file SQL)

4. **Konfigurasi Database:**
   - File konfigurasi database ada di `db.js`
   - Default konfigurasi untuk XAMPP:
     - Host: `localhost`
     - User: `root`
     - Password: `` (kosong)
     - Database: `relawan_nusantara`

## Menjalankan Aplikasi

### Mode Development (dengan auto-reload):
```bash
npm run dev
```

### Mode Production:
```bash
npm start
```

Aplikasi akan berjalan di: **http://localhost:3000**

## Struktur Proyek

```
webRelawan/
├── app.js                      # File utama server
├── db.js                       # Konfigurasi dan fungsi database
├── package.json                # Dependencies dan scripts
├── package-lock.json           # Lock file dependencies
├── controllers/                # Controller untuk routes
│   ├── authController.js
│   ├── categoryController.js
│   └── eventController.js
├── models/                     # Model database
├── public/                     # File statis (CSS, JS, images)
│   ├── style.css
│   └── script.js
├── views/                      # Template EJS
└── README.md                   # Dokumentasi ini
```

## Fitur Utama

- **Autentikasi User**: Login dan registrasi
- **Manajemen Event**: CRUD kegiatan relawan
- **Kategori**: Filter event berdasarkan kategori (Pendidikan, Lingkungan, Kesehatan, Sosial)
- **Donasi**: Sistem donasi untuk kegiatan
- **Responsive Design**: Tampilan responsif untuk desktop dan mobile
- **Dark Mode**: Toggle tema terang/gelap

## Dependencies

- **express**: Web framework
- **ejs**: Template engine
- **mysql2**: Driver MySQL
- **bcrypt**: Password hashing
- **dotenv**: Environment variables
- **nodemon**: Auto-reload saat development (dev only)

## Troubleshooting

### Database Connection Error
Jika terjadi error koneksi database:
1. Pastikan MySQL/XAMPP sudah berjalan
2. Cek konfigurasi di `db.js`
3. Pastikan database `relawan_nusantara` sudah dibuat

### Port Already in Use
Jika port 3000 sudah digunakan:
1. Ubah port di `app.js` pada baris `const port = process.env.PORT || 3000;`
2. Atau hentikan aplikasi yang menggunakan port 3000

### Dependencies Error
Jika ada error saat `npm install`:
1. Hapus `node_modules` dan `package-lock.json`
2. Jalankan ulang `npm install`

## Git Workflow

Karena proyek ini dikerjakan secara kolaboratif menggunakan Git:

1. **Selalu pull sebelum mulai kerja:**
   ```bash
   git pull origin master
   ```

2. **Commit perubahan secara berkala:**
   ```bash
   git add .
   git commit -m "deskripsi perubahan"
   ```

3. **Push ke GitHub:**
   ```bash
   git push origin master
   ```

4. **Resolve merge conflicts:**
   - Jika ada konflik, edit file yang bermasalah
   - Hapus marker konflik (`<<<<<<<`, `=======`, `>>>>>>>`)
   - Commit hasil resolve

## Kontribusi

Untuk menambahkan fitur baru:
1. Buat branch baru: `git checkout -b fitur-baru`
2. Lakukan perubahan dan commit
3. Push branch: `git push origin fitur-baru`
4. Buat Pull Request di GitHub

## Lisensi

ISC License
