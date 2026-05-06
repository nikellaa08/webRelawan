-- 1. Buat Database (Jika belum ada)
CREATE DATABASE IF NOT EXISTS relawan_nusantara;
USE relawan_nusantara;

-- 2. Buat Tabel Users yang LENGKAP
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    keahlian TEXT,
    is_admin TINYINT DEFAULT 0,
    koin INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Masukkan Akun Admin Default
-- Email: admin@gmail.com
-- Password: admin123 (Plain text untuk sementara, atau bisa di-hash nanti)
INSERT INTO users (username, email, password, keahlian, is_admin, koin) 
VALUES ('Administrator', 'admin@gmail.com', 'admin123', 'Manajemen Sistem', 1, 0)
ON DUPLICATE KEY UPDATE is_admin = 1;

-- 4. Tabel Pendukung Lainnya (Opsional namun disarankan)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward_koin INT DEFAULT 10,
    date DATE
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
