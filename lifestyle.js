/**
 * Lifestyle Studio - HEFAISTOS
 * Pure product photography in lifestyle environments
 *
 * Follows the Studio Page Contract pattern.
 * See CLAUDE.md for documentation.
 */

// ============================================
// CONSTANTS & CONFIG
// ============================================

const STUDIO_ID = 'lifestyle';
const DEFAULT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ============================================
// STATE
// ============================================

const state = {
    // Core
    uploadedImage: null,
    uploadedImageBase64: null,
    autoMode: true,  // Auto-generate on upload (30 seconds to fun)
    generatedImageUrl: null,
    generatedImages: [],
    history: [],
    lastPrompt: null,
    lastSeed: null,

    // Scene
    scene: 'living-room',
    sceneDetails: '',

    // Atmosphere
    mood: 'cozy',
    timeOfDay: 'golden-hour',

    // Advanced
    season: 'auto',
    lighting: 'natural',
    shotType: 'medium',
    cameraAngle: 'eye-level',
    aspectRatio: '4:5',
    photoStyle: 'lifestyle',
    qualityLevel: 'high',
    depthOfField: 'auto',
    colorGrading: 'auto',

    // Generation
    seed: '',
    negativePrompt: '',
    variations: 1,

    // UI
    selectedFavorite: null,

    // Style reference
    styleReferenceBase64: null
};

// Generation abort controller
let abortController = null;

// Friendly error message mapping (per STUDIO.md philosophy)
const ERROR_MESSAGES = {
    'rate_limit': 'Too many requests. Please wait a moment and try again.',
    'rate_limit_exceeded': 'Too many requests. Please wait a moment and try again.',
    'invalid_api_key': 'API key not recognized. Check your key in Settings.',
    'invalid_key': 'API key not recognized. Check your key in Settings.',
    'insufficient_credits': 'Out of credits. Add more in your OpenRouter account.',
    'insufficient_balance': 'Out of credits. Add more in your OpenRouter account.',
    'content_policy': 'Image couldn\'t be processed. Try a different photo.',
    'content_filtered': 'Image couldn\'t be processed. Try a different photo.',
    'timeout': 'Request timed out. Please try again.',
    'network': 'Network issue. Check your connection and try again.',
    'server_error': 'Server temporarily unavailable. Please try again.',
    'model_unavailable': 'AI model is busy. Please try again in a moment.'
};

function mapErrorToFriendly(error) {
    // Check for known error codes/types
    const code = error?.code || error?.type || error?.error?.code || '';
    const message = error?.message || error?.error?.message || '';

    // Direct code match
    if (ERROR_MESSAGES[code]) {
        return ERROR_MESSAGES[code];
    }

    // Check message for keywords
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('rate limit') || lowerMessage.includes('429')) {
        return ERROR_MESSAGES['rate_limit'];
    }
    if (lowerMessage.includes('api key') || lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
        return ERROR_MESSAGES['invalid_api_key'];
    }
    if (lowerMessage.includes('credit') || lowerMessage.includes('balance') || lowerMessage.includes('insufficient')) {
        return ERROR_MESSAGES['insufficient_credits'];
    }
    if (lowerMessage.includes('content') || lowerMessage.includes('policy') || lowerMessage.includes('filtered')) {
        return ERROR_MESSAGES['content_policy'];
    }
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
        return ERROR_MESSAGES['timeout'];
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('connection')) {
        return ERROR_MESSAGES['network'];
    }
    if (lowerMessage.includes('500') || lowerMessage.includes('502') || lowerMessage.includes('503')) {
        return ERROR_MESSAGES['server_error'];
    }

    // Fallback to original message or generic
    return message || 'Something went wrong. Please try again.';
}

// ============================================
// ELEMENTS
// ============================================

let elements = {};

