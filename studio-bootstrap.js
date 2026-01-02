/**
 * Studio Bootstrap - HEFAISTOS
 * Shared initialization and action helpers for all studios
 */

const StudioBootstrap = {
    /**
     * Initialize common studio infrastructure
     * @param {Object} config - Configuration object
     * @param {string} config.studioId - Unique studio identifier (e.g., 'lifestyle', 'models')
     * @param {Object} config.elements - Cached DOM elements object
     * @param {Object} config.shortcuts - Keyboard shortcut handlers { generate, download, escape }
     * @param {boolean} config.requireAuth - Require authentication (default: true)
     * @returns {Object} { history, favorites, imageStore, user }
     */
    async init(config) {
        const {
            studioId,
            elements = {},
            shortcuts = {},
            requireAuth = true
        } = config;

        // 0. Require authentication (blocks until user logs in)
        let user = null;
        if (requireAuth && typeof AuthGate !== 'undefined') {
            try {
                user = await AuthGate.requireAuth();
                console.log(`[StudioBootstrap] Authenticated as ${user.email}`);
            } catch (error) {
                console.error('[StudioBootstrap] Authentication required but failed:', error);
                // Auth gate will handle showing the login UI
                // Return early with minimal init
                return { history: null, favorites: null, imageStore: null, user: null };
            }
        }

        // 1. Initialize theme (already done inline in HTML to prevent flash)
        SharedTheme.init();
        if (elements.themeToggle) {
            SharedTheme.setupToggle(elements.themeToggle);
        }

        // 2. Initialize account menu if available
        if (elements.accountContainer && typeof AccountMenu !== 'undefined') {
            new AccountMenu(elements.accountContainer);
        }

        // 3. Initialize storage
        const imageStore = new ImageStore(`${studioId}_images`);
        await imageStore.init();

        const history = new SharedHistory(`${studioId}_history`, 20);
        history.setImageStore(imageStore);

        const favorites = new SharedFavorites(`${studioId}_favorites`, 30);
        favorites.setImageStore(imageStore);

        // 4. Setup keyboard shortcuts
        if (Object.keys(shortcuts).length > 0) {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Enter - generate
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    shortcuts.generate?.();
                }
                // Ctrl/Cmd + D - download
                if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                    e.preventDefault();
                    shortcuts.download?.();
                }
                // Escape - close modals
                if (e.key === 'Escape') {
                    shortcuts.escape?.();
                }
            });
        }

        // 5. Load persisted data (triggers async cloud sync)
        history.load();
        favorites.load();

        // 6. Setup offline queue processor
        if (typeof offlineQueue !== 'undefined') {
            offlineQueue.setProcessor(async (op) => {
                return StudioBootstrap._processOfflineOperation(op);
            });

            // Flush any pending operations now that we're authenticated
            if (navigator.onLine) {
                offlineQueue.flush().catch(e =>
                    console.warn('[StudioBootstrap] Failed to flush offline queue:', e)
                );
            }
        }

        return { history, favorites, imageStore, user };
    },

    /**
     * Process offline queue operations
     * @param {Object} op - Queue operation
     * @returns {Promise<boolean>} Success status
     */
    async _processOfflineOperation(op) {
        if (!AuthGate.isAuthenticated()) {
            return false;
        }

        // Operations are processed by SupabaseStorage directly
        // This is just a placeholder for any custom handling
        console.log(`[StudioBootstrap] Processing offline operation: ${op.type} for ${op.studioId}`);
        return true;
    },

    /**
     * Unified async action wrapper with loading states and error handling
     * @param {string} actionName - Name of the action (for logging/display)
     * @param {Function} asyncFn - Async function to execute
     * @param {Object} options - Options for UI updates
     * @param {Function} options.showLoading - Function to show loading state
     * @param {Function} options.hideLoading - Function to hide loading state
     * @param {Function} options.showError - Function to show error message
     * @param {Function} options.showSuccess - Function to show success message
     * @param {Function} options.onSuccess - Callback on success
     * @returns {Promise<*>} Result of asyncFn
     */
    async runAction(actionName, asyncFn, options = {}) {
        const {
            showLoading,
            hideLoading,
            showError,
            showSuccess,
            onSuccess,
            successMessage
        } = options;

        try {
            showLoading?.();
            const result = await asyncFn();

            if (successMessage) {
                showSuccess?.(successMessage);
            }

            onSuccess?.(result);
            return result;
        } catch (error) {
            const message = error.toUserMessage?.() || error.message || `${actionName} failed`;
            showError?.(message);
            ngLog?.error?.(`${actionName} failed:`, error);
            throw error;
        } finally {
            hideLoading?.();
        }
    },

    /**
     * Setup common collapsible sections
     * @param {HTMLElement} toggleBtn - Toggle button element
     * @param {HTMLElement} section - Section to toggle
     */
    setupCollapsible(toggleBtn, section) {
        if (toggleBtn && section) {
            toggleBtn.addEventListener('click', () => {
                section.classList.toggle('open');
            });
        }
    },

    /**
     * Setup option button groups
     * @param {string} selector - CSS selector for option buttons
     * @param {Object} state - State object to update
     * @param {string} stateKey - Key in state to update
     * @param {Function} onChange - Optional callback when value changes
     */
    setupOptionButtons(selector, state, stateKey, onChange) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const value = btn.dataset.value || btn.dataset[stateKey];
                state[stateKey] = value;
                onChange?.(value);
            });
        });
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.StudioBootstrap = StudioBootstrap;
}
