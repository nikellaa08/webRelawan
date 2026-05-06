// controllers/authController.js

import { getUserByEmail, registerUser } from '../models/userModel.js';

/**
 * Fungsi untuk menangani proses login.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.message = '⚠️ Email dan password harus diisi.';
    return res.redirect('/login');
  }

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      req.session.message = '❌ Email belum terdaftar. Silakan daftar terlebih dahulu.';
      return res.redirect('/register');
    }

    if (password !== user.password) {
      req.session.message = '❌ Password yang Anda masukkan salah.';
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.nama_lengkap,
      whatsapp: user.whatsapp
    };

    req.session.message = `✅ Selamat datang kembali, ${user.nama_lengkap}!`;
    res.redirect('/');

  } catch (error) {
    console.error('❌ Error saat proses login:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server saat login.';
    res.redirect('/login');
  }
};

/**
 * Fungsi untuk menangani proses registrasi.
 */
export const register = async (req, res) => {
  const { fullname, email, whatsapp, username, password } = req.body;

  if (!fullname || !email || !whatsapp || !username || !password) {
    req.session.message = '⚠️ Semua field wajib diisi (Username, Nama Lengkap, Email, WhatsApp, Password).';
    return res.redirect('/register');
  }

  if (password.length < 6) {
    req.session.message = '⚠️ Password minimal 6 karakter.';
    return res.redirect('/register');
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      req.session.message = '⚠️ Email sudah terdaftar.';
      return res.redirect('/register');
    }

    const newUser = await registerUser({
      username,
      name: fullname,
      email,
      whatsapp,
      password
    });

    if (!newUser) {
      req.session.message = '⚠️ Gagal mendaftarkan akun. Username atau Email mungkin sudah digunakan.';
      return res.redirect('/register');
    }

    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      whatsapp: newUser.whatsapp
    };

    req.session.message = `✅ Pendaftaran berhasil! Selamat datang, ${newUser.name}.`;
    res.redirect('/');

  } catch (error) {
    console.error('❌ Error saat proses registrasi:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server saat pendaftaran.';
    res.redirect('/register');
  }
};
