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
    age: 'adult',
    ethnicity: 'any',
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
    negativePrompt: '',
    // Quality enhancements
    depthOfField: 'auto',
    colorGrading: 'auto',
    skinRetouch: 'natural',
    composition: 'auto',
    qualityLevel: 'high',
    realismLevel: 'auto'
};

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
        aiModel: document.getElementById('aiModel'),
        negativePrompt: document.getElementById('negativePrompt'),
        // Quality enhancements
        depthOfField: document.getElementById('depthOfField'),
        colorGrading: document.getElementById('colorGrading'),
        skinRetouch: document.getElementById('skinRetouch'),
        composition: document.getElementById('composition'),
        qualityLevel: document.getElementById('qualityLevel'),
        realismLevel: document.getElementById('realismLevel'),

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
// UTILITY FUNCTIONS
// ============================================
function showError(message) {
    const errorText = elements.errorMessage.querySelector('.error-text');
    if (errorText) errorText.textContent = message;
    elements.errorMessage.classList.add('visible');
    setTimeout(() => {
        elements.errorMessage.classList.remove('visible');
    }, 5000);
}

function showSuccess(message) {
    const content = elements.successMessage.querySelector('.message-content');
    if (content) content.textContent = message;
    elements.successMessage.classList.add('visible');
    setTimeout(() => {
        elements.successMessage.classList.remove('visible');
    }, 3000);
}

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultContainer.classList.remove('visible');
    elements.loadingContainer.classList.add('visible');
}

function hideLoading() {
    elements.loadingContainer.classList.remove('visible');
}

function updateLoadingStatus(status) {
    elements.loadingStatus.textContent = status;
}

function updateApiStatus(connected) {
    const dot = elements.apiStatus.querySelector('.status-dot');
    const text = elements.apiStatus.querySelector('.status-text');
    if (connected) {
        dot.style.background = 'var(--success)';
        text.textContent = 'Connected';
    } else {
        dot.style.background = 'var(--error)';
        text.textContent = 'Not Connected';
    }
}

// ============================================
// API KEY HANDLING
// ============================================
function loadApiKey() {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
        state.apiKey = savedKey;
        elements.apiKeyInput.value = savedKey;
        updateApiStatus(true);
    }
}

function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    if (key) {
        state.apiKey = key;
        localStorage.setItem('openrouter_api_key', key);
        updateApiStatus(true);
        showSuccess('API key saved!');
    }
}

// ============================================
// IMAGE UPLOAD HANDLING
// ============================================
function setupImageUpload() {
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
        if (e.dataTransfer.files.length > 0) {
            handleImageUpload(e.dataTransfer.files[0]);
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
        elements.imagePreview.style.display = 'none';
        elements.uploadArea.style.display = 'flex';
        elements.productPhoto.value = '';
    });
}

