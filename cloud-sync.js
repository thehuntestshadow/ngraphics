/**
 * HEFAISTOS - Cloud Sync Manager
 * Handles bidirectional sync between local storage and Supabase
 *
 * Usage:
 *   cloudSync.uploadHistoryItem('infographics', item, imageData);
 *   await cloudSync.downloadHistory('infographics');
 *   await cloudSync.fullSync();
 */

class CloudSync {
    constructor() {
        this._syncInProgress = false;
        this._lastSyncTime = null;
        this._pendingUploads = [];
        this._syncQueue = [];
        this._processingQueue = false;
    }

    // Studio name to storage key mapping
    static STUDIO_KEYS = {
        infographics: { history: 'ngraphics_history', favorites: 'ngraphics_favorites', db: 'ngraphics_images' },
        modelStudio: { history: 'model_studio_history', favorites: 'model_studio_favorites', db: 'model_studio_images' },
        bundleStudio: { history: 'bundle_studio_history', favorites: 'bundle_studio_favorites', db: 'bundle_images' },
        lifestyleStudio: { history: 'lifestyle_studio_history', favorites: 'lifestyle_studio_favorites', db: 'lifestyle_studio_images' },
        copywriter: { history: 'copywriter_history', favorites: 'copywriter_favorites', db: 'copywriter_images' },
        packaging: { history: 'packaging_history', favorites: 'packaging_favorites', db: 'packaging_images' },
        comparison: { history: 'comparison_generator_history', favorites: 'comparison_generator_favorites', db: 'comparison_images' },
        sizeVisualizer: { history: 'size_visualizer_history', favorites: 'size_visualizer_favorites', db: 'size_visualizer_images' },
        faqGenerator: { history: 'faq_generator_history', favorites: 'faq_generator_favorites', db: 'faq_generator_images' },
        backgroundStudio: { history: 'background_studio_history', favorites: 'background_studio_favorites', db: 'background_studio_images' },
        badgeGenerator: { history: 'badge_generator_history', favorites: 'badge_generator_favorites', db: 'badge_images' },
        featureCards: { history: 'feature_cards_history', favorites: 'feature_cards_favorites', db: 'feature_cards_images' },
        sizeChart: { history: 'size_chart_history', favorites: 'size_chart_favorites', db: 'size_chart_images' },
        aplus: { history: 'aplus_generator_history', favorites: 'aplus_generator_favorites', db: 'aplus_images' },
        productVariants: { history: 'product_variants_history', favorites: 'product_variants_favorites', db: 'product_variants_images' },
        socialStudio: { history: 'social_studio_history', favorites: 'social_studio_favorites', db: 'social_studio_images' },
        exportCenter: { history: 'export_center_history', favorites: 'export_center_favorites', db: 'export_center_images' },
        adCreative: { history: 'ad_creative_history', favorites: 'ad_creative_favorites', db: 'ad_creative_images' },
        modelVideo: { history: 'model_video_history', favorites: 'model_video_favorites', db: 'model_video_images' }
    };

    // ==================== Properties ====================

    /** Whether sync is available (user is authenticated) */
    get canSync() {
        return typeof ngSupabase !== 'undefined' &&
               ngSupabase.isAuthenticated &&
               ngSupabase.syncEnabled;
    }

    /** Whether a sync is currently in progress */
    get isSyncing() {
        return this._syncInProgress;
    }

    /** Last sync timestamp */
    get lastSyncTime() {
        return this._lastSyncTime;
    }

    // ==================== Upload Methods ====================

    /**
     * Upload a history item to cloud (non-blocking, queued)
     * @param {string} studio - Studio name (e.g., 'infographics', 'modelStudio')
     * @param {Object} item - History item metadata
     * @param {Object} imageData - { imageUrl, imageUrls, thumbnail, productImageBase64 }
     */
    uploadHistoryItem(studio, item, imageData) {
        if (!this.canSync) return;

        this._syncQueue.push({
            type: 'history',
            studio,
            item,
            imageData
        });

        this._processQueue();
    }

    /**
     * Upload a favorite item to cloud (non-blocking, queued)
     * @param {string} studio - Studio name
     * @param {Object} item - Favorite item metadata
     * @param {Object} imageData - { imageUrl, imageUrls, thumbnail }
     */
    uploadFavoriteItem(studio, item, imageData) {
        if (!this.canSync) return;

        this._syncQueue.push({
            type: 'favorite',
            studio,
            item,
            imageData
        });

        this._processQueue();
    }

