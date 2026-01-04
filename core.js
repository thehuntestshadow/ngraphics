// @ts-check
/**
 * HEFAISTOS - Core Infrastructure
 * Reactive State, Event Bus, and foundational utilities
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * @typedef {Object} WatcherOptions
 * @property {boolean} [immediate] - Call handler immediately with current value
 * @property {boolean} [deep] - Watch nested changes
 * @property {number} [debounce] - Debounce delay in ms
 */

/**
 * @typedef {Object} ReactiveStateOptions
 * @property {string} [persistKey] - localStorage key for persistence
 * @property {string[]} [persistFields] - Fields to persist
 */

/**
 * @typedef {Object} CompressionResult
 * @property {Blob} blob - Compressed blob
 * @property {string} base64 - Base64 data URL
 * @property {number} width - Output width
 * @property {number} height - Output height
 * @property {number} originalSize - Original file size
 * @property {number} compressedSize - Compressed size
 * @property {string} compressionRatio - Compression ratio as percentage
 */

/**
 * @typedef {Object} VirtualScrollerOptions
 * @property {number} [itemHeight] - Item height in pixels
 * @property {number} [itemWidth] - Item width in pixels
 * @property {number} [gap] - Gap between items
 * @property {number} [buffer] - Extra rows to render
 * @property {number|'auto'} [columns] - Number of columns
 * @property {function(any, number): string} [renderItem] - Item renderer
 * @property {function(any, number): void} [onItemClick] - Click handler
 */

// ============================================
// LOGGING UTILITY
// ============================================

/**
 * Conditional logging that can be toggled for production
 * Set ngLog.enabled = false to disable debug logging
 * Errors are always logged regardless of setting
 */
const ngLog = {
    enabled: !location.hostname.includes('hefaistos.xyz'), // Auto-disable in production

    log(...args) {
        if (this.enabled) console.log('[NG]', ...args);
    },

    warn(...args) {
        if (this.enabled) console.warn('[NG]', ...args);
    },

    error(...args) {
        // Errors always logged
        console.error('[NG]', ...args);
    },

    debug(...args) {
        if (this.enabled) console.log('[NG:debug]', ...args);
    },

    // Enable/disable from console: ngLog.setEnabled(true/false)
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('ngraphics_debug', enabled ? '1' : '0');
    },

    // Check localStorage override
    init() {
        const override = localStorage.getItem('ngraphics_debug');
        if (override !== null) {
            this.enabled = override === '1';
        }
    }
};

// Initialize logging
ngLog.init();
// @ts-ignore - Global export
window.ngLog = ngLog;

// ============================================
// EVENT BUS
// ============================================
class EventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this.listeners = new Map();
        /** @type {Map<string, Set<Function>>} */
        this.onceListeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name (supports wildcards: 'image:*')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     */
    once(event, callback) {
        if (!this.onceListeners.has(event)) {
            this.onceListeners.set(event, new Set());
        }
        this.onceListeners.get(event).add(callback);

        return () => {
            const listeners = this.onceListeners.get(event);
            if (listeners) listeners.delete(callback);
        };
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = {}) {
        // Add metadata
        const eventData = {
            ...data,
            _event: event,
            _timestamp: Date.now()
        };

        // Exact match listeners
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(cb => {
                try {
                    cb(eventData);
                } catch (err) {
                    console.error(`Event handler error for "${event}":`, err);
                }
            });
        }

        // Once listeners
        const onceListeners = this.onceListeners.get(event);
        if (onceListeners) {
            onceListeners.forEach(cb => {
                try {
                    cb(eventData);
                } catch (err) {
                    console.error(`Once handler error for "${event}":`, err);
                }
            });
            this.onceListeners.delete(event);
        }

        // Wildcard listeners (e.g., 'image:*' matches 'image:generated')
        this.listeners.forEach((callbacks, pattern) => {
            if (pattern.endsWith('*')) {
                const prefix = pattern.slice(0, -1);
                if (event.startsWith(prefix) && pattern !== event) {
                    callbacks.forEach(cb => {
                        try {
                            cb(eventData);
                        } catch (err) {
                            console.error(`Wildcard handler error for "${pattern}":`, err);
                        }
                    });
                }
            }
        });

        // Global wildcard
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            globalListeners.forEach(cb => {
                try {
                    cb(eventData);
                } catch (err) {
                    console.error('Global handler error:', err);
                }
            });
        }
    }

    /**
     * Remove all listeners for an event (or all events)
     */
    clear(event = null) {
        if (event) {
            this.listeners.delete(event);
            this.onceListeners.delete(event);
        } else {
            this.listeners.clear();
            this.onceListeners.clear();
        }
    }

    /**
     * Get listener count for debugging
     */
    listenerCount(event = null) {
        if (event) {
            return (this.listeners.get(event)?.size || 0) +
                   (this.onceListeners.get(event)?.size || 0);
        }
        let count = 0;
        this.listeners.forEach(set => count += set.size);
        this.onceListeners.forEach(set => count += set.size);
        return count;
    }
}

