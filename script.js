/**
 * AI Product Infographics Generator
 * Main JavaScript file with all functionality
 */

// ============================================
// APPLICATION STATE
// ============================================
const state = {
    language: 'ro', // 'en' or 'ro'
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
    starredCharacteristics: new Set()
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
        // Language
        langOptions: document.querySelectorAll('.lang-option'),
        titleHint: document.getElementById('titleHint'),
        charHint: document.getElementById('charHint'),

        // API Key
        apiKeyInput: document.getElementById('apiKey'),
        toggleApiKeyBtn: document.getElementById('toggleApiKey'),
        saveApiKeyBtn: document.getElementById('saveApiKey'),

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
        watermarkPositionBtns: document.querySelectorAll('.watermark-position-btn'),
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
        modalUseAsBase: document.getElementById('modalUseAsBase')
    };
}

// ============================================
// LANGUAGE HANDLING
// ============================================
const translations = {
    en: {
        titleHint: '(in English)',
        charHint: '(key features in English)',
        titlePlaceholder: 'e.g., Premium Wireless Headphones',
        charPlaceholders: [
            'e.g., Active Noise Cancellation',
            'e.g., 30-hour battery life',
            'e.g., Bluetooth 5.3'
        ]
    },
    ro: {
        titleHint: '(în limba română)',
        charHint: '(caracteristici în română)',
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

    const charInputs = elements.characteristicsList.querySelectorAll('.char-item .form-input');
    charInputs.forEach((input, index) => {
        const placeholder = t.charPlaceholders[index] || t.charPlaceholders[0];
        input.placeholder = placeholder;
    });
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

function setupApiKeyHandlers() {
    elements.toggleApiKeyBtn.addEventListener('click', () => {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
        elements.toggleApiKeyBtn.querySelector('span').textContent = isPassword ? 'Hide' : 'Show';
    });

    elements.saveApiKeyBtn.addEventListener('click', () => {
        const key = elements.apiKeyInput.value.trim();
        if (key) {
            state.apiKey = key;
            localStorage.setItem('openrouter_api_key', key);
            showSuccess('API key saved successfully!');
        } else {
            showError('Please enter a valid API key');
        }
    });
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
            });
        } else {
            state.uploadedImageBase64 = imageData;
            elements.previewImg.src = imageData;
            elements.imagePreview.classList.add('visible');
            elements.uploadArea.style.display = 'none';
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
// CHARACTERISTICS HANDLING
// ============================================
function setupCharacteristicsHandlers() {
    elements.addCharBtn.addEventListener('click', () => {
        addCharacteristicItem();
    });

    // Attach handlers to initial remove buttons
    document.querySelectorAll('.char-remove').forEach(attachRemoveHandler);
    document.querySelectorAll('.char-star').forEach(attachStarHandler);
    document.querySelectorAll('.char-item .form-input').forEach(attachIconSuggestionHandler);
}

function addCharacteristicItem() {
    const t = translations[state.language];
    const div = document.createElement('div');
    div.className = 'char-item';
    div.innerHTML = `
        <button type="button" class="char-star" title="Mark as primary feature">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        </button>
        <input type="text" class="form-input" placeholder="${t.charPlaceholders[0]}">
        <select class="form-select char-icon-select" title="Suggested icon">
            <option value="auto">Auto icon</option>
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
            <option value="none">No icon</option>
        </select>
        <button type="button" class="char-remove" title="Remove">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    elements.characteristicsList.appendChild(div);
    attachRemoveHandler(div.querySelector('.char-remove'));
    attachStarHandler(div.querySelector('.char-star'));
    attachIconSuggestionHandler(div.querySelector('.form-input'));
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
    elements.successMessage.textContent = message;
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
        const input = item.querySelector('.form-input');
        const starBtn = item.querySelector('.char-star');
        const iconSelect = item.querySelector('.char-icon-select');

        const text = input.value.trim();
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

    // Style descriptions
    const styleDescriptions = {
        auto: 'Analyze the product colors and create a complementary color scheme. Match the background to harmonize with the product.',
        rich: 'Use MEDIUM bold lines/arrows pointing from product parts to feature labels. Add matching decorative elements like icons, badges, shapes, and highlights that use the product color palette. Make it visually rich but cohesive.',
        callout: 'Use thin lines/arrows pointing FROM specific parts of the product TO the corresponding feature text. Each feature should have a line connecting to the relevant area of the product.',
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
        flat: 'Use flat, solid-colored icons with no gradients or shadows.',
        outlined: 'Use outlined/stroke icons with consistent line weight.',
        '3d': 'Use 3D-style icons with depth and shadows.',
        minimal: 'Use very simple, minimalist icons.',
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
    prompt += `PRODUCT FEATURES:\n`;

    if (primaryFeatures.length > 0) {
        prompt += `PRIMARY FEATURES (make these larger/more prominent):\n`;
        primaryFeatures.forEach(f => {
            const iconHint = f.icon !== 'auto' && f.icon !== 'none' ? ` [use ${f.icon} icon]` : '';
            prompt += `★ ${f.text}${iconHint}\n`;
        });
        prompt += `\nSECONDARY FEATURES:\n`;
    }

    characteristics.filter(c => !c.isPrimary).forEach(c => {
        const iconHint = c.icon !== 'auto' && c.icon !== 'none' ? ` [use ${c.icon} icon]` : '';
        prompt += `• ${c.text}${iconHint}\n`;
    });

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

async function makeGenerationRequest(requestBody) {
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
}

async function generateInfographic() {
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

        if (variationsCount === 1) {
            if (state.uploadedImageBase64) {
                updateLoadingStatus('Generating infographic with your product image...');
            } else {
                updateLoadingStatus('Generating infographic...');
            }

            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
            showSuccess('Infographic generated successfully!');
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
        const charInputs = elements.characteristicsList.querySelectorAll('.form-input');
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
        opt.addEventListener('click', () => updateLanguage(opt.dataset.lang));
    });

    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
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
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    initElements();
    loadApiKey();
    setupApiKeyHandlers();
    setupImageUploadHandlers();
    setupAdvancedOptionsHandlers();
    setupCharacteristicsHandlers();
    setupEventListeners();
    updateLanguage('ro');
    loadHistory();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Also init immediately if DOM already loaded
if (document.readyState !== 'loading') {
    init();
}
