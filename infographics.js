/**
 * AI Product Infographics Generator
 * Main JavaScript file with all functionality
 */

// ============================================
// APPLICATION STATE
// ============================================
const state = {
    language: 'ro', // 'en' or 'ro'
    theme: 'dark', // 'dark' or 'light'
    apiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    // Multi-angle references
    multiAngleMode: false,
    referenceImages: [], // Array of { id, file, base64, label }
    maxReferenceImages: 4,
    generatedImageUrl: null,
    lastPrompt: null,
    history: [],
    selectedHistoryItem: null,
    // Advanced options
    styleReferenceBase64: null,
    lastSeed: null,
    generatedImages: [],
    variations: 1,
    // Watermark
    watermarkLogoBase64: null,
    watermarkPosition: 'bc',
    // Alt text
    generatedAltText: null,
    // Characteristic emphasis (starred items)
    starredCharacteristics: new Set(),
    // Brand colors
    selectedBrandColors: [],
    // Product copy
    generatedCopy: {
        shortDesc: null,
        longDesc: null,
        taglines: [],
        social: { instagram: null, facebook: null, twitter: null },
        seo: { title: null, description: null }
    },
    activeSocialPlatform: 'instagram',
    // Templates
    savedTemplates: [],
    activePreset: null,
    // Smart regeneration
    lockSettings: {
        layout: false,
        colors: false,
        background: false,
        textStyle: false
    },
    variationStrength: 3,
    // Complementary images
    complementaryType: 'closeup',
    complementaryStyle: 'match',
    complementaryQuantity: 1,
    complementaryImages: [],
    // Favorites
    selectedFavorite: null,
    selectedFavoriteImages: null,
    // Organization state
    historyBulkMode: false,
    historySelectedIds: new Set(),
    historySearchQuery: '',
    favoritesSearchQuery: '',
    favoritesActiveFolder: '', // '' = all, 'null' = unfiled, or folder name
    favoritesActiveTag: '',
    // Batch processing
    batchMode: false,
    batchQueue: [], // Array of { id, file, imageBase64, status: 'pending'|'processing'|'completed'|'failed', result: null|imageUrl, error: null }
    batchProcessing: false,
    batchProgress: { current: 0, total: 0 }
};

// Storage instances
const imageStore = new ImageStore('ngraphics_images');
const favorites = new SharedFavorites('ngraphics_favorites', 30);

// ============================================
// PLATFORM PRESETS
// ============================================
const platformPresets = {
    amazon: {
        name: 'Amazon',
        aspectRatio: '1:1',
        style: 'light',
        layout: 'center',
        visualDensity: 3,
        description: 'Clean white background, product-focused'
    },
    shopify: {
        name: 'Shopify',
        aspectRatio: '1:1',
        style: 'auto',
        layout: 'auto',
        visualDensity: 4,
        description: 'Versatile e-commerce style'
    },
    instagram: {
        name: 'Instagram',
        aspectRatio: '1:1',
        style: 'gradient',
        layout: 'center',
        visualDensity: 5,
        description: 'Eye-catching, high visual density'
    },
    'instagram-story': {
        name: 'Instagram Story',
        aspectRatio: '9:16',
        style: 'gradient',
        layout: 'top',
        visualDensity: 4,
        description: 'Vertical format for Stories'
    },
    facebook: {
        name: 'Facebook',
        aspectRatio: '16:9',
        style: 'auto',
        layout: 'left',
        visualDensity: 3,
        description: 'Horizontal format for feeds'
    },
    etsy: {
        name: 'Etsy',
        aspectRatio: '4:5',
        style: 'light',
        layout: 'center',
        visualDensity: 3,
        description: 'Artisan, handcraft aesthetic'
    }
};

// ============================================
// ICON SUGGESTIONS MAP
// ============================================
const iconSuggestions = {
    // Battery/Power related
    'battery': ['battery', 'power', 'autonomi', 'hour', 'ore', 'mah', 'charging', 'încărcare'],
    'bolt': ['fast', 'rapid', 'quick', 'speed', 'vitez'],
    'plug': ['charger', 'încărcător', 'adapter', 'adaptor', 'usb', 'type-c'],

    // Connectivity
    'wifi': ['wifi', 'wireless', 'wi-fi', 'internet', 'conectivitate'],
    'bluetooth': ['bluetooth', 'bt', 'pair', 'conectare'],
    'signal': ['5g', '4g', 'lte', 'network', 'rețea', 'signal'],

    // Audio
    'headphones': ['audio', 'sound', 'sunet', 'headphone', 'căști', 'music', 'muzică'],
    'microphone': ['mic', 'microfon', 'voice', 'voce', 'call', 'apel'],
    'volume': ['speaker', 'difuzor', 'loud', 'noise', 'zgomot', 'anc', 'cancellation', 'anulare'],

    // Display/Visual
    'monitor': ['display', 'screen', 'ecran', 'resolution', 'rezoluție', 'inch', 'hd', '4k', 'oled', 'lcd'],
    'sun': ['brightness', 'luminozitate', 'nit', 'hdr'],
    'eye': ['eye', 'vedere', 'vizual', 'color', 'culoare'],

    // Storage/Memory
    'database': ['storage', 'stocare', 'memory', 'memorie', 'gb', 'tb', 'ssd', 'ram'],
    'chip': ['processor', 'procesor', 'cpu', 'gpu', 'core', 'ghz'],

    // Protection/Safety
    'shield': ['protect', 'protecție', 'safe', 'sigur', 'secure', 'securitate', 'warranty', 'garanție'],
    'water': ['waterproof', 'water', 'apă', 'ip67', 'ip68', 'rezistent', 'splash'],
    'lock': ['security', 'lock', 'blocare', 'fingerprint', 'amprentă', 'face', 'biometric'],

    // Size/Weight
    'scale': ['weight', 'greutate', 'gram', 'kg', 'light', 'ușor', 'lightweight'],
    'ruler': ['size', 'dimensiune', 'thick', 'grosime', 'slim', 'subțire', 'compact'],

    // Camera
    'camera': ['camera', 'cameră', 'photo', 'foto', 'megapixel', 'mp', 'lens', 'obiectiv', 'zoom'],
    'video': ['video', '4k', '8k', 'recording', 'înregistrare', 'fps'],

    // Quality/Premium
    'star': ['premium', 'quality', 'calitate', 'luxury', 'lux', 'pro', 'best', 'top'],
    'award': ['award', 'premiu', 'certified', 'certificat'],
    'diamond': ['premium', 'exclusiv', 'special', 'limited', 'edition'],

    // Materials
    'cube': ['material', 'aluminum', 'aluminiu', 'metal', 'steel', 'oțel', 'carbon', 'titanium'],
    'leaf': ['eco', 'green', 'sustainable', 'sustenabil', 'organic', 'natural', 'recycl'],

    // Shipping/Delivery
    'truck': ['shipping', 'livrare', 'delivery', 'free', 'gratuit', 'express'],
    'package': ['package', 'pachet', 'box', 'cutie', 'included', 'inclus'],

    // Time
    'clock': ['time', 'timp', 'hour', 'oră', 'minute', 'minut', 'fast', 'rapid'],
    'calendar': ['year', 'an', 'month', 'lună', 'day', 'zi', 'warranty', 'garanție'],

    // Comfort/Ergonomics
    'hand': ['ergonomic', 'grip', 'comfort', 'confort', 'hold', 'easy', 'ușor'],
    'heart': ['health', 'sănătate', 'fitness', 'heart', 'inimă', 'sport'],

    // Connectivity/Ports
    'usb': ['usb', 'port', 'type-c', 'connector', 'conector'],
    'hdmi': ['hdmi', 'displayport', 'vga', 'output', 'ieșire'],

    // Default
    'check': ['feature', 'include', 'with', 'cu', 'are', 'has', 'suport']
};

// ============================================
// DOM ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Theme
        themeToggle: document.getElementById('themeToggle'),

        // Language
        langOptions: document.querySelectorAll('.lang-btn'),
        titleHint: document.getElementById('titleHint'),
        charHint: document.getElementById('charHint'),

        // API Key
        apiKeyInput: document.getElementById('apiKey'),
        toggleApiKeyBtn: document.getElementById('toggleApiKey'),
        saveApiKeyBtn: document.getElementById('saveApiKey'),
        apiStatus: document.getElementById('apiStatus'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Form
        form: document.getElementById('infographicForm'),
        aiModel: document.getElementById('aiModel'),
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImageBtn: document.getElementById('removeImage'),
        autoEnhance: document.getElementById('autoEnhance'),

        // Multi-angle upload
        multiAngleToggle: document.getElementById('multiAngleToggle'),
        singleImageUpload: document.getElementById('singleImageUpload'),
        multiAngleUpload: document.getElementById('multiAngleUpload'),
        multiAngleGrid: document.getElementById('multiAngleGrid'),
        multiAngleAdd: document.getElementById('multiAngleAdd'),
        multiAngleInput: document.getElementById('multiAngleInput'),
        multiAngleCount: document.getElementById('multiAngleCount'),

        // Templates and rating
        templateSelectorContainer: document.getElementById('templateSelectorContainer'),
        ratingContainer: document.getElementById('ratingContainer'),

        productTitle: document.getElementById('productTitle'),
        characteristicsList: document.getElementById('characteristicsList'),
        addCharBtn: document.getElementById('addCharBtn'),
        benefitsList: document.getElementById('benefitsList'),
        addBenefitBtn: document.getElementById('addBenefitBtn'),
        infographicStyle: document.getElementById('infographicStyle'),
        styleRadios: document.querySelectorAll('input[name="style"]'),
        generateBtn: document.getElementById('generateBtn'),

        // Advanced Options
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        styleGenSection: document.getElementById('styleGenSection'),
        styleGenToggle: document.getElementById('styleGenToggle'),
        aspectRatio: document.getElementById('aspectRatio'),
        variations: document.getElementById('variations'),
        iconStyle: document.getElementById('iconStyle'),
        seedInput: document.getElementById('seedInput'),
        randomSeed: document.getElementById('randomSeed'),
        brandColors: document.getElementById('brandColors'),
        negativePrompt: document.getElementById('negativePrompt'),
        styleUploadArea: document.getElementById('styleUploadArea'),
        styleReference: document.getElementById('styleReference'),
        stylePreviewContainer: document.getElementById('stylePreviewContainer'),
        stylePreviewImg: document.getElementById('stylePreviewImg'),
        removeStyleRef: document.getElementById('removeStyleRef'),
        styleStrengthSlider: document.getElementById('styleStrengthSlider'),
        styleStrength: document.getElementById('styleStrength'),
        styleStrengthValue: document.getElementById('styleStrengthValue'),

        // Image Quality Options
        layoutTemplate: document.getElementById('layoutTemplate'),
        visualDensity: document.getElementById('visualDensity'),
        visualDensityValue: document.getElementById('visualDensityValue'),
        fontStyle: document.getElementById('fontStyle'),
        colorHarmony: document.getElementById('colorHarmony'),
        productFocus: document.getElementById('productFocus'),
        contextDescriptionGroup: document.getElementById('contextDescriptionGroup'),
        contextDescription: document.getElementById('contextDescription'),

        // Brand Color Picker
        colorPresets: document.getElementById('colorPresets'),
        selectedColorsContainer: document.getElementById('selectedColors'),
        customColorPicker: document.getElementById('customColorPicker'),
        customColorHex: document.getElementById('customColorHex'),
        addCustomColorBtn: document.getElementById('addCustomColor'),

        // Callout Lines
        calloutLinesEnabled: document.getElementById('calloutLinesEnabled'),
        calloutLinesOptions: document.getElementById('calloutLinesOptions'),
        lineThickness: document.getElementById('lineThickness'),
        lineThicknessValue: document.getElementById('lineThicknessValue'),
        lineColorMode: document.getElementById('lineColorMode'),

        // Results
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        resultContainer: document.getElementById('resultContainer'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),
        seedDisplay: document.getElementById('seedDisplay'),
        seedValue: document.getElementById('seedValue'),
        copySeedBtn: document.getElementById('copySeedBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        downloadAllBtn: document.getElementById('downloadAllBtn'),
        compareBtn: document.getElementById('compareBtn'),

        // Aspect Ratio Preview
        aspectPreviewBox: document.getElementById('aspectPreviewBox'),
        aspectPreviewInner: document.getElementById('aspectPreviewInner'),

        // Feedback
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // Alt Text
        altTextSection: document.getElementById('altTextSection'),
        altTextContent: document.getElementById('altTextContent'),
        copyAltText: document.getElementById('copyAltText'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxDownload: document.getElementById('lightboxDownload'),

        // Watermark
        watermarkSection: document.getElementById('watermarkSection'),
        watermarkToggle: document.getElementById('watermarkToggle'),
        watermarkTabs: document.querySelectorAll('.watermark-tab'),
        watermarkTextTab: document.getElementById('watermarkTextTab'),
        watermarkLogoTab: document.getElementById('watermarkLogoTab'),
        watermarkText: document.getElementById('watermarkText'),
        watermarkLogo: document.getElementById('watermarkLogo'),
        uploadLogoBtn: document.getElementById('uploadLogoBtn'),
        watermarkLogoPreview: document.getElementById('watermarkLogoPreview'),
        watermarkPositionBtns: document.querySelectorAll('.pos-btn'),
        watermarkOpacity: document.getElementById('watermarkOpacity'),
        opacityValue: document.getElementById('opacityValue'),
        watermarkSize: document.getElementById('watermarkSize'),
        sizeValue: document.getElementById('sizeValue'),
        watermarkSizeGroup: document.getElementById('watermarkSizeGroup'),
        applyWatermark: document.getElementById('applyWatermark'),

        // History
        historySection: document.getElementById('historySection'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        historyModal: document.getElementById('historyModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalImage: document.getElementById('modalImage'),
        closeModal: document.getElementById('closeModal'),
        modalDownload: document.getElementById('modalDownload'),
        modalUseAsBase: document.getElementById('modalUseAsBase'),
        // History Organization
        historySearch: document.getElementById('historySearch'),
        bulkModeBtn: document.getElementById('bulkModeBtn'),
        historyBulkBar: document.getElementById('historyBulkBar'),
        historySelectAll: document.getElementById('historySelectAll'),
        historySelectedCount: document.getElementById('historySelectedCount'),
        bulkDownloadBtn: document.getElementById('bulkDownloadBtn'),
        bulkDeleteBtn: document.getElementById('bulkDeleteBtn'),

        // Image info
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),

        // Batch mode
        batchModeToggle: document.getElementById('batchModeToggle'),
        singleUploadContainer: document.getElementById('singleUploadContainer'),
        batchUploadContainer: document.getElementById('batchUploadContainer'),
        batchUploadArea: document.getElementById('batchUploadArea'),
        batchProductPhotos: document.getElementById('batchProductPhotos'),
        batchQueue: document.getElementById('batchQueue'),
        batchControls: document.getElementById('batchControls'),
        batchStatus: document.getElementById('batchStatus'),
        batchProgressFill: document.getElementById('batchProgressFill'),
        clearBatchBtn: document.getElementById('clearBatchBtn'),
        startBatchBtn: document.getElementById('startBatchBtn'),

        // Favorites
        favoriteBtn: document.getElementById('favoriteBtn'),
        favoritesSection: document.getElementById('favoritesSection'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
        favoritesEmpty: document.getElementById('favoritesEmpty'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
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
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn'),
        // Favorites Organization
        favoritesSearch: document.getElementById('favoritesSearch'),
        folderNav: document.getElementById('folderNav'),
        tagFilters: document.getElementById('tagFilters'),
        tagChips: document.getElementById('tagChips'),
        favoriteFolderSelect: document.getElementById('favoriteFolderSelect'),
        favoriteFolderNew: document.getElementById('favoriteFolderNew'),
        favoriteTagsContainer: document.getElementById('favoriteTagsContainer'),
        favoriteTagInput: document.getElementById('favoriteTagInput'),
        addFavoriteTagBtn: document.getElementById('addFavoriteTagBtn'),

        // Product Copy
        productCopySection: document.getElementById('productCopySection'),
        copyToggle: document.getElementById('copyToggle'),
        copySectionContent: document.getElementById('copySectionContent'),
        shortDescContent: document.getElementById('shortDescContent'),
        longDescContent: document.getElementById('longDescContent'),
        taglinesContent: document.getElementById('taglinesContent'),
        socialTabs: document.getElementById('socialTabs'),
        socialContent: document.getElementById('socialContent'),
        seoTitleContent: document.getElementById('seoTitleContent'),
        seoDescContent: document.getElementById('seoDescContent'),

        // Templates & Presets
        platformPresets: document.getElementById('platformPresets'),
        templateSelect: document.getElementById('templateSelect'),
        saveTemplateBtn: document.getElementById('saveTemplateBtn'),
        deleteTemplateBtn: document.getElementById('deleteTemplateBtn'),

        // AI Analyze
        analyzeImageBtn: document.getElementById('analyzeImageBtn'),

        // Settings Section
        settingsSection: document.getElementById('settingsSection'),
        settingsToggle: document.getElementById('settingsToggle'),

        // Smart Regeneration
        smartRegenSection: document.getElementById('smartRegenSection'),
        smartRegenToggle: document.getElementById('smartRegenToggle'),
        lockLayout: document.getElementById('lockLayout'),
        lockColors: document.getElementById('lockColors'),
        lockBackground: document.getElementById('lockBackground'),
        lockTextStyle: document.getElementById('lockTextStyle'),
        variationStrength: document.getElementById('variationStrength'),
        variationStrengthValue: document.getElementById('variationStrengthValue'),
        smartRegenBtn: document.getElementById('smartRegenBtn'),

        // Complementary Images
        complementarySection: document.getElementById('complementarySection'),
        complementaryToggle: document.getElementById('complementaryToggle'),
        compTypeBtns: document.querySelectorAll('.comp-type-btn'),
        closeupOptions: document.getElementById('closeupOptions'),
        angleOptions: document.getElementById('angleOptions'),
        featureOptions: document.getElementById('featureOptions'),
        closeupFocus: document.getElementById('closeupFocus'),
        angleCheckboxes: document.querySelectorAll('#angleOptions .angle-checkbox input'),
        featureSelect: document.getElementById('featureSelect'),
        compStyleBtns: document.querySelectorAll('.style-btn'),
        compQtyBtns: document.querySelectorAll('.qty-btn'),
        generateCompBtn: document.getElementById('generateComplementaryBtn'),
        compResultsGrid: document.getElementById('compResultsGrid'),
        compResultsContainer: document.getElementById('compResults')
    };
}

// ============================================
// LANGUAGE HANDLING
// ============================================
const pageTranslations = {
    en: {
        titleHint: '(in English)',
        charHint: 'Star = primary',
        titlePlaceholder: 'e.g., Premium Wireless Headphones',
        charPlaceholders: [
            'e.g., Active Noise Cancellation',
            'e.g., 30-hour battery life',
            'e.g., Bluetooth 5.3'
        ]
    },
    ro: {
        titleHint: '(în română)',
        charHint: 'Stea = important',
        titlePlaceholder: 'ex., Căști Wireless Premium',
        charPlaceholders: [
            'ex., Anulare Activă a Zgomotului',
            'ex., Autonomie 30 ore',
            'ex., Bluetooth 5.3'
        ]
    }
};

function updateLanguage(lang) {
    state.language = lang;

    elements.langOptions.forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    const t = pageTranslations[lang];
    elements.titleHint.textContent = t.titleHint;
    elements.charHint.textContent = t.charHint;
    elements.productTitle.placeholder = t.titlePlaceholder;

    const charInputs = elements.characteristicsList.querySelectorAll('.char-item .input-field');
    charInputs.forEach((input, index) => {
        const placeholder = t.charPlaceholders[index] || t.charPlaceholders[0];
        input.placeholder = placeholder;
    });
}

// ============================================
// THEME HANDLING (uses SharedTheme)
// ============================================
function loadTheme() {
    SharedTheme.init();
    state.theme = SharedTheme.current;
}

function toggleTheme() {
    SharedTheme.toggle();
    state.theme = SharedTheme.current;
}

// ============================================
// API KEY HANDLING (uses SharedAPI)
// ============================================
function loadApiKey() {
    const savedKey = SharedAPI.getKey();
    if (savedKey) {
        state.apiKey = savedKey;
        elements.apiKeyInput.value = savedKey;
    }
}

function updateApiStatus(connected) {
    SharedUI.updateApiStatus(elements.apiStatus, connected);
}

function setupApiKeyHandlers() {
    elements.toggleApiKeyBtn.addEventListener('click', () => {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    });

    elements.saveApiKeyBtn.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        if (SharedAPI.saveKey(key)) {
            state.apiKey = key;
            updateApiStatus(true);
            showSuccess('API key saved successfully!');
        } else {
            showError('Please enter a valid API key');
        }
    });

    // Update status on load if key exists
    if (state.apiKey) {
        updateApiStatus(true);
    }
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
function setupImageUploadHandlers() {
    elements.uploadArea.addEventListener('click', () => {
        elements.productPhoto.click();
    });

    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });

    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    elements.productPhoto.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });

    elements.removeImageBtn.addEventListener('click', () => {
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.productPhoto.value = '';
        elements.imagePreview.classList.remove('visible');
        elements.uploadArea.style.display = 'block';
        // Hide AI analyze button
        if (elements.analyzeImageBtn) {
            elements.analyzeImageBtn.style.display = 'none';
        }
    });

    // Multi-angle toggle
    elements.multiAngleToggle?.addEventListener('change', (e) => {
        state.multiAngleMode = e.target.checked;
        toggleMultiAngleMode(state.multiAngleMode);
    });

    // Multi-angle file input
    elements.multiAngleInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleMultiAngleUpload(Array.from(e.target.files));
            e.target.value = ''; // Reset for re-upload
        }
    });

    // Multi-angle drag and drop
    elements.multiAngleAdd?.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.multiAngleAdd.classList.add('dragover');
    });

    elements.multiAngleAdd?.addEventListener('dragleave', () => {
        elements.multiAngleAdd.classList.remove('dragover');
    });

    elements.multiAngleAdd?.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.multiAngleAdd.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(f =>
            ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
        );
        if (files.length > 0) {
            handleMultiAngleUpload(files);
        }
    });
}

