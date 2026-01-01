/**
 * Size Chart Generator - HEFAISTOS
 * Generate professional size charts for product listings
 */

// ============================================
// STATE
// ============================================
const state = {
    category: 'tops',
    chartStyle: 'table',
    chartTitle: 'Size Guide',
    unit: 'inches',
    visualStyle: 'clean',
    color: '#1e293b',
    size: 'medium',
    background: 'white',
    variations: 1,
    includeInstructions: true,
    brandLogo: null,
    seed: null,
    model: 'google/gemini-2.0-flash-exp:free',

    // Table data
    headers: ['Size', 'Chest (in)', 'Waist (in)', 'Length (in)'],
    rows: [
        ['S', '34-36', '28-30', '27'],
        ['M', '38-40', '32-34', '28'],
        ['L', '42-44', '36-38', '29'],
        ['XL', '46-48', '40-42', '30']
    ],

    // Generated
    generatedImages: [],
    lastPrompt: ''
};

// ============================================
// PRESETS
// ============================================
const categoryPresets = {
    tops: {
        headers: ['Size', 'Chest (in)', 'Waist (in)', 'Length (in)'],
        rows: [
            ['S', '34-36', '28-30', '27'],
            ['M', '38-40', '32-34', '28'],
            ['L', '42-44', '36-38', '29'],
            ['XL', '46-48', '40-42', '30']
        ]
    },
    bottoms: {
        headers: ['Size', 'Waist (in)', 'Hips (in)', 'Inseam (in)'],
        rows: [
            ['S / 28', '28-30', '36-38', '30'],
            ['M / 30', '30-32', '38-40', '31'],
            ['L / 32', '32-34', '40-42', '32'],
            ['XL / 34', '34-36', '42-44', '32']
        ]
    },
    dresses: {
        headers: ['Size', 'Bust (in)', 'Waist (in)', 'Hips (in)', 'Length (in)'],
        rows: [
            ['XS', '32-33', '24-25', '34-35', '35'],
            ['S', '34-35', '26-27', '36-37', '36'],
            ['M', '36-37', '28-29', '38-39', '37'],
            ['L', '38-40', '30-32', '40-42', '38']
        ]
    },
    shoes: {
        headers: ['US', 'UK', 'EU', 'Foot Length (in)', 'Foot Length (cm)'],
        rows: [
            ['6', '5.5', '39', '9.25', '23.5'],
            ['7', '6.5', '40', '9.625', '24.4'],
            ['8', '7.5', '41', '10', '25.4'],
            ['9', '8.5', '42', '10.375', '26.4'],
            ['10', '9.5', '43', '10.75', '27.3']
        ]
    },
    accessories: {
        headers: ['Size', 'Head Circ. (in)', 'Head Circ. (cm)'],
        rows: [
            ['S', '21-21.5', '53-55'],
            ['M', '22-22.5', '56-57'],
            ['L', '23-23.5', '58-60'],
            ['XL', '24-24.5', '61-62']
        ]
    },
    kids: {
        headers: ['Age', 'Size', 'Height (in)', 'Chest (in)', 'Waist (in)'],
        rows: [
            ['2-3Y', '2T-3T', '36-39', '21', '20'],
            ['4-5Y', '4-5', '40-44', '22-23', '21'],
            ['6-7Y', '6-7', '45-50', '24-25', '22'],
            ['8-10Y', '8-10', '51-55', '26-28', '23-24']
        ]
    }
};

