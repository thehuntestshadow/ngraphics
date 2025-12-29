/**
 * Model Studio - AI Model Photo Generator
 * Generates in-context product photos with AI models
 */

// ============================================
// APPLICATION STATE
// ============================================
const state = {
    apiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedImageUrl: null,
    generatedImages: [],
    history: [],
    lastPrompt: null,
    // Settings
    productType: 'clothing',
    gender: 'female',
    age: 'young',
    ethnicity: 'caucasian',
    bodyType: 'average',
    hair: 'any',
    shotType: 'full-body',
    scene: 'studio',
    photoStyle: 'editorial',
    pose: 'natural',
    lighting: 'studio',
    cameraAngle: 'eye-level',
    expression: 'neutral',
    aspectRatio: '4:5',
    variations: 1,
    collageMode: 'off',
    collageShowFace: false,
    negativePrompt: '',
    // Quality enhancements
    depthOfField: 'auto',
    colorGrading: 'auto',
    skinRetouch: 'natural',
    composition: 'auto',
    qualityLevel: 'high',
    realismLevel: 'auto',
    // Camera & Technical
    focalLength: 'auto',
    filmGrain: 'none',
    contrast: 'auto',
    // Product
    productEnhancement: 'auto',
    contextDescription: '',
    // Scene details
    sceneDetailMode: 'auto',
    sceneDetailText: '',
    // Favorites
    selectedFavorite: null,
    selectedFavoriteImages: null,
    lastSeed: null
};

// Favorites instance
const favorites = new SharedFavorites('model_studio_favorites', 30);

// ============================================
// DOM ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Form
        form: document.getElementById('modelForm'),
        uploadArea: document.getElementById('uploadArea'),
        productPhoto: document.getElementById('productPhoto'),
        imagePreview: document.getElementById('imagePreview'),
        previewImg: document.getElementById('previewImg'),
        removeImageBtn: document.getElementById('removeImage'),
        productDescription: document.getElementById('productDescription'),

        // Model options
        modelEthnicity: document.getElementById('modelEthnicity'),
        modelBodyType: document.getElementById('modelBodyType'),
        bodyTypeOption: document.getElementById('bodyTypeOption'),
        modelHair: document.getElementById('modelHair'),

        // Advanced options
        advancedSection: document.getElementById('advancedSection'),
        advancedToggle: document.getElementById('advancedToggle'),
        modelPose: document.getElementById('modelPose'),
        lighting: document.getElementById('lighting'),
        cameraAngle: document.getElementById('cameraAngle'),
        expression: document.getElementById('expression'),
        aspectRatio: document.getElementById('aspectRatio'),
        collageMode: document.getElementById('collageMode'),
        collageFaceOption: document.getElementById('collageFaceOption'),
        aiModel: document.getElementById('aiModel'),
        negativePrompt: document.getElementById('negativePrompt'),
        // Seed control
        randomSeedCheck: document.getElementById('randomSeedCheck'),
        seedInput: document.getElementById('seedInput'),
        // Quality enhancements
        depthOfField: document.getElementById('depthOfField'),
        colorGrading: document.getElementById('colorGrading'),
        skinRetouch: document.getElementById('skinRetouch'),
        composition: document.getElementById('composition'),
        qualityLevel: document.getElementById('qualityLevel'),
        realismLevel: document.getElementById('realismLevel'),
        // Camera & Technical
        focalLength: document.getElementById('focalLength'),
        filmGrain: document.getElementById('filmGrain'),
        contrast: document.getElementById('contrast'),
        // Product
        productEnhancement: document.getElementById('productEnhancement'),
        contextDescriptionGroup: document.getElementById('contextDescriptionGroup'),
        contextDescription: document.getElementById('contextDescription'),

        // Scene details
        sceneDetailSection: document.getElementById('sceneDetailSection'),
        sceneDetailInput: document.getElementById('sceneDetailInput'),
        sceneDetailText: document.getElementById('sceneDetailText'),
        sceneNameLabel: document.getElementById('sceneNameLabel'),

        // Settings
        settingsSection: document.getElementById('settingsSection'),
        settingsToggle: document.getElementById('settingsToggle'),
        apiKeyInput: document.getElementById('apiKey'),
        toggleApiKeyBtn: document.getElementById('toggleApiKey'),
        saveApiKeyBtn: document.getElementById('saveApiKey'),

        // Generate
        generateBtn: document.getElementById('generateBtn'),

        // Messages
        errorMessage: document.getElementById('errorMessage'),
        successMessage: document.getElementById('successMessage'),

        // Results
        resultPlaceholder: document.getElementById('resultPlaceholder'),
        loadingContainer: document.getElementById('loadingContainer'),
        loadingStatus: document.getElementById('loadingStatus'),
        resultContainer: document.getElementById('resultContainer'),
        resultImage: document.getElementById('resultImage'),
        resultGrid: document.getElementById('resultGrid'),
        downloadBtn: document.getElementById('downloadBtn'),
        regenerateBtn: document.getElementById('regenerateBtn'),
        feedbackTextarea: document.getElementById('feedbackTextarea'),
        adjustBtn: document.getElementById('adjustBtn'),

        // History
        historySection: document.getElementById('historySection'),
        historyGrid: document.getElementById('historyGrid'),
        historyCount: document.getElementById('historyCount'),
        historyEmpty: document.getElementById('historyEmpty'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),

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

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxDownload: document.getElementById('lightboxDownload'),

        // API Status
        apiStatus: document.getElementById('apiStatus')
    };
}

// ============================================
// UTILITY FUNCTIONS (wrappers for SharedUI)
// ============================================
function showError(message) {
    SharedUI.showError(elements.errorMessage, message);
}

function showSuccess(message) {
    SharedUI.showSuccess(elements.successMessage, message);
}

function showLoading() {
    SharedUI.showLoading(elements.resultPlaceholder, elements.loadingContainer, elements.resultContainer);
}

function hideLoading() {
    SharedUI.hideLoading(elements.loadingContainer);
}

function updateLoadingStatus(status) {
    SharedUI.updateLoadingStatus(elements.loadingStatus, status);
}

// ============================================
// API KEY HANDLING (uses SharedAPI)
// ============================================
function loadApiKey() {
    const savedKey = SharedAPI.getKey();
    if (savedKey) {
        state.apiKey = savedKey;
        elements.apiKeyInput.value = savedKey;
        SharedUI.updateApiStatus(elements.apiStatus, true);
    }
}

