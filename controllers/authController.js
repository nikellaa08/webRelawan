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
    req.session.message = 'Email dan password harus diisi.';
    return res.redirect('/login');
  }

  try {
    // 2. Cek email di tabel users
    const user = await getUserByEmail(email);
    if (!user) {
      req.session.message = 'Email atau password salah.';
      return res.redirect('/login');
    }

    // 3. Verifikasi password - bandingkan langsung (plain text)
    if (password !== user.password) {
      req.session.message = 'Email atau password salah.';
      return res.redirect('/login');
    }

    // 4. Jika berhasil, set session.user dengan data dari database
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.nama_lengkap || user.name || email.split('@')[0]
    };

    req.session.message = `Selamat datang kembali, ${req.session.user.name}!`;

    // 5. Redirect ke halaman utama setelah login sukses
    res.redirect('/');

  } catch (error) {
    console.error('Error saat proses login:', error.message);
    req.session.message = 'Terjadi kesalahan server saat login.';
    res.redirect('/login');
  }
};