// Global event bus instance
const events = new EventBus();

// ============================================
// REACTIVE STATE
// ============================================
class ReactiveState {
    /**
     * @param {Object} [initialState] - Initial state object
     * @param {ReactiveStateOptions} [options] - Configuration options
     */
    constructor(initialState = {}, options = {}) {
        /** @type {Map<string, Set<{callback: Function, options: WatcherOptions}>>} */
        this._watchers = new Map();
        /** @type {Map<string, {getter: Function, deps: string[], value: any, dirty: boolean}>} */
        this._computedCache = new Map();
        /** @type {string|null} */
        this._persistKey = options.persistKey || null;
        /** @type {string[]} */
        this._persistFields = options.persistFields || [];
        /** @type {Map<string, ReturnType<typeof setTimeout>>} */
        this._debounceTimers = new Map();
        /** @type {boolean} */
        this._batchUpdates = false;
        /** @type {Map<string, {oldValue: any, newValue: any}>} */
        this._pendingUpdates = new Map();

        // Load persisted state
        let state = { ...initialState };
        if (this._persistKey) {
            const saved = this._loadPersisted();
            if (saved) {
                state = { ...state, ...saved };
            }
        }

        // Create reactive proxy
        this._state = this._createProxy(state);

        // Auto-persist on changes
        if (this._persistKey && this._persistFields.length > 0) {
            this._persistFields.forEach(field => {
                this.watch(field, () => this._savePersisted());
            });
        }
    }

