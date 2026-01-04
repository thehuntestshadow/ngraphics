// @ts-check
/**
 * HEFAISTOS - Supabase-First Storage
 * Primary storage layer with Supabase as source of truth, IndexedDB as cache
 *
 * SECURITY: All database operations are protected by Supabase Row Level Security (RLS).
 * RLS policies on 'history' and 'favorites' tables enforce that:
 *   - Users can only SELECT/INSERT/UPDATE/DELETE their own rows
 *   - user_id must match auth.uid() for all operations
 * This prevents IDOR vulnerabilities - no client-side ownership checks are needed.
 *
 * Usage:
 *   const storage = new SupabaseStorage('infographics', 'history');
 *   await storage.add(item, imageData);
 *   const items = await storage.getAll();
 */

// Studio name to ID mapping (for database)
const STUDIO_MAP = {
    ngraphics: 'infographics',
    model_studio: 'modelStudio',
    bundle_studio: 'bundleStudio',
    lifestyle_studio: 'lifestyleStudio',
    copywriter: 'copywriter',
    packaging: 'packaging',
    comparison_generator: 'comparison',
    size_visualizer: 'sizeVisualizer',
    faq_generator: 'faqGenerator',
    background_studio: 'backgroundStudio',
    badge_generator: 'badgeGenerator',
    feature_cards: 'featureCards',
    size_chart: 'sizeChart',
    aplus_generator: 'aplus',
    product_variants: 'productVariants',
    social_studio: 'socialStudio',
    export_center: 'exportCenter',
    ad_creative: 'adCreative',
    model_video: 'modelVideo'
};

// Reverse mapping
const STUDIO_MAP_REVERSE = Object.fromEntries(
    Object.entries(STUDIO_MAP).map(([k, v]) => [v, k])
);

/**
 * Sanitize a path component to prevent directory traversal
 * Removes ../ sequences, leading slashes, and other dangerous characters
 * @param {string} str - Path component to sanitize
 * @returns {string} Sanitized path component
 */
