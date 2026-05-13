import bcrypt from 'bcrypt';
import { db } from '../lib/db.js';

/**
 * LOGIKA REGISTRASI (Sinkron dengan Database Terbaru)
 * Menangkap: username, email, password, keahlian, dan admin_key
 */
export const register = async (req, res) => {
    // 1. AMBIL DATA DARI REQ.BODY
    const { username, email, password, keahlian, admin_key } = req.body;

    // Validasi Dasar
    if (!username || !email || !password) {
        req.session.message = '⚠️ Username, Email, dan Password wajib diisi!';
        return res.redirect('/registration-form');
    }

    try {
        // 2. CEK EMAIL DUPLIKAT
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            req.session.message = '❌ Email ini sudah terdaftar.';
            return res.redirect('/registration-form');
        }

        // 3. LOGIKA ADMIN (Cek Secret Key)
        // Admin Key: RELAWAN2026
        const is_admin = admin_key === 'RELAWAN2026' ? 1 : 0;
        
        // 4. HASHING PASSWORD
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 5. QUERY INSERT (Pastikan kolom sesuai urutan dan nama)
        const sql = `INSERT INTO users (username, email, password, is_admin, keahlian) VALUES (?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [
            username, 
            email, 
            hashedPassword, 
            is_admin,
            keahlian || null
        ]);

        console.log(`[SUCCESS] User ${username} berhasil didaftarkan.`);

        // 6. AUTO-LOGIN (Langsung buat session setelah daftar)
        const userData = {
            id: result.insertId,
            email: email,
            name: username,
            is_admin: is_admin
        };

        if (is_admin === 1) {
            req.session.admin = userData;
            req.session.user = null;
        } else {
            req.session.user = userData;
            req.session.admin = null;
        }

        req.session.message = `✅ Selamat datang, ${username}! Pendaftaran berhasil.`;
        res.redirect('/');

    } catch (error) {
        // 7. LOG ERROR KE TERMINAL (Permintaan User)
        console.log('=========================================');
        console.log('REGISTRATION CRITICAL ERROR:');
        console.log(error); // Detail error untuk user
        console.log('=========================================');

        req.session.message = '⚠️ Terjadi kesalahan saat mendaftar. Cek terminal Anda.';
        res.redirect('/registration-form');
    }
};

/**
 * LOGIKA LOGIN
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        req.session.message = '⚠️ Harap isi email dan password.';
        return res.redirect('/login');
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            req.session.message = '❌ Akun tidak ditemukan.';
            return res.redirect('/login');
        }

        // Support bcrypt & plain-text (untuk admin awal)
        let match = false;
        try {
            match = await bcrypt.compare(password, user.password);
        } catch (e) {}
        if (!match && password === user.password) match = true;

        if (!match) {
            req.session.message = '❌ Password salah.';
            return res.redirect('/login');
        }

        // Buat Session
        const userData = {
            id: user.id,
            email: user.email,
            name: user.username,
            is_admin: parseInt(user.is_admin)
        };

        if (userData.is_admin === 1) {
            req.session.admin = userData;
            req.session.user = null;
        } else {
            req.session.user = userData;
            req.session.admin = null;
        }

        req.session.save(() => {
            req.session.message = `✅ Berhasil masuk sebagai ${userData.is_admin ? 'Admin' : 'Relawan'}.`;
            res.redirect(userData.is_admin === 1 ? '/admin/dashboard' : '/');
        });

    } catch (error) {
        console.log('LOGIN ERROR:', error);
        req.session.message = '⚠️ Terjadi kesalahan sistem.';
        res.redirect('/login');
    }
};
