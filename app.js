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

// Konfigurasi __dirname untuk ES Modules agar jalan di Windows/Linux
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'relawan-nusantara-secret-key-2026', // Ganti dengan random string yang kompleks
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true jika menggunakan HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
    }
}));

// Middleware untuk mengakses session di setiap route
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    next();
});

// --- Routes ---

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user || null, message: req.session.message || null });
    req.session.message = null;
});

// Route register yang sudah ada
app.get('/register', (req, res) => {
    res.render('registration-form', { user: req.session.user || null, message: null });
});

// --- TAMBAHAN BARU ---
app.get('/registration-form', (req, res) => {
    res.render('registration-form', { user: req.session.user || null, message: null });
});
// --------------------

app.get('/login', (req, res) => {
    res.render('login', { user: req.session.user || null, message: null });
});

// API Endpoints
app.post('/api/login', login);
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

// --- Page Routes ---
app.get('/pendidikan', (req, res) => res.render('pendidikan', { user: req.session.user || null }));
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

// Handle pendaftaran dari form - SIMPAN KE SESSION
app.post('/daftar', (req, res) => {
    const { fullname, email } = req.body;
    
    // Simpan user ke session setelah pendaftaran
    req.session.user = {
        name: fullname,
        email: email || ''
    };
    
    req.session.message = `Selamat Datang ${fullname}! Pendaftaran berhasil.`;
    res.redirect('/');
});

// Route logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error saat logout:', err);
        }
        res.redirect('/');
    });
});

// Function to open browser automatically
function openBrowser(url) {
    const platform = os.platform();
    
    if (platform === 'win32') {
        // Windows
        exec(`start ${url}`);
    } else if (platform === 'darwin') {
        // macOS
        exec(`open ${url}`);
    } else {
        // Linux
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
    
    // Auto-open browser
    openBrowser(url);
});