import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';
import session from 'express-session';
import db from './db.js'; // Pastikan file db.js sudah ada export default pool;

// Import controllers
import { login, register } from './controllers/authController.js';
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';
import { 
    adminLogin, getDashboard, getUsers, deleteUser, 
    getEvents as adminGetEvents, deleteEvent, 
    getCategories as adminGetCategories, addCategory, deleteCategory, 
    adminLogout 
} from './controllers/adminController.js';
// Hapus atau komen middleware lokal yang lama (isAdminLoggedIn)
// Lalu import dari file middleware kamu:
import { checkAdmin, isAdminAlreadyLoggedIn } from './middleware/adminMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'relawan-nusantara-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// --- Global Locals (Data untuk Header & UI) ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null; 
    res.locals.session = req.session;             
    res.locals.message = req.session.message || null;
    next();
});

// --- Middleware Proteksi Admin ---
const isAdminLoggedIn = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        req.session.message = '⚠️ Silakan login sebagai admin terlebih dahulu.';
        res.redirect('/admin/login');
    }
};

// --- Routes Halaman Utama & Auth ---
app.get('/', (req, res) => {
    const user = req.session.user || null;
    const message = req.session.message || null;
    req.session.message = null;
    res.render('index', { user, message });
});

app.get(['/register', '/registration-form'], (req, res) => {
    res.render('registration-form', { message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { message: null });
});

app.post('/api/login', login);
app.post('/register', register); 
app.all('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// ============================================
// ADMIN ROUTES (DASHBOARD & CRUD)
// ============================================

// Gunakan isAdminAlreadyLoggedIn agar kalau sudah login langsung ke dashboard
app.get('/admin/login', isAdminAlreadyLoggedIn, (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;
    res.render('admin/login', { message });
});

app.post('/admin/api/login', adminLogin);

// Ganti isAdminLoggedIn dengan checkAdmin (sesuai file middleware kamu)
app.get('/admin/dashboard', checkAdmin, async (req, res) => {
    try {
        // Cek apakah tabel ada dengan query yang lebih aman atau tangani error per query
        const getStats = async () => {
            const stats = { users: 0, events: 0, categories: 0, donations: 0 };
            try {
                const [u] = await db.query("SELECT COUNT(*) as count FROM users");
                stats.users = u[0].count;
            } catch (e) { console.error("Users table missing"); }
            
            try {
                const [e] = await db.query("SELECT COUNT(*) as count FROM events");
                stats.events = e[0].count;
            } catch (e) { console.error("Events table missing"); }
            
            try {
                const [c] = await db.query("SELECT COUNT(*) as count FROM categories");
                stats.categories = c[0].count;
            } catch (e) { console.error("Categories table missing"); }
            
            try {
                const [d] = await db.query("SELECT IFNULL(SUM(koin), 0) as count FROM users");
                stats.donations = d[0].count;
            } catch (e) { console.error("Donations calculation failed"); }
            
            return stats;
        };

        const qRecentUsers = "SELECT id, nama_lengkap as username, email, koin FROM users ORDER BY id DESC LIMIT 5";
        
        const statsResult = await getStats();
        let usersResult = [];
        try {
            const [rows] = await db.query(qRecentUsers);
            usersResult = rows;
        } catch (e) { console.error("Recent users query failed"); }

        res.render('admin/dashboard', { 
            stats: statsResult, 
            users: usersResult,
            admin: req.session.admin,
            dbConnected: true,
            message: req.session.message || null 
        });
        req.session.message = null;
    } catch (err) {
        console.error("Dashboard Error:", err.message);
        res.status(500).render('admin/dashboard', {
            stats: { users: 0, events: 0, categories: 0, donations: 0 },
            users: [],
            admin: req.session.admin,
            dbConnected: false,
            message: "⚠️ Gagal memuat data lengkap. Pastikan semua tabel database sudah dibuat."
        });
    }
});

// Fitur Reward Koin (Versi Async)
app.post('/admin/users/add-koin/:id', isAdminLoggedIn, async (req, res) => {
    try {
        const amount = req.body.amount || 10;
        await db.query("UPDATE users SET koin = koin + ? WHERE id = ?", [amount, req.params.id]);
        req.session.message = '✅ Koin berhasil ditambahkan!';
        res.redirect('/admin/dashboard');
    } catch (err) {
        res.redirect('/admin/dashboard');
    }
});

// User Management
app.get('/admin/users', isAdminLoggedIn, getUsers);
app.post('/admin/users/delete/:id', isAdminLoggedIn, deleteUser);

// CRUD Events (Misi)
app.get('/admin/events', isAdminLoggedIn, adminGetEvents);
app.post('/admin/events/add', isAdminLoggedIn, async (req, res) => {
    const { title, description, reward_koin, date } = req.body;
    try {
        await db.query("INSERT INTO events (title, description, reward_koin, date) VALUES (?, ?, ?, ?)", 
        [title, description, reward_koin, date]);
        req.session.message = '✅ Misi baru berhasil dibuat!';
        res.redirect('/admin/events');
    } catch (err) { res.redirect('/admin/events'); }
});
app.post('/admin/events/delete/:id', isAdminLoggedIn, deleteEvent);

app.get('/admin/categories', isAdminLoggedIn, adminGetCategories);
app.post('/admin/categories/add', isAdminLoggedIn, addCategory);
app.get('/admin/categories/delete/:id', isAdminLoggedIn, deleteCategory);

app.all('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

// ============================================
// LOGIKA PROGRAM & FORM PENDAFTARAN (Milik Tim)
// ============================================

// --- Routes Kategori & Detail ---
app.get('/pendidikan', (req, res) => res.render('pendidikan'));
app.get('/lingkungan', (req, res) => res.render('lingkungan'));
app.get('/kesehatan', (req, res) => res.render('kesehatan'));
app.get('/sosial-kemanusiaan', (req, res) => res.render('sosial-kemanusiaan'));

const detailPages = ['book-detail', 'pakaian-detail', 'pendidikan-detail', 'sosial-anak-detail', 'jadwal'];
detailPages.forEach(page => {
    app.get(`/${page}`, (req, res) => res.render(page));
});

// --- DETAIL MISI PENDIDIKAN ---
app.get('/pendidikan-detail/taman-baca', (req, res) => res.render('taman-baca'));
app.get('/pendidikan-detail/it', (req, res) => res.render('literasi-digital'));
app.get('/pendidikan-detail/seni', (req, res) => res.render('kelas-seni'));
app.get('/pendidikan-detail/english', (req, res) => res.render('english-day'));

// --- FORM PENDAFTARAN KESEHATAN ---
app.get('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'pemeriksaan-gratis': { slug: 'pemeriksaan-gratis', title: 'Pemeriksaan Kesehatan Gratis', emoji: '🩺', description: 'Akses kesehatan dasar adalah hak semua.' },
        'donor-darah': { slug: 'donor-darah', title: 'Donor Darah Nasional', emoji: '🩸', description: 'Setetes darahmu menyelamatkan nyawa.' },
        'gizi-anak': { slug: 'gizi-anak', title: 'Sosialisasi Gizi Anak', emoji: '🍎', description: 'Edukasi nutrisi untuk cegah stunting.' },
        'mental-health': { slug: 'mental-health', title: 'Support System Mental Health', emoji: '🧠', description: 'Saling mendukung untuk kesehatan jiwa.' }
    };
    const program = programs[programSlug];
    if (!program) {
        req.session.message = '⚠️ Program tidak ditemukan.';
        return res.redirect('/kesehatan');
    }
    res.render('form-pendaftaran', { program });
});

app.post('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp, umur, emergencyName, emergencyPhone } = req.body;
    if (!fullname || !email || !whatsapp) {
        req.session.message = '⚠️ Semua field wajib diisi.';
        return res.redirect(`/daftar/${programSlug}`);
    }
    if (programSlug === 'donor-darah') {
        if (!umur || parseInt(umur) < 17) {
            req.session.message = '⚠️ Maaf, syarat minimal donor darah adalah 17 tahun.';
            return res.redirect(`/daftar/${programSlug}`);
        }
        if (!emergencyName || !emergencyPhone) {
            req.session.message = '⚠️ Kontak darurat wajib diisi.';
            return res.redirect(`/daftar/${programSlug}`);
        }
    }
    console.log(`✅ Pendaftaran ${programSlug} Berhasil!`);
    res.redirect(`/daftar/${programSlug}?success=true`);
});

