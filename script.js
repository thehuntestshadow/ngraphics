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
    generatedImageUrl: null,
    lastPrompt: null,
    history: [],
    selectedHistoryItem: null,
    // Advanced options
    styleReferenceBase64: null,
    lastSeed: null,
    generatedImages: [],
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
    variationStrength: 3
};

// ============================================
// PLATFORM PRESETS
// ============================================
const platformPresets = {
    amazon: {
        name: 'Amazon',
        aspectRatio: '1:1',
        style: 'light',
        backgroundType: 'solid',
        layout: 'product-center',
        visualDensity: 3,
        description: 'Clean white background, product-focused'
    },
    shopify: {
        name: 'Shopify',
        aspectRatio: '1:1',
        style: 'auto',
        backgroundType: 'gradient',
        layout: 'auto',
        visualDensity: 4,
        description: 'Versatile e-commerce style'
    },
    instagram: {
        name: 'Instagram',
        aspectRatio: '1:1',
        style: 'rich',
        backgroundType: 'gradient',
        layout: 'product-center',
        visualDensity: 5,
        description: 'Eye-catching, high visual density'
    },
    'instagram-story': {
        name: 'Instagram Story',
        aspectRatio: '9:16',
        style: 'rich',
        backgroundType: 'gradient',
        layout: 'product-top',
        visualDensity: 4,
        description: 'Vertical format for Stories'
    },
    facebook: {
        name: 'Facebook',
        aspectRatio: '16:9',
        style: 'auto',
        backgroundType: 'subtle',
        layout: 'product-left',
        visualDensity: 3,
        description: 'Horizontal format for feeds'
    },
    etsy: {
        name: 'Etsy',
        aspectRatio: '4:5',
        style: 'light',
        backgroundType: 'texture',
        layout: 'product-center',
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
        productTitle: document.getElementById('productTitle'),
        characteristicsList: document.getElementById('characteristicsList'),
        addCharBtn: document.getElementById('addCharBtn'),
        infographicStyle: document.getElementById('infographicStyle'),
        styleRadios: document.querySelectorAll('input[name="style"]'),
        generateBtn: document.getElementById('generateBtn'),

        // Advanced Options
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
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
        backgroundComplexity: document.getElementById('backgroundComplexity'),

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
        smartRegenBtn: document.getElementById('smartRegenBtn')
    };
}

// ============================================
// LANGUAGE HANDLING
// ============================================
const translations = {
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

    const t = translations[lang];
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
// THEME HANDLING
// ============================================
function loadTheme() {
    const savedTheme = localStorage.getItem('ngraphics_theme');
    if (savedTheme) {
        state.theme = savedTheme;
    }
    applyTheme(state.theme);
}

function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('ngraphics_theme', theme);
}

function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

// ============================================
// API KEY HANDLING
// ============================================
function loadApiKey() {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
        state.apiKey = savedKey;
        elements.apiKeyInput.value = savedKey;
    }
}

function updateApiStatus(connected) {
    if (elements.apiStatus) {
        if (connected) {
            elements.apiStatus.classList.add('connected');
            elements.apiStatus.querySelector('.status-text').textContent = 'Connected';
        } else {
            elements.apiStatus.classList.remove('connected');
            elements.apiStatus.querySelector('.status-text').textContent = 'Not Connected';
        }
    }
}

function setupApiKeyHandlers() {
    elements.toggleApiKeyBtn.addEventListener('click', () => {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    });

    elements.saveApiKeyBtn.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            state.apiKey = key;
            localStorage.setItem('openrouter_api_key', key);
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
    document.querySelectorAll('.char-item .input-field').forEach(attachIconSuggestionHandler);
}

