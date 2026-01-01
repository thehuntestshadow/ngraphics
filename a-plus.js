/**
 * HEFAISTOS - A+ Content Generator
 * Generate Amazon A+ Content (Enhanced Brand Content) modules
 */

// ============================================
// STATE
// ============================================
const state = {
    apiKey: '',
    moduleType: 'image-text',

    // Shared
    productImage: null,
    productThumbnail: null,
    productName: '',

    // Image with Text
    headline: '',
    bodyText: '',
    textPosition: 'right',

    // Comparison Chart
    comparisonProducts: [],
    comparisonFeatures: [],
    highlightWinner: true,

    // Four-Image Grid
    gridMode: 'upload',
    gridImages: [null, null, null, null],
    gridCaption: '',

    // Standard Text
    textHeadline: '',
    textBody: '',
    textAlignment: 'left',

    // Single Image
    singleImageMode: 'hero',

    // Visual Style
    visualStyle: 'clean',
    colorScheme: 'match',
    customColor: '#6366f1',

    // Output
    model: 'google/gemini-2.5-pro-preview',
    variations: 1,
    useRandomSeed: true,
    seed: null,
    negativePrompt: '',

    // Results
    generatedImages: [],
    lastPrompt: '',
    lastSeed: null,
    isGenerating: false,

    // Favorites
    selectedFavorite: null,
    selectedFavoriteImages: null
};

// ============================================
// DESCRIPTION MAPS
// ============================================
const moduleTypeDescriptions = {
    'image-text': 'Amazon A+ Image with Text module - a hero product image alongside marketing headline and body copy. Standard 970x600px layout with product prominently displayed and text positioned for maximum impact.',
    'comparison': 'Amazon A+ Comparison Chart module - a feature comparison table showing multiple products side by side with checkmarks, X marks, or values for each feature row. Professional table layout at 970x300px.',
    'four-grid': 'Amazon A+ Four-Image Grid module - a 2x2 grid layout showing 4 product images or variants. Each cell is 300x300px, total width 970px. Cohesive styling across all four images.',
    'standard-text': 'Amazon A+ Standard Text module - a text-focused marketing section with headline and body copy. Professional typography, clean layout, 970x300px for text content without product images.',
    'single-image': 'Amazon A+ Single Image module - a full-width hero image at 970x600px showcasing the product with dramatic lighting or lifestyle context. Visual impact with no text overlay.'
};

const visualStyleDescriptions = {
    'clean': 'Clean, minimal aesthetic with generous white space. Professional e-commerce look with subtle shadows, crisp edges, and elegant simplicity.',
    'modern': 'Contemporary design with geometric elements, subtle gradients, and modern sans-serif typography. Tech-forward and fresh.',
    'bold': 'High contrast, vibrant colors, strong typography. Eye-catching and energetic with impactful visual elements.',
    'premium': 'Luxury aesthetic with elegant serif or refined sans-serif typography, subtle textures, dark or muted color palette, high-end premium feel.'
};

const colorSchemeDescriptions = {
    'match': 'Colors that complement and harmonize with the product colors for visual cohesion.',
    'white': 'Clean white background with minimal color accents, focusing attention on the product.',
    'dark': 'Dark or black background for dramatic contrast and premium upscale feel.',
    'custom': 'Custom brand color incorporated prominently into the design.'
};

const textPositionDescriptions = {
    'left': 'Product image positioned on the right side, text content (headline and body) on the left.',
    'right': 'Product image positioned on the left side, text content (headline and body) on the right.',
    'overlay': 'Text overlaid directly on the product image with appropriate contrast and readability.'
};

const singleImageModeDescriptions = {
    'hero': 'Large dramatic hero product shot with clean studio background, professional lighting, and strong visual presence.',
    'lifestyle': 'Product photographed in a real-world lifestyle context showing practical use and environment.',
    'product-focus': 'Close-up product photography highlighting textures, details, craftsmanship, and quality.'
};

const textAlignmentDescriptions = {
    'left': 'Text aligned to the left margin for standard reading flow.',
    'center': 'Text centered for balanced, symmetrical presentation.',
    'right': 'Text aligned to the right margin for unique visual interest.'
};