function handleImageUpload(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload PNG, JPG, JPEG, or WebP.');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('File too large. Maximum size is 10MB.');
        return;
    }

    state.uploadedImage = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        let imageData = e.target.result;

        // Auto-enhance if enabled
        if (elements.autoEnhance && elements.autoEnhance.checked) {
            enhanceImage(imageData).then(enhanced => {
                state.uploadedImageBase64 = enhanced;
                elements.previewImg.src = enhanced;
                elements.imagePreview.classList.add('visible');
                elements.uploadArea.style.display = 'none';
                // Show AI analyze button
                if (elements.analyzeImageBtn) {
                    elements.analyzeImageBtn.style.display = 'flex';
                }
            });
        } else {
            state.uploadedImageBase64 = imageData;
            elements.previewImg.src = imageData;
            elements.imagePreview.classList.add('visible');
            elements.uploadArea.style.display = 'none';
            // Show AI analyze button
            if (elements.analyzeImageBtn) {
                elements.analyzeImageBtn.style.display = 'flex';
            }
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// MULTI-ANGLE UPLOAD
// ============================================
function toggleMultiAngleMode(enabled) {
    if (enabled) {
        elements.singleImageUpload.style.display = 'none';
        elements.multiAngleUpload.style.display = 'flex';
        // Clear single image if switching
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.imagePreview.classList.remove('visible');
    } else {
        elements.singleImageUpload.style.display = 'block';
        elements.multiAngleUpload.style.display = 'none';
        // Clear multi-angle images if switching
        state.referenceImages = [];
        renderMultiAngleGrid();
    }
    updateMultiAngleCount();
}

async function handleMultiAngleUpload(files) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const remaining = state.maxReferenceImages - state.referenceImages.length;

    if (remaining <= 0) {
        showError(`Maximum ${state.maxReferenceImages} images allowed`);
        return;
    }

    const filesToProcess = files.slice(0, remaining);
    const angleLabels = ['Front', 'Back', 'Side', 'Detail'];

    for (const file of filesToProcess) {
        if (!validTypes.includes(file.type)) {
            showError(`Skipped ${file.name}: Invalid file type`);
            continue;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError(`Skipped ${file.name}: File too large (max 10MB)`);
            continue;
        }

        const base64 = await readFileAsBase64(file);
        const enhanced = elements.autoEnhance?.checked
            ? await enhanceImage(base64)
            : base64;

        const currentIndex = state.referenceImages.length;
        state.referenceImages.push({
            id: Date.now() + Math.random(),
            file: file,
            base64: enhanced,
            label: angleLabels[currentIndex] || `Angle ${currentIndex + 1}`
        });
    }

    renderMultiAngleGrid();
    updateMultiAngleCount();

    // Also set the first image as the primary for compatibility
    if (state.referenceImages.length > 0) {
        state.uploadedImageBase64 = state.referenceImages[0].base64;
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function removeMultiAngleImage(id) {
    state.referenceImages = state.referenceImages.filter(img => img.id !== id);
    renderMultiAngleGrid();
    updateMultiAngleCount();

    // Update primary image
    if (state.referenceImages.length > 0) {
        state.uploadedImageBase64 = state.referenceImages[0].base64;
    } else {
        state.uploadedImageBase64 = null;
    }
}

function renderMultiAngleGrid() {
    if (!elements.multiAngleGrid) return;

    if (state.referenceImages.length === 0) {
        elements.multiAngleGrid.innerHTML = '';
        return;
    }

    elements.multiAngleGrid.innerHTML = state.referenceImages.map(img => `
        <div class="multi-angle-item" data-id="${img.id}">
            <img src="${img.base64}" alt="${img.label}">
            <span class="multi-angle-item-label">${img.label}</span>
            <button type="button" class="multi-angle-item-remove" onclick="removeMultiAngleImage(${img.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function updateMultiAngleCount() {
    if (!elements.multiAngleCount) return;
    elements.multiAngleCount.textContent = `${state.referenceImages.length}/${state.maxReferenceImages}`;

    // Disable add button if at max
    if (elements.multiAngleAdd) {
        elements.multiAngleAdd.classList.toggle('disabled', state.referenceImages.length >= state.maxReferenceImages);
    }
}

// Make removeMultiAngleImage globally accessible for onclick
window.removeMultiAngleImage = removeMultiAngleImage;

// Auto-enhance image function
async function enhanceImage(base64Image) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Calculate histogram for auto-levels
            let minR = 255, maxR = 0;
            let minG = 255, maxG = 0;
            let minB = 255, maxB = 0;

            for (let i = 0; i < data.length; i += 4) {
                minR = Math.min(minR, data[i]);
                maxR = Math.max(maxR, data[i]);
                minG = Math.min(minG, data[i + 1]);
                maxG = Math.max(maxG, data[i + 1]);
                minB = Math.min(minB, data[i + 2]);
                maxB = Math.max(maxB, data[i + 2]);
            }

            // Apply auto-levels with slight contrast boost
            const contrastFactor = 1.1;
            const brightnessAdjust = 10;

            for (let i = 0; i < data.length; i += 4) {
                // Auto-levels
                let r = ((data[i] - minR) / (maxR - minR || 1)) * 255;
                let g = ((data[i + 1] - minG) / (maxG - minG || 1)) * 255;
                let b = ((data[i + 2] - minB) / (maxB - minB || 1)) * 255;

                // Contrast adjustment
                r = ((r - 128) * contrastFactor) + 128 + brightnessAdjust;
                g = ((g - 128) * contrastFactor) + 128 + brightnessAdjust;
                b = ((b - 128) * contrastFactor) + 128 + brightnessAdjust;

                // Clamp values
                data[i] = Math.max(0, Math.min(255, r));
                data[i + 1] = Math.max(0, Math.min(255, g));
                data[i + 2] = Math.max(0, Math.min(255, b));
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = base64Image;
    });
}

// ============================================
// ADVANCED OPTIONS HANDLING
// ============================================
function setupAdvancedOptionsHandlers() {
    elements.advancedToggle.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
        localStorage.setItem('advancedOptionsOpen', elements.advancedSection.classList.contains('open'));
    });

    if (localStorage.getItem('advancedOptionsOpen') === 'true') {
        elements.advancedSection.classList.add('open');
    }

    // Style & Generation nested section toggle
    if (elements.styleGenToggle && elements.styleGenSection) {
        elements.styleGenToggle.addEventListener('click', () => {
            elements.styleGenSection.classList.toggle('open');
            localStorage.setItem('styleGenOpen', elements.styleGenSection.classList.contains('open'));
        });

        if (localStorage.getItem('styleGenOpen') === 'true') {
            elements.styleGenSection.classList.add('open');
        }
    }

    elements.randomSeed.addEventListener('change', () => {
        elements.seedInput.disabled = elements.randomSeed.checked;
        if (elements.randomSeed.checked) {
            elements.seedInput.value = '';
            elements.seedInput.placeholder = 'Random';
        } else {
            elements.seedInput.placeholder = 'Enter seed';
        }
    });

    elements.seedInput.disabled = elements.randomSeed.checked;

    // Style reference upload
    elements.styleUploadArea.addEventListener('click', () => {
        elements.styleReference.click();
    });

    elements.styleReference.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleStyleReferenceUpload(e.target.files[0]);
        }
    });

    elements.removeStyleRef.addEventListener('click', () => {
        state.styleReferenceBase64 = null;
        elements.styleReference.value = '';
        elements.styleUploadArea.style.display = 'block';
        elements.stylePreviewContainer.style.display = 'none';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.classList.remove('visible');
        }
    });

    // Style strength slider
    if (elements.styleStrength) {
        elements.styleStrength.addEventListener('input', () => {
            elements.styleStrengthValue.textContent = elements.styleStrength.value + '%';
        });
    }

    // Visual density slider
    if (elements.visualDensity) {
        elements.visualDensity.addEventListener('input', () => {
            const value = parseInt(elements.visualDensity.value);
            const labels = ['Minimal', 'Clean', 'Balanced', 'Detailed', 'Rich'];
            elements.visualDensityValue.textContent = labels[value - 1] || 'Balanced';
        });
    }

    // Callout lines toggle
    if (elements.calloutLinesEnabled) {
        elements.calloutLinesEnabled.addEventListener('change', () => {
            elements.calloutLinesOptions.classList.toggle('visible', elements.calloutLinesEnabled.checked);
        });
    }

    // Line thickness slider
    if (elements.lineThickness) {
        elements.lineThickness.addEventListener('input', () => {
            const value = parseInt(elements.lineThickness.value);
            const labels = ['Very Thin', 'Thin', 'Medium', 'Thick', 'Very Thick'];
            elements.lineThicknessValue.textContent = labels[value - 1] || 'Medium';
        });
    }

    // Product focus - show context description input when "In Context" is selected
    if (elements.productFocus) {
        elements.productFocus.addEventListener('change', () => {
            const showContext = elements.productFocus.value === 'context';
            if (elements.contextDescriptionGroup) {
                elements.contextDescriptionGroup.style.display = showContext ? 'block' : 'none';
            }
        });
    }
}

function handleStyleReferenceUpload(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type for style reference.');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('Style reference too large. Maximum size is 10MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.styleReferenceBase64 = e.target.result;
        elements.stylePreviewImg.src = e.target.result;
        elements.styleUploadArea.style.display = 'none';
        elements.stylePreviewContainer.style.display = 'inline-block';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.classList.add('visible');
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// BRAND COLOR PICKER
// ============================================
function setupColorPickerHandlers() {
    // Preset color buttons
    if (elements.colorPresets) {
        elements.colorPresets.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                toggleBrandColor(color);
                btn.classList.toggle('selected', state.selectedBrandColors.includes(color));
            });
        });
    }

    // Custom color picker sync with hex input
    if (elements.customColorPicker) {
        elements.customColorPicker.addEventListener('input', () => {
            elements.customColorHex.value = elements.customColorPicker.value.toUpperCase();
        });
    }

    // Hex input sync with color picker
    if (elements.customColorHex) {
        elements.customColorHex.addEventListener('input', () => {
            let value = elements.customColorHex.value;
            if (!value.startsWith('#')) {
                value = '#' + value;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                elements.customColorPicker.value = value;
            }
        });
    }

    // Add custom color button
    if (elements.addCustomColorBtn) {
        elements.addCustomColorBtn.addEventListener('click', () => {
            let color = elements.customColorHex.value.trim().toUpperCase();
            if (!color.startsWith('#')) {
                color = '#' + color;
            }
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                if (!state.selectedBrandColors.includes(color)) {
                    addBrandColor(color);
                } else {
                    showError('Color already added');
                }
            } else {
                showError('Please enter a valid hex color (e.g., #FF5733)');
            }
        });
    }
}

function toggleBrandColor(color) {
    const index = state.selectedBrandColors.indexOf(color);
    if (index > -1) {
        state.selectedBrandColors.splice(index, 1);
    } else {
        if (state.selectedBrandColors.length >= 5) {
            showError('Maximum 5 brand colors allowed');
            return;
        }
        state.selectedBrandColors.push(color);
    }
    renderSelectedColors();
    updateBrandColorsInput();
}

function addBrandColor(color) {
    if (state.selectedBrandColors.length >= 5) {
        showError('Maximum 5 brand colors allowed');
        return;
    }
    state.selectedBrandColors.push(color);
    renderSelectedColors();
    updateBrandColorsInput();

    // Update preset button state if it matches
    if (elements.colorPresets) {
        const presetBtn = elements.colorPresets.querySelector(`[data-color="${color}"]`);
        if (presetBtn) {
            presetBtn.classList.add('selected');
        }
    }
}

function removeBrandColor(color) {
    const index = state.selectedBrandColors.indexOf(color);
    if (index > -1) {
        state.selectedBrandColors.splice(index, 1);
        renderSelectedColors();
        updateBrandColorsInput();

        // Update preset button state
        if (elements.colorPresets) {
            const presetBtn = elements.colorPresets.querySelector(`[data-color="${color}"]`);
            if (presetBtn) {
                presetBtn.classList.remove('selected');
            }
        }
    }
}

function renderSelectedColors() {
    if (!elements.selectedColorsContainer) return;

    elements.selectedColorsContainer.innerHTML = state.selectedBrandColors.map(color => `
        <div class="selected-color-tag" data-color="${color}">
            <span class="selected-color-swatch" style="background: ${color};"></span>
            <span>${color}</span>
            <button type="button" class="selected-color-remove" title="Remove">&times;</button>
        </div>
    `).join('');

    // Attach remove handlers
    elements.selectedColorsContainer.querySelectorAll('.selected-color-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.target.closest('.selected-color-tag');
            if (tag) {
                removeBrandColor(tag.dataset.color);
            }
        });
    });
}

function updateBrandColorsInput() {
    if (elements.brandColors) {
        elements.brandColors.value = state.selectedBrandColors.join(', ');
    }
}

// ============================================
// CHARACTERISTICS HANDLING
// ============================================
function setupCharacteristicsHandlers() {
    elements.addCharBtn.addEventListener('click', () => {
        addCharacteristicItem();
    });

    // Attach handlers to initial remove buttons
    document.querySelectorAll('.char-remove').forEach(attachRemoveHandler);
    document.querySelectorAll('.char-star').forEach(attachStarHandler);

    // Initialize drag-to-reorder
    initDragAndDrop();
}

// ============================================
// BENEFITS HANDLING
// ============================================
function setupBenefitsHandlers() {
    elements.addBenefitBtn.addEventListener('click', () => {
        addBenefitItem();
    });

    // Attach handlers to initial remove buttons
    document.querySelectorAll('.benefit-remove').forEach(attachBenefitRemoveHandler);
}

function addBenefitItem() {
    const div = document.createElement('div');
    div.className = 'benefit-item';
    div.innerHTML = `
        <input type="text" class="input-field" placeholder="e.g., Crystal-clear sound quality">
        <button type="button" class="benefit-remove" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    elements.benefitsList.appendChild(div);
    attachBenefitRemoveHandler(div.querySelector('.benefit-remove'));
}

function attachBenefitRemoveHandler(btn) {
    btn.addEventListener('click', () => {
        const items = elements.benefitsList.querySelectorAll('.benefit-item');
        if (items.length > 1) {
            btn.closest('.benefit-item').remove();
        }
    });
}

function addCharacteristicItem() {
    const t = translations[state.language];
    const div = document.createElement('div');
    div.className = 'char-item';
    div.draggable = true;
    div.innerHTML = `
        <div class="char-drag" title="Drag to reorder">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
            </svg>
        </div>
        <button type="button" class="char-star" title="Mark as primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        </button>
        <input type="text" class="input-field" placeholder="${t.charPlaceholders[0]}">
        <button type="button" class="char-remove" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    elements.characteristicsList.appendChild(div);
    attachRemoveHandler(div.querySelector('.char-remove'));
    attachStarHandler(div.querySelector('.char-star'));
    attachDragHandlers(div);
}

function attachRemoveHandler(btn) {
    btn.addEventListener('click', () => {
        const items = elements.characteristicsList.querySelectorAll('.char-item');
        if (items.length > 1) {
            btn.closest('.char-item').remove();
        } else {
            showError('You need at least one characteristic');
        }
    });
}

function attachStarHandler(btn) {
    btn.addEventListener('click', () => {
        btn.classList.toggle('starred');
    });
}

// ============================================
// DRAG AND DROP REORDERING
// ============================================
let draggedItem = null;

function attachDragHandlers(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.char-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.stopPropagation();
    e.preventDefault();

    if (draggedItem !== this) {
        const list = elements.characteristicsList;
        const items = Array.from(list.querySelectorAll('.char-item'));
        const draggedIdx = items.indexOf(draggedItem);
        const targetIdx = items.indexOf(this);

        if (draggedIdx < targetIdx) {
            list.insertBefore(draggedItem, this.nextSibling);
        } else {
            list.insertBefore(draggedItem, this);
        }
    }

    this.classList.remove('drag-over');
    return false;
}

function initDragAndDrop() {
    document.querySelectorAll('.char-item').forEach(attachDragHandlers);
}

// ============================================
// MESSAGE DISPLAY
// ============================================
function showError(message) {
    elements.errorMessage.querySelector('.error-text').textContent = message;
    elements.errorMessage.classList.add('visible');
    elements.successMessage.classList.remove('visible');

    setTimeout(() => {
        elements.errorMessage.classList.remove('visible');
    }, 5000);
}

function showSuccess(message) {
    const content = elements.successMessage.querySelector('.message-content');
    if (content) {
        content.textContent = message;
    }
    elements.successMessage.classList.add('visible');
    elements.errorMessage.classList.remove('visible');

    setTimeout(() => {
        elements.successMessage.classList.remove('visible');
    }, 3000);
}

function updateLoadingStatus(status) {
    elements.loadingStatus.textContent = status;
}

// ============================================
// UI STATE MANAGEMENT
// ============================================
function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultContainer.classList.remove('visible');
    elements.loadingContainer.classList.add('visible');
    elements.generateBtn.disabled = true;
}

function hideLoading() {
    elements.loadingContainer.classList.remove('visible');
    elements.generateBtn.disabled = false;
}

function showResult(imageUrl) {
    hideLoading();

    elements.resultImage.src = imageUrl;
    elements.resultImage.style.display = 'block';
    elements.resultGrid.style.display = 'none';
    elements.resultContainer.classList.add('visible');
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];

    // Hide download all button for single image
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.style.display = 'none';
    }
    if (elements.compareBtn) {
        elements.compareBtn.style.display = 'none';
    }

    if (state.lastSeed !== null) {
        elements.seedValue.textContent = state.lastSeed;
        elements.seedDisplay.style.display = 'flex';
    }

    elements.feedbackTextarea.value = '';

    const title = elements.productTitle.value.trim() || 'Untitled';
    addToHistory(imageUrl, title);

    generateAltText(imageUrl);

    // Show complementary images section
    showComplementarySection();
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

    elements.resultGrid.querySelectorAll('.result-grid-item').forEach(item => {
        item.addEventListener('click', (e) => {
            elements.resultGrid.querySelectorAll('.result-grid-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const index = parseInt(item.dataset.index, 10);
            state.generatedImageUrl = imageUrls[index];
        });
        item.addEventListener('dblclick', () => {
            const index = parseInt(item.dataset.index, 10);
            openLightbox(imageUrls[index]);
        });
    });

    elements.resultContainer.classList.add('visible');
    state.generatedImageUrl = imageUrls[0];
    state.generatedImages = imageUrls;

    // Show download all and compare buttons for multiple images
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.style.display = imageUrls.length > 1 ? 'inline-flex' : 'none';
    }
    if (elements.compareBtn) {
        elements.compareBtn.style.display = imageUrls.length >= 2 ? 'inline-flex' : 'none';
    }

    if (state.lastSeed !== null) {
        elements.seedValue.textContent = state.lastSeed;
        elements.seedDisplay.style.display = 'flex';
    }

    elements.feedbackTextarea.value = '';

    const title = elements.productTitle.value.trim() || 'Untitled';
    imageUrls.forEach((url, index) => {
        addToHistory(url, `${title} (${index + 1}/${imageUrls.length})`);
    });

    generateAltText(imageUrls[0]);

    // Show complementary images section
    showComplementarySection();
}

function resetToPlaceholder() {
    hideLoading();
    elements.resultContainer.classList.remove('visible');
    elements.resultPlaceholder.style.display = 'flex';
    elements.seedDisplay.style.display = 'none';
}

// ============================================
// HISTORY MANAGEMENT (uses SharedHistory with IndexedDB)
// ============================================
const history = new SharedHistory('ngraphics_history', 20);

function loadHistory() {
    history.setImageStore(imageStore);
    state.history = history.load();
    renderHistory();
}

async function addToHistory(imageUrl, title) {
    await history.add(imageUrl, {
        title: title || 'Untitled',
        imageUrls: [imageUrl]
    });
    state.history = history.getAll();
    renderHistory();
}

async function deleteFromHistory(id) {
    const itemId = parseInt(id, 10) || id;
    const item = history.findById(itemId);

    // Move to trash before removing
    if (item) {
        SharedTrash.add(item, 'history', 'infographics');
    }

    await history.remove(itemId);
    state.history = history.getAll();
    renderHistory();
    SharedUI.toast('Moved to trash', 'info');
}

async function clearHistory() {
    const confirmed = await SharedUI.confirm('Are you sure you want to clear all history? Items will be moved to trash.', {
        title: 'Clear History',
        confirmText: 'Clear All',
        icon: 'warning'
    });
    if (confirmed) {
        // Move all items to trash before clearing
        const items = history.getAll();
        items.forEach(item => {
            SharedTrash.add(item, 'history', 'infographics');
        });

        await history.clear();
        state.history = [];
        renderHistory();
        SharedUI.toast(`${items.length} items moved to trash`, 'success');
    }
}

function renderHistory() {
    const grid = elements.historyGrid;
    const empty = elements.historyEmpty;
    const count = elements.historyCount;

    // Filter items based on search query
    let items = state.historySearchQuery
        ? history.search(state.historySearchQuery)
        : state.history;

    count.textContent = state.history.length > 0 ? `(${state.history.length})` : '';

    if (items.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        if (state.historySearchQuery && state.history.length > 0) {
            empty.querySelector('.empty-state-title').textContent = 'No Results';
            empty.querySelector('.empty-state-text').textContent = 'No history items match your search.';
        } else {
            empty.querySelector('.empty-state-title').textContent = 'No History Yet';
            empty.querySelector('.empty-state-text').textContent = 'Generated images will appear here. Start by uploading a product image.';
        }
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    // Add bulk-mode class to grid if in bulk mode
    grid.classList.toggle('bulk-mode', state.historyBulkMode);

    grid.innerHTML = items.map(item => {
        const date = new Date(item.timestamp || item.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        // Use thumbnail for grid display
        const imgSrc = item.thumbnail || item.imageUrl;
        const isSelected = state.historySelectedIds.has(item.id);

        return `
            <div class="history-item${isSelected ? ' selected' : ''}" data-id="${item.id}">
                <img src="${imgSrc}" alt="${item.title || 'History item'}" loading="lazy">
                <div class="history-item-overlay">
                    <div class="history-item-date">${dateStr}</div>
                </div>
                ${!state.historyBulkMode ? `<button class="history-item-delete" data-id="${item.id}" title="Delete">&times;</button>` : ''}
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (state.historyBulkMode) {
                // Toggle selection in bulk mode
                toggleHistorySelection(parseInt(item.dataset.id, 10));
            } else if (!e.target.classList.contains('history-item-delete')) {
                openHistoryModal(item.dataset.id);
            }
        });
    });

    if (!state.historyBulkMode) {
        grid.querySelectorAll('.history-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFromHistory(btn.dataset.id);
            });
        });
    }

    // Update selected count
    updateBulkSelectionCount();
}

