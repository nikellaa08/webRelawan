import bcrypt from 'bcrypt';
import { db } from '../lib/db.js';

// Helper function untuk cek koneksi database
async function isDbConnected() {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

// ADMIN LOGIN
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.session.message = '⚠️ Email dan password harus diisi.';
    return res.redirect('/admin/login');
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      req.session.message = '❌ Akun tidak ditemukan.';
      return res.redirect('/admin/login');
    }

    const admin = rows[0];

    // Cek apakah user adalah admin
    if (parseInt(admin.is_admin) !== 1) {
        req.session.message = '❌ Akses ditolak. Akun Anda bukan admin.';
        return res.redirect('/admin/login');
    }

    // Try bcrypt first, fallback to plain text
    let match = false;
    try {
        match = await bcrypt.compare(password, admin.password);
    } catch (e) {
        match = false;
    }

    if (!match && password === admin.password) {
        match = true;
    }

    if (!match) {
      req.session.message = '❌ Password admin salah.';
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.username, // Menggunakan username sesuai db.sql
      is_admin: 1
    };
    req.session.user = null;

    // Tambahkan session.save() untuk mencegah error 'mental' saat redirect
    req.session.save(() => {
        req.session.message = `✅ Selamat datang kembali, Admin ${admin.username}!`;
        res.redirect('/admin/dashboard');
    });

  } catch (error) {
    console.error('Admin Login Error:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server.';
    res.redirect('/admin/login');
  }
};

// GET DASHBOARD DATA
export const getDashboard = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    let stats = { users: 0, events: 0, donations: 0, categories: 0 };

    if (dbConnected) {
      const [userCount] = await db.query('SELECT COUNT(*) as total FROM users WHERE is_admin = 0');
      const [eventCount] = await db.query('SELECT COUNT(*) as total FROM events');
      const [categoryCount] = await db.query('SELECT COUNT(*) as total FROM categories');
      
      stats = {
        users: userCount[0]?.total || 0,
        events: eventCount[0]?.total || 0,
        donations: 0, // Placeholder
        categories: categoryCount[0]?.total || 0
      };
    }

    res.render('admin/dashboard', { admin: req.session.admin, stats, dbConnected });
  } catch (error) {
    console.error('Error loading dashboard:', error.message);
    res.render('admin/dashboard', { admin: req.session.admin, stats: { users: 0, events: 0, donations: 0, categories: 0 }, dbConnected: false });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    const [rows] = await db.query('SELECT id, username, email, keahlian, koin, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC');
    res.render('admin/users', { admin: req.session.admin, users: rows, dbConnected, message: req.session.message || null });
    req.session.message = null;
  } catch (error) {
    console.error('Error loading users:', error.message);
    res.render('admin/users', { admin: req.session.admin, users: [], dbConnected: false, message: 'Gagal memuat data pengguna.' });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ? AND is_admin = 0', [id]);
    req.session.message = '✅ Pengguna berhasil dihapus.';
  } catch (error) {
    req.session.message = '❌ Gagal menghapus pengguna.';
  }
  res.redirect('/admin/users');
};

// GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    const [rows] = await db.query(`
      SELECT id, title, description, reward_koin, date FROM events ORDER BY id DESC
    `);
    res.render('admin/events', { admin: req.session.admin, events: rows, dbConnected, message: req.session.message || null });
    req.session.message = null;
  } catch (error) {
    res.render('admin/events', { admin: req.session.admin, events: [], dbConnected: false, message: 'Gagal memuat data event.' });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM events WHERE id = ?', [id]);
    req.session.message = '✅ Event berhasil dihapus.';
  } catch (error) {
    req.session.message = '❌ Gagal menghapus event.';
  }
  res.redirect('/admin/events');
};

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, description, created_at FROM categories ORDER BY created_at DESC');
    res.render('admin/categories', { admin: req.session.admin, categories: rows, dbConnected: true });
  } catch (error) {
    res.render('admin/categories', { admin: req.session.admin, categories: [], dbConnected: false });
  }
};

// ADD CATEGORY
export const addCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.redirect('/admin/categories');
  try {
    await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
    req.session.message = '✅ Kategori berhasil ditambahkan.';
  } catch (error) {
    req.session.message = '❌ Gagal menambahkan kategori.';
  }
  res.redirect('/admin/categories');
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    req.session.message = '✅ Kategori berhasil dihapus.';
  } catch (error) {
    req.session.message = '❌ Gagal menghapus kategori.';
  }
  res.redirect('/admin/categories');
};

// ADMIN LOGOUT
export const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.clearCookie('connect.sid', { path: '/' });
    return res.redirect('/admin/login');
  });
};
