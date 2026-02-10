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