function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (SharedAPI.saveKey(key)) {
        state.apiKey = key;
        SharedUI.updateApiStatus(elements.apiStatus, true);
        SharedUI.showSuccess(elements.successMessage, 'API key saved!');
    }
}

// ============================================
// IMAGE UPLOAD HANDLING (uses SharedUpload)
// ============================================
function setupImageUpload() {
    SharedUpload.setup(elements.uploadArea, elements.productPhoto, {
        onError: showError,
        onLoad: (base64, file) => {
            state.uploadedImage = file;
            state.uploadedImageBase64 = base64;
            elements.previewImg.src = base64;
            elements.imagePreview.style.display = 'block';
            elements.uploadArea.style.display = 'none';
            analyzeProductImage();
        }
    });

    elements.removeImageBtn.addEventListener('click', () => {
        state.uploadedImage = null;
        state.uploadedImageBase64 = null;
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'flex';
        elements.productPhoto.value = '';
    });
}

// ============================================
// AUTO IMAGE ANALYSIS
// ============================================
async function analyzeProductImage() {
    if (!state.uploadedImageBase64) return;

    if (!state.apiKey) {
        // Don't show error, just skip analysis if no API key
        return;
    }

    // Show analyzing state in the description field
    elements.productDescription.value = '';
    elements.productDescription.placeholder = 'Analyzing image...';
    elements.productDescription.disabled = true;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'NGRAPHICS Model Studio'
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
                                text: `Analyze this product image and return ONLY valid JSON (no markdown):
{
  "description": "Brief product description for fashion photography (e.g., 'Black leather crossbody bag with gold chain strap')",
  "productType": "clothing|accessory|handheld|footwear|jewelry|bag",
  "suggestedGender": "female|male|any"
}

Be concise. Focus on key visual details: color, material, style.`
                            }
                        ]
                    }
                ],
                max_tokens: 200
            })
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content?.trim() || '';

        // Clean up response
        content = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        try {
            const analysis = JSON.parse(content);

            // Fill in product description
            if (analysis.description) {
                elements.productDescription.value = analysis.description;
            }

            // Auto-select product type
            if (analysis.productType) {
                const typeBtn = document.querySelector(`.product-type-btn[data-type="${analysis.productType}"]`);
                if (typeBtn) {
                    document.querySelectorAll('.product-type-btn').forEach(b => b.classList.remove('active'));
                    typeBtn.classList.add('active');
                    state.productType = analysis.productType;

                    // Show/hide body type option
                    if (elements.bodyTypeOption) {
                        elements.bodyTypeOption.style.display =
                            (analysis.productType === 'clothing' || analysis.productType === 'footwear') ? 'flex' : 'none';
                    }
                }
            }

            // Auto-select gender if suggested
            if (analysis.suggestedGender) {
                const genderBtn = document.querySelector(`.option-btn[data-option="gender"][data-value="${analysis.suggestedGender}"]`);
                if (genderBtn) {
                    document.querySelectorAll('.option-btn[data-option="gender"]').forEach(b => b.classList.remove('active'));
                    genderBtn.classList.add('active');
                    state.gender = analysis.suggestedGender;
                }
            }

            showSuccess('Product analyzed!');
        } catch (parseError) {
            console.error('Failed to parse analysis:', parseError, content);
            // If JSON parse fails, try to use the raw content as description
            if (content && content.length < 200) {
                elements.productDescription.value = content;
            }
        }

    } catch (error) {
        console.error('Analysis error:', error);
        // Silent fail - don't show error, just let user fill manually
    } finally {
        elements.productDescription.disabled = false;
        elements.productDescription.placeholder = 'e.g., Black leather crossbody bag with gold chain strap';
    }
}

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const productDesc = elements.productDescription.value.trim() || 'product';

    // Product type descriptions
    const productTypeDesc = {
        clothing: `wearing the ${productDesc}`,
        accessory: `wearing/using the ${productDesc} as an accessory`,
        handheld: `holding the ${productDesc} naturally in their hands`,
        footwear: `wearing the ${productDesc} on their feet`,
        jewelry: `wearing the ${productDesc} as jewelry`,
        bag: `carrying/holding the ${productDesc}`
    };

    // Build model description with proper sentence flow
    const ageDesc = {
        child: 'around 8-12 years old',
        teen: 'around 13-17 years old',
        young: 'in their early 20s',
        adult: 'in their late 20s to early 30s',
        mature: 'in their 40s',
        senior: 'in their 50s or older'
    };

    const ethnicityMap = {
        any: '',
        caucasian: 'Caucasian',
        african: 'Black/African',
        asian: 'East Asian',
        hispanic: 'Hispanic/Latino',
        'middle-eastern': 'Middle Eastern',
        'south-asian': 'South Asian',
        mixed: 'mixed-ethnicity'
    };

    const bodyTypeMap = {
        slim: 'slim build',
        average: 'average build',
        curvy: 'curvy build',
        muscular: 'athletic/muscular build'
    };

    const hairMap = {
        any: '',
        long: 'long hair',
        short: 'short hair',
        curly: 'curly hair',
        blonde: 'blonde hair',
        bald: 'bald/shaved head'
    };

    // Build description parts
    const ethnicity = ethnicityMap[state.ethnicity] || '';
    const gender = state.gender !== 'any' ? state.gender : '';
    const age = ageDesc[state.age] || '';
    const hair = hairMap[state.hair] || '';
    const bodyType = (state.productType === 'clothing' || state.productType === 'footwear')
        ? (bodyTypeMap[state.bodyType] || '')
        : '';

    // Construct flowing sentence
    let modelDesc = 'a';
    if (ethnicity) modelDesc += ` ${ethnicity}`;
    if (gender) modelDesc += ` ${gender}`;
    modelDesc += ' model';
    if (age) modelDesc += ` ${age}`;

    // Add physical attributes
    const attributes = [bodyType, hair].filter(Boolean);
    if (attributes.length > 0) {
        modelDesc += ` with ${attributes.join(' and ')}`;
    }

    // Shot type descriptions
    const shotDesc = {
        'full-body': 'full body shot showing the entire outfit',
        'half-body': 'half body/waist-up shot',
        portrait: 'portrait/headshot focusing on upper body',
        closeup: 'close-up shot focusing on the product',
        hands: 'close-up of hands holding/interacting with the product',
        detail: 'extreme close-up detail shot of the product being worn/held'
    };

    // Scene descriptions
    const sceneDescBase = {
        studio: 'professional photography studio with clean backdrop',
        urban: 'urban city street with modern architecture',
        nature: 'natural outdoor setting with greenery and trees',
        beach: 'beach or coastal setting with sand and ocean',
        cafe: 'cozy café or coffee shop interior with warm ambiance',
        office: 'modern professional office environment',
        gym: 'modern gym or fitness studio with equipment',
        home: 'stylish modern home interior with comfortable furniture and warm lighting',
        luxury: 'luxurious upscale high-end setting',
        outdoor: 'scenic outdoor setting with natural light and open space'
    };

    // Build scene description with optional custom details
    let sceneDesc = {};
    for (const [key, value] of Object.entries(sceneDescBase)) {
        if (state.sceneDetailMode === 'custom' && state.sceneDetailText?.trim() && key === state.scene) {
            sceneDesc[key] = `${value}, specifically: ${state.sceneDetailText.trim()}`;
        } else {
            sceneDesc[key] = value;
        }
    }

    // Photo style descriptions
    const styleDesc = {
        editorial: 'high-fashion editorial magazine photography style, dramatic and artistic',
        commercial: 'clean commercial e-commerce photography, well-lit and professional',
        lifestyle: 'natural lifestyle photography, candid and authentic feeling',
        artistic: 'creative artistic fashion photography with unique composition'
    };

    // Pose descriptions
    const poseDesc = {
        natural: 'natural relaxed pose',
        confident: 'confident power pose',
        casual: 'casual candid pose',
        dynamic: 'dynamic pose with movement',
        elegant: 'elegant graceful pose',
        seated: 'seated pose',
        walking: 'walking pose with natural movement',
        leaning: 'leaning against something casually'
    };

    // Lighting descriptions
    const lightingDesc = {
        studio: 'professional studio lighting setup, clean and even',
        natural: 'natural daylight, bright and even',
        golden: 'warm golden hour lighting with soft orange tones',
        soft: 'soft diffused lighting, flattering and even with minimal shadows',
        dramatic: 'dramatic cinematic lighting with strong contrast and shadows',
        highkey: 'high key lighting, bright and airy with minimal shadows',
        lowkey: 'low key lighting, dark and moody with dramatic shadows',
        backlit: 'backlit with rim light effect, glowing edges'
    };

    // Camera angle descriptions
    const angleDesc = {
        'eye-level': 'shot at eye level',
        low: 'shot from low angle looking up',
        high: 'shot from high angle looking down'
    };

    // Expression
    const expressionDesc = {
        neutral: 'neutral calm expression',
        smile: 'gentle natural smile',
        serious: 'serious confident expression',
        candid: 'candid natural expression'
    };

    // Aspect ratio
    const aspectRatioMap = {
        '1:1': 'square format (1:1)',
        '4:5': 'portrait format (4:5)',
        '3:4': 'portrait format (3:4)',
        '2:3': 'classic portrait (2:3)',
        '9:16': 'vertical story format (9:16)',
        '16:9': 'landscape format (16:9)'
    };

    // Multi-angle collage descriptions
    const collageModeDesc = {
        'off': null,
        '2-angles': {
            count: 2,
            layout: 'side-by-side 2-panel collage',
            angles: 'front view and side profile view'
        },
        '3-angles': {
            count: 3,
            layout: '3-panel collage grid',
            angles: 'front view, side profile, and three-quarter angle'
        },
        '4-angles': {
            count: 4,
            layout: '2x2 grid collage',
            angles: 'front view, left profile, right profile, and back view'
        },
        '6-angles': {
            count: 6,
            layout: '2x3 or 3x2 grid collage',
            angles: 'front, left side, right side, back, three-quarter left, and three-quarter right views'
        }
    };

    // Depth of field descriptions
    const dofDesc = {
        auto: '',
        shallow: 'shallow depth of field with creamy bokeh background, shot at f/1.8, subject sharply in focus with beautifully blurred background',
        medium: 'medium depth of field at f/4, balanced focus with slight background blur',
        deep: 'deep depth of field at f/8-f/11, sharp throughout from foreground to background',
        'extreme-bokeh': 'extremely shallow depth of field at f/1.2, dreamy bokeh with very soft background blur, only eyes in sharp focus'
    };

    // Color grading descriptions
    const colorGradingDesc = {
        auto: '',
        warm: 'warm golden color grading with amber highlights and cozy tones',
        cool: 'cool moody color grading with blue shadows and desaturated highlights',
        airy: 'bright and airy look with lifted shadows, soft whites, and clean tones',
        vibrant: 'vibrant punchy colors with enhanced saturation and contrast',
        muted: 'muted desaturated color palette with faded look',
        cinematic: 'cinematic film look with rich contrast and teal-orange tones',
        bw: 'classic black and white with rich tonal range and contrast'
    };

    // Skin retouch descriptions
    const skinRetouchDesc = {
        natural: 'natural skin with minimal retouching, authentic texture and pores visible',
        light: 'light skin retouching, subtle smoothing while maintaining natural texture',
        moderate: 'moderate skin retouching, smooth skin with even tone',
        beauty: 'beauty editorial retouching, flawless smooth skin with subtle texture',
        flawless: 'high-end flawless retouching, perfect porcelain-like skin, magazine-ready'
    };

    // Composition descriptions
    const compositionDesc = {
        auto: '',
        center: 'centered composition with subject in the middle of the frame',
        'rule-of-thirds': 'off-center composition with subject placed using rule of thirds',
        'negative-space': 'generous negative space around the subject for clean minimal look'
    };

    // Quality level boosters
    const qualityBoosterDesc = {
        standard: 'professional photography',
        high: 'professional high-quality photography, sharp details, 4K resolution',
        ultra: '8K ultra high resolution, magazine-quality professional photography, shot with Canon EOS R5 and 85mm f/1.4 lens, professionally retouched',
        masterpiece: 'award-winning masterpiece photography, Vogue/Harper\'s Bazaar editorial quality, shot by world-renowned fashion photographer, 8K ultra-detailed, perfect lighting, professionally color graded and retouched, gallery-worthy'
    };

    // Realism level descriptions
    const realismDesc = {
        auto: '',
        photo: 'photorealistic, indistinguishable from a real photograph, lifelike textures and details',
        cinematic: 'cinematic realism with film-like quality, subtle film grain, movie-quality production value'
    };

    // Lens focal length descriptions
    const focalLengthDesc = {
        auto: '',
        '35mm': 'shot with 35mm lens, natural street photography perspective',
        '50mm': 'shot with 50mm lens, natural human eye perspective',
        '85mm': 'shot with 85mm portrait lens, flattering compression, beautiful background separation',
        '135mm': 'shot with 135mm telephoto lens, strong compression, creamy background blur'
    };

    // Film grain descriptions
    const filmGrainDesc = {
        none: '',
        subtle: 'subtle fine film grain for organic texture',
        heavy: 'heavy pronounced film grain, vintage artistic aesthetic'
    };

    // Contrast descriptions
    const contrastDesc = {
        auto: '',
        low: 'low contrast flat look, cinematic color grade with lifted blacks',
        high: 'high contrast punchy look with deep blacks and bright highlights'
    };

    // Product enhancement descriptions
    const productEnhancementDesc = {
        auto: '',
        texture: 'emphasize product texture and material details, show fabric weave or surface quality',
        shine: 'enhance product shine and reflections, glossy luxurious appearance',
        color: 'prioritize accurate product color reproduction, true-to-life colors',
        detail: 'maximum product detail, sharp focus on every element of the product',
        'in-context': '' // Handled separately with user's custom context description
    };

    // Get current quality settings from elements
    const currentDof = elements.depthOfField?.value || 'auto';
    const currentColorGrading = elements.colorGrading?.value || 'auto';
    const currentSkinRetouch = elements.skinRetouch?.value || 'natural';
    const currentComposition = elements.composition?.value || 'auto';
    const currentQualityLevel = elements.qualityLevel?.value || 'high';
    const currentRealism = elements.realismLevel?.value || 'auto';
    // Camera & Technical
    const currentFocalLength = elements.focalLength?.value || 'auto';
    const currentFilmGrain = elements.filmGrain?.value || 'none';
    const currentContrast = elements.contrast?.value || 'auto';
    // Product
    const currentProductEnhancement = elements.productEnhancement?.value || 'auto';

    // Build quality enhancements section
    let qualityItems = [];

    // Only include realism if not auto
    if (currentRealism !== 'auto' && realismDesc[currentRealism]) {
        qualityItems.push(`REALISM: ${realismDesc[currentRealism]}`);
    }

    // Camera & Technical
    if (currentFocalLength !== 'auto' && focalLengthDesc[currentFocalLength]) {
        qualityItems.push(`LENS: ${focalLengthDesc[currentFocalLength]}`);
    }

    if (currentDof !== 'auto' && dofDesc[currentDof]) {
        qualityItems.push(`DEPTH OF FIELD: ${dofDesc[currentDof]}`);
    }

    if (currentFilmGrain !== 'none' && filmGrainDesc[currentFilmGrain]) {
        qualityItems.push(`FILM GRAIN: ${filmGrainDesc[currentFilmGrain]}`);
    }

    if (currentContrast !== 'auto' && contrastDesc[currentContrast]) {
        qualityItems.push(`CONTRAST: ${contrastDesc[currentContrast]}`);
    }

    if (currentColorGrading !== 'auto' && colorGradingDesc[currentColorGrading]) {
        qualityItems.push(`COLOR GRADING: ${colorGradingDesc[currentColorGrading]}`);
    }

    if (currentSkinRetouch && skinRetouchDesc[currentSkinRetouch]) {
        qualityItems.push(`SKIN/RETOUCH: ${skinRetouchDesc[currentSkinRetouch]}`);
    }

    if (currentComposition !== 'auto' && compositionDesc[currentComposition]) {
        qualityItems.push(`COMPOSITION: ${compositionDesc[currentComposition]}`);
    }

    // Product
    if (currentProductEnhancement === 'in-context') {
        const contextDesc = elements.contextDescription?.value?.trim();
        if (contextDesc) {
            qualityItems.push(`PRODUCT CONTEXT: Show the product ${contextDesc}. Make it look natural and realistic in this context.`);
        }
    } else if (currentProductEnhancement !== 'auto' && productEnhancementDesc[currentProductEnhancement]) {
        qualityItems.push(`PRODUCT FOCUS: ${productEnhancementDesc[currentProductEnhancement]}`);
    }

    // Format quality section with header if there are items
    const qualitySection = qualityItems.length > 0
        ? `\n\nQUALITY ENHANCEMENTS:\n${qualityItems.join('\n')}`
        : '';

    // Check for collage mode
    const currentCollageMode = elements.collageMode?.value || 'off';
    const collageConfig = collageModeDesc[currentCollageMode];
    const showFaceInCollage = state.collageShowFace === true || state.collageShowFace === 'true';

    // Build the prompt
    let prompt;

    if (collageConfig) {
        if (showFaceInCollage) {
            // Multi-angle collage WITH face
            prompt = `Create a ${qualityBoosterDesc[currentQualityLevel] || 'professional photography'} - a ${collageConfig.layout} showing the SAME model from ${collageConfig.count} different angles.

COLLAGE LAYOUT: ${collageConfig.layout} with ${collageConfig.count} photos arranged neatly with minimal gaps.

ANGLES TO SHOW: ${collageConfig.angles}

SUBJECT: The EXACT SAME ${modelDesc}, ${productTypeDesc[state.productType] || 'with the product'}. The model's face, body, hair, and clothing must be IDENTICAL across all panels.

SHOT TYPE: Half-body and close-up shots showing both the model and product clearly.

GAZE DIRECTION: The model should NOT look directly at the camera. Vary the gaze:
- Looking slightly away, off to the side
- Looking down at the product
- Looking into the distance
- Candid, editorial feel - NOT passport-style poses

MODEL POSITIONS: Vary the model's body position across panels:
- Standing up
- Sitting down
- Lying down
- Turned around (back view)
- Leaning

SETTING: ${sceneDesc[state.scene] || sceneDesc.studio} - consistent background across all panels.

STYLE: ${styleDesc[state.photoStyle] || styleDesc.editorial}. ${lightingDesc[state.lighting] || ''}.

EXPRESSION: ${expressionDesc[state.expression] || expressionDesc.neutral} - consistent across all angles.${qualitySection}

CRITICAL REQUIREMENTS:
- ALL panels must show the EXACT SAME person (same face, hair, skin tone, body)
- Product must be clearly visible in each panel
- Consistent lighting and color grading across all panels
- Clean, professional collage layout
- Realistic, photographic result (not illustrated)`;
        } else {
            // Multi-angle collage WITHOUT face - product-focused
            prompt = `Create a ${qualityBoosterDesc[currentQualityLevel] || 'professional photography'} - a ${collageConfig.layout} showcasing a product from ${collageConfig.count} different angles.

COLLAGE LAYOUT: ${collageConfig.layout} with ${collageConfig.count} photos arranged neatly with minimal gaps.

PRODUCT ANGLES: Show the product from ${collageConfig.angles}

FRAMING: EXTREME CLOSE-UPS of the PRODUCT ONLY.
- DO NOT show the model's face in ANY panel
- Crop tightly on the product area (hands, torso, feet, etc.)
- Show hands holding/wearing the product, body parts wearing the item
- If clothing: show fabric texture, details, how it drapes on the body - but NO face
- If accessory/jewelry: tight shots on wrist, neck, ears, hands - but NO face
- If handheld: hands holding the product from different angles

MODEL POSITIONS: Vary the model's body position across panels for visual interest:
- Standing up
- Sitting down
- Lying down
- Turned around (back view)
- Leaning
Mix different positions to showcase how the product looks in various poses.

SETTING: ${sceneDesc[state.scene] || sceneDesc.studio} - consistent background across all panels.

STYLE: ${styleDesc[state.photoStyle] || styleDesc.editorial}. ${lightingDesc[state.lighting] || ''}.${qualitySection}

CRITICAL REQUIREMENTS:
- ABSOLUTELY NO FACES: Crop above the neck or frame to exclude the face entirely
- PRODUCT IS THE ONLY FOCUS: Every panel should be a tight close-up of the product
- Show the product being worn/held/used from different angles
- Consistent skin tone, lighting and color grading across all panels
- Clean, professional collage layout
- Realistic, photographic result (not illustrated)`;
        }
    } else {
        // Standard single shot mode
        prompt = `Create a ${qualityBoosterDesc[currentQualityLevel] || 'professional photography'}.

SUBJECT: A ${modelDesc}, ${productTypeDesc[state.productType] || 'with the product'}.

SHOT TYPE: ${shotDesc[state.shotType] || shotDesc['full-body']}, ${angleDesc[state.cameraAngle] || ''}.

SETTING: ${sceneDesc[state.scene] || sceneDesc.studio}.

STYLE: ${styleDesc[state.photoStyle] || styleDesc.editorial}. ${lightingDesc[state.lighting] || ''}.

POSE & EXPRESSION: ${poseDesc[state.pose] || poseDesc.natural}, with ${expressionDesc[state.expression] || expressionDesc.neutral}.

FORMAT: ${aspectRatioMap[state.aspectRatio] || 'portrait format'}.${qualitySection}

IMPORTANT INSTRUCTIONS:
- The product should be clearly visible and be the hero of the shot
- Model should look natural and professional
- Realistic, photographic result (not illustrated or cartoon)
- The model must be seamlessly integrated into the scene with consistent lighting, natural shadows, and proper depth of field
- No harsh edges or unnatural cutouts - the subject should look naturally present in the environment`;
    }

    if (state.uploadedImageBase64) {
        prompt += `\n\nPRODUCT REFERENCE IMAGE:
I am providing a reference image of the actual product. CRITICAL requirements:
- The product must appear EXACTLY as shown in the reference image
- Preserve exact colors, patterns, logos, labels, and all design details
- Do NOT modify, reinterpret, or stylize the product in any way
- The product should be the hero of the shot while matching the reference precisely`;
    }

    // Add negative prompt if provided
    const negativePromptText = elements.negativePrompt?.value?.trim();
    if (negativePromptText) {
        prompt += `\n\nTHINGS TO AVOID (do NOT include these in the image):
${negativePromptText}`;
    }

    return prompt;
}

