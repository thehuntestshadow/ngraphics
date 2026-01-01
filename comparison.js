/**
 * Comparison Generator - Side-by-side and before/after images for product marketing
 * Creates various comparison layouts: Before/After, Product vs Product, Feature Tables, Size Lineups
 */

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ============================================
// APPLICATION STATE
// ============================================
const state = {
    comparisonType: 'before-after', // before-after, vs-competitor, feature-table, size-lineup, multi-product

    // Before/After images
    beforeImage: null,
    beforeThumbnail: null,
    afterImage: null,
    afterThumbnail: null,
    beforeLabel: 'Before',
    afterLabel: 'After',

    // Product vs Product
    productAImage: null,
    productAThumbnail: null,
    productAName: 'Our Product',
    productBImage: null,
    productBThumbnail: null,
    productBName: 'Competitor',
    compareFeatures: [], // { name, hasA, hasB }

    // Feature Table
    tableProductImage: null,
    tableProductThumbnail: null,
    featureValues: [], // { feature, value, highlight }

    // Size Lineup
    sizeProducts: [], // { image, thumbnail, label, slotIndex }

    // Multi-Product Grid
    multiProducts: [], // { image, thumbnail, label, slotIndex }

    // Layout & Style
    layout: 'split', // split, slider, grid, table
    visualStyle: 'clean',
    winnerBadge: '',
    showPrice: false,
    priceA: '',
    priceB: '',

    // Output settings
    aspectRatio: '16:9',
    variations: 1,
    useRandomSeed: true,
    seed: null,
    negativePrompt: '',

    // Results
    generatedImageUrl: null,
    generatedImages: [],
    lastSeed: null,
    lastPrompt: '',
    isGenerating: false,

    // Favorites
    selectedFavorite: null,
    selectedFavoriteImages: null
};

// History and Favorites instances
const imageStore = new ImageStore('comparison_images');
const history = new SharedHistory('comparison_generator_history', 20);
const favorites = new SharedFavorites('comparison_generator_favorites', 30);

// ============================================
// PROMPT DESCRIPTIONS
// ============================================
const layoutDescriptions = {
    'split': 'Create a clean 50/50 vertical split composition. Left and right sides clearly separated by a thin vertical divider line.',
    'slider': 'Create an interactive slider-style comparison. Show a vertical divider with handle/circle in the middle that appears to reveal each side.',
    'grid': 'Arrange products in a clean grid layout with equal spacing. Each product clearly labeled.',
    'table': 'Create a comparison table format with features as rows and products as columns. Include checkmarks for features.'
};

const styleDescriptions = {
    'clean': 'Clean, minimal aesthetic with white or light background. Simple, professional look.',
    'bold': 'Bold, high contrast design with strong colors and dramatic composition.',
    'professional': 'Corporate professional style suitable for business presentations.',
    'playful': 'Casual, fun design with rounded elements and friendly colors.',
    'luxury': 'Premium, luxurious aesthetic with elegant typography and refined details.'
};

const comparisonTypeDescriptions = {
    'before-after': 'Before and after transformation comparison',
    'vs-competitor': 'Product versus competitor comparison with feature checkmarks',
    'feature-table': 'Feature comparison table with values',
    'size-lineup': 'Size variant lineup showing small to large',
    'multi-product': 'Multi-product comparison grid'
};

