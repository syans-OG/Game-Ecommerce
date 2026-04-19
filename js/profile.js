
/**
 * Kontroler Halaman Profil User.
 * Menangani tampilan data diri, riwayat pesanan (Orders), dan manajemen pengaturan akun (Settings).
 */
document.addEventListener("DOMContentLoaded", () => {

    /**
     * Data Mock User & History.
     * Integrasi: Di production, data ini akan ditarik dari API atau AuthService.
     */
    const userData = {
        username: "StarGazer99",
        email: "stargazer@example.com",
        joinDate: "January 15, 2026",
        avatar: "S",
        stats: { gamesOwned: 12, achievements: 45, playtimeHours: 128, accountLevel: 5 }
    };

    const orderHistory = [
        { id: "ORD-2026-8821", date: "Jan 22, 2026", items: ["Cyber Odyssey 2077", "Neon Racer"], total: "Rp 1.200.000", status: "Completed" },
        { id: "ORD-2026-7743", date: "Jan 10, 2026", items: ["Fantasy Realms Online"], total: "Rp 450.000", status: "Completed" },
        { id: "ORD-2026-6612", date: "Dec 15, 2025", items: ["Space Merchant Sim"], total: "Rp 150.000", status: "Refunded" }
    ];

    /**
     * Inisialisasi tampilan profil awal.
     */
    function initProfile() {
        document.getElementById("profileUsername").textContent = userData.username;
        document.getElementById("profileJoinDate").textContent = `Member since ${userData.joinDate}`;
        document.getElementById("profileAvatar").textContent = userData.avatar;

        document.getElementById("statGames").textContent = userData.stats.gamesOwned;
        document.getElementById("statHours").textContent = userData.stats.playtimeHours + "h";
        document.getElementById("statLevel").textContent = userData.stats.accountLevel;

        document.getElementById("inputUsername").value = userData.username;
        document.getElementById("inputEmail").value = userData.email;

        renderOrders();
    }

    /**
     * Render riwayat transaksi belanja.
     * Logic: Membedakan style UI berdasarkan status (Completed vs Refunded).
     */
    function renderOrders() {
        const container = document.getElementById("ordersList");
        if (!container) return;

        if (orderHistory.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>No orders yet</h3></div>`;
            return;
        }

        container.innerHTML = orderHistory.map(order => {
            const isRefunded = order.status === "Refunded";
            const statusClass = isRefunded ? "" : (order.status === "Completed" ? "status-completed" : "status-pending");
            const style = isRefunded ? "border-color: #999; color: #999; background: rgba(255,255,255,0.1);" : "";

            return `
            <div class="order-item">
                <div class="order-info">
                    <span class="order-id">#${order.id}</span>
                    <span class="order-date">${order.date}</span>
                    <span class="order-games">${order.items.join(", ")}</span>
                </div>
                <div class="order-meta">
                    <span class="order-price">${order.total}</span>
                    <span class="order-status ${statusClass}" style="${style}">${order.status}</span>
                </div>
            </div>`;
        }).join("");
    }

    /**
     * Navigasi tab (Profile vs Settings).
     */
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const target = document.getElementById(btn.getAttribute("data-tab"));
            if (target) target.classList.add("active");
        });
    });

    /**
     * Simulasi penyimpanan pengaturan profil.
     * Alur: Update UI lokal dan berikan feedback sukses sementara.
     */
    const settingsForm = document.getElementById("settingsForm");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newUsername = document.getElementById("inputUsername").value;
            const saveBtn = settingsForm.querySelector(".btn-save");
            const originalText = saveBtn.textContent;

            // Feedback visual sukses
            saveBtn.textContent = "Saved!";
            saveBtn.style.backgroundColor = "#4caf50";
            document.getElementById("profileUsername").textContent = newUsername;

            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.backgroundColor = "";
            }, 2000);
        });
    }

    initProfile();
});