// ============================================
// IMAGE GENERATION (uses SharedRequest)
// ============================================
async function makeGenerationRequest(requestBody, retries = 3) {
    return SharedRequest.makeRequest(requestBody, state.apiKey, 'NGRAPHICS Model Studio', retries);
}

async function generateModelPhoto() {
    if (!state.apiKey) {
        showError('Please enter your OpenRouter API key first');
        // Open settings
        elements.settingsSection.classList.add('open');
        return;
    }

    showLoading();
    updateLoadingStatus('Building prompt...');

    const prompt = generatePrompt();
    state.lastPrompt = prompt;

    const model = elements.aiModel.value;

    try {
        updateLoadingStatus('Connecting to AI...');

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
            messages: [
                { role: 'user', content: messageContent }
            ],
            modalities: ['image', 'text'],
            max_tokens: 4096
        };

        const variationsCount = state.variations;

        // Generate and store seed for this generation
        let baseSeed;
        if (!elements.randomSeedCheck?.checked && elements.seedInput?.value) {
            baseSeed = parseInt(elements.seedInput.value, 10);
        } else {
            baseSeed = Math.floor(Math.random() * 999999999);
        }
        state.lastSeed = baseSeed;

        if (variationsCount === 1) {
            updateLoadingStatus('Generating model photo...');
            requestBody.seed = baseSeed;
            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
            showSuccess('Photo generated successfully!');
        } else {
            updateLoadingStatus(`Generating ${variationsCount} variations...`);

            const requests = [];

            for (let i = 0; i < variationsCount; i++) {
                const varRequestBody = { ...requestBody, seed: baseSeed + i };
                requests.push(
                    makeGenerationRequest(varRequestBody).catch(err => {
                        console.error(`Variation ${i + 1} failed:`, err);
                        return null;
                    })
                );
            }

            const results = await Promise.all(requests);
            const successfulImages = results.filter(url => url !== null);

            if (successfulImages.length === 0) {
                throw new Error('All variations failed to generate');
            }

            if (successfulImages.length === 1) {
                showResult(successfulImages[0]);
            } else {
                showMultipleResults(successfulImages);
            }

            showSuccess(`Generated ${successfulImages.length} of ${variationsCount} photos!`);
        }

    } catch (error) {
        console.error('Generation error:', error);
        hideLoading();
        elements.resultPlaceholder.style.display = 'flex';
        showError(SharedRequest.formatError(error));
    }
}

