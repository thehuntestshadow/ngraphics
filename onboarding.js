/**
 * HEFAISTOS - Onboarding Tour
 * First-time user guidance system
 */

const ONBOARDING_KEY = 'ngraphics_onboarding';

const OnboardingTour = {
    // Storage keys
    keys: {
        landingComplete: 'landing_tour_complete',
        studioComplete: 'studio_tour_complete',
        dismissedAt: 'dismissed_at'
    },

    // Tour configurations
    tours: {
        landing: [
            {
                target: '.studio-grid',
                title: 'Choose Your Studio',
                description: 'Pick from 20+ AI-powered tools designed for e-commerce. Each studio specializes in a different type of content.',
                position: 'bottom'
            },
            {
                target: '.hero-cta',
                title: 'Get Started',
                description: 'Click here to jump into your first studio and create something amazing.',
                position: 'bottom',
                highlight: true
            }
        ],
        studio: [
            {
                target: '.upload-zone, .upload-area',
                title: '1. Upload Your Product',
                description: 'Drag and drop your product image here, or click to browse. Most studios work best with clear product photos.',
                position: 'right'
            },
            {
                target: '.panel-config, .config-form',
                title: '2. Configure Settings',
                description: 'Customize the output using these options. Start with the basics - you can explore advanced settings later.',
                position: 'left'
            },
            {
                target: '.btn-generate',
                title: '3. Generate',
                description: 'Click Generate (or press Ctrl+Enter) to create your image. Generation typically takes 10-30 seconds.',
                position: 'top',
                highlight: true
            },
            {
                target: '.panel-output, .result-panel',
                title: '4. Download & Save',
                description: 'Your creation appears here. Download it, save to favorites, or adjust settings and regenerate.',
                position: 'left'
            }
        ]
    },

    // State
    currentTour: null,
    currentStep: 0,
    overlayEl: null,
    tooltipEl: null,

    /**
     * Initialize onboarding - check if should show
     * @param {string} tourName - 'landing' or 'studio'
     * @returns {boolean} Whether tour was started
     */
    init(tourName = 'landing') {
        const state = this._loadState();

        // Check if this tour was completed
        const completeKey = tourName === 'landing' ? this.keys.landingComplete : this.keys.studioComplete;
        if (state[completeKey]) {
            return false;
        }

        // Check if dismissed recently (within 24 hours)
        if (state[this.keys.dismissedAt]) {
            const dismissedAt = new Date(state[this.keys.dismissedAt]);
            const hoursSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60);
            if (hoursSinceDismiss < 24) {
                return false;
            }
        }

        // Auto-start after brief delay
        setTimeout(() => this.start(tourName), 1500);
        return true;
    },

    /**
     * Start a specific tour
     * @param {string} tourName - Tour to start
     */
    start(tourName) {
        const tour = this.tours[tourName];
        if (!tour) return;

        this.currentTour = tourName;
        this.currentStep = 0;

        this._createOverlay();
        this._showStep(0);

        // Emit event
        if (typeof events !== 'undefined') {
            events.emit('onboarding:started', { tour: tourName });
        }
    },

    /**
     * Show specific step
     * @param {number} index - Step index
     */
    _showStep(index) {
        const tour = this.tours[this.currentTour];
        if (!tour || index >= tour.length) {
            this._complete();
            return;
        }

        const step = tour[index];

        // Find target element (supports comma-separated selectors)
        const selectors = step.target.split(',').map(s => s.trim());
        let targetEl = null;
        for (const selector of selectors) {
            targetEl = document.querySelector(selector);
            if (targetEl) break;
        }

        if (!targetEl) {
            // Skip to next if target not found
            this._showStep(index + 1);
            return;
        }

        this.currentStep = index;
        this._updateHighlight(targetEl);
        this._showTooltip(step, targetEl, index, tour.length);
    },

    /**
     * Create overlay element
     */
    _createOverlay() {
        if (this.overlayEl) return;

        this.overlayEl = document.createElement('div');
        this.overlayEl.className = 'onboarding-overlay';
        this.overlayEl.innerHTML = `
            <div class="onboarding-backdrop"></div>
            <div class="onboarding-highlight"></div>
        `;
        document.body.appendChild(this.overlayEl);

        // Click backdrop to dismiss
        this.overlayEl.querySelector('.onboarding-backdrop').addEventListener('click', () => {
            this._dismiss();
        });

        // ESC key to dismiss
        this._escHandler = (e) => {
            if (e.key === 'Escape') this._dismiss();
        };
        document.addEventListener('keydown', this._escHandler);

        // Animate in
        requestAnimationFrame(() => {
            this.overlayEl.classList.add('visible');
        });
    },

    /**
     * Update highlight position
     * @param {HTMLElement} targetEl - Element to highlight
     */
    _updateHighlight(targetEl) {
        const highlightEl = this.overlayEl.querySelector('.onboarding-highlight');
        const rect = targetEl.getBoundingClientRect();
        const padding = 8;

        highlightEl.style.top = `${rect.top - padding + window.scrollY}px`;
        highlightEl.style.left = `${rect.left - padding}px`;
        highlightEl.style.width = `${rect.width + padding * 2}px`;
        highlightEl.style.height = `${rect.height + padding * 2}px`;

        // Scroll into view if needed
        const viewportHeight = window.innerHeight;
        if (rect.top < 100 || rect.bottom > viewportHeight - 100) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    /**
     * Show tooltip for current step
     * @param {Object} step - Step configuration
     * @param {HTMLElement} targetEl - Target element
     * @param {number} index - Current step index
     * @param {number} total - Total steps
     */
    _showTooltip(step, targetEl, index, total) {
        if (this.tooltipEl) {
            this.tooltipEl.remove();
        }

        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = `onboarding-tooltip position-${step.position}`;
        this.tooltipEl.innerHTML = `
            <div class="onboarding-tooltip-content">
                <div class="onboarding-tooltip-header">
                    <h4>${step.title}</h4>
                    <button class="onboarding-close" title="Skip tour" aria-label="Skip tour">&times;</button>
                </div>
                <p>${step.description}</p>
                <div class="onboarding-footer">
                    <div class="onboarding-progress">
                        ${Array.from({ length: total }, (_, i) =>
        `<span class="progress-dot ${i === index ? 'active' : ''} ${i < index ? 'complete' : ''}"></span>`
    ).join('')}
                    </div>
                    <div class="onboarding-actions">
                        ${index > 0 ? '<button class="btn-text onboarding-prev">Back</button>' : ''}
                        ${index < total - 1
        ? '<button class="btn-primary onboarding-next">Next</button>'
        : '<button class="btn-primary onboarding-finish">Get Started</button>'
}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.tooltipEl);
        this._positionTooltip(targetEl, step.position);

        // Event handlers
        this.tooltipEl.querySelector('.onboarding-close').addEventListener('click', () => this._dismiss());

        const prevBtn = this.tooltipEl.querySelector('.onboarding-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this._showStep(index - 1));
        }

        const nextBtn = this.tooltipEl.querySelector('.onboarding-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this._showStep(index + 1));
        }

        const finishBtn = this.tooltipEl.querySelector('.onboarding-finish');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => this._complete());
        }

        // Animate in
        requestAnimationFrame(() => {
            this.tooltipEl.classList.add('visible');
        });
    },

    /**
     * Position tooltip relative to target
     * @param {HTMLElement} targetEl - Target element
     * @param {string} position - Position preference
     */
    _positionTooltip(targetEl, position) {
        const rect = targetEl.getBoundingClientRect();
        const tooltip = this.tooltipEl;
        const gap = 16;

        // Get tooltip dimensions after render
        requestAnimationFrame(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            let top, left;

            switch (position) {
                case 'top':
                    top = rect.top - tooltipRect.height - gap + window.scrollY;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = rect.bottom + gap + window.scrollY;
                    left = rect.left + (rect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = rect.top + (rect.height - tooltipRect.height) / 2 + window.scrollY;
                    left = rect.left - tooltipRect.width - gap;
                    break;
                case 'right':
                    top = rect.top + (rect.height - tooltipRect.height) / 2 + window.scrollY;
                    left = rect.right + gap;
                    break;
                default:
                    top = rect.bottom + gap + window.scrollY;
                    left = rect.left;
            }

            // Keep within viewport
            const maxTop = window.scrollY + window.innerHeight - tooltipRect.height - 16;
            const maxLeft = window.innerWidth - tooltipRect.width - 16;

            top = Math.max(window.scrollY + 16, Math.min(top, maxTop));
            left = Math.max(16, Math.min(left, maxLeft));

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        });
    },

    /**
     * Complete the tour
     */
    _complete() {
        const state = this._loadState();
        const completeKey = this.currentTour === 'landing'
            ? this.keys.landingComplete
            : this.keys.studioComplete;
        state[completeKey] = true;
        this._saveState(state);

        this._cleanup();

        // Show success toast
        if (typeof SharedUI !== 'undefined') {
            SharedUI.toast('Tour complete! You\'re ready to create.', 'success');
        }

        // Emit event
        if (typeof events !== 'undefined') {
            events.emit('onboarding:completed', { tour: this.currentTour });
        }
    },

    /**
     * Dismiss tour (can show again later)
     */
    _dismiss() {
        const state = this._loadState();
        state[this.keys.dismissedAt] = new Date().toISOString();
        this._saveState(state);

        this._cleanup();

        if (typeof SharedUI !== 'undefined') {
            SharedUI.toast('Tour skipped. Press ? for help anytime.', 'info');
        }
    },

    /**
     * Clean up DOM elements
     */
    _cleanup() {
        if (this.overlayEl) {
            this.overlayEl.classList.remove('visible');
            setTimeout(() => {
                if (this.overlayEl) {
                    this.overlayEl.remove();
                    this.overlayEl = null;
                }
            }, 300);
        }
        if (this.tooltipEl) {
            this.tooltipEl.remove();
            this.tooltipEl = null;
        }
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
        this.currentTour = null;
        this.currentStep = 0;
    },

    /**
     * Reset tour (for testing or manual restart)
     */
    reset() {
        localStorage.removeItem(ONBOARDING_KEY);
    },

    /**
     * Force show tour
     * @param {string} tourName - Tour to show
     */
    show(tourName) {
        this.reset();
        this.start(tourName);
    },

    // Storage helpers
    _loadState() {
        try {
            return JSON.parse(localStorage.getItem(ONBOARDING_KEY)) || {};
        } catch {
            return {};
        }
    },

    _saveState(state) {
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
    }
};

// Export globally
window.OnboardingTour = OnboardingTour;
