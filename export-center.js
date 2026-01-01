// Export Center - JavaScript

const STUDIO_ID = 'export-center';

// State
const state = {
    currentTool: 'resize',
    images: [],
    processedImages: [],

    // Resize options
    sizePreset: 'original',
    customWidth: 1080,
    customHeight: 1080,
    lockAspect: true,
    fitMode: 'contain',

    // Compress options
    quality: 85,
    maxSize: null,

    // Watermark options
    watermarkType: 'text',
    watermarkText: '',
    watermarkFontSize: 24,
    watermarkLogo: null,
    watermarkLogoBase64: null,
    watermarkPosition: 'center',
    watermarkOpacity: 50,

    // Export options
    outputFormat: 'jpg',
    namingPattern: '{name}-{size}',
    zipExport: true,
    preserveMetadata: false,

    // History
    history: []
};

// Size presets
const sizePresets = {
    original: { width: null, height: null, label: 'Original' },
    amazon: { width: 2000, height: 2000, label: 'Amazon' },
    instagram: { width: 1080, height: 1080, label: 'Instagram' },
    facebook: { width: 1200, height: 628, label: 'Facebook' },
    pinterest: { width: 1000, height: 1500, label: 'Pinterest' },
    etsy: { width: 2000, height: 2000, label: 'Etsy' },
    shopify: { width: 2048, height: 2048, label: 'Shopify' },
    custom: { width: null, height: null, label: 'Custom' }
};

// Elements cache
const elements = {};

// History storage
const history = new SharedHistory('export_center_history', 20);

function initElements() {
    elements.form = document.getElementById('exportForm');
    elements.toolTabs = document.getElementById('toolTabs');
    elements.uploadArea = document.getElementById('uploadArea');
    elements.imageFiles = document.getElementById('imageFiles');
    elements.imageList = document.getElementById('imageList');
    elements.imageCount = document.getElementById('imageCount');

    // Tool sections
    elements.resizeSection = document.getElementById('resizeSection');
    elements.compressSection = document.getElementById('compressSection');
    elements.watermarkSection = document.getElementById('watermarkSection');
    elements.convertSection = document.getElementById('convertSection');

    // Resize elements
    elements.sizePresets = document.getElementById('sizePresets');
    elements.customSizeSection = document.getElementById('customSizeSection');
    elements.customWidth = document.getElementById('customWidth');
    elements.customHeight = document.getElementById('customHeight');
    elements.lockAspect = document.getElementById('lockAspect');

    // Compress elements
    elements.qualitySlider = document.getElementById('qualitySlider');
    elements.qualityValue = document.getElementById('qualityValue');

    // Watermark elements
    elements.watermarkText = document.getElementById('watermarkText');
    elements.wmFontSize = document.getElementById('wmFontSize');
    elements.logoUploadArea = document.getElementById('logoUploadArea');
    elements.logoFile = document.getElementById('logoFile');
    elements.textWatermarkSection = document.getElementById('textWatermarkSection');
    elements.logoWatermarkSection = document.getElementById('logoWatermarkSection');
    elements.wmOpacity = document.getElementById('wmOpacity');
    elements.opacityValue = document.getElementById('opacityValue');

    // Export elements
    elements.namingPattern = document.getElementById('namingPattern');
    elements.zipExport = document.getElementById('zipExport');
    elements.preserveMetadata = document.getElementById('preserveMetadata');

    // Process button
    elements.processBtn = document.getElementById('processBtn');

    // Output elements
    elements.resultPlaceholder = document.getElementById('resultPlaceholder');
    elements.loadingContainer = document.getElementById('loadingContainer');
    elements.progressFill = document.getElementById('progressFill');
    elements.progressText = document.getElementById('progressText');
    elements.previewDisplay = document.getElementById('previewDisplay');
    elements.originalPreview = document.getElementById('originalPreview');
    elements.resultPreview = document.getElementById('resultPreview');
    elements.originalInfo = document.getElementById('originalInfo');
    elements.resultInfo = document.getElementById('resultInfo');
    elements.batchResults = document.getElementById('batchResults');
    elements.batchGrid = document.getElementById('batchGrid');
    elements.downloadAllBtn = document.getElementById('downloadAllBtn');

    // History elements
    elements.historyPanel = document.getElementById('historyPanel');
    elements.historyGrid = document.getElementById('historyGrid');
    elements.historyCount = document.getElementById('historyCount');
    elements.historyEmpty = document.getElementById('historyEmpty');
    elements.clearHistory = document.getElementById('clearHistory');

    // Messages
    elements.errorMessage = document.getElementById('errorMessage');
    elements.successMessage = document.getElementById('successMessage');
}

