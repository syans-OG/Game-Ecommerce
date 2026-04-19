
/**
 * Kontroler Halaman Detail Game.
 * Menangani: Display info produk, galeri gambar, pengecekan kepemilikan (Library), 
 * dan rekomendasi game serupa (carousel).
 */
const CURRENT_USER_ID = "u1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6";
let globalGameData = null;
let currentGame = null;

document.addEventListener('DOMContentLoaded', () => {
    initDetailApp();
});

/**
 * Inisialisasi utama: Mengambil ID dari URL, fetch data, dan trigger render komponen.
 */
async function initDetailApp() {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');

    if (!gameId) {
        showError("No game ID specified.");
        return;
    }

    try {
        const response = await fetch('../asset/dummy_game_store.json');
        const data = await response.json();
        globalGameData = data;

        const game = data.games.find(g => g.id_game === gameId);
        if (!game) {
            showError("Game not found.");
            return;
        }

        currentGame = game;

        renderGameDetails(game, data);
        renderAdditionalInfo(game, data);
        setupInteractions(game);
        renderSimilarGames(game, data.games);
        checkOwnership(game, data.library);
        initSimilarCarousel();

    } catch (error) {
        console.error(error);
        showError("Failed to load game data.");
    }
}

/**
 * Mengisi konten statis halaman (Judul, Harga, Hero Image, Deskripsi).
 */
function renderGameDetails(game, data) {
    setText('gameTitle', game.nama_game.toUpperCase());
    setText('gameDescShort', game.deskripsi);

    const genreObj = data.genres.find(g => g.id_genre === game.id_genre);
    setText('gameGenre', genreObj ? genreObj.nama_genre : "Action");
    setText('gameDev', game.developer);

    const setImg = (id, src) => { const el = document.getElementById(id); if (el) el.src = '../' + src; };
    setImg('heroBgImage', game.gambar);
    setImg('mainImage', game.gambar);
    setImg('sidebarImage', game.gambar);

    const priceText = formatPrice(game.harga);
    setText('heroPrice', priceText);
    setText('sidebarPrice', priceText);
    setText('sidebarTitle', game.nama_game);
    setText('sidebarDev', game.developer);
    setText('sidebarPub', game.publisher);
    setText('sidebarDate', game.tanggal_rilis.split('-')[0]);

    // Render Galeri Thumbnail
    const galleryThumbs = document.getElementById('galleryThumbs');
    if (galleryThumbs) {
        const dummyImgs = ['../' + game.gambar, '../asset/image_for_dummy/image_1.jpg', '../asset/image_for_dummy/image_2.png'];
        galleryThumbs.innerHTML = dummyImgs.map((src, idx) => `
            <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${src}', this)">
                <img src="${src}" alt="Thumb">
            </div>
        `).join('');
    }
}

/**
 * Menangani tab untuk Persyaratan Sistem (Minimum vs Recommended).
 */
function renderAdditionalInfo(game, data) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.sys-req-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => { c.style.display = 'none'; c.classList.remove('active'); });

            tab.classList.add('active');
            const targetId = tab.dataset.tab === 'min' ? 'reqMin' : 'reqRec';
            const target = document.getElementById(targetId);
            if (target) { target.style.display = 'block'; target.classList.add('active'); }
        });
    });
}

/**
 * Menampilkan game serupa berdasarkan genre yang sama.
 */
function renderSimilarGames(currentGame, allGames) {
    const track = document.getElementById('similarTrack');
    if (!track) return;

    const similar = allGames.filter(g => g.id_genre === currentGame.id_genre && g.id_game !== currentGame.id_game);
    const combined = [...similar, ...allGames].slice(0, 8); // Fallback jika sedikit yg serupa

    track.innerHTML = combined.map(game => `
         <div class="rec-card">
            <div class="rec-card-image">
                <a href="detail.html?id=${game.id_game}"><img src="../${game.gambar}" alt="${game.nama_game}"></a>
            </div>
            <div class="rec-card-info">
                <h3 class="rec-card-title">${game.nama_game.toUpperCase()}</h3>
                <p class="rec-card-price">${formatPrice(game.harga)}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Keamanan Data: Mengecek apakah user sudah memiliki game ini.
 * Jika sudah punya, tombol beli diganti menjadi 'Play Now' atau dinonaktifkan.
 */
function checkOwnership(game, library) {
    const owned = library.some(item => item.id_user === CURRENT_USER_ID && item.id_game === game.id_game);
    if (owned) {
        const heroBtn = document.getElementById('heroAddToCart');
        if (heroBtn) { heroBtn.textContent = "IN LIBRARY"; heroBtn.disabled = true; heroBtn.style.backgroundColor = "#4CAF50"; }
        const sidebarBtn = document.getElementById('sidebarAddToCart');
        if (sidebarBtn) { sidebarBtn.textContent = "PLAY NOW"; sidebarBtn.style.backgroundColor = "#4CAF50"; }
        const badge = document.getElementById('ownedBadge');
        if (badge) badge.style.display = 'block';
    }
}

/**
 * Menangani interaksi Keranjang dan Wishlist pada halaman detail.
 */
function setupInteractions(game) {
    const btns = [document.getElementById('heroAddToCart'), document.getElementById('sidebarAddToCart')];
    btns.forEach(btn => {
        if (!btn) return;
        if (window.cartApp && window.cartApp.hasItem(game.id_game)) {
            btn.textContent = "IN CART"; btn.disabled = true;
        }

        btn.addEventListener('click', () => {
            if (btn.disabled || !window.cartApp) return;
            const res = window.cartApp.add({ id: game.id_game, title: game.nama_game, price: game.harga, image: game.gambar });
            if (res.success) {
                btn.textContent = "ADDED!";
                setTimeout(() => { btn.textContent = "IN CART"; btn.disabled = true; }, 1000);
            }
        });
    });
}

function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function formatPrice(price) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price); }

/**
 * Switcher gambar utama galeri dengan efek fade smooth.
 */
window.changeMainImage = function (src, el) {
    const main = document.getElementById('mainImage');
    if (main) {
        main.style.opacity = 0;
        setTimeout(() => { main.src = src; main.style.opacity = 1; }, 200);
    }
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
}

/**
 * Logic Slider/Carousel untuk section 'Game Serupa'.
 */
function initSimilarCarousel() {
    const track = document.getElementById('similarTrack');
    const prev = document.getElementById('simPrev');
    const next = document.getElementById('simNext');
    if (!track || !prev || !next) return;

    let index = 0;
    const cardWidth = 270;
    const visible = 4;

    next.onclick = () => { index = (index + 1) > (track.children.length - visible) ? 0 : index + 1; track.style.transform = `translateX(${-index * cardWidth}px)`; };
    prev.onclick = () => { index = (index - 1) < 0 ? (track.children.length - visible) : index - 1; track.style.transform = `translateX(${-index * cardWidth}px)`; };
}
