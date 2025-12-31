/**
 * NGRAPHICS Admin Panel
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
    charts: {}
};

const ITEMS_PER_PAGE = 20;

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
        subscriptionsTableBody: document.getElementById('subscriptionsTableBody'),
        auditTableBody: document.getElementById('auditTableBody'),
        auditPagination: document.getElementById('auditPagination'),
        // Filters
        userSearch: document.getElementById('userSearch'),
        tierFilter: document.getElementById('tierFilter'),
        statusFilter: document.getElementById('statusFilter'),
        exportUsersBtn: document.getElementById('exportUsersBtn'),
        // Modal
        userModal: document.getElementById('userModal'),
        userModalBody: document.getElementById('userModalBody'),
        // Buttons
        logoutBtn: document.getElementById('logoutBtn')
    };

    setupEventListeners();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
        btn.addEventListener('click', () => showSection(btn.dataset.section));
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
    });

    // Filters
    elements.tierFilter?.addEventListener('change', () => {
        adminState.usersPage = 1;
        loadUsers();
    });

    elements.statusFilter?.addEventListener('change', () => {
        adminState.usersPage = 1;
        loadUsers();
    });

    // Export
    elements.exportUsersBtn?.addEventListener('click', exportUsersCSV);

    // Modal close
    elements.userModal?.addEventListener('click', (e) => {
        if (e.target === elements.userModal) closeUserModal();
    });

    // Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeUserModal();
    });
}

async function checkAdminAccess() {
    try {
        // Wait for Supabase to initialize
        await new Promise(resolve => {
            if (window.ngSupabase?.isAuthenticated !== undefined) {
                resolve();
            } else {
                const check = setInterval(() => {
                    if (window.ngSupabase?.isAuthenticated !== undefined) {
                        clearInterval(check);
                        resolve();
                    }
                }, 100);
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(check);
                    resolve();
                }, 5000);
            }
        });

        if (!window.ngSupabase?.isAuthenticated) {
            console.log('Not authenticated, redirecting...');
            window.location.href = 'index.html';
            return;
        }

        // Check if user is admin
        const { data: profile, error } = await ngSupabase.client
            .from('profiles')
            .select('is_admin')
            .eq('id', ngSupabase.user.id)
            .single();

        if (error || !profile?.is_admin) {
            console.log('Not an admin, redirecting...');
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
    }
}

// Dashboard Data
async function loadDashboardData() {
    try {
        // Load stats
        const { data: stats, error: statsError } = await ngSupabase.client
            .from('admin_stats')
            .select('*')
            .single();

        if (!statsError && stats) {
            adminState.stats = stats;
            updateStatsDisplay(stats);
        }

        // Load recent users
        await loadRecentUsers();

        // Initialize charts
        initCharts();

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
}

function updateStatsDisplay(stats) {
    if (elements.statUsers) elements.statUsers.textContent = formatNumber(stats.total_users);
    if (elements.statActiveSubs) elements.statActiveSubs.textContent = formatNumber(stats.active_subscriptions);
    if (elements.statMRR) elements.statMRR.textContent = `$${formatNumber(stats.mrr_dollars)}`;
    if (elements.statGenerations) elements.statGenerations.textContent = '-'; // Would need usage tracking
    if (elements.statProSubs) elements.statProSubs.textContent = formatNumber(stats.pro_subscribers);
    if (elements.statBusinessSubs) elements.statBusinessSubs.textContent = formatNumber(stats.business_subscribers);
    if (elements.statProMRR) elements.statProMRR.textContent = `$${formatNumber(stats.pro_subscribers * 19)}`;
    if (elements.statBusinessMRR) elements.statBusinessMRR.textContent = `$${formatNumber(stats.business_subscribers * 49)}`;
}

async function loadRecentUsers() {
    try {
        const { data: users, error } = await ngSupabase.client
            .from('profiles')
            .select(`
                *,
                subscriptions(tier_id, status)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        elements.recentUsersBody.innerHTML = users.length === 0
            ? '<tr><td colspan="5" class="loading-cell">No users yet</td></tr>'
            : users.map(user => `
                <tr>
                    <td>${escapeHtml(user.email || 'N/A')}</td>
                    <td><span class="tier-badge ${user.subscriptions?.[0]?.tier_id || 'free'}">${user.subscriptions?.[0]?.tier_id || 'Free'}</span></td>
                    <td><span class="status-badge ${user.subscriptions?.[0]?.status || 'active'}">${user.subscriptions?.[0]?.status || 'Active'}</span></td>
                    <td>${formatDate(user.created_at)}</td>
                    <td><button class="action-btn secondary" onclick="openUserModal('${user.id}')">View</button></td>
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

        const offset = (adminState.usersPage - 1) * ITEMS_PER_PAGE;

        let query = ngSupabase.client
            .from('profiles')
            .select(`
                *,
                subscriptions(tier_id, status, stripe_subscription_id, current_period_end),
                credits(balance)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (search) {
            query = query.ilike('email', `%${search}%`);
        }

        const { data: users, error, count } = await query;

        if (error) throw error;

        // Filter by tier/status client-side (joins make server-side filtering complex)
        let filteredUsers = users;
        if (tierFilter) {
            filteredUsers = filteredUsers.filter(u =>
                (u.subscriptions?.[0]?.tier_id || 'free') === tierFilter
            );
        }
        if (statusFilter) {
            filteredUsers = filteredUsers.filter(u =>
                (u.subscriptions?.[0]?.status || 'active') === statusFilter
            );
        }

        adminState.users = filteredUsers;
        adminState.usersTotal = count || 0;

        renderUsersTable(filteredUsers);
        renderPagination(elements.usersPagination, adminState.usersPage, Math.ceil(count / ITEMS_PER_PAGE), (page) => {
            adminState.usersPage = page;
            loadUsers();
        });

    } catch (err) {
        console.error('Failed to load users:', err);
        elements.usersTableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Failed to load users</td></tr>';
    }
}

function renderUsersTable(users) {
    elements.usersTableBody.innerHTML = users.length === 0
        ? '<tr><td colspan="7" class="loading-cell">No users found</td></tr>'
        : users.map(user => `
            <tr>
                <td>${escapeHtml(user.email || 'N/A')}</td>
                <td>${escapeHtml(user.display_name || '-')}</td>
                <td><span class="tier-badge ${user.subscriptions?.[0]?.tier_id || 'free'}">${capitalizeFirst(user.subscriptions?.[0]?.tier_id || 'free')}</span></td>
                <td>${user.credits?.[0]?.balance ?? 0}</td>
                <td><span class="status-badge ${user.subscriptions?.[0]?.status || 'active'}">${capitalizeFirst(user.subscriptions?.[0]?.status || 'active')}</span></td>
                <td>${formatDate(user.created_at)}</td>
                <td><button class="action-btn secondary" onclick="openUserModal('${user.id}')">Manage</button></td>
            </tr>
        `).join('');
}

// Subscriptions
async function loadSubscriptions() {
    try {
        elements.subscriptionsTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';

        const { data: subs, error } = await ngSupabase.client
            .from('subscriptions')
            .select(`
                *,
                profiles(email)
            `)
            .eq('status', 'active')
            .in('tier_id', ['pro', 'business'])
            .order('created_at', { ascending: false });

        if (error) throw error;

        adminState.subscriptions = subs;

        elements.subscriptionsTableBody.innerHTML = subs.length === 0
            ? '<tr><td colspan="6" class="loading-cell">No active subscriptions</td></tr>'
            : subs.map(sub => `
                <tr>
                    <td>${escapeHtml(sub.profiles?.email || 'N/A')}</td>
                    <td><span class="tier-badge ${sub.tier_id}">${capitalizeFirst(sub.tier_id)}</span></td>
                    <td>${formatDate(sub.created_at)}</td>
                    <td>${sub.current_period_end ? formatDate(sub.current_period_end) : '-'}</td>
                    <td><code style="font-size:0.75rem">${sub.stripe_subscription_id || '-'}</code></td>
                    <td><button class="action-btn secondary" onclick="openUserModal('${sub.user_id}')">View User</button></td>
                </tr>
            `).join('');

    } catch (err) {
        console.error('Failed to load subscriptions:', err);
        elements.subscriptionsTableBody.innerHTML = '<tr><td colspan="6" class="loading-cell">Failed to load subscriptions</td></tr>';
    }
}

// Audit Logs
async function loadAuditLogs() {
    try {
        elements.auditTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';

        const offset = (adminState.auditPage - 1) * ITEMS_PER_PAGE;

        const { data: logs, error, count } = await ngSupabase.client
            .from('admin_audit_log')
            .select(`
                *,
                admin:admin_id(email),
                target:target_user_id(email)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (error) throw error;

        adminState.auditLogs = logs;
        adminState.auditTotal = count || 0;

        elements.auditTableBody.innerHTML = logs.length === 0
            ? '<tr><td colspan="5" class="loading-cell">No audit logs yet</td></tr>'
            : logs.map(log => `
                <tr>
                    <td>${formatDateTime(log.created_at)}</td>
                    <td>${escapeHtml(log.admin?.email || 'System')}</td>
                    <td><code>${escapeHtml(log.action)}</code></td>
                    <td>${escapeHtml(log.target?.email || '-')}</td>
                    <td><code style="font-size:0.75rem">${JSON.stringify(log.details || {})}</code></td>
                </tr>
            `).join('');

        renderPagination(elements.auditPagination, adminState.auditPage, Math.ceil(count / ITEMS_PER_PAGE), (page) => {
            adminState.auditPage = page;
            loadAuditLogs();
        });

    } catch (err) {
        console.error('Failed to load audit logs:', err);
        elements.auditTableBody.innerHTML = '<tr><td colspan="5" class="loading-cell">Failed to load audit logs</td></tr>';
    }
}

// Usage Analytics
async function loadUsageData() {
    // Usage data would require tracking table
    // For now, show placeholder
    if (adminState.charts.usage) return;

    const ctx = document.getElementById('usageChart')?.getContext('2d');
    if (!ctx) return;

    // Placeholder data
    const labels = [];
    const data = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push(Math.floor(Math.random() * 100) + 20);
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

    // Studios chart
    const studiosCtx = document.getElementById('studiosChart')?.getContext('2d');
    if (studiosCtx) {
        adminState.charts.studios = new Chart(studiosCtx, {
            type: 'doughnut',
            data: {
                labels: ['Infographics', 'Model Studio', 'Lifestyle', 'Bundle', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 12, 8],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
            }
        });
    }

    // Models chart
    const modelsCtx = document.getElementById('modelsChart')?.getContext('2d');
    if (modelsCtx) {
        adminState.charts.models = new Chart(modelsCtx, {
            type: 'bar',
            data: {
                labels: ['Gemini', 'GPT-4o', 'Flux', 'Recraft', 'Other'],
                datasets: [{
                    label: 'Usage',
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: '#6366f1'
                }]
            },
            options: getChartOptions()
        });
    }
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
        const { data: user, error } = await ngSupabase.client
            .from('profiles')
            .select(`
                *,
                subscriptions(*),
                credits(balance)
            `)
            .eq('id', userId)
            .single();

        if (error) throw error;

        const sub = user.subscriptions?.[0];
        const credits = user.credits?.[0]?.balance ?? 0;

        elements.userModalBody.innerHTML = `
            <div class="user-info-grid">
                <div class="info-item">
                    <label>Email</label>
                    <div class="value">${escapeHtml(user.email || 'N/A')}</div>
                </div>
                <div class="info-item">
                    <label>Display Name</label>
                    <div class="value">${escapeHtml(user.display_name || '-')}</div>
                </div>
                <div class="info-item">
                    <label>Subscription Tier</label>
                    <div class="value"><span class="tier-badge ${sub?.tier_id || 'free'}">${capitalizeFirst(sub?.tier_id || 'free')}</span></div>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <div class="value"><span class="status-badge ${sub?.status || 'active'}">${capitalizeFirst(sub?.status || 'active')}</span></div>
                </div>
                <div class="info-item">
                    <label>Credits</label>
                    <div class="value">${credits}</div>
                </div>
                <div class="info-item">
                    <label>Joined</label>
                    <div class="value">${formatDateTime(user.created_at)}</div>
                </div>
                ${sub?.stripe_subscription_id ? `
                <div class="info-item" style="grid-column: 1/-1">
                    <label>Stripe Subscription ID</label>
                    <div class="value"><code>${sub.stripe_subscription_id}</code></div>
                </div>
                ` : ''}
            </div>

            <div class="actions-section">
                <h3>Administrative Actions</h3>
                <div class="action-group">
                    <button class="action-btn primary" onclick="changeTier('${userId}', 'pro')">Set Pro</button>
                    <button class="action-btn primary" onclick="changeTier('${userId}', 'business')">Set Business</button>
                    <button class="action-btn secondary" onclick="changeTier('${userId}', 'free')">Set Free</button>
                </div>

                <h3 style="margin-top: 1rem">Add Credits</h3>
                <div class="credit-input-group">
                    <input type="number" id="creditAmount" placeholder="Amount" min="1" value="50">
                    <input type="text" id="creditReason" placeholder="Reason (optional)">
                    <button class="action-btn primary" onclick="addCreditsToUser('${userId}')">Add Credits</button>
                </div>
            </div>
        `;

        elements.userModal.classList.add('active');

    } catch (err) {
        console.error('Failed to load user:', err);
        alert('Failed to load user details');
    }
}

function closeUserModal() {
    elements.userModal?.classList.remove('active');
}

// Admin Actions
async function changeTier(userId, tierId) {
    if (!confirm(`Change user's subscription to ${tierId}?`)) return;

    try {
        const { error } = await ngSupabase.client
            .from('subscriptions')
            .update({ tier_id: tierId, status: 'active' })
            .eq('user_id', userId);

        if (error) throw error;

        await logAdminAction('change_tier', userId, { tier_id: tierId });

        alert(`User tier changed to ${tierId}`);
        closeUserModal();
        loadUsers();
        loadRecentUsers();
        loadDashboardData();

    } catch (err) {
        console.error('Failed to change tier:', err);
        alert('Failed to change tier: ' + err.message);
    }
}

async function addCreditsToUser(userId) {
    const amount = parseInt(document.getElementById('creditAmount')?.value) || 0;
    const reason = document.getElementById('creditReason')?.value || 'Admin credit adjustment';

    if (amount <= 0) {
        alert('Please enter a valid credit amount');
        return;
    }

    if (!confirm(`Add ${amount} credits to this user?`)) return;

    try {
        const { error } = await ngSupabase.client.rpc('admin_add_credits', {
            p_user_id: userId,
            p_amount: amount,
            p_description: reason
        });

        if (error) throw error;

        await logAdminAction('add_credits', userId, { amount, reason });

        alert(`Added ${amount} credits to user`);
        openUserModal(userId); // Refresh modal

    } catch (err) {
        console.error('Failed to add credits:', err);
        alert('Failed to add credits: ' + err.message);
    }
}

async function logAdminAction(action, targetUserId, details = {}) {
    try {
        await ngSupabase.client.from('admin_audit_log').insert({
            admin_id: ngSupabase.user.id,
            action,
            target_user_id: targetUserId,
            details
        });
    } catch (err) {
        console.error('Failed to log admin action:', err);
    }
}

// Export
async function exportUsersCSV() {
    try {
        const { data: users, error } = await ngSupabase.client
            .from('profiles')
            .select(`
                *,
                subscriptions(tier_id, status),
                credits(balance)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const headers = ['Email', 'Display Name', 'Tier', 'Status', 'Credits', 'Joined'];
        const rows = users.map(u => [
            u.email || '',
            u.display_name || '',
            u.subscriptions?.[0]?.tier_id || 'free',
            u.subscriptions?.[0]?.status || 'active',
            u.credits?.[0]?.balance ?? 0,
            new Date(u.created_at).toISOString()
        ]);

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ngraphics-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Failed to export users:', err);
        alert('Failed to export users');
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
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="arguments[0].stopPropagation()">Prev</button>`;

    // Page numbers
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    if (start > 1) {
        html += `<button onclick="arguments[0].stopPropagation()">1</button>`;
        if (start > 2) html += '<span>...</span>';
    }

    for (let i = start; i <= end; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="arguments[0].stopPropagation()">${i}</button>`;
    }

    if (end < totalPages) {
        if (end < totalPages - 1) html += '<span>...</span>';
        html += `<button onclick="arguments[0].stopPropagation()">${totalPages}</button>`;
    }

    // Next
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="arguments[0].stopPropagation()">Next</button>`;

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

// Make functions available globally
window.showSection = showSection;
window.openUserModal = openUserModal;
window.closeUserModal = closeUserModal;
window.changeTier = changeTier;
window.addCreditsToUser = addCreditsToUser;