function switchTool(tool) {
    state.currentTool = tool;

    // Update tab buttons
    elements.toolTabs.querySelectorAll('.tool-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tool === tool);
    });

    // Show/hide sections
    elements.resizeSection.style.display = tool === 'resize' ? 'block' : 'none';
    elements.compressSection.style.display = tool === 'compress' ? 'block' : 'none';
    elements.watermarkSection.style.display = tool === 'watermark' ? 'block' : 'none';
    elements.convertSection.style.display = tool === 'convert' ? 'block' : 'none';

    // Update button text
    const buttonLabels = {
        resize: 'Resize & Download',
        compress: 'Compress & Download',
        watermark: 'Apply Watermark & Download',
        convert: 'Convert & Export'
    };
    elements.processBtn.querySelector('.btn-content').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        ${buttonLabels[tool]}
    `;
}

function selectPreset(preset) {
    state.sizePreset = preset;

    elements.sizePresets.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === preset);
    });

    // Show/hide custom size inputs
    elements.customSizeSection.style.display = preset === 'custom' ? 'block' : 'none';

    // Set dimensions for non-custom presets
    if (preset !== 'custom' && preset !== 'original' && sizePresets[preset]) {
        state.customWidth = sizePresets[preset].width;
        state.customHeight = sizePresets[preset].height;
    }
}

function addImages(files) {
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.images.push({
                    id: Date.now() + Math.random(),
                    file,
                    name: file.name,
                    width: img.width,
                    height: img.height,
                    size: file.size,
                    dataUrl: e.target.result,
                    aspectRatio: img.width / img.height
                });
                renderImageList();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function removeImage(id) {
    state.images = state.images.filter(img => img.id !== id);
    renderImageList();
}

function renderImageList() {
    elements.imageCount.textContent = state.images.length;

    if (state.images.length === 0) {
        elements.imageList.style.display = 'none';
        return;
    }

    elements.imageList.style.display = 'flex';
    elements.imageList.innerHTML = state.images.map(img => `
        <div class="image-item" data-id="${img.id}">
            <img class="image-item-thumb" src="${img.dataUrl}" alt="${img.name}">
            <div class="image-item-info">
                <div class="image-item-name">${img.name}</div>
                <div class="image-item-size">${img.width}×${img.height} • ${formatFileSize(img.size)}</div>
            </div>
            <button type="button" class="image-item-remove" onclick="removeImage(${img.id})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function processImages() {
    if (state.images.length === 0) {
        showError('Please upload at least one image');
        return;
    }

    showLoading();
    state.processedImages = [];

    try {
        for (let i = 0; i < state.images.length; i++) {
            updateProgress(i + 1, state.images.length);
            const processed = await processImage(state.images[i]);
            state.processedImages.push(processed);
        }

        hideLoading();
        showResults();
        showSuccess(`Processed ${state.processedImages.length} image${state.processedImages.length > 1 ? 's' : ''}`);

        // Add to history
        addToHistory();

    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to process images');
    }
}

