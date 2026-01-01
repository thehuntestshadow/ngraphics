// Model Video Generator - JavaScript

// State
const state = {
    // Core
    videoApiKey: '',
    uploadedImage: null,
    uploadedImageBase64: null,
    generatedVideoUrl: null,
    generatedVideos: [],
    currentGenerationId: null,

    // Motion
    motionType: 'model',  // model, camera, combined
    modelMotion: 'subtle-sway',
    cameraMotion: 'zoom-in',

    // Duration & Speed
    duration: 5,
    loop: true,
    speed: 'normal',

    // Advanced
    intensity: 'normal',
    smoothness: 'high',
    aspectRatio: '9:16',
    seed: '',

    // History
    history: [],
    lastPrompt: null,
    lastSeed: null,
    selectedFavorite: null
};

// Elements cache
const elements = {};

// Storage
const history = new SharedHistory('model_video_history', 20);
const favorites = new SharedFavorites('model_video_favorites', 50);

// Motion Configs
const modelMotions = {
    'subtle-sway': {
        name: 'Subtle Sway',
        description: 'Gentle breathing and natural body sway',
        prompt: 'subtle natural breathing movement, slight body sway, gentle weight shifting'
    },
    'product-showcase': {
        name: 'Product Showcase',
        description: 'Hands lift and present the product',
        prompt: 'hands slowly lift and present product, showcase gesture, elegant presenting motion'
    },
    'walking': {
        name: 'Walking',
        description: 'Forward walking motion',
        prompt: 'walking forward confidently, natural gait, runway-style stride'
    },
    'turn': {
        name: 'Turn',
        description: '90° turn to show different angle',
        prompt: 'slow graceful turn, 90 degree rotation, profile reveal'
    },
    'hair-flip': {
        name: 'Hair Flip',
        description: 'Dynamic hair movement',
        prompt: 'gentle hair movement, wind-blown effect, natural flowing hair motion'
    },
    'gesture': {
        name: 'Gesture',
        description: 'Friendly wave or nod',
        prompt: 'subtle friendly wave, approachable nod, warm smile gesture'
    }
};

const cameraMotions = {
    'zoom-in': {
        name: 'Slow Zoom In',
        description: 'Gradual zoom towards subject',
        prompt: 'slow cinematic zoom in, focus on subject and product'
    },
    'zoom-out': {
        name: 'Slow Zoom Out',
        description: 'Pull back to reveal scene',
        prompt: 'slow zoom out, reveal full scene and context'
    },
    'pan-left': {
        name: 'Pan Left',
        description: 'Horizontal sweep left',
        prompt: 'smooth pan left, horizontal camera movement'
    },
    'pan-right': {
        name: 'Pan Right',
        description: 'Horizontal sweep right',
        prompt: 'smooth pan right, horizontal camera movement'
    },
    'orbit': {
        name: 'Orbit',
        description: 'Circular movement around subject',
        prompt: 'slow orbit around subject, 45 degree arc, dynamic perspective'
    },
    'static': {
        name: 'Static',
        description: 'No camera motion',
        prompt: 'static camera, fixed position, stable shot'
    }
};

const speedDescriptions = {
    'normal': 'normal speed, 1x playback',
    'slow': 'slow motion, 0.5x speed, dramatic timing',
    'cinematic': 'cinematic pacing, 0.75x speed, smooth flow'
};

const intensityDescriptions = {
    'subtle': 'very subtle, minimal movement, barely noticeable',
    'normal': 'natural movement, moderate intensity',
    'dramatic': 'dramatic, pronounced movements, expressive'
};

const smoothnessDescriptions = {
    'high': 'ultra smooth, cinematic quality, buttery motion',
    'medium': 'smooth motion, natural flow',
    'low': 'snappy motion, quick transitions'
};

