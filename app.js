const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 1. Session Simulation
let session = {
    user: null,
    message: null
};

// 2. View Engine & Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// 3. Main Routes
app.get('/', (req, res) => {
    res.render('index', { user: session.user, message: session.message });
    session.message = null;
});

app.get('/register', (req, res) => {
    res.render('registration-form', { user: session.user, message: null });
});

app.get('/login', (req, res) => {
    res.render('login', { user: session.user, message: null });
});

// --- KATEGORI PROGRAM ---
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

// --- DETAIL MISI (FILE MANDIRI/FOLDER BARU LU) ---
// Ini rute yang bikin user bener-bener pindah ke file ejs masing-masing
app.get('/pendidikan-detail/taman-baca', (req, res) => {
    res.render('taman-baca', { user: session.user, message: null });
});

app.get('/pendidikan-detail/it', (req, res) => {
    res.render('literasi-digital', { user: session.user, message: null });
});

app.get('/pendidikan-detail/seni', (req, res) => {
    res.render('kelas-seni', { user: session.user, message: null });
});

app.get('/pendidikan-detail/english', (req, res) => {
    res.render('english-day', { user: session.user, message: null });
});


// --- RUTE DINAMIS (BACKUP / KERANGKA LAIN) ---
app.get('/pendidikan-detail-view/:jenis', (req, res) => {
    const jenis = req.params.jenis;
    const dataMisi = {
        'it': { title: 'Literasi Digital', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000', desc: 'Bantu generasi muda melek teknologi!', jadwal: 'Kamis, 13:00 WIB', kuota: '10 Relawan', tugas: 'Workshop IT', reward: 350 },
        'seni': { title: 'Kelas Seni Kreatif', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000', desc: 'Eksplorasi bakat anak panti asuhan.', jadwal: 'Minggu, 10:00 WIB', kuota: '5 Relawan', tugas: 'Melukis Bersama', reward: 200 },
        'english': { title: 'English Day', img: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?q=80&w=1000', desc: 'Bantu anak-anak berani bicara bahasa Inggris.', jadwal: 'Jumat, 15:00 WIB', kuota: '12 Relawan', tugas: 'English Conversation', reward: 250 }
    };
    const detail = dataMisi[jenis] || dataMisi['it'];
    res.render('pendidikan-detail', { detail, user: session.user, message: null });
});

// --- RUTE DETAIL LAINNYA (TETAP SAMA) ---
app.get(['/book-detail', '/pakaian-detail', '/sosial-anak-detail'], (req, res) => {
    res.render(req.path.substring(1), { user: session.user, message: null });
});

// --- FORM PAGES (TETAP SAMA) ---
app.get(['/donation-book-form', '/donation-form', '/kunjungan-panti-asuhan-form', '/kunjungan-panti-jompo-form', '/jadwal'], (req, res) => {
    res.render(req.path.substring(1), { user: session.user, message: null });
});

// --- POST ACTIONS ---
app.post('/daftar', (req, res) => {
    const { fullname } = req.body;
    session.user = { name: fullname };
    session.message = `Selamat Datang ${fullname}!`;
    res.redirect('/');
});

// 7. Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});