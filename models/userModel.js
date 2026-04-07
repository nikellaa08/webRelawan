// models/userModel.js
import { db } from '../lib/db.js'; // Sesuaikan path ke lib/db.js

/**
 * Mengambil user berdasarkan email.
 * @param {string} email - Email user yang ingin diambil.
 * @returns {object|null} - Objek user atau null jika tidak ditemukan.
 */
export async function getUserByEmail(email) {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Gagal mengambil user dengan email ${email}:`, error.message);
    throw error;
  }
}

/**
 * Mendaftarkan user baru ke database.
 * @param {object} userData - Objek yang berisi data user (e.g., { name, email, password, skills, motivation }).
 * @returns {object|null} - Objek user yang baru dibuat atau null jika gagal.
 */
export async function registerUser(userData) {
  const { name, email, password, skills, motivation } = userData;
  try {
    const [result] = await db.execute(
      'INSERT INTO users (nama_lengkap, email, password, skills, motivation) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, skills || null, motivation || null]
    );
    console.log(`User '${name}' berhasil didaftarkan dengan ID: ${result.insertId}`);
    return { id: result.insertId, name, email };
  } catch (error) {
    // Jika error karena email sudah terdaftar (duplicate entry)
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`Email ${email} sudah terdaftar.`);
      return null;
    }
    console.error('Gagal mendaftarkan user baru:', error.message);
    throw error;
  }
}