// ============================================
// DOM ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Form
        form: document.getElementById('comparisonForm'),

        // Comparison Type
        comparisonTypeTabs: document.getElementById('comparisonTypeTabs'),

        // Sections
        beforeAfterSection: document.getElementById('beforeAfterSection'),
        vsCompetitorSection: document.getElementById('vsCompetitorSection'),
        featureTableSection: document.getElementById('featureTableSection'),
        sizeLineupSection: document.getElementById('sizeLineupSection'),
        multiProductSection: document.getElementById('multiProductSection'),

        // Before/After
        beforeUploadArea: document.getElementById('beforeUploadArea'),
        beforeFileInput: document.getElementById('beforeFileInput'),
        beforePreview: document.getElementById('beforePreview'),
        beforeRemoveBtn: document.getElementById('beforeRemoveBtn'),
        afterUploadArea: document.getElementById('afterUploadArea'),
        afterFileInput: document.getElementById('afterFileInput'),
        afterPreview: document.getElementById('afterPreview'),
        afterRemoveBtn: document.getElementById('afterRemoveBtn'),
        beforeLabel: document.getElementById('beforeLabel'),
        afterLabel: document.getElementById('afterLabel'),

        // Product vs Product
        productAUploadArea: document.getElementById('productAUploadArea'),
        productAFileInput: document.getElementById('productAFileInput'),
        productAPreview: document.getElementById('productAPreview'),
        productARemoveBtn: document.getElementById('productARemoveBtn'),
        productAName: document.getElementById('productAName'),
        productBUploadArea: document.getElementById('productBUploadArea'),
        productBFileInput: document.getElementById('productBFileInput'),
        productBPreview: document.getElementById('productBPreview'),
        productBRemoveBtn: document.getElementById('productBRemoveBtn'),
        productBName: document.getElementById('productBName'),
        featureCompareList: document.getElementById('featureCompareList'),
        addCompareFeatureBtn: document.getElementById('addCompareFeatureBtn'),

        // Feature Table
        tableProductUploadArea: document.getElementById('tableProductUploadArea'),
        tableProductFileInput: document.getElementById('tableProductFileInput'),
        tableProductPreview: document.getElementById('tableProductPreview'),
        tableProductRemoveBtn: document.getElementById('tableProductRemoveBtn'),
        featureValueList: document.getElementById('featureValueList'),
        addFeatureValueBtn: document.getElementById('addFeatureValueBtn'),

        // Size Lineup
        sizeUploadGrid: document.getElementById('sizeUploadGrid'),
        sizeProductCount: document.getElementById('sizeProductCount'),

        // Multi-Product
        multiProductGrid: document.getElementById('multiProductGrid'),
        multiProductCount: document.getElementById('multiProductCount'),

        // Layout
        layoutOptions: document.getElementById('layoutOptions'),

        // Style
        visualStyleSelect: document.getElementById('visualStyleSelect'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedContent: document.getElementById('advancedContent'),
        winnerBadgeInput: document.getElementById('winnerBadgeInput'),
        priceInputs: document.getElementById('priceInputs'),
        priceAInput: document.getElementById('priceAInput'),
        priceBInput: document.getElementById('priceBInput'),
        aspectRatioSelect: document.getElementById('aspectRatioSelect'),
        randomSeedCheck: document.getElementById('randomSeedCheck'),
        seedInput: document.getElementById('seedInput'),
        negativePromptInput: document.getElementById('negativePromptInput'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),
        generateHelper: document.getElementById('generateHelper'),
        loadingStatus: document.getElementById('loadingStatus'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Result
        resultContainer: document.getElementById('resultContainer'),
        resultImageContainer: document.getElementById('resultImageContainer'),
        resultImage: document.getElementById('resultImage'),
        resultVariants: document.getElementById('resultVariants'),
        resultActions: document.getElementById('resultActions'),
        resultInfo: document.getElementById('resultInfo'),
        seedValue: document.getElementById('seedValue'),
        copySeedBtn: document.getElementById('copySeedBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),

        // Feedback
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),

        // Favorites
        favoritesGrid: document.getElementById('favoritesGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
        favoritesEmpty: document.getElementById('favoritesEmpty'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
        favoritesModal: document.getElementById('favoritesModal'),
        favoritesModalClose: document.getElementById('favoritesModalClose'),
        favoritePreviewImage: document.getElementById('favoritePreviewImage'),
        favoriteVariants: document.getElementById('favoriteVariants'),
        favoriteNameInput: document.getElementById('favoriteNameInput'),
        favoriteSeedValue: document.getElementById('favoriteSeedValue'),
        loadFavoriteBtn: document.getElementById('loadFavoriteBtn'),
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage')
    };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showError(message) {
    SharedUI.showError(elements.errorMessage, message);
}

function showSuccess(message) {
    SharedUI.showSuccess(elements.successMessage, message);
}

function updateLoadingStatus(message) {
    if (elements.loadingStatus) {
        elements.loadingStatus.textContent = message;
    }
}

function updateGenerateButton() {
    const canGenerate = hasRequiredImages() && !state.isGenerating;

    elements.generateBtn.disabled = !canGenerate;

    if (!hasRequiredImages()) {
        elements.generateHelper.textContent = getImageRequirementText();
    } else {
        elements.generateHelper.textContent = 'Ready to generate';
    }
    elements.generateHelper.style.display = canGenerate ? 'none' : 'block';
}

function hasRequiredImages() {
    switch (state.comparisonType) {
        case 'before-after':
            return state.beforeImage && state.afterImage;
        case 'vs-competitor':
            return state.productAImage && state.productBImage;
        case 'feature-table':
            return state.tableProductImage && state.featureValues.length > 0;
        case 'size-lineup':
            return state.sizeProducts.length >= 2;
        case 'multi-product':
            return state.multiProducts.length >= 2;
        default:
            return false;
    }
}

function getImageRequirementText() {
    switch (state.comparisonType) {
        case 'before-after':
            if (!state.beforeImage && !state.afterImage) return 'Upload before and after images';
            if (!state.beforeImage) return 'Upload before image';
            return 'Upload after image';
        case 'vs-competitor':
            if (!state.productAImage && !state.productBImage) return 'Upload both product images';
            if (!state.productAImage) return 'Upload Product A image';
            return 'Upload Product B image';
        case 'feature-table':
            if (!state.tableProductImage) return 'Upload product image';
            return 'Add at least one feature';
        case 'size-lineup':
            return `Add ${Math.max(0, 2 - state.sizeProducts.length)} more size variant(s)`;
        case 'multi-product':
            return `Add ${Math.max(0, 2 - state.multiProducts.length)} more product(s)`;
        default:
            return 'Upload images to generate';
    }
}

async function createThumbnail(base64, maxSize) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = base64;
    });
}

// ============================================
// COMPARISON TYPE SWITCHING
// ============================================
function switchComparisonType(type) {
    state.comparisonType = type;

    // Update tabs
    elements.comparisonTypeTabs.querySelectorAll('.comparison-type-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Hide all sections
    elements.beforeAfterSection.classList.add('hidden');
    elements.vsCompetitorSection.classList.add('hidden');
    elements.featureTableSection.classList.add('hidden');
    elements.sizeLineupSection.classList.add('hidden');
    elements.multiProductSection.classList.add('hidden');

    // Show relevant section
    switch (type) {
        case 'before-after':
            elements.beforeAfterSection.classList.remove('hidden');
            break;
        case 'vs-competitor':
            elements.vsCompetitorSection.classList.remove('hidden');
            break;
        case 'feature-table':
            elements.featureTableSection.classList.remove('hidden');
            break;
        case 'size-lineup':
            elements.sizeLineupSection.classList.remove('hidden');
            break;
        case 'multi-product':
            elements.multiProductSection.classList.remove('hidden');
            break;
    }

    // Update layout options based on type
    updateLayoutOptions(type);
    updateGenerateButton();
}

function updateLayoutOptions(type) {
    const layoutBtns = elements.layoutOptions.querySelectorAll('.layout-option');

    layoutBtns.forEach(btn => {
        const layout = btn.dataset.layout;
        let isVisible = true;

        // Hide irrelevant layouts based on type
        if (type === 'before-after') {
            isVisible = ['split', 'slider'].includes(layout);
        } else if (type === 'vs-competitor') {
            isVisible = ['split', 'table'].includes(layout);
        } else if (type === 'feature-table') {
            isVisible = ['table', 'grid'].includes(layout);
        } else if (type === 'size-lineup') {
            isVisible = ['grid', 'split'].includes(layout);
        } else if (type === 'multi-product') {
            isVisible = ['grid', 'split'].includes(layout);
        }

        btn.style.display = isVisible ? '' : 'none';

        // Select first visible if current selection is hidden
        if (!isVisible && btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            const firstVisible = elements.layoutOptions.querySelector('.layout-option:not([style*="display: none"])');
            if (firstVisible) {
                firstVisible.classList.add('selected');
                state.layout = firstVisible.dataset.layout;
            }
        }
    });
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
function setupUploadZone(uploadArea, fileInput, previewImg, removeBtn, onLoad) {
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target === removeBtn || removeBtn.contains(e.target)) return;
        if (uploadArea.classList.contains('has-image')) return;
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageFile(e.target.files[0], uploadArea, previewImg, onLoad);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0], uploadArea, previewImg, onLoad);
        }
    });

    // Remove button
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadArea.classList.remove('has-image');
        previewImg.src = '';
        fileInput.value = '';
        onLoad(null, null);
    });
}

