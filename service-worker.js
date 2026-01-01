/**
 * HEFAISTOS - Service Worker
 * Handles caching, offline support, and background sync
 */

const CACHE_VERSION = 'v16';
const CACHE_NAME = `hefaistos-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/models.html',
    '/bundle.html',
    '/docs.html',
    '/styles.css',
    '/models.css',
    '/bundle.css',
    '/docs.css',
    '/shared.js',
    '/core.js',
    '/api.js',
    '/components.js',
    '/script.js',
    '/models.js',
    '/bundle.js'
];

// Cache strategies
const CACHE_STRATEGIES = {
    // Cache first, then network (for static assets)
    cacheFirst: async (request, cacheName) => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, response.clone());
            }
            return response;
        } catch (error) {
            return new Response('Offline', { status: 503 });
        }
    },

    // Network first, fallback to cache (for dynamic content)
    networkFirst: async (request, cacheName, timeout = 3000) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(request, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const cache = await caches.open(cacheName);
                cache.put(request, response.clone());
            }
            return response;
        } catch (error) {
            const cached = await caches.match(request);
            if (cached) return cached;
            throw error;
        }
    },

    // Stale while revalidate (serve cache, update in background)
    staleWhileRevalidate: async (request, cacheName) => {
        const cached = await caches.match(request);

        const fetchPromise = fetch(request).then(async response => {
            if (response.ok) {
                // Clone immediately before body is consumed
                const responseToCache = response.clone();
                const cache = await caches.open(cacheName);
                cache.put(request, responseToCache);
            }
            return response;
        }).catch(() => null);

        return cached || fetchPromise;
    }
};

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching assets...');
                return cache.addAll(PRECACHE_ASSETS.map(url => {
                    return new Request(url, { cache: 'reload' });
                })).catch(err => {
                    console.warn('[SW] Some assets failed to cache:', err);
                });
            })
            .then(() => {
                console.log('[SW] Installation complete');
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('ngraphics-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Activation complete');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH EVENT
// ============================================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s)
    if (!url.protocol.startsWith('http')) return;

    // Skip API requests (OpenRouter) - don't cache these
    if (url.hostname === 'openrouter.ai') return;

    // Skip external resources
    if (url.origin !== location.origin) {
        // For external images, use cache-first
        if (request.destination === 'image') {
            event.respondWith(CACHE_STRATEGIES.cacheFirst(request, CACHE_NAME));
        }
        return;
    }

    // Determine strategy based on request type
    let strategy;

    // HTML pages - network first (want latest)
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
        strategy = CACHE_STRATEGIES.networkFirst(request, CACHE_NAME);
    }
    // JavaScript and CSS - stale while revalidate
    else if (request.destination === 'script' || request.destination === 'style') {
        strategy = CACHE_STRATEGIES.staleWhileRevalidate(request, CACHE_NAME);
    }
    // Images - cache first
    else if (request.destination === 'image') {
        strategy = CACHE_STRATEGIES.cacheFirst(request, CACHE_NAME);
    }
    // Fonts - cache first
    else if (request.destination === 'font') {
        strategy = CACHE_STRATEGIES.cacheFirst(request, CACHE_NAME);
    }
    // Everything else - network first
    else {
        strategy = CACHE_STRATEGIES.networkFirst(request, CACHE_NAME);
    }

    event.respondWith(strategy);
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', event => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'retry-failed-requests') {
        event.waitUntil(retryFailedRequests());
    }
});

async function retryFailedRequests() {
    // Get failed requests from IndexedDB
    const db = await openDB('ngraphics-sync', 1);
    const requests = await db.getAll('failed-requests');

    for (const req of requests) {
        try {
            const response = await fetch(req.url, req.options);
            if (response.ok) {
                // Remove from failed requests
                await db.delete('failed-requests', req.id);
                // Notify the client
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_SUCCESS',
                        requestId: req.id,
                        data: response
                    });
                });
            }
        } catch (error) {
            console.log('[SW] Retry failed:', error);
        }
    }
}

// Simple IndexedDB wrapper
function openDB(name, version) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve({
            db: request.result,
            getAll: (store) => new Promise((res, rej) => {
                const tx = request.result.transaction(store, 'readonly');
                const req = tx.objectStore(store).getAll();
                req.onsuccess = () => res(req.result);
                req.onerror = () => rej(req.error);
            }),
            delete: (store, key) => new Promise((res, rej) => {
                const tx = request.result.transaction(store, 'readwrite');
                const req = tx.objectStore(store).delete(key);
                req.onsuccess = () => res();
                req.onerror = () => rej(req.error);
            })
        });
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('failed-requests')) {
                db.createObjectStore('failed-requests', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// ============================================
// PUSH NOTIFICATIONS (future use)
// ============================================
self.addEventListener('push', event => {
    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title || 'HEFAISTOS', {
            body: data.body || '',
            icon: data.icon || '/icon-192.png',
            badge: '/badge.png',
            data: data.data || {}
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clients => {
                // Focus existing window or open new one
                for (const client of clients) {
                    if (client.url.includes(location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return self.clients.openWindow('/');
            })
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener('message', event => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_URLS':
            event.waitUntil(
                caches.open(CACHE_NAME).then(cache => cache.addAll(data.urls))
            );
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(caches.delete(CACHE_NAME));
            break;

        case 'GET_CACHE_SIZE':
            event.waitUntil(
                getCacheSize().then(size => {
                    event.source.postMessage({ type: 'CACHE_SIZE', size });
                })
            );
            break;
    }
});

async function getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;

    for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
        }
    }

    return totalSize;
}

console.log('[SW] Service worker loaded');