function toggleHistoryBulkMode() {
    state.historyBulkMode = !state.historyBulkMode;
    state.historySelectedIds.clear();

    elements.bulkModeBtn.classList.toggle('active', state.historyBulkMode);
    elements.historyBulkBar.style.display = state.historyBulkMode ? 'flex' : 'none';
    elements.historySelectAll.checked = false;

    renderHistory();
}

function toggleHistorySelection(id) {
    if (state.historySelectedIds.has(id)) {
        state.historySelectedIds.delete(id);
    } else {
        state.historySelectedIds.add(id);
    }

    const item = elements.historyGrid.querySelector(`[data-id="${id}"]`);
    if (item) {
        item.classList.toggle('selected', state.historySelectedIds.has(id));
    }

    updateBulkSelectionCount();
}

function toggleSelectAllHistory() {
    const items = state.historySearchQuery ? history.search(state.historySearchQuery) : state.history;

    if (elements.historySelectAll.checked) {
        // Select all
        items.forEach(item => state.historySelectedIds.add(item.id));
    } else {
        // Deselect all
        state.historySelectedIds.clear();
    }

    renderHistory();
}

function updateBulkSelectionCount() {
    if (elements.historySelectedCount) {
        elements.historySelectedCount.textContent = state.historySelectedIds.size;
    }

    // Update select all checkbox state
    const items = state.historySearchQuery ? history.search(state.historySearchQuery) : state.history;
    if (elements.historySelectAll && items.length > 0) {
        elements.historySelectAll.checked = state.historySelectedIds.size === items.length;
        elements.historySelectAll.indeterminate = state.historySelectedIds.size > 0 && state.historySelectedIds.size < items.length;
    }
}

async function bulkDeleteHistory() {
    if (state.historySelectedIds.size === 0) return;

    const count = state.historySelectedIds.size;
    if (!confirm(`Delete ${count} selected item${count > 1 ? 's' : ''}?`)) return;

    await history.removeMultiple(Array.from(state.historySelectedIds));
    state.history = history.getAll();
    state.historySelectedIds.clear();

    // Exit bulk mode after deletion
    toggleHistoryBulkMode();
    showSuccess(`Deleted ${count} item${count > 1 ? 's' : ''}`);
}

async function bulkDownloadHistory() {
    if (state.historySelectedIds.size === 0) return;

    const ids = Array.from(state.historySelectedIds);
    showSuccess(`Downloading ${ids.length} image${ids.length > 1 ? 's' : ''}...`);

    for (const id of ids) {
        const item = history.findById(id);
        if (!item) continue;

        // Get full image from IndexedDB
        const images = await history.getImages(id);
        const imageUrl = images?.imageUrl || item.thumbnail;

        if (imageUrl) {
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const title = (item.title || 'infographic').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
            link.download = `infographic_${title}_${timestamp}.png`;
            link.href = imageUrl;
            link.click();

            // Small delay between downloads
            await new Promise(r => setTimeout(r, 300));
        }
    }
}

async function openHistoryModal(id) {
    const numId = parseInt(id, 10) || id;
    const item = history.findById(numId);
    if (!item) return;

    // Fetch full image from IndexedDB
    const images = await history.getImages(numId);
    const fullImageUrl = images?.imageUrl || item.thumbnail || item.imageUrl;

    state.selectedHistoryItem = { ...item, imageUrl: fullImageUrl };
    elements.modalTitle.textContent = item.title || 'Infographic';
    elements.modalImage.src = fullImageUrl;
    elements.historyModal.classList.add('visible');
}

function closeHistoryModal() {
    elements.historyModal.classList.remove('visible');
    state.selectedHistoryItem = null;
}

function downloadFromModal() {
    if (!state.selectedHistoryItem) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const title = (state.selectedHistoryItem.title || 'infographic').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `infographic_${title}_${timestamp}.png`;
    link.href = state.selectedHistoryItem.imageUrl;
    link.click();
}

function loadHistoryToEditor() {
    if (!state.selectedHistoryItem) return;

    state.generatedImageUrl = state.selectedHistoryItem.imageUrl;
    elements.resultImage.src = state.selectedHistoryItem.imageUrl;
    elements.resultPlaceholder.style.display = 'none';
    elements.resultContainer.classList.add('visible');

    closeHistoryModal();
    showSuccess('Image loaded to editor!');

    elements.resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// FAVORITES MANAGEMENT
// ============================================
function captureCurrentSettings() {
    // Capture all current form settings
    const charItems = elements.characteristicsList.querySelectorAll('.char-item');
    const characteristics = [];

    charItems.forEach((item, index) => {
        const input = item.querySelector('.input-field');
        const starBtn = item.querySelector('.char-star');
        const iconSelect = item.querySelector('.char-icon-select');

        const text = input ? input.value.trim() : '';
        if (text) {
            characteristics.push({
                text,
                starred: starBtn && starBtn.classList.contains('starred'),
                icon: iconSelect ? iconSelect.value : 'auto'
            });
        }
    });

    // Capture benefits
    const benefitItems = elements.benefitsList.querySelectorAll('.benefit-item');
    const benefits = [];
    benefitItems.forEach(item => {
        const input = item.querySelector('.input-field');
        const text = input ? input.value.trim() : '';
        if (text) {
            benefits.push(text);
        }
    });

    return {
        model: elements.aiModel?.value,
        style: elements.infographicStyle?.value,
        layout: elements.layoutTemplate?.value,
        aspectRatio: elements.aspectRatio?.value,
        productFocus: elements.productFocus?.value,
        contextDescription: elements.contextDescription?.value || '',
        visualDensity: elements.visualDensity?.value,
        fontStyle: elements.fontStyle?.value,
        iconStyle: elements.iconStyle?.value,
        colorHarmony: elements.colorHarmony?.value,
        brandColors: [...state.selectedBrandColors],
        calloutLinesEnabled: elements.calloutLinesEnabled?.checked,
        lineThickness: elements.lineThickness?.value,
        lineColorMode: elements.lineColorMode?.value,
        negativePrompt: elements.negativePrompt?.value || '',
        variations: state.variations,
        styleStrength: elements.styleStrength?.value,
        characteristics,
        benefits
    };
}

async function saveFavorite() {
    if (!state.generatedImageUrl) {
        showError('No image to save. Generate an image first.');
        return;
    }

    const settings = captureCurrentSettings();
    const name = elements.productTitle.value.trim() || 'Untitled';

    try {
        const favorite = await favorites.add({
            name,
            imageUrl: state.generatedImageUrl,
            imageUrls: state.generatedImages, // All variants
            seed: state.lastSeed,
            prompt: state.lastPrompt,
            productImageBase64: state.uploadedImageBase64,
            styleReferenceBase64: state.styleReferenceBase64,
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

function renderFavorites() {
    const grid = elements.favoritesGrid;
    const empty = elements.favoritesEmpty;
    const count = elements.favoritesCount;
    const allItems = favorites.getAll();

    // Apply filters
    let items = favorites.filter({
        folder: state.favoritesActiveFolder === 'null' ? null : (state.favoritesActiveFolder || undefined),
        tag: state.favoritesActiveTag || undefined,
        query: state.favoritesSearchQuery || undefined
    });

    count.textContent = allItems.length;

    // Update folder navigation
    renderFolderNav();
    renderTagFilters();

    if (items.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
        if ((state.favoritesSearchQuery || state.favoritesActiveFolder || state.favoritesActiveTag) && allItems.length > 0) {
            empty.querySelector('.empty-state-title').textContent = 'No Results';
            empty.querySelector('.empty-state-text').textContent = 'No favorites match your current filters.';
        } else {
            empty.querySelector('.empty-state-title').textContent = 'No Favorites';
            empty.querySelector('.empty-state-text').textContent = 'Star your best generations to save them here for easy style reuse.';
        }
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    // Use thumbnail for grid display (falls back to imageUrl for legacy items)
    grid.innerHTML = items.map(item => `
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
                ${item.tags && item.tags.length > 0 ? `<div class="favorite-item-tags">${item.tags.slice(0, 2).map(t => `<span class="tag-mini">${t}</span>`).join('')}</div>` : ''}
            </div>
            <button class="favorite-item-delete" data-id="${item.id}" title="Delete">&times;</button>
        </div>
    `).join('');

    grid.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('favorite-item-delete')) {
                openFavoritesModal(parseInt(item.dataset.id, 10));
            }
        });
    });

    grid.querySelectorAll('.favorite-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFavorite(parseInt(btn.dataset.id, 10));
        });
    });
}