// --- FORM PENDAFTARAN PENDIDIKAN ---
app.get('/daftar-pendidikan/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'donasi-perlengkapan': { slug: 'donasi-perlengkapan', title: 'Donasi Perlengkapan Sekolah', emoji: '🎒', type: 'donasi', description: 'Donasikan perlengkapan sekolah.' },
        'taman-baca-keliling': { slug: 'taman-baca-keliling', title: 'Taman Baca Keliling', emoji: '🚌', type: 'multi-role', description: 'Menebar minat baca.' },
        'bimbingan-belajar': { slug: 'bimbingan-belajar', title: 'Bimbingan Belajar Gratis', emoji: '👩‍🏫', type: 'bimbel', description: 'Bantu anak meraih cita-cita.' },
        'renovasi-fasilitas': { slug: 'renovasi-fasilitas', title: 'Renovasi Fasilitas Pendidikan', emoji: '🏗️', type: 'multi-role', description: 'Wujudkan fasilitas layak.' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/pendidikan');
    res.render('form-pendidikan', { program });
});

app.post('/daftar-pendidikan/:program', (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp } = req.body;
    if (!fullname || !email || !whatsapp) {
        req.session.message = '⚠️ Field wajib diisi.';
        return res.redirect(`/daftar-pendidikan/${programSlug}`);
    }
    if (!/^[0-9]{10,}$/.test(whatsapp)) {
        req.session.message = '⚠️ Nomor WhatsApp tidak valid.';
        return res.redirect(`/daftar-pendidikan/${programSlug}`);
    }
    console.log(`✅ Pendaftaran Pendidikan ${programSlug} Berhasil!`);
    res.redirect(`/daftar-pendidikan/${programSlug}?success=true`);
});

