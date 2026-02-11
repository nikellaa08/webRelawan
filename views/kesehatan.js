document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("registrationModal");
    const closeBtn = document.querySelector(".close-btn");

    // Pilih semua tombol yang punya class btn-follow
    const btns = document.querySelectorAll(".btn-follow");

    btns.forEach(btn => {
        btn.onclick = function(e) {
            // Supaya tidak refresh halaman
            e.preventDefault();

            // Cari card tempat tombol ini berada
            const card = this.closest('.event-card');

            // Ambil teks dari h3.card-title
            const programName = card.querySelector('.card-title').textContent;

            // Update judul di dalam modal
            const targetText = document.getElementById("targetProgram");
            if (targetText) {
                targetText.innerText = "Mendaftar: " + programName;
            }

            // Munculkan modal
            modal.style.display = "block";
            console.log("Membuka modal untuk: " + programName); // Cek di inspect (F12)
        }
    });

    // Klik (x) untuk tutup
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Klik di luar kotak putih untuk tutup
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // IntersectionObserver untuk animasi mengambang saat masuk viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            } else {
                entry.target.classList.remove('animate');
            }
        });
    }, { threshold: 0.1 });

    // Amati semua kartu event
    document.querySelectorAll('.event-card').forEach(card => {
        observer.observe(card);
    });

    // Handler untuk submit form
    const healthForm = document.getElementById("healthForm");
    if (healthForm) {
        healthForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            alert("Pendaftaran berhasil!\n" + JSON.stringify(data, null, 2));
            modal.style.display = "none";
            this.reset();
        });
    }
});