async function processImage(imageData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Load image
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData.dataUrl;
    });

    // Calculate target dimensions
    let targetWidth = img.width;
    let targetHeight = img.height;

    if (state.currentTool === 'resize' && state.sizePreset !== 'original') {
        if (state.sizePreset === 'custom') {
            targetWidth = parseInt(state.customWidth) || img.width;
            targetHeight = parseInt(state.customHeight) || img.height;
        } else if (sizePresets[state.sizePreset]) {
            targetWidth = sizePresets[state.sizePreset].width;
            targetHeight = sizePresets[state.sizePreset].height;
        }

        // Apply fit mode
        if (state.fitMode === 'contain') {
            const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
            targetWidth = Math.round(img.width * scale);
            targetHeight = Math.round(img.height * scale);
        } else if (state.fitMode === 'cover') {
            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            targetWidth = Math.round(img.width * scale);
            targetHeight = Math.round(img.height * scale);
        }
        // 'fill' just stretches to exact dimensions
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw image
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Apply watermark if needed
    if (state.currentTool === 'watermark') {
        await applyWatermark(ctx, canvas);
    }

    // Determine output format and quality
    let format = 'image/jpeg';
    let quality = 0.92;

    if (state.currentTool === 'convert') {
        format = state.outputFormat === 'png' ? 'image/png' :
            state.outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    }

    if (state.currentTool === 'compress') {
        quality = state.quality / 100;
        format = 'image/jpeg'; // JPEG for best compression
    }

    // Get output data
    let outputDataUrl = canvas.toDataURL(format, quality);

    // If max size specified for compression, reduce quality until under limit
    if (state.currentTool === 'compress' && state.maxSize) {
        const maxBytes = state.maxSize * 1024;
        let currentQuality = quality;

        while (getDataUrlSize(outputDataUrl) > maxBytes && currentQuality > 0.1) {
            currentQuality -= 0.05;
            outputDataUrl = canvas.toDataURL(format, currentQuality);
        }
    }

    // Generate output filename
    const outputName = generateFilename(imageData.name, targetWidth, targetHeight);

    return {
        original: imageData,
        dataUrl: outputDataUrl,
        name: outputName,
        width: targetWidth,
        height: targetHeight,
        size: getDataUrlSize(outputDataUrl),
        format: format.split('/')[1]
    };
}

function getDataUrlSize(dataUrl) {
    // Estimate size from base64 data URL
    const base64 = dataUrl.split(',')[1];
    return Math.round((base64.length * 3) / 4);
}

async function applyWatermark(ctx, canvas) {
    const opacity = state.watermarkOpacity / 100;
    ctx.globalAlpha = opacity;

    // Calculate position
    const padding = 20;
    let x, y;

    switch (state.watermarkPosition) {
        case 'top-left':
            x = padding;
            y = padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            break;
        case 'top-center':
            x = canvas.width / 2;
            y = padding;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            break;
        case 'top-right':
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            break;
        case 'center-left':
            x = padding;
            y = canvas.height / 2;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            break;
        case 'center':
            x = canvas.width / 2;
            y = canvas.height / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            break;
        case 'center-right':
            x = canvas.width - padding;
            y = canvas.height / 2;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            break;
        case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            break;
        case 'bottom-center':
            x = canvas.width / 2;
            y = canvas.height - padding;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            break;
        case 'bottom-right':
            x = canvas.width - padding;
            y = canvas.height - padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
    }

    if (state.watermarkType === 'text' && state.watermarkText) {
        // Scale font size relative to image size
        const fontSize = Math.round(state.watermarkFontSize * (canvas.width / 1000));
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;

        // Draw text with outline for visibility
        ctx.strokeText(state.watermarkText, x, y);
        ctx.fillText(state.watermarkText, x, y);

    } else if (state.watermarkType === 'logo' && state.watermarkLogoBase64) {
        const logo = new Image();
        await new Promise((resolve) => {
            logo.onload = resolve;
            logo.src = state.watermarkLogoBase64;
        });

        // Scale logo to reasonable size (max 20% of image width)
        const maxLogoWidth = canvas.width * 0.2;
        const scale = Math.min(1, maxLogoWidth / logo.width);
        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;

        // Adjust position for logo dimensions
        let drawX = x;
        let drawY = y;

        if (ctx.textAlign === 'center') drawX -= logoWidth / 2;
        else if (ctx.textAlign === 'right') drawX -= logoWidth;

        if (ctx.textBaseline === 'middle') drawY -= logoHeight / 2;
        else if (ctx.textBaseline === 'bottom') drawY -= logoHeight;

        ctx.drawImage(logo, drawX, drawY, logoWidth, logoHeight);
    }

    ctx.globalAlpha = 1;
}

function generateFilename(originalName, width, height) {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const date = new Date().toISOString().split('T')[0];
    const extension = state.currentTool === 'convert' ? state.outputFormat : 'jpg';

    let pattern = state.namingPattern || '{name}';
    pattern = pattern
        .replace('{name}', baseName)
        .replace('{size}', `${width}x${height}`)
        .replace('{date}', date)
        .replace('{index}', '1');

    return `${pattern}.${extension}`;
}

