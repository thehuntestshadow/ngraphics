/**
 * Ad Creative - NGRAPHICS
 * Create banner ads for Google, Facebook, Amazon & Instagram
 */

// ============================================
// STATE
// ============================================

const state = {
    // Core
    apiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    lastPrompt: null,
    lastSeed: null,

    // Platform & Size
    platform: 'google',
    adSize: '300x250',

    // Ad Content
    headline: '',
    description: '',
    ctaText: 'Shop Now',
    includePrice: false,
    price: '',
    includeBadge: false,
    badgeType: 'sale',

    // Style
    style: 'modern',
    colorScheme: 'auto',
    customColor: '#6366f1',
    textPosition: 'bottom',

    // Advanced
    aiModel: 'google/gemini-2.0-flash-exp:free',
    seed: '',
    variations: 1,
    quality: 'standard',

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
        adForm: document.getElementById('adForm'),

        // Platform & Size
        platformTabs: document.getElementById('platformTabs'),
        sizeGrid: document.getElementById('sizeGrid'),
        sizeIndicator: document.getElementById('sizeIndicator'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),

        // Content
        headline: document.getElementById('headline'),
        headlineCount: document.getElementById('headlineCount'),
        description: document.getElementById('description'),
        descCount: document.getElementById('descCount'),
        ctaSelect: document.getElementById('ctaSelect'),
        includePrice: document.getElementById('includePrice'),
        priceGroup: document.getElementById('priceGroup'),
        priceValue: document.getElementById('priceValue'),
        includeBadge: document.getElementById('includeBadge'),
        badgeType: document.getElementById('badgeType'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedContent: document.getElementById('advancedContent'),
        aiModel: document.getElementById('aiModel'),
        seedInput: document.getElementById('seedInput'),
        randomizeSeed: document.getElementById('randomizeSeed'),

        // API Settings
        settingsToggle: document.getElementById('settingsToggle'),
        settingsContent: document.getElementById('settingsContent'),
        apiKey: document.getElementById('apiKey'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        saveApiKey: document.getElementById('saveApiKey'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Output
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        resultDisplay: document.getElementById('resultDisplay'),
        resultImage: document.getElementById('resultImage'),
        variationsGrid: document.getElementById('variationsGrid'),

        // Actions
        downloadBtn: document.getElementById('downloadBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),

        // History
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistory: document.getElementById('clearHistory'),

        // Favorites
        favoritesGrid: document.getElementById('favoritesGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
        favoritesEmpty: document.getElementById('favoritesEmpty'),
        clearFavorites: document.getElementById('clearFavorites'),

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
        favoritesModalBody: document.getElementById('favoritesModalBody'),
        loadFavoriteSettings: document.getElementById('loadFavoriteSettings'),
        deleteFavorite: document.getElementById('deleteFavorite'),

        // Custom color
        customColor: document.getElementById('customColor')
    };
}

// ============================================
// STORAGE
// ============================================

const history = new SharedHistory('ad_creative_history', 20);
const favorites = new SharedFavorites('ad_creative_favorites', 50);

// ============================================
// PLATFORM CONFIGS
// ============================================

const platformConfigs = {
    google: {
        name: 'Google Display',
        sizes: [
            { id: '300x250', name: 'Medium Rectangle', width: 300, height: 250, popular: true },
            { id: '728x90', name: 'Leaderboard', width: 728, height: 90 },
            { id: '160x600', name: 'Wide Skyscraper', width: 160, height: 600 },
            { id: '300x600', name: 'Half Page', width: 300, height: 600 },
            { id: '320x50', name: 'Mobile Banner', width: 320, height: 50 },
            { id: '336x280', name: 'Large Rectangle', width: 336, height: 280 }
        ]
    },
    facebook: {
        name: 'Facebook/Meta',
        sizes: [
            { id: '1200x628', name: 'Link Ad', width: 1200, height: 628, popular: true },
            { id: '1080x1080', name: 'Feed Square', width: 1080, height: 1080 },
            { id: '1080x1920', name: 'Story Ad', width: 1080, height: 1920 },
            { id: '1200x1200', name: 'Carousel', width: 1200, height: 1200 }
        ]
    },
    amazon: {
        name: 'Amazon',
        sizes: [
            { id: '1200x628', name: 'Headline Search', width: 1200, height: 628, popular: true },
            { id: '970x250', name: 'Billboard', width: 970, height: 250 },
            { id: '300x250', name: 'Product Display', width: 300, height: 250 },
            { id: '160x600', name: 'Skyscraper', width: 160, height: 600 }
        ]
    },
    instagram: {
        name: 'Instagram',
        sizes: [
            { id: '1080x1080', name: 'Feed Post', width: 1080, height: 1080, popular: true },
            { id: '1080x1350', name: 'Portrait', width: 1080, height: 1350 },
            { id: '1080x1920', name: 'Story/Reel', width: 1080, height: 1920 },
            { id: '1080x566', name: 'Landscape', width: 1080, height: 566 }
        ]
    }
};

// ============================================
// DESCRIPTION MAPS
// ============================================

const styleDescriptions = {
    'modern': 'Clean, contemporary design with bold typography, geometric shapes, and gradient accents',
    'bold': 'Eye-catching design with large text, vibrant colors, and strong visual impact',
    'minimal': 'Simple, understated design with plenty of white space, thin fonts, and subtle details',
    'elegant': 'Sophisticated design with serif fonts, muted colors, and refined aesthetics',
    'playful': 'Fun, energetic design with bright colors, rounded shapes, and dynamic elements',
    'dark': 'Dark theme design with dramatic lighting, high contrast, and moody atmosphere'
};

const colorDescriptions = {
    'auto': 'Automatically extract colors from the product image',
    'coral': 'Warm coral and orange gradient tones',
    'ocean': 'Cool blue and purple gradient tones',
    'forest': 'Fresh green and teal gradient tones',
    'sunset': 'Pink and red gradient tones',
    'mono': 'Monochromatic dark grays and blacks'
};

const positionDescriptions = {
    'top-left': 'top-left corner',
    'top': 'top center',
    'top-right': 'top-right corner',
    'left': 'left side, vertically centered',
    'center': 'center of the image',
    'right': 'right side, vertically centered',
    'bottom-left': 'bottom-left corner',
    'bottom': 'bottom center',
    'bottom-right': 'bottom-right corner'
};

const badgeDescriptions = {
    'sale': 'SALE',
    'new': 'NEW',
    'limited': 'LIMITED TIME',
    'bestseller': 'BEST SELLER',
    'freeship': 'FREE SHIPPING'
};

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const config = platformConfigs[state.platform];
    const sizeInfo = config.sizes.find(s => s.id === state.adSize);
    const width = sizeInfo?.width || 300;
    const height = sizeInfo?.height || 250;
    const sizeName = sizeInfo?.name || 'Banner';

    let prompt = `Create a professional advertising banner for ${config.name}.

DIMENSIONS: ${width}x${height} pixels (${sizeName})

DESIGN STYLE: ${styleDescriptions[state.style]}

COLOR SCHEME: ${state.colorScheme === 'custom' ? `Custom brand color: ${state.customColor}` : colorDescriptions[state.colorScheme] || 'Auto-extract from product'}

TEXT POSITION: Place all text content in the ${positionDescriptions[state.textPosition]} of the ad`;

    // Ad content
    if (state.headline) {
        prompt += `

HEADLINE: "${state.headline}"
- Display prominently with bold, impactful typography
- Must be clearly readable at the ad's actual display size`;
    }

    if (state.description) {
        prompt += `

DESCRIPTION: "${state.description}"
- Secondary text, smaller than headline
- Support the headline message`;
    }

    prompt += `

CALL-TO-ACTION BUTTON: "${state.ctaText}"
- Style as a prominent, clickable-looking button
- Make it stand out from the background
- Position it clearly visible, near the text content`;

    // Optional elements
    if (state.includePrice && state.price) {
        prompt += `

PRICE DISPLAY: "$${state.price}"
- Show the price prominently
- Style it to catch attention (large text, contrasting color, or price tag design)`;
    }

    if (state.includeBadge) {
        prompt += `

PROMOTIONAL BADGE: "${badgeDescriptions[state.badgeType]}"
- Add a badge/ribbon/starburst element
- Position it to draw attention without blocking the product
- Use contrasting colors for visibility`;
    }

    // Platform-specific notes
    prompt += `

PRODUCT PLACEMENT:
- The uploaded product image should be the hero/focal element
- Position the product prominently, ensuring it's clearly visible
- Scale appropriately for the ad dimensions

ADVERTISING REQUIREMENTS:
- Professional, marketing-ready quality
- Clean composition with clear visual hierarchy
- Text must be legible at actual ad display size
- Follow ${config.name} advertising guidelines and best practices
- High contrast between text and background for readability`;

    // Quality note
    if (state.quality === 'high') {
        prompt += `

HIGH QUALITY OUTPUT:
- Extra attention to detail and polish
- Sharp, crisp graphics and text
- Professional advertising production quality`;
    }

    prompt += `

OUTPUT: A complete, ready-to-use advertising banner image.`;

    return prompt;
}

// ============================================
// API CALL
// ============================================

async function generateAdCreative() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    if (!state.apiKey) {
        showError('Please add your OpenRouter API key in settings');
        return;
    }

    showLoading();

    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    const seed = state.seed || Math.floor(Math.random() * 999999);
    state.lastSeed = seed;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'NGRAPHICS Ad Creative'
            },
            body: JSON.stringify({
                model: state.aiModel,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt + `\n\nSeed: ${seed}`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${state.uploadedImageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 4096,
                temperature: 0.7,
                modalities: ['text', 'image'],
                response_format: { type: 'text' }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        const imageUrl = extractImageFromResponse(data);

        if (!imageUrl) {
            throw new Error('No image was generated. The model may not support image generation.');
        }

        state.generatedImageUrl = imageUrl;
        state.generatedImages = [imageUrl];

        hideLoading();
        showResult(imageUrl);
        await addToHistory(imageUrl, [imageUrl]);
        showSuccess('Ad creative generated successfully!');

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();
        showError(error.message || 'Failed to generate ad');
    }
}

function extractImageFromResponse(data) {
    const message = data.choices?.[0]?.message;
    if (!message) return null;

    // Check for inline_data (Gemini format)
    if (message.content && Array.isArray(message.content)) {
        for (const part of message.content) {
            if (part.type === 'image' && part.image?.base64) {
                return `data:image/png;base64,${part.image.base64}`;
            }
            if (part.inline_data?.data) {
                const mimeType = part.inline_data.mime_type || 'image/png';
                return `data:${mimeType};base64,${part.inline_data.data}`;
            }
        }
    }

    // Check for image_url format
    if (message.content && Array.isArray(message.content)) {
        for (const part of message.content) {
            if (part.type === 'image_url' && part.image_url?.url) {
                return part.image_url.url;
            }
        }
    }

    return null;
}

// ============================================
// UI FUNCTIONS
// ============================================

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.resultDisplay.style.display = 'none';
    elements.variationsGrid.style.display = 'none';
    elements.generateBtn.disabled = true;
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.generateBtn.disabled = false;
}

function showResult(imageUrl) {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultDisplay.style.display = 'block';
    elements.resultImage.src = imageUrl;
}

function showError(message) {
    const errorText = elements.errorMessage.querySelector('.error-text');
    if (errorText) errorText.textContent = message;
    elements.errorMessage.classList.add('show');
    setTimeout(() => elements.errorMessage.classList.remove('show'), 5000);
}

function showSuccess(message) {
    const content = elements.successMessage.querySelector('.message-content');
    if (content) content.textContent = message;
    elements.successMessage.classList.add('show');
    setTimeout(() => elements.successMessage.classList.remove('show'), 3000);
}

// ============================================
// PLATFORM & SIZE HANDLING
// ============================================

function switchPlatform(platform) {
    state.platform = platform;

    // Update active tab
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.platform === platform);
    });

    // Render size grid for this platform
    renderSizeGrid(platform);
}

