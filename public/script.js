document.addEventListener('DOMContentLoaded', function() {
    // --- Theme Switcher (Refactored & Fixed) ---
    const themeToggleBtn = document.querySelector('.theme-switcher');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Function to apply the theme
    const applyTheme = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
            localStorage.setItem('color-theme', 'light');
        }
    };

    // Determine and apply initial theme on page load
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isInitialDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    applyTheme(isInitialDark);

    // Add click event listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            // Toggle theme based on the current state
            const isCurrentlyDark = document.documentElement.classList.contains('dark-mode');
            applyTheme(!isCurrentlyDark);
        });
    }

    // --- Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // --- Typing Effect ---
    const subtitleEl = document.getElementById('typing-subtitle');
    if (subtitleEl) {
        const text = "Jadilah bagian dari perubahan. Temukan event relawan dan donasi yang sesuai dengan minatmu.";
        let index = 0;
        subtitleEl.innerHTML = "&nbsp;"; // Start with a space to set height

        function type() {
            if (index < text.length) {
                subtitleEl.textContent = text.substring(0, index + 1);
                subtitleEl.innerHTML += '<span class="typing-cursor"></span>';
                index++;
                setTimeout(type, 50);
            } else {
                if(subtitleEl.querySelector('.typing-cursor')) {
                    subtitleEl.querySelector('.typing-cursor').style.animation = 'blink 1s infinite';
                }
            }
        }
        setTimeout(type, 1000); // Start typing after initial animation
    }

    // --- Ripple Effect on Buttons ---
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Ripple effect logic
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // --- Enable Scrolling on Learn More Click ---
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.remove('no-scroll');
            const targetSection = document.getElementById('pelajari-selengkapnya');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Show All Events on index.html ---
    const lihatSemuaEventBtn = document.getElementById('lihat-semua-event');
    const allEventsSection = document.getElementById('all-events-section');

    if (lihatSemuaEventBtn) {
        lihatSemuaEventBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (allEventsSection.style.display === 'none') {
                allEventsSection.style.display = 'block';
                lihatSemuaEventBtn.textContent = 'Sembunyikan Event';
                // Scroll to the new section
                allEventsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                allEventsSection.style.display = 'none';
                lihatSemuaEventBtn.textContent = 'Lihat Semua Event';
            }
        });
    }

    // --- Card Click to Page Navigation ---
    const clickableCards = document.querySelectorAll('.event-card[data-href]');
    clickableCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-href');
            // Add a class to the body to trigger a page transition animation
            document.body.classList.add('page-transition-out');
            
            // Wait for the animation to finish, then navigate
            setTimeout(() => {
                window.location.href = page;
            }, 500); // This duration should match the CSS animation duration
        });
    });

    // --- Registration Button ---
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            if (!this.classList.contains('registered')) {
                this.classList.add('registered');
                this.textContent = 'Terdaftar';
                
                // You can also add a class to disable pointer events
                this.style.cursor = 'not-allowed';

                // Optional: Show a more elegant notification/modal instead of an alert
                alert('Pendaftaran berhasil! Koin akan ditambahkan setelah kehadiran Anda diverifikasi oleh admin.');
            }
        });
    }

    // --- Stat Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateValue = (obj, start, end, duration, prefix = '', suffix = '') => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            // Format number with Indonesian locale for thousand separators
            const formattedNumber = current.toLocaleString('id-ID');
            
            obj.innerHTML = `${prefix}${formattedNumber}${suffix}`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                // Ensure the final number is exactly the target and formatted.
                obj.innerHTML = `${prefix}${end.toLocaleString('id-ID')}${suffix}`;
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent.trim();
                
                // Regex to find number parts and any surrounding text
                const match = text.match(/^(\D*\s*)?([\d,.]+)(\s*\D*)?$/);

                if (match) {
                    const prefix = match[1] || '';
                    const numberString = match[2];
                    const suffix = match[3] || '';
                    
                    // Remove dots/commas for parsing
                    const targetValue = parseInt(numberString.replace(/[,.]/g, ''));
                    
                    // Animate from 0 to the target value
                    animateValue(el, 0, targetValue, 2000, prefix, suffix);
                    
                    // Stop observing the element once the animation has started
                    observer.unobserve(el);
                }
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    statNumbers.forEach(number => {
        observer.observe(number);
    });
});