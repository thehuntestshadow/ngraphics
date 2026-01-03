/**
 * HEFAISTOS Admin Panel
 * User management, analytics, and administrative actions
 */

// State
const adminState = {
    isAdmin: false,
    users: [],
    usersPage: 1,
    usersTotal: 0,
    subscriptions: [],
    auditLogs: [],
    auditPage: 1,
    auditTotal: 0,
    stats: null,
    searchDebounce: null,
    charts: {},
    // CMS state
    cmsHomepage: null,
    cmsGallery: [],
    cmsFaq: [],
    editingGalleryItem: null,
    editingFaqItem: null,
    quillEditor: null,
    // Selection state
    selectedUsers: new Set(),
    // Sort state
    usersSortColumn: 'created_at',
    usersSortDir: 'desc',
    // Pagination
    itemsPerPage: 20,
    // Timestamps
    lastUpdated: {
        overview: null,
        users: null,
        subscriptions: null,
        audit: null
    }
};

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];

// Elements cache
let elements = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initElements();
    await checkAdminAccess();
});

function initElements() {
    elements = {
        loadingOverlay: document.getElementById('loadingOverlay'),
        adminLayout: document.getElementById('adminLayout'),
        // Mobile menu
        mobileMenuToggle: document.getElementById('mobileMenuToggle'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        sidebar: document.querySelector('.admin-sidebar'),
        // Theme
        themeToggle: document.getElementById('themeToggle'),
        // Stats
        statUsers: document.getElementById('statUsers'),
        statActiveSubs: document.getElementById('statActiveSubs'),
        statMRR: document.getElementById('statMRR'),
        statGenerations: document.getElementById('statGenerations'),
        statProSubs: document.getElementById('statProSubs'),
        statBusinessSubs: document.getElementById('statBusinessSubs'),
        statProMRR: document.getElementById('statProMRR'),
        statBusinessMRR: document.getElementById('statBusinessMRR'),
        // Tables
        recentUsersBody: document.getElementById('recentUsersBody'),
        usersTableBody: document.getElementById('usersTableBody'),
        usersPagination: document.getElementById('usersPagination'),
        usersPaginationInfo: document.getElementById('usersPaginationInfo'),
        subscriptionsTableBody: document.getElementById('subscriptionsTableBody'),
        auditTableBody: document.getElementById('auditTableBody'),
        auditPagination: document.getElementById('auditPagination'),
        auditPaginationInfo: document.getElementById('auditPaginationInfo'),
        // Mobile card views
        usersCards: document.getElementById('usersCards'),
        subscriptionsCards: document.getElementById('subscriptionsCards'),
        auditCards: document.getElementById('auditCards'),
        // Filters
        userSearch: document.getElementById('userSearch'),
        tierFilter: document.getElementById('tierFilter'),
        statusFilter: document.getElementById('statusFilter'),
        clearFiltersBtn: document.getElementById('clearFiltersBtn'),
        exportUsersBtn: document.getElementById('exportUsersBtn'),
        // Last updated timestamps
        overviewLastUpdated: document.getElementById('overviewLastUpdated'),
        usersLastUpdated: document.getElementById('usersLastUpdated'),
        // Selection
        selectAllUsers: document.getElementById('selectAllUsers'),
        bulkActionsBar: document.getElementById('bulkActionsBar'),
        selectedCount: document.getElementById('selectedCount'),
        // Modal
        userModal: document.getElementById('userModal'),
        userModalBody: document.getElementById('userModalBody'),
        // CMS Elements
        galleryTableBody: document.getElementById('galleryTableBody'),
        gallerySearch: document.getElementById('gallerySearch'),
        galleryStudioFilter: document.getElementById('galleryStudioFilter'),
        galleryModal: document.getElementById('galleryModal'),
        faqTableBody: document.getElementById('faqTableBody'),
        faqSearch: document.getElementById('faqSearch'),
        faqCategoryFilter: document.getElementById('faqCategoryFilter'),
        faqModal: document.getElementById('faqModal'),
        jsonModal: document.getElementById('jsonModal'),
        // Buttons
        logoutBtn: document.getElementById('logoutBtn')
    };

    setupEventListeners();
}

function setupEventListeners() {
    // Mobile menu toggle
    elements.mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    elements.sidebarOverlay?.addEventListener('click', closeMobileMenu);

    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    updateThemeIcons();

    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            showSection(btn.dataset.section);
            // Close mobile menu after navigation
            closeMobileMenu();
        });
    });

    // Logout
    elements.logoutBtn?.addEventListener('click', handleLogout);

    // User search with debounce
    elements.userSearch?.addEventListener('input', (e) => {
        clearTimeout(adminState.searchDebounce);
        adminState.searchDebounce = setTimeout(() => {
            adminState.usersPage = 1;
            loadUsers();
        }, 300);
        updateClearFiltersVisibility();
    });

    // Filters
    elements.tierFilter?.addEventListener('change', () => {
        adminState.usersPage = 1;
        loadUsers();
        updateClearFiltersVisibility();
    });

    elements.statusFilter?.addEventListener('change', () => {
        adminState.usersPage = 1;
        loadUsers();
        updateClearFiltersVisibility();
    });

    // Clear filters
    elements.clearFiltersBtn?.addEventListener('click', clearFilters);

    // Export
    elements.exportUsersBtn?.addEventListener('click', exportUsersCSV);

    // Select all users checkbox
    elements.selectAllUsers?.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.user-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
            const userId = cb.dataset.userId;
            if (e.target.checked) {
                adminState.selectedUsers.add(userId);
            } else {
                adminState.selectedUsers.delete(userId);
            }
        });
        updateBulkActionsBar();
    });

    // Sortable column headers
    document.querySelectorAll('.admin-table th.sortable').forEach(th => {
        th.addEventListener('click', () => handleSortClick(th));
    });

    // Modal close
    elements.userModal?.addEventListener('click', (e) => {
        if (e.target === elements.userModal) closeUserModal();
    });

    // Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUserModal();
            closeGalleryModal();
            closeFAQModal();
            closeJSONEditor();
        }
    });

    // CMS Gallery filters
    // Use 500ms debounce to reduce DOM updates for large galleries
    elements.gallerySearch?.addEventListener('input', debounce(() => renderGalleryTable(), 500));
    elements.galleryStudioFilter?.addEventListener('change', () => renderGalleryTable());

    // CMS FAQ filters
    elements.faqSearch?.addEventListener('input', debounce(() => renderFAQTable(), 300));
    elements.faqCategoryFilter?.addEventListener('change', () => renderFAQTable());

    // Gallery image upload
    const galleryUpload = document.getElementById('galleryImageUpload');
    const galleryInput = document.getElementById('galleryImageInput');
    if (galleryUpload && galleryInput) {
        galleryUpload.addEventListener('click', () => galleryInput.click());
        galleryUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            galleryUpload.classList.add('dragover');
        });
        galleryUpload.addEventListener('dragleave', () => {
            galleryUpload.classList.remove('dragover');
        });
        galleryUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            galleryUpload.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleGalleryImageUpload(file);
            }
        });
        galleryInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleGalleryImageUpload(e.target.files[0]);
            }
        });
    }

    // CMS modal close on backdrop click
    elements.galleryModal?.addEventListener('click', (e) => {
        if (e.target === elements.galleryModal) closeGalleryModal();
    });
    elements.faqModal?.addEventListener('click', (e) => {
        if (e.target === elements.faqModal) closeFAQModal();
    });
    elements.jsonModal?.addEventListener('click', (e) => {
        if (e.target === elements.jsonModal) closeJSONEditor();
    });

    // Collapsible sections
    document.querySelectorAll('[data-collapse]').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.collapse;
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            }
        });
    });

    // Event delegation for data-action buttons (security: avoids inline onclick handlers)
    document.addEventListener('click', async (e) => {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        const id = actionEl.dataset.id;
        const userId = actionEl.dataset.userId;

        switch (action) {
            case 'copy-email': {
                const emailEl = actionEl.closest('.email-cell')?.querySelector('.email-text');
                if (emailEl) {
                    await copyEmail(emailEl.textContent, actionEl);
                }
                break;
            }
            case 'open-user':
                if (userId) openUserModal(userId);
                break;
            case 'change-tier': {
                const tier = actionEl.dataset.tier;
                if (userId && tier) changeTier(userId, tier);
                break;
            }
            case 'add-credits':
                if (userId) addCreditsToUser(userId);
                break;
            case 'move-gallery': {
                const direction = actionEl.dataset.direction;
                if (id && direction) moveGalleryItem(id, direction);
                break;
            }
            case 'edit-gallery':
                if (id) editGalleryItem(id);
                break;
            case 'delete-gallery':
                if (id) deleteGalleryItem(id);
                break;
            case 'edit-faq':
                if (id) editFAQItem(id);
                break;
            case 'delete-faq':
                if (id) deleteFAQItem(id);
                break;
            // Section navigation
            case 'refresh-section': {
                const section = actionEl.dataset.section;
                if (section) refreshSection(section);
                break;
            }
            case 'show-section': {
                const section = actionEl.dataset.section;
                if (section) showSection(section);
                break;
            }
            // Bulk actions
            case 'bulk-set-tier': {
                const tier = actionEl.dataset.tier;
                if (tier) bulkSetTier(tier);
                break;
            }
            case 'bulk-add-credits':
                bulkAddCredits();
                break;
            case 'clear-selection':
                clearSelection();
                break;
            // CMS actions
            case 'save-homepage-section': {
                const section = actionEl.dataset.section;
                if (section) saveHomepageSection(section);
                break;
            }
            case 'open-json-editor':
                openJSONEditor();
                break;
            case 'close-json-editor':
                closeJSONEditor();
                break;
            case 'save-json-content':
                saveJSONContent();
                break;
            // Gallery modal
            case 'open-gallery-modal':
                openGalleryModal();
                break;
            case 'close-gallery-modal':
                closeGalleryModal();
                break;
            // FAQ modal
            case 'open-faq-modal':
                openFAQModal();
                break;
            case 'close-faq-modal':
                closeFAQModal();
                break;
            // User modal
            case 'close-user-modal':
                closeUserModal();
                break;
        }
    });

    // Event delegation for form submissions
    document.addEventListener('submit', (e) => {
        const form = e.target.closest('form[data-action]');
        if (!form) return;

        e.preventDefault();
        const action = form.dataset.action;

        switch (action) {
            case 'save-gallery-item':
                saveGalleryItem(e);
                break;
            case 'save-faq-item':
                saveFAQItem(e);
                break;
        }
    });

    // Event delegation for checkbox/select changes
    document.addEventListener('change', (e) => {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;

        const action = actionEl.dataset.action;
        const id = actionEl.dataset.id;

        switch (action) {
            case 'toggle-gallery-active':
                if (id) toggleGalleryActive(id, actionEl.checked);
                break;
            case 'toggle-faq-active':
                if (id) toggleFAQActive(id, actionEl.checked);
                break;
            case 'change-items-per-page':
                changeItemsPerPage(actionEl.value);
                break;
        }
    });
}

