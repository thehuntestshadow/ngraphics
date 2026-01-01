/**
 * Size Visualizer - HEFAISTOS
 * Show product scale with reference objects
 */

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    history: [],
    lastPrompt: null,
    lastSeed: null,

    // Product info
    productDescription: '',
    productWidth: null,
    productHeight: null,
    productDepth: null,
    dimensionUnit: 'cm',

    // Reference & Display
    referenceObject: 'hand',
    displayMode: 'side-by-side',
    contextScene: 'desk',

    // Measurement options
    showDimensions: true,
    showScale: false,
    showGrid: false,

    // Visual
    visualStyle: 'clean',
    background: 'white',
    aspectRatio: '1:1',

    // Advanced
    multiAngle: 'single',
    aiModel: 'google/gemini-3-pro-image-preview',
    seed: '',
    negativePrompt: '',
    variations: 1,

    // UI
    selectedFavorite: null
};

// ============================================
// ELEMENTS
// ============================================

let elements = {};

function initElements() {
    elements = {
        // Form
        sizeVisualizerForm: document.getElementById('sizeVisualizerForm'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),

        // Product Info
        productDescription: document.getElementById('productDescription'),
        productWidth: document.getElementById('productWidth'),
        productHeight: document.getElementById('productHeight'),
        productDepth: document.getElementById('productDepth'),

        // Context options
        contextOptions: document.getElementById('contextOptions'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        multiAngle: document.getElementById('multiAngle'),
        seedInput: document.getElementById('seedInput'),
        randomSeedCheck: document.getElementById('randomSeedCheck'),
        negativePrompt: document.getElementById('negativePrompt'),

        // Visual options
        visualStyle: document.getElementById('visualStyle'),
        background: document.getElementById('background'),
        aspectRatio: document.getElementById('aspectRatio'),

        // Measurement toggles
        showDimensions: document.getElementById('showDimensions'),
        showScale: document.getElementById('showScale'),
        showGrid: document.getElementById('showGrid'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Output
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        skeletonGrid: document.getElementById('skeletonGrid'),
        resultContainer: document.getElementById('resultContainer'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),

        // Actions
        downloadBtn: document.getElementById('downloadBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
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

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxDownload: document.getElementById('lightboxDownload'),

        // Favorites Modal
        favoritesModal: document.getElementById('favoritesModal'),
        closeFavoritesModal: document.getElementById('closeFavoritesModal'),
        favoritePreviewImg: document.getElementById('favoritePreviewImg'),
        favoriteVariants: document.getElementById('favoriteVariants'),
        favoriteNameInput: document.getElementById('favoriteNameInput'),
        favoriteDate: document.getElementById('favoriteDate'),
        favoriteSeedValue: document.getElementById('favoriteSeedValue'),
        copyFavoriteSeed: document.getElementById('copyFavoriteSeed'),
        loadFavoriteBtn: document.getElementById('loadFavoriteBtn'),
        downloadFavoriteBtn: document.getElementById('downloadFavoriteBtn'),
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn')
    };
}

// ============================================
// DESCRIPTION MAPS
// ============================================

const referenceDescriptions = {
    'hand': {
        name: 'Human Hand',
        size: 'average adult hand (approximately 18-20cm length)',
        prompt: 'an adult human hand holding or positioned next to the product for scale reference'
    },
    'smartphone': {
        name: 'Smartphone',
        size: 'standard smartphone (approximately 15cm x 7cm)',
        prompt: 'a modern smartphone placed next to the product for size comparison'
    },
    'coin': {
        name: 'Coin',
        size: 'US quarter or similar coin (approximately 2.5cm diameter)',
        prompt: 'a coin placed next to the product to show small-scale dimensions'
    },
    'ruler': {
        name: 'Ruler',
        size: 'standard ruler with visible measurements',
        prompt: 'a measuring ruler placed alongside the product showing precise measurements'
    },
    'credit-card': {
        name: 'Credit Card',
        size: 'standard credit card (8.5cm x 5.4cm)',
        prompt: 'a credit card sized object next to the product for familiar size reference'
    },
    'pen': {
        name: 'Pen',
        size: 'standard ballpoint pen (approximately 14cm)',
        prompt: 'a pen placed next to the product for everyday size comparison'
    },
    'coffee-mug': {
        name: 'Coffee Mug',
        size: 'standard coffee mug (approximately 10cm height)',
        prompt: 'a coffee mug positioned next to the product for household scale reference'
    },
    'laptop': {
        name: 'Laptop',
        size: 'standard laptop (approximately 35cm width)',
        prompt: 'a laptop computer showing the product\'s size relative to common tech devices'
    },
    'person': {
        name: 'Person',
        size: 'full human figure for large products',
        prompt: 'a person standing next to or interacting with the product to show human-scale proportions'
    }
};

const displayModeDescriptions = {
    'side-by-side': {
        name: 'Side-by-Side',
        prompt: 'Place the product directly next to the reference object on the same surface, both clearly visible and at the same visual scale for easy comparison.'
    },
    'in-hand': {
        name: 'In Hand',
        prompt: 'Show the product being held in a human hand, demonstrating how it fits in the grip and its actual size relative to human hands.'
    },
    'context': {
        name: 'Context Scene',
        prompt: 'Place the product in a real-world environment where it would naturally be used, with surrounding objects providing natural scale context.'
    },
    'technical': {
        name: 'Technical Drawing',
        prompt: 'Create a technical blueprint-style visualization with dimension lines, measurements, and engineering-style annotations showing exact proportions.'
    }
};

const contextSceneDescriptions = {
    'desk': 'on a clean office desk or workspace with common desk items like a keyboard, mouse, or notebook nearby',
    'pocket': 'partially inserted into a pants or jacket pocket, showing portability',
    'bag': 'inside or next to an open bag or purse, demonstrating travel-friendly size',
    'shelf': 'on a shelf or bookcase with books and decorative items for home context',
    'car': 'in a car interior - cup holder, dashboard, or seat - showing automotive fit',
    'kitchen': 'on a kitchen counter with common kitchen items for household scale'
};

const visualStyleDescriptions = {
    'clean': 'Clean, professional e-commerce style photography with sharp focus, neutral background, and studio lighting',
    'lifestyle': 'Natural lifestyle photography with soft lighting and realistic environment',
    'minimal': 'Minimalist aesthetic with plenty of white space, simple composition, and focus on the product',
    'infographic': 'Infographic style with clean graphics, measurement annotations, and informational overlays',
    'blueprint': 'Technical blueprint style with grid background, dimension lines, and engineering aesthetic'
};

const backgroundDescriptions = {
    'white': 'Pure white or very light neutral background for maximum product visibility',
    'light-gray': 'Soft light gray background with subtle gradient for depth',
    'gradient': 'Subtle gradient background transitioning from light to slightly darker tones',
    'dark': 'Dark or black background for dramatic contrast and premium feel'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

const history = new SharedHistory('size_visualizer_history', 20);
const favorites = new SharedFavorites('size_visualizer_favorites', 30);

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const reference = referenceDescriptions[state.referenceObject];
    const displayMode = displayModeDescriptions[state.displayMode];
    const visualStyle = visualStyleDescriptions[state.visualStyle];
    const background = backgroundDescriptions[state.background];

    let dimensionText = '';
    if (state.productWidth || state.productHeight || state.productDepth) {
        const dims = [];
        if (state.productWidth) dims.push(`${state.productWidth}${state.dimensionUnit} wide`);
        if (state.productHeight) dims.push(`${state.productHeight}${state.dimensionUnit} tall`);
        if (state.productDepth) dims.push(`${state.productDepth}${state.dimensionUnit} deep`);
        dimensionText = `The product dimensions are: ${dims.join(', ')}.`;
    }

    let prompt = `Create a SIZE VISUALIZATION image for a product.

PRODUCT:
${state.productDescription || 'Product from the reference image'}
${dimensionText}

REFERENCE OBJECT:
Include ${reference.prompt}. The reference object is ${reference.size}.

DISPLAY MODE:
${displayMode.prompt}`;

    // Add context scene if in context mode
    if (state.displayMode === 'context' && contextSceneDescriptions[state.contextScene]) {
        prompt += `\n\nCONTEXT SCENE:\nPlace the product ${contextSceneDescriptions[state.contextScene]}.`;
    }

    // Add measurement options
    if (state.showDimensions) {
        prompt += '\n\nDIMENSION CALLOUTS:\nAdd clean, professional dimension lines and measurement callouts showing the product\'s actual size.';
    }
    if (state.showScale) {
        prompt += '\n\nSCALE INDICATOR:\nInclude a scale bar or ratio indicator (e.g., "1:1 scale" or measurement reference).';
    }
    if (state.showGrid) {
        prompt += '\n\nGRID OVERLAY:\nAdd a subtle measurement grid in the background for precise scale reference.';
    }

    // Add visual style
    prompt += `\n\nVISUAL STYLE:\n${visualStyle}`;
    prompt += `\n\nBACKGROUND:\n${background}`;

    // Add multi-angle if selected
    if (state.multiAngle !== 'single') {
        const angleDescriptions = {
            'front-side': 'Create a split or composite image showing both front and side views of the product with the reference object.',
            '3-views': 'Create a multi-panel image showing front, side, and top views of the product for comprehensive size understanding.',
            'all-angles': 'Create a comprehensive multi-angle view showing the product from multiple perspectives (front, back, sides, top) with scale reference.'
        };
        prompt += `\n\nMULTI-ANGLE VIEW:\n${angleDescriptions[state.multiAngle]}`;
    }

    // Critical requirements
    prompt += `

CRITICAL REQUIREMENTS:
- The reference object and product must be shown at ACCURATE relative scale
- Both objects should be clearly visible and in sharp focus
- The comparison should make the product's size immediately obvious
- Professional, high-quality photography standards
- The product from the reference image should be clearly recognizable`;

    // Add negative prompt if provided
    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    }

    return prompt;
}

// ============================================
// API INTEGRATION
// ============================================

async function generateVisualization() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    showLoading();
    updateLoadingStatus('Preparing size visualization...');
    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    try {
        const variationsCount = state.variations || 1;
        const useRandomSeed = elements.randomSeedCheck?.checked !== false;
        const baseSeed = useRandomSeed ? Math.floor(Math.random() * 1000000) : (parseInt(elements.seedInput?.value) || Math.floor(Math.random() * 1000000));
        state.lastSeed = baseSeed;

        updateLoadingStatus('Generating size visualization...');

        if (variationsCount === 1) {
            const imageUrl = await makeGenerationRequest(prompt, baseSeed);
            showResult(imageUrl);
        } else {
            updateLoadingStatus(`Generating ${variationsCount} variations...`);
            const requests = [];
            for (let i = 0; i < variationsCount; i++) {
                requests.push(
                    makeGenerationRequest(prompt, baseSeed + i)
                        .catch(err => {
                            console.error(`Variation ${i + 1} failed:`, err);
                            return null;
                        })
                );
            }

            updateLoadingStatus('Processing images...');
            const results = await Promise.all(requests);
            const successfulImages = results.filter(url => url !== null);

            if (successfulImages.length === 0) {
                throw new Error('All generation attempts failed');
            }

            showMultipleResults(successfulImages);
        }

        showSuccess('Size visualization generated successfully!');

    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to generate visualization');
    }
}

async function makeGenerationRequest(prompt, seed) {
    const result = await api.generateImage({
        model: DEFAULT_MODEL,
        prompt,
        images: state.uploadedImageBase64 ? [state.uploadedImageBase64] : [],
        seed,
        aspectRatio: state.aspectRatio
    });

    if (!result.image) {
        throw new Error('No image in response');
    }

    return result.image;
}

async function adjustVisualization() {
    const feedback = elements.feedbackTextarea?.value?.trim();
    if (!feedback) {
        showError('Please describe what adjustments you want');
        return;
    }

    if (!state.lastPrompt) {
        showError('No previous generation to adjust');
        return;
    }

    showLoading();
    updateLoadingStatus('Applying adjustments...');

    const adjustedPrompt = `${state.lastPrompt}

ADJUSTMENTS REQUESTED:
${feedback}

Please regenerate the size visualization with these specific changes applied while maintaining accurate scale representation.`;

    try {
        const baseSeed = state.lastSeed || Math.floor(Math.random() * 1000000);
        const imageUrl = await makeGenerationRequest(adjustedPrompt, baseSeed);
        showResult(imageUrl);
        showSuccess('Visualization adjusted successfully!');
        elements.feedbackTextarea.value = '';
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to adjust visualization');
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function updateSkeletonGrid(count = 1) {
    if (!elements.skeletonGrid) return;
    elements.skeletonGrid.className = `skeleton-grid cols-${count > 1 ? (count === 2 ? 2 : 4) : 1}`;
    let html = '';
    for (let i = 0; i < count; i++) {
        html += '<div class="skeleton-card"><div class="skeleton-image"></div></div>';
    }
    elements.skeletonGrid.innerHTML = html;
}

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultContainer.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.generateBtn.disabled = true;
    elements.generateBtn.classList.add('loading');
    updateSkeletonGrid(state.variations || 1);
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.generateBtn.disabled = false;
    elements.generateBtn.classList.remove('loading');
}

function updateLoadingStatus(message) {
    if (elements.loadingStatus) {
        elements.loadingStatus.textContent = message;
    }
}

function showResult(imageUrl) {
    hideLoading();
    elements.resultImage.src = imageUrl;
    elements.resultImage.style.display = 'block';
    elements.resultGrid.style.display = 'none';
    elements.resultContainer.style.display = 'block';
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];
    addToHistory(imageUrl);
}

function showMultipleResults(imageUrls) {
    hideLoading();
    elements.resultImage.style.display = 'none';
    elements.resultGrid.style.display = 'grid';
    elements.resultGrid.className = `result-grid grid-${imageUrls.length}`;

    elements.resultGrid.innerHTML = imageUrls.map((url, index) => `
        <div class="result-grid-item${index === 0 ? ' selected' : ''}" data-index="${index}">
            <img src="${url}" alt="Variation ${index + 1}">
            <span class="result-grid-item-badge">${index + 1}</span>
        </div>
    `).join('');

    elements.resultContainer.style.display = 'block';
    state.generatedImageUrl = imageUrls[0];
    state.generatedImages = imageUrls;

    // Add click handlers for selection
    elements.resultGrid.querySelectorAll('.result-grid-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.resultGrid.querySelectorAll('.result-grid-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const index = parseInt(item.dataset.index, 10);
            state.generatedImageUrl = imageUrls[index];
        });
    });

    addToHistory(imageUrls[0], imageUrls);
}