// Initialize elements
function initElements() {
    elements.form = document.getElementById('videoForm');
    elements.uploadArea = document.getElementById('uploadArea');
    elements.sourceImage = document.getElementById('sourceImage');
    elements.imagePreview = document.getElementById('imagePreview');
    elements.previewImg = document.getElementById('previewImg');
    elements.removeImage = document.getElementById('removeImage');

    // Motion tabs and grids
    elements.motionTabs = document.getElementById('motionTabs');
    elements.modelMotionSection = document.getElementById('modelMotionSection');
    elements.cameraMotionSection = document.getElementById('cameraMotionSection');
    elements.modelMotionGrid = document.getElementById('modelMotionGrid');
    elements.cameraMotionGrid = document.getElementById('cameraMotionGrid');

    // Duration and speed
    elements.durationSlider = document.getElementById('durationSlider');
    elements.durationValue = document.getElementById('durationValue');
    elements.loopVideo = document.getElementById('loopVideo');

    // Advanced
    elements.advancedToggle = document.getElementById('advancedToggle');
    elements.advancedContent = document.getElementById('advancedContent');
    elements.seedInput = document.getElementById('seedInput');
    elements.randomizeSeed = document.getElementById('randomizeSeed');

    // API settings
    elements.settingsToggle = document.getElementById('settingsToggle');
    elements.settingsContent = document.getElementById('settingsContent');
    elements.videoApiKey = document.getElementById('videoApiKey');
    elements.toggleApiKey = document.getElementById('toggleApiKey');
    elements.saveApiKey = document.getElementById('saveApiKey');

    // Generate button
    elements.generateBtn = document.getElementById('generateBtn');

    // Output
    elements.resultPlaceholder = document.getElementById('resultPlaceholder');
    elements.loadingContainer = document.getElementById('loadingContainer');
    elements.skeletonGrid = document.getElementById('skeletonGrid');
    elements.resultDisplay = document.getElementById('resultDisplay');
    elements.resultVideo = document.getElementById('resultVideo');
    elements.progressBar = document.getElementById('progressBar');
    elements.progressFill = document.getElementById('progressFill');
    elements.progressText = document.getElementById('progressText');

    // Actions
    elements.downloadMp4Btn = document.getElementById('downloadMp4Btn');
    elements.downloadGifBtn = document.getElementById('downloadGifBtn');
    elements.favoriteBtn = document.getElementById('favoriteBtn');
    elements.regenerateBtn = document.getElementById('regenerateBtn');

    // History & Favorites
    elements.historyGrid = document.getElementById('historyGrid');
    elements.historyCount = document.getElementById('historyCount');
    elements.historyEmpty = document.getElementById('historyEmpty');
    elements.clearHistory = document.getElementById('clearHistory');
    elements.favoritesGrid = document.getElementById('favoritesGrid');
    elements.favoritesCount = document.getElementById('favoritesCount');
    elements.favoritesEmpty = document.getElementById('favoritesEmpty');
    elements.clearFavorites = document.getElementById('clearFavorites');

    // Messages
    elements.errorMessage = document.getElementById('errorMessage');
    elements.successMessage = document.getElementById('successMessage');

    // Modals
    elements.favoritesModal = document.getElementById('favoritesModal');
    elements.favoritesModalBody = document.getElementById('favoritesModalBody');
    elements.closeFavoritesModal = document.getElementById('closeFavoritesModal');
    elements.loadFavoriteSettings = document.getElementById('loadFavoriteSettings');
    elements.deleteFavorite = document.getElementById('deleteFavorite');
}

// Switch motion type tab
function switchMotionType(type) {
    state.motionType = type;

    // Update tab buttons
    elements.motionTabs.querySelectorAll('.format-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.motion === type);
    });

    // Show/hide motion sections
    if (type === 'model') {
        elements.modelMotionSection.style.display = 'block';
        elements.cameraMotionSection.style.display = 'none';
    } else if (type === 'camera') {
        elements.modelMotionSection.style.display = 'none';
        elements.cameraMotionSection.style.display = 'block';
    } else {
        // Combined - show both
        elements.modelMotionSection.style.display = 'block';
        elements.cameraMotionSection.style.display = 'block';
    }
}

// Select model motion
function selectModelMotion(motion) {
    state.modelMotion = motion;
    elements.modelMotionGrid.querySelectorAll('.motion-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.motion === motion);
    });
}

// Select camera motion
function selectCameraMotion(motion) {
    state.cameraMotion = motion;
    elements.cameraMotionGrid.querySelectorAll('.motion-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.motion === motion);
    });
}