async function handleImageFile(file, uploadArea, previewImg, onLoad) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageBase64 = e.target.result;
        const thumbnail = await createThumbnail(imageBase64, 200);

        previewImg.src = thumbnail;
        uploadArea.classList.add('has-image');

        onLoad(imageBase64, thumbnail);
        updateGenerateButton();
    };
    reader.readAsDataURL(file);
}

// ============================================
// FEATURE COMPARE LIST (vs-competitor)
// ============================================
function addCompareFeature(name = '', hasA = true, hasB = false) {
    const id = Date.now();
    const feature = { id, name, hasA, hasB };
    state.compareFeatures.push(feature);
    renderCompareFeatures();
    return feature;
}

function removeCompareFeature(id) {
    state.compareFeatures = state.compareFeatures.filter(f => f.id !== id);
    renderCompareFeatures();
}

function renderCompareFeatures() {
    elements.featureCompareList.innerHTML = state.compareFeatures.map(f => `
        <div class="feature-compare-row" data-id="${f.id}">
            <input type="text" class="input-field feature-name-input" value="${f.name}" placeholder="Feature name">
            <button type="button" class="feature-check-btn ${f.hasA ? 'checked' : ''}" data-side="a" title="Product A has this">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>
            <button type="button" class="feature-check-btn ${f.hasB ? 'checked' : ''}" data-side="b" title="Product B has this">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </button>
            <button type="button" class="btn-remove-feature" title="Remove feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');

    // Add event listeners
    elements.featureCompareList.querySelectorAll('.feature-compare-row').forEach(row => {
        const id = parseInt(row.dataset.id, 10);
        const feature = state.compareFeatures.find(f => f.id === id);

        row.querySelector('.feature-name-input').addEventListener('input', (e) => {
            feature.name = e.target.value;
        });

        row.querySelectorAll('.feature-check-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const side = btn.dataset.side;
                if (side === 'a') {
                    feature.hasA = !feature.hasA;
                } else {
                    feature.hasB = !feature.hasB;
                }
                btn.classList.toggle('checked');
            });
        });

        row.querySelector('.btn-remove-feature').addEventListener('click', () => {
            removeCompareFeature(id);
        });
    });
}

// ============================================
// FEATURE VALUE LIST (feature-table)
// ============================================
function addFeatureValue(feature = '', value = '', highlight = false) {
    const id = Date.now();
    const item = { id, feature, value, highlight };
    state.featureValues.push(item);
    renderFeatureValues();
    updateGenerateButton();
    return item;
}

function removeFeatureValue(id) {
    state.featureValues = state.featureValues.filter(f => f.id !== id);
    renderFeatureValues();
    updateGenerateButton();
}

function renderFeatureValues() {
    elements.featureValueList.innerHTML = state.featureValues.map(f => `
        <div class="feature-value-row" data-id="${f.id}">
            <input type="text" class="input-field feature-input" value="${f.feature}" placeholder="Feature">
            <input type="text" class="input-field value-input" value="${f.value}" placeholder="Value">
            <button type="button" class="highlight-btn ${f.highlight ? 'active' : ''}" title="Highlight as winner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            </button>
            <button type="button" class="btn-remove-feature" title="Remove">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');

    // Add event listeners
    elements.featureValueList.querySelectorAll('.feature-value-row').forEach(row => {
        const id = parseInt(row.dataset.id, 10);
        const item = state.featureValues.find(f => f.id === id);

        row.querySelector('.feature-input').addEventListener('input', (e) => {
            item.feature = e.target.value;
        });

        row.querySelector('.value-input').addEventListener('input', (e) => {
            item.value = e.target.value;
        });

        row.querySelector('.highlight-btn').addEventListener('click', (e) => {
            item.highlight = !item.highlight;
            e.currentTarget.classList.toggle('active');
        });

        row.querySelector('.btn-remove-feature').addEventListener('click', () => {
            removeFeatureValue(id);
        });
    });
}

// ============================================
// SIZE LINEUP HANDLING
// ============================================
function setupSizeSlots() {
    const slots = elements.sizeUploadGrid.querySelectorAll('.size-slot');

    slots.forEach((slot, index) => {
        const fileInput = slot.querySelector('.size-file-input');
        const img = slot.querySelector('.size-slot-image');
        const labelInput = slot.querySelector('.size-label-input');
        const removeBtn = slot.querySelector('.btn-remove-size');

        // Click to upload
        slot.addEventListener('click', (e) => {
            if (e.target === removeBtn || removeBtn.contains(e.target)) return;
            if (e.target === labelInput) return;
            if (slot.classList.contains('filled')) return;
            fileInput.click();
        });

        // File change
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                await handleSizeSlotFile(e.target.files[0], slot, index);
            }
        });

        // Label change
        labelInput.addEventListener('input', (e) => {
            const product = state.sizeProducts.find(p => p.slotIndex === index);
            if (product) {
                product.label = e.target.value;
            }
        });

        // Remove
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeSizeProduct(index);
        });
    });
}

async function handleSizeSlotFile(file, slot, slotIndex) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageBase64 = e.target.result;
        const thumbnail = await createThumbnail(imageBase64, 200);

        const labelInput = slot.querySelector('.size-label-input');
        const img = slot.querySelector('.size-slot-image');

        const product = {
            slotIndex,
            image: imageBase64,
            thumbnail,
            label: labelInput.value || ['S', 'M', 'L', 'XL'][slotIndex]
        };

        // Remove existing at this slot
        state.sizeProducts = state.sizeProducts.filter(p => p.slotIndex !== slotIndex);
        state.sizeProducts.push(product);

        img.src = thumbnail;
        slot.classList.add('filled');

        updateSizeProductCount();
        updateGenerateButton();
    };
    reader.readAsDataURL(file);
}