function renderFolderNav() {
    const nav = elements.folderNav;
    if (!nav) return;

    const folders = favorites.getAllFolders();

    // Keep the static "All" and "Unfiled" buttons, add dynamic folder buttons
    const existingFolderBtns = nav.querySelectorAll('.folder-btn[data-folder]:not([data-folder=""]):not([data-folder="null"])');
    existingFolderBtns.forEach(btn => btn.remove());

    // Add folder buttons
    folders.forEach(folder => {
        const btn = document.createElement('button');
        btn.className = 'folder-btn' + (state.favoritesActiveFolder === folder ? ' active' : '');
        btn.dataset.folder = folder;
        btn.title = folder;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            ${folder}
        `;
        nav.appendChild(btn);
    });

    // Update active state on existing buttons
    nav.querySelectorAll('.folder-btn').forEach(btn => {
        const folder = btn.dataset.folder;
        btn.classList.toggle('active', folder === state.favoritesActiveFolder);
    });

    // Setup click handlers
    nav.querySelectorAll('.folder-btn').forEach(btn => {
        btn.onclick = () => {
            state.favoritesActiveFolder = btn.dataset.folder;
            renderFavorites();
        };
    });
}

function renderTagFilters() {
    const container = elements.tagFilters;
    const chips = elements.tagChips;
    if (!container || !chips) return;

    const tags = favorites.getAllTags();

    if (tags.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    chips.innerHTML = tags.map(tag => `
        <button class="tag-filter-chip${state.favoritesActiveTag === tag ? ' active' : ''}" data-tag="${tag}">
            ${tag}
            ${state.favoritesActiveTag === tag ? '<span class="tag-clear">&times;</span>' : ''}
        </button>
    `).join('');

    chips.querySelectorAll('.tag-filter-chip').forEach(chip => {
        chip.onclick = () => {
            const tag = chip.dataset.tag;
            state.favoritesActiveTag = state.favoritesActiveTag === tag ? '' : tag;
            renderFavorites();
        };
    });
}

function renderFavoriteModalTags() {
    if (!state.selectedFavorite || !elements.favoriteTagsContainer) return;

    const tags = state.selectedFavorite.tags || [];
    elements.favoriteTagsContainer.innerHTML = tags.map(tag => `
        <span class="tag-chip">
            ${tag}
            <button class="tag-chip-remove" data-tag="${tag}">&times;</button>
        </span>
    `).join('');

    elements.favoriteTagsContainer.querySelectorAll('.tag-chip-remove').forEach(btn => {
        btn.onclick = () => {
            const tag = btn.dataset.tag;
            favorites.removeTag(state.selectedFavorite.id, tag);
            state.selectedFavorite = favorites.findById(state.selectedFavorite.id);
            renderFavoriteModalTags();
            renderFavorites();
        };
    });
}

function renderFolderSelect() {
    if (!elements.favoriteFolderSelect) return;

    const folders = favorites.getAllFolders();
    const currentFolder = state.selectedFavorite?.folder || '';

    elements.favoriteFolderSelect.innerHTML = '<option value="">None</option>' +
        folders.map(folder => `<option value="${folder}"${folder === currentFolder ? ' selected' : ''}>${folder}</option>`).join('');
}

function addTagToFavorite() {
    if (!state.selectedFavorite || !elements.favoriteTagInput) return;

    const tag = elements.favoriteTagInput.value.trim().toLowerCase();
    if (!tag) return;

    favorites.addTag(state.selectedFavorite.id, tag);
    state.selectedFavorite = favorites.findById(state.selectedFavorite.id);
    elements.favoriteTagInput.value = '';

    renderFavoriteModalTags();
    renderFavorites();
}

function setFavoriteFolder(folder) {
    if (!state.selectedFavorite) return;

    favorites.setFolder(state.selectedFavorite.id, folder || null);
    state.selectedFavorite = favorites.findById(state.selectedFavorite.id);
    renderFavorites();
}

async function openFavoritesModal(id) {
    const item = favorites.findById(id);
    if (!item) return;

    state.selectedFavorite = item;
    elements.favoriteNameInput.value = item.name;
    elements.favoriteSeedValue.textContent = item.seed || 'N/A';

    const date = new Date(item.timestamp);
    elements.favoriteDate.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // Render tags and folder UI
    renderFavoriteModalTags();
    renderFolderSelect();

    // Load full image from IndexedDB (fall back to thumbnail/imageUrl for legacy items)
    elements.favoritePreviewImg.src = item.thumbnail || '';
    elements.favoriteVariants.style.display = 'none';
    elements.favoriteVariants.innerHTML = '';
    elements.favoritesModal.classList.add('visible');

    try {
        const images = await favorites.getImages(id);
        if (images) {
            // Handle multiple variants
            const imageUrls = images.imageUrls || (images.imageUrl ? [images.imageUrl] : []);

            if (imageUrls.length > 0) {
                elements.favoritePreviewImg.src = imageUrls[0];
            }

            // Show variant thumbnails if more than 1
            if (imageUrls.length > 1) {
                elements.favoriteVariants.style.display = 'flex';
                elements.favoriteVariants.innerHTML = imageUrls.map((url, idx) => `
                    <div class="variant-thumb${idx === 0 ? ' active' : ''}" data-index="${idx}">
                        <img src="${url}" alt="Variant ${idx + 1}">
                    </div>
                `).join('');

                // Click handlers for variant thumbnails
                elements.favoriteVariants.querySelectorAll('.variant-thumb').forEach(thumb => {
                    thumb.addEventListener('click', () => {
                        const idx = parseInt(thumb.dataset.index, 10);
                        elements.favoritePreviewImg.src = imageUrls[idx];
                        elements.favoriteVariants.querySelectorAll('.variant-thumb').forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    });
                });
            }

            // Store images for use in loadFavorite/download
            state.selectedFavoriteImages = images;
        } else if (item.imageUrl) {
            // Legacy item with imageUrl in metadata
            elements.favoritePreviewImg.src = item.imageUrl;
            state.selectedFavoriteImages = { imageUrl: item.imageUrl };
        }
    } catch (error) {
        console.error('Failed to load favorite images:', error);
        // Fall back to thumbnail
        if (item.imageUrl) {
            elements.favoritePreviewImg.src = item.imageUrl;
        }
    }
}

function closeFavoritesModal() {
    // Save name if changed
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

    const fav = state.selectedFavorite;
    const settings = fav.settings || {};

    // Restore form settings
    if (elements.aiModel && settings.model) elements.aiModel.value = settings.model;
    if (elements.infographicStyle && settings.style) {
        elements.infographicStyle.value = settings.style;
        // Also update radio buttons to match
        if (elements.styleRadios) {
            elements.styleRadios.forEach(radio => {
                radio.checked = radio.value === settings.style;
            });
        }
    }
    if (elements.layoutTemplate && settings.layout) elements.layoutTemplate.value = settings.layout;
    if (elements.aspectRatio && settings.aspectRatio) elements.aspectRatio.value = settings.aspectRatio;
    if (elements.productFocus && settings.productFocus) {
        elements.productFocus.value = settings.productFocus;
        // Trigger change event for context description visibility
        elements.productFocus.dispatchEvent(new Event('change'));
    }
    if (elements.contextDescription && settings.contextDescription) {
        elements.contextDescription.value = settings.contextDescription;
    }
    if (elements.visualDensity && settings.visualDensity) {
        elements.visualDensity.value = settings.visualDensity;
        if (elements.visualDensityValue) {
            elements.visualDensityValue.textContent = settings.visualDensity;
        }
    }
    if (elements.fontStyle && settings.fontStyle) elements.fontStyle.value = settings.fontStyle;
    if (elements.iconStyle && settings.iconStyle) elements.iconStyle.value = settings.iconStyle;
    if (elements.colorHarmony && settings.colorHarmony) elements.colorHarmony.value = settings.colorHarmony;
    if (elements.calloutLinesEnabled && typeof settings.calloutLinesEnabled === 'boolean') {
        elements.calloutLinesEnabled.checked = settings.calloutLinesEnabled;
        elements.calloutLinesEnabled.dispatchEvent(new Event('change'));
    }
    if (elements.lineThickness && settings.lineThickness) {
        elements.lineThickness.value = settings.lineThickness;
        if (elements.lineThicknessValue) {
            elements.lineThicknessValue.textContent = settings.lineThickness;
        }
    }
    if (elements.lineColorMode && settings.lineColorMode) elements.lineColorMode.value = settings.lineColorMode;
    if (elements.negativePrompt && settings.negativePrompt) elements.negativePrompt.value = settings.negativePrompt;
    if (settings.variations) {
        state.variations = parseInt(settings.variations, 10) || 1;
        document.querySelectorAll('[data-option="variations"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(state.variations));
        });
    }
    if (elements.styleStrength && settings.styleStrength) {
        elements.styleStrength.value = settings.styleStrength;
        if (elements.styleStrengthValue) {
            elements.styleStrengthValue.textContent = settings.styleStrength + '%';
        }
    }

    // Restore brand colors
    if (settings.brandColors && settings.brandColors.length > 0) {
        state.selectedBrandColors = [...settings.brandColors];
        renderSelectedColors();
    }

    // Restore seed (uncheck random seed)
    if (fav.seed && elements.seedInput && elements.randomSeed) {
        elements.seedInput.value = fav.seed;
        elements.randomSeed.checked = false;
        elements.seedInput.disabled = false;
    }

    // Use favorite's generated image as style reference
    // Get image from IndexedDB cache (loaded in openFavoritesModal) or fallback
    const favoriteImageUrl = state.selectedFavoriteImages?.imageUrl || fav.imageUrl || fav.thumbnail;
    if (favoriteImageUrl && elements.stylePreviewImg && elements.stylePreviewContainer && elements.styleUploadArea) {
        state.styleReferenceBase64 = favoriteImageUrl;
        elements.stylePreviewImg.src = favoriteImageUrl;
        elements.stylePreviewContainer.style.display = 'block';
        elements.styleUploadArea.style.display = 'none';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.style.display = 'flex';
        }

        // Open both advanced sections so user can see the loaded style reference
        if (elements.advancedSection) {
            elements.advancedSection.classList.add('open');
        }
        if (elements.styleGenSection) {
            elements.styleGenSection.classList.add('open');
        }
    }

    // Restore characteristics
    if (settings.characteristics && settings.characteristics.length > 0) {
        elements.characteristicsList.innerHTML = '';
        settings.characteristics.forEach(char => {
            addCharacteristic(char.text, char.starred);
        });
    }

    // Restore benefits
    if (settings.benefits && settings.benefits.length > 0) {
        elements.benefitsList.innerHTML = '';
        settings.benefits.forEach(benefit => {
            addBenefit(benefit);
        });
    }

    closeFavoritesModal();
    showSuccess('Style loaded! Upload a product image to generate in this style.');

    // Scroll to upload area
    elements.uploadArea.scrollIntoView({ behavior: 'smooth' });
}

async function deleteFavorite(id) {
    const confirmed = await SharedUI.confirm('Delete this favorite?', {
        title: 'Delete Favorite',
        confirmText: 'Delete',
        icon: 'danger'
    });
    if (confirmed) {
        await favorites.remove(id);
        renderFavorites();
        SharedUI.toast('Favorite deleted', 'success');

        if (state.selectedFavorite && state.selectedFavorite.id === id) {
            closeFavoritesModal();
        }
    }
}

async function clearFavorites() {
    if (favorites.count === 0) return;

    const confirmed = await SharedUI.confirm('Delete all favorites? This cannot be undone.', {
        title: 'Clear All Favorites',
        confirmText: 'Delete All',
        icon: 'danger'
    });
    if (confirmed) {
        await favorites.clear();
        renderFavorites();
        SharedUI.toast('All favorites cleared', 'success');
    }
}

function downloadFavorite() {
    if (!state.selectedFavorite) return;

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const name = state.selectedFavorite.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    link.download = `favorite_${name}_${timestamp}.png`;
    // Use full image from IndexedDB if available
    const imageUrl = state.selectedFavoriteImages?.imageUrl || state.selectedFavorite.imageUrl || state.selectedFavorite.thumbnail;
    link.href = imageUrl;
    link.click();
}

function copyFavoriteSeed() {
    if (!state.selectedFavorite || !state.selectedFavorite.seed) return;

    navigator.clipboard.writeText(state.selectedFavorite.seed.toString()).then(() => {
        showSuccess('Seed copied!');
    });
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const title = elements.productTitle.value.trim();
    const style = elements.infographicStyle.value;

    // Get characteristics with emphasis and icons
    const charItems = elements.characteristicsList.querySelectorAll('.char-item');
    const characteristics = [];
    const primaryFeatures = [];

    charItems.forEach((item, index) => {
        const input = item.querySelector('.input-field');
        const starBtn = item.querySelector('.char-star');
        const iconSelect = item.querySelector('.char-icon-select');

        const text = input ? input.value.trim() : '';
        if (text) {
            const isPrimary = starBtn && starBtn.classList.contains('starred');
            const icon = iconSelect ? iconSelect.value : 'auto';

            if (isPrimary) {
                primaryFeatures.push({ text, icon });
            }
            characteristics.push({ text, icon, isPrimary });
        }
    });

    if (characteristics.length === 0) {
        return null;
    }

    // Get all advanced options
    const aspectRatio = elements.aspectRatio.value;
    const brandColors = elements.brandColors.value.trim();
    const iconStyle = elements.iconStyle.value;
    const negativePrompt = elements.negativePrompt.value.trim();

    // New image quality options
    const layoutTemplate = elements.layoutTemplate ? elements.layoutTemplate.value : 'auto';
    const visualDensity = elements.visualDensity ? parseInt(elements.visualDensity.value) : 3;
    const fontStyle = elements.fontStyle ? elements.fontStyle.value : 'auto';
    const colorHarmony = elements.colorHarmony ? elements.colorHarmony.value : 'match';
    const productFocus = elements.productFocus ? elements.productFocus.value : 'auto';
    const styleStrength = elements.styleStrength ? parseInt(elements.styleStrength.value) : 70;

    // Callout lines options
    const calloutLinesEnabled = elements.calloutLinesEnabled ? elements.calloutLinesEnabled.checked : false;
    const lineThickness = elements.lineThickness ? parseInt(elements.lineThickness.value) : 3;

    // Style descriptions
    const styleDescriptions = {
        auto: 'Analyze the product colors and create a complementary color scheme. Match the background to harmonize with the product.',
        light: 'Use a clean white or very light background with subtle accents that complement the product colors.',
        dark: 'Use a dark/black background that makes the product stand out. Use light text and accents.',
        gradient: 'Use a subtle gradient background derived from the product colors. Keep it simple and professional.'
    };

    // Quality level descriptions
    const qualityDescriptions = {
        standard: 'professional marketing graphic',
        high: 'high-quality professional marketing graphic with sharp text and crisp details',
        ultra: 'premium quality marketing graphic, magazine-advertisement quality with perfect typography and refined design',
        masterpiece: 'award-winning advertising campaign quality, luxury brand aesthetic with flawless execution and sophisticated design'
    };
    const qualityLevel = 'high'; // Default to high quality

    // Layout template descriptions
    const layoutDescriptions = {
        auto: '',
        center: 'Place the product in the CENTER of the image with features arranged around it in a balanced way.',
        left: 'Place the product on the LEFT side, with all features and text on the RIGHT side.',
        right: 'Place the product on the RIGHT side, with all features and text on the LEFT side.',
        top: 'Place the product at the TOP of the image, with features listed BELOW it.',
        grid: 'Create a GRID LAYOUT with the product in a larger cell and features in smaller cells around it.',
        hero: 'Create a HERO LAYOUT with the product prominently displayed at the top and features in a row below.'
    };

    // Visual density descriptions
    const densityDescriptions = {
        1: 'MINIMAL design - very few elements, maximum whitespace, only essential text and product.',
        2: 'CLEAN design - simple layout, generous whitespace, subtle decorations only.',
        3: 'BALANCED design - moderate amount of elements, good whitespace, some decorative elements.',
        4: 'DETAILED design - more visual elements, icons for each feature, decorative backgrounds.',
        5: 'RICH design - many visual elements, badges, icons, patterns, decorative shapes, vibrant and busy.'
    };

    // Font style descriptions
    const fontDescriptions = {
        auto: '',
        modern: 'Use MODERN SANS-SERIF fonts - clean, geometric, contemporary look (like Helvetica, Arial, Inter).',
        classic: 'Use CLASSIC SERIF fonts - elegant, traditional, professional look (like Times, Georgia, Garamond).',
        bold: 'Use BOLD, HEAVY fonts - impactful, strong, attention-grabbing typography.',
        playful: 'Use PLAYFUL, ROUNDED fonts - friendly, approachable, casual look.',
        technical: 'Use TECHNICAL, MONOSPACE fonts - precise, modern, tech-focused look.',
        elegant: 'Use ELEGANT, THIN fonts - sophisticated, luxury, refined look.'
    };

    // Color harmony descriptions
    const harmonyDescriptions = {
        match: 'Match and use the product\'s existing colors in the design.',
        complementary: 'Use COMPLEMENTARY colors (opposite on color wheel) to the product for high contrast.',
        analogous: 'Use ANALOGOUS colors (adjacent on color wheel) for a harmonious, cohesive look.',
        triadic: 'Use TRIADIC colors (evenly spaced on color wheel) for a vibrant, balanced palette.',
        monochrome: 'Use MONOCHROMATIC colors - different shades/tints of the product\'s main color.',
        contrast: 'Use HIGH CONTRAST colors - bold color differences for maximum visual impact.'
    };

    // Product focus descriptions
    const focusDescriptions = {
        auto: '',
        full: 'Show the FULL PRODUCT clearly visible, not cropped, complete view.',
        closeup: 'Show a CLOSE-UP of the product, focusing on details and texture.',
        angle: 'Show the product from a DYNAMIC ANGLE - 3/4 view or perspective shot.',
        context: 'Show the product IN CONTEXT - being used or in its natural environment.',
        floating: 'Show the product FLOATING with a subtle shadow, clean isolated look.',
        multiple: 'Show MULTIPLE VIEWS of the product - front, side, and/or detail shots.'
    };

    // Icon style descriptions
    const iconStyleDescriptions = {
        auto: '',
        realistic: 'Use REALISTIC, PHOTO-LIKE icons - small detailed images that look like real objects or photographs. High detail, realistic textures and lighting.',
        illustrated: 'Use ILLUSTRATED, HAND-DRAWN style icons - artistic, sketch-like with visible brush strokes or pen lines. Warm and friendly aesthetic.',
        '3d': 'Use 3D RENDERED icons with depth, shadows, lighting, and perspective. Polished and modern look.',
        flat: 'Use FLAT, MINIMAL icons with solid colors, no gradients or shadows. Simple shapes, clean and modern.',
        outlined: 'Use OUTLINED/STROKE icons with consistent line weight, no fill. Clean technical look.',
        gradient: 'Use GRADIENT/GLOSSY icons with color transitions and shine effects. Sleek and polished.',
        none: 'Do not use any icons - text only for features.'
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.auto;
    const hasImage = state.multiAngleMode
        ? state.referenceImages.length > 0
        : state.uploadedImageBase64 !== null;
    const hasMultipleAngles = state.multiAngleMode && state.referenceImages.length > 1;
    const hasStyleRef = state.styleReferenceBase64 !== null;
    const qualityDesc = qualityDescriptions[qualityLevel] || qualityDescriptions.high;

    // Build the enhanced prompt
    let prompt;

    if (hasImage) {
        let productRefText;
        if (hasMultipleAngles) {
            const angleLabels = state.referenceImages.map(img => img.label).join(', ');
            productRefText = `PRODUCT REFERENCE: I am providing ${state.referenceImages.length} photos of the same product from different angles (${angleLabels}).
Use ALL provided reference images to understand the product's complete appearance - shape, colors, textures, labels, and details from multiple perspectives.
CRITICAL: The product must appear EXACTLY as shown in the reference photos - synthesize all angles to create an accurate representation. Do NOT modify or reinterpret the product.`;
        } else {
            productRefText = `PRODUCT REFERENCE: I am providing a photo of the actual product.
CRITICAL: The product must appear EXACTLY as shown - same colors, shape, labels, and details. Do NOT modify or reinterpret the product.`;
        }

        prompt = `Create a ${qualityDesc} - a product infographic IMAGE with text overlays, icons, and visual elements.

${productRefText}

BACKGROUND: ${styleDesc}

DESIGN REQUIREMENTS:
- Text should be sharp, readable, and contrast well with the background
- Include icons next to each feature
- Professional marketing aesthetic

PRODUCT TITLE: "${title}"

`;
    } else {
        prompt = `Create a ${qualityDesc} - a product infographic IMAGE with text overlays, icons, and visual elements.

PRODUCT TITLE: "${title}"

BACKGROUND: ${styleDesc}

DESIGN REQUIREMENTS:
- Text should be sharp, readable, and contrast well with the background
- Include icons next to each feature
- Professional marketing aesthetic

`;
    }

    // Add style reference instruction if provided
    if (hasStyleRef) {
        prompt += `STYLE REFERENCE: I am also providing a style reference image. Match its visual aesthetic, color treatment, typography style, and overall design language. The influence should be ${styleStrength}%.\n\n`;
    }

    // Add features with emphasis info
    prompt += `PRODUCT FEATURES:\nDisplay each feature with an icon. Use the EXACT text provided - do not expand, rephrase, or add words.\n\n`;

    if (primaryFeatures.length > 0) {
        prompt += `PRIMARY FEATURES (display larger/more prominent):\n`;
        primaryFeatures.forEach(f => {
            const iconHint = f.icon !== 'auto' && f.icon !== 'none' ? ` [icon: ${f.icon}]` : '';
            prompt += `★ "${f.text}"${iconHint}\n`;
        });
        prompt += `\nSECONDARY FEATURES:\n`;
    }

    characteristics.filter(c => !c.isPrimary).forEach(c => {
        const iconHint = c.icon !== 'auto' && c.icon !== 'none' ? ` [icon: ${c.icon}]` : '';
        prompt += `• "${c.text}"${iconHint}\n`;
    });

    prompt += `\n`;

    // Get benefits
    const benefitItems = elements.benefitsList.querySelectorAll('.benefit-item');
    const benefits = [];
    benefitItems.forEach(item => {
        const input = item.querySelector('.input-field');
        const text = input ? input.value.trim() : '';
        if (text) {
            benefits.push(text);
        }
    });

    // Add benefits to prompt if any
    if (benefits.length > 0) {
        prompt += `PRODUCT BENEFITS (customer value propositions - display these separately from features):\n`;
        benefits.forEach(b => {
            prompt += `✓ "${b}"\n`;
        });
        prompt += `\n`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    // Add layout template
    if (layoutTemplate !== 'auto' && layoutDescriptions[layoutTemplate]) {
        prompt += `\nLAYOUT: ${layoutDescriptions[layoutTemplate]}`;
    }

    // Add visual density
    prompt += `\nVISUAL DENSITY: ${densityDescriptions[visualDensity]}`;

    // Add font style
    if (fontStyle !== 'auto' && fontDescriptions[fontStyle]) {
        prompt += `\nFONT STYLE: ${fontDescriptions[fontStyle]}`;
    }

    // Add color harmony
    if (colorHarmony !== 'match') {
        prompt += `\nCOLOR SCHEME: ${harmonyDescriptions[colorHarmony]}`;
    }

    // Add product focus
    if (productFocus !== 'auto' && focusDescriptions[productFocus]) {
        if (productFocus === 'context' && elements.contextDescription && elements.contextDescription.value.trim()) {
            // Use custom context description when "In Context" is selected and user provided description
            prompt += `\nPRODUCT PRESENTATION: Show the product IN CONTEXT - ${elements.contextDescription.value.trim()}.`;
        } else {
            prompt += `\nPRODUCT PRESENTATION: ${focusDescriptions[productFocus]}`;
        }
    }

    // Add aspect ratio
    if (aspectRatio !== 'auto') {
        prompt += `\n\nASPECT RATIO: Create the image in ${aspectRatio} aspect ratio.`;
    }

    // Add brand colors
    if (brandColors) {
        prompt += `\n\nBRAND COLORS: Incorporate these colors in the design: ${brandColors}`;
    }

    // Add icon style
    if (iconStyle !== 'auto' && iconStyleDescriptions[iconStyle]) {
        prompt += `\n\nICON STYLE: ${iconStyleDescriptions[iconStyle]}`;
    }

    // Add callout lines
    if (calloutLinesEnabled) {
        const lineColorMode = elements.lineColorMode ? elements.lineColorMode.value : 'multi';

        const thicknessDescriptions = {
            1: '1px HAIRLINE/VERY THIN',
            2: '2px THIN',
            3: '3px MEDIUM',
            4: '4-5px THICK/BOLD',
            5: '6-8px VERY THICK/HEAVY'
        };
        const thicknessDesc = thicknessDescriptions[lineThickness] || '3px MEDIUM';

        const colorModeDescriptions = {
            auto: 'Choose the best line color approach based on the product and background - can be monochrome, multicolored, or matched to product',
            mono: 'ALL LINES SAME COLOR - use a single consistent color (white, black, or accent color) for all callout lines',
            multi: 'MULTICOLORED LINES - each feature callout line should be a DIFFERENT COLOR, creating a colorful, vibrant look',
            gradient: 'GRADIENT LINES - each line should have a gradient effect, transitioning between colors',
            match: 'MATCH PRODUCT COLORS - derive line colors from the product itself, using its color palette'
        };
        const colorModeDesc = colorModeDescriptions[lineColorMode] || colorModeDescriptions.auto;

        prompt += `\n\nCALLOUT LINES - IMPORTANT SPECIFICATIONS:

LINE THICKNESS: ${thicknessDesc} - this is CRITICAL, make lines exactly this weight
LINE COLORS: ${colorModeDesc}

STRUCTURE FOR EACH CALLOUT:
- Draw a line from the product part → to a label with ICON + short text
- Each label: [ICON] + "${'{feature text}'}" (use EXACT text provided)
- Add decorative endpoints: dots, circles, or small shapes where lines meet product

STYLE RULES:
- Lines can be straight, angled, or gently curved
- Add small circles or dots at connection points
- Keep text SHORT - exact feature text only, no expansion
- Technical diagram aesthetic, NOT text-heavy marketing`;
    }

    // Add style reference with strength
    if (state.styleReferenceBase64) {
        const strengthText = styleStrength < 40 ? 'subtle inspiration from' :
                            styleStrength < 70 ? 'moderately match' :
                            'strongly match';
        prompt += `\n\nSTYLE REFERENCE: I'm providing a style reference image. ${strengthText.charAt(0).toUpperCase() + strengthText.slice(1)} the visual style, color palette, and design aesthetic of that reference (${styleStrength}% influence).`;
    }

    // Add negative prompt
    if (negativePrompt) {
        prompt += `\n\nAVOID: ${negativePrompt}`;
    }

    return prompt;
}

// ============================================
// API INTEGRATION (uses unified API client)
// ============================================
async function makeGenerationRequest(requestBody, retries = 3) {
    // Set API key on client
    api.apiKey = state.apiKey;

    // Use the unified API client
    const result = await api.request('/chat/completions', requestBody, {
        maxRetries: retries,
        title: 'AI Product Infographics Generator'
    });

    return result.image;
}

async function generateInfographic() {
    console.log('generateInfographic called');
    console.log('API Key exists:', !!state.apiKey);

    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        return;
    }

    const title = elements.productTitle.value.trim();
    if (!title) {
        showError('Please enter a product title');
        return;
    }

    const prompt = generatePrompt();
    if (!prompt) {
        showError('Please enter at least one product characteristic');
        return;
    }

    showLoading();
    updateLoadingStatus('Preparing prompt...');

    state.lastPrompt = prompt;
    const model = elements.aiModel.value;

    try {
        updateLoadingStatus('Connecting to AI...');

        let messageContent;

        const hasProductImages = state.multiAngleMode
            ? state.referenceImages.length > 0
            : state.uploadedImageBase64;

        if (hasProductImages || state.styleReferenceBase64) {
            messageContent = [
                {
                    type: 'text',
                    text: prompt
                }
            ];

            // Add product reference images
            if (state.multiAngleMode && state.referenceImages.length > 0) {
                // Multi-angle mode: add all reference images
                state.referenceImages.forEach(img => {
                    messageContent.push({
                        type: 'image_url',
                        image_url: {
                            url: img.base64
                        }
                    });
                });
            } else if (state.uploadedImageBase64) {
                // Single image mode
                messageContent.push({
                    type: 'image_url',
                    image_url: {
                        url: state.uploadedImageBase64
                    }
                });
            }

            if (state.styleReferenceBase64) {
                messageContent.push({
                    type: 'image_url',
                    image_url: {
                        url: state.styleReferenceBase64
                    }
                });
            }
        } else {
            messageContent = prompt;
        }

        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: messageContent
                }
            ],
            modalities: ['image', 'text'],
            max_tokens: 4096
        };

        const variationsCount = state.variations || 1;

        if (!elements.randomSeed.checked && elements.seedInput.value) {
            const seedValue = parseInt(elements.seedInput.value, 10);
            if (!isNaN(seedValue)) {
                requestBody.seed = seedValue;
                state.lastSeed = seedValue;
            }
        } else {
            state.lastSeed = Math.floor(Math.random() * 999999999);
            requestBody.seed = state.lastSeed;
        }

        // Start product copy generation in parallel (don't await)
        const copyPromise = generateProductCopy();

        if (variationsCount === 1) {
            if (state.uploadedImageBase64) {
                updateLoadingStatus('Generating infographic with your product image...');
            } else {
                updateLoadingStatus('Generating infographic...');
            }

            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
            showSuccess('Infographic generated successfully!');

            // Show rating buttons
            showRating(state.lastSeed, model, elements.infographicStyle?.value);

            // Record cost
            SharedCostEstimator.recordCost(model, 1, 'infographics', prompt.length);
            updateCostEstimator();

            // Wait for copy to finish (it's already running in parallel)
            await copyPromise.catch(err => console.error('Copy generation error:', err));
        } else {
            updateLoadingStatus(`Generating ${variationsCount} variations...`);

            const requests = [];
            for (let i = 0; i < variationsCount; i++) {
                const varRequestBody = { ...requestBody };
                varRequestBody.seed = state.lastSeed + i;
                requests.push(makeGenerationRequest(varRequestBody).catch(err => {
                    console.error(`Variation ${i + 1} failed:`, err);
                    return null;
                }));
            }

            const results = await Promise.all(requests);
            const successfulImages = results.filter(url => url !== null);

            if (successfulImages.length === 0) {
                throw new Error('All variations failed to generate. Try a different model.');
            }

            if (successfulImages.length === 1) {
                showResult(successfulImages[0]);
            } else {
                showMultipleResults(successfulImages);
            }

            showSuccess(`Generated ${successfulImages.length} of ${variationsCount} variations!`);

            // Show rating buttons
            showRating(state.lastSeed, model, elements.infographicStyle?.value);

            // Record cost for successful generations only
            SharedCostEstimator.recordCost(model, successfulImages.length, 'infographics', prompt.length);
            updateCostEstimator();

            // Wait for copy to finish (it's already running in parallel)
            await copyPromise.catch(err => console.error('Copy generation error:', err));
        }

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();
        resetToPlaceholder();

        // Use APIError's user-friendly message if available
        const errorMessage = error instanceof APIError
            ? error.toUserMessage()
            : error.message || 'An unexpected error occurred';

        showError(errorMessage);
    }
}