function renderSizeGrid(platform) {
    const config = platformConfigs[platform];
    if (!config || !elements.sizeGrid) return;

    elements.sizeGrid.innerHTML = config.sizes.map((size, i) => {
        // Calculate scaled preview dimensions (max 60px width, proportional height)
        const maxPreviewWidth = 50;
        const scale = maxPreviewWidth / size.width;
        const previewWidth = Math.round(size.width * scale);
        const previewHeight = Math.round(size.height * scale);
        // Cap height for very tall ads
        const cappedHeight = Math.min(previewHeight, 40);
        const cappedWidth = previewHeight > 40 ? Math.round(previewWidth * (40 / previewHeight)) : previewWidth;

        return `
            <button type="button" class="size-btn ${i === 0 ? 'active' : ''} ${size.popular ? 'popular' : ''}" data-size="${size.id}">
                <div class="size-preview" style="width: ${cappedWidth}px; height: ${cappedHeight}px;"></div>
                <span class="size-name">${size.name}</span>
                <span class="size-dimensions">${size.width}x${size.height}</span>
            </button>
        `;
    }).join('');

    // Set first size as default
    if (config.sizes.length > 0) {
        state.adSize = config.sizes[0].id;
        updateSizeIndicator();
    }

    // Add event listeners
    elements.sizeGrid.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => selectSize(btn.dataset.size));
    });
}

