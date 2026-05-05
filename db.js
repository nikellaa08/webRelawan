import mysql from 'mysql2';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'web_relawan', // Sudah sesuai dengan gambar phpMyAdmin kamu
  port:     3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();

// Fungsi untuk mengambil data kategori (sesuai tabel 'categories' di gambar)
export const getAllCategories = async () => {
  const [rows] = await db.query('SELECT * FROM categories');
  return rows;
};

// Fungsi untuk mengambil data program/event (sesuai tabel 'programs' di gambar)
export const getAllEvents = async () => {
  const [rows] = await db.query('SELECT * FROM programs'); 
  return rows;
};

// Kamu juga bisa tambah fungsi untuk tabel lain, misalnya missions atau rewards
export const getAllMissions = async () => {
  const [rows] = await db.query('SELECT * FROM missions');
  return rows;
};

export default db;