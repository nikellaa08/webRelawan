// lib/db.js
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'relawan_nusantara',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// AUTO-INITIALIZATION: Create tables if they don't exist
const initDb = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected and initializing...');

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        keahlian TEXT,
        is_admin INT DEFAULT 0,
        koin INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure is_admin column exists for existing tables
    try {
      await connection.query('ALTER TABLE users ADD COLUMN is_admin INT DEFAULT 0');
    } catch (e) {}

    // Create events table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        description TEXT,
        location VARCHAR(255),
        reward_koin INT DEFAULT 10,
        date DATE
      )
    `);

    // Create categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    connection.release();
    console.log('✅ Database tables verified/created successfully.');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
};

initDb();