function initElements() {
    elements = {
        // Form
        lifestyleForm: document.getElementById('lifestyleForm'),

        // Upload
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImage: document.getElementById('removeImage'),
        autoModeToggle: document.getElementById('autoModeToggle'),

        // Scene
        sceneDetails: document.getElementById('sceneDetails'),

        // Basic Settings
        basicSection: document.getElementById('basicSection'),
        basicToggle: document.getElementById('basicToggle'),

        // Advanced
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        season: document.getElementById('season'),
        lighting: document.getElementById('lighting'),
        shotType: document.getElementById('shotType'),
        cameraAngle: document.getElementById('cameraAngle'),
        photoStyle: document.getElementById('photoStyle'),
        aspectRatio: document.getElementById('aspectRatio'),
        qualityLevel: document.getElementById('qualityLevel'),
        depthOfField: document.getElementById('depthOfField'),
        colorGrading: document.getElementById('colorGrading'),
        seedInput: document.getElementById('seedInput'),
        negativePrompt: document.getElementById('negativePrompt'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Output
        outputContainer: document.getElementById('outputContainer'),
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        loadingSubtext: document.getElementById('loadingSubtext'),
        cancelBtn: document.getElementById('cancelBtn'),
        skeletonGrid: document.getElementById('skeletonGrid'),
        resultDisplay: document.getElementById('resultDisplay'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),
        imageInfoBtn: document.getElementById('imageInfoBtn'),
        imageInfoOverlay: document.getElementById('imageInfoOverlay'),

        // Actions
        downloadBtn: document.getElementById('downloadBtn'),
        favoriteBtn: document.getElementById('favoriteBtn'),
        compareBtn: document.getElementById('compareBtn'),
        copyPromptBtn: document.getElementById('copyPromptBtn'),
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History
        historySection: document.getElementById('historySection'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),

        // Favorites
        favoritesSection: document.getElementById('favoritesSection'),
        favoritesGrid: document.getElementById('favoritesGrid'),
        favoritesCount: document.getElementById('favoritesCount'),
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
        favoriteVariants: document.getElementById('favoriteVariants'),
        favoriteNameInput: document.getElementById('favoriteNameInput'),
        favoriteDate: document.getElementById('favoriteDate'),
        favoriteSeedValue: document.getElementById('favoriteSeedValue'),
        copyFavoriteSeed: document.getElementById('copyFavoriteSeed'),
        loadFavoriteBtn: document.getElementById('loadFavoriteBtn'),
        downloadFavoriteBtn: document.getElementById('downloadFavoriteBtn'),
        deleteFavoriteBtn: document.getElementById('deleteFavoriteBtn'),

        // Containers
        presetSelectorContainer: document.getElementById('presetSelectorContainer'),
        costEstimatorContainer: document.getElementById('costEstimatorContainer'),

        // Style Reference
        styleUploadArea: document.getElementById('styleUploadArea'),
        styleReference: document.getElementById('styleReference'),
        stylePreviewContainer: document.getElementById('stylePreviewContainer'),
        stylePreviewImg: document.getElementById('stylePreviewImg'),
        removeStyleRef: document.getElementById('removeStyleRef'),
        styleStrengthSlider: document.getElementById('styleStrengthSlider'),
        styleStrength: document.getElementById('styleStrength'),
        styleStrengthValue: document.getElementById('styleStrengthValue')
    };
}

// ============================================
// DESCRIPTION MAPS
// ============================================

const sceneDescriptions = {
    'living-room': 'A cozy, well-decorated living room with comfortable furniture, soft textures, and warm natural light streaming through windows. Include elements like a stylish sofa, decorative pillows, plants, and tasteful decor.',
    'kitchen': 'A modern, clean kitchen with marble or granite countertops, quality appliances, and fresh ingredients or cooking elements. Natural light illuminates the space with a welcoming, homey atmosphere.',
    'bedroom': 'A peaceful, inviting bedroom with a comfortable bed, soft linens, and serene decor. Gentle natural light creates a relaxed, restful atmosphere with tasteful furnishings.',
    'office': 'A professional yet stylish home office or workspace with a clean desk, quality materials, and organized surroundings. Natural light and greenery add warmth to the productive environment.',
    'outdoor': 'A beautiful natural outdoor setting with lush greenery, trees, and fresh air. Dappled sunlight creates interesting patterns and a connection to nature.',
    'cafe': 'A trendy, atmospheric café or coffee shop with warm lighting, artistic details, and social ambiance. Include elements like coffee cups, pastries, or cozy seating.',
    'beach': 'A sunny beach setting with soft sand, ocean views, and vacation vibes. Warm golden light, waves, and a relaxed coastal atmosphere.',
    'gym': 'A modern, clean fitness environment with quality equipment and energetic atmosphere. Bright lighting emphasizes health, activity, and motivation.',
    'garden': 'A beautiful backyard garden with flowers, plants, and natural elements. Soft natural light and tranquil surroundings create a peaceful, organic atmosphere.',
    'urban': 'A stylish urban street scene with modern architecture, city elements, and contemporary lifestyle vibes. Interesting textures, clean lines, and metropolitan energy.'
};

const moodDescriptions = {
    'cozy': 'Warm, intimate, comfortable, and inviting atmosphere with soft textures and welcoming tones',
    'energetic': 'Dynamic, vibrant, full of life and movement with bold colors and active energy',
    'calm': 'Peaceful, serene, zen-like tranquility with muted tones and balanced composition',
    'luxurious': 'Upscale, premium, sophisticated elegance with rich materials and refined details',
    'minimal': 'Clean, simple, uncluttered, and modern with intentional negative space and focus',
    'vibrant': 'Colorful, lively, eye-catching with saturated hues and visual interest',
    'romantic': 'Soft, dreamy, intimate with warm tones, gentle lighting, and emotional warmth',
    'fresh': 'Clean, airy, bright, and rejuvenating with crisp whites and natural elements'
};

const timeDescriptions = {
    'morning': 'Soft morning light with a fresh start feeling, gentle warmth, and new day energy',
    'midday': 'Bright natural light with clear visibility, high sun, and vibrant illumination',
    'golden-hour': 'Warm golden sunlight with long shadows, magical glow, and cinematic warmth',
    'evening': 'Warm ambient lighting with relaxed atmosphere, soft lamps, and cozy twilight',
    'night': 'Moody lighting with intimate atmosphere, artificial warmth, and cozy ambiance'
};

const seasonDescriptions = {
    'spring': 'Fresh spring atmosphere with blooming flowers, new growth, pastel colors, and renewal energy',
    'summer': 'Warm summer vibes with bright sunshine, vibrant colors, outdoor freshness, and peak daylight',
    'fall': 'Autumn atmosphere with warm orange and brown tones, cozy textures, falling leaves, and harvest warmth',
    'winter': 'Winter ambiance with cool tones, cozy indoor warmth, soft whites, and hygge comfort',
    'holiday': 'Festive holiday atmosphere with warm lights, decorations, celebratory mood, and seasonal cheer'
};

const lightingDescriptions = {
    'natural': 'Natural daylight with soft shadows and authentic illumination',
    'warm': 'Warm, golden-toned lighting with amber hues and cozy feel',
    'cool': 'Cool, blue-toned lighting with crisp, modern feel',
    'dramatic': 'High-contrast dramatic lighting with strong shadows and visual impact',
    'soft': 'Soft, diffused lighting with gentle shadows and flattering tones',
    'bright': 'Bright, well-lit environment with minimal shadows and clear visibility',
    'backlit': 'Backlit scene with glowing edges, silhouette elements, and ethereal quality'
};

const shotDescriptions = {
    'wide': 'Wide shot showing the full environment and context around the product',
    'medium': 'Medium shot balancing product focus with environmental context',
    'closeup': 'Close-up shot emphasizing product details while showing lifestyle setting',
    'detail': 'Detail shot focusing on product texture and quality with hint of environment'
};

const angleDescriptions = {
    'eye-level': 'Eye-level perspective for natural, relatable viewing angle',
    'low': 'Low angle looking up, adding drama and importance to the subject',
    'high': 'High angle looking down, providing context and overview',
    'overhead': 'Overhead flat-lay perspective for graphic, organized composition'
};

const styleDescriptions = {
    'lifestyle': 'Authentic lifestyle photography with natural poses and real-world context',
    'editorial': 'Editorial style with artistic composition, fashion influence, and storytelling',
    'commercial': 'Clean commercial photography optimized for product visibility and appeal',
    'candid': 'Candid, spontaneous feeling with natural moments and unstaged authenticity',
    'artistic': 'Artistic interpretation with creative angles, unique perspectives, and visual interest'
};

const qualityDescriptions = {
    'standard': 'Good quality professional photography',
    'high': 'High quality photography with excellent detail and composition',
    'ultra': 'Ultra high quality, masterpiece-level photography with exceptional detail, perfect lighting, and flawless execution'
};

const dofDescriptions = {
    'shallow': 'Shallow depth of field with beautiful bokeh, blurred background, and sharp subject focus',
    'medium': 'Medium depth of field balancing subject sharpness with soft background',
    'deep': 'Deep depth of field with most of the scene in sharp focus'
};

const colorGradingDescriptions = {
    'warm': 'Warm color grading with golden, amber tones',
    'cool': 'Cool color grading with blue, teal undertones',
    'vibrant': 'Vibrant, saturated colors with punchy contrast',
    'muted': 'Muted, desaturated palette with subtle, refined tones'
};

// ============================================
// HISTORY & FAVORITES
// ============================================

// Storage keys follow pattern: {studioId}_{type}
const history = new SharedHistory(`${STUDIO_ID}_history`, 20);
const favorites = new SharedFavorites(`${STUDIO_ID}_favorites`, 30);

// ============================================
// PROMPT GENERATION
// ============================================

function generatePrompt() {
    const sceneDesc = sceneDescriptions[state.scene] || sceneDescriptions['living-room'];
    const moodDesc = moodDescriptions[state.mood] || moodDescriptions['cozy'];
    const timeDesc = timeDescriptions[state.timeOfDay] || timeDescriptions['golden-hour'];
    const lightingDesc = lightingDescriptions[state.lighting] || lightingDescriptions['natural'];
    const shotDesc = shotDescriptions[state.shotType] || shotDescriptions['medium'];
    const angleDesc = angleDescriptions[state.cameraAngle] || angleDescriptions['eye-level'];
    const styleDesc = styleDescriptions[state.photoStyle] || styleDescriptions['lifestyle'];
    const qualityDesc = qualityDescriptions[state.qualityLevel] || qualityDescriptions['high'];

    let prompt = `Create a ${qualityDesc} lifestyle product photograph.

SCENE ENVIRONMENT:
${sceneDesc}
${state.sceneDetails ? `SPECIFIC DETAILS: ${state.sceneDetails}` : ''}

ATMOSPHERE & MOOD:
${moodDesc}

TIME OF DAY:
${timeDesc}

PHOTOGRAPHY STYLE:
${styleDesc}

COMPOSITION:
${shotDesc}
${angleDesc}

LIGHTING:
${lightingDesc}`;

    // Add seasonal theme if not auto
    if (state.season !== 'auto' && seasonDescriptions[state.season]) {
        prompt += `\n\nSEASONAL THEME:\n${seasonDescriptions[state.season]}`;
    }

    // Add depth of field if not auto
    if (state.depthOfField !== 'auto' && dofDescriptions[state.depthOfField]) {
        prompt += `\n\nDEPTH OF FIELD:\n${dofDescriptions[state.depthOfField]}`;
    }

    // Add color grading if not auto
    if (state.colorGrading !== 'auto' && colorGradingDescriptions[state.colorGrading]) {
        prompt += `\n\nCOLOR GRADING:\n${colorGradingDescriptions[state.colorGrading]}`;
    }

    // Critical requirements
    prompt += `

CRITICAL REQUIREMENTS:
- This is a LIFESTYLE PHOTOGRAPH, NOT an infographic
- NO text overlays, NO callouts, NO icons, NO labels, NO graphics
- Product should look natural and belong in the environment
- Focus on aspirational, catalog-quality imagery
- Professional photography standards with excellent composition
- The product from the reference image should be clearly visible and well-integrated into the scene`;

    // Add negative prompt if provided
    if (state.negativePrompt && state.negativePrompt.trim()) {
        prompt += `\n\nAVOID:\n${state.negativePrompt.trim()}`;
    }

    // Add style reference if provided
    if (state.styleReferenceBase64) {
        const styleStrength = parseInt(elements.styleStrength?.value || 70);
        const strengthText = styleStrength < 40 ? 'subtle inspiration from' :
                            styleStrength < 70 ? 'moderately match' :
                            'strongly match';
        prompt += `\n\nSTYLE REFERENCE:
I am providing a style reference image. Please ${strengthText} the visual style, color palette, lighting style, and overall mood of the reference image.
Style influence: ${styleStrength}%`;
    }

    // Final emphasis
    prompt += `\n\nIMPORTANT: Pure photography only. No graphics, text, watermarks, or marketing elements. The product should feel naturally placed in a real lifestyle setting.`;

    return prompt;
}

// ============================================
// API INTEGRATION
// ============================================

function handleCancel() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    // Also cancel any pending API requests
    api.cancelAllRequests?.();
    hideLoading();
    showSuccess('Generation cancelled');
}