// ============================================
// DOM ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Module Tabs
        moduleTypeTabs: document.getElementById('moduleTypeTabs'),

        // Product Upload
        productUploadArea: document.getElementById('productUploadArea'),
        productPlaceholder: document.getElementById('productPlaceholder'),
        productPreview: document.getElementById('productPreview'),
        productPreviewImg: document.getElementById('productPreviewImg'),
        removeProductBtn: document.getElementById('removeProductBtn'),
        productFileInput: document.getElementById('productFileInput'),
        productName: document.getElementById('productName'),

        // Module Sections
        imageTextSection: document.getElementById('imageTextSection'),
        comparisonSection: document.getElementById('comparisonSection'),
        fourGridSection: document.getElementById('fourGridSection'),
        standardTextSection: document.getElementById('standardTextSection'),
        singleImageSection: document.getElementById('singleImageSection'),

        // Image with Text
        headline: document.getElementById('headline'),
        bodyText: document.getElementById('bodyText'),

        // Comparison
        comparisonProducts: document.getElementById('comparisonProducts'),
        addComparisonProductBtn: document.getElementById('addProductBtn'),
        comparisonFeatures: document.getElementById('comparisonFeatures'),
        addComparisonFeatureBtn: document.getElementById('addFeatureBtn'),

        // Four-Grid
        gridUploadSlots: document.getElementById('gridUploadSlots'),

        // Standard Text
        textHeadline: document.getElementById('textHeadline'),
        textBody: document.getElementById('textBody'),

        // Visual Style
        visualStyleOptions: document.getElementById('styleGrid'),
        customColorGroup: document.getElementById('customColorRow'),
        customColorPicker: document.getElementById('customColorText'),
        customColor: document.getElementById('customColor'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedContent: document.getElementById('advancedSection'),
        seed: document.getElementById('seedInput'),
        negativePrompt: document.getElementById('negativePrompt'),

        // API
        apiToggle: document.getElementById('settingsToggle'),
        apiContent: document.getElementById('settingsSection'),
        aiModel: document.getElementById('aiModel'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Results
        resultContainer: document.getElementById('resultContainer'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        resultImages: document.getElementById('resultImages'),
        resultLoading: document.getElementById('resultLoading'),
        loadingText: document.getElementById('loadingStatus'),
        resultActions: document.getElementById('resultActions'),
        downloadBtn: document.getElementById('downloadBtn'),
        downloadZipBtn: document.getElementById('downloadZipBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        feedbackSection: document.getElementById('feedbackSection'),
        feedbackInput: document.getElementById('feedbackInput'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History & Favorites
        historyGrid: document.getElementById('historyGrid'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),

        // Favorites Modal
        favoritesModal: document.getElementById('favoritesModal'),
        closeFavoritesModal: document.getElementById('closeFavoritesModal'),
        favoritePreview: document.getElementById('favoritePreviewImg'),
        favoriteModule: document.getElementById('favoriteModule'),
        favoriteStyle: document.getElementById('favoriteStyle'),
        favoriteSeed: document.getElementById('favoriteSeed'),
        loadFavoriteBtn: document.getElementById('loadFavoriteBtn'),
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn')
    };
}

// ============================================
// STORAGE
// ============================================
const imageStore = new ImageStore('aplus_images');
const history = new SharedHistory('aplus_generator_history', 20);
const favorites = new SharedFavorites('aplus_generator_favorites', 30);

// ============================================
// MODULE TYPE SWITCHING
// ============================================
function switchModuleType(type) {
    state.moduleType = type;

    // Update tabs
    if (elements.moduleTypeTabs) {
        elements.moduleTypeTabs.querySelectorAll('.module-type-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });
    }

    // Hide all module sections
    if (elements.imageTextSection) elements.imageTextSection.classList.add('hidden');
    if (elements.comparisonSection) elements.comparisonSection.classList.add('hidden');
    if (elements.fourGridSection) elements.fourGridSection.classList.add('hidden');
    if (elements.standardTextSection) elements.standardTextSection.classList.add('hidden');
    if (elements.singleImageSection) elements.singleImageSection.classList.add('hidden');

    // Show relevant section
    switch (type) {
        case 'image-text':
            if (elements.imageTextSection) elements.imageTextSection.classList.remove('hidden');
            break;
        case 'comparison':
            if (elements.comparisonSection) elements.comparisonSection.classList.remove('hidden');
            break;
        case 'four-grid':
            if (elements.fourGridSection) elements.fourGridSection.classList.remove('hidden');
            break;
        case 'standard-text':
            if (elements.standardTextSection) elements.standardTextSection.classList.remove('hidden');
            break;
        case 'single-image':
            if (elements.singleImageSection) elements.singleImageSection.classList.remove('hidden');
            break;
    }

    updateGenerateButton();
}

// ============================================
// COMPARISON CHART MANAGEMENT
// ============================================
function addComparisonProduct() {
    if (state.comparisonProducts.length >= 5) {
        SharedUI.showError('Maximum 5 products allowed');
        return;
    }

    const product = {
        id: Date.now(),
        image: null,
        thumbnail: null,
        name: state.comparisonProducts.length === 0 ? (state.productName || 'Your Product') : `Competitor ${state.comparisonProducts.length}`,
        isMain: state.comparisonProducts.length === 0
    };

    // If first product and we have a main product image, use it
    if (product.isMain && state.productImage) {
        product.image = state.productImage;
        product.thumbnail = state.productThumbnail;
    }

    state.comparisonProducts.push(product);

    // Add default values to existing features
    state.comparisonFeatures.forEach(feature => {
        feature.values.push(true);
    });

    renderComparisonProducts();
    updateGenerateButton();
}

function removeComparisonProduct(id) {
    const index = state.comparisonProducts.findIndex(p => p.id === id);
    if (index === -1) return;

    state.comparisonProducts.splice(index, 1);

    // Remove values from features
    state.comparisonFeatures.forEach(feature => {
        feature.values.splice(index, 1);
    });

    renderComparisonProducts();
    updateGenerateButton();
}

function renderComparisonProducts() {
    if (!elements.comparisonProducts) return;

    if (state.comparisonProducts.length === 0) {
        elements.comparisonProducts.innerHTML = '<p class="comparison-empty">Add products to compare</p>';
        return;
    }

    elements.comparisonProducts.innerHTML = state.comparisonProducts.map((product, index) => `
        <div class="comparison-product-slot ${product.isMain ? 'main' : ''}" data-id="${product.id}">
            <div class="comparison-product-upload" data-index="${index}">
                ${product.thumbnail
        ? `<img src="${product.thumbnail}" alt="${product.name}">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>`
}
            </div>
            <input type="file" class="comparison-file-input" accept="image/*" hidden data-index="${index}">
            <div class="comparison-product-info">
                <span class="comparison-product-label">${product.isMain ? 'Your Product' : `Competitor ${index}`}</span>
                <input type="text" class="input-field comparison-product-name" value="${product.name}" data-index="${index}" placeholder="Product name">
            </div>
            ${!product.isMain ? `<button type="button" class="btn-remove" data-id="${product.id}" title="Remove">&times;</button>` : ''}
        </div>
    `).join('');

    // Add event listeners
    elements.comparisonProducts.querySelectorAll('.comparison-product-upload').forEach(el => {
        el.addEventListener('click', () => {
            const input = el.nextElementSibling;
            input.click();
        });
    });

    elements.comparisonProducts.querySelectorAll('.comparison-file-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(input.dataset.index);
            handleComparisonProductUpload(e.target.files[0], index);
        });
    });

    elements.comparisonProducts.querySelectorAll('.comparison-product-name').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(input.dataset.index);
            state.comparisonProducts[index].name = e.target.value;
        });
    });

    elements.comparisonProducts.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeComparisonProduct(parseInt(btn.dataset.id));
        });
    });

    renderComparisonFeatures();
}

async function handleComparisonProductUpload(file, index) {
    if (!file) return;

    try {
        const result = await SharedUpload.processFile(file, { maxWidth: 800, quality: 0.85 });
        state.comparisonProducts[index].image = result.base64;
        state.comparisonProducts[index].thumbnail = await createThumbnail(result.base64, 100);
        renderComparisonProducts();
        updateGenerateButton();
    } catch (error) {
        SharedUI.showError('Failed to process image');
    }
}

