/* ============================================
   COPYWRITER - AI Marketing Copy Generator
   ============================================ */

const DEFAULT_MODEL = 'google/gemini-3-pro-image-preview';

const STUDIO_ID = 'copywriter';

// ============================================
// STATE
// ============================================
const state = {
    // Core
    language: localStorage.getItem('copywriter_language') || 'en',

    // Product Images
    productImages: [], // [{ id, base64, thumbnail, file }]
    maxImages: 4,

    // Product Info
    productTitle: '',
    productCategory: '',
    features: [], // [{ id, text, starred }]
    benefits: [], // [{ id, text }]

    // Copy Settings
    copyTone: 'professional',
    includeEmoji: true,
    includeHashtags: true,

    // Generated Copy
    generatedCopy: null,

    // State flags
    isAnalyzing: false,
    isGenerating: false,
    lastPrompt: ''
};

// ============================================
// ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Form
        form: document.getElementById('copywriterForm'),
        uploadArea: document.getElementById('uploadArea'),
        productPhotos: document.getElementById('productPhotos'),
        imagePreviews: document.getElementById('imagePreviews'),
        imageCount: document.getElementById('imageCount'),
        productTitle: document.getElementById('productTitle'),
        productCategory: document.getElementById('productCategory'),
        featuresList: document.getElementById('featuresList'),
        benefitsList: document.getElementById('benefitsList'),
        addFeatureBtn: document.getElementById('addFeatureBtn'),
        addBenefitBtn: document.getElementById('addBenefitBtn'),
        includeEmoji: document.getElementById('includeEmoji'),
        includeHashtags: document.getElementById('includeHashtags'),
        generateBtn: document.getElementById('generateBtn'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Output
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingText: document.getElementById('loadingText'),
        loadingStatus: document.getElementById('loadingStatus'),
        resultContainer: document.getElementById('resultContainer'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        copyEverything: document.getElementById('copyEverything'),

        // Tabs
        outputTabs: document.querySelectorAll('.output-tab'),
        tabContents: document.querySelectorAll('.tab-content'),

        // History & Favorites
        historyPanel: document.getElementById('historyPanel'),
        historyList: document.getElementById('historyList'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        favoritesPanel: document.getElementById('favoritesPanel'),
        favoritesList: document.getElementById('favoritesList'),
        favoritesCount: document.getElementById('favoritesCount'),
        favoritesEmpty: document.getElementById('favoritesEmpty'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn')
    };
}

// ============================================
// HISTORY & FAVORITES
// ============================================
const imageStore = new ImageStore('copywriter_images');
const history = new SharedHistory('copywriter_history', 20);
const favorites = new SharedFavorites('copywriter_favorites', 50);

// ============================================
// TONE DESCRIPTIONS
// ============================================
const toneDescriptions = {
    professional: 'Clear, authoritative, trustworthy business tone',
    casual: 'Friendly, conversational, approachable tone',
    enthusiastic: 'Energetic, exciting, dynamic tone with excitement',
    luxury: 'Elegant, sophisticated, premium tone'
};

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
        download: null
    });

    // Setup upload area
    setupUploadArea();

    // Initial feature/benefit
    addFeature('', false);
    addBenefit('');

    // Update language toggle
    updateLanguageUI();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('copywriter');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateCopy();
    });

    // Add feature/benefit buttons
    elements.addFeatureBtn.addEventListener('click', () => addFeature('', false));
    elements.addBenefitBtn.addEventListener('click', () => addBenefit(''));

    // Tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.copyTone = btn.dataset.tone;
        });
    });

    // Checkboxes
    elements.includeEmoji.addEventListener('change', (e) => {
        state.includeEmoji = e.target.checked;
    });
    elements.includeHashtags.addEventListener('change', (e) => {
        state.includeHashtags = e.target.checked;
    });

    // AI Model
    elements.aiModel.addEventListener('change', (e) => {
        state.aiModel = e.target.value;
    });

    // Output tabs
    elements.outputTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Copy buttons
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => copyField(btn.dataset.field));
    });

    document.getElementById('copyAllEcommerce').addEventListener('click', () => copySection('ecommerce'));
    document.getElementById('copyAllSeo').addEventListener('click', () => copySection('seo'));
    document.getElementById('copyAllSocial').addEventListener('click', () => copySection('social'));
    document.getElementById('copyAllEmail').addEventListener('click', () => copySection('email'));
    document.getElementById('copyAllNaming').addEventListener('click', () => copySection('naming'));
    document.getElementById('copyAllReviews').addEventListener('click', () => copySection('reviews'));
    document.getElementById('copyAllExtras').addEventListener('click', () => copySection('extras'));
    elements.copyEverything.addEventListener('click', copyEverything);

    // Result actions
    elements.regenerateBtn.addEventListener('click', generateCopy);
    elements.favoriteBtn.addEventListener('click', saveToFavorites);

    // History & Favorites
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    elements.clearFavoritesBtn.addEventListener('click', clearFavorites);

    // API Key
    elements.toggleApiKey.addEventListener('click', () => {
        const type = elements.apiKey.type === 'password' ? 'text' : 'password';
        elements.apiKey.type = type;
    });

    elements.saveApiKey.addEventListener('click', () => {
        state.apiKey = elements.apiKey.value.trim();
        localStorage.setItem('openrouter_api_key', state.apiKey);
        api.apiKey = state.apiKey;
        showSuccess('API key saved');
    });

    // Language toggle (from header)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.lang-btn')) {
            const lang = e.target.closest('.lang-btn').dataset.lang;
            if (lang) {
                state.language = lang;
                localStorage.setItem('copywriter_language', lang);
                updateLanguageUI();
            }
        }
    });
}

