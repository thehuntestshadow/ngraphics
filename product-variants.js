/**
 * Product Variants - HEFAISTOS
 * Generate color, material, and pattern variations from a single product photo
 */

const STUDIO_ID = 'product-variants';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    autoMode: true,
    apiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    variantNames: [],
    lastPrompt: null,
    lastSeed: null,

    // Variant Config
    variantType: 'color', // color|material|pattern
    variantCount: 4,

    // Color Options
    colorMode: 'preset', // preset|custom
    colorPreset: 'popular',
    customColors: '',

    // Material Options
    targetMaterials: [],

    // Pattern Options
    targetPatterns: [],
    patternScale: 'medium',

    // Output Options
    preserveLighting: true,
    aspectRatio: '1:1',
    outputQuality: 'high',

    // Generation
    seed: '',
    negativePrompt: '',

    // UI
    selectedFavorite: null
};

// ============================================
// ELEMENTS
// ============================================

let elements = {};

function initElements() {
    elements = {
        // Auto Mode
        autoModeToggle: document.getElementById('autoModeToggle'),

        // Form
        variantsForm: document.getElementById('variantsForm'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),

        // Variant Type
        variantTypeButtons: document.querySelectorAll('.variant-type-btn'),

        // Color Options
        colorOptions: document.getElementById('colorOptions'),
        colorModeButtons: document.querySelectorAll('.mode-btn'),
        colorPresetSection: document.getElementById('colorPresetSection'),
        customColorSection: document.getElementById('customColorSection'),
        presetButtons: document.querySelectorAll('.preset-btn'),
        customColorsInput: document.getElementById('customColorsInput'),
        colorChips: document.getElementById('colorChips'),

        // Material Options
        materialOptions: document.getElementById('materialOptions'),
        materialCheckboxes: document.querySelectorAll('#materialOptions input[type="checkbox"]'),

        // Pattern Options
        patternOptions: document.getElementById('patternOptions'),
        patternCheckboxes: document.querySelectorAll('#patternOptions input[type="checkbox"]'),

        // Output Options
        preserveLighting: document.getElementById('preserveLighting'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        outputQuality: document.getElementById('outputQuality'),
        seedInput: document.getElementById('seedInput'),
        negativePrompt: document.getElementById('negativePrompt'),

        // API Settings
        settingsSection: document.getElementById('settingsSection'),
        settingsToggle: document.getElementById('settingsToggle'),
        apiKey: document.getElementById('apiKey'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        apiStatus: document.getElementById('apiStatus'),
        aiModel: document.getElementById('aiModel'),

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
        variantGrid: document.getElementById('variantGrid'),

        // Actions
        downloadAllBtn: document.getElementById('downloadAllBtn'),
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

const colorPresets = {
    'popular': ['Black', 'White', 'Navy Blue', 'Burgundy', 'Forest Green', 'Tan', 'Gray', 'Cream'],
    'earth-tones': ['Terracotta', 'Olive', 'Rust', 'Sand', 'Chocolate', 'Sage', 'Burnt Orange', 'Taupe'],
    'pastels': ['Blush Pink', 'Baby Blue', 'Lavender', 'Mint', 'Peach', 'Lemon', 'Lilac', 'Powder Blue'],
    'bold': ['Fire Red', 'Electric Blue', 'Hot Pink', 'Lime Green', 'Orange', 'Purple', 'Teal', 'Yellow'],
    'neutrals': ['White', 'Ivory', 'Beige', 'Tan', 'Gray', 'Charcoal', 'Black', 'Off-White'],
    'metallics': ['Silver', 'Gold', 'Rose Gold', 'Copper', 'Bronze', 'Gunmetal', 'Champagne', 'Platinum']
};

const materialDescriptions = {
    'leather': 'genuine leather with natural grain texture and subtle sheen',
    'suede': 'soft suede with velvety nap texture and matte finish',
    'velvet': 'luxurious velvet with rich pile and soft sheen',
    'canvas': 'durable cotton canvas with visible woven texture',
    'denim': 'classic denim fabric with twill weave pattern',
    'silk': 'smooth silk with elegant drape and lustrous sheen',
    'wool': 'soft wool with natural fiber texture',
    'linen': 'natural linen with subtle slubbed texture',
    'metal': 'polished metal with reflective surface and sharp edges',
    'wood': 'natural wood with visible grain patterns and organic warmth',
    'plastic': 'smooth plastic with slight sheen and uniform surface',
    'rubber': 'textured rubber with matte grip surface',
    'glass': 'transparent or frosted glass with smooth surface',
    'ceramic': 'glazed ceramic with smooth glossy finish',
    'marble': 'natural marble with veining patterns',
    'concrete': 'industrial concrete with subtle texture',
    'matte': 'matte finish with no shine or reflection',
    'glossy': 'high-gloss finish with mirror-like reflection',
    'satin': 'satin finish with soft subtle sheen',
    'chrome': 'polished chrome with mirror finish',
    'brushed-metal': 'brushed metal with directional grain finish',
    'patent': 'patent finish with wet-look high shine'
};

const patternDescriptions = {
    'stripes': 'classic parallel stripe pattern',
    'plaid': 'traditional plaid with intersecting colored bands',
    'checkered': 'classic checkered pattern with alternating squares',
    'chevron': 'bold V-shaped chevron stripes',
    'polka-dots': 'classic polka dot pattern with uniform circles',
    'geometric': 'modern geometric shapes pattern',
    'floral': 'botanical floral pattern with flowers and leaves',
    'tropical': 'tropical pattern with palm leaves and exotic plants',
    'animal-print': 'exotic animal print pattern',
    'leopard': 'leopard spot pattern',
    'marble': 'natural marble veining pattern',
    'wood-grain': 'natural wood grain pattern',
    'abstract': 'modern abstract artistic pattern',
    'tie-dye': 'psychedelic tie-dye swirl pattern',
    'ombre': 'gradual color gradient ombre effect',
    'watercolor': 'soft watercolor wash pattern',
    'splatter': 'artistic paint splatter pattern',
    'quilted': 'quilted stitched pattern with padding',
    'embossed': 'raised embossed texture pattern',
    'woven': 'woven basket weave pattern'
};

const patternScaleDescriptions = {
    'small': 'small-scale, fine, detailed pattern',
    'medium': 'medium-scale, balanced pattern',
    'large': 'large-scale, bold, statement pattern'
};

const qualityDescriptions = {
    'standard': 'good quality professional product photography',
    'high': 'high quality photography with excellent detail, sharp focus, and professional lighting',
    'ultra': 'ultra high quality, masterpiece-level product photography with exceptional detail, perfect lighting, and flawless execution'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

const history = new SharedHistory('product_variants_history', 20);
const favorites = new SharedFavorites('product_variants_favorites', 30);

// ============================================
// PROMPT GENERATION
// ============================================

function getSelectedColors() {
    if (state.colorMode === 'custom') {
        return state.customColors
            .split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0)
            .slice(0, state.variantCount);
    } else {
        const preset = colorPresets[state.colorPreset] || colorPresets['popular'];
        return preset.slice(0, state.variantCount);
    }
}

function getSelectedMaterials() {
    return state.targetMaterials.slice(0, state.variantCount);
}

function getSelectedPatterns() {
    return state.targetPatterns.slice(0, state.variantCount);
}

function generateColorPrompt(colors) {
    const qualityDesc = qualityDescriptions[state.outputQuality] || qualityDescriptions['high'];

    let prompt = `Create ${colors.length} color variations of the uploaded product.

${qualityDesc}

TASK: Generate the EXACT same product in these different colors:
${colors.map((c, i) => `${i + 1}. ${c}`).join('\n')}

CRITICAL REQUIREMENTS:
- Keep the EXACT same product shape, angle, size, and composition in every image
- Maintain identical lighting and shadows across all variations
- Only change the color - preserve all other details (textures, hardware, labels, branding)
- Each color should be realistic and natural for this type of product
- Professional e-commerce photography quality
- Each variant must look like a real, purchasable product`;

    if (state.preserveLighting) {
        prompt += '\n\nMaintain consistent studio lighting across all variants.';
    }

    prompt += `\n\nOUTPUT:
Generate ${colors.length} separate product images, arranged in a grid or sequence.
Aspect ratio: ${state.aspectRatio}`;

    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    } else {
        prompt += '\n\nAVOID: Warped shapes, inconsistent sizes, different angles between variants, unrealistic colors, added or removed details, blurry edges';
    }

    return prompt;
}

function generateMaterialPrompt(materials) {
    const qualityDesc = qualityDescriptions[state.outputQuality] || qualityDescriptions['high'];

    let prompt = `Create ${materials.length} material variations of the uploaded product.

${qualityDesc}

TASK: Generate the EXACT same product with these different materials/finishes:
${materials.map((m, i) => `${i + 1}. ${materialDescriptions[m] || m}`).join('\n')}

CRITICAL REQUIREMENTS:
- Keep the EXACT same product shape, size, angle, and composition
- Only change the surface material/texture - preserve the form
- Make each material look authentic and realistic
- Materials should have appropriate reflections, textures, and finish characteristics
- Professional e-commerce photography quality`;

    if (state.preserveLighting) {
        prompt += '\n\nMaintain consistent lighting that properly showcases each material.';
    }

    prompt += `\n\nOUTPUT:
Generate ${materials.length} separate product images, each showing the product in one of the listed materials.
Aspect ratio: ${state.aspectRatio}`;

    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    } else {
        prompt += '\n\nAVOID: Different shapes between variants, unrealistic material textures, incorrect reflections, mismatched lighting';
    }

    return prompt;
}

function generatePatternPrompt(patterns) {
    const qualityDesc = qualityDescriptions[state.outputQuality] || qualityDescriptions['high'];
    const scaleDesc = patternScaleDescriptions[state.patternScale];

    let prompt = `Create ${patterns.length} pattern variations of the uploaded product.

${qualityDesc}

TASK: Generate the EXACT same product with these different patterns applied:
${patterns.map((p, i) => `${i + 1}. ${patternDescriptions[p] || p}`).join('\n')}

PATTERN SCALE: ${scaleDesc}

CRITICAL REQUIREMENTS:
- Keep the EXACT same product shape, size, angle, and composition
- Apply patterns naturally following the product's contours and surfaces
- Patterns should wrap realistically around curves and edges
- Each pattern should be clearly visible and well-executed
- Professional e-commerce photography quality`;

    if (state.preserveLighting) {
        prompt += '\n\nMaintain consistent lighting across all pattern variants.';
    }

    prompt += `\n\nOUTPUT:
Generate ${patterns.length} separate product images, each showing the product with one of the listed patterns.
Aspect ratio: ${state.aspectRatio}`;

    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    } else {
        prompt += '\n\nAVOID: Distorted patterns, patterns not following surface contours, inconsistent pattern scale, blurry pattern details';
    }

    return prompt;
}

function generatePrompt() {
    switch (state.variantType) {
        case 'color':
            const colors = getSelectedColors();
            state.variantNames = colors;
            return generateColorPrompt(colors);
        case 'material':
            const materials = getSelectedMaterials();
            state.variantNames = materials.map(m => m.charAt(0).toUpperCase() + m.slice(1).replace('-', ' '));
            return generateMaterialPrompt(materials);
        case 'pattern':
            const patterns = getSelectedPatterns();
            state.variantNames = patterns.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '));
            return generatePatternPrompt(patterns);
        default:
            return '';
    }
}

// ============================================
// VALIDATION
// ============================================

function validateInputs() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return false;
    }

    switch (state.variantType) {
        case 'color':
            const colors = getSelectedColors();
            if (colors.length < 2) {
                showError('Please select at least 2 colors');
                return false;
            }
            break;
        case 'material':
            if (state.targetMaterials.length < 2) {
                showError('Please select at least 2 materials');
                return false;
            }
            break;
        case 'pattern':
            if (state.targetPatterns.length < 2) {
                showError('Please select at least 2 patterns');
                return false;
            }
            break;
    }

    return true;
}

