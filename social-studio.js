/**
 * Social Studio - HEFAISTOS
 * Create social media graphics for all platforms
 */

const DEFAULT_MODEL = 'google/gemini-3-pro-image-preview';
const STUDIO_ID = 'social-studio';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    autoMode: true,
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    lastPrompt: null,
    lastSeed: null,

    // Format
    format: 'post',
    platform: 'instagram',
    aspectRatio: '1:1',

    // Carousel
    slideCount: 4,
    slideContent: 'features',

    // Content
    headline: '',
    bodyText: '',
    ctaText: '',

    // Style
    style: 'modern',
    colorScheme: 'auto',
    customColor: '#6366f1',

    // Advanced
    aiModel: 'google/gemini-3-pro-image-preview',
    seed: '',
    variations: 1,
    includeLogo: false,
    includePrice: false,
    includeBadge: true,

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
        socialForm: document.getElementById('socialForm'),

        // Format
        formatTabs: document.getElementById('formatTabs'),
        platformSection: document.getElementById('platformSection'),
        platformGrid: document.getElementById('platformGrid'),
        aspectSection: document.getElementById('aspectSection'),
        aspectGrid: document.getElementById('aspectGrid'),

        // Carousel
        carouselSection: document.getElementById('carouselSection'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),

        // Content
        headline: document.getElementById('headline'),
        bodyText: document.getElementById('bodyText'),
        ctaText: document.getElementById('ctaText'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedSection: document.getElementById('advancedSection'),
        seedInput: document.getElementById('seedInput'),
        randomizeSeed: document.getElementById('randomizeSeed'),
        includeLogo: document.getElementById('includeLogo'),
        includePrice: document.getElementById('includePrice'),
        includeBadge: document.getElementById('includeBadge'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Output
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        skeletonGrid: document.getElementById('skeletonGrid'),
        resultDisplay: document.getElementById('resultDisplay'),
        resultImage: document.getElementById('resultImage'),
        variationsGrid: document.getElementById('variationsGrid'),

        // Actions
        downloadBtn: document.getElementById('downloadBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),

        // History
        historyPanel: document.getElementById('historyPanel'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistory: document.getElementById('clearHistory'),

        // Favorites
        favoritesPanel: document.getElementById('favoritesPanel'),
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

const history = new SharedHistory('social_studio_history', 20);
const favorites = new SharedFavorites('social_studio_favorites', 50);

// ============================================
// DESCRIPTION MAPS
// ============================================

const formatDescriptions = {
    'post': 'Standard social media post for feeds',
    'story': 'Vertical format for Stories and Reels (9:16)',
    'carousel': 'Multi-slide carousel post with swipeable content',
    'pinterest': 'Tall vertical format optimized for Pinterest (2:3)',
    'thumbnail': 'Video thumbnail for YouTube, TikTok, or covers'
};

const platformConfigs = {
    'post': {
        platforms: [
            { id: 'instagram', name: 'Instagram', dimensions: '1080×1080' },
            { id: 'facebook', name: 'Facebook', dimensions: '1200×1200' },
            { id: 'twitter', name: 'Twitter/X', dimensions: '1200×675' },
            { id: 'linkedin', name: 'LinkedIn', dimensions: '1200×627' }
        ],
        defaultAspect: '1:1'
    },
    'story': {
        platforms: [
            { id: 'instagram', name: 'Instagram', dimensions: '1080×1920' },
            { id: 'facebook', name: 'Facebook', dimensions: '1080×1920' },
            { id: 'tiktok', name: 'TikTok', dimensions: '1080×1920' },
            { id: 'youtube', name: 'YouTube Shorts', dimensions: '1080×1920' }
        ],
        defaultAspect: '9:16'
    },
    'carousel': {
        platforms: [
            { id: 'instagram', name: 'Instagram', dimensions: '1080×1080' },
            { id: 'linkedin', name: 'LinkedIn', dimensions: '1080×1080' }
        ],
        defaultAspect: '1:1'
    },
    'pinterest': {
        platforms: [
            { id: 'pinterest', name: 'Pinterest', dimensions: '1000×1500' }
        ],
        defaultAspect: '2:3'
    },
    'thumbnail': {
        platforms: [
            { id: 'youtube', name: 'YouTube', dimensions: '1280×720' },
            { id: 'tiktok', name: 'TikTok', dimensions: '1080×1920' },
            { id: 'vimeo', name: 'Vimeo', dimensions: '1280×720' }
        ],
        defaultAspect: '16:9'
    }
};

const styleDescriptions = {
    'modern': 'Clean, contemporary design with bold typography, geometric shapes, and gradient accents',
    'minimal': 'Simple, understated design with plenty of white space, thin fonts, and subtle details',
    'bold': 'Eye-catching design with large text, vibrant colors, and strong visual impact',
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

const aspectDimensions = {
    '1:1': { width: 1080, height: 1080 },
    '4:5': { width: 1080, height: 1350 },
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 1080, height: 1920 },
    '2:3': { width: 1000, height: 1500 }
};

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const format = state.format;
    const style = state.style;
    const colorScheme = state.colorScheme;
    const aspectRatio = state.aspectRatio;
    const dimensions = aspectDimensions[aspectRatio] || aspectDimensions['1:1'];

    let prompt = `Create a professional social media graphic for ${formatDescriptions[format]}.

DESIGN STYLE: ${styleDescriptions[style]}

COLOR SCHEME: ${colorScheme === 'custom' ? `Custom brand color: ${state.customColor}` : colorDescriptions[colorScheme] || 'Auto-extract from product'}

DIMENSIONS: ${dimensions.width}×${dimensions.height}px (${aspectRatio} aspect ratio)

LAYOUT REQUIREMENTS:
- Feature the product prominently as the hero element
- ${state.style === 'minimal' ? 'Use generous white space and subtle design elements' : 'Create visual hierarchy with supporting graphics and elements'}
- Ensure text is readable and well-positioned
- Follow ${state.platform} platform best practices and safe zones`;

    if (state.headline) {
        prompt += `\n\nHEADLINE TEXT: "${state.headline}"
- Display prominently, use bold/impactful typography
- Position for maximum visibility`;
    }

    if (state.bodyText) {
        prompt += `\n\nBODY TEXT: "${state.bodyText}"
- Secondary text, smaller than headline
- Position below or near the headline`;
    }

    if (state.ctaText) {
        prompt += `\n\nCALL-TO-ACTION: "${state.ctaText}"
- Style as a button or highlighted text
- Make it stand out and clickable-looking`;
    }

    // Format-specific instructions
    if (format === 'carousel') {
        prompt += `\n\nCARUSEL SPECIFICATIONS:
- This is slide 1 of a ${state.slideCount}-slide carousel
- Content type: ${state.slideContent}
- Include visual indicators that there are more slides (dots, arrows, or swipe hints)
- Design should work as a cohesive series`;
    }

    if (format === 'story') {
        prompt += `\n\nSTORY FORMAT NOTES:
- Vertical format optimized for mobile viewing
- Consider tap zones and interactive areas
- Design for quick, impactful viewing`;
    }

    if (format === 'thumbnail') {
        prompt += `\n\nTHUMBNAIL NOTES:
- Must be eye-catching and click-worthy
- Text should be readable at small sizes
- Include visual elements that create curiosity`;
    }

    // Additional elements
    const includeElements = [];
    if (state.includeLogo) includeElements.push('space for a logo in the corner');
    if (state.includePrice) includeElements.push('a price tag or price display');
    if (state.includeBadge) includeElements.push('a promotional badge (sale, new, limited, etc.)');

    if (includeElements.length > 0) {
        prompt += `\n\nINCLUDE THESE ELEMENTS:
${includeElements.map(e => `- ${e}`).join('\n')}`;
    }

    prompt += `\n\nOUTPUT:
- High-quality, ready-to-post social media graphic
- Professional marketing quality
- Visually cohesive and on-brand
- The product should be the clear focus`;

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

// ============================================
// API CALL
// ============================================

async function generateSocialGraphic() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    showLoading();

    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    const seed = state.seed || Math.floor(Math.random() * 999999);
    state.lastSeed = seed;

    try {
        const result = await api.generateImage({
            model: DEFAULT_MODEL,
            prompt,
            images: [state.uploadedImageBase64],
            aspectRatio: state.aspectRatio,
            seed
        });

        if (!result.image) {
            throw new Error('No image was generated. The model may not support image generation.');
        }

        const imageUrl = result.image;
        state.generatedImageUrl = imageUrl;
        state.generatedImages = [imageUrl];

        hideLoading();
        showResult(imageUrl);
        await addToHistory(imageUrl, [imageUrl]);
        showSuccess('Social graphic generated successfully!');

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();
        showError(error.message || 'Failed to generate graphic');
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
    elements.loadingContainer.style.display = 'flex';
    elements.resultDisplay.style.display = 'none';
    elements.variationsGrid.style.display = 'none';
    elements.generateBtn.disabled = true;
    updateSkeletonGrid(state.variations || 1);
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
// FORMAT & PLATFORM HANDLING
// ============================================

function switchFormat(format) {
    state.format = format;

    // Update active tab
    document.querySelectorAll('.format-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.format === format);
    });

    // Update platform options
    updatePlatformOptions(format);

    // Show/hide carousel options
    if (elements.carouselSection) {
        elements.carouselSection.style.display = format === 'carousel' ? 'block' : 'none';
    }

    // Update aspect ratio based on format
    const config = platformConfigs[format];
    if (config) {
        state.aspectRatio = config.defaultAspect;
        updateAspectButtons();
    }

    // Show/hide aspect section (not needed for some formats)
    if (elements.aspectSection) {
        elements.aspectSection.style.display = ['story', 'pinterest'].includes(format) ? 'none' : 'block';
    }
}

function updatePlatformOptions(format) {
    const config = platformConfigs[format];
    if (!config || !elements.platformGrid) return;

    elements.platformGrid.innerHTML = config.platforms.map((p, i) => `
        <button type="button" class="platform-btn ${i === 0 ? 'active' : ''}" data-platform="${p.id}">
            ${p.name}
            <span class="dimension-hint">${p.dimensions}</span>
        </button>
    `).join('');

    // Set first platform as default
    if (config.platforms.length > 0) {
        state.platform = config.platforms[0].id;
    }

    // Add event listeners
    elements.platformGrid.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.platformGrid.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.platform = btn.dataset.platform;
        });
    });
}