function showError(message) {
    const errorText = elements.errorMessage.querySelector('.error-text');
    if (errorText) errorText.textContent = message;
    elements.errorMessage.style.display = 'flex';
    setTimeout(() => {
        elements.errorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const content = elements.successMessage.querySelector('.message-content');
    if (content) content.textContent = message;
    elements.successMessage.style.display = 'flex';
    setTimeout(() => {
        elements.successMessage.style.display = 'none';
    }, 3000);
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory(imageUrl, allImages = null) {
    const images = allImages || [imageUrl];
    await history.add(imageUrl, {
        imageUrls: images,
        referenceObject: state.referenceObject,
        displayMode: state.displayMode,
        visualStyle: state.visualStyle,
        seed: state.lastSeed
    });
    state.history = history.getAll();
    renderHistory();
}

function renderHistory() {
    const panel = elements.historyPanel;
    const items = history.getAll();

    if (elements.historyCount) {
        elements.historyCount.textContent = items.length;
    }

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.historyGrid.style.display = 'none';
        elements.historyEmpty.style.display = 'none';
        elements.historyGrid.innerHTML = '';
        return;
    }

    panel.classList.add('has-items');
    elements.historyGrid.style.display = 'grid';
    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="History item" loading="lazy">
            ${item.imageUrls && item.imageUrls.length > 1 ? `<span class="history-item-variants">${item.imageUrls.length}</span>` : ''}
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = item.dataset.id;
            const historyItem = history.findById(id);
            if (historyItem) {
                const images = await history.getImages(id);
                if (images && images.length > 0) {
                    openLightbox(images[0]);
                } else if (historyItem.imageUrl) {
                    openLightbox(historyItem.imageUrl);
                }
            }
        });
    });
}