async function generateLifestylePhoto() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a product image first');
        return;
    }

    // Create abort controller for this generation
    abortController = new AbortController();

    showLoading();
    updateLoadingStatus('Preparing scene...');
    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    try {
        const variationsCount = state.variations || 1;
        const baseSeed = state.seed ? parseInt(state.seed) : Math.floor(Math.random() * 1000000);
        state.lastSeed = baseSeed;

        updateLoadingStatus('Generating lifestyle photo...');

        if (variationsCount === 1) {
            const imageUrl = await makeGenerationRequest(prompt, baseSeed);
            showResult(imageUrl);
        } else {
            // Generate multiple variations in parallel
            updateLoadingStatus(`Generating ${variationsCount} variations...`);
            const requests = [];
            for (let i = 0; i < variationsCount; i++) {
                requests.push(
                    makeGenerationRequest(prompt, baseSeed + i)
                        .catch(err => {
                            console.error(`Variation ${i + 1} failed:`, err);
                            return null;
                        })
                );
            }

            updateLoadingStatus('Processing images...');
            const results = await Promise.all(requests);
            const successfulImages = results.filter(url => url !== null);

            if (successfulImages.length === 0) {
                throw new Error('All generation attempts failed');
            }

            showMultipleResults(successfulImages);
        }

        showSuccess('Lifestyle photo generated successfully!');

    } catch (error) {
        // Don't show error if cancelled by user
        if (error.name === 'AbortError' || abortController?.signal?.aborted) {
            return;
        }
        hideLoading();
        showError(mapErrorToFriendly(error));
    } finally {
        abortController = null;
    }
}