    _createProxy(obj, path = '') {
        const self = this;

        return new Proxy(obj, {
            get(target, prop) {
                if (prop === '_isProxy') return true;
                if (prop === '_raw') return target;

                const value = target[prop];

                // Return nested proxy for objects
                if (value && typeof value === 'object' && !value._isProxy) {
                    // @ts-ignore - prop is always string in our usage
                    const nestedPath = path ? `${path}.${String(prop)}` : String(prop);
                    target[prop] = self._createProxy(value, nestedPath);
                    return target[prop];
                }

                return value;
            },

            set(target, prop, value) {
                const oldValue = target[prop];

                // Skip if value unchanged
                if (oldValue === value) return true;

                target[prop] = value;

                // @ts-ignore - prop is always string in our usage
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);

                if (self._batchUpdates) {
                    self._pendingUpdates.set(fullPath, { oldValue, newValue: value });
                } else {
                    self._notifyWatchers(fullPath, value, oldValue);
                }

                // Emit event
                events.emit('state:changed', {
                    path: fullPath,
                    value,
                    oldValue
                });

                return true;
            },

            deleteProperty(target, prop) {
                const oldValue = target[prop];
                delete target[prop];

                // @ts-ignore - prop is always string in our usage
                const fullPath = path ? `${path}.${String(prop)}` : String(prop);
                self._notifyWatchers(fullPath, undefined, oldValue);

                return true;
            }
        });
    }

    _notifyWatchers(path, newValue, oldValue) {
        // Notify exact path watchers
        const watchers = this._watchers.get(path);
        if (watchers) {
            watchers.forEach(({ callback, options }) => {
                if (options.debounce) {
                    this._debouncedCall(path, callback, options.debounce, newValue, oldValue);
                } else {
                    try {
                        callback(newValue, oldValue, path);
                    } catch (err) {
                        console.error(`Watcher error for "${path}":`, err);
                    }
                }
            });
        }

        // Notify parent path watchers (e.g., 'settings' when 'settings.theme' changes)
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            const parentWatchers = this._watchers.get(parentPath);
            if (parentWatchers) {
                parentWatchers.forEach(({ callback, options }) => {
                    if (options.deep) {
                        try {
                            callback(this.get(parentPath), undefined, path);
                        } catch (err) {
                            console.error(`Deep watcher error for "${parentPath}":`, err);
                        }
                    }
                });
            }
        }

        // Invalidate computed properties that depend on this path
        this._computedCache.forEach((computed, key) => {
            if (computed.deps.includes(path)) {
                computed.dirty = true;
            }
        });
    }

    _debouncedCall(key, callback, delay, ...args) {
        const timerId = this._debounceTimers.get(key);
        if (timerId) clearTimeout(timerId);

        this._debounceTimers.set(key, setTimeout(() => {
            callback(...args);
            this._debounceTimers.delete(key);
        }, delay));
    }

    _loadPersisted() {
        try {
            const data = localStorage.getItem(this._persistKey);
            if (data) {
                const parsed = JSON.parse(data);
                // Only return fields that should be persisted
                const filtered = {};
                this._persistFields.forEach(field => {
                    if (field in parsed) {
                        filtered[field] = parsed[field];
                    }
                });
                return filtered;
            }
        } catch (err) {
            console.error('Failed to load persisted state:', err);
        }
        return null;
    }

    _savePersisted() {
        try {
            const toSave = {};
            this._persistFields.forEach(field => {
                const value = this.get(field);
                if (value !== undefined) {
                    // Get raw value, not proxy
                    toSave[field] = value?._raw || value;
                }
            });
            localStorage.setItem(this._persistKey, JSON.stringify(toSave));
        } catch (err) {
            console.error('Failed to save persisted state:', err);
        }
    }

    /**
     * Get a value by path (e.g., 'settings.theme')
     */
    get(path) {
        const parts = path.split('.');
        let value = this._state;

        for (const part of parts) {
            if (value === undefined || value === null) return undefined;
            value = value[part];
        }

        return value;
    }

    /**
     * Set a value by path
     */
    set(path, value) {
        const parts = path.split('.');
        let obj = this._state;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in obj) || typeof obj[part] !== 'object') {
                obj[part] = {};
            }
            obj = obj[part];
        }

        obj[parts[parts.length - 1]] = value;
    }

    /**
     * Watch a path for changes
     * @param {string} path - Path to watch (e.g., 'apiKey' or 'settings.theme')
     * @param {Function} callback - Called with (newValue, oldValue, path)
     * @param {Object} options - { immediate: false, deep: false, debounce: 0 }
     * @returns {Function} Unwatch function
     */
    watch(path, callback, options = {}) {
        const opts = { immediate: false, deep: false, debounce: 0, ...options };

        if (!this._watchers.has(path)) {
            this._watchers.set(path, new Set());
        }

        const watcher = { callback, options: opts };
        this._watchers.get(path).add(watcher);

        // Immediate invocation
        if (opts.immediate) {
            callback(this.get(path), undefined, path);
        }

        // Return unwatch function
        return () => {
            const watchers = this._watchers.get(path);
            if (watchers) {
                watchers.delete(watcher);
            }
        };
    }

    /**
     * Create a computed property
     * @param {string} name - Computed property name
     * @param {Function} getter - Function that returns computed value
     * @param {string[]} deps - Paths this computed depends on
     */
    computed(name, getter, deps = []) {
        this._computedCache.set(name, {
            getter,
            deps,
            value: undefined,
            dirty: true
        });

        // Define getter on state
        Object.defineProperty(this._state, name, {
            get: () => {
                const computed = this._computedCache.get(name);
                if (computed.dirty) {
                    computed.value = computed.getter(this._state);
                    computed.dirty = false;
                }
                return computed.value;
            },
            enumerable: true
        });
    }

    /**
     * Batch multiple updates into one notification
     */
    batch(fn) {
        this._batchUpdates = true;
        this._pendingUpdates.clear();

        try {
            fn(this._state);
        } finally {
            this._batchUpdates = false;

            // Notify all pending updates
            this._pendingUpdates.forEach(({ oldValue, newValue }, path) => {
                this._notifyWatchers(path, newValue, oldValue);
            });

            this._pendingUpdates.clear();
        }
    }

    /**
     * Reset state to initial values
     */
    reset(initialState) {
        Object.keys(this._state._raw).forEach(key => {
            delete this._state[key];
        });
        Object.assign(this._state, initialState);
    }

    /**
     * Get raw state object (for debugging)
     */
    toJSON() {
        return JSON.parse(JSON.stringify(this._state._raw || this._state));
    }
}

