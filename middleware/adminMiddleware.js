export const checkAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        next();
    } else {
        req.session.message = '⚠️ Silakan login sebagai admin terlebih dahulu.';
        res.redirect('/admin/login');
    }
};

export const isAdminAlreadyLoggedIn = (req, res, next) => {
    if (req.session && req.session.admin) {
        res.redirect('/admin/dashboard');
    } else {
        next();
    }
};
