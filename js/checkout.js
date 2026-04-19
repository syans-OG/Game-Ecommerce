
/**
 * Inisialisasi proses checkout saat DOM siap.
 * Memastikan dependensi state tersedia sebelum eksekusi.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof cartState === 'undefined') {
        console.error('Cart State not loaded! Make sure cart.js is included.');
        return;
    }

    const checkoutApp = new CheckoutManager();
    checkoutApp.init();

    if (window.appLoader) {
        window.appLoader.hide();
    }
});

/**
 * Mengelola alur pembayaran dan konfirmasi pesanan.
 * Cangkupan: Render ringkasan pesanan, pemilihan metode pembayaran, dan simulasi transaksi.
 */
class CheckoutManager {
    constructor() {
        this.form = document.getElementById('checkout-form');
        this.submitBtn = document.getElementById('btn-place-order');
        this.summaryContainer = document.getElementById('order-summary-items');
        this.subtotalEl = document.getElementById('summary-subtotal');
        this.totalEl = document.getElementById('summary-total');
        this.paymentMethods = document.querySelectorAll('.payment-method-card');
        this.paymentForms = document.querySelectorAll('.payment-form-container');

        this.selectedPaymentMethod = 'card';
    }

    init() {
        // Redireksi jika keranjang kosong (mencegah checkout hantu)
        if (cartState.getCount() === 0) {
            window.location.href = 'index.html';
            return;
        }

        this.renderSummary();
        this.setupPaymentMethodSelection();
        this.setupFormSubmission();
    }

    /**
     * Menampilkan daftar item yang akan dibeli beserta total harga akhir.
     */
    renderSummary() {
        if (!this.summaryContainer) return;

        const items = cartState.items;
        const total = cartState.getTotal();

        this.summaryContainer.innerHTML = items.map(item => `
            <div class="summary-item">
                <img src="../${item.image}" alt="${item.title}" class="s-item-img">
                <div class="s-item-bg">
                    <h4 class="s-item-title">${item.title}</h4>
                    <span class="s-item-price">${this.formatPrice(item.price)}</span>
                </div>
            </div>
        `).join('');

        if (this.subtotalEl) this.subtotalEl.textContent = this.formatPrice(total);
        if (this.totalEl) this.totalEl.textContent = this.formatPrice(total);
    }

    /**
     * Mengatur UI pemilihan metode pembayaran.
     * Mengaktifkan form spesifik (Kartu/E-wallet) berdasarkan pilihan user.
     */
    setupPaymentMethodSelection() {
        this.paymentMethods.forEach(card => {
            card.addEventListener('click', () => {
                this.paymentMethods.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedPaymentMethod = card.dataset.method;

                this.paymentForms.forEach(f => f.classList.remove('active'));
                const targetForm = document.getElementById(`form-${this.selectedPaymentMethod}`);
                if (targetForm) targetForm.classList.add('active');
            });
        });
    }

    setupFormSubmission() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.validateForm()) {
                await this.processPayment();
            }
        });
    }

    validateForm() {
        // Placeholder untuk validasi input (alamat, nomor kartu, dll)
        return true;
    }

    /**
     * Simulasi proses pembayaran asinkron.
     * Logic: Delay 2 detik untuk efek memproses, dengan probabilitas sukses 90%.
     */
    async processPayment() {
        this.setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            this.handleSuccess();
        } else {
            this.handleFailure();
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.submitBtn.classList.add('loading');
            this.submitBtn.disabled = true;
        } else {
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }

    /**
     * Alur setelah pembayaran berhasil:
     * 1. Simpan riwayat pesanan ke localStorage.
     * 2. Kosongkan keranjang.
     * 3. Simpan data pesanan terakhir untuk ditampilkan di halaman sukses.
     */
    handleSuccess() {
        const orderData = {
            id: 'ORD-' + Math.floor(Math.random() * 1000000),
            date: new Date().toISOString(),
            items: cartState.items,
            total: cartState.getTotal(),
            paymentMethod: this.selectedPaymentMethod,
            status: 'completed'
        };

        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        history.push(orderData);
        localStorage.setItem('orderHistory', JSON.stringify(history));

        localStorage.removeItem('shoppingCart');
        sessionStorage.setItem('lastOrder', JSON.stringify(orderData));

        window.location.href = 'order-success.html';
    }

    handleFailure() {
        this.setLoading(false);
        alert('Payment Failed! Please try again or use a different card.');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
    }
}

