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
