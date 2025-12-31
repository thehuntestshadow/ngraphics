/**
 * NGRAPHICS - Configuration
 * Environment-specific settings
 *
 * For local development: Edit values below
 * For production: These can be injected at deploy time by Coolify
 */

const CONFIG = {
    // Supabase (required for auth/sync)
    SUPABASE_URL: 'https://rodzatuqkfqcdqgntdnd.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_E-NbHDT4EuwPQ11gYGrzQw_O7KceeSF',

    // Stripe (for payments - add when ready)
    STRIPE_PUBLISHABLE_KEY: '',

    // App settings
    APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://hefaistos.xyz',
    APP_NAME: 'NGRAPHICS',

    // Feature flags
    FEATURES: {
        CLOUD_SYNC: true,
        PAYMENTS: false,  // Enable when Stripe is set up
        WATERMARK_FREE: false,  // Watermark exports for free users
    },

    // API defaults
    API: {
        OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
        DEFAULT_MODEL: 'google/gemini-2.0-flash-exp:free',
        TIMEOUT_MS: 120000,
    },

    // Environment detection
    get IS_PRODUCTION() {
        return typeof window !== 'undefined' &&
               window.location.hostname === 'hefaistos.xyz';
    },

    get IS_DEVELOPMENT() {
        return !this.IS_PRODUCTION;
    }
};

// Freeze to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.API);

// Expose globally
window.CONFIG = CONFIG;