async function saveFavorite() {
    if (!state.generatedImageUrl) {
        showError('No image to save');
        return;
    }

    const settings = captureCurrentSettings();

    const favorite = await favorites.add({
        name: state.productDescription || `${referenceDescriptions[state.referenceObject].name} comparison`,
        imageUrl: state.generatedImageUrl,
        imageUrls: state.generatedImages,
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        productImageBase64: state.uploadedImageBase64,
        settings
    });

    if (favorite) {
        showSuccess('Added to favorites!');
        renderFavorites();
    }
}

function renderFavorites() {
    const panel = elements.favoritesPanel;
    const items = favorites.getAll();

    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = items.length;
    }

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.favoritesGrid.style.display = 'none';
        elements.favoritesEmpty.style.display = 'none';
        elements.favoritesGrid.innerHTML = '';
        return;
    }

    panel.classList.add('has-items');
    elements.favoritesGrid.style.display = 'grid';
    elements.favoritesEmpty.style.display = 'none';

    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.name || 'Favorite'}" loading="lazy">
            ${item.imageUrls && item.imageUrls.length > 1 ? `<span class="favorite-item-variants">${item.imageUrls.length}</span>` : ''}
            <div class="favorite-item-overlay">
                <button class="favorite-load-btn" title="Load settings">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10"/>
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                    </svg>
                </button>
                <button class="favorite-delete-btn" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    elements.favoritesGrid.querySelectorAll('.favorite-item').forEach(item => {
        const id = item.dataset.id;

        item.querySelector('.favorite-load-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            loadFavorite(id);
        });

        item.querySelector('.favorite-delete-btn')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (await SharedUI.confirm('Delete this favorite?', { title: 'Delete Favorite', confirmText: 'Delete', icon: 'danger' })) {
                await favorites.remove(id);
                renderFavorites();
                showSuccess('Favorite deleted');
            }
        });

        item.querySelector('img')?.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-load-btn') && !e.target.closest('.favorite-delete-btn')) {
                openFavoritesModal(id);
            }
        });
    });
}

