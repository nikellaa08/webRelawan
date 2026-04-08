// controllers/authController.js

import { getUserByEmail } from '../models/userModel.js';

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
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // 3. Verifikasi password - bandingkan langsung (plain text) tanpa bcrypt
    if (password !== user.password) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    // 4. Jika berhasil, set session.user dengan data dari database
    // Akses session melalui req.session atau req.app.locals.session
    // Karena menggunakan in-memory session di app.js, kita simpan ke app locals
    req.app.locals.session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.nama_lengkap || user.name
      },
      message: null
    };

    // 5. Redirect ke halaman utama setelah login sukses
    res.redirect('/');

  } catch (error) {
    console.error('Error saat proses login:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan server saat login.', error: error.message });
  }
};
