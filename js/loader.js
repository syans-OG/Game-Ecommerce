
/**
 * Loader Controller Class.
 * Menangani animasi loading screen saat awal load dan transisi antar halaman.
 * Logic: Mengintersep klik link untuk menampilkan loader sebelum pindah halaman.
 */
class Loader {
    constructor() {
        this.loaderId = 'app-loader';
        this.minDisplayTime = 800; // Mencegah flashing terlalu cepat
        this.startTime = Date.now();

        this.init();
    }

    init() {
        // Inject HTML loader jika belum ada di DOM
        if (!document.getElementById(this.loaderId)) {
            this.injectLoader();
        }

        // Setup transisi smooth saat navigasi
        document.addEventListener('DOMContentLoaded', () => {
            this.setupLinkTransitions();
        });

        // Fallback: Force hide loader setelah 5 detik jika ada error load
        setTimeout(() => {
            this.hide();
        }, 5000);
    }

    injectLoader() {
        const loaderHTML = `
            <div id="${this.loaderId}">
                <div class="loader-content">
                    <div class="loader-logo">
                        <img src="asset/logo.png" alt="Loading...">
                    </div>
                    <div class="loader-bar-container">
                        <div class="loader-bar"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', loaderHTML);
    }

    show() {
        const loader = document.getElementById(this.loaderId);
        if (loader) {
            loader.classList.remove('hidden');
            this.startTime = Date.now();
        }
    }

    /**
     * Menyembunyikan loader dengan perhitungan waktu minimum.
     * Logic: Jika loading terlalu cepat (< minDisplayTime), tahan sebentar agar animasi mulus.
     */
    hide() {
        const loader = document.getElementById(this.loaderId);
        if (!loader) return;

        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.minDisplayTime - elapsed);

        setTimeout(() => {
            loader.classList.add('hidden');
        }, remaining);
    }

    /**
     * Mencegat navigasi standar (<a> tag) untuk menampilkan loader.
     * Pengecualian: Link eksternal, anchor (#), javascript:, dan mailto:.
     */
    setupLinkTransitions() {

        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');


                if (
                    link.target === '_blank' ||
                    href.startsWith('#') ||
                    href.startsWith('javascript') ||
                    href.includes('mailto:')
                ) {
                    return;
                }

                // Cegah navigasi instan
                e.preventDefault();

                this.show();

                // Beri waktu animasi masuk sebelum pindah halaman
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            });
        });
    }
}


const appLoader = new Loader();

// Expose ke global window untuk akses manual jika perlu
window.appLoader = appLoader;