// ============================================
// ADJUST INFOGRAPHIC (FEEDBACK-BASED)
// ============================================
async function adjustInfographic() {
    if (!state.generatedImageUrl) {
        showError('No infographic to adjust. Generate one first.');
        return;
    }

    const feedback = elements.feedbackTextarea.value.trim();
    if (!feedback) {
        showError('Please enter feedback describing what to change');
        return;
    }

    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        return;
    }

    showLoading();
    updateLoadingStatus('Preparing adjustment...');

    const model = elements.aiModel.value;
    const language = state.language === 'ro' ? 'Romanian' : 'English';

    const adjustPrompt = `I'm providing an infographic image that needs adjustments.

ORIGINAL CONTEXT:
${state.lastPrompt || 'Marketing infographic for a product.'}

USER FEEDBACK - MAKE THESE CHANGES:
${feedback}

INSTRUCTIONS:
- Keep the overall structure and product focus
- Apply the requested changes while maintaining professional quality
- Preserve the product title and key features unless specifically asked to change them
- Language: ${language}${state.language === 'ro' ? ' (use proper Romanian characters: ă, â, î, ș, ț)' : ''}

Generate an adjusted version of this infographic based on the feedback above.`;

    try {
        updateLoadingStatus('Sending adjustment request...');

        api.apiKey = state.apiKey;

        updateLoadingStatus('Adjusting infographic...');

        const result = await api.generateImage({
            model,
            prompt: adjustPrompt,
            images: [state.generatedImageUrl]
        });

        updateLoadingStatus('Processing adjusted image...');

        if (!result.image) {
            throw new Error('No adjusted image was generated. Try a different model or rephrase your feedback.');
        }

        showResult(result.image);
        showSuccess('Infographic adjusted successfully!');

    } catch (error) {
        console.error('Adjustment error:', error);
        hideLoading();

        elements.loadingContainer.classList.remove('visible');
        elements.resultContainer.classList.add('visible');

        const errorMessage = error instanceof APIError
            ? error.toUserMessage()
            : error.message || 'An unexpected error occurred';

        showError(errorMessage);
    }
}

// ============================================
// SEO ALT TEXT GENERATION
// ============================================
async function generateAltText(imageUrl) {
    try {
        elements.altTextSection.style.display = 'block';
        elements.altTextContent.innerHTML = '<span class="alt-text-loading">Generating alt text...</span>';

        const productTitle = elements.productTitle.value.trim() || 'Product';
        const charInputs = elements.characteristicsList.querySelectorAll('.input-field');
        const features = Array.from(charInputs)
            .map(input => input.value.trim())
            .filter(val => val.length > 0)
            .slice(0, 3)
            .join(', ');

        const prompt = `Generate a concise SEO-friendly alt text (1-2 sentences, max 125 characters) for a product infographic. Product: ${productTitle}. Key features: ${features}. The alt text should be descriptive and include the product name. Return ONLY the alt text, nothing else.`;

        api.apiKey = state.apiKey;
        const result = await api.generateText({
            prompt,
            maxTokens: 100
        });

        const altText = result.text?.trim() || '';
        if (altText) {
            state.generatedAltText = altText;
            elements.altTextContent.innerHTML = `"${altText}"`;
        } else {
            elements.altTextContent.innerHTML = '<span class="alt-text-loading">Could not generate alt text</span>';
        }
    } catch (error) {
        console.error('Alt text generation error:', error);
        elements.altTextContent.innerHTML = '<span class="alt-text-loading">Alt text unavailable</span>';
    }
}

// ============================================
// PRODUCT COPY GENERATION
// ============================================
async function generateProductCopy() {
    try {
        // Show section and loading states
        elements.productCopySection.style.display = 'block';
        elements.shortDescContent.innerHTML = '<span class="copy-loading">Generating...</span>';
        elements.longDescContent.innerHTML = '<span class="copy-loading">Generating...</span>';
        elements.taglinesContent.innerHTML = '<span class="copy-loading">Generating...</span>';
        elements.socialContent.innerHTML = '<span class="copy-loading">Generating...</span>';
        elements.seoTitleContent.textContent = 'Generating...';
        elements.seoDescContent.textContent = 'Generating...';

        const productTitle = elements.productTitle.value.trim() || 'Product';
        const language = state.language === 'ro' ? 'Romanian' : 'English';

        // Get features
        const charInputs = elements.characteristicsList.querySelectorAll('.char-item');
        const features = [];
        const primaryFeatures = [];

        charInputs.forEach(item => {
            const input = item.querySelector('.input-field');
            const starBtn = item.querySelector('.char-star');
            const text = input ? input.value.trim() : '';
            if (text) {
                const isPrimary = starBtn && starBtn.classList.contains('starred');
                if (isPrimary) {
                    primaryFeatures.push(text);
                }
                features.push(text);
            }
        });

        const featuresText = features.join(', ');
        const primaryText = primaryFeatures.length > 0 ? `Primary features: ${primaryFeatures.join(', ')}` : '';

        const prompt = `Generate marketing content for this product in JSON format.

Product: ${productTitle}
Features: ${featuresText}
${primaryText}
Language: ${language}${state.language === 'ro' ? ' (use proper Romanian characters: ă, â, î, ș, ț)' : ''}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "shortDesc": "Compelling 1-2 sentence product pitch highlighting key value proposition",
  "longDesc": "Engaging paragraph (50-100 words) describing the product, its benefits, and why customers should buy it",
  "taglines": ["catchy tagline 1", "catchy tagline 2", "catchy tagline 3"],
  "social": {
    "instagram": "Engaging caption with emojis and 5-8 relevant hashtags",
    "facebook": "Conversational post with call-to-action, 2-3 sentences",
    "twitter": "Punchy tweet under 280 characters with 2-3 hashtags"
  },
  "seo": {
    "title": "SEO-optimized title under 60 characters including product name",
    "description": "Meta description under 160 characters with keywords and call-to-action"
  }
}`;

        api.apiKey = state.apiKey;
        const result = await api.generateText({
            prompt,
            maxTokens: 1000
        });

        let content = result.text?.trim() || '';

        // Clean up response - remove markdown code blocks if present
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        try {
            const copyData = JSON.parse(content);
            state.generatedCopy = {
                shortDesc: copyData.shortDesc || null,
                longDesc: copyData.longDesc || null,
                taglines: copyData.taglines || [],
                social: {
                    instagram: copyData.social?.instagram || null,
                    facebook: copyData.social?.facebook || null,
                    twitter: copyData.social?.twitter || null
                },
                seo: {
                    title: copyData.seo?.title || null,
                    description: copyData.seo?.description || null
                }
            };

            updateProductCopyUI();
        } catch (parseError) {
            console.error('Failed to parse copy response:', parseError);
            showCopyError('Failed to parse generated content');
        }
    } catch (error) {
        console.error('Product copy generation error:', error);
        showCopyError('Error generating marketing copy');
    }
}

