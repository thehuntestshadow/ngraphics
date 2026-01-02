/**
 * HEFAISTOS Settings Page
 * Dedicated settings page replacing the modal-based settings
 */

// ============================================
// 1. CONSTANTS & CONFIG
// ============================================

const SECTIONS = ['profile', 'billing', 'api-keys', 'appearance', 'language', 'data', 'danger'];

const STUDIOS = [
    'ngraphics', 'model_studio', 'bundle_studio', 'lifestyle_studio',
    'copywriter', 'packaging', 'comparison_generator', 'size_visualizer',
    'faq_generator', 'background_studio', 'badge_generator', 'feature_cards',
    'size_chart', 'aplus_generator', 'product_variants', 'social_studio',
    'export_center', 'ad_creative', 'model_video'
];

// LANGUAGES is provided by i18n.js (loaded before this file)

// ============================================
// 2. STATE & ELEMENTS
// ============================================

const state = {
    activeSection: 'profile',
    user: null,
    profile: null,
    usage: null,
    isLoading: false
};

let elements = {};

function initElements() {
    elements = {
        // Header
        themeToggle: document.getElementById('themeToggle'),
        accountContainer: document.getElementById('accountContainer'),

        // Navigation
        navItems: document.querySelectorAll('.settings-nav-item'),
        sections: document.querySelectorAll('.settings-section'),

        // Profile
        displayNameInput: document.getElementById('displayName'),
        emailInput: document.getElementById('email'),
        saveProfileBtn: document.getElementById('saveProfileBtn'),

        // Usage
        usageContainer: document.getElementById('usageContainer'),

        // API Keys
        lumaApiKey: document.getElementById('lumaApiKey'),
        toggleLumaKey: document.getElementById('toggleLumaKey'),
        testLumaKey: document.getElementById('testLumaKey'),
        saveApiKeysBtn: document.getElementById('saveApiKeysBtn'),

        // Appearance
        themeBtns: document.querySelectorAll('.theme-btn'),

        // Language
        interfaceLanguage: document.getElementById('interfaceLanguage'),
        generationLanguage: document.getElementById('generationLanguage'),

        // Data & Storage
        cloudSyncToggle: document.getElementById('cloudSyncToggle'),
        syncStatus: document.getElementById('syncStatus'),
        syncNowBtn: document.getElementById('syncNowBtn'),

        // Danger Zone
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
        deleteAccountBtn: document.getElementById('deleteAccountBtn'),

        // Not logged in
        notLoggedIn: document.getElementById('settingsNotLoggedIn'),
        settingsLayout: document.querySelector('.settings-layout')
    };
}

// ============================================
// 3. INITIALIZATION
// ============================================

let initialized = false;

async function init() {
    if (initialized) return;
    initialized = true;

    initElements();

    // Theme
    SharedTheme.init();
    SharedTheme.setupToggle(elements.themeToggle);
    updateThemeButtons();

    // Account menu
    if (elements.accountContainer) {
        new AccountMenu(elements.accountContainer);
    }

    // Check auth
    await checkAuth();

    // Setup navigation
    setupNavigation();

    // Setup event listeners
    setupEventListeners();

    // Load initial section from hash or default
    const hashSection = getHashSection();
    if (hashSection && SECTIONS.includes(hashSection)) {
        showSection(hashSection);
    } else {
        showSection('profile');
    }
}

async function checkAuth() {
    // Ensure Supabase is initialized
    if (typeof ngSupabase !== 'undefined' && ngSupabase.init) {
        await ngSupabase.init();
    }

    state.user = ngSupabase.user;

    if (!state.user) {
        // Show not logged in state
        if (elements.notLoggedIn) {
            elements.notLoggedIn.style.display = 'flex';
        }
        if (elements.settingsLayout) {
            elements.settingsLayout.style.display = 'none';
        }
        return;
    }

    // Show settings
    if (elements.notLoggedIn) {
        elements.notLoggedIn.style.display = 'none';
    }
    if (elements.settingsLayout) {
        elements.settingsLayout.style.display = 'flex';
    }

    // Load user data
    await loadUserData();
}

async function loadUserData() {
    try {
        // Load profile
        state.profile = await ngSupabase.getProfile();

        if (state.profile && elements.displayNameInput) {
            elements.displayNameInput.value = state.profile.display_name || '';
        }

        if (state.user && elements.emailInput) {
            elements.emailInput.value = state.user.email || '';
        }

        // Load API keys
        loadApiKeys();

        // Load language settings
        loadLanguageSettings();

        // Load sync settings
        loadSyncSettings();

    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// ============================================
// 4. NAVIGATION
// ============================================

function setupNavigation() {
    // Click handlers for nav items
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) {
                showSection(section);
                history.pushState(null, '', `#${section}`);
            }
        });
    });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
        const section = getHashSection();
        if (section && SECTIONS.includes(section)) {
            showSection(section);
        }
    });
}

