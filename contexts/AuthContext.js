// contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Buat AuthContext
const AuthContext = createContext(null);

// Buat AuthProvider Component
export const AuthProvider = ({ children }) => {
  // State untuk menyimpan informasi user yang login
  const [user, setUser] = useState(null);
  // State untuk melacak apakah proses inisialisasi sudah selesai (misalnya, membaca dari localStorage)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Saat komponen dimuat, coba ambil data user dari localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Anda bisa menambahkan validasi token di sini jika perlu (misalnya, cek masa berlaku)
        setUser({ ...parsedUser, token: storedToken });
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false); // Proses loading selesai
  }, []);

  // Fungsi untuk login
  const login = (userData, token) => {
    setUser({ ...userData, token });
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  // Fungsi untuk logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Opsional: Arahkan user ke halaman login atau homepage
    // window.location.href = '/login';
  };

  // Nilai yang akan disediakan oleh Context
  const authContextValue = {
    user,
    isAuthenticated: !!user, // true jika user tidak null
    login,
    logout,
    loading // Sertakan loading state
  };

  if (loading) {
    // Anda bisa menampilkan spinner loading global di sini
    return <div>Loading authentication...</div>; 
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook kustom untuk memudahkan penggunaan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
