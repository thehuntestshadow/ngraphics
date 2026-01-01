/**
 * HEFAISTOS - FAQ Page
 * Loads FAQ content from CMS (Supabase) with fallback to static HTML
 */

// ============================================
// FAQ CATEGORIES
// ============================================

const FAQ_CATEGORIES = {
    'getting-started': 'Getting Started',
    'studios': 'Studios',
    'billing': 'Billing',
    'technical': 'Technical',
    'account': 'Account',
    'features': 'Features',
    'support': 'Support'
};

// ============================================
// STATE
// ============================================

const state = {
    faqs: [],
    activeCategory: 'all',
    searchQuery: '',
    loaded: false
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Initialize theme
    if (typeof SharedTheme !== 'undefined') {
        SharedTheme.init();
        SharedTheme.setupToggle(document.getElementById('themeToggle'));
    }

    // Initialize account menu
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Try loading from CMS
    await loadFAQFromCMS();

    // Setup interactions
    setupInteractions();
}

/**
 * Load FAQ items from Supabase CMS
 * Falls back to existing static HTML if unavailable
 */
async function loadFAQFromCMS() {
    try {
        if (typeof ngSupabase === 'undefined') {
            console.log('[FAQ] Supabase not available, using static HTML');
            return;
        }

        await ngSupabase.init();

        const cmsData = await ngSupabase.getCMSFAQ({ activeOnly: true });

        if (cmsData && cmsData.length > 0) {
            state.faqs = cmsData;
            state.loaded = true;
            renderFAQList();
            updateCategoryTabs();
            console.log(`[FAQ] Loaded ${state.faqs.length} items from CMS`);
        } else {
            console.log('[FAQ] No CMS data, using static HTML');
        }
    } catch (err) {
        console.warn('[FAQ] Failed to load from CMS, using static HTML:', err.message);
    }
}

/**
 * Render FAQ list from CMS data
 */
function renderFAQList() {
    const container = document.getElementById('faqList');
    if (!container) return;

    // Group FAQs by category
    const grouped = {};
    state.faqs.forEach(faq => {
        if (!grouped[faq.category]) {
            grouped[faq.category] = [];
        }
        grouped[faq.category].push(faq);
    });

    // Render HTML
    let html = '';

    // Sort categories
    const categoryOrder = ['getting-started', 'studios', 'billing', 'technical', 'account', 'features', 'support'];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    sortedCategories.forEach(category => {
        const faqs = grouped[category].sort((a, b) => a.sort_order - b.sort_order);
        faqs.forEach(faq => {
            html += `
                <div class="faq-item" data-category="${escapeHtml(faq.category)}" data-id="${faq.id}">
                    <button class="faq-question">
                        <span class="faq-question-text">${escapeHtml(faq.question)}</span>
                        <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </button>
                    <div class="faq-answer">
                        <div class="faq-answer-content">
                            ${faq.answer}
                        </div>
                    </div>
                </div>
            `;
        });
    });

    container.innerHTML = html;

    // Re-setup accordion after rendering
    setupAccordion();
}

/**
 * Update category tabs based on available FAQ categories
 */
function updateCategoryTabs() {
    const container = document.getElementById('faqCategories');
    if (!container) return;

    // Get unique categories from FAQ data
    const categories = new Set(state.faqs.map(f => f.category));

    let html = '<button class="category-btn active" data-category="all">All</button>';

    // Add category buttons in order
    const categoryOrder = ['getting-started', 'studios', 'billing', 'technical', 'account', 'features', 'support'];
    categoryOrder.forEach(cat => {
        if (categories.has(cat)) {
            html += `<button class="category-btn" data-category="${cat}">${FAQ_CATEGORIES[cat] || cat}</button>`;
        }
    });

    // Add any categories not in the order
    categories.forEach(cat => {
        if (!categoryOrder.includes(cat)) {
            html += `<button class="category-btn" data-category="${cat}">${FAQ_CATEGORIES[cat] || cat}</button>`;
        }
    });

    container.innerHTML = html;

    // Re-setup category filter handlers
    setupCategoryFilter();
}

/**
 * Setup accordion interactions
 */
function setupAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question?.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all items
            faqItems.forEach(i => i.classList.remove('open'));

            // Toggle current item
            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
}

/**
 * Setup category filter
 */
function setupCategoryFilter() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const faqItems = document.querySelectorAll('.faq-item');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            state.activeCategory = category;

            // Update active button
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items
            faqItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('faqSearch');
    const categoryBtns = document.querySelectorAll('.category-btn');

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        state.searchQuery = query;
        const faqItems = document.querySelectorAll('.faq-item');

        // Reset category filter
        categoryBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('[data-category="all"]')?.classList.add('active');
        state.activeCategory = 'all';

        faqItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (query === '' || text.includes(query)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

/**
 * Setup all interactions
 */
function setupInteractions() {
    // Only setup interactions if we didn't load from CMS
    // (CMS rendering already sets up its own handlers)
    if (!state.loaded) {
        setupAccordion();
        setupCategoryFilter();
    }
    setupSearch();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}
