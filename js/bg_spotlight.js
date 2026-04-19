
/**
 * Komponen Efek Visual 'Spotlight'.
 * Membuat efek senter/highlight interaktif yang mengikuti kursor mouse.
 * Terdiri dari layer redup (dim) dan layer terang (lit) yang di-masking secara dinamis.
 */
const SpotlightEffect = {
    container: null,
    dimLayer: null,
    litLayer: null,
    glowLayer: null,

    gridSize: 180, // Ukuran grid gambar latar

    images: [
        '../asset/image_for_dummy/image_1.jpg',
        '../asset/image_for_dummy/image_2.png',
        '../asset/image_for_dummy/image_3.png',
        '../asset/image_for_dummy/image_4.jpg',
        '../asset/image_for_dummy/image_5.jpg',
        '../asset/image_for_dummy/image_6.jpg',
        '../asset/image_for_dummy/image_7.jpg'
    ],

    init: function () {
        this.setupContainer();
        this.createLayers();
        this.addEventListeners();
    },

    /**
     * Reset dan persiapan container DOM.
     * Menghapus efek background lama jika ada konflik.
     */
    setupContainer: function () {
        ['bg-spotlight', 'bg-cards-container', 'bg-magnetic', 'bg-aurora', 'bg-embers', 'bg-rays', 'bg-gradient'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });

        this.container = document.createElement('div');
        this.container.id = 'bg-spotlight';
        this.container.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            overflow: hidden;
            z-index: 0;
            background: #151520; /* Dark base */
        `;

        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.insertBefore(this.container, authContainer.firstChild);
            authContainer.style.background = 'transparent';
        }
    },

    /**
     * Membuat 3 layer utama:
     * 1. Dim Layer: Gambar gelap/grayscale (background).
     * 2. Lit Layer: Gambar berwarna/terang (foreground, masked).
     * 3. Glow Layer: Efek cahaya kuning emas samar di atas spotlight.
     */
    createLayers: function () {
        const cols = Math.ceil(window.innerWidth / this.gridSize);
        const rows = Math.ceil(window.innerHeight / (this.gridSize * 1.3));
        const total = cols * rows;

        let gridHtml = '';
        for (let i = 0; i < total; i++) {
            const img = this.images[i % this.images.length];
            gridHtml += `<div class="spotlight-item"><img src="${img}" loading="lazy"></div>`;
        }


        this.dimLayer = document.createElement('div');
        this.dimLayer.className = 'spotlight-layer dim';
        this.dimLayer.innerHTML = gridHtml;


        this.litLayer = document.createElement('div');
        this.litLayer.className = 'spotlight-layer lit';
        this.litLayer.innerHTML = gridHtml;

        this.glowLayer = document.createElement('div');
        this.glowLayer.id = 'spotlight-glow';

        this.container.appendChild(this.dimLayer);
        this.container.appendChild(this.litLayer);
        this.container.appendChild(this.glowLayer);


        // Inject CSS dinamis untuk masking dan layout grid
        const style = document.createElement('style');
        style.textContent = `
            .spotlight-layer {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                display: grid;
                grid-template-columns: repeat(${cols}, 1fr);
                gap: 0;
            }
            .spotlight-item {
                overflow: hidden;
                position: relative;
                border: 1px solid rgba(255,255,255,0.02);
            }
            .spotlight-item img {
                width: 100%; height: 100%; object-fit: cover;
                transition: transform 0.4s ease;
            }
            
            .spotlight-layer.dim .spotlight-item img {
                opacity: 0.4;
                filter: grayscale(100%) sepia(1) hue-rotate(200deg) saturate(2) brightness(0.6); 
            }


            /* Masking radial untuk efek senter */
            .spotlight-layer.lit {
                mask-image: radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), black 0%, transparent 100%);
                -webkit-mask-image: radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), black 0%, transparent 100%);
            }
            .spotlight-layer.lit .spotlight-item img {
                filter: brightness(1.1) contrast(1.1);
                transform: scale(1.1);
            }


            #spotlight-glow {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none;
                z-index: 2;
                background: radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), rgba(255, 215, 0, 0.15) 0%, transparent 70%);
                mix-blend-mode: screen;
            }
        `;
        this.container.appendChild(style);
    },

    /**
     * Menangani interaksi mousemove.
     * Mengupdate variabel CSS (--x, --y) untuk posisi mask secara realtime.
     */
    addEventListeners: function () {
        const updatePos = (x, y) => {
            if (!this.litLayer) return;
            this.litLayer.style.setProperty('--x', `${x}px`);
            this.litLayer.style.setProperty('--y', `${y}px`);

            if (this.glowLayer) {
                this.glowLayer.style.setProperty('--x', `${x}px`);
                this.glowLayer.style.setProperty('--y', `${y}px`);
            }
        };

        window.addEventListener('mousemove', (e) => {
            updatePos(e.clientX, e.clientY);
        });


        setTimeout(() => updatePos(window.innerWidth / 2, window.innerHeight / 2), 100);

        // Re-init saat resize window agar grid tetap proporsional
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.container.innerHTML = '';
                this.createLayers();
            }, 200);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SpotlightEffect.init();
});
