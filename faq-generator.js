/**
 * FAQ Generator - HEFAISTOS
 * Generate product Q&As with text and image output
 */

const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    faqs: [],
    lastPrompt: null,
    lastSeed: null,

    // Product info
    productName: '',
    productDescription: '',

    // FAQ settings
    categories: ['general', 'technical', 'usage'],
    tone: 'professional',
    qaCount: 5,
    language: 'en',

    // Advanced
    includeSchema: true,
    customInstructions: '',

    // Image settings
    imageType: 'infographic',

    // UI
    selectedFavorite: null,
    activeTab: 'all'
};

// ============================================
// ELEMENTS
// ============================================

let elements = {};

function initElements() {
    elements = {
        // Form
        faqGeneratorForm: document.getElementById('faqGeneratorForm'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),

        // Product Info
        productName: document.getElementById('productName'),
        productDescription: document.getElementById('productDescription'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        includeSchema: document.getElementById('includeSchema'),
        customInstructions: document.getElementById('customInstructions'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // FAQ Output
        faqPlaceholder: document.getElementById('faqPlaceholder'),
        faqLoading: document.getElementById('faqLoading'),
        faqLoadingStatus: document.getElementById('faqLoadingStatus'),
        faqResults: document.getElementById('faqResults'),
        faqList: document.getElementById('faqList'),
        copyAllFaqsBtn: document.getElementById('copyAllFaqsBtn'),
        copySchemaBtn: document.getElementById('copySchemaBtn'),
        copySelectedBtn: document.getElementById('copySelectedBtn'),
        exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),

        // Image Output
        imagePlaceholder: document.getElementById('imagePlaceholder'),
        imageLoading: document.getElementById('imageLoading'),
        imageLoadingStatus: document.getElementById('imageLoadingStatus'),
        imageResult: document.getElementById('imageResult'),
        resultImage: document.getElementById('resultImage'),
        downloadImageBtn: document.getElementById('downloadImageBtn'),
        regenerateImageBtn: document.getElementById('regenerateImageBtn'),
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
        loadFavoriteBtn: document.getElementById('loadFavoriteBtn'),
        downloadFavoriteBtn: document.getElementById('downloadFavoriteBtn'),
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn')
    };
}

// ============================================
// DESCRIPTION MAPS
// ============================================

const categoryDescriptions = {
    'general': 'General product questions (what is it, who is it for, key features)',
    'technical': 'Technical specifications, compatibility, requirements',
    'shipping': 'Shipping, delivery, packaging questions',
    'usage': 'How to use, setup, maintenance, care instructions',
    'comparison': 'How it compares to alternatives, unique selling points',
    'warranty': 'Warranty, returns, customer support'
};

const toneDescriptions = {
    'professional': 'Professional, business-like tone with clear and authoritative answers',
    'friendly': 'Warm, approachable, conversational tone that feels personable',
    'casual': 'Relaxed, informal tone that feels like talking to a friend',
    'technical': 'Detailed, precise, technical language for expert audiences'
};

const imageTypeDescriptions = {
    'infographic': 'Full infographic-style FAQ display with icons and visual elements',
    'qa-card': 'Clean Q&A card format, one question highlighted with detailed answer',
    'top5': 'Top 5 most common questions displayed in an engaging visual format'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

const history = new SharedHistory('faq_generator_history', 20);
const favorites = new SharedFavorites('faq_generator_favorites', 30);

// ============================================
// FAQ GENERATION
// ============================================

function buildFaqPrompt() {
    const selectedCategories = state.categories.map(cat => categoryDescriptions[cat] || cat).join('\n- ');
    const toneDesc = toneDescriptions[state.tone] || toneDescriptions['professional'];
    const langText = state.language === 'ro' ? 'Romanian (with proper diacritics: ă, â, î, ș, ț)' : 'English';

    let prompt = `Generate FAQ content for a product.

PRODUCT NAME: ${state.productName || 'Product from image'}
PRODUCT DESCRIPTION: ${state.productDescription || 'Analyze the product from the provided image'}

CATEGORIES TO COVER:
- ${selectedCategories}

NUMBER OF Q&As: Generate ${state.qaCount} question-answer pairs per category.

TONE: ${toneDesc}

LANGUAGE: ${langText}

OUTPUT FORMAT - Return ONLY valid JSON (no markdown code blocks):
{
  "faqs": [
    {
      "category": "category_name",
      "question": "The question text",
      "answer": "The detailed answer text"
    }
  ]
}

REQUIREMENTS:
- Questions should be natural, commonly asked questions
- Answers should be helpful, accurate, and match the specified tone
- Each answer should be 1-3 sentences, informative but concise
- Cover different aspects within each category
- Questions should start with Who, What, When, Where, Why, How, Can, Does, Is, etc.`;

    if (state.customInstructions) {
        prompt += `\n\nADDITIONAL INSTRUCTIONS:\n${state.customInstructions}`;
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

async function generateFaqs() {
    // Gather selected categories
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
    state.categories = Array.from(categoryCheckboxes).map(cb => cb.value);

    if (state.categories.length === 0) {
        showError('Please select at least one FAQ category');
        return;
    }

    showFaqLoading();
    updateFaqLoadingStatus('Analyzing product...');

    const prompt = buildFaqPrompt();
    state.lastPrompt = prompt;

    try {
        updateFaqLoadingStatus('Generating FAQs...');

        // Set studio for usage tracking
        api.setStudio('faq-generator');

        let result;
        if (state.uploadedImageBase64) {
            // Use analyzeImage when we have a product image
            result = await api.analyzeImage({
                image: state.uploadedImageBase64,
                prompt: prompt,
                model: DEFAULT_MODEL
            });
        } else {
            // Use generateText when no image provided
            result = await api.generateText({
                prompt: prompt,
                model: DEFAULT_MODEL,
                maxTokens: 4096
            });
        }

        let content = result.text?.trim() || '';

        // Parse JSON from response
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(content);

        state.faqs = parsed.faqs || [];
        renderFaqs();
        showFaqResults();
        showSuccess('FAQs generated successfully!');

        // Auto-generate image if we have FAQs
        if (state.faqs.length > 0) {
            generateFaqImage();
        }

        await addToHistory();

    } catch (error) {
        hideFaqLoading();
        const message = error.toUserMessage ? error.toUserMessage() : (error.message || 'Failed to generate FAQs');
        showError(message);
    }
}

// ============================================
// IMAGE GENERATION
// ============================================

function buildImagePrompt() {
    const typeDesc = imageTypeDescriptions[state.imageType];
    const topFaqs = state.faqs.slice(0, 5);

    let faqContent = topFaqs.map((faq, i) => `Q${i + 1}: ${faq.question}\nA${i + 1}: ${faq.answer}`).join('\n\n');

    let prompt = `Create a professional FAQ infographic image.

STYLE: ${typeDesc}

PRODUCT: ${state.productName || 'Product'}

FAQ CONTENT TO DISPLAY:
${faqContent}

DESIGN REQUIREMENTS:
- Clean, modern design with excellent readability
- Use icons or visual elements to represent each question
- Professional color scheme that complements the product
- Clear visual hierarchy between questions and answers
- Include the product name as a header
- Questions should be visually distinct from answers
- Maintain adequate spacing between Q&A pairs

OUTPUT: Create a visually appealing infographic-style image that displays these FAQs in an engaging, easy-to-read format.`;

    if (state.uploadedImageBase64) {
        prompt += '\n\nThe product image is provided - you may incorporate it subtly in the design.';
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

async function generateFaqImage() {
    if (state.faqs.length === 0) return;

    showImageLoading();
    updateImageLoadingStatus('Creating FAQ visual...');

    const prompt = buildImagePrompt();
    const seed = Math.floor(Math.random() * 1000000);
    state.lastSeed = seed;

    try {
        // Set studio for usage tracking
        api.setStudio('faq-generator');

        const result = await api.generateImage({
            model: DEFAULT_MODEL,
            prompt: prompt,
            images: state.uploadedImageBase64 ? [state.uploadedImageBase64] : [],
            seed: seed
        });

        if (!result.image) {
            throw new Error('No image in response');
        }

        state.generatedImageUrl = result.image;
        showImageResult(result.image);

    } catch (error) {
        hideImageLoading();
        console.error('Image generation failed:', error);
        // Don't show error for image - it's secondary to FAQ text
    }
}

// ============================================
// SCHEMA.ORG JSON-LD
// ============================================

function generateSchemaJsonLd() {
    if (!state.faqs || state.faqs.length === 0) return '';

    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": state.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return JSON.stringify(schema, null, 2);
}

// ============================================
// UI FUNCTIONS
// ============================================

function showFaqLoading() {
    elements.faqPlaceholder.style.display = 'none';
    elements.faqResults.style.display = 'none';
    elements.faqLoading.style.display = 'flex';
    elements.generateBtn.disabled = true;
    elements.generateBtn.classList.add('loading');
}

function hideFaqLoading() {
    elements.faqLoading.style.display = 'none';
    elements.generateBtn.disabled = false;
    elements.generateBtn.classList.remove('loading');
}

function showFaqResults() {
    hideFaqLoading();
    elements.faqResults.style.display = 'block';
}

function updateFaqLoadingStatus(message) {
    if (elements.faqLoadingStatus) {
        elements.faqLoadingStatus.textContent = message;
    }
}

function showImageLoading() {
    elements.imagePlaceholder.style.display = 'none';
    elements.imageResult.style.display = 'none';
    elements.imageLoading.style.display = 'flex';
}

function hideImageLoading() {
    elements.imageLoading.style.display = 'none';
}

function showImageResult(imageUrl) {
    hideImageLoading();
    elements.resultImage.src = imageUrl;
    elements.imageResult.style.display = 'block';
}

function updateImageLoadingStatus(message) {
    if (elements.imageLoadingStatus) {
        elements.imageLoadingStatus.textContent = message;
    }
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
// RENDER FAQS
// ============================================

function renderFaqs() {
    if (!elements.faqList) return;

    // Update tabs
    const tabContainer = document.querySelector('.faq-tabs');
    if (tabContainer) {
        const uniqueCategories = [...new Set(state.faqs.map(f => f.category))];
        tabContainer.innerHTML = `
            <button type="button" class="faq-tab active" data-tab="all">All (${state.faqs.length})</button>
            ${uniqueCategories.map(cat => `
                <button type="button" class="faq-tab" data-tab="${cat}">${capitalize(cat)} (${state.faqs.filter(f => f.category === cat).length})</button>
            `).join('')}
        `;

        // Add tab click handlers
        tabContainer.querySelectorAll('.faq-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabContainer.querySelectorAll('.faq-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.activeTab = tab.dataset.tab;
                renderFaqList();
            });
        });
    }

    renderFaqList();
}

function renderFaqList() {
    const filteredFaqs = state.activeTab === 'all'
        ? state.faqs
        : state.faqs.filter(f => f.category === state.activeTab);

    elements.faqList.innerHTML = filteredFaqs.map((faq, index) => `
        <div class="faq-item" data-index="${index}">
            <div class="faq-item-header">
                <label class="faq-checkbox">
                    <input type="checkbox" checked data-index="${index}">
                </label>
                <span class="faq-category-badge">${capitalize(faq.category)}</span>
                <button type="button" class="faq-copy-btn" data-index="${index}" title="Copy this Q&A">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                </button>
            </div>
            <div class="faq-question">Q: ${faq.question}</div>
            <div class="faq-answer">A: ${faq.answer}</div>
        </div>
    `).join('');

    // Add copy handlers
    elements.faqList.querySelectorAll('.faq-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const faq = state.faqs[idx];
            if (faq) {
                navigator.clipboard.writeText(`Q: ${faq.question}\nA: ${faq.answer}`);
                showSuccess('Q&A copied to clipboard!');
            }
        });
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// COPY FUNCTIONS
// ============================================

function copyAllFaqs() {
    if (state.faqs.length === 0) return;

    const text = state.faqs.map(faq =>
        `## ${capitalize(faq.category)}\n\n**Q: ${faq.question}**\n\nA: ${faq.answer}`
    ).join('\n\n---\n\n');

    navigator.clipboard.writeText(text);
    showSuccess('All FAQs copied to clipboard!');
}

function copySchema() {
    const schema = generateSchemaJsonLd();
    if (schema) {
        navigator.clipboard.writeText(schema);
        showSuccess('Schema.org JSON-LD copied!');
    }
}

function copySelectedFaqs() {
    const selectedCheckboxes = elements.faqList.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIndices = Array.from(selectedCheckboxes).map(cb => parseInt(cb.dataset.index));
    const selectedFaqs = state.faqs.filter((_, i) => selectedIndices.includes(i));

    if (selectedFaqs.length === 0) {
        showError('No FAQs selected');
        return;
    }

    const text = selectedFaqs.map(faq =>
        `Q: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n');

    navigator.clipboard.writeText(text);
    showSuccess(`${selectedFaqs.length} Q&As copied!`);
}

function exportMarkdown() {
    if (state.faqs.length === 0) return;

    let md = `# ${state.productName || 'Product'} - Frequently Asked Questions\n\n`;

    const categories = [...new Set(state.faqs.map(f => f.category))];
    categories.forEach(cat => {
        md += `## ${capitalize(cat)}\n\n`;
        state.faqs.filter(f => f.category === cat).forEach(faq => {
            md += `### ${faq.question}\n\n${faq.answer}\n\n`;
        });
    });

    // Add schema
    if (state.includeSchema) {
        md += `## Schema.org JSON-LD\n\n\`\`\`json\n${generateSchemaJsonLd()}\n\`\`\`\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.productName || 'product').toLowerCase().replace(/\s+/g, '-')}-faq.md`;
    a.click();
    URL.revokeObjectURL(url);

    showSuccess('FAQ exported as Markdown!');
}

// ============================================
// HISTORY & FAVORITES
// ============================================

async function addToHistory() {
    await history.add(state.generatedImageUrl || '', {
        productName: state.productName,
        productDescription: state.productDescription,
        faqs: state.faqs,
        categories: state.categories,
        tone: state.tone,
        qaCount: state.qaCount,
        language: state.language
    });
    renderHistory();
}

function renderHistory() {
    const items = history.getAll();

    if (elements.historyCount) {
        elements.historyCount.textContent = items.length;
    }

    if (elements.historyEmpty) {
        elements.historyEmpty.style.display = items.length === 0 ? 'block' : 'none';
    }

    if (items.length === 0) {
        elements.historyGrid.innerHTML = '';
        return;
    }

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-content">
                <span class="history-item-title">${item.productName || 'Product FAQ'}</span>
                <span class="history-item-count">${item.faqs?.length || 0} Q&As</span>
            </div>
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            loadFromHistory(id);
        });
    });
}

function loadFromHistory(id) {
    const historyItem = history.findById(id);
    if (!historyItem) return;

    state.faqs = historyItem.faqs || [];
    state.productName = historyItem.productName || '';
    state.productDescription = historyItem.productDescription || '';

    if (elements.productName) elements.productName.value = state.productName;
    if (elements.productDescription) elements.productDescription.value = state.productDescription;

    renderFaqs();
    showFaqResults();
    showSuccess('FAQs loaded from history!');
}

async function saveFavorite() {
    if (state.faqs.length === 0) {
        showError('No FAQs to save');
        return;
    }

    const favorite = await favorites.add({
        name: state.productName || 'Product FAQ',
        imageUrl: state.generatedImageUrl,
        faqs: state.faqs,
        productName: state.productName,
        productDescription: state.productDescription,
        categories: state.categories,
        tone: state.tone,
        qaCount: state.qaCount,
        language: state.language,
        productImageBase64: state.uploadedImageBase64
    });

    if (favorite) {
        showSuccess('Added to favorites!');
        renderFavorites();
    }
}

function renderFavorites() {
    const items = favorites.getAll();

    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = items.length;
    }

    if (elements.favoritesEmpty) {
        elements.favoritesEmpty.style.display = items.length === 0 ? 'block' : 'none';
    }

    if (items.length === 0) {
        elements.favoritesGrid.innerHTML = '';
        return;
    }

    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <div class="favorite-item-content">
                <span class="favorite-item-title">${item.name || 'Product FAQ'}</span>
                <span class="favorite-item-count">${item.faqs?.length || 0} Q&As</span>
            </div>
            <div class="favorite-item-overlay">
                <button class="favorite-load-btn" title="Load">
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
    });
}

