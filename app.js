import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';
import sessionMiddleware from 'express-session'; // Nama diubah agar tidak bentrok

// Import controllers
import { login } from './controllers/authController.js';
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. View Engine & Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(sessionMiddleware({
    secret: 'secret-key-relawan-nusantara',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, secure: false }
}));

// Middleware untuk membuat user dan message tersedia di semua template
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    next();
});

// --- Routes Halaman Utama ---
app.get('/', (req, res) => {
    const user = req.session.user || null;
    const message = req.session.message || null;
    req.session.message = null; // Clear message after viewing
    res.render('index', { user, message });
});

app.get(['/register', '/registration-form'], (req, res) => {
    res.render('registration-form', { user: req.session.user || null, message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user || null, message: null });
});

// --- KATEGORI PROGRAM ---
app.get('/pendidikan', (req, res) => {
    res.render('pendidikan', { user: req.session.user || null, message: null });
});

app.get('/lingkungan', (req, res) => {
    res.render('lingkungan', { user: req.session.user || null, message: null });
});

app.get('/kesehatan', (req, res) => {
    res.render('kesehatan', { user: req.session.user || null, message: null });
});

app.get('/sosial-kemanusiaan', (req, res) => {
    res.render('sosial-kemanusiaan', { user: req.session.user || null, message: null });
});

// --- DETAIL MISI ---
app.get('/pendidikan-detail/taman-baca', (req, res) => {
    res.render('taman-baca', { user: req.session.user || null, message: null });
});

app.get('/pendidikan-detail/it', (req, res) => {
    res.render('literasi-digital', { user: req.session.user || null, message: null });
});

app.get('/pendidikan-detail/seni', (req, res) => {
    res.render('kelas-seni', { user: req.session.user || null, message: null });
});

app.get('/pendidikan-detail/english', (req, res) => {
    res.render('english-day', { user: req.session.user || null, message: null });
});

app.get('/pendidikan-detail-view/:jenis', (req, res) => {
    const jenis = req.params.jenis;
    const dataMisi = {
        'it': { title: 'Literasi Digital', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000', desc: 'Bantu generasi muda melek teknologi!', jadwal: 'Kamis, 13:00 WIB', kuota: '10 Relawan', tugas: 'Workshop IT', reward: 350 },
        'seni': { title: 'Kelas Seni Kreatif', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000', desc: 'Eksplorasi bakat anak panti asuhan.', jadwal: 'Minggu, 10:00 WIB', kuota: '5 Relawan', tugas: 'Melukis Bersama', reward: 200 },
        'english': { title: 'English Day', img: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?q=80&w=1000', desc: 'Bantu anak-anak berani bicara bahasa Inggris.', jadwal: 'Jumat, 15:00 WIB', kuota: '12 Relawan', tugas: 'English Conversation', reward: 250 }
    };
    const detail = dataMisi[jenis] || dataMisi['it'];
    res.render('pendidikan-detail', { detail, user: req.session.user || null, message: null });
});

// --- Detail & Form Pages ---
const genericPages = [
    'book-detail', 'pakaian-detail', 'sosial-anak-detail',
    'donation-book-form', 'donation-form', 'kunjungan-panti-asuhan-form', 
    'kunjungan-panti-jompo-form', 'jadwal'
];

genericPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.render(page, { user: req.session.user || null, message: null });
    });
});

app.get('/daftar/:programName', (req, res) => {
    res.render('dynamic-form-page', { programName: req.params.programName, user: req.session.user || null, message: null });
});

app.post('/submit-form/:programName', (req, res) => {
    res.json({ message: 'Form submitted successfully!' });
});

app.get('/terima-kasih', (req, res) => {
    res.render('thank-you-page', { user: req.session.user || null, message: null });
});

// --- API & Auth Actions ---
app.post('/api/login', login);
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

app.post('/daftar', (req, res) => {
    const { fullname } = req.body;
    req.session.user = { name: fullname };
    req.session.message = `Selamat Datang ${fullname}!`;
    res.redirect('/');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const { db } = await import('./lib/db.js');
        const query = "INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'user')";
        await db.execute(query, [username, email, password]);
        res.redirect('/login?message=Registrasi Berhasil!');
    } catch (err) {
        res.redirect('/register?message=Terjadi kesalahan.');
    }
});

app.all('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Start server
app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`🚀 Server running at ${url}`);
    
    // Auto open browser
    const platform = os.platform();
    if (platform === 'win32') exec(`start ${url}`);
    else if (platform === 'darwin') exec(`open ${url}`);
    else exec(`xdg-open ${url}`);
});