function getHashSection() {
    const hash = window.location.hash.slice(1);
    return hash || null;
}

function showSection(sectionId) {
    state.activeSection = sectionId;

    // Update nav
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections - use class-based display
    elements.sections.forEach(section => {
        // Skip not logged in section (handled separately)
        if (section.id === 'notLoggedIn') return;
        section.classList.toggle('active', section.id === sectionId);
    });

    // Load section-specific data
    if (sectionId === 'billing') {
        loadUsageData();
    }
}

// ============================================
// 5. PROFILE
// ============================================

async function saveProfile() {
    const displayName = elements.displayNameInput?.value?.trim();

    if (!displayName) {
        showToast('Please enter a display name', 'error');
        return;
    }

    try {
        setButtonLoading(elements.saveProfileBtn, true);

        await ngSupabase.updateProfile({ display_name: displayName });

        showToast('Profile saved successfully', 'success');

    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Failed to save profile', 'error');
    } finally {
        setButtonLoading(elements.saveProfileBtn, false, 'Save Profile');
    }
}

// ============================================
// 6. USAGE & BILLING
// ============================================

async function loadUsageData() {
    if (!elements.usageContainer) return;

    elements.usageContainer.innerHTML = '<div class="usage-loading">Loading usage data...</div>';

    try {
        const usage = await ngSupabase.getUsage();
        state.usage = usage;

        renderUsageCard(usage);

    } catch (error) {
        console.error('Error loading usage:', error);
        elements.usageContainer.innerHTML = '<div class="usage-loading">Failed to load usage data</div>';
    }
}

function renderUsageCard(usage) {
    if (!usage || !elements.usageContainer) return;

    const plan = usage.plan || 'free';
    const isPro = plan !== 'free';
    const used = usage.generations_used || usage.generationsUsed || 0;
    const limit = usage.generations_limit || usage.generationsLimit || 50;
    const percentage = Math.min((used / limit) * 100, 100);
    const credits = usage.credits || usage.creditsBalance || 0;

    // Calculate reset date
    let resetText = '';
    const periodEnd = usage.period_end || usage.periodEnd;
    if (periodEnd) {
        const resetDate = new Date(periodEnd);
        const now = new Date();
        const daysUntilReset = Math.ceil((resetDate - now) / (1000 * 60 * 60 * 24));
        if (daysUntilReset > 0) {
            resetText = `Resets in ${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'}`;
        } else {
            resetText = 'Resets today';
        }
    }

    let barClass = '';
    if (percentage >= 90) barClass = 'danger';
    else if (percentage >= 70) barClass = 'warning';

    elements.usageContainer.innerHTML = `
        <div class="settings-usage-card">
            <div class="settings-usage-plan">
                <span class="settings-usage-plan-badge ${isPro ? 'pro' : ''}">${plan.toUpperCase()}</span>
                ${resetText ? `<span class="settings-usage-reset">${resetText}</span>` : ''}
            </div>

            <div class="settings-usage-stats">
                <div class="settings-usage-stat">
                    <div class="settings-usage-stat-header">
                        <span class="settings-usage-stat-label">Monthly Generations</span>
                        <span class="settings-usage-stat-value">${used} / ${limit}</span>
                    </div>
                    <div class="settings-usage-bar">
                        <div class="settings-usage-bar-fill ${barClass}" style="width: ${percentage}%"></div>
                    </div>
                </div>

                ${credits > 0 ? `
                <div class="settings-usage-stat">
                    <div class="settings-usage-stat-header">
                        <span class="settings-usage-stat-label">Credits Balance</span>
                        <span class="settings-usage-stat-value">${credits}</span>
                    </div>
                </div>
                ` : ''}
            </div>

            ${!isPro ? `
            <div class="settings-usage-upgrade">
                <a href="pricing.html" class="btn-primary" style="width: 100%; text-align: center; text-decoration: none; display: block;">
                    Upgrade to Pro
                </a>
            </div>
            ` : `
            <div class="settings-usage-upgrade">
                <button class="btn-secondary" onclick="openBillingPortal()" style="width: 100%;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Manage Subscription
                </button>
            </div>
            `}
        </div>
    `;
}

async function openBillingPortal() {
    try {
        const response = await fetch(`${window.SUPABASE_URL}/functions/v1/create-portal-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ngSupabase.session?.access_token}`
            },
            body: JSON.stringify({
                return_url: window.location.href
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No portal URL returned');
        }

    } catch (error) {
        console.error('Error opening billing portal:', error);
        showToast('Failed to open billing portal', 'error');
    }
}

// ============================================
// 7. API KEYS
// ============================================

function loadApiKeys() {
    const lumaKey = localStorage.getItem('luma_api_key') || '';
    if (elements.lumaApiKey) {
        elements.lumaApiKey.value = lumaKey;
    }
}

function toggleKeyVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
}