async function makeGenerationRequest(prompt, seed) {
    const images = [state.uploadedImageBase64];

    // Add style reference image if provided
    if (state.styleReferenceBase64) {
        images.push(state.styleReferenceBase64);
    }

    const result = await api.generateImage({
        model: DEFAULT_MODEL,
        prompt,
        images,
        seed: seed || undefined
    });

    if (!result.image) {
        throw new Error('No image in response');
    }

    return result.image;
}

async function adjustPhoto() {
    const feedback = elements.feedbackTextarea?.value?.trim();
    if (!feedback) {
        showError('Please describe what adjustments you want');
        return;
    }

    if (!state.lastPrompt) {
        showError('No previous generation to adjust');
        return;
    }

    showLoading();
    elements.loadingSubtext.textContent = 'Applying adjustments...';

    const adjustedPrompt = `${state.lastPrompt}

ADJUSTMENTS REQUESTED:
${feedback}

Please regenerate the lifestyle photo with these specific changes applied while maintaining the core scene and product placement.`;

    try {
        const baseSeed = state.lastSeed || Math.floor(Math.random() * 1000000);
        const imageUrl = await makeGenerationRequest(adjustedPrompt, baseSeed);
        showResult(imageUrl);
        showSuccess('Photo adjusted successfully!');
        elements.feedbackTextarea.value = '';
    } catch (error) {
        hideLoading();
        showError(mapErrorToFriendly(error));
    }
}