// ============================================
// API INTEGRATION
// ============================================

async function generateVariants() {
    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        return;
    }

    if (!validateInputs()) {
        return;
    }

    showLoading();
    updateLoadingStatus('Preparing variant generation...');
    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    try {
        const baseSeed = state.seed ? parseInt(state.seed) : Math.floor(Math.random() * 1000000);
        state.lastSeed = baseSeed;

        updateLoadingStatus(`Generating ${state.variantNames.length} variants...`);

        const imageUrl = await makeGenerationRequest(prompt, baseSeed);

        // For now, we'll show as a single result with the grid
        // In the future, we could split the image or generate separately
        showResult(imageUrl);

        showSuccess('Variants generated successfully!');

    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to generate variants');
    }
}

async function makeGenerationRequest(prompt, seed) {
    const messageContent = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
    ];

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
            'X-Title': 'HEFAISTOS Product Variants'
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

async function adjustVariants() {
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

Please regenerate the product variants with these specific changes applied while maintaining the product accuracy and variant consistency.`;

    try {
        const baseSeed = state.lastSeed || Math.floor(Math.random() * 1000000);
        const imageUrl = await makeGenerationRequest(adjustedPrompt, baseSeed);
        showResult(imageUrl);
        showSuccess('Variants adjusted successfully!');
        elements.feedbackTextarea.value = '';
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to adjust variants');
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
    elements.loadingSubtext.textContent = 'This may take 30-60 seconds';
    elements.generateBtn.disabled = true;
    elements.generateBtn.classList.add('loading');
    updateSkeletonGrid(state.variantCount || 4);
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

    // Show the variant grid with the image and labels
    elements.variantGrid.innerHTML = `
        <div class="variant-card" data-index="0">
            <img src="${imageUrl}" alt="Generated variants">
            <div class="variant-label">${state.variantNames.join(', ')}</div>
        </div>
    `;

    elements.resultDisplay.style.display = 'block';
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];

    // Add click handler for lightbox
    elements.variantGrid.querySelector('.variant-card')?.addEventListener('click', () => {
        openLightbox(imageUrl);
    });

    addToHistory(imageUrl);
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
// VARIANT TYPE SWITCHING
// ============================================

function switchVariantType(type) {
    state.variantType = type;

    // Update button states
    elements.variantTypeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Hide all option panels
    elements.colorOptions.style.display = 'none';
    elements.materialOptions.style.display = 'none';
    elements.patternOptions.style.display = 'none';

    // Show relevant panel
    switch (type) {
        case 'color':
            elements.colorOptions.style.display = 'block';
            updateColorChips();
            break;
        case 'material':
            elements.materialOptions.style.display = 'block';
            break;
        case 'pattern':
            elements.patternOptions.style.display = 'block';
            break;
    }
}

function switchColorMode(mode) {
    state.colorMode = mode;

    elements.colorModeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (mode === 'preset') {
        elements.colorPresetSection.style.display = 'block';
        elements.customColorSection.style.display = 'none';
    } else {
        elements.colorPresetSection.style.display = 'none';
        elements.customColorSection.style.display = 'block';
    }

    updateColorChips();
}

function selectColorPreset(preset) {
    state.colorPreset = preset;

    elements.presetButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
    });

    updateColorChips();
}

function updateColorChips() {
    const colors = getSelectedColors();

    if (elements.colorChips) {
        elements.colorChips.innerHTML = colors.map(color => {
            const bgColor = getColorHex(color);
            return `<span class="color-chip">
                <span class="color-chip-dot" style="background:${bgColor}"></span>
                ${color}
            </span>`;
        }).join('');
    }
}

function getColorHex(colorName) {
    // Simple color name to hex mapping
    const colorMap = {
        'black': '#000', 'white': '#fff', 'navy blue': '#1e3a5f', 'burgundy': '#722f37',
        'forest green': '#228b22', 'tan': '#d2b48c', 'gray': '#808080', 'cream': '#fffdd0',
        'terracotta': '#c35831', 'olive': '#556b2f', 'rust': '#b7410e', 'sand': '#c2b280',
        'chocolate': '#7b3f00', 'sage': '#b2ac88', 'burnt orange': '#cc5500', 'taupe': '#483c32',
        'blush pink': '#ffd1dc', 'baby blue': '#89cff0', 'lavender': '#e6e6fa', 'mint': '#98fb98',
        'peach': '#ffcba4', 'lemon': '#fff44f', 'lilac': '#c8a2c8', 'powder blue': '#b0e0e6',
        'fire red': '#ff2400', 'electric blue': '#0080ff', 'hot pink': '#ff69b4', 'lime green': '#32cd32',
        'orange': '#ff8c00', 'purple': '#800080', 'teal': '#008080', 'yellow': '#ffd700',
        'ivory': '#fffff0', 'beige': '#f5f5dc', 'charcoal': '#36454f', 'off-white': '#faf9f6',
        'silver': '#c0c0c0', 'gold': '#ffd700', 'rose gold': '#b76e79', 'copper': '#b87333',
        'bronze': '#cd7f32', 'gunmetal': '#2a3439', 'champagne': '#f7e7ce', 'platinum': '#e5e4e2'
    };
    return colorMap[colorName.toLowerCase()] || '#ccc';
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory(imageUrl, allImages = null) {
    const images = allImages || [imageUrl];
    await history.add(imageUrl, {
        imageUrls: images,
        variantType: state.variantType,
        variantNames: state.variantNames,
        colorPreset: state.colorPreset,
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
        if (elements.historyEmpty) {
            elements.historyEmpty.style.display = 'none';
        }
        elements.historyGrid.innerHTML = '';
        return;
    }

    panel.classList.add('has-items');

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="History item" loading="lazy">
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
    const name = getVariantName();

    const favorite = await favorites.add({
        name,
        imageUrl: state.generatedImageUrl,
        imageUrls: state.generatedImages,
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        productImageBase64: state.uploadedImageBase64,
        variantNames: state.variantNames,
        settings
    });

    if (favorite) {
        showSuccess('Added to favorites!');
        renderFavorites();
    }
}

function getVariantName() {
    const typeNames = {
        'color': 'Color Variants',
        'material': 'Material Variants',
        'pattern': 'Pattern Variants'
    };
    return typeNames[state.variantType] || 'Variants';
}

function renderFavorites() {
    const panel = elements.favoritesPanel;
    const items = favorites.getAll();

    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = items.length;
    }

    if (items.length === 0) {
        panel.classList.remove('has-items');
        if (elements.favoritesEmpty) {
            elements.favoritesEmpty.style.display = 'none';
        }
        elements.favoritesGrid.innerHTML = '';
        return;
    }

    panel.classList.add('has-items');

    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.name || 'Favorite'}" loading="lazy">
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

    // Apply variant type
    if (settings.variantType) {
        switchVariantType(settings.variantType);
    }

    // Apply color settings
    if (settings.colorMode) {
        switchColorMode(settings.colorMode);
    }
    if (settings.colorPreset) {
        selectColorPreset(settings.colorPreset);
    }
    if (settings.customColors) {
        state.customColors = settings.customColors;
        if (elements.customColorsInput) {
            elements.customColorsInput.value = settings.customColors;
        }
    }

    // Apply material settings
    if (settings.targetMaterials) {
        state.targetMaterials = settings.targetMaterials;
        elements.materialCheckboxes?.forEach(cb => {
            cb.checked = settings.targetMaterials.includes(cb.value);
        });
    }

    // Apply pattern settings
    if (settings.targetPatterns) {
        state.targetPatterns = settings.targetPatterns;
        elements.patternCheckboxes?.forEach(cb => {
            cb.checked = settings.targetPatterns.includes(cb.value);
        });
    }
    if (settings.patternScale) {
        state.patternScale = settings.patternScale;
        document.querySelectorAll('[data-option="patternScale"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.patternScale);
        });
    }

    // Apply output settings
    if (settings.variantCount) {
        state.variantCount = settings.variantCount;
        document.querySelectorAll('[data-option="variantCount"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(settings.variantCount));
        });
    }

    if (settings.aspectRatio) {
        state.aspectRatio = settings.aspectRatio;
        document.querySelectorAll('[data-option="aspectRatio"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === settings.aspectRatio);
        });
    }

    if (settings.preserveLighting !== undefined && elements.preserveLighting) {
        elements.preserveLighting.checked = settings.preserveLighting;
        state.preserveLighting = settings.preserveLighting;
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

    updateColorChips();
    showSuccess('Settings loaded! Upload a product image to generate.');
}

function captureCurrentSettings() {
    return {
        variantType: state.variantType,
        variantCount: state.variantCount,
        colorMode: state.colorMode,
        colorPreset: state.colorPreset,
        customColors: state.customColors,
        targetMaterials: [...state.targetMaterials],
        targetPatterns: [...state.targetPatterns],
        patternScale: state.patternScale,
        preserveLighting: state.preserveLighting,
        aspectRatio: state.aspectRatio,
        outputQuality: state.outputQuality,
        negativePrompt: elements.negativePrompt?.value || '',
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
        elements.favoriteVariants.style.display = 'none';
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
        const prefix = `product-${state.variantType}-variants`;
        SharedDownload.downloadImage(state.generatedImageUrl, prefix);
    }
}

async function downloadAllAsZip() {
    if (!state.generatedImageUrl) {
        showError('No variants to download');
        return;
    }

    // For now, just download the single image
    // In the future, we could split the grid image or generate separately
    downloadImage();
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
    elements.variantsForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateVariants();
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

            // Auto-generate if enabled
            if (state.autoMode) {
                generateVariants();
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

    // Variant type buttons
    elements.variantTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchVariantType(btn.dataset.type);
        });
    });

    // Color mode buttons
    elements.colorModeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchColorMode(btn.dataset.mode);
        });
    });

    // Preset buttons
    elements.presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectColorPreset(btn.dataset.preset);
        });
    });

    // Custom colors input
    elements.customColorsInput?.addEventListener('input', (e) => {
        state.customColors = e.target.value;
        updateColorChips();
    });

    // Material checkboxes
    elements.materialCheckboxes?.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                if (!state.targetMaterials.includes(cb.value)) {
                    state.targetMaterials.push(cb.value);
                }
            } else {
                state.targetMaterials = state.targetMaterials.filter(m => m !== cb.value);
            }
        });
    });

    // Pattern checkboxes
    elements.patternCheckboxes?.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                if (!state.targetPatterns.includes(cb.value)) {
                    state.targetPatterns.push(cb.value);
                }
            } else {
                state.targetPatterns = state.targetPatterns.filter(p => p !== cb.value);
            }
        });
    });

    // Pattern scale buttons
    document.querySelectorAll('[data-option="patternScale"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="patternScale"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.patternScale = btn.dataset.value;
        });
    });

    // Variant count buttons
    document.querySelectorAll('[data-option="variantCount"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variantCount"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variantCount = parseInt(btn.dataset.value) || 4;
            updateColorChips();
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

    // Preserve lighting toggle
    elements.preserveLighting?.addEventListener('change', (e) => {
        state.preserveLighting = e.target.checked;
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
    elements.downloadAllBtn?.addEventListener('click', downloadAllAsZip);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.adjustBtn?.addEventListener('click', adjustVariants);

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
            SharedDownload.downloadImage(elements.lightboxImage.src, 'variants');
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
            SharedDownload.downloadImage(elements.favoritePreviewImg.src, 'variants-favorite');
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateVariants();
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
        generate: generateVariants,
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

    // Initialize UI
    updateColorChips();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('product-variants');
    }

    console.log('Product Variants: Ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}