function sanitizePathComponent(str) {
    if (!str) return '';
    return String(str)
        .replace(/\.\./g, '')      // Remove .. sequences
        .replace(/^\/+/, '')        // Remove leading slashes
        .replace(/\/+/g, '-')       // Replace remaining slashes with dashes
        .replace(/[<>:"|?*]/g, '-') // Remove Windows-forbidden chars
        .trim();
}

/**
 * Safely extract error message from any error type
 * Handles Error objects, Supabase errors, strings, and objects
 * @param {any} error - Error to extract message from
 * @returns {string} Human-readable error message
 */
function getErrorMessage(error) {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return typeof error.error === 'string' ? error.error : 'Unknown error';
    try {
        return String(error);
    } catch {
        return 'Unknown error';
    }
}

/**
 * @typedef {Object} StorageItem
 * @property {number} id - Unique item ID (timestamp-based)
 * @property {string} timestamp - ISO timestamp
 * @property {string} [thumbnail] - Thumbnail data URL
 * @property {string} [title] - Item title (history)
 * @property {string} [name] - Item name (favorites)
 * @property {string} [prompt] - Generation prompt
 * @property {Object} [settings] - Saved settings
 * @property {number} [seed] - Generation seed
 * @property {number} [variantCount] - Number of image variants
 * @property {string[]} [tags] - Tags (favorites only)
 * @property {string} [folder] - Folder (favorites only)
 */

/**
 * @typedef {Object} ImageData
 * @property {string} [imageUrl] - Main image data URL
 * @property {string[]} [imageUrls] - All variant images
 * @property {string} [thumbnail] - Thumbnail data URL
 * @property {string} [productImageBase64] - Original product image
 * @property {string} [styleReferenceBase64] - Style reference image
 */

class SupabaseStorage {
    /**
     * @param {string} studioId - Local studio ID (e.g., 'ngraphics', 'model_studio')
     * @param {'history'|'favorites'} type - Storage type
     * @param {Object} [options]
     * @param {number} [options.maxItems=50] - Max items to store
     * @param {number} [options.cacheMaxAge=3600000] - Cache max age in ms (default: 1 hour)
     */
    constructor(studioId, type, options = {}) {
        this.studioId = studioId;
        this.studioName = STUDIO_MAP[studioId] || studioId;
        this.type = type;
        this.tableName = type; // 'history' or 'favorites'
        this.maxItems = options.maxItems || 50;
        this.cacheMaxAge = options.cacheMaxAge || 3600000;

        // Initialize cache (ImageStore)
        this.cache = new ImageStore(`${studioId}_${type}_cache`);

        // Items loaded from cache/cloud
        this._items = [];
        this._loaded = false;
        this._loadPromise = null;

        // Event listeners
        this._listeners = new Map();

        // Register with global registry for sync events
        if (typeof window !== 'undefined' && window._supabaseStorageInstances) {
            window._supabaseStorageInstances.add(this);
        }
    }

    // ==================== Core Methods ====================

    /**
     * Add new item to storage
     * @param {Object} metadata - Item metadata
     * @param {ImageData} [imageData] - Image data to store
     * @returns {Promise<StorageItem>} Created item
     */
    async add(metadata, imageData = {}) {
        const item = this._createItem(metadata, imageData);

        // Offline path: Save to cache and queue for later sync
        if (!navigator.onLine || !AuthGate.isAuthenticated()) {
            await this._saveToCache(item, imageData, { syncStatus: 'pending' });
            await this._queueOfflineWrite('add', item, imageData);
            this._items.unshift(item);
            this._enforceMaxItems();
            this._emit('itemAdded', item);
            return item;
        }

        // Online path: Save to Supabase first (source of truth)
        // Only add to _items AFTER successful save to prevent data loss
        try {
            await this._saveToSupabase(item, imageData);
            await this._saveToCache(item, imageData);
            this._items.unshift(item);
            this._enforceMaxItems();
            this._emit('itemAdded', item);
            return item;
        } catch (error) {
            console.error('[SupabaseStorage] Failed to save to Supabase:', error);
            // Don't silently fall back to offline - throw so caller knows save failed
            // Caller can retry or show error to user
            throw new Error(`Failed to save: ${getErrorMessage(error)}`);
        }
    }

    /**
     * Get single item by ID
     * @param {number} id - Item ID
     * @returns {Promise<StorageItem|null>}
     */
    async get(id) {
        await this._ensureLoaded();
        return this._items.find(item => item.id === id) || null;
    }

    /**
     * Get full images for an item
     * @param {number} id - Item ID
     * @returns {Promise<ImageData|null>}
     */
    async getImages(id) {
        const cacheKey = `${this.type}_${id}`;

        // Try cache first
        const cached = await this.cache.get(cacheKey);
        if (cached && cached.imageUrl) {
            return {
                imageUrl: cached.imageUrl,
                imageUrls: cached.imageUrls || [cached.imageUrl],
                productImageBase64: cached.productImageBase64,
                styleReferenceBase64: cached.styleReferenceBase64
            };
        }

        // Fetch from Supabase
        if (!AuthGate.isAuthenticated()) return null;

        try {
            const item = await this.get(id);
            if (!item || !item._cloudPaths) return null;

            const imageData = await this._downloadImages(item._cloudPaths);
            if (imageData) {
                // Update cache
                await this.cache.saveWithMeta(cacheKey, imageData, { syncStatus: 'synced' });
            }
            return imageData;
        } catch (error) {
            console.error('[SupabaseStorage] Failed to get images:', error);
            return null;
        }
    }

    /**
     * Remove item by ID
     * @param {number} id - Item ID
     * @returns {Promise<boolean>}
     */
    async remove(id) {
        const index = this._items.findIndex(item => item.id === id);
        if (index === -1) return false;

        const item = this._items[index];

        if (navigator.onLine && AuthGate.isAuthenticated()) {
            try {
                await this._deleteFromSupabase(id, item._cloudPaths);
            } catch (error) {
                console.error('[SupabaseStorage] Failed to delete from Supabase:', error);
                // Queue for later
                await this._queueOfflineWrite('delete', { id });
            }
        } else {
            await this._queueOfflineWrite('delete', { id });
        }

        // Remove from cache and local list
        await this.cache.delete(`${this.type}_${id}`);
        this._items.splice(index, 1);
        this._emit('itemRemoved', { id });

        return true;
    }

    /**
     * Update item (favorites only - for tags, folders, name)
     * @param {number} id - Item ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<StorageItem|null>}
     */
    async update(id, updates) {
        if (this.type !== 'favorites') {
            console.warn('[SupabaseStorage] Update only supported for favorites');
            return null;
        }

        const item = this._items.find(i => i.id === id);
        if (!item) return null;

        // Apply updates
        Object.assign(item, updates);

        if (navigator.onLine && AuthGate.isAuthenticated()) {
            try {
                await this._updateInSupabase(id, updates);
            } catch (error) {
                console.error('[SupabaseStorage] Failed to update in Supabase:', error);
                await this._queueOfflineWrite('update', { id, updates });
            }
        } else {
            await this._queueOfflineWrite('update', { id, updates });
        }

        // Update cache metadata
        await this.cache.updateMeta(`${this.type}_${id}`, { syncStatus: navigator.onLine ? 'synced' : 'pending' });
        this._emit('itemUpdated', item);

        return item;
    }

    /**
     * Clear all items for this studio
     * @returns {Promise<void>}
     */
    async clear() {
        if (AuthGate.isAuthenticated()) {
            try {
                await ngSupabase.init();
                const { error } = await ngSupabase.client
                    .from(this.tableName)
                    .delete()
                    .eq('user_id', ngSupabase.user.id)
                    .eq('studio', this.studioName);

                if (error) throw error;
            } catch (error) {
                console.error('[SupabaseStorage] Failed to clear from Supabase:', error);
            }
        }

        await this.cache.clear();
        this._items = [];
        this._emit('cleared');
    }

    // ==================== Query Methods ====================

    /**
     * Get all items
     * @param {Object} [options]
     * @param {number} [options.limit] - Max items to return
     * @param {number} [options.offset] - Offset for pagination
     * @returns {Promise<StorageItem[]>}
     */
    async getAll(options = {}) {
        await this._ensureLoaded();

        let items = [...this._items];

        if (options.offset) {
            items = items.slice(options.offset);
        }
        if (options.limit) {
            items = items.slice(0, options.limit);
        }

        return items;
    }

    /**
     * Find item by ID
     * @param {number} id
     * @returns {Promise<StorageItem|null>}
     */
    async findById(id) {
        await this._ensureLoaded();
        return this._items.find(item => item.id === id) || null;
    }

    /**
     * Search items
     * @param {string} query - Search query
     * @returns {Promise<StorageItem[]>}
     */
    async search(query) {
        await this._ensureLoaded();
        const lowerQuery = query.toLowerCase();

        return this._items.filter(item => {
            const title = (item.title || item.name || '').toLowerCase();
            const prompt = (item.prompt || '').toLowerCase();
            return title.includes(lowerQuery) || prompt.includes(lowerQuery);
        });
    }

    /**
     * Filter by tag (favorites only)
     * @param {string} tag
     * @returns {Promise<StorageItem[]>}
     */
    async filterByTag(tag) {
        await this._ensureLoaded();
        return this._items.filter(item =>
            item.tags && item.tags.includes(tag)
        );
    }

    /**
     * Filter by folder (favorites only)
     * @param {string} folder
     * @returns {Promise<StorageItem[]>}
     */
    async filterByFolder(folder) {
        await this._ensureLoaded();
        return this._items.filter(item => item.folder === folder);
    }

    /**
     * Get all unique tags (favorites only)
     * @returns {Promise<string[]>}
     */
    async getAllTags() {
        await this._ensureLoaded();
        const tags = new Set();
        this._items.forEach(item => {
            if (item.tags) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        return [...tags].sort();
    }

    /**
     * Get all unique folders (favorites only)
     * @returns {Promise<string[]>}
     */
    async getAllFolders() {
        await this._ensureLoaded();
        const folders = new Set();
        this._items.forEach(item => {
            if (item.folder) folders.add(item.folder);
        });
        return [...folders].sort();
    }

    // ==================== Sync Methods ====================

    /**
     * Force sync from cloud
     * @returns {Promise<void>}
     */
    async syncFromCloud() {
        if (!AuthGate.isAuthenticated()) return;

        this._emit('syncStart');

        try {
            await ngSupabase.init();
            const { data, error } = await ngSupabase.client
                .from(this.tableName)
                .select('*')
                .eq('user_id', ngSupabase.user.id)
                .eq('studio', this.studioName)
                .order('created_at', { ascending: false })
                .limit(this.maxItems);

            if (error) throw error;

            // Transform and cache items
            this._items = (data || []).map(row => this._rowToItem(row));

            // Update cache with metadata
            for (const item of this._items) {
                const cacheKey = `${this.type}_${item.id}`;
                await this.cache.saveWithMeta(cacheKey, { thumbnail: item.thumbnail }, {
                    syncStatus: 'synced',
                    cloudUpdatedAt: item.timestamp
                });
            }

            this._loaded = true;
            this._emit('syncComplete', { success: true, count: this._items.length });

        } catch (error) {
            console.error('[SupabaseStorage] Sync from cloud failed:', error);
            this._emit('syncComplete', { success: false, error: error.message });
        }
    }

    /**
     * Process offline queue
     * @returns {Promise<{processed: number, failed: number}>}
     */
    async flushOfflineQueue() {
        if (!AuthGate.isAuthenticated() || !navigator.onLine) {
            return { processed: 0, failed: 0 };
        }

        if (typeof offlineQueue === 'undefined') {
            return { processed: 0, failed: 0 };
        }

        return offlineQueue.flush(async (op) => {
            if (op.studioId !== this.studioId) return true; // Skip other studios

            switch (op.type) {
                case 'add_history':
                case 'add_favorite':
                    await this._saveToSupabase(op.data.item, op.data.imageData);
                    await this.cache.markSynced(`${this.type}_${op.data.item.id}`);
                    break;

                case 'delete_history':
                case 'delete_favorite':
                    await this._deleteFromSupabase(op.data.id, op.data.cloudPaths);
                    break;

                case 'update_favorite':
                    await this._updateInSupabase(op.data.id, op.data.updates);
                    await this.cache.markSynced(`${this.type}_${op.data.id}`);
                    break;

                default:
                    console.warn('[SupabaseStorage] Unknown operation type:', op.type);
            }

            return true;
        });
    }

    // ==================== Private Methods ====================

    /**
     * Ensure items are loaded
     */
    async _ensureLoaded() {
        if (this._loaded) return;
        if (this._loadPromise) return this._loadPromise;

        this._loadPromise = this._loadItems();
        await this._loadPromise;
        this._loadPromise = null;
    }

    /**
     * Load items from cache and optionally sync with cloud
     */
    async _loadItems() {
        // First, try to load from cache
        const cacheKeys = await this.cache.getAllKeys();
        const prefix = `${this.type}_`;
        const itemKeys = cacheKeys.filter(k => k.startsWith(prefix));

        // Load cached metadata
        const cachedItems = [];
        for (const key of itemKeys) {
            const data = await this.cache.get(key);
            if (data) {
                const id = parseInt(key.replace(prefix, ''), 10);
                cachedItems.push({
                    id,
                    ...data,
                    _fromCache: true
                });
            }
        }

        // Sort by timestamp/id descending
        cachedItems.sort((a, b) => (b.id || 0) - (a.id || 0));
        this._items = cachedItems;

        // If authenticated, sync with cloud in background
        if (AuthGate.isAuthenticated()) {
            // Don't await - do in background
            this.syncFromCloud().catch(e => console.warn('[SupabaseStorage] Background sync failed:', e));
        }

        this._loaded = true;
    }

    /**
     * Create new item object
     */
    _createItem(metadata, imageData) {
        const id = metadata.id || Date.now();
        const timestamp = metadata.timestamp || new Date().toISOString();

        // Create thumbnail if we have image data
        let thumbnail = imageData.thumbnail;
        if (!thumbnail && imageData.imageUrl) {
            // Will be generated by caller typically
            thumbnail = imageData.imageUrl;
        }

        return {
            id,
            timestamp,
            thumbnail,
            title: metadata.title || '',
            name: metadata.name || 'Untitled',
            prompt: metadata.prompt || '',
            settings: metadata.settings || {},
            seed: metadata.seed || null,
            variantCount: imageData.imageUrls?.length || 1,
            tags: metadata.tags || [],
            folder: metadata.folder || null
        };
    }

    /**
     * Save item to Supabase
     *
     * SECURITY: Row Level Security (RLS) policies on 'history' and 'favorites' tables
     * ensure users can only insert rows where user_id matches their auth.uid().
     * No client-side ownership check needed - enforced at database level.
     */
    async _saveToSupabase(item, imageData) {
        await ngSupabase.init();
        const userId = ngSupabase.user.id;

        // Upload images (throws if main image fails)
        const { paths: cloudPaths, failures } = await this._uploadImages(userId, item.id, imageData);
        item._cloudPaths = cloudPaths;
        item._uploadFailures = failures.length > 0 ? failures : undefined;

        // Prepare row data
        const row = {
            id: item.id,
            user_id: userId,
            studio: this.studioName,
            prompt: item.prompt || '',
            settings: item.settings || {},
            seed: item.seed || null,
            image_path: cloudPaths.main || null,
            thumbnail_path: cloudPaths.thumbnail || null,
            variant_count: item.variantCount || 1,
            variant_paths: cloudPaths.variants || [],
            created_at: item.timestamp
        };

        // Add type-specific fields
        if (this.type === 'history') {
            row.title = item.title || '';
        } else {
            row.name = item.name || 'Untitled';
            row.tags = item.tags || [];
        }

        // Upsert to database
        const { error } = await ngSupabase.client
            .from(this.tableName)
            .upsert(row, { onConflict: 'id' });

        if (error) throw error;
    }

    /**
     * Save item to local cache
     */
    async _saveToCache(item, imageData, meta = {}) {
        const cacheKey = `${this.type}_${item.id}`;

        const cacheData = {
            ...item,
            imageUrl: imageData.imageUrl,
            imageUrls: imageData.imageUrls,
            productImageBase64: imageData.productImageBase64,
            styleReferenceBase64: imageData.styleReferenceBase64
        };

        await this.cache.saveWithMeta(cacheKey, cacheData, {
            syncStatus: meta.syncStatus || 'synced'
        });
    }

    /**
     * Delete item from Supabase
     *
     * SECURITY: RLS policies ensure users can only delete their own rows.
     * The .eq('user_id', userId) clause is for clarity; RLS enforces this regardless.
     */
    async _deleteFromSupabase(id, cloudPaths) {
        await ngSupabase.init();

        // Delete images from storage
        if (cloudPaths) {
            const storage = ngSupabase.storage();
            const pathsToDelete = [
                cloudPaths.main,
                cloudPaths.thumbnail,
                ...(cloudPaths.variants || [])
            ].filter(Boolean);

            for (const path of pathsToDelete) {
                try {
                    await storage.remove([path]);
                } catch (e) {
                    console.warn('[SupabaseStorage] Failed to delete image:', path);
                }
            }
        }

        // Delete from database
        const { error } = await ngSupabase.client
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('user_id', ngSupabase.user.id);

        if (error) throw error;
    }

    /**
     * Update item in Supabase
     *
     * SECURITY: RLS policies ensure users can only update their own rows.
     * The .eq('user_id', userId) clause is for clarity; RLS enforces this regardless.
     */
    async _updateInSupabase(id, updates) {
        await ngSupabase.init();

        const { error } = await ngSupabase.client
            .from(this.tableName)
            .update(updates)
            .eq('id', id)
            .eq('user_id', ngSupabase.user.id);

        if (error) throw error;
    }

    /**
     * Upload images to Supabase storage
     * @returns {Promise<{paths: Object, failures: string[]}>}
     */
    async _uploadImages(userId, itemId, imageData) {
        if (!imageData) return { paths: {}, failures: [] };

        const storage = ngSupabase.storage();
        // Sanitize all path components to prevent directory traversal
        const safeUserId = sanitizePathComponent(userId);
        const safeStudioName = sanitizePathComponent(this.studioName);
        const safeItemId = sanitizePathComponent(String(itemId));
        const basePath = `${safeUserId}/${this.type}/${safeStudioName}/${safeItemId}`;
        const paths = {};
        const failures = [];

        // Upload main image - this is critical, throw if it fails
        if (imageData.imageUrl) {
            try {
                const blob = await this._dataUrlToBlob(imageData.imageUrl);
                const ext = this._getImageExtension(blob.type);
                const path = `${basePath}/main.${ext}`;
                const { error } = await storage.upload(path, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (error) {
                    // Main image failure is critical - throw to caller
                    throw new Error(`Main image upload failed: ${getErrorMessage(error)}`);
                }
                paths.main = path;
            } catch (e) {
                console.error('[SupabaseStorage] Failed to upload main image:', e.message);
                throw e; // Re-throw - main image is required
            }
        }

        // Upload thumbnail - non-critical, track failure
        if (imageData.thumbnail) {
            try {
                const blob = await this._dataUrlToBlob(imageData.thumbnail);
                const ext = this._getImageExtension(blob.type);
                const path = `${basePath}/thumb.${ext}`;
                const { error } = await storage.upload(path, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (error) {
                    const errorMsg = getErrorMessage(error);
                    failures.push(`thumbnail: ${errorMsg}`);
                    console.warn('[SupabaseStorage] Thumbnail upload failed:', errorMsg);
                } else {
                    paths.thumbnail = path;
                }
            } catch (e) {
                const errorMsg = getErrorMessage(e);
                failures.push(`thumbnail: ${errorMsg}`);
                console.warn('[SupabaseStorage] Failed to upload thumbnail:', errorMsg);
            }
        }

        // Upload variants - non-critical, track failures
        if (imageData.imageUrls && imageData.imageUrls.length > 1) {
            paths.variants = [];
            for (let i = 1; i < imageData.imageUrls.length; i++) {
                try {
                    const blob = await this._dataUrlToBlob(imageData.imageUrls[i]);
                    const ext = this._getImageExtension(blob.type);
                    const path = `${basePath}/variant_${i}.${ext}`;
                    const { error } = await storage.upload(path, blob, {
                        contentType: blob.type,
                        upsert: true
                    });
                    if (error) {
                        const errorMsg = getErrorMessage(error);
                        failures.push(`variant_${i}: ${errorMsg}`);
                        console.warn(`[SupabaseStorage] Variant ${i} upload failed:`, errorMsg);
                    } else {
                        paths.variants.push(path);
                    }
                } catch (e) {
                    const errorMsg = getErrorMessage(e);
                    failures.push(`variant_${i}: ${errorMsg}`);
                    console.warn(`[SupabaseStorage] Failed to upload variant ${i}:`, errorMsg);
                }
            }
        }

        // Log summary if there were non-critical failures
        if (failures.length > 0) {
            console.warn(`[SupabaseStorage] Upload completed with ${failures.length} non-critical failure(s):`, failures);
        }

        return { paths, failures };
    }

    /**
     * Download images from Supabase storage
     */
    async _downloadImages(cloudPaths) {
        if (!cloudPaths) return null;

        const result = {};

        // Download main image
        if (cloudPaths.main) {
            result.imageUrl = await this._downloadImage(cloudPaths.main);
        }

        // Download variants
        if (cloudPaths.variants?.length > 0) {
            result.imageUrls = [result.imageUrl];
            for (const path of cloudPaths.variants) {
                const url = await this._downloadImage(path);
                if (url) result.imageUrls.push(url);
            }
        } else if (result.imageUrl) {
            result.imageUrls = [result.imageUrl];
        }

        return result;
    }

    /**
     * Download single image from storage
     */
    async _downloadImage(path) {
        try {
            const { data, error } = await ngSupabase.storage().download(path);
            if (error || !data) return null;

            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(data);
            });
        } catch {
            return null;
        }
    }

    /**
     * Queue offline write operation
     */
    async _queueOfflineWrite(action, item, imageData) {
        if (typeof offlineQueue === 'undefined') return;

        const type = action === 'add'
            ? (this.type === 'history' ? 'add_history' : 'add_favorite')
            : action === 'delete'
                ? (this.type === 'history' ? 'delete_history' : 'delete_favorite')
                : 'update_favorite';

        await offlineQueue.enqueue({
            type,
            studioId: this.studioId,
            itemId: item.id,
            data: {
                item,
                imageData,
                id: item.id,
                updates: action === 'update' ? imageData : undefined,
                cloudPaths: item._cloudPaths
            }
        });
    }

    /**
     * Transform database row to item object
     */
    _rowToItem(row) {
        return {
            id: row.id,
            timestamp: row.created_at,
            thumbnail: null, // Will be loaded on demand
            title: row.title || '',
            name: row.name || 'Untitled',
            prompt: row.prompt || '',
            settings: row.settings || {},
            seed: row.seed || null,
            variantCount: row.variant_count || 1,
            tags: row.tags || [],
            folder: row.folder || null,
            _cloudPaths: {
                main: row.image_path,
                thumbnail: row.thumbnail_path,
                variants: row.variant_paths || []
            }
        };
    }

    /**
     * Enforce max items limit
     */
    _enforceMaxItems() {
        if (this._items.length > this.maxItems) {
            const removed = this._items.splice(this.maxItems);
            // Clean up cache for removed items
            removed.forEach(item => {
                this.cache.delete(`${this.type}_${item.id}`);
            });
        }
    }

    /**
     * Convert data URL to Blob
     */
    async _dataUrlToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return response.blob();
    }

    /**
     * Get file extension from MIME type
     */
    _getImageExtension(mimeType) {
        const map = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };
        return map[mimeType] || 'png';
    }

    // ==================== Event Emitter ====================

    /**
     * Add event listener
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
        return () => this._listeners.get(event)?.delete(callback);
    }

    /**
     * Emit event
     * @param {string} event
     * @param {*} data
     */
    _emit(event, data) {
        const listeners = this._listeners.get(event);
        if (listeners) {
            listeners.forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error('[SupabaseStorage] Event listener error:', e);
                }
            });
        }
    }

    // ==================== Static Helpers ====================

    /**
     * Get studio ID from storage key
     * @param {string} storageKey - e.g., 'ngraphics_history'
     * @returns {string} Studio ID
     */
    static getStudioIdFromKey(storageKey) {
        // Remove _history or _favorites suffix
        return storageKey.replace(/_history$|_favorites$/, '');
    }

    /**
     * Get studio name from studio ID
     * @param {string} studioId
     * @returns {string}
     */
    static getStudioName(studioId) {
        return STUDIO_MAP[studioId] || studioId;
    }
}

// Export globally
if (typeof window !== 'undefined') {
    window.SupabaseStorage = SupabaseStorage;
    window.STUDIO_MAP = STUDIO_MAP;
    window.STUDIO_MAP_REVERSE = STUDIO_MAP_REVERSE;

    // Global registry for active storage instances
    window._supabaseStorageInstances = new Set();

    // Listen for sync requests
    window.addEventListener('requestSync', async () => {
        console.log('[SupabaseStorage] Sync requested');

        const promises = [];
        for (const instance of window._supabaseStorageInstances) {
            if (instance.syncFromCloud) {
                promises.push(
                    instance.syncFromCloud().catch(e =>
                        console.warn(`[SupabaseStorage] Sync failed for ${instance.studioId}:`, e)
                    )
                );
            }
        }

        await Promise.all(promises);
        console.log('[SupabaseStorage] Sync complete');
    });
}
