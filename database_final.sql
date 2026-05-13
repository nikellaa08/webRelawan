-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS relawan_nusantara;
USE relawan_nusantara;

-- 2. Tabel Users (Sinkron dengan authController dan adminController)
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

-- 3. Tabel Categories (Sinkron dengan adminController dan categoryController)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Events (Mendukung title/name, location, dan reward_koin)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255), -- Mendukung fungsi di db.js
    description TEXT,
    location VARCHAR(255), -- Mendukung fungsi di db.js
    reward_koin INT DEFAULT 10,
    date DATE,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 5. Masukkan Akun Admin Default
-- Email: admin@gmail.com | Password: admin123
-- Catatan: Password ini bisa langsung digunakan karena controller Anda mendukung plain-text fallback
INSERT INTO users (username, email, password, keahlian, is_admin, koin) 
VALUES ('Administrator', 'admin@gmail.com', 'admin123', 'Sistem Admin', 1, 0)
ON DUPLICATE KEY UPDATE is_admin = 1;

-- 6. Contoh Kategori Awal
INSERT IGNORE INTO categories (name, description) VALUES 
('Pendidikan', 'Kegiatan mengajar dan edukasi masyarakat'),
('Lingkungan', 'Aksi bersih-bersih dan pelestarian alam'),
('Kesehatan', 'Layanan medis dan penyuluhan kesehatan');