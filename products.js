/**
 * HEFAISTOS Products Page
 * Product library management - save product info for auto-fill in studios
 */

// ============================================
// 1. CONSTANTS & CONFIG
// ============================================
// Categories are now loaded dynamically from database per user

// ============================================
// 2. STATE & ELEMENTS
// ============================================
const state = {
    products: [],
    filteredProducts: [],
    categories: [],  // Loaded from database (now folders)
    currentCategory: 'all',  // Selected folder slug ('all' = root view)
    currentFolderId: null,   // Selected folder ID (null = show all)
    expandedFolders: new Set(),  // IDs of expanded folders in tree
    searchQuery: '',
    sortBy: 'recent',
    editingProductId: null,
    // Modal state
    primaryImage: null,
    additionalImages: [null, null, null],
    features: [],
    benefits: [],
    isAnalyzing: false,
    isSaving: false,
    deleteProductId: null,
    imageLoadControllers: []  // AbortControllers for cancelling image loads
};

let elements = {};

function initElements() {
    elements = {
        // Header
        themeToggle: document.getElementById('themeToggle'),
        accountContainer: document.getElementById('accountContainer'),
        // Layout
        notLoggedIn: document.getElementById('notLoggedIn'),
        productsLayout: document.getElementById('productsLayout'),
        signInBtn: document.getElementById('signInBtn'),
        // Sidebar
        categoryNav: document.getElementById('categoryNav'),
        addProductBtn: document.getElementById('addProductBtn'),
        // Content
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortSelect'),
        productsGrid: document.getElementById('productsGrid'),
        emptyState: document.getElementById('emptyState'),
        loadingState: document.getElementById('loadingState'),
        emptyAddBtn: document.getElementById('emptyAddBtn'),
        // Product Modal
        productModal: document.getElementById('productModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalClose: document.getElementById('modalClose'),
        productForm: document.getElementById('productForm'),
        productName: document.getElementById('productName'),
        productCategory: document.getElementById('productCategory'),
        productSku: document.getElementById('productSku'),
        productDescription: document.getElementById('productDescription'),
        productTags: document.getElementById('productTags'),
        featuresList: document.getElementById('featuresList'),
        benefitsList: document.getElementById('benefitsList'),
        addFeatureBtn: document.getElementById('addFeatureBtn'),
        addBenefitBtn: document.getElementById('addBenefitBtn'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        saveProductBtn: document.getElementById('saveProductBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        // Image uploads
        primaryImageUpload: document.getElementById('primaryImageUpload'),
        primaryInput: document.getElementById('primaryInput'),
        primaryPreview: document.getElementById('primaryPreview'),
        removePrimary: document.getElementById('removePrimary'),
        // Collapsible sections
        featuresHeader: document.getElementById('featuresHeader'),
        featuresContent: document.getElementById('featuresContent'),
        featuresCount: document.getElementById('featuresCount'),
        benefitsHeader: document.getElementById('benefitsHeader'),
        benefitsContent: document.getElementById('benefitsContent'),
        benefitsCount: document.getElementById('benefitsCount'),
        // Delete Modal
        deleteModal: document.getElementById('deleteModal'),
        deleteModalClose: document.getElementById('deleteModalClose'),
        deleteProductName: document.getElementById('deleteProductName'),
        deleteCancelBtn: document.getElementById('deleteCancelBtn'),
        deleteConfirmBtn: document.getElementById('deleteConfirmBtn'),
        // Category Modal
        categoryModal: document.getElementById('categoryModal'),
        categoryModalClose: document.getElementById('categoryModalClose'),
        categoryNameInput: document.getElementById('categoryNameInput'),
        saveCategoryBtn: document.getElementById('saveCategoryBtn'),
        cancelCategoryBtn: document.getElementById('cancelCategoryBtn')
    };
}

// ============================================
// 3. LIFECYCLE
// ============================================
let initialized = false;

async function init() {
    if (initialized) return;
    initialized = true;

    initElements();

    // Theme
    SharedTheme.init();
    SharedTheme.setupToggle(elements.themeToggle);

    // Account menu
    if (elements.accountContainer) {
        new AccountMenu(elements.accountContainer);
    }

    // Check auth
    await checkAuth();

    setupEventListeners();
}

async function checkAuth() {
    await ngSupabase.init();

    if (!ngSupabase.isAuthenticated) {
        showNotLoggedIn();
        return;
    }

    showLoggedIn();
    await loadCategories();  // Load categories first
    await loadProducts();
}

function showNotLoggedIn() {
    elements.notLoggedIn.style.display = 'flex';
    elements.productsLayout.style.display = 'none';
}

function showLoggedIn() {
    elements.notLoggedIn.style.display = 'none';
    elements.productsLayout.style.display = 'flex';
}

// ============================================
// 3.5 CATEGORIES
// ============================================
async function loadCategories() {
    try {
        state.categories = await ngSupabase.getCategories();
        renderCategorySidebar();
        renderCategoryDropdown();
    } catch (error) {
        console.error('Failed to load categories:', error);
        state.categories = [];
        renderCategorySidebar();
        renderCategoryDropdown();
    }
}

/**
 * Build folder tree from flat list
 */
function buildFolderTree(folders) {
    const map = new Map();
    const roots = [];

    // First pass: create map
    folders.forEach(f => map.set(f.id, { ...f, children: [] }));

    // Second pass: build tree
    folders.forEach(f => {
        const node = map.get(f.id);
        if (f.parent_id && map.has(f.parent_id)) {
            map.get(f.parent_id).children.push(node);
        } else {
            roots.push(node);
        }
    });

    // Sort children by display_order
    const sortChildren = (nodes) => {
        nodes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        nodes.forEach(n => sortChildren(n.children));
    };
    sortChildren(roots);

    return roots;
}

/**
 * Count products in folder and all subfolders
 */
function countProductsInFolder(folderId, folderMap) {
    let count = 0;
    const folder = folderMap.get(folderId);
    if (!folder) return 0;

    // Count direct products
    state.products.forEach(p => {
        if (p.category === folder.slug) count++;
    });

    // Count in children recursively
    folder.children?.forEach(child => {
        count += countProductsInFolder(child.id, folderMap);
    });

    return count;
}

/**
 * Render a single folder item with children
 */
function renderFolderItem(folder, depth = 0, folderMap) {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = state.expandedFolders.has(folder.id);
    const isActive = state.currentFolderId === folder.id;
    const count = countProductsInFolder(folder.id, folderMap);

    let html = `
        <div class="folder-item ${isActive ? 'active' : ''}" data-folder-id="${folder.id}" data-slug="${folder.slug}" style="--depth: ${depth}">
            ${hasChildren ? `
                <span class="folder-toggle ${isExpanded ? 'expanded' : ''}" data-folder-id="${folder.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </span>
            ` : '<span class="folder-toggle-spacer"></span>'}
            <span class="folder-icon">${folder.icon || '📁'}</span>
            <span class="folder-name">${escapeHtml(folder.name)}</span>
            <span class="folder-count">${count}</span>
            <button class="folder-menu-btn" data-folder-id="${folder.id}" title="Folder options">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
            </button>
        </div>
    `;

    // Render children if expanded
    if (hasChildren && isExpanded) {
        html += `<div class="folder-children">`;
        folder.children.forEach(child => {
            html += renderFolderItem(child, depth + 1, folderMap);
        });
        html += `</div>`;
    }

    return html;
}

function renderCategorySidebar() {
    const categoryNav = elements.categoryNav;
    if (!categoryNav) return;

    // Build folder tree and map
    const tree = buildFolderTree(state.categories);
    const folderMap = new Map();
    state.categories.forEach(f => folderMap.set(f.id, { ...f, children: [] }));
    // Rebuild with children
    tree.forEach(function addToMap(node) {
        folderMap.set(node.id, node);
        node.children?.forEach(addToMap);
    });

    // Count all products
    const totalCount = state.products.length;

    // Render sidebar
    categoryNav.innerHTML = `
        <div class="folder-item root ${state.currentFolderId === null ? 'active' : ''}" data-folder-id="all">
            <span class="folder-toggle-spacer"></span>
            <span class="folder-icon">📦</span>
            <span class="folder-name">All Products</span>
            <span class="folder-count">${totalCount}</span>
        </div>
        ${tree.map(folder => renderFolderItem(folder, 0, folderMap)).join('')}
        <button type="button" class="folder-add-btn" id="sidebarAddFolderBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Folder
        </button>
    `;

    // Attach event listeners
    attachFolderEventListeners();
}

function attachFolderEventListeners() {
    const categoryNav = elements.categoryNav;

    // Folder selection
    categoryNav.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking toggle or menu
            if (e.target.closest('.folder-toggle') || e.target.closest('.folder-menu-btn')) return;

            e.preventDefault();
            const folderId = item.dataset.folderId;

            if (folderId === 'all') {
                state.currentFolderId = null;
                state.currentCategory = 'all';
            } else {
                state.currentFolderId = folderId;
                state.currentCategory = item.dataset.slug;
            }

            applyFilters();
            renderProducts();
            renderCategorySidebar();
        });
    });

    // Folder toggle (expand/collapse)
    categoryNav.querySelectorAll('.folder-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const folderId = toggle.dataset.folderId;

            if (state.expandedFolders.has(folderId)) {
                state.expandedFolders.delete(folderId);
            } else {
                state.expandedFolders.add(folderId);
            }

            renderCategorySidebar();
        });
    });

    // Folder menu buttons
    categoryNav.querySelectorAll('.folder-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showFolderContextMenu(btn.dataset.folderId, e);
        });
    });

    // Add folder button
    const addBtn = categoryNav.querySelector('#sidebarAddFolderBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openCategoryModal());
    }
}

