import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { db, getAllCategories, createRegistration } from './db.js';

// Import controllers
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';
import { login, register } from './controllers/authController.js';

const app = express();
const port = process.env.PORT || 3360;

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MIDDLEWARE (Urutan Penting)
// Pastikan static files di atas agar CSS/Gambar tidak pecah
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

// --- Basic Routes ---

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

// --- Auth API ---

app.post('/api/register', async (req, res) => {
    const { username, nama_lengkap, email, whatsapp, password } = req.body;
    try {
        const sql = 'INSERT INTO users (username, nama_lengkap, email, whatsapp, password) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [username, nama_lengkap, email, whatsapp, password]);
        
        req.session.message = 'Akun berhasil dibuat! Silakan login.';
        res.redirect('/login');
    } catch (err) {
        console.error('DETAIL ERROR MYSQL:', err.sqlMessage || err.message);
        req.session.message = 'Gagal mendaftar: ' + (err.sqlMessage || err.message);
        res.redirect('/register');
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        
        if (rows.length > 0) {
            req.session.user = rows[0];
            req.session.message = `✅ Selamat datang kembali, ${rows[0].nama_lengkap}!`;
            res.redirect('/');
        } else {
            req.session.message = '❌ Username atau Password salah!';
            res.redirect('/login');
        }
    } catch (err) {
        console.error('DETAIL ERROR MYSQL:', err.sqlMessage || err.message);
        req.session.message = '⚠️ Terjadi kesalahan sistem.';
        res.redirect('/login');
    }
});

// --- Data API ---

// API Endpoints
app.post('/api/login', login);
app.post('/api/register', register);
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

// --- Page Routes ---

// Halaman Pendidikan dengan data Categories
app.get('/pendidikan', async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.render('pendidikan', { 
            categories,
            user: req.session.user || null 
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.render('pendidikan', { 
            categories: [], 
            user: req.session.user || null 
        });
    }
});

app.get('/lingkungan', (req, res) => res.render('lingkungan', { user: req.session.user || null }));
app.get('/kesehatan', (req, res) => res.render('kesehatan', { user: req.session.user || null }));
app.get('/sosial-kemanusiaan', (req, res) => res.render('sosial-kemanusiaan', { user: req.session.user || null }));

// --- Detail Pages ---
app.get('/book-detail', (req, res) => res.render('book-detail', { user: req.session.user || null }));
app.get('/pakaian-detail', (req, res) => res.render('pakaian-detail', { user: req.session.user || null }));
app.get('/pendidikan-detail', (req, res) => res.render('pendidikan-detail', { user: req.session.user || null }));
app.get('/sosial-anak-detail', (req, res) => res.render('sosial-anak-detail', { user: req.session.user || null }));

// --- Form Pages ---
app.get('/donation-book-form', (req, res) => res.render('donation-book-form', { user: req.session.user || null }));
app.get('/donation-form', (req, res) => res.render('donation-form', { user: req.session.user || null }));
app.get('/kunjungan-panti-asuhan-form', (req, res) => res.render('kunjungan-panti-asuhan-form', { user: req.session.user || null }));
app.get('/kunjungan-panti-jompo-form', (req, res) => res.render('kunjungan-panti-jompo-form', { user: req.session.user || null }));
app.get('/jadwal', (req, res) => res.render('jadwal', { user: req.session.user || null }));

app.get('/form-pendaftaran', requireAuth, (req, res) => {
    res.render('registration-form');
    req.session.message = null;
});

// --- Success Page ---
app.get('/success', (req, res) => {
    const program = req.query.program || 'Relawan';
    res.render('success', { 
        user: req.session.user || null, 
        program: program 
    });
});

// ============================================
// DYNAMIC REGISTRATION HANDLERS
// ============================================