function updateAspectButtons() {
    document.querySelectorAll('[data-aspect]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.aspect === state.aspectRatio);
    });
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
    const panel = elements.historyPanel;
    const items = await history.getAll();
    elements.historyCount.textContent = items.length;

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
    const panel = elements.favoritesPanel;
    const items = await favorites.getAll();
    elements.favoritesCount.textContent = items.length;

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
    switchFormat(state.format);
    updateAspectButtons();

    document.querySelectorAll('[data-style]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === state.style);
    });

    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === state.colorScheme);
    });

    if (elements.headline) elements.headline.value = state.headline || '';
    if (elements.bodyText) elements.bodyText.value = state.bodyText || '';
    if (elements.ctaText) elements.ctaText.value = state.ctaText || '';
    if (elements.seedInput) elements.seedInput.value = state.seed || '';

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

    elements.favoritesModalBody.innerHTML = `
        <div class="favorite-preview">
            <img src="${item.fullImage || item.thumbnail}" alt="Favorite preview">
        </div>
        <div class="favorite-details">
            <div class="detail-row">
                <span class="detail-label">Format:</span>
                <span class="detail-value">${item.settings?.format || 'post'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Platform:</span>
                <span class="detail-value">${item.settings?.platform || 'instagram'}</span>
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

    elements.favoritesModal.classList.add('visible');
}

function closeFavoritesModal() {
    elements.favoritesModal.classList.remove('visible');
    state.selectedFavorite = null;
}

// ============================================
// DOWNLOAD
// ============================================

function downloadImage() {
    const imageUrl = state.generatedImageUrl;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `social-${state.format}-${state.platform}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// EVENT LISTENERS
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
    elements.socialForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateSocialGraphic();
    });

    // Format tabs
    elements.formatTabs?.querySelectorAll('.format-tab').forEach(tab => {
        tab.addEventListener('click', () => switchFormat(tab.dataset.format));
    });

    // Aspect ratio
    document.querySelectorAll('[data-aspect]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.aspectRatio = btn.dataset.aspect;
            updateAspectButtons();
        });
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

    // Custom color
    elements.customColor?.addEventListener('input', (e) => {
        state.customColor = e.target.value;
        e.target.parentElement.querySelector('.color-swatch').style.background = e.target.value;
    });

    // Slide count
    document.querySelectorAll('[data-slides]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-slides]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.slideCount = parseInt(btn.dataset.slides);
        });
    });

    // Slide content
    document.querySelectorAll('[data-content]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-content]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.slideContent = btn.dataset.content;
        });
    });

    // Variations
    document.querySelectorAll('[data-variations]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-variations]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.variations);
        });
    });

    // Text inputs
    elements.headline?.addEventListener('input', (e) => state.headline = e.target.value);
    elements.bodyText?.addEventListener('input', (e) => state.bodyText = e.target.value);
    elements.ctaText?.addEventListener('input', (e) => state.ctaText = e.target.value);

    // Checkboxes
    elements.includeLogo?.addEventListener('change', (e) => state.includeLogo = e.target.checked);
    elements.includePrice?.addEventListener('change', (e) => state.includePrice = e.target.checked);
    elements.includeBadge?.addEventListener('change', (e) => state.includeBadge = e.target.checked);

    // Seed
    elements.seedInput?.addEventListener('input', (e) => state.seed = e.target.value);
    elements.randomizeSeed?.addEventListener('click', () => {
        const seed = Math.floor(Math.random() * 999999);
        elements.seedInput.value = seed;
        state.seed = seed;
    });

    // Upload handling
    setupUploadHandlers();

    // Advanced toggle
    SharedCollapsible.setup(elements.advancedToggle, elements.advancedSection);

    // Actions
    elements.downloadBtn?.addEventListener('click', downloadImage);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.regenerateBtn?.addEventListener('click', generateSocialGraphic);

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
        if (state.selectedFavorite && confirm('Delete this favorite?')) {
            await favorites.remove(state.selectedFavorite);
            closeFavoritesModal();
            renderFavorites();
        }
    });

    elements.closeFavoritesModal?.addEventListener('click', closeFavoritesModal);

    // Lightbox
    elements.lightboxClose?.addEventListener('click', closeLightbox);
    elements.lightbox?.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });
    elements.lightboxDownload?.addEventListener('click', () => {
        const url = elements.lightboxImage.src;
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `social-graphic-${Date.now()}.png`;
            link.click();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeFavoritesModal();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateSocialGraphic();
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            downloadImage();
        }
    });
}

function setupUploadHandlers() {
    const uploadArea = elements.uploadArea;
    const fileInput = elements.productPhoto;

    if (!uploadArea || !fileInput) return;

    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleImageUpload(file);
    });

    // Remove image
    elements.removeImage?.addEventListener('click', (e) => {
        e.stopPropagation();
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'flex';
        fileInput.value = '';
    });
}

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('Image must be less than 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        state.uploadedImage = e.target.result;
        state.uploadedImageBase64 = base64;

        elements.previewImg.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.uploadArea.style.display = 'none';

        // Auto-generate if enabled
        if (state.autoMode) {
            generateSocialGraphic();
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    initElements();

    // Theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Initialize format and platforms
    switchFormat('post');

    // Load history and favorites
    renderHistory();
    renderFavorites();

    // Setup event listeners
    setupEventListeners();

    // Setup keyboard shortcuts
    SharedKeyboard.setup({
        generate: generateSocialGraphic,
        download: downloadImage,
        escape: () => {
            closeLightbox();
            closeFavoritesModal();
        }
    });

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('social-studio');
    }
}

document.addEventListener('DOMContentLoaded', init);
