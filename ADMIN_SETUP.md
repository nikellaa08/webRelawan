# 🔐 Setup Admin Panel - Web Relawan

## Langkah-langkah Setup Admin Panel

### 1. Update Database
Jalankan SQL script di bawah ini di database Anda:

```sql
-- Tambah kolom is_admin ke tabel users
ALTER TABLE users ADD COLUMN is_admin INT DEFAULT 0;

-- Buat admin default
INSERT IGNORE INTO users (nama_lengkap, email, password, is_admin, created_at) 
VALUES ('Admin Master', 'admin@relawan.com', 'admin123', 1, NOW());
```

**File:** `admin_setup.sql` (sudah disediakan)

### 2. Akses Admin Panel

- **URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@relawan.com`
- **Password:** `admin123`

### 3. Fitur Admin Dashboard

Admin dapat mengelola:

#### 📊 Dashboard
- Statistik pengguna, event, donasi, dan kategori
- Quick access ke semua menu management

#### 👥 Kelola Pengguna
- Lihat daftar semua pengguna
- Lihat informasi pengguna (nama, email, skills, koin)
- Hapus pengguna yang tidak aktif

#### 📅 Kelola Event
- Lihat daftar semua event
- Lihat detail event (nama, lokasi, tanggal, kategori)
- Hapus event yang tidak valid
- Lihat reward koin untuk setiap event

#### 📂 Kelola Kategori
- Lihat semua kategori
- Tambah kategori baru
- Edit deskripsi kategori
- Hapus kategori

### 4. Membuat Admin Tambahan

```sql
INSERT INTO users (nama_lengkap, email, password, is_admin, created_at) 
VALUES ('Nama Admin', 'admin2@relawan.com', 'password123', 1, NOW());
```

### 5. Security Notes

⚠️ **PENTING:**
- Ubah password default admin segera setelah install
- Jangan share credentials admin panel
- Gunakan password yang kuat (minimal 8 karakter)
- Pantau aktivitas admin secara berkala

### 6. File-file yang Ditambahkan

```
controllers/
  └── adminController.js          # Logic admin (login, CRUD operations)

views/
  └── admin/
      ├── login.ejs               # Admin login page
      ├── dashboard.ejs           # Admin dashboard
      ├── users.ejs              # Manage users
      ├── events.ejs             # Manage events
      └── categories.ejs         # Manage categories

app.js                            # Routes dan middleware admin ditambahkan

admin_setup.sql                   # SQL script untuk database setup
```

### 7. Routes Admin

| Method | Route | Fungsi |
|--------|-------|--------|
| GET | `/admin/login` | Halaman login admin |
| POST | `/admin/api/login` | Proses login |
| GET | `/admin/dashboard` | Dashboard admin |
| GET | `/admin/users` | Daftar pengguna |
| GET | `/admin/users/delete/:id` | Hapus pengguna |
| GET | `/admin/events` | Daftar event |
| GET | `/admin/events/delete/:id` | Hapus event |
| GET | `/admin/categories` | Daftar kategori |
| POST | `/admin/categories/add` | Tambah kategori |
| GET | `/admin/categories/delete/:id` | Hapus kategori |
| GET/POST | `/admin/logout` | Logout admin |

### 8. Tips & Troubleshooting

**Q: Lupa password admin?**
A: Update password langsung di database:
```sql
UPDATE users SET password = 'password_baru' WHERE email = 'admin@relawan.com';
```

**Q: Ingin menambah fitur admin lain?**
A: Edit file `controllers/adminController.js` dan tambahkan fungsi+route baru

**Q: Database error saat kelola kategori?**
A: Pastikan tabel users sudah punya kolom `is_admin` (bisa di-cek via admin_setup.sql)

---

✅ **Setup Selesai!** Silakan akses admin panel di `/admin/login`