// Debounce helper
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Mobile menu functions
function toggleMobileMenu() {
    elements.sidebar?.classList.toggle('open');
    elements.sidebarOverlay?.classList.toggle('active');
    elements.mobileMenuToggle?.classList.toggle('active');
}

function closeMobileMenu() {
    elements.sidebar?.classList.remove('open');
    elements.sidebarOverlay?.classList.remove('active');
    elements.mobileMenuToggle?.classList.remove('active');
}

// Theme toggle
function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ngraphics_theme', newTheme);
    updateThemeIcons();
}

function updateThemeIcons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const darkIcon = document.querySelector('.theme-icon-dark');
    const lightIcon = document.querySelector('.theme-icon-light');
    if (darkIcon) darkIcon.style.display = isLight ? 'none' : 'block';
    if (lightIcon) lightIcon.style.display = isLight ? 'block' : 'none';
}

/**
 * Audit logging helper
 *
 * SECURITY: If this function ever writes to database for later UI rendering,
 * all string values in the details object must be sanitized. Currently logs
 * to console only, so sanitization is not strictly required.
 *
 * @param {string} action - Action name (should be from known set)
 * @param {string} targetUserId - Target user UUID
 * @param {Object} details - Additional context (will be sanitized if needed)
 */
async function logAdminAction(action, targetUserId, details = {}) {
    try {
        // Sanitize string values in details for defense in depth
        const sanitizedDetails = {};
        for (const [key, value] of Object.entries(details)) {
            if (typeof value === 'string') {
                // Limit length and remove control characters
                sanitizedDetails[key] = value.slice(0, 500).replace(/[\x00-\x1F\x7F]/g, '');
            } else {
                sanitizedDetails[key] = value;
            }
        }

        // This would insert into admin_audit_log via RPC if needed
        // For now, the admin_update_user RPC already logs actions
        console.log('[Admin Action]', action, targetUserId, sanitizedDetails);
    } catch (err) {
        console.error('Failed to log admin action:', err);
    }
}