function showResult(imageUrl) {
    hideLoading();

    elements.resultImage.src = imageUrl;
    elements.resultImage.style.display = 'block';
    elements.resultGrid.style.display = 'none';
    elements.resultContainer.classList.add('visible');
    state.generatedImageUrl = imageUrl;
    state.generatedImages = [imageUrl];

    elements.feedbackTextarea.value = '';

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

    elements.resultGrid.querySelectorAll('.result-grid-item').forEach(item => {
        item.addEventListener('click', () => {
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

    elements.feedbackTextarea.value = '';

    imageUrls.forEach(url => addToHistory(url));
}

async function adjustPhoto() {
    const feedback = elements.feedbackTextarea.value.trim();
    if (!feedback) {
        showError('Please enter adjustment instructions');
        return;
    }

    if (!state.lastPrompt) {
        showError('No previous generation to adjust');
        return;
    }

    showLoading();
    updateLoadingStatus('Applying adjustments...');

    const adjustedPrompt = `${state.lastPrompt}

ADJUSTMENTS REQUESTED:
${feedback}

Please regenerate the image with these specific changes applied.`;

    const model = elements.aiModel.value;

    try {
        let messageContent;
        if (state.uploadedImageBase64) {
            messageContent = [
                { type: 'text', text: adjustedPrompt },
                { type: 'image_url', image_url: { url: state.uploadedImageBase64 } }
            ];
        } else {
            messageContent = adjustedPrompt;
        }

        const requestBody = {
            model: model,
            messages: [
                { role: 'user', content: messageContent }
            ],
            modalities: ['image', 'text'],
            max_tokens: 4096
        };

        const imageUrl = await makeGenerationRequest(requestBody);
        showResult(imageUrl);
        showSuccess('Photo adjusted successfully!');

    } catch (error) {
        console.error('Adjustment error:', error);
        hideLoading();
        showError(error.message);
    }
}

// ============================================
// HISTORY MANAGEMENT (uses SharedHistory)
// ============================================
const history = new SharedHistory('model_studio_history', 20);

function loadHistory() {
    state.history = history.load();
    renderHistory();
}

function addToHistory(imageUrl) {
    history.add(imageUrl);
    state.history = history.getAll();
    renderHistory();
}

function renderHistory() {
    elements.historyCount.textContent = history.count;

    if (history.count === 0) {
        elements.historyGrid.style.display = 'none';
        elements.historyEmpty.style.display = 'flex';
        return;
    }

    elements.historyGrid.style.display = 'grid';
    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = history.getAll().map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.imageUrl}" alt="History item">
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id, 10);
            const historyItem = history.findById(id);
            if (historyItem) {
                openLightbox(historyItem.imageUrl);
            }
        });
    });
}

