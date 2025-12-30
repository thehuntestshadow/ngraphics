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
// THEME MANAGEMENT
// ============================================
const THEME_STORAGE = 'ngraphics_theme';

const SharedTheme = {
    current: 'dark',

    init() {
        const saved = localStorage.getItem(THEME_STORAGE);
        if (saved) {
            this.apply(saved);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.apply(prefersDark ? 'dark' : 'light');
        }
    },

    apply(theme) {
        this.current = theme;
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem(THEME_STORAGE, theme);
    },

    toggle() {
        const newTheme = this.current === 'dark' ? 'light' : 'dark';
        this.apply(newTheme);
    },

    setupToggle(buttonEl) {
        if (buttonEl) {
            buttonEl.addEventListener('click', () => this.toggle());
        }
    }
};

// ============================================
// SHARED HEADER
// ============================================
const SharedHeader = {
    // SVG icons for navigation
    icons: {
        logo: `<svg viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
            <path d="M12 28V12h4l8 10V12h4v16h-4l-8-10v10h-4z" fill="currentColor"/>
        </svg>`,
        dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>`,
        infographics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
        </svg>`,
        models: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
        </svg>`,
        bundles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>`,
        lifestyle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>`,
        copywriter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>`,
        packaging: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>`,
        background: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
        </svg>`,
        badges: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`,
        featureCards: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <polygon points="12 8 14 12 10 12 12 8"/>
            <line x1="8" y1="16" x2="16" y2="16"/>
        </svg>`,
        sizeChart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>`,
        aplus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>`,
        productVariants: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="9" height="9" rx="1"/>
            <rect x="13" y="2" width="9" height="9" rx="1"/>
            <rect x="2" y="13" width="9" height="9" rx="1"/>
            <rect x="13" y="13" width="9" height="9" rx="1"/>
            <circle cx="6.5" cy="6.5" r="2" fill="currentColor"/>
            <circle cx="17.5" cy="6.5" r="2"/>
            <circle cx="6.5" cy="17.5" r="2"/>
            <circle cx="17.5" cy="17.5" r="2"/>
        </svg>`,
        docs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>`,
        moon: `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`,
        sun: `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`
    },

    // Page configurations
    pages: {
        infographics: { href: 'index.html', label: 'Infographics', subtitle: 'Infographic Studio' },
        dashboard: { href: 'dashboard.html', label: 'Dashboard', subtitle: 'Dashboard' },
        models: { href: 'models.html', label: 'Models', subtitle: 'Model Studio' },
        bundles: { href: 'bundle.html', label: 'Bundles', subtitle: 'Bundle Studio' },
        lifestyle: { href: 'lifestyle.html', label: 'Lifestyle', subtitle: 'Lifestyle Studio' },
        copywriter: { href: 'copywriter.html', label: 'Copywriter', subtitle: 'AI Copywriter' },
        packaging: { href: 'packaging.html', label: 'Packaging', subtitle: 'Packaging Mockup' },
        background: { href: 'background.html', label: 'Background', subtitle: 'Background Studio' },
        comparison: { href: 'comparison.html', label: 'Compare', subtitle: 'Comparison Generator' },
        'size-visualizer': { href: 'size-visualizer.html', label: 'Size', subtitle: 'Size Visualizer' },
        'faq-generator': { href: 'faq-generator.html', label: 'FAQ', subtitle: 'FAQ Generator' },
        'badge-generator': { href: 'badge-generator.html', label: 'Badges', subtitle: 'Badge Generator' },
        'feature-cards': { href: 'feature-cards.html', label: 'Cards', subtitle: 'Feature Cards' },
        'size-chart': { href: 'size-chart.html', label: 'Size Chart', subtitle: 'Size Chart Generator' },
        'a-plus': { href: 'a-plus.html', label: 'A+', subtitle: 'A+ Content Generator' },
        'product-variants': { href: 'product-variants.html', label: 'Variants', subtitle: 'Product Variants' },
        docs: { href: 'docs.html', label: 'Docs', subtitle: 'Documentation' }
    },

    /**
     * Render header into the page
     * @param {Object} options
     * @param {string} options.currentPage - Current page key (infographics, dashboard, models, bundles, lifestyle, copywriter, packaging, background, comparison, size-visualizer, faq-generator, badge-generator, feature-cards, size-chart, a-plus, product-variants, docs)
     */
    render(options = {}) {
        const { currentPage = 'infographics' } = options;

        const headerEl = document.querySelector('.site-header');
        if (!headerEl) return;

        const currentConfig = this.pages[currentPage] || this.pages.infographics;
        const isHome = currentPage === 'infographics';
        const isDashboard = currentPage === 'dashboard';

        // Minimal header: Dashboard shows Docs, all others show Dashboard
        const navLink = isDashboard
            ? `<a href="${this.pages.docs.href}" class="docs-link" title="${this.pages.docs.label}">
                   ${this.icons.docs}
                   <span>${this.pages.docs.label}</span>
               </a>`
            : `<a href="${this.pages.dashboard.href}" class="docs-link" title="${this.pages.dashboard.label}">
                   ${this.icons.dashboard}
                   <span>${this.pages.dashboard.label}</span>
               </a>`;

        // Build header HTML
        headerEl.innerHTML = `
            <div class="header-content">
                <div class="logo-group">
                    ${isHome ? '' : '<a href="index.html" class="logo-link">'}
                        <div class="logo-mark">
                            ${this.icons.logo}
                        </div>
                        <div class="logo-text">
                            <span class="logo-title">NGRAPHICS</span>
                            <span class="logo-subtitle">${currentConfig.subtitle}</span>
                        </div>
                    ${isHome ? '' : '</a>'}
                </div>
                <div class="header-controls">
                    ${navLink}
                    <button class="theme-toggle" id="themeToggle" title="Toggle light/dark mode">
                        ${this.icons.moon}
                        ${this.icons.sun}
                    </button>
                </div>
            </div>
        `;

        // Setup theme toggle
        SharedTheme.setupToggle(document.getElementById('themeToggle'));
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
// HISTORY MANAGEMENT (IndexedDB for images)
// ============================================
class SharedHistory {
    constructor(storageKey, maxItems = 20) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
        this.items = [];
        this.imageStore = null; // Will be set after ImageStore is created
    }

    // Set the image store (called after imageStore is available)
    setImageStore(store) {
        this.imageStore = store;
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

    async add(imageUrl, metadata = {}) {
        const id = Date.now();

        // Support multiple images (variants)
        const imageUrls = metadata.imageUrls || (imageUrl ? [imageUrl] : []);
        const primaryImage = imageUrls[0] || imageUrl;

        // Store images in IndexedDB if available
        if (this.imageStore) {
            const images = {
                imageUrl: primaryImage,
                imageUrls: imageUrls,
                productImageBase64: metadata.productImageBase64 || null
            };
            try {
                await this.imageStore.save(`history_${id}`, images);
            } catch (error) {
                console.error('Failed to save history images to IndexedDB:', error);
            }
        }

        // Create thumbnail for grid display
        const thumbnail = await this._createThumbnail(primaryImage);

        const item = {
            id,
            timestamp: new Date().toISOString(),
            thumbnail, // Small thumbnail for display
            variantCount: imageUrls.length,
            // Store metadata but not full images
            title: metadata.title || '',
            prompt: metadata.prompt || '',
            seed: metadata.seed || null,
            settings: metadata.settings || {}
        };

        this.items.unshift(item);

        if (this.items.length > this.maxItems) {
            // Remove images from IndexedDB for items being removed
            const removedItems = this.items.slice(this.maxItems);
            for (const removed of removedItems) {
                if (this.imageStore) {
                    this.imageStore.delete(`history_${removed.id}`).catch(() => {});
                }
            }
            this.items = this.items.slice(0, this.maxItems);
        }

        this.save();
        return item;
    }

    async _createThumbnail(imageUrl, maxSize = 150) {
        if (!imageUrl) return null;
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
            img.onerror = () => resolve(null);
            img.src = imageUrl;
        });
    }

    async getImages(id) {
        if (!this.imageStore) return null;
        try {
            return await this.imageStore.get(`history_${id}`);
        } catch (error) {
            console.error('Failed to load history images:', error);
            return null;
        }
    }

    async clear() {
        // Delete all images from IndexedDB
        if (this.imageStore) {
            for (const item of this.items) {
                try {
                    await this.imageStore.delete(`history_${item.id}`);
                } catch (error) {
                    // Continue even if delete fails
                }
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

    async remove(id) {
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
            this.items.splice(index, 1);
            this.save();
            // Remove images from IndexedDB
            if (this.imageStore) {
                try {
                    await this.imageStore.delete(`history_${id}`);
                } catch (error) {
                    console.error('Failed to delete history images:', error);
                }
            }
            return true;
        }
        return false;
    }

    // Bulk remove
    async removeMultiple(ids) {
        const idsSet = new Set(ids.map(id => parseInt(id, 10) || id));
        const toRemove = this.items.filter(item => idsSet.has(item.id));

        this.items = this.items.filter(item => !idsSet.has(item.id));
        this.save();

        // Remove images from IndexedDB
        if (this.imageStore) {
            for (const item of toRemove) {
                try {
                    await this.imageStore.delete(`history_${item.id}`);
                } catch (error) {
                    // Continue even if delete fails
                }
            }
        }

        return toRemove.length;
    }

    // Search by title or date
    search(query) {
        if (!query) return this.items;
        const q = query.toLowerCase().trim();
        return this.items.filter(item => {
            const titleMatch = item.title && item.title.toLowerCase().includes(q);
            const dateMatch = item.timestamp && item.timestamp.includes(q);
            return titleMatch || dateMatch;
        });
    }

    // Filter by date range
    filterByDateRange(startDate, endDate) {
        return this.items.filter(item => {
            const itemDate = new Date(item.timestamp);
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        });
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

    async getAllKeys() {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteByIds(ids) {
        if (!ids || ids.length === 0) return 0;
        await this.init();
        let deleted = 0;
        for (const id of ids) {
            try {
                await this.delete(id);
                deleted++;
            } catch (e) {
                console.warn(`Failed to delete ${id}:`, e);
            }
        }
        return deleted;
    }
}


// ============================================
// FAVORITES MANAGEMENT
// ============================================
class SharedFavorites {
    constructor(storageKey, maxItems = 50) {
        this.storageKey = storageKey;
        this.maxItems = maxItems;
        this.items = [];
        this.imageStore = null;
    }

    setImageStore(store) {
        this.imageStore = store;
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
            tags: favorite.tags || [], // Tags for organization
            folder: favorite.folder || null, // Folder for organization
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

    // Tag management
    addTag(id, tag) {
        const item = this.findById(id);
        if (item) {
            if (!item.tags) item.tags = [];
            const normalizedTag = tag.toLowerCase().trim();
            if (normalizedTag && !item.tags.includes(normalizedTag)) {
                item.tags.push(normalizedTag);
                this.save();
                return true;
            }
        }
        return false;
    }

    removeTag(id, tag) {
        const item = this.findById(id);
        if (item && item.tags) {
            const index = item.tags.indexOf(tag.toLowerCase().trim());
            if (index !== -1) {
                item.tags.splice(index, 1);
                this.save();
                return true;
            }
        }
        return false;
    }

    getAllTags() {
        const tags = new Set();
        this.items.forEach(item => {
            if (item.tags) {
                item.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }

    filterByTag(tag) {
        if (!tag) return this.items;
        const normalizedTag = tag.toLowerCase().trim();
        return this.items.filter(item => item.tags && item.tags.includes(normalizedTag));
    }

    // Folder management
    setFolder(id, folder) {
        const item = this.findById(id);
        if (item) {
            item.folder = folder || null;
            this.save();
            return true;
        }
        return false;
    }

    getAllFolders() {
        const folders = new Set();
        this.items.forEach(item => {
            if (item.folder) {
                folders.add(item.folder);
            }
        });
        return Array.from(folders).sort();
    }

    filterByFolder(folder) {
        if (folder === null) {
            return this.items.filter(item => !item.folder);
        }
        if (!folder) return this.items;
        return this.items.filter(item => item.folder === folder);
    }

    // Search
    search(query) {
        if (!query) return this.items;
        const q = query.toLowerCase().trim();
        return this.items.filter(item => {
            const nameMatch = item.name && item.name.toLowerCase().includes(q);
            const tagMatch = item.tags && item.tags.some(tag => tag.includes(q));
            return nameMatch || tagMatch;
        });
    }

    // Combined filter
    filter({ tag, folder, query } = {}) {
        let results = this.items;

        if (folder !== undefined) {
            results = results.filter(item =>
                folder === null ? !item.folder : item.folder === folder
            );
        }

        if (tag) {
            const normalizedTag = tag.toLowerCase().trim();
            results = results.filter(item => item.tags && item.tags.includes(normalizedTag));
        }

        if (query) {
            const q = query.toLowerCase().trim();
            results = results.filter(item => {
                const nameMatch = item.name && item.name.toLowerCase().includes(q);
                const tagMatch = item.tags && item.tags.some(t => t.includes(q));
                return nameMatch || tagMatch;
            });
        }

        return results;
    }
}

// ============================================
// COMPONENT FACTORY FUNCTIONS
// ============================================
const SharedComponents = {
    /**
     * Create a form group with label and input
     */
    createFormGroup({ id, label, type = 'text', value = '', placeholder = '', options = null, className = '' }) {
        const group = document.createElement('div');
        group.className = `form-group ${className}`.trim();

        let inputHTML;
        if (type === 'select' && options) {
            inputHTML = `
                <select id="${id}" class="form-select">
                    ${options.map(opt =>
                        `<option value="${opt.value}"${opt.value === value ? ' selected' : ''}>${opt.label}</option>`
                    ).join('')}
                </select>
            `;
        } else if (type === 'textarea') {
            inputHTML = `<textarea id="${id}" class="form-textarea" placeholder="${placeholder}">${value}</textarea>`;
        } else {
            inputHTML = `<input type="${type}" id="${id}" class="input-field" value="${value}" placeholder="${placeholder}">`;
        }

        group.innerHTML = `
            <label for="${id}" class="form-label">${label}</label>
            ${inputHTML}
        `;

        return group;
    },

    /**
     * Create an option button group
     */
    createOptionButtons({ name, options, value, onChange }) {
        const container = document.createElement('div');
        container.className = 'option-buttons';
        container.dataset.name = name;

        container.innerHTML = options.map(opt => `
            <button type="button"
                class="option-btn${opt.value === value ? ' active' : ''}"
                data-value="${opt.value}"
                title="${opt.title || opt.label}">
                ${opt.icon ? `<span class="option-icon">${opt.icon}</span>` : ''}
                ${opt.label}
            </button>
        `).join('');

        container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (onChange) onChange(btn.dataset.value);
            });
        });

        container.getValue = () => container.querySelector('.option-btn.active')?.dataset.value;
        container.setValue = (val) => {
            container.querySelectorAll('.option-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.value === val);
            });
        };

        return container;
    },

    /**
     * Create a confirmation dialog
     */
    async confirm(message, { title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' } = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-header">
                        <h3 class="confirm-title">${title}</h3>
                    </div>
                    <div class="confirm-body">
                        <p>${message}</p>
                    </div>
                    <div class="confirm-actions">
                        <button type="button" class="btn btn-secondary confirm-cancel">${cancelText}</button>
                        <button type="button" class="btn btn-${type === 'danger' ? 'danger' : 'primary'} confirm-ok">${confirmText}</button>
                    </div>
                </div>
            `;

            const cleanup = (result) => {
                overlay.classList.add('closing');
                setTimeout(() => overlay.remove(), 200);
                resolve(result);
            };

            overlay.querySelector('.confirm-cancel').onclick = () => cleanup(false);
            overlay.querySelector('.confirm-ok').onclick = () => cleanup(true);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(false);
            });

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('visible'));
        });
    },

    /**
     * Create a result card with image and actions
     */
    createResultCard({ imageUrl, title, actions = [], onImageClick }) {
        const card = document.createElement('div');
        card.className = 'result-card';

        card.innerHTML = `
            <div class="result-image-container">
                <img src="${imageUrl}" alt="${title || 'Result'}" class="result-image">
            </div>
            ${title ? `<div class="result-title">${title}</div>` : ''}
            <div class="result-actions"></div>
        `;

        const actionsContainer = card.querySelector('.result-actions');
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `btn-action ${action.className || ''}`;
            btn.innerHTML = action.icon ? `${action.icon} ${action.label}` : action.label;
            btn.onclick = action.onClick;
            actionsContainer.appendChild(btn);
        });

        if (onImageClick) {
            card.querySelector('.result-image').addEventListener('click', onImageClick);
            card.querySelector('.result-image').style.cursor = 'pointer';
        }

        return card;
    },

    /**
     * Create a progress indicator
     */
    createProgress({ value = 0, max = 100, label = '', showPercent = true }) {
        const container = document.createElement('div');
        container.className = 'progress-container';

        const percent = Math.round((value / max) * 100);

        container.innerHTML = `
            ${label ? `<div class="progress-label">${label}</div>` : ''}
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
            ${showPercent ? `<div class="progress-percent">${percent}%</div>` : ''}
        `;

        container.setValue = (val) => {
            const pct = Math.round((val / max) * 100);
            container.querySelector('.progress-fill').style.width = `${pct}%`;
            const percentEl = container.querySelector('.progress-percent');
            if (percentEl) percentEl.textContent = `${pct}%`;
        };

        return container;
    },

    /**
     * Create a tooltip wrapper
     */
    wrapWithTooltip(element, text, position = 'top') {
        const wrapper = document.createElement('div');
        wrapper.className = `tooltip-wrapper tooltip-${position}`;
        wrapper.dataset.tooltip = text;
        wrapper.appendChild(element);
        return wrapper;
    },

    /**
     * Create tabs component
     */
    createTabs({ tabs, activeTab, onTabChange }) {
        const container = document.createElement('div');
        container.className = 'tabs-component';

        const tabsNav = document.createElement('div');
        tabsNav.className = 'tabs-nav';

        const tabsContent = document.createElement('div');
        tabsContent.className = 'tabs-content';

        tabs.forEach(tab => {
            // Tab button
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `tab-btn${tab.id === activeTab ? ' active' : ''}`;
            btn.dataset.tab = tab.id;
            btn.textContent = tab.label;
            tabsNav.appendChild(btn);

            // Tab panel
            const panel = document.createElement('div');
            panel.className = `tab-panel${tab.id === activeTab ? ' active' : ''}`;
            panel.dataset.tab = tab.id;
            if (tab.content) {
                if (typeof tab.content === 'string') {
                    panel.innerHTML = tab.content;
                } else {
                    panel.appendChild(tab.content);
                }
            }
            tabsContent.appendChild(panel);
        });

        tabsNav.addEventListener('click', (e) => {
            const btn = e.target.closest('.tab-btn');
            if (!btn) return;

            const tabId = btn.dataset.tab;
            tabsNav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            tabsContent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            tabsContent.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

            if (onTabChange) onTabChange(tabId);
        });

        container.appendChild(tabsNav);
        container.appendChild(tabsContent);

        container.setActiveTab = (tabId) => {
            tabsNav.querySelector(`[data-tab="${tabId}"]`)?.click();
        };

        return container;
    },

    /**
     * Create a dropdown menu
     */
    createDropdown({ trigger, items, position = 'bottom-start' }) {
        const container = document.createElement('div');
        container.className = 'dropdown-container';

        const menu = document.createElement('div');
        menu.className = `dropdown-menu dropdown-${position}`;

        items.forEach(item => {
            if (item.divider) {
                menu.appendChild(Object.assign(document.createElement('div'), { className: 'dropdown-divider' }));
            } else {
                const menuItem = document.createElement('button');
                menuItem.type = 'button';
                menuItem.className = `dropdown-item${item.danger ? ' danger' : ''}`;
                menuItem.innerHTML = item.icon ? `${item.icon} ${item.label}` : item.label;
                menuItem.onclick = () => {
                    container.classList.remove('open');
                    if (item.onClick) item.onClick();
                };
                menu.appendChild(menuItem);
            }
        });

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('open');
        });

        document.addEventListener('click', () => container.classList.remove('open'));

        container.appendChild(trigger);
        container.appendChild(menu);

        return container;
    },

    /**
     * Create empty state placeholder
     */
    createEmptyState({ icon, title, message, action }) {
        const container = document.createElement('div');
        container.className = 'empty-state';

        container.innerHTML = `
            ${icon ? `<div class="empty-state-icon">${icon}</div>` : ''}
            <div class="empty-state-title">${title}</div>
            <p class="empty-state-text">${message}</p>
            ${action ? `<button type="button" class="btn btn-primary empty-state-action">${action.label}</button>` : ''}
        `;

        if (action?.onClick) {
            container.querySelector('.empty-state-action')?.addEventListener('click', action.onClick);
        }

        return container;
    }
};

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
     * Handle uploaded file with optional compression
     */
    async handleFile(file, callbacks = {}) {
        if (!file.type.startsWith('image/')) {
            if (callbacks.onError) {
                callbacks.onError('Please upload an image file');
            }
            return;
        }

        const options = callbacks.options || {};
        const shouldCompress = options.compress !== false && file.size > 500 * 1024; // Compress if > 500KB

        try {
            let base64;
            let compressionInfo = null;

            // Use image compression if available and file is large
            if (shouldCompress && window.compressImage) {
                if (callbacks.onProgress) {
                    callbacks.onProgress('Compressing image...');
                }

                const result = await window.compressImage(file, {
                    maxWidth: options.maxWidth || 1920,
                    maxHeight: options.maxHeight || 1920,
                    quality: options.quality || 0.85
                });

                base64 = result.base64;
                compressionInfo = {
                    originalSize: result.originalSize || file.size,
                    compressedSize: result.size,
                    compressionRatio: result.compressionRatio
                };

                // Emit compression event
                if (window.events) {
                    window.events.emit('image:compressed', compressionInfo);
                }
            } else {
                // No compression, read as-is
                base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            if (callbacks.onLoad) {
                callbacks.onLoad(base64, file, compressionInfo);
            }

            // Emit upload event
            if (window.events) {
                window.events.emit('image:uploaded', {
                    file,
                    base64,
                    compressed: !!compressionInfo,
                    compressionInfo
                });
            }
        } catch (error) {
            console.error('File handling error:', error);
            // Fallback to simple FileReader
            const reader = new FileReader();
            reader.onload = (e) => {
                if (callbacks.onLoad) {
                    callbacks.onLoad(e.target.result, file);
                }
            };
            reader.onerror = () => {
                if (callbacks.onError) {
                    callbacks.onError('Failed to read image file');
                }
            };
            reader.readAsDataURL(file);
        }
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
    _handlers: {},
    _modalVisible: false,

    /**
     * Default shortcuts configuration
     */
    defaultShortcuts: [
        { key: 'Ctrl+Enter', action: 'generate', description: 'Generate image' },
        { key: 'Ctrl+D', action: 'download', description: 'Download image' },
        { key: 'Ctrl+C', action: 'copyPrompt', description: 'Copy prompt (when focused)' },
        { key: 'Escape', action: 'escape', description: 'Close modal/cancel' },
        { key: '?', action: 'showHelp', description: 'Show keyboard shortcuts' }
    ],

    /**
     * Setup common keyboard shortcuts
     */
    setup(handlers = {}) {
        this._handlers = handlers;

        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            const isInput = e.target.tagName === 'INPUT' ||
                           e.target.tagName === 'TEXTAREA' ||
                           e.target.isContentEditable;

            // ? - Show shortcuts help (unless typing)
            if (e.key === '?' && !isInput) {
                e.preventDefault();
                this.showShortcutsModal();
                return;
            }

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

            // Ctrl/Cmd + Shift + C - Copy prompt
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                if (handlers.copyPrompt) handlers.copyPrompt();
            }

            // Escape - Close modals
            if (e.key === 'Escape') {
                if (this._modalVisible) {
                    this.hideShortcutsModal();
                } else if (handlers.escape) {
                    handlers.escape();
                }
            }
        });

        // Create modal element
        this._createModal();
    },

    /**
     * Create the shortcuts modal
     */
    _createModal() {
        if (document.getElementById('keyboardShortcutsModal')) return;

        const modal = document.createElement('div');
        modal.id = 'keyboardShortcutsModal';
        modal.className = 'modal keyboard-shortcuts-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 480px;">
                <div class="modal-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="modal-close" id="closeShortcutsModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-list">
                        ${this.defaultShortcuts.map(s => `
                            <div class="shortcut-item">
                                <kbd>${s.key.replace('Ctrl', navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')}</kbd>
                                <span>${s.description}</span>
                            </div>
                        `).join('')}
                    </div>
                    <p class="shortcuts-hint">Press <kbd>?</kbd> anytime to show this help</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('#closeShortcutsModal').addEventListener('click', () => {
            this.hideShortcutsModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideShortcutsModal();
        });
    },

    /**
     * Show shortcuts modal
     */
    showShortcutsModal() {
        const modal = document.getElementById('keyboardShortcutsModal');
        if (modal) {
            modal.classList.add('visible');
            this._modalVisible = true;
        }
    },

    /**
     * Hide shortcuts modal
     */
    hideShortcutsModal() {
        const modal = document.getElementById('keyboardShortcutsModal');
        if (modal) {
            modal.classList.remove('visible');
            this._modalVisible = false;
        }
    },

    /**
     * Add custom shortcuts to the modal
     */
    addShortcuts(shortcuts) {
        this.defaultShortcuts.push(...shortcuts);
        // Recreate modal with new shortcuts
        const existing = document.getElementById('keyboardShortcutsModal');
        if (existing) existing.remove();
        this._createModal();
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

// ============================================
// ZIP DOWNLOAD
// ============================================
const SharedZip = {
    _jsZipLoaded: false,
    _jsZipLoading: null,

    /**
     * Load JSZip library dynamically
     */
    async _loadJSZip() {
        if (this._jsZipLoaded) return window.JSZip;
        if (this._jsZipLoading) return this._jsZipLoading;

        this._jsZipLoading = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => {
                this._jsZipLoaded = true;
                resolve(window.JSZip);
            };
            script.onerror = () => reject(new Error('Failed to load JSZip'));
            document.head.appendChild(script);
        });

        return this._jsZipLoading;
    },

    /**
     * Download images as ZIP with metadata
     * @param {Object} options - { images: [], metadata: {}, filename: 'images' }
     */
    async downloadAsZip({ images, metadata = {}, filename = 'ngraphics-export' }) {
        try {
            const JSZip = await this._loadJSZip();
            const zip = new JSZip();

            // Add images
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const imageData = image.url || image;

                // Convert base64 to blob
                let blob;
                if (imageData.startsWith('data:')) {
                    const response = await fetch(imageData);
                    blob = await response.blob();
                } else {
                    const response = await fetch(imageData);
                    blob = await response.blob();
                }

                const ext = blob.type.includes('png') ? 'png' : 'jpg';
                const imageName = image.name || `image-${i + 1}.${ext}`;
                zip.file(imageName, blob);
            }

            // Add metadata JSON
            if (Object.keys(metadata).length > 0) {
                const metadataJson = JSON.stringify({
                    ...metadata,
                    exportedAt: new Date().toISOString(),
                    imageCount: images.length
                }, null, 2);
                zip.file('metadata.json', metadataJson);
            }

            // Generate and download
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('ZIP download error:', error);
            throw error;
        }
    }
};

// ============================================
// COPY TO CLIPBOARD
// ============================================
const SharedClipboard = {
    /**
     * Copy text to clipboard
     */
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },

    /**
     * Copy with visual feedback on a button
     */
    async copyWithFeedback(text, button, successText = 'Copied!') {
        const originalHTML = button.innerHTML;
        const success = await this.copy(text);

        if (success) {
            button.classList.add('copied');
            button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg><span>${successText}</span>`;

            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalHTML;
            }, 2000);
        }

        return success;
    }
};

// ============================================
// IMAGE INFO OVERLAY
// ============================================
const SharedImageInfo = {
    /**
     * Create image info overlay element
     */
    createOverlay(info = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'image-info-overlay';
        overlay.innerHTML = `
            <div class="image-info-grid">
                ${info.seed ? `
                    <div class="image-info-item">
                        <span class="image-info-label">Seed</span>
                        <span class="image-info-value copyable" data-copy="${info.seed}">${info.seed}</span>
                    </div>
                ` : ''}
                ${info.model ? `
                    <div class="image-info-item">
                        <span class="image-info-label">Model</span>
                        <span class="image-info-value">${this._formatModel(info.model)}</span>
                    </div>
                ` : ''}
                ${info.dimensions ? `
                    <div class="image-info-item">
                        <span class="image-info-label">Size</span>
                        <span class="image-info-value">${info.dimensions}</span>
                    </div>
                ` : ''}
                ${info.aspectRatio ? `
                    <div class="image-info-item">
                        <span class="image-info-label">Ratio</span>
                        <span class="image-info-value">${info.aspectRatio}</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Add click to copy for copyable values
        overlay.querySelectorAll('.copyable').forEach(el => {
            el.addEventListener('click', async () => {
                const value = el.dataset.copy;
                const success = await SharedClipboard.copy(value);
                if (success) {
                    const original = el.textContent;
                    el.textContent = 'Copied!';
                    el.style.color = 'var(--success)';
                    setTimeout(() => {
                        el.textContent = original;
                        el.style.color = '';
                    }, 1500);
                }
            });
        });

        return overlay;
    },

    /**
     * Create info toggle button
     */
    createToggleButton(overlay) {
        const button = document.createElement('button');
        button.className = 'btn-info-toggle';
        button.title = 'Toggle image info';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
        `;

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            button.classList.toggle('active');
            overlay.classList.toggle('visible');
        });

        return button;
    },

    /**
     * Add info overlay to an image container
     */
    addToContainer(container, info) {
        const overlay = this.createOverlay(info);
        const button = this.createToggleButton(overlay);

        container.style.position = 'relative';
        container.appendChild(overlay);
        container.appendChild(button);

        return { overlay, button };
    },

    /**
     * Format model name for display
     */
    _formatModel(model) {
        if (!model) return '';
        // Extract just the model name from full path
        const parts = model.split('/');
        return parts[parts.length - 1].split(':')[0];
    }
};

// ============================================
// CONFIRMATION DIALOGS
// ============================================
const SharedConfirm = {
    /**
     * Show confirmation dialog
     * @param {Object} options - { title, message, confirmText, cancelText, type, warning }
     */
    async show({ title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default', warning = null }) {
        return new Promise((resolve) => {
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'modal confirm-modal visible';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${warning ? `
                            <div class="confirm-dialog-warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <p>${warning}</p>
                            </div>
                        ` : ''}
                        <p style="margin: 0; color: var(--text-secondary);">${message}</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary cancel-btn">${cancelText}</button>
                        <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'} confirm-btn">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cleanup = (result) => {
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 200);
                resolve(result);
            };

            modal.querySelector('.modal-close').addEventListener('click', () => cleanup(false));
            modal.querySelector('.cancel-btn').addEventListener('click', () => cleanup(false));
            modal.querySelector('.confirm-btn').addEventListener('click', () => cleanup(true));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(false);
            });

            // Focus confirm button
            modal.querySelector('.confirm-btn').focus();
        });
    },

    /**
     * Confirm before clearing (with export option)
     */
    async confirmClear({ itemCount, exportFn, itemName = 'items' }) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal confirm-modal visible';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 420px;">
                    <div class="modal-header">
                        <h3>Clear ${itemName}?</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="confirm-dialog-warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            <p>This will permanently delete ${itemCount} ${itemName}. This action cannot be undone.</p>
                        </div>
                        ${exportFn ? `
                            <label class="confirm-dialog-checkbox">
                                <input type="checkbox" id="exportBeforeClear">
                                <span>Export before clearing</span>
                            </label>
                        ` : ''}
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary cancel-btn">Cancel</button>
                        <button class="btn btn-danger confirm-btn">Clear All</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const cleanup = async (confirmed) => {
                if (confirmed && exportFn) {
                    const exportCheckbox = modal.querySelector('#exportBeforeClear');
                    if (exportCheckbox?.checked) {
                        await exportFn();
                    }
                }
                modal.classList.remove('visible');
                setTimeout(() => modal.remove(), 200);
                resolve(confirmed);
            };

            modal.querySelector('.modal-close').addEventListener('click', () => cleanup(false));
            modal.querySelector('.cancel-btn').addEventListener('click', () => cleanup(false));
            modal.querySelector('.confirm-btn').addEventListener('click', () => cleanup(true));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) cleanup(false);
            });
        });
    }
};

// ============================================
// DASHBOARD UTILITIES
// ============================================
const SharedDashboard = {
    // Storage keys for each studio
    STORAGE_KEYS: {
        infographics: { history: 'ngraphics_history', favorites: 'ngraphics_favorites' },
        modelStudio: { history: 'model_studio_history', favorites: 'model_studio_favorites' },
        bundleStudio: { history: 'bundle_studio_history', favorites: 'bundle_studio_favorites' },
        lifestyleStudio: { history: 'lifestyle_studio_history', favorites: 'lifestyle_studio_favorites' },
        copywriter: { history: 'copywriter_history', favorites: 'copywriter_favorites' },
        packaging: { history: 'packaging_history', favorites: 'packaging_favorites' },
        comparison: { history: 'comparison_generator_history', favorites: 'comparison_generator_favorites' },
        sizeVisualizer: { history: 'size_visualizer_history', favorites: 'size_visualizer_favorites' },
        faqGenerator: { history: 'faq_generator_history', favorites: 'faq_generator_favorites' },
        backgroundStudio: { history: 'background_studio_history', favorites: 'background_studio_favorites' },
        badgeGenerator: { history: 'badge_generator_history', favorites: 'badge_generator_favorites' },
        featureCards: { history: 'feature_cards_history', favorites: 'feature_cards_favorites' },
        sizeChart: { history: 'size_chart_history', favorites: 'size_chart_favorites' },
        aplus: { history: 'aplus_generator_history', favorites: 'aplus_generator_favorites' },
        productVariants: { history: 'product_variants_history', favorites: 'product_variants_favorites' }
    },

    /**
     * Load all history and favorites from all studios
     */
    loadAllData() {
        const data = {};

        for (const [studio, keys] of Object.entries(this.STORAGE_KEYS)) {
            data[studio] = {
                history: this._loadFromStorage(keys.history),
                favorites: this._loadFromStorage(keys.favorites)
            };
        }

        return data;
    },

    _loadFromStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    /**
     * Get aggregated metrics from all data
     */
    getMetrics(data) {
        let totalGenerations = 0;
        let totalFavorites = 0;
        const perStudio = {};

        for (const [studio, items] of Object.entries(data)) {
            const historyCount = items.history?.length || 0;
            const favoritesCount = items.favorites?.length || 0;

            totalGenerations += historyCount;
            totalFavorites += favoritesCount;
            perStudio[studio] = { history: historyCount, favorites: favoritesCount };
        }

        return {
            totalGenerations,
            totalFavorites,
            perStudio,
            apiConnected: !!localStorage.getItem('openrouter_api_key')
        };
    },

    /**
     * Get generation trends over last N days
     */
    getGenerationTrends(data, days = 7) {
        const allHistory = [];

        // Combine all history
        for (const studio of Object.values(data)) {
            if (studio.history) {
                studio.history.forEach(item => allHistory.push(item));
            }
        }

        // Group by date
        const now = new Date();
        const trends = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = allHistory.filter(item => {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                return itemDate === dateStr;
            }).length;

            trends.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: dateStr,
                count
            });
        }

        return trends;
    },

    /**
     * Get model usage breakdown
     */
    getModelUsage(data) {
        const modelCounts = {};

        for (const studio of Object.values(data)) {
            if (studio.history) {
                studio.history.forEach(item => {
                    const model = item.model || item.settings?.model || 'Unknown';
                    modelCounts[model] = (modelCounts[model] || 0) + 1;
                });
            }
        }

        return Object.entries(modelCounts)
            .map(([model, count]) => ({ model: this._formatModelName(model), count }))
            .sort((a, b) => b.count - a.count);
    },

    _formatModelName(model) {
        // Shorten model names for display
        if (model.includes('gemini')) return 'Gemini';
        if (model.includes('gpt-4')) return 'GPT-4';
        if (model.includes('gpt-3')) return 'GPT-3.5';
        if (model.includes('dall-e')) return 'DALL-E';
        if (model.includes('flux')) return 'Flux';
        if (model.includes('recraft')) return 'Recraft';
        return model.split('/').pop() || model;
    },

    /**
     * Get recent activity across all studios
     */
    getRecentActivity(data, limit = 20) {
        const allItems = [];

        const studioLabels = {
            infographics: 'Infographics',
            modelStudio: 'Model Studio',
            bundleStudio: 'Bundle Studio'
        };

        for (const [studio, items] of Object.entries(data)) {
            if (items.history) {
                items.history.forEach(item => {
                    allItems.push({
                        ...item,
                        studio,
                        studioLabel: studioLabels[studio]
                    });
                });
            }
        }

        // Sort by timestamp descending and limit
        return allItems
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    },

    /**
     * Estimate storage size (approximate based on localStorage)
     */
    async getStorageEstimate() {
        const breakdown = {};
        let total = 0;

        for (const [studio, keys] of Object.entries(this.STORAGE_KEYS)) {
            let size = 0;

            const historyData = localStorage.getItem(keys.history);
            const favoritesData = localStorage.getItem(keys.favorites);

            if (historyData) size += historyData.length * 2; // UTF-16
            if (favoritesData) size += favoritesData.length * 2;

            breakdown[studio] = size;
            total += size;
        }

        // Try to get IndexedDB estimate
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                if (estimate.usage) {
                    total = estimate.usage;
                }
            } catch (e) {
                // Fallback to localStorage estimate
            }
        }

        return {
            total,
            formatted: this._formatBytes(total),
            breakdown: Object.fromEntries(
                Object.entries(breakdown).map(([k, v]) => [k, this._formatBytes(v)])
            )
        };
    },

    _formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * Clear items older than N days from a specific studio
     * Returns { removed: number, indexedDbDeleted: number }
     */
    async clearOldItems(studioKey, days, imageStore = null) {
        const keys = this.STORAGE_KEYS[studioKey];
        if (!keys) return { removed: 0, indexedDbDeleted: 0 };

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const removedIds = [];

        // Clear old history from localStorage
        const history = this._loadFromStorage(keys.history);
        const filteredHistory = history.filter(item => {
            const keep = new Date(item.timestamp) >= cutoff;
            if (!keep) removedIds.push(item.id);
            return keep;
        });
        localStorage.setItem(keys.history, JSON.stringify(filteredHistory));

        // Clean up IndexedDB entries for removed items
        let indexedDbDeleted = 0;
        if (imageStore && removedIds.length > 0) {
            const idsToDelete = removedIds.map(id => `history_${id}`);
            indexedDbDeleted = await imageStore.deleteByIds(idsToDelete);
        }

        return { removed: removedIds.length, indexedDbDeleted };
    },

    /**
     * Auto-cleanup old entries across all studios (>30 days by default)
     * Call this on app startup to keep storage clean
     */
    async autoCleanup(days = 30, imageStore = null) {
        const lastCleanup = localStorage.getItem('ngraphics_last_cleanup');
        const now = Date.now();

        // Only run cleanup once per day
        if (lastCleanup && (now - parseInt(lastCleanup)) < 24 * 60 * 60 * 1000) {
            return { skipped: true, reason: 'Already cleaned today' };
        }

        let totalRemoved = 0;
        let totalIndexedDb = 0;
        const results = {};

        for (const studioKey of Object.keys(this.STORAGE_KEYS)) {
            const result = await this.clearOldItems(studioKey, days, imageStore);
            results[studioKey] = result;
            totalRemoved += result.removed;
            totalIndexedDb += result.indexedDbDeleted;
        }

        // Clean orphaned IndexedDB entries (entries without matching localStorage refs)
        if (imageStore) {
            const orphaned = await this._cleanOrphanedIndexedDb(imageStore);
            totalIndexedDb += orphaned;
        }

        localStorage.setItem('ngraphics_last_cleanup', now.toString());

        if (totalRemoved > 0 || totalIndexedDb > 0) {
            console.log(`[NGRAPHICS] Auto-cleanup: ${totalRemoved} old items, ${totalIndexedDb} IndexedDB entries`);
        }

        return { totalRemoved, totalIndexedDb, results };
    },

    /**
     * Clean orphaned IndexedDB entries that have no matching localStorage reference
     */
    async _cleanOrphanedIndexedDb(imageStore) {
        try {
            const allKeys = await imageStore.getAllKeys();
            const validIds = new Set();

            // Collect all valid IDs from localStorage
            for (const keys of Object.values(this.STORAGE_KEYS)) {
                const history = this._loadFromStorage(keys.history);
                const favorites = this._loadFromStorage(keys.favorites);

                history.forEach(item => {
                    validIds.add(`history_${item.id}`);
                });
                favorites.forEach(item => {
                    validIds.add(`favorite_${item.id}`);
                });
            }

            // Find orphaned keys
            const orphanedKeys = allKeys.filter(key => !validIds.has(key));

            if (orphanedKeys.length > 0) {
                return await imageStore.deleteByIds(orphanedKeys);
            }
            return 0;
        } catch (e) {
            console.warn('Failed to clean orphaned IndexedDB entries:', e);
            return 0;
        }
    },

    /**
     * Get studio breakdown for charts
     */
    getStudioBreakdown(data) {
        const studios = [
            { key: 'infographics', name: 'Infographics', color: '#6366f1' },
            { key: 'modelStudio', name: 'Model Studio', color: '#22c55e' },
            { key: 'bundleStudio', name: 'Bundle Studio', color: '#f59e0b' },
            { key: 'lifestyleStudio', name: 'Lifestyle', color: '#ec4899' },
            { key: 'copywriter', name: 'Copywriter', color: '#8b5cf6' },
            { key: 'packaging', name: 'Packaging', color: '#14b8a6' },
            { key: 'comparison', name: 'Comparison', color: '#f97316' },
            { key: 'sizeVisualizer', name: 'Size Viz', color: '#06b6d4' },
            { key: 'faqGenerator', name: 'FAQ', color: '#84cc16' },
            { key: 'backgroundStudio', name: 'Background', color: '#a855f7' },
            { key: 'badgeGenerator', name: 'Badges', color: '#ef4444' },
            { key: 'featureCards', name: 'Cards', color: '#0ea5e9' },
            { key: 'sizeChart', name: 'Size Chart', color: '#78716c' },
            { key: 'aplus', name: 'A+ Content', color: '#f59e0b' },
            { key: 'productVariants', name: 'Variants', color: '#10b981' }
        ];

        return studios.map(s => ({
            studio: s.name,
            count: data[s.key]?.history?.length || 0,
            color: s.color
        })).filter(s => s.count > 0);
    }
};

// ============================================
// PRESET SYSTEM
// ============================================
const SharedPresets = {
    /**
     * Get storage key for presets
     */
    getStorageKey(pageKey) {
        return `ngraphics_presets_${pageKey}`;
    },

    /**
     * Load all presets for a page
     */
    load(pageKey) {
        try {
            const data = localStorage.getItem(this.getStorageKey(pageKey));
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load presets:', e);
            return [];
        }
    },

    /**
     * Save presets for a page
     */
    save(pageKey, presets) {
        try {
            localStorage.setItem(this.getStorageKey(pageKey), JSON.stringify(presets));
            return true;
        } catch (e) {
            console.error('Failed to save presets:', e);
            return false;
        }
    },

    /**
     * Add a new preset
     */
    add(pageKey, name, settings, isBuiltIn = false) {
        const presets = this.load(pageKey);
        const preset = {
            id: `preset_${Date.now()}`,
            name,
            settings,
            isBuiltIn,
            createdAt: new Date().toISOString()
        };
        presets.push(preset);
        this.save(pageKey, presets);
        return preset;
    },

    /**
     * Update an existing preset
     */
    update(pageKey, presetId, settings) {
        const presets = this.load(pageKey);
        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1 && !presets[index].isBuiltIn) {
            presets[index].settings = settings;
            presets[index].updatedAt = new Date().toISOString();
            this.save(pageKey, presets);
            return presets[index];
        }
        return null;
    },

    /**
     * Delete a preset
     */
    delete(pageKey, presetId) {
        const presets = this.load(pageKey);
        const index = presets.findIndex(p => p.id === presetId);
        if (index !== -1 && !presets[index].isBuiltIn) {
            presets.splice(index, 1);
            this.save(pageKey, presets);
            return true;
        }
        return false;
    },

    /**
     * Get a preset by ID
     */
    get(pageKey, presetId) {
        const presets = this.load(pageKey);
        return presets.find(p => p.id === presetId);
    },

    /**
     * Export presets as JSON
     */
    export(pageKey) {
        const presets = this.load(pageKey);
        return JSON.stringify(presets, null, 2);
    },

    /**
     * Import presets from JSON
     */
    import(pageKey, jsonString, merge = true) {
        try {
            const imported = JSON.parse(jsonString);
            if (!Array.isArray(imported)) return false;

            if (merge) {
                const existing = this.load(pageKey);
                // Add imported presets with new IDs to avoid conflicts
                imported.forEach(preset => {
                    preset.id = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    preset.isBuiltIn = false;
                    existing.push(preset);
                });
                this.save(pageKey, existing);
            } else {
                this.save(pageKey, imported);
            }
            return true;
        } catch (e) {
            console.error('Failed to import presets:', e);
            return false;
        }
    },

    /**
     * Built-in presets for each page
     */
    builtIn: {
        infographics: [
            {
                id: 'builtin_ecommerce_white',
                name: 'E-commerce White',
                isBuiltIn: true,
                settings: {
                    background: 'light',
                    layout: 'product-center',
                    visualDensity: '3',
                    colorHarmony: 'monochrome',
                    fontStyle: 'modern',
                    iconStyle: 'flat'
                }
            },
            {
                id: 'builtin_social_vibrant',
                name: 'Social Vibrant',
                isBuiltIn: true,
                settings: {
                    background: 'gradient',
                    layout: 'hero',
                    visualDensity: '4',
                    colorHarmony: 'complementary',
                    fontStyle: 'bold',
                    iconStyle: 'gradient'
                }
            },
            {
                id: 'builtin_minimal_clean',
                name: 'Minimal Clean',
                isBuiltIn: true,
                settings: {
                    background: 'light',
                    layout: 'product-center',
                    visualDensity: '1',
                    colorHarmony: 'monochrome',
                    fontStyle: 'modern',
                    iconStyle: 'outlined',
                    showCalloutLines: false
                }
            },
            {
                id: 'builtin_dark_premium',
                name: 'Dark Premium',
                isBuiltIn: true,
                settings: {
                    background: 'dark',
                    layout: 'product-center',
                    visualDensity: '3',
                    colorHarmony: 'analogous',
                    fontStyle: 'elegant',
                    iconStyle: '3d'
                }
            }
        ],
        models: [
            {
                id: 'builtin_studio_classic',
                name: 'Studio Classic',
                isBuiltIn: true,
                settings: {
                    scene: 'studio',
                    lighting: 'studio',
                    photoStyle: 'commercial',
                    pose: 'natural',
                    depthOfField: 'medium',
                    colorGrading: 'auto'
                }
            },
            {
                id: 'builtin_lifestyle_warm',
                name: 'Lifestyle Warm',
                isBuiltIn: true,
                settings: {
                    scene: 'cafe',
                    lighting: 'golden-hour',
                    photoStyle: 'lifestyle',
                    pose: 'casual',
                    depthOfField: 'shallow',
                    colorGrading: 'warm'
                }
            },
            {
                id: 'builtin_editorial_bold',
                name: 'Editorial Bold',
                isBuiltIn: true,
                settings: {
                    scene: 'urban',
                    lighting: 'dramatic',
                    photoStyle: 'editorial',
                    pose: 'confident',
                    depthOfField: 'shallow',
                    colorGrading: 'cinematic'
                }
            }
        ],
        bundles: [
            {
                id: 'builtin_flatlay_marble',
                name: 'Flatlay Marble',
                isBuiltIn: true,
                settings: {
                    layout: 'flatlay',
                    background: 'surface',
                    surface: 'marble',
                    visualStyle: 'minimal',
                    lighting: 'bright'
                }
            },
            {
                id: 'builtin_gift_box',
                name: 'Gift Box',
                isBuiltIn: true,
                settings: {
                    layout: 'unboxing',
                    container: 'gift-box',
                    background: 'gradient',
                    visualStyle: 'luxury',
                    lighting: 'soft'
                }
            },
            {
                id: 'builtin_grid_clean',
                name: 'Grid Clean',
                isBuiltIn: true,
                settings: {
                    layout: 'grid',
                    background: 'white',
                    visualStyle: 'commercial',
                    lighting: 'bright',
                    showLabels: true
                }
            }
        ]
    },

    /**
     * Get all presets including built-in
     */
    getAll(pageKey) {
        const builtIn = this.builtIn[pageKey] || [];
        const custom = this.load(pageKey);
        return [...builtIn, ...custom];
    },

    /**
     * Render preset selector UI
     */
    renderSelector(pageKey, onSelect, onSave) {
        const presets = this.getAll(pageKey);

        const container = document.createElement('div');
        container.className = 'preset-selector';
        container.innerHTML = `
            <div class="preset-dropdown">
                <select class="preset-select" id="presetSelect">
                    <option value="">Load Preset...</option>
                    ${presets.length > 0 ? `
                        <optgroup label="Built-in">
                            ${presets.filter(p => p.isBuiltIn).map(p => `
                                <option value="${p.id}">${p.name}</option>
                            `).join('')}
                        </optgroup>
                        ${presets.filter(p => !p.isBuiltIn).length > 0 ? `
                            <optgroup label="Custom">
                                ${presets.filter(p => !p.isBuiltIn).map(p => `
                                    <option value="${p.id}">${p.name}</option>
                                `).join('')}
                            </optgroup>
                        ` : ''}
                    ` : ''}
                </select>
                <button class="preset-save-btn" title="Save current settings as preset">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                </button>
                <button class="preset-delete-btn" title="Delete selected preset" style="display:none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        `;

        const select = container.querySelector('.preset-select');
        const saveBtn = container.querySelector('.preset-save-btn');
        const deleteBtn = container.querySelector('.preset-delete-btn');

        select.addEventListener('change', () => {
            const presetId = select.value;
            if (presetId) {
                const preset = presets.find(p => p.id === presetId);
                if (preset && onSelect) {
                    onSelect(preset.settings);
                }
                // Show delete button for custom presets
                deleteBtn.style.display = preset && !preset.isBuiltIn ? 'flex' : 'none';
            } else {
                deleteBtn.style.display = 'none';
            }
        });

        saveBtn.addEventListener('click', async () => {
            const name = prompt('Enter preset name:');
            if (name && name.trim()) {
                if (onSave) {
                    const settings = onSave();
                    this.add(pageKey, name.trim(), settings);
                    SharedUI.toast('Preset saved!', 'success');
                    // Refresh the selector
                    const newContainer = this.renderSelector(pageKey, onSelect, onSave);
                    container.replaceWith(newContainer);
                }
            }
        });

        deleteBtn.addEventListener('click', async () => {
            const presetId = select.value;
            const preset = presets.find(p => p.id === presetId);
            if (preset && !preset.isBuiltIn) {
                const confirmed = await SharedUI.confirm(`Delete preset "${preset.name}"?`, {
                    title: 'Delete Preset',
                    confirmText: 'Delete',
                    icon: 'warning'
                });
                if (confirmed) {
                    this.delete(pageKey, presetId);
                    SharedUI.toast('Preset deleted', 'success');
                    // Refresh the selector
                    const newContainer = this.renderSelector(pageKey, onSelect, onSave);
                    container.replaceWith(newContainer);
                }
            }
        });

        return container;
    }
};

// ============================================
// COST ESTIMATOR
// ============================================
const SharedCostEstimator = {
    // Model pricing per 1M tokens (approximate, from OpenRouter)
    // Format: { input: cost per 1M input tokens, output: cost per 1M output tokens, image: cost per image }
    pricing: {
        'google/gemini-2.0-flash-exp:free': { input: 0, output: 0, image: 0, label: 'Free' },
        'google/gemini-2.0-flash-001': { input: 0.1, output: 0.4, image: 0.0025, label: '$0.0025/img' },
        'google/gemini-2.0-flash-exp': { input: 0, output: 0, image: 0, label: 'Free' },
        'google/gemini-2.5-flash-preview': { input: 0.15, output: 0.6, image: 0.003, label: '$0.003/img' },
        'google/gemini-2.5-pro-preview': { input: 1.25, output: 5, image: 0.01, label: '$0.01/img' },
        'google/gemini-3-pro-image-preview': { input: 1.25, output: 5, image: 0.015, label: '$0.015/img' },
        'openai/gpt-4o': { input: 2.5, output: 10, image: 0.02, label: '$0.02/img' },
        'openai/gpt-4o-mini': { input: 0.15, output: 0.6, image: 0.005, label: '$0.005/img' }
    },

    // Session totals
    session: {
        totalCost: 0,
        generations: 0
    },

    // History storage key
    HISTORY_KEY: 'ngraphics_cost_history',

    /**
     * Reset session totals
     */
    resetSession() {
        this.session.totalCost = 0;
        this.session.generations = 0;
    },

    /**
     * Load cost history from localStorage
     */
    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    /**
     * Save cost history to localStorage
     */
    saveHistory(history) {
        // Keep last 90 days of history
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const filtered = history.filter(h => new Date(h.date) >= cutoff);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(filtered));
    },

    /**
     * Record a cost entry with studio breakdown
     */
    recordCost(modelId, variations = 1, studio = 'unknown', promptLength = 500) {
        const estimate = this.estimate(modelId, variations, promptLength);
        const today = new Date().toISOString().split('T')[0];

        // Update session
        this.session.totalCost += estimate.totalCost;
        this.session.generations += variations;
        this.saveSession();

        // Update history
        const history = this.loadHistory();
        let dayEntry = history.find(h => h.date === today);

        if (!dayEntry) {
            dayEntry = {
                date: today,
                totalCost: 0,
                generations: 0,
                studios: {}
            };
            history.push(dayEntry);
        }

        dayEntry.totalCost += estimate.totalCost;
        dayEntry.generations += variations;

        if (!dayEntry.studios[studio]) {
            dayEntry.studios[studio] = { cost: 0, generations: 0 };
        }
        dayEntry.studios[studio].cost += estimate.totalCost;
        dayEntry.studios[studio].generations += variations;

        this.saveHistory(history);
        return estimate;
    },

    /**
     * Get total all-time cost
     */
    getAllTimeCost() {
        const history = this.loadHistory();
        const totalCost = history.reduce((sum, day) => sum + day.totalCost, 0);
        const totalGenerations = history.reduce((sum, day) => sum + day.generations, 0);
        return {
            totalCost,
            totalGenerations,
            formatted: this.formatCost(totalCost)
        };
    },

    /**
     * Get cost breakdown by studio
     */
    getStudioBreakdown() {
        const history = this.loadHistory();
        const breakdown = {};

        history.forEach(day => {
            Object.entries(day.studios || {}).forEach(([studio, data]) => {
                if (!breakdown[studio]) {
                    breakdown[studio] = { cost: 0, generations: 0 };
                }
                breakdown[studio].cost += data.cost;
                breakdown[studio].generations += data.generations;
            });
        });

        return Object.entries(breakdown).map(([studio, data]) => ({
            studio,
            cost: data.cost,
            generations: data.generations,
            formatted: this.formatCost(data.cost)
        })).sort((a, b) => b.cost - a.cost);
    },

    /**
     * Get cost trends for last N days
     */
    getCostTrends(days = 7) {
        const history = this.loadHistory();
        const result = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = history.find(h => h.date === dateStr);

            result.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: dateStr,
                cost: dayData?.totalCost || 0,
                generations: dayData?.generations || 0
            });
        }

        return result;
    },

    /**
     * Get pricing for a model
     */
    getModelPricing(modelId) {
        return this.pricing[modelId] || { input: 0.5, output: 2, image: 0.01, label: '~$0.01/img' };
    },

    /**
     * Estimate cost for a generation
     */
    estimate(modelId, variations = 1, promptLength = 500) {
        const pricing = this.getModelPricing(modelId);

        // Estimate tokens (rough approximation)
        const inputTokens = promptLength * 1.3; // ~1.3 tokens per character
        const outputTokens = 500; // Typical response tokens
        const imageCount = variations;

        // Calculate costs
        const inputCost = (inputTokens / 1000000) * pricing.input;
        const outputCost = (outputTokens / 1000000) * pricing.output;
        const imageCost = imageCount * pricing.image;

        const totalCost = inputCost + outputCost + imageCost;

        return {
            inputCost,
            outputCost,
            imageCost,
            totalCost,
            formatted: this.formatCost(totalCost),
            label: pricing.label,
            isFree: totalCost === 0
        };
    },

    /**
     * Record a generation (add to session total)
     */
    recordGeneration(modelId, variations = 1, promptLength = 500) {
        const estimate = this.estimate(modelId, variations, promptLength);
        this.session.totalCost += estimate.totalCost;
        this.session.generations += variations;
        this.saveSession();
        return estimate;
    },

    /**
     * Format cost for display
     */
    formatCost(cost) {
        if (cost === 0) return 'Free';
        if (cost < 0.001) return '<$0.001';
        if (cost < 0.01) return `$${cost.toFixed(4)}`;
        if (cost < 1) return `$${cost.toFixed(3)}`;
        return `$${cost.toFixed(2)}`;
    },

    /**
     * Get session summary
     */
    getSessionSummary() {
        return {
            totalCost: this.session.totalCost,
            formatted: this.formatCost(this.session.totalCost),
            generations: this.session.generations
        };
    },

    /**
     * Save session to localStorage
     */
    saveSession() {
        localStorage.setItem('ngraphics_cost_session', JSON.stringify({
            ...this.session,
            date: new Date().toISOString().split('T')[0]
        }));
    },

    /**
     * Load session from localStorage (resets if different day)
     */
    loadSession() {
        try {
            const data = JSON.parse(localStorage.getItem('ngraphics_cost_session') || '{}');
            const today = new Date().toISOString().split('T')[0];
            if (data.date === today) {
                this.session.totalCost = data.totalCost || 0;
                this.session.generations = data.generations || 0;
            } else {
                this.resetSession();
            }
        } catch (e) {
            this.resetSession();
        }
    },

    /**
     * Render cost display UI
     */
    renderDisplay(modelId, variations = 1, promptLength = 500) {
        const estimate = this.estimate(modelId, variations, promptLength);
        const session = this.getSessionSummary();

        const container = document.createElement('div');
        container.className = 'cost-estimator';
        container.innerHTML = `
            <div class="cost-estimate">
                <span class="cost-label">Est. cost:</span>
                <span class="cost-value ${estimate.isFree ? 'free' : ''}">${estimate.formatted}</span>
                ${variations > 1 ? `<span class="cost-variations">(${variations} images)</span>` : ''}
            </div>
            <div class="cost-session">
                <span class="session-label">Session:</span>
                <span class="session-value">${session.formatted}</span>
                <span class="session-count">(${session.generations} gen)</span>
            </div>
        `;

        return container;
    },

    /**
     * Update an existing cost display
     */
    updateDisplay(container, modelId, variations = 1, promptLength = 500) {
        if (!container) return;

        const estimate = this.estimate(modelId, variations, promptLength);
        const session = this.getSessionSummary();

        const costValue = container.querySelector('.cost-value');
        const costVariations = container.querySelector('.cost-variations');
        const sessionValue = container.querySelector('.session-value');
        const sessionCount = container.querySelector('.session-count');

        if (costValue) {
            costValue.textContent = estimate.formatted;
            costValue.className = `cost-value ${estimate.isFree ? 'free' : ''}`;
        }
        if (costVariations) {
            costVariations.textContent = variations > 1 ? `(${variations} images)` : '';
        }
        if (sessionValue) {
            sessionValue.textContent = session.formatted;
        }
        if (sessionCount) {
            sessionCount.textContent = `(${session.generations} gen)`;
        }
    }
};