function showLoading() {
    elements.resultPlaceholder.style.display = 'none';
    elements.previewDisplay.style.display = 'none';
    elements.batchResults.style.display = 'none';
    elements.loadingContainer.style.display = 'flex';
    elements.progressFill.style.width = '0%';
}

function hideLoading() {
    elements.loadingContainer.style.display = 'none';
}

function updateProgress(current, total) {
    const percent = (current / total) * 100;
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${current} of ${total}`;
}

function showResults() {
    if (state.processedImages.length === 1) {
        // Single image - show comparison
        const processed = state.processedImages[0];
        elements.originalPreview.src = processed.original.dataUrl;
        elements.resultPreview.src = processed.dataUrl;
        elements.originalInfo.textContent = `${processed.original.width}×${processed.original.height} • ${formatFileSize(processed.original.size)}`;
        elements.resultInfo.textContent = `${processed.width}×${processed.height} • ${formatFileSize(processed.size)}`;
        elements.previewDisplay.style.display = 'block';
        elements.batchResults.style.display = 'none';
    } else {
        // Multiple images - show grid
        elements.batchGrid.innerHTML = state.processedImages.map((p, i) => `
            <div class="batch-item">
                <img src="${p.dataUrl}" alt="${p.name}">
                <div class="batch-item-actions">
                    <button type="button" class="batch-item-btn" onclick="downloadSingle(${i})" title="Download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                </div>
                <div class="batch-item-info">
                    <div class="batch-item-name">${p.name}</div>
                    <span>${p.width}×${p.height} • ${formatFileSize(p.size)}</span>
                </div>
            </div>
        `).join('');
        elements.previewDisplay.style.display = 'none';
        elements.batchResults.style.display = 'block';
    }
}

function downloadSingle(index) {
    const processed = state.processedImages[index];
    downloadDataUrl(processed.dataUrl, processed.name);
}

function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function downloadAll() {
    if (state.processedImages.length === 0) return;

    if (state.processedImages.length === 1 || !state.zipExport) {
        // Download individually
        state.processedImages.forEach((p, i) => {
            setTimeout(() => downloadDataUrl(p.dataUrl, p.name), i * 200);
        });
    } else {
        // Create ZIP file using JSZip-like approach
        // For simplicity, just download individually with delay
        showSuccess('Downloading images...');
        state.processedImages.forEach((p, i) => {
            setTimeout(() => downloadDataUrl(p.dataUrl, p.name), i * 300);
        });
    }
}

function addToHistory() {
    if (state.processedImages.length === 0) return;

    const firstProcessed = state.processedImages[0];
    history.add({
        thumbnail: firstProcessed.dataUrl,
        tool: state.currentTool,
        count: state.processedImages.length,
        timestamp: Date.now()
    });

    renderHistory();
}

function renderHistory() {
    const panel = elements.historyPanel;
    const items = history.getAll();
    elements.historyCount.textContent = items.length;

    if (items.length === 0) {
        panel.classList.remove('has-items');
        if (elements.historyEmpty) {
            elements.historyEmpty.style.display = 'none';
        }
        return;
    }

    panel.classList.add('has-items');
    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="Export" loading="lazy">
            <div class="history-item-overlay">
                <span class="history-tool">${item.tool}</span>
                <span class="history-count">${item.count} image${item.count > 1 ? 's' : ''}</span>
            </div>
        </div>
    `).join('');
}

function clearHistoryData() {
    history.clear();
    renderHistory();
    showSuccess('History cleared');
}

function showError(message) {
    elements.errorMessage.querySelector('.error-text').textContent = message;
    elements.errorMessage.classList.add('visible');
    setTimeout(() => {
        elements.errorMessage.classList.remove('visible');
    }, 5000);
}

function showSuccess(message) {
    elements.successMessage.querySelector('.message-content').textContent = message;
    elements.successMessage.classList.add('visible');
    setTimeout(() => {
        elements.successMessage.classList.remove('visible');
    }, 3000);
}