// Toast notification system
function showToast(type, title, message = '', duration = 4000) {
    // Remove existing toast
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    // Create toast element using DOM methods for security
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;

    // Icon container (static SVG is safe)
    const iconDiv = document.createElement('div');
    iconDiv.className = 'admin-toast-icon';
    const iconSvg = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    iconDiv.innerHTML = iconSvg[type] || iconSvg.info;

    // Content container with textContent (XSS-safe)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'admin-toast-content';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'admin-toast-title';
    titleDiv.textContent = title; // textContent is XSS-safe
    contentDiv.appendChild(titleDiv);

    if (message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'admin-toast-message';
        messageDiv.textContent = message; // textContent is XSS-safe
        contentDiv.appendChild(messageDiv);
    }

    // Close button with event listener (no inline onclick)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'admin-toast-close';
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', () => toast.remove());

    toast.appendChild(iconDiv);
    toast.appendChild(contentDiv);
    toast.appendChild(closeBtn);

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Auto remove
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

async function checkAdminAccess() {
    try {
        // Wait for Supabase to fully initialize (with timeout handling)
        const initialized = await new Promise(resolve => {
            const check = () => {
                if (window.ngSupabase?.initialized) {
                    resolve(true);
                    return true;
                }
                return false;
            };

            if (!check()) {
                const interval = setInterval(() => {
                    if (check()) clearInterval(interval);
                }, 100);
                // Timeout after 5 seconds - resolve with false to indicate timeout
                setTimeout(() => {
                    clearInterval(interval);
                    if (!window.ngSupabase?.initialized) {
                        console.error('[Admin] Supabase initialization timeout');
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }, 5000);
            }
        });

        // Handle initialization timeout
        if (!initialized) {
            console.error('[Admin] Failed to initialize, redirecting...');
            window.location.href = 'index.html';
            return;
        }

        if (!window.ngSupabase?.isAuthenticated) {
            console.log('Not authenticated, redirecting...');
            window.location.href = 'index.html';
            return;
        }

        // Check if user is admin using RPC function (bypasses RLS)
        const { data: isAdmin, error } = await ngSupabase.client
            .rpc('is_current_user_admin');

        if (error || !isAdmin) {
            console.log('Not an admin, redirecting...', error);
            window.location.href = 'index.html';
            return;
        }

        adminState.isAdmin = true;

        // Show admin panel
        elements.loadingOverlay.style.display = 'none';
        elements.adminLayout.style.display = 'grid';

        // Load initial data
        await loadDashboardData();

    } catch (err) {
        console.error('Admin access check failed:', err);
        window.location.href = 'index.html';
    }
}

async function handleLogout() {
    try {
        await ngSupabase.signOut();
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Logout failed:', err);
    }
}

// Section Navigation
function showSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionId}`);
    });

    // Load section data if needed
    switch (sectionId) {
        case 'users':
            if (adminState.users.length === 0) loadUsers();
            break;
        case 'subscriptions':
            loadSubscriptions();
            break;
        case 'usage':
            loadUsageData();
            break;
        case 'audit':
            if (adminState.auditLogs.length === 0) loadAuditLogs();
            break;
        case 'cms-homepage':
            loadCMSHomepage();
            break;
        case 'cms-gallery':
            loadCMSGallery();
            break;
        case 'cms-faq':
            loadCMSFAQ();
            break;
    }
}

// Dashboard Data
async function loadDashboardData() {
    try {
        // Load stats using RPC function (bypasses RLS)
        const { data: statsArray, error: statsError } = await ngSupabase.client
            .rpc('get_admin_stats');

        if (!statsError && statsArray && statsArray.length > 0) {
            const stats = statsArray[0];
            adminState.stats = stats;
            updateStatsDisplay(stats);
        } else if (statsError) {
            console.error('Stats error:', statsError);
        }

        // Load recent users
        await loadRecentUsers();

        // Initialize charts
        initCharts();

        // Update timestamp
        updateLastUpdated('overview');

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
}

function updateStatsDisplay(stats, animate = true) {
    if (animate) {
        if (elements.statUsers) animateValue(elements.statUsers, 0, stats.total_users);
        if (elements.statActiveSubs) animateValue(elements.statActiveSubs, 0, stats.active_subscriptions);
        if (elements.statMRR) {
            elements.statMRR.textContent = '$0';
            animateValue(elements.statMRR, 0, stats.mrr_dollars);
        }
        if (elements.statGenerations) elements.statGenerations.textContent = '-';
        if (elements.statProSubs) animateValue(elements.statProSubs, 0, stats.pro_subscribers);
        if (elements.statBusinessSubs) animateValue(elements.statBusinessSubs, 0, stats.business_subscribers);
        if (elements.statProMRR) {
            elements.statProMRR.textContent = '$0';
            animateValue(elements.statProMRR, 0, stats.pro_subscribers * (CONFIG.TIER_PRICES?.PRO_MONTHLY || 19));
        }
        if (elements.statBusinessMRR) {
            elements.statBusinessMRR.textContent = '$0';
            animateValue(elements.statBusinessMRR, 0, stats.business_subscribers * (CONFIG.TIER_PRICES?.BUSINESS_MONTHLY || 49));
        }
    } else {
        if (elements.statUsers) elements.statUsers.textContent = formatNumber(stats.total_users);
        if (elements.statActiveSubs) elements.statActiveSubs.textContent = formatNumber(stats.active_subscriptions);
        if (elements.statMRR) elements.statMRR.textContent = `$${formatNumber(stats.mrr_dollars)}`;
        if (elements.statGenerations) elements.statGenerations.textContent = '-';
        if (elements.statProSubs) elements.statProSubs.textContent = formatNumber(stats.pro_subscribers);
        if (elements.statBusinessSubs) elements.statBusinessSubs.textContent = formatNumber(stats.business_subscribers);
        if (elements.statProMRR) elements.statProMRR.textContent = `$${formatNumber(stats.pro_subscribers * (CONFIG.TIER_PRICES?.PRO_MONTHLY || 19))}`;
        if (elements.statBusinessMRR) elements.statBusinessMRR.textContent = `$${formatNumber(stats.business_subscribers * (CONFIG.TIER_PRICES?.BUSINESS_MONTHLY || 49))}`;
    }
}

async function loadRecentUsers() {
    try {
        // Use RPC function to bypass RLS
        const { data: users, error } = await ngSupabase.client
            .rpc('get_admin_users', {
                p_search: null,
                p_tier: null,
                p_status: null,
                p_limit: 5,
                p_offset: 0
            });

        if (error) throw error;

        elements.recentUsersBody.innerHTML = users.length === 0
            ? '<tr><td colspan="5" class="loading-cell">No users yet</td></tr>'
            : users.map(user => `
                <tr>
                    <td>${escapeHtml(user.email || 'N/A')}</td>
                    <td><span class="tier-badge ${user.tier_id || 'free'}">${user.tier_id || 'Free'}</span></td>
                    <td><span class="status-badge ${user.subscription_status || 'active'}">${user.subscription_status || 'Active'}</span></td>
                    <td>${formatDate(user.created_at)}</td>
                    <td><button class="action-btn secondary" data-action="open-user" data-user-id="${user.id}">View</button></td>
                </tr>
            `).join('');

    } catch (err) {
        console.error('Failed to load recent users:', err);
        elements.recentUsersBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load users</td></tr>';
    }
}

// Users
async function loadUsers() {
    try {
        elements.usersTableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading...</td></tr>';

        const search = elements.userSearch?.value || '';
        const tierFilter = elements.tierFilter?.value || '';
        const statusFilter = elements.statusFilter?.value || '';

        const offset = (adminState.usersPage - 1) * adminState.itemsPerPage;

        // Use RPC functions to bypass RLS
        const [usersResult, countResult] = await Promise.all([
            ngSupabase.client.rpc('get_admin_users', {
                p_search: search || null,
                p_tier: tierFilter || null,
                p_status: statusFilter || null,
                p_limit: adminState.itemsPerPage,
                p_offset: offset
            }),
            ngSupabase.client.rpc('count_admin_users', {
                p_search: search || null,
                p_tier: tierFilter || null,
                p_status: statusFilter || null
            })
        ]);

        if (usersResult.error) throw usersResult.error;

        const users = usersResult.data || [];
        const count = countResult.data || 0;

        adminState.users = users;
        adminState.usersTotal = count;

        // Apply sorting and update headers
        sortUsers();
        updateSortHeaders();

        renderUsersTable();
        renderPagination(elements.usersPagination, adminState.usersPage, Math.ceil(count / adminState.itemsPerPage), (page) => {
            adminState.usersPage = page;
            loadUsers();
        });

        // Update timestamp
        updateLastUpdated('users');

    } catch (err) {
        console.error('Failed to load users:', err);
        elements.usersTableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Failed to load users</td></tr>';
    }
}

function renderUsersTable(users = adminState.users) {
    // Reset select all checkbox
    if (elements.selectAllUsers) {
        elements.selectAllUsers.checked = false;
    }

    elements.usersTableBody.innerHTML = users.length === 0
        ? '<tr><td colspan="8" class="loading-cell">No users found</td></tr>'
        : users.map(user => `
            <tr>
                <td><input type="checkbox" class="user-checkbox" data-user-id="${user.id}" ${adminState.selectedUsers.has(user.id) ? 'checked' : ''} onchange="toggleUserSelection('${user.id}', this.checked)"></td>
                <td class="email-cell">
                    <span class="email-text" title="${escapeHtml(user.email || '')}">${escapeHtml(user.email || 'N/A')}</span>
                    <button class="copy-btn" data-action="copy-email" title="Copy email">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <rect x="9" y="9" width="13" height="13" rx="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </td>
                <td title="${escapeHtml(user.full_name || '')}">${escapeHtml(user.full_name || '-')}</td>
                <td><span class="tier-badge ${user.tier_id || 'free'}">${capitalizeFirst(user.tier_id || 'free')}</span></td>
                <td>${user.credit_balance ?? 0}</td>
                <td><span class="status-badge ${user.subscription_status || 'active'}">${capitalizeFirst(user.subscription_status || 'active')}</span></td>
                <td>${formatDate(user.created_at)}</td>
                <td><button class="action-btn secondary" data-action="open-user" data-user-id="${user.id}">Manage</button></td>
            </tr>
        `).join('');

    // Update pagination info
    updatePaginationInfo(elements.usersPaginationInfo, adminState.usersPage, adminState.usersTotal, adminState.itemsPerPage);

    // Render mobile cards
    renderUsersCards(users);
}

// Mobile card view for users
function renderUsersCards(users = adminState.users) {
    if (!elements.usersCards) return;

    elements.usersCards.innerHTML = users.length === 0
        ? '<div class="empty-state"><p>No users found</p></div>'
        : users.map(user => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">${escapeHtml(user.email || 'N/A')}</div>
                    <div class="admin-card-badges">
                        <span class="tier-badge ${user.tier_id || 'free'}">${capitalizeFirst(user.tier_id || 'free')}</span>
                    </div>
                </div>
                <div class="admin-card-body">
                    <div class="admin-card-row">
                        <span class="admin-card-label">Name</span>
                        <span class="admin-card-value">${escapeHtml(user.full_name || '-')}</span>
                    </div>
                    <div class="admin-card-row">
                        <span class="admin-card-label">Credits</span>
                        <span class="admin-card-value">${user.credit_balance ?? 0}</span>
                    </div>
                    <div class="admin-card-row">
                        <span class="admin-card-label">Status</span>
                        <span class="admin-card-value"><span class="status-badge ${user.subscription_status || 'active'}">${capitalizeFirst(user.subscription_status || 'active')}</span></span>
                    </div>
                    <div class="admin-card-row">
                        <span class="admin-card-label">Joined</span>
                        <span class="admin-card-value">${formatDate(user.created_at)}</span>
                    </div>
                </div>
                <div class="admin-card-footer">
                    <label class="admin-card-checkbox">
                        <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" ${adminState.selectedUsers.has(user.id) ? 'checked' : ''} onchange="toggleUserSelection('${user.id}', this.checked)">
                        Select
                    </label>
                    <div class="admin-card-actions">
                        <button class="action-btn secondary" data-action="open-user" data-user-id="${user.id}">Manage</button>
                    </div>
                </div>
            </div>
        `).join('');
}

