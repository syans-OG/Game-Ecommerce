
/**
 * Kontroler Utama Halaman Catalog.
 * Menangani fitur: Pagination, Filter Genre/Harga, Pencarian Live, dan Sorting.
 * Animasi: Menggunakan GSAP untuk entry animation pada komponen UI dan kartu game.
 */
document.addEventListener('DOMContentLoaded', () => {

    let currentPage = 1;
    const itemsPerPage = 9;
    let allGames = [];
    let filteredGames = [];

    const gameGrid = document.getElementById('gameGrid');
    const resultCount = document.getElementById('resultCount');
    const genreFiltersContainer = document.getElementById('genreFilters');
    const priceRangeInput = document.getElementById('priceRange');
    const priceValueDisplay = document.getElementById('priceValue');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const paginationControls = document.getElementById('paginationControls');

    /**
     * Memuat data game dan genre dari database dummy.
     * Memicu alur render awal dan animasi layout.
     */
    fetch('asset/dummy_game_store.json')
        .then(response => response.json())
        .then(data => {
            allGames = data.games;
            renderGenreFilters(data.genres);
            applyFilters();

            // Animasi masuk komponen katalog
            const tl = gsap.timeline();
            tl.from('.catalog-title', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' })
                .from('.catalog-subtitle', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
                .from('.filter-sidebar', { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
                .from('.search-sort-bar', { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.6');
        })
        .catch(err => console.error('Error loading data:', err));

    function renderGenreFilters(genreList) {
        genreFiltersContainer.innerHTML = '';
        genreList.forEach(genre => {
            const label = document.createElement('label');
            label.className = 'custom-checkbox';
            label.innerHTML = `
                <input type="checkbox" name="genre" value="${genre.id_genre}">
                <span class="checkmark"></span>
                ${genre.nama_genre}
            `;
            label.querySelector('input').addEventListener('change', applyFilters);
            genreFiltersContainer.appendChild(label);
        });
    }

    /**
     * Me-render kartu game ke grid berdasarkan halaman aktif (pagination).
     * Termasuk logika simulasi diskon random untuk keperluan demo UI.
     */
    function renderGames(games) {
        gameGrid.innerHTML = '';

        if (games.length === 0) {
            gameGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><h3>No games found matching your criteria.</h3></div>';
            resultCount.textContent = `Showing 0 results`;
            renderPagination(0);
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const gamesToShow = games.slice(startIndex, endIndex);

        gamesToShow.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';

            const isDiscounted = Math.random() > 0.7; // Simulasi diskon random
            const discountPercent = 20;
            const finalPrice = isDiscounted ? game.harga * 0.8 : game.harga;

            card.innerHTML = `
                <div class="card-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}" loading="lazy">
                </div>
                <div class="card-content">
                    <h3 class="card-title">${game.nama_game}</h3>
                    <div class="card-price-row">
                        <div class="price-info">
                            ${isDiscounted ? `<span class="price-original">Rp ${game.harga.toLocaleString()}</span>` : ''}
                            <span class="price-tag">Rp ${finalPrice.toLocaleString()}</span>
                            ${isDiscounted ? `<span class="discount-badge">-${discountPercent}%</span>` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-add-cart" onclick="addToCart('${game.id_game}')">Add to Cart</button>
                        <button class="btn-wishlist" onclick="toggleWishlist('${game.id_game}')">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="card-overlay-link" onclick="window.location.href='detail.html?id=${game.id_game}'" style="position:absolute; top:0; left:0; width:100%; height:280px; cursor:pointer; z-index: 1;"></div> 
            `;
            gameGrid.appendChild(card);
        });

        resultCount.textContent = `Showing ${startIndex + 1}–${Math.min(endIndex, games.length)} of ${games.length} results`;
        renderPagination(games.length);

        gsap.fromTo('.game-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' });
    }

    /**
     * Membangun kontrol navigasi halaman secara dinamis.
     */
    function renderPagination(totalItems) {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;

        const createBtn = (content, targetPage, isDisabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${isActive ? 'active' : ''}`;
            btn.innerHTML = content;
            btn.disabled = isDisabled;
            btn.onclick = () => goToPage(targetPage);
            return btn;
        };

        paginationControls.appendChild(createBtn('&lt;', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= totalPages; i++) {
            paginationControls.appendChild(createBtn(i, i, false, i === currentPage));
        }
        paginationControls.appendChild(createBtn('&gt;', currentPage + 1, currentPage === totalPages));
    }

    function goToPage(page) {
        currentPage = page;
        renderGames(filteredGames);
        document.querySelector('.catalog-layout').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Filter Kustom: Menggabungkan kriteria pencarian string, genre (checkbox), dan range harga.
     */
    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const selectedGenres = Array.from(document.querySelectorAll('input[name="genre"]:checked')).map(cb => cb.value);
        const maxPrice = parseInt(priceRangeInput.value);

        filteredGames = allGames.filter(game => {
            const matchesSearch = game.nama_game.toLowerCase().includes(query) || game.developer.toLowerCase().includes(query);
            const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(game.id_genre);
            const matchesPrice = game.harga <= maxPrice;
            return matchesSearch && matchesGenre && matchesPrice;
        });

        currentPage = 1;
        handleSort();
    }

    function handleSort() {
        const sortValue = sortSelect.value;
        if (sortValue === 'price-asc') filteredGames.sort((a, b) => a.harga - b.harga);
        else if (sortValue === 'price-desc') filteredGames.sort((a, b) => b.harga - a.harga);
        else if (sortValue === 'name-asc') filteredGames.sort((a, b) => a.nama_game.localeCompare(b.nama_game));
        else if (sortValue === 'date-new') filteredGames.sort((a, b) => new Date(b.tanggal_rilis) - new Date(a.tanggal_rilis));

        renderGames(filteredGames);
    }

    searchInput.addEventListener('input', applyFilters);
    priceRangeInput.addEventListener('input', (e) => {
        priceValueDisplay.textContent = `Rp 0 - Rp ${parseInt(e.target.value).toLocaleString()}`;
        applyFilters();
    });
    sortSelect.addEventListener('change', handleSort);

    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        priceRangeInput.value = 1000000;
        priceValueDisplay.textContent = 'Rp 1.000.000+';
        document.querySelectorAll('input[name="genre"]').forEach(cb => cb.checked = false);
        sortSelect.value = 'default';
        applyFilters();
    });

    /**
     * Integrasi dengan Global Cart System.
     */
    window.addToCart = (id) => {
        const game = allGames.find(g => g.id_game === id);
        if (game && window.cartApp) {
            const result = window.cartApp.add({
                id: game.id_game,
                title: game.nama_game,
                price: game.harga,
                image: game.gambar
            });
            if (window.cartUI) {
                window.cartUI.showNotification(result.message, result.success);
                if (result.success) window.cartUI.open();
            }
        }
    };

    window.toggleWishlist = (id) => alert("Wishlist feature coming soon!");

    // Smooth Scroll dengan Lenis
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({ duration: 1.2, smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }
});