function handleImageUpload(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }

    state.uploadedImage = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedImageBase64 = e.target.result;
        elements.previewImg.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.uploadArea.style.display = 'none';

        // Auto-analyze the image
        analyzeProductImage();
    };
    reader.readAsDataURL(file);
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

    // Model description
    let modelDesc = '';
    if (state.gender !== 'any') {
        modelDesc += state.gender + ' ';
    }
    modelDesc += 'model';

    // Age
    const ageDesc = {
        young: 'in their early 20s',
        adult: 'in their late 20s to early 30s',
        mature: 'in their 40s',
        senior: 'in their 50s or older'
    };
    modelDesc += ` ${ageDesc[state.age] || ''}`;

    // Ethnicity
    if (state.ethnicity !== 'any') {
        const ethnicityMap = {
            caucasian: 'Caucasian',
            african: 'African/Black',
            asian: 'East Asian',
            hispanic: 'Hispanic/Latino',
            'middle-eastern': 'Middle Eastern',
            'south-asian': 'South Asian',
            mixed: 'mixed ethnicity'
        };
        modelDesc += `, ${ethnicityMap[state.ethnicity] || state.ethnicity}`;
    }

    // Body type for clothing
    if (state.productType === 'clothing' || state.productType === 'footwear') {
        const bodyTypeMap = {
            slim: 'slim/athletic build',
            average: 'average build',
            curvy: 'curvy/plus size',
            muscular: 'muscular/fit build'
        };
        modelDesc += ` with ${bodyTypeMap[state.bodyType] || 'average build'}`;
    }

    // Hair
    if (state.hair !== 'any') {
        const hairMap = {
            'long-dark': 'long dark hair',
            'long-blonde': 'long blonde hair',
            'long-brown': 'long brown hair',
            'long-red': 'long red hair',
            'short-dark': 'short dark hair',
            'short-blonde': 'short blonde hair',
            'short-brown': 'short brown hair',
            curly: 'curly hair',
            bald: 'bald/shaved head'
        };
        modelDesc += `, ${hairMap[state.hair] || state.hair}`;
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
    const sceneDesc = {
        studio: 'professional photography studio with clean backdrop',
        urban: 'urban city street with modern architecture',
        street: 'street style urban environment with sidewalks and storefronts',
        nature: 'natural outdoor setting with greenery and trees',
        beach: 'beach or coastal setting with sand and ocean',
        cafe: 'cozy café or coffee shop interior with warm ambiance',
        office: 'modern professional office environment',
        gym: 'modern gym or fitness studio with equipment',
        'living-room': 'stylish modern living room with comfortable furniture',
        bedroom: 'elegant bedroom interior with soft lighting',
        kitchen: 'bright modern kitchen with clean countertops',
        bathroom: 'luxurious bathroom with elegant fixtures',
        balcony: 'scenic balcony with outdoor view',
        rooftop: 'urban rooftop terrace with city skyline views',
        luxury: 'luxurious upscale high-end setting',
        pool: 'poolside setting with water and lounge area'
    };

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
        // Natural
        natural: 'natural daylight, bright and even',
        golden: 'warm golden hour lighting with soft orange tones',
        overcast: 'soft overcast daylight, diffused and even',
        shade: 'open shade lighting, soft and flattering',
        // Studio
        studio: 'professional three-point studio lighting setup',
        rembrandt: 'Rembrandt lighting with dramatic triangle shadow on cheek',
        butterfly: 'butterfly/paramount beauty lighting from above, glamorous',
        split: 'split lighting with half face in shadow, edgy and dramatic',
        loop: 'classic loop lighting, small shadow from nose, flattering',
        rim: 'rim lighting with strong hair/edge light, subject separation',
        highkey: 'high key lighting, bright and airy with minimal shadows',
        lowkey: 'low key lighting, dark and moody with dramatic shadows',
        // Creative
        backlit: 'backlit silhouette with rim light effect',
        dramatic: 'dramatic cinematic lighting with strong contrast',
        neon: 'colorful neon lighting with vibrant colors',
        window: 'natural window light, soft directional lighting'
    };

    // Camera angle descriptions
    const angleDesc = {
        'eye-level': 'shot at eye level',
        low: 'shot from low angle looking up (heroic)',
        high: 'shot from high angle looking down',
        dutch: 'Dutch angle (tilted) for dynamic effect',
        'over-shoulder': 'over-the-shoulder perspective'
    };

    // Expression
    const expressionDesc = {
        neutral: 'neutral calm expression',
        smile: 'gentle subtle smile',
        happy: 'happy joyful expression',
        serious: 'serious intense expression',
        confident: 'confident self-assured expression',
        mysterious: 'mysterious intriguing expression',
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
        // Film stocks
        portra: 'Kodak Portra 400 film look with warm skin tones, soft contrast, and slightly muted colors',
        fuji: 'Fuji 400H film look with soft pastels, slightly lifted shadows, and cool green tint',
        ektar: 'Kodak Ektar film look with vivid saturated colors and punchy contrast',
        cinestill: 'Cinestill 800T cinematic film look with halation glow around highlights and teal-orange tones',
        // Modern looks
        warm: 'warm golden color grading with amber highlights and cozy tones',
        cool: 'cool moody color grading with blue shadows and desaturated highlights',
        airy: 'bright and airy look with lifted shadows, soft whites, and clean tones',
        muted: 'muted desaturated color palette with faded look',
        vibrant: 'vibrant punchy colors with enhanced saturation and contrast',
        bw: 'classic black and white with rich tonal range and contrast',
        // Editorial
        vogue: 'Vogue magazine editorial color grading, sophisticated and polished',
        highfashion: 'high fashion color grading with dramatic contrast and refined tones',
        clean: 'clean commercial color grading, neutral and true-to-life colors'
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
        'rule-of-thirds': 'rule of thirds composition with subject placed at intersection points',
        golden: 'golden ratio spiral composition for dynamic visual flow',
        'left-space': 'subject positioned on the left with negative space on the right',
        'right-space': 'subject positioned on the right with negative space on the left',
        'negative-space': 'generous negative space around the subject for clean minimal look',
        tight: 'tight crop filling the frame with minimal background'
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
        auto: '', // No realism instructions, let AI decide naturally
        photo: 'photorealistic, indistinguishable from a real photograph',
        hyper: 'hyper-realistic with extreme attention to detail, lifelike textures, realistic skin pores and fine hair details',
        'ultra-hyper': 'ultra hyper-realistic, microscopic level of detail, perfect anatomical accuracy, subsurface skin scattering, individual hair strands visible, photographic perfection',
        cinematic: 'cinematic realism with film-like quality, subtle film grain, cinematic color science, movie-quality production value',
        raw: 'RAW unprocessed photo look, natural imperfections, authentic camera capture feel, no artificial enhancement'
    };

    // Get current quality settings from elements
    const currentDof = elements.depthOfField?.value || 'auto';
    const currentColorGrading = elements.colorGrading?.value || 'auto';
    const currentSkinRetouch = elements.skinRetouch?.value || 'natural';
    const currentComposition = elements.composition?.value || 'auto';
    const currentQualityLevel = elements.qualityLevel?.value || 'high';
    const currentRealism = elements.realismLevel?.value || 'auto';

    // Build quality enhancements section
    let qualitySection = '';

    // Only include realism if not auto
    if (currentRealism !== 'auto' && realismDesc[currentRealism]) {
        qualitySection += `\nREALISM: ${realismDesc[currentRealism]}`;
    }

    if (currentDof !== 'auto' && dofDesc[currentDof]) {
        qualitySection += `\nDEPTH OF FIELD: ${dofDesc[currentDof]}`;
    }

    if (currentColorGrading !== 'auto' && colorGradingDesc[currentColorGrading]) {
        qualitySection += `\nCOLOR GRADING: ${colorGradingDesc[currentColorGrading]}`;
    }

    if (currentSkinRetouch && skinRetouchDesc[currentSkinRetouch]) {
        qualitySection += `\nSKIN/RETOUCH: ${skinRetouchDesc[currentSkinRetouch]}`;
    }

    if (currentComposition !== 'auto' && compositionDesc[currentComposition]) {
        qualitySection += `\nCOMPOSITION: ${compositionDesc[currentComposition]}`;
    }

    // Build the prompt
    let prompt = `Create a ${qualityBoosterDesc[currentQualityLevel] || 'professional photography'}.

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

    if (state.uploadedImageBase64) {
        prompt += `\n\nI am providing a reference image of the product. Please incorporate this exact product into the photo, keeping its design, colors, and details accurate.`;
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
// IMAGE GENERATION
// ============================================
function extractImageFromResponse(data) {
    let imageUrl = null;

    const message = data.choices?.[0]?.message;
    if (message) {
        if (Array.isArray(message.content)) {
            for (const part of message.content) {
                // OpenAI format
                if (part.type === 'image_url' && part.image_url?.url) {
                    imageUrl = part.image_url.url;
                    break;
                }
                // Anthropic format
                if (part.type === 'image' && part.source?.data) {
                    imageUrl = `data:${part.source.media_type || 'image/png'};base64,${part.source.data}`;
                    break;
                }
                // Gemini format (inline_data)
                if (part.inline_data?.data) {
                    imageUrl = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
                    break;
                }
                // Alternative Gemini format (image with data property)
                if (part.image?.data) {
                    imageUrl = `data:${part.image.mimeType || part.image.mime_type || 'image/png'};base64,${part.image.data}`;
                    break;
                }
                // Direct base64 in part
                if (part.data && typeof part.data === 'string') {
                    imageUrl = `data:${part.mimeType || part.mime_type || 'image/png'};base64,${part.data}`;
                    break;
                }
            }
        }

        // Check message.images array
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

        // Check for base64 string in content
        if (!imageUrl && message.content && typeof message.content === 'string') {
            const base64Match = message.content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
            if (base64Match) {
                imageUrl = base64Match[0];
            }
        }
    }

    // DALL-E / images endpoint format
    if (!imageUrl && data.data && data.data[0]) {
        if (data.data[0].url) {
            imageUrl = data.data[0].url;
        } else if (data.data[0].b64_json) {
            imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        }
    }

    // Deep search fallback: look for any base64 data in the response
    if (!imageUrl) {
        const findBase64 = (obj, depth = 0) => {
            if (depth > 10) return null;
            if (!obj || typeof obj !== 'object') return null;

            if (obj.data && typeof obj.data === 'string' && obj.data.length > 1000) {
                const mimeType = obj.mimeType || obj.mime_type || obj.media_type || 'image/png';
                return `data:${mimeType};base64,${obj.data}`;
            }
            if (obj.b64_json && typeof obj.b64_json === 'string') {
                return `data:image/png;base64,${obj.b64_json}`;
            }
            if (obj.url && typeof obj.url === 'string' && (obj.url.startsWith('data:image') || obj.url.startsWith('http'))) {
                return obj.url;
            }

            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const found = findBase64(item, depth + 1);
                    if (found) return found;
                }
            } else {
                for (const key of Object.keys(obj)) {
                    const found = findBase64(obj[key], depth + 1);
                    if (found) return found;
                }
            }
            return null;
        };

        imageUrl = findBase64(data);
        if (imageUrl) {
            console.log('Found image via deep search fallback');
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
                    'X-Title': 'NGRAPHICS Model Studio'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const imageUrl = extractImageFromResponse(data);

            if (!imageUrl) {
                if (data.error) {
                    throw new Error(data.error.message || 'Provider returned an error');
                }
                throw new Error('No image in response');
            }

            return imageUrl;

        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt}/${retries} failed:`, error.message);

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Failed after multiple attempts');
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

        if (variationsCount === 1) {
            updateLoadingStatus('Generating model photo...');
            const imageUrl = await makeGenerationRequest(requestBody);
            showResult(imageUrl);
            showSuccess('Photo generated successfully!');
        } else {
            updateLoadingStatus(`Generating ${variationsCount} variations...`);

            const requests = [];
            const baseSeed = Math.floor(Math.random() * 999999999);

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

        let errorMessage = error.message;
        if (errorMessage.includes('401')) {
            errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
        } else if (errorMessage.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please wait and try again.';
        } else if (errorMessage.includes('modalities')) {
            errorMessage = 'This model does not support image generation. Please try a different model.';
        }

        showError(errorMessage);
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
// HISTORY MANAGEMENT
// ============================================
const HISTORY_KEY = 'model_studio_history';
const MAX_HISTORY = 20;

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        if (saved) {
            state.history = JSON.parse(saved);
            renderHistory();
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function saveHistory() {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

function addToHistory(imageUrl) {
    const item = {
        id: Date.now(),
        imageUrl: imageUrl,
        timestamp: new Date().toISOString()
    };

    state.history.unshift(item);

    if (state.history.length > MAX_HISTORY) {
        state.history = state.history.slice(0, MAX_HISTORY);
    }

    saveHistory();
    renderHistory();
}

function renderHistory() {
    elements.historyCount.textContent = state.history.length;

    if (state.history.length === 0) {
        elements.historyEmpty.style.display = 'block';
        elements.historyGrid.innerHTML = '';
        elements.historyGrid.appendChild(elements.historyEmpty);
        return;
    }

    elements.historyEmpty.style.display = 'none';

    elements.historyGrid.innerHTML = state.history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.imageUrl}" alt="History item">
        </div>
    `).join('');

    elements.historyGrid.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id, 10);
            const historyItem = state.history.find(h => h.id === id);
            if (historyItem) {
                openLightbox(historyItem.imageUrl);
            }
        });
    });
}

function clearHistory() {
    if (confirm('Clear all history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
        showSuccess('History cleared');
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

// ============================================
// DOWNLOAD
// ============================================
function downloadImage() {
    if (!state.generatedImageUrl) return;

    const link = document.createElement('a');
    link.href = state.generatedImageUrl;
    link.download = `model-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadFromLightbox() {
    if (!elements.lightboxImage.src) return;

    const link = document.createElement('a');
    link.href = elements.lightboxImage.src;
    link.download = `model-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        });
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

    // Quality enhancement select fields
    elements.depthOfField?.addEventListener('change', (e) => state.depthOfField = e.target.value);
    elements.colorGrading?.addEventListener('change', (e) => state.colorGrading = e.target.value);
    elements.skinRetouch?.addEventListener('change', (e) => state.skinRetouch = e.target.value);
    elements.composition?.addEventListener('change', (e) => state.composition = e.target.value);
    elements.qualityLevel?.addEventListener('change', (e) => state.qualityLevel = e.target.value);
    elements.realismLevel?.addEventListener('change', (e) => state.realismLevel = e.target.value);

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
    loadApiKey();
    setupImageUpload();
    setupEventListeners();
    loadHistory();
    console.log('Model Studio: Ready!');
}

document.addEventListener('DOMContentLoaded', init);

if (document.readyState !== 'loading') {
    init();
}