const dataPresets = {
    'us-standard': {
        headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)'],
        rows: [
            ['XS', '32-34', '24-26', '34-36'],
            ['S', '34-36', '26-28', '36-38'],
            ['M', '38-40', '30-32', '40-42'],
            ['L', '42-44', '34-36', '44-46'],
            ['XL', '46-48', '38-40', '48-50'],
            ['XXL', '50-52', '42-44', '52-54']
        ]
    },
    'us-numeric': {
        headers: ['Size', 'Bust (in)', 'Waist (in)', 'Hips (in)'],
        rows: [
            ['0', '32', '24', '34'],
            ['2', '33', '25', '35'],
            ['4', '34', '26', '36'],
            ['6', '35', '27', '37'],
            ['8', '36', '28', '38'],
            ['10', '37.5', '29.5', '39.5'],
            ['12', '39', '31', '41']
        ]
    },
    'international': {
        headers: ['US', 'UK', 'EU', 'AU', 'Bust (in)', 'Waist (in)'],
        rows: [
            ['XS / 0-2', '4-6', '32-34', '4-6', '32-33', '24-25'],
            ['S / 4-6', '8-10', '36-38', '8-10', '34-35', '26-27'],
            ['M / 8-10', '12-14', '40-42', '12-14', '36-38', '28-30'],
            ['L / 12-14', '16-18', '44-46', '16-18', '40-42', '32-34'],
            ['XL / 16-18', '20-22', '48-50', '20-22', '44-46', '36-38']
        ]
    }
};

// ============================================
// DESCRIPTION MAPS
// ============================================
const chartStyleDescriptions = {
    table: 'clean tabular format with rows and columns, header row highlighted, alternating row colors for readability',
    visual: 'visual diagram showing a body/garment outline with measurement arrows and labels pointing to each measurement area',
    comparison: 'international size comparison chart showing equivalent sizes across US, UK, EU, and Asian sizing systems'
};

const visualStyleDescriptions = {
    clean: 'clean, professional design with subtle borders, clear typography, and organized layout',
    modern: 'modern design with rounded corners, subtle shadows, and contemporary sans-serif fonts',
    bold: 'bold, high-contrast design with strong colors and impactful typography',
    minimal: 'minimalist design with maximum whitespace and essential information only',
    luxury: 'elegant, premium design with refined typography and sophisticated color palette'
};

const backgroundDescriptions = {
    white: 'pure white background (#FFFFFF) for clean e-commerce ready images',
    light: 'light gray background (#F8FAFC) with subtle warmth',
    dark: 'dark background (#1E293B) with light text for contrast'
};

const sizeMap = {
    small: '600x800',
    medium: '800x1000',
    large: '1000x1200'
};

const categoryDescriptions = {
    tops: 'shirts, t-shirts, blouses, sweaters, jackets',
    bottoms: 'pants, jeans, shorts, skirts',
    dresses: 'dresses, jumpsuits, rompers',
    shoes: 'footwear including sneakers, heels, boots',
    accessories: 'hats, caps, belts, bags',
    kids: 'children\'s clothing by age group'
};

// ============================================
// ELEMENTS
// ============================================
let elements = {};

