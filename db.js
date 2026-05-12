import mysql from 'mysql2/promise';
import 'dotenv/config';

// 1. DATABASE CONFIGURATION & POOL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'web_relawan',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Alias for easier usage
const db = pool;

// 2. TEST DATABASE CONNECTION
async function testDbConnection() {
    try {
        const connection = await db.getConnection();
        console.log('✅ Koneksi database XAMPP berhasil!');
        connection.release();
    } catch (error) {
        console.error('❌ Koneksi database gagal:', error.message);
    }
}
testDbConnection();

// 3. DATABASE FUNCTIONS
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
        const [rows] = await db.query('SELECT * FROM events ORDER BY date DESC');
        return rows;
    } catch (error) {
        console.error('Gagal mengambil events:', error.message);
        throw error;
    }
};

export const createRegistration = async (regData) => {
    const { program_slug, fullname, email, whatsapp, details } = regData;
    try {
        const [result] = await db.execute(
            'INSERT INTO registrations (program_slug, fullname, email, whatsapp, details) VALUES (?, ?, ?, ?, ?)',
            [program_slug, fullname, email, whatsapp, JSON.stringify(details)]
        );
        return result.insertId;
    } catch (error) {
        console.error('Gagal pendaftaran:', error.message);
        throw error;
    }
};

// 4. EXPORTS
export { db };
export default db;
