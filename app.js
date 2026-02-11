import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import controllers
import { login } from './controllers/authController.js';
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi __dirname untuk ES Modules agar jalan di Windows/Linux
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory session (Sementara, nanti bisa diganti JWT/Express-Session)
let session = {
    user: null,
    message: null
};

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Routes ---

app.get('/', (req, res) => {
    res.render('index', { user: session.user, message: session.message });
    session.message = null; 
});

// Route register yang sudah ada
app.get('/register', (req, res) => {
    res.render('registration-form', { user: session.user, message: null });
});

// --- TAMBAHAN BARU ---
app.get('/registration-form', (req, res) => {
    res.render('registration-form', { user: session.user, message: null });
});
// --------------------

app.get('/login', (req, res) => {
    res.render('login', { user: session.user, message: null });
});

// API Endpoints
app.post('/api/login', login);
app.get('/api/categories', getCategories);
app.get('/api/events', getEvents);

// --- Page Routes ---
app.get('/pendidikan', (req, res) => res.render('pendidikan', { user: session.user, message: null }));
app.get('/lingkungan', (req, res) => res.render('lingkungan', { user: session.user, message: null }));
app.get('/kesehatan', (req, res) => res.render('kesehatan', { user: session.user, message: null }));
app.get('/sosial-kemanusiaan', (req, res) => res.render('sosial-kemanusiaan', { user: session.user, message: null }));

// --- Detail Pages ---
app.get('/book-detail', (req, res) => res.render('book-detail', { user: session.user, message: null }));
app.get('/pakaian-detail', (req, res) => res.render('pakaian-detail', { user: session.user, message: null }));
app.get('/pendidikan-detail', (req, res) => res.render('pendidikan-detail', { user: session.user, message: null }));
app.get('/sosial-anak-detail', (req, res) => res.render('sosial-anak-detail', { user: session.user, message: null }));

// --- Form Pages ---
app.get('/donation-book-form', (req, res) => res.render('donation-book-form', { user: session.user, message: null }));
app.get('/donation-form', (req, res) => res.render('donation-form', { user: session.user, message: null }));
app.get('/kunjungan-panti-asuhan-form', (req, res) => res.render('kunjungan-panti-asuhan-form', { user: session.user, message: null }));
app.get('/kunjungan-panti-jompo-form', (req, res) => res.render('kunjungan-panti-jompo-form', { user: session.user, message: null }));
app.get('/jadwal', (req, res) => res.render('jadwal', { user: session.user, message: null }));

// Handle pendaftaran dari form
app.post('/daftar', (req, res) => {
    const { fullname } = req.body;
    session.user = { name: fullname };
    session.message = `Selamat Datang ${fullname}!`;
    res.redirect('/');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});