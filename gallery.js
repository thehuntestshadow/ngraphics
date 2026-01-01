/**
 * HEFAISTOS - Gallery Page
 * Handles filtering, lightbox, and gallery interactions
 */

// ============================================
// GALLERY DATA
// ============================================

const galleryImages = [
    {
        id: 'inf-001',
        src: 'assets/gallery/infographic-1.jpg',
        studio: 'infographics',
        studioLabel: 'Infographics',
        title: 'Product Features Infographic',
        description: 'Professional product feature callouts with clean design'
    },
    {
        id: 'inf-002',
        src: 'assets/gallery/infographic-2.jpg',
        studio: 'infographics',
        studioLabel: 'Infographics',
        title: 'Benefits Showcase',
        description: 'Highlight product benefits with visual icons'
    },
    {
        id: 'model-001',
        src: 'assets/gallery/model-1.jpg',
        studio: 'models',
        studioLabel: 'Model Studio',
        title: 'Fashion Model Photography',
        description: 'AI-generated model wearing product'
    },
    {
        id: 'model-002',
        src: 'assets/gallery/model-2.jpg',
        studio: 'models',
        studioLabel: 'Model Studio',
        title: 'Product Showcase',
        description: 'Model holding product with natural lighting'
    },
    {
        id: 'life-001',
        src: 'assets/gallery/lifestyle-1.jpg',
        studio: 'lifestyle',
        studioLabel: 'Lifestyle',
        title: 'Living Room Scene',
        description: 'Product in cozy home environment'
    },
    {
        id: 'life-002',
        src: 'assets/gallery/lifestyle-2.jpg',
        studio: 'lifestyle',
        studioLabel: 'Lifestyle',
        title: 'Kitchen Setting',
        description: 'Product in modern kitchen environment'
    },
    {
        id: 'bundle-001',
        src: 'assets/gallery/bundle-1.jpg',
        studio: 'bundle',
        studioLabel: 'Bundle Studio',
        title: 'Product Bundle',
        description: 'Multiple products arranged in flat lay style'
    },
    {
        id: 'social-001',
        src: 'assets/gallery/social-1.jpg',
        studio: 'social',
        studioLabel: 'Social Studio',
        title: 'Instagram Post',
        description: 'Square format social media graphic'
    },
    {
        id: 'social-002',
        src: 'assets/gallery/social-2.jpg',
        studio: 'social',
        studioLabel: 'Social Studio',
        title: 'Story Format',
        description: 'Vertical story graphic for Instagram/TikTok'
    },
    {
        id: 'pack-001',
        src: 'assets/gallery/packaging-1.jpg',
        studio: 'packaging',
        studioLabel: 'Packaging',
        title: 'Product Box Mockup',
        description: 'Product packaging visualization'
    },
    {
        id: 'bg-001',
        src: 'assets/gallery/background-1.jpg',
        studio: 'background',
        studioLabel: 'Background',
        title: 'Clean Background',
        description: 'Product with removed and replaced background'
    },
    {
        id: 'compare-001',
        src: 'assets/gallery/comparison-1.jpg',
        studio: 'comparison',
        studioLabel: 'Comparison',
        title: 'Before/After',
        description: 'Side-by-side product comparison'
    }
];

// Studio filter configuration
const studioFilters = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'infographics', label: 'Infographics', count: 0 },
    { id: 'models', label: 'Model Studio', count: 0 },
    { id: 'lifestyle', label: 'Lifestyle', count: 0 },
    { id: 'bundle', label: 'Bundle', count: 0 },
    { id: 'social', label: 'Social', count: 0 },
    { id: 'packaging', label: 'Packaging', count: 0 },
    { id: 'background', label: 'Background', count: 0 },
    { id: 'comparison', label: 'Comparison', count: 0 }
];

// ============================================
// STATE
// ============================================

const state = {
    activeFilter: 'all',
    filteredImages: [],
    lightboxIndex: -1
};

// ============================================
// DOM ELEMENTS
// ============================================

let elements = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

function init() {
    // Cache DOM elements
    elements = {
        filterBar: document.getElementById('filterBar'),
        galleryGrid: document.getElementById('galleryGrid'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxStudio: document.getElementById('lightboxStudio'),
        lightboxTitle: document.getElementById('lightboxTitle'),
        lightboxDesc: document.getElementById('lightboxDesc'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        lightboxBackdrop: document.querySelector('.lightbox-backdrop')
    };

    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));

    // Initialize account menu
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Calculate filter counts
    calculateFilterCounts();

    // Render filters
    renderFilters();

    // Render gallery
    filterGallery('all');

    // Setup lightbox
    setupLightbox();

    // Setup keyboard navigation
    setupKeyboard();
}