// Generate video prompt
function generateVideoPrompt() {
    const parts = [];

    // Start with e-commerce context
    parts.push('Professional e-commerce product video. Fashion model showcasing product.');

    // Add motion based on type
    if (state.motionType === 'model' || state.motionType === 'combined') {
        const modelConfig = modelMotions[state.modelMotion];
        if (modelConfig) {
            parts.push(`Model movement: ${modelConfig.prompt}.`);
        }
    }

    if (state.motionType === 'camera' || state.motionType === 'combined') {
        const cameraConfig = cameraMotions[state.cameraMotion];
        if (cameraConfig) {
            parts.push(`Camera: ${cameraConfig.prompt}.`);
        }
    }

    // Add speed and style
    parts.push(speedDescriptions[state.speed] || speedDescriptions.normal);
    parts.push(intensityDescriptions[state.intensity] || intensityDescriptions.normal);
    parts.push(smoothnessDescriptions[state.smoothness] || smoothnessDescriptions.high);

    // Add loop instruction if enabled
    if (state.loop) {
        parts.push('Seamless loop, end matches beginning for continuous playback.');
    }

    // Professional quality
    parts.push('High-end production quality. Smooth, professional motion. Clean lighting.');

    return parts.join(' ');
}

// Generate video via Luma AI API
async function generateVideo() {
    if (!state.uploadedImageBase64) {
        showError('Please upload a source image first');
        return;
    }

    if (!state.videoApiKey) {
        showError('Please enter your Luma AI API key in Settings');
        return;
    }

    showLoading();

    try {
        const prompt = generateVideoPrompt();
        state.lastPrompt = prompt;

        // Generate seed if not set
        const seed = state.seed || Math.floor(Math.random() * 999999999);
        state.lastSeed = seed;

        // Luma AI API call
        const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${state.videoApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                keyframes: {
                    frame0: {
                        type: 'image',
                        url: state.uploadedImageBase64
                    }
                },
                loop: state.loop,
                aspect_ratio: state.aspectRatio
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        state.currentGenerationId = data.id;

        // Start polling for completion
        await pollVideoStatus(data.id);

    } catch (error) {
        console.error('Video generation error:', error);
        hideLoading();
        showError(error.message || 'Failed to generate video');
    }
}

// Poll for video generation status
async function pollVideoStatus(generationId) {
    const maxAttempts = 60; // 3 minutes max
    let attempts = 0;

    const poll = async () => {
        try {
            const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
                headers: {
                    'Authorization': `Bearer ${state.videoApiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Poll error: ${response.status}`);
            }

            const data = await response.json();

            if (data.state === 'completed') {
                hideLoading();
                showVideoResult(data.assets.video);
                await addToHistory(data.assets.video);
                showSuccess('Video generated successfully!');
                return;
            }

            if (data.state === 'failed') {
                hideLoading();
                showError(data.failure_reason || 'Video generation failed');
                return;
            }

            // Update progress
            const progress = Math.min((attempts / maxAttempts) * 100, 95);
            updateProgress(progress);

            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(poll, 3000); // Poll every 3 seconds
            } else {
                hideLoading();
                showError('Generation timed out. Please try again.');
            }

        } catch (error) {
            console.error('Poll error:', error);
            hideLoading();
            showError('Failed to check generation status');
        }
    };

    poll();
}