// Mobile card view for subscriptions
function renderSubscriptionsCards(subs = adminState.subscriptions) {
    if (!elements.subscriptionsCards) return;

    elements.subscriptionsCards.innerHTML = subs.length === 0
        ? '<div class="empty-state"><p>No active subscriptions</p></div>'
        : subs.map(sub => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title">${escapeHtml(sub.email || 'N/A')}</div>
                    <div class="admin-card-badges">
                        <span class="tier-badge ${sub.tier_id}">${capitalizeFirst(sub.tier_id)}</span>
                    </div>
                </div>
                <div class="admin-card-body">
                    <div class="admin-card-row">
                        <span class="admin-card-label">Started</span>
                        <span class="admin-card-value">${formatDate(sub.created_at)}</span>
                    </div>
                    <div class="admin-card-row">
                        <span class="admin-card-label">Next Billing</span>
                        <span class="admin-card-value">${sub.current_period_end ? formatDate(sub.current_period_end) : '-'}</span>
                    </div>
                </div>
                <div class="admin-card-footer">
                    <div class="admin-card-actions">
                        <button class="action-btn secondary" data-action="open-user" data-user-id="${sub.user_id}">View User</button>
                    </div>
                </div>
            </div>
        `).join('');
}

// Mobile card view for audit logs
function renderAuditCards(logs = adminState.auditLogs) {
    if (!elements.auditCards) return;

    elements.auditCards.innerHTML = logs.length === 0
        ? '<div class="empty-state"><p>No audit logs yet</p></div>'
        : logs.map(log => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-title"><code>${escapeHtml(log.action)}</code></div>
                    <div class="admin-card-subtitle">${formatDateTime(log.created_at)}</div>
                </div>
                <div class="admin-card-body">
                    <div class="admin-card-row">
                        <span class="admin-card-label">Admin</span>
                        <span class="admin-card-value">${escapeHtml(log.admin_email || 'System')}</span>
                    </div>
                    <div class="admin-card-row">
                        <span class="admin-card-label">Target</span>
                        <span class="admin-card-value">${escapeHtml(log.target_email || '-')}</span>
                    </div>
                    ${log.details && Object.keys(log.details).length > 0 ? `
                    <div class="admin-card-row">
                        <span class="admin-card-label">Details</span>
                        <span class="admin-card-value"><code style="font-size:0.75rem">${JSON.stringify(log.details)}</code></span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
}

// Subscriptions
async function loadSubscriptions() {
    try {
        elements.subscriptionsTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';

        // Use RPC function to bypass RLS
        const { data: subs, error } = await ngSupabase.client
            .rpc('get_admin_subscriptions');

        if (error) throw error;

        adminState.subscriptions = subs || [];

        elements.subscriptionsTableBody.innerHTML = subs.length === 0
            ? '<tr><td colspan="6" class="loading-cell">No active subscriptions</td></tr>'
            : subs.map(sub => `
                <tr>
                    <td>${escapeHtml(sub.email || 'N/A')}</td>
                    <td><span class="tier-badge ${sub.tier_id}">${capitalizeFirst(sub.tier_id)}</span></td>
                    <td>${formatDate(sub.created_at)}</td>
                    <td>${sub.current_period_end ? formatDate(sub.current_period_end) : '-'}</td>
                    <td><code style="font-size:0.75rem">-</code></td>
                    <td><button class="action-btn secondary" data-action="open-user" data-user-id="${sub.user_id}">View User</button></td>
                </tr>
            `).join('');

        // Render mobile cards
        renderSubscriptionsCards();

    } catch (err) {
        console.error('Failed to load subscriptions:', err);
        elements.subscriptionsTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load subscriptions</td></tr>';
    }
}

// Audit Logs
async function loadAuditLogs() {
    try {
        elements.auditTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';

        const offset = (adminState.auditPage - 1) * adminState.itemsPerPage;

        // Use RPC function to bypass RLS
        const { data: logs, error } = await ngSupabase.client
            .rpc('get_admin_audit_logs', {
                p_limit: adminState.itemsPerPage,
                p_offset: offset
            });

        if (error) throw error;

        adminState.auditLogs = logs || [];
        // Note: count not available from RPC, estimate from data length
        adminState.auditTotal = logs?.length >= adminState.itemsPerPage ? (adminState.auditPage * adminState.itemsPerPage) + 1 : logs?.length || 0;

        elements.auditTableBody.innerHTML = logs.length === 0
            ? '<tr><td colspan="5" class="loading-cell">No audit logs yet</td></tr>'
            : logs.map(log => `
                <tr>
                    <td>${formatDateTime(log.created_at)}</td>
                    <td>${escapeHtml(log.admin_email || 'System')}</td>
                    <td><code>${escapeHtml(log.action)}</code></td>
                    <td>${escapeHtml(log.target_email || '-')}</td>
                    <td><code style="font-size:0.75rem">${JSON.stringify(log.details || {})}</code></td>
                </tr>
            `).join('');

        // Estimate pages based on whether we got a full page
        const estimatedPages = logs.length >= adminState.itemsPerPage ? adminState.auditPage + 1 : adminState.auditPage;
        renderPagination(elements.auditPagination, adminState.auditPage, estimatedPages, (page) => {
            adminState.auditPage = page;
            loadAuditLogs();
        });

        // Update pagination info (estimated)
        const estimatedTotal = logs.length >= adminState.itemsPerPage
            ? adminState.auditPage * adminState.itemsPerPage + 1  // At least one more page
            : (adminState.auditPage - 1) * adminState.itemsPerPage + logs.length;
        updatePaginationInfo(elements.auditPaginationInfo, adminState.auditPage, estimatedTotal, adminState.itemsPerPage);

        // Render mobile cards
        renderAuditCards();

    } catch (err) {
        console.error('Failed to load audit logs:', err);
        elements.auditTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load audit logs</td></tr>';
    }
}

// Usage Analytics
async function loadUsageData() {
    if (adminState.charts.usage) return;

    const ctx = document.getElementById('usageChart')?.getContext('2d');
    if (!ctx) return;

    try {
        // Fetch real generation trends from database
        const { data: trends, error: trendsError } = await ngSupabase.client
            .rpc('get_generation_trends', { p_days: 30 });

        // Build labels and data arrays
        const labels = [];
        const data = [];

        if (!trendsError && trends?.length > 0) {
            // Create a map of dates to counts
            const trendMap = new Map(trends.map(t => [t.date, Number(t.count)]));

            // Fill in all 30 days (including zeros)
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                data.push(trendMap.get(dateStr) || 0);
            }
        } else {
            // Fallback: empty chart with date labels
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                data.push(0);
            }
        }

        adminState.charts.usage = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Generations',
                    data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: getChartOptions()
        });

        // Studios chart - fetch real studio usage
        const studiosCtx = document.getElementById('studiosChart')?.getContext('2d');
        if (studiosCtx) {
            const { data: studioData, error: studioError } = await ngSupabase.client
                .rpc('get_studio_usage', { p_days: 30 });

            let studioLabels = ['No data'];
            let studioValues = [1];
            const studioColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#a855f7'];

            if (!studioError && studioData?.length > 0) {
                studioLabels = studioData.map(s => formatStudioName(s.studio));
                studioValues = studioData.map(s => Number(s.count));
            }

            adminState.charts.studios = new Chart(studiosCtx, {
                type: 'doughnut',
                data: {
                    labels: studioLabels,
                    datasets: [{
                        data: studioValues,
                        backgroundColor: studioColors.slice(0, studioLabels.length)
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
                }
            });
        }

        // Models chart - fetch real model usage
        const modelsCtx = document.getElementById('modelsChart')?.getContext('2d');
        if (modelsCtx) {
            const { data: modelData, error: modelError } = await ngSupabase.client
                .rpc('get_model_usage', { p_days: 30 });

            let modelLabels = ['No data'];
            let modelValues = [1];

            if (!modelError && modelData?.length > 0) {
                modelLabels = modelData.map(m => formatModelName(m.model));
                modelValues = modelData.map(m => Number(m.count));
            }

            adminState.charts.models = new Chart(modelsCtx, {
                type: 'bar',
                data: {
                    labels: modelLabels,
                    datasets: [{
                        label: 'Usage',
                        data: modelValues,
                        backgroundColor: '#6366f1'
                    }]
                },
                options: getChartOptions()
            });
        }

    } catch (err) {
        console.error('Failed to load usage data:', err);
        // Show empty charts on error
        adminState.charts.usage = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Generations', data: [], borderColor: '#6366f1' }] },
            options: getChartOptions()
        });
    }
}

