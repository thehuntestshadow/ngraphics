// @ts-check
// ============================================
// OFFLINE QUEUE
// Queues write operations when offline, flushes when back online
// ============================================

/**
 * @typedef {Object} QueueOperation
 * @property {string} id - Unique operation ID
 * @property {'add_history'|'add_favorite'|'delete_history'|'delete_favorite'|'update_favorite'} type
 * @property {string} studioId - Studio identifier
 * @property {string} [itemId] - Item being operated on
 * @property {Object} data - Operation data
 * @property {string} timestamp - ISO timestamp
 * @property {number} retries - Retry count
 * @property {'pending'|'processing'|'failed'} status
 */

class OfflineQueue {
    constructor() {
        this.dbName = 'hefaistos_offline_queue';
        this.storeName = 'pending_operations';
        this.db = null;
        this._initPromise = null;
        this._isProcessing = false;
        this._listeners = new Set();

        // Listen for online/offline events
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this._onOnline());
            window.addEventListener('offline', () => this._onOffline());
        }
    }

    /**
     * Initialize IndexedDB for queue storage
     */
    async init() {
        if (this.db) return this.db;
        if (this._initPromise) return this._initPromise;

        this._initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => {
                console.error('[OfflineQueue] Failed to open database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[OfflineQueue] Database initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = /** @type {IDBDatabase} */ (event.target.result);
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('studioId', 'studioId', { unique: false });
                }
            };
        });

        return this._initPromise;
    }

    /**
     * Add operation to queue
     * @param {Omit<QueueOperation, 'id'|'timestamp'|'retries'|'status'>} operation
     * @returns {Promise<string>} Operation ID
     */
    async enqueue(operation) {
        await this.init();

        const fullOperation = {
            id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            retries: 0,
            status: 'pending',
            ...operation
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add(fullOperation);

            request.onsuccess = () => {
                console.log('[OfflineQueue] Enqueued:', fullOperation.type, fullOperation.studioId);
                this._emit('enqueued', fullOperation);
                resolve(fullOperation.id);
            };

            request.onerror = () => {
                console.error('[OfflineQueue] Failed to enqueue:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all pending operations
     * @returns {Promise<QueueOperation[]>}
     */
    async getAll() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const ops = request.result || [];
                // Sort by timestamp
                ops.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                resolve(ops);
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get pending operations count
     * @returns {Promise<number>}
     */
    async getCount() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Remove operation from queue
     * @param {string} id - Operation ID
     */
    async remove(id) {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                this._emit('removed', { id });
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update operation status/retries
     * @param {string} id
     * @param {Partial<QueueOperation>} updates
     */
    async update(id, updates) {
        await this.init();

        const existing = await this.get(id);
        if (!existing) return null;

        const updated = { ...existing, ...updates };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(updated);

            request.onsuccess = () => resolve(updated);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get single operation by ID
     * @param {string} id
     * @returns {Promise<QueueOperation|null>}
     */
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

    /**
     * Clear all operations
     */
    async clear() {
        await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                this._emit('cleared');
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Process all pending operations
     * @param {(op: QueueOperation) => Promise<boolean>} processor - Returns true on success
     * @returns {Promise<{processed: number, failed: number}>}
     */
    async flush(processor) {
        if (this._isProcessing) {
            console.log('[OfflineQueue] Already processing, skipping');
            return { processed: 0, failed: 0 };
        }

        if (!navigator.onLine) {
            console.log('[OfflineQueue] Offline, skipping flush');
            return { processed: 0, failed: 0 };
        }

        this._isProcessing = true;
        this._emit('flushStart');

        const pending = await this.getAll();
        let processed = 0;
        let failed = 0;

        console.log(`[OfflineQueue] Processing ${pending.length} pending operations`);

        for (const op of pending) {
            if (op.status === 'failed') {
                // Skip permanently failed operations
                continue;
            }

            try {
                await this.update(op.id, { status: 'processing' });
                const success = await processor(op);

                if (success) {
                    await this.remove(op.id);
                    processed++;
                    console.log(`[OfflineQueue] Processed: ${op.type} ${op.studioId}`);
                } else {
                    throw new Error('Processor returned false');
                }
            } catch (error) {
                console.error(`[OfflineQueue] Failed to process ${op.id}:`, error);

                const newRetries = op.retries + 1;
                if (newRetries >= 3) {
                    // Mark as permanently failed
                    await this.update(op.id, {
                        status: 'failed',
                        retries: newRetries,
                        error: error.message
                    });
                    failed++;
                } else {
                    // Increment retry count
                    await this.update(op.id, {
                        status: 'pending',
                        retries: newRetries
                    });
                }
            }
        }

        this._isProcessing = false;
        this._emit('flushComplete', { processed, failed });

        console.log(`[OfflineQueue] Flush complete: ${processed} processed, ${failed} failed`);
        return { processed, failed };
    }

    /**
     * Get operations that permanently failed
     * @returns {Promise<QueueOperation[]>}
     */
    async getFailed() {
        const all = await this.getAll();
        return all.filter(op => op.status === 'failed');
    }

    /**
     * Retry a failed operation
     * @param {string} id
     */
    async retry(id) {
        await this.update(id, { status: 'pending', retries: 0 });
    }

    /**
     * Check if there are pending operations
     * @returns {Promise<boolean>}
     */
    async hasPending() {
        const count = await this.getCount();
        return count > 0;
    }

    /**
     * Add event listener
     * @param {string} event
     * @param {Function} callback
     */
    on(event, callback) {
        this._listeners.add({ event, callback });
        return () => this._listeners.delete({ event, callback });
    }

    /**
     * Emit event to listeners
     * @param {string} event
     * @param {*} [data]
     */
    _emit(event, data) {
        for (const listener of this._listeners) {
            if (listener.event === event) {
                try {
                    listener.callback(data);
                } catch (e) {
                    console.error('[OfflineQueue] Listener error:', e);
                }
            }
        }
    }

    /**
     * Handle coming back online
     */
    async _onOnline() {
        console.log('[OfflineQueue] Back online');
        this._emit('online');

        // Auto-flush if there's a processor registered
        if (this._defaultProcessor) {
            await this.flush(this._defaultProcessor);
        }
    }

    /**
     * Handle going offline
     */
    _onOffline() {
        console.log('[OfflineQueue] Gone offline');
        this._emit('offline');
    }

    /**
     * Set default processor for auto-flush
     * @param {(op: QueueOperation) => Promise<boolean>} processor
     */
    setProcessor(processor) {
        this._defaultProcessor = processor;
    }

    /**
     * Check if currently online
     * @returns {boolean}
     */
    get isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    /**
     * Check if currently processing
     * @returns {boolean}
     */
    get isProcessing() {
        return this._isProcessing;
    }
}

// Export singleton instance
const offlineQueue = new OfflineQueue();

// Also export class for testing
if (typeof window !== 'undefined') {
    window.OfflineQueue = OfflineQueue;
    window.offlineQueue = offlineQueue;
}