function addCharacteristicItem() {
    const t = translations[state.language];
    const div = document.createElement('div');
    div.className = 'char-item';
    div.innerHTML = `
        <button type="button" class="char-star" title="Mark as primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        </button>
        <input type="text" class="input-field" placeholder="${t.charPlaceholders[0]}">
        <select class="select-mini char-icon-select">
            <option value="auto">Auto</option>
            <option value="battery">Battery</option>
            <option value="bolt">Lightning</option>
            <option value="wifi">WiFi</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="headphones">Audio</option>
            <option value="camera">Camera</option>
            <option value="shield">Shield</option>
            <option value="water">Water</option>
            <option value="star">Star</option>
            <option value="check">Check</option>
            <option value="none">None</option>
        </select>
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
    attachIconSuggestionHandler(div.querySelector('.input-field'));
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

function attachIconSuggestionHandler(input) {
    input.addEventListener('input', () => {
        const text = input.value.toLowerCase();
        const selectElement = input.parentElement.querySelector('.char-icon-select');
        if (!selectElement) return;

        // Find best matching icon
        let bestMatch = 'auto';
        for (const [icon, keywords] of Object.entries(iconSuggestions)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    bestMatch = icon;
                    break;
                }
            }
            if (bestMatch !== 'auto') break;
        }

        // Update select if we found a match
        if (bestMatch !== 'auto') {
            const option = selectElement.querySelector(`option[value="${bestMatch}"]`);
            if (option) {
                selectElement.value = bestMatch;
            }
        }
    });
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

    if (state.lastSeed !== null) {
        elements.seedValue.textContent = state.lastSeed;
        elements.seedDisplay.style.display = 'flex';
    }

    elements.feedbackTextarea.value = '';

    const title = elements.productTitle.value.trim() || 'Untitled';
    addToHistory(imageUrl, title);

    generateAltText(imageUrl);
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
}

function resetToPlaceholder() {
    hideLoading();
    elements.resultContainer.classList.remove('visible');
    elements.resultPlaceholder.style.display = 'flex';
    elements.seedDisplay.style.display = 'none';
}

// ============================================
// HISTORY MANAGEMENT
// ============================================
const HISTORY_KEY = 'infographic_history';
const MAX_HISTORY_ITEMS = 20;

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            state.history = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
        state.history = [];
    }
    renderHistory();
}

function saveHistory() {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (e) {
        console.error('Failed to save history:', e);
        if (e.name === 'QuotaExceededError') {
            state.history = state.history.slice(0, Math.floor(state.history.length / 2));
            saveHistory();
        }
    }
}

function addToHistory(imageUrl, title) {
    const item = {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        title: title || 'Untitled',
        date: new Date().toISOString()
    };

    state.history.unshift(item);

    if (state.history.length > MAX_HISTORY_ITEMS) {
        state.history = state.history.slice(0, MAX_HISTORY_ITEMS);
    }

    saveHistory();
    renderHistory();
}

function deleteFromHistory(id) {
    state.history = state.history.filter(item => item.id !== id);
    saveHistory();
    renderHistory();
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
    }
}

function renderHistory() {
    const grid = elements.historyGrid;
    const empty = elements.historyEmpty;
    const count = elements.historyCount;

    count.textContent = state.history.length > 0 ? `(${state.history.length})` : '';

    if (state.history.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';

    grid.innerHTML = state.history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return `
            <div class="history-item" data-id="${item.id}">
                <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
                <div class="history-item-overlay">
                    <div class="history-item-date">${dateStr}</div>
                </div>
                <button class="history-item-delete" data-id="${item.id}" title="Delete">&times;</button>
            </div>
        `;
    }).join('');

    grid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('history-item-delete')) {
                openHistoryModal(item.dataset.id);
            }
        });
    });

    grid.querySelectorAll('.history-item-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFromHistory(btn.dataset.id);
        });
    });
}

function openHistoryModal(id) {
    const item = state.history.find(h => h.id === id);
    if (!item) return;

    state.selectedHistoryItem = item;
    elements.modalTitle.textContent = item.title;
    elements.modalImage.src = item.imageUrl;
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
    const title = state.selectedHistoryItem.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
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
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const title = elements.productTitle.value.trim();
    const style = elements.infographicStyle.value;
    const language = state.language === 'ro' ? 'Romanian' : 'English';

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
    const backgroundComplexity = elements.backgroundComplexity ? elements.backgroundComplexity.value : 'auto';
    const styleStrength = elements.styleStrength ? parseInt(elements.styleStrength.value) : 70;

    // Callout lines options
    const calloutLinesEnabled = elements.calloutLinesEnabled ? elements.calloutLinesEnabled.checked : false;
    const lineThickness = elements.lineThickness ? parseInt(elements.lineThickness.value) : 3;

    // Style descriptions
    const styleDescriptions = {
        auto: 'Analyze the product colors and create a complementary color scheme. Match the background to harmonize with the product.',
        rich: 'Use MEDIUM bold lines/arrows pointing from product parts to feature labels. Add matching decorative elements like icons, badges, shapes, and highlights that use the product color palette. Make it visually rich but cohesive.',
        callout: 'Create a TECHNICAL DIAGRAM style with thin lines pointing FROM specific parts of the product TO small ICON + SHORT TEXT labels. Each feature gets an ICON (matching the feature type) with minimal text beside it. Lines should connect to the exact relevant area of the product. Keep text VERY SHORT - use the exact feature text provided, do not expand or elaborate.',
        light: 'Use a clean white or very light background with subtle accents that complement the product colors.',
        dark: 'Use a dark/black background that makes the product stand out. Use light text and accents.',
        gradient: 'Use a subtle gradient background derived from the product colors. Keep it simple and professional.',
        transparent: 'Keep the original background from the product image. Only add text and minimal graphic elements.'
    };

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

    // Background complexity descriptions
    const bgComplexityDescriptions = {
        auto: '',
        solid: 'Use a SOLID, FLAT color background - clean and simple.',
        subtle: 'Use a SUBTLE background - very light texture or minimal gradient.',
        textured: 'Use a TEXTURED background - fabric, paper, concrete, or other subtle texture.',
        gradient: 'Use a GRADIENT background - smooth color transition.',
        pattern: 'Use a PATTERN background - geometric or abstract repeating elements.',
        environmental: 'Use an ENVIRONMENTAL background - contextual setting related to the product.'
    };

    // Icon style descriptions
    const iconStyleDescriptions = {
        auto: '',
        realistic: 'Use REALISTIC, PHOTO-LIKE icons - small detailed images that look like real objects or photographs. High detail, realistic textures and lighting.',
        illustrated: 'Use ILLUSTRATED, HAND-DRAWN style icons - artistic, sketch-like with visible brush strokes or pen lines. Warm and friendly aesthetic.',
        '3d': 'Use 3D RENDERED icons with depth, shadows, lighting, and perspective. Polished and modern look.',
        flat: 'Use FLAT, SOLID-COLORED icons with no gradients or shadows. Clean and modern.',
        outlined: 'Use OUTLINED/STROKE icons with consistent line weight, no fill. Clean technical look.',
        gradient: 'Use GRADIENT/GLOSSY icons with color transitions and shine effects. Sleek and polished.',
        minimal: 'Use very SIMPLE, MINIMALIST icons - basic shapes, single color, no details.',
        emoji: 'Use EMOJI-STYLE icons - colorful, friendly, recognizable emoji aesthetic.',
        none: 'Do not use any icons - text only for features.'
    };

    const styleDesc = styleDescriptions[style] || styleDescriptions.auto;
    const hasImage = state.uploadedImageBase64 !== null;

    // Build the enhanced prompt
    let prompt;

    if (hasImage) {
        prompt = `I'm providing a product photo. Create a professional marketing infographic.

CRITICAL INSTRUCTIONS:
- DO NOT modify the product itself - keep it EXACTLY as shown
- Analyze the product's colors and the original background
- ${styleDesc}
- Text should be readable and contrast well with the background

PRODUCT TITLE: "${title}"

`;
    } else {
        prompt = `Create a professional marketing infographic for a product.

PRODUCT TITLE: "${title}"

BACKGROUND STYLE: ${styleDesc}

`;
    }

    // Add features with emphasis info
    prompt += `PRODUCT FEATURES (use EXACTLY this text - do not expand, rephrase, or add words):\n`;

    if (primaryFeatures.length > 0) {
        prompt += `PRIMARY FEATURES (larger, more prominent, with icon):\n`;
        primaryFeatures.forEach(f => {
            const iconHint = f.icon !== 'auto' && f.icon !== 'none' ? ` → use ${f.icon} icon` : ' → add appropriate icon';
            prompt += `★ "${f.text}"${iconHint}\n`;
        });
        prompt += `\nSECONDARY FEATURES (with icon):\n`;
    }

    characteristics.filter(c => !c.isPrimary).forEach(c => {
        const iconHint = c.icon !== 'auto' && c.icon !== 'none' ? ` → use ${c.icon} icon` : ' → add appropriate icon';
        prompt += `• "${c.text}"${iconHint}\n`;
    });

    prompt += `\nIMPORTANT: Display each feature with an ICON next to it. Use the EXACT text in quotes above - do not modify, expand, or elaborate on it.\n`;

    prompt += `\nLANGUAGE: ${language}${state.language === 'ro' ? ' (use proper Romanian characters: ă, â, î, ș, ț)' : ''}\n`;

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
        prompt += `\nPRODUCT PRESENTATION: ${focusDescriptions[productFocus]}`;
    }

    // Add background complexity
    if (backgroundComplexity !== 'auto' && bgComplexityDescriptions[backgroundComplexity]) {
        prompt += `\nBACKGROUND STYLE: ${bgComplexityDescriptions[backgroundComplexity]}`;
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
            mono: 'ALL LINES SAME COLOR - use a single consistent color (white, black, or accent color) for all callout lines',
            multi: 'MULTICOLORED LINES - each feature callout line should be a DIFFERENT COLOR, creating a colorful, vibrant look',
            gradient: 'GRADIENT LINES - each line should have a gradient effect, transitioning between colors',
            match: 'MATCH PRODUCT COLORS - derive line colors from the product itself, using its color palette'
        };
        const colorModeDesc = colorModeDescriptions[lineColorMode] || colorModeDescriptions.multi;

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
// API INTEGRATION
// ============================================
function extractImageFromResponse(data) {
    let imageUrl = null;

    const message = data.choices?.[0]?.message;
    if (message) {
        if (Array.isArray(message.content)) {
            for (const part of message.content) {
                if (part.type === 'image_url' && part.image_url?.url) {
                    imageUrl = part.image_url.url;
                    break;
                }
                if (part.type === 'image' && part.source?.data) {
                    const mimeType = part.source.media_type || 'image/png';
                    imageUrl = `data:${mimeType};base64,${part.source.data}`;
                    break;
                }
                if (part.inline_data?.data) {
                    const mimeType = part.inline_data.mime_type || 'image/png';
                    imageUrl = `data:${mimeType};base64,${part.inline_data.data}`;
                    break;
                }
            }
        }

        if (!imageUrl && message.images && message.images.length > 0) {
            const img = message.images[0];
            if (typeof img === 'string') {
                imageUrl = img.startsWith('data:') || img.startsWith('http') ? img : `data:image/png;base64,${img}`;
            } else if (img.url) {
                imageUrl = img.url;
            } else if (img.image_url?.url) {
                imageUrl = img.image_url.url;
            } else if (img.b64_json) {
                imageUrl = `data:image/png;base64,${img.b64_json}`;
            }
        }

        if (!imageUrl && message.content && typeof message.content === 'string') {
            const base64Match = message.content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
            if (base64Match) {
                imageUrl = base64Match[0];
            }
        }
    }

    if (!imageUrl && data.data && data.data[0]) {
        if (data.data[0].url) {
            imageUrl = data.data[0].url;
        } else if (data.data[0].b64_json) {
            imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        }
    }

    return imageUrl;
}

async function makeGenerationRequest(requestBody, retries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${state.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI Product Infographics Generator'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || errorData.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            const imageUrl = extractImageFromResponse(data);

            if (!imageUrl) {
                if (data.error) {
                    throw new Error(data.error.message || 'Provider returned an error');
                }
                throw new Error('No image generated');
            }

            return imageUrl;
        } catch (error) {
            lastError = error;
            const isNetworkError = error.name === 'TypeError' && error.message === 'Failed to fetch';

            if (isNetworkError && attempt < retries) {
                console.log(`Network error, retrying (${attempt}/${retries})...`);
                updateLoadingStatus(`Network error, retrying (${attempt}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            throw isNetworkError
                ? new Error('Network error. Please check your internet connection and try again.')
                : error;
        }
    }

    throw lastError;
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

        if (state.uploadedImageBase64 || state.styleReferenceBase64) {
            messageContent = [
                {
                    type: 'text',
                    text: prompt
                }
            ];

            if (state.uploadedImageBase64) {
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

        const variationsCount = parseInt(elements.variations.value, 10) || 1;

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

            // Wait for copy to finish (it's already running in parallel)
            await copyPromise.catch(err => console.error('Copy generation error:', err));
        }

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();
        resetToPlaceholder();

        let errorMessage = error.message;
        if (errorMessage.includes('401')) {
            errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
        } else if (errorMessage.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
            errorMessage = 'Server error. Please try a different model or try again later.';
        } else if (errorMessage.includes('modalities')) {
            errorMessage = 'This model does not support image generation. Please select a different model.';
        } else if (errorMessage.toLowerCase().includes('provider')) {
            errorMessage = 'Provider error: The AI service is temporarily unavailable. Please try again or select a different model.';
        } else if (errorMessage.includes('capacity') || errorMessage.includes('overloaded')) {
            errorMessage = 'The model is currently at capacity. Please try again in a few moments or select a different model.';
        } else if (errorMessage.includes('insufficient')) {
            errorMessage = 'Insufficient credits. Please add credits to your OpenRouter account.';
        }

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

        const messageContent = [
            {
                type: 'text',
                text: adjustPrompt
            },
            {
                type: 'image_url',
                image_url: {
                    url: state.generatedImageUrl
                }
            }
        ];

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

        updateLoadingStatus('Adjusting infographic...');

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Product Infographics Generator'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || errorData.message || `API error: ${response.status}`;
            throw new Error(errorMsg);
        }

        const data = await response.json();

        updateLoadingStatus('Processing adjusted image...');

        const imageUrl = extractImageFromResponse(data);

        if (!imageUrl && data.error) {
            throw new Error(data.error.message || 'Provider returned an error');
        }

        if (!imageUrl) {
            throw new Error('No adjusted image was generated. Try a different model or rephrase your feedback.');
        }

        showResult(imageUrl);
        showSuccess('Infographic adjusted successfully!');

    } catch (error) {
        console.error('Adjustment error:', error);
        hideLoading();

        elements.loadingContainer.classList.remove('visible');
        elements.resultContainer.classList.add('visible');

        let errorMessage = error.message;
        if (errorMessage.includes('401')) {
            errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
        } else if (errorMessage.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
            errorMessage = 'Server error. Please try a different model or try again later.';
        }

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

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Product Infographics Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 100
            })
        });

        if (response.ok) {
            const data = await response.json();
            const altText = data.choices?.[0]?.message?.content?.trim() || '';
            if (altText) {
                state.generatedAltText = altText;
                elements.altTextContent.innerHTML = `"${altText}"`;
            } else {
                elements.altTextContent.innerHTML = '<span class="alt-text-loading">Could not generate alt text</span>';
            }
        } else {
            elements.altTextContent.innerHTML = '<span class="alt-text-loading">Alt text unavailable</span>';
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

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Product Infographics Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000
            })
        });

        if (response.ok) {
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content?.trim() || '';

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
        } else {
            showCopyError('Failed to generate marketing copy');
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
        backgroundType: elements.backgroundType?.value || 'auto',
        brandColors: [...state.selectedBrandColors],
        calloutLines: elements.calloutLinesToggle?.checked || false,
        calloutThickness: elements.calloutThickness?.value || 3
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

    // Background type
    if (settings.backgroundType && elements.backgroundType) {
        elements.backgroundType.value = settings.backgroundType;
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
        backgroundType: preset.backgroundType,
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

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Product Infographics Generator'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: state.uploadedImageBase64
                                }
                            },
                            {
                                type: 'text',
                                text: `Analyze this product image and extract information in JSON format.
Language: ${language}${state.language === 'ro' ? ' (use proper Romanian characters: ă, â, î, ș, ț)' : ''}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "productTitle": "Concise product name (2-5 words)",
  "category": "Product category",
  "features": [
    "Key feature 1 (brief, 3-6 words)",
    "Key feature 2 (brief, 3-6 words)",
    "Key feature 3 (brief, 3-6 words)",
    "Key feature 4 (brief, 3-6 words)",
    "Key feature 5 (brief, 3-6 words)"
  ],
  "primaryFeature": 0,
  "suggestedStyle": "auto|rich|callout|light|dark|gradient",
  "dominantColors": ["#hex1", "#hex2"]
}`
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Analysis API error:', response.status, errorData);
            showError(errorData.error?.message || `Analysis failed (${response.status})`);
            return;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || '';

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

            // Apply suggested style
            if (analysis.suggestedStyle) {
                const styleRadio = document.querySelector(`input[name="style"][value="${analysis.suggestedStyle}"]`);
                if (styleRadio) styleRadio.checked = true;
            }

            // Add dominant colors
            if (analysis.dominantColors && Array.isArray(analysis.dominantColors)) {
                analysis.dominantColors.forEach(color => {
                    if (!state.selectedBrandColors.includes(color)) {
                        state.selectedBrandColors.push(color);
                    }
                });
                renderSelectedColors();
            }

            showSuccess('Product analyzed! Title and features extracted.');
        } catch (parseError) {
            console.error('Failed to parse analysis:', parseError, content);
            showError('Failed to parse AI response');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showError('Error analyzing image');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

function addCharacteristic(text = '', isPrimary = false) {
    const charItem = document.createElement('div');
    charItem.className = 'char-item';

    const charIndex = elements.characteristicsList.querySelectorAll('.char-item').length;

    charItem.innerHTML = `
        <button type="button" class="char-star${isPrimary ? ' starred' : ''}" title="Mark as primary feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
        </button>
        <input type="text" class="input-field" placeholder="Product feature..." value="${text}">
        <select class="select-field select-mini char-icon">
            <option value="auto">Auto</option>
            <option value="battery">🔋</option>
            <option value="wifi">📶</option>
            <option value="camera">📷</option>
            <option value="shield">🛡️</option>
            <option value="star">⭐</option>
            <option value="clock">⏱️</option>
            <option value="bolt">⚡</option>
            <option value="water">💧</option>
            <option value="leaf">🌿</option>
            <option value="diamond">💎</option>
        </select>
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

    // Icon auto-suggest
    const input = charItem.querySelector('.input-field');
    const iconSelect = charItem.querySelector('.char-icon');
    input.addEventListener('input', () => {
        const suggestedIcon = suggestIconForText(input.value);
        if (suggestedIcon && iconSelect.value === 'auto') {
            // Visual hint that an icon was suggested
            iconSelect.style.borderColor = 'var(--accent)';
            setTimeout(() => {
                iconSelect.style.borderColor = '';
            }, 500);
        }
    });

    elements.characteristicsList.appendChild(charItem);

    if (isPrimary) {
        state.starredCharacteristics.add(charIndex);
    }
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
// LIGHTBOX
// ============================================
function openLightbox(imageUrl) {
    elements.lightboxImage.src = imageUrl;
    elements.lightbox.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.classList.remove('visible');
    document.body.style.overflow = '';
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

    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Style radio buttons - sync with hidden select
    elements.styleRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            elements.infographicStyle.value = radio.value;
        });
    });

    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted, calling generateInfographic...');
        generateInfographic();
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
        // Escape - close modals
        if (e.key === 'Escape') {
            if (elements.lightbox.classList.contains('visible')) {
                closeLightbox();
            }
            if (elements.historyModal.classList.contains('visible')) {
                closeHistoryModal();
            }
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
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('NGRAPHICS: Initializing...');
    initElements();
    loadTheme();
    loadApiKey();
    setupApiKeyHandlers();
    setupImageUploadHandlers();
    setupAdvancedOptionsHandlers();
    setupColorPickerHandlers();
    setupCharacteristicsHandlers();
    setupEventListeners();
    updateLanguage('ro');
    loadHistory();
    loadTemplatesFromStorage();

    // Update API status on load
    if (state.apiKey) {
        updateApiStatus(true);
    }
    console.log('NGRAPHICS: Ready!');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Also init immediately if DOM already loaded
if (document.readyState !== 'loading') {
    init();
}