async function analyzeProductImage() {
    if (!state.uploadedImageBase64) return;

    // Show loading immediately for auto mode
    if (state.autoMode) {
        showLoading();
        updateLoadingStatus('Analyzing product...');
    }

    try {
        const result = await api.analyzeImage({
            image: state.uploadedImageBase64,
            prompt: `Analyze this product image and suggest the best lifestyle scene and mood for photography. Return ONLY valid JSON (no markdown):
{
  "productType": "brief description of product type",
  "suggestedScene": "living-room|kitchen|bedroom|office|outdoor|cafe|beach|gym|garden|urban",
  "suggestedMood": "cozy|energetic|calm|luxurious|minimal|vibrant|romantic|fresh",
  "suggestedTime": "morning|midday|golden-hour|evening|night"
}

Choose based on what would look most natural and appealing for this specific product.`
        });

        let content = result.text || '';
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        const analysis = JSON.parse(content);

        // Auto-select scene
        if (analysis.suggestedScene) {
            const sceneBtn = document.querySelector(`.scene-btn[data-scene="${analysis.suggestedScene}"]`);
            if (sceneBtn) {
                document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
                sceneBtn.classList.add('active');
                state.scene = analysis.suggestedScene;
            }
        }

        // Auto-select mood
        if (analysis.suggestedMood) {
            const moodBtn = document.querySelector(`.mood-btn[data-mood="${analysis.suggestedMood}"]`);
            if (moodBtn) {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                moodBtn.classList.add('active');
                state.mood = analysis.suggestedMood;
            }
        }

        // Auto-select time
        if (analysis.suggestedTime) {
            const timeBtn = document.querySelector(`.time-btn[data-time="${analysis.suggestedTime}"]`);
            if (timeBtn) {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                timeBtn.classList.add('active');
                state.timeOfDay = analysis.suggestedTime;
            }
        }

        // Auto-generate if enabled
        if (state.autoMode) {
            updateLoadingStatus('Generating lifestyle photo...');
            await generateLifestylePhoto();
        } else {
            showSuccess('Scene settings suggested based on your product!');
        }
    } catch (error) {
        console.log('Auto-analysis skipped:', error.message);
        // Still try to generate with defaults if auto mode
        if (state.autoMode) {
            updateLoadingStatus('Generating lifestyle photo...');
            await generateLifestylePhoto();
        }
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
        html += `<div class="skeleton-card"><div class="skeleton-image"></div></div>`;
    }
    elements.skeletonGrid.innerHTML = html;
}

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultDisplay.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.loadingSubtext.textContent = 'This may take 10-30 seconds';
    elements.generateBtn.disabled = true;
    elements.generateBtn.classList.add('loading');
    updateSkeletonGrid(state.variations || 1);
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.generateBtn.disabled = false;
    elements.generateBtn.classList.remove('loading');
}

function updateLoadingStatus(message) {
    if (elements.loadingStatus) {
        elements.loadingStatus.textContent = message;
    }
}

function showResult(imageUrl) {
    hideLoading();
    elements.resultImage.src = imageUrl;
    elements.resultImage.style.display = 'block';
    elements.resultGrid.style.display = 'none';
    elements.resultDisplay.style.display = 'block';
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];
    // Hide compare button for single results
    if (elements.compareBtn) {
        elements.compareBtn.style.display = 'none';
    }
    addToHistory(imageUrl);
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

    elements.resultDisplay.style.display = 'block';
    state.generatedImageUrl = imageUrls[0];
    state.generatedImages = imageUrls;

    // Show compare button if we have multiple images
    if (elements.compareBtn && imageUrls.length >= 2) {
        elements.compareBtn.style.display = 'inline-flex';
    }

    // Add click handlers for selection
    elements.resultGrid.querySelectorAll('.result-grid-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.resultGrid.querySelectorAll('.result-grid-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const index = parseInt(item.dataset.index, 10);
            state.generatedImageUrl = imageUrls[index];
        });
    });

    addToHistory(imageUrls[0], imageUrls);
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
// HISTORY & FAVORITES
// ============================================

async function addToHistory(imageUrl, allImages = null) {
    const images = allImages || [imageUrl];
    await history.add(imageUrl, {
        imageUrls: images,
        scene: state.scene,
        mood: state.mood,
        timeOfDay: state.timeOfDay,
        seed: state.lastSeed
    });
    state.history = history.getAll();
    renderHistory();
}

function renderHistory() {
    const items = history.getAll();

    // Update count
    if (elements.historyCount) {
        elements.historyCount.textContent = items.length;
    }

    // Hide entire panel if empty
    if (elements.historySection) {
        elements.historySection.style.display = items.length === 0 ? 'none' : 'block';
    }

    if (items.length === 0) {
        elements.historyGrid.innerHTML = '';
        return;
    }

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="History item" loading="lazy">
            ${item.imageUrls && item.imageUrls.length > 1 ? `<span class="history-item-variants">${item.imageUrls.length}</span>` : ''}
        </div>
    `).join('');

    // Add click handlers
    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = item.dataset.id;
            const historyItem = history.findById(id);
            if (historyItem) {
                const images = await history.getImages(id);
                if (images && images.length > 0) {
                    openLightbox(images[0]);
                } else if (historyItem.imageUrl) {
                    openLightbox(historyItem.imageUrl);
                }
            }
        });
    });
}

async function saveFavorite() {
    if (!state.generatedImageUrl) {
        showError('No image to save');
        return;
    }

    const settings = captureCurrentSettings();

    const favorite = await favorites.add({
        name: state.sceneDetails || `${state.scene} - ${state.mood}`,
        imageUrl: state.generatedImageUrl,
        imageUrls: state.generatedImages,
        seed: state.lastSeed,
        prompt: state.lastPrompt,
        productImageBase64: state.uploadedImageBase64,
        styleReferenceBase64: state.styleReferenceBase64,
        settings
    });

    if (favorite) {
        showSuccess('Added to favorites!');
        renderFavorites();
    }
}

function renderFavorites() {
    const items = favorites.getAll();

    // Update count
    if (elements.favoritesCount) {
        elements.favoritesCount.textContent = items.length;
    }

    // Hide entire panel if empty
    if (elements.favoritesSection) {
        elements.favoritesSection.style.display = items.length === 0 ? 'none' : 'block';
    }

    if (items.length === 0) {
        elements.favoritesGrid.innerHTML = '';
        return;
    }

    elements.favoritesGrid.innerHTML = items.map(item => `
        <div class="favorite-item" data-id="${item.id}">
            <img src="${item.thumbnail || item.imageUrl}" alt="${item.name || 'Favorite'}" loading="lazy">
            ${item.imageUrls && item.imageUrls.length > 1 ? `<span class="favorite-item-variants">${item.imageUrls.length}</span>` : ''}
            <div class="favorite-item-overlay">
                <button class="favorite-load-btn" title="Load settings">
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

    // Add click handlers
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

        // Click on image opens modal
        item.querySelector('img')?.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-load-btn') && !e.target.closest('.favorite-delete-btn')) {
                openFavoritesModal(id);
            }
        });
    });
}

