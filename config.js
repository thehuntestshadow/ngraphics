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

    // Stripe (for payments)
    STRIPE_PUBLISHABLE_KEY: 'pk_live_nYUxzuWfWDlybpLUxH3frHaQ00GX3OcqV7',
    STRIPE_PRICES: {
        PRO_MONTHLY: 'price_1SkTw4G8e7fqKTguuqHpJEqi',
        PRO_YEARLY: 'price_1SkTw4G8e7fqKTgu5E1GyYiZ',
        BUSINESS_MONTHLY: 'price_1SkTw5G8e7fqKTguRra3rgMg',
        BUSINESS_YEARLY: 'price_1SkTw5G8e7fqKTguHURNx22O',
    },
    STRIPE_PAYMENT_LINKS: {
        PRO_MONTHLY: 'https://buy.stripe.com/5kQ4gz6ZzdlabxEbjufAc00',
        PRO_YEARLY: 'https://buy.stripe.com/6oU00j4Rr0yo0T03R2fAc01',
        BUSINESS_MONTHLY: 'https://buy.stripe.com/aFa3cvdnXepedFM2MYfAc02',
        BUSINESS_YEARLY: 'https://buy.stripe.com/7sY28r1Ff3KAcBI1IUfAc03',
    },

    // App settings
    APP_URL: typeof window !== 'undefined' ? window.location.origin : 'https://hefaistos.xyz',
    APP_NAME: 'NGRAPHICS',

    // Feature flags
    FEATURES: {
        CLOUD_SYNC: true,
        PAYMENTS: true,
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
Object.freeze(CONFIG.STRIPE_PRICES);
Object.freeze(CONFIG.STRIPE_PAYMENT_LINKS);

// Expose globally
window.CONFIG = CONFIG;
