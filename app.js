import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { db, createRegistration } from './db.js';

// Import controllers
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MIDDLEWARE (Urutan Penting)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'relawan-nusantara-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
    }
}));

// Global locals middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    next();
});

// Middleware untuk proteksi halaman yang memerlukan login
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.message = 'Silakan login terlebih dahulu untuk mengakses halaman ini.';
        return res.redirect('/login');
    }
    next();
};

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Routes ---

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null });
    req.session.message = null; // Clear message after render
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log('❌ Gagal Logout:', err);
        res.redirect('/');
    });
});

// --- Page Routes ---
app.get('/form-pendaftaran', requireAuth, (req, res) => {
    res.render('registration-form');
    req.session.message = null;
});

// Route Pendaftaran Kegiatan Baru
app.get('/daftar-kegiatan/:program', requireAuth, (req, res) => {
    const programSlug = req.params.program;
    const programTitles = {
        'donasi-perlengkapan': 'Donasi Perlengkapan Sekolah',
        'taman-baca-keliling': 'Taman Baca Keliling',
        'bimbingan-belajar': 'Bimbingan Belajar Gratis',
        'renovasi-fasilitas': 'Renovasi Fasilitas Pendidikan',
        'donasi-pakaian': 'Donasi Pakaian',
        'donasi-buku': 'Donasi Buku',
        'kunjungan-panti-asuhan': 'Kunjungan Panti Asuhan',
        'kunjungan-panti-jompo': 'Kunjungan Panti Jompo',
        'bersih-pantai': 'Aksi Bersih Pantai',
        'tanam-pohon': 'Penanaman Seribu Pohon',
        'daur-ulang': 'Workshop Daur Ulang'
    };
    const programName = programTitles[programSlug] || programSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    res.render('form-pendaftaran-baru', { programName, user: req.session.user });
});

app.post('/api/daftar-kegiatan', requireAuth, async (req, res) => {
    const { program_name, nama, email, whatsapp, motivasi, jadwal } = req.body;
    try {
        const sql = 'INSERT INTO pendaftaran_kegiatan (user_id, program_name, nama, email, whatsapp, motivasi, jadwal) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await db.query(sql, [req.session.user.id, program_name, nama, email, whatsapp, motivasi, jadwal]);
        res.json({ success: true, message: 'Pendaftaran Berhasil Dikirim!' });
    } catch (err) {
        console.error('ERROR DB:', err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan pendaftaran.' });
    }
});

app.get('/pendidikan', (req, res) => res.render('pendidikan'));
app.get('/lingkungan', (req, res) => res.render('lingkungan'));
app.get('/kesehatan', (req, res) => res.render('kesehatan'));
app.get('/sosial-kemanusiaan', (req, res) => res.render('sosial-kemanusiaan'));

// Detail Pages
app.get('/book-detail', (req, res) => res.render('book-detail'));
app.get('/pakaian-detail', (req, res) => res.render('pakaian-detail'));
app.get('/pendidikan-detail', (req, res) => res.render('pendidikan-detail'));
app.get('/sosial-anak-detail', (req, res) => res.render('sosial-anak-detail'));

// Form Pages
app.get('/donation-book-form', (req, res) => res.render('donation-book-form'));
app.get('/donation-form', (req, res) => res.render('donation-form'));
app.get('/kunjungan-panti-asuhan-form', (req, res) => res.render('kunjungan-panti-asuhan-form'));
app.get('/kunjungan-panti-jompo-form', (req, res) => res.render('kunjungan-panti-jompo-form'));
app.get('/jadwal', (req, res) => res.render('jadwal'));

// Success Page
app.get('/success', (req, res) => {
    const program = req.query.program || 'Relawan';
    res.render('success', { program: program });
});

// API Endpoints
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

// Dynamic Program Registration (Kesehatan)
app.get('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'pemeriksaan-gratis': { title: 'Pemeriksaan Kesehatan Gratis', slug: 'pemeriksaan-gratis', emoji: '🩺', description: 'Bergabunglah untuk memberikan pemeriksaan kesehatan gratis bagi masyarakat kurang mampu.' },
        'donor-darah': { title: 'Donor Darah Nasional', slug: 'donor-darah', emoji: '🩸', description: 'Setetes darahmu menyelamatkan nyawa.' },
        'gizi-anak': { title: 'Sosialisasi Gizi Anak', slug: 'gizi-anak', emoji: '🍎', description: 'Edukasi orang tua tentang nutrisi untuk cegah stunting.' },
        'mental-health': { title: 'Support System Mental Health', slug: 'mental-health', emoji: '🧠', description: 'Saling mendukung untuk kesehatan jiwa yang lebih baik.' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/kesehatan');
    res.render('form-pendaftaran', { program: program });
});

// --- Auth API Routes (Before app.listen) ---

// Route POST /api/register
app.post('/api/register', async (req, res) => {
    const { username, nama_lengkap, email, whatsapp, password } = req.body;
    try {
        const sql = 'INSERT INTO users (username, nama_lengkap, email, whatsapp, password) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [username, nama_lengkap, email, whatsapp, password]);
        
        req.session.message = 'Akun berhasil dibuat! Silakan login.';
        res.redirect('/login');
    } catch (err) {
        console.error('DETAIL ERROR MYSQL:', err.sqlMessage || err.message, err.code);
        req.session.message = 'Gagal mendaftar: ' + (err.sqlMessage || err.message);
        res.redirect('/register');
    }
});

// Route POST /api/login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        
        if (rows.length > 0) {
            req.session.user = rows[0];
            req.session.message = `Selamat datang kembali, ${rows[0].nama_lengkap}!`;
            res.redirect('/');
        } else {
            req.session.message = 'Username atau Password salah!';
            res.redirect('/login');
        }
    } catch (err) {
        console.error('DETAIL ERROR MYSQL:', err.sqlMessage || err.message, err.code);
        req.session.message = 'Terjadi kesalahan sistem.';
        res.redirect('/login');
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

export default app;