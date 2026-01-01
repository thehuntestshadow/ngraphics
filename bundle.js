/**
 * Bundle Studio - Product Bundle Image Generator
 * Creates professional bundle/kit images from multiple product photos
 */

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ============================================
// APPLICATION STATE
// ============================================
const state = {
    products: [], // Array of { id, imageBase64, thumbnail, name, description, analyzed }
    nextProductId: 1,

    // Layout & Presentation
    layout: 'flat-lay',
    container: 'none',
    customContainer: '',
    background: 'white',
    surface: 'white-marble',
    customSurface: '',
    lifestyleScene: '',

    // Advanced options
    bundleTitle: '',
    showLabels: false,
    showNumbering: false,
    visualStyle: 'commercial',
    lighting: 'bright',
    aspectRatio: '1:1',
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
const imageStore = new ImageStore('bundle_images');
const history = new SharedHistory('bundle_studio_history', 20);
const favorites = new SharedFavorites('bundle_studio_favorites', 30);

// ============================================
// LAYOUT DESCRIPTIONS
// ============================================
const layoutDescriptions = {
    'flat-lay': 'Arrange the products in a flat lay composition, photographed from directly above (bird\'s eye view). Products should be artfully scattered with intentional spacing, as seen in lifestyle flat lay photography.',

    'grouped': 'Arrange the products in a natural grouping, as if casually placed together on a surface. Products can slightly overlap or lean against each other to create depth. The arrangement should feel organic and inviting.',

    'grid': 'Arrange the products in a clean, organized grid pattern with equal spacing. Each product should be clearly separated with consistent margins. This is a clinical, e-commerce style arrangement prioritizing clarity.',

    'hero': 'Feature the first/main product prominently (larger, centered or foreground). Arrange the supporting products smaller, around or behind the hero product. The main product should be the clear focal point.',

    'unboxing': 'Show the products arranged in and around an open container/box. Some items inside the container, some spilling out or placed beside it. Create the feeling of a gift being unwrapped or subscription box being opened. Include tissue paper or appropriate packing material.',

    'numbered': 'Arrange products in a clear sequence (left to right or in a pattern). Each product should have a visible number indicator (1, 2, 3...) near it. The numbering suggests order of use or what\'s included.'
};

const containerDescriptions = {
    'none': '',
    'gift-box': 'Place products in or around an elegant gift box with lid.',
    'shipping-box': 'Show products in a clean cardboard shipping box.',
    'pouch': 'Include a fabric pouch or drawstring bag containing some items.',
    'tray': 'Arrange products on a decorative tray or plate.',
    'basket': 'Arrange products in or around a woven basket.'
};

const surfaceDescriptions = {
    'white-marble': 'Products are arranged on a white/gray marble surface.',
    'light-wood': 'Products are arranged on a light natural wood surface.',
    'dark-wood': 'Products are arranged on a dark walnut or mahogany wood surface.',
    'linen': 'Products are arranged on a natural linen or cotton fabric surface.',
    'concrete': 'Products are arranged on a smooth concrete or stone surface.',
    'terrazzo': 'Products are arranged on a terrazzo surface with colorful speckles.'
};

const styleDescriptions = {
    'commercial': 'Clean, commercial product photography style suitable for e-commerce.',
    'editorial': 'Editorial magazine-quality photography with artistic composition.',
    'lifestyle': 'Lifestyle photography that feels natural and relatable.',
    'minimal': 'Minimalist aesthetic with plenty of negative space.',
    'luxury': 'Luxury, high-end aesthetic with premium feel.'
};

const lightingDescriptions = {
    'bright': 'Bright, even studio lighting.',
    'soft': 'Soft, diffused lighting with gentle shadows.',
    'natural': 'Natural window light with soft shadows.',
    'dramatic': 'Dramatic lighting with strong shadows and highlights.',
    'warm': 'Warm, golden hour style lighting.'
};

const qualityDescriptions = {
    'standard': 'Professional product photography.',
    'high': 'Professional high-quality product photography, sharp details, 4K resolution.',
    'ultra': '8K ultra high resolution, magazine-quality product photography, shot with professional medium format camera, perfectly retouched.',
    'masterpiece': 'Award-winning masterpiece product photography, luxury brand campaign quality, shot by world-renowned still life photographer, 8K ultra-detailed, perfect lighting and composition, gallery-worthy.'
};

// ============================================
// DOM ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Form
        form: document.getElementById('bundleForm'),

        // Products
        productGrid: document.getElementById('productGrid'),
        productCount: document.getElementById('productCount'),

        // Layout
        layoutOptions: document.getElementById('layoutOptions'),

        // Presentation
        containerSelect: document.getElementById('containerSelect'),
        customContainerRow: document.getElementById('customContainerRow'),
        customContainerInput: document.getElementById('customContainerInput'),

        // Background
        backgroundSelect: document.getElementById('backgroundSelect'),
        surfaceRow: document.getElementById('surfaceRow'),
        surfaceSelect: document.getElementById('surfaceSelect'),
        customSurfaceRow: document.getElementById('customSurfaceRow'),
        customSurfaceInput: document.getElementById('customSurfaceInput'),
        lifestyleRow: document.getElementById('lifestyleRow'),
        lifestyleInput: document.getElementById('lifestyleInput'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedContent: document.getElementById('advancedContent'),
        bundleTitleInput: document.getElementById('bundleTitleInput'),
        visualStyleSelect: document.getElementById('visualStyleSelect'),
        lightingSelect: document.getElementById('lightingSelect'),
        aspectRatioSelect: document.getElementById('aspectRatioSelect'),
        randomSeedCheck: document.getElementById('randomSeedCheck'),
        seedInput: document.getElementById('seedInput'),
        negativePromptInput: document.getElementById('negativePromptInput'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),
        generateHelper: document.getElementById('generateHelper'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Generate
        loadingStatus: document.getElementById('loadingStatus'),

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
        compareBtn: document.getElementById('compareBtn'),
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),

        // Feedback
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History
        historyPanel: document.getElementById('historyPanel'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),

        // Favorites
        favoritesPanel: document.getElementById('favoritesPanel'),
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

        // Product Edit Modal
        productEditModal: document.getElementById('productEditModal'),
        productEditClose: document.getElementById('productEditClose'),
        productEditImage: document.getElementById('productEditImage'),
        productEditName: document.getElementById('productEditName'),
        productEditDescription: document.getElementById('productEditDescription'),
        productEditCancel: document.getElementById('productEditCancel'),
        productEditSave: document.getElementById('productEditSave'),

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

function updateGenerateButton() {
    const productCount = state.products.length;
    const canGenerate = productCount >= 2 && !state.isGenerating;

    elements.generateBtn.disabled = !canGenerate;

    if (productCount < 2) {
        elements.generateHelper.textContent = `Add ${2 - productCount} more product${2 - productCount > 1 ? 's' : ''} to generate`;
    } else {
        elements.generateHelper.textContent = `Ready to generate with ${productCount} products`;
    }
    elements.generateHelper.style.display = canGenerate ? 'none' : 'block';
}

function updateProductCount() {
    elements.productCount.textContent = `${state.products.length}/6`;
    updateGenerateButton();
}

function updateLoadingStatus(message) {
    if (elements.loadingStatus) {
        elements.loadingStatus.textContent = message;
    }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================
function addProduct(file, slotIndex) {
    if (state.products.length >= 6) {
        showError('Maximum 6 products allowed');
        return;
    }

    const slot = elements.productGrid.querySelectorAll('.product-slot')[slotIndex];
    slot.classList.add('analyzing');

    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageBase64 = e.target.result;

        // Create thumbnail
        const thumbnail = await createThumbnail(imageBase64, 200);

        const product = {
            id: state.nextProductId++,
            slotIndex,
            imageBase64,
            thumbnail,
            name: '',
            description: '',
            quantity: 1,
            analyzed: false
        };

        state.products.push(product);
        renderProductSlot(slotIndex, product);
        updateProductCount();

        // Auto-analyze
        await analyzeProduct(product.id);
    };
    reader.readAsDataURL(file);
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

function removeProduct(productId) {
    const productIndex = state.products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;

    const product = state.products[productIndex];
    const slotIndex = product.slotIndex;

    state.products.splice(productIndex, 1);
    clearProductSlot(slotIndex);
    updateProductCount();
}

function updateProductQuantity(productId, delta) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const newQuantity = Math.max(1, Math.min(12, (product.quantity || 1) + delta));
    product.quantity = newQuantity;

    // Update the display
    const slot = elements.productGrid.querySelector(`[data-product-id="${productId}"]`);
    if (slot) {
        const qtyValue = slot.querySelector('.qty-value');
        if (qtyValue) qtyValue.textContent = newQuantity;
    }
}

function renderProductSlot(slotIndex, product) {
    const slot = elements.productGrid.querySelectorAll('.product-slot')[slotIndex];
    const img = slot.querySelector('.product-slot-image');
    const nameEl = slot.querySelector('.product-slot-name');
    const qtyValue = slot.querySelector('.qty-value');

    slot.classList.remove('analyzing');
    slot.classList.add('filled');
    slot.dataset.productId = product.id;
    img.src = product.thumbnail || product.imageBase64;
    nameEl.textContent = product.name || 'Product';
    if (qtyValue) qtyValue.textContent = product.quantity || 1;
}

function clearProductSlot(slotIndex) {
    const slot = elements.productGrid.querySelectorAll('.product-slot')[slotIndex];
    const img = slot.querySelector('.product-slot-image');
    const nameEl = slot.querySelector('.product-slot-name');
    const qtyValue = slot.querySelector('.qty-value');

    slot.classList.remove('filled', 'analyzing');
    delete slot.dataset.productId;
    img.src = '';
    nameEl.textContent = '';
    if (qtyValue) qtyValue.textContent = '1';
}

async function analyzeProduct(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const slot = elements.productGrid.querySelectorAll('.product-slot')[product.slotIndex];
    slot.classList.add('analyzing');

    try {
        const result = await api.analyzeImage({
            image: product.imageBase64,
            model: 'google/gemini-2.0-flash-exp:free',
            prompt: `Analyze this product image. Respond in JSON format only:
{
    "name": "Brief product name (2-4 words)",
    "description": "Detailed description including type, color, material, notable features (1-2 sentences)"
}
Do not include any other text, only valid JSON.`
        });

        const content = result.text || '';

        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            product.name = parsed.name || `Product ${product.id}`;
            product.description = parsed.description || '';
            product.analyzed = true;
        } else {
            product.name = `Product ${product.id}`;
            product.analyzed = false;
        }
    } catch (error) {
        console.error('Product analysis failed:', error);
        product.name = `Product ${product.id}`;
        product.analyzed = false;
    }

    slot.classList.remove('analyzing');
    renderProductSlot(product.slotIndex, product);
}

// ============================================
// PRODUCT EDIT MODAL
// ============================================
let editingProductId = null;

function openProductEditModal(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    elements.productEditImage.src = product.thumbnail || product.imageBase64;
    elements.productEditName.value = product.name || '';
    elements.productEditDescription.value = product.description || '';
    elements.productEditModal.classList.add('visible');
}

function closeProductEditModal() {
    elements.productEditModal.classList.remove('visible');
    editingProductId = null;
}

function saveProductEdit() {
    if (!editingProductId) return;

    const product = state.products.find(p => p.id === editingProductId);
    if (!product) return;

    product.name = elements.productEditName.value.trim() || `Product ${product.id}`;
    product.description = elements.productEditDescription.value.trim();

    renderProductSlot(product.slotIndex, product);
    closeProductEditModal();
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const productCount = state.products.length;
    const totalUnits = state.products.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const hasMultipleQuantities = state.products.some(p => (p.quantity || 1) > 1);

    const productDescriptions = state.products
        .map((p, i) => {
            const qty = p.quantity || 1;
            const qtyText = qty > 1 ? ` (×${qty} units)` : '';
            return `${i + 1}. ${p.name}${qtyText}${p.description ? ': ' + p.description : ''}`;
        })
        .join('\n');

    // Get quality level (default to 'high' if not set)
    const qualityLevel = state.qualityLevel || 'high';
    const qualityDesc = qualityDescriptions[qualityLevel] || qualityDescriptions.high;

    const bundleDesc = hasMultipleQuantities
        ? `${totalUnits} total units (${productCount} unique products)`
        : `${productCount} items`;

    let prompt = `Create a ${qualityDesc.toLowerCase()}

TASK: Generate a product bundle image showing ${bundleDesc} arranged together as a cohesive set.${hasMultipleQuantities ? ' Some products appear multiple times as indicated.' : ''}

CRITICAL: I am providing reference images of the actual products. Each product must appear EXACTLY as shown - same colors, labels, packaging, and details. Do NOT modify, reinterpret, or stylize any product.

PRODUCTS IN BUNDLE:
${productDescriptions}

`;

    // Layout
    prompt += `LAYOUT: ${layoutDescriptions[state.layout]}\n\n`;

    // Container
    if (state.container !== 'none') {
        if (state.container === 'custom' && state.customContainer) {
            prompt += `CONTAINER: ${state.customContainer}\n\n`;
        } else if (containerDescriptions[state.container]) {
            prompt += `CONTAINER: ${containerDescriptions[state.container]}\n\n`;
        }
    }

    // Background
    if (state.background === 'white') {
        prompt += 'BACKGROUND: Clean white or very light gray background.\n\n';
    } else if (state.background === 'gradient') {
        prompt += 'BACKGROUND: Subtle gradient background that complements the products.\n\n';
    } else if (state.background === 'surface') {
        if (state.surface === 'custom' && state.customSurface) {
            prompt += `SURFACE: ${state.customSurface}\n\n`;
        } else if (surfaceDescriptions[state.surface]) {
            prompt += `SURFACE: ${surfaceDescriptions[state.surface]}\n\n`;
        }
    } else if (state.background === 'lifestyle' && state.lifestyleScene) {
        prompt += `SETTING: ${state.lifestyleScene}\n\n`;
    }

    // Labels & Numbering
    const overlayInstructions = [];
    if (state.showLabels) {
        overlayInstructions.push('Include small, elegant labels showing each product name');
    }
    if (state.showNumbering) {
        overlayInstructions.push('Include subtle numbering (1, 2, 3...) next to each product');
    }
    if (state.bundleTitle) {
        overlayInstructions.push(`Display the title "${state.bundleTitle}" elegantly in the image`);
    }
    if (overlayInstructions.length > 0) {
        prompt += `TEXT/LABELS:\n${overlayInstructions.map(i => `- ${i}`).join('\n')}\n\n`;
    }

    // Style & Technical
    prompt += `PHOTOGRAPHY STYLE: ${styleDescriptions[state.visualStyle]}
LIGHTING: ${lightingDescriptions[state.lighting]}
ASPECT RATIO: ${state.aspectRatio}

QUALITY REQUIREMENTS:
- Every product must be clearly visible and identifiable
- Maintain consistent lighting and shadows across all items
- Sharp focus on all products
- Colors must be accurate to the reference images
- The composition should feel cohesive, as if all products belong together as a set
- Photorealistic result, not illustrated or stylized`;

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
async function generateBundle() {
    if (state.products.length < 2) {
        showError('Add at least 2 products to generate a bundle image');
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

    const model = elements.aiModel.value;

    // Build message content with all product images
    const messageContent = [
        { type: 'text', text: prompt }
    ];

    // Add all product images
    state.products.forEach((product, index) => {
        messageContent.push({
            type: 'image_url',
            image_url: { url: product.imageBase64 }
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
        let generatedCount = 1;

        if (state.variations === 1) {
            requestBody.seed = baseSeed;
            updateLoadingStatus('Generating bundle image...');
            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
            generatedCount = 1;
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
            generatedCount = successfulImages.length;
        }

        // Record cost
        SharedCostEstimator.recordCost(model, generatedCount, 'bundleStudio', prompt.length);
        updateCostEstimator();

        showSuccess('Bundle image generated!');

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

    const model = elements.aiModel.value;

    // Build adjustment prompt
    const adjustmentPrompt = `Here is an image I generated previously, along with the original generation prompt. Please regenerate this image with the following adjustments:

ADJUSTMENT REQUEST: ${feedback}

ORIGINAL PROMPT: ${state.lastPrompt}

Keep the same overall composition and style, but apply the requested adjustments. Generate a new bundle product image.`;

    // Build message content with previous image + products
    const messageContent = [
        { type: 'text', text: adjustmentPrompt },
        { type: 'image_url', image_url: { url: state.generatedImageUrl } }
    ];

    // Add product images for reference
    state.products.forEach(product => {
        messageContent.push({
            type: 'image_url',
            image_url: { url: product.imageBase64 }
        });
    });

    const requestBody = {
        model: model,
        messages: [{ role: 'user', content: messageContent }],
        modalities: ['image', 'text'],
        max_tokens: 4096,
        seed: state.lastSeed // Use same seed for consistency
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
        title: 'Bundle Studio'
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

    // Hide compare button for single image
    if (elements.compareBtn) {
        elements.compareBtn.style.display = 'none';
    }

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

    // Show compare button for multiple images
    if (elements.compareBtn) {
        elements.compareBtn.style.display = imageUrls.length >= 2 ? 'inline-flex' : 'none';
    }

    // Hide placeholder
    const placeholder = elements.resultContainer.querySelector('.output-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Add all to history
    imageUrls.forEach(url => addToHistory(url));
}

// ============================================
// HISTORY (uses IndexedDB for images)
// ============================================
async function addToHistory(imageUrl) {
    await history.add(imageUrl, {
        seed: state.lastSeed,
        layout: state.layout,
        productCount: state.products.length,
        imageUrls: [imageUrl]
    });
    renderHistory();
}

function renderHistory() {
    const panel = elements.historyPanel;
    const count = history.count;
    elements.historyCount.textContent = count;

    if (count === 0) {
        panel.classList.remove('has-items');
        elements.historyGrid.style.display = 'none';
        elements.historyEmpty.style.display = 'none';
        return;
    }

    panel.classList.add('has-items');
    elements.historyGrid.style.display = 'grid';
    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = history.getAll().map(item => {
        // Use thumbnail for grid display
        const imgSrc = item.thumbnail || item.imageUrl;
        return `
            <div class="history-item" data-id="${item.id}">
                <img src="${imgSrc}" alt="Generated bundle" loading="lazy">
            </div>
        `;
    }).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = parseInt(item.dataset.id, 10);
            const historyItem = history.findById(id);
            if (historyItem) {
                // Fetch full image from IndexedDB
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
    const name = state.bundleTitle || `Bundle (${state.products.length} items)`;

    try {
        const favorite = await favorites.add({
            name,
            imageUrl: state.generatedImageUrl,
            imageUrls: state.generatedImages,
            seed: state.lastSeed,
            prompt: state.lastPrompt,
            productImages: state.products.map(p => ({
                name: p.name,
                thumbnail: p.thumbnail
            })),
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
        layout: state.layout,
        container: state.container,
        customContainer: state.customContainer,
        background: state.background,
        surface: state.surface,
        customSurface: state.customSurface,
        lifestyleScene: state.lifestyleScene,
        bundleTitle: state.bundleTitle,
        showLabels: state.showLabels,
        showNumbering: state.showNumbering,
        visualStyle: state.visualStyle,
        lighting: state.lighting,
        aspectRatio: state.aspectRatio,
        variations: state.variations,
        negativePrompt: state.negativePrompt,
        model: elements.aiModel.value
    };
}

function renderFavorites() {
    const panel = elements.favoritesPanel;
    const items = favorites.getAll();
    elements.favoritesCount.textContent = items.length;

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.favoritesGrid.style.display = 'none';
        elements.favoritesEmpty.style.display = 'none';
        return;
    }

    panel.classList.add('has-items');
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

    // Restore state
    if (settings.layout) state.layout = settings.layout;
    if (settings.container) state.container = settings.container;
    if (settings.customContainer) state.customContainer = settings.customContainer;
    if (settings.background) state.background = settings.background;
    if (settings.surface) state.surface = settings.surface;
    if (settings.customSurface) state.customSurface = settings.customSurface;
    if (settings.lifestyleScene) state.lifestyleScene = settings.lifestyleScene;
    if (settings.bundleTitle) state.bundleTitle = settings.bundleTitle;
    if (typeof settings.showLabels === 'boolean') state.showLabels = settings.showLabels;
    if (typeof settings.showNumbering === 'boolean') state.showNumbering = settings.showNumbering;
    if (settings.visualStyle) state.visualStyle = settings.visualStyle;
    if (settings.lighting) state.lighting = settings.lighting;
    if (settings.aspectRatio) state.aspectRatio = settings.aspectRatio;
    if (settings.variations) state.variations = settings.variations;
    if (settings.negativePrompt) state.negativePrompt = settings.negativePrompt;

    // Restore seed
    if (state.selectedFavorite.seed) {
        state.useRandomSeed = false;
        state.seed = state.selectedFavorite.seed;
        elements.randomSeedCheck.checked = false;
        elements.seedInput.disabled = false;
        elements.seedInput.value = state.selectedFavorite.seed;
    }

    // Restore form values
    updateFormFromState();

    closeFavoritesModal();
    showSuccess('Settings loaded. Upload products and generate!');
}

function updateFormFromState() {
    // Layout
    elements.layoutOptions.querySelectorAll('.layout-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.layout === state.layout);
    });

    // Selects
    elements.containerSelect.value = state.container;
    elements.customContainerInput.value = state.customContainer;
    elements.backgroundSelect.value = state.background;
    elements.surfaceSelect.value = state.surface;
    elements.customSurfaceInput.value = state.customSurface;
    elements.lifestyleInput.value = state.lifestyleScene;
    elements.bundleTitleInput.value = state.bundleTitle;
    elements.visualStyleSelect.value = state.visualStyle;
    elements.lightingSelect.value = state.lighting;
    elements.aspectRatioSelect.value = state.aspectRatio;
    elements.negativePromptInput.value = state.negativePrompt;

    // Toggles
    document.querySelectorAll('[data-labels]').forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.labels === 'on') === state.showLabels);
    });
    document.querySelectorAll('[data-numbering]').forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.numbering === 'on') === state.showNumbering);
    });
    document.querySelectorAll('[data-variations]').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.variations, 10) === state.variations);
    });

    // Update conditional visibility
    updateConditionalRows();
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
        generateBundle();
    });

    // Product file inputs
    elements.productGrid.querySelectorAll('.product-file-input').forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                addProduct(e.target.files[0], parseInt(e.target.dataset.slot, 10));
            }
        });
    });

    // Product slot clicks
    elements.productGrid.querySelectorAll('.product-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            if (slot.classList.contains('filled')) return;
            if (e.target.closest('.product-slot-btn')) return;
            const input = slot.querySelector('.product-file-input');
            input.click();
        });
    });

    // Product edit/remove buttons
    elements.productGrid.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = btn.closest('.product-slot');
            const productId = parseInt(slot.dataset.productId, 10);
            if (productId) openProductEditModal(productId);
        });
    });

    elements.productGrid.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = btn.closest('.product-slot');
            const productId = parseInt(slot.dataset.productId, 10);
            if (productId) removeProduct(productId);
        });
    });

    // Quantity controls
    elements.productGrid.querySelectorAll('.qty-decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = btn.closest('.product-slot');
            const productId = parseInt(slot.dataset.productId, 10);
            if (productId) updateProductQuantity(productId, -1);
        });
    });

    elements.productGrid.querySelectorAll('.qty-increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const slot = btn.closest('.product-slot');
            const productId = parseInt(slot.dataset.productId, 10);
            if (productId) updateProductQuantity(productId, 1);
        });
    });

    // Product edit modal
    elements.productEditClose.addEventListener('click', closeProductEditModal);
    elements.productEditCancel.addEventListener('click', closeProductEditModal);
    elements.productEditSave.addEventListener('click', saveProductEdit);
    elements.productEditModal.querySelector('.modal-backdrop').addEventListener('click', closeProductEditModal);

    // Layout options
    elements.layoutOptions.querySelectorAll('.layout-option').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.layoutOptions.querySelectorAll('.layout-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.layout = btn.dataset.layout;
        });
    });

    // Container select
    elements.containerSelect.addEventListener('change', () => {
        state.container = elements.containerSelect.value;
        updateConditionalRows();
    });

    elements.customContainerInput.addEventListener('input', () => {
        state.customContainer = elements.customContainerInput.value;
    });

    // Background select
    elements.backgroundSelect.addEventListener('change', () => {
        state.background = elements.backgroundSelect.value;
        updateConditionalRows();
    });

    elements.surfaceSelect.addEventListener('change', () => {
        state.surface = elements.surfaceSelect.value;
        updateConditionalRows();
    });

    elements.customSurfaceInput.addEventListener('input', () => {
        state.customSurface = elements.customSurfaceInput.value;
    });

    elements.lifestyleInput.addEventListener('input', () => {
        state.lifestyleScene = elements.lifestyleInput.value;
    });

    // Advanced toggle
    elements.advancedToggle.addEventListener('click', () => {
        const section = elements.advancedToggle.closest('.advanced-section');
        section.classList.toggle('open');
    });

    // Advanced options
    elements.bundleTitleInput.addEventListener('input', () => {
        state.bundleTitle = elements.bundleTitleInput.value;
    });

    elements.visualStyleSelect.addEventListener('change', () => {
        state.visualStyle = elements.visualStyleSelect.value;
    });

    elements.lightingSelect.addEventListener('change', () => {
        state.lighting = elements.lightingSelect.value;
    });

    elements.aspectRatioSelect.addEventListener('change', () => {
        state.aspectRatio = elements.aspectRatioSelect.value;
    });

    elements.negativePromptInput.addEventListener('input', () => {
        state.negativePrompt = elements.negativePromptInput.value;
    });

    // Toggle buttons
    document.querySelectorAll('[data-labels]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-labels]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.showLabels = btn.dataset.labels === 'on';
        });
    });

    document.querySelectorAll('[data-numbering]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-numbering]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.showNumbering = btn.dataset.numbering === 'on';
        });
    });

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

    // Result actions
    elements.favoriteBtn.addEventListener('click', saveFavorite);

    elements.downloadBtn.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            SharedDownload.downloadImage(state.generatedImageUrl, 'bundle');
        }
    });

    // Copy Prompt
    if (elements.copyPromptBtn) {
        elements.copyPromptBtn.addEventListener('click', () => {
            if (state.lastPrompt) {
                navigator.clipboard.writeText(state.lastPrompt).then(() => {
                    const btn = elements.copyPromptBtn;
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `;
                    btn.title = 'Copied!';
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.title = 'Copy prompt';
                    }, 2000);
                });
            }
        });
    }

    // Compare button
    if (elements.compareBtn) {
        elements.compareBtn.addEventListener('click', () => {
            if (state.generatedImages && state.generatedImages.length >= 2) {
                SharedComparison.openModal(
                    state.generatedImages[0],
                    state.generatedImages[1],
                    { label1: 'Variation 1', label2: 'Variation 2' }
                );
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
                    model: elements.aiModel?.value || 'google/gemini-3-pro-image-preview',
                    dimensions: state.aspectRatio || '1:1',
                    style: state.visualStyle || 'Commercial',
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
        const confirmed = await SharedUI.confirm('Are you sure you want to clear all history? Items will be moved to trash.', {
            title: 'Clear History',
            confirmText: 'Clear All',
            icon: 'warning'
        });
        if (confirmed) {
            // Move all items to trash before clearing
            const items = history.getAll();
            items.forEach(item => {
                SharedTrash.add(item, 'history', 'bundleStudio');
            });

            await history.clear();
            renderHistory();
            showSuccess(`${items.length} items moved to trash`);
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

    // Keyboard shortcuts with ? help modal
    document.addEventListener('keydown', (e) => {
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

        if (e.key === 'Escape') {
            if (SharedKeyboard._modalVisible) {
                SharedKeyboard.hideShortcutsModal();
            } else if (elements.lightbox.classList.contains('active')) {
                SharedLightbox.close(elements.lightbox);
            } else if (elements.favoritesModal.classList.contains('active')) {
                closeFavoritesModal();
            }
        }

        // ? - show keyboard shortcuts
        if (e.key === '?' && !isTyping) {
            e.preventDefault();
            SharedKeyboard.showShortcutsModal([
                { key: 'Ctrl+Enter', action: 'generate', description: 'Generate bundle' },
                { key: 'Ctrl+D', action: 'download', description: 'Download current image' },
                { key: 'Escape', action: 'close', description: 'Close modals' },
                { key: '?', action: 'help', description: 'Show this help' }
            ]);
        }

        // Ctrl/Cmd + Enter - generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBundle();
        }

        // Ctrl/Cmd + D - download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.generatedImageUrl) {
            e.preventDefault();
            SharedDownload.downloadImage(state.generatedImageUrl, 'bundle');
        }
    });
}

function updateConditionalRows() {
    // Container custom row
    elements.customContainerRow.style.display = state.container === 'custom' ? 'flex' : 'none';

    // Background rows
    elements.surfaceRow.style.display = state.background === 'surface' ? 'flex' : 'none';
    elements.customSurfaceRow.style.display = state.background === 'surface' && state.surface === 'custom' ? 'flex' : 'none';
    elements.lifestyleRow.style.display = state.background === 'lifestyle' ? 'flex' : 'none';
}

// ============================================
// PRESET SELECTOR (SharedPresets Integration)
// ============================================
function getCurrentSettings() {
    return {
        model: elements.aiModel?.value,
        layout: state.layout,
        container: state.container,
        customContainer: state.customContainer,
        background: state.background,
        surface: state.surface,
        customSurface: state.customSurface,
        showLabels: state.showLabels,
        showNumbering: state.showNumbering,
        visualStyle: state.visualStyle,
        lighting: state.lighting,
        aspectRatio: state.aspectRatio,
        variations: state.variations
    };
}

function applySettings(settings) {
    if (!settings) return;

    // Update state
    if (settings.layout) state.layout = settings.layout;
    if (settings.container) state.container = settings.container;
    if (settings.customContainer) state.customContainer = settings.customContainer;
    if (settings.background) state.background = settings.background;
    if (settings.surface) state.surface = settings.surface;
    if (settings.customSurface) state.customSurface = settings.customSurface;
    if (typeof settings.showLabels === 'boolean') state.showLabels = settings.showLabels;
    if (typeof settings.showNumbering === 'boolean') state.showNumbering = settings.showNumbering;
    if (settings.visualStyle) state.visualStyle = settings.visualStyle;
    if (settings.lighting) state.lighting = settings.lighting;
    if (settings.aspectRatio) state.aspectRatio = settings.aspectRatio;
    if (settings.variations) state.variations = settings.variations;

    // Update form elements
    if (settings.model && elements.aiModel) elements.aiModel.value = settings.model;
    if (settings.layout && elements.layoutSelect) elements.layoutSelect.value = settings.layout;
    if (settings.container && elements.containerSelect) elements.containerSelect.value = settings.container;
    if (settings.background && elements.backgroundSelect) elements.backgroundSelect.value = settings.background;
    if (settings.surface && elements.surfaceSelect) elements.surfaceSelect.value = settings.surface;
    if (settings.visualStyle && elements.visualStyleSelect) elements.visualStyleSelect.value = settings.visualStyle;
    if (settings.lighting && elements.lightingSelect) elements.lightingSelect.value = settings.lighting;
    if (settings.aspectRatio && elements.aspectRatioSelect) elements.aspectRatioSelect.value = settings.aspectRatio;

    // Update checkboxes
    if (elements.showLabelsCheck) elements.showLabelsCheck.checked = state.showLabels;
    if (elements.showNumberingCheck) elements.showNumberingCheck.checked = state.showNumbering;

    // Update variations
    document.querySelectorAll('[name="variations"]').forEach(radio => {
        radio.checked = radio.value === String(state.variations);
    });

    updateConditionalRows();
    showSuccess('Settings applied!');
}

function initPresetSelector() {
    const container = document.getElementById('presetSelectorContainer');
    if (!container) return;

    SharedPresets.renderSelector(
        'bundles',
        (preset) => {
            if (preset && preset.settings) {
                applySettings(preset.settings);
            }
        },
        () => getCurrentSettings(),
        container
    );
}

// ============================================
// COST ESTIMATOR (SharedCostEstimator Integration)
// ============================================
function initCostEstimator() {
    const container = document.getElementById('costEstimatorContainer');
    if (!container) return;

    const modelId = elements.aiModel?.value || 'google/gemini-3-pro-image-preview';
    const variations = state.variations || 1;
    SharedCostEstimator.renderDisplay(modelId, variations, 500, container);

    // Update when model changes
    if (elements.aiModel) {
        elements.aiModel.addEventListener('change', updateCostEstimator);
    }

    // Update when variations change
    document.querySelectorAll('input[name="variations"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.variations = parseInt(radio.value) || 1;
            updateCostEstimator();
        });
    });
}

function updateCostEstimator() {
    const container = document.getElementById('costEstimatorContainer');
    if (!container) return;

    const modelId = elements.aiModel?.value || 'google/gemini-3-pro-image-preview';
    const variations = state.variations || 1;
    SharedCostEstimator.updateDisplay(container, modelId, variations, 500);
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
    updateConditionalRows();
    updateGenerateButton();

    // Load history and favorites
    await imageStore.init();
    history.setImageStore(imageStore);
    favorites.setImageStore(imageStore);
    history.load();
    renderHistory();
    renderFavorites();

    // Initialize preset selector and cost estimator
    initPresetSelector();
    initCostEstimator();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('bundle');
    }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