function removeSizeProduct(slotIndex) {
    state.sizeProducts = state.sizeProducts.filter(p => p.slotIndex !== slotIndex);

    const slot = elements.sizeUploadGrid.querySelector(`[data-slot="${slotIndex}"]`);
    if (slot) {
        slot.classList.remove('filled');
        slot.querySelector('.size-slot-image').src = '';
        slot.querySelector('.size-file-input').value = '';
    }

    updateSizeProductCount();
    updateGenerateButton();
}

function updateSizeProductCount() {
    elements.sizeProductCount.textContent = `${state.sizeProducts.length}/4`;
}

// ============================================
// MULTI-PRODUCT HANDLING
// ============================================
function setupMultiSlots() {
    const slots = elements.multiProductGrid.querySelectorAll('.multi-slot');

    slots.forEach((slot, index) => {
        const fileInput = slot.querySelector('.multi-file-input');
        const img = slot.querySelector('.multi-slot-image');
        const labelInput = slot.querySelector('.multi-label-input');
        const removeBtn = slot.querySelector('.btn-remove-multi');

        // Click to upload
        slot.addEventListener('click', (e) => {
            if (e.target === removeBtn || removeBtn.contains(e.target)) return;
            if (e.target === labelInput) return;
            if (slot.classList.contains('filled')) return;
            fileInput.click();
        });

        // File change
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                await handleMultiSlotFile(e.target.files[0], slot, index);
            }
        });

        // Label change
        labelInput.addEventListener('input', (e) => {
            const product = state.multiProducts.find(p => p.slotIndex === index);
            if (product) {
                product.label = e.target.value;
            }
        });

        // Remove
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeMultiProduct(index);
        });
    });
}

async function handleMultiSlotFile(file, slot, slotIndex) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageBase64 = e.target.result;
        const thumbnail = await createThumbnail(imageBase64, 200);

        const labelInput = slot.querySelector('.multi-label-input');
        const img = slot.querySelector('.multi-slot-image');

        const product = {
            slotIndex,
            image: imageBase64,
            thumbnail,
            label: labelInput.value || `Product ${slotIndex + 1}`
        };

        // Remove existing at this slot
        state.multiProducts = state.multiProducts.filter(p => p.slotIndex !== slotIndex);
        state.multiProducts.push(product);

        img.src = thumbnail;
        slot.classList.add('filled');

        updateMultiProductCount();
        updateGenerateButton();
    };
    reader.readAsDataURL(file);
}

function removeMultiProduct(slotIndex) {
    state.multiProducts = state.multiProducts.filter(p => p.slotIndex !== slotIndex);

    const slot = elements.multiProductGrid.querySelector(`[data-slot="${slotIndex}"]`);
    if (slot) {
        slot.classList.remove('filled');
        slot.querySelector('.multi-slot-image').src = '';
        slot.querySelector('.multi-file-input').value = '';
    }

    updateMultiProductCount();
    updateGenerateButton();
}