function loadFavorite(id) {
    const fav = favorites.findById(id);
    if (!fav) return;

    state.selectedFavorite = fav;
    const settings = fav.settings || {};

    // Apply reference object
    if (settings.referenceObject) {
        state.referenceObject = settings.referenceObject;
        document.querySelectorAll('.reference-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.ref === settings.referenceObject);
        });
    }

    // Apply display mode
    if (settings.displayMode) {
        state.displayMode = settings.displayMode;
        document.querySelectorAll('input[name="displayMode"]').forEach(input => {
            input.checked = input.value === settings.displayMode;
        });
        updateContextOptionsVisibility();
    }

    // Apply context scene
    if (settings.contextScene) {
        state.contextScene = settings.contextScene;
        document.querySelectorAll('.context-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.context === settings.contextScene);
        });
    }

    // Apply variations
    if (settings.variations) {
        state.variations = settings.variations;
        document.querySelectorAll('[data-option="variations"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(settings.variations));
        });
    }

    // Apply other settings
    if (elements.productDescription && settings.productDescription) elements.productDescription.value = settings.productDescription;
    if (elements.visualStyle && settings.visualStyle) elements.visualStyle.value = settings.visualStyle;
    if (elements.background && settings.background) elements.background.value = settings.background;
    if (elements.aspectRatio && settings.aspectRatio) elements.aspectRatio.value = settings.aspectRatio;
    if (elements.showDimensions) elements.showDimensions.checked = settings.showDimensions !== false;
    if (elements.showScale) elements.showScale.checked = settings.showScale === true;
    if (elements.showGrid) elements.showGrid.checked = settings.showGrid === true;
    if (elements.seedInput && fav.seed) elements.seedInput.value = fav.seed;
    if (elements.negativePrompt && settings.negativePrompt) elements.negativePrompt.value = settings.negativePrompt;

    showSuccess('Settings loaded! Upload a product image to generate.');
}