// Update progress bar
function updateProgress(percent) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${Math.round(percent)}%`;
}

function updateSkeletonGrid(count = 1) {
    if (!elements.skeletonGrid) return;
    elements.skeletonGrid.className = `skeleton-grid cols-1`;
    elements.skeletonGrid.innerHTML = `<div class="skeleton-card"><div class="skeleton-image"></div></div>`;
}

// Show loading state
function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.resultDisplay.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.generateBtn.disabled = true;
    updateProgress(0);
    updateSkeletonGrid(1);
}

// Hide loading state
function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    elements.generateBtn.disabled = false;
}

// Show video result
function showVideoResult(videoUrl) {
    state.generatedVideoUrl = videoUrl;
    elements.resultVideo.src = videoUrl;
    elements.resultDisplay.style.display = 'block';
    elements.resultVideo.play();
}

// Show error message
function showError(message) {
    const errorText = elements.errorMessage.querySelector('.error-text');
    errorText.textContent = message;
    elements.errorMessage.classList.add('show');
    setTimeout(() => {
        elements.errorMessage.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const content = elements.successMessage.querySelector('.message-content');
    content.textContent = message;
    elements.successMessage.classList.add('show');
    setTimeout(() => {
        elements.successMessage.classList.remove('show');
    }, 3000);
}

// Add to history
async function addToHistory(videoUrl) {
    const entry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        videoUrl: videoUrl,
        thumbnailUrl: videoUrl, // Use video URL as thumbnail for now
        settings: {
            motionType: state.motionType,
            modelMotion: state.modelMotion,
            cameraMotion: state.cameraMotion,
            duration: state.duration,
            speed: state.speed,
            intensity: state.intensity,
            smoothness: state.smoothness,
            aspectRatio: state.aspectRatio,
            loop: state.loop
        },
        prompt: state.lastPrompt,
        seed: state.lastSeed
    };

    await history.add(entry.thumbnailUrl, entry);
    renderHistory();
}

// Render history
async function renderHistory() {
    const items = await history.getAll();
    elements.historyCount.textContent = items.length;

    if (items.length === 0) {
        elements.historyEmpty.style.display = 'flex';
        elements.historyGrid.querySelectorAll('.history-item').forEach(el => el.remove());
        return;
    }

    elements.historyEmpty.style.display = 'none';

    // Clear existing items except empty state
    elements.historyGrid.querySelectorAll('.history-item').forEach(el => el.remove());

    // Add items
    items.slice(0, 20).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <video src="${item.videoUrl || item.thumbnailUrl}" muted loop preload="metadata"></video>
            <div class="play-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            </div>
        `;
        div.addEventListener('click', () => {
            showVideoResult(item.videoUrl || item.thumbnailUrl);
        });
        div.addEventListener('mouseenter', () => {
            div.querySelector('video').play();
        });
        div.addEventListener('mouseleave', () => {
            div.querySelector('video').pause();
        });
        elements.historyGrid.appendChild(div);
    });
}

// Save favorite
async function saveFavorite() {
    if (!state.generatedVideoUrl) return;

    const entry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        videoUrl: state.generatedVideoUrl,
        thumbnailUrl: state.generatedVideoUrl,
        sourceImage: state.uploadedImageBase64,
        settings: {
            motionType: state.motionType,
            modelMotion: state.modelMotion,
            cameraMotion: state.cameraMotion,
            duration: state.duration,
            speed: state.speed,
            intensity: state.intensity,
            smoothness: state.smoothness,
            aspectRatio: state.aspectRatio,
            loop: state.loop
        },
        prompt: state.lastPrompt,
        seed: state.lastSeed
    };

    await favorites.add(entry.thumbnailUrl, entry);
    renderFavorites();
    showSuccess('Added to favorites!');
}

// Render favorites
async function renderFavorites() {
    const items = await favorites.getAll();
    elements.favoritesCount.textContent = items.length;

    if (items.length === 0) {
        elements.favoritesEmpty.style.display = 'flex';
        elements.favoritesGrid.querySelectorAll('.favorites-item').forEach(el => el.remove());
        return;
    }

    elements.favoritesEmpty.style.display = 'none';

    // Clear existing items except empty state
    elements.favoritesGrid.querySelectorAll('.favorites-item').forEach(el => el.remove());

    // Add items
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'favorites-item';
        div.innerHTML = `
            <video src="${item.videoUrl || item.thumbnailUrl}" muted loop preload="metadata"></video>
            <div class="play-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            </div>
        `;
        div.addEventListener('click', () => openFavoritesModal(item));
        div.addEventListener('mouseenter', () => {
            div.querySelector('video').play();
        });
        div.addEventListener('mouseleave', () => {
            div.querySelector('video').pause();
        });
        elements.favoritesGrid.appendChild(div);
    });
}