// ============================================
// UPLOAD HANDLING
// ============================================
function setupUploadArea() {
    const uploadArea = elements.uploadArea;
    const input = elements.productPhotos;

    // Click to upload
    uploadArea.addEventListener('click', () => input.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        handleFiles(files);
    });

    // File input change
    input.addEventListener('change', (e) => {
        handleFiles(Array.from(e.target.files));
        input.value = '';
    });
}

async function handleFiles(files) {
    const remaining = state.maxImages - state.productImages.length;
    const toAdd = files.slice(0, remaining);

    for (const file of toAdd) {
        await addProductImage(file);
    }

    updateImageCount();

    // Auto-analyze if this is the first image
    if (state.productImages.length === toAdd.length && toAdd.length > 0) {
        analyzeProductImages();
    }
}

async function addProductImage(file) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);

    // Create thumbnail
    const base64 = await fileToBase64(file);
    const thumbnail = await createThumbnail(base64, 150);

    const imageData = {
        id,
        base64,
        thumbnail,
        file
    };

    state.productImages.push(imageData);
    renderImagePreviews();
}

function removeProductImage(id) {
    state.productImages = state.productImages.filter(img => img.id !== id);
    renderImagePreviews();
    updateImageCount();
}

function renderImagePreviews() {
    elements.imagePreviews.innerHTML = state.productImages.map(img => `
        <div class="image-preview-item" data-id="${img.id}">
            <img src="${img.thumbnail}" alt="Product">
            <button type="button" class="preview-remove" onclick="removeProductImage('${img.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function updateImageCount() {
    elements.imageCount.textContent = `(${state.productImages.length}/${state.maxImages})`;
}

// ============================================
// IMAGE ANALYSIS
// ============================================
async function analyzeProductImages() {
    if (state.productImages.length === 0 || state.isAnalyzing) return;

    state.isAnalyzing = true;

    // Mark images as analyzing
    document.querySelectorAll('.image-preview-item').forEach(el => {
        el.classList.add('analyzing');
    });

    try {
        const image = state.productImages[0].base64;
        const lang = state.language === 'ro' ? 'Romanian' : 'English';

        const prompt = `Analyze this product image and return a JSON object with the following structure. Be detailed and accurate.

{
    "productTitle": "A concise, marketable product name",
    "productCategory": "One of: electronics, clothing, beauty, home, food, sports, jewelry, toys, automotive, health, pet, office",
    "features": [
        {"text": "Feature 1 description", "starred": true},
        {"text": "Feature 2 description", "starred": false},
        {"text": "Feature 3 description", "starred": false}
    ],
    "benefits": [
        "Customer benefit 1",
        "Customer benefit 2",
        "Customer benefit 3"
    ]
}

Important:
- Features should be technical specifications or product attributes
- Mark 1-2 most important features as "starred": true
- Benefits should be customer value propositions (why they should buy)
- Return ONLY the JSON, no markdown or explanation
- Language: ${lang}`;

        const result = await api.analyzeImage({
            image,
            prompt,
            model: state.aiModel
        });

        // Parse JSON response
        let analysis;
        try {
            // Clean up response - remove markdown code blocks if present
            let cleanText = result.text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7);
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            analysis = JSON.parse(cleanText.trim());
        } catch (e) {
            console.error('Failed to parse analysis:', e);
            throw new Error('Failed to parse product analysis');
        }

        // Update state
        if (analysis.productTitle) {
            elements.productTitle.value = analysis.productTitle;
            state.productTitle = analysis.productTitle;
        }

        if (analysis.productCategory) {
            elements.productCategory.value = analysis.productCategory;
            state.productCategory = analysis.productCategory;
        }

        // Clear and add features
        state.features = [];
        elements.featuresList.innerHTML = '';
        if (analysis.features && Array.isArray(analysis.features)) {
            analysis.features.forEach(f => addFeature(f.text, f.starred));
        }

        // Clear and add benefits
        state.benefits = [];
        elements.benefitsList.innerHTML = '';
        if (analysis.benefits && Array.isArray(analysis.benefits)) {
            analysis.benefits.forEach(b => addBenefit(b));
        }

        showSuccess('Product analyzed successfully');

    } catch (error) {
        console.error('Analysis error:', error);
        showError('Failed to analyze product: ' + error.message);
    } finally {
        state.isAnalyzing = false;
        document.querySelectorAll('.image-preview-item').forEach(el => {
            el.classList.remove('analyzing');
        });
    }
}

// ============================================
// FEATURES & BENEFITS
// ============================================
function addFeature(text = '', starred = false) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    state.features.push({ id, text, starred });

    const html = `
        <div class="feature-item" data-id="${id}">
            <button type="button" class="star-btn ${starred ? 'starred' : ''}" onclick="toggleFeatureStar('${id}')">
                <svg viewBox="0 0 24 24" fill="${starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            </button>
            <input type="text" value="${text}" placeholder="Enter a feature..." onchange="updateFeature('${id}', this.value)">
            <button type="button" class="remove-btn" onclick="removeFeature('${id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;

    elements.featuresList.insertAdjacentHTML('beforeend', html);
}

function updateFeature(id, text) {
    const feature = state.features.find(f => f.id === id);
    if (feature) feature.text = text;
}

function toggleFeatureStar(id) {
    const feature = state.features.find(f => f.id === id);
    if (feature) {
        feature.starred = !feature.starred;
        const item = document.querySelector(`.feature-item[data-id="${id}"]`);
        const btn = item.querySelector('.star-btn');
        const svg = btn.querySelector('svg');
        btn.classList.toggle('starred', feature.starred);
        svg.setAttribute('fill', feature.starred ? 'currentColor' : 'none');
    }
}

function removeFeature(id) {
    state.features = state.features.filter(f => f.id !== id);
    document.querySelector(`.feature-item[data-id="${id}"]`)?.remove();
}

function addBenefit(text = '') {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    state.benefits.push({ id, text });

    const html = `
        <div class="benefit-item" data-id="${id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <input type="text" value="${text}" placeholder="Enter a benefit..." onchange="updateBenefit('${id}', this.value)">
            <button type="button" class="remove-btn" onclick="removeBenefit('${id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;

    elements.benefitsList.insertAdjacentHTML('beforeend', html);
}

function updateBenefit(id, text) {
    const benefit = state.benefits.find(b => b.id === id);
    if (benefit) benefit.text = text;
}

function removeBenefit(id) {
    state.benefits = state.benefits.filter(b => b.id !== id);
    document.querySelector(`.benefit-item[data-id="${id}"]`)?.remove();
}

// ============================================
// COPY GENERATION
// ============================================
async function generateCopy() {
    // Validate
    const title = elements.productTitle.value.trim();
    if (!title) {
        showError('Please enter a product title');
        return;
    }

    const features = state.features.filter(f => f.text.trim());
    if (features.length === 0) {
        showError('Please add at least one feature');
        return;
    }

    if (!state.apiKey) {
        showError('Please enter your API key');
        return;
    }

    // Show loading
    state.isGenerating = true;
    showLoading();
    updateLoadingStatus('Building marketing prompt...');

    try {
        const prompt = buildCopyPrompt();
        state.lastPrompt = prompt;

        updateLoadingStatus('Generating marketing copy...');

        const result = await api.generateText({
            model: state.aiModel,
            prompt,
            maxTokens: 3000
        });

        updateLoadingStatus('Processing results...');

        // Parse JSON response
        let copy;
        try {
            let cleanText = result.text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7);
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            copy = JSON.parse(cleanText.trim());
        } catch (e) {
            console.error('Failed to parse copy:', e);
            throw new Error('Failed to parse generated copy');
        }

        state.generatedCopy = copy;
        renderOutput(copy);
        showResult();

        // Save to history
        saveToHistory(copy);

        showSuccess('Marketing copy generated!');

    } catch (error) {
        console.error('Generation error:', error);
        showError('Failed to generate copy: ' + error.message);
        hideLoading();
    } finally {
        state.isGenerating = false;
    }
}

function buildCopyPrompt() {
    const title = elements.productTitle.value.trim();
    const category = elements.productCategory.value || 'general';
    const features = state.features.filter(f => f.text.trim());
    const benefits = state.benefits.filter(b => b.text.trim());
    const lang = state.language === 'ro' ? 'Romanian' : 'English';
    const tone = toneDescriptions[state.copyTone];

    const starredFeatures = features.filter(f => f.starred).map(f => f.text);
    const regularFeatures = features.filter(f => !f.starred).map(f => f.text);

    const prompt = `Generate comprehensive marketing copy for the following product. Return a JSON object with the exact structure shown below.

PRODUCT INFORMATION:
- Product: ${title}
- Category: ${category}
- Primary Features (emphasize these): ${starredFeatures.join(', ') || 'None specified'}
- Other Features: ${regularFeatures.join(', ')}
- Benefits: ${benefits.map(b => b.text).join(', ')}
- Tone: ${tone}
- Language: ${lang}
${state.includeEmoji ? '- Include appropriate emojis in social media content' : '- Do NOT include emojis'}
${state.includeHashtags ? '- Include relevant hashtags in social media content' : '- Do NOT include hashtags'}

${state.language === 'ro' ? 'IMPORTANT: Write all content in Romanian with proper diacritics (ă, â, î, ș, ț).' : ''}

Return this EXACT JSON structure:
{
    "ecommerce": {
        "productTitle": "SEO-optimized product title (max 80 characters)",
        "shortDesc": "Compelling 1-2 sentence description (max 50 words)",
        "longDesc": "Detailed product description highlighting benefits and features (100-200 words)",
        "bulletFeatures": ["Feature bullet 1", "Feature bullet 2", "Feature bullet 3", "Feature bullet 4", "Feature bullet 5"],
        "benefitsList": ["Benefit 1", "Benefit 2", "Benefit 3"]
    },
    "seo": {
        "metaTitle": "SEO meta title (max 60 characters)",
        "metaDescription": "Meta description for search results (max 160 characters)",
        "focusKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
        "altText": "Image alt text for accessibility and SEO (max 125 characters)"
    },
    "social": {
        "instagram": "Instagram caption with emojis and hashtags if enabled",
        "facebook": "Facebook post with conversational tone and call-to-action",
        "twitter": "Twitter/X post (max 280 characters)"
    },
    "email": {
        "welcomeEmail": "Welcome email for new customers (subject + body, ~100 words)",
        "launchEmail": "Product launch announcement email (subject + body, ~150 words)",
        "promoEmail": "Promotional/sale email (subject + body, ~100 words)",
        "cartEmail": "Abandoned cart recovery email (subject + body, ~80 words)"
    },
    "naming": {
        "productNames": ["Creative name 1", "Creative name 2", "Creative name 3", "Creative name 4", "Creative name 5"],
        "brandNames": ["Brand name 1", "Brand name 2", "Brand name 3"],
        "collectionNames": ["Collection name 1", "Collection name 2", "Collection name 3"],
        "skuSuggestions": ["SKU-PROD-001", "SKU-ITEM-A1", "PRD-2024-001"]
    },
    "reviews": {
        "response5Star": "Response template for 5-star positive reviews (thankful, encouraging repeat purchase)",
        "response4Star": "Response template for 4-star reviews (thankful, addressing minor concerns)",
        "responseNeutral": "Response template for 3-star neutral reviews (professional, offering support)",
        "responseNegative": "Response template for 1-2 star negative reviews (apologetic, solution-focused)"
    },
    "extras": {
        "taglines": ["Tagline option 1", "Tagline option 2", "Tagline option 3"],
        "emailSubjects": ["Email subject 1", "Email subject 2", "Email subject 3"]
    }
}

Return ONLY the JSON object, no markdown code blocks or explanations.`;

    return prompt;
}

// ============================================
// OUTPUT RENDERING
// ============================================
function renderOutput(copy) {
    // E-commerce
    setOutput('productTitle', copy.ecommerce?.productTitle || '');
    setOutput('shortDesc', copy.ecommerce?.shortDesc || '');
    setOutput('longDesc', copy.ecommerce?.longDesc || '');
    setOutputList('bulletFeatures', copy.ecommerce?.bulletFeatures || []);
    setOutputList('benefitsList', copy.ecommerce?.benefitsList || []);

    // SEO
    setOutput('metaTitle', copy.seo?.metaTitle || '');
    setOutput('metaDescription', copy.seo?.metaDescription || '');
    setOutputTags('focusKeywords', copy.seo?.focusKeywords || []);
    setOutput('altText', copy.seo?.altText || '');

    // Social
    setOutput('instagram', copy.social?.instagram || '');
    setOutput('facebook', copy.social?.facebook || '');
    setOutput('twitter', copy.social?.twitter || '');

    // Email
    setOutputEmail('welcomeEmail', copy.email?.welcomeEmail || '');
    setOutputEmail('launchEmail', copy.email?.launchEmail || '');
    setOutputEmail('promoEmail', copy.email?.promoEmail || '');
    setOutputEmail('cartEmail', copy.email?.cartEmail || '');

    // Naming
    setOutputList('productNames', copy.naming?.productNames || []);
    setOutputList('brandNames', copy.naming?.brandNames || []);
    setOutputList('collectionNames', copy.naming?.collectionNames || []);
    setOutputList('skuSuggestions', copy.naming?.skuSuggestions || []);

    // Reviews
    setOutput('response5Star', copy.reviews?.response5Star || '');
    setOutput('response4Star', copy.reviews?.response4Star || '');
    setOutput('responseNeutral', copy.reviews?.responseNeutral || '');
    setOutput('responseNegative', copy.reviews?.responseNegative || '');

    // Extras
    setOutputList('taglines', copy.extras?.taglines || []);
    setOutputList('emailSubjects', copy.extras?.emailSubjects || []);

    // Update character counts
    updateCharCounts(copy);
}

function setOutput(field, value) {
    const el = document.getElementById(`output-${field}`);
    if (el) el.textContent = value;
}

function setOutputList(field, items) {
    const el = document.getElementById(`output-${field}`);
    if (el) {
        el.innerHTML = `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
}

function setOutputTags(field, tags) {
    const el = document.getElementById(`output-${field}`);
    if (el) {
        el.innerHTML = tags.map(tag => `<span class="keyword-tag">${tag}</span>`).join('');
    }
}

function setOutputEmail(field, content) {
    const el = document.getElementById(`output-${field}`);
    if (el) {
        // Format email with subject line highlighted
        const formatted = content.replace(/^(Subject:.*?)$/m, '<strong>$1</strong>');
        el.innerHTML = formatted.replace(/\n/g, '<br>');
    }
}

function updateCharCounts(copy) {
    // Product Title
    updateCharCount('titleCharCount', copy.ecommerce?.productTitle?.length || 0, 80);

    // SEO
    updateCharCount('metaTitleCharCount', copy.seo?.metaTitle?.length || 0, 60);
    updateCharCount('metaDescCharCount', copy.seo?.metaDescription?.length || 0, 160);
    updateCharCount('altTextCharCount', copy.seo?.altText?.length || 0, 125);

    // Twitter
    updateCharCount('twitterCharCount', copy.social?.twitter?.length || 0, 280);
}

function updateCharCount(elementId, count, limit) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = `${count}/${limit}`;
        el.classList.remove('warning', 'error');
        if (count > limit) {
            el.classList.add('error');
        } else if (count > limit * 0.9) {
            el.classList.add('warning');
        }
    }
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabId) {
    // Update tab buttons
    elements.outputTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update tab content
    elements.tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabId}`);
    });
}

// ============================================
// COPY FUNCTIONS
// ============================================
function copyField(field) {
    const el = document.getElementById(`output-${field}`);
    if (!el) return;

    let text = el.textContent || el.innerText;

    // For lists, format nicely
    if (el.classList.contains('copy-field-list')) {
        const items = el.querySelectorAll('li');
        text = Array.from(items).map(li => `- ${li.textContent}`).join('\n');
    }

    // For tags, join with commas
    if (el.classList.contains('copy-field-tags')) {
        const tags = el.querySelectorAll('.keyword-tag');
        text = Array.from(tags).map(t => t.textContent).join(', ');
    }

    copyToClipboard(text);

    // Visual feedback
    const btn = document.querySelector(`.btn-copy[data-field="${field}"]`);
    if (btn) {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
    }
}

function copySection(section) {
    if (!state.generatedCopy) return;

    let text = '';

    switch (section) {
        case 'ecommerce':
            const ec = state.generatedCopy.ecommerce;
            text = `PRODUCT TITLE:\n${ec.productTitle}\n\nSHORT DESCRIPTION:\n${ec.shortDesc}\n\nLONG DESCRIPTION:\n${ec.longDesc}\n\nFEATURES:\n${ec.bulletFeatures.map(f => `- ${f}`).join('\n')}\n\nBENEFITS:\n${ec.benefitsList.map(b => `- ${b}`).join('\n')}`;
            break;

        case 'seo':
            const seo = state.generatedCopy.seo;
            text = `META TITLE:\n${seo.metaTitle}\n\nMETA DESCRIPTION:\n${seo.metaDescription}\n\nFOCUS KEYWORDS:\n${seo.focusKeywords.join(', ')}\n\nALT TEXT:\n${seo.altText}`;
            break;

        case 'social':
            const social = state.generatedCopy.social;
            text = `INSTAGRAM:\n${social.instagram}\n\nFACEBOOK:\n${social.facebook}\n\nTWITTER/X:\n${social.twitter}`;
            break;

        case 'email':
            const email = state.generatedCopy.email || {};
            text = `WELCOME EMAIL:\n${email.welcomeEmail || ''}\n\nPRODUCT LAUNCH EMAIL:\n${email.launchEmail || ''}\n\nPROMOTIONAL EMAIL:\n${email.promoEmail || ''}\n\nABANDONED CART EMAIL:\n${email.cartEmail || ''}`;
            break;

        case 'naming':
            const naming = state.generatedCopy.naming || {};
            text = `PRODUCT NAMES:\n${(naming.productNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nBRAND NAMES:\n${(naming.brandNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nCOLLECTION NAMES:\n${(naming.collectionNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nSKU SUGGESTIONS:\n${(naming.skuSuggestions || []).join(', ')}`;
            break;

        case 'reviews':
            const reviews = state.generatedCopy.reviews || {};
            text = `5-STAR RESPONSE:\n${reviews.response5Star || ''}\n\n4-STAR RESPONSE:\n${reviews.response4Star || ''}\n\nNEUTRAL RESPONSE:\n${reviews.responseNeutral || ''}\n\nNEGATIVE RESPONSE:\n${reviews.responseNegative || ''}`;
            break;

        case 'extras':
            const extras = state.generatedCopy.extras;
            text = `TAGLINES:\n${extras.taglines.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nEMAIL SUBJECTS:\n${extras.emailSubjects.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
            break;
    }

    copyToClipboard(text);
    showSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} copy copied!`);
}

function copyEverything() {
    if (!state.generatedCopy) return;

    const copy = state.generatedCopy;
    const email = copy.email || {};
    const naming = copy.naming || {};
    const reviews = copy.reviews || {};

    const text = `
====== E-COMMERCE ======

PRODUCT TITLE:
${copy.ecommerce.productTitle}

SHORT DESCRIPTION:
${copy.ecommerce.shortDesc}

LONG DESCRIPTION:
${copy.ecommerce.longDesc}

FEATURES:
${copy.ecommerce.bulletFeatures.map(f => `- ${f}`).join('\n')}

BENEFITS:
${copy.ecommerce.benefitsList.map(b => `- ${b}`).join('\n')}

====== SEO ======

META TITLE:
${copy.seo.metaTitle}

META DESCRIPTION:
${copy.seo.metaDescription}

FOCUS KEYWORDS:
${copy.seo.focusKeywords.join(', ')}

ALT TEXT:
${copy.seo.altText}

====== SOCIAL MEDIA ======

INSTAGRAM:
${copy.social.instagram}

FACEBOOK:
${copy.social.facebook}

TWITTER/X:
${copy.social.twitter}

====== EMAIL TEMPLATES ======

WELCOME EMAIL:
${email.welcomeEmail || ''}

PRODUCT LAUNCH EMAIL:
${email.launchEmail || ''}

PROMOTIONAL EMAIL:
${email.promoEmail || ''}

ABANDONED CART EMAIL:
${email.cartEmail || ''}

====== NAMING IDEAS ======

PRODUCT NAMES:
${(naming.productNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}

BRAND NAMES:
${(naming.brandNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}

COLLECTION NAMES:
${(naming.collectionNames || []).map((n, i) => `${i + 1}. ${n}`).join('\n')}

SKU SUGGESTIONS:
${(naming.skuSuggestions || []).join(', ')}

====== REVIEW RESPONSES ======

5-STAR RESPONSE:
${reviews.response5Star || ''}

4-STAR RESPONSE:
${reviews.response4Star || ''}

NEUTRAL RESPONSE:
${reviews.responseNeutral || ''}

NEGATIVE RESPONSE:
${reviews.responseNegative || ''}

====== EXTRAS ======

TAGLINES:
${copy.extras.taglines.map((t, i) => `${i + 1}. ${t}`).join('\n')}

EMAIL SUBJECTS:
${copy.extras.emailSubjects.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`.trim();

    copyToClipboard(text);
    showSuccess('All copy copied to clipboard!');
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// ============================================
// HISTORY & FAVORITES
// ============================================
async function saveToHistory(copy) {
    const thumbnail = state.productImages.length > 0 ? state.productImages[0].thumbnail : null;

    await history.add(thumbnail, {
        title: elements.productTitle.value,
        copy,
        features: state.features,
        benefits: state.benefits,
        tone: state.copyTone,
        language: state.language,
        model: state.aiModel
    });

    loadHistory();
}

async function saveToFavorites() {
    if (!state.generatedCopy) return;

    const thumbnail = state.productImages.length > 0 ? state.productImages[0].thumbnail : null;

    await favorites.add({
        thumbnail,
        title: elements.productTitle.value,
        copy: state.generatedCopy,
        features: state.features,
        benefits: state.benefits,
        tone: state.copyTone,
        language: state.language,
        model: state.aiModel
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
        elements.historyList.style.display = 'none';
        elements.historyEmpty.style.display = 'none';
        return;
    }

    panel.classList.add('has-items');
    elements.historyList.style.display = 'block';
    elements.historyEmpty.style.display = 'none';

    elements.historyList.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-thumb">
                ${item.thumbnail ? `<img src="${item.thumbnail}" alt="">` : ''}
            </div>
            <div class="history-item-info">
                <div class="history-item-title">${item.title || 'Untitled'}</div>
                <div class="history-item-meta">${formatDate(item.timestamp)}</div>
            </div>
            <div class="history-item-actions">
                <button onclick="loadHistoryItem('${item.id}')" title="Load">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </button>
                <button class="delete" onclick="deleteHistoryItem('${item.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function loadHistoryItem(id) {
    const item = history.findById(id);
    if (!item) return;

    // Restore state
    elements.productTitle.value = item.title || '';
    state.productTitle = item.title || '';

    if (item.copy) {
        state.generatedCopy = item.copy;
        renderOutput(item.copy);
        showResult();
    }

    showSuccess('History item loaded');
}

async function deleteHistoryItem(id) {
    await history.remove(id);
    loadHistory();
}

async function clearHistory() {
    if (!confirm('Clear all history?')) return;
    await history.clear();
    loadHistory();
}

function loadFavorites() {
    const panel = elements.favoritesPanel;
    const items = favorites.getAll();

    elements.favoritesCount.textContent = items.length;

    if (items.length === 0) {
        panel.classList.remove('has-items');
        elements.favoritesList.style.display = 'none';
        elements.favoritesEmpty.style.display = 'none';
        return;
    }

    panel.classList.add('has-items');
    elements.favoritesList.style.display = 'block';
    elements.favoritesEmpty.style.display = 'none';

    elements.favoritesList.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <div class="favorite-item-thumb">
                ${item.thumbnail ? `<img src="${item.thumbnail}" alt="">` : ''}
            </div>
            <div class="favorite-item-info">
                <div class="favorite-item-title">${item.title || 'Untitled'}</div>
                <div class="favorite-item-meta">${formatDate(item.timestamp)}</div>
            </div>
            <div class="favorite-item-actions">
                <button onclick="loadFavoriteItem('${item.id}')" title="Load">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </button>
                <button class="delete" onclick="deleteFavoriteItem('${item.id}')" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function loadFavoriteItem(id) {
    const item = favorites.findById(id);
    if (!item) return;

    // Restore settings
    elements.productTitle.value = item.title || '';
    state.productTitle = item.title || '';

    // Restore tone
    if (item.tone) {
        state.copyTone = item.tone;
        document.querySelectorAll('.tone-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tone === item.tone);
        });
    }

    // Restore language
    if (item.language) {
        state.language = item.language;
        updateLanguageUI();
    }

    // Restore features
    if (item.features) {
        state.features = [];
        elements.featuresList.innerHTML = '';
        item.features.forEach(f => addFeature(f.text, f.starred));
    }

    // Restore benefits
    if (item.benefits) {
        state.benefits = [];
        elements.benefitsList.innerHTML = '';
        item.benefits.forEach(b => addBenefit(b.text));
    }

    // Show copy if available
    if (item.copy) {
        state.generatedCopy = item.copy;
        renderOutput(item.copy);
        showResult();
    }

    showSuccess('Favorite loaded');
}

async function deleteFavoriteItem(id) {
    await favorites.remove(id);
    loadFavorites();
}

async function clearFavorites() {
    if (!confirm('Clear all favorites?')) return;
    await favorites.clear();
    loadFavorites();
}

// ============================================
// UI HELPERS
// ============================================
function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.resultContainer.style.display = 'none';
    elements.generateBtn.disabled = true;
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.resultPlaceholder.style.display = 'flex';
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

function updateLanguageUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === state.language);
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function createThumbnail(base64, size = 150) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate crop dimensions
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
// GLOBAL FUNCTIONS (for onclick handlers)
// ============================================
window.removeProductImage = removeProductImage;
window.toggleFeatureStar = toggleFeatureStar;
window.updateFeature = updateFeature;
window.removeFeature = removeFeature;
window.updateBenefit = updateBenefit;
window.removeBenefit = removeBenefit;
window.loadHistoryItem = loadHistoryItem;
window.deleteHistoryItem = deleteHistoryItem;
window.loadFavoriteItem = loadFavoriteItem;
window.deleteFavoriteItem = deleteFavoriteItem;

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
