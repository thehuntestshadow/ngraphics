/**
 * NGRAPHICS - Worker Manager
 * Easy interface for Web Worker and Service Worker operations
 */

// ============================================
// IMAGE WORKER MANAGER
// ============================================
class ImageWorkerManager {
    constructor() {
        this.worker = null;
        this.pending = new Map();
        this.nextId = 1;
        this.isSupported = typeof Worker !== 'undefined';
    }

    /**
     * Initialize the worker
     */
    init() {
        if (!this.isSupported) {
            console.warn('Web Workers not supported');
            return false;
        }

        if (this.worker) return true;

        try {
            this.worker = new Worker('image-worker.js');
            this.worker.onmessage = this._handleMessage.bind(this);
            this.worker.onerror = this._handleError.bind(this);
            return true;
        } catch (error) {
            console.error('Failed to create image worker:', error);
            return false;
        }
    }

    _handleMessage(event) {
        const { id, success, result, error, type } = event.data;

        // Handle progress updates
        if (type === 'progress') {
            this.pending.forEach(({ onProgress }) => {
                if (onProgress) onProgress(event.data.current, event.data.total);
            });
            return;
        }

        const pending = this.pending.get(id);
        if (!pending) return;

        this.pending.delete(id);

        if (success) {
            pending.resolve(result);
        } else {
            pending.reject(new Error(error));
        }
    }

    _handleError(error) {
        console.error('Image worker error:', error);
    }

    /**
     * Send a task to the worker
     */
    _send(action, data, onProgress = null) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                if (!this.init()) {
                    reject(new Error('Worker not available'));
                    return;
                }
            }

            const id = this.nextId++;
            this.pending.set(id, { resolve, reject, onProgress });
            this.worker.postMessage({ id, action, data });
        });
    }

    /**
     * Compress an image
     * @param {string|Blob} image - Image data (base64 or Blob)
     * @param {Object} options - Compression options
     */
    async compress(image, options = {}) {
        return this._send('compress', { imageData: image, options });
    }

    /**
     * Create a thumbnail
     * @param {string|Blob} image - Image data
     * @param {number} size - Thumbnail size (default 150)
     */
    async thumbnail(image, size = 150) {
        return this._send('thumbnail', { imageData: image, size });
    }

    /**
     * Analyze image colors and properties
     * @param {string|Blob} image - Image data
     */
    async analyze(image) {
        return this._send('analyze', { imageData: image });
    }

    /**
     * Enhance image (auto-levels, contrast, saturation)
     * @param {string|Blob} image - Image data
     * @param {Object} options - Enhancement options
     */
    async enhance(image, options = {}) {
        return this._send('enhance', { imageData: image, options });
    }

    /**
     * Resize image
     * @param {string|Blob} image - Image data
     * @param {number} width - Target width
     * @param {number} height - Target height
     * @param {string} fit - 'contain' or 'cover'
     */
    async resize(image, width, height, fit = 'contain') {
        return this._send('resize', { imageData: image, width, height, fit });
    }

    /**
     * Crop image
     */
    async crop(image, x, y, width, height) {
        return this._send('crop', { imageData: image, x, y, width, height });
    }

    /**
     * Process multiple images
     * @param {string[]} images - Array of image data
     * @param {string} action - 'compress', 'thumbnail', or 'enhance'
     * @param {Object} options - Processing options
     * @param {Function} onProgress - Progress callback (current, total)
     */
    async batch(images, action, options = {}, onProgress = null) {
        return this._send('batch', { images, action, options }, onProgress);
    }

    /**
     * Terminate the worker
     */
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.pending.clear();
    }
}

