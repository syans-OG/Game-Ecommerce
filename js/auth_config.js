
/**
 * Konfigurasi Global untuk Sistem Autentikasi.
 * Berisi konstanta key untuk localStorage dan parameter keamanan.
 */
const AUTH_CONFIG = {
    KEYS: {
        USERS: 'game_users',
        CURRENT_USER: 'game_current_user',
        LOGIN_ATTEMPTS: 'game_login_attempts',
        VERIFICATION_TOKENS: 'game_verification_tokens'
    },

    SESSION_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 Hari
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 Menit lockout jika gagal login berulang
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000
};