function updateProductCopyUI() {
    const copy = state.generatedCopy;

    // Short description
    if (copy.shortDesc) {
        elements.shortDescContent.textContent = copy.shortDesc;
    } else {
        elements.shortDescContent.innerHTML = '<span class="copy-loading">Not available</span>';
    }

    // Long description
    if (copy.longDesc) {
        elements.longDescContent.textContent = copy.longDesc;
    } else {
        elements.longDescContent.innerHTML = '<span class="copy-loading">Not available</span>';
    }

    // Taglines
    if (copy.taglines && copy.taglines.length > 0) {
        elements.taglinesContent.innerHTML = copy.taglines.map((tagline, index) => `
            <div class="tagline-item">
                <span class="tagline-number">${index + 1}</span>
                <span class="tagline-text">${tagline}</span>
            </div>
        `).join('');
    } else {
        elements.taglinesContent.innerHTML = '<span class="copy-loading">Not available</span>';
    }

    // Social media - show active platform
    updateSocialContent();

    // SEO
    if (copy.seo.title) {
        elements.seoTitleContent.innerHTML = `${copy.seo.title} <span class="seo-char-count">(${copy.seo.title.length}/60)</span>`;
    } else {
        elements.seoTitleContent.textContent = '-';
    }

    if (copy.seo.description) {
        elements.seoDescContent.innerHTML = `${copy.seo.description} <span class="seo-char-count">(${copy.seo.description.length}/160)</span>`;
    } else {
        elements.seoDescContent.textContent = '-';
    }
}

function updateSocialContent() {
    const platform = state.activeSocialPlatform;
    const content = state.generatedCopy.social[platform];

    if (content) {
        elements.socialContent.textContent = content;
    } else {
        elements.socialContent.innerHTML = '<span class="copy-loading">Not available</span>';
    }
}

function showCopyError(message) {
    elements.shortDescContent.innerHTML = `<span class="copy-loading">${message}</span>`;
    elements.longDescContent.innerHTML = '<span class="copy-loading">-</span>';
    elements.taglinesContent.innerHTML = '<span class="copy-loading">-</span>';
    elements.socialContent.innerHTML = '<span class="copy-loading">-</span>';
    elements.seoTitleContent.textContent = '-';
    elements.seoDescContent.textContent = '-';
}

function copyProductCopyToClipboard(target) {
    const copy = state.generatedCopy;
    let textToCopy = '';

    switch (target) {
        case 'shortDesc':
            textToCopy = copy.shortDesc || '';
            break;
        case 'longDesc':
            textToCopy = copy.longDesc || '';
            break;
        case 'taglines':
            textToCopy = (copy.taglines || []).join('\n');
            break;
        case 'social':
            textToCopy = copy.social[state.activeSocialPlatform] || '';
            break;
        case 'seo':
            textToCopy = `Title: ${copy.seo.title || ''}\nDescription: ${copy.seo.description || ''}`;
            break;
    }

    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const btn = document.querySelector(`[data-target="${target}"]`);
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }
        });
    }
}

// ============================================
// COMPLEMENTARY IMAGES
// ============================================
function populateFeatureSelect() {
    if (!elements.featureSelect) return;

    elements.featureSelect.innerHTML = '<option value="">Select a feature...</option>';

    const charInputs = elements.characteristicsList.querySelectorAll('.char-item');
    charInputs.forEach((item, index) => {
        const input = item.querySelector('.input-field');
        const text = input ? input.value.trim() : '';
        if (text) {
            const option = document.createElement('option');
            option.value = text;
            option.textContent = text;
            elements.featureSelect.appendChild(option);
        }
    });
}

function showComplementarySection() {
    if (elements.complementarySection) {
        elements.complementarySection.style.display = 'block';
        populateFeatureSelect();
    }
}

function buildComplementaryPrompt() {
    const productTitle = elements.productTitle.value.trim() || 'Product';
    const type = state.complementaryType;
    const style = state.complementaryStyle;

    // Get the main infographic style for matching
    const mainStyle = document.querySelector('input[name="style"]:checked')?.value || 'auto';

    let typePrompt = '';
    let focusDetail = '';

    switch (type) {
        case 'closeup':
            focusDetail = elements.closeupFocus?.value || 'detail';
            const closeupFocusMap = {
                'detail': 'focusing on intricate details, textures, and craftsmanship',
                'texture': 'highlighting material textures, surface quality, and finish',
                'material': 'showcasing the materials, build quality, and construction',
                'logo': 'featuring the brand logo, markings, or emblems prominently'
            };
            typePrompt = `Create a professional close-up product photograph of ${productTitle}, ${closeupFocusMap[focusDetail] || closeupFocusMap.detail}.
Use dramatic macro-style photography with shallow depth of field. The image should feel premium and highlight the quality of the product.`;
            break;

        case 'angle':
            // Get selected angles from checkboxes
            const selectedAngles = [];
            if (elements.angleCheckboxes) {
                elements.angleCheckboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        selectedAngles.push(checkbox.value);
                    }
                });
            }
            if (selectedAngles.length === 0) {
                selectedAngles.push('front');
            }
            const angleViewMap = {
                'front': 'straight-on front view showing the product face',
                'side': 'side profile view showing the silhouette',
                'threequarter': '3/4 angle view showing depth and dimension',
                'back': 'back/rear view showing ports, labels, or back features',
                'top': 'top-down bird\'s eye view',
                'bottom': 'underneath view showing the base'
            };
            const angleDescriptions = selectedAngles.map(angle => angleViewMap[angle] || angle).join(', ');
            typePrompt = `Create a professional product photograph of ${productTitle} from ${angleDescriptions}.
Use clean studio lighting with soft shadows. The image should be on a clean, simple background that complements the product.`;
            break;

        case 'feature':
            focusDetail = elements.featureSelect?.value || '';
            if (focusDetail) {
                typePrompt = `Create a product infographic highlighting the specific feature: "${focusDetail}" of ${productTitle}.
Show this feature prominently with visual callouts, icons, or diagrams that explain its benefit. Use clear typography and visual hierarchy to emphasize this feature.`;
            } else {
                typePrompt = `Create a product infographic showing key features of ${productTitle} with visual callouts and icons.
Highlight the most important features with clear labels and visual explanations.`;
            }
            break;
    }

    // Style instructions
    let stylePrompt = '';
    if (style === 'match') {
        stylePrompt = `IMPORTANT: Match the visual style of the main product infographic. Use similar colors, typography, and design elements for consistency.`;

        // Add details from the main style if available
        if (mainStyle === 'light') {
            stylePrompt += ' Use a light, clean background with professional lighting.';
        } else if (mainStyle === 'dark') {
            stylePrompt += ' Use a dark, moody background with dramatic lighting.';
        } else if (mainStyle === 'gradient') {
            stylePrompt += ' Use gradient backgrounds and vibrant colors.';
        } else if (mainStyle === 'rich') {
            stylePrompt += ' Use rich callouts, colorful accents, and detailed visual elements.';
        }
    } else if (style === 'variation') {
        stylePrompt = `Create a creative variation with a different perspective or artistic interpretation. Maintain product accuracy but experiment with lighting, angles, or artistic effects.`;
    } else if (style === 'clean') {
        stylePrompt = `Create a clean, isolated product shot on a pure white or neutral background. Professional e-commerce style with minimal distractions. Focus on crisp, clear product presentation.`;
    } else {
        stylePrompt = `Create a clean, professional image that could work as a standalone product shot. Use neutral styling that would fit various marketing contexts.`;
    }

    // Language
    const language = state.language === 'ro' ? 'Romanian' : 'English';
    const langInstruction = state.language === 'ro'
        ? 'Any text should be in Romanian with proper characters (ă, â, î, ș, ț).'
        : 'Any text should be in English.';

    return `${typePrompt}

${stylePrompt}

${langInstruction}

Create a high-quality, marketing-ready image suitable for e-commerce and promotional use.`;
}

async function generateComplementaryImages() {
    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        return;
    }

    if (!state.generatedImageUrl) {
        showError('Please generate a main infographic first');
        return;
    }

    const quantity = state.complementaryQuantity;
    const generateBtn = elements.generateCompBtn;

    // Show loading state
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<div class="btn-loader">
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
            <div class="loader-ring"></div>
        </div> Generating...`;
    }

    // Show results container with loading placeholders
    if (elements.compResultsContainer) {
        elements.compResultsContainer.style.display = 'block';
    }

    if (elements.compResultsGrid) {
        elements.compResultsGrid.innerHTML = Array(quantity).fill(`
            <div class="comp-result-item loading">
                <div class="comp-result-placeholder">
                    <div class="loader loader-sm">
                        <div class="loader-ring"></div>
                        <div class="loader-ring"></div>
                        <div class="loader-ring"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const prompt = buildComplementaryPrompt();
    const model = elements.aiModel.value;

    try {
        const requests = [];
        const baseSeed = Math.floor(Math.random() * 999999999);

        for (let i = 0; i < quantity; i++) {
            let messageContent;

            if (state.uploadedImageBase64) {
                messageContent = [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
                ];
            } else {
                messageContent = prompt;
            }

            const requestBody = {
                model: model,
                messages: [{ role: 'user', content: messageContent }],
                modalities: ['image', 'text'],
                max_tokens: 4096,
                seed: baseSeed + i
            };

            requests.push(
                makeGenerationRequest(requestBody).catch(err => {
                    console.error(`Complementary image ${i + 1} failed:`, err);
                    return null;
                })
            );
        }

        const results = await Promise.all(requests);
        state.complementaryImages = results.filter(url => url !== null);

        // Update the grid with results
        if (elements.compResultsGrid) {
            if (state.complementaryImages.length === 0) {
                elements.compResultsGrid.innerHTML = `
                    <div class="comp-error">
                        Failed to generate images. Please try again.
                    </div>
                `;
            } else {
                elements.compResultsGrid.innerHTML = state.complementaryImages.map((url, index) => `
                    <div class="comp-result-item">
                        <img src="${url}" alt="Complementary image ${index + 1}" class="comp-result-img" onclick="openLightbox('${url}')">
                        <div class="comp-result-actions">
                            <button type="button" class="comp-download-btn" onclick="downloadImageFromUrl('${url}', 'complementary-${index + 1}.png')">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (state.complementaryImages.length > 0) {
            showSuccess(`Generated ${state.complementaryImages.length} complementary image${state.complementaryImages.length > 1 ? 's' : ''}!`);
        }

    } catch (error) {
        console.error('Complementary generation error:', error);
        showError('Failed to generate complementary images');

        if (elements.compResultsGrid) {
            elements.compResultsGrid.innerHTML = `
                <div class="comp-error">
                    Error: ${error.message}
                </div>
            `;
        }
    } finally {
        // Reset button
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg> Generate`;
        }
    }
}

// ============================================
// TEMPLATES & PRESETS SYSTEM
// ============================================
function loadTemplatesFromStorage() {
    try {
        const saved = localStorage.getItem('ngraphics_templates');
        if (saved) {
            state.savedTemplates = JSON.parse(saved);
            updateTemplateSelect();
        }
    } catch (error) {
        console.error('Failed to load templates:', error);
    }
}

function saveTemplatesToStorage() {
    try {
        localStorage.setItem('ngraphics_templates', JSON.stringify(state.savedTemplates));
    } catch (error) {
        console.error('Failed to save templates:', error);
    }
}

function getCurrentSettings() {
    return {
        model: elements.aiModel.value,
        style: document.querySelector('input[name="style"]:checked')?.value || 'auto',
        layout: elements.layoutTemplate?.value || 'auto',
        aspectRatio: elements.aspectRatio?.value || 'auto',
        productFocus: elements.productFocus?.value || 'auto',
        visualDensity: elements.visualDensity?.value || 3,
        fontStyle: elements.fontStyle?.value || 'auto',
        iconStyle: elements.iconStyle?.value || 'auto',
        colorHarmony: elements.colorHarmony?.value || 'match',
        brandColors: [...state.selectedBrandColors],
        calloutLines: elements.calloutLinesEnabled?.checked || false,
        calloutThickness: elements.lineThickness?.value || 3
    };
}

function applySettings(settings) {
    if (!settings) return;

    // Model
    if (settings.model && elements.aiModel) {
        elements.aiModel.value = settings.model;
    }

    // Style
    if (settings.style) {
        const styleRadio = document.querySelector(`input[name="style"][value="${settings.style}"]`);
        if (styleRadio) styleRadio.checked = true;
    }

    // Layout
    if (settings.layout && elements.layoutTemplate) {
        elements.layoutTemplate.value = settings.layout;
    }

    // Aspect ratio
    if (settings.aspectRatio && elements.aspectRatio) {
        elements.aspectRatio.value = settings.aspectRatio;
    }

    // Product focus
    if (settings.productFocus && elements.productFocus) {
        elements.productFocus.value = settings.productFocus;
    }

    // Visual density
    if (settings.visualDensity && elements.visualDensity) {
        elements.visualDensity.value = settings.visualDensity;
        if (elements.densityValue) {
            const labels = ['Minimal', 'Clean', 'Balanced', 'Detailed', 'Rich'];
            elements.densityValue.textContent = labels[settings.visualDensity - 1] || 'Balanced';
        }
    }

    // Font style
    if (settings.fontStyle && elements.fontStyle) {
        elements.fontStyle.value = settings.fontStyle;
    }

    // Icon style
    if (settings.iconStyle && elements.iconStyle) {
        elements.iconStyle.value = settings.iconStyle;
    }

    // Color harmony
    if (settings.colorHarmony && elements.colorHarmony) {
        elements.colorHarmony.value = settings.colorHarmony;
    }

    // Brand colors
    if (settings.brandColors && Array.isArray(settings.brandColors)) {
        state.selectedBrandColors = [...settings.brandColors];
        renderSelectedColors();
    }

    showSuccess('Settings applied!');
}

function applyPlatformPreset(presetKey) {
    const preset = platformPresets[presetKey];
    if (!preset) return;

    // Clear active state from all buttons
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

    // Set active on clicked button
    const activeBtn = document.querySelector(`.preset-btn[data-preset="${presetKey}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    state.activePreset = presetKey;

    // Apply preset settings
    applySettings({
        style: preset.style,
        layout: preset.layout,
        aspectRatio: preset.aspectRatio,
        visualDensity: preset.visualDensity
    });

    showSuccess(`${preset.name} preset applied!`);
}

function saveTemplate() {
    const name = prompt('Enter template name:');
    if (!name || !name.trim()) return;

    const template = {
        id: Date.now(),
        name: name.trim(),
        settings: getCurrentSettings(),
        createdAt: new Date().toISOString()
    };

    state.savedTemplates.push(template);
    saveTemplatesToStorage();
    updateTemplateSelect();
    showSuccess(`Template "${name}" saved!`);
}

function loadTemplate(templateId) {
    const template = state.savedTemplates.find(t => t.id === parseInt(templateId));
    if (template) {
        applySettings(template.settings);
        showSuccess(`Template "${template.name}" loaded!`);
    }
}

function deleteTemplate() {
    const selectedId = elements.templateSelect.value;
    if (!selectedId) {
        showError('Select a template to delete');
        return;
    }

    const template = state.savedTemplates.find(t => t.id === parseInt(selectedId));
    if (template && confirm(`Delete template "${template.name}"?`)) {
        state.savedTemplates = state.savedTemplates.filter(t => t.id !== parseInt(selectedId));
        saveTemplatesToStorage();
        updateTemplateSelect();
        showSuccess('Template deleted!');
    }
}

function updateTemplateSelect() {
    if (!elements.templateSelect) return;

    elements.templateSelect.innerHTML = '<option value="">Load template...</option>';
    state.savedTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        elements.templateSelect.appendChild(option);
    });
}

// ============================================
// PRESET SELECTOR (SharedPresets Integration)
// ============================================
function initPresetSelector() {
    const container = document.getElementById('presetSelectorContainer');
    if (!container) return;

    SharedPresets.renderSelector(
        'infographics',
        // onSelect callback
        (preset) => {
            if (preset && preset.settings) {
                applySettings(preset.settings);
            }
        },
        // onSave callback
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

    // Render initial display
    const modelId = elements.aiModel?.value || 'google/gemini-3-pro-image-preview';
    const variations = state.variations || 1;
    SharedCostEstimator.renderDisplay(modelId, variations, 500, container);

    // Update when model changes
    if (elements.aiModel) {
        elements.aiModel.addEventListener('change', () => {
            updateCostEstimator();
        });
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
// AI FEATURE EXTRACTION
// ============================================
async function analyzeProductImage() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    if (!state.apiKey) {
        showError('Please enter your API key');
        return;
    }

    const btn = elements.analyzeImageBtn;
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg><span>Analyzing...</span>';

    try {
        const language = state.language === 'ro' ? 'Romanian' : 'English';

        api.apiKey = state.apiKey;
        const result = await api.analyzeImage({
            image: state.uploadedImageBase64,
            prompt: `Analyze this product image and extract information in JSON format.
Language: ${language}${state.language === 'ro' ? ' (use proper Romanian characters: ă, â, î, ș, ț)' : ''}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "productTitle": "Concise product name (2-5 words)",
  "category": "Product category",
  "features": [
    "Technical feature 1 (specs, materials, tech - 3-6 words)",
    "Technical feature 2 (specs, materials, tech - 3-6 words)",
    "Technical feature 3 (specs, materials, tech - 3-6 words)",
    "Technical feature 4 (specs, materials, tech - 3-6 words)",
    "Technical feature 5 (specs, materials, tech - 3-6 words)"
  ],
  "benefits": [
    "User benefit 1 (why buy, value proposition - 3-6 words)",
    "User benefit 2 (why buy, value proposition - 3-6 words)",
    "User benefit 3 (why buy, value proposition - 3-6 words)"
  ],
  "primaryFeature": 0,
  "suggestedStyle": "auto|rich|callout|light|dark|gradient",
  "dominantColors": ["#hex1", "#hex2"]
}

Features = technical specs (e.g., "Bluetooth 5.3", "40mm drivers")
Benefits = customer value (e.g., "Crystal-clear sound", "All-day comfort")`
        });

        let content = result.text?.trim() || '';

        // Clean up response
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        try {
            const analysis = JSON.parse(content);

            // Fill in product title
            if (analysis.productTitle && elements.productTitle) {
                elements.productTitle.value = analysis.productTitle;
            }

            // Fill in features
            if (analysis.features && Array.isArray(analysis.features)) {
                // Clear existing characteristics
                elements.characteristicsList.innerHTML = '';

                analysis.features.forEach((feature, index) => {
                    addCharacteristic(feature, index === analysis.primaryFeature);
                });
            }

            // Fill in benefits
            if (analysis.benefits && Array.isArray(analysis.benefits)) {
                // Clear existing benefits
                elements.benefitsList.innerHTML = '';

                analysis.benefits.forEach(benefit => {
                    addBenefit(benefit);
                });
            }

            // Apply suggested style
            if (analysis.suggestedStyle) {
                const styleRadio = document.querySelector(`input[name="style"][value="${analysis.suggestedStyle}"]`);
                if (styleRadio) styleRadio.checked = true;
            }

            showSuccess('Product analyzed! Title, features, and benefits extracted.');
        } catch (parseError) {
            console.error('Failed to parse analysis:', parseError, content);
            showError('Failed to parse AI response');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        const errorMessage = error instanceof APIError
            ? error.toUserMessage()
            : 'Error analyzing image';
        showError(errorMessage);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

function addCharacteristic(text = '', isPrimary = false) {
    const charItem = document.createElement('div');
    charItem.className = 'char-item';
    charItem.draggable = true;

    const charIndex = elements.characteristicsList.querySelectorAll('.char-item').length;

    charItem.innerHTML = `
        <div class="char-drag" title="Drag to reorder">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
            </svg>
        </div>
        <button type="button" class="char-star${isPrimary ? ' starred' : ''}" title="Mark as primary feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
        </button>
        <input type="text" class="input-field" placeholder="Product feature..." value="${text}">
        <button type="button" class="char-remove" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    // Star button
    const starBtn = charItem.querySelector('.char-star');
    starBtn.addEventListener('click', () => {
        starBtn.classList.toggle('starred');
        if (starBtn.classList.contains('starred')) {
            state.starredCharacteristics.add(charIndex);
        } else {
            state.starredCharacteristics.delete(charIndex);
        }
    });

    // Remove button
    const removeBtn = charItem.querySelector('.char-remove');
    removeBtn.addEventListener('click', () => {
        charItem.remove();
    });

    elements.characteristicsList.appendChild(charItem);

    // Attach drag handlers
    attachDragHandlers(charItem);

    if (isPrimary) {
        state.starredCharacteristics.add(charIndex);
    }
}

function addBenefit(text = '') {
    const benefitItem = document.createElement('div');
    benefitItem.className = 'benefit-item';

    benefitItem.innerHTML = `
        <input type="text" class="input-field" placeholder="Customer benefit..." value="${text}">
        <button type="button" class="benefit-remove" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    // Remove button
    const removeBtn = benefitItem.querySelector('.benefit-remove');
    removeBtn.addEventListener('click', () => {
        const items = elements.benefitsList.querySelectorAll('.benefit-item');
        if (items.length > 1) {
            benefitItem.remove();
        }
    });

    elements.benefitsList.appendChild(benefitItem);
}

// ============================================
// SMART REGENERATION
// ============================================
function getVariationStrengthLabel(value) {
    const labels = ['Very Similar', 'Similar', 'Medium', 'Different', 'Very Different'];
    return labels[value - 1] || 'Medium';
}

function buildSmartRegenerationPrompt() {
    if (!state.lastPrompt) {
        return generatePrompt();
    }

    const locks = state.lockSettings;
    const strength = state.variationStrength;

    let lockInstructions = [];
    if (locks.layout) lockInstructions.push('KEEP THE SAME LAYOUT and composition');
    if (locks.colors) lockInstructions.push('KEEP THE SAME COLOR SCHEME');
    if (locks.background) lockInstructions.push('KEEP THE SAME BACKGROUND style and type');
    if (locks.textStyle) lockInstructions.push('KEEP THE SAME TEXT STYLE and typography');

    let variationInstruction = '';
    switch (strength) {
        case 1:
            variationInstruction = 'Make MINIMAL changes - only tiny variations in details';
            break;
        case 2:
            variationInstruction = 'Make SUBTLE changes - keep overall look similar but refresh small elements';
            break;
        case 3:
            variationInstruction = 'Make MODERATE changes - balance familiarity with fresh elements';
            break;
        case 4:
            variationInstruction = 'Make SIGNIFICANT changes - explore different approaches while keeping core elements';
            break;
        case 5:
            variationInstruction = 'Make MAJOR changes - create a distinctly different variation';
            break;
    }

    const basePrompt = state.lastPrompt;

    const smartPrompt = `${basePrompt}

REGENERATION INSTRUCTIONS:
${lockInstructions.length > 0 ? lockInstructions.join('\n') : 'No locked elements - feel free to change anything'}

${variationInstruction}

Create a variation of the previous design following these constraints.`;

    return smartPrompt;
}

async function smartRegenerate() {
    if (!state.generatedImageUrl && !state.lastPrompt) {
        showError('Generate an infographic first before using smart regeneration');
        return;
    }

    // Build the smart prompt
    const smartPrompt = buildSmartRegenerationPrompt();

    // Use similar seed if locks are active
    const hasLocks = Object.values(state.lockSettings).some(v => v);
    let seedToUse = null;

    if (hasLocks && state.lastSeed) {
        // Vary the seed slightly based on variation strength
        const seedVariation = Math.floor((state.variationStrength - 1) * 10000);
        seedToUse = state.lastSeed + Math.floor(Math.random() * seedVariation);
    }

    // Show loading
    showLoading();
    updateLoadingStatus('Smart regenerating with constraints...');

    try {
        const model = elements.aiModel.value;

        const requestBody = {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: state.uploadedImageBase64
                        ? [
                            {
                                type: 'image_url',
                                image_url: { url: `data:image/jpeg;base64,${state.uploadedImageBase64}` }
                            },
                            { type: 'text', text: smartPrompt }
                        ]
                        : smartPrompt
                }
            ],
            modalities: ['image', 'text'],
            max_tokens: 4096
        };

        if (seedToUse) {
            requestBody.seed = seedToUse;
        }

        const imageUrl = await makeGenerationRequest(requestBody);
        showResult(imageUrl);
        showSuccess('Smart regeneration complete!');

        // Generate new copy in parallel
        generateProductCopy().catch(err => console.error('Copy generation error:', err));

    } catch (error) {
        console.error('Smart regeneration error:', error);
        hideLoading();
        showError('Smart regeneration failed: ' + error.message);
    }
}

// ============================================
// WATERMARK SYSTEM
// ============================================
async function applyWatermarkToImage() {
    if (!state.generatedImageUrl) {
        showError('No image to watermark');
        return;
    }

    const activeTab = document.querySelector('.watermark-tab.active')?.dataset.tab || 'text';
    const watermarkText = elements.watermarkText.value.trim();
    const opacity = parseInt(elements.watermarkOpacity.value, 10) / 100;
    const position = state.watermarkPosition;

    if (activeTab === 'text' && !watermarkText) {
        showError('Please enter watermark text');
        return;
    }
    if (activeTab === 'logo' && !state.watermarkLogoBase64) {
        showError('Please upload a logo');
        return;
    }

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = state.generatedImageUrl;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const padding = 20;
        const positions = {
            'tl': { x: padding, y: padding, align: 'left', baseline: 'top' },
            'tc': { x: canvas.width / 2, y: padding, align: 'center', baseline: 'top' },
            'tr': { x: canvas.width - padding, y: padding, align: 'right', baseline: 'top' },
            'ml': { x: padding, y: canvas.height / 2, align: 'left', baseline: 'middle' },
            'mc': { x: canvas.width / 2, y: canvas.height / 2, align: 'center', baseline: 'middle' },
            'mr': { x: canvas.width - padding, y: canvas.height / 2, align: 'right', baseline: 'middle' },
            'bl': { x: padding, y: canvas.height - padding, align: 'left', baseline: 'bottom' },
            'bc': { x: canvas.width / 2, y: canvas.height - padding, align: 'center', baseline: 'bottom' },
            'br': { x: canvas.width - padding, y: canvas.height - padding, align: 'right', baseline: 'bottom' }
        };
        const pos = positions[position] || positions['bc'];

        ctx.globalAlpha = opacity;

        if (activeTab === 'text') {
            const fontSize = Math.max(24, Math.min(canvas.width / 20, 60));
            ctx.font = `bold ${fontSize}px Arial, sans-serif`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 2;
            ctx.textAlign = pos.align;
            ctx.textBaseline = pos.baseline;

            ctx.strokeText(watermarkText, pos.x, pos.y);
            ctx.fillText(watermarkText, pos.x, pos.y);
        } else {
            const logo = new Image();
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = reject;
                logo.src = state.watermarkLogoBase64;
            });

            const sizePercent = parseInt(elements.watermarkSize.value, 10) / 100;
            const logoWidth = canvas.width * sizePercent;
            const logoHeight = (logo.height / logo.width) * logoWidth;

            let x = pos.x;
            let y = pos.y;

            if (pos.align === 'center') x -= logoWidth / 2;
            else if (pos.align === 'right') x -= logoWidth;

            if (pos.baseline === 'middle') y -= logoHeight / 2;
            else if (pos.baseline === 'bottom') y -= logoHeight;

            ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        }

        ctx.globalAlpha = 1;

        const watermarkedUrl = canvas.toDataURL('image/png');

        state.generatedImageUrl = watermarkedUrl;
        if (state.generatedImages.length <= 1) {
            elements.resultImage.src = watermarkedUrl;
        } else {
            const selected = elements.resultGrid.querySelector('.result-grid-item.selected img');
            if (selected) selected.src = watermarkedUrl;
        }

        showSuccess('Watermark applied!');

    } catch (error) {
        console.error('Watermark error:', error);
        showError('Failed to apply watermark');
    }
}

// ============================================
// DOWNLOAD FUNCTIONALITY
// ============================================
async function downloadImage() {
    if (!state.generatedImageUrl) {
        showError('No image to download');
        return;
    }

    try {
        const response = await fetch(state.generatedImageUrl);
        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const title = elements.productTitle.value.trim().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
        a.download = `infographic_${title}_${timestamp}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showSuccess('Image downloaded successfully!');
    } catch (error) {
        window.open(state.generatedImageUrl, '_blank');
        showSuccess('Image opened in new tab. Right-click to save.');
    }
}