async function clearHistory() {
    const confirmed = await SharedUI.confirm('Are you sure you want to clear all history?', {
        title: 'Clear History',
        confirmText: 'Clear All',
        icon: 'warning'
    });
    if (confirmed) {
        history.clear();
        state.history = [];
        renderHistory();
        SharedUI.toast('History cleared', 'success');
    }
}

// ============================================
// FAVORITES MANAGEMENT
// ============================================
function captureCurrentSettings() {
    return {
        model: elements.aiModel?.value,
        productType: state.productType,
        productDescription: elements.productDescription?.value || '',
        gender: state.gender,
        age: state.age,
        ethnicity: state.ethnicity,
        bodyType: state.bodyType,
        hair: state.hair,
        shotType: state.shotType,
        scene: state.scene,
        sceneDetailMode: state.sceneDetailMode,
        sceneDetailText: state.sceneDetailText,
        photoStyle: state.photoStyle,
        pose: state.pose,
        lighting: state.lighting,
        cameraAngle: state.cameraAngle,
        expression: state.expression,
        aspectRatio: state.aspectRatio,
        variations: state.variations,
        collageMode: state.collageMode,
        collageShowFace: state.collageShowFace,
        depthOfField: state.depthOfField,
        colorGrading: state.colorGrading,
        skinRetouch: state.skinRetouch,
        composition: state.composition,
        qualityLevel: state.qualityLevel,
        realismLevel: state.realismLevel,
        focalLength: state.focalLength,
        filmGrain: state.filmGrain,
        contrast: state.contrast,
        productEnhancement: state.productEnhancement,
        contextDescription: state.contextDescription,
        negativePrompt: elements.negativePrompt?.value || ''
    };
}

