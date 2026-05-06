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
    res.render('index');
    req.session.message = null; // Clear message after render
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

// Auth Routes
app.post('/auth/register', async (req, res) => {
    const { username, nama_lengkap, email, whatsapp, password } = req.body;
    try {
        await db.execute(
            'INSERT INTO users (username, nama_lengkap, email, whatsapp, password) VALUES (?, ?, ?, ?, ?)',
            [username, nama_lengkap, email, whatsapp, password]
        );
        req.session.message = 'Pendaftaran berhasil! Silakan login.';
        res.redirect('/');
    } catch (err) {
        console.log('❌ Gagal Daftar:', err);
        req.session.message = 'Gagal mendaftar. Silakan coba lagi.';
        res.redirect('/register');
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            req.session.user = {
                id: user.id,
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                whatsapp: user.whatsapp
            };
            req.session.message = `Selamat datang kembali, ${user.nama_lengkap}!`;
            res.redirect('/');
        } else {
            req.session.message = 'Email atau password salah.';
            res.redirect('/login');
        }
    } catch (err) {
        console.log('❌ Gagal Login:', err);
        req.session.message = 'Terjadi kesalahan saat login.';
        res.redirect('/login');
    }
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

app.post('/daftar/:program', async (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp } = req.body;
    try {
        await createRegistration({
            user_id: req.session.user ? req.session.user.id : null,
            program_slug: programSlug,
            fullname,
            email,
            whatsapp,
            details: req.body
        });
        res.redirect(`/success?program=${encodeURIComponent(programSlug)}`);
    } catch (err) {
        console.error('Error pendaftaran:', err);
        res.redirect(`/daftar/${programSlug}`);
    }
});

// Handle pendaftaran umum
app.post('/daftar', async (req, res) => {
    const { program_name, fullname, email, whatsapp } = req.body;
    try {
        await createRegistration({
            user_id: req.session.user ? req.session.user.id : null,
            program_slug: program_name || 'Umum',
            fullname,
            email,
            whatsapp,
            details: req.body
        });
        res.redirect(`/success?program=${encodeURIComponent(program_name || 'Umum')}`);
    } catch (error) {
        req.session.message = '⚠️ Terjadi kesalahan saat menyimpan data.';
        res.redirect('/form-pendaftaran');
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

export default app;
