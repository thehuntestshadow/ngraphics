/**
 * HEFAISTOS - Supabase Integration
 * Cloud sync, auth, and storage management
 *
 * Usage:
 *   await ngSupabase.init();
 *   await ngSupabase.signIn(email, password);
 *   if (ngSupabase.isAuthenticated) { ... }
 */

// Configuration from config.js (or fallback defaults)
const SUPABASE_URL = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_URL)
    || 'https://rodzatuqkfqcdqgntdnd.supabase.co';
const SUPABASE_ANON_KEY = (typeof CONFIG !== 'undefined' && CONFIG.SUPABASE_ANON_KEY)
    || 'sb_publishable_E-NbHDT4EuwPQ11gYGrzQw_O7KceeSF';

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
        // Admin status cache
        this._isAdmin = null;
        this._adminCheckTime = 0;
        this._adminCacheTTL = 60000; // 1 minute cache
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
        this.clearAdminCache();
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
     * Check if current user is an admin (cached)
     * Admin status is verified server-side via database
     * @returns {Promise<boolean>} True if user is admin
     */
    async isAdmin() {
        if (!this.isAuthenticated) return false;

        const now = Date.now();
        // Return cached value if still valid
        if (this._isAdmin !== null && (now - this._adminCheckTime) < this._adminCacheTTL) {
            return this._isAdmin;
        }

        try {
            await this.init();
            const { data, error } = await this._client
                .from('profiles')
                .select('is_admin')
                .eq('id', this._user.id)
                .single();

            this._isAdmin = !error && data?.is_admin === true;
            this._adminCheckTime = now;
            return this._isAdmin;
        } catch (error) {
            console.warn('[Supabase] Admin check failed:', error.message);
            this._isAdmin = false;
            this._adminCheckTime = now;
            return false;
        }
    }

    /**
     * Clear admin cache (call on sign out)
     */
    clearAdminCache() {
        this._isAdmin = null;
        this._adminCheckTime = 0;
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

    // ==================== Usage & Billing ====================

    /**
     * Get user's usage data (subscription, credits, generations)
     * @returns {Promise<Object|null>} Usage data
     */
    async getUsage() {
        if (!this.isAuthenticated) return null;
        await this.init();

        const userId = this._user.id;
        // Get first day of current month in YYYY-MM-DD format
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        try {
            // Fetch subscription, credits, and monthly usage in parallel
            const [subResult, creditsResult, usageResult] = await Promise.all([
                this._client.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
                this._client.from('credits').select('balance').eq('user_id', userId).maybeSingle(),
                this._client.from('usage_monthly').select('generation_count')
                    .eq('user_id', userId).eq('month', currentMonth).maybeSingle()
            ]);

            const tier = subResult.data?.tier_id || 'free';
            const limits = { free: Infinity, pro: 200, business: 1000 };

            return {
                tier,
                tierLabel: tier.charAt(0).toUpperCase() + tier.slice(1),
                status: subResult.data?.status || 'active',
                periodStart: subResult.data?.current_period_start,
                periodEnd: subResult.data?.current_period_end,
                generationsUsed: usageResult.data?.generation_count || 0,
                generationsLimit: limits[tier],
                creditsBalance: creditsResult.data?.balance || 0,
                isUnlimited: tier === 'free' // Free tier uses own API key
            };
        } catch (error) {
            console.error('[Supabase] Error fetching usage:', error);
            return null;
        }
    }

    // ==================== CMS Methods ====================

    /**
     * Get homepage content section
     * @param {string} sectionId - 'hero', 'features', 'pricing', 'studios', 'cta'
     * @returns {Promise<Object|null>} Section content
     */
    async getCMSHomepage(sectionId = null) {
        await this.init();
        try {
            if (sectionId) {
                const { data, error } = await this._client
                    .from('cms_homepage')
                    .select('*')
                    .eq('id', sectionId)
                    .single();
                if (error) return null;
                return data?.content || null;
            } else {
                const { data, error } = await this._client
                    .from('cms_homepage')
                    .select('*');
                if (error) return null;
                // Return as object keyed by id
                return data?.reduce((acc, row) => {
                    acc[row.id] = row.content;
                    return acc;
                }, {}) || null;
            }
        } catch {
            return null;
        }
    }

    /**
     * Update homepage content section (admin only)
     * @param {string} sectionId - Section ID
     * @param {Object} content - New content
     */
    async updateCMSHomepage(sectionId, content) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { data, error } = await this._client
            .from('cms_homepage')
            .upsert({
                id: sectionId,
                content,
                updated_by: this._user.id,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Get gallery items
     * @param {Object} options - { studioKey?, activeOnly? }
     * @returns {Promise<Array>} Gallery items
     */
    async getCMSGallery(options = {}) {
        await this.init();
        try {
            let query = this._client
                .from('cms_gallery')
                .select('*')
                .order('sort_order', { ascending: true });

            if (options.activeOnly !== false) {
                query = query.eq('is_active', true);
            }
            if (options.studioKey) {
                query = query.eq('studio_key', options.studioKey);
            }

            const { data, error } = await query;
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    }

    /**
     * Add gallery item (admin only)
     * @param {Object} item - { title, description, image_url, studio_key, studio_label }
     */
    async addCMSGalleryItem(item) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        // Get max sort_order
        const { data: existing } = await this._client
            .from('cms_gallery')
            .select('sort_order')
            .order('sort_order', { ascending: false })
            .limit(1);

        const maxOrder = existing?.[0]?.sort_order || 0;

        const { data, error } = await this._client
            .from('cms_gallery')
            .insert({
                ...item,
                sort_order: maxOrder + 1,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update gallery item (admin only)
     */
    async updateCMSGalleryItem(id, updates) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { data, error } = await this._client
            .from('cms_gallery')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete gallery item (admin only)
     */
    async deleteCMSGalleryItem(id) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { error } = await this._client
            .from('cms_gallery')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Reorder gallery items (admin only)
     * @param {Array} orderedIds - Array of IDs in new order
     */
    async reorderCMSGallery(orderedIds) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const updates = orderedIds.map((id, index) => ({
            id,
            sort_order: index + 1
        }));

        for (const update of updates) {
            await this._client
                .from('cms_gallery')
                .update({ sort_order: update.sort_order })
                .eq('id', update.id);
        }
    }

    /**
     * Get FAQ items
     * @param {Object} options - { category?, activeOnly? }
     * @returns {Promise<Array>} FAQ items
     */
    async getCMSFAQ(options = {}) {
        await this.init();
        try {
            let query = this._client
                .from('cms_faq')
                .select('*')
                .order('category')
                .order('sort_order', { ascending: true });

            if (options.activeOnly !== false) {
                query = query.eq('is_active', true);
            }
            if (options.category) {
                query = query.eq('category', options.category);
            }

            const { data, error } = await query;
            if (error) return [];
            return data || [];
        } catch {
            return [];
        }
    }

    /**
     * Add FAQ item (admin only)
     */
    async addCMSFAQItem(item) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        // Get max sort_order for category
        const { data: existing } = await this._client
            .from('cms_faq')
            .select('sort_order')
            .eq('category', item.category)
            .order('sort_order', { ascending: false })
            .limit(1);

        const maxOrder = existing?.[0]?.sort_order || 0;

        const { data, error } = await this._client
            .from('cms_faq')
            .insert({
                ...item,
                sort_order: maxOrder + 1,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update FAQ item (admin only)
     */
    async updateCMSFAQItem(id, updates) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { data, error } = await this._client
            .from('cms_faq')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete FAQ item (admin only)
     */
    async deleteCMSFAQItem(id) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { error } = await this._client
            .from('cms_faq')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Upload CMS image to storage
     * @param {File} file - Image file
     * @param {string} folder - 'gallery' | 'homepage'
     * @returns {Promise<string>} Public URL
     */
    async uploadCMSImage(file, folder = 'gallery') {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const ext = file.name.split('.').pop();
        const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: uploadError } = await this._client.storage
            .from('cms-images')
            .upload(filename, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = this._client.storage
            .from('cms-images')
            .getPublicUrl(filename);

        return publicUrl;
    }

    // ==================== Products Methods ====================

    /**
     * Get all products for current user
     * @param {Object} options - { category?, archived?, limit?, offset? }
     * @returns {Promise<Array>} Products array
     */
    async getProducts(options = {}) {
        if (!this.isAuthenticated) return [];
        await this.init();

        let query = this._client
            .from('products')
            .select('*')
            .eq('user_id', this._user.id)
            .order('last_used_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (options.archived !== undefined) {
            query = query.eq('is_archived', options.archived);
        } else {
            query = query.eq('is_archived', false);
        }

        if (options.category) {
            query = query.eq('category', options.category);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }

        const { data, error } = await query;
        if (error) {
            console.error('[Supabase] getProducts error:', error);
            return [];
        }
        return data || [];
    }

    /**
     * Get single product by ID
     * @param {string} productId - Product UUID
     * @returns {Promise<Object|null>}
     */
    async getProduct(productId) {
        if (!this.isAuthenticated) return null;
        await this.init();

        const { data, error } = await this._client
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('user_id', this._user.id)
            .single();

        if (error) {
            console.error('[Supabase] getProduct error:', error);
            return null;
        }
        return data;
    }

    /**
     * Create new product
     * @param {Object} product - Product data
     * @param {Object} imageData - { primaryImage, additionalImages[], thumbnail }
     * @returns {Promise<Object>} Created product
     */
    async createProduct(product, imageData = {}) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        // Validate required fields
        if (!product.name?.trim()) {
            throw new Error('Product name is required');
        }
        if (!product.category?.trim()) {
            throw new Error('Product category is required');
        }

        const productId = crypto.randomUUID();
        const imagePaths = await this._uploadProductImages(productId, imageData);

        const { data, error } = await this._client
            .from('products')
            .insert({
                id: productId,
                user_id: this._user.id,
                name: product.name,
                sku: product.sku || null,
                category: product.category,
                description: product.description || '',
                features: product.features || [],
                benefits: product.benefits || [],
                tags: product.tags || [],
                primary_image_path: imagePaths.primary || null,
                image_paths: imagePaths.additional || [],
                thumbnail_path: imagePaths.thumbnail || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update existing product
     * @param {string} productId - Product UUID
     * @param {Object} updates - Fields to update
     * @param {Object} newImageData - Optional new images
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(productId, updates, newImageData = null) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const updateData = { ...updates };

        if (newImageData) {
            const imagePaths = await this._uploadProductImages(productId, newImageData);
            if (imagePaths.primary) updateData.primary_image_path = imagePaths.primary;
            if (imagePaths.additional?.length) updateData.image_paths = imagePaths.additional;
            if (imagePaths.thumbnail) updateData.thumbnail_path = imagePaths.thumbnail;
        }

        const { data, error } = await this._client
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .eq('user_id', this._user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete product and associated images
     * @param {string} productId - Product UUID
     */
    async deleteProduct(productId) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const product = await this.getProduct(productId);
        if (product) {
            const paths = [
                product.primary_image_path,
                product.thumbnail_path,
                ...(product.image_paths || [])
            ].filter(Boolean);

            for (const path of paths) {
                try {
                    await this.storage().remove([path]);
                } catch (e) {
                    console.warn('[Supabase] Failed to delete product image:', path);
                }
            }
        }

        const { error } = await this._client
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('user_id', this._user.id);

        if (error) throw error;
    }

    /**
     * Mark product as recently used (updates last_used_at)
     * @param {string} productId - Product UUID
     */
    async touchProduct(productId) {
        if (!this.isAuthenticated) return;
        await this.init();

        await this._client
            .from('products')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', productId)
            .eq('user_id', this._user.id);
    }

    /**
     * Search products by name or description
     * @param {string} query - Search query
     * @returns {Promise<Array>}
     */
    async searchProducts(query) {
        if (!this.isAuthenticated) return [];
        await this.init();

        const { data, error } = await this._client
            .from('products')
            .select('*')
            .eq('user_id', this._user.id)
            .eq('is_archived', false)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .order('last_used_at', { ascending: false, nullsFirst: false })
            .limit(20);

        if (error) return [];
        return data || [];
    }

    /**
     * Get product image public URL
     * @param {string} path - Storage path
     * @returns {string|null}
     */
    getProductImageUrl(path) {
        if (!path) return null;
        const { data } = this.storage().getPublicUrl(path);
        return data?.publicUrl || null;
    }

    /**
     * Upload product images to storage
     * @private
     */
    async _uploadProductImages(productId, imageData) {
        const basePath = `${this._user.id}/products/${productId}`;
        const paths = { additional: [] };
        const storage = this.storage();

        // Upload primary image
        if (imageData.primaryImage) {
            try {
                const blob = await this._dataUrlToBlob(imageData.primaryImage);
                const ext = this._getImageExtension(blob.type);
                const path = `${basePath}/primary.${ext}`;
                const { error } = await storage.upload(path, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (!error) paths.primary = path;
            } catch (e) {
                console.warn('[Supabase] Failed to upload primary image:', e.message);
            }
        }

        // Upload thumbnail
        if (imageData.thumbnail) {
            try {
                const blob = await this._dataUrlToBlob(imageData.thumbnail);
                const ext = this._getImageExtension(blob.type);
                const path = `${basePath}/thumb.${ext}`;
                const { error } = await storage.upload(path, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (!error) paths.thumbnail = path;
            } catch (e) {
                console.warn('[Supabase] Failed to upload thumbnail:', e.message);
            }
        }

        // Upload additional images
        if (imageData.additionalImages?.length) {
            for (let i = 0; i < imageData.additionalImages.length; i++) {
                try {
                    const blob = await this._dataUrlToBlob(imageData.additionalImages[i]);
                    const ext = this._getImageExtension(blob.type);
                    const path = `${basePath}/image_${i + 1}.${ext}`;
                    const { error } = await storage.upload(path, blob, {
                        contentType: blob.type,
                        upsert: true
                    });
                    if (!error) paths.additional.push(path);
                } catch (e) {
                    console.warn(`[Supabase] Failed to upload additional image ${i}:`, e.message);
                }
            }
        }

        return paths;
    }

    async _dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return response.blob();
    }

    _getImageExtension(mimeType) {
        const map = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };
        return map[mimeType] || 'png';
    }

    // ==================== User Categories Methods ====================

    /**
     * Get all categories for current user
     * @returns {Promise<Array>} Categories array sorted by display_order
     */
    async getCategories() {
        if (!this.isAuthenticated) return [];
        await this.init();

        const { data, error } = await this._client
            .from('user_categories')
            .select('*')
            .eq('user_id', this._user.id)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('[Supabase] getCategories error:', error);
            return [];
        }
        return data || [];
    }

    /**
     * Create a new category
     * @param {Object} category - { name, icon?, color? }
     * @returns {Promise<Object>} Created category
     */
    async createCategory(category) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        // Generate slug from name
        const slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Get max display_order
        const { data: existing } = await this._client
            .from('user_categories')
            .select('display_order')
            .eq('user_id', this._user.id)
            .order('display_order', { ascending: false })
            .limit(1);

        const maxOrder = existing?.[0]?.display_order || 0;

        const { data, error } = await this._client
            .from('user_categories')
            .insert({
                user_id: this._user.id,
                name: category.name.trim(),
                slug,
                icon: category.icon || null,
                color: category.color || null,
                display_order: maxOrder + 1
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('Category already exists');
            }
            throw error;
        }
        return data;
    }

    /**
     * Update an existing category
     * @param {string} categoryId - Category UUID
     * @param {Object} updates - { name?, icon?, color?, display_order? }
     * @returns {Promise<Object>} Updated category
     */
    async updateCategory(categoryId, updates) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const updateData = { ...updates };

        // Regenerate slug if name changed
        if (updates.name) {
            updateData.slug = updates.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }

        const { data, error } = await this._client
            .from('user_categories')
            .update(updateData)
            .eq('id', categoryId)
            .eq('user_id', this._user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a category
     * @param {string} categoryId - Category UUID
     */
    async deleteCategory(categoryId) {
        if (!this.isAuthenticated) throw new Error('Not authenticated');
        await this.init();

        const { error } = await this._client
            .from('user_categories')
            .delete()
            .eq('id', categoryId)
            .eq('user_id', this._user.id);

        if (error) throw error;
    }

    /**
     * Get category by slug
     * @param {string} slug - Category slug
     * @returns {Promise<Object|null>}
     */
    async getCategoryBySlug(slug) {
        if (!this.isAuthenticated) return null;
        await this.init();

        const { data, error } = await this._client
            .from('user_categories')
            .select('*')
            .eq('user_id', this._user.id)
            .eq('slug', slug)
            .single();

        if (error) return null;
        return data;
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