function selectSize(sizeId) {
    state.adSize = sizeId;

    // Update active state
    elements.sizeGrid.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === sizeId);
    });

    updateSizeIndicator();
}

function updateSizeIndicator() {
    const config = platformConfigs[state.platform];
    const size = config?.sizes.find(s => s.id === state.adSize);
    if (size && elements.sizeIndicator) {
        elements.sizeIndicator.textContent = `${size.width} x ${size.height}`;
    }
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory(imageUrl, allImages) {
    const entry = {
        id: Date.now().toString(),
        thumbnail: imageUrl,
        fullImage: imageUrl,
        allImages: allImages,
        settings: { ...state },
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        timestamp: new Date().toISOString()
    };

    await history.add(entry);
    renderHistory();
}

async function renderHistory() {
    const items = await history.getAll();
    elements.historyCount.textContent = items.length;

    if (items.length === 0) {
        elements.historyEmpty.style.display = 'flex';
        elements.historyGrid.innerHTML = '';
        elements.historyGrid.appendChild(elements.historyEmpty);
        return;
    }

    elements.historyEmpty.style.display = 'none';
    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="History item" loading="lazy">
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
            const entry = await history.findById(item.dataset.id);
            if (entry) openLightbox(entry.fullImage || entry.thumbnail);
        });
    });
}

