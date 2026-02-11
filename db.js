// db.js

const mysql = require('mysql2/promise');

// Konfigurasi koneksi database
const dbConfig = {
  host: 'localhost', // Biasanya 'localhost' untuk XAMPP
  user: 'root',      // User default XAMPP
  password: '',      // Password default XAMPP (kosong)
  database: 'relawan_nusantara',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Buat connection pool untuk performa yang lebih baik
const pool = mysql.createPool(dbConfig);

// Fungsi untuk menguji koneksi database
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Koneksi ke database berhasil!');
    connection.release(); // Lepaskan koneksi kembali ke pool
  } catch (error) {
    console.error('Koneksi ke database gagal:', error.message);
    // process.exit(1); // Nonaktifkan ini agar aplikasi tetap berjalan meski tanpa koneksi di awal pengembangan
  }
}

// Panggil fungsi testDbConnection saat aplikasi dimulai
testDbConnection();

// --- Fungsi CRUD untuk tabel 'events' ---

/**
 * Membuat event baru di database.
 * @param {object} eventData - Objek yang berisi data event (e.g., { name, location, date, description }).
 * @returns {object|null} - Objek event yang baru dibuat atau null jika gagal.
 */
async function createEvent(eventData) {
  const { name, location, date, description } = eventData;
  try {
    const [result] = await pool.execute(
      'INSERT INTO events (name, location, date, description) VALUES (?, ?, ?, ?)',
      [name, location, date, description]
    );
    console.log(`Event '${name}' berhasil ditambahkan dengan ID: ${result.insertId}`);
    return { id: result.insertId, ...eventData };
  } catch (error) {
    console.error('Gagal membuat event baru:', error.message);
    throw error;
  }
}

/**
 * Mengambil semua event dari database, termasuk nama kategori.
 * @returns {Array<object>} - Array objek event.
 */
async function getAllEvents() {
  try {
    const [rows] = await pool.execute(
      `SELECT
        e.id,
        e.name,
        e.location,
        e.date,
        e.description,
        e.created_at,
        e.category_id,
        c.name AS category_name
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       ORDER BY e.date DESC`
    );
    console.log('Semua event berhasil diambil.');
    return rows;
  } catch (error) {
    console.error('Gagal mengambil semua event:', error.message);
    throw error;
  }
}

/**
 * Mengambil event berdasarkan ID.
 * @param {number} id - ID event yang ingin diambil.
 * @returns {object|null} - Objek event atau null jika tidak ditemukan.
 */
async function getEventById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        e.id,
        e.name,
        e.location,
        e.date,
        e.description,
        e.created_at,
        e.category_id,
        c.name AS category_name
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      console.log(`Event dengan ID ${id} tidak ditemukan.`);
      return null;
    }
    console.log(`Event dengan ID ${id} berhasil diambil.`);
    return rows[0];
  } catch (error) {
    console.error(`Gagal mengambil event dengan ID ${id}:`, error.message);
    throw error;
  }
}

/**
 * Memperbarui event berdasarkan ID.
 * @param {number} id - ID event yang ingin diperbarui.
 * @param {object} eventData - Objek yang berisi data event yang akan diperbarui.
 * @returns {boolean} - True jika berhasil diperbarui, false jika tidak.
 */
async function updateEvent(id, eventData) {
  // Asumsi eventData juga bisa punya category_id
  const { name, location, date, description, category_id } = eventData;
  try {
    const [result] = await pool.execute(
      'UPDATE events SET name = ?, location = ?, date = ?, description = ?, category_id = ? WHERE id = ?',
      [name, location, date, description, category_id, id]
    );
    if (result.affectedRows === 0) {
      console.log(`Event dengan ID ${id} tidak ditemukan untuk diperbarui.`);
      return false;
    }
    console.log(`Event dengan ID ${id} berhasil diperbarui.`);
    return true;
  } catch (error) {
    console.error(`Gagal memperbarui event dengan ID ${id}:`, error.message);
    throw error;
  }
}

/**
 * Menghapus event berdasarkan ID.
 * @param {number} id - ID event yang ingin dihapus.
 * @returns {boolean} - True jika berhasil dihapus, false jika tidak.
 */
async function deleteEvent(id) {
  try {
    const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      console.log(`Event dengan ID ${id} tidak ditemukan untuk dihapus.`);
      return false;
    }
    console.log(`Event dengan ID ${id} berhasil dihapus.`);
    return true;
  } catch (error) {
    console.error(`Gagal menghapus event dengan ID ${id}:`, error.message);
    throw error;
  }
}

// --- Fungsi untuk tabel 'users' ---

/**
 * Mengambil user berdasarkan email.
 * @param {string} email - Email user yang ingin diambil.
 * @returns {object|null} - Objek user atau null jika tidak ditemukan.
 */
async function getUserByEmail(email) {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Gagal mengambil user dengan email ${email}:`, error.message);
    throw error;
  }
}

// --- Fungsi untuk tabel 'categories' ---

/**
 * Mengambil semua kategori dari database.
 * @returns {Array<object>} - Array objek kategori.
 */
async function getAllCategories() {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
    console.log('Semua kategori berhasil diambil.');
    return rows;
  } catch (error) {
    console.error('Gagal mengambil semua kategori:', error.message);
    throw error;
  }
}


// Ekspor fungsi-fungsi agar bisa digunakan di file lain
module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUserByEmail,
  getAllCategories, // Export fungsi baru ini
  pool
};
