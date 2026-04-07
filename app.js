import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';
import session from 'express-session';

// Import controllers
import { login } from './controllers/authController.js';
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(session({
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
    res.render('index', { user: req.session.user || null, message: req.session.message || null });
    req.session.message = null;
});

app.get('/register', (req, res) => {
    res.render('registration-form', { user: req.session.user || null, message: null });
});

app.get('/registration-form', (req, res) => {
    res.render('registration-form', { user: req.session.user || null, message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user || null, message: null });
});

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

// --- Detail Pages ---
app.get('/book-detail', (req, res) => {
    res.render('book-detail', { user: req.session.user || null, message: null });
});

app.get('/pakaian-detail', (req, res) => {
    res.render('pakaian-detail', { user: req.session.user || null, message: null });
});

app.get('/pendidikan-detail', (req, res) => {
    res.render('pendidikan-detail', { user: req.session.user || null, message: null });
});

app.get('/sosial-anak-detail', (req, res) => {
    res.render('sosial-anak-detail', { user: req.session.user || null, message: null });
});

// --- Form Pages ---
app.get('/donation-book-form', (req, res) => {
    res.render('donation-book-form', { user: req.session.user || null, message: null });
});

app.get('/donation-form', (req, res) => {
    res.render('donation-form', { user: req.session.user || null, message: null });
});

app.get('/kunjungan-panti-asuhan-form', (req, res) => {
    res.render('kunjungan-panti-asuhan-form', { user: req.session.user || null, message: null });
});

app.get('/kunjungan-panti-jompo-form', (req, res) => {
    res.render('kunjungan-panti-jompo-form', { user: req.session.user || null, message: null });
});

app.get('/jadwal', (req, res) => {
    res.render('jadwal', { user: req.session.user || null, message: null });
});

// --- Dynamic registration form route ---
app.get('/daftar/:programName', (req, res) => {
    const programName = req.params.programName;
    res.render('dynamic-form-page', { programName: programName, user: req.session.user || null, message: null });
});

// Handle dynamic form submissions
app.post('/submit-form/:programName', (req, res) => {
    const programName = req.params.programName;
    const formData = req.body;
    console.log(`Form submitted for ${programName}:`, formData);
    res.json({ message: 'Form submitted successfully!' });
});

// Terima Kasih page
app.get('/terima-kasih', (req, res) => {
    res.render('thank-you-page', { user: req.session.user || null, message: null });
});

// --- API Endpoints ---
app.post('/api/login', login);
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

// --- Handle pendaftaran dari form ---
app.post('/daftar', (req, res) => {
    const { fullname } = req.body;
    req.session.user = { name: fullname };
    req.session.message = `Selamat Datang ${fullname}!`;
    res.redirect('/');
});

// --- Register Route ---
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const { db } = await import('./lib/db.js');
        const query = "INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, 'user')";
        await db.execute(query, [username, email, password]);
        res.redirect('/login?message=Registrasi Berhasil! Silakan Login.');
    } catch (err) {
        console.error("Gagal registrasi:", err.message);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.redirect('/register?message=Email sudah terdaftar!');
        }
        res.redirect('/register?message=Terjadi kesalahan saat registrasi.');
    }
});

// --- Logout Route ---
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// --- Admin Dashboard Route ---
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Akses Ditolak: Khusus Admin!');
    }
};

app.get('/admin/dashboard', isAdmin, (req, res) => {
    res.send(`<h1>Dashboard Admin</h1><p>Selamat datang, ${req.session.user.name}</p><a href="/logout">Logout</a>`);
});

// Function to open browser automatically
function openBrowser(url) {
    const platform = os.platform();

    if (platform === 'win32') {
        exec(`start ${url}`);
    } else if (platform === 'darwin') {
        exec(`open ${url}`);
    } else {
        exec(`xdg-open ${url}`);
    }
}

// Start server
app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║                                                  ║');
    console.log('║     🌟  RELAWAN NUSANTARA SERVER  🌟            ║');
    console.log('║                                                  ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log('║                                                  ║');
    console.log(`║  🌐  Server: ${url.padEnd(38)}║`);
    console.log('║                                                  ║');
    console.log('║  📂  Available Routes:                          ║');
    console.log('║      • http://localhost:3000/                   ║');
    console.log('║      • http://localhost:3000/login              ║');
    console.log('║      • http://localhost:3000/register           ║');
    console.log('║      • http://localhost:3000/pendidikan         ║');
    console.log('║      • http://localhost:3000/lingkungan         ║');
    console.log('║      • http://localhost:3000/kesehatan          ║');
    console.log('║      • http://localhost:3000/sosial-kemanusiaan ║');
    console.log('║                                                  ║');
    console.log('║  🔧  API Endpoints:                             ║');
    console.log('║      • POST http://localhost:3000/api/login     ║');
    console.log('║      • GET  http://localhost:3000/api/categories║');
    console.log('║      • GET  http://localhost:3000/api/events    ║');
    console.log('║                                                  ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    console.log('💡  Press Ctrl+C to stop the server');
    console.log('🚀  Opening browser...\n');

    openBrowser(url);
});

export default app;