async function saveFavorite() {
    if (!state.generatedImageUrl) return;

    const entry = {
        id: Date.now().toString(),
        thumbnail: state.generatedImageUrl,
        fullImage: state.generatedImageUrl,
        allImages: state.generatedImages,
        settings: { ...state },
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        timestamp: new Date().toISOString()
    };

    await favorites.add(entry);
    renderFavorites();
    showSuccess('Added to favorites!');
}

async function renderFavorites() {
    const items = await favorites.getAll();
    elements.favoritesCount.textContent = items.length;

    if (items.length === 0) {
        elements.favoritesEmpty.style.display = 'flex';
        elements.favoritesGrid.innerHTML = '';
        elements.favoritesGrid.appendChild(elements.favoritesEmpty);
        return;
    }

    elements.favoritesEmpty.style.display = 'none';
    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="Favorite item" loading="lazy">
        </div>
    `).join('');

    elements.favoritesGrid.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', () => openFavoritesModal(item.dataset.id));
    });
}

async function loadFavorite(id) {
    const item = await favorites.findById(id);
    if (!item || !item.settings) return;

    // Restore settings
    Object.assign(state, item.settings);
    state.seed = item.seed || '';

    // Update UI
    switchPlatform(state.platform);

    document.querySelectorAll('[data-style]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === state.style);
    });

    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === state.colorScheme);
    });

    document.querySelectorAll('[data-position]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.position === state.textPosition);
    });

    if (elements.headline) elements.headline.value = state.headline || '';
    if (elements.description) elements.description.value = state.description || '';
    if (elements.ctaSelect) elements.ctaSelect.value = state.ctaText || 'Shop Now';
    if (elements.seedInput) elements.seedInput.value = state.seed || '';
    if (elements.includePrice) elements.includePrice.checked = state.includePrice || false;
    if (elements.priceValue) elements.priceValue.value = state.price || '';
    if (elements.includeBadge) elements.includeBadge.checked = state.includeBadge || false;
    if (elements.badgeType) elements.badgeType.value = state.badgeType || 'sale';

    // Update char counts
    updateCharCount(elements.headline, elements.headlineCount);
    updateCharCount(elements.description, elements.descCount);

    // Show/hide conditional fields
    if (elements.priceGroup) elements.priceGroup.style.display = state.includePrice ? 'flex' : 'none';
    if (elements.badgeType) elements.badgeType.style.display = state.includeBadge ? 'block' : 'none';

    closeFavoritesModal();
    showSuccess('Settings loaded from favorite');
}

// ============================================
// LIGHTBOX & MODAL
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

async function openFavoritesModal(id) {
    const item = await favorites.findById(id);
    if (!item) return;

    state.selectedFavorite = id;

    const config = platformConfigs[item.settings?.platform || 'google'];
    const size = config?.sizes.find(s => s.id === item.settings?.adSize);

    elements.favoritesModalBody.innerHTML = `
        <div class="favorite-preview">
            <img src="${item.fullImage || item.thumbnail}" alt="Favorite preview">
        </div>
        <div class="favorite-details">
            <div class="detail-row">
                <span class="detail-label">Platform:</span>
                <span class="detail-value">${config?.name || 'Google Display'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Size:</span>
                <span class="detail-value">${size?.name || '300x250'} (${item.settings?.adSize || '300x250'})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Style:</span>
                <span class="detail-value">${item.settings?.style || 'modern'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Seed:</span>
                <span class="detail-value">${item.seed || 'Random'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
        </div>
    `;

    elements.favoritesModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFavoritesModal() {
    elements.favoritesModal.classList.remove('active');
    document.body.style.overflow = '';
    state.selectedFavorite = null;
}

// ============================================
// DOWNLOAD
// ============================================

function downloadImage() {
    if (!state.generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = state.generatedImageUrl;
    const config = platformConfigs[state.platform];
    const size = config?.sizes.find(s => s.id === state.adSize);
    link.download = `ad-${state.platform}-${size?.name?.replace(/\s+/g, '-') || state.adSize}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// CHARACTER COUNT
// ============================================

function updateCharCount(input, countEl) {
    if (input && countEl) {
        countEl.textContent = input.value.length;
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Form submit
    elements.adForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateAdCreative();
    });

    // Platform tabs
    elements.platformTabs?.querySelectorAll('.platform-tab').forEach(tab => {
        tab.addEventListener('click', () => switchPlatform(tab.dataset.platform));
    });

    // Style buttons
    document.querySelectorAll('[data-style]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.style = btn.dataset.style;
        });
    });

    // Color buttons
    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-color]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.colorScheme = btn.dataset.color;
        });
    });

    // Position buttons
    document.querySelectorAll('[data-position]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-position]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.textPosition = btn.dataset.position;
        });
    });

    // Variations buttons
    document.querySelectorAll('[data-variations]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-variations]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.variations);
        });
    });

    // Quality buttons
    document.querySelectorAll('[data-quality]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-quality]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.quality = btn.dataset.quality;
        });
    });

    // Content inputs
    elements.headline?.addEventListener('input', () => {
        state.headline = elements.headline.value;
        updateCharCount(elements.headline, elements.headlineCount);
    });

    elements.description?.addEventListener('input', () => {
        state.description = elements.description.value;
        updateCharCount(elements.description, elements.descCount);
    });

    elements.ctaSelect?.addEventListener('change', () => {
        state.ctaText = elements.ctaSelect.value;
    });

    // Price checkbox
    elements.includePrice?.addEventListener('change', () => {
        state.includePrice = elements.includePrice.checked;
        if (elements.priceGroup) {
            elements.priceGroup.style.display = state.includePrice ? 'flex' : 'none';
        }
    });

    elements.priceValue?.addEventListener('input', () => {
        state.price = elements.priceValue.value;
    });

    // Badge checkbox
    elements.includeBadge?.addEventListener('change', () => {
        state.includeBadge = elements.includeBadge.checked;
        if (elements.badgeType) {
            elements.badgeType.style.display = state.includeBadge ? 'block' : 'none';
        }
    });

    elements.badgeType?.addEventListener('change', () => {
        state.badgeType = elements.badgeType.value;
    });

    // Custom color
    elements.customColor?.addEventListener('input', () => {
        state.customColor = elements.customColor.value;
        document.documentElement.style.setProperty('--custom-color', state.customColor);
    });

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        elements.advancedContent.classList.toggle('show');
        elements.advancedToggle.classList.toggle('open');
    });

    // Settings toggle
    elements.settingsToggle?.addEventListener('click', () => {
        elements.settingsContent.classList.toggle('show');
        elements.settingsToggle.classList.toggle('open');
    });

    // AI Model
    elements.aiModel?.addEventListener('change', () => {
        state.aiModel = elements.aiModel.value;
    });

    // Seed
    elements.seedInput?.addEventListener('input', () => {
        state.seed = elements.seedInput.value;
    });

    elements.randomizeSeed?.addEventListener('click', () => {
        const randomSeed = Math.floor(Math.random() * 999999);
        elements.seedInput.value = randomSeed;
        state.seed = randomSeed;
    });

    // API Key
    elements.toggleApiKey?.addEventListener('click', () => {
        const type = elements.apiKey.type === 'password' ? 'text' : 'password';
        elements.apiKey.type = type;
    });

    elements.saveApiKey?.addEventListener('click', () => {
        state.apiKey = elements.apiKey.value;
        localStorage.setItem('ngraphics_api_key', state.apiKey);
        showSuccess('API key saved!');
    });

    // Upload
    elements.uploadArea?.addEventListener('click', () => elements.productPhoto?.click());
    elements.uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('dragover');
    });
    elements.uploadArea?.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('dragover');
    });
    elements.uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    });

    elements.productPhoto?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });

    elements.removeImage?.addEventListener('click', () => {
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'block';
        elements.productPhoto.value = '';
    });

    // Actions
    elements.downloadBtn?.addEventListener('click', downloadImage);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.regenerateBtn?.addEventListener('click', generateAdCreative);

    // History
    elements.clearHistory?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
            renderHistory();
        }
    });

    // Favorites
    elements.clearFavorites?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all favorites? This cannot be undone.', { title: 'Clear Favorites', confirmText: 'Clear All', icon: 'warning' })) {
            await favorites.clear();
            renderFavorites();
        }
    });

    elements.loadFavoriteSettings?.addEventListener('click', () => {
        if (state.selectedFavorite) loadFavorite(state.selectedFavorite);
    });

    elements.deleteFavorite?.addEventListener('click', async () => {
        if (state.selectedFavorite) {
            await favorites.remove(state.selectedFavorite);
            closeFavoritesModal();
            renderFavorites();
            showSuccess('Favorite deleted');
        }
    });

    // Lightbox
    elements.lightboxClose?.addEventListener('click', closeLightbox);
    elements.lightbox?.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });
    elements.lightboxDownload?.addEventListener('click', () => {
        if (elements.lightboxImage.src) {
            const link = document.createElement('a');
            link.href = elements.lightboxImage.src;
            link.download = `ad-creative-${Date.now()}.png`;
            link.click();
        }
    });

    // Favorites modal
    elements.closeFavoritesModal?.addEventListener('click', closeFavoritesModal);
    elements.favoritesModal?.addEventListener('click', (e) => {
        if (e.target === elements.favoritesModal) closeFavoritesModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeFavoritesModal();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateAdCreative();
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            downloadImage();
        }
    });
}

// ============================================
// IMAGE UPLOAD
// ============================================

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedImage = e.target.result;
        elements.previewImg.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.uploadArea.style.display = 'none';

        // Extract base64
        const base64 = e.target.result.split(',')[1];
        state.uploadedImageBase64 = base64;
    };
    reader.readAsDataURL(file);
}

// ============================================
// INIT
// ============================================

async function init() {
    initElements();

    // Load API key
    state.apiKey = localStorage.getItem('ngraphics_api_key') || '';
    if (elements.apiKey) elements.apiKey.value = state.apiKey;

    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }


    // Render initial size grid
    renderSizeGrid(state.platform);

    // Setup event listeners
    setupEventListeners();

    // Render history and favorites
    renderHistory();
    renderFavorites();
}

document.addEventListener('DOMContentLoaded', init);
