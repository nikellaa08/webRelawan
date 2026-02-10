// public/react-entry.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import Navbar from './components/Navbar'; // Sesuaikan path jika perlu (misalnya jika Anda punya folder components)
import { AuthProvider } from './contexts/AuthContext'; // Sesuaikan path jika perlu

const navbarRoot = document.getElementById('navbar-root');

if (navbarRoot) {
  // Pastikan Anda memiliki ReactDOM.createRoot di versi React 18+
  const root = ReactDOM.createRoot(navbarRoot);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </React.StrictMode>
  );
}
