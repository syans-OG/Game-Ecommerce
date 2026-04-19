
/**
 * Helper untuk mengambil data dari localStorage dengan parsing JSON otomatis.
 * Mencegah error jika data tidak valid/kosong.
 */
function getStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Service utama untuk menangani logika Autentikasi User.
 * Cangkupan: Registrasi, Login, Session Management, dan Security (Rate Limiting).
 * Integrasi: Menggunakan localStorage sebagai 'database' client-side.
 */
const AuthService = {

    /**
     * Mendaftarkan user baru ke sistem.
     * Alur: 
     * 1. Validasi kompleksitas password.
     * 2. Cek ketersediaan email/username (mencegah duplikasi).
     * 3. Simpan data user baru ke localStorage.
     * 4. Trigger simulasi pengiriman email verifikasi.
     */
    register: function (username, email, password) {

        if (!this.validatePassword(password)) {
            return { success: false, message: "Password must be at least 8 chars, 1 uppercase, 1 number." };
        }

        const users = getStorage(AUTH_CONFIG.KEYS.USERS) || [];

        // Cek duplikasi data user sebelum menyimpan
        if (users.find(u => u.email === email)) {
            return { success: false, message: "Email already registered." };
        }
        if (users.find(u => u.username === username)) {
            return { success: false, message: "Username already taken." };
        }

        const newUser = {
            id: generateId(),
            username,
            email,
            password, // Note: Di production, password harus di-hash!
            isVerified: false,
            createdAt: Date.now(),
            avatar: null
        };

        // Simpan user baru ke 'database'
        users.push(newUser);
        setStorage(AUTH_CONFIG.KEYS.USERS, users);

        this.sendVerificationEmail(newUser.email);

        return { success: true, message: "Registration successful! Please login." };
    },

    /**
     * Simulasi pengiriman email verifikasi (Log only).
     */
    sendVerificationEmail: function (email) {
        console.log(`[SIMULATION] Sending verification email to ${email}`);
    },

    /**
     * Mengautentikasi user dengan identifier (email/username) dan password.
     * Fitur Keamanan: Implementasi Rate Limiting untuk mencegah Brute Force.
     * Output: Membuat session aktif jika kredensial valid.
     */
    login: function (identifier, password, rememberMe) {

        // Cek apakah user sedang di-blokir sementara
        if (this.isRateLimited(identifier)) {
            return { success: false, message: "Too many failed attempts. Try again in 15 minutes." };
        }

        const users = getStorage(AUTH_CONFIG.KEYS.USERS) || [];
        const user = users.find(u => u.email === identifier || u.username === identifier);

        if (user && user.password === password) {
            // Login sukses: Buat session dan bersihkan riwayat gagal
            this.createSession(user, rememberMe);
            this.resetLoginAttempts(identifier);
            return { success: true, message: "Login successful!" };
        } else {
            // Login gagal: Catat percobaan dan potensi lockout
            this.recordFailedAttempt(identifier);
            return { success: false, message: "Invalid credentials." };
        }
    },

    /**
     * Membuat sesi login aktif di client-side.
     * Menyimpan profil user (tanpa password) dan token session ke localStorage.
     * Logic: Expiry time disesuaikan dengan opsi 'Remember Me'.
     */
    createSession: function (user, rememberMe) {
        const session = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            token: generateId(),
            expiry: Date.now() + (rememberMe ? AUTH_CONFIG.SESSION_DURATION : 24 * 60 * 60 * 1000)
        };
        setStorage(AUTH_CONFIG.KEYS.CURRENT_USER, session);
    },

    logout: function () {
        localStorage.removeItem(AUTH_CONFIG.KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    /**
     * Mengambil data user yang sedang login dari session.
     * Validasi: Mengecek apakah session sudah expired. Jika ya, auto-logout.
     */
    getCurrentUser: function () {
        const session = getStorage(AUTH_CONFIG.KEYS.CURRENT_USER);
        if (!session) return null;

        if (Date.now() > session.expiry) {
            this.logout();
            return null;
        }
        return session;
    },

    /**
     * Validasi format password menggunakan Regex.
     * Rule: Min 8 char, setidaknya 1 Huruf Besar, dan 1 Angka.
     */
    validatePassword: function (password) {
        const re = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    },

    /**
     * Kemanan: Mengecek status lockout user berdasarkan riwayat gagal login.
     * Return: true jika user masih dalam masa hukuman.
     */
    isRateLimited: function (identifier) {
        const attemptsMap = getStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS) || {};
        const key = identifier.toLowerCase();
        const data = attemptsMap[key];

        if (!data) return false;

        // Cek jika masih dalam periode lock
        if (data.lockUntil && Date.now() < data.lockUntil) {
            return true;
        }

        // Jika lock sudah expired, reset otomatis
        if (data.lockUntil && Date.now() > data.lockUntil) {
            delete attemptsMap[key];
            setStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS, attemptsMap);
            return false;
        }

        return false;
    },

    /**
     * Mencatat setiap kegagalan login.
     * Logic: Jika kegagalan > MAX_ATTEMPTS, set waktu lockout.
     */
    recordFailedAttempt: function (identifier) {
        const attemptsMap = getStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS) || {};
        const key = identifier.toLowerCase();

        if (!attemptsMap[key]) {
            attemptsMap[key] = { attempts: 0, lockUntil: null };
        }

        attemptsMap[key].attempts += 1;

        if (attemptsMap[key].attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
            attemptsMap[key].lockUntil = Date.now() + AUTH_CONFIG.LOCKOUT_DURATION;
        }

        setStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS, attemptsMap);
    },

    resetLoginAttempts: function (identifier) {
        const attemptsMap = getStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS) || {};
        const key = identifier.toLowerCase();
        if (attemptsMap[key]) {
            delete attemptsMap[key];
            setStorage(AUTH_CONFIG.KEYS.LOGIN_ATTEMPTS, attemptsMap);
        }
    }
};
