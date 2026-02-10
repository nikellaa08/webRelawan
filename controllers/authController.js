// controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../models/userModel.js'; // Mengimpor dari model baru

// Untuk aplikasi nyata, SECRET KEY ini harus disimpan di environment variable
// Anda bisa menggunakan library 'dotenv' untuk memuatnya:
// import dotenv from 'dotenv';
// dotenv.config();
// const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_SECRET = 'supersecretjwtkey'; // GANTI dengan kunci rahasia yang kuat dan aman!

/**
 * Fungsi untuk menangani proses login.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password harus diisi.' });
  }

  try {
    // 2. Cek email di tabel users
    const user = await getUserByEmail(email); // Menggunakan fungsi dari userModel
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // 3. Verifikasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // 4. Jika berhasil, buat JSON Web Token (JWT)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' } // Token akan kadaluarsa dalam 1 jam
    );

    // 5. Kirim response sukses beserta data user (kecuali password) dan token
    const { password: _, ...userData } = user; // Destrukturisasi untuk mengecualikan password

    res.status(200).json({
      message: 'Login berhasil!',
      token, // Kirim token ke frontend
      user: {
        id: userData.id,
        email: userData.email,
        nama_lengkap: userData.name // Menggunakan 'name' sebagai nama_lengkap
      }
    });

  } catch (error) {
    console.error('Error saat proses login:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server saat login.', error: error.message });
  }
};