// Helper: Format studio name for display
function formatStudioName(studio) {
    if (!studio) return 'Unknown';
    return studio
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper: Format model name for display (shorten long model IDs)
function formatModelName(model) {
    if (!model) return 'Unknown';
    // Extract just the model name from full path like "google/gemini-3-pro-image-preview"
    const parts = model.split('/');
    const name = parts[parts.length - 1];
    // Shorten if too long
    return name.length > 20 ? name.substring(0, 17) + '...' : name;
}

// Charts
function initCharts() {
    // User Growth Chart
    const growthCtx = document.getElementById('userGrowthChart')?.getContext('2d');
    if (growthCtx) {
        // Generate placeholder data (would need real tracking)
        const labels = [];
        const data = [];
        const baseUsers = adminState.stats?.total_users || 100;

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            // Simulate growth curve
            data.push(Math.floor(baseUsers * (0.7 + (30 - i) * 0.01)));
        }

        adminState.charts.growth = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Total Users',
                    data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: getChartOptions()
        });
    }

    // Subscription Breakdown Chart
    const subsCtx = document.getElementById('subscriptionChart')?.getContext('2d');
    if (subsCtx) {
        const stats = adminState.stats || { pro_subscribers: 0, business_subscribers: 0, total_users: 0 };
        const freeUsers = stats.total_users - stats.pro_subscribers - stats.business_subscribers;

        adminState.charts.subs = new Chart(subsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Free', 'Pro', 'Business'],
                datasets: [{
                    data: [freeUsers, stats.pro_subscribers, stats.business_subscribers],
                    backgroundColor: ['#6b7280', '#6366f1', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af' }
                    }
                }
            }
        });
    }
}

function getChartOptions() {
    return {
        responsive: true,
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#9ca3af' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#9ca3af' }
            }
        },
        plugins: {
            legend: { labels: { color: '#9ca3af' } }
        }
    };
}

// User Modal
async function openUserModal(userId) {
    try {
        // Use RPC function to bypass RLS
        const { data: users, error } = await ngSupabase.client
            .rpc('get_admin_user_details', { p_user_id: userId });

        if (error) throw error;
        if (!users || users.length === 0) throw new Error('User not found');

        const user = users[0];

        elements.userModalBody.innerHTML = `
            <div class="user-info-grid">
                <div class="info-item">
                    <label>Email</label>
                    <div class="value">${escapeHtml(user.email || 'N/A')}</div>
                </div>
                <div class="info-item">
                    <label>Display Name</label>
                    <div class="value">${escapeHtml(user.full_name || '-')}</div>
                </div>
                <div class="info-item">
                    <label>Subscription Tier</label>
                    <div class="value"><span class="tier-badge ${user.tier_id || 'free'}">${capitalizeFirst(user.tier_id || 'free')}</span></div>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <div class="value"><span class="status-badge ${user.subscription_status || 'active'}">${capitalizeFirst(user.subscription_status || 'active')}</span></div>
                </div>
                <div class="info-item">
                    <label>Credits</label>
                    <div class="value">${user.credit_balance ?? 0}</div>
                </div>
                <div class="info-item">
                    <label>Joined</label>
                    <div class="value">${formatDateTime(user.created_at)}</div>
                </div>
                <div class="info-item">
                    <label>This Month</label>
                    <div class="value">${user.generation_count ?? 0} generations</div>
                </div>
            </div>

            <div class="actions-section">
                <h3>Administrative Actions</h3>
                <div class="action-group">
                    <button class="action-btn primary" data-action="change-tier" data-user-id="${userId}" data-tier="pro">Set Pro</button>
                    <button class="action-btn primary" data-action="change-tier" data-user-id="${userId}" data-tier="business">Set Business</button>
                    <button class="action-btn secondary" data-action="change-tier" data-user-id="${userId}" data-tier="free">Set Free</button>
                </div>

                <h3 style="margin-top: 1rem">Add Credits</h3>
                <div class="credit-input-group">
                    <input type="number" id="creditAmount" placeholder="Amount" min="1" value="50">
                    <input type="text" id="creditReason" placeholder="Reason (optional)">
                    <button class="action-btn primary" data-action="add-credits" data-user-id="${userId}">Add Credits</button>
                </div>
            </div>
        `;

        elements.userModal.classList.add('active');

    } catch (err) {
        console.error('Failed to load user:', err);
        showToast('error', 'Error', 'Failed to load user details');
    }
}

function closeUserModal() {
    elements.userModal?.classList.remove('active');
}

// Admin Actions
const VALID_TIERS = ['free', 'pro', 'business'];
const MAX_CREDIT_AMOUNT = 10000;

async function changeTier(userId, tierId) {
    // Input validation
    if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-f-]{36}$/i)) {
        showToast('error', 'Invalid Request', 'Invalid user ID');
        return;
    }
    if (!VALID_TIERS.includes(tierId)) {
        showToast('error', 'Invalid Request', 'Invalid tier selected');
        return;
    }

    // tierId is already validated against VALID_TIERS, but escape for defense in depth
    const confirmed = await SharedUI.confirm(`Change user's subscription to ${escapeHtml(tierId)}?`, {
        title: 'Change Subscription',
        confirmText: 'Change',
        icon: 'warning'
    });
    if (!confirmed) return;

    // Find and add loading state to clicked button
    const buttons = document.querySelectorAll('.action-group .action-btn');
    buttons.forEach(btn => btn.classList.add('loading'));

    try {
        // Use RPC function to bypass RLS
        const { error } = await ngSupabase.client
            .rpc('admin_update_user', {
                p_user_id: userId,
                p_tier_id: tierId
            });

        if (error) throw error;

        showToast('success', 'Tier Updated', `User tier changed to ${tierId}`);
        closeUserModal();
        loadUsers();
        loadRecentUsers();
        loadDashboardData();

    } catch (err) {
        console.error('Failed to change tier:', err);
        showToast('error', 'Failed to change tier', err.message);
    } finally {
        buttons.forEach(btn => btn.classList.remove('loading'));
    }
}

async function addCreditsToUser(userId) {
    // Input validation for userId
    if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-f-]{36}$/i)) {
        showToast('error', 'Invalid Request', 'Invalid user ID');
        return;
    }

    const amount = parseInt(document.getElementById('creditAmount')?.value) || 0;

    if (amount <= 0) {
        showToast('error', 'Invalid Amount', 'Please enter a valid credit amount');
        return;
    }

    if (amount > MAX_CREDIT_AMOUNT) {
        showToast('error', 'Invalid Amount', `Credit amount cannot exceed ${MAX_CREDIT_AMOUNT}`);
        return;
    }

    const confirmed = await SharedUI.confirm(`Add ${amount} credits to this user?`, {
        title: 'Add Credits',
        confirmText: 'Add Credits',
        confirmClass: 'btn-primary',
        icon: 'info'
    });
    if (!confirmed) return;

    // Add loading state to button
    const addBtn = document.querySelector('.credit-input-group .action-btn');
    if (addBtn) addBtn.classList.add('loading');

    try {
        // Use RPC function to bypass RLS (also logs the action)
        const { error } = await ngSupabase.client.rpc('admin_update_user', {
            p_user_id: userId,
            p_credit_amount: amount
        });

        if (error) throw error;

        showToast('success', 'Credits Added', `Added ${amount} credits to user`);
        openUserModal(userId); // Refresh modal

    } catch (err) {
        console.error('Failed to add credits:', err);
        showToast('error', 'Failed to add credits', err.message);
    } finally {
        if (addBtn) addBtn.classList.remove('loading');
    }
}