    /**
     * Process the sync queue (background, non-blocking)
     */
    async _processQueue() {
        if (this._processingQueue || this._syncQueue.length === 0) return;

        this._processingQueue = true;

        while (this._syncQueue.length > 0) {
            const task = this._syncQueue.shift();

            try {
                if (task.type === 'history') {
                    await this._uploadHistoryItemNow(task.studio, task.item, task.imageData);
                } else if (task.type === 'favorite') {
                    await this._uploadFavoriteItemNow(task.studio, task.item, task.imageData);
                }
            } catch (error) {
                console.warn(`[CloudSync] Failed to upload ${task.type}:`, error.message);
                // Don't re-queue failed items to avoid infinite loops
            }
        }

        this._processingQueue = false;
    }

    /**
     * Actually upload a history item
     */
    async _uploadHistoryItemNow(studio, item, imageData) {
        await ngSupabase.init();
        const userId = ngSupabase.user.id;
        const client = ngSupabase.client;

        // Upload images to storage
        const imagePaths = await this._uploadImages(userId, 'history', studio, item.id, imageData);

        // Insert metadata to database
        const { error } = await client
            .from('history')
            .upsert({
                id: item.id,
                user_id: userId,
                studio,
                title: item.title || '',
                prompt: item.prompt || '',
                settings: item.settings || {},
                seed: item.seed || null,
                image_path: imagePaths.main || null,
                thumbnail_path: imagePaths.thumbnail || null,
                variant_count: item.variantCount || 1,
                variant_paths: imagePaths.variants || [],
                created_at: item.timestamp || new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;

        console.log(`[CloudSync] Uploaded history item: ${item.id}`);
    }

    /**
     * Actually upload a favorite item
     */
    async _uploadFavoriteItemNow(studio, item, imageData) {
        await ngSupabase.init();
        const userId = ngSupabase.user.id;
        const client = ngSupabase.client;

        // Upload images to storage
        const imagePaths = await this._uploadImages(userId, 'favorites', studio, item.id, imageData);

        // Insert metadata to database
        const { error } = await client
            .from('favorites')
            .upsert({
                id: item.id,
                user_id: userId,
                studio,
                name: item.name || '',
                prompt: item.prompt || '',
                settings: item.settings || {},
                seed: item.seed || null,
                image_path: imagePaths.main || null,
                thumbnail_path: imagePaths.thumbnail || null,
                variant_count: item.variantCount || 1,
                variant_paths: imagePaths.variants || [],
                tags: item.tags || [],
                created_at: item.timestamp || new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) throw error;

        console.log(`[CloudSync] Uploaded favorite item: ${item.id}`);
    }

    /**
     * Upload images to Supabase Storage
     */
    async _uploadImages(userId, type, studio, itemId, imageData) {
        if (!imageData) return {};

        const storage = ngSupabase.storage();
        const basePath = `${userId}/${type}/${studio}/${itemId}`;
        const paths = {};

        // Upload main image
        if (imageData.imageUrl) {
            try {
                const blob = await this._dataUrlToBlob(imageData.imageUrl);
                const ext = this._getImageExtension(blob.type);
                const { error } = await storage.upload(`${basePath}/main.${ext}`, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (!error) paths.main = `${basePath}/main.${ext}`;
            } catch (e) {
                console.warn('[CloudSync] Failed to upload main image:', e.message);
            }
        }

        // Upload thumbnail
        if (imageData.thumbnail) {
            try {
                const blob = await this._dataUrlToBlob(imageData.thumbnail);
                const ext = this._getImageExtension(blob.type);
                const { error } = await storage.upload(`${basePath}/thumb.${ext}`, blob, {
                    contentType: blob.type,
                    upsert: true
                });
                if (!error) paths.thumbnail = `${basePath}/thumb.${ext}`;
            } catch (e) {
                console.warn('[CloudSync] Failed to upload thumbnail:', e.message);
            }
        }

        // Upload variants (if multiple images)
        if (imageData.imageUrls && imageData.imageUrls.length > 1) {
            paths.variants = [];
            for (let i = 1; i < imageData.imageUrls.length; i++) {
                try {
                    const blob = await this._dataUrlToBlob(imageData.imageUrls[i]);
                    const ext = this._getImageExtension(blob.type);
                    const variantPath = `${basePath}/variant_${i}.${ext}`;
                    const { error } = await storage.upload(variantPath, blob, {
                        contentType: blob.type,
                        upsert: true
                    });
                    if (!error) paths.variants.push(variantPath);
                } catch (e) {
                    console.warn(`[CloudSync] Failed to upload variant ${i}:`, e.message);
                }
            }
        }

        return paths;
    }

    // ==================== Download Methods ====================

    /**
     * Download history items from cloud
     * @param {string} studio - Studio name
     * @param {number} limit - Max items to fetch
     * @returns {Promise<Array>} Array of history items
     */
    async downloadHistory(studio, limit = 20) {
        if (!this.canSync) return [];

        await ngSupabase.init();
        const client = ngSupabase.client;

        const { data, error } = await client
            .from('history')
            .select('*')
            .eq('user_id', ngSupabase.user.id)
            .eq('studio', studio)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[CloudSync] Failed to download history:', error.message);
            return [];
        }

        return data || [];
    }

    /**
     * Download favorites from cloud
     * @param {string} studio - Studio name
     * @param {number} limit - Max items to fetch
     * @returns {Promise<Array>} Array of favorite items
     */
    async downloadFavorites(studio, limit = 30) {
        if (!this.canSync) return [];

        await ngSupabase.init();
        const client = ngSupabase.client;

        const { data, error } = await client
            .from('favorites')
            .select('*')
            .eq('user_id', ngSupabase.user.id)
            .eq('studio', studio)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[CloudSync] Failed to download favorites:', error.message);
            return [];
        }

        return data || [];
    }

    /**
     * Get a signed URL for a cloud image
     * @param {string} path - Storage path
     * @param {number} expiresIn - Seconds until expiry (default 1 hour)
     * @returns {Promise<string|null>} Signed URL or null
     */
    async getImageUrl(path, expiresIn = 3600) {
        if (!path || !this.canSync) return null;

        try {
            await ngSupabase.init();
            const { data, error } = await ngSupabase.storage()
                .createSignedUrl(path, expiresIn);

            if (error) return null;
            return data.signedUrl;
        } catch {
            return null;
        }
    }

    /**
     * Download image as base64
     * @param {string} path - Storage path
     * @returns {Promise<string|null>} Base64 data URL or null
     */
    async downloadImage(path) {
        if (!path || !this.canSync) return null;

        try {
            await ngSupabase.init();
            const { data, error } = await ngSupabase.storage()
                .download(path);

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

    // ==================== Full Sync ====================

    /**
     * Perform full sync (called manually or on login)
     * Note: With "fresh start" approach, this mainly loads cloud data
     * and makes it available for viewing, not merging with local.
     */
    async fullSync() {
        if (!this.canSync || this._syncInProgress) return;

        this._syncInProgress = true;
        this._emit('syncStart');

        try {
            // Process any pending uploads first
            await this._processQueue();

            // Update sync metadata
            await this._updateSyncMetadata();

            this._lastSyncTime = Date.now();
            localStorage.setItem('ngraphics_last_sync', this._lastSyncTime.toString());

            this._emit('syncComplete', { success: true, timestamp: this._lastSyncTime });
            console.log('[CloudSync] Full sync completed');
        } catch (error) {
            console.error('[CloudSync] Sync failed:', error);
            this._emit('syncComplete', { success: false, error: error.message });
        } finally {
            this._syncInProgress = false;
        }
    }

    /**
     * Update sync metadata in database
     */
    async _updateSyncMetadata() {
        if (!this.canSync) return;

        try {
            await ngSupabase.init();
            const client = ngSupabase.client;

            await client
                .from('sync_metadata')
                .upsert({
                    user_id: ngSupabase.user.id,
                    device_id: ngSupabase.deviceId,
                    last_sync_at: new Date().toISOString()
                }, { onConflict: 'user_id,device_id' });
        } catch (error) {
            console.warn('[CloudSync] Failed to update sync metadata:', error.message);
        }
    }

    // ==================== Delete Methods ====================

    /**
     * Delete a history item from cloud
     * @param {string} itemId - Item ID
     */
    async deleteHistoryItem(itemId) {
        if (!this.canSync) return;

        try {
            await ngSupabase.init();
            const client = ngSupabase.client;

            // Get item to find image paths
            const { data } = await client
                .from('history')
                .select('image_path, thumbnail_path, variant_paths')
                .eq('id', itemId)
                .single();

            // Delete images from storage
            if (data) {
                await this._deleteImages([
                    data.image_path,
                    data.thumbnail_path,
                    ...(data.variant_paths || [])
                ].filter(Boolean));
            }

            // Delete from database
            await client
                .from('history')
                .delete()
                .eq('id', itemId);

            console.log(`[CloudSync] Deleted history item: ${itemId}`);
        } catch (error) {
            console.warn('[CloudSync] Failed to delete history item:', error.message);
        }
    }

    /**
     * Delete a favorite item from cloud
     * @param {string} itemId - Item ID
     */
    async deleteFavoriteItem(itemId) {
        if (!this.canSync) return;

        try {
            await ngSupabase.init();
            const client = ngSupabase.client;

            // Get item to find image paths
            const { data } = await client
                .from('favorites')
                .select('image_path, thumbnail_path, variant_paths')
                .eq('id', itemId)
                .single();

            // Delete images from storage
            if (data) {
                await this._deleteImages([
                    data.image_path,
                    data.thumbnail_path,
                    ...(data.variant_paths || [])
                ].filter(Boolean));
            }

            // Delete from database
            await client
                .from('favorites')
                .delete()
                .eq('id', itemId);

            console.log(`[CloudSync] Deleted favorite item: ${itemId}`);
        } catch (error) {
            console.warn('[CloudSync] Failed to delete favorite item:', error.message);
        }
    }

    /**
     * Delete images from storage
     */
    async _deleteImages(paths) {
        if (!paths || paths.length === 0) return;

        try {
            const storage = ngSupabase.storage();
            await storage.remove(paths);
        } catch (error) {
            console.warn('[CloudSync] Failed to delete images:', error.message);
        }
    }

    // ==================== Utility Methods ====================

    /**
     * Convert data URL to Blob
     */
    async _dataUrlToBlob(dataUrl) {
        if (!dataUrl) throw new Error('No data URL provided');

        // Handle both data URLs and regular URLs
        if (dataUrl.startsWith('data:')) {
            const response = await fetch(dataUrl);
            return response.blob();
        } else if (dataUrl.startsWith('http')) {
            const response = await fetch(dataUrl);
            return response.blob();
        } else {
            throw new Error('Invalid image URL');
        }
    }

    /**
     * Get file extension from MIME type
     */
    _getImageExtension(mimeType) {
        const map = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };
        return map[mimeType] || 'jpg';
    }

    /**
     * Emit event for external listeners
     */
    _emit(event, data = {}) {
        window.dispatchEvent(new CustomEvent(`cloudSync:${event}`, { detail: data }));
    }

    /**
     * Get cloud storage usage estimate
     * @returns {Promise<Object>} { used, limit, percentage }
     */
    async getStorageUsage() {
        if (!this.canSync) return { used: 0, limit: 0, percentage: 0 };

        try {
            await ngSupabase.init();
            const client = ngSupabase.client;

            // Get all history and favorites to count images
            const [historyResult, favoritesResult] = await Promise.all([
                client.from('history').select('id', { count: 'exact', head: true })
                    .eq('user_id', ngSupabase.user.id),
                client.from('favorites').select('id', { count: 'exact', head: true })
                    .eq('user_id', ngSupabase.user.id)
            ]);

            const historyCount = historyResult.count || 0;
            const favoritesCount = favoritesResult.count || 0;

            // Estimate: ~500KB per item average
            const estimatedUsed = (historyCount + favoritesCount) * 500 * 1024;
            const limit = 500 * 1024 * 1024; // 500MB assumed limit

            return {
                used: estimatedUsed,
                limit,
                percentage: Math.round((estimatedUsed / limit) * 100),
                historyCount,
                favoritesCount
            };
        } catch (error) {
            console.warn('[CloudSync] Failed to get storage usage:', error.message);
            return { used: 0, limit: 0, percentage: 0 };
        }
    }
}

// Export singleton instance
const cloudSync = new CloudSync();

// Expose globally
window.cloudSync = cloudSync;
window.CloudSync = CloudSync;

// Auto-sync on auth state change
if (typeof ngSupabase !== 'undefined') {
    ngSupabase.on('authChange', ({ event }) => {
        if (event === 'SIGNED_IN') {
            // Delay sync slightly to allow UI to update
            setTimeout(() => {
                cloudSync.fullSync().catch(err => {
                    console.warn('[CloudSync] Auto-sync failed:', err.message);
                });
            }, 1000);
        }
    });
}