function updateMultiProductCount() {
    elements.multiProductCount.textContent = `${state.multiProducts.length}/4`;
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const typeDesc = comparisonTypeDescriptions[state.comparisonType];
    const layoutDesc = layoutDescriptions[state.layout];
    const styleDesc = styleDescriptions[state.visualStyle];

    let prompt = `Create a professional product comparison marketing image.

TYPE: ${typeDesc}

LAYOUT: ${layoutDesc}

VISUAL STYLE: ${styleDesc}

`;

    // Add type-specific details
    switch (state.comparisonType) {
        case 'before-after':
            prompt += `COMPARISON DETAILS:
- Left side labeled "${state.beforeLabel}"
- Right side labeled "${state.afterLabel}"
- Show clear visual distinction between the two states
- Include elegant labels with the text provided
- The divider should be clean and professional

`;
            break;

        case 'vs-competitor':
            prompt += `COMPARISON DETAILS:
- Left product: "${state.productAName}"
- Right product: "${state.productBName}"
`;
            if (state.compareFeatures.length > 0) {
                prompt += `- Feature comparison with checkmarks:\n`;
                state.compareFeatures.forEach(f => {
                    if (f.name) {
                        const aSymbol = f.hasA ? '[check]' : '[x]';
                        const bSymbol = f.hasB ? '[check]' : '[x]';
                        prompt += `  - ${f.name}: ${state.productAName} ${aSymbol}, ${state.productBName} ${bSymbol}\n`;
                    }
                });
            }
            prompt += '\n';
            break;

        case 'feature-table':
            prompt += `FEATURE TABLE:
- Display the product with a comparison table/chart
- Features to highlight:\n`;
            state.featureValues.forEach(f => {
                if (f.feature && f.value) {
                    const highlight = f.highlight ? ' (HIGHLIGHT as winning feature)' : '';
                    prompt += `  - ${f.feature}: ${f.value}${highlight}\n`;
                }
            });
            prompt += '\n';
            break;

        case 'size-lineup':
            prompt += `SIZE LINEUP:
- Show products in size order from smallest to largest
- Maintain consistent scaling to show relative sizes
- Labels for each size:\n`;
            state.sizeProducts.sort((a, b) => a.slotIndex - b.slotIndex);
            state.sizeProducts.forEach(p => {
                prompt += `  - ${p.label}\n`;
            });
            prompt += '\n';
            break;

        case 'multi-product':
            prompt += `MULTI-PRODUCT COMPARISON:
- Arrange products in a clean grid
- Products:\n`;
            state.multiProducts.forEach(p => {
                prompt += `  - ${p.label}\n`;
            });
            prompt += '\n';
            break;
    }

    // Add badges and pricing
    if (state.winnerBadge) {
        prompt += `BADGE: Include a "${state.winnerBadge}" badge/ribbon on the winning/highlighted product.\n\n`;
    }

    if (state.showPrice && state.priceA) {
        prompt += `PRICING: Display prices - ${state.priceA}`;
        if (state.priceB) {
            prompt += ` vs ${state.priceB}`;
        }
        prompt += '\n\n';
    }

    // Technical specs
    prompt += `ASPECT RATIO: ${state.aspectRatio}

CRITICAL REQUIREMENTS:
- Products must appear EXACTLY as shown in reference images
- Keep all labels and text clean and readable
- Professional product photography quality
- Sharp focus and accurate colors
- Cohesive, polished marketing material`;

    // Negative prompt
    if (state.negativePrompt) {
        prompt += `\n\nAVOID: ${state.negativePrompt}`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

// ============================================
// GENERATION
// ============================================
async function generateComparison() {
    if (!hasRequiredImages()) {
        showError(getImageRequirementText());
        return;
    }

    state.isGenerating = true;
    updateGenerateButton();

    elements.generateBtn.classList.add('loading');
    elements.resultActions.style.display = 'none';
    elements.resultInfo.style.display = 'none';
    elements.favoriteBtn.classList.remove('active');
    updateLoadingStatus('Preparing prompt...');

    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    const model = DEFAULT_MODEL;

    // Build message content with images
    const messageContent = [
        { type: 'text', text: prompt }
    ];

    // Add images based on comparison type
    const images = getComparisonImages();
    images.forEach(img => {
        messageContent.push({
            type: 'image_url',
            image_url: { url: img }
        });
    });

    const requestBody = {
        model: model,
        messages: [{ role: 'user', content: messageContent }],
        modalities: ['image', 'text'],
        max_tokens: 4096
    };

    // Generate seed
    const baseSeed = state.useRandomSeed
        ? Math.floor(Math.random() * 999999999)
        : (parseInt(state.seed, 10) || Math.floor(Math.random() * 999999999));
    state.lastSeed = baseSeed;

    try {
        if (state.variations === 1) {
            requestBody.seed = baseSeed;
            updateLoadingStatus('Generating comparison...');
            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
        } else {
            updateLoadingStatus(`Generating ${state.variations} variations...`);
            const requests = [];
            for (let i = 0; i < state.variations; i++) {
                const varRequestBody = { ...requestBody, seed: baseSeed + i };
                requests.push(
                    makeGenerationRequest(varRequestBody).catch(err => {
                        console.error(`Variation ${i + 1} failed:`, err);
                        return null;
                    })
                );
            }

            const results = await Promise.all(requests);
            const successfulImages = results.filter(url => url !== null);

            if (successfulImages.length === 0) {
                throw new Error('All variations failed to generate');
            }

            showMultipleResults(successfulImages);
        }

        showSuccess('Comparison generated!');

    } catch (error) {
        console.error('Generation error:', error);
        const errorMessage = error instanceof APIError
            ? error.toUserMessage()
            : error.message || 'An unexpected error occurred';
        showError(errorMessage);
    } finally {
        state.isGenerating = false;
        elements.generateBtn.classList.remove('loading');
        updateGenerateButton();
        updateLoadingStatus('Generating...');
    }
}

function getComparisonImages() {
    switch (state.comparisonType) {
        case 'before-after':
            return [state.beforeImage, state.afterImage].filter(Boolean);
        case 'vs-competitor':
            return [state.productAImage, state.productBImage].filter(Boolean);
        case 'feature-table':
            return state.tableProductImage ? [state.tableProductImage] : [];
        case 'size-lineup':
            return state.sizeProducts.map(p => p.image);
        case 'multi-product':
            return state.multiProducts.map(p => p.image);
        default:
            return [];
    }
}

async function generateWithAdjustment() {
    const feedback = elements.feedbackTextarea.value.trim();
    if (!feedback) {
        showError('Please enter adjustment instructions');
        return;
    }

    if (!state.generatedImageUrl) {
        showError('Generate an image first before adjusting');
        return;
    }

    state.isGenerating = true;
    updateGenerateButton();

    elements.generateBtn.classList.add('loading');
    elements.resultActions.style.display = 'none';
    elements.resultInfo.style.display = 'none';
    elements.favoriteBtn.classList.remove('active');
    updateLoadingStatus('Applying adjustments...');

    const model = DEFAULT_MODEL;

    const adjustmentPrompt = `Here is an image I generated previously, along with the original generation prompt. Please regenerate this image with the following adjustments:

ADJUSTMENT REQUEST: ${feedback}

ORIGINAL PROMPT: ${state.lastPrompt}

Keep the same overall composition and style, but apply the requested adjustments. Generate a new comparison marketing image.`;

    const messageContent = [
        { type: 'text', text: adjustmentPrompt },
        { type: 'image_url', image_url: { url: state.generatedImageUrl } }
    ];

    // Add original product images
    const images = getComparisonImages();
    images.forEach(img => {
        messageContent.push({
            type: 'image_url',
            image_url: { url: img }
        });
    });

    const requestBody = {
        model: model,
        messages: [{ role: 'user', content: messageContent }],
        modalities: ['image', 'text'],
        max_tokens: 4096,
        seed: state.lastSeed
    };

    try {
        updateLoadingStatus('Regenerating with adjustments...');
        const imageUrl = await makeGenerationRequest(requestBody);
        showResult(imageUrl);
        showSuccess('Image adjusted successfully!');
        elements.feedbackTextarea.value = '';
    } catch (error) {
        console.error('Adjustment error:', error);
        const errorMessage = error instanceof APIError
            ? error.toUserMessage()
            : error.message || 'An unexpected error occurred';
        showError(errorMessage);
    } finally {
        state.isGenerating = false;
        elements.generateBtn.classList.remove('loading');
        updateGenerateButton();
        updateLoadingStatus('Generating...');
    }
}

async function makeGenerationRequest(requestBody) {
    const result = await api.request('/chat/completions', requestBody, {
        title: 'Comparison Generator'
    });

    if (!result.image) {
        throw new Error('No image in response');
    }

    return result.image;
}

function showResult(imageUrl) {
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];

    elements.resultImage.src = imageUrl;
    elements.resultImageContainer.style.display = 'block';
    elements.resultVariants.style.display = 'none';
    elements.resultActions.style.display = 'flex';
    elements.resultInfo.style.display = 'flex';
    elements.seedValue.textContent = state.lastSeed;

    // Hide placeholder
    const placeholder = elements.resultContainer.querySelector('.output-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    addToHistory(imageUrl);
}

function showMultipleResults(imageUrls) {
    state.generatedImageUrl = imageUrls[0];
    state.generatedImages = imageUrls;

    elements.resultImage.src = imageUrls[0];
    elements.resultImageContainer.style.display = 'block';
    elements.resultVariants.style.display = 'grid';
    elements.resultActions.style.display = 'flex';
    elements.resultInfo.style.display = 'flex';
    elements.seedValue.textContent = state.lastSeed;

    // Render variant thumbnails
    elements.resultVariants.innerHTML = imageUrls.map((url, idx) => `
        <div class="result-variant${idx === 0 ? ' active' : ''}" data-index="${idx}">
            <img src="${url}" alt="Variation ${idx + 1}">
        </div>
    `).join('');

    // Add click handlers
    elements.resultVariants.querySelectorAll('.result-variant').forEach(variant => {
        variant.addEventListener('click', () => {
            const idx = parseInt(variant.dataset.index, 10);
            elements.resultImage.src = imageUrls[idx];
            state.generatedImageUrl = imageUrls[idx];
            elements.resultVariants.querySelectorAll('.result-variant').forEach(v => v.classList.remove('active'));
            variant.classList.add('active');
        });
    });

    // Hide placeholder
    const placeholder = elements.resultContainer.querySelector('.output-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Add all to history
    imageUrls.forEach(url => addToHistory(url));
}

// ============================================
// HISTORY
// ============================================
async function addToHistory(imageUrl) {
    await history.add(imageUrl, {
        seed: state.lastSeed,
        comparisonType: state.comparisonType,
        layout: state.layout,
        imageUrls: [imageUrl]
    });
    renderHistory();
}

function renderHistory() {
    const count = history.count;
    elements.historyCount.textContent = count;

    if (count === 0) {
        elements.historyGrid.style.display = 'none';
        elements.historyEmpty.style.display = 'flex';
        return;
    }

    elements.historyGrid.style.display = 'grid';
    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = history.getAll().map(item => {
        const imgSrc = item.thumbnail || item.imageUrl;
        return `
            <div class="history-item" data-id="${item.id}">
                <img src="${imgSrc}" alt="Generated comparison" loading="lazy">
            </div>
        `;
    }).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = parseInt(item.dataset.id, 10);
            const historyItem = history.findById(id);
            if (historyItem) {
                const images = await history.getImages(id);
                const fullImageUrl = images?.imageUrl || historyItem.thumbnail || historyItem.imageUrl;
                SharedLightbox.open(elements.lightbox, elements.lightboxImage, fullImageUrl);
            }
        });
    });
}

