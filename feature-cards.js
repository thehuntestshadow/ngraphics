/**
 * Feature Cards - HEFAISTOS
 * Generate individual feature cards for product listing galleries
 */

const STUDIO_ID = 'feature-cards';

// ============================================
// STATE
// ============================================
const state = {
    cardType: 'feature',
    style: 'modern',
    color: '#6366f1',
    size: 'medium',
    background: 'white',
    variations: 1,
    productImage: null,
    autoMode: true,
    seed: null,
    negativePrompt: '',
    model: 'google/gemini-2.0-flash-exp:free',

    // Feature card content
    featureIcon: '',
    featureHeadline: '',
    featureDescription: '',

    // Spec card content
    specs: [{ label: '', value: '' }],

    // In box content
    inboxTitle: "What's in the Box",
    inboxItems: [''],

    // How-to content
    howtoStep: 1,
    howtoTitle: '',
    howtoDescription: '',

    // Before/After content
    beforeLabel: 'Before',
    beforeDesc: '',
    afterLabel: 'After',
    afterDesc: '',

    // Generated
    generatedImages: [],
    lastPrompt: ''
};

// ============================================
// DESCRIPTION MAPS
// ============================================
const cardTypeDescriptions = {
    feature: 'feature spotlight card with prominent icon, bold headline text, and supporting description. The icon should be large and visually striking, centered or placed prominently.',
    spec: 'technical specification card displaying product specifications in a clean, organized format with labels and values aligned professionally.',
    inbox: 'package contents card showing what items are included in the box, with checkmarks or icons next to each item in a list format.',
    howto: 'step instruction card with a large step number in a circle, step title, and clear instruction text for how-to guides.',
    beforeafter: 'before and after comparison card split vertically showing transformation, with clear labels and contrasting sides.'
};

const styleDescriptions = {
    modern: 'modern, clean design with subtle shadows, rounded corners, and contemporary typography. Uses whitespace effectively.',
    minimal: 'minimalist design with maximum whitespace, thin lines, and restrained use of color. Typography-focused.',
    bold: 'bold, high-contrast design with strong colors, thick borders, and impactful typography. Eye-catching and energetic.',
    elegant: 'elegant, sophisticated design with serif accents, subtle gradients, and refined color palette. Premium feel.',
    playful: 'playful, friendly design with rounded shapes, bright colors, and fun typography. Approachable and casual.'
};

const backgroundDescriptions = {
    white: 'pure white background (#FFFFFF) for clean e-commerce ready images',
    light: 'light gray background (#F8FAFC) with subtle warmth',
    dark: 'dark background (#1E293B) with light text for contrast'
};

const sizeMap = {
    small: '400x400',
    medium: '600x600',
    large: '800x800'
};

