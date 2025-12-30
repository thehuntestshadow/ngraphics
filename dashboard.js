// ============================================
// DASHBOARD - NGRAPHICS
// ============================================

const state = {
    activeTab: 'overview',
    data: null,
    metrics: null,
    charts: {
        trends: null,
        models: null,
        studios: null,
        costTrend: null
    }
};

const elements = {};

// ============================================
// INITIALIZATION
// ============================================

function initElements() {
    elements.totalGenerations = document.getElementById('totalGenerations');
    elements.totalFavorites = document.getElementById('totalFavorites');
    elements.storageUsed = document.getElementById('storageUsed');
    elements.apiStatus = document.getElementById('apiStatus');
    elements.apiStatusText = document.getElementById('apiStatusText');

    elements.tabs = document.getElementById('dashboardTabs');
    elements.trendsChart = document.getElementById('trendsChart');
    elements.modelChart = document.getElementById('modelChart');
    elements.studioChart = document.getElementById('studioChart');
    elements.quickAccessGrid = document.getElementById('quickAccessGrid');

    elements.storageInfographics = document.getElementById('storageInfographics');
    elements.storageModels = document.getElementById('storageModels');
    elements.storageBundles = document.getElementById('storageBundles');
    elements.storageFillInfographics = document.getElementById('storageFillInfographics');
    elements.storageFillModels = document.getElementById('storageFillModels');
    elements.storageFillBundles = document.getElementById('storageFillBundles');

    elements.exportAllBtn = document.getElementById('exportAllBtn');
    elements.clearOldBtn = document.getElementById('clearOldBtn');
    elements.activityBody = document.getElementById('activityBody');

    elements.lightbox = document.getElementById('lightbox');
    elements.lightboxImage = document.getElementById('lightboxImage');
    elements.lightboxClose = document.getElementById('lightboxClose');

    // Trash elements
    elements.trashSection = document.getElementById('trashSection');
    elements.trashCount = document.getElementById('trashCount');
    elements.trashContent = document.getElementById('trashContent');
    elements.emptyTrashBtn = document.getElementById('emptyTrashBtn');

    // Cost tracker elements
    elements.todayCost = document.getElementById('todayCost');
    elements.todayGenerations = document.getElementById('todayGenerations');
    elements.alltimeCost = document.getElementById('alltimeCost');
    elements.alltimeGenerations = document.getElementById('alltimeGenerations');
    elements.costBreakdownList = document.getElementById('costBreakdownList');
    elements.costTrendChart = document.getElementById('costTrendChart');
    elements.resetCostBtn = document.getElementById('resetCostBtn');
}

async function init() {
    // Render shared header
    SharedHeader.render({
        currentPage: 'dashboard',
        showApiStatus: false
    });

    initElements();
    SharedTheme.init();

    // Load data
    await loadData();

    // Render UI
    renderCards();
    renderStoragePanel();
    renderQuickAccess();
    renderActivityTable();
    renderTrash();
    renderCostTracker();

    // Init charts
    initCharts();
    initCostTrendChart();

    // Setup event listeners
    setupEventListeners();
}

// ============================================
// DATA LOADING
// ============================================

async function loadData() {
    state.data = SharedDashboard.loadAllData();
    state.metrics = SharedDashboard.getMetrics(state.data);
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderCards() {
    if (!state.metrics) return;

    const filteredData = getFilteredData();
    const filteredMetrics = SharedDashboard.getMetrics(filteredData);

    elements.totalGenerations.textContent = filteredMetrics.totalGenerations;
    elements.totalFavorites.textContent = filteredMetrics.totalFavorites;

    // API status
    if (state.metrics.apiConnected) {
        elements.apiStatus.className = 'card-status connected';
        elements.apiStatusText.textContent = 'Connected';
    } else {
        elements.apiStatus.className = 'card-status disconnected';
        elements.apiStatusText.textContent = 'Not Connected';
    }

    // Storage (async)
    SharedDashboard.getStorageEstimate().then(storage => {
        elements.storageUsed.textContent = storage.formatted;
    });
}

function renderStoragePanel() {
    if (!state.metrics) return;

    const { perStudio } = state.metrics;
    const maxItems = 20; // Max history items per studio

    // Infographics
    const infographicsCount = perStudio.infographics?.history || 0;
    elements.storageInfographics.textContent = `${infographicsCount} items`;
    elements.storageFillInfographics.style.width = `${(infographicsCount / maxItems) * 100}%`;

    // Models
    const modelsCount = perStudio.modelStudio?.history || 0;
    elements.storageModels.textContent = `${modelsCount} items`;
    elements.storageFillModels.style.width = `${(modelsCount / maxItems) * 100}%`;

    // Bundles
    const bundlesCount = perStudio.bundleStudio?.history || 0;
    elements.storageBundles.textContent = `${bundlesCount} items`;
    elements.storageFillBundles.style.width = `${(bundlesCount / maxItems) * 100}%`;
}

function renderQuickAccess() {
    const filteredData = getFilteredData();
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

        // Only show badge in overview mode
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
            if (url) {
                openLightbox(url);
            }
        });
    });
}