// ============================================
// IMAGE COMPRESSION
// ============================================
class ImageCompressor {
    /**
     * @param {Object} [options] - Compressor options
     * @param {number} [options.maxWidth] - Maximum output width
     * @param {number} [options.maxHeight] - Maximum output height
     * @param {number} [options.quality] - JPEG/WebP quality (0-1)
     * @param {string} [options.format] - Output format (image/webp, image/jpeg)
     */
    constructor(options = {}) {
        /** @type {number} */
        this.maxWidth = options.maxWidth || 1920;
        /** @type {number} */
        this.maxHeight = options.maxHeight || 1920;
        /** @type {number} */
        this.quality = options.quality || 0.85;
        /** @type {string} */
        this.format = options.format || 'image/webp';
        /** @type {string} */
        this.fallbackFormat = 'image/jpeg';
    }

    /**
     * Compress an image file
     * @param {File|Blob} file - Image file to compress
     * @param {Object} [options] - Override default options
     * @returns {Promise<CompressionResult>}
     */
    async compress(file, options = {}) {
        const opts = {
            maxWidth: options.maxWidth || this.maxWidth,
            maxHeight: options.maxHeight || this.maxHeight,
            quality: options.quality || this.quality,
            format: options.format || this.format
        };

        const originalSize = file.size;

        // Create image bitmap
        const img = await createImageBitmap(file);

        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > opts.maxWidth) {
            width = opts.maxWidth;
            height = width / aspectRatio;
        }

        if (height > opts.maxHeight) {
            height = opts.maxHeight;
            width = height * aspectRatio;
        }

        width = Math.round(width);
        height = Math.round(height);

        // Use OffscreenCanvas if available (better performance)
        let canvas, ctx;
        if (typeof OffscreenCanvas !== 'undefined') {
            canvas = new OffscreenCanvas(width, height);
            ctx = canvas.getContext('2d');
        } else {
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext('2d');
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Try preferred format, fall back if not supported
        /** @type {Blob} */
        let blob;
        try {
            // @ts-ignore - convertToBlob exists on OffscreenCanvas
            if (canvas.convertToBlob) {
                // @ts-ignore
                blob = await canvas.convertToBlob({ type: opts.format, quality: opts.quality });
            } else {
                blob = await new Promise(resolve => {
                    // @ts-ignore - toBlob exists on HTMLCanvasElement
                    canvas.toBlob(resolve, opts.format, opts.quality);
                });
            }
        } catch (e) {
            // Fallback to JPEG
            // @ts-ignore
            if (canvas.convertToBlob) {
                // @ts-ignore
                blob = await canvas.convertToBlob({ type: this.fallbackFormat, quality: opts.quality });
            } else {
                blob = await new Promise(resolve => {
                    // @ts-ignore
                    canvas.toBlob(resolve, this.fallbackFormat, opts.quality);
                });
            }
        }

        // Convert to base64
        const base64 = await this.blobToBase64(blob);

        return {
            blob,
            base64,
            width,
            height,
            originalSize,
            compressedSize: blob.size,
            compressionRatio: ((1 - blob.size / originalSize) * 100).toFixed(1) + '%'
        };
    }

    /**
     * Compress image from base64
     */
    async compressBase64(base64, options = {}) {
        const blob = await this.base64ToBlob(base64);
        return this.compress(blob, options);
    }

    /**
     * Create thumbnail
     */
    async createThumbnail(file, size = 150) {
        return this.compress(file, {
            maxWidth: size,
            maxHeight: size,
            quality: 0.7
        });
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    base64ToBlob(base64) {
        return fetch(base64).then(res => res.blob());
    }
}

// Global compressor instance
const imageCompressor = new ImageCompressor();

// ============================================
// REQUEST DEDUPLICATION
// ============================================
class RequestDeduplicator {
    constructor() {
        this.pending = new Map();
        this.cache = new Map();
        this.cacheMaxAge = 5 * 60 * 1000; // 5 minutes
        this.cacheMaxSize = 100; // LRU cache max entries
    }

    /**
     * Generate cache key from request
     */
    generateKey(url, options = {}) {
        const keyData = {
            url,
            method: options.method || 'GET',
            body: options.body || null
        };
        return JSON.stringify(keyData);
    }

    /**
     * Evict oldest entries if cache exceeds max size (LRU eviction)
     */
    _evictOldest() {
        // Ensure cacheMaxSize is valid to prevent infinite loops
        if (this.cacheMaxSize < 1) this.cacheMaxSize = 1;
        if (this.cache.size <= this.cacheMaxSize) return;

        // Convert to array, sort by timestamp (oldest first), evict excess
        const entries = [...this.cache.entries()]
            .sort((a, b) => a[1].timestamp - b[1].timestamp);

        const toEvict = entries.slice(0, this.cache.size - this.cacheMaxSize);
        for (const [key] of toEvict) {
            this.cache.delete(key);
        }
    }

