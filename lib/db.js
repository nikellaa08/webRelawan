// lib/db.js
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'web_relawan', // Sesuai permintaan lo tadi
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;