function loadFavorite(id) {
    const fav = favorites.findById(id);
    if (!fav) return;

    state.selectedFavorite = fav;
    const settings = fav.settings || {};

    // Apply scene
    if (settings.scene) {
        state.scene = settings.scene;
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === settings.scene);
        });
    }

    // Apply mood
    if (settings.mood) {
        state.mood = settings.mood;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === settings.mood);
        });
    }

    // Apply time
    if (settings.timeOfDay) {
        state.timeOfDay = settings.timeOfDay;
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.time === settings.timeOfDay);
        });
    }

    // Apply variations
    if (settings.variations) {
        state.variations = settings.variations;
        document.querySelectorAll('[data-option="variations"]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === String(settings.variations));
        });
    }

    // Apply advanced settings
    if (elements.sceneDetails && settings.sceneDetails) elements.sceneDetails.value = settings.sceneDetails;
    if (elements.season && settings.season) elements.season.value = settings.season;
    if (elements.lighting && settings.lighting) elements.lighting.value = settings.lighting;
    if (elements.shotType && settings.shotType) elements.shotType.value = settings.shotType;
    if (elements.cameraAngle && settings.cameraAngle) elements.cameraAngle.value = settings.cameraAngle;
    if (elements.photoStyle && settings.photoStyle) elements.photoStyle.value = settings.photoStyle;
    if (elements.aspectRatio && settings.aspectRatio) elements.aspectRatio.value = settings.aspectRatio;
    if (elements.qualityLevel && settings.qualityLevel) elements.qualityLevel.value = settings.qualityLevel;
    if (elements.depthOfField && settings.depthOfField) elements.depthOfField.value = settings.depthOfField;
    if (elements.colorGrading && settings.colorGrading) elements.colorGrading.value = settings.colorGrading;
    if (elements.seedInput && fav.seed) elements.seedInput.value = fav.seed;
    if (elements.negativePrompt && settings.negativePrompt) elements.negativePrompt.value = settings.negativePrompt;

    // Restore style reference if available
    if (fav.styleReferenceBase64) {
        state.styleReferenceBase64 = fav.styleReferenceBase64;
        elements.stylePreviewImg.src = fav.styleReferenceBase64;
        elements.styleUploadArea.style.display = 'none';
        elements.stylePreviewContainer.style.display = 'inline-block';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.style.display = 'block';
        }
    }

    showSuccess('Settings loaded! Upload a product image to generate.');
}