// Export
async function exportUsersCSV() {
    try {
        showToast('info', 'Exporting...', 'Preparing user data for export');

        // Use RPC function to bypass RLS - get all users with large limit
        const { data: users, error } = await ngSupabase.client
            .rpc('get_admin_users', {
                p_search: null,
                p_tier: null,
                p_status: null,
                p_limit: 10000,
                p_offset: 0
            });

        if (error) throw error;

        const headers = ['Email', 'Display Name', 'Tier', 'Status', 'Credits', 'Joined'];
        const rows = users.map(u => [
            u.email || '',
            u.full_name || '',
            u.tier_id || 'free',
            u.subscription_status || 'active',
            u.credit_balance ?? 0,
            new Date(u.created_at).toISOString()
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hefaistos-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('success', 'Export Complete', `Exported ${users.length} users to CSV`);

    } catch (err) {
        console.error('Failed to export users:', err);
        showToast('error', 'Export Failed', 'Failed to export users');
    }
}

// Pagination Helper
function renderPagination(container, currentPage, totalPages, onPageChange) {
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous
    html += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="prev">Prev</button>`;

    // Page numbers
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
        html += '<button data-page="1">1</button>';
        if (start > 2) html += '<span>...</span>';
    }

    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (end < totalPages) {
        if (end < totalPages - 1) html += '<span>...</span>';
        html += `<button data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="next">Next</button>`;

    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll('button').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            if (text === 'Prev' && currentPage > 1) {
                onPageChange(currentPage - 1);
            } else if (text === 'Next' && currentPage < totalPages) {
                onPageChange(currentPage + 1);
            } else if (!isNaN(parseInt(text))) {
                onPageChange(parseInt(text));
            }
        });
    });
}

// Utility Functions
function formatNumber(num) {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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

// ==================== CMS Functions ====================

// Homepage CMS
async function loadCMSHomepage() {
    try {
        adminState.cmsHomepage = await ngSupabase.getCMSHomepage();
        if (adminState.cmsHomepage?.hero) {
            const hero = adminState.cmsHomepage.hero;
            document.getElementById('hero-badge').value = hero.badge || '';
            document.getElementById('hero-title').value = hero.title || '';
            document.getElementById('hero-subtitle').value = hero.subtitle || '';
            document.getElementById('hero-cta1-text').value = hero.cta1_text || '';
            document.getElementById('hero-cta1-link').value = hero.cta1_link || '';
            document.getElementById('hero-cta2-text').value = hero.cta2_text || '';
            document.getElementById('hero-cta2-link').value = hero.cta2_link || '';
        }
    } catch (err) {
        console.error('Failed to load homepage CMS:', err);
    }
}

async function saveHomepageSection(section) {
    const statusEl = document.getElementById(`${section}-status`);
    try {
        statusEl.textContent = 'Saving...';
        statusEl.className = 'cms-save-status saving';

        let content;
        if (section === 'hero') {
            content = {
                badge: document.getElementById('hero-badge').value,
                title: document.getElementById('hero-title').value,
                subtitle: document.getElementById('hero-subtitle').value,
                cta1_text: document.getElementById('hero-cta1-text').value,
                cta1_link: document.getElementById('hero-cta1-link').value,
                cta2_text: document.getElementById('hero-cta2-text').value,
                cta2_link: document.getElementById('hero-cta2-link').value
            };
        }

        await ngSupabase.updateCMSHomepage(section, content);
        await logAdminAction('cms_update', null, { section, type: 'homepage' });

        statusEl.textContent = 'Saved!';
        statusEl.className = 'cms-save-status success';
        setTimeout(() => { statusEl.textContent = ''; }, 3000);
    } catch (err) {
        console.error('Failed to save homepage section:', err);
        statusEl.textContent = 'Failed to save';
        statusEl.className = 'cms-save-status error';
    }
}

// Gallery CMS
async function loadCMSGallery() {
    try {
        if (elements.galleryTableBody) {
            elements.galleryTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';
        }
        adminState.cmsGallery = await ngSupabase.getCMSGallery({ activeOnly: false });
        renderGalleryTable();
    } catch (err) {
        console.error('Failed to load gallery:', err);
        if (elements.galleryTableBody) {
            elements.galleryTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load gallery</td></tr>';
        }
    }
}

// Handle gallery image load error safely (avoids inline innerHTML in onerror)
function handleGalleryImageError(img) {
    img.onerror = null;
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-thumb-placeholder';
    placeholder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    img.parentElement.appendChild(placeholder);
}

// Generate thumbnail HTML with fallback placeholder
function getGalleryThumbHTML(imageUrl) {
    if (!imageUrl) {
        return `<div class="gallery-thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
    }

    return `<img src="${escapeHtml(imageUrl)}" alt="" class="gallery-thumb" onerror="handleGalleryImageError(this)">`;
}

function renderGalleryTable() {
    const search = elements.gallerySearch?.value?.toLowerCase() || '';
    const studioFilter = elements.galleryStudioFilter?.value || '';

    let items = adminState.cmsGallery;

    if (search) {
        items = items.filter(item =>
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search)
        );
    }
    if (studioFilter) {
        items = items.filter(item => item.studio_key === studioFilter);
    }

    if (!elements.galleryTableBody) return;

    elements.galleryTableBody.innerHTML = items.length === 0
        ? '<tr><td colspan="6" class="loading-cell">No gallery items found</td></tr>'
        : items.map(item => `
            <tr data-id="${item.id}">
                <td>${getGalleryThumbHTML(item.image_url)}</td>
                <td>${escapeHtml(item.title)}</td>
                <td><span class="studio-tag">${escapeHtml(item.studio_label)}</span></td>
                <td>
                    <div class="order-controls">
                        <button class="order-btn" data-action="move-gallery" data-id="${item.id}" data-direction="up" title="Move up">↑</button>
                        <span>${item.sort_order}</span>
                        <button class="order-btn" data-action="move-gallery" data-id="${item.id}" data-direction="down" title="Move down">↓</button>
                    </div>
                </td>
                <td>
                    <label class="admin-toggle">
                        <input type="checkbox" ${item.is_active ? 'checked' : ''} data-action="toggle-gallery-active" data-id="${item.id}">
                        <span class="admin-toggle-track"></span>
                    </label>
                </td>
                <td>
                    <button class="action-btn secondary" data-action="edit-gallery" data-id="${item.id}">Edit</button>
                    <button class="action-btn danger" data-action="delete-gallery" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');
}

function openGalleryModal(item = null) {
    adminState.editingGalleryItem = item;
    document.getElementById('galleryModalTitle').textContent = item ? 'Edit Gallery Image' : 'Add Gallery Image';
    document.getElementById('galleryItemId').value = item?.id || '';
    document.getElementById('galleryTitle').value = item?.title || '';
    document.getElementById('galleryDescription').value = item?.description || '';
    document.getElementById('galleryStudio').value = item?.studio_key || '';
    document.getElementById('galleryStudioLabel').value = item?.studio_label || '';
    document.getElementById('galleryImageUrl').value = item?.image_url || '';

    const preview = document.getElementById('galleryImagePreview');
    const placeholder = document.querySelector('#galleryImageUpload .upload-placeholder');
    if (item?.image_url) {
        preview.src = item.image_url;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        preview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    }

    elements.galleryModal?.classList.add('active');
}

function closeGalleryModal() {
    elements.galleryModal?.classList.remove('active');
    adminState.editingGalleryItem = null;
}

function editGalleryItem(id) {
    const item = adminState.cmsGallery.find(i => i.id === id);
    if (item) openGalleryModal(item);
}

async function handleGalleryImageUpload(file) {
    try {
        const preview = document.getElementById('galleryImagePreview');
        const placeholder = document.querySelector('#galleryImageUpload .upload-placeholder');

        // Show loading state
        if (placeholder) placeholder.innerHTML = '<span>Uploading...</span>';

        const url = await ngSupabase.uploadCMSImage(file, 'gallery');
        document.getElementById('galleryImageUrl').value = url;

        preview.src = url;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } catch (err) {
        console.error('Failed to upload image:', err);
        showToast('error', 'Upload Failed', err.message);
        const placeholder = document.querySelector('#galleryImageUpload .upload-placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Click or drag to upload</span>
            `;
        }
    }
}

async function saveGalleryItem(e) {
    e.preventDefault();
    try {
        const id = document.getElementById('galleryItemId').value;
        const data = {
            title: document.getElementById('galleryTitle').value,
            description: document.getElementById('galleryDescription').value,
            studio_key: document.getElementById('galleryStudio').value,
            studio_label: document.getElementById('galleryStudioLabel').value,
            image_url: document.getElementById('galleryImageUrl').value
        };

        if (!data.image_url) {
            showToast('error', 'Missing Image', 'Please upload an image');
            return;
        }

        if (id) {
            await ngSupabase.updateCMSGalleryItem(id, data);
            await logAdminAction('cms_update', null, { id, type: 'gallery' });
        } else {
            await ngSupabase.addCMSGalleryItem(data);
            await logAdminAction('cms_create', null, { type: 'gallery', title: data.title });
        }

        showToast('success', 'Saved', 'Gallery item saved successfully');
        closeGalleryModal();
        await loadCMSGallery();
    } catch (err) {
        console.error('Failed to save gallery item:', err);
        showToast('error', 'Save Failed', err.message);
    }
}

async function deleteGalleryItem(id) {
    const confirmed = await SharedUI.confirm('Delete this gallery item?', {
        title: 'Delete Gallery Item',
        confirmText: 'Delete',
        icon: 'danger'
    });
    if (!confirmed) return;
    try {
        await ngSupabase.deleteCMSGalleryItem(id);
        await logAdminAction('cms_delete', null, { id, type: 'gallery' });
        showToast('success', 'Deleted', 'Gallery item deleted');
        await loadCMSGallery();
    } catch (err) {
        console.error('Failed to delete gallery item:', err);
        showToast('error', 'Delete Failed', err.message);
    }
}

