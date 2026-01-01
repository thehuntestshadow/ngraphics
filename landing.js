/**
 * HEFAISTOS - Landing Page
 * Handles theme, scroll animations, and interactivity
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

function init() {
    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));

    // Initialize account menu
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Setup scroll animations
    setupScrollAnimations();

    // Setup smooth scroll for anchor links
    setupSmoothScroll();

    // Setup gallery preview lightbox
    setupGalleryPreview();
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