function addComparisonFeature(name = '') {
    const feature = {
        id: Date.now(),
        name,
        values: state.comparisonProducts.map((_, i) => i === 0 ? true : false)
    };
    state.comparisonFeatures.push(feature);
    renderComparisonFeatures();
}

function removeComparisonFeature(id) {
    const index = state.comparisonFeatures.findIndex(f => f.id === id);
    if (index === -1) return;
    state.comparisonFeatures.splice(index, 1);
    renderComparisonFeatures();
}

function renderComparisonFeatures() {
    if (!elements.comparisonFeatures) return;

    if (state.comparisonProducts.length === 0) {
        elements.comparisonFeatures.innerHTML = '';
        return;
    }

    if (state.comparisonFeatures.length === 0) {
        elements.comparisonFeatures.innerHTML = '<p class="comparison-empty">Add features to compare</p>';
        return;
    }

    elements.comparisonFeatures.innerHTML = state.comparisonFeatures.map(feature => `
        <div class="comparison-feature-row" data-id="${feature.id}">
            <input type="text" class="input-field feature-name" value="${feature.name}" placeholder="Feature name" data-id="${feature.id}">
            <div class="feature-values">
                ${state.comparisonProducts.map((_, i) => {
        const val = feature.values[i];
        let className = 'checked';
        let display = '✓';
        if (val === false) {
            className = 'unchecked';
            display = '✗';
        } else if (typeof val === 'string') {
            className = 'text';
            display = val;
        }
        return `<button type="button" class="feature-value-btn ${className}" data-feature-id="${feature.id}" data-product-index="${i}">${display}</button>`;
    }).join('')}
            </div>
            <button type="button" class="btn-remove-feature" data-id="${feature.id}" title="Remove">&times;</button>
        </div>
    `).join('');

    // Add event listeners
    elements.comparisonFeatures.querySelectorAll('.feature-name').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = parseInt(input.dataset.id);
            const feature = state.comparisonFeatures.find(f => f.id === id);
            if (feature) feature.name = e.target.value;
        });
    });

    elements.comparisonFeatures.querySelectorAll('.feature-value-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const featureId = parseInt(btn.dataset.featureId);
            const productIndex = parseInt(btn.dataset.productIndex);
            toggleFeatureValue(featureId, productIndex, btn);
        });
    });

    elements.comparisonFeatures.querySelectorAll('.btn-remove-feature').forEach(btn => {
        btn.addEventListener('click', () => {
            removeComparisonFeature(parseInt(btn.dataset.id));
        });
    });
}

function toggleFeatureValue(featureId, productIndex, btn) {
    const feature = state.comparisonFeatures.find(f => f.id === featureId);
    if (!feature) return;

    const currentVal = feature.values[productIndex];

    if (currentVal === true) {
        feature.values[productIndex] = false;
        btn.className = 'feature-value-btn unchecked';
        btn.textContent = '✗';
    } else if (currentVal === false) {
        // Show text input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field';
        input.placeholder = 'Enter value';
        input.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; z-index: 1001; padding: 0.75rem;';

        const backdrop = document.createElement('div');
        backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;';

        document.body.appendChild(backdrop);
        document.body.appendChild(input);
        input.focus();

        const cleanup = () => {
            backdrop.remove();
            input.remove();
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = input.value.trim();
                if (text) {
                    feature.values[productIndex] = text;
                } else {
                    feature.values[productIndex] = true;
                }
                cleanup();
                renderComparisonFeatures();
            } else if (e.key === 'Escape') {
                feature.values[productIndex] = true;
                cleanup();
                renderComparisonFeatures();
            }
        });

        backdrop.addEventListener('click', () => {
            feature.values[productIndex] = true;
            cleanup();
            renderComparisonFeatures();
        });
    } else {
        // Text -> back to checkmark
        feature.values[productIndex] = true;
        btn.className = 'feature-value-btn checked';
        btn.textContent = '✓';
    }
}

// ============================================
// FOUR-IMAGE GRID MANAGEMENT
// ============================================
function switchGridMode(mode) {
    state.gridMode = mode;

    if (elements.gridModeOptions) {
        elements.gridModeOptions.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === mode);
        });
    }

    if (mode === 'upload') {
        if (elements.gridUploadMode) elements.gridUploadMode.classList.remove('hidden');
        if (elements.gridGenerateMode) elements.gridGenerateMode.classList.add('hidden');
    } else {
        if (elements.gridUploadMode) elements.gridUploadMode.classList.add('hidden');
        if (elements.gridGenerateMode) elements.gridGenerateMode.classList.remove('hidden');
    }

    updateGenerateButton();
}

function setupGridSlots() {
    if (!elements.gridUploadSlots) return;

    const slots = elements.gridUploadSlots.querySelectorAll('.grid-slot');

    slots.forEach((slot, index) => {
        const fileInput = slot.querySelector('.grid-file-input');
        if (!fileInput) return;

        slot.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-grid')) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await SharedUpload.processFile(file, { maxWidth: 600, quality: 0.85 });
                state.gridImages[index] = {
                    image: result.base64,
                    thumbnail: await createThumbnail(result.base64, 150)
                };
                renderGridSlot(slot, index);
                updateGenerateButton();
            } catch (error) {
                SharedUI.showError('Failed to process image');
            }
        });
    });
}