function captureCurrentSettings() {
    return {
        referenceObject: state.referenceObject,
        displayMode: state.displayMode,
        contextScene: state.contextScene,
        productDescription: elements.productDescription?.value || '',
        productWidth: elements.productWidth?.value || null,
        productHeight: elements.productHeight?.value || null,
        productDepth: elements.productDepth?.value || null,
        dimensionUnit: state.dimensionUnit,
        visualStyle: elements.visualStyle?.value || 'clean',
        background: elements.background?.value || 'white',
        aspectRatio: elements.aspectRatio?.value || '1:1',
        showDimensions: elements.showDimensions?.checked !== false,
        showScale: elements.showScale?.checked === true,
        showGrid: elements.showGrid?.checked === true,
        multiAngle: elements.multiAngle?.value || 'single',
        negativePrompt: elements.negativePrompt?.value || '',
        variations: state.variations,
        model: DEFAULT_MODEL
    };
}

// ============================================
// LIGHTBOX
// ============================================

function openLightbox(imageUrl) {
    elements.lightboxImage.src = imageUrl;
    elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// FAVORITES MODAL
// ============================================

async function openFavoritesModal(id) {
    const fav = favorites.findById(id);
    if (!fav) return;

    state.selectedFavorite = fav;

    const images = await favorites.getImages(id);
    const primaryImage = (images && images.length > 0) ? images[0] : fav.imageUrl;

    if (elements.favoritePreviewImg) {
        elements.favoritePreviewImg.src = primaryImage || '';
    }

    if (elements.favoriteVariants) {
        const allImages = images || (fav.imageUrls ? fav.imageUrls : [fav.imageUrl]);
        if (allImages.length > 1) {
            elements.favoriteVariants.style.display = 'grid';
            elements.favoriteVariants.innerHTML = allImages.map((url, i) => `
                <div class="favorite-variant${i === 0 ? ' selected' : ''}" data-index="${i}">
                    <img src="${url}" alt="Variant ${i + 1}">
                </div>
            `).join('');

            elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(v => {
                v.addEventListener('click', () => {
                    elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(vv => vv.classList.remove('selected'));
                    v.classList.add('selected');
                    const idx = parseInt(v.dataset.index, 10);
                    elements.favoritePreviewImg.src = allImages[idx];
                });
            });
        } else {
            elements.favoriteVariants.style.display = 'none';
        }
    }

    if (elements.favoriteNameInput) {
        elements.favoriteNameInput.value = fav.name || '';
    }

    if (elements.favoriteDate) {
        const date = new Date(fav.timestamp || fav.id);
        elements.favoriteDate.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (elements.favoriteSeedValue) {
        elements.favoriteSeedValue.textContent = fav.seed || 'N/A';
    }

    if (elements.favoritesModal) {
        elements.favoritesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFavoritesModal() {
    if (elements.favoritesModal) {
        elements.favoritesModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    state.selectedFavorite = null;
}

// ============================================
// DOWNLOAD
// ============================================

function downloadImage() {
    if (state.generatedImageUrl) {
        SharedDownload.downloadImage(state.generatedImageUrl, 'size-visualization');
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function updateContextOptionsVisibility() {
    if (elements.contextOptions) {
        elements.contextOptions.style.display = state.displayMode === 'context' ? 'block' : 'none';
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Form submit
    elements.sizeVisualizerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateVisualization();
    });

    // Image upload
    SharedUpload.setup(elements.uploadArea, elements.productPhoto, {
        onError: showError,
        onLoad: (base64, file) => {
            state.uploadedImage = file;
            state.uploadedImageBase64 = base64;
            elements.previewImg.src = base64;
            elements.imagePreview.style.display = 'block';
            elements.uploadArea.style.display = 'none';
        }
    });

    // Remove image
    elements.removeImage?.addEventListener('click', () => {
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.productPhoto.value = '';
    });

    // Reference object buttons
    document.querySelectorAll('.reference-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.reference-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.referenceObject = btn.dataset.ref;
        });
    });

    // Display mode radio buttons
    document.querySelectorAll('input[name="displayMode"]').forEach(input => {
        input.addEventListener('change', () => {
            state.displayMode = input.value;
            updateContextOptionsVisibility();
        });
    });

    // Context scene buttons
    document.querySelectorAll('.context-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.context-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.contextScene = btn.dataset.context;
        });
    });

    // Unit toggle buttons
    document.querySelectorAll('.unit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.dimensionUnit = btn.dataset.unit;
            // Update unit labels
            document.querySelectorAll('.dimension-unit').forEach(span => {
                span.textContent = btn.dataset.unit;
            });
        });
    });

    // Variation buttons
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variations"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.value) || 1;
        });
    });

    // Product description input
    elements.productDescription?.addEventListener('input', (e) => {
        state.productDescription = e.target.value;
    });

    // Dimension inputs
    elements.productWidth?.addEventListener('input', (e) => {
        state.productWidth = e.target.value ? parseFloat(e.target.value) : null;
    });
    elements.productHeight?.addEventListener('input', (e) => {
        state.productHeight = e.target.value ? parseFloat(e.target.value) : null;
    });
    elements.productDepth?.addEventListener('input', (e) => {
        state.productDepth = e.target.value ? parseFloat(e.target.value) : null;
    });

    // Measurement toggles
    elements.showDimensions?.addEventListener('change', (e) => {
        state.showDimensions = e.target.checked;
    });
    elements.showScale?.addEventListener('change', (e) => {
        state.showScale = e.target.checked;
    });
    elements.showGrid?.addEventListener('change', (e) => {
        state.showGrid = e.target.checked;
    });

    // Visual style and background
    elements.visualStyle?.addEventListener('change', (e) => {
        state.visualStyle = e.target.value;
    });
    elements.background?.addEventListener('change', (e) => {
        state.background = e.target.value;
    });

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
    });

    // Multi-angle selection
    elements.multiAngle?.addEventListener('change', (e) => {
        state.multiAngle = e.target.value;
    });

    // Random seed checkbox
    elements.randomSeedCheck?.addEventListener('change', (e) => {
        if (elements.seedInput) {
            elements.seedInput.disabled = e.target.checked;
        }
    });

    // Seed input
    elements.seedInput?.addEventListener('input', (e) => {
        state.seed = e.target.value;
    });

    // Negative prompt
    elements.negativePrompt?.addEventListener('input', (e) => {
        state.negativePrompt = e.target.value;
    });

    // Actions
    elements.downloadBtn?.addEventListener('click', downloadImage);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.adjustBtn?.addEventListener('click', adjustVisualization);
    elements.regenerateBtn?.addEventListener('click', generateVisualization);

    elements.copyPromptBtn?.addEventListener('click', () => {
        if (state.lastPrompt) {
            navigator.clipboard.writeText(state.lastPrompt);
            showSuccess('Prompt copied to clipboard!');
        }
    });

    // Clear history
    elements.clearHistoryBtn?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
            state.history = [];
            renderHistory();
            showSuccess('History cleared');
        }
    });

    // Clear favorites
    elements.clearFavoritesBtn?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all favorites? This cannot be undone.', { title: 'Clear Favorites', confirmText: 'Clear All', icon: 'warning' })) {
            await favorites.clear();
            renderFavorites();
            showSuccess('Favorites cleared');
        }
    });

    // Lightbox
    elements.lightboxClose?.addEventListener('click', closeLightbox);
    elements.lightbox?.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });
    elements.lightboxDownload?.addEventListener('click', () => {
        if (elements.lightboxImage.src) {
            SharedDownload.downloadImage(elements.lightboxImage.src, 'size-visualization');
        }
    });

    // Favorites Modal
    elements.closeFavoritesModal?.addEventListener('click', closeFavoritesModal);
    elements.favoritesModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeFavoritesModal);

    elements.loadFavoriteBtn?.addEventListener('click', () => {
        if (state.selectedFavorite) {
            loadFavorite(state.selectedFavorite.id);
            closeFavoritesModal();
        }
    });

    elements.downloadFavoriteBtn?.addEventListener('click', () => {
        if (elements.favoritePreviewImg?.src) {
            SharedDownload.downloadImage(elements.favoritePreviewImg.src, 'size-favorite');
        }
    });

    elements.deleteFavoriteBtn?.addEventListener('click', async () => {
        if (state.selectedFavorite && confirm('Delete this favorite?')) {
            await favorites.remove(state.selectedFavorite.id);
            closeFavoritesModal();
            renderFavorites();
            showSuccess('Favorite deleted');
        }
    });

    elements.copyFavoriteSeed?.addEventListener('click', () => {
        if (state.selectedFavorite?.seed) {
            navigator.clipboard.writeText(String(state.selectedFavorite.seed));
            showSuccess('Seed copied!');
        }
    });

    elements.favoriteNameInput?.addEventListener('change', () => {
        if (state.selectedFavorite && elements.favoriteNameInput) {
            favorites.update(state.selectedFavorite.id, { name: elements.favoriteNameInput.value });
            renderFavorites();
        }
    });

    // Result image click for lightbox
    elements.resultImage?.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            openLightbox(state.generatedImageUrl);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateVisualization();
        }
        // Ctrl+D to download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            downloadImage();
        }
        // Escape to close modals
        if (e.key === 'Escape') {
            closeLightbox();
            closeFavoritesModal();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

function loadHistory() {
    history.load();
    state.history = history.getAll();
    renderHistory();
}

let initialized = false;

function init() {
    if (initialized) return;
    initialized = true;

    // Set studio name for API usage tracking
    api.setStudio('size-visualizer');

    // Header is pre-rendered in HTML to prevent flash
    // Initialize DOM cache
    initElements();

    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Setup event listeners
    setupEventListeners();

    // Load persisted data
    loadHistory();
    favorites.load();
    renderFavorites();

    // Initialize context visibility
    updateContextOptionsVisibility();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('size-visualizer');
    }

    console.log('Size Visualizer: Ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}
