/* ============================================
   PACKAGING MOCKUP - AI Packaging Visualization
   ============================================ */

const DEFAULT_MODEL = 'google/gemini-3-pro-image-preview';

const STUDIO_ID = 'packaging';

// ============================================
// STATE
// ============================================
const state = {
    autoMode: true,
    // Product
    productImage: null,
    productName: '',

    // Packaging Options
    packagingType: 'box',
    boxType: 'product-box',
    boxMaterial: 'cardboard',
    bottleShape: 'cylinder',
    bottleMaterial: 'glass-clear',

    // Scene & View
    scene: 'studio',
    viewAngle: 'front',

    // Branding
    colorScheme: 'auto',
    customColor: '#6366f1',
    designStyle: 'modern',

    // Output
    aspectRatio: '1:1',
    variations: 1,

    // Advanced
    lighting: 'studio',
    background: 'white',
    useRandomSeed: true,
    seed: null,
    negativePrompt: '',

    // Generation
    isGenerating: false,
    generatedImages: [],
    lastPrompt: '',
    lastSeed: null
};

// ============================================
// ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Auto mode
        autoModeToggle: document.getElementById('autoModeToggle'),
        // Form
        form: document.getElementById('packagingForm'),
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),
        productName: document.getElementById('productName'),

        // Packaging Type
        packagingTypeBtns: document.querySelectorAll('.packaging-type-btn'),
        boxStyleSection: document.getElementById('boxStyleSection'),
        bottleStyleSection: document.getElementById('bottleStyleSection'),
        boxType: document.getElementById('boxType'),
        boxMaterial: document.getElementById('boxMaterial'),
        bottleShape: document.getElementById('bottleShape'),
        bottleMaterial: document.getElementById('bottleMaterial'),

        // Scene
        sceneBtns: document.querySelectorAll('.scene-btn'),

        // Branding
        colorScheme: document.getElementById('colorScheme'),
        customColorGroup: document.getElementById('customColorGroup'),
        customColor: document.getElementById('customColor'),
        designStyle: document.getElementById('designStyle'),

        // Output
        aspectRatio: document.getElementById('aspectRatio'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedSection: document.getElementById('advancedSection'),
        lighting: document.getElementById('lighting'),
        background: document.getElementById('background'),
        randomSeedCheck: document.getElementById('randomSeedCheck'),
        seedInput: document.getElementById('seedInput'),
        negativePrompt: document.getElementById('negativePrompt'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Output
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        skeletonGrid: document.getElementById('skeletonGrid'),
        resultContainer: document.getElementById('resultContainer'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),
        downloadBtn: document.getElementById('downloadBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History & Favorites
        historyPanel: document.getElementById('historyPanel'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        favoritesPanel: document.getElementById('favoritesPanel'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
        favoritesEmpty: document.getElementById('favoritesEmpty'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxDownload: document.getElementById('lightboxDownload')
    };
}

// ============================================
// DESCRIPTION MAPS
// ============================================
const packagingTypeDescriptions = {
    'box': 'a product box',
    'bottle': 'a bottle with label',
    'bag': 'a shopping/gift bag',
    'pouch': 'a stand-up pouch',
    'jar': 'a jar with lid',
    'tube': 'a cosmetic/product tube',
    'can': 'a tin can',
    'label': 'a product label'
};

const boxTypeDescriptions = {
    'product-box': 'a standard product box with lid',
    'shipping-box': 'a shipping/cardboard box',
    'gift-box': 'an elegant gift box',
    'display-box': 'a retail display box with window',
    'mailer-box': 'a branded mailer box',
    'sleeve-box': 'a sleeve box with pull-out tray'
};

const boxMaterialDescriptions = {
    'cardboard': 'cardboard with matte finish',
    'kraft': 'natural kraft paper',
    'glossy': 'glossy coated cardboard',
    'matte': 'matte laminated finish',
    'textured': 'textured premium cardboard',
    'luxury': 'luxury rigid box material'
};

const bottleShapeDescriptions = {
    'cylinder': 'a cylindrical bottle',
    'square': 'a square/rectangular bottle',
    'dropper': 'a dropper bottle',
    'pump': 'a pump dispenser bottle',
    'spray': 'a spray bottle',
    'wine': 'a wine-style bottle'
};

const bottleMaterialDescriptions = {
    'glass-clear': 'clear glass',
    'glass-amber': 'amber glass',
    'glass-frosted': 'frosted glass',
    'plastic-clear': 'clear plastic',
    'plastic-opaque': 'opaque plastic',
    'metal': 'metal/aluminum'
};

const sceneDescriptions = {
    'studio': 'professional studio photography setup with clean backdrop',
    'shelf': 'retail store shelf with other products visible',
    'unboxing': 'unboxing scene with tissue paper and packaging materials',
    'lifestyle': 'lifestyle setting in a home/office environment',
    'gift': 'gift-giving scene with ribbon and wrapping elements',
    'flat-lay': 'top-down flat lay arrangement with props'
};

const viewAngleDescriptions = {
    'front': 'front view, straight on',
    'three-quarter': 'three-quarter angle view showing depth',
    'side': 'side profile view',
    'top': 'top-down bird\'s eye view',
    'isometric': 'isometric 3D perspective view'
};

const colorSchemeDescriptions = {
    'auto': 'colors that complement the product',
    'minimal': 'clean white and minimal design',
    'kraft': 'natural kraft/brown eco-friendly look',
    'black': 'premium black with metallic accents',
    'pastel': 'soft pastel colors',
    'vibrant': 'bold vibrant colors'
};

const designStyleDescriptions = {
    'modern': 'clean, modern, minimalist design',
    'luxury': 'premium, luxury, high-end design',
    'organic': 'organic, natural, eco-friendly design',
    'playful': 'fun, playful, colorful design',
    'vintage': 'vintage, retro, classic design',
    'tech': 'futuristic, tech-forward design'
};

const lightingDescriptions = {
    'studio': 'professional studio lighting',
    'natural': 'natural daylight',
    'soft': 'soft diffused lighting',
    'dramatic': 'dramatic lighting with shadows',
    'bright': 'bright, high-key lighting'
};

const backgroundDescriptions = {
    'white': 'clean white background',
    'gradient': 'soft gradient background',
    'surface': 'product on a textured surface',
    'contextual': 'contextual environment background',
    'transparent': 'transparent/isolated background'
};

// ============================================
// HISTORY & FAVORITES
// ============================================
const imageStore = new ImageStore('packaging_images');
const history = new SharedHistory('packaging_history', 20);
const favorites = new SharedFavorites('packaging_favorites', 50);

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


    // Initialize stores
    await imageStore.init();
    history.setImageStore(imageStore);
    favorites.setImageStore(imageStore);

    // Load saved data
    loadHistory();
    loadFavorites();

    // Setup event listeners
    setupEventListeners();

    // Setup keyboard shortcuts
    SharedKeyboard.setup({
        generate: () => elements.generateBtn.click(),
        download: () => downloadCurrentImage()
    });

    // Setup collapsible sections
    SharedCollapsible.setup(elements.advancedToggle, elements.advancedSection.querySelector('.advanced-content'));

    // Setup lightbox
    SharedLightbox.setup();

    // Setup upload
    setupUpload();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('packaging');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Auto mode toggle
    const savedAutoMode = localStorage.getItem(`${STUDIO_ID}_auto_mode`);
    if (savedAutoMode !== null) {
        state.autoMode = savedAutoMode === 'true';
        elements.autoModeToggle.checked = state.autoMode;
    }
    elements.autoModeToggle.addEventListener('change', (e) => {
        state.autoMode = e.target.checked;
        localStorage.setItem(`${STUDIO_ID}_auto_mode`, state.autoMode);
    });

    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateMockup();
    });

    // Packaging type buttons
    elements.packagingTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.packagingTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.packagingType = btn.dataset.type;
            updatePackagingTypeUI();
        });
    });

    // Scene buttons
    elements.sceneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.sceneBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.scene = btn.dataset.scene;
        });
    });

    // View angle buttons
    document.querySelectorAll('[data-option="viewAngle"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="viewAngle"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.viewAngle = btn.dataset.value;
        });
    });

    // Variations buttons
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variations"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.value);
        });
    });

    // Color scheme
    elements.colorScheme.addEventListener('change', (e) => {
        state.colorScheme = e.target.value;
        elements.customColorGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    elements.customColor.addEventListener('change', (e) => {
        state.customColor = e.target.value;
    });

    // Select fields
    elements.boxType.addEventListener('change', (e) => state.boxType = e.target.value);
    elements.boxMaterial.addEventListener('change', (e) => state.boxMaterial = e.target.value);
    elements.bottleShape.addEventListener('change', (e) => state.bottleShape = e.target.value);
    elements.bottleMaterial.addEventListener('change', (e) => state.bottleMaterial = e.target.value);
    elements.designStyle.addEventListener('change', (e) => state.designStyle = e.target.value);
    elements.aspectRatio.addEventListener('change', (e) => state.aspectRatio = e.target.value);
    elements.lighting.addEventListener('change', (e) => state.lighting = e.target.value);
    elements.background.addEventListener('change', (e) => state.background = e.target.value);

    // Seed
    elements.randomSeedCheck.addEventListener('change', (e) => {
        state.useRandomSeed = e.target.checked;
        elements.seedInput.disabled = e.target.checked;
    });

    elements.seedInput.addEventListener('change', (e) => {
        state.seed = parseInt(e.target.value) || null;
    });

    // Product name
    elements.productName.addEventListener('input', (e) => {
        state.productName = e.target.value;
    });

    // Negative prompt
    elements.negativePrompt.addEventListener('input', (e) => {
        state.negativePrompt = e.target.value;
    });

    // Remove image
    elements.removeImage.addEventListener('click', () => {
        state.productImage = null;
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'flex';
    });

    // Result actions
    elements.downloadBtn.addEventListener('click', downloadCurrentImage);
    elements.copyPromptBtn.addEventListener('click', copyPrompt);
    elements.regenerateBtn.addEventListener('click', generateMockup);
    elements.favoriteBtn.addEventListener('click', saveToFavorites);
    elements.adjustBtn.addEventListener('click', generateWithAdjustment);

    // Image info
    elements.imageInfoBtn.addEventListener('click', toggleImageInfo);

    // History & Favorites
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.clearFavoritesBtn.addEventListener('click', clearFavorites);
}

// ============================================
// UPLOAD HANDLING
// ============================================
function setupUpload() {
    SharedUpload.setup(elements.uploadArea, elements.productPhoto, {
        onLoad: (base64, file) => {
            state.productImage = base64;
            elements.previewImg.src = base64;
            elements.imagePreview.style.display = 'block';
            elements.uploadArea.style.display = 'none';

            // Auto-analyze product name if empty
            if (!state.productName) {
                analyzeProduct();
            }

            // Auto-generate if enabled
            if (state.autoMode) {
                setTimeout(() => generateMockup(), 100);
            }
        },
        onError: (error) => {
            showError(error);
        }
    });
}

async function analyzeProduct() {
    if (!state.productImage) return;

    try {
        const result = await api.analyzeImage({
            image: state.productImage,
            prompt: 'What is this product? Provide a short, marketable product name (2-5 words). Return only the name, nothing else.',
            model: DEFAULT_MODEL
        });

        if (result.text) {
            const name = result.text.trim().replace(/^["']|["']$/g, '');
            elements.productName.value = name;
            state.productName = name;
        }
    } catch (error) {
        console.error('Product analysis failed:', error);
    }
}

// ============================================
// UI UPDATES
// ============================================
function updatePackagingTypeUI() {
    const isBox = state.packagingType === 'box';
    const isBottle = ['bottle', 'jar', 'tube', 'can'].includes(state.packagingType);

    elements.boxStyleSection.style.display = isBox ? 'block' : 'none';
    elements.bottleStyleSection.style.display = isBottle ? 'block' : 'none';
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const productName = state.productName || 'product';
    let prompt = 'Create a professional product packaging mockup photograph. ';

    // Packaging type
    if (state.packagingType === 'box') {
        prompt += `Show the product "${productName}" in ${boxTypeDescriptions[state.boxType]} made of ${boxMaterialDescriptions[state.boxMaterial]}. `;
    } else if (['bottle', 'jar', 'tube', 'can'].includes(state.packagingType)) {
        const shape = state.packagingType === 'bottle' ? bottleShapeDescriptions[state.bottleShape] : packagingTypeDescriptions[state.packagingType];
        const material = state.packagingType === 'bottle' ? bottleMaterialDescriptions[state.bottleMaterial] : 'appropriate material';
        prompt += `Show "${productName}" in ${shape} made of ${material}. `;
    } else {
        prompt += `Show "${productName}" in ${packagingTypeDescriptions[state.packagingType]}. `;
    }

    // Design style
    prompt += `The packaging design should have ${designStyleDescriptions[state.designStyle]} aesthetic. `;

    // Color scheme
    if (state.colorScheme === 'custom') {
        prompt += `Use ${state.customColor} as the primary packaging color. `;
    } else {
        prompt += `The color scheme should be ${colorSchemeDescriptions[state.colorScheme]}. `;
    }

    // Scene
    prompt += `Set in ${sceneDescriptions[state.scene]}. `;

    // View angle
    prompt += `Camera angle: ${viewAngleDescriptions[state.viewAngle]}. `;

    // Lighting
    prompt += `${lightingDescriptions[state.lighting]}. `;

    // Background
    prompt += `${backgroundDescriptions[state.background]}. `;

    // Quality
    prompt += 'High-end commercial product photography, sharp focus on packaging, professional quality, realistic materials and textures.';

    // Negative prompt
    if (state.negativePrompt) {
        prompt += ` Avoid: ${state.negativePrompt}.`;
    }

    return prompt;
}

// ============================================
// GENERATION
// ============================================
async function generateMockup() {
    if (!state.productImage) {
        showError('Please upload a product image');
        return;
    }

    state.isGenerating = true;
    showLoading();
    updateLoadingStatus('Building mockup prompt...');

    try {
        const prompt = generatePrompt();
        state.lastPrompt = prompt;

        // Generate seed
        const seed = state.useRandomSeed ? Math.floor(Math.random() * 2147483647) : state.seed;
        state.lastSeed = seed;

        updateLoadingStatus('Generating packaging mockup...');

        if (state.variations === 1) {
            // Single image
            const result = await api.generateImage({
                model: DEFAULT_MODEL,
                prompt,
                images: [state.productImage],
                aspectRatio: state.aspectRatio,
                seed
            });

            state.generatedImages = [result.image];
            displaySingleResult(result.image);
        } else {
            // Multiple variations
            updateLoadingStatus(`Generating ${state.variations} variations...`);
            const promises = [];

            for (let i = 0; i < state.variations; i++) {
                const varSeed = seed + i;
                promises.push(api.generateImage({
                    model: DEFAULT_MODEL,
                    prompt,
                    images: [state.productImage],
                    aspectRatio: state.aspectRatio,
                    seed: varSeed
                }));
            }

            const results = await Promise.all(promises);
            state.generatedImages = results.map(r => r.image);
            displayMultipleResults(state.generatedImages);
        }

        showResult();
        saveToHistory();
        showSuccess('Mockup generated!');

    } catch (error) {
        console.error('Generation error:', error);
        showError('Failed to generate mockup: ' + error.message);
        hideLoading();
    } finally {
        state.isGenerating = false;
    }
}

async function generateWithAdjustment() {
    const feedback = elements.feedbackTextarea.value.trim();
    if (!feedback) {
        showError('Please enter adjustment feedback');
        return;
    }

    if (!state.lastPrompt) {
        showError('No previous generation to adjust');
        return;
    }

    state.isGenerating = true;
    showLoading();
    updateLoadingStatus('Applying adjustments...');

    try {
        const adjustedPrompt = `${state.lastPrompt} Additional requirements: ${feedback}`;

        const result = await api.generateImage({
            model: DEFAULT_MODEL,
            prompt: adjustedPrompt,
            images: [state.productImage],
            aspectRatio: state.aspectRatio,
            seed: state.useRandomSeed ? Math.floor(Math.random() * 2147483647) : state.lastSeed
        });

        state.generatedImages = [result.image];
        state.lastSeed = result.seed || state.lastSeed;
        displaySingleResult(result.image);
        showResult();
        saveToHistory();
        showSuccess('Adjusted mockup generated!');
        elements.feedbackTextarea.value = '';

    } catch (error) {
        console.error('Adjustment error:', error);
        showError('Failed to adjust: ' + error.message);
    } finally {
        state.isGenerating = false;
        hideLoading();
    }
}

// ============================================
// DISPLAY RESULTS
// ============================================
function displaySingleResult(imageUrl) {
    elements.resultImage.src = imageUrl;
    elements.resultImage.style.display = 'block';
    elements.resultGrid.innerHTML = '';
    elements.resultGrid.style.display = 'none';
    updateImageInfo();
}

function displayMultipleResults(images) {
    elements.resultImage.style.display = 'none';
    elements.resultGrid.style.display = 'grid';
    elements.resultGrid.innerHTML = images.map((img, i) => `
        <div class="result-grid-item" data-index="${i}">
            <img src="${img}" alt="Variation ${i + 1}">
            <div class="grid-item-actions">
                <button onclick="downloadImage(${i})" title="Download">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </button>
                <button onclick="openLightbox(${i})" title="View">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Click to view
    elements.resultGrid.querySelectorAll('.result-grid-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                openLightbox(parseInt(item.dataset.index));
            }
        });
    });
}

function updateImageInfo() {
    const info = `
        <div class="info-row"><span class="info-label">Type</span><span class="info-value">${state.packagingType}</span></div>
        <div class="info-row"><span class="info-label">Scene</span><span class="info-value">${state.scene}</span></div>
        <div class="info-row"><span class="info-label">Seed</span><span class="info-value">${state.lastSeed || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Model</span><span class="info-value">${DEFAULT_MODEL.split('/')[1]}</span></div>
    `;
    elements.imageInfoOverlay.innerHTML = info;
}

function toggleImageInfo() {
    const overlay = elements.imageInfoOverlay;
    overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
}

// ============================================
// ACTIONS
// ============================================
function downloadCurrentImage() {
    if (state.generatedImages.length === 0) return;
    SharedDownload.downloadImage(state.generatedImages[0], 'packaging-mockup');
}

function downloadImage(index) {
    if (state.generatedImages[index]) {
        SharedDownload.downloadImage(state.generatedImages[index], `packaging-mockup-${index + 1}`);
    }
}

function openLightbox(index) {
    if (state.generatedImages[index]) {
        SharedLightbox.open(state.generatedImages[index]);
    }
}

async function copyPrompt() {
    if (!state.lastPrompt) return;

    try {
        await navigator.clipboard.writeText(state.lastPrompt);
        showSuccess('Prompt copied to clipboard');
    } catch (err) {
        showError('Failed to copy prompt');
    }
}

// ============================================
// HISTORY & FAVORITES
// ============================================
async function saveToHistory() {
    if (state.generatedImages.length === 0) return;

    const thumbnail = await createThumbnail(state.generatedImages[0], 150);

    await history.add(thumbnail, {
        productName: state.productName,
        packagingType: state.packagingType,
        scene: state.scene,
        seed: state.lastSeed,
        model: DEFAULT_MODEL,
        prompt: state.lastPrompt
    });

    loadHistory();
}

async function saveToFavorites() {
    if (state.generatedImages.length === 0) return;

    const thumbnail = await createThumbnail(state.generatedImages[0], 150);

    await favorites.add({
        thumbnail,
        images: state.generatedImages,
        productName: state.productName,
        packagingType: state.packagingType,
        boxType: state.boxType,
        boxMaterial: state.boxMaterial,
        bottleShape: state.bottleShape,
        bottleMaterial: state.bottleMaterial,
        scene: state.scene,
        viewAngle: state.viewAngle,
        colorScheme: state.colorScheme,
        designStyle: state.designStyle,
        seed: state.lastSeed,
        model: DEFAULT_MODEL,
        prompt: state.lastPrompt
    });

    loadFavorites();
    showSuccess('Saved to favorites!');
}

function loadHistory() {
    const panel = elements.historyPanel;
    const items = history.getAll();
    elements.historyCount.textContent = items.length;

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.historyGrid.style.display = 'none';
        elements.historyEmpty.style.display = 'none';
        return;
    }

    panel.classList.add('has-items');
    elements.historyGrid.style.display = 'grid';
    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" onclick="loadHistoryItem('${item.id}')">
            <img src="${item.thumbnail}" alt="${item.productName || 'Mockup'}">
        </div>
    `).join('');
}

async function loadHistoryItem(id) {
    const item = history.findById(id);
    if (!item) return;

    const images = await history.getImages(id);
    if (images && images.length > 0) {
        state.generatedImages = images;
        state.lastSeed = item.seed;
        state.lastPrompt = item.prompt;

        if (images.length === 1) {
            displaySingleResult(images[0]);
        } else {
            displayMultipleResults(images);
        }
        showResult();
    }
}

function loadFavorites() {
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
        <div class="history-item favorite-item" onclick="loadFavoriteItem('${item.id}')">
            <img src="${item.thumbnail}" alt="${item.productName || 'Favorite'}">
            <div class="favorite-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            </div>
        </div>
    `).join('');
}

async function loadFavoriteItem(id) {
    const item = favorites.findById(id);
    if (!item) return;

    // Restore settings
    state.packagingType = item.packagingType || 'box';
    state.boxType = item.boxType || 'product-box';
    state.boxMaterial = item.boxMaterial || 'cardboard';
    state.bottleShape = item.bottleShape || 'cylinder';
    state.bottleMaterial = item.bottleMaterial || 'glass-clear';
    state.scene = item.scene || 'studio';
    state.viewAngle = item.viewAngle || 'front';
    state.colorScheme = item.colorScheme || 'auto';
    state.designStyle = item.designStyle || 'modern';
    state.lastSeed = item.seed;
    state.lastPrompt = item.prompt;

    // Update UI
    updateUIFromState();

    // Load images
    const images = await favorites.getImages(id);
    if (images && images.length > 0) {
        state.generatedImages = images;
        if (images.length === 1) {
            displaySingleResult(images[0]);
        } else {
            displayMultipleResults(images);
        }
        showResult();
    }

    showSuccess('Favorite loaded - upload a new product to regenerate');
}

function updateUIFromState() {
    // Update packaging type buttons
    elements.packagingTypeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === state.packagingType);
    });
    updatePackagingTypeUI();

    // Update selects
    elements.boxType.value = state.boxType;
    elements.boxMaterial.value = state.boxMaterial;
    elements.bottleShape.value = state.bottleShape;
    elements.bottleMaterial.value = state.bottleMaterial;
    elements.colorScheme.value = state.colorScheme;
    elements.designStyle.value = state.designStyle;

    // Update scene buttons
    elements.sceneBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scene === state.scene);
    });

    // Update view angle buttons
    document.querySelectorAll('[data-option="viewAngle"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === state.viewAngle);
    });
}

async function clearHistory() {
    if (!confirm('Clear all history?')) return;
    await history.clear();
    loadHistory();
}

async function clearFavorites() {
    if (!confirm('Clear all favorites?')) return;
    await favorites.clear();
    loadFavorites();
}

// ============================================
// UI HELPERS
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
    elements.loadingContainer.style.display = 'flex';
    elements.resultContainer.style.display = 'none';
    elements.generateBtn.disabled = true;
    updateSkeletonGrid(state.variations || 1);
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.generateBtn.disabled = false;
}

function showResult() {
    elements.resultPlaceholder.style.display = 'none';
    elements.loadingContainer.style.display = 'none';
    elements.resultContainer.style.display = 'block';
    elements.generateBtn.disabled = false;
}

function updateLoadingStatus(status) {
    elements.loadingStatus.textContent = status;
}

function showError(message) {
    const el = elements.errorMessage;
    el.querySelector('.error-text').textContent = message;
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 5000);
}

function showSuccess(message) {
    const el = elements.successMessage;
    el.querySelector('.message-content').textContent = message;
    el.style.display = 'flex';
    setTimeout(() => el.style.display = 'none', 3000);
}

// ============================================
// UTILITIES
// ============================================
function createThumbnail(base64, size = 150) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = base64;
    });
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================
window.loadHistoryItem = loadHistoryItem;
window.loadFavoriteItem = loadFavoriteItem;
window.downloadImage = downloadImage;
window.openLightbox = openLightbox;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
