-- Database: relawan_nusantara

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  skills TEXT,
  motivation TEXT,
  koin INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel events
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  date DATE,
  description TEXT,
  category_id INT,
  reward_koin INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Insert kategori default
INSERT IGNORE INTO categories (name, description) VALUES
('Pendidikan', 'Program relawan di bidang pendidikan'),
('Lingkungan', 'Program relawan di bidang lingkungan hidup'),
('Kesehatan', 'Program relawan di bidang kesehatan'),
('Sosial', 'Program relawan di bidang sosial kemanusiaan');

ALTER TABLE users ADD COLUMN koin INT DEFAULT 0;
ALTER TABLE events ADD COLUMN reward_koin INT DEFAULT 50;