async function toggleGalleryActive(id, isActive) {
    try {
        await ngSupabase.updateCMSGalleryItem(id, { is_active: isActive });
    } catch (err) {
        console.error('Failed to toggle gallery item:', err);
        await loadCMSGallery(); // Reload to reset state
    }
}

async function moveGalleryItem(id, direction) {
    const items = [...adminState.cmsGallery].sort((a, b) => a.sort_order - b.sort_order);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap positions
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    try {
        await ngSupabase.reorderCMSGallery(items.map(i => i.id));
        await loadCMSGallery();
    } catch (err) {
        console.error('Failed to reorder gallery:', err);
    }
}

// FAQ CMS
async function loadCMSFAQ() {
    try {
        if (elements.faqTableBody) {
            elements.faqTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
        }
        adminState.cmsFaq = await ngSupabase.getCMSFAQ({ activeOnly: false });
        renderFAQTable();
    } catch (err) {
        console.error('Failed to load FAQ:', err);
        if (elements.faqTableBody) {
            elements.faqTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load FAQ</td></tr>';
        }
    }
}

const FAQ_CATEGORIES = {
    'getting-started': 'Getting Started',
    'billing': 'Billing',
    'features': 'Features',
    'technical': 'Technical',
    'support': 'Support'
};

function renderFAQTable() {
    const search = elements.faqSearch?.value?.toLowerCase() || '';
    const categoryFilter = elements.faqCategoryFilter?.value || '';

    let items = adminState.cmsFaq;

    if (search) {
        items = items.filter(item =>
            item.question?.toLowerCase().includes(search) ||
            item.answer?.toLowerCase().includes(search)
        );
    }
    if (categoryFilter) {
        items = items.filter(item => item.category === categoryFilter);
    }

    if (!elements.faqTableBody) return;

    elements.faqTableBody.innerHTML = items.length === 0
        ? '<tr><td colspan="5" class="loading-cell">No FAQ items found</td></tr>'
        : items.map(item => `
            <tr data-id="${item.id}">
                <td class="question-cell" title="${escapeHtml(item.question)}">${escapeHtml(item.question)}</td>
                <td><span class="category-tag">${FAQ_CATEGORIES[item.category] || item.category}</span></td>
                <td>${item.sort_order}</td>
                <td>
                    <label class="admin-toggle">
                        <input type="checkbox" ${item.is_active ? 'checked' : ''} data-action="toggle-faq-active" data-id="${item.id}">
                        <span class="admin-toggle-track"></span>
                    </label>
                </td>
                <td>
                    <button class="action-btn secondary" data-action="edit-faq" data-id="${item.id}">Edit</button>
                    <button class="action-btn danger" data-action="delete-faq" data-id="${item.id}">Delete</button>
                </td>
            </tr>
        `).join('');
}

function openFAQModal(item = null) {
    adminState.editingFaqItem = item;
    document.getElementById('faqModalTitle').textContent = item ? 'Edit FAQ Item' : 'Add FAQ Item';
    document.getElementById('faqItemId').value = item?.id || '';
    document.getElementById('faqCategory').value = item?.category || '';
    document.getElementById('faqQuestion').value = item?.question || '';

    // Initialize Quill if not already
    if (!adminState.quillEditor) {
        adminState.quillEditor = new Quill('#faqAnswerEditor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['clean']
                ]
            }
        });
    }

    // Set content
    adminState.quillEditor.root.innerHTML = item?.answer || '';

    elements.faqModal?.classList.add('active');
}

function closeFAQModal() {
    elements.faqModal?.classList.remove('active');
    adminState.editingFaqItem = null;
}

function editFAQItem(id) {
    const item = adminState.cmsFaq.find(i => i.id === id);
    if (item) openFAQModal(item);
}

async function saveFAQItem(e) {
    e.preventDefault();
    try {
        const id = document.getElementById('faqItemId').value;
        const data = {
            category: document.getElementById('faqCategory').value,
            question: document.getElementById('faqQuestion').value,
            answer: adminState.quillEditor?.root.innerHTML || ''
        };

        if (!data.answer || data.answer === '<p><br></p>') {
            showToast('error', 'Missing Answer', 'Please provide an answer');
            return;
        }

        if (id) {
            await ngSupabase.updateCMSFAQItem(id, data);
            await logAdminAction('cms_update', null, { id, type: 'faq' });
        } else {
            await ngSupabase.addCMSFAQItem(data);
            await logAdminAction('cms_create', null, { type: 'faq', question: data.question });
        }

        showToast('success', 'Saved', 'FAQ item saved successfully');
        closeFAQModal();
        await loadCMSFAQ();
    } catch (err) {
        console.error('Failed to save FAQ item:', err);
        showToast('error', 'Save Failed', err.message);
    }
}

async function deleteFAQItem(id) {
    const confirmed = await SharedUI.confirm('Delete this FAQ item?', {
        title: 'Delete FAQ Item',
        confirmText: 'Delete',
        icon: 'danger'
    });
    if (!confirmed) return;
    try {
        await ngSupabase.deleteCMSFAQItem(id);
        await logAdminAction('cms_delete', null, { id, type: 'faq' });
        showToast('success', 'Deleted', 'FAQ item deleted');
        await loadCMSFAQ();
    } catch (err) {
        console.error('Failed to delete FAQ item:', err);
        showToast('error', 'Delete Failed', err.message);
    }
}

async function toggleFAQActive(id, isActive) {
    try {
        await ngSupabase.updateCMSFAQItem(id, { is_active: isActive });
    } catch (err) {
        console.error('Failed to toggle FAQ item:', err);
        await loadCMSFAQ();
    }
}

// JSON Editor
async function openJSONEditor() {
    const section = document.getElementById('jsonSection').value || 'features';
    try {
        const content = await ngSupabase.getCMSHomepage(section);
        document.getElementById('jsonContent').value = JSON.stringify(content || [], null, 2);
        elements.jsonModal?.classList.add('active');
    } catch (err) {
        console.error('Failed to load JSON content:', err);
    }
}

function closeJSONEditor() {
    elements.jsonModal?.classList.remove('active');
}

async function saveJSONContent() {
    const section = document.getElementById('jsonSection').value;
    const contentStr = document.getElementById('jsonContent').value;

    try {
        const content = JSON.parse(contentStr);
        await ngSupabase.updateCMSHomepage(section, content);
        await logAdminAction('cms_update', null, { section, type: 'homepage_json' });
        showToast('success', 'Saved', `${capitalizeFirst(section)} content saved successfully`);
        closeJSONEditor();
    } catch (err) {
        if (err instanceof SyntaxError) {
            showToast('error', 'Invalid JSON', err.message);
        } else {
            showToast('error', 'Save Failed', err.message);
        }
    }
}

// ==================== Clear Filters ====================

function updateClearFiltersVisibility() {
    const hasFilters = (elements.userSearch?.value || '') !== '' ||
                      (elements.tierFilter?.value || '') !== '' ||
                      (elements.statusFilter?.value || '') !== '';

    if (elements.clearFiltersBtn) {
        elements.clearFiltersBtn.style.display = hasFilters ? 'inline-flex' : 'none';
    }
}

function clearFilters() {
    if (elements.userSearch) elements.userSearch.value = '';
    if (elements.tierFilter) elements.tierFilter.value = '';
    if (elements.statusFilter) elements.statusFilter.value = '';
    updateClearFiltersVisibility();
    adminState.usersPage = 1;
    loadUsers();
}

// ==================== Table Sorting ====================

function handleSortClick(th) {
    const column = th.dataset.sort;
    if (!column) return;

    // Toggle direction if same column, otherwise set to asc
    if (adminState.usersSortColumn === column) {
        adminState.usersSortDir = adminState.usersSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        adminState.usersSortColumn = column;
        adminState.usersSortDir = 'asc';
    }

    // Update header classes
    updateSortHeaders();

    // Sort and re-render
    sortUsers();
    renderUsersTable();
}

function updateSortHeaders() {
    document.querySelectorAll('.admin-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        if (th.dataset.sort === adminState.usersSortColumn) {
            th.classList.add(adminState.usersSortDir);
        }
    });
}

