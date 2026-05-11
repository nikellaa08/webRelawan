import mysql from 'mysql2';

// 1. Konfigurasi Database
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'res_py', // Updated as per user instruction
  port:     3306,
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();


async function testDbConnection() {
  let connection;
  try {

    connection = await pool.getConnection();
    console.log('✅ Koneksi ke database berhasil!');

    // Karena kita pakai pool.promise(), kita gunakan db.getConnection()
    const connection = await db.getConnection(); 
    console.log('✅ Koneksi ke database berhasil!');
    connection.release(); 

  } catch (error) {
    console.error('❌ Koneksi ke database gagal:', error.message);
  } finally {
    if (connection) connection.release();
  }
}
testDbConnection();

// 3. Fungsi-Fungsi CRUD (Gabungan)

export const getAllCategories = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  } catch (error) {
    console.error('Gagal mengambil kategori:', error.message);
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, c.name AS category_name 
      FROM events e 
      LEFT JOIN categories c ON e.category_id = c.id 
      ORDER BY e.date DESC
    `);
    return rows;
  } catch (error) {
    console.error('Gagal mengambil events:', error.message);
    throw error;
  }
};

export const createRegistration = async (regData) => {
  const { user_id, program_slug, fullname, email, whatsapp, details } = regData;
  try {
    const [result] = await db.execute(
      'INSERT INTOx` registrations (user_id, program_slug, fullname, email, whatsapp, details) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || null, program_slug, fullname, email, whatsapp, JSON.stringify(details)]
    );
    return result.insertId;
  } catch (error) {
    console.error('Gagal pendaftaran:', error.message);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

// Ekspor default agar tidak error
export { db, pool };
export default db;