// ============================================
// LIGHTBOX (uses SharedLightbox)
// ============================================
function openLightbox(imageUrl) {
    SharedLightbox.open(elements.lightbox, elements.lightboxImage, imageUrl);
}

function closeLightbox() {
    SharedLightbox.close(elements.lightbox);
}

async function downloadImageFromUrl(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `infographic-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Download error:', error);
    }
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Language toggle
    elements.langOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            elements.langOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            updateLanguage(opt.dataset.lang);
        });
    });

    // Theme toggle is handled by SharedTheme.setupToggle() in init()

    // Style radio buttons - sync with hidden select
    elements.styleRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            elements.infographicStyle.value = radio.value;
        });
    });

    // Variations buttons
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variations"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.value, 10) || 1;
        });
    });

    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted, calling generateInfographic...');
        generateInfographic();
    });

    // Generate button mouse tracking for gradient effect
    elements.generateBtn.addEventListener('mousemove', (e) => {
        const rect = elements.generateBtn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        elements.generateBtn.style.setProperty('--mouse-x', `${x}%`);
        elements.generateBtn.style.setProperty('--mouse-y', `${y}%`);
    });

    elements.generateBtn.addEventListener('mouseleave', () => {
        elements.generateBtn.style.setProperty('--mouse-x', '50%');
        elements.generateBtn.style.setProperty('--mouse-y', '50%');
    });

    // Download button
    elements.downloadBtn.addEventListener('click', downloadImage);

    // Copy seed button
    elements.copySeedBtn.addEventListener('click', () => {
        if (state.lastSeed !== null) {
            navigator.clipboard.writeText(state.lastSeed.toString()).then(() => {
                elements.copySeedBtn.textContent = 'Copied!';
                setTimeout(() => {
                    elements.copySeedBtn.textContent = 'Copy';
                }, 2000);
            });
        }
    });

    // Regenerate button
    elements.regenerateBtn.addEventListener('click', generateInfographic);

    // Copy prompt button
    if (elements.copyPromptBtn) {
        elements.copyPromptBtn.addEventListener('click', () => {
            if (state.lastPrompt) {
                navigator.clipboard.writeText(state.lastPrompt).then(() => {
                    elements.copyPromptBtn.classList.add('copied');
                    const originalHTML = elements.copyPromptBtn.innerHTML;
                    elements.copyPromptBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Copied!
                    `;
                    setTimeout(() => {
                        elements.copyPromptBtn.classList.remove('copied');
                        elements.copyPromptBtn.innerHTML = originalHTML;
                    }, 2000);
                });
            }
        });
    }

    // Download all button - now downloads as ZIP
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.addEventListener('click', async () => {
            if (state.generatedImages && state.generatedImages.length > 1) {
                const title = elements.productTitle.value.trim() || 'infographic';
                const metadata = {
                    title: title,
                    generated: new Date().toISOString(),
                    seed: state.lastSeed,
                    model: elements.model.value,
                    style: elements.style.value,
                    aspectRatio: elements.aspectRatio.value,
                    variations: state.generatedImages.length
                };
                await SharedZip.downloadAsZip(state.generatedImages, title.replace(/\s+/g, '_'), metadata);
            }
        });
    }

    // Compare button - opens comparison slider modal
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

    // Aspect ratio preview
    if (elements.aspectRatio && elements.aspectPreviewInner) {
        const updateAspectPreview = () => {
            const ratio = elements.aspectRatio.value;
            const box = elements.aspectPreviewInner;
            const sizes = {
                'auto': { w: 28, h: 28 },
                '1:1': { w: 28, h: 28 },
                '2:3': { w: 20, h: 30 },
                '4:5': { w: 24, h: 30 },
                '16:9': { w: 32, h: 18 },
                '9:16': { w: 18, h: 32 }
            };
            const size = sizes[ratio] || sizes['auto'];
            box.style.width = size.w + 'px';
            box.style.height = size.h + 'px';
        };
        elements.aspectRatio.addEventListener('change', updateAspectPreview);
        updateAspectPreview(); // Initial
    }

    // Adjust button
    elements.adjustBtn.addEventListener('click', adjustInfographic);

    // Alt text copy
    elements.copyAltText.addEventListener('click', () => {
        if (state.generatedAltText) {
            navigator.clipboard.writeText(state.generatedAltText).then(() => {
                elements.copyAltText.textContent = 'Copied!';
                setTimeout(() => {
                    elements.copyAltText.textContent = 'Copy';
                }, 2000);
            });
        }
    });

    // Watermark toggle
    elements.watermarkToggle.addEventListener('click', () => {
        elements.watermarkSection.classList.toggle('open');
    });

    // Watermark tabs
    elements.watermarkTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.watermarkTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = tab.dataset.tab;
            elements.watermarkTextTab.classList.toggle('active', tabName === 'text');
            elements.watermarkLogoTab.classList.toggle('active', tabName === 'logo');
            elements.watermarkSizeGroup.style.display = tabName === 'logo' ? 'block' : 'none';
        });
    });

    // Watermark position buttons
    elements.watermarkPositionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.watermarkPositionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.watermarkPosition = btn.dataset.pos;
        });
    });

    // Watermark sliders
    elements.watermarkOpacity.addEventListener('input', () => {
        elements.opacityValue.textContent = elements.watermarkOpacity.value + '%';
    });

    elements.watermarkSize.addEventListener('input', () => {
        elements.sizeValue.textContent = elements.watermarkSize.value + '%';
    });

    // Logo upload
    elements.uploadLogoBtn.addEventListener('click', () => {
        elements.watermarkLogo.click();
    });

    elements.watermarkLogo.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                state.watermarkLogoBase64 = event.target.result;
                elements.watermarkLogoPreview.src = event.target.result;
                elements.watermarkLogoPreview.style.display = 'block';
                elements.uploadLogoBtn.textContent = 'Change Logo';
            };
            reader.readAsDataURL(file);
        }
    });

    // Apply watermark
    elements.applyWatermark.addEventListener('click', applyWatermarkToImage);

    // Lightbox
    elements.resultImage.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            openLightbox(state.generatedImageUrl);
        }
    });

    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightbox.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) {
            closeLightbox();
        }
    });

    elements.lightboxDownload.addEventListener('click', () => {
        if (elements.lightboxImage.src) {
            downloadImageFromUrl(elements.lightboxImage.src);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

        // Escape - close modals
        if (e.key === 'Escape') {
            if (SharedKeyboard._modalVisible) {
                SharedKeyboard.hideShortcutsModal();
            } else if (elements.lightbox.classList.contains('visible')) {
                closeLightbox();
            } else if (elements.historyModal.classList.contains('visible')) {
                closeHistoryModal();
            } else if (elements.favoritesModal.classList.contains('visible')) {
                closeFavoritesModal();
            }
        }

        // ? - show keyboard shortcuts (only when not typing)
        if (e.key === '?' && !isTyping) {
            e.preventDefault();
            SharedKeyboard.showShortcutsModal([
                { key: 'Ctrl+Enter', action: 'generate', description: 'Generate infographic' },
                { key: 'Ctrl+D', action: 'download', description: 'Download current image' },
                { key: 'Escape', action: 'close', description: 'Close modals' },
                { key: '?', action: 'help', description: 'Show this help' }
            ]);
        }

        // Ctrl/Cmd + Enter - generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateInfographic();
        }

        // Ctrl/Cmd + D - download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.generatedImageUrl) {
            e.preventDefault();
            downloadImage();
        }
    });

    // History event listeners
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.closeModal.addEventListener('click', closeHistoryModal);
    elements.modalDownload.addEventListener('click', downloadFromModal);
    elements.modalUseAsBase.addEventListener('click', loadHistoryToEditor);

    elements.historyModal.addEventListener('click', (e) => {
        if (e.target === elements.historyModal) {
            closeHistoryModal();
        }
    });

    // Image info toggle
    if (elements.imageInfoBtn && elements.imageInfoOverlay) {
        elements.imageInfoBtn.addEventListener('click', () => {
            const overlay = elements.imageInfoOverlay;
            const isVisible = overlay.style.display !== 'none';

            if (isVisible) {
                overlay.style.display = 'none';
                elements.imageInfoBtn.classList.remove('active');
            } else {
                // Update overlay content
                const info = {
                    seed: state.lastSeed,
                    model: elements.model.value,
                    dimensions: elements.aspectRatio.value || 'Auto',
                    style: elements.style.value,
                    variations: state.generatedImages?.length || 1
                };
                overlay.innerHTML = SharedImageInfo.createOverlay(info).innerHTML;
                overlay.style.display = 'block';
                elements.imageInfoBtn.classList.add('active');
            }
        });
    }

    // Favorites event listeners
    elements.favoriteBtn.addEventListener('click', saveFavorite);
    elements.clearFavoritesBtn.addEventListener('click', clearFavorites);
    elements.closeFavoritesModal.addEventListener('click', closeFavoritesModal);
    elements.loadFavoriteBtn.addEventListener('click', loadFavorite);
    elements.downloadFavoriteBtn.addEventListener('click', downloadFavorite);
    elements.deleteFavoriteBtn.addEventListener('click', () => {
        if (state.selectedFavorite) {
            deleteFavorite(state.selectedFavorite.id);
        }
    });
    elements.copyFavoriteSeed.addEventListener('click', copyFavoriteSeed);

    elements.favoritesModal.addEventListener('click', (e) => {
        if (e.target === elements.favoritesModal) {
            closeFavoritesModal();
        }
    });

    // Organization event handlers - History
    if (elements.historySearch) {
        elements.historySearch.addEventListener('input', (e) => {
            state.historySearchQuery = e.target.value;
            renderHistory();
        });
    }

    if (elements.bulkModeBtn) {
        elements.bulkModeBtn.addEventListener('click', toggleHistoryBulkMode);
    }

    if (elements.historySelectAll) {
        elements.historySelectAll.addEventListener('change', toggleSelectAllHistory);
    }

    if (elements.bulkDeleteBtn) {
        elements.bulkDeleteBtn.addEventListener('click', bulkDeleteHistory);
    }

    if (elements.bulkDownloadBtn) {
        elements.bulkDownloadBtn.addEventListener('click', bulkDownloadHistory);
    }

    // Organization event handlers - Favorites
    if (elements.favoritesSearch) {
        elements.favoritesSearch.addEventListener('input', (e) => {
            state.favoritesSearchQuery = e.target.value;
            renderFavorites();
        });
    }

    if (elements.addFavoriteTagBtn) {
        elements.addFavoriteTagBtn.addEventListener('click', addTagToFavorite);
    }

    if (elements.favoriteTagInput) {
        elements.favoriteTagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTagToFavorite();
            }
        });
    }

    if (elements.favoriteFolderSelect) {
        elements.favoriteFolderSelect.addEventListener('change', (e) => {
            setFavoriteFolder(e.target.value);
        });
    }

    if (elements.favoriteFolderNew) {
        elements.favoriteFolderNew.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const newFolder = e.target.value.trim();
                if (newFolder) {
                    setFavoriteFolder(newFolder);
                    e.target.value = '';
                    renderFolderSelect();
                }
            }
        });
    }

    // Product Copy Section
    if (elements.copyToggle) {
        elements.copyToggle.addEventListener('click', () => {
            elements.productCopySection.classList.toggle('open');
        });
    }

    // Social media tabs
    if (elements.socialTabs) {
        elements.socialTabs.querySelectorAll('.copy-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                elements.socialTabs.querySelectorAll('.copy-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.activeSocialPlatform = tab.dataset.platform;
                updateSocialContent();
            });
        });
    }

    // Copy buttons for product copy
    document.querySelectorAll('.btn-copy-sm[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            copyProductCopyToClipboard(btn.dataset.target);
        });
    });

    // Platform Presets
    if (elements.platformPresets) {
        elements.platformPresets.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                applyPlatformPreset(btn.dataset.preset);
            });
        });
    }

    // Template controls
    if (elements.saveTemplateBtn) {
        elements.saveTemplateBtn.addEventListener('click', saveTemplate);
    }

    if (elements.deleteTemplateBtn) {
        elements.deleteTemplateBtn.addEventListener('click', deleteTemplate);
    }

    if (elements.templateSelect) {
        elements.templateSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                loadTemplate(e.target.value);
            }
        });
    }

    // AI Analyze button
    if (elements.analyzeImageBtn) {
        elements.analyzeImageBtn.addEventListener('click', analyzeProductImage);
    }

    // Settings Section toggle
    if (elements.settingsToggle) {
        elements.settingsToggle.addEventListener('click', () => {
            elements.settingsSection.classList.toggle('open');
        });
    }

    // Smart Regeneration
    if (elements.smartRegenToggle) {
        elements.smartRegenToggle.addEventListener('click', () => {
            elements.smartRegenSection.classList.toggle('open');
        });
    }

    // Lock checkboxes
    if (elements.lockLayout) {
        elements.lockLayout.addEventListener('change', (e) => {
            state.lockSettings.layout = e.target.checked;
        });
    }
    if (elements.lockColors) {
        elements.lockColors.addEventListener('change', (e) => {
            state.lockSettings.colors = e.target.checked;
        });
    }
    if (elements.lockBackground) {
        elements.lockBackground.addEventListener('change', (e) => {
            state.lockSettings.background = e.target.checked;
        });
    }
    if (elements.lockTextStyle) {
        elements.lockTextStyle.addEventListener('change', (e) => {
            state.lockSettings.textStyle = e.target.checked;
        });
    }

    // Variation strength slider
    if (elements.variationStrength) {
        elements.variationStrength.addEventListener('input', (e) => {
            state.variationStrength = parseInt(e.target.value);
            if (elements.variationStrengthValue) {
                elements.variationStrengthValue.textContent = getVariationStrengthLabel(state.variationStrength);
            }
        });
    }

    // Smart regen button
    if (elements.smartRegenBtn) {
        elements.smartRegenBtn.addEventListener('click', smartRegenerate);
    }

    // Complementary Images Section
    if (elements.complementaryToggle) {
        elements.complementaryToggle.addEventListener('click', () => {
            elements.complementarySection.classList.toggle('open');
        });
    }

    // Complementary type buttons
    if (elements.compTypeBtns) {
        elements.compTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.compTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.complementaryType = btn.dataset.type;

                // Show/hide appropriate options panel
                if (elements.closeupOptions) {
                    elements.closeupOptions.style.display = state.complementaryType === 'closeup' ? 'block' : 'none';
                }
                if (elements.angleOptions) {
                    elements.angleOptions.style.display = state.complementaryType === 'angle' ? 'block' : 'none';
                }
                if (elements.featureOptions) {
                    elements.featureOptions.style.display = state.complementaryType === 'feature' ? 'block' : 'none';
                    // Populate feature select when switching to feature type
                    if (state.complementaryType === 'feature') {
                        populateFeatureSelect();
                    }
                }
            });
        });
    }

    // Complementary style buttons
    if (elements.compStyleBtns) {
        elements.compStyleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.compStyleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.complementaryStyle = btn.dataset.style;
            });
        });
    }

    // Complementary quantity buttons
    if (elements.compQtyBtns) {
        elements.compQtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.compQtyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.complementaryQuantity = parseInt(btn.dataset.qty) || 1;
            });
        });
    }

    // Generate complementary images button
    if (elements.generateCompBtn) {
        elements.generateCompBtn.addEventListener('click', generateComplementaryImages);
    }

    // Batch mode toggle
    if (elements.batchModeToggle) {
        elements.batchModeToggle.addEventListener('click', toggleBatchMode);
    }

    // Batch upload handlers
    if (elements.batchUploadArea) {
        elements.batchUploadArea.addEventListener('click', () => {
            elements.batchProductPhotos.click();
        });

        elements.batchUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.batchUploadArea.classList.add('drag-over');
        });

        elements.batchUploadArea.addEventListener('dragleave', () => {
            elements.batchUploadArea.classList.remove('drag-over');
        });

        elements.batchUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.batchUploadArea.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            addFilesToBatch(files);
        });
    }

    if (elements.batchProductPhotos) {
        elements.batchProductPhotos.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            addFilesToBatch(files);
            e.target.value = ''; // Reset for re-upload
        });
    }

    // Batch controls
    if (elements.clearBatchBtn) {
        elements.clearBatchBtn.addEventListener('click', clearBatch);
    }

    if (elements.startBatchBtn) {
        elements.startBatchBtn.addEventListener('click', startBatchProcessing);
    }
}

