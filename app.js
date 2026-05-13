import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';
import session from 'express-session';
import { db } from './lib/db.js';

// Import controllers
import { login, register } from './controllers/authController.js';
import { getCategories } from './controllers/categoryController.js';
import { getEvents } from './controllers/eventController.js';
import { 
    adminLogin, getUsers, deleteUser, 
    getEvents as adminGetEvents, deleteEvent, 
    getCategories as adminGetCategories, addCategory, deleteCategory,
    adminLogout
} from './controllers/adminController.js';
import { checkAdmin, isAdminAlreadyLoggedIn } from './middleware/adminMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware Dasar ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. CONFIGURATION SESSION
app.use(session({
    secret: 'relawan-nusantara-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// 2. GLOBAL LOCALS MIDDLEWARE (KUNCI SINKRONISASI)
app.use((req, res, next) => {
    res.locals.admin = req.session.admin || null;
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    
    // Clear flash message setelah sekali tampil
    if (req.session.message) req.session.message = null;
    next();
});

// --- Routes Halaman Utama & Auth ---
app.get('/', (req, res) => res.render('index'));
app.get(['/register', '/registration-form'], (req, res) => res.render('registration-form'));
app.get('/login', (req, res) => res.render('login'));

app.post('/api/login', login);
app.post('/daftar', register); 
app.all('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// --- Admin Routes ---
app.get('/admin/login', isAdminAlreadyLoggedIn, (req, res) => res.render('admin/login'));
app.post('/admin/api/login', adminLogin);

app.get('/admin/logout', adminLogout);

app.get('/admin/dashboard', checkAdmin, async (req, res) => {
    try {
        const [uCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE is_admin = 0");
        const [eCount] = await db.query("SELECT COUNT(*) as count FROM events");
        const [recentUsers] = await db.query("SELECT id, username, email, koin FROM users WHERE is_admin = 0 ORDER BY id DESC LIMIT 5");
        res.render('admin/dashboard', { 
            stats: { users: uCount[0].count, events: eCount[0].count, donations: 0, categories: 0 }, 
            users: recentUsers,
            dbConnected: true
        });
    } catch (err) {
        res.render('admin/dashboard', { stats: { users: 0, events: 0, donations: 0, categories: 0 }, users: [], dbConnected: false });
    }
});

app.get('/admin/users', checkAdmin, getUsers);
app.post('/admin/users/delete/:id', checkAdmin, deleteUser);
app.get('/admin/events', checkAdmin, adminGetEvents);
app.get('/admin/categories', checkAdmin, adminGetCategories);

// --- Routes Program (Pendidikan, Lingkungan, dll) ---
app.get('/pendidikan', (req, res) => res.render('pendidikan'));
app.get('/lingkungan', (req, res) => res.render('lingkungan'));
app.get('/kesehatan', (req, res) => res.render('kesehatan'));
app.get('/sosial-kemanusiaan', (req, res) => res.render('sosial-kemanusiaan'));

// --- Start Server ---
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
