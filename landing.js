/**
 * HEFAISTOS - Landing Page
 * Handles theme, scroll animations, and interactivity
 * Loads content from CMS (Supabase) with fallback to static HTML
 */

// ============================================
// STATE
// ============================================

const state = {
    homepageContent: null,
    loaded: false
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));

    // Initialize account menu
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Try loading content from CMS
    await loadHomepageFromCMS();

    // Setup scroll animations
    setupScrollAnimations();

    // Setup smooth scroll for anchor links
    setupSmoothScroll();

    // Setup gallery preview lightbox
    setupGalleryPreview();

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('landing');
    }
}

// ============================================
// CMS LOADING
// ============================================

/**
 * Load homepage content from Supabase CMS
 * Falls back to existing static HTML if unavailable
 */
async function loadHomepageFromCMS() {
    try {
        if (typeof ngSupabase === 'undefined') {
            console.log('[Landing] Supabase not available, using static HTML');
            return;
        }

        await ngSupabase.init();

        const cmsData = await ngSupabase.getCMSHomepage();

        if (cmsData && Object.keys(cmsData).length > 0) {
            state.homepageContent = cmsData;
            state.loaded = true;

            // Apply CMS content to page sections
            if (cmsData.hero) renderHeroSection(cmsData.hero);
            if (cmsData.pricing) renderPricingSection(cmsData.pricing);
            if (cmsData.cta) renderCTASection(cmsData.cta);

            console.log('[Landing] Loaded content from CMS');
        } else {
            console.log('[Landing] No CMS data, using static HTML');
        }
    } catch (err) {
        console.warn('[Landing] Failed to load from CMS, using static HTML:', err.message);
    }
}

/**
 * Render hero section from CMS data
 */
function renderHeroSection(hero) {
    // Update badge
    const badge = document.querySelector('.hero-badge span');
    if (badge && hero.badge) {
        badge.textContent = hero.badge;
    }

    // Update title
    const title = document.querySelector('.hero-title');
    if (title && hero.title) {
        title.textContent = hero.title;
    }

    // Update subtitle
    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle && hero.subtitle) {
        subtitle.textContent = hero.subtitle;
    }

    // Update CTAs
    const cta1 = document.querySelector('.hero-cta span');
    if (cta1 && hero.cta1_text) {
        cta1.textContent = hero.cta1_text;
    }
    const cta1Link = document.querySelector('.hero-cta');
    if (cta1Link && hero.cta1_link) {
        cta1Link.setAttribute('href', hero.cta1_link);
    }

    const cta2 = document.querySelector('.hero-cta-secondary span');
    if (cta2 && hero.cta2_text) {
        cta2.textContent = hero.cta2_text;
    }
    const cta2Link = document.querySelector('.hero-actions .hero-cta-secondary');
    if (cta2Link && hero.cta2_link) {
        cta2Link.setAttribute('href', hero.cta2_link);
    }

    // Update showcase images
    if (hero.images && Array.isArray(hero.images)) {
        const showcaseImages = document.querySelectorAll('.showcase-image');
        hero.images.forEach((imgUrl, index) => {
            if (showcaseImages[index] && imgUrl) {
                showcaseImages[index].src = imgUrl;
            }
        });
    }
}

/**
 * Render pricing preview section from CMS data
 */
function renderPricingSection(pricing) {
    // Update section title
    const sectionTitle = document.querySelector('.pricing-preview .section-title');
    if (sectionTitle && pricing.title) {
        sectionTitle.textContent = pricing.title;
    }

    // Update section subtitle
    const sectionSubtitle = document.querySelector('.pricing-preview .section-subtitle');
    if (sectionSubtitle && pricing.subtitle) {
        sectionSubtitle.textContent = pricing.subtitle;
    }

    // Update pricing cards if plans provided
    if (pricing.plans && Array.isArray(pricing.plans)) {
        const cards = document.querySelectorAll('.price-card');
        pricing.plans.forEach((plan, index) => {
            const card = cards[index];
            if (!card) return;

            const name = card.querySelector('.price-card-name');
            if (name && plan.name) name.textContent = plan.name;

            const price = card.querySelector('.price-card-price');
            if (price && plan.price !== undefined) price.textContent = plan.price;

            const period = card.querySelector('.price-card-period');
            if (period && plan.period) period.textContent = plan.period;

            // Update features
            if (plan.features && Array.isArray(plan.features)) {
                const featureEls = card.querySelectorAll('.price-card-feature');
                plan.features.forEach((feature, fIndex) => {
                    if (featureEls[fIndex]) {
                        featureEls[fIndex].textContent = feature;
                    }
                });
            }

            // Update badge if present
            const badge = card.querySelector('.price-card-badge');
            if (plan.badge) {
                if (badge) {
                    badge.textContent = plan.badge;
                } else if (!card.classList.contains('featured')) {
                    // Add badge if specified but doesn't exist
                    card.classList.add('featured');
                    const newBadge = document.createElement('span');
                    newBadge.className = 'price-card-badge';
                    newBadge.textContent = plan.badge;
                    card.insertBefore(newBadge, card.firstChild);
                }
            } else if (badge) {
                badge.remove();
                card.classList.remove('featured');
            }
        });
    }
}

/**
 * Render final CTA section from CMS data
 */
function renderCTASection(cta) {
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle && cta.title) {
        ctaTitle.textContent = cta.title;
    }

    const ctaSubtitle = document.querySelector('.cta-subtitle');
    if (ctaSubtitle && cta.subtitle) {
        ctaSubtitle.textContent = cta.subtitle;
    }

    const ctaButton = document.querySelector('.final-cta .hero-cta span');
    if (ctaButton && cta.button_text) {
        ctaButton.textContent = cta.button_text;
    }

    const ctaLink = document.querySelector('.final-cta .hero-cta');
    if (ctaLink && cta.button_link) {
        const safeUrl = sanitizeUrl(cta.button_link);
        if (safeUrl) {
            ctaLink.setAttribute('href', safeUrl);
        }
    }
}

/**
 * Sanitize URL to prevent XSS via javascript: and other dangerous protocols
 */
function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim().toLowerCase();
    // Block dangerous protocols
    if (trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')) {
        console.warn('[Landing] Blocked dangerous URL:', url.slice(0, 50));
        return null;
    }
    // Allow relative URLs, http, https, mailto, tel
    if (trimmed.startsWith('/') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:')) {
        return url;
    }
    // For other URLs, only allow if they look like relative paths
    if (!trimmed.includes(':')) {
        return url;
    }
    console.warn('[Landing] Blocked unknown protocol URL:', url.slice(0, 50));
    return null;
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

// ============================================
// SCROLL ANIMATIONS
// ============================================

function setupScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optionally stop observing after reveal
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback: show all elements
        revealElements.forEach(el => el.classList.add('visible'));
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// GALLERY PREVIEW
// ============================================

function setupGalleryPreview() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Navigate to gallery page
            window.location.href = 'gallery.html';
        });
    });
}

// ============================================
// HEADER SCROLL EFFECT
// ============================================

let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const currentScrollY = window.scrollY;

    // Add background when scrolled
    if (currentScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// ============================================
// STUDIO CARD HOVER EFFECTS
// ============================================

document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.studio-card, .feature-card');

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only apply effect if mouse is near the card
        if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});