// --- FORM PENDAFTARAN LINGKUNGAN ---
app.get('/daftar-lingkungan/:program', (req, res) => {
    const programSlug = req.params.program;
    const programs = {
        'tanam-mangrove': { slug: 'tanam-mangrove', title: 'Aksi Tanam Mangrove', emoji: '🌳', type: 'aksi-lapangan', description: 'Lestarikan pesisir.' },
        'clean-up-day': { slug: 'clean-up-day', title: 'Clean-Up Day', emoji: '🌊', type: 'aksi-lapangan', description: 'Pungut sampah laut.' },
        'workshop-zero-waste': { slug: 'workshop-zero-waste', title: 'Workshop Zero Waste', emoji: '♻️', type: 'workshop', description: 'Ubah sampah jadi berkah.' },
        'adopsi-pohon': { slug: 'adopsi-pohon', title: 'Adopsi Pohon', emoji: '🌱', type: 'adopsi', description: 'Investasi oksigen.' }
    };
    const program = programs[programSlug];
    if (!program) return res.redirect('/lingkungan');
    res.render('form-lingkungan', { program });
});

app.post('/daftar-lingkungan/:program', (req, res) => {
    const programSlug = req.params.program;
    if (programSlug === 'adopsi-pohon' && (!req.body.jumlahPohon || req.body.jumlahPohon < 1)) {
        req.session.message = '⚠️ Jumlah pohon minimal 1.';
        return res.redirect(`/daftar-lingkungan/${programSlug}`);
    }
    console.log(`✅ Pendaftaran Lingkungan ${programSlug} Berhasil!`);
    res.redirect(`/daftar-lingkungan/${programSlug}?success=true`);
});

// --- FORM PENDAFTARAN SOSIAL ---
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
    res.render('form-social', { program });
});

app.post('/daftar-sosial/:program', (req, res) => {
    console.log(`✅ Pendaftaran Sosial ${req.params.program} Berhasil!`);
    res.redirect(`/daftar-sosial/${req.params.program}?success=true`);
});

// API & Global Handler
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);
app.get('/terima-kasih', (req, res) => res.render('thank-you-page'));

// --- Start Server ---
app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`🚀 Server running at ${url}`);
    if (os.platform() === 'win32') exec(`start ${url}`);
    else if (os.platform() === 'darwin') exec(`open ${url}`);
    else exec(`xdg-open ${url}`);
});