/**
 * Simulasi Pendaftaran Berhasil menggunakan SweetAlert2
 * Menangani form submission di client-side untuk demo tanpa database.
 */

function handleRegistration(event, category) {
    event.preventDefault(); // Mencegah form reload atau error database

    // Konfigurasi konten spesifik kategori sesuai instruksi
    const configs = {
        'pendidikan': {
            title: 'Terang Ilmu Menanti!',
            text: 'Terima kasih telah menjadi pelita bagi pendidikan bangsa.',
            iconColor: '#3b82f6',
            confirmButtonColor: '#3b82f6',
            redirect: '/pendidikan'
        },
        'lingkungan': {
            title: 'Satu Aksi untuk Bumi!',
            text: 'Langkah kecilmu hari ini adalah nafas segar bagi masa depan.',
            iconColor: '#10b981',
            confirmButtonColor: '#10b981',
            redirect: '/lingkungan'
        },
        'kesehatan': {
            title: 'Harapan Baru Tersampaikan!',
            text: 'Kepedulianmu adalah kekuatan bagi mereka yang berjuang.',
            iconColor: '#e11d48',
            confirmButtonColor: '#e11d48',
            redirect: '/kesehatan'
        },
        'sosial': {
            title: 'Uluran Tangan Diterima!',
            text: 'Kehadiranmu adalah hadiah terindah untuk mereka.',
            iconColor: '#8b5cf6',
            confirmButtonColor: '#8b5cf6',
            redirect: '/sosial-kemanusiaan'
        }
    };

    const config = configs[category] || configs['pendidikan'];

    // Menampilkan Pop-up menggunakan SweetAlert2
    Swal.fire({
        title: `<span style="font-weight: 900; color: #0f172a;">${config.title}</span>`,
        text: config.text,
        icon: 'success',
        iconColor: config.iconColor,
        confirmButtonText: 'OK / Kembali',
        confirmButtonColor: config.confirmButtonColor,
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '32px',
        showClass: {
            popup: 'animate__animated animate__zoomIn'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirect kembali ke halaman kategori utama
            window.location.href = config.redirect;
        }
    });
}
