const express = require('express');
const path = require('path');
const session = require('express-session'); // Require express-session
const app = express();
const port = 3000;

// Configure express-session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a strong, random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// In-memory session simulation


// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(express.json()); // To parse JSON form data

// Dynamic registration form route
app.get('/daftar/:programName', (req, res) => {
    const programName = req.params.programName;
    res.render('dynamic-form-page', { programName: programName });
});

// Handle dynamic form submissions
app.post('/submit-form/:programName', (req, res) => {
    const programName = req.params.programName;
    const formData = req.body;
    console.log(`Form submitted for ${programName}:`, formData);
    // In a real application, you would save this data to a database
    // and then redirect to a thank you page.
    res.json({ message: 'Form submitted successfully!' }); // Send a JSON response for fetch
});

// Terima Kasih page
app.get('/terima-kasih', (req, res) => {
    res.render('thank-you-page');
});


// Middleware to make user and message available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
    req.session.message = null; // Clear message after displaying it
});

app.get('/register', (req, res) => {
    res.render('registration-form');
});

app.get('/login', (req, res) => {
    res.render('login');
    req.session.message = null; // Clear message after displaying it
});

app.post('/login', (req, res) => {
    const { username, password } = req.body; // Assuming your login form uses 'username' and 'password'

    // Dummy authentication for demonstration
    if (username === 'test' && password === 'password') {
        req.session.user = { name: 'Test User', username: username };
        req.session.message = 'Login successful!';
        res.redirect('/');
    } else {
        req.session.message = 'Invalid credentials';
        res.redirect('/login');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.redirect('/');
    });
});

app.get('/pendidikan', (req, res) => {
    res.render('pendidikan');
});

app.get('/lingkungan', (req, res) => {
    res.render('lingkungan');
});

app.get('/kesehatan', (req, res) => {
    res.render('kesehatan');
});

app.get('/sosial-kemanusiaan', (req, res) => {
    res.render('sosial-kemanusiaan');
});

// --- Detail Pages ---
app.get('/book-detail', (req, res) => {
    res.render('book-detail');
});
app.get('/pakaian-detail', (req, res) => {
    res.render('pakaian-detail');
});
app.get('/pendidikan-detail', (req, res) => {
    res.render('pendidikan-detail');
});
app.get('/sosial-anak-detail', (req, res) => {
    res.render('sosial-anak-detail');
});

// --- Form Pages ---
app.get('/donation-book-form', (req, res) => {
    res.render('donation-book-form');
});
app.get('/donation-form', (req, res) => {
    res.render('donation-form');
});
app.get('/kunjungan-panti-asuhan-form', (req, res) => {
    res.render('kunjungan-panti-asuhan-form');
});
app.get('/kunjungan-panti-jompo-form', (req, res) => {
    res.render('kunjungan-panti-jompo-form');
});
app.get('/jadwal', (req, res) => {
    res.render('jadwal');
});

app.post('/daftar', (req, res) => {
    const { fullname } = req.body;
    req.session.user = { name: fullname };
    req.session.message = `Selamat Datang ${fullname}!`;
    res.redirect('/');
});


// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});