function renderGridSlot(slot, index) {
    const data = state.gridImages[index];

    if (data) {
        slot.classList.add('has-image');
        slot.innerHTML = `
            <img src="${data.thumbnail}" class="grid-slot-preview" alt="Grid image ${index + 1}">
            <button type="button" class="btn-remove-grid" data-index="${index}">&times;</button>
            <input type="file" class="grid-file-input" accept="image/*" hidden>
        `;

        slot.querySelector('.btn-remove-grid').addEventListener('click', (e) => {
            e.stopPropagation();
            state.gridImages[index] = null;
            renderGridSlot(slot, index);
            updateGenerateButton();
        });

        slot.querySelector('.grid-file-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await SharedUpload.processFile(file, { maxWidth: 600, quality: 0.85 });
                state.gridImages[index] = {
                    image: result.base64,
                    thumbnail: await createThumbnail(result.base64, 150)
                };
                renderGridSlot(slot, index);
                updateGenerateButton();
            } catch (error) {
                SharedUI.showError('Failed to process image');
            }
        });
    } else {
        slot.classList.remove('has-image');
        slot.innerHTML = `
            <div class="grid-slot-upload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span>Image ${index + 1}</span>
            </div>
            <input type="file" class="grid-file-input" accept="image/*" hidden>
        `;

        slot.querySelector('.grid-file-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await SharedUpload.processFile(file, { maxWidth: 600, quality: 0.85 });
                state.gridImages[index] = {
                    image: result.base64,
                    thumbnail: await createThumbnail(result.base64, 150)
                };
                renderGridSlot(slot, index);
                updateGenerateButton();
            } catch (error) {
                SharedUI.showError('Failed to process image');
            }
        });
    }
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt(feedback = '') {
    const moduleDesc = moduleTypeDescriptions[state.moduleType];
    const styleDesc = visualStyleDescriptions[state.visualStyle];
    const colorDesc = colorSchemeDescriptions[state.colorScheme];

    let prompt = `Create a professional Amazon A+ Content module image.

MODULE TYPE: ${moduleDesc}

VISUAL STYLE: ${styleDesc}

COLOR SCHEME: ${colorDesc}
${state.colorScheme === 'custom' ? `BRAND COLOR: ${state.customColor}` : ''}

`;

    // Module-specific prompt sections
    switch (state.moduleType) {
        case 'image-text':
            prompt += generateImageTextPrompt();
            break;
        case 'comparison':
            prompt += generateComparisonPrompt();
            break;
        case 'four-grid':
            prompt += generateFourGridPrompt();
            break;
        case 'standard-text':
            prompt += generateStandardTextPrompt();
            break;
        case 'single-image':
            prompt += generateSingleImagePrompt();
            break;
    }

    // Common requirements
    prompt += `

CRITICAL REQUIREMENTS:
- Output must be exactly 970 pixels wide (Amazon A+ standard)
- Product must appear EXACTLY as shown in reference image - same shape, colors, details
- All text must be sharp, readable, and properly formatted
- Professional Amazon marketplace quality suitable for product listings
- High resolution, crisp edges, clean composition
- No watermarks, logos, or branding unless specified
- Mobile-friendly with readable text (minimum 24px font equivalent)`;

    if (feedback) {
        prompt += `\n\nADJUSTMENT REQUESTED: ${feedback}`;
    }

    if (state.negativePrompt) {
        prompt += `\n\nAVOID: ${state.negativePrompt}`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

function generateImageTextPrompt() {
    const positionDesc = textPositionDescriptions[state.textPosition];

    return `IMAGE WITH TEXT MODULE CONTENT:

PRODUCT: "${state.productName || 'Product'}"
HEADLINE: "${state.headline}"
BODY TEXT: "${state.bodyText}"
TEXT POSITION: ${positionDesc}

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 600 pixels
- Product image should be prominent and well-lit
- Headline should be large, bold, and attention-grabbing (approximately 36-48px)
- Body text should be readable (approximately 16-20px)
- Maintain clear visual hierarchy between headline and body
- Use appropriate padding and margins for professional appearance`;
}

function generateComparisonPrompt() {
    const products = state.comparisonProducts;
    const features = state.comparisonFeatures;

    let prompt = `COMPARISON CHART MODULE CONTENT:

Create a professional comparison table showing ${products.length} products side by side.

PRODUCTS (columns from left to right):
${products.map((p, i) => `${i + 1}. "${p.name}"${p.isMain ? ' (MAIN/RECOMMENDED)' : ''}`).join('\n')}

COMPARISON FEATURES (rows):
`;

    features.forEach(feature => {
        prompt += `\n${feature.name}: `;
        prompt += products.map((_, i) => {
            const val = feature.values[i];
            if (val === true) return '[GREEN CHECKMARK ✓]';
            if (val === false) return '[RED X ✗]';
            return `"${val}"`;
        }).join(' | ');
    });

    if (state.highlightWinner) {
        prompt += `\n\nHIGHLIGHTING: The first product "${products[0]?.name}" should be visually emphasized as the recommended choice - use a subtle highlight color, "Best Choice" badge, or column emphasis.`;
    }

    prompt += `

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 300 pixels (or taller if needed for features)
- Each product column should be equal width
- Product images at top of each column (150x150px approximate)
- Feature rows with clear alternating backgrounds
- Checkmarks in green, X marks in red
- Text values clearly readable
- Professional table styling with subtle borders or separators`;

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

function generateFourGridPrompt() {
    if (state.gridMode === 'generate') {
        return `FOUR-IMAGE GRID MODULE CONTENT:

PRODUCT: "${state.productName || 'Product'}"
${state.gridCaption ? `CAPTION: "${state.gridCaption}"` : ''}

Generate a cohesive 2x2 grid showing 4 different views or variants of the product:
1. Front view - standard product shot
2. Side/angle view - 3/4 perspective
3. Detail view - close-up of key feature or texture
4. Context view - product in use or lifestyle setting

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 600 pixels total (2x2 grid)
- Each cell approximately 300x300 pixels
- Consistent lighting and color treatment across all 4 images
- Subtle visual separation between cells
- All images should feel like a cohesive set
- Product must be immediately recognizable in each cell`;
    } else {
        const uploadedCount = state.gridImages.filter(img => img !== null).length;

        return `FOUR-IMAGE GRID MODULE CONTENT:

Arrange ${uploadedCount} product images into a professional 2x2 grid layout.
${state.gridCaption ? `CAPTION: "${state.gridCaption}"` : ''}

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 600 pixels total (2x2 grid)
- Each cell approximately 300x300 pixels
- Consistent styling and treatment across all images
- Subtle visual separation between cells (thin borders or spacing)
- Professional, cohesive appearance
- Images should be centered and well-composed within each cell`;
    }
}

function generateStandardTextPrompt() {
    const alignDesc = textAlignmentDescriptions[state.textAlignment];

    return `STANDARD TEXT MODULE CONTENT:

HEADLINE: "${state.textHeadline}"
BODY TEXT: "${state.textBody}"
ALIGNMENT: ${alignDesc}

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 300 pixels (or taller if needed for text)
- No product image - text is the focus
- Strong typographic hierarchy
- Headline should be prominent and styled appropriately for the visual style
- Body text should be comfortable to read
- Consider subtle background texture or gradient for visual interest
- Appropriate padding and margins
- Text should not touch edges of the module`;
}

function generateSingleImagePrompt() {
    const modeDesc = singleImageModeDescriptions[state.singleImageMode];

    return `SINGLE IMAGE MODULE CONTENT:

PRODUCT: "${state.productName || 'Product'}"
IMAGE MODE: ${modeDesc}

LAYOUT REQUIREMENTS:
- Dimensions: 970 x 600 pixels (full-width hero)
- Product must be the clear focal point
- Professional photography quality
- Appropriate lighting for the chosen mode
- No text overlays (pure image module)
- High visual impact
- Product should fill appropriate amount of frame based on mode`;
}

// ============================================
// GENERATION
// ============================================
async function generateContent() {
    if (!hasRequiredInputs()) {
        SharedUI.showError(getModuleRequirementText());
        return;
    }

    if (!state.apiKey) {
        SharedUI.showError('Please enter your API key');
        return;
    }

    state.isGenerating = true;
    updateGenerateButton();
    showLoading();

    try {
        const prompt = generatePrompt();
        state.lastPrompt = prompt;

        const images = getModuleImages();
        const results = [];

        for (let i = 0; i < state.variations; i++) {
            updateLoadingStatus(`Generating variation ${i + 1} of ${state.variations}...`);

            const seed = state.useRandomSeed
                ? Math.floor(Math.random() * 999999)
                : (state.seed || 12345) + i;

            if (i === 0) state.lastSeed = seed;

            const result = await makeGenerationRequest(prompt, images, seed);
            if (result) {
                results.push({ imageUrl: result, seed });
            }
        }

        if (results.length === 0) {
            throw new Error('No images were generated');
        }

        state.generatedImages = results;
        displayResults(results);

        // Save to history
        await saveToHistory(results[0].imageUrl);

        SharedUI.showSuccess(`Generated ${results.length} image${results.length > 1 ? 's' : ''}`);

    } catch (error) {
        SharedUI.showError(error.message || 'Generation failed');
    } finally {
        state.isGenerating = false;
        updateGenerateButton();
        hideLoading();
    }
}

async function generateWithAdjustment() {
    const feedback = elements.feedbackInput.value.trim();
    if (!feedback) {
        SharedUI.showError('Please enter adjustment feedback');
        return;
    }

    state.isGenerating = true;
    updateGenerateButton();
    showLoading();
    updateLoadingStatus('Applying adjustments...');

    try {
        const prompt = generatePrompt(feedback);
        state.lastPrompt = prompt;

        const images = getModuleImages();
        const seed = state.lastSeed || Math.floor(Math.random() * 999999);

        const result = await makeGenerationRequest(prompt, images, seed);
        if (!result) {
            throw new Error('Adjustment failed');
        }

        state.generatedImages = [{ imageUrl: result, seed }];
        displayResults([{ imageUrl: result, seed }]);

        await saveToHistory(result);

        elements.feedbackInput.value = '';
        SharedUI.showSuccess('Adjustment applied');

    } catch (error) {
        SharedUI.showError(error.message || 'Adjustment failed');
    } finally {
        state.isGenerating = false;
        updateGenerateButton();
        hideLoading();
    }
}

async function makeGenerationRequest(prompt, images, seed) {
    const requestBody = {
        model: state.model,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    ...images.map(img => ({
                        type: 'image_url',
                        image_url: { url: img }
                    }))
                ]
            }
        ],
        max_tokens: 4096,
        seed,
        modalities: ['image', 'text']
    };

    const response = await SharedRequest.makeRequest(requestBody, state.apiKey, 'A+ Content');
    return SharedRequest.extractImageFromResponse(response);
}

