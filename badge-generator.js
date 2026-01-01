/**
 * Badge Generator - HEFAISTOS
 * Create sale and trust badges for e-commerce products
 */

// ============================================
// STATE
// ============================================

const state = {
    // Core
    apiKey: '',
    generatedImages: [],
    lastPrompt: null,
    lastSeed: null,

    // Badge settings
    category: 'sale', // 'sale' or 'trust'
    badgeText: '50% OFF',
    style: 'starburst',
    color: 'red',
    customColor: '#e53e3e',

    // Output
    size: 'medium',
    background: 'transparent',
    variations: 1,

    // Advanced
    aiModel: 'google/gemini-2.0-flash-exp:free',
    seed: null,
    customInstructions: '',

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
        badgeForm: document.getElementById('badgeForm'),

        // Category
        categoryBtns: document.querySelectorAll('.category-btn'),
        salePresets: document.getElementById('salePresets'),
        trustPresets: document.getElementById('trustPresets'),

        // Presets
        presetBtns: document.querySelectorAll('.preset-btn'),

        // Badge settings
        badgeText: document.getElementById('badgeText'),
        charCount: document.getElementById('charCount'),
        styleBtns: document.querySelectorAll('.style-btn'),
        colorBtns: document.querySelectorAll('.color-btn'),
        customColor: document.getElementById('customColor'),

        // Output options
        optionBtns: document.querySelectorAll('.option-btn'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        aiModel: document.getElementById('aiModel'),
        seed: document.getElementById('seed'),
        customInstructions: document.getElementById('customInstructions'),

        // API Settings
        settingsSection: document.getElementById('settingsSection'),
        settingsToggle: document.getElementById('settingsToggle'),
        apiKey: document.getElementById('apiKey'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        saveApiKey: document.getElementById('saveApiKey'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Result
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        resultLoading: document.getElementById('resultLoading'),
        loadingStatus: document.getElementById('loadingStatus'),
        resultContent: document.getElementById('resultContent'),
        resultImages: document.getElementById('resultImages'),
        downloadBtn: document.getElementById('downloadBtn'),
        downloadAllBtn: document.getElementById('downloadAllBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),

        // History
        historySection: document.getElementById('historySection'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),

        // Favorites
        favoritesSection: document.getElementById('favoritesSection'),
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

const styleDescriptions = {
    'starburst': 'starburst explosion badge with pointed rays radiating outward, dynamic and eye-catching promotional style',
    'ribbon': 'diagonal corner ribbon banner, elegant folded ribbon with shadow, classic sale tag style',
    'circle': 'circular badge with bold text, clean round shape with subtle border or shadow',
    'banner': 'horizontal banner ribbon with folded ends, wide rectangular shape with text centered',
    'tag': 'price tag shape with hole punch detail, retail hang tag style with string',
    'shield': 'shield emblem badge, heraldic crest style with decorative border, trust and quality symbol'
};

const colorDescriptions = {
    'red': 'vibrant red (#e53e3e)',
    'orange': 'warm orange (#ed8936)',
    'yellow': 'bright yellow (#ecc94b)',
    'green': 'fresh green (#38a169)',
    'blue': 'professional blue (#3182ce)',
    'purple': 'rich purple (#805ad5)',
    'pink': 'bold pink (#d53f8c)',
    'black': 'sleek black (#1a202c)',
    'gold': 'premium gold (#d69e2e)'
};

const sizeDescriptions = {
    'small': '256x256 pixels, compact badge',
    'medium': '512x512 pixels, standard badge',
    'large': '1024x1024 pixels, high resolution badge'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

const history = new SharedHistory('badge_generator_history', 20);
const favorites = new SharedFavorites('badge_generator_favorites', 30);
const imageStore = new ImageStore('badge_images');

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const text = state.badgeText.toUpperCase();
    const styleDesc = styleDescriptions[state.style];
    const colorName = state.color === 'custom' ? state.customColor : colorDescriptions[state.color];
    const sizeDesc = sizeDescriptions[state.size];

    let prompt = `Create a professional e-commerce ${state.style} badge with the text "${text}".

Style: ${styleDesc}
Color: Primary color is ${colorName}, with white or contrasting text for readability
Size: ${sizeDesc}
Background: ${state.background === 'transparent' ? 'Transparent/alpha background (PNG style)' : 'Clean white background'}

Requirements:
- Text must be clearly legible and prominently displayed
- Badge should look professional and high-quality
- Suitable for overlaying on product images
- Clean vector-like appearance with smooth edges
- ${state.category === 'sale' ? 'Energetic and attention-grabbing promotional feel' : 'Trustworthy and professional credibility feel'}
- 3D depth effect with subtle shadow or gradient
- No additional text or elements beyond the badge`;

    if (state.customInstructions) {
        prompt += `\n\nAdditional instructions: ${state.customInstructions}`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

// ============================================
// GENERATION
// ============================================

async function generateBadge() {
    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key');
        return;
    }

    if (!state.badgeText.trim()) {
        showError('Please enter badge text');
        return;
    }

    showLoading();
    state.generatedImages = [];

    const prompt = generatePrompt();
    state.lastPrompt = prompt;
    state.lastSeed = state.seed || Math.floor(Math.random() * 2147483647);

    try {
        const variations = state.variations;
        const promises = [];

        for (let i = 0; i < variations; i++) {
            const seed = state.lastSeed + i;
            promises.push(generateSingleBadge(prompt, seed, i + 1, variations));
        }

        const results = await Promise.all(promises);
        state.generatedImages = results.filter(r => r !== null);

        if (state.generatedImages.length > 0) {
            showResult();
            await addToHistory();
            showSuccess('Badge generated successfully!');
        } else {
            showError('Failed to generate badge. Please try again.');
            showPlaceholder();
        }
    } catch (error) {
        console.error('Generation error:', error);
        showError(error.message || 'Failed to generate badge');
        showPlaceholder();
    }
}

async function generateSingleBadge(prompt, seed, current, total) {
    updateLoadingStatus(`Generating badge ${current}/${total}...`);

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HEFAISTOS Badge Generator'
            },
            body: JSON.stringify({
                model: state.aiModel,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                seed: seed,
                provider: {
                    sort: 'throughput'
                },
                modalities: ['image', 'text']
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        const imageUrl = extractImageFromResponse(data);

        if (imageUrl) {
            return { url: imageUrl, seed: seed };
        }
        return null;
    } catch (error) {
        console.error('Single badge error:', error);
        return null;
    }
}

function extractImageFromResponse(data) {
    const message = data.choices?.[0]?.message;
    if (!message) return null;

    // Check for inline_data (Gemini format)
    if (message.content && Array.isArray(message.content)) {
        for (const part of message.content) {
            if (part.type === 'image_url' && part.image_url?.url) {
                return part.image_url.url;
            }
            if (part.inline_data?.data) {
                return `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
            }
        }
    }

    // Check for image_url in content
    if (message.image_url?.url) {
        return message.image_url.url;
    }

    // Check for base64 directly
    if (typeof message.content === 'string' && message.content.startsWith('data:image')) {
        return message.content;
    }

    return null;
}

// ============================================
// UI UPDATES
// ============================================

function showPlaceholder() {
    elements.resultPlaceholder.style.display = 'flex';
    elements.resultLoading.style.display = 'none';
    elements.resultContent.style.display = 'none';
}

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultLoading.style.display = 'flex';
    elements.resultContent.style.display = 'none';
}

function updateLoadingStatus(text) {
    elements.loadingStatus.textContent = text;
}

function showResult() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultLoading.style.display = 'none';
    elements.resultContent.style.display = 'block';

    // Clear and populate images
    elements.resultImages.innerHTML = '';

    state.generatedImages.forEach((img, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-image-wrapper';
        if (state.generatedImages.length > 1) {
            wrapper.classList.add('grid-view');
        }

        const imgEl = document.createElement('img');
        imgEl.src = img.url;
        imgEl.alt = `Generated badge ${index + 1}`;
        imgEl.className = 'result-image';
        imgEl.onclick = () => openLightbox(img.url);

        wrapper.appendChild(imgEl);
        elements.resultImages.appendChild(wrapper);
    });

    // Show/hide download all button
    elements.downloadAllBtn.style.display = state.generatedImages.length > 1 ? 'flex' : 'none';
}

function showError(message) {
    const errorEl = elements.errorMessage;
    errorEl.querySelector('.error-text').textContent = message;
    errorEl.classList.add('show');
    setTimeout(() => errorEl.classList.remove('show'), 5000);
}

function showSuccess(message) {
    const successEl = elements.successMessage;
    successEl.querySelector('.message-content').textContent = message;
    successEl.classList.add('show');
    setTimeout(() => successEl.classList.remove('show'), 3000);
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory() {
    if (state.generatedImages.length === 0) return;

    const thumbnail = state.generatedImages[0].url;
    const metadata = {
        badgeText: state.badgeText,
        category: state.category,
        style: state.style,
        color: state.color,
        seed: state.lastSeed,
        timestamp: Date.now()
    };

    await history.add(thumbnail, metadata);
    await imageStore.save(history.getAll()[0].id, state.generatedImages.map(i => i.url));
    renderHistory();
}

function renderHistory() {
    const items = history.getAll();
    elements.historyCount.textContent = items.length;
    elements.historyEmpty.style.display = items.length ? 'none' : 'flex';
    elements.historyGrid.innerHTML = '';

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.metadata?.badgeText || 'Badge'}" loading="lazy">
            <div class="history-item-overlay">
                <span class="history-item-text">${item.metadata?.badgeText || ''}</span>
            </div>
        `;
        el.onclick = () => loadFromHistory(item);
        elements.historyGrid.appendChild(el);
    });
}

async function loadFromHistory(item) {
    const images = await imageStore.get(item.id);
    if (images && images.length > 0) {
        state.generatedImages = images.map((url, i) => ({ url, seed: (item.metadata?.seed || 0) + i }));
        state.lastSeed = item.metadata?.seed;
        showResult();
    }
}

async function addToFavorites() {
    if (state.generatedImages.length === 0) return;

    const favorite = {
        thumbnail: state.generatedImages[0].url,
        images: state.generatedImages.map(i => i.url),
        settings: {
            badgeText: state.badgeText,
            category: state.category,
            style: state.style,
            color: state.color,
            customColor: state.customColor,
            size: state.size,
            background: state.background,
            customInstructions: state.customInstructions
        },
        seed: state.lastSeed,
        timestamp: Date.now()
    };

    await favorites.add(favorite);
    renderFavorites();
    showSuccess('Added to favorites!');
}

function renderFavorites() {
    const items = favorites.getAll();
    elements.favoritesCount.textContent = items.length;
    elements.favoritesEmpty.style.display = items.length ? 'none' : 'flex';
    elements.favoritesGrid.innerHTML = '';

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'favorite-item';
        el.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.name || item.settings?.badgeText || 'Badge'}" loading="lazy">
            <div class="favorite-item-overlay">
                <span class="favorite-item-name">${item.name || item.settings?.badgeText || ''}</span>
            </div>
        `;
        el.onclick = () => openFavoriteModal(item);
        elements.favoritesGrid.appendChild(el);
    });
}

function openFavoriteModal(item) {
    state.selectedFavorite = item;
    elements.favoritePreviewImg.src = item.thumbnail;
    elements.favoriteNameInput.value = item.name || item.settings?.badgeText || '';
    elements.favoriteDate.textContent = new Date(item.timestamp).toLocaleDateString();
    elements.favoriteSeedValue.textContent = item.seed || 'N/A';
    elements.favoritesModal.classList.add('show');
}

function closeFavoriteModal() {
    elements.favoritesModal.classList.remove('show');
    state.selectedFavorite = null;
}

function loadFavoriteSettings() {
    if (!state.selectedFavorite) return;

    const s = state.selectedFavorite.settings;

    // Update state
    state.badgeText = s.badgeText;
    state.category = s.category;
    state.style = s.style;
    state.color = s.color;
    state.customColor = s.customColor;
    state.size = s.size;
    state.background = s.background;
    state.customInstructions = s.customInstructions || '';
    state.seed = state.selectedFavorite.seed;

    // Update UI
    elements.badgeText.value = s.badgeText;
    elements.charCount.textContent = s.badgeText.length;
    elements.seed.value = state.selectedFavorite.seed || '';
    elements.customInstructions.value = s.customInstructions || '';

    // Update category
    elements.categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === s.category);
    });
    elements.salePresets.style.display = s.category === 'sale' ? 'block' : 'none';
    elements.trustPresets.style.display = s.category === 'trust' ? 'block' : 'none';

    // Update style
    elements.styleBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === s.style);
    });

    // Update color
    elements.colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === s.color);
    });
    if (s.color === 'custom') {
        elements.customColor.value = s.customColor;
    }

    // Update options
    elements.optionBtns.forEach(btn => {
        const option = btn.dataset.option;
        const value = btn.dataset.value;
        if (option === 'size') btn.classList.toggle('active', value === s.size);
        if (option === 'background') btn.classList.toggle('active', value === s.background);
    });

    closeFavoriteModal();
    showSuccess('Settings loaded from favorite');
}

// ============================================
// LIGHTBOX
// ============================================

function openLightbox(url) {
    elements.lightboxImage.src = url;
    elements.lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.classList.remove('show');
    document.body.style.overflow = '';
}

// ============================================
// DOWNLOAD
// ============================================

function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `badge-${state.badgeText.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function downloadCurrentImage() {
    if (state.generatedImages.length > 0) {
        downloadImage(state.generatedImages[0].url);
    }
}

async function downloadAllImages() {
    if (state.generatedImages.length === 0) return;

    if (state.generatedImages.length === 1) {
        downloadCurrentImage();
        return;
    }

    // Download each image
    for (let i = 0; i < state.generatedImages.length; i++) {
        const img = state.generatedImages[i];
        const filename = `badge-${state.badgeText.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.png`;
        downloadImage(img.url, filename);
        await new Promise(r => setTimeout(r, 500)); // Small delay between downloads
    }
}

// ============================================
// COPY PROMPT
// ============================================

function copyPrompt() {
    if (state.lastPrompt) {
        navigator.clipboard.writeText(state.lastPrompt);
        showSuccess('Prompt copied to clipboard');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Form submit
    elements.badgeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        generateBadge();
    });

    // Category toggle
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.category = btn.dataset.category;

            elements.salePresets.style.display = state.category === 'sale' ? 'block' : 'none';
            elements.trustPresets.style.display = state.category === 'trust' ? 'block' : 'none';

            // Select first preset of new category
            const presets = state.category === 'sale' ? elements.salePresets : elements.trustPresets;
            const firstPreset = presets.querySelector('.preset-btn:not([data-custom])');
            if (firstPreset) {
                presets.querySelectorAll('.preset-btn').forEach(p => p.classList.remove('active'));
                firstPreset.classList.add('active');
                state.badgeText = firstPreset.dataset.text;
                elements.badgeText.value = state.badgeText;
                elements.charCount.textContent = state.badgeText.length;
            }
        });
    });

    // Preset buttons
    elements.presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const container = btn.closest('.badge-presets');
            container.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.custom === 'true' && !btn.dataset.text) {
                elements.badgeText.focus();
            } else {
                state.badgeText = btn.dataset.text;
                elements.badgeText.value = state.badgeText;
                elements.charCount.textContent = state.badgeText.length;
            }
        });
    });

    // Badge text input
    elements.badgeText.addEventListener('input', (e) => {
        state.badgeText = e.target.value;
        elements.charCount.textContent = e.target.value.length;

        // Deselect presets when custom text entered
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    });

    // Style buttons
    elements.styleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.styleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.style = btn.dataset.style;
        });
    });

    // Color buttons
    elements.colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.color = btn.dataset.color;
        });
    });

    // Custom color
    elements.customColor.addEventListener('input', (e) => {
        state.customColor = e.target.value;
        state.color = 'custom';
        elements.colorBtns.forEach(b => b.classList.remove('active'));
        e.target.closest('.color-btn').classList.add('active');
    });

    // Option buttons
    elements.optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const option = btn.dataset.option;
            const value = btn.dataset.value;
            const group = btn.parentElement;

            group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            state[option] = option === 'variations' ? parseInt(value) : value;
        });
    });

    // Advanced toggle
    elements.advancedToggle.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
    });

    // Advanced inputs
    elements.aiModel.addEventListener('change', (e) => state.aiModel = e.target.value);
    elements.seed.addEventListener('input', (e) => state.seed = e.target.value ? parseInt(e.target.value) : null);
    elements.customInstructions.addEventListener('input', (e) => state.customInstructions = e.target.value);

    // Settings toggle
    elements.settingsToggle.addEventListener('click', () => {
        elements.settingsSection.classList.toggle('open');
    });

    // API key
    elements.toggleApiKey.addEventListener('click', () => {
        const input = elements.apiKey;
        input.type = input.type === 'password' ? 'text' : 'password';
    });

    elements.saveApiKey.addEventListener('click', () => {
        state.apiKey = elements.apiKey.value;
        localStorage.setItem('openrouter_api_key', state.apiKey);
        showSuccess('API key saved');
    });

    // Generate button
    elements.generateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        generateBadge();
    });

    // Result actions
    elements.downloadBtn.addEventListener('click', downloadCurrentImage);
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);
    elements.copyPromptBtn.addEventListener('click', copyPrompt);
    elements.favoriteBtn.addEventListener('click', addToFavorites);

    // History & Favorites
    elements.clearHistoryBtn.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
            renderHistory();
        }
    });

    elements.clearFavoritesBtn.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all favorites? This cannot be undone.', { title: 'Clear Favorites', confirmText: 'Clear All', icon: 'warning' })) {
            await favorites.clear();
            renderFavorites();
        }
    });

    // Lightbox
    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightbox.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });
    elements.lightboxDownload.addEventListener('click', () => {
        downloadImage(elements.lightboxImage.src);
    });

    // Favorites modal
    elements.closeFavoritesModal.addEventListener('click', closeFavoriteModal);
    elements.favoritesModal.querySelector('.modal-backdrop').addEventListener('click', closeFavoriteModal);
    elements.loadFavoriteBtn.addEventListener('click', loadFavoriteSettings);
    elements.downloadFavoriteBtn.addEventListener('click', () => {
        if (state.selectedFavorite) {
            downloadImage(state.selectedFavorite.thumbnail);
        }
    });
    elements.deleteFavoriteBtn.addEventListener('click', async () => {
        if (state.selectedFavorite && confirm('Delete this favorite?')) {
            await favorites.remove(state.selectedFavorite.id);
            renderFavorites();
            closeFavoriteModal();
        }
    });
    elements.copyFavoriteSeed.addEventListener('click', () => {
        if (state.selectedFavorite?.seed) {
            navigator.clipboard.writeText(String(state.selectedFavorite.seed));
            showSuccess('Seed copied');
        }
    });
    elements.favoriteNameInput.addEventListener('change', () => {
        if (state.selectedFavorite) {
            favorites.update(state.selectedFavorite.id, { name: elements.favoriteNameInput.value });
            renderFavorites();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateBadge();
        }
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            downloadCurrentImage();
        }
        if (e.key === 'Escape') {
            closeLightbox();
            closeFavoriteModal();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    initElements();

    // Load API key
    state.apiKey = localStorage.getItem('openrouter_api_key') || '';
    elements.apiKey.value = state.apiKey;

    // Initialize stores
    await imageStore.init();
    history.setImageStore(imageStore);

    // Header is pre-rendered in HTML to prevent flash
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }


    // Render initial state
    elements.badgeText.value = state.badgeText;
    elements.charCount.textContent = state.badgeText.length;

    renderHistory();
    renderFavorites();
    setupEventListeners();
}

// Start
document.addEventListener('DOMContentLoaded', init);
