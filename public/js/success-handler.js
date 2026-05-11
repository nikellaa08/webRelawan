/**
 * Simulasi Pendaftaran Berhasil menggunakan SweetAlert2
 * Menangani form submission di client-side tanpa hit database.
 */

function handleSuccess(event, category) {
    event.preventDefault(); // Stop form submission

    const configs = {
        'pendidikan': {
            title: 'Terang Ilmu Menanti!',
            text: 'Terima kasih telah menjadi pelita bagi pendidikan bangsa. Kontribusimu sangat berharga.',
            iconColor: '#3b82f6',
            confirmButtonColor: '#3b82f6',
            redirect: '/pendidikan'
        },
        'lingkungan': {
            title: 'Satu Aksi untuk Bumi!',
            text: 'Langkah kecilmu hari ini adalah nafas segar bagi masa depan lingkungan kita.',
            iconColor: '#10b981',
            confirmButtonColor: '#10b981',
            redirect: '/lingkungan'
        },
        'kesehatan': {
            title: 'Harapan Baru Tersampaikan!',
            text: 'Kepedulianmu adalah kekuatan bagi mereka yang berjuang. Terima kasih atas dedikasimu.',
            iconColor: '#e11d48',
            confirmButtonColor: '#e11d48',
            redirect: '/kesehatan'
        },
        'sosial': {
            title: 'Uluran Tangan Diterima!',
            text: 'Kehadiranmu adalah hadiah terindah untuk mereka. Terima kasih telah berbagi kebahagiaan.',
            iconColor: '#8b5cf6',
            confirmButtonColor: '#8b5cf6',
            redirect: '/sosial-kemanusiaan'
        }
    };

    const config = configs[category] || configs['pendidikan'];

    Swal.fire({
        title: config.title,
        text: config.text,
        icon: 'success',
        iconColor: config.iconColor,
        confirmButtonText: 'Kembali',
        confirmButtonColor: config.confirmButtonColor,
        background: '#ffffff',
        borderRadius: '24px',
        customClass: {
            popup: 'standard-card',
            title: 'success-header',
            confirmButton: 'btn-main'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = config.redirect;
        }
    });
}