function captureCurrentSettings() {
    return {
        scene: state.scene,
        sceneDetails: elements.sceneDetails?.value || '',
        mood: state.mood,
        timeOfDay: state.timeOfDay,
        season: elements.season?.value || 'auto',
        lighting: elements.lighting?.value || 'natural',
        shotType: elements.shotType?.value || 'medium',
        cameraAngle: elements.cameraAngle?.value || 'eye-level',
        photoStyle: elements.photoStyle?.value || 'lifestyle',
        aspectRatio: elements.aspectRatio?.value || '4:5',
        qualityLevel: elements.qualityLevel?.value || 'high',
        depthOfField: elements.depthOfField?.value || 'auto',
        colorGrading: elements.colorGrading?.value || 'auto',
        negativePrompt: elements.negativePrompt?.value || '',
        variations: state.variations,
        model: elements.aiModel?.value
    };
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
// FAVORITES MODAL
// ============================================

async function openFavoritesModal(id) {
    const fav = favorites.findById(id);
    if (!fav) return;

    state.selectedFavorite = fav;

    // Get full images from IndexedDB
    const images = await favorites.getImages(id);
    const primaryImage = (images && images.length > 0) ? images[0] : fav.imageUrl;

    // Set preview image
    if (elements.favoritePreviewImg) {
        elements.favoritePreviewImg.src = primaryImage || '';
    }

    // Handle variants
    if (elements.favoriteVariants) {
        const allImages = images || (fav.imageUrls ? fav.imageUrls : [fav.imageUrl]);
        if (allImages.length > 1) {
            elements.favoriteVariants.style.display = 'grid';
            elements.favoriteVariants.innerHTML = allImages.map((url, i) => `
                <div class="favorite-variant${i === 0 ? ' selected' : ''}" data-index="${i}">
                    <img src="${url}" alt="Variant ${i + 1}">
                </div>
            `).join('');

            // Add click handlers for variants
            elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(v => {
                v.addEventListener('click', () => {
                    elements.favoriteVariants.querySelectorAll('.favorite-variant').forEach(vv => vv.classList.remove('selected'));
                    v.classList.add('selected');
                    const idx = parseInt(v.dataset.index, 10);
                    elements.favoritePreviewImg.src = allImages[idx];
                });
            });
        } else {
            elements.favoriteVariants.style.display = 'none';
        }
    }

    // Set name
    if (elements.favoriteNameInput) {
        elements.favoriteNameInput.value = fav.name || '';
    }

    // Set date
    if (elements.favoriteDate) {
        const date = new Date(fav.timestamp || fav.id);
        elements.favoriteDate.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Set seed
    if (elements.favoriteSeedValue) {
        elements.favoriteSeedValue.textContent = fav.seed || 'N/A';
    }

    // Show modal
    if (elements.favoritesModal) {
        elements.favoritesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFavoritesModal() {
    if (elements.favoritesModal) {
        elements.favoritesModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    state.selectedFavorite = null;
}

// ============================================
// DOWNLOAD
// ============================================

function downloadImage() {
    if (state.generatedImageUrl) {
        SharedDownload.downloadImage(state.generatedImageUrl, 'lifestyle-photo');
    }
}

// ============================================
// STYLE REFERENCE
// ============================================

function handleStyleReferenceUpload(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.styleReferenceBase64 = e.target.result;
        elements.stylePreviewImg.src = e.target.result;
        elements.styleUploadArea.style.display = 'none';
        elements.stylePreviewContainer.style.display = 'inline-block';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Auto mode toggle - load persisted preference
    state.autoMode = localStorage.getItem('lifestyle_auto_mode') !== 'false';
    if (elements.autoModeToggle) {
        elements.autoModeToggle.checked = state.autoMode;
        elements.autoModeToggle.addEventListener('change', (e) => {
            state.autoMode = e.target.checked;
            localStorage.setItem('lifestyle_auto_mode', state.autoMode);
        });
    }

    // Form submit
    elements.lifestyleForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        generateLifestylePhoto();
    });

    // Cancel generation
    elements.cancelBtn?.addEventListener('click', handleCancel);

    // Image upload
    SharedUpload.setup(elements.uploadArea, elements.productPhoto, {
        onError: showError,
        onLoad: (base64, file) => {
            state.uploadedImage = file;
            state.uploadedImageBase64 = base64;
            elements.previewImg.src = base64;
            elements.imagePreview.style.display = 'block';
            elements.uploadArea.style.display = 'none';
            // Auto-analyze product
            analyzeProductImage();
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

    // Scene buttons
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.scene = btn.dataset.scene;
        });
    });

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.mood = btn.dataset.mood;
        });
    });

    // Time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.timeOfDay = btn.dataset.time;
        });
    });

    // Variation buttons
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-option="variations"]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.variations = parseInt(btn.dataset.value) || 1;
        });
    });

    // Scene details input
    elements.sceneDetails?.addEventListener('input', (e) => {
        state.sceneDetails = e.target.value;
    });

    // Basic Settings toggle
    elements.basicToggle?.addEventListener('click', () => {
        const isOpen = elements.basicSection.classList.toggle('open');
        elements.basicToggle.setAttribute('aria-expanded', isOpen);
    });

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        const isOpen = elements.advancedSection.classList.toggle('open');
        elements.advancedToggle.setAttribute('aria-expanded', isOpen);
    });

    // Settings toggle
    elements.settingsToggle?.addEventListener('click', () => {
        const isOpen = elements.settingsSection.classList.toggle('open');
        elements.settingsToggle.setAttribute('aria-expanded', isOpen);
    });

    // Style Reference upload
    elements.styleUploadArea?.addEventListener('click', () => {
        elements.styleReference?.click();
    });

    elements.styleReference?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleStyleReferenceUpload(e.target.files[0]);
        }
    });

    elements.removeStyleRef?.addEventListener('click', () => {
        state.styleReferenceBase64 = null;
        elements.styleReference.value = '';
        elements.styleUploadArea.style.display = 'block';
        elements.stylePreviewContainer.style.display = 'none';
        if (elements.styleStrengthSlider) {
            elements.styleStrengthSlider.style.display = 'none';
        }
    });

    elements.styleStrength?.addEventListener('input', (e) => {
        if (elements.styleStrengthValue) {
            elements.styleStrengthValue.textContent = `${e.target.value}%`;
        }
    });

    // API key handling
    elements.apiKey?.addEventListener('change', () => {
        const key = elements.apiKey.value.trim();
        StudioBootstrap.saveApiKey(key, state, elements.apiStatus);
    });

    elements.toggleApiKey?.addEventListener('click', () => {
        const type = elements.apiKey.type === 'password' ? 'text' : 'password';
        elements.apiKey.type = type;
    });

    // Actions
    elements.downloadBtn?.addEventListener('click', downloadImage);
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.adjustBtn?.addEventListener('click', adjustPhoto);

    elements.copyPromptBtn?.addEventListener('click', () => {
        if (state.lastPrompt) {
            navigator.clipboard.writeText(state.lastPrompt);
            showSuccess('Prompt copied to clipboard!');
        }
    });

    // Image Info toggle
    if (elements.imageInfoBtn && elements.imageInfoOverlay) {
        elements.imageInfoBtn.addEventListener('click', () => {
            const isVisible = elements.imageInfoOverlay.style.display !== 'none';
            if (isVisible) {
                elements.imageInfoOverlay.style.display = 'none';
                elements.imageInfoBtn.classList.remove('active');
            } else {
                const info = {
                    seed: state.lastSeed,
                    model: elements.aiModel?.value || 'Unknown',
                    scene: state.scene,
                    mood: state.mood,
                    time: state.timeOfDay
                };
                elements.imageInfoOverlay.innerHTML = `
                    <div class="info-row"><span>Seed:</span> <code>${info.seed || 'N/A'}</code></div>
                    <div class="info-row"><span>Model:</span> ${info.model.split('/').pop()}</div>
                    <div class="info-row"><span>Scene:</span> ${info.scene}</div>
                    <div class="info-row"><span>Mood:</span> ${info.mood}</div>
                    <div class="info-row"><span>Time:</span> ${info.time}</div>
                `;
                elements.imageInfoOverlay.style.display = 'block';
                elements.imageInfoBtn.classList.add('active');
            }
        });
    }

    // Compare button
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

    // Clear history
    elements.clearHistoryBtn?.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
            state.history = [];
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
    elements.lightboxDownload?.addEventListener('click', () => {
        if (elements.lightboxImage.src) {
            SharedDownload.downloadImage(elements.lightboxImage.src, 'lifestyle-photo');
        }
    });

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
            SharedDownload.downloadImage(elements.favoritePreviewImg.src, 'lifestyle-favorite');
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

    elements.copyFavoriteSeed?.addEventListener('click', () => {
        if (state.selectedFavorite?.seed) {
            navigator.clipboard.writeText(String(state.selectedFavorite.seed));
            showSuccess('Seed copied!');
        }
    });

    elements.favoriteNameInput?.addEventListener('change', () => {
        if (state.selectedFavorite && elements.favoriteNameInput) {
            favorites.update(state.selectedFavorite.id, { name: elements.favoriteNameInput.value });
            renderFavorites();
        }
    });

    // Result image click for lightbox
    elements.resultImage?.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            openLightbox(state.generatedImageUrl);
        }
    });

    // Note: Keyboard shortcuts (Ctrl+Enter, Ctrl+D, Escape) are handled by StudioBootstrap
}

