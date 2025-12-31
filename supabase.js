/**
 * NGRAPHICS - Supabase Integration
 * Cloud sync, auth, and storage management
 *
 * Usage:
 *   await ngSupabase.init();
 *   await ngSupabase.signIn(email, password);
 *   if (ngSupabase.isAuthenticated) { ... }
 */

// Configuration - Replace with your Supabase project details
const SUPABASE_URL = 'https://rodzatuqkfqcdqgntdnd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E-NbHDT4EuwPQ11gYGrzQw_O7KceeSF';

class SupabaseClient {
    constructor() {
        this._client = null;
        this._user = null;
        this._session = null;
        this._syncEnabled = false;
        this._deviceId = this._getOrCreateDeviceId();
        this._listeners = new Map();
        this._initialized = false;
        this._initPromise = null;
    }

    /**
     * Initialize Supabase client (lazy load from CDN)
     * @returns {Promise<Object>} Supabase client instance
     */
    async init() {
        if (this._client) return this._client;
        if (this._initPromise) return this._initPromise;

        this._initPromise = this._doInit();
        return this._initPromise;
    }

    async _doInit() {
        try {
            // Dynamic import of Supabase JS from CDN
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

            this._client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    storage: localStorage,
                    storageKey: 'ngraphics_supabase_auth'
                }
            });

            // Check for existing session
            const { data: { session } } = await this._client.auth.getSession();
            if (session) {
                this._session = session;
                this._user = session.user;
                this._syncEnabled = true;
            }

            // Listen for auth changes
            this._client.auth.onAuthStateChange((event, session) => {
                const prevUser = this._user;
                this._session = session;
                this._user = session?.user || null;
                this._syncEnabled = !!session;

                this._emit('authChange', {
                    event,
                    user: this._user,
                    previousUser: prevUser
                });

                // Log state changes for debugging
                if (event === 'SIGNED_IN') {
                    console.log('[Supabase] User signed in:', this._user?.email);
                } else if (event === 'SIGNED_OUT') {
                    console.log('[Supabase] User signed out');
                }
            });

            this._initialized = true;
            console.log('[Supabase] Initialized successfully');
            return this._client;
        } catch (error) {
            console.error('[Supabase] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get or create a unique device ID for sync tracking
     */
    _getOrCreateDeviceId() {
        const key = 'ngraphics_device_id';
        let deviceId = localStorage.getItem(key);
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
            localStorage.setItem(key, deviceId);
        }
        return deviceId;
    }

    // ==================== Event System ====================

    /**
     * Subscribe to events
     * @param {string} event - Event name ('authChange')
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
        return () => this._listeners.get(event).delete(callback);
    }

    /**
     * Subscribe to event once
     */
    once(event, callback) {
        const unsubscribe = this.on(event, (data) => {
            unsubscribe();
            callback(data);
        });
        return unsubscribe;
    }

    _emit(event, data) {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.forEach(cb => {
                try {
                    cb(data);
                } catch (error) {
                    console.error(`[Supabase] Error in ${event} listener:`, error);
                }
            });
        }
        // Also dispatch DOM event for external listeners
        window.dispatchEvent(new CustomEvent(`supabase:${event}`, { detail: data }));
    }

    // ==================== Auth Properties ====================

    /** Whether the client is initialized */
    get initialized() { return this._initialized; }

    /** Whether a user is authenticated */
    get isAuthenticated() { return !!this._user; }

    /** Current user object */
    get user() { return this._user; }

    /** Current session object */
    get session() { return this._session; }

    /** Whether cloud sync is enabled */
    get syncEnabled() { return this._syncEnabled; }

    /** Unique device identifier */
    get deviceId() { return this._deviceId; }

    /** Raw Supabase client (for advanced usage) */
    get client() { return this._client; }

    // ==================== Auth Methods ====================

    /**
     * Sign up with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} Auth response
     */
    async signUp(email, password) {
        await this.init();
        const { data, error } = await this._client.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/`
            }
        });
        if (error) throw error;
        return data;
    }

    /**
     * Sign in with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} Auth response
     */
    async signIn(email, password) {
        await this.init();
        const { data, error } = await this._client.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    }

    /**
     * Sign in with OAuth provider
     * @param {string} provider - 'google' | 'github'
     * @returns {Promise<Object>} Auth response
     */
    async signInWithProvider(provider) {
        await this.init();
        const { data, error } = await this._client.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    }

    /**
     * Sign out current user
     */
    async signOut() {
        await this.init();
        const { error } = await this._client.auth.signOut();
        if (error) throw error;
        this._user = null;
        this._session = null;
        this._syncEnabled = false;
    }

    /**
     * Send password reset email
     * @param {string} email
     */
    async resetPassword(email) {
        await this.init();
        const { error } = await this._client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        if (error) throw error;
    }

    /**
     * Update password (after reset)
     * @param {string} newPassword
     */
    async updatePassword(newPassword) {
        await this.init();
        const { error } = await this._client.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
    }

    // ==================== Profile Methods ====================

    /**
     * Get current user's profile
     * @returns {Promise<Object|null>} Profile data
     */
    async getProfile() {
        if (!this.isAuthenticated) return null;
        await this.init();

        const { data, error } = await this._client
            .from('profiles')
            .select('*')
            .eq('id', this._user.id)
            .single();

        if (error) {
            // Profile might not exist yet (new user)
            if (error.code === 'PGRST116') {
                return this._createProfile();
            }
            throw error;
        }
        return data;
    }

    /**
     * Create profile for new user
     */
    async _createProfile() {
        const { data, error } = await this._client
            .from('profiles')
            .insert({
                id: this._user.id,
                email: this._user.email,
                display_name: this._user.email?.split('@')[0] || 'User'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update current user's profile
     * @param {Object} updates - { display_name?, preferences? }
     * @returns {Promise<Object>} Updated profile
     */
    async updateProfile(updates) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { data, error } = await this._client
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', this._user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ==================== API Key Methods ====================

    /**
     * Save API key to cloud (encrypted server-side)
     * @param {string} provider - 'openrouter' | 'luma'
     * @param {string} key - The API key
     */
    async saveApiKey(provider, key) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        // Call Edge Function for encryption
        const { data, error } = await this._client.functions.invoke('encrypt-api-key', {
            body: { provider, key }
        });

        if (error) throw error;
        return data;
    }

    /**
     * Get decrypted API key from cloud
     * @param {string} provider - 'openrouter' | 'luma'
     * @returns {Promise<string|null>} Decrypted API key
     */
    async getApiKey(provider) {
        if (!this.isAuthenticated) return null;
        await this.init();

        try {
            const { data, error } = await this._client.functions.invoke('decrypt-api-key', {
                body: { provider }
            });

            if (error) return null;
            return data?.key || null;
        } catch {
            return null;
        }
    }

    /**
     * Check if user has stored an API key
     * @param {string} provider
     * @returns {Promise<boolean>}
     */
    async hasApiKey(provider) {
        if (!this.isAuthenticated) return false;
        await this.init();

        const { count } = await this._client
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', this._user.id)
            .eq('provider', provider);

        return count > 0;
    }

    /**
     * Delete stored API key
     * @param {string} provider
     */
    async deleteApiKey(provider) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { error } = await this._client
            .from('api_keys')
            .delete()
            .eq('user_id', this._user.id)
            .eq('provider', provider);

        if (error) throw error;
    }

    // ==================== Database Helpers ====================

    /**
     * Query the database
     * @param {string} table
     * @returns {Object} Supabase query builder
     */
    from(table) {
        if (!this._client) {
            throw new Error('Supabase not initialized. Call init() first.');
        }
        return this._client.from(table);
    }

    /**
     * Access storage
     * @param {string} bucket
     * @returns {Object} Supabase storage bucket
     */
    storage(bucket = 'ngraphics-images') {
        if (!this._client) {
            throw new Error('Supabase not initialized. Call init() first.');
        }
        return this._client.storage.from(bucket);
    }

    // ==================== Utility Methods ====================

    /**
     * Get user's avatar URL or generate one
     */
    getAvatarUrl() {
        if (!this._user) return null;

        // Check for custom avatar
        if (this._user.user_metadata?.avatar_url) {
            return this._user.user_metadata.avatar_url;
        }

        // Generate gravatar URL
        const email = this._user.email || '';
        const hash = this._simpleHash(email.toLowerCase().trim());
        return `https://www.gravatar.com/avatar/${hash}?d=mp&s=80`;
    }

    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }

    /**
     * Get user's display name
     */
    getDisplayName() {
        if (!this._user) return 'Guest';
        return this._user.user_metadata?.display_name
            || this._user.email?.split('@')[0]
            || 'User';
    }

    /**
     * Get user's initials for avatar fallback
     */
    getInitials() {
        const name = this.getDisplayName();
        return name.charAt(0).toUpperCase();
    }
}

// Export singleton instance
const ngSupabase = new SupabaseClient();

// Also expose globally for debugging and external access
window.ngSupabase = ngSupabase;

// Auto-initialize on load (non-blocking)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ngSupabase.init().catch(err => {
            console.warn('[Supabase] Auto-init failed:', err.message);
        });
    });
} else {
    ngSupabase.init().catch(err => {
        console.warn('[Supabase] Auto-init failed:', err.message);
    });
}