async function saveFavorite() {
    if (!state.generatedImageUrl) {
        showError('No image to save. Generate an image first.');
        return;
    }

    const settings = captureCurrentSettings();
    const name = elements.productDescription?.value?.trim().slice(0, 30) || 'Model Photo';

    try {
        const favorite = await favorites.add({
            name,
            imageUrl: state.generatedImageUrl,
            imageUrls: state.generatedImages, // All variants
            seed: state.lastSeed,
            prompt: state.lastPrompt,
            productImageBase64: state.uploadedImageBase64,
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
    const items = favorites.getAll();

    count.textContent = items.length;

    if (items.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
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
                <div class="favorite-item-seed">Seed: ${item.seed || 'N/A'}</div>
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

async function openFavoritesModal(id) {
    const item = favorites.findById(id);
    if (!item) return;

    state.selectedFavorite = item;
    elements.favoriteNameInput.value = item.name;
    elements.favoriteSeedValue.textContent = item.seed || 'N/A';

    const date = new Date(item.timestamp);
    elements.favoriteDate.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

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

    // Restore state settings
    if (settings.productType) state.productType = settings.productType;
    if (settings.gender) state.gender = settings.gender;
    if (settings.age) state.age = settings.age;
    if (settings.ethnicity) state.ethnicity = settings.ethnicity;
    if (settings.bodyType) state.bodyType = settings.bodyType;
    if (settings.hair) state.hair = settings.hair;
    if (settings.shotType) state.shotType = settings.shotType;
    if (settings.scene) state.scene = settings.scene;
    if (settings.sceneDetailMode) state.sceneDetailMode = settings.sceneDetailMode;
    if (settings.sceneDetailText) state.sceneDetailText = settings.sceneDetailText;
    if (settings.photoStyle) state.photoStyle = settings.photoStyle;
    if (settings.pose) state.pose = settings.pose;
    if (settings.lighting) state.lighting = settings.lighting;
    if (settings.cameraAngle) state.cameraAngle = settings.cameraAngle;
    if (settings.expression) state.expression = settings.expression;
    if (settings.aspectRatio) state.aspectRatio = settings.aspectRatio;
    if (settings.variations) state.variations = settings.variations;
    if (settings.collageMode) state.collageMode = settings.collageMode;
    if (typeof settings.collageShowFace === 'boolean') state.collageShowFace = settings.collageShowFace;
    if (settings.depthOfField) state.depthOfField = settings.depthOfField;
    if (settings.colorGrading) state.colorGrading = settings.colorGrading;
    if (settings.skinRetouch) state.skinRetouch = settings.skinRetouch;
    if (settings.composition) state.composition = settings.composition;
    if (settings.qualityLevel) state.qualityLevel = settings.qualityLevel;
    if (settings.realismLevel) state.realismLevel = settings.realismLevel;
    if (settings.focalLength) state.focalLength = settings.focalLength;
    if (settings.filmGrain) state.filmGrain = settings.filmGrain;
    if (settings.contrast) state.contrast = settings.contrast;
    if (settings.productEnhancement) state.productEnhancement = settings.productEnhancement;
    if (settings.contextDescription) state.contextDescription = settings.contextDescription;

    // Restore form values
    if (elements.aiModel && settings.model) elements.aiModel.value = settings.model;
    if (elements.productDescription && settings.productDescription) {
        elements.productDescription.value = settings.productDescription;
    }
    if (elements.modelEthnicity && settings.ethnicity) elements.modelEthnicity.value = settings.ethnicity;
    if (elements.modelBodyType && settings.bodyType) elements.modelBodyType.value = settings.bodyType;
    if (elements.modelHair && settings.hair) elements.modelHair.value = settings.hair;
    if (elements.modelPose && settings.pose) elements.modelPose.value = settings.pose;
    if (elements.lighting && settings.lighting) elements.lighting.value = settings.lighting;
    if (elements.cameraAngle && settings.cameraAngle) elements.cameraAngle.value = settings.cameraAngle;
    if (elements.expression && settings.expression) elements.expression.value = settings.expression;
    if (elements.aspectRatio && settings.aspectRatio) elements.aspectRatio.value = settings.aspectRatio;
    if (elements.collageMode && settings.collageMode) elements.collageMode.value = settings.collageMode;
    if (elements.depthOfField && settings.depthOfField) elements.depthOfField.value = settings.depthOfField;
    if (elements.colorGrading && settings.colorGrading) elements.colorGrading.value = settings.colorGrading;
    if (elements.skinRetouch && settings.skinRetouch) elements.skinRetouch.value = settings.skinRetouch;
    if (elements.composition && settings.composition) elements.composition.value = settings.composition;
    if (elements.qualityLevel && settings.qualityLevel) elements.qualityLevel.value = settings.qualityLevel;
    if (elements.realismLevel && settings.realismLevel) elements.realismLevel.value = settings.realismLevel;
    if (elements.focalLength && settings.focalLength) elements.focalLength.value = settings.focalLength;
    if (elements.filmGrain && settings.filmGrain) elements.filmGrain.value = settings.filmGrain;
    if (elements.contrast && settings.contrast) elements.contrast.value = settings.contrast;
    if (elements.productEnhancement && settings.productEnhancement) {
        elements.productEnhancement.value = settings.productEnhancement;
        elements.productEnhancement.dispatchEvent(new Event('change'));
    }
    if (elements.contextDescription && settings.contextDescription) {
        elements.contextDescription.value = settings.contextDescription;
    }
    if (elements.negativePrompt && settings.negativePrompt) {
        elements.negativePrompt.value = settings.negativePrompt;
    }

    // Update UI elements that depend on state (radio buttons, etc.)
    document.querySelectorAll('input[name="productType"]').forEach(radio => {
        radio.checked = radio.value === state.productType;
    });
    document.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.checked = radio.value === state.gender;
    });
    document.querySelectorAll('input[name="age"]').forEach(radio => {
        radio.checked = radio.value === state.age;
    });
    document.querySelectorAll('input[name="shotType"]').forEach(radio => {
        radio.checked = radio.value === state.shotType;
    });
    document.querySelectorAll('input[name="scene"]').forEach(radio => {
        radio.checked = radio.value === state.scene;
    });
    document.querySelectorAll('input[name="photoStyle"]').forEach(radio => {
        radio.checked = radio.value === state.photoStyle;
    });
    document.querySelectorAll('input[name="variations"]').forEach(radio => {
        radio.checked = radio.value === String(state.variations);
    });

    // Restore scene buttons
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scene === state.scene);
    });

    // Restore scene detail UI
    document.querySelectorAll('.scene-detail-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.detail === state.sceneDetailMode);
    });
    if (elements.sceneDetailInput) {
        elements.sceneDetailInput.style.display = state.sceneDetailMode === 'custom' ? 'flex' : 'none';
    }
    if (elements.sceneDetailText && settings.sceneDetailText) {
        elements.sceneDetailText.value = settings.sceneDetailText;
    }
    if (elements.sceneNameLabel) {
        const activeSceneBtn = document.querySelector('.scene-btn.active');
        if (activeSceneBtn) {
            elements.sceneNameLabel.textContent = activeSceneBtn.querySelector('span:last-child')?.textContent?.toLowerCase() || state.scene;
        }
    }

    // Restore seed
    if (fav.seed) {
        state.lastSeed = fav.seed;
    }

    closeFavoritesModal();
    showSuccess('Settings loaded! Upload a new product image to generate.');

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
// LIGHTBOX (uses SharedLightbox)
// ============================================
function openLightbox(imageUrl) {
    SharedLightbox.open(elements.lightbox, elements.lightboxImage, imageUrl);
}

