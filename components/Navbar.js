// components/Navbar.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  // Ini adalah contoh tampilan navbar. Anda perlu menyesuaikannya
  // agar sesuai dengan struktur HTML dan CSS navbar Anda yang sebenarnya.
  // Saya akan menggunakan struktur dasar yang mirip dengan EJS partials/header.ejs Anda.
  // Asumsi ada kelas CSS seperti 'nav-login-btn', 'nav-profile-menu' dll.

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Contoh back button, bisa dihapus jika tidak digunakan */}
        {/* <a href="#" className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
          </svg>
        </a> */}
        <a href="/" className="nav-logo">Relawan Nusantara</a>
      </div>

      <ul className="nav-menu">
        <li className="nav-item"><a href="/">Home</a></li>
        <li className="nav-item"><a href="/events">Events</a></li> {/* Anda mungkin perlu membuat route ini */}
        <li className="nav-item"><a href="/about">About</a></li>
        {/* Tambahkan item navigasi lainnya sesuai kebutuhan */}
      </ul>

      <div className="nav-right">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          {/* Ikon untuk dark/light mode */}
          <svg id="theme-toggle-dark-icon" className="hidden" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> {/* ... */} </svg>
          <svg id="theme-toggle-light-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> {/* ... */} </svg>
        </div>

        {isAuthenticated ? (
          // Jika user sudah login
          <div className="user-info">
            <span className="halo-text">Halo, {user.nama_lengkap}</span>
            <button onClick={logout} className="btn btn-secondary nav-logout-btn">Logout</button>
          </div>
        ) : (
          // Jika user belum login
          <a href="/login" className="btn btn-primary nav-login-btn">Login</a>
        )}

        {/* Hamburger menu untuk mobile */}
        <div className="hamburger">
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
