
/**
 * Mengelola state keranjang belanja menggunakan localStorage.
 * Menangani penambahan, penghapusan, dan kalkulasi total harga item.
 */
class CartState {
    constructor() {
        this.storageKey = 'shoppingCart';
        this.items = this.load();
    }

    load() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    save() {
        localStorage.setItem(this.storageKey);
        window.dispatchEvent(new Event('cartUpdated'));
    }

    /**
     * Menambahkan game ke keranjang.
     * Validasi: Mencegah duplikasi item yang sama.
     */
    add(game) {
        if (this.items.some(item => item.id === game.id)) {
            return { success: false, message: 'Game already in cart!' };
        }

        const newItem = { ...game, addedAt: Date.now() };
        this.items.push(newItem);
        this.save();
        return { success: true, message: 'Added to cart!' };
    }

    remove(gameId) {
        this.items = this.items.filter(item => item.id !== gameId);
        this.save();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.price, 0);
    }

    getCount() {
        return this.items.length;
    }

    hasItem(gameId) {
        return this.items.some(item => item.id === gameId);
    }
}

/**
 * Mengelola tampilan UI keranjang, termasuk sidebar dan halaman keranjang penuh.
 * Menggunakan event listener 'cartUpdated' untuk sinkronisasi data-ke-UI secara otomatis.
 */
class CartUI {
    constructor(cartState) {
        this.state = cartState;
        this.sidebar = null;
        this.overlay = null;
        this.badge = null;
    }

    init() {
        this.injectSidebar();
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();

        window.addEventListener('cartUpdated', () => this.updateUI());
    }

    /**
     * Menyisipkan elemen HTML sidebar keranjang ke dalam DOM secara dinamis.
     * Memastikan sidebar tersedia di semua halaman yang memuat script ini.
     */
    injectSidebar() {
        if (document.getElementById('cart-sidebar')) return;

        const sidebarHTML = `
            <div id="cart-overlay" class="cart-overlay"></div>
            <div id="cart-sidebar" class="cart-sidebar">
                <div class="cart-header">
                    <h2>YOUR CART</h2>
                    <button id="close-cart" class="close-btn">&times;</button>
                </div>
                <div id="cart-items" class="cart-items-container"></div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span id="cart-total-price">Rp 0</span>
                    </div>
                    <button id="checkout-btn" class="btn-primary full-width">CHECKOUT</button>
                    <a href="cart.html" class="view-cart-link">View Full Cart</a>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    }

    cacheDOM() {
        this.sidebar = document.getElementById('cart-sidebar');
        this.overlay = document.getElementById('cart-overlay');
        this.closeBtn = document.getElementById('close-cart');
        this.itemsContainer = document.getElementById('cart-items');
        this.totalPriceEl = document.getElementById('cart-total-price');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.badge = document.querySelector('.badgemart');
        this.navCartBtn = document.querySelector('.cart-btn');
    }

    bindEvents() {
        if (this.navCartBtn) {
            this.navCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
        }

        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
        if (this.overlay) this.overlay.addEventListener('click', () => this.close());

        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }

        /**
         * Event delegation untuk tombol hapus item di dalam container dinamis.
         */
        if (this.itemsContainer) {
            this.itemsContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-item-btn')) {
                    const id = e.target.closest('.remove-item-btn').dataset.id;
                    this.state.remove(id);
                }
            });
        }
    }

    open() {
        if (this.sidebar) this.sidebar.classList.add('active');
        if (this.overlay) this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.sidebar) this.sidebar.classList.remove('active');
        if (this.overlay) this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateUI() {
        this.updateBadge();
        this.renderSidebarItems();
        if (window.location.pathname.includes('cart.html')) {
            this.renderFullCartPage();
        }
    }

    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.state.getCount();
            this.badge.classList.add('bounce');
            setTimeout(() => this.badge.classList.remove('bounce'), 300);
        }
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
    }

    /**
     * Render daftar item di sidebar keranjang.
     */
    renderSidebarItems() {
        if (!this.itemsContainer) return;

        const items = this.state.items;
        this.totalPriceEl.textContent = this.formatPrice(this.state.getTotal());

        if (items.length === 0) {
            this.itemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <p>Your cart is empty.</p>
                    <p>Go find some awesome games!</p>
                </div>
            `;
            return;
        }

        this.itemsContainer.innerHTML = items.map(item => `
            <div class="cart-item-mini">
                <div class="cart-item-img">
                    <img src="../${item.image}" alt="${item.title}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <span class="price">${this.formatPrice(item.price)}</span>
                </div>
                <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove">&times;</button>
            </div>
        `).join('');
    }

    /**
     * Render baris tabel pada halaman keranjang utama (cart.html).
     */
    renderFullCartPage() {
        const container = document.getElementById('full-cart-container');
        const summaryTotal = document.getElementById('summary-total');
        const summarySubtotal = document.getElementById('summary-subtotal');

        if (!container) return;

        const items = this.state.items;
        const total = this.state.getTotal();
        if (summaryTotal) summaryTotal.textContent = this.formatPrice(total);
        if (summarySubtotal) summarySubtotal.textContent = this.formatPrice(total);

        if (items.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="text-center">Your cart is empty.</td></tr>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <tr>
                <td class="product-col">
                    <img src="../${item.image}" alt="${item.title}">
                    <span>${item.title}</span>
                </td>
                <td class="price">${this.formatPrice(item.price)}</td>
                <td class="quantity">
                    <input type="number" value="1" min="1" disabled title="Digital Item: Limit 1">
                </td>
                <td class="total">${this.formatPrice(item.price)}</td>
                <td class="action">
                     <button class="remove-item-btn-page" onclick="window.cartApp.remove('${item.id}')">&times;</button>
                </td>
            </tr>
        `).join('');
    }

    showNotification(message, isSuccess = true) {
        const note = document.createElement('div');
        note.className = `cart-notification ${isSuccess ? 'success' : 'error'}`;
        note.textContent = message;
        document.body.appendChild(note);

        requestAnimationFrame(() => note.classList.add('show'));

        setTimeout(() => {
            note.classList.remove('show');
            setTimeout(() => note.remove(), 300);
        }, 3000);
    }
}

const cartState = new CartState();
const cartUI = new CartUI(cartState);
window.cartApp = cartState;
window.cartUI = cartUI;

document.addEventListener('DOMContentLoaded', () => {
    cartUI.init();
});