function initElements() {
    elements = {
        // Category & Style
        categoryGrid: document.getElementById('categoryGrid'),
        chartStyleGrid: document.getElementById('chartStyleGrid'),
        chartTitle: document.getElementById('chartTitle'),

        // Table Editor
        presetButtons: document.getElementById('presetButtons'),
        sizeTableEditor: document.getElementById('sizeTableEditor'),
        sizeTable: document.getElementById('sizeTable'),
        tableHeader: document.getElementById('tableHeader'),
        tableBody: document.getElementById('tableBody'),
        addColumnBtn: document.getElementById('addColumnBtn'),
        addRowBtn: document.getElementById('addRowBtn'),

        // Options
        unitToggle: document.querySelectorAll('.unit-btn'),
        visualStyleOptions: document.getElementById('visualStyleOptions'),
        colorGrid: document.getElementById('colorGrid'),
        customColor: document.getElementById('customColor'),

        // Advanced
        advancedToggle: document.getElementById('advancedToggle'),
        advancedSection: document.getElementById('advancedSection'),
        includeInstructions: document.getElementById('includeInstructions'),
        logoUploadArea: document.getElementById('logoUploadArea'),
        logoUploadText: document.getElementById('logoUploadText'),
        logoInput: document.getElementById('logoInput'),
        removeLogo: document.getElementById('removeLogo'),
        seedInput: document.getElementById('seedInput'),
        randomSeedBtn: document.getElementById('randomSeedBtn'),
        aiModel: document.getElementById('aiModel'),

        // API Settings
        settingsSection: document.getElementById('settingsSection'),
        settingsToggle: document.getElementById('settingsToggle'),
        apiKey: document.getElementById('apiKey'),
        toggleApiKey: document.getElementById('toggleApiKey'),
        saveApiKey: document.getElementById('saveApiKey'),

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
        historyGrid: document.getElementById('historyGrid'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
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
const imageStore = new ImageStore('size_chart_images');
const history = new SharedHistory('size_chart_history', 20);
const favorites = new SharedFavorites('size_chart_favorites', 30);

// ============================================
// PROMPT GENERATION
// ============================================
function generatePrompt() {
    const chartStyleDesc = chartStyleDescriptions[state.chartStyle];
    const visualDesc = visualStyleDescriptions[state.visualStyle];
    const bgDesc = backgroundDescriptions[state.background];
    const categoryDesc = categoryDescriptions[state.category];
    const dimensions = sizeMap[state.size];

    // Build table data string
    const headerRow = state.headers.join(' | ');
    const dataRows = state.rows.map(row => row.join(' | ')).join('\n');

    let prompt = `Create a professional size chart image for ${categoryDesc} (${state.category}).

CHART TITLE: "${state.chartTitle}"

CHART STYLE: ${chartStyleDesc}

SIZE DATA:
${headerRow}
${dataRows}

VISUAL DESIGN:
${visualDesc}
Primary color: ${state.color}
${bgDesc}`;

    if (state.chartStyle === 'visual') {
        prompt += '\n\nInclude a body/garment outline diagram with measurement arrows pointing to:';
        state.headers.slice(1).forEach(h => {
            prompt += `\n- ${h}`;
        });
    }

    if (state.chartStyle === 'comparison') {
        prompt += '\n\nShow international size equivalents clearly with country flags or labels for each region (US, UK, EU, etc.)';
    }

    if (state.includeInstructions) {
        prompt += `\n\nInclude a "How to Measure" section with brief tips:
- For chest/bust: Measure around the fullest part
- For waist: Measure around natural waistline
- For hips: Measure around the fullest part
- Use icons or small illustrations to show measurement positions`;
    }

    prompt += `\n\nREQUIREMENTS:
- Image size: ${dimensions} pixels
- High quality, e-commerce ready
- All text must be sharp and readable
- Professional typography
- Organized, easy to read layout
- Suitable for Amazon, Etsy, or Shopify product listings`;

    if (state.brandLogo) {
        prompt += '\n\nIncorporate the uploaded brand logo in a subtle position (corner or header).';
    }

    // Add language instruction for non-English
    prompt += SharedLanguage.getPrompt();

    return prompt;
}

// ============================================
// GENERATION
// ============================================
async function generateChart() {
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
        SharedUI.showError('Please enter your OpenRouter API key');
        return;
    }

    // Validate data
    if (state.rows.length === 0) {
        SharedUI.showError('Please add at least one size row');
        return;
    }

    // Show loading
    elements.resultPlaceholder.classList.add('hidden');
    elements.resultImages.classList.add('hidden');
    elements.resultActions.classList.add('hidden');
    elements.resultLoading.classList.remove('hidden');
    elements.generateBtn.disabled = true;

    const loadingMessages = [
        'Generating your size chart...',
        'Designing the layout...',
        'Adding measurements...',
        'Formatting table...',
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
            promises.push(generateSingleChart(apiKey, prompt, seed));
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
            title: state.chartTitle || 'Size Chart',
            prompt: prompt,
            seed: successfulImages[0].seed,
            settings: {
                category: state.category,
                chartStyle: state.chartStyle,
                visualStyle: state.visualStyle
            }
        });
        renderHistory();

    } catch (error) {
        console.error('Generation failed:', error);
        SharedUI.showError(error.message || 'Failed to generate size chart');
        elements.resultPlaceholder.classList.remove('hidden');
    } finally {
        clearInterval(messageInterval);
        elements.resultLoading.classList.add('hidden');
        elements.generateBtn.disabled = false;
    }
}

