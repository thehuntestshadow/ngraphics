/**
 * HEFAISTOS Product Selector Component
 * Dropdown for loading saved products into studios
 *
 * Usage:
 *   const selector = new ProductSelector({
 *       container: document.getElementById('productSelectorContainer'),
 *       onSelect: (product) => loadProductIntoStudio(product)
 *   });
 */

class ProductSelector {
    constructor(options) {
        this.container = options.container;
        this.onSelect = options.onSelect || (() => {});
        this.onSelectionChange = options.onSelectionChange || (() => {}); // Multi-select callback
        this.multiSelect = options.multiSelect || false; // Enable multi-select mode
        this.products = [];
        this._isOpen = false;
        this._selectedProduct = null;
        this._selectedProducts = []; // For multi-select mode
        this._outsideClickHandler = null;

        this._init();
    }

    async _init() {
        this._render();
        this._attachEvents();
        // Don't load products until dropdown is opened (lazy load)
    }

    _render() {
        this.container.innerHTML = `
            <div class="product-selector">
                <button class="product-selector-trigger" type="button">
                    <svg class="product-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <path d="M14 17h7m-3.5-3.5v7"/>
                    </svg>
                    <span class="trigger-text">${this.multiSelect ? 'Select Products' : 'Load Product'}</span>
                    <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="product-selector-dropdown">
                    <div class="product-selector-search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="Search products...">
                    </div>
                    <div class="product-selector-list">
                        <div class="product-selector-loading">
                            <div class="loading-spinner-small"></div>
                            Loading products...
                        </div>
                    </div>
                    <div class="product-selector-footer">
                        <a href="products.html" target="_blank">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Manage Products
                        </a>
                    </div>
                </div>
            </div>
        `;

        this.trigger = this.container.querySelector('.product-selector-trigger');
        this.dropdown = this.container.querySelector('.product-selector-dropdown');
        this.list = this.container.querySelector('.product-selector-list');
        this.searchInput = this.container.querySelector('.product-selector-search input');
        this.triggerText = this.container.querySelector('.trigger-text');
    }

    async _loadProducts() {
        if (!ngSupabase?.isAuthenticated) {
            this.list.innerHTML = `
                <div class="product-selector-empty">
                    <p>Sign in to load products</p>
                </div>
            `;
            return;
        }

        this.list.innerHTML = `
            <div class="product-selector-loading">
                <div class="loading-spinner-small"></div>
                Loading products...
            </div>
        `;

        try {
            this.products = await ngSupabase.getProducts({ limit: 30 });
            this._renderList(this.products);
        } catch (error) {
            console.error('Failed to load products:', error);
            this.list.innerHTML = `
                <div class="product-selector-empty">
                    <p>Failed to load products</p>
                </div>
            `;
        }
    }

