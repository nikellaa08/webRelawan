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

    // --- Event and Category Filtering (New Feature) ---
    const eventFilterContainer = document.getElementById('event-filter-container');
    const eventListContainer = document.getElementById('event-list-container');
    let allEvents = []; // To store all fetched events

    // Helper to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Fetch Categories
    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const categories = await response.json();
            renderCategories(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            if (eventFilterContainer) {
                eventFilterContainer.innerHTML = '<p class="error-message">Gagal memuat kategori.</p>';
            }
        }
    }

    // Render Categories Filter Buttons
    function renderCategories(categories) {
        if (!eventFilterContainer) return;

        eventFilterContainer.innerHTML = ''; // Clear previous buttons

        // Add "All" button
        const allButton = document.createElement('button');
        allButton.textContent = 'Semua Kategori';
        allButton.classList.add('btn', 'btn-category', 'active');
        allButton.dataset.categoryId = 'all';
        allButton.addEventListener('click', () => filterEvents('all'));
        eventFilterContainer.appendChild(allButton);

        // Add category buttons
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.name;
            button.classList.add('btn', 'btn-category');
            button.dataset.categoryId = category.id;
            button.addEventListener('click', () => filterEvents(category.id));
            eventFilterContainer.appendChild(button);
        });
    }

    // Fetch Events
    async function fetchEvents() {
        if (!eventListContainer) return;
        eventListContainer.innerHTML = '<p class="loading-message">Memuat event...</p>';
        try {
            const response = await fetch('/api/events');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allEvents = await response.json();
            renderEvents(allEvents); // Render all events initially
        } catch (error) {
            console.error('Error fetching events:', error);
            eventListContainer.innerHTML = '<p class="error-message">Gagal memuat event.</p>';
        }
    }

    // Render Event Cards
    function renderEvents(eventsToRender) {
        if (!eventListContainer) return;
        eventListContainer.innerHTML = ''; // Clear previous events

        if (eventsToRender.length === 0) {
            eventListContainer.innerHTML = '<p class="no-results-message">Tidak ada event yang ditemukan.</p>';
            return;
        }

        eventsToRender.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('card', 'event-card');
            // Assuming default image if no image is provided, or you can add an image field to your DB
            const imageUrl = event.image_url || 'https://via.placeholder.com/300x200?text=Event+Image'; 
            
            eventCard.innerHTML = `
                <img src="${imageUrl}" alt="${event.name}" loading="lazy">
                <div class="card-content">
                    <h3>${event.name}</h3>
                    <p class="event-category">${event.category_name || 'Uncategorized'}</p>
                    <div class="event-info">
                        <span class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                        <span class="event-date"><i class="fas fa-calendar-alt"></i> ${formatDate(event.date)}</span>
                    </div>
                    <p class="event-description">${event.description ? event.description.substring(0, 100) + '...' : ''}</p>
                    <a href="/events/${event.id}" class="btn btn-primary btn-sm">Detail</a>
                </div>
            `;
            eventListContainer.appendChild(eventCard);
        });
    }

<<<<<<< HEAD
    // Filter Events
    function filterEvents(categoryId) {
        const filtered = categoryId === 'all'
            ? allEvents
            : allEvents.filter(event => event.category_id == categoryId);
        renderEvents(filtered);

        // Update active button style
        document.querySelectorAll('.btn-category').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`.btn-category[data-category-id="${categoryId}"]`).classList.add('active');
    }

    // Initialize event and category loading if containers exist
    if (eventFilterContainer && eventListContainer) {
        fetchCategories();
        fetchEvents();
=======
    statNumbers.forEach(number => {
        observer.observe(number);
    });

    // --- Lingkungan Page Registration Form Logic ---
    const locationPointSelect = document.getElementById('locationPoint');
    const otherLocationPointInput = document.getElementById('otherLocationPoint');

    if (locationPointSelect && otherLocationPointInput) {
        function toggleOtherLocationPointField() {
            if (locationPointSelect.value === 'lainnya') {
                otherLocationPointInput.style.display = 'block';
                otherLocationPointInput.setAttribute('required', 'required');
            } else {
                otherLocationPointInput.style.display = 'none';
                otherLocationPointInput.removeAttribute('required');
                otherLocationPointInput.value = ''; // Clear the input when hidden
            }
        }

        locationPointSelect.addEventListener('change', toggleOtherLocationPointField);
        // Initial call to set correct visibility based on default selected value
        toggleOtherLocationPointField();
    }

    // Handle form submission for 'cleanUpRegistrationForm'
    const cleanUpRegistrationForm = document.getElementById('cleanUpRegistrationForm');
    if (cleanUpRegistrationForm) {
        cleanUpRegistrationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            // Here you would typically send the form data to a server
            console.log('Form Submitted!', new FormData(cleanUpRegistrationForm));
            alert('Terima kasih! Pendaftaran Anda untuk Aksi Bersih Lingkungan telah kami terima.');
            
            // Navigate back to the previous page
            setTimeout(function() {
                window.history.back();
            }, 500); // Small delay to allow user to see the alert
        });
>>>>>>> d5b234de8bd880f5ea5b9a1dbba88a643eb0c03c
    }
});