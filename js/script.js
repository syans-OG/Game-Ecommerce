
/**
 * Main Application Script (Homepage).
 * Orkestra utama untuk fitur: Smooth Scroll (Lenis), Dynamic Rendering, Carousel, 
 * Navigasi Interaktif, dan Animasi Khusus (Genre Rotation).
 */
let lenis;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Bootstrapping Aplikasi.
 * Menangani aliran data asinkron dan inisialisasi semua library pihak ketiga (GSAP, Lenis).
 */
async function initApp() {
    try {
        const data = await fetchGameData();
        if (data && data.games) {
            renderHero(data.games);
            renderFeatured(data.games);
            renderRecommended(data.games);

            initGenreRotation(data);
        }

        initSmoothScroll();
        initNavigation();
        initHeroCarousel();
        initFeaturedCarousel();
        initRecommendedCarousel();
        initReviewsCarousel();
        initUtilities();

        if (window.appLoader) {
            window.appLoader.hide();
        }

    } catch (error) {
        console.error("Failed to initialize app:", error);
        if (window.appLoader) {
            window.appLoader.hide();
        }
    }
}

/**
 * Setup Smooth Scrolling menggunakan Lenis.
 * Integrasi: Sinkronisasi dengan GSAP ScrollTrigger untuk performa animasi scroll.
 */
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Anchor links with smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            lenis.scrollTo(this.getAttribute('href'));
        });
    });
}

/**
 * Mengambil data game dari file JSON lokal.
 */
async function fetchGameData() {
    try {
        const response = await fetch('../asset/dummy_game_store.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch game data:", error);
        return null;
    }
}

/**
 * Render Hero Slider (Top 6 Games).
 */
function renderHero(games) {
    const heroTrack = document.getElementById('heroTrack');
    const heroDots = document.getElementById('heroDots');
    if (!heroTrack || !heroDots) return;

    const heroGames = games.slice(0, 6);
    heroTrack.innerHTML = '';
    heroDots.innerHTML = '';

    heroGames.forEach((game, index) => {
        const variants = ['variant-left', 'variant-center', 'variant-right'];
        const variant = variants[index % variants.length];
        const isActive = index === 0 ? 'active' : '';

        const slideHTML = `
            <div class="slide ${variant} ${isActive}">
                <div class="slide-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}">
                    <div class="gradient-overlay"></div>
                </div>
                <div class="slide-content">
                    <h1 class="game-title">${game.nama_game.toUpperCase()}</h1>
                    <p class="game-desc">${game.deskripsi}</p>
                    <button class="btn-primary" onclick="window.location.href='detail.html?id=${game.id_game}'">VIEW DETAIL</button>
                </div>
            </div>
        `;
        heroTrack.innerHTML += slideHTML;

        const dotHTML = `<span class="dot ${isActive}" data-index="${index}"></span>`;
        heroDots.innerHTML += dotHTML;
    });
}

/**
 * Render section Featured Collections.
 */
function renderFeatured(games) {
    const track = document.getElementById('featuredTrack');
    if (!track) return;

    const featuredGames = games.slice(0, 6);
    track.innerHTML = '';
    featuredGames.forEach(game => {
        const html = `
            <div class="game-card" onclick="window.location.href='detail.html?id=${game.id_game}'">
                <div class="card-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}">
                </div>
                <h3 class="card-title">${game.nama_game.toUpperCase()}</h3>
            </div>
        `;
        track.innerHTML += html;
    });
}

/**
 * Render section Recommended for you.
 */
function renderRecommended(games) {
    const track = document.getElementById('recTrack');
    if (!track) return;

    const recommendedGames = games.slice(0, 8);
    track.innerHTML = '';
    recommendedGames.forEach(game => {
        const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(game.harga);

        const html = `
            <div class="rec-card">
                <div class="rec-card-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}" onclick="window.location.href='detail.html?id=${game.id_game}'" style="cursor:pointer">
                </div>
                <div class="rec-card-info">
                    <h3 class="rec-card-title" onclick="window.location.href='detail.html?id=${game.id_game}'" style="cursor:pointer">${game.nama_game.toUpperCase()}</h3>
                    <p class="rec-card-price">${price}</p>
                </div>
                <div class="rec-card-actions">
                    <button class="btn-add-cart" onclick='window.cartApp.add({id: "${game.id_game}", title: "${game.nama_game}", price: ${game.harga}, image: "${game.gambar}"}); window.cartUI.open();'>ADD TO CART</button>
                    <button class="btn-wishlist">&#9825;</button>
                </div>
            </div>
        `;
        track.innerHTML += html;
    });
}

/**
 * Manajemen Navigasi & Status Login.
 */
function initNavigation() {
    const btnLogin = document.getElementById('btnLogin');
    const mobileBtn = document.getElementById('btnMobileMenu');
    const navLinks = document.querySelector('.nav-links');

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    const currentUser = (typeof AuthService !== 'undefined') ? AuthService.getCurrentUser() : null;

    if (btnLogin) {
        if (currentUser) {
            btnLogin.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
            btnLogin.setAttribute('aria-label', `Logged in as ${currentUser.username}`);
            btnLogin.title = "Click to Logout";
        } else {
            btnLogin.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
            btnLogin.setAttribute('aria-label', 'Login');
            btnLogin.title = "Login";
        }

        btnLogin.addEventListener('click', () => {
            if (currentUser) {
                if (confirm(`Logout from ${currentUser.username}?`)) {
                    AuthService.logout();
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('svg');
            if (navLinks.classList.contains('active')) {
                icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
            } else {
                icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
            }
        });
    }
}

/**
 * Carousel Hero Section dengan Auto-slide.
 */
function initHeroCarousel() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const carouselContainer = document.querySelector('.hero-carousel');

    if (slides.length === 0) return;

    let currentSlide = 0;
    const totalSlides = slides.length;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (index >= totalSlides) currentSlide = 0;
        else if (index < 0) currentSlide = totalSlides - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    if (nextBtn) nextBtn.onclick = () => { nextSlide(); resetTimer(); };
    if (prevBtn) prevBtn.onclick = () => { prevSlide(); resetTimer(); };

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            showSlide(index);
            resetTimer();
        });
    });

    function startTimer() { slideInterval = setInterval(nextSlide, 5000); }
    function stopTimer() { clearInterval(slideInterval); }
    function resetTimer() { stopTimer(); startTimer(); }

    if (carouselContainer) {
        carouselContainer.onmouseenter = stopTimer;
        carouselContainer.onmouseleave = startTimer;
    }

    startTimer();
}

