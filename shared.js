/**
 * NGRAPHICS - Shared Utilities
 * Common functionality used across Infographics and Model Studio pages
 */

// ============================================
// API KEY MANAGEMENT
// ============================================
const API_KEY_STORAGE = 'openrouter_api_key';

const SharedAPI = {
    getKey() {
        return localStorage.getItem(API_KEY_STORAGE) || '';
    },

    saveKey(key) {
        if (key) {
            localStorage.setItem(API_KEY_STORAGE, key);
            return true;
        }
        return false;
    },

    hasKey() {
        return !!this.getKey();
    }
};

// ============================================
// API REQUEST HANDLING
// ============================================
const SharedRequest = {
    /**
     * Extract image URL from various API response formats
     */
    extractImageFromResponse(data) {
        let imageUrl = null;

        const message = data.choices?.[0]?.message;
        if (message) {
            if (Array.isArray(message.content)) {
                for (const part of message.content) {
                    // OpenAI format
                    if (part.type === 'image_url' && part.image_url?.url) {
                        imageUrl = part.image_url.url;
                        break;
                    }
                    // Anthropic format
                    if (part.type === 'image' && part.source?.data) {
                        imageUrl = `data:${part.source.media_type || 'image/png'};base64,${part.source.data}`;
                        break;
                    }
                    // Gemini format (inline_data)
                    if (part.inline_data?.data) {
                        imageUrl = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
                        break;
                    }
                    // Alternative Gemini format
                    if (part.image?.data) {
                        imageUrl = `data:${part.image.mimeType || part.image.mime_type || 'image/png'};base64,${part.image.data}`;
                        break;
                    }
                    // Direct base64 in part
                    if (part.data && typeof part.data === 'string') {
                        imageUrl = `data:${part.mimeType || part.mime_type || 'image/png'};base64,${part.data}`;
                        break;
                    }
                }
            }

            // Check message.images array
            if (!imageUrl && message.images && message.images.length > 0) {
                const img = message.images[0];
                if (typeof img === 'string') {
                    imageUrl = img.startsWith('data:') || img.startsWith('http') ? img : `data:image/png;base64,${img}`;
                } else if (img.url) {
                    imageUrl = img.url;
                } else if (img.image_url?.url) {
                    imageUrl = img.image_url.url;
                } else if (img.b64_json) {
                    imageUrl = `data:image/png;base64,${img.b64_json}`;
                }
            }

            // Check for base64 string in content
            if (!imageUrl && message.content && typeof message.content === 'string') {
                const base64Match = message.content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
                if (base64Match) {
                    imageUrl = base64Match[0];
                }
            }
        }

        // DALL-E / images endpoint format
        if (!imageUrl && data.data && data.data[0]) {
            if (data.data[0].url) {
                imageUrl = data.data[0].url;
            } else if (data.data[0].b64_json) {
                imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
            }
        }

        // Deep search fallback
        if (!imageUrl) {
            imageUrl = this._deepSearchBase64(data);
        }

        return imageUrl;
    },

    _deepSearchBase64(obj, depth = 0) {
        if (depth > 10) return null;
        if (!obj || typeof obj !== 'object') return null;

        if (obj.data && typeof obj.data === 'string' && obj.data.length > 1000) {
            const mimeType = obj.mimeType || obj.mime_type || obj.media_type || 'image/png';
            return `data:${mimeType};base64,${obj.data}`;
        }
        if (obj.b64_json && typeof obj.b64_json === 'string') {
            return `data:image/png;base64,${obj.b64_json}`;
        }
        if (obj.url && typeof obj.url === 'string' && (obj.url.startsWith('data:image') || obj.url.startsWith('http'))) {
            return obj.url;
        }

        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = this._deepSearchBase64(item, depth + 1);
                if (found) return found;
            }
        } else {
            for (const key of Object.keys(obj)) {
                const found = this._deepSearchBase64(obj[key], depth + 1);
                if (found) return found;
            }
        }
        return null;
    },

    /**
     * Make API request with retry logic
     */
    async makeRequest(requestBody, apiKey, appTitle = 'NGRAPHICS', retries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': window.location.origin,
                        'X-Title': appTitle
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error?.message || `API Error: ${response.status}`);
                }

                const data = await response.json();
                const imageUrl = this.extractImageFromResponse(data);

                if (!imageUrl) {
                    if (data.error) {
                        throw new Error(data.error.message || 'Provider returned an error');
                    }
                    throw new Error('No image in response');
                }

                return imageUrl;

            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt}/${retries} failed:`, error.message);

                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        throw lastError || new Error('Failed after multiple attempts');
    },

    /**
     * Format error message for display
     */
    formatError(error) {
        let message = error.message || 'An error occurred';

        if (message.includes('401')) {
            message = 'Invalid API key. Please check your OpenRouter API key.';
        } else if (message.includes('429')) {
            message = 'Rate limit exceeded. Please wait and try again.';
        } else if (message.includes('modalities')) {
            message = 'This model does not support image generation. Please try a different model.';
        }

        return message;
    }
};

// ============================================
// HISTORY MANAGEMENT
// ============================================
class SharedHistory {
    constructor(storageKey, maxItems = 20) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
        this.items = [];
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.items = [];
        }
        return this.items;
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
        } catch (error) {
            console.error('Failed to save history:', error);
        }
    }

    add(imageUrl, metadata = {}) {
        const item = {
            id: Date.now(),
            imageUrl,
            timestamp: new Date().toISOString(),
            ...metadata
        };

        this.items.unshift(item);

        if (this.items.length > this.maxItems) {
            this.items = this.items.slice(0, this.maxItems);
        }

        this.save();
        return item;
    }

    clear() {
        this.items = [];
        this.save();
    }

    get count() {
        return this.items.length;
    }

    getAll() {
        return this.items;
    }

    findById(id) {
        return this.items.find(item => item.id === id);
    }
}

// ============================================
// IMAGE STORE (IndexedDB for large image storage)
// ============================================
class ImageStore {
    constructor(dbName = 'ngraphics_images') {
        this.dbName = dbName;
        this.storeName = 'images';
        this.db = null;
        this._initPromise = null;
    }

    async init() {
        if (this.db) return this.db;
        if (this._initPromise) return this._initPromise;

        this._initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('Failed to open ImageStore:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });

        return this._initPromise;
    }

    async save(id, images) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ id, ...images });
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async get(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global image store instance
const imageStore = new ImageStore();

// ============================================
// FAVORITES MANAGEMENT
// ============================================
class SharedFavorites {
    constructor(storageKey, maxItems = 50) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
        this.items = [];
        this.imageStore = imageStore;
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
            this.items = [];
        }
        return this.items;
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.items));
            return true;
        } catch (error) {
            console.error('Failed to save favorites:', error);
            return false;
        }
    }

    async add(favorite) {
        const id = Date.now();

        // Support multiple images (variants)
        const imageUrls = favorite.imageUrls || (favorite.imageUrl ? [favorite.imageUrl] : []);

        // Store images in IndexedDB
        const images = {
            imageUrl: imageUrls[0] || favorite.imageUrl, // Primary image for backward compat
            imageUrls: imageUrls, // All variant images
            productImageBase64: favorite.productImageBase64 || null,
            styleReferenceBase64: favorite.styleReferenceBase64 || null
        };

        try {
            await this.imageStore.save(id, images);
        } catch (error) {
            console.error('Failed to save images to IndexedDB:', error);
            // Fallback: store in localStorage (may fail for large images)
        }

        // Store metadata in localStorage (no images)
        const item = {
            id,
            timestamp: new Date().toISOString(),
            name: favorite.name || 'Untitled',
            seed: favorite.seed,
            prompt: favorite.prompt || '',
            settings: favorite.settings || {},
            variantCount: imageUrls.length, // Track how many variants
            // Store small thumbnail for grid display
            thumbnail: await this._createThumbnail(imageUrls[0] || favorite.imageUrl)
        };

        this.items.unshift(item);

        if (this.items.length > this.maxItems) {
            // Remove images from IndexedDB for items being removed
            const removedItems = this.items.slice(this.maxItems);
            for (const removed of removedItems) {
                this.imageStore.delete(removed.id).catch(() => {});
            }
            this.items = this.items.slice(0, this.maxItems);
        }

        this.save();
        return item;
    }

    async _createThumbnail(imageUrl, maxSize = 150) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxSize / img.width, maxSize / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = () => resolve(imageUrl); // Fallback to original
            img.src = imageUrl;
        });
    }

    async getImages(id) {
        try {
            return await this.imageStore.get(id);
        } catch (error) {
            console.error('Failed to load images:', error);
            return null;
        }
    }

    update(id, updates) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...updates };
            this.save();
            return this.items[index];
        }
        return null;
    }

    async remove(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.save();
            // Remove images from IndexedDB
            try {
                await this.imageStore.delete(id);
            } catch (error) {
                console.error('Failed to delete images:', error);
            }
            return true;
        }
        return false;
    }

    async clear() {
        // Delete all images from IndexedDB
        for (const item of this.items) {
            try {
                await this.imageStore.delete(item.id);
            } catch (error) {
                // Continue even if delete fails
            }
        }
        this.items = [];
        this.save();
    }

    get count() {
        return this.items.length;
    }

    getAll() {
        return this.items;
    }

    findById(id) {
        return this.items.find(item => item.id === id);
    }
}

// ============================================
// UI UTILITIES
// ============================================
const SharedUI = {
    /**
     * Show error message
     */
    showError(element, message, duration = 5000) {
        if (!element) return;

        const errorText = element.querySelector('.error-text');
        if (errorText) errorText.textContent = message;

        element.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                element.classList.remove('visible');
            }, duration);
        }
    },

    /**
     * Show success message
     */
    showSuccess(element, message, duration = 3000) {
        if (!element) return;

        const content = element.querySelector('.message-content');
        if (content) content.textContent = message;

        element.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                element.classList.remove('visible');
            }, duration);
        }
    },

    /**
     * Update API status indicator
     */
    updateApiStatus(element, connected) {
        if (!element) return;

        const dot = element.querySelector('.status-dot');
        const text = element.querySelector('.status-text');

        if (dot) {
            dot.style.background = connected ? 'var(--success)' : 'var(--error)';
        }
        if (text) {
            text.textContent = connected ? 'Connected' : 'Not Connected';
        }
    },

    /**
     * Show/hide loading state
     */
    showLoading(placeholderEl, loadingEl, resultEl) {
        if (placeholderEl) placeholderEl.style.display = 'none';
        if (resultEl) resultEl.classList.remove('visible');
        if (loadingEl) loadingEl.classList.add('visible');
    },

    hideLoading(loadingEl) {
        if (loadingEl) loadingEl.classList.remove('visible');
    },

    updateLoadingStatus(element, status) {
        if (element) element.textContent = status;
    },

    /**
     * Show toast notification
     */
    toast(message, type = 'info', duration = 3000) {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => toast.classList.add('visible'));

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove('visible');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    },

    /**
     * Show styled confirm dialog (replaces browser confirm())
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Confirm',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                confirmClass = 'btn-danger',
                icon = 'warning'
            } = options;

            const icons = {
                warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
            };

            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="confirm-modal-backdrop"></div>
                <div class="confirm-modal-content">
                    <div class="confirm-modal-icon confirm-icon-${icon}">${icons[icon] || icons.warning}</div>
                    <div class="confirm-modal-title">${title}</div>
                    <div class="confirm-modal-message">${message}</div>
                    <div class="confirm-modal-actions">
                        <button class="btn btn-secondary confirm-cancel">${cancelText}</button>
                        <button class="btn ${confirmClass} confirm-ok">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            requestAnimationFrame(() => modal.classList.add('visible'));

            const cleanup = (result) => {
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 300);
                resolve(result);
            };

            modal.querySelector('.confirm-cancel').addEventListener('click', () => cleanup(false));
            modal.querySelector('.confirm-ok').addEventListener('click', () => cleanup(true));
            modal.querySelector('.confirm-modal-backdrop').addEventListener('click', () => cleanup(false));

            // ESC to cancel
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    cleanup(false);
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);

            // Focus confirm button
            modal.querySelector('.confirm-ok').focus();
        });
    }
};

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
const SharedUpload = {
    /**
     * Setup drag-drop and click upload
     */
    setup(uploadArea, fileInput, callbacks = {}) {
        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFile(e.dataTransfer.files[0], callbacks);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0], callbacks);
            }
        });
    },

    /**
     * Handle uploaded file
     */
    handleFile(file, callbacks = {}) {
        if (!file.type.startsWith('image/')) {
            if (callbacks.onError) {
                callbacks.onError('Please upload an image file');
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (callbacks.onLoad) {
                callbacks.onLoad(e.target.result, file);
            }
        };
        reader.readAsDataURL(file);
    }
};

// ============================================
// LIGHTBOX
// ============================================
const SharedLightbox = {
    _currentImageUrl: null,

    /**
     * Setup lightbox
     */
    setup(lightboxEl, imageEl, closeBtn, downloadBtn) {
        if (!lightboxEl) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close(lightboxEl));
        }

        lightboxEl.addEventListener('click', (e) => {
            if (e.target === lightboxEl) {
                this.close(lightboxEl);
            }
        });

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (this._currentImageUrl) {
                    SharedDownload.downloadImage(this._currentImageUrl, 'image');
                }
            });
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxEl.classList.contains('visible')) {
                this.close(lightboxEl);
            }
        });
    },

    open(lightboxEl, imageEl, imageUrl) {
        if (!lightboxEl || !imageEl) return;

        this._currentImageUrl = imageUrl;
        imageEl.src = imageUrl;
        lightboxEl.classList.add('visible');
        document.body.style.overflow = 'hidden';
    },

    close(lightboxEl) {
        if (!lightboxEl) return;

        lightboxEl.classList.remove('visible');
        document.body.style.overflow = '';
    }
};

// ============================================
// DOWNLOAD UTILITIES
// ============================================
const SharedDownload = {
    /**
     * Download image
     */
    downloadImage(imageUrl, prefix = 'image') {
        if (!imageUrl) return;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${prefix}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
const SharedKeyboard = {
    /**
     * Setup common keyboard shortcuts
     */
    setup(handlers = {}) {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter - Generate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (handlers.generate) handlers.generate();
            }

            // Ctrl/Cmd + D - Download
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (handlers.download) handlers.download();
            }

            // Escape - Close modals
            if (e.key === 'Escape') {
                if (handlers.escape) handlers.escape();
            }
        });
    }
};

// ============================================
// COLLAPSIBLE SECTIONS
// ============================================
const SharedCollapsible = {
    /**
     * Setup collapsible toggle
     */
    setup(toggleBtn, sectionEl) {
        if (!toggleBtn || !sectionEl) return;

        toggleBtn.addEventListener('click', () => {
            sectionEl.classList.toggle('open');
        });
    }
};

// Export for use in other modules (if using ES modules in future)
if (typeof window !== 'undefined') {
    window.SharedAPI = SharedAPI;
    window.SharedRequest = SharedRequest;
    window.SharedHistory = SharedHistory;
    window.SharedFavorites = SharedFavorites;
    window.SharedUI = SharedUI;
    window.SharedUpload = SharedUpload;
    window.SharedLightbox = SharedLightbox;
    window.SharedDownload = SharedDownload;
    window.SharedKeyboard = SharedKeyboard;
    window.SharedCollapsible = SharedCollapsible;
}