async function testLumaApiKey() {
    const key = elements.lumaApiKey?.value?.trim();

    if (!key) {
        showToast('Please enter an API key first', 'error');
        return;
    }

    try {
        setButtonLoading(elements.testLumaKey, true);

        const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });

        if (response.ok || response.status === 200) {
            showToast('API key is valid!', 'success');
        } else if (response.status === 401) {
            showToast('Invalid API key', 'error');
        } else {
            showToast('Could not verify key', 'error');
        }

    } catch (error) {
        console.error('Error testing API key:', error);
        showToast('Failed to test API key', 'error');
    } finally {
        setButtonLoading(elements.testLumaKey, false);
    }
}

function saveApiKeys() {
    const lumaKey = elements.lumaApiKey?.value?.trim();

    if (lumaKey) {
        localStorage.setItem('luma_api_key', lumaKey);
    } else {
        localStorage.removeItem('luma_api_key');
    }

    showToast('API keys saved', 'success');
}

// ============================================
// 8. APPEARANCE
// ============================================

function updateThemeButtons() {
    const currentTheme = localStorage.getItem('theme') || 'dark';

    elements.themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
}

function setTheme(theme) {
    if (theme === 'system') {
        // Use system preference
        localStorage.setItem('theme', 'system');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('theme') === 'system') {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    } else {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
    updateThemeButtons();
}

// ============================================
// 9. LANGUAGE
// ============================================

function loadLanguageSettings() {
    const uiLang = localStorage.getItem('ngraphics_ui_language') || 'en';
    const genLang = localStorage.getItem('ngraphics_gen_language') || 'en';

    // Populate dropdowns
    if (elements.interfaceLanguage) {
        elements.interfaceLanguage.innerHTML = LANGUAGES.map(lang =>
            `<option value="${lang.code}">${lang.native} (${lang.name})</option>`
        ).join('');
        elements.interfaceLanguage.value = uiLang;
    }

    if (elements.generationLanguage) {
        elements.generationLanguage.innerHTML = LANGUAGES.map(lang =>
            `<option value="${lang.code}">${lang.native} (${lang.name})</option>`
        ).join('');
        elements.generationLanguage.value = genLang;
    }
}

function setInterfaceLanguage(lang) {
    localStorage.setItem('ngraphics_ui_language', lang);

    if (typeof i18n !== 'undefined' && i18n.setUILanguage) {
        i18n.setUILanguage(lang);
    }

    showToast('Interface language updated. Refresh to see changes.', 'success');
}

function setGenerationLanguage(lang) {
    localStorage.setItem('ngraphics_gen_language', lang);
    // Legacy key for backwards compatibility
    localStorage.setItem('copywriter_language', lang);

    if (typeof i18n !== 'undefined' && i18n.setGenerationLanguage) {
        i18n.setGenerationLanguage(lang);
    }

    showToast('Generation language updated', 'success');
}

// ============================================
// 10. DATA & STORAGE
// ============================================

function loadSyncSettings() {
    const syncEnabled = localStorage.getItem('cloud_sync_enabled') === 'true';

    if (elements.cloudSyncToggle) {
        elements.cloudSyncToggle.checked = syncEnabled;
    }

    updateSyncStatus();
}

function toggleCloudSync(enabled) {
    localStorage.setItem('cloud_sync_enabled', enabled.toString());

    if (enabled && typeof cloudSync !== 'undefined') {
        cloudSync.enable();
    } else if (typeof cloudSync !== 'undefined') {
        cloudSync.disable();
    }

    updateSyncStatus();
}

function updateSyncStatus() {
    if (!elements.syncStatus) return;

    const lastSync = localStorage.getItem('last_sync_time');
    const syncEnabled = localStorage.getItem('cloud_sync_enabled') === 'true';

    if (!syncEnabled) {
        elements.syncStatus.textContent = 'Sync disabled';
    } else if (lastSync) {
        const date = new Date(parseInt(lastSync));
        elements.syncStatus.textContent = `Last synced: ${date.toLocaleString()}`;
    } else {
        elements.syncStatus.textContent = 'Never synced';
    }
}

async function syncNow() {
    if (typeof cloudSync === 'undefined') {
        showToast('Cloud sync not available', 'error');
        return;
    }

    try {
        setButtonLoading(elements.syncNowBtn, true);

        await cloudSync.sync();

        localStorage.setItem('last_sync_time', Date.now().toString());
        updateSyncStatus();

        showToast('Sync completed', 'success');

    } catch (error) {
        console.error('Sync error:', error);
        showToast('Sync failed', 'error');
    } finally {
        setButtonLoading(elements.syncNowBtn, false);
    }
}

// ============================================
// 11. DANGER ZONE
// ============================================

async function clearAllHistory() {
    const confirmed = await showConfirm(
        'Clear All History',
        'This will permanently delete all generation history from all studios. This action cannot be undone.',
        'Clear History',
        true
    );

    if (!confirmed) return;

    try {
        // Clear localStorage history for all studios
        STUDIOS.forEach(studio => {
            localStorage.removeItem(`${studio}_history`);
        });

        // Clear IndexedDB
        if (typeof ImageStore !== 'undefined') {
            await ImageStore.clear();
        }

        showToast('All history cleared', 'success');

    } catch (error) {
        console.error('Error clearing history:', error);
        showToast('Failed to clear history', 'error');
    }
}

async function clearAllFavorites() {
    const confirmed = await showConfirm(
        'Clear All Favorites',
        'This will permanently delete all saved favorites from all studios. This action cannot be undone.',
        'Clear Favorites',
        true
    );

    if (!confirmed) return;

    try {
        // Clear localStorage favorites for all studios
        STUDIOS.forEach(studio => {
            localStorage.removeItem(`${studio}_favorites`);
        });

        showToast('All favorites cleared', 'success');

    } catch (error) {
        console.error('Error clearing favorites:', error);
        showToast('Failed to clear favorites', 'error');
    }
}

async function deleteAccount() {
    const confirmed = await showConfirm(
        'Delete Account',
        'This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?',
        'Delete My Account',
        true
    );

    if (!confirmed) return;

    // Second confirmation
    const doubleConfirmed = await showConfirm(
        'Final Confirmation',
        'Please confirm once more that you want to permanently delete your account.',
        'Yes, Delete Everything',
        true
    );

    if (!doubleConfirmed) return;

    try {
        // Call Supabase function to delete account
        const response = await fetch(`${window.SUPABASE_URL}/functions/v1/delete-account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ngSupabase.session?.access_token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete account');
        }

        // Clear local data
        STUDIOS.forEach(studio => {
            localStorage.removeItem(`${studio}_history`);
            localStorage.removeItem(`${studio}_favorites`);
        });

        // Sign out
        await ngSupabase.signOut();

        // Redirect to home
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error deleting account:', error);
        showToast('Failed to delete account. Please contact support.', 'error');
    }
}

// ============================================
// 12. UI HELPERS
// ============================================

function showToast(message, type = 'info') {
    if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
        SharedUI.toast(message, type);
    } else {
        // Fallback toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--apple-green)' : 'var(--bg-tertiary)'};
            color: white;
            border-radius: var(--radius-md);
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

function showConfirm(title, message, confirmText = 'Confirm', isDanger = false) {
    return new Promise((resolve) => {
        if (typeof SharedUI !== 'undefined' && SharedUI.confirm) {
            SharedUI.confirm(title, message, confirmText, isDanger).then(resolve);
        } else {
            // Fallback confirm
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        }
    });
}

function setButtonLoading(button, isLoading, originalText = null) {
    if (!button) return;

    if (isLoading) {
        button._originalText = button.textContent;
        button._originalHTML = button.innerHTML;
        button.classList.add('btn-loading');
        button.disabled = true;
        // Keep text but it will be hidden by CSS opacity
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        if (originalText) {
            button.textContent = originalText;
        } else if (button._originalHTML) {
            button.innerHTML = button._originalHTML;
        }
    }
}

// ============================================
// 13. EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Profile
    elements.saveProfileBtn?.addEventListener('click', saveProfile);

    // API Keys
    elements.toggleLumaKey?.addEventListener('click', () => {
        toggleKeyVisibility('lumaApiKey', 'toggleLumaKey');
    });
    elements.testLumaKey?.addEventListener('click', testLumaApiKey);
    elements.saveApiKeysBtn?.addEventListener('click', saveApiKeys);

    // Appearance
    elements.themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
        });
    });

    // Language
    elements.interfaceLanguage?.addEventListener('change', (e) => {
        setInterfaceLanguage(e.target.value);
    });
    elements.generationLanguage?.addEventListener('change', (e) => {
        setGenerationLanguage(e.target.value);
    });

    // Data & Storage
    elements.cloudSyncToggle?.addEventListener('change', (e) => {
        toggleCloudSync(e.target.checked);
    });
    elements.syncNowBtn?.addEventListener('click', syncNow);

    // Danger Zone
    elements.clearHistoryBtn?.addEventListener('click', clearAllHistory);
    elements.clearFavoritesBtn?.addEventListener('click', clearAllFavorites);
    elements.deleteAccountBtn?.addEventListener('click', deleteAccount);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Go back to dashboard
            window.location.href = 'dashboard.html';
        }
    });
}

// ============================================
// 14. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);
if (document.readyState !== 'loading') {
    init();
}

// Expose functions for inline handlers
window.openBillingPortal = openBillingPortal;
