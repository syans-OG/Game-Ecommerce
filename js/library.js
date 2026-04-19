
/**
 * Kontroler Halaman Library User.
 * Menampilkan koleksi game yang sudah dimiliki, status instalasi, dan durasi bermain.
 */
document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('libraryGrid');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const filterStatusSelect = document.getElementById('filterStatus');
    const btnGrid = document.getElementById('viewGrid');
    const btnList = document.getElementById('viewList');
    const emptyState = document.getElementById('libraryEmptyState');

    let myGames = [];
    let currentView = 'grid';

    /**
     * Memuat data games dan mensimulasikan status 'Owned' untuk 8 game pertama.
     * Integrasi: Mengambil metadata (gambar, judul) dari master JSON.
     */
    fetch('../asset/dummy_game_store.json')
        .then(res => res.json())
        .then(data => {
            myGames = data.games.slice(0, 8).map(game => ({
                ...game,
                purchaseDate: new Date(Date.now() - Math.random() * 10000000000),
                playtime: Math.floor(Math.random() * 100),
                installed: Math.random() > 0.5
            }));
            renderLibrary();
        })
        .catch(err => console.error("Error loading library:", err));

    /**
     * Render daftar koleksi ke DOM.
     * Logic: Membedakan tombol aksi antara 'Resume' (Play) dan 'Download' berdasarkan status instalasi.
     */
    function renderLibrary() {
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
            card.className = `game-card ${currentView === 'list' ? 'list-mode-item' : ''}`;

            const actionBtn = game.installed
                ? `<button class="btn-download btn-play">Resume</button>`
                : `<button class="btn-download">Download</button>`;

            const statusMarkup = game.installed
                ? `<div class="lib-status-badge installed"><span>&#10003;</span> Installed</div>`
                : `<div class="lib-status-badge">Not Installed</div>`;

            card.innerHTML = `
                <div class="card-image">
                    <img src="../${game.gambar}" alt="${game.nama_game}" loading="lazy">
                </div>
                <div class="card-content">
                    <div class="card-info-main">
                        <h3 class="card-title">${game.nama_game}</h3>
                        <div class="lib-date">Purchased: ${game.purchaseDate.toLocaleDateString()}</div>
                    </div>
                    <div class="card-meta">
                        <div class="lib-playtime">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                           ${game.playtime} Hours Played
                        </div>
                        ${statusMarkup}
                    </div>
                    <div class="card-actions-library">
                        ${actionBtn}
                        <button class="btn-wishlist" style="width:36px;height:36px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </button>
                    </div>
                </div>
                <div class="card-overlay-link" onclick="window.location.href='detail.html?id=${game.id_game}'" style="position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer; z-index:0;"></div>
            `;

            // Mencegah navigasi ke detail saat tombol aksi diklik
            card.querySelectorAll('button').forEach(btn => {
                btn.style.position = 'relative';
                btn.style.zIndex = '2';
                btn.onclick = (e) => { e.stopPropagation(); alert(`${btn.innerText} ing ${game.nama_game}...`); };
            });

            grid.appendChild(card);
        });

        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.game-card', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' });
        }
    }

    /**
     * Fitur Pencarian & Filter Status Instalasi.
     */
    function filterGames() {
        const query = searchInput.value.toLowerCase();
        const status = filterStatusSelect.value;
        return myGames.filter(game => {
            const matchesSearch = game.nama_game.toLowerCase().includes(query);
            const matchesStatus = (status === 'all') || (status === 'installed' && game.installed);
            return matchesSearch && matchesStatus;
        });
    }

    function sortGames(games) {
        const mode = sortSelect.value;
        if (mode === 'name-asc') games.sort((a, b) => a.nama_game.localeCompare(b.nama_game));
        else if (mode === 'date-purchased') games.sort((a, b) => b.purchaseDate - a.purchaseDate);
        else games.sort((a, b) => b.playtime - a.playtime);
    }

    // Toggle View Mode (Grid / List)
    btnGrid.addEventListener('click', () => { currentView = 'grid'; grid.classList.remove('list-view'); btnGrid.classList.add('active'); btnList.classList.remove('active'); renderLibrary(); });
    btnList.addEventListener('click', () => { currentView = 'list'; grid.classList.add('list-view'); btnList.classList.add('active'); btnGrid.classList.remove('active'); renderLibrary(); });

    searchInput.addEventListener('input', renderLibrary);
    sortSelect.addEventListener('change', renderLibrary);
    filterStatusSelect.addEventListener('change', renderLibrary);
});