// --- KESEHATAN ---
app.get('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'pemeriksaan-gratis': { slug: 'pemeriksaan-gratis', title: 'Pemeriksaan Kesehatan Gratis', emoji: '🩺', description: 'Bergabunglah untuk memberikan pemeriksaan kesehatan gratis bagi masyarakat kurang mampu.' },
        'donor-darah': { slug: 'donor-darah', title: 'Donor Darah Nasional', emoji: '🩸', description: 'Setetes darahmu menyelamatkan nyawa.' },
        'gizi-anak': { slug: 'gizi-anak', title: 'Sosialisasi Gizi Anak', emoji: '🍎', description: 'Edukasi orang tua tentang nutrisi untuk cegah stunting.' },
        'mental-health': { slug: 'mental-health', title: 'Support System Mental Health', emoji: '🧠', description: 'Saling mendukung untuk kesehatan jiwa yang lebih baik.' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/kesehatan');
    res.render('form-pendaftaran', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

app.post('/daftar/:program', async (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp } = req.body;
    
    const healthPrograms = {
        'pemeriksaan-gratis': { title: 'Pemeriksaan Kesehatan Gratis', time: '09:00 - 15:00 WIB', location: 'Puskesmas Desa Binaan' },
        'donor-darah': { title: 'Donor Darah Nasional', time: '08:00 - 14:00 WIB', location: 'PMI Cabang Pusat' },
        'gizi-anak': { title: 'Sosialisasi Gizi Anak', time: '10:00 - 12:00 WIB', location: 'Posyandu Melati' },
        'mental-health': { title: 'Support System Mental Health', time: '19:00 - 21:00 WIB', location: 'Zoom Meeting (Online)' }
    };
    const program = healthPrograms[programSlug];

    try {
        await createRegistration({
            program_slug: programSlug,
            fullname, email, whatsapp,
            details: req.body
        });
        res.redirect(`/kesehatan?status=success&category=kesehatan&program=${encodeURIComponent(program.title)}&time=${encodeURIComponent(program.time)}&location=${encodeURIComponent(program.location)}`);
    } catch (error) {
        req.session.message = '⚠️ Terjadi kesalahan saat menyimpan data.';
        res.redirect(`/daftar/${programSlug}`);
    }
});

// --- PENDIDIKAN ---
app.get('/daftar-pendidikan/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'donasi-perlengkapan': { slug: 'donasi-perlengkapan', title: 'Donasi Perlengkapan Sekolah', emoji: '🎒', type: 'donasi' },
        'taman-baca-keliling': { slug: 'taman-baca-keliling', title: 'Taman Baca Keliling', emoji: '🚌', type: 'multi-role' },
        'bimbingan-belajar': { slug: 'bimbingan-belajar', title: 'Bimbingan Belajar Gratis', emoji: '👩‍🏫', type: 'bimbel' },
        'renovasi-fasilitas': { slug: 'renovasi-fasilitas', title: 'Renovasi Fasilitas Pendidikan', emoji: '🏗️', type: 'multi-role' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/pendidikan');
    res.render('form-pendidikan', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

app.post('/daftar-pendidikan/:program', async (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'donasi-perlengkapan': { title: 'Donasi Perlengkapan Sekolah' },
        'taman-baca-keliling': { title: 'Taman Baca Keliling' },
        'bimbingan-belajar': { title: 'Bimbingan Belajar Gratis' },
        'renovasi-fasilitas': { title: 'Renovasi Fasilitas Pendidikan' }
    };
    const program = programs[programSlug];

    try {
        await createRegistration({
            program_slug: programSlug,
            fullname: req.body.fullname,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            details: req.body
        });
        res.redirect(`/success?program=${encodeURIComponent(program.title)}`);
    } catch (error) {
        req.session.message = '⚠️ Terjadi kesalahan.';
        res.redirect(`/daftar-pendidikan/${programSlug}`);
    }
});

// --- LINGKUNGAN ---
app.get('/daftar-lingkungan/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'tanam-mangrove': { slug: 'tanam-mangrove', title: 'Aksi Tanam Mangrove', emoji: '🌳', type: 'aksi-lapangan' },
        'clean-up-day': { slug: 'clean-up-day', title: 'Clean-Up Day', emoji: '🌊', type: 'aksi-lapangan' },
        'workshop-zero-waste': { slug: 'workshop-zero-waste', title: 'Workshop Zero Waste', emoji: '♻️', type: 'workshop' },
        'adopsi-pohon': { slug: 'adopsi-pohon', title: 'Adopsi Pohon', emoji: '🌱', type: 'adopsi' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/lingkungan');
    res.render('form-lingkungan', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

app.post('/daftar-lingkungan/:program', async (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'tanam-mangrove': { title: 'Aksi Tanam Mangrove', time: '08:00 - 12:00 WIB', location: 'Pesisir Utara, Jakarta' },
        'clean-up-day': { title: 'Clean-Up Day', time: '07:30 - 10:30 WIB', location: 'Pantai Marunda' },
        'workshop-zero-waste': { title: 'Workshop Zero Waste', time: '13:00 - 16:00 WIB', location: 'Balai Warga RW 05' },
        'adopsi-pohon': { title: 'Adopsi Pohon', time: 'Donasi Terbuka', location: 'Lahan Kritis Hutan Bogor' }
    };
    const program = programs[programSlug];

    try {
        await createRegistration({
            program_slug: programSlug,
            fullname: req.body.fullname,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            details: req.body
        });
        res.redirect(`/lingkungan?status=success&category=lingkungan&program=${encodeURIComponent(program.title)}&time=${encodeURIComponent(program.time)}&location=${encodeURIComponent(program.location)}`);
    } catch (error) {
        req.session.message = '⚠️ Terjadi kesalahan.';
        res.redirect(`/daftar-lingkungan/${programSlug}`);
    }
});

// --- SOSIAL ---
app.get('/daftar-sosial/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'donasi-pakaian': { slug: 'donasi-pakaian', title: 'Donasi Pakaian', emoji: '👕', type: 'donasi-pakaian' },
        'donasi-buku': { slug: 'donasi-buku', title: 'Donasi Buku', emoji: '📚', type: 'donasi-buku' },
        'kunjungan-panti-asuhan': { slug: 'kunjungan-panti-asuhan', title: 'Kunjungan Panti Asuhan', emoji: '🏠', type: 'kunjungan-panti-asuhan' },
        'kunjungan-panti-jompo': { slug: 'kunjungan-panti-jompo', title: 'Kunjungan Panti Jompo', emoji: '👴', type: 'kunjungan-panti-jompo' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/sosial-kemanusiaan');
    res.render('form-sosial', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

app.post('/daftar-sosial/:program', async (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'donasi-pakaian': { title: 'Donasi Pakaian' },
        'donasi-buku': { title: 'Donasi Buku' },
        'kunjungan-panti-asuhan': { title: 'Kunjungan Panti Asuhan' },
        'kunjungan-panti-jompo': { title: 'Kunjungan Panti Jompo' }
    };
    const program = programs[programSlug];

    try {
        await createRegistration({
            program_slug: programSlug,
            fullname: req.body.fullname,
            email: req.body.email,
            whatsapp: req.body.whatsapp,
            details: req.body
        });
        res.redirect(`/success?program=${encodeURIComponent(program.title)}`);
    } catch (error) {
        req.session.message = '⚠️ Terjadi kesalahan.';
        res.redirect(`/daftar-sosial/${programSlug}`);
    }
});

// ============================================
// ROUTES FITUR TIM & ADMIN
// ============================================

// Route logout

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log('❌ Gagal Logout:', err);
        res.redirect('/');
    });
});

// Pendaftaran Kegiatan Baru (Fitur Admin/Tim)
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

// Handle Donasi Perlengkapan (Special Case)
app.post('/daftar-donasi', async (req, res) => {
    const { nama_lengkap, email, nomor_whatsapp, jenis_barang, jumlah_barang, metode_pengiriman } = req.body;
    try {
        await db.execute(
            'INSERT INTO donasi_perlengkapan (nama_lengkap, email, nomor_whatsapp, jenis_barang, jumlah_barang, metode_pengiriman) VALUES (?, ?, ?, ?, ?, ?)',
            [nama_lengkap, email, nomor_whatsapp, jenis_barang, jumlah_barang, metode_pengiriman]
        );
        res.redirect('/success?program=donasi-perlengkapan');
    } catch (error) {
        console.error('❌ Gagal menyimpan data donasi:', error.message);
        res.status(500).send('Terjadi kesalahan pada server saat menyimpan data pendaftaran.');
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});

export default app;