function setupEventListeners() {
    // Tool tabs
    elements.toolTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tool-tab');
        if (tab) {
            switchTool(tab.dataset.tool);
        }
    });

    // File upload
    elements.uploadArea.addEventListener('click', () => elements.imageFiles.click());
    elements.imageFiles.addEventListener('change', (e) => addImages(e.target.files));

    // Drag and drop
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });
    elements.uploadArea.addEventListener('dragleave', () => {
        elements.uploadArea.classList.remove('drag-over');
    });
    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        addImages(e.dataTransfer.files);
    });

    // Size presets
    elements.sizePresets.addEventListener('click', (e) => {
        const btn = e.target.closest('.preset-btn');
        if (btn) {
            selectPreset(btn.dataset.preset);
        }
    });

    // Custom dimensions
    elements.customWidth.addEventListener('input', (e) => {
        state.customWidth = parseInt(e.target.value) || 0;
        if (state.lockAspect && state.images.length > 0) {
            const aspectRatio = state.images[0].aspectRatio;
            state.customHeight = Math.round(state.customWidth / aspectRatio);
            elements.customHeight.value = state.customHeight;
        }
    });

    elements.customHeight.addEventListener('input', (e) => {
        state.customHeight = parseInt(e.target.value) || 0;
        if (state.lockAspect && state.images.length > 0) {
            const aspectRatio = state.images[0].aspectRatio;
            state.customWidth = Math.round(state.customHeight * aspectRatio);
            elements.customWidth.value = state.customWidth;
        }
    });

    elements.lockAspect.addEventListener('click', () => {
        state.lockAspect = !state.lockAspect;
        elements.lockAspect.classList.toggle('active', state.lockAspect);
    });

    // Fit mode
    document.querySelectorAll('[data-fit]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-fit]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.fitMode = btn.dataset.fit;
        });
    });

    // Quality slider
    elements.qualitySlider.addEventListener('input', (e) => {
        state.quality = parseInt(e.target.value);
        elements.qualityValue.textContent = `${state.quality}%`;
    });

    // Max size options
    document.querySelectorAll('[data-maxsize]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-maxsize]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.maxSize = btn.dataset.maxsize === 'none' ? null : parseInt(btn.dataset.maxsize);
        });
    });

    // Watermark type
    document.querySelectorAll('[data-wmtype]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-wmtype]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.watermarkType = btn.dataset.wmtype;
            elements.textWatermarkSection.style.display = state.watermarkType === 'text' ? 'block' : 'none';
            elements.logoWatermarkSection.style.display = state.watermarkType === 'logo' ? 'block' : 'none';
        });
    });

    // Watermark text
    elements.watermarkText.addEventListener('input', (e) => {
        state.watermarkText = e.target.value;
    });

    elements.wmFontSize.addEventListener('input', (e) => {
        state.watermarkFontSize = parseInt(e.target.value);
    });

    // Logo upload
    elements.logoUploadArea.addEventListener('click', () => elements.logoFile.click());
    elements.logoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                state.watermarkLogoBase64 = evt.target.result;
                elements.logoUploadArea.querySelector('.upload-text').textContent = 'Logo loaded';
            };
            reader.readAsDataURL(file);
        }
    });

    // Watermark position
    document.querySelectorAll('[data-position]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-position]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.watermarkPosition = btn.dataset.position;
        });
    });

    // Watermark opacity
    elements.wmOpacity.addEventListener('input', (e) => {
        state.watermarkOpacity = parseInt(e.target.value);
        elements.opacityValue.textContent = `${state.watermarkOpacity}%`;
    });

    // Output format
    document.querySelectorAll('[data-format]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-format]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.outputFormat = btn.dataset.format;
        });
    });

    // Naming pattern
    elements.namingPattern.addEventListener('input', (e) => {
        state.namingPattern = e.target.value;
    });

    // Checkboxes
    elements.zipExport.addEventListener('change', (e) => {
        state.zipExport = e.target.checked;
    });

    elements.preserveMetadata.addEventListener('change', (e) => {
        state.preserveMetadata = e.target.checked;
    });

    // Form submit
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        processImages();
    });

    // Download all
    elements.downloadAllBtn.addEventListener('click', downloadAll);

    // Clear history
    elements.clearHistory.addEventListener('click', clearHistoryData);

    // Keyboard shortcuts
    SharedKeyboard.setup({
        generate: processImages,
        download: downloadAll
    });
}

async function init() {
    initElements();
    setupEventListeners();

    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle();

    // Initialize account menu (Supabase auth)
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Render history
    renderHistory();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('export-center');
    }
}

document.addEventListener('DOMContentLoaded', init);