// ============================================
// ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Card type
        cardTypeGrid: document.getElementById('cardTypeGrid'),

        // Card options panels
        featureOptions: document.getElementById('featureOptions'),
        specOptions: document.getElementById('specOptions'),
        inboxOptions: document.getElementById('inboxOptions'),
        howtoOptions: document.getElementById('howtoOptions'),
        beforeafterOptions: document.getElementById('beforeafterOptions'),

        // Feature inputs
        featureIcon: document.getElementById('featureIcon'),
        featureHeadline: document.getElementById('featureHeadline'),
        featureDescription: document.getElementById('featureDescription'),

        // Spec inputs
        specList: document.getElementById('specList'),
        addSpecBtn: document.getElementById('addSpecBtn'),

        // Inbox inputs
        inboxTitle: document.getElementById('inboxTitle'),
        inboxList: document.getElementById('inboxList'),
        addInboxBtn: document.getElementById('addInboxBtn'),

        // How-to inputs
        howtoStep: document.getElementById('howtoStep'),
        howtoTitle: document.getElementById('howtoTitle'),
        howtoDescription: document.getElementById('howtoDescription'),

        // Before/after inputs
        beforeLabel: document.getElementById('beforeLabel'),
        beforeDesc: document.getElementById('beforeDesc'),
        afterLabel: document.getElementById('afterLabel'),
        afterDesc: document.getElementById('afterDesc'),

        // Style & color
        styleOptions: document.getElementById('styleOptions'),
        colorGrid: document.getElementById('colorGrid'),
        customColor: document.getElementById('customColor'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        uploadPlaceholder: document.getElementById('uploadPlaceholder'),
        uploadPreview: document.getElementById('uploadPreview'),
        previewImage: document.getElementById('previewImage'),
        removeImage: document.getElementById('removeImage'),
        fileInput: document.getElementById('fileInput'),
        autoModeToggle: document.getElementById('autoModeToggle'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedSection: document.getElementById('advancedSection'),
        seedInput: document.getElementById('seedInput'),
        randomSeedBtn: document.getElementById('randomSeedBtn'),
        negativePrompt: document.getElementById('negativePrompt'),
        aiModel: document.getElementById('aiModel'),

        // API
        apiKey: document.getElementById('apiKey'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        apiStatus: document.getElementById('apiStatus'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Result
        resultContainer: document.getElementById('resultContainer'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        resultLoading: document.getElementById('resultLoading'),
        loadingStatus: document.getElementById('loadingStatus'),
        resultImages: document.getElementById('resultImages'),
        resultActions: document.getElementById('resultActions'),

        // Result actions
        downloadBtn: document.getElementById('downloadBtn'),
        downloadZipBtn: document.getElementById('downloadZipBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),

        // History & Favorites
        historyPanel: document.getElementById('historyPanel'),
        historyGrid: document.getElementById('historyGrid'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        favoritesPanel: document.getElementById('favoritesPanel'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        viewFavoritesBtn: document.getElementById('viewFavoritesBtn'),
        favoritesModal: document.getElementById('favoritesModal'),
        favoritesModalGrid: document.getElementById('favoritesModalGrid'),
        closeFavoritesModal: document.getElementById('closeFavoritesModal'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxDownload: document.getElementById('lightboxDownload'),
        lightboxFavorite: document.getElementById('lightboxFavorite')
    };
}

// ============================================
// HISTORY & FAVORITES
// ============================================
const imageStore = new ImageStore('feature_cards_images');
const history = new SharedHistory('feature_cards_history', 20);
const favorites = new SharedFavorites('feature_cards_favorites', 30);

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const cardTypeDesc = cardTypeDescriptions[state.cardType];
    const styleDesc = styleDescriptions[state.style];
    const bgDesc = backgroundDescriptions[state.background];
    const dimensions = sizeMap[state.size];

    let contentDesc = '';

    switch (state.cardType) {
        case 'feature':
            contentDesc = `
Icon concept: "${state.featureIcon || 'relevant icon'}"
Headline text: "${state.featureHeadline || 'Feature Headline'}"
Description: "${state.featureDescription || 'Supporting description text'}"
The icon should be large, visually prominent, and represent the concept. The headline should be bold and eye-catching.`;
            break;

        case 'spec':
            const specItems = state.specs.filter(s => s.label || s.value);
            const specText = specItems.length > 0
                ? specItems.map(s => `${s.label}: ${s.value}`).join('\n')
                : 'Weight: 2.5 lbs\nDimensions: 10" x 8" x 4"\nMaterial: Premium aluminum';
            contentDesc = `
Specifications to display:
${specText}
Each specification should have the label on the left and value on the right, with clear visual hierarchy.`;
            break;

        case 'inbox':
            const items = state.inboxItems.filter(i => i.trim());
            const itemText = items.length > 0
                ? items.map(i => `• ${i}`).join('\n')
                : '• 1x Main Device\n• 1x USB-C Cable\n• 1x Quick Start Guide\n• 1x Carrying Pouch';
            contentDesc = `
Title: "${state.inboxTitle}"
Items included:
${itemText}
Each item should have a checkmark or icon next to it. The layout should be clean and organized.`;
            break;

        case 'howto':
            contentDesc = `
Step number: ${state.howtoStep}
Step title: "${state.howtoTitle || 'Step Title'}"
Instruction: "${state.howtoDescription || 'Step instruction details'}"
The step number should be large and prominent (in a circle), with the title bold and the instruction below.`;
            break;

        case 'beforeafter':
            contentDesc = `
Left side labeled: "${state.beforeLabel}"
Left description: "${state.beforeDesc || 'Before state description'}"
Right side labeled: "${state.afterLabel}"
Right description: "${state.afterDesc || 'After state description'}"
Split the card vertically with clear contrast between the two sides. Use visual indicators like arrows or dividing line.`;
            break;
    }

    let prompt = `Create a professional ${cardTypeDesc}

CONTENT:
${contentDesc}

STYLE:
${styleDesc}
Primary accent color: ${state.color}
${bgDesc}

REQUIREMENTS:
- Single card graphic, ${dimensions} pixels
- High quality, e-commerce ready
- Text must be sharp and readable
- Icon/graphics should be vector-style clean
- Professional typography
- Balanced composition with proper spacing`;

    if (state.productImage) {
        prompt += '\n\nIncorporate the uploaded product image naturally into the card design.';
    }

    if (state.negativePrompt) {
        prompt += `\n\nAVOID: ${state.negativePrompt}`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

// ============================================
// GENERATION
// ============================================
async function generateCard() {
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
        SharedUI.showError('Please enter your OpenRouter API key');
        return;
    }

    // Validate content based on card type
    if (!validateContent()) {
        return;
    }

    // Show loading
    elements.resultPlaceholder.classList.add('hidden');
    elements.resultImages.classList.add('hidden');
    elements.resultActions.classList.add('hidden');
    elements.resultLoading.classList.remove('hidden');
    elements.generateBtn.disabled = true;

    const loadingMessages = [
        'Generating your card...',
        'Designing the layout...',
        'Adding visual elements...',
        'Refining typography...',
        'Finalizing design...'
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        elements.loadingStatus.textContent = loadingMessages[messageIndex];
    }, 2500);

    try {
        const prompt = generatePrompt();
        state.lastPrompt = prompt;

        const variations = state.variations;
        const promises = [];

        for (let i = 0; i < variations; i++) {
            const seed = state.seed ? state.seed + i : Math.floor(Math.random() * 999999);
            promises.push(generateSingleCard(apiKey, prompt, seed));
        }

        const results = await Promise.all(promises);
        const successfulImages = results.filter(r => r !== null);

        if (successfulImages.length === 0) {
            throw new Error('All generation attempts failed');
        }

        state.generatedImages = successfulImages;
        displayResults(successfulImages);

        // Add to history
        await history.add(successfulImages[0].imageUrl, {
            imageUrls: successfulImages.map(r => r.imageUrl),
            title: getCardTitle(),
            prompt: prompt,
            seed: successfulImages[0].seed,
            settings: {
                cardType: state.cardType,
                style: state.style,
                color: state.color
            }
        });
        renderHistory();

    } catch (error) {
        console.error('Generation failed:', error);
        SharedUI.showError(error.message || 'Failed to generate card');
        elements.resultPlaceholder.classList.remove('hidden');
    } finally {
        clearInterval(messageInterval);
        elements.resultLoading.classList.add('hidden');
        elements.generateBtn.disabled = false;
    }
}

async function generateSingleCard(apiKey, prompt, seed) {
    try {
        const messages = [{
            role: 'user',
            content: state.productImage
                ? [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: state.productImage } }
                ]
                : prompt
        }];

        const body = {
            model: state.model,
            messages: messages,
            max_tokens: 4096,
            seed: seed
        };

        // Add image modality for Gemini
        if (state.model.includes('gemini')) {
            body.modalities = ['image', 'text'];
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HEFAISTOS Feature Cards'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API request failed');
        }

        const data = await response.json();
        const imageUrl = SharedRequest.extractImageFromResponse(data);

        if (!imageUrl) {
            throw new Error('No image in response');
        }

        return { imageUrl, seed };

    } catch (error) {
        console.error('Single generation failed:', error);
        return null;
    }
}

function validateContent() {
    switch (state.cardType) {
        case 'feature':
            if (!state.featureHeadline.trim()) {
                SharedUI.showError('Please enter a headline for the feature card');
                return false;
            }
            break;
        case 'spec':
            const validSpecs = state.specs.filter(s => s.label.trim() && s.value.trim());
            if (validSpecs.length === 0) {
                SharedUI.showError('Please add at least one specification with label and value');
                return false;
            }
            break;
        case 'inbox':
            const validItems = state.inboxItems.filter(i => i.trim());
            if (validItems.length === 0) {
                SharedUI.showError('Please add at least one item to the box contents');
                return false;
            }
            break;
        case 'howto':
            if (!state.howtoTitle.trim()) {
                SharedUI.showError('Please enter a step title');
                return false;
            }
            break;
        case 'beforeafter':
            if (!state.beforeDesc.trim() && !state.afterDesc.trim()) {
                SharedUI.showError('Please enter before and/or after descriptions');
                return false;
            }
            break;
    }
    return true;
}

function getCardTitle() {
    switch (state.cardType) {
        case 'feature':
            return state.featureHeadline || 'Feature Card';
        case 'spec':
            return 'Specifications';
        case 'inbox':
            return state.inboxTitle || "What's in the Box";
        case 'howto':
            return `Step ${state.howtoStep}: ${state.howtoTitle || 'How-To'}`;
        case 'beforeafter':
            return `${state.beforeLabel} / ${state.afterLabel}`;
        default:
            return 'Feature Card';
    }
}

function displayResults(images) {
    elements.resultImages.innerHTML = '';

    images.forEach((result, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-image-wrapper' + (images.length > 1 ? ' grid-view' : '');

        const img = document.createElement('img');
        img.className = 'result-image';
        img.src = result.imageUrl;
        img.alt = `Generated card ${index + 1}`;
        img.onclick = () => openLightbox(result.imageUrl);

        wrapper.appendChild(img);
        elements.resultImages.appendChild(wrapper);
    });

    elements.resultImages.classList.remove('hidden');
    elements.resultActions.classList.remove('hidden');
}

// ============================================
// UI UPDATES
// ============================================
function updateCardType(type) {
    state.cardType = type;

    // Update active button
    elements.cardTypeGrid.querySelectorAll('.card-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Show/hide relevant options
    const optionPanels = ['feature', 'spec', 'inbox', 'howto', 'beforeafter'];
    optionPanels.forEach(panel => {
        const el = elements[`${panel}Options`];
        if (el) {
            el.classList.toggle('hidden', panel !== type);
        }
    });
}

function updateStyle(style) {
    state.style = style;
    elements.styleOptions.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === style);
    });
}

function updateColor(color) {
    state.color = color;
    elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

function addSpecRow() {
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
        <input type="text" class="text-input spec-label" placeholder="Label">
        <input type="text" class="text-input spec-value" placeholder="Value">
        <button class="btn-icon-small btn-remove-spec" title="Remove">×</button>
    `;

    row.querySelector('.btn-remove-spec').onclick = () => {
        row.remove();
        updateSpecsFromDOM();
    };

    row.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateSpecsFromDOM);
    });

    elements.specList.appendChild(row);
    state.specs.push({ label: '', value: '' });
}

function updateSpecsFromDOM() {
    const rows = elements.specList.querySelectorAll('.spec-row');
    state.specs = Array.from(rows).map(row => ({
        label: row.querySelector('.spec-label').value,
        value: row.querySelector('.spec-value').value
    }));
}

function addInboxRow() {
    const row = document.createElement('div');
    row.className = 'inbox-row';
    row.innerHTML = `
        <input type="text" class="text-input inbox-item" placeholder="Item">
        <button class="btn-icon-small btn-remove-inbox" title="Remove">×</button>
    `;

    row.querySelector('.btn-remove-inbox').onclick = () => {
        row.remove();
        updateInboxFromDOM();
    };

    row.querySelector('input').addEventListener('input', updateInboxFromDOM);

    elements.inboxList.appendChild(row);
    state.inboxItems.push('');
}

function updateInboxFromDOM() {
    const rows = elements.inboxList.querySelectorAll('.inbox-row');
    state.inboxItems = Array.from(rows).map(row =>
        row.querySelector('.inbox-item').value
    );
}

// ============================================
// HISTORY & FAVORITES
// ============================================
function renderHistory() {
    const panel = elements.historyPanel;
    const items = history.getAll();

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.historyGrid.innerHTML = '<div class="history-empty" style="display: none;">No cards generated yet</div>';
        return;
    }

    panel.classList.add('has-items');
    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.title || 'Card'}" loading="lazy">
            <div class="history-item-overlay">
                <span class="history-item-text">${item.title || 'Card'}</span>
            </div>
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(el => {
        el.onclick = async () => {
            const id = parseInt(el.dataset.id);
            const images = await history.getImages(id);
            if (images?.imageUrl) {
                openLightbox(images.imageUrl);
            }
        };
    });
}

function renderFavorites() {
    const panel = elements.favoritesPanel;
    const items = favorites.getAll();

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.favoritesGrid.innerHTML = '<div class="favorites-empty" style="display: none;">No favorites saved</div>';
        return;
    }

    panel.classList.add('has-items');
    elements.favoritesGrid.innerHTML = items.slice(0, 6).map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.name || 'Favorite'}" loading="lazy">
            <div class="favorite-item-overlay">
                <span class="favorite-item-name">${item.name || 'Favorite'}</span>
            </div>
        </div>
    `).join('');

    elements.favoritesGrid.querySelectorAll('.favorite-item').forEach(el => {
        el.onclick = async () => {
            const id = parseInt(el.dataset.id);
            const favorite = favorites.findById(id);
            if (favorite) {
                await loadFavorite(favorite);
            }
        };
    });
}

async function loadFavorite(favorite) {
    // Restore settings
    if (favorite.settings) {
        state.cardType = favorite.settings.cardType || 'feature';
        state.style = favorite.settings.style || 'modern';
        state.color = favorite.settings.color || '#6366f1';

        updateCardType(state.cardType);
        updateStyle(state.style);
        updateColor(state.color);
    }

    // Load image
    const images = await favorites.getImages(favorite.id);
    if (images?.imageUrl) {
        openLightbox(images.imageUrl);
    }

    SharedUI.showSuccess('Favorite loaded');
}

async function addToFavorites() {
    if (state.generatedImages.length === 0) {
        SharedUI.showError('No card to save');
        return;
    }

    const name = getCardTitle();

    await favorites.add({
        name,
        thumbnail: state.generatedImages[0].imageUrl,
        imageUrl: state.generatedImages[0].imageUrl,
        imageUrls: state.generatedImages.map(r => r.imageUrl),
        seed: state.generatedImages[0].seed,
        prompt: state.lastPrompt,
        settings: {
            cardType: state.cardType,
            style: state.style,
            color: state.color
        }
    });

    renderFavorites();
    SharedUI.showSuccess('Added to favorites');
}

// ============================================
// LIGHTBOX
// ============================================
function openLightbox(imageUrl) {
    elements.lightboxImage.src = imageUrl;
    elements.lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================
// UPLOAD HANDLING
// ============================================
function setupUpload() {
    const area = elements.uploadArea;
    const input = elements.fileInput;

    area.onclick = () => input.click();

    area.ondragover = (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
    };

    area.ondragleave = () => {
        area.classList.remove('drag-over');
    };

    area.ondrop = (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    input.onchange = () => {
        if (input.files[0]) handleFile(input.files[0]);
    };

    elements.removeImage.onclick = (e) => {
        e.stopPropagation();
        state.productImage = null;
        elements.uploadPreview.classList.add('hidden');
        elements.uploadPlaceholder.classList.remove('hidden');
        input.value = '';
    };
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        SharedUI.showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.productImage = e.target.result;
        elements.previewImage.src = e.target.result;
        elements.uploadPlaceholder.classList.add('hidden');
        elements.uploadPreview.classList.remove('hidden');
        if (state.autoMode) {
            generateCard();
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// API STATUS
// ============================================
function updateApiStatus() {
    const apiKey = elements.apiKey.value.trim();

    if (apiKey) {
        localStorage.setItem('openrouter_api_key', apiKey);
        elements.apiStatus.classList.add('connected');
        elements.apiStatus.classList.remove('error');
        elements.apiStatus.querySelector('.status-text').textContent = 'Connected';
    } else {
        elements.apiStatus.classList.remove('connected');
        elements.apiStatus.querySelector('.status-text').textContent = 'Not connected';
    }
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

    // Card type selection
    elements.cardTypeGrid.querySelectorAll('.card-type-btn').forEach(btn => {
        btn.onclick = () => updateCardType(btn.dataset.type);
    });

    // Style selection
    elements.styleOptions.querySelectorAll('.style-btn').forEach(btn => {
        btn.onclick = () => updateStyle(btn.dataset.style);
    });

    // Color selection
    elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => {
        if (!btn.classList.contains('color-btn-custom')) {
            btn.onclick = () => updateColor(btn.dataset.color);
        }
    });

    elements.customColor.onchange = () => {
        const color = elements.customColor.value;
        state.color = color;
        elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        elements.customColor.parentElement.classList.add('active');
    };

    // Output options
    document.querySelectorAll('[data-size]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-size]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.size = btn.dataset.size;
        };
    });

    document.querySelectorAll('[data-bg]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-bg]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.background = btn.dataset.bg;
        };
    });

    document.querySelectorAll('[data-variations]').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('[data-variations]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.variations);
        };
    });

    // Feature inputs
    elements.featureIcon.oninput = () => state.featureIcon = elements.featureIcon.value;
    elements.featureHeadline.oninput = () => state.featureHeadline = elements.featureHeadline.value;
    elements.featureDescription.oninput = () => state.featureDescription = elements.featureDescription.value;

    // Spec list
    elements.addSpecBtn.onclick = addSpecRow;
    elements.specList.querySelectorAll('.spec-row').forEach(row => {
        row.querySelector('.btn-remove-spec').onclick = () => {
            if (elements.specList.querySelectorAll('.spec-row').length > 1) {
                row.remove();
                updateSpecsFromDOM();
            }
        };
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updateSpecsFromDOM);
        });
    });

    // Inbox list
    elements.addInboxBtn.onclick = addInboxRow;
    elements.inboxTitle.oninput = () => state.inboxTitle = elements.inboxTitle.value;
    elements.inboxList.querySelectorAll('.inbox-row').forEach(row => {
        row.querySelector('.btn-remove-inbox').onclick = () => {
            if (elements.inboxList.querySelectorAll('.inbox-row').length > 1) {
                row.remove();
                updateInboxFromDOM();
            }
        };
        row.querySelector('input').addEventListener('input', updateInboxFromDOM);
    });

    // How-to inputs
    elements.howtoStep.oninput = () => state.howtoStep = parseInt(elements.howtoStep.value) || 1;
    elements.howtoTitle.oninput = () => state.howtoTitle = elements.howtoTitle.value;
    elements.howtoDescription.oninput = () => state.howtoDescription = elements.howtoDescription.value;

    // Before/after inputs
    elements.beforeLabel.oninput = () => state.beforeLabel = elements.beforeLabel.value;
    elements.beforeDesc.oninput = () => state.beforeDesc = elements.beforeDesc.value;
    elements.afterLabel.oninput = () => state.afterLabel = elements.afterLabel.value;
    elements.afterDesc.oninput = () => state.afterDesc = elements.afterDesc.value;

    // Advanced toggle
    elements.advancedToggle.onclick = () => {
        elements.advancedSection.classList.toggle('hidden');
        elements.advancedToggle.classList.toggle('active');
    };

    // Seed
    elements.randomSeedBtn.onclick = () => {
        elements.seedInput.value = Math.floor(Math.random() * 999999);
        state.seed = parseInt(elements.seedInput.value);
    };
    elements.seedInput.oninput = () => {
        state.seed = elements.seedInput.value ? parseInt(elements.seedInput.value) : null;
    };

    // Negative prompt
    elements.negativePrompt.oninput = () => state.negativePrompt = elements.negativePrompt.value;

    // Model
    elements.aiModel.onchange = () => state.model = elements.aiModel.value;

    // API key
    elements.apiKey.oninput = updateApiStatus;
    elements.toggleApiKey.onclick = () => {
        const type = elements.apiKey.type === 'password' ? 'text' : 'password';
        elements.apiKey.type = type;
    };

    // Generate
    elements.generateBtn.onclick = generateCard;

    // Result actions
    elements.downloadBtn.onclick = () => {
        if (state.generatedImages.length > 0) {
            SharedDownload.downloadImage(state.generatedImages[0].imageUrl, 'feature-card');
        }
    };

    elements.downloadZipBtn.onclick = async () => {
        if (state.generatedImages.length > 0) {
            await SharedZip.downloadAsZip(
                state.generatedImages.map(r => r.imageUrl),
                'feature-cards',
                { prompt: state.lastPrompt, settings: { cardType: state.cardType, style: state.style } }
            );
        }
    };

    elements.copyPromptBtn.onclick = () => {
        if (state.lastPrompt) {
            SharedClipboard.copy(state.lastPrompt);
            SharedUI.showSuccess('Prompt copied to clipboard');
        }
    };

    elements.favoriteBtn.onclick = addToFavorites;

    // History
    elements.clearHistoryBtn.onclick = async () => {
        if (await SharedConfirm.show('Clear all history?')) {
            await history.clear();
            renderHistory();
        }
    };

    // Favorites modal
    elements.viewFavoritesBtn.onclick = () => {
        renderFavoritesModal();
        elements.favoritesModal.classList.remove('hidden');
    };

    elements.closeFavoritesModal.onclick = () => {
        elements.favoritesModal.classList.add('hidden');
    };

    elements.favoritesModal.querySelector('.modal-overlay').onclick = () => {
        elements.favoritesModal.classList.add('hidden');
    };

    // Lightbox
    elements.lightboxClose.onclick = closeLightbox;
    elements.lightbox.onclick = (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    };

    elements.lightboxDownload.onclick = () => {
        SharedDownload.downloadImage(elements.lightboxImage.src, 'feature-card');
    };

    elements.lightboxFavorite.onclick = addToFavorites;

    // Keyboard shortcuts
    SharedKeyboard.setup({
        generate: generateCard,
        download: () => elements.downloadBtn.click(),
        escape: () => {
            closeLightbox();
            elements.favoritesModal.classList.add('hidden');
        }
    });
}