// ============================================
// BATCH PROCESSING
// ============================================

function toggleBatchMode() {
    state.batchMode = !state.batchMode;

    if (elements.batchModeToggle) {
        elements.batchModeToggle.classList.toggle('active', state.batchMode);
    }

    if (elements.singleUploadContainer) {
        elements.singleUploadContainer.style.display = state.batchMode ? 'none' : 'block';
    }

    if (elements.batchUploadContainer) {
        elements.batchUploadContainer.style.display = state.batchMode ? 'block' : 'none';
    }

    // Update generate button text
    if (elements.generateBtn) {
        const btnText = elements.generateBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = state.batchMode ? 'Generate (Single Mode)' : 'Generate Infographic';
        }
        elements.generateBtn.disabled = state.batchMode;
    }
}

async function addFilesToBatch(files) {
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
            showError(`${file.name} is too large (max 10MB)`);
            continue;
        }

        const id = Date.now() + Math.random();
        const reader = new FileReader();

        reader.onload = (e) => {
            state.batchQueue.push({
                id,
                file,
                name: file.name,
                imageBase64: e.target.result,
                status: 'pending',
                result: null,
                error: null
            });
            renderBatchQueue();
            updateBatchControls();
        };

        reader.readAsDataURL(file);
    }
}

function removeBatchItem(id) {
    state.batchQueue = state.batchQueue.filter(item => item.id !== id);
    renderBatchQueue();
    updateBatchControls();
}

function clearBatch() {
    if (state.batchProcessing) {
        state.batchProcessing = false; // Stop processing
    }
    state.batchQueue = [];
    state.batchProgress = { current: 0, total: 0 };
    renderBatchQueue();
    updateBatchControls();
}

function renderBatchQueue() {
    if (!elements.batchQueue) return;

    if (state.batchQueue.length === 0) {
        elements.batchQueue.innerHTML = '';
        return;
    }

    elements.batchQueue.innerHTML = state.batchQueue.map(item => `
        <div class="batch-item ${item.status}" data-id="${item.id}">
            <img src="${item.imageBase64}" alt="${item.name}">
            <div class="batch-item-overlay">
                ${item.status === 'processing' ? '<div class="batch-item-spinner"></div>' : ''}
                ${item.status !== 'pending' ? `<span class="batch-item-status">${item.status}</span>` : ''}
                ${item.status === 'completed' && item.result ? `
                    <button class="btn-view-result" onclick="viewBatchResult('${item.id}')">View</button>
                ` : ''}
            </div>
            ${item.status === 'pending' ? `
                <button class="batch-item-remove" onclick="removeBatchItem(${item.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            ` : ''}
        </div>
    `).join('');
}

function updateBatchControls() {
    if (!elements.batchControls) return;

    const hasItems = state.batchQueue.length > 0;
    elements.batchControls.style.display = hasItems ? 'flex' : 'none';

    const completed = state.batchQueue.filter(i => i.status === 'completed').length;
    const total = state.batchQueue.length;

    if (elements.batchStatus) {
        elements.batchStatus.textContent = state.batchProcessing
            ? `Processing ${state.batchProgress.current} / ${state.batchProgress.total}...`
            : `${completed} / ${total} completed`;
    }

    if (elements.batchProgressFill) {
        const progress = total > 0 ? (completed / total) * 100 : 0;
        elements.batchProgressFill.style.width = `${progress}%`;
    }

    if (elements.startBatchBtn) {
        const pending = state.batchQueue.filter(i => i.status === 'pending').length;
        elements.startBatchBtn.disabled = pending === 0 || state.batchProcessing;
        elements.startBatchBtn.textContent = state.batchProcessing ? 'Processing...' : `Process All (${pending})`;
    }
}

async function startBatchProcessing() {
    if (state.batchProcessing) return;
    if (!state.apiKey) {
        showError('Please enter your API key first');
        return;
    }

    const pending = state.batchQueue.filter(i => i.status === 'pending');
    if (pending.length === 0) return;

    state.batchProcessing = true;
    state.batchProgress = { current: 0, total: pending.length };
    updateBatchControls();

    for (const item of pending) {
        if (!state.batchProcessing) break; // Allow cancellation

        state.batchProgress.current++;
        item.status = 'processing';
        renderBatchQueue();
        updateBatchControls();

        try {
            const result = await generateForBatchItem(item);
            item.status = 'completed';
            item.result = result;

            // Add to history
            const title = item.name.replace(/\.[^/.]+$/, '') || 'Batch Item';
            addToHistory(result, title);
        } catch (error) {
            item.status = 'failed';
            item.error = error.message;
            console.error('Batch item failed:', error);
        }

        renderBatchQueue();
        updateBatchControls();

        // Small delay between requests to avoid rate limiting
        if (state.batchProcessing && pending.indexOf(item) < pending.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    state.batchProcessing = false;
    updateBatchControls();

    const completed = state.batchQueue.filter(i => i.status === 'completed').length;
    const failed = state.batchQueue.filter(i => i.status === 'failed').length;

    if (failed === 0) {
        SharedUI.toast(`Batch complete! ${completed} images generated.`, 'success');
    } else {
        SharedUI.toast(`Batch complete: ${completed} succeeded, ${failed} failed.`, 'warning');
    }
}

async function generateForBatchItem(item) {
    // Build the prompt using current settings
    const prompt = generatePrompt();

    // Determine seed
    const seed = elements.randomSeed?.checked
        ? Math.floor(Math.random() * 999999999)
        : parseInt(elements.seedInput?.value || '0') || Math.floor(Math.random() * 999999999);

    // Build request body
    const messages = [{
        role: 'user',
        content: [
            { type: 'text', text: prompt },
            {
                type: 'image_url',
                image_url: { url: item.imageBase64 }
            }
        ]
    }];

    // Add style reference if available
    if (state.styleReferenceBase64) {
        messages[0].content.push({
            type: 'image_url',
            image_url: { url: state.styleReferenceBase64 }
        });
    }

    const model = elements.model.value;
    const aspectRatio = elements.aspectRatio.value !== 'auto'
        ? elements.aspectRatio.value
        : undefined;

    const requestBody = {
        model,
        messages,
        seed,
        modalities: ['image', 'text'],
        image_generation: {
            ...(aspectRatio && { aspect_ratio: aspectRatio })
        }
    };

    // Add negative prompt if present
    if (elements.negativePrompt?.value?.trim()) {
        requestBody.image_generation.negative_prompt = elements.negativePrompt.value.trim();
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${state.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.href,
            'X-Title': 'HEFAISTOS - AI Product Infographics'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = SharedRequest.extractImageFromResponse(data);

    if (!imageUrl) {
        throw new Error('No image in response');
    }

    return imageUrl;
}

function viewBatchResult(id) {
    const item = state.batchQueue.find(i => String(i.id) === String(id));
    if (item?.result) {
        SharedLightbox.open(elements.lightbox, elements.lightboxImage, item.result);
    }
}

// Make batch functions globally accessible for inline onclick handlers
window.removeBatchItem = removeBatchItem;
window.viewBatchResult = viewBatchResult;

// ============================================
// QUICK START TEMPLATES
// ============================================
function initTemplateSelector() {
    const container = elements.templateSelectorContainer;
    if (!container) return;

    SharedTemplates.render(container, 'infographics', applyTemplate, getCurrentSettings);
}

function applyTemplate(template) {
    const settings = template.settings;

    // Apply each setting
    if (settings.infographicStyle && elements.infographicStyle) {
        elements.infographicStyle.value = settings.infographicStyle;
    }
    if (settings.layoutTemplate && elements.layoutTemplate) {
        elements.layoutTemplate.value = settings.layoutTemplate;
        elements.layoutTemplate.dispatchEvent(new Event('change'));
    }
    if (settings.visualDensity && elements.visualDensity) {
        elements.visualDensity.value = settings.visualDensity;
        elements.visualDensity.dispatchEvent(new Event('input'));
    }
    if (settings.fontStyle && elements.fontStyle) {
        elements.fontStyle.value = settings.fontStyle;
    }
    if (settings.iconStyle && elements.iconStyle) {
        elements.iconStyle.value = settings.iconStyle;
        elements.iconStyle.dispatchEvent(new Event('change'));
    }
    if (settings.colorHarmony && elements.colorHarmony) {
        elements.colorHarmony.value = settings.colorHarmony;
    }
    if (settings.productFocus && elements.productFocus) {
        elements.productFocus.value = settings.productFocus;
    }
}

function getCurrentSettings() {
    return {
        infographicStyle: elements.infographicStyle?.value,
        layoutTemplate: elements.layoutTemplate?.value,
        visualDensity: elements.visualDensity?.value,
        fontStyle: elements.fontStyle?.value,
        iconStyle: elements.iconStyle?.value,
        colorHarmony: elements.colorHarmony?.value,
        productFocus: elements.productFocus?.value
    };
}

// ============================================
// OPTION EXAMPLES
// ============================================
function initOptionExamples() {
    // Attach examples to select dropdowns
    SharedExamples.attachToSelect(elements.layoutTemplate, 'layoutTemplate');
    SharedExamples.attachToSelect(elements.infographicStyle, 'infographicStyle');
    SharedExamples.attachToSelect(elements.iconStyle, 'iconStyle');
    SharedExamples.attachToSelect(elements.colorHarmony, 'colorHarmony');
    SharedExamples.attachToSelect(elements.productFocus, 'productFocus');
}

// ============================================
// GENERATION RATING
// ============================================
function showRating(generationId, model, style) {
    if (!elements.ratingContainer) return;

    SharedRating.render(elements.ratingContainer, generationId, {
        model: model,
        style: style,
        page: 'infographics'
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
    // Just setup the theme toggle
    initElements();
    loadTheme();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));

    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    loadApiKey();
    setupApiKeyHandlers();
    setupImageUploadHandlers();
    setupAdvancedOptionsHandlers();
    setupColorPickerHandlers();
    setupCharacteristicsHandlers();
    setupBenefitsHandlers();
    setupEventListeners();
    updateLanguage('ro');

    // Initialize stores
    await imageStore.init();
    favorites.setImageStore(imageStore);

    loadHistory();
    favorites.load();
    renderFavorites();
    loadTemplatesFromStorage();

    // Initialize preset selector
    initPresetSelector();

    // Initialize cost estimator
    initCostEstimator();

    // Initialize quick start templates
    initTemplateSelector();

    // Initialize option examples
    initOptionExamples();

    // Update API status on load
    if (state.apiKey) {
        updateApiStatus(true);
    }
    console.log('HEFAISTOS: Ready!');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Also init immediately if DOM already loaded
if (document.readyState !== 'loading') {
    init();
}