// Initialize cost session on load
SharedCostEstimator.loadSession();

// ============================================
// COMPARISON SLIDER
// ============================================
const SharedComparison = {
    /**
     * Create a comparison slider element
     */
    create(image1Url, image2Url, options = {}) {
        const {
            label1 = 'Before',
            label2 = 'After',
            initialPosition = 50
        } = options;

        const container = document.createElement('div');
        container.className = 'comparison-slider';
        container.innerHTML = `
            <div class="comparison-container">
                <div class="comparison-image comparison-before">
                    <img src="${image1Url}" alt="${label1}">
                    <span class="comparison-label">${label1}</span>
                </div>
                <div class="comparison-image comparison-after" style="clip-path: inset(0 0 0 ${initialPosition}%)">
                    <img src="${image2Url}" alt="${label2}">
                    <span class="comparison-label">${label2}</span>
                </div>
                <div class="comparison-handle" style="left: ${initialPosition}%">
                    <div class="handle-line"></div>
                    <div class="handle-circle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8l4 4-4 4M6 8l-4 4 4 4"/>
                        </svg>
                    </div>
                    <div class="handle-line"></div>
                </div>
            </div>
        `;

        const handle = container.querySelector('.comparison-handle');
        const afterImage = container.querySelector('.comparison-after');
        const containerEl = container.querySelector('.comparison-container');

        let isDragging = false;

        const updatePosition = (clientX) => {
            const rect = containerEl.getBoundingClientRect();
            let position = ((clientX - rect.left) / rect.width) * 100;
            position = Math.max(0, Math.min(100, position));

            handle.style.left = `${position}%`;
            afterImage.style.clipPath = `inset(0 0 0 ${position}%)`;
        };

        // Mouse events
        handle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updatePosition(e.clientX);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        handle.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches[0]) {
                updatePosition(e.touches[0].clientX);
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Click on container to move handle
        containerEl.addEventListener('click', (e) => {
            if (e.target !== handle && !handle.contains(e.target)) {
                updatePosition(e.clientX);
            }
        });

        return container;
    },

    /**
     * Open comparison in a modal
     */
    openModal(image1Url, image2Url, options = {}) {
        const {
            label1 = 'Before',
            label2 = 'After',
            title = 'Compare Images'
        } = options;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'comparison-modal';
        modal.innerHTML = `
            <div class="comparison-modal-backdrop"></div>
            <div class="comparison-modal-content">
                <div class="comparison-modal-header">
                    <h3>${title}</h3>
                    <button class="comparison-modal-close">&times;</button>
                </div>
                <div class="comparison-modal-body"></div>
            </div>
        `;

        const body = modal.querySelector('.comparison-modal-body');
        const slider = this.create(image1Url, image2Url, { label1, label2 });
        body.appendChild(slider);

        // Close handlers
        const close = () => {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        };

        modal.querySelector('.comparison-modal-close').addEventListener('click', close);
        modal.querySelector('.comparison-modal-backdrop').addEventListener('click', close);

        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', handler);
            }
        });

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('visible'));

        return { modal, close };
    },

    /**
     * Add comparison button to result actions
     */
    addCompareButton(container, getImages) {
        const btn = document.createElement('button');
        btn.className = 'btn-icon compare-btn';
        btn.title = 'Compare images';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="8" height="18" rx="1"/>
                <rect x="13" y="3" width="8" height="18" rx="1"/>
                <path d="M12 8v8M9 12h6"/>
            </svg>
        `;

        btn.addEventListener('click', () => {
            const images = getImages();
            if (images && images.length >= 2) {
                this.openModal(images[0], images[1], {
                    label1: 'Image 1',
                    label2: 'Image 2'
                });
            } else if (images && images.original && images.generated) {
                this.openModal(images.original, images.generated, {
                    label1: 'Original',
                    label2: 'Generated'
                });
            } else {
                SharedUI.toast('Need at least 2 images to compare', 'warning');
            }
        });

        container.appendChild(btn);
        return btn;
    }
};

// ==========================================================================
// TRASH / RECYCLE BIN
// ==========================================================================
const SharedTrash = {
    STORAGE_KEY: 'ngraphics_trash',
    RETENTION_DAYS: 7,
    MAX_ITEMS: 50,

    // Load trash from localStorage
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const items = data ? JSON.parse(data) : [];
            // Auto-cleanup expired items
            return this.cleanup(items);
        } catch (error) {
            console.error('Failed to load trash:', error);
            return [];
        }
    },

    // Save trash to localStorage
    save(items) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Failed to save trash:', error);
        }
    },

    // Add item to trash
    add(item, source, page) {
        const items = this.load();

        const trashItem = {
            id: Date.now(),
            deletedAt: new Date().toISOString(),
            source: source, // 'history' or 'favorites'
            page: page, // 'infographics', 'models', 'bundles'
            data: item
        };

        items.unshift(trashItem);

        // Limit trash size
        if (items.length > this.MAX_ITEMS) {
            items.splice(this.MAX_ITEMS);
        }

        this.save(items);
        return trashItem;
    },

    // Remove item from trash permanently
    remove(id) {
        const items = this.load();
        const filtered = items.filter(item => item.id !== id);
        this.save(filtered);
    },

    // Get all trash items
    getAll() {
        return this.load();
    },

    // Get trash items by page
    getByPage(page) {
        return this.load().filter(item => item.page === page);
    },

    // Get trash items by source
    getBySource(source) {
        return this.load().filter(item => item.source === source);
    },

    // Find item by id
    findById(id) {
        return this.load().find(item => item.id === id);
    },

    // Restore item from trash (returns the original item data)
    restore(id) {
        const items = this.load();
        const itemIndex = items.findIndex(item => item.id === id);

        if (itemIndex === -1) return null;

        const [trashItem] = items.splice(itemIndex, 1);
        this.save(items);

        return {
            data: trashItem.data,
            source: trashItem.source,
            page: trashItem.page
        };
    },

    // Clear all trash
    clear() {
        this.save([]);
    },

    // Remove items older than RETENTION_DAYS
    cleanup(items) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - this.RETENTION_DAYS);

        const filtered = items.filter(item => {
            const deletedAt = new Date(item.deletedAt);
            return deletedAt > cutoff;
        });

        if (filtered.length !== items.length) {
            this.save(filtered);
        }

        return filtered;
    },

    // Get count of items in trash
    count() {
        return this.load().length;
    },

    // Check if trash has items
    hasItems() {
        return this.count() > 0;
    },

    // Format time since deletion
    formatDeletedAt(isoString) {
        const deleted = new Date(isoString);
        const now = new Date();
        const diffMs = now - deleted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    },

    // Get days remaining before auto-delete
    getDaysRemaining(isoString) {
        const deleted = new Date(isoString);
        const expiry = new Date(deleted);
        expiry.setDate(expiry.getDate() + this.RETENTION_DAYS);

        const now = new Date();
        const diffMs = expiry - now;
        const diffDays = Math.ceil(diffMs / 86400000);

        return Math.max(0, diffDays);
    }
};

// ============================================
// TOOLTIPS
// ============================================
const SharedTooltips = {
    tooltip: null,
    activeElement: null,
    hideTimeout: null,

    /**
     * Initialize tooltip system
     */
    init() {
        // Create tooltip element if not exists
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.className = 'shared-tooltip';
            this.tooltip.innerHTML = '<div class="tooltip-content"></div>';
            document.body.appendChild(this.tooltip);
        }

        // Add event listeners for elements with data-tooltip
        document.addEventListener('mouseenter', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) this.show(target);
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) this.scheduleHide();
        }, true);

        // Keep tooltip visible when hovering over it
        this.tooltip.addEventListener('mouseenter', () => {
            clearTimeout(this.hideTimeout);
        });

        this.tooltip.addEventListener('mouseleave', () => {
            this.hide();
        });
    },

    /**
     * Show tooltip for element
     */
    show(element) {
        clearTimeout(this.hideTimeout);
        this.activeElement = element;

        const text = element.dataset.tooltip;
        const position = element.dataset.tooltipPosition || 'top';

        if (!text) return;

        const content = this.tooltip.querySelector('.tooltip-content');
        content.textContent = text;

        this.tooltip.className = `shared-tooltip visible position-${position}`;

        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
            default: // top
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
        }

        // Keep within viewport
        left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
        top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    },

    /**
     * Schedule hide with delay
     */
    scheduleHide() {
        this.hideTimeout = setTimeout(() => this.hide(), 100);
    },

    /**
     * Hide tooltip
     */
    hide() {
        this.tooltip.classList.remove('visible');
        this.activeElement = null;
    }
};

// ============================================
// PROMPT TEMPLATES
// ============================================
const SharedTemplates = {
    STORAGE_KEY: 'ngraphics_templates',

    // Built-in templates
    builtIn: {
        infographics: [
            {
                id: 'ecommerce-clean',
                name: 'E-commerce Clean',
                description: 'Minimal white background, perfect for marketplaces',
                settings: {
                    infographicStyle: 'light',
                    layoutTemplate: 'center',
                    visualDensity: 2,
                    fontStyle: 'modern',
                    iconStyle: 'flat',
                    colorHarmony: 'match'
                }
            },
            {
                id: 'social-vibrant',
                name: 'Social Media Vibrant',
                description: 'Bold colors and dynamic layout for social posts',
                settings: {
                    infographicStyle: 'gradient',
                    layoutTemplate: 'hero',
                    visualDensity: 4,
                    fontStyle: 'bold',
                    iconStyle: 'gradient',
                    colorHarmony: 'complementary'
                }
            },
            {
                id: 'premium-dark',
                name: 'Premium Dark',
                description: 'Elegant dark theme for luxury products',
                settings: {
                    infographicStyle: 'dark',
                    layoutTemplate: 'center',
                    visualDensity: 3,
                    fontStyle: 'elegant',
                    iconStyle: '3d',
                    colorHarmony: 'monochrome'
                }
            },
            {
                id: 'tech-minimal',
                name: 'Tech Minimal',
                description: 'Clean technical aesthetic for electronics',
                settings: {
                    infographicStyle: 'light',
                    layoutTemplate: 'grid',
                    visualDensity: 3,
                    fontStyle: 'technical',
                    iconStyle: 'outlined',
                    colorHarmony: 'match'
                }
            }
        ],
        modelStudio: [
            {
                id: 'fashion-editorial',
                name: 'Fashion Editorial',
                description: 'High-fashion magazine style',
                settings: {
                    photoStyle: 'editorial',
                    lighting: 'dramatic',
                    pose: 'elegant',
                    depthOfField: 'shallow',
                    colorGrading: 'cinematic'
                }
            },
            {
                id: 'lifestyle-casual',
                name: 'Lifestyle Casual',
                description: 'Natural, everyday feel',
                settings: {
                    photoStyle: 'lifestyle',
                    lighting: 'natural',
                    pose: 'casual',
                    depthOfField: 'medium',
                    colorGrading: 'warm'
                }
            },
            {
                id: 'studio-commercial',
                name: 'Studio Commercial',
                description: 'Clean studio product shots',
                settings: {
                    photoStyle: 'commercial',
                    lighting: 'studio',
                    pose: 'confident',
                    depthOfField: 'deep',
                    colorGrading: 'auto'
                }
            }
        ],
        bundleStudio: [
            {
                id: 'flatlay-minimal',
                name: 'Flat Lay Minimal',
                description: 'Clean top-down arrangement',
                settings: {
                    layout: 'flatlay',
                    background: 'white',
                    visualStyle: 'minimal',
                    lighting: 'bright'
                }
            },
            {
                id: 'gift-box',
                name: 'Gift Box Presentation',
                description: 'Products in elegant gift packaging',
                settings: {
                    layout: 'unboxing',
                    container: 'gift',
                    background: 'gradient',
                    visualStyle: 'luxury'
                }
            }
        ]
    },

    /**
     * Load user templates
     */
    loadUserTemplates(page) {
        try {
            const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            return all[page] || [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Save user template
     */
    saveUserTemplate(page, template) {
        const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        if (!all[page]) all[page] = [];

        template.id = `user-${Date.now()}`;
        template.isUserTemplate = true;
        template.createdAt = new Date().toISOString();

        all[page].unshift(template);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        return template;
    },

    /**
     * Delete user template
     */
    deleteUserTemplate(page, templateId) {
        const all = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        if (all[page]) {
            all[page] = all[page].filter(t => t.id !== templateId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        }
    },

    /**
     * Get all templates for a page
     */
    getAll(page) {
        const builtIn = this.builtIn[page] || [];
        const user = this.loadUserTemplates(page);
        return [...user, ...builtIn];
    },

    /**
     * Render template selector UI
     */
    render(container, page, onSelect, currentSettings = null) {
        const templates = this.getAll(page);

        container.innerHTML = `
            <div class="template-selector">
                <div class="template-header">
                    <span class="template-label">Quick Start Templates</span>
                    ${currentSettings ? `
                        <button type="button" class="template-save-btn" title="Save current settings as template">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                            </svg>
                            Save Current
                        </button>
                    ` : ''}
                </div>
                <div class="template-grid">
                    ${templates.map(t => `
                        <div class="template-card ${t.isUserTemplate ? 'user-template' : ''}" data-id="${t.id}">
                            <div class="template-card-header">
                                <span class="template-name">${t.name}</span>
                                ${t.isUserTemplate ? `
                                    <button type="button" class="template-delete-btn" data-id="${t.id}" title="Delete template">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                    </button>
                                ` : ''}
                            </div>
                            <p class="template-desc">${t.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.template-delete-btn')) return;
                const id = card.dataset.id;
                const template = templates.find(t => t.id === id);
                if (template && onSelect) {
                    onSelect(template);
                    SharedUI.toast(`Applied "${template.name}" template`, 'success');
                }
            });
        });

        // Delete buttons
        container.querySelectorAll('.template-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.deleteUserTemplate(page, id);
                this.render(container, page, onSelect, currentSettings);
                SharedUI.toast('Template deleted', 'success');
            });
        });

        // Save button
        const saveBtn = container.querySelector('.template-save-btn');
        if (saveBtn && currentSettings) {
            saveBtn.addEventListener('click', async () => {
                const name = prompt('Template name:');
                if (!name) return;

                const description = prompt('Short description (optional):') || '';

                this.saveUserTemplate(page, {
                    name,
                    description,
                    settings: currentSettings()
                });

                this.render(container, page, onSelect, currentSettings);
                SharedUI.toast(`Saved "${name}" template`, 'success');
            });
        }
    }
};

// ============================================
// EXAMPLE GALLERY
// ============================================
const SharedExamples = {
    // Example images for different options (using placeholder descriptions)
    examples: {
        layoutTemplate: {
            center: { desc: 'Product centered with features around it', preview: '🎯 Balanced, symmetrical layout' },
            left: { desc: 'Product on left, text on right', preview: '⬅️ Product emphasis on left side' },
            right: { desc: 'Product on right, text on left', preview: '➡️ Product emphasis on right side' },
            top: { desc: 'Product at top, features below', preview: '⬆️ Hero product with details below' },
            grid: { desc: 'Product and features in grid cells', preview: '▦ Organized grid structure' },
            hero: { desc: 'Large product with feature row below', preview: '🌟 Bold hero presentation' }
        },
        infographicStyle: {
            auto: { desc: 'AI picks best style for your product', preview: '🤖 Smart automatic selection' },
            light: { desc: 'Clean white/light background', preview: '☀️ Bright, clean, professional' },
            dark: { desc: 'Dark/black background', preview: '🌙 Bold, premium, dramatic' },
            gradient: { desc: 'Subtle gradient background', preview: '🌈 Modern, dynamic feel' }
        },
        iconStyle: {
            auto: { desc: 'AI chooses best icon style', preview: '🤖 Automatic selection' },
            realistic: { desc: 'Photo-like detailed icons', preview: '📷 Photorealistic detail' },
            illustrated: { desc: 'Hand-drawn artistic style', preview: '✏️ Artistic, warm feel' },
            '3d': { desc: '3D rendered with depth', preview: '🎲 Depth and dimension' },
            flat: { desc: 'Simple solid color icons', preview: '⬜ Clean and minimal' },
            outlined: { desc: 'Line icons, no fill', preview: '⭕ Technical, precise' },
            gradient: { desc: 'Glossy with color transitions', preview: '💎 Polished, modern' }
        },
        colorHarmony: {
            match: { desc: 'Colors from product', preview: '🎨 Product-derived palette' },
            complementary: { desc: 'Opposite on color wheel', preview: '🔄 High contrast, vibrant' },
            analogous: { desc: 'Adjacent colors', preview: '🌊 Harmonious, flowing' },
            triadic: { desc: 'Three evenly spaced', preview: '🔺 Balanced, diverse' },
            monochrome: { desc: 'Single color variations', preview: '⚫ Elegant, unified' },
            'high-contrast': { desc: 'Bold opposing colors', preview: '⚡ Striking, attention-grabbing' }
        },
        productFocus: {
            auto: { desc: 'AI decides best presentation', preview: '🤖 Smart framing' },
            full: { desc: 'Entire product visible', preview: '📦 Complete product view' },
            closeup: { desc: 'Zoomed in on details', preview: '🔍 Detail emphasis' },
            dynamic: { desc: 'Angled, action-oriented', preview: '💫 Energy and movement' },
            context: { desc: 'Product in use/setting', preview: '🏠 Lifestyle context' },
            floating: { desc: 'Product floating with shadow', preview: '🎈 Clean isolation' }
        },
        visualDensity: {
            1: { desc: 'Maximum whitespace, minimal elements', preview: '○ Ultra minimal' },
            2: { desc: 'Clean with some elements', preview: '◔ Light and airy' },
            3: { desc: 'Balanced content and space', preview: '◑ Balanced' },
            4: { desc: 'Rich with many elements', preview: '◕ Content-rich' },
            5: { desc: 'Maximum detail and elements', preview: '● Information-dense' }
        }
    },

    /**
     * Get example for an option
     */
    get(optionType, value) {
        return this.examples[optionType]?.[value] || null;
    },

    /**
     * Attach example previews to a select element
     */
    attachToSelect(selectElement, optionType) {
        if (!selectElement || !this.examples[optionType]) return;

        // Create preview container
        let preview = selectElement.parentElement.querySelector('.option-example');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'option-example';
            selectElement.parentElement.appendChild(preview);
        }

        const updatePreview = () => {
            const example = this.get(optionType, selectElement.value);
            if (example) {
                preview.innerHTML = `
                    <span class="example-preview">${example.preview}</span>
                    <span class="example-desc">${example.desc}</span>
                `;
                preview.style.display = 'flex';
            } else {
                preview.style.display = 'none';
            }
        };

        selectElement.addEventListener('change', updatePreview);
        updatePreview(); // Initial
    }
};

// ============================================
// GENERATION RATING
// ============================================
const SharedRating = {
    STORAGE_KEY: 'ngraphics_ratings',

    /**
     * Load all ratings
     */
    load() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    },

    /**
     * Save rating for a generation
     */
    rate(generationId, rating, metadata = {}) {
        const ratings = this.load();

        ratings[generationId] = {
            rating, // 'up' or 'down'
            timestamp: new Date().toISOString(),
            ...metadata
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings));
        return ratings[generationId];
    },

    /**
     * Get rating for a generation
     */
    get(generationId) {
        const ratings = this.load();
        return ratings[generationId] || null;
    },

    /**
     * Remove rating
     */
    remove(generationId) {
        const ratings = this.load();
        delete ratings[generationId];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ratings));
    },

    /**
     * Get statistics
     */
    getStats() {
        const ratings = this.load();
        const entries = Object.values(ratings);

        return {
            total: entries.length,
            positive: entries.filter(r => r.rating === 'up').length,
            negative: entries.filter(r => r.rating === 'down').length,
            successRate: entries.length > 0
                ? Math.round((entries.filter(r => r.rating === 'up').length / entries.length) * 100)
                : 0
        };
    },

    /**
     * Get insights from ratings
     */
    getInsights() {
        const ratings = this.load();
        const entries = Object.entries(ratings).map(([id, data]) => ({ id, ...data }));

        if (entries.length < 5) {
            return null; // Not enough data
        }

        // Analyze patterns
        const modelStats = {};
        const styleStats = {};

        entries.forEach(entry => {
            if (entry.model) {
                if (!modelStats[entry.model]) {
                    modelStats[entry.model] = { up: 0, down: 0 };
                }
                modelStats[entry.model][entry.rating]++;
            }

            if (entry.style) {
                if (!styleStats[entry.style]) {
                    styleStats[entry.style] = { up: 0, down: 0 };
                }
                styleStats[entry.style][entry.rating]++;
            }
        });

        // Find best performing
        const bestModel = Object.entries(modelStats)
            .map(([model, stats]) => ({
                model,
                rate: stats.up / (stats.up + stats.down) * 100
            }))
            .sort((a, b) => b.rate - a.rate)[0];

        const bestStyle = Object.entries(styleStats)
            .map(([style, stats]) => ({
                style,
                rate: stats.up / (stats.up + stats.down) * 100
            }))
            .sort((a, b) => b.rate - a.rate)[0];

        return {
            bestModel: bestModel?.model,
            bestModelRate: bestModel?.rate,
            bestStyle: bestStyle?.style,
            bestStyleRate: bestStyle?.rate,
            totalRated: entries.length
        };
    },

    /**
     * Render rating buttons
     */
    render(container, generationId, metadata = {}) {
        const existing = this.get(generationId);

        container.innerHTML = `
            <div class="rating-buttons">
                <button type="button" class="rating-btn up ${existing?.rating === 'up' ? 'active' : ''}"
                        data-rating="up" title="Good result">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                </button>
                <button type="button" class="rating-btn down ${existing?.rating === 'down' ? 'active' : ''}"
                        data-rating="down" title="Poor result">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                    </svg>
                </button>
            </div>
        `;

        container.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const rating = btn.dataset.rating;
                const wasActive = btn.classList.contains('active');

                // Remove active from all
                container.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));

                if (wasActive) {
                    // Toggle off
                    this.remove(generationId);
                } else {
                    // Set rating
                    btn.classList.add('active');
                    this.rate(generationId, rating, metadata);
                    SharedUI.toast(rating === 'up' ? 'Thanks for the feedback!' : 'Thanks, we\'ll try to improve', 'info');
                }
            });
        });
    }
};

// Export for use in other modules (if using ES modules in future)
if (typeof window !== 'undefined') {
    window.SharedAPI = SharedAPI;
    window.SharedTheme = SharedTheme;
    window.SharedHeader = SharedHeader;
    window.SharedRequest = SharedRequest;
    window.SharedHistory = SharedHistory;
    window.SharedFavorites = SharedFavorites;
    window.ImageStore = ImageStore;
    window.SharedUI = SharedUI;
    window.SharedUpload = SharedUpload;
    window.SharedLightbox = SharedLightbox;
    window.SharedDownload = SharedDownload;
    window.SharedKeyboard = SharedKeyboard;
    window.SharedCollapsible = SharedCollapsible;
    window.SharedDashboard = SharedDashboard;
    window.SharedZip = SharedZip;
    window.SharedClipboard = SharedClipboard;
    window.SharedImageInfo = SharedImageInfo;
    window.SharedConfirm = SharedConfirm;
    window.SharedPresets = SharedPresets;
    window.SharedCostEstimator = SharedCostEstimator;
    window.SharedComparison = SharedComparison;
    window.SharedTrash = SharedTrash;
    window.SharedTooltips = SharedTooltips;
    window.SharedTemplates = SharedTemplates;
    window.SharedExamples = SharedExamples;
    window.SharedRating = SharedRating;

    // Auto-cleanup on load (runs once per day, cleans items >30 days old)
    const globalImageStore = new ImageStore();
    globalImageStore.init().then(() => {
        SharedDashboard.autoCleanup(30, globalImageStore);
    }).catch(() => {});
}