// ============================================
// FAVORITES
// ============================================
async function saveFavorite() {
    if (!state.generatedImageUrl) {
        showError('No image to save');
        return;
    }

    const settings = captureCurrentSettings();
    const name = `${state.comparisonType} comparison`;

    try {
        const favorite = await favorites.add({
            name,
            imageUrl: state.generatedImageUrl,
            imageUrls: state.generatedImages,
            seed: state.lastSeed,
            prompt: state.lastPrompt,
            settings
        });

        if (favorite) {
            elements.favoriteBtn.classList.add('active');
            const variantText = state.generatedImages.length > 1
                ? ` (${state.generatedImages.length} variants)`
                : '';
            showSuccess(`Saved to favorites!${variantText}`);
            renderFavorites();
        }
    } catch (error) {
        console.error('Failed to save favorite:', error);
        showError('Failed to save favorite');
    }
}

function captureCurrentSettings() {
    return {
        comparisonType: state.comparisonType,
        layout: state.layout,
        visualStyle: state.visualStyle,
        beforeLabel: state.beforeLabel,
        afterLabel: state.afterLabel,
        productAName: state.productAName,
        productBName: state.productBName,
        winnerBadge: state.winnerBadge,
        showPrice: state.showPrice,
        priceA: state.priceA,
        priceB: state.priceB,
        aspectRatio: state.aspectRatio,
        variations: state.variations,
        negativePrompt: state.negativePrompt,
        model: DEFAULT_MODEL
    };
}