    _renderList(products) {
        if (products.length === 0) {
            this.list.innerHTML = `
                <div class="product-selector-empty">
                    <p>No products saved yet</p>
                    <a href="products.html" class="btn-link">Add your first product</a>
                </div>
            `;
            return;
        }

        this.list.innerHTML = products.map(p => {
            const isSelected = this.multiSelect && this._selectedProducts.some(sp => sp.id === p.id);
            return `
            <div class="product-selector-item ${isSelected ? 'selected' : ''}" data-id="${p.id}">
                ${this.multiSelect ? `
                    <label class="product-checkbox">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                        <span class="checkbox-mark"></span>
                    </label>
                ` : ''}
                ${p.thumbnail_path
        ? `<img src="${ngSupabase.getProductImageUrl(p.thumbnail_path)}" alt="" class="product-thumb" loading="lazy">`
        : `<div class="product-thumb-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>`
}
                <div class="product-item-info">
                    <span class="product-item-name">${this._escapeHtml(p.name)}</span>
                    <span class="product-item-category">${this._escapeHtml(p.category)}</span>
                </div>
            </div>
        `}).join('');
    }

    _attachEvents() {
        // Toggle dropdown
        this.trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._toggle();
        });

        // Close on outside click - store reference for cleanup
        this._outsideClickHandler = (e) => {
            if (!this.container.contains(e.target)) {
                this._close();
            }
        };
        document.addEventListener('click', this._outsideClickHandler);

        // Search
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = e.target.value.trim();
                if (query.length < 2) {
                    this._renderList(this.products);
                    return;
                }
                try {
                    const results = await ngSupabase.searchProducts(query);
                    this._renderList(results);
                } catch (error) {
                    console.error('Search error:', error);
                }
            }, 300);
        });

        // Select product
        this.list.addEventListener('click', async (e) => {
            const item = e.target.closest('.product-selector-item');
            if (!item) return;

            const productId = item.dataset.id;

            if (this.multiSelect) {
                // Multi-select mode: toggle selection
                await this._toggleProductSelection(productId, item);
            } else {
                // Single-select mode: existing behavior
                const product = await ngSupabase.getProduct(productId);

                if (product) {
                    // Mark as recently used
                    await ngSupabase.touchProduct(productId);

                    // Update UI
                    this._selectedProduct = product;
                    this.triggerText.textContent = product.name;
                    this.trigger.classList.add('has-selection');

                    // Load product images from storage
                    await this._loadProductImages(product);

                    // Call the onSelect callback
                    this.onSelect(product);
                    this._close();
                }
            }
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this._close();
            }
        });
    }

    async _loadProductImages(product) {
        // Load primary image
        if (product.primary_image_path) {
            try {
                const url = ngSupabase.getProductImageUrl(product.primary_image_path);
                const response = await fetch(url);
                const blob = await response.blob();
                const dataUrl = await this._blobToDataUrl(blob);
                product._primaryImageData = dataUrl;
            } catch (e) {
                console.warn('Failed to load primary image:', e);
            }
        }

        // Load additional images
        if (product.image_paths?.length) {
            product._additionalImageData = [];
            for (const path of product.image_paths) {
                try {
                    const url = ngSupabase.getProductImageUrl(path);
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const dataUrl = await this._blobToDataUrl(blob);
                    product._additionalImageData.push(dataUrl);
                } catch (e) {
                    console.warn('Failed to load additional image:', e);
                }
            }
        }
    }

    _blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Toggle product selection in multi-select mode
     */
    async _toggleProductSelection(productId, item) {
        const existingIndex = this._selectedProducts.findIndex(p => p.id === productId);

        if (existingIndex >= 0) {
            // Deselect: remove from array
            this._selectedProducts.splice(existingIndex, 1);
            item.classList.remove('selected');
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        } else {
            // Select: fetch full product data and add to array
            const product = await ngSupabase.getProduct(productId);
            if (product) {
                await ngSupabase.touchProduct(productId);
                await this._loadProductImages(product);
                this._selectedProducts.push(product);
                item.classList.add('selected');
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = true;
            }
        }

        this._updateTriggerText();
        this.onSelectionChange([...this._selectedProducts]);
    }

    /**
     * Update trigger button text for multi-select mode
     */
    _updateTriggerText() {
        if (!this.multiSelect) return;

        const count = this._selectedProducts.length;
        if (count === 0) {
            this.triggerText.textContent = 'Select Products';
            this.trigger.classList.remove('has-selection');
        } else {
            this.triggerText.textContent = `${count} product${count > 1 ? 's' : ''} selected`;
            this.trigger.classList.add('has-selection');
        }
    }

    _toggle() {
        this._isOpen ? this._close() : this._open();
    }

    async _open() {
        this._isOpen = true;
        this.dropdown.classList.add('open');
        this.trigger.classList.add('open');
        this.searchInput.focus();

        // Load products on first open
        if (this.products.length === 0) {
            await this._loadProducts();
        }
    }

    _close() {
        this._isOpen = false;
        this.dropdown.classList.remove('open');
        this.trigger.classList.remove('open');
        this.searchInput.value = '';
        this._renderList(this.products);
    }

    /**
     * Reset the selector to default state
     */
    reset() {
        this._selectedProduct = null;
        this._selectedProducts = [];
        this.triggerText.textContent = this.multiSelect ? 'Select Products' : 'Load Product';
        this.trigger.classList.remove('has-selection');
        this._renderList(this.products);
    }

    /**
     * Clear all selections (alias for reset, multi-select friendly)
     */
    clearSelection() {
        this.reset();
        this.onSelectionChange([]);
    }

    /**
     * Get all selected products (multi-select mode)
     */
    getSelectedProducts() {
        return [...this._selectedProducts];
    }

    /**
     * Refresh the product list
     */
    async refresh() {
        this.products = [];
        if (this._isOpen) {
            await this._loadProducts();
        }
    }

    /**
     * Get currently selected product
     */
    getSelectedProduct() {
        return this._selectedProduct;
    }

    _escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clean up event listeners to prevent memory leaks
     */
    destroy() {
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
            this._outsideClickHandler = null;
        }
    }
}

// Export globally
window.ProductSelector = ProductSelector;