function loadFavorite(id) {
    const fav = favorites.findById(id);
    if (!fav) return;

    state.selectedFavorite = fav;
    state.faqs = fav.faqs || [];
    state.productName = fav.productName || '';
    state.productDescription = fav.productDescription || '';
    state.categories = fav.categories || ['general', 'technical', 'usage'];
    state.tone = fav.tone || 'professional';
    state.qaCount = fav.qaCount || 5;
    state.language = fav.language || 'en';

    // Update UI
    if (elements.productName) elements.productName.value = state.productName;
    if (elements.productDescription) elements.productDescription.value = state.productDescription;

    // Update category checkboxes
    document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = state.categories.includes(cb.value);
    });

    // Update tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tone === state.tone);
    });

    // Update QA count buttons
    document.querySelectorAll('[data-option="qaCount"]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === String(state.qaCount));
    });

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === state.language);
    });

    renderFaqs();
    showFaqResults();

    if (fav.imageUrl) {
        state.generatedImageUrl = fav.imageUrl;
        showImageResult(fav.imageUrl);
    }

    showSuccess('Settings loaded from favorite!');
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
// DOWNLOAD
// ============================================

function downloadImage() {
    if (state.generatedImageUrl) {
        SharedDownload.downloadImage(state.generatedImageUrl, 'faq-infographic');
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Form submit
    elements.faqGeneratorForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateFaqs();
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

    // Product info inputs
    elements.productName?.addEventListener('input', (e) => {
        state.productName = e.target.value;
    });

    elements.productDescription?.addEventListener('input', (e) => {
        state.productDescription = e.target.value;
    });

    // Tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.tone = btn.dataset.tone;
        });
    });

    // QA Count buttons
    document.querySelectorAll('[data-option="qaCount"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="qaCount"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.qaCount = parseInt(btn.dataset.value) || 5;
        });
    });

    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.language = btn.dataset.lang;
        });
    });

    // Image type buttons
    document.querySelectorAll('.image-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.image-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.imageType = btn.dataset.type;
        });
    });

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
    });

    // Include Schema checkbox
    elements.includeSchema?.addEventListener('change', (e) => {
        state.includeSchema = e.target.checked;
    });

    // Custom instructions
    elements.customInstructions?.addEventListener('input', (e) => {
        state.customInstructions = e.target.value;
    });

    // Copy buttons
    elements.copyAllFaqsBtn?.addEventListener('click', copyAllFaqs);
    elements.copySchemaBtn?.addEventListener('click', copySchema);
    elements.copySelectedBtn?.addEventListener('click', copySelectedFaqs);
    elements.exportMarkdownBtn?.addEventListener('click', exportMarkdown);

    // Image actions
    elements.downloadImageBtn?.addEventListener('click', downloadImage);
    elements.regenerateImageBtn?.addEventListener('click', generateFaqImage);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);

    // Result image click
    elements.resultImage?.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            openLightbox(state.generatedImageUrl);
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
    elements.lightboxDownload?.addEventListener('click', downloadImage);

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
            SharedDownload.downloadImage(elements.favoritePreviewImg.src, 'faq-favorite');
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateFaqs();
        }
        // Ctrl+D to download
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            downloadImage();
        }
        // Escape to close modals
        if (e.key === 'Escape') {
            closeLightbox();
            closeFavoritesModal();
        }
    });
}

function closeFavoritesModal() {
    if (elements.favoritesModal) {
        elements.favoritesModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    state.selectedFavorite = null;
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

    // Load persisted data
    loadHistory();
    favorites.load();
    renderFavorites();

    console.log('FAQ Generator: Ready!');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}
