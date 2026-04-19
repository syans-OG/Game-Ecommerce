
/**
 * Inisialisasi halaman Wishlist.
 * Menangani pemuatan data dari dummy JSON dan sinkronisasi dengan localStorage 'wishlist'.
 */
document.addEventListener('DOMContentLoaded', () => {
    let allGames = [];
    let wishlistGames = [];
    let currentView = 'grid';

    const grid = document.getElementById('wishlistGrid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const btnGrid = document.getElementById('viewGrid');
    const btnList = document.getElementById('viewList');
    const emptyState = document.getElementById('wishlistEmptyState');

    /**
     * Load data master game sebagai referensi detail info produk.
     */
    fetch('asset/dummy_game_store.json')
        .then(res => res.json())
        .then(data => {
            allGames = data.games;
            loadWishlist();
            renderWishlist();
        })
        .catch(err => console.error("Error loading wishlist data:", err));

    /**
     * Memfilter data master berdasarkan ID yang tersimpan di localStorage 'wishlist'.
     */
    function loadWishlist() {
        const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        wishlistGames = allGames.filter(game => storedWishlist.some(id => id == game.id_game));

        wishlistGames.forEach(g => {
            if (!g.dateAddedToWishlist) {
                g.dateAddedToWishlist = Date.now();
            }
        });
    }

    /**
     * Render kartu game ke dalam grid/list.
     * Termasuk logika perhitungan diskon dan animasi entry menggunakan GSAP.
     */
    function renderWishlist() {
        const filtered = filterGames();
        grid.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        sortGames(filtered);

        filtered.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card ' + (currentView === 'list' ? 'list-mode-item' : '');

            const isDiscounted = game.diskon > 0;
            const finalPrice = isDiscounted ? (game.harga * (100 - game.diskon) / 100) : game.harga;
            const priceDisplay = finalPrice === 0 ? 'Free' : 'Rp ' + finalPrice.toLocaleString('id-ID');

            const discountBadge = isDiscounted ? `<span class="discount-badge">-${game.diskon}%</span>` : '';
            const originalPriceDisplay = isDiscounted ? `<span class="price-original">Rp ${game.harga.toLocaleString('id-ID')}</span>` : '';

            card.innerHTML = `
                <div class="card-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}" loading="lazy">
                </div>
                <div class="card-content">
                    <div class="card-info-main">
                        <h3 class="card-title">${game.nama_game}</h3>
                    </div>
                    <div class="card-meta">
                         <div class="card-price-row">
                            ${discountBadge}
                            <div class="price-tag">
                                ${originalPriceDisplay}
                                ${priceDisplay}
                            </div>
                        </div>
                    </div>
                    <div class="card-actions-wishlist">
                        <button class="btn-add-cart" onclick="addToCart('${game.id_game}')">Add to Cart</button>
                        <button class="btn-remove-wishlist" onclick="removeFromWishlist('${game.id_game}')" title="Remove from Wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
                <div class="card-overlay-link" onclick="window.location.href='detail.html?id=${game.id_game}'" style="position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer; z-index:0;"></div>
            `;

            card.querySelectorAll('button').forEach(btn => {
                btn.style.position = 'relative';
                btn.style.zIndex = '2';
                btn.addEventListener('click', (e) => e.stopPropagation());
            });

            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.game-card',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }

    /**
     * Menghapus ID game dari localStorage dan me-refresh tampilan.
     */
    window.removeFromWishlist = function (id) {
        let storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        storedWishlist = storedWishlist.filter(wId => wId != id);
        localStorage.setItem('wishlist', JSON.stringify(storedWishlist));
        loadWishlist();
        renderWishlist();
    };

    /**
     * Integrasi dengan sistem keranjang belanja.
     * Menyimpan data item (id, qty) ke 'cart' di localStorage.
     */
    window.addToCart = function (id) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.find(item => item.id == id)) {
            alert("This game is already in your cart!");
        } else {
            cart.push({ id: id, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));

            const badge = document.querySelector('.badgemart');
            if (badge) badge.innerText = cart.length;

            alert("Added to cart!");
        }
    };

    function filterGames() {
        const query = searchInput.value.toLowerCase();
        return wishlistGames.filter(game => game.nama_game.toLowerCase().includes(query));
    }

    function sortGames(games) {
        const sortMode = sortSelect.value;
        if (sortMode === 'name-asc') {
            games.sort((a, b) => a.nama_game.localeCompare(b.nama_game));
        } else if (sortMode === 'price-asc') {
            const getPrice = (g) => g.harga * ((100 - g.diskon) / 100);
            games.sort((a, b) => getPrice(a) - getPrice(b));
        } else {
            games.sort((a, b) => b.dateAddedToWishlist - a.dateAddedToWishlist);
        }
    }

    btnGrid.addEventListener('click', () => {
        currentView = 'grid';
        grid.classList.remove('list-view');
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
        renderWishlist();
    });

    btnList.addEventListener('click', () => {
        currentView = 'list';
        grid.classList.add('list-view');
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
        renderWishlist();
    });

    searchInput.addEventListener('input', renderWishlist);
    sortSelect.addEventListener('change', renderWishlist);
});

