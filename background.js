/**
 * Background Studio - HEFAISTOS
 * Remove and replace product backgrounds for e-commerce ready images
 */

const DEFAULT_MODEL = 'google/gemini-3-pro-image-preview';
const STUDIO_ID = 'background';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    uploadedImage: null,
    uploadedImageBase64: null,
    autoMode: true,
    generatedImageUrl: null,
    generatedImages: [],
    lastPrompt: null,
    lastSeed: null,

    // Background Type
    backgroundType: 'solid', // solid|gradient|scene|custom|transparent

    // Solid Color
    solidColor: '#FFFFFF',
    solidColorLabel: 'Pure White',

    // Gradient
    gradientColor1: '#FFFFFF',
    gradientColor2: '#F0F0F0',
    gradientDirection: 'vertical', // vertical|horizontal|radial

    // AI Scene
    sceneType: 'white-studio',
    customSceneDescription: '',

    // Custom Background
    customBackgroundBase64: null,
    productPosition: 'center',

    // Shadow
    shadowType: 'drop', // none|drop|reflection|natural|contact

    // Output
    aspectRatio: '1:1',
    padding: 10,
    outputQuality: 'high',

    // Generation
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
        backgroundForm: document.getElementById('backgroundForm'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),
        autoModeToggle: document.getElementById('autoModeToggle'),

        // Background Type
        bgTypeButtons: document.querySelectorAll('.bg-type-btn'),

        // Solid Options
        solidOptions: document.getElementById('solidOptions'),
        colorPresets: document.querySelectorAll('.color-preset'),
        customColorPicker: document.getElementById('customColorPicker'),
        colorLabel: document.getElementById('colorLabel'),
        colorHex: document.getElementById('colorHex'),

        // Gradient Options
        gradientOptions: document.getElementById('gradientOptions'),
        gradientColor1: document.getElementById('gradientColor1'),
        gradientColor2: document.getElementById('gradientColor2'),
        gradientPreview: document.getElementById('gradientPreview'),
        gradientPresets: document.querySelectorAll('.gradient-preset'),

        // Scene Options
        sceneOptions: document.getElementById('sceneOptions'),
        sceneButtons: document.querySelectorAll('.scene-btn'),
        customSceneInput: document.getElementById('customSceneInput'),
        customSceneDescription: document.getElementById('customSceneDescription'),

        // Custom Background
        customOptions: document.getElementById('customOptions'),
        customBgUploadArea: document.getElementById('customBgUploadArea'),
        customBgInput: document.getElementById('customBgInput'),
        customBgPreview: document.getElementById('customBgPreview'),
        customBgImg: document.getElementById('customBgImg'),
        removeCustomBg: document.getElementById('removeCustomBg'),
        positionSelector: document.getElementById('positionSelector'),

        // Shadow
        shadowButtons: document.querySelectorAll('.shadow-btn'),

        // Output
        paddingSlider: document.getElementById('paddingSlider'),
        paddingValue: document.getElementById('paddingValue'),

        // Basic settings (collapsible)
        basicSection: document.getElementById('basicSection'),
        basicToggle: document.getElementById('basicToggle'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        outputQuality: document.getElementById('outputQuality'),
        seedInput: document.getElementById('seedInput'),
        negativePrompt: document.getElementById('negativePrompt'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Output
        outputContainer: document.getElementById('outputContainer'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        loadingSubtext: document.getElementById('loadingSubtext'),
        skeletonGrid: document.getElementById('skeletonGrid'),
        resultDisplay: document.getElementById('resultDisplay'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),

        // Actions
        downloadBtn: document.getElementById('downloadBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
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

const colorPresetLabels = {
    '#FFFFFF': 'Pure White',
    '#FAFAFA': 'Off White',
    '#F7F7F7': 'Light Gray',
    '#E5E5E5': 'Medium Gray',
    '#000000': 'Black'
};

const sceneDescriptions = {
    'white-studio': 'Clean white professional studio backdrop with soft even lighting, perfect for e-commerce product photography',
    'gray-studio': 'Neutral gray studio backdrop with professional product photography lighting, subtle shadows',
    'living-room': 'Modern living room setting with soft natural light streaming through windows, comfortable furniture visible in background',
    'kitchen': 'Clean kitchen countertop with natural daylight, modern appliances and tasteful decor in soft focus',
    'office': 'Professional office desk setup with modern aesthetic, clean lines and natural lighting',
    'outdoor': 'Outdoor setting with soft natural lighting and blurred greenery, fresh and natural atmosphere',
    'white-marble': 'White marble surface with subtle gray veining, elegant and luxurious feel with soft reflections',
    'wood': 'Natural light wood surface with visible grain texture, warm and organic feeling',
    'concrete': 'Smooth gray concrete surface with industrial aesthetic, modern and minimal',
    'fabric': 'Soft neutral linen or cotton fabric background, gentle folds and natural texture',
    'bokeh': 'Soft colorful bokeh light spots creating dreamy, artistic background with depth',
    'custom-scene': '' // Will use customSceneDescription
};

const shadowDescriptions = {
    'none': 'No shadow, clean cutout with transparent or solid background',
    'drop': 'Soft drop shadow below the product, subtle and natural looking, adds depth without being distracting',
    'reflection': 'Mirror-like reflection on the surface beneath the product, glossy floor effect',
    'natural': 'AI-generated contextual shadow that matches the scene lighting naturally',
    'contact': 'Small contact shadow only at the base where product touches the surface, subtle grounding effect'
};

const qualityDescriptions = {
    'standard': 'Good quality professional product photography',
    'high': 'High quality photography with excellent detail, sharp edges, and professional color accuracy',
    'ultra': 'Ultra high quality, masterpiece-level product photography with exceptional detail, perfect lighting, and flawless execution'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

const history = new SharedHistory('background_studio_history', 20);
const favorites = new SharedFavorites('background_studio_favorites', 30);

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const qualityDesc = qualityDescriptions[state.outputQuality] || qualityDescriptions['high'];

    let prompt = `Create a ${qualityDesc}.

TASK: Remove the background from the provided product image and place the product on a new background.

CRITICAL REQUIREMENTS:
- Extract the product EXACTLY as shown - same colors, details, proportions, labels
- Remove the original background completely with clean, artifact-free edges
- The product should be the clear focus of the image
- Maintain professional product photography standards`;

    // Add background description based on type
    prompt += '\n\nBACKGROUND:';

    switch (state.backgroundType) {
        case 'solid':
            prompt += `\nPure solid ${state.solidColorLabel} (${state.solidColor}) background, completely flat and uniform, no gradients or textures.`;
            if (state.solidColor === '#FFFFFF') {
                prompt += ' This is an Amazon-ready pure white background.';
            }
            break;

        case 'gradient':
            const directionText = state.gradientDirection === 'radial' ? 'radial gradient from center' :
                state.gradientDirection === 'horizontal' ? 'horizontal gradient from left to right' :
                    'vertical gradient from top to bottom';
            prompt += `\nSmooth ${directionText}, transitioning from ${state.gradientColor1} to ${state.gradientColor2}. Subtle, professional gradient suitable for product photography.`;
            break;

        case 'scene':
            const sceneDesc = state.sceneType === 'custom-scene' ?
                state.customSceneDescription :
                sceneDescriptions[state.sceneType] || sceneDescriptions['white-studio'];
            prompt += `\n${sceneDesc}`;
            prompt += '\nThe product should look naturally placed in this environment.';
            break;

        case 'custom':
            prompt += '\nPlace the product on the provided custom background image. Blend naturally with appropriate lighting and perspective.';
            break;

        case 'transparent':
            prompt += '\nTransparent background (PNG with alpha channel). The product should be cleanly isolated with no background at all.';
            break;
    }

    // Add shadow description
    if (state.backgroundType !== 'transparent') {
        prompt += `\n\nSHADOW:\n${shadowDescriptions[state.shadowType] || shadowDescriptions['drop']}`;
    }

    // Add output specifications
    prompt += `\n\nOUTPUT SPECIFICATIONS:
- Aspect ratio: ${state.aspectRatio}
- Product should have approximately ${state.padding}% padding/margin around it
- Product positioned in the center of the frame
- Professional e-commerce ready image`;

    // Add negative prompt if provided
    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    } else {
        prompt += '\n\nAVOID:\nBlurry edges, artifacts around product edges, distorted product, incorrect colors, floating shadows, unnatural lighting, text overlays, watermarks';
    }

    return prompt;
}

// ============================================
// API INTEGRATION
// ============================================

async function generateBackground() {
    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        return;
    }

    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    if (state.backgroundType === 'custom' && !state.customBackgroundBase64) {
        showError('Please upload a custom background image');
        return;
    }

    showLoading();
    updateLoadingStatus('Preparing background replacement...');
    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    try {
        const variationsCount = state.variations || 1;
        const baseSeed = state.seed ? parseInt(state.seed) : Math.floor(Math.random() * 1000000);
        state.lastSeed = baseSeed;

        updateLoadingStatus('Removing background...');

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

        showSuccess('Background replaced successfully!');

    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to generate image');
    }
}

async function makeGenerationRequest(prompt, seed) {
    const messageContent = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
    ];

    // Add custom background image if using custom type
    if (state.backgroundType === 'custom' && state.customBackgroundBase64) {
        messageContent.push({ type: 'image_url', image_url: { url: state.customBackgroundBase64 } });
    }

    const requestBody = {
        model: elements.aiModel?.value || 'google/gemini-3-pro-image-preview',
        messages: [{ role: 'user', content: messageContent }],
        modalities: ['image', 'text'],
        max_tokens: 4096
    };

    if (seed) {
        requestBody.seed = seed;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${state.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'HEFAISTOS Background Studio'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = SharedRequest.extractImageFromResponse(data);

    if (!imageUrl) {
        throw new Error('No image in response');
    }

    return imageUrl;
}

async function adjustBackground() {
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

Please regenerate the product image with these specific changes applied while maintaining the product accuracy.`;

    try {
        const baseSeed = state.lastSeed || Math.floor(Math.random() * 1000000);
        const imageUrl = await makeGenerationRequest(adjustedPrompt, baseSeed);
        showResult(imageUrl);
        showSuccess('Background adjusted successfully!');
        elements.feedbackTextarea.value = '';
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to adjust background');
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
    elements.resultDisplay.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.loadingSubtext.textContent = 'This may take 10-30 seconds';
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
    elements.resultDisplay.style.display = 'block';
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

    elements.resultDisplay.style.display = 'block';
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
// BACKGROUND TYPE SWITCHING
// ============================================

function switchBackgroundType(type) {
    state.backgroundType = type;

    // Update button states
    elements.bgTypeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Hide all option panels
    elements.solidOptions.style.display = 'none';
    elements.gradientOptions.style.display = 'none';
    elements.sceneOptions.style.display = 'none';
    elements.customOptions.style.display = 'none';

    // Show relevant panel
    switch (type) {
        case 'solid':
            elements.solidOptions.style.display = 'block';
            break;
        case 'gradient':
            elements.gradientOptions.style.display = 'block';
            updateGradientPreview();
            break;
        case 'scene':
            elements.sceneOptions.style.display = 'block';
            break;
        case 'custom':
            elements.customOptions.style.display = 'block';
            break;
        case 'transparent':
            // No additional options needed
            break;
    }
}

function updateGradientPreview() {
    if (!elements.gradientPreview) return;

    let gradient;
    switch (state.gradientDirection) {
        case 'radial':
            gradient = `radial-gradient(circle, ${state.gradientColor1}, ${state.gradientColor2})`;
            break;
        case 'horizontal':
            gradient = `linear-gradient(to right, ${state.gradientColor1}, ${state.gradientColor2})`;
            break;
        default:
            gradient = `linear-gradient(to bottom, ${state.gradientColor1}, ${state.gradientColor2})`;
    }
    elements.gradientPreview.style.background = gradient;
}

function updateColorInfo(color, label) {
    state.solidColor = color;
    state.solidColorLabel = label;
    if (elements.colorLabel) elements.colorLabel.textContent = label;
    if (elements.colorHex) elements.colorHex.textContent = color.toUpperCase();
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory(imageUrl, allImages = null) {
    const images = allImages || [imageUrl];
    await history.add(imageUrl, {
        imageUrls: images,
        backgroundType: state.backgroundType,
        solidColor: state.solidColor,
        sceneType: state.sceneType,
        shadowType: state.shadowType,
        seed: state.lastSeed
    });
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
    const name = getBackgroundName();

    const favorite = await favorites.add({
        name,
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

function getBackgroundName() {
    switch (state.backgroundType) {
        case 'solid':
            return `${state.solidColorLabel} Background`;
        case 'gradient':
            return `${state.gradientDirection} Gradient`;
        case 'scene':
            return state.sceneType === 'custom-scene' ? 'Custom Scene' : state.sceneType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        case 'custom':
            return 'Custom Background';
        case 'transparent':
            return 'Transparent Background';
        default:
            return 'Background';
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

    // Apply background type
    if (settings.backgroundType) {
        switchBackgroundType(settings.backgroundType);
    }

    // Apply solid color
    if (settings.solidColor) {
        state.solidColor = settings.solidColor;
        state.solidColorLabel = settings.solidColorLabel || colorPresetLabels[settings.solidColor] || 'Custom';
        updateColorInfo(state.solidColor, state.solidColorLabel);

        // Update preset selection
        elements.colorPresets?.forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === settings.solidColor);
        });
    }

    // Apply gradient
    if (settings.gradientColor1) state.gradientColor1 = settings.gradientColor1;
    if (settings.gradientColor2) state.gradientColor2 = settings.gradientColor2;
    if (settings.gradientDirection) state.gradientDirection = settings.gradientDirection;
    if (elements.gradientColor1) elements.gradientColor1.value = state.gradientColor1;
    if (elements.gradientColor2) elements.gradientColor2.value = state.gradientColor2;
    updateGradientPreview();

    // Apply gradient direction buttons
    document.querySelectorAll('[data-option="gradientDirection"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === state.gradientDirection);
    });

    // Apply scene
    if (settings.sceneType) {
        state.sceneType = settings.sceneType;
        elements.sceneButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === settings.sceneType);
        });
        if (settings.sceneType === 'custom-scene' && elements.customSceneInput) {
            elements.customSceneInput.style.display = 'block';
        }
    }

    if (settings.customSceneDescription && elements.customSceneDescription) {
        state.customSceneDescription = settings.customSceneDescription;
        elements.customSceneDescription.value = settings.customSceneDescription;
    }

    // Apply shadow
    if (settings.shadowType) {
        state.shadowType = settings.shadowType;
        elements.shadowButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.shadow === settings.shadowType);
        });
    }

    // Apply output settings
    if (settings.aspectRatio) {
        state.aspectRatio = settings.aspectRatio;
        document.querySelectorAll('[data-option="aspectRatio"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.aspectRatio);
        });
    }

    if (settings.padding !== undefined && elements.paddingSlider) {
        state.padding = settings.padding;
        elements.paddingSlider.value = settings.padding;
        if (elements.paddingValue) elements.paddingValue.textContent = `${settings.padding}%`;
    }

    // Apply advanced settings
    if (elements.outputQuality && settings.outputQuality) {
        elements.outputQuality.value = settings.outputQuality;
        state.outputQuality = settings.outputQuality;
    }

    if (elements.seedInput && fav.seed) {
        elements.seedInput.value = fav.seed;
        state.seed = fav.seed;
    }

    if (elements.negativePrompt && settings.negativePrompt) {
        elements.negativePrompt.value = settings.negativePrompt;
        state.negativePrompt = settings.negativePrompt;
    }

    // Apply variations
    if (settings.variations) {
        state.variations = settings.variations;
        document.querySelectorAll('[data-option="variations"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(settings.variations));
        });
    }

    showSuccess('Settings loaded! Upload a product image to generate.');
}

function captureCurrentSettings() {
    return {
        backgroundType: state.backgroundType,
        solidColor: state.solidColor,
        solidColorLabel: state.solidColorLabel,
        gradientColor1: state.gradientColor1,
        gradientColor2: state.gradientColor2,
        gradientDirection: state.gradientDirection,
        sceneType: state.sceneType,
        customSceneDescription: state.customSceneDescription,
        shadowType: state.shadowType,
        aspectRatio: state.aspectRatio,
        padding: state.padding,
        outputQuality: state.outputQuality,
        negativePrompt: elements.negativePrompt?.value || '',
        variations: state.variations,
        model: elements.aiModel?.value
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
        const prefix = state.backgroundType === 'transparent' ? 'product-transparent' : 'product-background';
        SharedDownload.downloadImage(state.generatedImageUrl, prefix);
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Auto mode toggle
    state.autoMode = localStorage.getItem(`${STUDIO_ID}_auto_mode`) !== 'false';
    if (elements.autoModeToggle) {
        elements.autoModeToggle.checked = state.autoMode;
        elements.autoModeToggle.addEventListener('change', (e) => {
            state.autoMode = e.target.checked;
            localStorage.setItem(`${STUDIO_ID}_auto_mode`, state.autoMode);
        });
    }

    // Form submit
    elements.backgroundForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateBackground();
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
            if (state.autoMode) {
                generateBackground();
            }
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

    // Background type buttons
    elements.bgTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchBackgroundType(btn.dataset.type);
        });
    });

    // Color presets
    elements.colorPresets?.forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            if (color === 'custom') {
                elements.customColorPicker?.click();
            } else {
                elements.colorPresets.forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                const label = colorPresetLabels[color] || 'Custom';
                updateColorInfo(color, label);
            }
        });
    });

    // Custom color picker
    elements.customColorPicker?.addEventListener('input', (e) => {
        const color = e.target.value;
        elements.colorPresets?.forEach(p => p.classList.remove('active'));
        const customPreset = document.querySelector('.color-preset-custom');
        if (customPreset) customPreset.classList.add('active');
        updateColorInfo(color, 'Custom');
    });

    // Gradient colors
    elements.gradientColor1?.addEventListener('input', (e) => {
        state.gradientColor1 = e.target.value;
        updateGradientPreview();
    });

    elements.gradientColor2?.addEventListener('input', (e) => {
        state.gradientColor2 = e.target.value;
        updateGradientPreview();
    });

    // Gradient direction buttons
    document.querySelectorAll('[data-option="gradientDirection"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="gradientDirection"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.gradientDirection = btn.dataset.value;
            updateGradientPreview();
        });
    });

    // Gradient presets
    elements.gradientPresets?.forEach(preset => {
        preset.addEventListener('click', () => {
            state.gradientColor1 = preset.dataset.from;
            state.gradientColor2 = preset.dataset.to;
            state.gradientDirection = preset.dataset.dir;
            if (elements.gradientColor1) elements.gradientColor1.value = state.gradientColor1;
            if (elements.gradientColor2) elements.gradientColor2.value = state.gradientColor2;
            document.querySelectorAll('[data-option="gradientDirection"]').forEach(b => {
                b.classList.toggle('active', b.dataset.value === state.gradientDirection);
            });
            updateGradientPreview();
        });
    });

    // Scene buttons
    elements.sceneButtons?.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sceneButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sceneType = btn.dataset.scene;

            // Show/hide custom scene input
            if (elements.customSceneInput) {
                elements.customSceneInput.style.display = btn.dataset.scene === 'custom-scene' ? 'block' : 'none';
            }
        });
    });

    // Custom scene description
    elements.customSceneDescription?.addEventListener('input', (e) => {
        state.customSceneDescription = e.target.value;
    });

    // Custom background upload
    elements.customBgUploadArea?.addEventListener('click', () => {
        elements.customBgInput?.click();
    });

    elements.customBgInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                state.customBackgroundBase64 = ev.target.result;
                elements.customBgImg.src = ev.target.result;
                elements.customBgUploadArea.style.display = 'none';
                elements.customBgPreview.style.display = 'block';
                elements.positionSelector.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    elements.removeCustomBg?.addEventListener('click', () => {
        state.customBackgroundBase64 = null;
        elements.customBgInput.value = '';
        elements.customBgUploadArea.style.display = 'flex';
        elements.customBgPreview.style.display = 'none';
        elements.positionSelector.style.display = 'none';
    });

    // Position buttons
    document.querySelectorAll('[data-option="position"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="position"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.productPosition = btn.dataset.value;
        });
    });

    // Shadow buttons
    elements.shadowButtons?.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.shadowButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.shadowType = btn.dataset.shadow;
        });
    });

    // Aspect ratio buttons
    document.querySelectorAll('[data-option="aspectRatio"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="aspectRatio"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.aspectRatio = btn.dataset.value;
        });
    });

    // Padding slider
    elements.paddingSlider?.addEventListener('input', (e) => {
        state.padding = parseInt(e.target.value);
        if (elements.paddingValue) {
            elements.paddingValue.textContent = `${state.padding}%`;
        }
    });

    // Variation buttons
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variations"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.value) || 1;
        });
    });

    // Basic settings toggle
    elements.basicToggle?.addEventListener('click', () => {
        elements.basicSection.classList.toggle('open');
        const isOpen = elements.basicSection.classList.contains('open');
        elements.basicToggle.setAttribute('aria-expanded', isOpen);
    });

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
    });

    // Settings toggle
    elements.settingsToggle?.addEventListener('click', () => {
        elements.settingsSection.classList.toggle('open');
    });

    // Quality select
    elements.outputQuality?.addEventListener('change', (e) => {
        state.outputQuality = e.target.value;
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
    elements.adjustBtn?.addEventListener('click', adjustBackground);

    elements.copyPromptBtn?.addEventListener('click', () => {
        if (state.lastPrompt) {
            navigator.clipboard.writeText(state.lastPrompt);
            showSuccess('Prompt copied to clipboard!');
        }
    });

    // Image Info toggle
    if (elements.imageInfoBtn && elements.imageInfoOverlay) {
        elements.imageInfoBtn.addEventListener('click', () => {
            const isVisible = elements.imageInfoOverlay.style.display !== 'none';
            if (isVisible) {
                elements.imageInfoOverlay.style.display = 'none';
                elements.imageInfoBtn.classList.remove('active');
            } else {
                const info = {
                    seed: state.lastSeed,
                    model: elements.aiModel?.value || 'Unknown',
                    background: state.backgroundType,
                    shadow: state.shadowType
                };
                elements.imageInfoOverlay.innerHTML = `
                    <div class="info-row"><span>Seed:</span> <code>${info.seed || 'N/A'}</code></div>
                    <div class="info-row"><span>Model:</span> ${info.model.split('/').pop()}</div>
                    <div class="info-row"><span>Background:</span> ${info.background}</div>
                    <div class="info-row"><span>Shadow:</span> ${info.shadow}</div>
                `;
                elements.imageInfoOverlay.style.display = 'block';
                elements.imageInfoBtn.classList.add('active');
            }
        });
    }

    // Clear history
    elements.clearHistoryBtn?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
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
            SharedDownload.downloadImage(elements.lightboxImage.src, 'background');
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
            SharedDownload.downloadImage(elements.favoritePreviewImg.src, 'background-favorite');
        }
    });

    elements.deleteFavoriteBtn?.addEventListener('click', async () => {
        if (!state.selectedFavorite) return;
        const confirmed = await SharedUI.confirm('Delete this favorite?', {
            title: 'Delete Favorite',
            confirmText: 'Delete',
            icon: 'danger'
        });
        if (confirmed) {
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
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBackground();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            downloadImage();
        }
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
    renderHistory();
}

let initialized = false;

function init() {
    if (initialized) return;
    initialized = true;

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

    // Setup keyboard shortcuts
    SharedKeyboard.setup({
        generate: generateBackground,
        download: downloadImage,
        escape: () => {
            closeLightbox();
            closeFavoritesModal();
        }
    });

    // Load persisted data
    loadHistory();
    favorites.load();
    renderFavorites();

    // Initialize gradient preview
    updateGradientPreview();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('background');
    }

    console.log('Background Studio: Ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}
