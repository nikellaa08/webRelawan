-- Admin Setup Script for Web Relawan
-- Run this script to add admin functionality to the database

-- Tambah kolom is_admin ke tabel users jika belum ada
ALTER TABLE users ADD COLUMN is_admin INT DEFAULT 0;

-- Buat admin default (EMAIL: admin@relawan.com, PASSWORD: admin123)
-- PENTING: Ganti password admin setelah login!
INSERT IGNORE INTO users (nama_lengkap, email, password, is_admin, created_at) 
VALUES ('Admin Master', 'admin@relawan.com', 'admin123', 1, NOW());

-- Jika ingin menambah admin lain, gunakan query di bawah ini:
-- INSERT IGNORE INTO users (nama_lengkap, email, password, is_admin, created_at) 
-- VALUES ('Nama Admin', 'email@admin.com', 'password123', 1, NOW());
