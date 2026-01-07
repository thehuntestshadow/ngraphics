/**
 * HEFAISTOS Settings Page
 * Dedicated settings page replacing the modal-based settings
 */

// ============================================
// 1. CONSTANTS & CONFIG
// ============================================

const SECTIONS = ['profile', 'billing', 'api-keys', 'appearance', 'language', 'analytics', 'data', 'danger'];

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
    isLoading: false,
    // Analytics state
    activeTab: 'overview',
    analyticsData: null,
    metrics: null,
    charts: {
        trends: null,
        models: null,
        studios: null,
        costTrend: null
    }
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

        // Danger Zone
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        clearFavoritesBtn: document.getElementById('clearFavoritesBtn'),
        deleteAccountBtn: document.getElementById('deleteAccountBtn'),

        // Not logged in
        notLoggedIn: document.getElementById('settingsNotLoggedIn'),
        settingsLayout: document.querySelector('.settings-layout'),

        // Analytics elements
        totalGenerations: document.getElementById('totalGenerations'),
        totalFavorites: document.getElementById('totalFavorites'),
        storageUsed: document.getElementById('storageUsed'),
        apiStatus: document.getElementById('apiStatus'),
        apiStatusText: document.getElementById('apiStatusText'),
        dashboardTabs: document.getElementById('dashboardTabs'),
        trendsChart: document.getElementById('trendsChart'),
        modelChart: document.getElementById('modelChart'),
        studioChart: document.getElementById('studioChart'),
        quickAccessGrid: document.getElementById('quickAccessGrid'),
        storageInfographics: document.getElementById('storageInfographics'),
        storageModels: document.getElementById('storageModels'),
        storageBundles: document.getElementById('storageBundles'),
        storageFillInfographics: document.getElementById('storageFillInfographics'),
        storageFillModels: document.getElementById('storageFillModels'),
        storageFillBundles: document.getElementById('storageFillBundles'),
        exportAllBtn: document.getElementById('exportAllBtn'),
        clearOldBtn: document.getElementById('clearOldBtn'),
        activityBody: document.getElementById('activityBody'),
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        trashSection: document.getElementById('trashSection'),
        trashCount: document.getElementById('trashCount'),
        trashContent: document.getElementById('trashContent'),
        emptyTrashBtn: document.getElementById('emptyTrashBtn'),
        todayCost: document.getElementById('todayCost'),
        todayGenerations: document.getElementById('todayGenerations'),
        alltimeCost: document.getElementById('alltimeCost'),
        alltimeGenerations: document.getElementById('alltimeGenerations'),
        costBreakdownList: document.getElementById('costBreakdownList'),
        costTrendChart: document.getElementById('costTrendChart'),
        resetCostBtn: document.getElementById('resetCostBtn')
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
    } else if (sectionId === 'analytics') {
        loadAnalyticsData();
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
                <button class="btn-secondary" data-action="billing-portal" style="width: 100%;">
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
        const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/create-portal-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ngSupabase.session?.access_token}`
            },
            body: JSON.stringify({
                return_url: window.location.href
            })
        });

        // Check response status before parsing JSON
        if (!response.ok) {
            // Try to parse JSON error first for better messages
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage += `: ${errorData.message || errorData.error || 'Unknown error'}`;
            } catch {
                const errorText = await response.text();
                errorMessage += `: ${errorText || 'Unknown error'}`;
            }
            throw new Error(errorMessage);
        }

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

// Track system theme listener to prevent memory leak
let _systemThemeListener = null;
const _systemThemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

function setTheme(theme) {
    // Remove existing system theme listener to prevent memory leak
    if (_systemThemeListener && _systemThemeQuery) {
        _systemThemeQuery.removeEventListener('change', _systemThemeListener);
        _systemThemeListener = null;
    }

    if (theme === 'system') {
        // Use system preference
        localStorage.setItem('theme', 'system');
        const prefersDark = _systemThemeQuery?.matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

        // Listen for system theme changes
        _systemThemeListener = (e) => {
            if (localStorage.getItem('theme') === 'system') {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        };
        _systemThemeQuery?.addEventListener('change', _systemThemeListener);
    } else {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
    updateThemeButtons();
}

// Clean up system theme listener on page unload to prevent memory leak
window.addEventListener('beforeunload', () => {
    if (_systemThemeListener && _systemThemeQuery) {
        _systemThemeQuery.removeEventListener('change', _systemThemeListener);
        _systemThemeListener = null;
    }
});

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
// 10. DANGER ZONE
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
        const response = await fetch(`${CONFIG.SUPABASE_URL}/functions/v1/delete-account`, {
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
// 11. ANALYTICS
// ============================================

async function loadAnalyticsData() {
    state.analyticsData = SharedDashboard.loadAllData();
    state.metrics = SharedDashboard.getMetrics(state.analyticsData);

    // Render all analytics UI
    renderAnalyticsCards();
    renderStoragePanel();
    renderQuickAccess();
    renderActivityTable();
    renderTrash();
    renderCostTracker();

    // Init charts
    initCharts();
    initCostTrendChart();

    // Setup analytics event listeners
    setupAnalyticsListeners();
}

function renderAnalyticsCards() {
    if (!state.metrics) return;

    const filteredData = getFilteredAnalyticsData();
    const filteredMetrics = SharedDashboard.getMetrics(filteredData);

    if (elements.totalGenerations) {
        elements.totalGenerations.textContent = filteredMetrics.totalGenerations;
    }
    if (elements.totalFavorites) {
        elements.totalFavorites.textContent = filteredMetrics.totalFavorites;
    }

    // API status
    if (elements.apiStatus && elements.apiStatusText) {
        if (state.metrics.apiConnected) {
            elements.apiStatus.className = 'card-status connected';
            elements.apiStatusText.textContent = 'Connected';
        } else {
            elements.apiStatus.className = 'card-status disconnected';
            elements.apiStatusText.textContent = 'Not Connected';
        }
    }

    // Storage (async)
    if (elements.storageUsed) {
        SharedDashboard.getStorageEstimate().then(storage => {
            elements.storageUsed.textContent = storage.formatted;
        });
    }
}

function renderStoragePanel() {
    if (!state.metrics) return;

    const { perStudio } = state.metrics;
    const maxItems = 20;

    // Infographics
    const infographicsCount = perStudio.infographics?.history || 0;
    if (elements.storageInfographics) {
        elements.storageInfographics.textContent = `${infographicsCount} items`;
    }
    if (elements.storageFillInfographics) {
        elements.storageFillInfographics.style.width = `${(infographicsCount / maxItems) * 100}%`;
    }

    // Models
    const modelsCount = perStudio.modelStudio?.history || 0;
    if (elements.storageModels) {
        elements.storageModels.textContent = `${modelsCount} items`;
    }
    if (elements.storageFillModels) {
        elements.storageFillModels.style.width = `${(modelsCount / maxItems) * 100}%`;
    }

    // Bundles
    const bundlesCount = perStudio.bundleStudio?.history || 0;
    if (elements.storageBundles) {
        elements.storageBundles.textContent = `${bundlesCount} items`;
    }
    if (elements.storageFillBundles) {
        elements.storageFillBundles.style.width = `${(bundlesCount / maxItems) * 100}%`;
    }
}

function renderQuickAccess() {
    if (!elements.quickAccessGrid) return;

    const filteredData = getFilteredAnalyticsData();
    const recent = SharedDashboard.getRecentActivity(filteredData, 8);

    if (recent.length === 0) {
        const emptyMsg = state.activeTab === 'overview'
            ? 'No recent generations'
            : `No recent ${state.activeTab} generations`;
        elements.quickAccessGrid.innerHTML = `<div class="quick-access-empty">${emptyMsg}</div>`;
        return;
    }

    elements.quickAccessGrid.innerHTML = recent.map(item => {
        const thumbnail = item.thumbnail || item.imageUrl || '';
        const studioShort = {
            infographics: 'Info',
            modelStudio: 'Model',
            bundleStudio: 'Bundle'
        }[item.studio] || '';

        const showBadge = state.activeTab === 'overview';

        return `
            <div class="quick-access-item" data-url="${thumbnail}" title="${item.title || 'Untitled'}">
                ${thumbnail ? `<img src="${thumbnail}" alt="${item.title || 'Preview'}">` : ''}
                ${showBadge ? `<span class="quick-access-badge">${studioShort}</span>` : ''}
            </div>
        `;
    }).join('');

    // Add click handlers
    elements.quickAccessGrid.querySelectorAll('.quick-access-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (url) openLightbox(url);
        });
    });
}

function renderCostTracker() {
    if (!elements.todayCost) return;

    // Today's cost (session)
    const session = SharedCostEstimator.getSessionSummary();
    elements.todayCost.textContent = session.formatted;
    if (elements.todayGenerations) {
        elements.todayGenerations.textContent = `${session.generations} gen`;
    }

    // All-time cost
    const allTime = SharedCostEstimator.getAllTimeCost();
    if (elements.alltimeCost) {
        elements.alltimeCost.textContent = allTime.formatted;
    }
    if (elements.alltimeGenerations) {
        elements.alltimeGenerations.textContent = `${allTime.totalGenerations} gen`;
    }

    // Studio breakdown
    const breakdown = SharedCostEstimator.getStudioBreakdown();
    if (elements.costBreakdownList) {
        if (breakdown.length === 0) {
            elements.costBreakdownList.innerHTML = '<div class="cost-breakdown-empty">No cost data yet</div>';
        } else {
            const studioLabels = {
                infographics: 'Infographics',
                modelStudio: 'Model Studio',
                bundleStudio: 'Bundle Studio'
            };

            elements.costBreakdownList.innerHTML = breakdown.map(item => `
                <div class="cost-breakdown-item">
                    <div class="cost-breakdown-studio">
                        <span class="cost-breakdown-dot ${item.studio}"></span>
                        <span>${studioLabels[item.studio] || item.studio}</span>
                    </div>
                    <span class="cost-breakdown-value">${item.formatted}</span>
                </div>
            `).join('');
        }
    }
}

function initCostTrendChart() {
    if (!elements.costTrendChart) return;

    const trends = SharedCostEstimator.getCostTrends(7);
    const ctx = elements.costTrendChart.getContext('2d');

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    state.charts.costTrend = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: trends.map(t => t.date),
            datasets: [{
                label: 'Cost',
                data: trends.map(t => t.cost),
                backgroundColor: '#f59e0b',
                borderRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => SharedCostEstimator.formatCost(ctx.raw)
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                        callback: (value) => SharedCostEstimator.formatCost(value)
                    }
                }
            }
        }
    });
}

async function resetCostData() {
    const confirmed = await SharedUI.confirm(
        'This will reset all cost tracking data including history. This cannot be undone.',
        {
            title: 'Reset Cost Data',
            confirmText: 'Reset',
            icon: 'warning'
        }
    );

    if (!confirmed) return;

    SharedCostEstimator.resetSession();
    SharedCostEstimator.saveSession();
    localStorage.removeItem(SharedCostEstimator.HISTORY_KEY);

    renderCostTracker();

    if (state.charts.costTrend) {
        const trends = SharedCostEstimator.getCostTrends(7);
        state.charts.costTrend.data.labels = trends.map(t => t.date);
        state.charts.costTrend.data.datasets[0].data = trends.map(t => t.cost);
        state.charts.costTrend.update();
    }

    SharedUI.toast('Cost data reset', 'success');
}

function renderTrash() {
    if (!elements.trashContent) return;

    const trashItems = SharedTrash.getAll();
    const count = trashItems.length;

    if (elements.trashCount) {
        elements.trashCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }

    if (elements.emptyTrashBtn) {
        elements.emptyTrashBtn.disabled = count === 0;
    }

    if (count === 0) {
        elements.trashContent.innerHTML = `
            <div class="trash-empty">
                <svg class="trash-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
                <p>Trash is empty</p>
            </div>
        `;
        return;
    }

    const studioLabels = {
        infographics: 'Infographics',
        modelStudio: 'Model Studio',
        bundleStudio: 'Bundle Studio'
    };

    const studioClasses = {
        infographics: 'infographics',
        modelStudio: 'models',
        bundleStudio: 'bundles'
    };

    elements.trashContent.innerHTML = `
        <div class="trash-grid">
            ${trashItems.map(item => {
                const thumbnail = item.thumbnail || item.imageUrl || '';
                const title = item.title || 'Untitled';
                const studioLabel = studioLabels[item.page] || item.page;
                const studioClass = studioClasses[item.page] || '';
                const deletedAt = SharedTrash.formatDeletedAt(item.deletedAt);
                const daysRemaining = SharedTrash.getDaysRemaining(item.deletedAt);

                return `
                    <div class="trash-item" data-id="${item.id}">
                        <div class="trash-item-preview">
                            ${thumbnail ? `<img src="${thumbnail}" alt="${escapeHtml(title)}" data-action="lightbox" data-url="${thumbnail}">` : ''}
                            <span class="trash-item-studio ${studioClass}">${studioLabel}</span>
                        </div>
                        <div class="trash-item-info">
                            <h4 class="trash-item-title">${escapeHtml(title)}</h4>
                            <div class="trash-item-meta">
                                <span>Deleted ${deletedAt}</span>
                                <span class="trash-item-expiry">${daysRemaining}d left</span>
                            </div>
                        </div>
                        <div class="trash-item-actions">
                            <button class="trash-item-btn restore" data-action="restore" data-id="${item.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/>
                                </svg>
                                Restore
                            </button>
                            <button class="trash-item-btn delete" data-action="delete" data-id="${item.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    elements.trashContent.querySelectorAll('.trash-item-btn').forEach(btn => {
        btn.addEventListener('click', handleTrashAction);
    });
}

async function handleTrashAction(e) {
    const action = e.currentTarget.dataset.action;
    const id = e.currentTarget.dataset.id;

    if (action === 'restore') {
        await restoreTrashItem(id);
    } else if (action === 'delete') {
        await deleteTrashItem(id);
    }
}

async function restoreTrashItem(id) {
    const restored = SharedTrash.restore(id);
    if (!restored) {
        SharedUI.toast('Failed to restore item', 'error');
        return;
    }

    const storageKeys = {
        infographics: 'infographics_history',
        modelStudio: 'model_studio_history',
        bundleStudio: 'bundle_studio_history'
    };

    const storageKey = storageKeys[restored.page];
    if (storageKey) {
        const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
        history.unshift(restored.originalItem);
        localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 20)));
    }

    SharedUI.toast('Item restored to history', 'success');

    // Refresh analytics
    state.analyticsData = SharedDashboard.loadAllData();
    state.metrics = SharedDashboard.getMetrics(state.analyticsData);
    renderAnalyticsCards();
    renderStoragePanel();
    renderQuickAccess();
    renderActivityTable();
    renderTrash();
}

async function deleteTrashItem(id) {
    const confirmed = await SharedUI.confirm(
        'This will permanently delete this item. This cannot be undone.',
        {
            title: 'Delete Permanently',
            confirmText: 'Delete',
            icon: 'danger'
        }
    );

    if (!confirmed) return;

    SharedTrash.remove(id);
    SharedUI.toast('Item permanently deleted', 'success');
    renderTrash();
}

async function emptyTrash() {
    const count = SharedTrash.count();
    if (count === 0) return;

    const confirmed = await SharedUI.confirm(
        `This will permanently delete all ${count} item${count !== 1 ? 's' : ''} in trash. This cannot be undone.`,
        {
            title: 'Empty Trash',
            confirmText: 'Empty Trash',
            icon: 'danger'
        }
    );

    if (!confirmed) return;

    SharedTrash.clear();
    SharedUI.toast('Trash emptied', 'success');
    renderTrash();
}

function renderActivityTable() {
    if (!elements.activityBody) return;

    const filteredData = getFilteredAnalyticsData();
    const recent = SharedDashboard.getRecentActivity(filteredData, 20);

    if (recent.length === 0) {
        const emptyMsg = state.activeTab === 'overview'
            ? 'No recent activity'
            : `No recent ${state.activeTab} activity`;
        elements.activityBody.innerHTML = `<tr><td colspan="7" class="activity-empty">${emptyMsg}</td></tr>`;
        return;
    }

    elements.activityBody.innerHTML = recent.map(item => {
        const thumbnail = item.thumbnail || item.imageUrl || '';
        const title = item.title || 'Untitled';
        const model = item.model || item.settings?.model || 'Unknown';
        const seed = item.seed || '-';
        const time = formatTimeAgo(item.timestamp);
        const studioClass = {
            infographics: 'infographics',
            modelStudio: 'models',
            bundleStudio: 'bundles'
        }[item.studio] || '';

        return `
            <tr>
                <td>
                    ${thumbnail ? `<img class="activity-thumbnail" src="${thumbnail}" alt="Preview" data-action="lightbox" data-url="${thumbnail}">` : '-'}
                </td>
                <td>${escapeHtml(title)}</td>
                <td><span class="activity-studio ${studioClass}">${item.studioLabel}</span></td>
                <td>${SharedDashboard._formatModelName(model)}</td>
                <td class="activity-seed">${seed}</td>
                <td class="activity-time">${time}</td>
                <td class="activity-actions">
                    ${thumbnail ? `
                        <button class="activity-btn" title="View" data-action="lightbox" data-url="${thumbnail}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Charts
function initCharts() {
    if (!elements.trendsChart) return;

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const textColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    initTrendsChart();
    initModelChart();
    initStudioChart();
}

function initTrendsChart() {
    if (!elements.trendsChart) return;

    const trends = SharedDashboard.getGenerationTrends(state.analyticsData, 7);
    const ctx = elements.trendsChart.getContext('2d');

    state.charts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trends.map(t => t.date),
            datasets: [{
                label: 'Generations',
                data: trends.map(t => t.count),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function initModelChart() {
    if (!elements.modelChart) return;

    const modelData = SharedDashboard.getModelUsage(state.analyticsData);
    const ctx = elements.modelChart.getContext('2d');
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    if (modelData.length === 0) {
        ctx.font = '14px Outfit';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText('No model data', elements.modelChart.width / 2, elements.modelChart.height / 2);
        return;
    }

    state.charts.models = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: modelData.map(m => m.model),
            datasets: [{
                data: modelData.map(m => m.count),
                backgroundColor: colors.slice(0, modelData.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 12, padding: 8 } }
            },
            cutout: '60%'
        }
    });
}

function initStudioChart() {
    if (!elements.studioChart) return;

    const studioData = SharedDashboard.getStudioBreakdown(state.analyticsData);
    const ctx = elements.studioChart.getContext('2d');

    state.charts.studios = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: studioData.map(s => s.studio),
            datasets: [{
                label: 'Generations',
                data: studioData.map(s => s.count),
                backgroundColor: studioData.map(s => s.color),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

// Analytics helpers
function getStudioKeyFromTab(tab) {
    const tabToStudio = {
        'infographics': 'infographics',
        'models': 'modelStudio',
        'bundles': 'bundleStudio'
    };
    return tabToStudio[tab] || null;
}

function getFilteredAnalyticsData() {
    if (state.activeTab === 'overview') {
        return state.analyticsData;
    }
    const studioKey = getStudioKeyFromTab(state.activeTab);
    if (!studioKey) return state.analyticsData;
    return { [studioKey]: state.analyticsData[studioKey] };
}

function switchAnalyticsTab(tab) {
    state.activeTab = tab;

    if (elements.dashboardTabs) {
        elements.dashboardTabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
    }

    renderAnalyticsCards();
    renderQuickAccess();
    renderActivityTable();
    updateChartsForTab();
}

function updateChartsForTab() {
    const filteredData = getFilteredAnalyticsData();

    if (state.charts.trends) {
        const trends = SharedDashboard.getGenerationTrends(filteredData, 7);
        state.charts.trends.data.labels = trends.map(t => t.date);
        state.charts.trends.data.datasets[0].data = trends.map(t => t.count);

        const tabColors = {
            'overview': '#6366f1',
            'infographics': '#6366f1',
            'models': '#22c55e',
            'bundles': '#f59e0b'
        };
        state.charts.trends.data.datasets[0].borderColor = tabColors[state.activeTab];
        state.charts.trends.data.datasets[0].backgroundColor = tabColors[state.activeTab] + '1a';
        state.charts.trends.update();
    }

    if (state.charts.models) {
        const modelData = SharedDashboard.getModelUsage(filteredData);
        const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        state.charts.models.data.labels = modelData.map(m => m.model);
        state.charts.models.data.datasets[0].data = modelData.map(m => m.count);
        state.charts.models.data.datasets[0].backgroundColor = colors.slice(0, modelData.length);
        state.charts.models.update();
    }

    if (state.charts.studios && state.activeTab === 'overview') {
        const studioData = SharedDashboard.getStudioBreakdown(state.analyticsData);
        state.charts.studios.data.datasets[0].data = studioData.map(s => s.count);
        state.charts.studios.update();
    }
}

async function exportAllData() {
    const allData = {
        exported: new Date().toISOString(),
        ...state.analyticsData
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngraphics_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    SharedUI.toast('Data exported successfully', 'success');
}

async function clearOldItems() {
    const days = 30;

    const confirmed = await SharedUI.confirm(
        `This will remove all history items older than ${days} days. This cannot be undone.`,
        {
            title: 'Clear Old Items',
            confirmText: 'Clear',
            icon: 'warning'
        }
    );

    if (!confirmed) return;

    let totalRemoved = 0;
    for (const studio of ['infographics', 'modelStudio', 'bundleStudio']) {
        totalRemoved += SharedDashboard.clearOldItems(studio, days);
    }

    state.analyticsData = SharedDashboard.loadAllData();
    state.metrics = SharedDashboard.getMetrics(state.analyticsData);
    renderAnalyticsCards();
    renderStoragePanel();
    renderQuickAccess();
    renderActivityTable();

    if (state.charts.trends) {
        const trends = SharedDashboard.getGenerationTrends(state.analyticsData, 7);
        state.charts.trends.data.labels = trends.map(t => t.date);
        state.charts.trends.data.datasets[0].data = trends.map(t => t.count);
        state.charts.trends.update();
    }

    if (state.charts.studios) {
        const studioData = SharedDashboard.getStudioBreakdown(state.analyticsData);
        state.charts.studios.data.datasets[0].data = studioData.map(s => s.count);
        state.charts.studios.update();
    }

    SharedUI.toast(`Removed ${totalRemoved} old items`, 'success');
}

// Lightbox
function openLightbox(url) {
    if (elements.lightboxImage) {
        elements.lightboxImage.src = url;
    }
    if (elements.lightbox) {
        elements.lightbox.classList.add('visible');
    }
}

function closeLightbox() {
    if (elements.lightbox) {
        elements.lightbox.classList.remove('visible');
    }
    if (elements.lightboxImage) {
        elements.lightboxImage.src = '';
    }
}

window.openLightbox = openLightbox;

// Analytics event listeners
function setupAnalyticsListeners() {
    // Tab switching
    if (elements.dashboardTabs) {
        elements.dashboardTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                switchAnalyticsTab(e.target.dataset.tab);
            }
        });
    }

    // Export all
    elements.exportAllBtn?.addEventListener('click', exportAllData);

    // Clear old items
    elements.clearOldBtn?.addEventListener('click', clearOldItems);

    // Empty trash
    elements.emptyTrashBtn?.addEventListener('click', emptyTrash);

    // Reset cost data
    elements.resetCostBtn?.addEventListener('click', resetCostData);

    // Lightbox
    elements.lightboxClose?.addEventListener('click', closeLightbox);
    elements.lightbox?.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });
}

// Utility
function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
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
            background: ${type === 'error' ? 'var(--error)' : type === 'success' ? 'var(--apple-green)' : 'var(--bg-tertiary)'};
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

    // Danger Zone
    elements.clearHistoryBtn?.addEventListener('click', clearAllHistory);
    elements.clearFavoritesBtn?.addEventListener('click', clearAllFavorites);
    elements.deleteAccountBtn?.addEventListener('click', deleteAccount);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close lightbox if open, otherwise go back to dashboard
            if (elements.lightbox?.classList.contains('visible')) {
                closeLightbox();
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    });

    // Event delegation for dynamic elements
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const url = target.dataset.url;
        const id = target.dataset.id;

        switch (action) {
            case 'billing-portal':
                openBillingPortal();
                break;
            case 'lightbox':
                if (url) openLightbox(url);
                break;
            case 'restore':
                if (id) restoreTrashItem(id);
                break;
            case 'delete':
                if (id) deleteTrashItem(id);
                break;
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