// Open favorites modal
function openFavoritesModal(item) {
    state.selectedFavorite = item;

    elements.favoritesModalBody.innerHTML = `
        <div class="modal-preview">
            <video src="${item.videoUrl || item.thumbnailUrl}" controls loop playsinline></video>
        </div>
        <div class="modal-details">
            <div class="detail-row">
                <span class="detail-label">Motion Type:</span>
                <span class="detail-value">${item.settings?.motionType || 'model'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Model Motion:</span>
                <span class="detail-value">${modelMotions[item.settings?.modelMotion]?.name || 'Subtle Sway'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Camera Motion:</span>
                <span class="detail-value">${cameraMotions[item.settings?.cameraMotion]?.name || 'Zoom In'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${item.settings?.duration || 5}s</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Seed:</span>
                <span class="detail-value">${item.seed || 'Random'}</span>
            </div>
        </div>
    `;

    elements.favoritesModal.classList.add('show');
}

// Close favorites modal
function closeFavoritesModal() {
    elements.favoritesModal.classList.remove('show');
    state.selectedFavorite = null;
}

// Load favorite settings
function loadFavoriteSettings() {
    if (!state.selectedFavorite) return;

    const settings = state.selectedFavorite.settings;
    if (settings) {
        switchMotionType(settings.motionType || 'model');
        selectModelMotion(settings.modelMotion || 'subtle-sway');
        selectCameraMotion(settings.cameraMotion || 'zoom-in');
        state.duration = settings.duration || 5;
        state.speed = settings.speed || 'normal';
        state.intensity = settings.intensity || 'normal';
        state.smoothness = settings.smoothness || 'high';
        state.aspectRatio = settings.aspectRatio || '9:16';
        state.loop = settings.loop !== false;

        // Update UI
        elements.durationSlider.value = state.duration;
        elements.durationValue.textContent = state.duration;
        elements.loopVideo.checked = state.loop;

        // Update option buttons
        updateOptionButtons('[data-speed]', state.speed);
        updateOptionButtons('[data-intensity]', state.intensity);
        updateOptionButtons('[data-smoothness]', state.smoothness);
        updateOptionButtons('[data-aspect]', state.aspectRatio);
    }

    if (state.selectedFavorite.seed) {
        elements.seedInput.value = state.selectedFavorite.seed;
        state.seed = state.selectedFavorite.seed;
    }

    closeFavoritesModal();
    showSuccess('Settings loaded!');
}

// Delete favorite
async function deleteFavorite() {
    if (!state.selectedFavorite) return;

    await favorites.remove(state.selectedFavorite.id);
    closeFavoritesModal();
    renderFavorites();
    showSuccess('Removed from favorites');
}

// Update option buttons helper
function updateOptionButtons(selector, value) {
    document.querySelectorAll(selector).forEach(btn => {
        const attrValue = Object.values(btn.dataset)[0];
        btn.classList.toggle('active', attrValue === value);
    });
}

