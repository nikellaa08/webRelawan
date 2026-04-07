import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';
import session from 'express-session';

// Import controllers
import { login, register } from './controllers/authController.js';
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

// Session configuration
app.use(session({
    secret: 'relawan-nusantara-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 jam
    }
}));

// Middleware untuk mengakses session di setiap route
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.message = req.session.message || null;
    next();
});

// Middleware untuk proteksi halaman yang memerlukan login
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.message = 'Maaf, Anda harus login terlebih dahulu untuk mengakses halaman ini. Silakan masuk atau daftar jika belum memiliki akun.';
        return res.redirect('/login');
    }
    next();
};

// --- Routes ---

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

// Handle pendaftaran dari form - SIMPAN KE DATABASE
app.post('/daftar', register);

// Halaman form pendaftaran dinamis untuk program kesehatan
app.get('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    
    // Data program untuk form dinamis
    const programs = {
        'pemeriksaan-gratis': {
            slug: 'pemeriksaan-gratis',
            title: 'Pemeriksaan Kesehatan Gratis',
            emoji: '🩺',
            description: 'Bergabunglah untuk memberikan pemeriksaan kesehatan gratis bagi masyarakat kurang mampu. Akses kesehatan dasar adalah hak semua.'
        },
        'donor-darah': {
            slug: 'donor-darah',
            title: 'Donor Darah Nasional',
            emoji: '🩸',
            description: 'Setetes darahmu menyelamatkan nyawa. Ikuti aksi donor darah rutin kami dan jadilah pahlawan!'
        },
        'gizi-anak': {
            slug: 'gizi-anak',
            title: 'Sosialisasi Gizi Anak',
            emoji: '🍎',
            description: 'Masa depan bangsa dimulai dari gizi yang baik. Edukasi orang tua tentang nutrisi untuk cegah stunting.'
        },
        'mental-health': {
            slug: 'mental-health',
            title: 'Support System Mental Health',
            emoji: '🧠',
            description: 'Mental yang sehat adalah pondasi kebahagiaan. Saling mendukung untuk kesehatan jiwa yang lebih baik.'
        }
    };

    const program = programs[programSlug];

    if (!program) {
        req.session.message = '⚠️ Program tidak ditemukan.';
        return res.redirect('/kesehatan');
    }

    res.render('form-pendaftaran', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

// Handle submit form pendaftaran kesehatan
app.post('/daftar/:program', (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp, umur, emergencyName, emergencyPhone } = req.body;

    // Validasi input umum
    if (!fullname || !email || !whatsapp) {
        req.session.message = '⚠️ Semua field wajib diisi.';
        return res.redirect(`/daftar/${programSlug}`);
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.session.message = '⚠️ Format email tidak valid.';
        return res.redirect(`/daftar/${programSlug}`);
    }

    // Validasi WhatsApp hanya angka
    if (!/^[0-9]+$/.test(whatsapp)) {
        req.session.message = '⚠️ Nomor WhatsApp hanya boleh angka.';
        return res.redirect(`/daftar/${programSlug}`);
    }

    // Validasi khusus Donor Darah
    if (programSlug === 'donor-darah') {
        // Validasi umur minimal 17 tahun
        if (!umur || parseInt(umur) < 17) {
            req.session.message = '⚠️ Maaf, syarat minimal donor darah adalah 17 tahun.';
            return res.redirect(`/daftar/${programSlug}`);
        }

        // Validasi kontak darurat
        if (!emergencyName || !emergencyPhone) {
            req.session.message = '⚠️ Kontak darurat wajib diisi untuk program Donor Darah.';
            return res.redirect(`/daftar/${programSlug}`);
        }

        // Validasi nomor telepon darurat hanya angka
        if (!/^[0-9]+$/.test(emergencyPhone)) {
            req.session.message = '⚠️ Nomor telepon darurat hanya boleh angka.';
            return res.redirect(`/daftar/${programSlug}`);
        }
    }

    // Simpan data pendaftaran (untuk sementara ke console, bisa dikembangkan ke database)
    console.log(`✅ Pendaftaran ${programSlug}:`, {
        fullname,
        email,
        whatsapp,
        ...(programSlug === 'donor-darah' && { umur, emergencyName, emergencyPhone }),
        ...req.body
    });

    // Redirect dengan parameter success
    res.redirect(`/daftar/${programSlug}?success=true`);
});

// ============================================
// ROUTES UNTUK FORM PENDAFTARAN LINGKUNGAN
// ============================================

// Halaman form pendaftaran dinamis untuk program lingkungan
app.get('/daftar-lingkungan/:program', (req, res) => {
    const programSlug = req.params.program;

    // Data program untuk form dinamis lingkungan
    const programs = {
        'tanam-mangrove': {
            slug: 'tanam-mangrove',
            title: 'Aksi Tanam Mangrove',
            emoji: '🌳',
            type: 'aksi-lapangan',
            description: 'Bersama kita lestarikan ekosistem pesisir dengan menanam mangrove. Satu pohon yang kau tanam hari ini adalah perisai bagi pesisir di masa depan!',
            submitText: 'Daftar Sekarang'
        },
        'clean-up-day': {
            slug: 'clean-up-day',
            title: 'Clean-Up Day',
            emoji: '🌊',
            type: 'aksi-lapangan',
            description: 'Jangan biarkan sampah merusak keindahan alam kita. Pungut satu sampah, selamatkan ribuan biota laut!',
            submitText: 'Daftar Sekarang'
        },
        'workshop-zero-waste': {
            slug: 'workshop-zero-waste',
            title: 'Workshop Zero Waste',
            emoji: '♻️',
            type: 'workshop',
            description: 'Ubah sampah jadi berkah. Belajar cara mengelola sampah rumah tangga menjadi barang berguna dan kompos.',
            submitText: 'Daftar Workshop'
        },
        'adopsi-pohon': {
            slug: 'adopsi-pohon',
            title: 'Adopsi Pohon',
            emoji: '🌱',
            type: 'adopsi',
            description: 'Miliki pohonmu sendiri dan pantau pertumbuhannya. Satu pohon darimu, investasi oksigen untuk masa depan.',
            submitText: 'Adopsi Sekarang'
        }
    };

    const program = programs[programSlug];

    if (!program) {
        req.session.message = '⚠️ Program tidak ditemukan.';
        return res.redirect('/lingkungan');
    }

    res.render('form-lingkungan', {
        user: req.session.user || null,
        message: req.session.message || null,
        program: program
    });
    req.session.message = null;
});

// Handle submit form pendaftaran lingkungan
app.post('/daftar-lingkungan/:program', (req, res) => {
    const programSlug = req.params.program;
    const { fullname, email, whatsapp } = req.body;

    // Validasi input umum
    if (!fullname || !email || !whatsapp) {
        req.session.message = '⚠️ Semua field wajib diisi.';
        return res.redirect(`/daftar-lingkungan/${programSlug}`);
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        req.session.message = '⚠️ Format email tidak valid.';
        return res.redirect(`/daftar-lingkungan/${programSlug}`);
    }

    // Validasi WhatsApp minimal 10 digit dan hanya angka
    if (!/^[0-9]{10,}$/.test(whatsapp)) {
        req.session.message = '⚠️ Nomor WhatsApp harus minimal 10 digit dan hanya angka.';
        return res.redirect(`/daftar-lingkungan/${programSlug}`);
    }

    // Validasi khusus Aksi Lapangan
    if (programSlug === 'tanam-mangrove' || programSlug === 'clean-up-day') {
        const { alamat, transportasi } = req.body;
        if (!alamat || !transportasi) {
            req.session.message = '⚠️ Alamat domisili dan transportasi wajib diisi.';
            return res.redirect(`/daftar-lingkungan/${programSlug}`);
        }
    }

    // Validasi khusus Workshop
    if (programSlug === 'workshop-zero-waste') {
        const { metode, minatBelajar } = req.body;
        if (!metode || !minatBelajar) {
            req.session.message = '⚠️ Metode partisipasi dan minat belajar wajib dipilih.';
            return res.redirect(`/daftar-lingkungan/${programSlug}`);
        }
    }

    // Validasi khusus Adopsi Pohon
    if (programSlug === 'adopsi-pohon') {
        const { jumlahPohon, namaSertifikat, metodePembayaran } = req.body;

        if (!jumlahPohon || parseInt(jumlahPohon) < 1) {
            req.session.message = '⚠️ Jumlah pohon minimal 1.';
            return res.redirect(`/daftar-lingkungan/${programSlug}`);
        }

        if (!namaSertifikat) {
            req.session.message = '⚠️ Nama untuk sertifikat wajib diisi.';
            return res.redirect(`/daftar-lingkungan/${programSlug}`);
        }

        if (!metodePembayaran) {
            req.session.message = '⚠️ Metode pembayaran wajib dipilih.';
            return res.redirect(`/daftar-lingkungan/${programSlug}`);
        }
    }

    // Simpan data pendaftaran (untuk sementara ke console, bisa dikembangkan ke database)
    console.log(`✅ Pendaftaran Lingkungan [${programSlug}]:`, {
        fullname,
        email,
        whatsapp,
        ...req.body
    });

    // Redirect dengan parameter success
    res.redirect(`/daftar-lingkungan/${programSlug}?success=true`);
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
