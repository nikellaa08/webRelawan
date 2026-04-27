// controllers/adminController.js
import { db } from '../lib/db.js';

// Mock data untuk demo jika database tidak tersedia
const mockStats = {
  users: 25,
  events: 8,
  donations: 12,
  categories: 4
};

const mockUsers = [
  { id: 1, nama_lengkap: 'Ahmad Rahman', email: 'ahmad@example.com', skills: 'Pengajaran, IT', koin: 150, created_at: '2024-01-15T10:00:00Z' },
  { id: 2, nama_lengkap: 'Siti Nurhaliza', email: 'siti@example.com', skills: 'Kesehatan, Sosial', koin: 200, created_at: '2024-02-20T14:30:00Z' },
  { id: 3, nama_lengkap: 'Budi Santoso', email: 'budi@example.com', skills: 'Lingkungan, Olahraga', koin: 75, created_at: '2024-03-10T09:15:00Z' }
];

const mockEvents = [
  { id: 1, name: 'Donor Darah Nasional', location: 'Jakarta', date: '2024-05-15', description: 'Program donor darah rutin', category: 'Kesehatan', reward_koin: 50, created_at: '2024-04-01T08:00:00Z' },
  { id: 2, name: 'Clean Up Day', location: 'Pantai Ancol', date: '2024-06-20', description: 'Bersihkan pantai dari sampah', category: 'Lingkungan', reward_koin: 75, created_at: '2024-05-15T12:00:00Z' }
];

const mockCategories = [
  { id: 1, name: 'Pendidikan', description: 'Program relawan di bidang pendidikan', created_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Lingkungan', description: 'Program relawan di bidang lingkungan hidup', created_at: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Kesehatan', description: 'Program relawan di bidang kesehatan', created_at: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Sosial', description: 'Program relawan di bidang sosial kemanusiaan', created_at: '2024-01-01T00:00:00Z' }
];

// Helper function untuk cek koneksi database
async function isDbConnected() {
  try {
    await db.execute('SELECT 1');
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
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_admin = 1',
      [email]
    );

    if (rows.length === 0) {
      req.session.message = '❌ Email tidak terdaftar sebagai admin.';
      return res.redirect('/admin/login');
    }

    const admin = rows[0];

    if (password !== admin.password) {
      req.session.message = '❌ Password salah.';
      return res.redirect('/admin/login');
    }

    req.session.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.nama_lengkap || admin.name || email.split('@')[0]
    };

    req.session.message = `✅ Selamat datang kembali, Admin ${req.session.admin.name}!`;
    res.redirect('/admin/dashboard');

  } catch (error) {
    console.error('Error saat admin login:', error.message);
    req.session.message = '⚠️ Terjadi kesalahan server.';
    res.redirect('/admin/login');
  }
};

// GET DASHBOARD DATA
export const getDashboard = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    let stats = mockStats;

    if (dbConnected) {
      // Total Users
      const [userCount] = await db.execute('SELECT COUNT(*) as total FROM users WHERE is_admin = 0');
      
      // Total Events
      const [eventCount] = await db.execute('SELECT COUNT(*) as total FROM events');
      
      // Total Donations (jika ada tabel donations)
      let donationCount = [{ total: 0 }];
      try {
        donationCount = await db.execute('SELECT COUNT(*) as total FROM donations');
      } catch (e) {
        // Tabel mungkin belum ada
      }
      
      // Total Categories
      const [categoryCount] = await db.execute('SELECT COUNT(*) as total FROM categories');
      
      stats = {
        users: userCount[0]?.total || 0,
        events: eventCount[0]?.total || 0,
        donations: donationCount[0]?.total || 0,
        categories: categoryCount[0]?.total || 0
      };
    }

    res.render('admin/dashboard', { admin: req.session.admin, stats, dbConnected });
  } catch (error) {
    console.error('Error loading dashboard:', error.message);
    res.render('admin/dashboard', { admin: req.session.admin, stats: mockStats, dbConnected: false, message: 'Database tidak tersedia, menampilkan data demo' });
  }
};

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    let users = mockUsers;

    if (dbConnected) {
      const [rows] = await db.execute('SELECT id, nama_lengkap, email, skills, koin, created_at FROM users WHERE is_admin = 0 ORDER BY created_at DESC');
      users = rows;
    }

    res.render('admin/users', { admin: req.session.admin, users, dbConnected });
  } catch (error) {
    console.error('Error loading users:', error.message);
    res.render('admin/users', { admin: req.session.admin, users: mockUsers, dbConnected: false, message: 'Database tidak tersedia, menampilkan data demo' });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM users WHERE id = ? AND is_admin = 0', [id]);
    req.session.message = '✅ Pengguna berhasil dihapus.';
  } catch (error) {
    console.error('Error deleting user:', error.message);
    req.session.message = '❌ Gagal menghapus pengguna.';
  }
  res.redirect('/admin/users');
};

// GET ALL EVENTS
export const getEvents = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    let events = mockEvents;

    if (dbConnected) {
      const [rows] = await db.execute(`
        SELECT e.id, e.name, e.location, e.date, e.description, c.name as category, e.reward_koin, e.created_at 
        FROM events e 
        LEFT JOIN categories c ON e.category_id = c.id 
        ORDER BY e.created_at DESC
      `);
      events = rows;
    }

    res.render('admin/events', { admin: req.session.admin, events, dbConnected });
  } catch (error) {
    console.error('Error loading events:', error.message);
    res.render('admin/events', { admin: req.session.admin, events: mockEvents, dbConnected: false, message: 'Database tidak tersedia, menampilkan data demo' });
  }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM events WHERE id = ?', [id]);
    req.session.message = '✅ Event berhasil dihapus.';
  } catch (error) {
    console.error('Error deleting event:', error.message);
    req.session.message = '❌ Gagal menghapus event.';
  }
  res.redirect('/admin/events');
};

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const dbConnected = await isDbConnected();
    let categories = mockCategories;

    if (dbConnected) {
      const [rows] = await db.execute('SELECT id, name, description, created_at FROM categories ORDER BY created_at DESC');
      categories = rows;
    }

    res.render('admin/categories', { admin: req.session.admin, categories, dbConnected });
  } catch (error) {
    console.error('Error loading categories:', error.message);
    res.render('admin/categories', { admin: req.session.admin, categories: mockCategories, dbConnected: false, message: 'Database tidak tersedia, menampilkan data demo' });
  }
};

// ADD CATEGORY
export const addCategory = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    req.session.message = '⚠️ Nama kategori harus diisi.';
    return res.redirect('/admin/categories');
  }

  try {
    await db.execute('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
    req.session.message = '✅ Kategori berhasil ditambahkan.';
  } catch (error) {
    console.error('Error adding category:', error.message);
    req.session.message = '❌ Gagal menambahkan kategori.';
  }
  res.redirect('/admin/categories');
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    req.session.message = '✅ Kategori berhasil dihapus.';
  } catch (error) {
    console.error('Error deleting category:', error.message);
    req.session.message = '❌ Gagal menghapus kategori.';
  }
  res.redirect('/admin/categories');
};

// ADMIN LOGOUT
export const adminLogout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
};