function renderFavorites() {
    const items = favorites.getAll();
    elements.favoritesCount.textContent = items.length;

    if (items.length === 0) {
        elements.favoritesGrid.style.display = 'none';
        elements.favoritesEmpty.style.display = 'flex';
        return;
    }

    elements.favoritesGrid.style.display = 'grid';
    elements.favoritesEmpty.style.display = 'none';

    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.name}" loading="lazy">
            ${item.variantCount > 1 ? `<div class="favorite-item-variants">${item.variantCount}</div>` : ''}
            <div class="favorite-item-star">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
            <div class="favorite-item-overlay">
                <div class="favorite-item-name">${item.name}</div>
            </div>
        </div>
    `).join('');

    elements.favoritesGrid.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', () => {
            openFavoritesModal(parseInt(item.dataset.id, 10));
        });
    });
}

async function openFavoritesModal(id) {
    const item = favorites.findById(id);
    if (!item) return;

    state.selectedFavorite = item;
    elements.favoriteNameInput.value = item.name;
    elements.favoriteSeedValue.textContent = item.seed || 'N/A';

    elements.favoritePreviewImage.src = item.thumbnail || '';
    elements.favoriteVariants.style.display = 'none';
    elements.favoriteVariants.innerHTML = '';
    elements.favoritesModal.classList.add('visible');

    try {
        const images = await favorites.getImages(id);
        if (images) {
            const imageUrls = images.imageUrls || (images.imageUrl ? [images.imageUrl] : []);

            if (imageUrls.length > 0) {
                elements.favoritePreviewImage.src = imageUrls[0];
            }

            if (imageUrls.length > 1) {
                elements.favoriteVariants.style.display = 'grid';
                elements.favoriteVariants.innerHTML = imageUrls.map((url, idx) => `
                    <div class="favorite-variant${idx === 0 ? ' active' : ''}" data-index="${idx}">
                        <img src="${url}" alt="Variant ${idx + 1}">
                    </div>
                `).join('');

                elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        const idx = parseInt(thumb.dataset.index, 10);
                        elements.favoritePreviewImage.src = imageUrls[idx];
                        elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                });
            }

            state.selectedFavoriteImages = images;
        } else if (item.imageUrl) {
            elements.favoritePreviewImage.src = item.imageUrl;
            state.selectedFavoriteImages = { imageUrl: item.imageUrl };
        }
    } catch (error) {
        console.error('Failed to load favorite images:', error);
        if (item.imageUrl) {
            elements.favoritePreviewImage.src = item.imageUrl;
        }
    }
}

function closeFavoritesModal() {
    if (state.selectedFavorite && elements.favoriteNameInput.value !== state.selectedFavorite.name) {
        favorites.update(state.selectedFavorite.id, { name: elements.favoriteNameInput.value });
        renderFavorites();
    }

    elements.favoritesModal.classList.remove('visible');
    state.selectedFavorite = null;
    state.selectedFavoriteImages = null;
}

function loadFavorite() {
    if (!state.selectedFavorite) return;

    const settings = state.selectedFavorite.settings || {};

    // Restore settings
    if (settings.comparisonType) {
        switchComparisonType(settings.comparisonType);
    }
    if (settings.layout) {
        state.layout = settings.layout;
        elements.layoutOptions.querySelectorAll('.layout-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.layout === settings.layout);
        });
    }
    if (settings.visualStyle) {
        state.visualStyle = settings.visualStyle;
        elements.visualStyleSelect.value = settings.visualStyle;
    }
    if (settings.beforeLabel) {
        state.beforeLabel = settings.beforeLabel;
        elements.beforeLabel.value = settings.beforeLabel;
    }
    if (settings.afterLabel) {
        state.afterLabel = settings.afterLabel;
        elements.afterLabel.value = settings.afterLabel;
    }
    if (settings.productAName) {
        state.productAName = settings.productAName;
        elements.productAName.value = settings.productAName;
    }
    if (settings.productBName) {
        state.productBName = settings.productBName;
        elements.productBName.value = settings.productBName;
    }
    if (settings.winnerBadge) {
        state.winnerBadge = settings.winnerBadge;
        elements.winnerBadgeInput.value = settings.winnerBadge;
    }
    if (settings.aspectRatio) {
        state.aspectRatio = settings.aspectRatio;
        elements.aspectRatioSelect.value = settings.aspectRatio;
    }
    if (settings.variations) {
        state.variations = settings.variations;
        document.querySelectorAll('[data-variations]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.variations, 10) === settings.variations);
        });
    }
    if (settings.negativePrompt) {
        state.negativePrompt = settings.negativePrompt;
        elements.negativePromptInput.value = settings.negativePrompt;
    }

    // Restore seed
    if (state.selectedFavorite.seed) {
        state.useRandomSeed = false;
        state.seed = state.selectedFavorite.seed;
        elements.randomSeedCheck.checked = false;
        elements.seedInput.disabled = false;
        elements.seedInput.value = state.selectedFavorite.seed;
    }

    closeFavoritesModal();
    showSuccess('Settings loaded. Upload images and generate!');
}

async function deleteFavorite() {
    if (!state.selectedFavorite) return;

    await favorites.remove(state.selectedFavorite.id);
    renderFavorites();
    closeFavoritesModal();
    showSuccess('Removed from favorites');
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Form submit
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateComparison();
    });

    // Comparison type tabs
    elements.comparisonTypeTabs.querySelectorAll('.comparison-type-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchComparisonType(tab.dataset.type);
        });
    });

    // Before/After uploads
    setupUploadZone(
        elements.beforeUploadArea,
        elements.beforeFileInput,
        elements.beforePreview,
        elements.beforeRemoveBtn,
        (image, thumbnail) => {
            state.beforeImage = image;
            state.beforeThumbnail = thumbnail;
        }
    );

    setupUploadZone(
        elements.afterUploadArea,
        elements.afterFileInput,
        elements.afterPreview,
        elements.afterRemoveBtn,
        (image, thumbnail) => {
            state.afterImage = image;
            state.afterThumbnail = thumbnail;
        }
    );

    // Label inputs
    elements.beforeLabel.addEventListener('input', (e) => {
        state.beforeLabel = e.target.value;
    });

    elements.afterLabel.addEventListener('input', (e) => {
        state.afterLabel = e.target.value;
    });

    // Label presets
    document.querySelectorAll('.label-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.label-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.beforeLabel = btn.dataset.before;
            state.afterLabel = btn.dataset.after;
            elements.beforeLabel.value = btn.dataset.before;
            elements.afterLabel.value = btn.dataset.after;
        });
    });

    // Product vs Product uploads
    setupUploadZone(
        elements.productAUploadArea,
        elements.productAFileInput,
        elements.productAPreview,
        elements.productARemoveBtn,
        (image, thumbnail) => {
            state.productAImage = image;
            state.productAThumbnail = thumbnail;
        }
    );

    setupUploadZone(
        elements.productBUploadArea,
        elements.productBFileInput,
        elements.productBPreview,
        elements.productBRemoveBtn,
        (image, thumbnail) => {
            state.productBImage = image;
            state.productBThumbnail = thumbnail;
        }
    );

    elements.productAName.addEventListener('input', (e) => {
        state.productAName = e.target.value;
    });

    elements.productBName.addEventListener('input', (e) => {
        state.productBName = e.target.value;
    });

    elements.addCompareFeatureBtn.addEventListener('click', () => {
        addCompareFeature();
    });

    // Feature Table uploads
    setupUploadZone(
        elements.tableProductUploadArea,
        elements.tableProductFileInput,
        elements.tableProductPreview,
        elements.tableProductRemoveBtn,
        (image, thumbnail) => {
            state.tableProductImage = image;
            state.tableProductThumbnail = thumbnail;
        }
    );

    elements.addFeatureValueBtn.addEventListener('click', () => {
        addFeatureValue();
    });

    // Size Lineup and Multi-Product slots
    setupSizeSlots();
    setupMultiSlots();

    // Layout options
    elements.layoutOptions.querySelectorAll('.layout-option').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.layoutOptions.querySelectorAll('.layout-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.layout = btn.dataset.layout;
        });
    });

    // Visual style
    elements.visualStyleSelect.addEventListener('change', () => {
        state.visualStyle = elements.visualStyleSelect.value;
    });

    // Advanced toggle
    elements.advancedToggle.addEventListener('click', () => {
        const section = elements.advancedToggle.closest('.advanced-section');
        section.classList.toggle('open');
    });

    // Advanced options
    elements.winnerBadgeInput.addEventListener('input', () => {
        state.winnerBadge = elements.winnerBadgeInput.value;
    });

    // Show price toggle
    document.querySelectorAll('[data-show-price]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-show-price]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.showPrice = btn.dataset.showPrice === 'on';
            elements.priceInputs.classList.toggle('hidden', !state.showPrice);
        });
    });

    elements.priceAInput.addEventListener('input', () => {
        state.priceA = elements.priceAInput.value;
    });

    elements.priceBInput.addEventListener('input', () => {
        state.priceB = elements.priceBInput.value;
    });

    elements.aspectRatioSelect.addEventListener('change', () => {
        state.aspectRatio = elements.aspectRatioSelect.value;
    });

    // Variations
    document.querySelectorAll('[data-variations]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-variations]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.variations, 10);
        });
    });

    // Seed
    elements.randomSeedCheck.addEventListener('change', () => {
        state.useRandomSeed = elements.randomSeedCheck.checked;
        elements.seedInput.disabled = state.useRandomSeed;
        if (!state.useRandomSeed && elements.seedInput.value) {
            state.seed = elements.seedInput.value;
        }
    });

    elements.seedInput.addEventListener('input', () => {
        state.seed = elements.seedInput.value;
    });

    elements.negativePromptInput.addEventListener('input', () => {
        state.negativePrompt = elements.negativePromptInput.value;
    });

    // Result actions
    elements.favoriteBtn.addEventListener('click', saveFavorite);

    elements.downloadBtn.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            SharedDownload.downloadImage(state.generatedImageUrl, 'comparison');
        }
    });

    // Copy Prompt
    if (elements.copyPromptBtn) {
        elements.copyPromptBtn.addEventListener('click', () => {
            if (state.lastPrompt) {
                navigator.clipboard.writeText(state.lastPrompt).then(() => {
                    showSuccess('Prompt copied!');
                });
            }
        });
    }

    // Image info toggle
    if (elements.imageInfoBtn && elements.imageInfoOverlay) {
        elements.imageInfoBtn.addEventListener('click', () => {
            const isVisible = elements.imageInfoOverlay.style.display !== 'none';
            if (isVisible) {
                elements.imageInfoOverlay.style.display = 'none';
                elements.imageInfoBtn.classList.remove('active');
            } else {
                const info = {
                    seed: state.lastSeed,
                    model: DEFAULT_MODEL,
                    dimensions: state.aspectRatio || '16:9',
                    style: state.visualStyle || 'Clean',
                    variations: state.generatedImages?.length || 1
                };
                elements.imageInfoOverlay.innerHTML = SharedImageInfo.createOverlay(info).innerHTML;
                elements.imageInfoOverlay.style.display = 'block';
                elements.imageInfoBtn.classList.add('active');
            }
        });
    }

    elements.copySeedBtn.addEventListener('click', () => {
        if (state.lastSeed) {
            navigator.clipboard.writeText(String(state.lastSeed));
            showSuccess('Seed copied!');
        }
    });

    // Adjust button
    elements.adjustBtn.addEventListener('click', generateWithAdjustment);

    // Result image click for lightbox
    elements.resultImage.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            SharedLightbox.open(elements.lightbox, elements.lightboxImage, state.generatedImageUrl);
        }
    });

    // History
    elements.clearHistoryBtn.addEventListener('click', async () => {
        const confirmed = await SharedUI.confirm('Are you sure you want to clear all history?', {
            title: 'Clear History',
            confirmText: 'Clear All',
            icon: 'warning'
        });
        if (confirmed) {
            await history.clear();
            renderHistory();
            showSuccess('History cleared');
        }
    });

    // Favorites
    elements.clearFavoritesBtn.addEventListener('click', async () => {
        await favorites.clear();
        renderFavorites();
        showSuccess('Favorites cleared');
    });

    elements.favoritesModalClose.addEventListener('click', closeFavoritesModal);
    elements.favoritesModal.querySelector('.modal-backdrop').addEventListener('click', closeFavoritesModal);
    elements.loadFavoriteBtn.addEventListener('click', loadFavorite);
    elements.deleteFavoriteBtn.addEventListener('click', deleteFavorite);

    // Lightbox
    SharedLightbox.setup(elements.lightbox);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

        if (e.key === 'Escape') {
            if (elements.lightbox.classList.contains('active')) {
                SharedLightbox.close(elements.lightbox);
            } else if (elements.favoritesModal.classList.contains('visible')) {
                closeFavoritesModal();
            }
        }

        // ? - show keyboard shortcuts
        if (e.key === '?' && !isTyping) {
            e.preventDefault();
            SharedKeyboard.showShortcutsModal([
                { key: 'Ctrl+Enter', action: 'generate', description: 'Generate comparison' },
                { key: 'Ctrl+D', action: 'download', description: 'Download current image' },
                { key: 'Escape', action: 'close', description: 'Close modals' },
                { key: '?', action: 'help', description: 'Show this help' }
            ]);
        }

        // Ctrl/Cmd + Enter - generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateComparison();
        }

        // Ctrl/Cmd + D - download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.generatedImageUrl) {
            e.preventDefault();
            SharedDownload.downloadImage(state.generatedImageUrl, 'comparison');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================
let initialized = false;

async function init() {
    if (initialized) return;
    initialized = true;

    // Header is pre-rendered in HTML to prevent flash
    initElements();
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    setupEventListeners();
    updateGenerateButton();

    // Initialize default features
    addCompareFeature('Quality', true, false);
    addCompareFeature('Price', true, true);

    addFeatureValue('Material', 'Premium', true);
    addFeatureValue('Weight', '250g', false);

    // Load history and favorites
    await imageStore.init();
    history.setImageStore(imageStore);
    favorites.setImageStore(imageStore);
    history.load();
    renderHistory();
    renderFavorites();

    console.log('Comparison Generator: Ready!');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