function getModuleImages() {
    const images = [];

    // Always include main product if available
    if (state.productImage) {
        images.push(state.productImage);
    }

    // Module-specific images
    switch (state.moduleType) {
        case 'comparison':
            state.comparisonProducts.forEach(p => {
                if (p.image && !images.includes(p.image)) {
                    images.push(p.image);
                }
            });
            break;
        case 'four-grid':
            if (state.gridMode === 'upload') {
                state.gridImages.forEach(img => {
                    if (img && img.image) {
                        images.push(img.image);
                    }
                });
            }
            break;
    }

    return images;
}

// ============================================
// VALIDATION
// ============================================
function hasRequiredInputs() {
    // API key is always required
    if (!state.apiKey) return false;

    switch (state.moduleType) {
        case 'image-text':
            return state.productImage && state.headline.trim();

        case 'comparison':
            return state.comparisonProducts.length >= 2 &&
                   state.comparisonProducts.every(p => p.image) &&
                   state.comparisonFeatures.length >= 1 &&
                   state.comparisonFeatures.every(f => f.name.trim());

        case 'four-grid':
            if (state.gridMode === 'upload') {
                const uploadedCount = state.gridImages.filter(img => img !== null).length;
                return uploadedCount >= 2;
            } else {
                return !!state.productImage;
            }

        case 'standard-text':
            return state.textHeadline.trim() || state.textBody.trim();

        case 'single-image':
            return !!state.productImage;

        default:
            return false;
    }
}

function getModuleRequirementText() {
    switch (state.moduleType) {
        case 'image-text':
            if (!state.productImage) return 'Upload a product image';
            if (!state.headline.trim()) return 'Enter a headline';
            return 'Ready to generate';

        case 'comparison':
            if (state.comparisonProducts.length < 2) return 'Add at least 2 products to compare';
            if (!state.comparisonProducts.every(p => p.image)) return 'Upload images for all products';
            if (state.comparisonFeatures.length < 1) return 'Add at least 1 feature to compare';
            if (!state.comparisonFeatures.every(f => f.name.trim())) return 'Enter names for all features';
            return 'Ready to generate';

        case 'four-grid':
            if (state.gridMode === 'upload') {
                const uploadedCount = state.gridImages.filter(img => img !== null).length;
                if (uploadedCount < 2) return `Upload at least 2 images (${uploadedCount}/4)`;
            } else {
                if (!state.productImage) return 'Upload a product image';
            }
            return 'Ready to generate';

        case 'standard-text':
            if (!state.textHeadline.trim() && !state.textBody.trim()) return 'Enter headline or body text';
            return 'Ready to generate';

        case 'single-image':
            if (!state.productImage) return 'Upload a product image';
            return 'Ready to generate';

        default:
            return 'Select a module type';
    }
}