/**
 * Slide Controller untuk Featured Collections.
 */
function initFeaturedCarousel() {
    const featuredTrack = document.getElementById('featuredTrack');
    const featPrev = document.getElementById('featPrev');
    const featNext = document.getElementById('featNext');

    if (featuredTrack && featPrev && featNext) {
        const cards = featuredTrack.children;
        if (cards.length === 0) return;

        let featIndex = 0;
        const cardWidth = 240;
        const totalCards = cards.length;
        const visibleCards = 3;

        function updateFeaturedSlide() {
            const maxIndex = totalCards - visibleCards > 0 ? totalCards - visibleCards : 0;
            if (featIndex > maxIndex) featIndex = 0;
            const translateX = -(featIndex * cardWidth);
            featuredTrack.style.transform = `translateX(${translateX}px)`;
        }

        featNext.onclick = () => {
            const maxIndex = totalCards - visibleCards > 0 ? totalCards - visibleCards : 0;
            featIndex = (featIndex < maxIndex) ? featIndex + 1 : 0;
            updateFeaturedSlide();
        };

        featPrev.onclick = () => {
            const maxIndex = totalCards - visibleCards > 0 ? totalCards - visibleCards : 0;
            featIndex = (featIndex > 0) ? featIndex - 1 : maxIndex;
            updateFeaturedSlide();
        };
    }
}

/**
 * Slide Controller untuk Recommended Games.
 */
function initRecommendedCarousel() {
    const recTrack = document.getElementById('recTrack');
    const recPrev = document.getElementById('recPrev');
    const recNext = document.getElementById('recNext');

    if (recTrack && recPrev && recNext) {
        const cards = recTrack.children;
        if (cards.length === 0) return;

        let recIndex = 0;
        const recCardWidth = 270;
        const recTotalCards = cards.length;
        const recVisibleCards = 4;

        function updateRecSlide() {
            const maxIndex = recTotalCards - recVisibleCards > 0 ? recTotalCards - recVisibleCards : 0;
            const translateX = -(recIndex * recCardWidth);
            recTrack.style.transform = `translateX(${translateX}px)`;
        }

        recNext.onclick = () => {
            const maxIndex = recTotalCards - recVisibleCards > 0 ? recTotalCards - recVisibleCards : 0;
            recIndex = (recIndex < maxIndex) ? recIndex + 1 : 0;
            updateRecSlide();
        };

        recPrev.onclick = () => {
            const maxIndex = recTotalCards - recVisibleCards > 0 ? recTotalCards - recVisibleCards : 0;
            recIndex = (recIndex > 0) ? recIndex - 1 : maxIndex;
            updateRecSlide();
        };
    }
}

