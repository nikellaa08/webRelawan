// controllers/authController.js

import { getUserByEmail, registerUser } from '../models/userModel.js';

/**
 * Fungsi untuk menangani proses login.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validasi input
  if (!email || !password) {
    req.session.message = '⚠️ Email dan password harus diisi.';
    return res.redirect('/login');
  }

  try {
    // 2. Cek email di tabel users
    const user = await getUserByEmail(email);

    // Jika email TIDAK ditemukan di database
    if (!user) {
      req.session.message = '❌ Email belum terdaftar. Silakan daftar terlebih dahulu.';
      return res.redirect('/registration-form');
    }

    // 3. Verifikasi password - bandingkan langsung (plain text)
    if (password !== user.password) {
      req.session.message = '❌ Password yang Anda masukkan salah.';
      return res.redirect('/login');
    }

    // 4. Jika berhasil, set session.user dengan data dari database
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.nama_lengkap || user.name || email.split('@')[0]
    };

    req.session.message = `✅ Selamat datang kembali, ${req.session.user.name}!`;

    // 5. Redirect ke halaman utama setelah login sukses
    res.redirect('/');

  } catch (error) {
    console.error('❌ Error saat proses login:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server saat login.';
    res.redirect('/login');
  }
};

/**
 * Fungsi untuk menangani proses registrasi.
 * @param {object} req - Objek request Express.
 * @param {object} res - Objek response Express.
 */
export const register = async (req, res) => {
  const { fullname, email, password, skills, motivation } = req.body;

  // 1. Validasi input
  if (!fullname || !email || !password) {
    req.session.message = '⚠️ Nama lengkap, email, dan password harus diisi.';
    return res.redirect('/registration-form');
  }

  // 2. Validasi password minimal 6 karakter
  if (password.length < 6) {
    req.session.message = '⚠️ Password minimal 6 karakter.';
    return res.redirect('/registration-form');
  }

  try {
    // 3. Cek apakah email sudah terdaftar
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      req.session.message = '⚠️ Email sudah terdaftar. Silakan gunakan email lain atau login.';
      return res.redirect('/registration-form');
    }

    // 4. Daftarkan user baru ke database
    const newUser = await registerUser({
      name: fullname,
      email,
      password,
      skills: skills || null,
      motivation: motivation || null
    });

    if (!newUser) {
      req.session.message = '⚠️ Gagal mendaftarkan akun. Silakan coba lagi.';
      return res.redirect('/registration-form');
    }

    // 5. Set session user
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    req.session.message = `✅ Pendaftaran berhasil! Selamat datang, ${newUser.name}!`;
    console.log(`✅ User baru terdaftar: ${fullname} (${email})`);

    // 6. Redirect ke halaman login
    res.redirect('/login');

  } catch (error) {
    console.error('❌ Error saat proses registrasi:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server saat pendaftaran.';
    res.redirect('/registration-form');
  }
};