function closeLightbox() {
    SharedLightbox.close(elements.lightbox);
}

// ============================================
// DOWNLOAD (uses SharedDownload)
// ============================================
function downloadImage() {
    if (!state.generatedImageUrl) return;
    SharedDownload.downloadImage(state.generatedImageUrl, 'model-photo');
}

function downloadFromLightbox() {
    if (!elements.lightboxImage.src) return;
    SharedDownload.downloadImage(elements.lightboxImage.src, 'model-photo');
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Form submission
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateModelPhoto();
    });

    // Generate button mouse tracking
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

    // Product type buttons
    document.querySelectorAll('.product-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.product-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.productType = btn.dataset.type;

            // Show/hide body type for clothing
            if (elements.bodyTypeOption) {
                elements.bodyTypeOption.style.display =
                    (state.productType === 'clothing' || state.productType === 'footwear') ? 'flex' : 'none';
            }
        });
    });

    // Option buttons (gender, age, variations)
    document.querySelectorAll('.option-btn[data-option]').forEach(btn => {
        btn.addEventListener('click', () => {
            const option = btn.dataset.option;
            const value = btn.dataset.value;

            // Deselect siblings
            btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            state[option] = value;
        });
    });

    // Shot type buttons
    document.querySelectorAll('.shot-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shot-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.shotType = btn.dataset.shot;
        });
    });

    // Scene buttons
    document.querySelectorAll('.scene-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.scene = btn.dataset.scene;
            // Update scene name label
            if (elements.sceneNameLabel) {
                elements.sceneNameLabel.textContent = btn.querySelector('span:last-child')?.textContent?.toLowerCase() || state.scene;
            }
        });
    });

    // Scene detail toggle buttons
    document.querySelectorAll('.scene-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scene-detail-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.sceneDetailMode = btn.dataset.detail;
            // Show/hide custom input
            if (elements.sceneDetailInput) {
                elements.sceneDetailInput.style.display = btn.dataset.detail === 'custom' ? 'flex' : 'none';
            }
        });
    });

    // Scene detail text input
    elements.sceneDetailText?.addEventListener('input', (e) => {
        state.sceneDetailText = e.target.value;
    });

    // Photo style radios
    document.querySelectorAll('input[name="photoStyle"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.photoStyle = radio.value;
        });
    });

    // Select fields
    elements.modelEthnicity?.addEventListener('change', (e) => state.ethnicity = e.target.value);
    elements.modelBodyType?.addEventListener('change', (e) => state.bodyType = e.target.value);
    elements.modelHair?.addEventListener('change', (e) => state.hair = e.target.value);
    elements.modelPose?.addEventListener('change', (e) => state.pose = e.target.value);
    elements.lighting?.addEventListener('change', (e) => state.lighting = e.target.value);
    elements.cameraAngle?.addEventListener('change', (e) => state.cameraAngle = e.target.value);
    elements.expression?.addEventListener('change', (e) => state.expression = e.target.value);
    elements.aspectRatio?.addEventListener('change', (e) => state.aspectRatio = e.target.value);
    elements.collageMode?.addEventListener('change', (e) => {
        state.collageMode = e.target.value;
        // Show/hide face toggle based on collage mode
        if (elements.collageFaceOption) {
            elements.collageFaceOption.style.display = e.target.value !== 'off' ? 'flex' : 'none';
        }
    });

    // Quality enhancement select fields
    elements.depthOfField?.addEventListener('change', (e) => state.depthOfField = e.target.value);
    elements.colorGrading?.addEventListener('change', (e) => state.colorGrading = e.target.value);
    elements.skinRetouch?.addEventListener('change', (e) => state.skinRetouch = e.target.value);
    elements.composition?.addEventListener('change', (e) => state.composition = e.target.value);
    elements.qualityLevel?.addEventListener('change', (e) => state.qualityLevel = e.target.value);
    elements.realismLevel?.addEventListener('change', (e) => state.realismLevel = e.target.value);

    // Camera & Technical
    elements.focalLength?.addEventListener('change', (e) => state.focalLength = e.target.value);
    elements.filmGrain?.addEventListener('change', (e) => state.filmGrain = e.target.value);
    elements.contrast?.addEventListener('change', (e) => state.contrast = e.target.value);

    // Product
    const productEnhancementSelect = document.getElementById('productEnhancement');
    const contextGroup = document.getElementById('contextDescriptionGroup');

    if (productEnhancementSelect) {
        productEnhancementSelect.addEventListener('change', (e) => {
            state.productEnhancement = e.target.value;
            // Show/hide context description field
            if (contextGroup) {
                contextGroup.style.display = e.target.value === 'in-context' ? 'flex' : 'none';
            }
        });
    }

    const contextInput = document.getElementById('contextDescription');
    if (contextInput) {
        contextInput.addEventListener('input', (e) => state.contextDescription = e.target.value);
    }

    // Seed control
    if (elements.randomSeedCheck) {
        elements.randomSeedCheck.addEventListener('change', () => {
            const isRandom = elements.randomSeedCheck.checked;
            elements.seedInput.disabled = isRandom;
            if (isRandom) {
                elements.seedInput.value = '';
            }
        });
    }

    // Advanced toggle
    elements.advancedToggle?.addEventListener('click', () => {
        elements.advancedSection.classList.toggle('open');
    });

    // Settings toggle
    elements.settingsToggle?.addEventListener('click', () => {
        elements.settingsSection.classList.toggle('open');
    });

    // API Key
    elements.toggleApiKeyBtn?.addEventListener('click', () => {
        const type = elements.apiKeyInput.type === 'password' ? 'text' : 'password';
        elements.apiKeyInput.type = type;
    });

    elements.saveApiKeyBtn?.addEventListener('click', saveApiKey);

    // Download
    elements.downloadBtn?.addEventListener('click', downloadImage);

    // Regenerate
    elements.regenerateBtn?.addEventListener('click', generateModelPhoto);

    // Adjust
    elements.adjustBtn?.addEventListener('click', adjustPhoto);

    // History
    elements.clearHistoryBtn?.addEventListener('click', clearHistory);

    // Favorites
    elements.favoriteBtn?.addEventListener('click', saveFavorite);
    elements.clearFavoritesBtn?.addEventListener('click', clearFavorites);
    elements.closeFavoritesModal?.addEventListener('click', closeFavoritesModal);
    elements.loadFavoriteBtn?.addEventListener('click', loadFavorite);
    elements.downloadFavoriteBtn?.addEventListener('click', downloadFavorite);
    elements.deleteFavoriteBtn?.addEventListener('click', () => {
        if (state.selectedFavorite) {
            deleteFavorite(state.selectedFavorite.id);
        }
    });
    elements.copyFavoriteSeed?.addEventListener('click', copyFavoriteSeed);

    elements.favoritesModal?.addEventListener('click', (e) => {
        if (e.target === elements.favoritesModal) {
            closeFavoritesModal();
        }
    });

    // Lightbox
    elements.resultImage?.addEventListener('click', () => {
        if (state.generatedImageUrl) {
            openLightbox(state.generatedImageUrl);
        }
    });

    elements.lightboxClose?.addEventListener('click', closeLightbox);

    elements.lightbox?.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) {
            closeLightbox();
        }
    });

    elements.lightboxDownload?.addEventListener('click', downloadFromLightbox);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateModelPhoto();
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.generatedImageUrl) {
            e.preventDefault();
            downloadImage();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================
let initialized = false;

function init() {
    if (initialized) return;
    initialized = true;

    console.log('Model Studio: Initializing...');
    initElements();
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    loadApiKey();
    setupImageUpload();
    setupEventListeners();
    loadHistory();
    favorites.load();
    renderFavorites();
    console.log('Model Studio: Ready!');
}

document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