    /**
     * Deduplicated fetch - returns same promise for identical concurrent requests
     */
    async fetch(url, options = {}, fetchFn = fetch) {
        const key = this.generateKey(url, options);

        // Check cache first
        if (options.cache !== false) {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
                // Update timestamp for LRU (move to "recently used")
                cached.timestamp = Date.now();
                return cached.data;
            }
        }

        // Check if request is already pending
        if (this.pending.has(key)) {
            return this.pending.get(key);
        }

        // Create new request
        const promise = fetchFn(url, options)
            .then(async response => {
                const data = await response.json();

                // Cache successful responses
                if (response.ok && options.cache !== false) {
                    this.cache.set(key, {
                        data,
                        timestamp: Date.now()
                    });
                    // Evict oldest entries if cache is too large
                    this._evictOldest();
                }

                return data;
            })
            .finally(() => {
                this.pending.delete(key);
            });

        this.pending.set(key, promise);
        return promise;
    }

    /**
     * Clear cache
     */
    clearCache(pattern = null) {
        if (pattern) {
            this.cache.forEach((_, key) => {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            });
        } else {
            this.cache.clear();
        }
    }

    /**
     * Cancel pending request
     */
    cancel(key) {
        this.pending.delete(key);
    }
}

const requestDeduplicator = new RequestDeduplicator();

// ============================================
// VIRTUAL SCROLLER
// ============================================
class VirtualScroller {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;

        this.options = {
            itemHeight: options.itemHeight || 150,
            itemWidth: options.itemWidth || 150,
            gap: options.gap || 12,
            buffer: options.buffer || 2, // Extra rows to render above/below
            columns: options.columns || 'auto',
            renderItem: options.renderItem || (() => ''),
            onItemClick: options.onItemClick || null,
            ...options
        };

        this.items = [];
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.containerWidth = 0;
        this.actualColumns = 1;

        // Store bound handlers for cleanup
        this._boundOnScroll = this._onScroll.bind(this);
        this._boundOnResize = this._onResize.bind(this);

        this._init();
    }

    _init() {
        // Create wrapper structure
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtual-scroll-wrapper';
        this.wrapper.style.cssText = 'position: relative; overflow: auto; height: 100%;';

        this.content = document.createElement('div');
        this.content.className = 'virtual-scroll-content';
        this.content.style.cssText = 'position: relative;';

        this.viewport = document.createElement('div');
        this.viewport.className = 'virtual-scroll-viewport';
        this.viewport.style.cssText = 'position: absolute; left: 0; right: 0;';

        this.content.appendChild(this.viewport);
        this.wrapper.appendChild(this.content);
        this.container.appendChild(this.wrapper);

        // Bind events using stored handlers
        this.wrapper.addEventListener('scroll', this._boundOnScroll);
        window.addEventListener('resize', this._boundOnResize);

        this._calculateDimensions();
    }

    _calculateDimensions() {
        this.containerHeight = this.wrapper.clientHeight;
        this.containerWidth = this.wrapper.clientWidth;

        // Calculate columns
        if (this.options.columns === 'auto') {
            this.actualColumns = Math.floor(
                (this.containerWidth + this.options.gap) /
                (this.options.itemWidth + this.options.gap)
            ) || 1;
        } else {
            this.actualColumns = this.options.columns;
        }

        this._updateTotalHeight();
        this._render();
    }

    _updateTotalHeight() {
        const rows = Math.ceil(this.items.length / this.actualColumns);
        const totalHeight = rows * (this.options.itemHeight + this.options.gap) - this.options.gap;
        this.content.style.height = `${Math.max(totalHeight, 0)}px`;
    }

    _onScroll() {
        this.scrollTop = this.wrapper.scrollTop;
        this._render();
    }

    _onResize() {
        this._calculateDimensions();
    }

    _render() {
        const { itemHeight, itemWidth, gap, buffer, renderItem, onItemClick } = this.options;
        const rowHeight = itemHeight + gap;

        // Calculate visible range
        const startRow = Math.max(0, Math.floor(this.scrollTop / rowHeight) - buffer);
        const visibleRows = Math.ceil(this.containerHeight / rowHeight) + buffer * 2;
        const endRow = Math.min(
            Math.ceil(this.items.length / this.actualColumns),
            startRow + visibleRows
        );

        const startIndex = startRow * this.actualColumns;
        const endIndex = Math.min(this.items.length, endRow * this.actualColumns);

        // Position viewport
        this.viewport.style.top = `${startRow * rowHeight}px`;

        // Render visible items
        const visibleItems = this.items.slice(startIndex, endIndex);
        this.viewport.innerHTML = '';

        visibleItems.forEach((item, i) => {
            const globalIndex = startIndex + i;
            const col = globalIndex % this.actualColumns;
            const row = Math.floor((globalIndex - startIndex) / this.actualColumns);

            const element = document.createElement('div');
            element.className = 'virtual-scroll-item';
            element.style.cssText = `
                position: absolute;
                width: ${itemWidth}px;
                height: ${itemHeight}px;
                left: ${col * (itemWidth + gap)}px;
                top: ${row * rowHeight}px;
            `;
            element.innerHTML = renderItem(item, globalIndex);

            if (onItemClick) {
                element.addEventListener('click', () => onItemClick(item, globalIndex));
            }

            this.viewport.appendChild(element);
        });
    }

    /**
     * Set items and re-render
     */
    setItems(items) {
        this.items = items;
        this._updateTotalHeight();
        this._render();
    }

    /**
     * Add items
     */
    addItems(items) {
        this.items = [...this.items, ...items];
        this._updateTotalHeight();
        this._render();
    }

    /**
     * Remove item by index
     */
    removeItem(index) {
        this.items.splice(index, 1);
        this._updateTotalHeight();
        this._render();
    }

    /**
     * Scroll to item
     */
    scrollToItem(index) {
        const row = Math.floor(index / this.actualColumns);
        const targetScroll = row * (this.options.itemHeight + this.options.gap);
        this.wrapper.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    /**
     * Refresh layout
     */
    refresh() {
        this._calculateDimensions();
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Guard against double-destroy
        if (!this.wrapper) return;
        this.wrapper.removeEventListener('scroll', this._boundOnScroll);
        window.removeEventListener('resize', this._boundOnResize);
        this.wrapper.remove();
        this.wrapper = null;
        // Clear bound handler references to allow GC
        this._boundOnScroll = null;
        this._boundOnResize = null;
    }
}

