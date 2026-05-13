// models/userModel.js
import { db } from '../lib/db.js'; // Sesuaikan path ke lib/db.js
import bcrypt from 'bcrypt';

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
 * Mendaftarkan user baru ke database dengan password hashing.
 * @param {object} userData - Objek yang berisi data user.
 * @returns {object|null} - Objek user yang baru dibuat atau null jika gagal.
 */
export async function registerUser(userData) {
  const { username, name, email, whatsapp, password } = userData;
  try {
    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await db.execute(
      'INSERT INTO users (username, fullname, email, whatsapp, password) VALUES (?, ?, ?, ?, ?)',
      [username, name, email, whatsapp || null, hashedPassword]
    );
    
    console.log(`✅ User '${username}' berhasil didaftarkan dengan ID: ${result.insertId}`);
    return { id: result.insertId, username, name, email, whatsapp };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`⚠️ Email atau Username sudah terdaftar.`);
      return null;
    }
    console.error('❌ DATABASE ERROR (registerUser):', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
}