function updateGenerateButton() {
    const canGenerate = hasRequiredInputs() && !state.isGenerating;
    if (elements.generateBtn) elements.generateBtn.disabled = !canGenerate;
    if (elements.generateHelper) elements.generateHelper.textContent = getModuleRequirementText();
}

// ============================================
// DISPLAY
// ============================================
function displayResults(results) {
    if (elements.resultPlaceholder) elements.resultPlaceholder.classList.add('hidden');
    if (elements.resultImages) elements.resultImages.classList.remove('hidden');
    if (elements.resultActions) elements.resultActions.classList.remove('hidden');
    if (elements.feedbackSection) elements.feedbackSection.classList.remove('hidden');

    if (!elements.resultImages) return;

    // Set grid class based on count
    elements.resultImages.className = 'result-images';
    if (results.length === 1) {
        elements.resultImages.classList.add('single');
    } else if (results.length === 2) {
        elements.resultImages.classList.add('multi-2');
    } else {
        elements.resultImages.classList.add('multi-4');
    }

    elements.resultImages.innerHTML = results.map((result, i) => `
        <div class="result-image-wrapper">
            <img src="${result.imageUrl}" alt="Generated A+ content ${i + 1}" data-index="${i}">
        </div>
    `).join('');

    // Add click handlers for lightbox
    elements.resultImages.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
            openLightbox(img.src);
        });
    });

    // Show/hide download buttons
    if (elements.downloadBtn) elements.downloadBtn.style.display = results.length === 1 ? '' : 'none';
    if (elements.downloadZipBtn) elements.downloadZipBtn.style.display = results.length > 1 ? '' : 'none';
}

function showLoading() {
    if (elements.resultPlaceholder) elements.resultPlaceholder.classList.add('hidden');
    if (elements.resultImages) elements.resultImages.classList.add('hidden');
    if (elements.resultLoading) elements.resultLoading.classList.remove('hidden');
    if (elements.resultActions) elements.resultActions.classList.add('hidden');
    if (elements.feedbackSection) elements.feedbackSection.classList.add('hidden');
}

function hideLoading() {
    if (elements.resultLoading) elements.resultLoading.classList.add('hidden');
}

function updateLoadingStatus(text) {
    if (elements.loadingText) elements.loadingText.textContent = text;
}

function openLightbox(imageUrl) {
    if (elements.lightboxImage) elements.lightboxImage.src = imageUrl;
    if (elements.lightbox) elements.lightbox.classList.remove('hidden');
}

function closeLightbox() {
    if (elements.lightbox) elements.lightbox.classList.add('hidden');
    if (elements.lightboxImage) elements.lightboxImage.src = '';
}

// ============================================
// HISTORY & FAVORITES
// ============================================
async function saveToHistory(imageUrl) {
    const thumbnail = await createThumbnail(imageUrl, 200);

    await history.add(imageUrl, {
        moduleType: state.moduleType,
        productName: state.productName,
        visualStyle: state.visualStyle,
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        thumbnail
    });

    renderHistory();
}

function renderHistory() {
    if (!elements.historyGrid) return;

    const items = history.getAll();

    if (items.length === 0) {
        elements.historyGrid.innerHTML = '<div class="history-empty">No generations yet</div>';
        return;
    }

    elements.historyGrid.innerHTML = items.slice(0, 9).map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.productName || 'A+ Content'}" loading="lazy">
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', async () => {
            const id = el.dataset.id;
            const item = history.findById(id);
            if (item) {
                const images = await history.getImages(id);
                if (images && images.length > 0) {
                    openLightbox(images[0]);
                }
            }
        });
    });
}

async function saveFavorite() {
    if (state.generatedImages.length === 0) return;

    const images = state.generatedImages.map(r => r.imageUrl);
    const thumbnail = await createThumbnail(images[0], 200);

    await favorites.add({
        name: state.productName || 'A+ Content',
        thumbnail,
        images,
        settings: captureCurrentSettings(),
        seed: state.lastSeed,
        moduleType: state.moduleType
    });

    renderFavorites();
    SharedUI.showSuccess('Saved to favorites');
}

function captureCurrentSettings() {
    return {
        moduleType: state.moduleType,
        productName: state.productName,
        headline: state.headline,
        bodyText: state.bodyText,
        textPosition: state.textPosition,
        textHeadline: state.textHeadline,
        textBody: state.textBody,
        textAlignment: state.textAlignment,
        singleImageMode: state.singleImageMode,
        gridMode: state.gridMode,
        gridCaption: state.gridCaption,
        highlightWinner: state.highlightWinner,
        visualStyle: state.visualStyle,
        colorScheme: state.colorScheme,
        customColor: state.customColor,
        variations: state.variations,
        negativePrompt: state.negativePrompt
    };
}

