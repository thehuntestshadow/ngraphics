// ============================================
// DASHBOARD - HEFAISTOS
// Simplified hub for studio navigation
// Analytics moved to Settings page
// ============================================

const elements = {};

// ============================================
// INITIALIZATION
// ============================================

function initElements() {
    elements.themeToggle = document.getElementById('themeToggle');
    elements.accountContainer = document.getElementById('accountContainer');
}

async function init() {
    // Header is pre-rendered in HTML to prevent flash
    initElements();

    // Setup theme
    SharedTheme.init();
    SharedTheme.setupToggle(elements.themeToggle);

    // Initialize account menu (Supabase auth)
    if (elements.accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(elements.accountContainer);
    }

    // Initialize onboarding tour for first-time visitors
    if (typeof OnboardingTour !== 'undefined') {
        OnboardingTour.init('studio');
    }
}

// ============================================
// START
// ============================================

document.addEventListener('DOMContentLoaded', init);