// ============================================
// SERVICE WORKER MANAGER
// ============================================
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isSupported = 'serviceWorker' in navigator;
        this.updateAvailable = false;
        this.onUpdateAvailable = null;
    }

    /**
     * Register the service worker
     */
    async register() {
        if (!this.isSupported) {
            console.warn('Service Workers not supported');
            return false;
        }

        try {
            this.registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('[SWM] Service worker registered:', this.registration.scope);

            // Check for updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        this.updateAvailable = true;
                        console.log('[SWM] Update available');

                        if (this.onUpdateAvailable) {
                            this.onUpdateAvailable();
                        }

                        // Emit event
                        if (window.events) {
                            window.events.emit('sw:update-available');
                        }
                    }
                });
            });

            // Handle controller change (new SW activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[SWM] Controller changed, reloading...');
                window.location.reload();
            });

            return true;
        } catch (error) {
            console.error('[SWM] Registration failed:', error);
            return false;
        }
    }

    /**
     * Check for updates
     */
    async checkForUpdate() {
        if (!this.registration) return false;

        try {
            await this.registration.update();
            return true;
        } catch (error) {
            console.error('[SWM] Update check failed:', error);
            return false;
        }
    }

    /**
     * Apply pending update
     */
    applyUpdate() {
        if (!this.registration?.waiting) return;
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    /**
     * Cache specific URLs
     */
    async cacheUrls(urls) {
        if (!this.registration?.active) return;
        this.registration.active.postMessage({
            type: 'CACHE_URLS',
            data: { urls }
        });
    }

    /**
     * Clear all cached data
     */
    async clearCache() {
        if (!this.registration?.active) return;
        this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }

    /**
     * Get cache size
     */
    async getCacheSize() {
        return new Promise((resolve) => {
            if (!this.registration?.active) {
                resolve(0);
                return;
            }

            const handler = (event) => {
                if (event.data.type === 'CACHE_SIZE') {
                    navigator.serviceWorker.removeEventListener('message', handler);
                    resolve(event.data.size);
                }
            };

            navigator.serviceWorker.addEventListener('message', handler);
            this.registration.active.postMessage({ type: 'GET_CACHE_SIZE' });

            // Timeout
            setTimeout(() => resolve(0), 5000);
        });
    }

    /**
     * Check if app is running offline
     */
    get isOffline() {
        return !navigator.onLine;
    }

    /**
     * Register for push notifications
     */
    async subscribeToPush(vapidPublicKey) {
        if (!this.registration) return null;

        try {
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this._urlBase64ToUint8Array(vapidPublicKey)
            });
            return subscription;
        } catch (error) {
            console.error('[SWM] Push subscription failed:', error);
            return null;
        }
    }

    _urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    /**
     * Unregister the service worker
     */
    async unregister() {
        if (!this.registration) return false;

        try {
            await this.registration.unregister();
            this.registration = null;
            return true;
        } catch (error) {
            console.error('[SWM] Unregistration failed:', error);
            return false;
        }
    }
}

// ============================================
// GLOBAL INSTANCES
// ============================================
const imageWorker = new ImageWorkerManager();
const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register service worker on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        serviceWorkerManager.register();
    });
} else {
    serviceWorkerManager.register();
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Compress image with fallback to main thread
 */
async function compressImage(image, options = {}) {
    // Try worker first
    if (imageWorker.isSupported) {
        try {
            return await imageWorker.compress(image, options);
        } catch (error) {
            console.warn('Worker compression failed, falling back:', error);
        }
    }

    // Fallback to main thread (using imageCompressor from core.js)
    if (window.imageCompressor) {
        return await window.imageCompressor.compress(
            typeof image === 'string' ? await fetch(image).then(r => r.blob()) : image,
            options
        );
    }

    throw new Error('Image compression not available');
}

/**
 * Create thumbnail with fallback
 */
async function createThumbnail(image, size = 150) {
    if (imageWorker.isSupported) {
        try {
            return await imageWorker.thumbnail(image, size);
        } catch (error) {
            console.warn('Worker thumbnail failed, falling back:', error);
        }
    }

    if (window.imageCompressor) {
        return await window.imageCompressor.createThumbnail(
            typeof image === 'string' ? await fetch(image).then(r => r.blob()) : image,
            size
        );
    }

    throw new Error('Thumbnail creation not available');
}

// ============================================
// EXPORTS
// ============================================
window.ImageWorkerManager = ImageWorkerManager;
window.imageWorker = imageWorker;
window.ServiceWorkerManager = ServiceWorkerManager;
window.serviceWorkerManager = serviceWorkerManager;
window.compressImage = compressImage;
window.createThumbnail = createThumbnail;