function renderFavorites() {
    if (!elements.favoritesGrid) return;

    const items = favorites.getAll();

    if (items.length === 0) {
        elements.favoritesGrid.innerHTML = '<div class="favorites-empty">No favorites saved</div>';
        return;
    }

    elements.favoritesGrid.innerHTML = items.slice(0, 9).map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.name}" loading="lazy">
        </div>
    `).join('');

    elements.favoritesGrid.querySelectorAll('.favorite-item').forEach(el => {
        el.addEventListener('click', () => {
            openFavoritesModal(el.dataset.id);
        });
    });
}

async function openFavoritesModal(id) {
    const favorite = favorites.findById(id);
    if (!favorite) return;

    state.selectedFavorite = favorite;
    state.selectedFavoriteImages = await favorites.getImages(id);

    if (elements.favoriteModalTitle) elements.favoriteModalTitle.textContent = favorite.name;
    if (elements.favoriteModule) elements.favoriteModule.textContent = favorite.moduleType || 'Unknown';
    if (elements.favoriteStyle) elements.favoriteStyle.textContent = favorite.settings?.visualStyle || 'Unknown';
    if (elements.favoriteSeed) elements.favoriteSeed.textContent = favorite.seed || 'Random';

    const images = state.selectedFavoriteImages || [favorite.thumbnail];
    if (elements.favoritePreview) {
        elements.favoritePreview.innerHTML = images.map(img =>
            `<img src="${img}" alt="Favorite preview">`
        ).join('');
    }

    if (elements.favoritesModal) elements.favoritesModal.classList.remove('hidden');
}

function closeFavoritesModal() {
    if (elements.favoritesModal) elements.favoritesModal.classList.add('hidden');
    state.selectedFavorite = null;
    state.selectedFavoriteImages = null;
}

function loadFavoriteSettings() {
    if (!state.selectedFavorite) return;

    const settings = state.selectedFavorite.settings;
    if (!settings) return;

    // Restore settings
    Object.assign(state, settings);

    // Update UI
    switchModuleType(settings.moduleType || 'image-text');

    if (elements.productName) elements.productName.value = settings.productName || '';
    if (elements.headline) elements.headline.value = settings.headline || '';
    if (elements.bodyText) elements.bodyText.value = settings.bodyText || '';
    if (elements.textHeadline) elements.textHeadline.value = settings.textHeadline || '';
    if (elements.textBody) elements.textBody.value = settings.textBody || '';
    if (elements.gridCaption) elements.gridCaption.value = settings.gridCaption || '';
    if (elements.negativePrompt) elements.negativePrompt.value = settings.negativePrompt || '';
    if (elements.highlightWinner) elements.highlightWinner.checked = settings.highlightWinner !== false;

    // Update option buttons
    updateOptionButtons(elements.textPositionOptions, settings.textPosition || 'right');
    updateOptionButtons(elements.textAlignmentOptions, settings.textAlignment || 'left');
    updateOptionButtons(elements.gridModeOptions, settings.gridMode || 'upload');
    updateOptionButtons(elements.variationsOptions, String(settings.variations || 1));

    // Update style options
    if (elements.visualStyleOptions) {
        elements.visualStyleOptions.querySelectorAll('.style-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.visualStyle);
        });
    }
    updateOptionButtons(elements.colorSchemeOptions, settings.colorScheme || 'match');

    if (settings.colorScheme === 'custom') {
        if (elements.customColorGroup) elements.customColorGroup.classList.remove('hidden');
        if (elements.customColor) elements.customColor.value = settings.customColor || '#6366f1';
        if (elements.customColorPicker) elements.customColorPicker.value = settings.customColor || '#6366f1';
    }

    // Update single image mode
    if (elements.singleImageModeOptions) {
        elements.singleImageModeOptions.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.singleImageMode);
        });
    }

    // Grid mode
    switchGridMode(settings.gridMode || 'upload');

    closeFavoritesModal();
    updateGenerateButton();
    SharedUI.showSuccess('Settings loaded from favorite');
}

async function deleteFavorite() {
    if (!state.selectedFavorite) return;

    await favorites.remove(state.selectedFavorite.id);
    closeFavoritesModal();
    renderFavorites();
    SharedUI.showSuccess('Favorite deleted');
}

// ============================================
// UTILITIES
// ============================================
async function createThumbnail(base64, maxSize) {
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
        img.src = base64;
    });
}

function updateOptionButtons(container, value) {
    if (!container) return;
    container.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

function updateCharCount(input, countEl, max) {
    const count = input.value.length;
    countEl.textContent = count;
    countEl.parentElement.style.color = count > max * 0.9 ? '#ef4444' : '';
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Module type tabs
    if (elements.moduleTypeTabs) {
        elements.moduleTypeTabs.querySelectorAll('.module-type-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                switchModuleType(tab.dataset.type);
            });
        });
    }

    // Product upload
    if (elements.productUploadArea && elements.productFileInput) {
        SharedUpload.setup(elements.productUploadArea, elements.productFileInput, {
            onLoad: async (base64) => {
                state.productImage = base64;
                state.productThumbnail = await createThumbnail(base64, 150);
                if (elements.productPlaceholder) elements.productPlaceholder.classList.add('hidden');
                if (elements.productPreview) elements.productPreview.classList.remove('hidden');
                if (elements.productPreviewImg) elements.productPreviewImg.src = state.productThumbnail;

                // Auto-populate first comparison product
                if (state.comparisonProducts.length > 0 && state.comparisonProducts[0].isMain) {
                    state.comparisonProducts[0].image = base64;
                    state.comparisonProducts[0].thumbnail = state.productThumbnail;
                    renderComparisonProducts();
                }

                updateGenerateButton();
            }
        });
    }

    if (elements.removeProductBtn) {
        elements.removeProductBtn.addEventListener('click', () => {
            state.productImage = null;
            state.productThumbnail = null;
            if (elements.productPlaceholder) elements.productPlaceholder.classList.remove('hidden');
            if (elements.productPreview) elements.productPreview.classList.add('hidden');
            if (elements.productPreviewImg) elements.productPreviewImg.src = '';
            updateGenerateButton();
        });
    }

    if (elements.productName) {
        elements.productName.addEventListener('input', (e) => {
            state.productName = e.target.value;
        });
    }

    // Image with Text
    if (elements.headline) {
        elements.headline.addEventListener('input', (e) => {
            state.headline = e.target.value;
            updateGenerateButton();
        });
    }

    if (elements.bodyText) {
        elements.bodyText.addEventListener('input', (e) => {
            state.bodyText = e.target.value;
        });
    }

    // Text position options (from HTML data attributes)
    document.querySelectorAll('#imageTextSection .option-btn[data-value]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.textPosition = btn.dataset.value;
            document.querySelectorAll('#imageTextSection .option-btn[data-value]').forEach(b => {
                b.classList.toggle('active', b.dataset.value === btn.dataset.value);
            });
        });
    });

    // Comparison
    if (elements.addComparisonProductBtn) {
        elements.addComparisonProductBtn.addEventListener('click', addComparisonProduct);
    }
    if (elements.addComparisonFeatureBtn) {
        elements.addComparisonFeatureBtn.addEventListener('click', () => addComparisonFeature());
    }

    // Four-Grid
    setupGridSlots();

    // Standard Text
    if (elements.textHeadline) {
        elements.textHeadline.addEventListener('input', (e) => {
            state.textHeadline = e.target.value;
            updateGenerateButton();
        });
    }

    if (elements.textBody) {
        elements.textBody.addEventListener('input', (e) => {
            state.textBody = e.target.value;
            updateGenerateButton();
        });
    }

    // Single Image mode options
    document.querySelectorAll('#singleImageSection .option-btn[data-value]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.singleImageMode = btn.dataset.value;
            document.querySelectorAll('#singleImageSection .option-btn[data-value]').forEach(b => {
                b.classList.toggle('active', b.dataset.value === btn.dataset.value);
            });
        });
    });

    // Visual Style
    if (elements.visualStyleOptions) {
        elements.visualStyleOptions.querySelectorAll('.style-option').forEach(btn => {
            btn.addEventListener('click', () => {
                state.visualStyle = btn.dataset.value;
                elements.visualStyleOptions.querySelectorAll('.style-option').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
            });
        });
    }

    // Color scheme options
    document.querySelectorAll('.color-scheme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.colorScheme = btn.dataset.value;
            document.querySelectorAll('.color-scheme-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.value === btn.dataset.value);
            });
            if (elements.customColorGroup) {
                elements.customColorGroup.classList.toggle('hidden', btn.dataset.value !== 'custom');
            }
        });
    });

    if (elements.customColorPicker) {
        elements.customColorPicker.addEventListener('input', (e) => {
            state.customColor = e.target.value;
            if (elements.customColor) elements.customColor.value = e.target.value;
        });
    }

    if (elements.customColor) {
        elements.customColor.addEventListener('input', (e) => {
            state.customColor = e.target.value;
            if (elements.customColorPicker) elements.customColorPicker.value = e.target.value;
        });
    }

    // Advanced options
    if (elements.advancedToggle && elements.advancedContent) {
        SharedCollapsible.setup(elements.advancedToggle, elements.advancedContent);
    }

    // Variations options
    document.querySelectorAll('.variations-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.variations = parseInt(btn.dataset.value);
            document.querySelectorAll('.variations-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.value === btn.dataset.value);
            });
        });
    });

    if (elements.seed) {
        elements.seed.addEventListener('input', (e) => {
            state.seed = parseInt(e.target.value) || null;
        });
    }

    if (elements.negativePrompt) {
        elements.negativePrompt.addEventListener('input', (e) => {
            state.negativePrompt = e.target.value;
        });
    }

    // API settings
    if (elements.apiToggle && elements.apiContent) {
        SharedCollapsible.setup(elements.apiToggle, elements.apiContent);
    }


    if (elements.aiModel) {
        elements.aiModel.addEventListener('change', (e) => {
            state.model = e.target.value;
        });
    }

    // Generate
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', generateContent);
    }
    if (elements.adjustBtn) {
        elements.adjustBtn.addEventListener('click', generateWithAdjustment);
    }

    // Result actions
    if (elements.downloadBtn) {
        elements.downloadBtn.addEventListener('click', () => {
            if (state.generatedImages.length > 0) {
                SharedDownload.downloadImage(state.generatedImages[0].imageUrl, 'aplus-content');
            }
        });
    }

    if (elements.downloadZipBtn) {
        elements.downloadZipBtn.addEventListener('click', async () => {
            if (state.generatedImages.length > 1) {
                const images = state.generatedImages.map(r => r.imageUrl);
                await SharedDownload.downloadZip(images, 'aplus-content');
            }
        });
    }

    if (elements.favoriteBtn) {
        elements.favoriteBtn.addEventListener('click', saveFavorite);
    }

    if (elements.copyPromptBtn) {
        elements.copyPromptBtn.addEventListener('click', () => {
            if (state.lastPrompt) {
                navigator.clipboard.writeText(state.lastPrompt);
                SharedUI.showSuccess('Prompt copied to clipboard');
            }
        });
    }

    // History & Favorites
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', async () => {
            if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
                await history.clear();
                renderHistory();
            }
        });
    }

    if (elements.clearFavoritesBtn) {
        elements.clearFavoritesBtn.addEventListener('click', async () => {
            if (await SharedUI.confirm('Clear all favorites? This cannot be undone.', { title: 'Clear Favorites', confirmText: 'Clear All', icon: 'warning' })) {
                await favorites.clear();
                renderFavorites();
            }
        });
    }

    // Favorites modal
    if (elements.closeFavoritesModal) {
        elements.closeFavoritesModal.addEventListener('click', closeFavoritesModal);
    }
    if (elements.favoritesModal) {
        elements.favoritesModal.addEventListener('click', (e) => {
            if (e.target === elements.favoritesModal) closeFavoritesModal();
        });
    }
    if (elements.loadFavoriteBtn) {
        elements.loadFavoriteBtn.addEventListener('click', loadFavoriteSettings);
    }
    if (elements.deleteFavoriteBtn) {
        elements.deleteFavoriteBtn.addEventListener('click', deleteFavorite);
    }

    // Lightbox
    if (elements.lightboxClose) {
        elements.lightboxClose.addEventListener('click', closeLightbox);
    }
    if (elements.lightbox) {
        elements.lightbox.addEventListener('click', (e) => {
            if (e.target === elements.lightbox) closeLightbox();
        });
    }

    // Keyboard shortcuts
    SharedKeyboard.setup({
        onGenerate: () => {
            if (elements.generateBtn && !elements.generateBtn.disabled) generateContent();
        },
        onDownload: () => {
            if (state.generatedImages.length > 0) {
                SharedDownload.downloadImage(state.generatedImages[0].imageUrl, 'aplus-content');
            }
        },
        onEscape: () => {
            if (elements.lightbox && !elements.lightbox.classList.contains('hidden')) closeLightbox();
            if (elements.favoritesModal && !elements.favoritesModal.classList.contains('hidden')) closeFavoritesModal();
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
    // Initialize elements
    initElements();
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }


    // Initialize storage
    await imageStore.init();
    history.setImageStore(imageStore);
    favorites.setImageStore(imageStore);


    // Setup event listeners
    setupEventListeners();

    // Initialize comparison with 2 products
    addComparisonProduct(); // Your product
    addComparisonProduct(); // Competitor 1
    addComparisonFeature('Feature 1');

    // Render history and favorites
    renderHistory();
    renderFavorites();

    // Initial button state
    updateGenerateButton();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('a-plus');
    }
}

document.addEventListener('DOMContentLoaded', init);