// ============================================
// LAZY LOADER
// ============================================
class LazyLoader {
    constructor() {
        this.loaded = new Map();
        this.loading = new Map();
    }

    /**
     * Lazy load a module
     * @param {string} id - Module identifier
     * @param {Function} loader - Async function that loads the module
     * @returns {Promise<any>} - The loaded module
     */
    async load(id, loader) {
        // Already loaded
        if (this.loaded.has(id)) {
            return this.loaded.get(id);
        }

        // Currently loading (deduplication)
        if (this.loading.has(id)) {
            return this.loading.get(id);
        }

        // Start loading
        const promise = loader()
            .then(module => {
                this.loaded.set(id, module);
                this.loading.delete(id);
                return module;
            })
            .catch(err => {
                this.loading.delete(id);
                throw err;
            });

        this.loading.set(id, promise);
        return promise;
    }

    /**
     * Preload a module (non-blocking)
     */
    preload(id, loader) {
        if (!this.loaded.has(id) && !this.loading.has(id)) {
            this.load(id, loader).catch(() => {}); // Ignore errors during preload
        }
    }

    /**
     * Check if module is loaded
     */
    isLoaded(id) {
        return this.loaded.has(id);
    }

    /**
     * Unload a module (for memory management)
     */
    unload(id) {
        this.loaded.delete(id);
    }
}

const lazyLoader = new LazyLoader();

// ============================================
// DEBOUNCE & THROTTLE UTILITIES
// ============================================
function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// EXPORTS
// ============================================
// @ts-ignore - Global exports for browser
window.EventBus = EventBus;
// @ts-ignore
window.events = events;
// @ts-ignore
window.ReactiveState = ReactiveState;
// @ts-ignore
window.ImageCompressor = ImageCompressor;
// @ts-ignore
window.imageCompressor = imageCompressor;
// @ts-ignore
window.RequestDeduplicator = RequestDeduplicator;
// @ts-ignore
window.requestDeduplicator = requestDeduplicator;
// @ts-ignore
window.VirtualScroller = VirtualScroller;
// @ts-ignore
window.LazyLoader = LazyLoader;
// @ts-ignore
window.lazyLoader = lazyLoader;
// @ts-ignore
window.debounce = debounce;
// @ts-ignore
window.throttle = throttle;