function renderCostTracker() {
    // Today's cost (session)
    const session = SharedCostEstimator.getSessionSummary();
    elements.todayCost.textContent = session.formatted;
    elements.todayGenerations.textContent = `${session.generations} gen`;

    // All-time cost
    const allTime = SharedCostEstimator.getAllTimeCost();
    elements.alltimeCost.textContent = allTime.formatted;
    elements.alltimeGenerations.textContent = `${allTime.totalGenerations} gen`;

    // Studio breakdown
    const breakdown = SharedCostEstimator.getStudioBreakdown();
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

function initCostTrendChart() {
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
                x: {
                    grid: { display: false }
                },
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

    // Clear cost data
    SharedCostEstimator.resetSession();
    SharedCostEstimator.saveSession();
    localStorage.removeItem(SharedCostEstimator.HISTORY_KEY);

    // Re-render
    renderCostTracker();

    // Update chart
    if (state.charts.costTrend) {
        const trends = SharedCostEstimator.getCostTrends(7);
        state.charts.costTrend.data.labels = trends.map(t => t.date);
        state.charts.costTrend.data.datasets[0].data = trends.map(t => t.cost);
        state.charts.costTrend.update();
    }

    SharedUI.toast('Cost data reset', 'success');
}

function renderTrash() {
    const trashItems = SharedTrash.getAll();
    const count = trashItems.length;

    // Update count badge
    elements.trashCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;

    // Enable/disable empty button
    elements.emptyTrashBtn.disabled = count === 0;

    // Render content
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
                            ${thumbnail ? `<img src="${thumbnail}" alt="${escapeHtml(title)}" onclick="openLightbox('${thumbnail}')">` : ''}
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

    // Add click handlers for restore/delete buttons
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

    // Get the storage key for the page
    const storageKeys = {
        infographics: 'infographics_history',
        modelStudio: 'model_studio_history',
        bundleStudio: 'bundle_studio_history'
    };

    const storageKey = storageKeys[restored.page];
    if (storageKey) {
        // Add back to history
        const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
        history.unshift(restored.originalItem);
        localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 20)));
    }

    SharedUI.toast('Item restored to history', 'success');

    // Refresh dashboard
    await loadData();
    renderCards();
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
    const filteredData = getFilteredData();
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
                    ${thumbnail ? `<img class="activity-thumbnail" src="${thumbnail}" alt="Preview" onclick="openLightbox('${thumbnail}')">` : '-'}
                </td>
                <td>${escapeHtml(title)}</td>
                <td><span class="activity-studio ${studioClass}">${item.studioLabel}</span></td>
                <td>${SharedDashboard._formatModelName(model)}</td>
                <td class="activity-seed">${seed}</td>
                <td class="activity-time">${time}</td>
                <td class="activity-actions">
                    ${thumbnail ? `
                        <button class="activity-btn" title="View" onclick="openLightbox('${thumbnail}')">
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

// ============================================
// CHARTS
// ============================================

function initCharts() {
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
    const trends = SharedDashboard.getGenerationTrends(state.data, 7);
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function initModelChart() {
    const modelData = SharedDashboard.getModelUsage(state.data);
    const ctx = elements.modelChart.getContext('2d');

    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    if (modelData.length === 0) {
        // Show empty state
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
                legend: {
                    position: 'right',
                    labels: { boxWidth: 12, padding: 8 }
                }
            },
            cutout: '60%'
        }
    });
}

function initStudioChart() {
    const studioData = SharedDashboard.getStudioBreakdown(state.data);
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Tab switching
    elements.tabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        }
    });

    // Export all
    elements.exportAllBtn.addEventListener('click', exportAllData);

    // Clear old items
    elements.clearOldBtn.addEventListener('click', clearOldItems);

    // Empty trash
    elements.emptyTrashBtn.addEventListener('click', emptyTrash);

    // Reset cost data
    elements.resetCostBtn.addEventListener('click', resetCostData);

    // Lightbox
    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightbox.addEventListener('click', (e) => {
        if (e.target === elements.lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // Window resize - debounced chart resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCharts();
        }, 150);
    });
}

function resizeCharts() {
    if (state.charts.trends) {
        state.charts.trends.resize();
    }
    if (state.charts.models) {
        state.charts.models.resize();
    }
    if (state.charts.studios) {
        state.charts.studios.resize();
    }
    if (state.charts.costTrend) {
        state.charts.costTrend.resize();
    }
}

function switchTab(tab) {
    state.activeTab = tab;

    // Update tab buttons
    elements.tabs.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Re-render filtered content
    renderCards();
    renderQuickAccess();
    renderActivityTable();
    updateChartsForTab();
}

// Get studio key from tab name
function getStudioKeyFromTab(tab) {
    const tabToStudio = {
        'infographics': 'infographics',
        'models': 'modelStudio',
        'bundles': 'bundleStudio'
    };
    return tabToStudio[tab] || null;
}

// Filter data based on active tab
function getFilteredData() {
    if (state.activeTab === 'overview') {
        return state.data;
    }

    const studioKey = getStudioKeyFromTab(state.activeTab);
    if (!studioKey) return state.data;

    // Return only the selected studio's data
    return {
        [studioKey]: state.data[studioKey]
    };
}

// Update charts based on active tab
function updateChartsForTab() {
    const filteredData = getFilteredData();

    // Update trends chart
    if (state.charts.trends) {
        const trends = SharedDashboard.getGenerationTrends(filteredData, 7);
        state.charts.trends.data.labels = trends.map(t => t.date);
        state.charts.trends.data.datasets[0].data = trends.map(t => t.count);

        // Update color based on tab
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

    // Update model chart
    if (state.charts.models) {
        const modelData = SharedDashboard.getModelUsage(filteredData);
        const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        state.charts.models.data.labels = modelData.map(m => m.model);
        state.charts.models.data.datasets[0].data = modelData.map(m => m.count);
        state.charts.models.data.datasets[0].backgroundColor = colors.slice(0, modelData.length);
        state.charts.models.update();
    }

    // Update studio chart (only visible in overview)
    if (state.charts.studios) {
        if (state.activeTab === 'overview') {
            const studioData = SharedDashboard.getStudioBreakdown(state.data);
            state.charts.studios.data.datasets[0].data = studioData.map(s => s.count);
            state.charts.studios.update();
        }
    }
}

async function exportAllData() {
    const allData = {
        exported: new Date().toISOString(),
        ...state.data
    };

    // Create a simple JSON download
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
    const days = 30; // Clear items older than 30 days

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

    // Reload data
    await loadData();
    renderCards();
    renderStoragePanel();
    renderQuickAccess();
    renderActivityTable();

    // Update charts
    if (state.charts.trends) {
        const trends = SharedDashboard.getGenerationTrends(state.data, 7);
        state.charts.trends.data.labels = trends.map(t => t.date);
        state.charts.trends.data.datasets[0].data = trends.map(t => t.count);
        state.charts.trends.update();
    }

    if (state.charts.studios) {
        const studioData = SharedDashboard.getStudioBreakdown(state.data);
        state.charts.studios.data.datasets[0].data = studioData.map(s => s.count);
        state.charts.studios.update();
    }

    SharedUI.toast(`Removed ${totalRemoved} old items`, 'success');
}

// ============================================
// LIGHTBOX
// ============================================

function openLightbox(url) {
    elements.lightboxImage.src = url;
    elements.lightbox.classList.add('visible');
}

function closeLightbox() {
    elements.lightbox.classList.remove('visible');
    elements.lightboxImage.src = '';
}

// Make globally accessible for inline handlers
window.openLightbox = openLightbox;

// ============================================
// UTILITIES
// ============================================

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

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// START
// ============================================

document.addEventListener('DOMContentLoaded', init);
