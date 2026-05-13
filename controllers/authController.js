// controllers/authController.js

import { getUserByEmail, registerUser } from '../models/userModel.js';
import bcrypt from 'bcrypt';

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

    // Bandingkan password yang dimasukkan dengan hash di database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.message = '❌ Password yang Anda masukkan salah.';
      return res.redirect('/login');
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.fullname, // Gunakan fullname sesuai database baru
      whatsapp: user.whatsapp
    };

    req.session.message = `✅ Selamat datang kembali, ${user.fullname}!`;
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
  console.log('DEBUG: Data registrasi diterima:', req.body);
  const { nama_lengkap, email, whatsapp, username, password } = req.body;

  if (!nama_lengkap || !email || !whatsapp || !username || !password) {
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
      name: nama_lengkap,
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
    console.error('❌ Error saat proses registrasi:', {
      message: error.message,
      stack: error.stack
    });
    req.session.message = '⚠️ Terjadi kesalahan server saat pendaftaran.';
    res.redirect('/register');
  }
};