// Download MP4
async function downloadMp4() {
    if (!state.generatedVideoUrl) return;

    try {
        const response = await fetch(state.generatedVideoUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `model-video-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess('Video downloaded!');
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download video');
    }
}

// Download GIF (simplified - would need gif.js for real conversion)
async function downloadGif() {
    // For now, just download the video
    // Full GIF conversion would require gif.js or server-side processing
    showError('GIF export coming soon. Downloading MP4 instead.');
    downloadMp4();
}

// Handle image upload
function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showError('Please upload a valid image file');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('Image must be under 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.uploadedImageBase64 = e.target.result;
        state.uploadedImage = file;
        elements.previewImg.src = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Remove uploaded image
function removeImage() {
    state.uploadedImage = null;
    state.uploadedImageBase64 = null;
    elements.previewImg.src = '';
    elements.uploadArea.style.display = 'block';
    elements.imagePreview.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Form submit
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateVideo();
    });

    // Image upload
    elements.uploadArea.addEventListener('click', () => {
        elements.sourceImage.click();
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
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    elements.sourceImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });

    elements.removeImage.addEventListener('click', removeImage);

    // Motion tabs
    elements.motionTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.format-tab');
        if (tab) {
            switchMotionType(tab.dataset.motion);
        }
    });

    // Model motion grid
    elements.modelMotionGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.motion-btn');
        if (btn) {
            selectModelMotion(btn.dataset.motion);
        }
    });

    // Camera motion grid
    elements.cameraMotionGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.motion-btn');
        if (btn) {
            selectCameraMotion(btn.dataset.motion);
        }
    });

    // Duration slider
    elements.durationSlider.addEventListener('input', (e) => {
        state.duration = parseInt(e.target.value);
        elements.durationValue.textContent = state.duration;
    });

    // Loop checkbox
    elements.loopVideo.addEventListener('change', (e) => {
        state.loop = e.target.checked;
    });

    // Speed buttons
    document.querySelectorAll('[data-speed]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.speed = btn.dataset.speed;
            updateOptionButtons('[data-speed]', state.speed);
        });
    });

    // Intensity buttons
    document.querySelectorAll('[data-intensity]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.intensity = btn.dataset.intensity;
            updateOptionButtons('[data-intensity]', state.intensity);
        });
    });

    // Smoothness buttons
    document.querySelectorAll('[data-smoothness]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.smoothness = btn.dataset.smoothness;
            updateOptionButtons('[data-smoothness]', state.smoothness);
        });
    });

    // Aspect ratio buttons
    document.querySelectorAll('[data-aspect]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.aspectRatio = btn.dataset.aspect;
            updateOptionButtons('[data-aspect]', state.aspectRatio);
        });
    });

    // Advanced toggle
    elements.advancedToggle.addEventListener('click', () => {
        elements.advancedToggle.classList.toggle('expanded');
        elements.advancedContent.classList.toggle('show');
    });

    // Settings toggle
    elements.settingsToggle.addEventListener('click', () => {
        elements.settingsToggle.classList.toggle('expanded');
        elements.settingsContent.classList.toggle('show');
    });

    // Seed input
    elements.seedInput.addEventListener('change', (e) => {
        state.seed = e.target.value;
    });

    elements.randomizeSeed.addEventListener('click', () => {
        const seed = Math.floor(Math.random() * 999999999);
        elements.seedInput.value = seed;
        state.seed = seed.toString();
    });

    // API key
    elements.toggleApiKey.addEventListener('click', () => {
        const type = elements.videoApiKey.type === 'password' ? 'text' : 'password';
        elements.videoApiKey.type = type;
    });

    elements.saveApiKey.addEventListener('click', () => {
        state.videoApiKey = elements.videoApiKey.value;
        localStorage.setItem('video_api_key', state.videoApiKey);
        showSuccess('API key saved!');
    });

    // Result actions
    elements.downloadMp4Btn.addEventListener('click', downloadMp4);
    elements.downloadGifBtn.addEventListener('click', downloadGif);
    elements.favoriteBtn.addEventListener('click', saveFavorite);
    elements.regenerateBtn.addEventListener('click', generateVideo);

    // History
    elements.clearHistory.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all history? This cannot be undone.', { title: 'Clear History', confirmText: 'Clear', icon: 'warning' })) {
            await history.clear();
            renderHistory();
        }
    });

    // Favorites
    elements.clearFavorites.addEventListener('click', async () => {
        if (await SharedUI.confirm('Clear all favorites? This cannot be undone.', { title: 'Clear Favorites', confirmText: 'Clear All', icon: 'warning' })) {
            await favorites.clear();
            renderFavorites();
        }
    });

    // Favorites modal
    elements.closeFavoritesModal.addEventListener('click', closeFavoritesModal);
    elements.loadFavoriteSettings.addEventListener('click', loadFavoriteSettings);
    elements.deleteFavorite.addEventListener('click', deleteFavorite);

    elements.favoritesModal.addEventListener('click', (e) => {
        if (e.target === elements.favoritesModal) {
            closeFavoritesModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            generateVideo();
        }
        // Ctrl+D to download
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            downloadMp4();
        }
        // Escape to close modals
        if (e.key === 'Escape') {
            closeFavoritesModal();
        }
    });
}

// Initialize
async function init() {
    initElements();

    // Load API key
    const savedApiKey = localStorage.getItem('video_api_key');
    if (savedApiKey) {
        state.videoApiKey = savedApiKey;
        elements.videoApiKey.value = savedApiKey;
    }

    // Setup theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));
    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }


    // Render history and favorites
    await renderHistory();
    await renderFavorites();

    // Setup event listeners
    setupEventListeners();

    // Initial motion type state
    switchMotionType('model');
}

// Start
document.addEventListener('DOMContentLoaded', init);