function renderFavoritesModal() {
    const items = favorites.getAll();

    if (items.length === 0) {
        elements.favoritesModalGrid.innerHTML = '<div class="favorites-empty">No favorites saved yet</div>';
        return;
    }

    elements.favoritesModalGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.name || 'Favorite'}">
            <div class="favorite-item-overlay">
                <span class="favorite-item-name">${item.name || 'Favorite'}</span>
            </div>
        </div>
    `).join('');

    elements.favoritesModalGrid.querySelectorAll('.favorite-item').forEach(el => {
        el.onclick = async () => {
            const id = parseInt(el.dataset.id);
            const favorite = favorites.findById(id);
            if (favorite) {
                await loadFavorite(favorite);
                elements.favoritesModal.classList.add('hidden');
            }
        };
    });
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    initElements();

    // Initialize storage
    await imageStore.init();
    history.setImageStore(imageStore);
    favorites.setImageStore(imageStore);
    history.load();
    favorites.load();

    // Header is pre-rendered in HTML to prevent flash
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }


    // Load API key
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
        elements.apiKey.value = savedKey;
        updateApiStatus();
    }

    // Setup
    setupUpload();
    setupEventListeners();

    // Render history & favorites
    renderHistory();
    renderFavorites();

    // Setup lightbox
    SharedLightbox.setup();

    // Initialize theme
    SharedTheme.init();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('feature-cards');
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