function showFolderContextMenu(folderId, event) {
    // Remove existing menu
    const existing = document.querySelector('.folder-context-menu');
    if (existing) existing.remove();

    const folder = state.categories.find(c => c.id === folderId);
    if (!folder) return;

    const menu = document.createElement('div');
    menu.className = 'folder-context-menu';
    menu.innerHTML = `
        <button data-action="add-subfolder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            Add Subfolder
        </button>
        <button data-action="rename">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            Rename
        </button>
        <button data-action="delete" class="danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Delete
        </button>
    `;

    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.left = `${rect.left}px`;

    document.body.appendChild(menu);

    // Handle actions
    menu.addEventListener('click', async (e) => {
        const action = e.target.closest('button')?.dataset.action;
        menu.remove();

        if (action === 'add-subfolder') {
            openCategoryModal(folderId);
        } else if (action === 'rename') {
            openCategoryModal(null, folder);
        } else if (action === 'delete') {
            await deleteFolder(folderId);
        }
    });

    // Close on outside click
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

async function deleteFolder(folderId) {
    const folder = state.categories.find(c => c.id === folderId);
    if (!folder) return;

    // Check for descendants
    const descendants = await ngSupabase.getFolderDescendants(folderId);
    const productCount = state.products.filter(p => p.category === folder.slug).length;

    let message = `Delete folder "${folder.name}"?`;
    if (descendants.length > 0) {
        message += `\n\nThis will also delete ${descendants.length} subfolder(s).`;
    }
    if (productCount > 0) {
        message += `\n\n${productCount} product(s) will be moved to root.`;
    }

    if (!confirm(message)) return;

    try {
        // Move products to root first
        for (const product of state.products) {
            if (product.category === folder.slug) {
                await ngSupabase.updateProduct(product.id, { category: null });
            }
        }

        await ngSupabase.deleteCategory(folderId);
        await loadCategories();
        await loadProducts();
        SharedUI.toast('Folder deleted', 'success');
    } catch (error) {
        console.error('Delete folder error:', error);
        SharedUI.showError('Failed to delete folder');
    }
}

function renderCategoryDropdown() {
    const dropdown = elements.productCategory;
    if (!dropdown) return;

    // Store current value to preserve selection during re-render
    const currentValue = dropdown.value;

    dropdown.innerHTML = `
        <option value="">Select category...</option>
        ${state.categories.map(cat => `
            <option value="${cat.slug}">${escapeHtml(cat.name)}</option>
        `).join('')}
        <option value="__new__">+ Add new category...</option>
    `;

    // Restore selection if it still exists
    if (currentValue && currentValue !== '__new__' && state.categories.some(c => c.slug === currentValue)) {
        dropdown.value = currentValue;
    }
}

function handleCategoryDropdownChange(e) {
    if (e.target.value === '__new__') {
        e.target.value = ''; // Reset selection
        openCategoryModal();
    }
}

// Track parent folder when creating subfolders
let categoryModalParentId = null;
let categoryModalEditingFolder = null;

function openCategoryModal(parentId = null, editingFolder = null) {
    if (!elements.categoryModal) return;
    categoryModalParentId = parentId;
    categoryModalEditingFolder = editingFolder;

    // Update modal title
    const modalTitle = elements.categoryModal.querySelector('.modal-title');
    if (modalTitle) {
        if (editingFolder) {
            modalTitle.textContent = 'Rename Folder';
        } else if (parentId) {
            const parent = state.categories.find(c => c.id === parentId);
            modalTitle.textContent = `New Subfolder in "${parent?.name || 'folder'}"`;
        } else {
            modalTitle.textContent = 'New Folder';
        }
    }

    elements.categoryModal.classList.add('open');
    if (elements.categoryNameInput) {
        elements.categoryNameInput.value = editingFolder?.name || '';
        elements.categoryNameInput.focus();
    }
    document.body.style.overflow = 'hidden';
}

function closeCategoryModal() {
    if (!elements.categoryModal) return;
    elements.categoryModal.classList.remove('open');
    document.body.style.overflow = '';
    categoryModalParentId = null;
    categoryModalEditingFolder = null;
}

async function saveNewCategory() {
    const name = elements.categoryNameInput?.value?.trim();
    if (!name) {
        showToast('Please enter a folder name', 'error');
        return;
    }

    try {
        elements.saveCategoryBtn?.classList.add('loading');

        if (categoryModalEditingFolder) {
            // Update existing folder
            await ngSupabase.updateCategory(categoryModalEditingFolder.id, { name });
        } else {
            // Create new folder
            const newCategory = await ngSupabase.createCategory({
                name,
                parentId: categoryModalParentId
            });

            // Auto-select the new category in dropdown if product modal is open
            if (elements.productCategory && elements.productModal?.classList.contains('open')) {
                elements.productCategory.value = newCategory.slug;
            }
        }

        // Refresh categories from database
        state.categories = await ngSupabase.getCategories();

        renderCategorySidebar();
        renderCategoryDropdown();

        closeCategoryModal();
        showToast(categoryModalEditingFolder ? 'Folder renamed' : `Folder "${name}" created`, 'success');
    } catch (error) {
        console.error('Failed to create category:', error);
        showToast(error.message || 'Failed to create category', 'error');
    } finally {
        elements.saveCategoryBtn?.classList.remove('loading');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// 4. PRODUCT CRUD
// ============================================
async function loadProducts() {
    elements.loadingState.style.display = 'flex';
    elements.productsGrid.style.display = 'none';
    elements.emptyState.style.display = 'none';

    try {
        state.products = await ngSupabase.getProducts({ archived: false });
        applyFilters();
        renderCategorySidebar();  // Update sidebar counts
        renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('Failed to load products', 'error');
    } finally {
        elements.loadingState.style.display = 'none';
    }
}

function applyFilters() {
    let filtered = [...state.products];

    // Category filter
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === state.currentCategory);
    }

    // Search filter
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    // Sort
    switch (state.sortBy) {
        case 'recent':
            filtered.sort((a, b) => {
                const aTime = a.last_used_at || a.created_at;
                const bTime = b.last_used_at || b.created_at;
                return new Date(bTime) - new Date(aTime);
            });
            break;
        case 'created':
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    state.filteredProducts = filtered;
}

async function saveProduct() {
    if (state.isSaving) return;

    const name = elements.productName.value.trim();
    const category = elements.productCategory.value;

    if (!name) {
        showToast('Please enter a product name', 'error');
        elements.productName.focus();
        return;
    }

    if (!category) {
        showToast('Please select a category', 'error');
        elements.productCategory.focus();
        return;
    }

    state.isSaving = true;
    setButtonLoading(elements.saveProductBtn, true);

    try {
        const productData = {
            name,
            category,
            sku: elements.productSku.value.trim() || null,
            description: elements.productDescription.value.trim(),
            features: state.features,
            benefits: state.benefits,
            tags: elements.productTags.value.split(',').map(t => t.trim()).filter(Boolean)
        };

        const imageData = {
            primaryImage: state.primaryImage,
            additionalImages: state.additionalImages.filter(Boolean),
            thumbnail: state.primaryImage ? await createThumbnail(state.primaryImage) : null
        };

        if (state.editingProductId) {
            await ngSupabase.updateProduct(state.editingProductId, productData, imageData);
            showToast('Product updated', 'success');
        } else {
            await ngSupabase.createProduct(productData, imageData);
            showToast('Product saved', 'success');
        }

        closeModal();
        await loadProducts();

    } catch (error) {
        console.error('Save error:', error);
        showToast('Failed to save product: ' + error.message, 'error');
    } finally {
        state.isSaving = false;
        setButtonLoading(elements.saveProductBtn, false);
    }
}

async function deleteProduct() {
    if (!state.deleteProductId) return;

    setButtonLoading(elements.deleteConfirmBtn, true);

    try {
        await ngSupabase.deleteProduct(state.deleteProductId);
        showToast('Product deleted', 'success');
        closeDeleteModal();
        await loadProducts();
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete product', 'error');
    } finally {
        setButtonLoading(elements.deleteConfirmBtn, false);
    }
}

async function duplicateProduct(productId) {
    elements.loadingState.style.display = 'flex';
    elements.productsGrid.style.display = 'none';

    try {
        // 1. Fetch source product
        const source = await ngSupabase.getProduct(productId);
        if (!source) {
            throw new Error('Product not found');
        }

        // 2. Fetch source images as base64
        const imageData = await fetchProductImages(source);

        // 3. Prepare duplicate data (don't save to DB yet)
        const duplicate = {
            name: `${source.name} (copy)`,
            sku: source.sku ? `${source.sku}-copy` : '',
            category: source.category,
            description: source.description,
            features: source.features || [],
            benefits: source.benefits || [],
            tags: source.tags || []
        };

        // 4. Hide loading, show grid
        elements.loadingState.style.display = 'none';
        elements.productsGrid.style.display = 'grid';

        // 5. Open modal in "new product" mode with pre-populated data
        // Product will only be created when user clicks Save
        openModalWithData(duplicate, imageData);
    } catch (error) {
        console.error('Duplicate error:', error);
        elements.loadingState.style.display = 'none';
        elements.productsGrid.style.display = 'grid';
        showToast('Failed to duplicate product', 'error');
    }
}

async function fetchProductImages(product) {
    const imageData = {};

    if (product.primary_image_path) {
        try {
            const url = ngSupabase.getProductImageUrl(product.primary_image_path);
            imageData.primaryImage = await urlToBase64(url);
            // Generate thumbnail from primary image
            imageData.thumbnail = await createThumbnail(imageData.primaryImage);
        } catch (e) {
            console.warn('Failed to fetch primary image:', e);
        }
    }

    if (product.image_paths?.length) {
        imageData.additionalImages = [];
        for (const path of product.image_paths) {
            try {
                const url = ngSupabase.getProductImageUrl(path);
                const base64 = await urlToBase64(url);
                imageData.additionalImages.push(base64);
            } catch (e) {
                console.warn('Failed to fetch additional image:', e);
            }
        }
    }

    return imageData;
}

async function urlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// 5. AI ANALYSIS
// ============================================
async function analyzeProduct() {
    if (!state.primaryImage || state.isAnalyzing) return;

    state.isAnalyzing = true;
    elements.analyzeBtn.classList.add('loading');

    try {
        const lang = localStorage.getItem('ngraphics_gen_language') || 'en';
        const langName = lang === 'en' ? 'English' : (i18n?.getLanguageInfo?.(lang)?.name || 'English');

        // Build category list from user's categories
        const categoryList = state.categories.length > 0
            ? state.categories.map(c => c.slug).join(', ')
            : 'general';

        const prompt = `Analyze this product image and return a JSON object with:
{
    "productTitle": "Concise product name",
    "productCategory": "One of: ${categoryList}",
    "description": "Brief product description (1-2 sentences)",
    "features": [
        {"text": "Feature description", "starred": true},
        {"text": "Another feature", "starred": false}
    ],
    "benefits": ["Customer benefit 1", "Benefit 2", "Benefit 3"]
}

Important:
- Mark 1-2 most important features as starred
- Include 3-5 features and 3-5 benefits
- Return ONLY valid JSON, no markdown code blocks
- For productCategory, pick the BEST match from the list
- Language: ${langName}`;

        const result = await api.analyzeImage({
            image: state.primaryImage,
            prompt,
            model: 'google/gemini-2.0-flash-001'
        });

        // Parse response
        let analysis;
        try {
            let cleanText = result.text.trim();
            if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
            else if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
            if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
            analysis = JSON.parse(cleanText.trim());
        } catch (e) {
            throw new Error('Failed to parse AI response');
        }

        // Validate response structure
        if (!analysis || typeof analysis !== 'object') {
            throw new Error('Invalid AI response format');
        }

        // Helper to sanitize and limit string length
        const sanitizeString = (val, maxLen = 500) => {
            if (typeof val !== 'string') return '';
            return val.slice(0, maxLen).trim();
        };

        // Populate form fields with validation
        if (analysis.productTitle && typeof analysis.productTitle === 'string') {
            elements.productName.value = sanitizeString(analysis.productTitle, 200);
        }
        // Validate category against user's categories
        if (analysis.productCategory && typeof analysis.productCategory === 'string') {
            const categoryInput = sanitizeString(analysis.productCategory, 100).toLowerCase();
            const validCategory = state.categories.find(
                c => c.slug === categoryInput ||
                     c.name.toLowerCase() === categoryInput
            );
            if (validCategory) {
                elements.productCategory.value = validCategory.slug;
            }
        }
        if (analysis.description && typeof analysis.description === 'string') {
            elements.productDescription.value = sanitizeString(analysis.description, 1000);
        }
        if (Array.isArray(analysis.features)) {
            state.features = analysis.features
                .slice(0, 10) // Limit feature count
                .map(f => ({
                    text: sanitizeString(typeof f === 'string' ? f : f?.text, 300),
                    starred: typeof f === 'object' ? !!f?.starred : false
                }))
                .filter(f => f.text); // Remove empty features
            renderFeatures();
        }
        if (Array.isArray(analysis.benefits)) {
            state.benefits = analysis.benefits
                .slice(0, 10) // Limit benefit count
                .map(b => sanitizeString(typeof b === 'string' ? b : b?.text, 300))
                .filter(b => b); // Remove empty benefits
            renderBenefits();
        }

        showToast('Product analyzed successfully', 'success');

    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Failed to analyze: ' + error.message, 'error');
    } finally {
        state.isAnalyzing = false;
        elements.analyzeBtn.classList.remove('loading');
    }
}

// ============================================
// 6. UI RENDERING
// ============================================
function renderProducts() {
    if (state.filteredProducts.length === 0) {
        elements.productsGrid.style.display = 'none';
        elements.emptyState.style.display = 'flex';
        return;
    }

    elements.emptyState.style.display = 'none';
    elements.productsGrid.style.display = 'grid';

    elements.productsGrid.innerHTML = state.filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.thumbnail_path
        ? `<img src="${ngSupabase.getProductImageUrl(product.thumbnail_path)}" alt="${escapeHtml(product.name)}" loading="lazy">`
        : `<div class="product-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>`
}
            </div>
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <span class="product-category">${escapeHtml(product.category)}</span>
                ${product.features?.length ? `<span class="product-features-count">${product.features.length} features</span>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn-icon edit-btn" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="btn-icon duplicate-btn" title="Duplicate">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
                <button class="btn-icon delete-btn" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Attach event listeners
    elements.productsGrid.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.closest('.product-card').dataset.id;
            editProduct(id);
        });
    });

    elements.productsGrid.querySelectorAll('.duplicate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.closest('.product-card').dataset.id;
            duplicateProduct(id);
        });
    });

    elements.productsGrid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.closest('.product-card').dataset.id;
            const product = state.products.find(p => p.id === id);
            if (product) {
                state.deleteProductId = id;
                elements.deleteProductName.textContent = product.name;
                openDeleteModal();
            }
        });
    });

    // Click on card to edit
    elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            editProduct(card.dataset.id);
        });
    });
}

function renderFeatures() {
    elements.featuresList.innerHTML = state.features.map((feature, index) => `
        <div class="feature-item" data-index="${index}">
            <button type="button" class="star-btn ${feature.starred ? 'starred' : ''}" title="Star this feature">
                <svg viewBox="0 0 24 24" fill="${feature.starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            </button>
            <input type="text" value="${escapeHtml(feature.text)}" placeholder="Feature description">
            <button type="button" class="remove-btn" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');

    // Attach listeners
    elements.featuresList.querySelectorAll('.feature-item').forEach((item, index) => {
        item.querySelector('.star-btn').addEventListener('click', () => {
            state.features[index].starred = !state.features[index].starred;
            renderFeatures();
        });
        item.querySelector('input').addEventListener('input', (e) => {
            state.features[index].text = e.target.value;
        });
        item.querySelector('.remove-btn').addEventListener('click', () => {
            state.features.splice(index, 1);
            renderFeatures();
        });
    });

    // Update count
    updateSectionCounts();
}

function renderBenefits() {
    elements.benefitsList.innerHTML = state.benefits.map((benefit, index) => `
        <div class="benefit-item" data-index="${index}">
            <input type="text" value="${escapeHtml(benefit)}" placeholder="Customer benefit">
            <button type="button" class="remove-btn" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');

    // Attach listeners
    elements.benefitsList.querySelectorAll('.benefit-item').forEach((item, index) => {
        item.querySelector('input').addEventListener('input', (e) => {
            state.benefits[index] = e.target.value;
        });
        item.querySelector('.remove-btn').addEventListener('click', () => {
            state.benefits.splice(index, 1);
            renderBenefits();
        });
    });

    // Update count
    updateSectionCounts();
}

function updateSectionCounts() {
    if (elements.featuresCount) {
        elements.featuresCount.textContent = state.features.length;
    }
    if (elements.benefitsCount) {
        elements.benefitsCount.textContent = state.benefits.length;
    }
}

function toggleCollapsible(headerEl, contentEl) {
    const isCollapsed = headerEl.classList.contains('collapsed');
    if (isCollapsed) {
        headerEl.classList.remove('collapsed');
        contentEl.classList.remove('collapsed');
    } else {
        headerEl.classList.add('collapsed');
        contentEl.classList.add('collapsed');
    }
}

// ============================================
// 7. MODAL MANAGEMENT
// ============================================
function openModal(productId = null) {
    state.editingProductId = productId;
    resetModalState();

    if (productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) {
            populateModalWithProduct(product);
            elements.modalTitle.textContent = 'Edit Product';
        }
    } else {
        elements.modalTitle.textContent = 'Add Product';
    }

    elements.productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

// Open modal in "Add New" mode but pre-populated with data (for duplication)
function openModalWithData(productData, imageData) {
    // Open in "new product" mode (no editingProductId)
    state.editingProductId = null;
    resetModalState();

    // Set title
    elements.modalTitle.textContent = 'Add Product';

    // Populate form fields
    elements.productName.value = productData.name || '';
    elements.productCategory.value = productData.category || '';
    elements.productSku.value = productData.sku || '';
    elements.productDescription.value = productData.description || '';
    elements.productTags.value = (productData.tags || []).join(', ');

    // Populate features and benefits
    state.features = productData.features || [];
    state.benefits = productData.benefits || [];
    renderFeatures();
    renderBenefits();

    // Populate primary image
    if (imageData.primaryImage) {
        state.primaryImage = imageData.primaryImage;
        elements.primaryPreview.src = imageData.primaryImage;
        elements.primaryPreview.style.display = 'block';
        elements.removePrimary.style.display = 'flex';
        elements.primaryImageUpload.querySelector('.upload-placeholder').style.display = 'none';
    }

    // Populate additional images
    if (imageData.additionalImages?.length) {
        imageData.additionalImages.forEach((img, i) => {
            if (img && i < 3) {
                state.additionalImages[i] = img;
                const slot = i + 1;
                const preview = document.getElementById(`additionalPreview${slot}`);
                const removeBtn = document.getElementById(`removeAdditional${slot}`);
                const upload = document.getElementById(`additionalUpload${slot}`);
                preview.src = img;
                preview.style.display = 'block';
                removeBtn.style.display = 'flex';
                upload.querySelector('.upload-placeholder').style.display = 'none';
            }
        });
    }

    // Open modal
    elements.productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    // Abort any pending image load requests
    state.imageLoadControllers.forEach(c => c.abort());
    state.imageLoadControllers = [];

    elements.productModal.classList.remove('open');
    document.body.style.overflow = '';
    resetModalState();
}

function resetModalState() {
    // Abort any pending image load requests to prevent memory leaks
    if (state.imageLoadControllers) {
        state.imageLoadControllers.forEach(c => c.abort());
        state.imageLoadControllers = [];
    }

    state.primaryImage = null;
    state.additionalImages = [null, null, null];
    state.features = [];
    state.benefits = [];
    state.isAnalyzing = false;
    state.isSaving = false;

    elements.productForm.reset();
    elements.featuresList.innerHTML = '';
    elements.benefitsList.innerHTML = '';

    // Reset image previews
    elements.primaryPreview.style.display = 'none';
    elements.primaryPreview.src = '';
    elements.removePrimary.style.display = 'none';
    elements.primaryImageUpload.querySelector('.upload-placeholder').style.display = 'flex';

    for (let i = 1; i <= 3; i++) {
        const preview = document.getElementById(`additionalPreview${i}`);
        const removeBtn = document.getElementById(`removeAdditional${i}`);
        const upload = document.getElementById(`additionalUpload${i}`);
        preview.style.display = 'none';
        preview.src = '';
        removeBtn.style.display = 'none';
        upload.querySelector('.upload-placeholder').style.display = 'flex';
    }

    // Reset collapsible sections - expand them
    if (elements.featuresHeader) {
        elements.featuresHeader.classList.remove('collapsed');
        elements.featuresContent.classList.remove('collapsed');
    }
    if (elements.benefitsHeader) {
        elements.benefitsHeader.classList.remove('collapsed');
        elements.benefitsContent.classList.remove('collapsed');
    }

    // Reset counts
    updateSectionCounts();
}

async function populateModalWithProduct(product) {
    elements.productName.value = product.name || '';
    elements.productCategory.value = product.category || '';
    elements.productSku.value = product.sku || '';
    elements.productDescription.value = product.description || '';
    elements.productTags.value = (product.tags || []).join(', ');

    state.features = product.features || [];
    state.benefits = product.benefits || [];
    renderFeatures();
    renderBenefits();

    // Load images
    if (product.primary_image_path) {
        await loadImagePreview(product.primary_image_path, 'primary');
    }
    if (product.image_paths?.length) {
        for (let i = 0; i < Math.min(product.image_paths.length, 3); i++) {
            await loadImagePreview(product.image_paths[i], i + 1);
        }
    }
}

async function loadImagePreview(path, slot) {
    // Create AbortController to allow cancellation
    const controller = new AbortController();
    state.imageLoadControllers.push(controller);

    try {
        const url = ngSupabase.getProductImageUrl(path);
        if (slot === 'primary') {
            elements.primaryPreview.src = url;
            elements.primaryPreview.style.display = 'block';
            elements.removePrimary.style.display = 'flex';
            elements.primaryImageUpload.querySelector('.upload-placeholder').style.display = 'none';
            // Fetch and convert to base64 for saving
            const response = await fetch(url, { signal: controller.signal });
            const blob = await response.blob();
            state.primaryImage = await blobToDataUrl(blob);
        } else {
            const preview = document.getElementById(`additionalPreview${slot}`);
            const removeBtn = document.getElementById(`removeAdditional${slot}`);
            const upload = document.getElementById(`additionalUpload${slot}`);
            preview.src = url;
            preview.style.display = 'block';
            removeBtn.style.display = 'flex';
            upload.querySelector('.upload-placeholder').style.display = 'none';
            // Fetch and convert to base64
            const response = await fetch(url, { signal: controller.signal });
            const blob = await response.blob();
            state.additionalImages[slot - 1] = await blobToDataUrl(blob);
        }
    } catch (e) {
        // Ignore abort errors, log others
        if (e.name !== 'AbortError') {
            console.warn('Failed to load image preview:', e);
        }
    }
}

function editProduct(productId) {
    openModal(productId);
}

function openDeleteModal() {
    elements.deleteModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    elements.deleteModal.classList.remove('open');
    document.body.style.overflow = '';
    state.deleteProductId = null;
}

// ============================================
// 8. IMAGE HANDLING
// ============================================
function handleImageUpload(file, slot) {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target.result;
        const compressed = await compressImage(dataUrl);

        if (slot === 'primary') {
            state.primaryImage = compressed;
            elements.primaryPreview.src = compressed;
            elements.primaryPreview.style.display = 'block';
            elements.removePrimary.style.display = 'flex';
            elements.primaryImageUpload.querySelector('.upload-placeholder').style.display = 'none';
        } else {
            state.additionalImages[slot - 1] = compressed;
            const preview = document.getElementById(`additionalPreview${slot}`);
            const removeBtn = document.getElementById(`removeAdditional${slot}`);
            const upload = document.getElementById(`additionalUpload${slot}`);
            preview.src = compressed;
            preview.style.display = 'block';
            removeBtn.style.display = 'flex';
            upload.querySelector('.upload-placeholder').style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

function handleMultipleImageUpload(files) {
    // Get available slots (primary first, then additional 1, 2, 3)
    const availableSlots = [];
    if (!state.primaryImage) availableSlots.push('primary');
    for (let i = 0; i < 3; i++) {
        if (!state.additionalImages[i]) availableSlots.push(i + 1);
    }

    // Upload files to available slots (up to 4 files)
    const filesToUpload = files.slice(0, Math.min(4, availableSlots.length));
    filesToUpload.forEach((file, index) => {
        if (availableSlots[index] !== undefined) {
            handleImageUpload(file, availableSlots[index]);
        }
    });

    // Show toast if some files were skipped
    if (files.length > filesToUpload.length) {
        showToast(`Uploaded ${filesToUpload.length} of ${files.length} images (slots full)`, 'info');
    }
}

function removeImage(slot) {
    if (slot === 'primary') {
        state.primaryImage = null;
        elements.primaryPreview.style.display = 'none';
        elements.primaryPreview.src = '';
        elements.removePrimary.style.display = 'none';
        elements.primaryImageUpload.querySelector('.upload-placeholder').style.display = 'flex';
        elements.primaryInput.value = '';
    } else {
        state.additionalImages[slot - 1] = null;
        const preview = document.getElementById(`additionalPreview${slot}`);
        const removeBtn = document.getElementById(`removeAdditional${slot}`);
        const upload = document.getElementById(`additionalUpload${slot}`);
        const input = document.getElementById(`additionalInput${slot}`);
        preview.style.display = 'none';
        preview.src = '';
        removeBtn.style.display = 'none';
        upload.querySelector('.upload-placeholder').style.display = 'flex';
        input.value = '';
    }
}

// ============================================
// 9. EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Sign in button
    elements.signInBtn?.addEventListener('click', () => {
        if (typeof AuthGate !== 'undefined') {
            AuthGate.showLoginModal();
        }
    });

    // Add product buttons
    elements.addProductBtn.addEventListener('click', () => openModal());
    elements.emptyAddBtn.addEventListener('click', () => openModal());

    // Category navigation is now handled by renderCategorySidebar()

    // Category dropdown "Add new" handler
    elements.productCategory?.addEventListener('change', handleCategoryDropdownChange);

    // Category modal
    elements.categoryModalClose?.addEventListener('click', closeCategoryModal);
    elements.cancelCategoryBtn?.addEventListener('click', closeCategoryModal);
    elements.saveCategoryBtn?.addEventListener('click', saveNewCategory);
    elements.categoryModal?.addEventListener('click', (e) => {
        if (e.target === elements.categoryModal) closeCategoryModal();
    });
    elements.categoryNameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveNewCategory();
        }
    });

    // Search
    let searchTimeout;
    elements.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            state.searchQuery = e.target.value.trim();
            applyFilters();
            renderProducts();
        }, 300);
    });

    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        applyFilters();
        renderProducts();
    });

    // Modal
    elements.modalClose.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) closeModal();
    });

    // Save
    elements.saveProductBtn.addEventListener('click', saveProduct);
    elements.productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });

    // Analyze
    elements.analyzeBtn.addEventListener('click', analyzeProduct);

    // Collapsible sections
    elements.featuresHeader?.addEventListener('click', () => {
        toggleCollapsible(elements.featuresHeader, elements.featuresContent);
    });

    elements.benefitsHeader?.addEventListener('click', () => {
        toggleCollapsible(elements.benefitsHeader, elements.benefitsContent);
    });

    // Features & Benefits
    elements.addFeatureBtn.addEventListener('click', () => {
        // Expand the section if collapsed
        if (elements.featuresHeader?.classList.contains('collapsed')) {
            toggleCollapsible(elements.featuresHeader, elements.featuresContent);
        }
        state.features.push({ text: '', starred: false });
        renderFeatures();
        const inputs = elements.featuresList.querySelectorAll('input');
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    elements.addBenefitBtn.addEventListener('click', () => {
        // Expand the section if collapsed
        if (elements.benefitsHeader?.classList.contains('collapsed')) {
            toggleCollapsible(elements.benefitsHeader, elements.benefitsContent);
        }
        state.benefits.push('');
        renderBenefits();
        const inputs = elements.benefitsList.querySelectorAll('input');
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    // Image uploads
    setupImageUpload('primary');
    for (let i = 1; i <= 3; i++) {
        setupImageUpload(i);
    }

    // Delete modal
    elements.deleteModalClose.addEventListener('click', closeDeleteModal);
    elements.deleteCancelBtn.addEventListener('click', closeDeleteModal);
    elements.deleteConfirmBtn.addEventListener('click', deleteProduct);
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeDeleteModal();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.deleteModal.classList.contains('open')) {
                closeDeleteModal();
            } else if (elements.productModal.classList.contains('open')) {
                closeModal();
            }
        }
    });
}

function setupImageUpload(slot) {
    const isMain = slot === 'primary';
    const upload = isMain ? elements.primaryImageUpload : document.getElementById(`additionalUpload${slot}`);
    const input = isMain ? elements.primaryInput : document.getElementById(`additionalInput${slot}`);
    const removeBtn = isMain ? elements.removePrimary : document.getElementById(`removeAdditional${slot}`);

    upload.addEventListener('click', (e) => {
        if (e.target.closest('.remove-image-btn')) return;
        input.click();
    });

    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (isMain && files.length > 1) {
            // Multiple files selected on primary input - distribute to available slots
            handleMultipleImageUpload(files);
        } else if (files[0]) {
            handleImageUpload(files[0], slot);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage(slot);
    });

    // Drag and drop
    upload.addEventListener('dragover', (e) => {
        e.preventDefault();
        upload.classList.add('dragover');
    });

    upload.addEventListener('dragleave', () => {
        upload.classList.remove('dragover');
    });

    upload.addEventListener('drop', (e) => {
        e.preventDefault();
        upload.classList.remove('dragover');
        if (e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0], slot);
        }
    });
}

// ============================================
// 10. UTILITIES
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
        SharedUI.toast(message, type);
    } else {
        console.log(`[${type}] ${message}`);
    }
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

async function compressImage(dataUrl, maxWidth = 1200) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = dataUrl;
    });
}

async function createThumbnail(dataUrl, size = 200) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d');

            // Center crop
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
    });
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ============================================
// 11. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') init();
