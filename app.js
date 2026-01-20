const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// In-memory session simulation
let session = {
    user: null,
    message: null
};

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Routes
app.get('/', (req, res) => {
    res.render('index', { user: session.user, message: session.message });
    session.message = null; // Clear message after displaying it
});

app.get('/register', (req, res) => {
    res.render('registration-form', { user: session.user, message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { user: session.user, message: null });
});

app.get('/pendidikan', (req, res) => {
    res.render('pendidikan', { user: session.user, message: null });
});

app.get('/lingkungan', (req, res) => {
    res.render('lingkungan', { user: session.user, message: null });
});

app.get('/kesehatan', (req, res) => {
    res.render('kesehatan', { user: session.user, message: null });
});

app.get('/sosial-kemanusiaan', (req, res) => {
    res.render('sosial-kemanusiaan', { user: session.user, message: null });
});

// --- Detail Pages ---
app.get('/book-detail', (req, res) => {
    res.render('book-detail', { user: session.user, message: null });
});
app.get('/pakaian-detail', (req, res) => {
    res.render('pakaian-detail', { user: session.user, message: null });
});
app.get('/pendidikan-detail', (req, res) => {
    res.render('pendidikan-detail', { user: session.user, message: null });
});
app.get('/sosial-anak-detail', (req, res) => {
    res.render('sosial-anak-detail', { user: session.user, message: null });
});

// --- Form Pages ---
app.get('/donation-book-form', (req, res) => {
    res.render('donation-book-form', { user: session.user, message: null });
});
app.get('/donation-form', (req, res) => {
    res.render('donation-form', { user: session.user, message: null });
});
app.get('/kunjungan-panti-asuhan-form', (req, res) => {
    res.render('kunjungan-panti-asuhan-form', { user: session.user, message: null });
});
app.get('/kunjungan-panti-jompo-form', (req, res) => {
    res.render('kunjungan-panti-jompo-form', { user: session.user, message: null });
});
app.get('/jadwal', (req, res) => {
    res.render('jadwal', { user: session.user, message: null });
});

app.post('/register', (req, res) => {
    const { fullname } = req.body;
    session.user = { name: fullname };
    session.message = `Selamat ${fullname}! Pendaftaran Anda telah berhasil kami terima.`;
    res.redirect('/');
});


// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