// ============================================
// INITIALIZATION
// ============================================

let initialized = false;

async function init() {
    if (initialized) return;
    initialized = true;

    // Cache DOM elements first
    initElements();

    // Use StudioBootstrap for common initialization
    await StudioBootstrap.init({
        studioId: STUDIO_ID,
        elements: {
            themeToggle: document.getElementById('themeToggle'),
            accountContainer: document.getElementById('accountContainer')
        },
        shortcuts: {
            generate: generateLifestylePhoto,
            download: downloadImage,
            escape: () => {
                closeLightbox();
                closeFavoritesModal();
            }
        }
    });

    // Load API key
    StudioBootstrap.loadApiKey(state, elements.apiKey, elements.apiStatus);

    // Setup event listeners
    setupEventListeners();

    // Load and render persisted data
    state.history = history.getAll();
    renderHistory();
    renderFavorites();

    // Initialize preset selector if available
    if (typeof SharedPresets !== 'undefined' && elements.presetSelectorContainer) {
        SharedPresets.renderSelector(
            STUDIO_ID,
            (preset) => {
                if (preset && preset.settings) {
                    applyPresetSettings(preset.settings);
                }
            },
            () => captureCurrentSettings(),
            elements.presetSelectorContainer
        );
    }

    // Initialize cost estimator if available
    if (typeof SharedCostEstimator !== 'undefined' && elements.costEstimatorContainer) {
        initCostEstimator();
    }

    ngLog?.info?.(`${STUDIO_ID} Studio: Ready!`);
}

function applyPresetSettings(settings) {
    if (settings.scene) {
        state.scene = settings.scene;
        document.querySelectorAll('.scene-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scene === settings.scene);
        });
    }
    if (settings.mood) {
        state.mood = settings.mood;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === settings.mood);
        });
    }
    if (settings.timeOfDay) {
        state.timeOfDay = settings.timeOfDay;
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.time === settings.timeOfDay);
        });
    }
}

function initCostEstimator() {
    const updateCostEstimator = () => {
        SharedCostEstimator.renderDisplay(
            elements.aiModel?.value || 'google/gemini-3-pro-image-preview',
            state.variations,
            500,
            elements.costEstimatorContainer
        );
    };
    updateCostEstimator();
    elements.aiModel?.addEventListener('change', updateCostEstimator);
    document.querySelectorAll('[data-option="variations"]').forEach(btn => {
        btn.addEventListener('click', updateCostEstimator);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}