// ============================================
// FILTER LOGIC
// ============================================

function calculateFilterCounts() {
    // Reset counts
    studioFilters.forEach(f => f.count = 0);

    // Count images per studio
    galleryImages.forEach(img => {
        const filter = studioFilters.find(f => f.id === img.studio);
        if (filter) filter.count++;
    });

    // Set "All" count
    studioFilters[0].count = galleryImages.length;
}

function renderFilters() {
    if (!elements.filterBar) return;

    elements.filterBar.innerHTML = studioFilters
        .filter(f => f.count > 0 || f.id === 'all')
        .map(filter => `
            <button class="filter-btn ${filter.id === state.activeFilter ? 'active' : ''}"
                    data-filter="${filter.id}">
                ${filter.label}
                <span class="filter-count">${filter.count}</span>
            </button>
        `).join('');

    // Add click handlers
    elements.filterBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterId = btn.dataset.filter;
            filterGallery(filterId);
        });
    });
}

function filterGallery(filterId) {
    state.activeFilter = filterId;

    // Update active button
    elements.filterBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filterId);
    });

    // Filter images
    state.filteredImages = filterId === 'all'
        ? [...galleryImages]
        : galleryImages.filter(img => img.studio === filterId);

    // Render gallery
    renderGallery();
}

// ============================================
// GALLERY RENDERING
// ============================================

function renderGallery() {
    if (!elements.galleryGrid) return;

    if (state.filteredImages.length === 0) {
        elements.galleryGrid.innerHTML = `
            <div class="gallery-empty">
                <svg class="gallery-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <h3 class="gallery-empty-title">No images found</h3>
                <p class="gallery-empty-desc">Try selecting a different filter.</p>
            </div>
        `;
        return;
    }

    elements.galleryGrid.innerHTML = state.filteredImages.map((img, index) => `
        <div class="gallery-card" data-index="${index}" data-id="${img.id}">
            <img src="${img.src}" alt="${img.title}" loading="lazy"
                 onerror="this.parentElement.classList.add('loading'); this.style.display='none'">
            <div class="gallery-card-overlay">
                <span class="gallery-card-studio">
                    ${getStudioIcon(img.studio)}
                    ${img.studioLabel}
                </span>
                <h3 class="gallery-card-title">${img.title}</h3>
                <p class="gallery-card-desc">${img.description}</p>
            </div>
        </div>
    `).join('');

    // Add click handlers
    elements.galleryGrid.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            openLightbox(index);
        });
    });
}

function getStudioIcon(studio) {
    const icons = {
        infographics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
        models: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>',
        lifestyle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
        bundle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
        social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/></svg>',
        packaging: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
        background: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>',
        comparison: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>'
    };
    return icons[studio] || icons.infographics;
}

// ============================================
// LIGHTBOX
// ============================================

function setupLightbox() {
    // Close button
    elements.lightboxClose?.addEventListener('click', closeLightbox);

    // Backdrop click
    elements.lightboxBackdrop?.addEventListener('click', closeLightbox);

    // Navigation
    elements.lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
    elements.lightboxNext?.addEventListener('click', () => navigateLightbox(1));
}

function openLightbox(index) {
    state.lightboxIndex = index;
    const img = state.filteredImages[index];

    if (!img || !elements.lightbox) return;

    elements.lightboxImage.src = img.src;
    elements.lightboxStudio.textContent = img.studioLabel;
    elements.lightboxTitle.textContent = img.title;
    elements.lightboxDesc.textContent = img.description;

    elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update nav buttons visibility
    updateLightboxNav();
}

function closeLightbox() {
    if (!elements.lightbox) return;

    elements.lightbox.classList.remove('active');
    document.body.style.overflow = '';
    state.lightboxIndex = -1;
}

function navigateLightbox(direction) {
    const newIndex = state.lightboxIndex + direction;

    if (newIndex >= 0 && newIndex < state.filteredImages.length) {
        openLightbox(newIndex);
    }
}

function updateLightboxNav() {
    if (elements.lightboxPrev) {
        elements.lightboxPrev.style.display = state.lightboxIndex > 0 ? 'flex' : 'none';
    }
    if (elements.lightboxNext) {
        elements.lightboxNext.style.display = state.lightboxIndex < state.filteredImages.length - 1 ? 'flex' : 'none';
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
        if (!elements.lightbox?.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    });
}
