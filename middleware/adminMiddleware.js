// middleware/adminMiddleware.js
// Middleware untuk memproteksi route admin agar hanya bisa diakses oleh admin (is_admin = 1)

/**
 * Middleware utama untuk mengecek apakah user sudah login sebagai admin
 * Cara kerja:
 * 1. Cek apakah session admin ada
 * 2. Jika tidak ada, redirect ke halaman login admin dengan pesan error
 * 3. Jika ada, lanjut ke next middleware/controller
 * 
 * Penggunaan di route:
 * app.get('/admin/dashboard', checkAdmin, controller);
 */
export const checkAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        // Admin sudah login, lanjutkan
        return next();
    }
    
    // Admin belum login, redirect ke login
    req.session.message = '⚠️ Silakan login sebagai admin terlebih dahulu.';
    res.redirect('/admin/login');
};

/**
 * Middleware alternatif yang lebih detail
 * Mengecek apakah session admin ada DAN memiliki is_admin flag
 * Untuk penggunaan di API routes
 */
export const requireAdmin = (req, res, next) => {
    if (req.session && req.session.admin && req.session.admin.is_admin === 1) {
        return next();
    }
    
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        // Jika request API, return JSON error
        return res.status(403).json({ 
            success: false, 
            message: 'Akses ditolak. Hanya admin yang有权访问.' 
        });
    }
    
    req.session.message = '⚠️ Akses ditolak. Hanya admin yang权访问 halaman ini.';
    res.redirect('/admin/login');
};

/**
 * Helper function untuk mendapatkan info admin dari session
 * @returns {object|null} - Object admin atau null
 */
export const getAdminSession = (req) => {
    return req.session?.admin || null;
};

/**
 * Middleware untuk cek apakah admin sudah login
 * Jika sudah login, redirect ke dashboard
 * Berguna untuk halaman login admin
 */
export const isAdminAlreadyLoggedIn = (req, res, next) => {
    if (req.session && req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
};