async function generateSingleChart(apiKey, prompt, seed) {
    try {
        const messages = [{
            role: 'user',
            content: state.brandLogo
                ? [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: state.brandLogo } }
                ]
                : prompt
        }];

        const body = {
            model: state.model,
            messages: messages,
            max_tokens: 4096,
            seed: seed
        };

        if (state.model.includes('gemini')) {
            body.modalities = ['image', 'text'];
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HEFAISTOS Size Chart'
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

function displayResults(images) {
    elements.resultImages.innerHTML = '';

    images.forEach((result, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-image-wrapper' + (images.length > 1 ? ' grid-view' : '');

        const img = document.createElement('img');
        img.className = 'result-image';
        img.src = result.imageUrl;
        img.alt = `Generated size chart ${index + 1}`;
        img.onclick = () => openLightbox(result.imageUrl);

        wrapper.appendChild(img);
        elements.resultImages.appendChild(wrapper);
    });

    elements.resultImages.classList.remove('hidden');
    elements.resultActions.classList.remove('hidden');
}

// ============================================
// TABLE MANAGEMENT
// ============================================
function renderTable() {
    // Render headers
    let headerHtml = '<th class="size-col">Size</th>';
    state.headers.slice(1).forEach((header, i) => {
        headerHtml += `<th><input type="text" class="header-input" value="${header}" data-col="${i + 1}"></th>`;
    });
    headerHtml += '<th class="col-actions"><button class="btn-remove-col" title="Remove last column">−</button></th>';
    elements.tableHeader.innerHTML = headerHtml;

    // Render rows
    let bodyHtml = '';
    state.rows.forEach((row, rowIndex) => {
        bodyHtml += '<tr>';
        row.forEach((cell, colIndex) => {
            const isSize = colIndex === 0;
            bodyHtml += `<td><input type="text" value="${cell}" class="cell-input${isSize ? ' size-cell' : ''}" data-row="${rowIndex}" data-col="${colIndex}"></td>`;
        });
        bodyHtml += `<td class="row-actions"><button class="btn-remove-row" data-row="${rowIndex}" title="Remove row">×</button></td>`;
        bodyHtml += '</tr>';
    });
    elements.tableBody.innerHTML = bodyHtml;

    // Add event listeners
    elements.tableHeader.querySelectorAll('.header-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const col = parseInt(e.target.dataset.col);
            state.headers[col] = e.target.value;
        });
    });

    elements.tableHeader.querySelector('.btn-remove-col')?.addEventListener('click', removeColumn);

    elements.tableBody.querySelectorAll('.cell-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            state.rows[row][col] = e.target.value;
        });
    });

    elements.tableBody.querySelectorAll('.btn-remove-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const row = parseInt(e.target.dataset.row);
            removeRow(row);
        });
    });
}

function addColumn() {
    const newHeader = 'Measurement';
    state.headers.push(newHeader);
    state.rows.forEach(row => row.push(''));
    renderTable();
}

function removeColumn() {
    if (state.headers.length <= 2) return;
    state.headers.pop();
    state.rows.forEach(row => row.pop());
    renderTable();
}

function addRow() {
    const newRow = state.headers.map((_, i) => i === 0 ? 'Size' : '');
    state.rows.push(newRow);
    renderTable();
}

function removeRow(index) {
    if (state.rows.length <= 1) return;
    state.rows.splice(index, 1);
    renderTable();
}

function applyPreset(presetKey) {
    const preset = dataPresets[presetKey];
    if (preset) {
        state.headers = [...preset.headers];
        state.rows = preset.rows.map(row => [...row]);
        renderTable();
    }
}

function applyCategoryPreset(category) {
    const preset = categoryPresets[category];
    if (preset) {
        state.headers = [...preset.headers];
        state.rows = preset.rows.map(row => [...row]);
        renderTable();
    }
}

// ============================================
// UI UPDATES
// ============================================
function updateCategory(category) {
    state.category = category;
    elements.categoryGrid.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    applyCategoryPreset(category);
}

function updateChartStyle(style) {
    state.chartStyle = style;
    elements.chartStyleGrid.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === style);
    });
}

function updateVisualStyle(style) {
    state.visualStyle = style;
    elements.visualStyleOptions.querySelectorAll('.vstyle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vstyle === style);
    });
}