function sortUsers() {
    const column = adminState.usersSortColumn;
    const dir = adminState.usersSortDir;
    const multiplier = dir === 'asc' ? 1 : -1;

    adminState.users.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle null/undefined
        if (aVal == null) aVal = '';
        if (bVal == null) bVal = '';

        // Handle dates
        if (column === 'created_at') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }
        // Handle numbers
        else if (column === 'credits') {
            aVal = Number(aVal) || 0;
            bVal = Number(bVal) || 0;
        }
        // Handle strings
        else if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return -1 * multiplier;
        if (aVal > bVal) return 1 * multiplier;
        return 0;
    });
}

// ==================== Animated Numbers ====================

function animateValue(element, start, end, duration = 800) {
    if (!element || isNaN(end)) return;

    const startTime = performance.now();
    const isPrice = element.textContent.startsWith('$');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);

        element.textContent = isPrice ? `$${formatNumber(current)}` : formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==================== Last Updated Timestamp ====================

function updateLastUpdated(section) {
    adminState.lastUpdated[section] = new Date();
    updateLastUpdatedDisplay(section);
}

function updateLastUpdatedDisplay(section) {
    const element = elements[`${section}LastUpdated`];
    if (!element || !adminState.lastUpdated[section]) return;

    element.textContent = `Updated ${formatRelativeTime(adminState.lastUpdated[section])}`;
}

function formatRelativeTime(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return formatDate(date);
}

// Update timestamps every minute
setInterval(() => {
    Object.keys(adminState.lastUpdated).forEach(section => {
        if (adminState.lastUpdated[section]) {
            updateLastUpdatedDisplay(section);
        }
    });
}, 60000);

// ==================== Selection & Bulk Actions ====================

function toggleUserSelection(userId, isSelected) {
    if (isSelected) {
        adminState.selectedUsers.add(userId);
    } else {
        adminState.selectedUsers.delete(userId);
    }
    updateBulkActionsBar();

    // Update select all checkbox state
    const allCheckboxes = document.querySelectorAll('.user-checkbox');
    const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
    if (elements.selectAllUsers) {
        elements.selectAllUsers.checked = allChecked && allCheckboxes.length > 0;
    }
}

function updateBulkActionsBar() {
    const count = adminState.selectedUsers.size;
    if (elements.selectedCount) {
        elements.selectedCount.textContent = count;
    }
    if (elements.bulkActionsBar) {
        elements.bulkActionsBar.style.display = count > 0 ? 'flex' : 'none';
    }
}

function clearSelection() {
    adminState.selectedUsers.clear();
    document.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = false);
    if (elements.selectAllUsers) elements.selectAllUsers.checked = false;
    updateBulkActionsBar();
}

async function bulkSetTier(tierId) {
    const count = adminState.selectedUsers.size;
    if (count === 0) return;

    const confirmed = await SharedUI.confirm(`Set ${count} user(s) to ${tierId} tier?`, {
        title: 'Bulk Update Tier',
        confirmText: 'Update All',
        icon: 'warning'
    });
    if (!confirmed) return;

    // Add loading state to bulk action buttons
    const bulkButtons = document.querySelectorAll('.bulk-actions .btn');
    bulkButtons.forEach(btn => btn.classList.add('loading'));

    try {
        showToast('info', 'Processing...', `Updating ${count} users`);

        const promises = Array.from(adminState.selectedUsers).map(userId =>
            ngSupabase.client.rpc('admin_update_user', {
                p_user_id: userId,
                p_tier_id: tierId
            })
        );

        await Promise.all(promises);

        showToast('success', 'Updated', `${count} users set to ${tierId}`);
        clearSelection();
        loadUsers();
        loadDashboardData();
    } catch (err) {
        console.error('Bulk tier update failed:', err);
        showToast('error', 'Error', 'Some updates may have failed');
    } finally {
        bulkButtons.forEach(btn => btn.classList.remove('loading'));
    }
}

async function bulkAddCredits() {
    const count = adminState.selectedUsers.size;
    if (count === 0) return;

    const amount = prompt(`Add credits to ${count} users.\nEnter amount:`);
    if (!amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) return;

    const credits = parseInt(amount);
    const bulkConfirmed = await SharedUI.confirm(`Add ${credits} credits to ${count} user(s)?`, {
        title: 'Bulk Add Credits',
        confirmText: 'Add Credits',
        confirmClass: 'btn-primary',
        icon: 'info'
    });
    if (!bulkConfirmed) return;

    // Add loading state to bulk action buttons
    const bulkButtons = document.querySelectorAll('.bulk-actions .btn');
    bulkButtons.forEach(btn => btn.classList.add('loading'));

    try {
        showToast('info', 'Processing...', `Adding credits to ${count} users`);

        const promises = Array.from(adminState.selectedUsers).map(userId =>
            ngSupabase.client.rpc('admin_update_user', {
                p_user_id: userId,
                p_credit_amount: credits
            })
        );

        await Promise.all(promises);

        showToast('success', 'Updated', `Added ${credits} credits to ${count} users`);
        clearSelection();
        loadUsers();
    } catch (err) {
        console.error('Bulk credits update failed:', err);
        showToast('error', 'Error', 'Some updates may have failed');
    } finally {
        bulkButtons.forEach(btn => btn.classList.remove('loading'));
    }
}

// ==================== Pagination Info ====================

function updatePaginationInfo(container, page, total, perPage) {
    if (!container) return;

    if (total === 0) {
        container.textContent = '';
        return;
    }

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    container.textContent = `Showing ${start}-${end} of ${total}`;
}

// ==================== Items Per Page ====================

function changeItemsPerPage(value) {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || !ITEMS_PER_PAGE_OPTIONS.includes(newValue)) return;

    adminState.itemsPerPage = newValue;

    // Update all select dropdowns to match
    document.querySelectorAll('.items-per-page-select').forEach(select => {
        select.value = newValue.toString();
    });

    // Reset to page 1 and reload data
    adminState.usersPage = 1;
    adminState.auditPage = 1;

    // Reload the current section
    loadUsers();
    loadAuditLogs();
}

// ==================== Copy Email ====================

async function copyEmail(email, button) {
    if (!email) return;

    try {
        await navigator.clipboard.writeText(email);

        // Visual feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('copied');
        }, 1500);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// ==================== Refresh Section ====================

async function refreshSection(sectionId) {
    const btn = document.querySelector(`#section-${sectionId} .btn-icon`);
    if (btn) {
        btn.classList.add('spinning');
    }

    try {
        switch (sectionId) {
            case 'users':
                await loadUsers();
                break;
            case 'subscriptions':
                await loadSubscriptions();
                break;
            case 'usage':
                // Destroy existing charts and reload
                if (adminState.charts.usage) {
                    adminState.charts.usage.destroy();
                    adminState.charts.usage = null;
                }
                if (adminState.charts.studios) {
                    adminState.charts.studios.destroy();
                    adminState.charts.studios = null;
                }
                if (adminState.charts.models) {
                    adminState.charts.models.destroy();
                    adminState.charts.models = null;
                }
                await loadUsageData();
                break;
            case 'audit':
                await loadAuditLogs();
                break;
            case 'overview':
                await loadDashboardData();
                break;
        }
        showToast('success', 'Refreshed', `${capitalizeFirst(sectionId)} data updated`);
    } catch (err) {
        console.error('Refresh failed:', err);
        showToast('error', 'Refresh Failed', err.message);
    } finally {
        if (btn) {
            btn.classList.remove('spinning');
        }
    }
}

// Make functions available globally
window.showSection = showSection;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.changeTier = changeTier;
window.addCreditsToUser = addCreditsToUser;
window.toggleUserSelection = toggleUserSelection;
window.clearSelection = clearSelection;
window.bulkSetTier = bulkSetTier;
window.bulkAddCredits = bulkAddCredits;
window.copyEmail = copyEmail;
window.refreshSection = refreshSection;
window.clearFilters = clearFilters;
// CMS functions
window.saveHomepageSection = saveHomepageSection;
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;
window.saveGalleryItem = saveGalleryItem;
window.editGalleryItem = editGalleryItem;
window.deleteGalleryItem = deleteGalleryItem;
window.toggleGalleryActive = toggleGalleryActive;
window.moveGalleryItem = moveGalleryItem;
window.openFAQModal = openFAQModal;
window.closeFAQModal = closeFAQModal;
window.saveFAQItem = saveFAQItem;
window.editFAQItem = editFAQItem;
window.deleteFAQItem = deleteFAQItem;
window.toggleFAQActive = toggleFAQActive;
window.openJSONEditor = openJSONEditor;
window.closeJSONEditor = closeJSONEditor;
window.saveJSONContent = saveJSONContent;