/**
 * Carousel Testimoni/Reviews dengan focus highlight.
 */
function initReviewsCarousel() {
    const reviewTrack = document.getElementById('reviewTrack');
    const revPrev = document.getElementById('revPrev');
    const revNext = document.getElementById('revNext');
    const reviewWrapper = document.querySelector('.review-carousel-wrapper');

    if (reviewTrack && revPrev && revNext && reviewWrapper) {
        const cards = Array.from(reviewTrack.children);
        if (cards.length === 0) return;

        let revIndex = 2;
        const cardWidth = 350;
        const gap = 30;

        function updateReviewSlide() {
            const wrapperWidth = reviewWrapper.clientWidth;
            const centerOffset = wrapperWidth / 2;
            const cardCenter = cardWidth / 2;
            const targetLeft = revIndex * (cardWidth + gap);
            const translateX = centerOffset - cardCenter - targetLeft;

            reviewTrack.style.transform = `translateX(${translateX}px)`;
            cards.forEach((card, index) => {
                card.classList.toggle('active', index === revIndex);
            });
        }

        updateReviewSlide();
        window.addEventListener('resize', updateReviewSlide);

        revNext.onclick = () => { revIndex = (revIndex < cards.length - 1) ? revIndex + 1 : 0; updateReviewSlide(); };
        revPrev.onclick = () => { revIndex = (revIndex > 0) ? revIndex - 1 : cards.length - 1; updateReviewSlide(); };
    }
}

/**
 * Utilitas tambahan (Back to Top).
 */
function initUtilities() {
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 300);
        });

        backToTopBtn.onclick = () => {
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

/**
 * Fitur 'Genre Rotation' dengan Scramble Text & Image Fade.
 */
function initGenreRotation(data) {
    if (!data || !data.genres || !data.games) return;

    const topGenres = data.genres.slice(0, 3);
    const rotationData = topGenres.map(genre => {
        const game = data.games.find(g => g.id_genre === genre.id_genre);
        return {
            name: genre.nama_genre,
            image: game ? '../' + game.gambar : '../asset/image_for_dummy/image_7.jpg'
        };
    });

    const titleLeftEl = document.querySelector('.genre-title-left');
    const titleRightEl = document.querySelector('.genre-title-right');
    const bgContainer = document.querySelector('.genre-bg');
    let bgImg = bgContainer ? bgContainer.querySelector('img') : null;

    if (!titleLeftEl || !titleRightEl || !bgImg) return;

    let currentIndex = 0;
    const intervalDuration = 5000;

    function scrambleText(element, newText) {
        if (!element) return;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
        const duration = 1.0;
        const targetText = newText.toUpperCase();
        const originalText = element.innerText;
        const progressObj = { value: 0 };

        gsap.to(progressObj, {
            value: 1,
            duration: duration,
            ease: "power2.inOut",
            onUpdate: () => {
                const p = progressObj.value;
                let result = "";
                const len = Math.max(originalText.length, targetText.length);
                for (let i = 0; i < len; i++) {
                    if (i < targetText.length * p) result += targetText[i];
                    else if (i < targetText.length) result += chars[Math.floor(Math.random() * chars.length)];
                }
                element.innerText = result;
            },
            onComplete: () => { element.innerText = targetText; }
        });
    }

    function animateImage(newSrc) {
        gsap.to(bgImg, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                bgImg.src = newSrc;
                gsap.to(bgImg, { opacity: 1, duration: 0.8 });
            }
        });
    }

    function renderGenre(index) {
        const item = rotationData[index];
        scrambleText(titleLeftEl, item.name);
        scrambleText(titleRightEl, "GAMES");
        animateImage(item.image);
    }

    renderGenre(currentIndex);
    setInterval(() => {
        currentIndex = (currentIndex + 1) % rotationData.length;
        renderGenre(currentIndex);
    }, intervalDuration);
}