function updateColor(color) {
    state.color = color;
    elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

function updateApiStatus() {
    const apiKey = elements.apiKey?.value?.trim();
    if (apiKey) {
        localStorage.setItem('openrouter_api_key', apiKey);
    }
}

// ============================================
// HISTORY & FAVORITES
// ============================================
function renderHistory() {
    const items = history.getAll();

    if (items.length === 0) {
        elements.historyGrid.innerHTML = '<div class="history-empty">No charts generated yet</div>';
        return;
    }

    elements.historyGrid.innerHTML = items.map(item => `
        <div class="history-item" data-id="${item.id}">
            <img src="${item.thumbnail}" alt="${item.title || 'Size Chart'}" loading="lazy">
            <div class="history-item-overlay">
                <span class="history-item-text">${item.title || 'Size Chart'}</span>
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
    const items = favorites.getAll();

    if (items.length === 0) {
        elements.favoritesGrid.innerHTML = '<div class="favorites-empty">No favorites saved</div>';
        return;
    }

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
            const images = await favorites.getImages(id);
            if (images?.imageUrl) {
                openLightbox(images.imageUrl);
            }
        };
    });
}

async function addToFavorites() {
    if (state.generatedImages.length === 0) {
        SharedUI.showError('No chart to save');
        return;
    }

    await favorites.add({
        name: state.chartTitle || 'Size Chart',
        thumbnail: state.generatedImages[0].imageUrl,
        imageUrl: state.generatedImages[0].imageUrl,
        imageUrls: state.generatedImages.map(r => r.imageUrl),
        seed: state.generatedImages[0].seed,
        prompt: state.lastPrompt,
        settings: {
            category: state.category,
            chartStyle: state.chartStyle,
            visualStyle: state.visualStyle
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
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Category selection
    elements.categoryGrid.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = () => updateCategory(btn.dataset.category);
    });

    // Chart style selection
    elements.chartStyleGrid.querySelectorAll('.style-btn').forEach(btn => {
        btn.onclick = () => updateChartStyle(btn.dataset.style);
    });

    // Chart title
    elements.chartTitle.oninput = () => state.chartTitle = elements.chartTitle.value;

    // Preset buttons
    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => applyPreset(btn.dataset.preset);
    });

    // Table controls
    elements.addColumnBtn.onclick = addColumn;
    elements.addRowBtn.onclick = addRow;

    // Unit toggle
    elements.unitToggle.forEach(btn => {
        btn.onclick = () => {
            elements.unitToggle.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.unit = btn.dataset.unit;
        };
    });

    // Visual style
    elements.visualStyleOptions.querySelectorAll('.vstyle-btn').forEach(btn => {
        btn.onclick = () => updateVisualStyle(btn.dataset.vstyle);
    });

    // Color selection
    elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => {
        if (!btn.classList.contains('color-btn-custom')) {
            btn.onclick = () => updateColor(btn.dataset.color);
        }
    });

    elements.customColor.onchange = () => {
        state.color = elements.customColor.value;
        elements.colorGrid.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
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

    // Advanced toggle
    elements.advancedToggle.onclick = () => {
        elements.advancedSection.classList.toggle('hidden');
        elements.advancedToggle.classList.toggle('active');
    };

    // Include instructions
    elements.includeInstructions.onchange = () => {
        state.includeInstructions = elements.includeInstructions.checked;
    };

    // Logo upload
    elements.logoUploadArea.onclick = () => elements.logoInput.click();
    elements.logoInput.onchange = () => {
        if (elements.logoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                state.brandLogo = e.target.result;
                elements.logoUploadText.textContent = 'Logo uploaded';
                elements.removeLogo.classList.remove('hidden');
            };
            reader.readAsDataURL(elements.logoInput.files[0]);
        }
    };
    elements.removeLogo.onclick = () => {
        state.brandLogo = null;
        elements.logoInput.value = '';
        elements.logoUploadText.textContent = 'Click to upload logo';
        elements.removeLogo.classList.add('hidden');
    };

    // Seed
    if (elements.randomSeedBtn) {
        elements.randomSeedBtn.onclick = () => {
            if (elements.seedInput) {
                elements.seedInput.value = Math.floor(Math.random() * 999999);
                state.seed = parseInt(elements.seedInput.value);
            }
        };
    }
    if (elements.seedInput) {
        elements.seedInput.oninput = () => {
            state.seed = elements.seedInput.value ? parseInt(elements.seedInput.value) : null;
        };
    }

    // Model
    if (elements.aiModel) {
        elements.aiModel.onchange = () => state.model = elements.aiModel.value;
    }

    // Settings toggle
    if (elements.settingsToggle && elements.settingsSection) {
        elements.settingsToggle.onclick = () => {
            elements.settingsSection.classList.toggle('active');
        };
    }

    // API key
    if (elements.apiKey) elements.apiKey.oninput = updateApiStatus;
    if (elements.toggleApiKey && elements.apiKey) {
        elements.toggleApiKey.onclick = () => {
            elements.apiKey.type = elements.apiKey.type === 'password' ? 'text' : 'password';
        };
    }
    if (elements.saveApiKey) {
        elements.saveApiKey.onclick = () => {
            updateApiStatus();
            SharedUI.showSuccess('API key saved');
        };
    }

    // Generate
    if (elements.generateBtn) elements.generateBtn.onclick = generateChart;

    // Result actions
    if (elements.downloadBtn) {
        elements.downloadBtn.onclick = () => {
            if (state.generatedImages.length > 0) {
                SharedDownload.downloadImage(state.generatedImages[0].imageUrl, 'size-chart');
            }
        };
    }

    if (elements.downloadZipBtn) {
        elements.downloadZipBtn.onclick = async () => {
            if (state.generatedImages.length > 0) {
                await SharedZip.downloadAsZip(
                    state.generatedImages.map(r => r.imageUrl),
                    'size-charts',
                    { prompt: state.lastPrompt, settings: { category: state.category } }
                );
            }
        };
    }

    if (elements.copyPromptBtn) {
        elements.copyPromptBtn.onclick = () => {
            if (state.lastPrompt) {
                SharedClipboard.copy(state.lastPrompt);
                SharedUI.showSuccess('Prompt copied to clipboard');
            }
        };
    }

    if (elements.favoriteBtn) elements.favoriteBtn.onclick = addToFavorites;

    // History
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.onclick = async () => {
            if (await SharedConfirm.show('Clear all history?')) {
                await history.clear();
                renderHistory();
            }
        };
    }

    // Favorites modal
    if (elements.viewFavoritesBtn && elements.favoritesModal) {
        elements.viewFavoritesBtn.onclick = () => {
            renderFavoritesModal();
            elements.favoritesModal.classList.add('visible');
        };
    }
    if (elements.closeFavoritesModal && elements.favoritesModal) {
        elements.closeFavoritesModal.onclick = () => elements.favoritesModal.classList.remove('visible');
    }
    if (elements.favoritesModal) {
        elements.favoritesModal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
            elements.favoritesModal.classList.remove('visible');
        });
    }

    // Lightbox
    if (elements.lightboxClose) elements.lightboxClose.onclick = closeLightbox;
    if (elements.lightbox) {
        elements.lightbox.onclick = (e) => {
            if (e.target === elements.lightbox) closeLightbox();
        };
    }
    if (elements.lightboxDownload && elements.lightboxImage) {
        elements.lightboxDownload.onclick = () => {
            SharedDownload.downloadImage(elements.lightboxImage.src, 'size-chart');
        };
    }
    if (elements.lightboxFavorite) elements.lightboxFavorite.onclick = addToFavorites;

    // Keyboard shortcuts
    SharedKeyboard.setup({
        generate: generateChart,
        download: () => elements.downloadBtn?.click(),
        escape: () => {
            closeLightbox();
            if (elements.favoritesModal) elements.favoritesModal.classList.remove('visible');
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
            const images = await favorites.getImages(id);
            if (images?.imageUrl) {
                openLightbox(images.imageUrl);
                elements.favoritesModal.classList.remove('visible');
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

    // Render initial table
    renderTable();

    // Setup
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
        OnboardingTour.init('size-chart');
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
