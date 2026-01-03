/**
 * HEFAISTOS - Authentication UI
 * Login/signup modal and account management
 *
 * Usage:
 *   authUI.show('login');   // Show login modal
 *   authUI.show('signup');  // Show signup modal
 *   new AccountMenu(document.getElementById('accountContainer'));
 */

// ============================================
// AUTH MODAL
// ============================================

class AuthUI {
    constructor() {
        this._modal = null;
        this._isOpen = false;
        this._currentMode = 'login';
        this._escHandler = null;
    }

    /**
     * Show auth modal
     * @param {string} mode - 'login' | 'signup'
     */
    show(mode = 'login') {
        this._currentMode = mode;

        if (this._modal) {
            this._modal.remove();
        }

        this._modal = document.createElement('div');
        this._modal.className = 'auth-modal';
        this._modal.innerHTML = this._getModalHTML(mode);

        document.body.appendChild(this._modal);

        // Trigger animation
        requestAnimationFrame(() => {
            this._modal.classList.add('visible');
            this._modal.querySelector('#authEmail')?.focus();
        });

        this._setupEventListeners();
        this._isOpen = true;

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide auth modal
     */
    hide() {
        // Clean up escape key listener to prevent memory leak
        if (this._escHandler) {
            document.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }

        if (this._modal) {
            this._modal.classList.remove('visible');
            setTimeout(() => {
                this._modal?.remove();
                this._modal = null;
            }, 300);
        }
        this._isOpen = false;
        document.body.style.overflow = '';
    }

    get isOpen() {
        return this._isOpen;
    }

    _getModalHTML(mode) {
        const isLogin = mode === 'login';

        return `
            <div class="auth-modal-backdrop"></div>
            <div class="auth-modal-content">
                <button class="auth-modal-close" aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                <div class="auth-modal-header">
                    <div class="auth-logo">
                        <svg viewBox="0 0 40 40" fill="none">
                            <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 28V12h4l8 10V12h4v16h-4l-8-10v10h-4z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h2 class="auth-modal-title">${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p class="auth-modal-subtitle">
                        ${isLogin
        ? 'Sign in to sync your work across devices'
        : 'Start syncing your creations to the cloud'}
                    </p>
                </div>

                <div class="auth-modal-body">
                    <div class="auth-providers">
                        <button class="auth-provider-btn" data-provider="google">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>
                        <button class="auth-provider-btn" data-provider="github">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            Continue with GitHub
                        </button>
                    </div>

                    <div class="auth-divider">
                        <span>or</span>
                    </div>

                    <form class="auth-form" id="authForm">
                        <div class="auth-form-group">
                            <label for="authEmail">Email</label>
                            <input type="email" id="authEmail" required placeholder="you@example.com" autocomplete="email">
                        </div>
                        <div class="auth-form-group">
                            <label for="authPassword">Password</label>
                            <input type="password" id="authPassword" required placeholder="Min. 8 characters" minlength="8" autocomplete="${isLogin ? 'current-password' : 'new-password'}">
                        </div>
                        ${!isLogin ? `
                        <div class="auth-form-group">
                            <label for="authConfirmPassword">Confirm Password</label>
                            <input type="password" id="authConfirmPassword" required placeholder="Confirm password" minlength="8" autocomplete="new-password">
                        </div>
                        ` : ''}

                        <div class="auth-error" id="authError"></div>

                        <button type="submit" class="auth-submit-btn">
                            <span class="auth-submit-text">${isLogin ? 'Sign In' : 'Create Account'}</span>
                            <span class="auth-submit-loading" style="display: none;">
                                <svg class="spinner" viewBox="0 0 24 24" width="20" height="20">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10"/>
                                </svg>
                            </span>
                        </button>
                    </form>

                    ${isLogin ? `
                    <button class="auth-forgot-link" id="forgotPasswordBtn">Forgot password?</button>
                    ` : ''}
                </div>

                <div class="auth-modal-footer">
                    <p>
                        ${isLogin
        ? "Don't have an account?"
        : 'Already have an account?'}
                        <button class="auth-switch-btn" data-mode="${isLogin ? 'signup' : 'login'}">
                            ${isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                    <p class="auth-note">
                        Sign in and subscribe to generate AI images.
                    </p>
                </div>
            </div>
        `;
    }

    _setupEventListeners() {
        // Close on backdrop click
        this._modal.querySelector('.auth-modal-backdrop').addEventListener('click', () => this.hide());

        // Close button
        this._modal.querySelector('.auth-modal-close').addEventListener('click', () => this.hide());

        // Escape key - store reference for cleanup in hide()
        this._escHandler = (e) => {
            if (e.key === 'Escape' && this._isOpen) {
                this.hide();
            }
        };
        document.addEventListener('keydown', this._escHandler);

        // Switch between login/signup
        this._modal.querySelector('.auth-switch-btn').addEventListener('click', (e) => {
            this.show(e.target.dataset.mode);
        });

        // OAuth providers
        this._modal.querySelectorAll('.auth-provider-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const provider = btn.dataset.provider;
                btn.disabled = true;
                try {
                    await ngSupabase.signInWithProvider(provider);
                    // Redirects to OAuth provider
                } catch (error) {
                    this._showError(error.message);
                    btn.disabled = false;
                }
            });
        });

        // Form submission
        this._modal.querySelector('#authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this._handleFormSubmit();
        });

        // Forgot password
        const forgotBtn = this._modal.querySelector('#forgotPasswordBtn');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', async () => {
                const email = this._modal.querySelector('#authEmail').value;
                if (!email) {
                    this._showError('Please enter your email address');
                    return;
                }
                try {
                    await ngSupabase.resetPassword(email);
                    this._showError('Password reset email sent! Check your inbox.', 'success');
                } catch (error) {
                    this._showError(error.message);
                }
            });
        }
    }

    async _handleFormSubmit() {
        const email = this._modal.querySelector('#authEmail').value.trim();
        const password = this._modal.querySelector('#authPassword').value;
        const confirmPassword = this._modal.querySelector('#authConfirmPassword')?.value;

        // Clear previous error
        this._showError('');

        // Validate
        if (!email || !password) {
            this._showError('Please fill in all fields');
            return;
        }

        if (confirmPassword !== undefined && password !== confirmPassword) {
            this._showError('Passwords do not match');
            return;
        }

        const submitBtn = this._modal.querySelector('.auth-submit-btn');
        const submitText = submitBtn.querySelector('.auth-submit-text');
        const submitLoading = submitBtn.querySelector('.auth-submit-loading');

        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline-flex';

        try {
            if (confirmPassword !== undefined) {
                // Sign up
                await ngSupabase.signUp(email, password);
                this._showError('Account created! Check your email to confirm.', 'success');
                submitText.textContent = 'Email Sent';
                submitText.style.display = 'inline';
                submitLoading.style.display = 'none';
            } else {
                // Sign in
                await ngSupabase.signIn(email, password);
                this.hide();
                // Show success toast if SharedUI is available
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Signed in successfully!', 'success');
                }
            }
        } catch (error) {
            this._showError(this._formatError(error.message));
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    }

    _formatError(message) {
        // Make Supabase errors more user-friendly
        const errorMap = {
            'Invalid login credentials': 'Invalid email or password',
            'Email not confirmed': 'Please check your email and confirm your account',
            'User already registered': 'An account with this email already exists',
            'Password should be at least 6 characters': 'Password must be at least 8 characters'
        };
        return errorMap[message] || message;
    }

    _showError(message, type = 'error') {
        const errorEl = this._modal?.querySelector('#authError');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.className = `auth-error ${type} ${message ? 'visible' : ''}`;
        }
    }
}


// ============================================
// ACCOUNT MENU
// ============================================

class AccountMenu {
    constructor(container) {
        if (!container) return;

        this.container = container;
        this._dropdownOpen = false;
        this._outsideClickHandler = null;
        this._unsubscribeAuth = null;
        this._init();
    }

    _init() {
        this.render();

        // Listen for auth changes - store unsubscribe function returned by on()
        this._unsubscribeAuth = ngSupabase.on('authChange', () => this.render());

        // Close dropdown on outside click (store reference for cleanup)
        this._outsideClickHandler = (e) => {
            if (!this.container.contains(e.target)) {
                this._closeDropdown();
            }
        };
        document.addEventListener('click', this._outsideClickHandler);
    }

    /**
     * Clean up event listeners to prevent memory leaks
     * Call this when the AccountMenu is no longer needed
     */
    destroy() {
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
            this._outsideClickHandler = null;
        }
        if (this._unsubscribeAuth) {
            this._unsubscribeAuth();
            this._unsubscribeAuth = null;
        }
    }

    render() {
        if (ngSupabase.isAuthenticated) {
            this._renderLoggedIn();
        } else {
            this._renderLoggedOut();
        }
    }

    _renderLoggedOut() {
        this.container.innerHTML = `
            <button class="account-btn account-login-btn" id="accountLoginBtn" title="Sign in to sync across devices">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                <span>Sign In</span>
            </button>
        `;

        this.container.querySelector('#accountLoginBtn').addEventListener('click', () => {
            authUI.show('login');
        });
    }

    _renderLoggedIn() {
        const user = ngSupabase.user;
        const initial = escapeHtml(ngSupabase.getInitials());
        const email = escapeHtml(user?.email || 'User');
        const displayName = escapeHtml(ngSupabase.getDisplayName());

        this.container.innerHTML = `
            <div class="account-dropdown">
                <button class="account-btn account-avatar-btn" id="accountMenuBtn" title="${email}">
                    <span class="account-avatar-initial">${initial}</span>
                </button>
                <div class="account-dropdown-menu" id="accountDropdown">
                    <div class="account-dropdown-header">
                        <span class="account-avatar-initial large">${initial}</span>
                        <div class="account-dropdown-info">
                            <span class="account-dropdown-name">${displayName}</span>
                            <span class="account-dropdown-email">${email}</span>
                        </div>
                    </div>

                    <div class="account-dropdown-usage" id="dropdownUsage">
                        <div class="usage-loading">Loading usage...</div>
                    </div>

                    <div class="account-dropdown-section">
                        <button class="account-dropdown-item" id="productsBtn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <path d="M14 17h7m-3.5-3.5v7"/>
                            </svg>
                            <span>Products</span>
                        </button>
                        <button class="account-dropdown-item" id="syncNowBtn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                            <span>Sync Now</span>
                        </button>
                        <button class="account-dropdown-item" id="settingsBtn">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            <span>Settings</span>
                        </button>
                    </div>

                    <div class="account-dropdown-divider"></div>

                    <button class="account-dropdown-item danger" id="signOutBtn">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;

        this._setupDropdownListeners();
    }

    _setupDropdownListeners() {
        const btn = this.container.querySelector('#accountMenuBtn');
        const dropdown = this.container.querySelector('#accountDropdown');

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._dropdownOpen = !this._dropdownOpen;
            dropdown.classList.toggle('visible', this._dropdownOpen);
        });

        // Sign out
        this.container.querySelector('#signOutBtn').addEventListener('click', async () => {
            this._closeDropdown();
            try {
                await ngSupabase.signOut();
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Signed out', 'info');
                }
            } catch (error) {
                console.error('Sign out failed:', error);
            }
        });

        // Sync now
        this.container.querySelector('#syncNowBtn').addEventListener('click', async () => {
            this._closeDropdown();
            if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                SharedUI.toast('Syncing...', 'info');
            }
            try {
                // Trigger sync on SupabaseStorage instances via event
                window.dispatchEvent(new CustomEvent('requestSync'));
                localStorage.setItem('ngraphics_last_sync', new Date().toISOString());
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Sync complete!', 'success');
                }
            } catch (error) {
                console.error('[Sync] Failed:', error);
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Sync failed', 'error');
                }
            }
        });

        // Products - navigate to products page
        this.container.querySelector('#productsBtn').addEventListener('click', () => {
            this._closeDropdown();
            window.location.href = 'products.html';
        });

        // Settings - navigate to settings page
        this.container.querySelector('#settingsBtn').addEventListener('click', () => {
            this._closeDropdown();
            window.location.href = 'settings.html';
        });

        // Load usage data asynchronously
        this._loadUsageData();
    }

    async _loadUsageData() {
        const usageContainer = this.container.querySelector('#dropdownUsage');
        if (!usageContainer) return;

        try {
            const usage = await ngSupabase.getUsage();
            if (!usage) {
                usageContainer.style.display = 'none';
                return;
            }

            // Format reset date
            let resetText = '';
            if (usage.periodEnd) {
                const resetDate = new Date(usage.periodEnd);
                const options = { month: 'short', day: 'numeric' };
                resetText = `Resets ${resetDate.toLocaleDateString('en-US', options)}`;
            }

            // Calculate percentage and status
            const percentage = usage.isUnlimited ? 0 : Math.min(100, (usage.generationsUsed / usage.generationsLimit) * 100);
            const statusClass = percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : '';

            // Render usage section
            if (usage.tier === 'free') {
                usageContainer.innerHTML = `
                    <div class="usage-tier">
                        <span class="usage-tier-badge free">${usage.tierLabel}</span>
                    </div>
                    <div class="usage-upgrade-prompt">
                        <a href="/pricing.html" class="usage-upgrade-link">Upgrade to generate images</a>
                    </div>
                `;
            } else {
                usageContainer.innerHTML = `
                    <div class="usage-tier">
                        <span class="usage-tier-badge ${usage.tier}">${usage.tierLabel} Plan</span>
                    </div>
                    <div class="usage-bar-container">
                        <div class="usage-bar-fill ${statusClass}" style="width: ${percentage}%"></div>
                    </div>
                    <div class="usage-stats">
                        <span class="usage-count">${usage.generationsUsed}/${usage.generationsLimit} gens</span>
                        ${resetText ? `<span class="usage-reset">${resetText}</span>` : ''}
                    </div>
                    ${usage.creditsBalance > 0 ? `<div class="usage-credits">${usage.creditsBalance} credits available</div>` : ''}
                `;
            }
        } catch (error) {
            console.error('[AccountMenu] Error loading usage:', error);
            usageContainer.style.display = 'none';
        }
    }

    _closeDropdown() {
        this._dropdownOpen = false;
        const dropdown = this.container.querySelector('#accountDropdown');
        if (dropdown) {
            dropdown.classList.remove('visible');
        }
    }
}


// ============================================
// AUTH GATE
// Blocks page access until user is authenticated
// ============================================

class AuthGate {
    static _overlay = null;
    static _resolveAuth = null;
    static _authPromise = null;

    /**
     * Require authentication before proceeding
     * Shows blocking overlay if not authenticated
     * @returns {Promise<Object>} Resolves with user object when authenticated
     */
    static async requireAuth() {
        // Initialize Supabase first
        if (typeof ngSupabase !== 'undefined') {
            await ngSupabase.init();

            // Already authenticated - return user immediately
            if (ngSupabase.isAuthenticated) {
                this.hideBlockingOverlay();
                return ngSupabase.user;
            }
        }

        // Show blocking overlay and wait for auth
        this.showBlockingOverlay();
        return this.waitForAuth();
    }

    /**
     * Show full-screen blocking overlay
     */
    static showBlockingOverlay() {
        // Check if overlay already exists in HTML
        let overlay = document.getElementById('authOverlay');

        if (!overlay) {
            // Create overlay if it doesn't exist
            overlay = document.createElement('div');
            overlay.id = 'authOverlay';
            overlay.className = 'auth-overlay';
            overlay.innerHTML = `
                <div class="auth-overlay-backdrop"></div>
                <div class="auth-overlay-content">
                    <div class="auth-overlay-logo">
                        <svg viewBox="0 0 40 40" fill="none" width="64" height="64">
                            <rect x="2" y="2" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 28V12h4l8 10V12h4v16h-4l-8-10v10h-4z" fill="currentColor"/>
                        </svg>
                    </div>
                    <h2 class="auth-overlay-title">Sign in to continue</h2>
                    <p class="auth-overlay-subtitle">HEFAISTOS requires an account to save and sync your work</p>
                    <div class="auth-overlay-actions">
                        <button class="auth-overlay-btn auth-overlay-btn-primary" id="authOverlayLogin">
                            Sign In
                        </button>
                        <button class="auth-overlay-btn auth-overlay-btn-secondary" id="authOverlaySignup">
                            Create Account
                        </button>
                    </div>
                    <p class="auth-overlay-note">
                        Free accounts get access to all tools.
                        <a href="/pricing.html">View plans</a> for AI generation.
                    </p>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        // Attach event listeners
        const loginBtn = overlay.querySelector('#authOverlayLogin');
        const signupBtn = overlay.querySelector('#authOverlaySignup');

        if (loginBtn) {
            loginBtn.onclick = () => authUI.show('login');
        }
        if (signupBtn) {
            signupBtn.onclick = () => authUI.show('signup');
        }

        // Show overlay
        overlay.classList.add('visible');
        document.body.classList.add('auth-blocked');
        this._overlay = overlay;
    }

    /**
     * Hide blocking overlay
     */
    static hideBlockingOverlay() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.remove('visible');
            document.body.classList.remove('auth-blocked');
        }
        this._overlay = null;
    }

    /**
     * Wait for authentication
     * @returns {Promise<Object>} Resolves with user object when authenticated
     */
    static waitForAuth() {
        // Return existing promise if already waiting
        if (this._authPromise) {
            return this._authPromise;
        }

        this._authPromise = new Promise((resolve) => {
            this._resolveAuth = resolve;

            // Check if already authenticated
            if (typeof ngSupabase !== 'undefined' && ngSupabase.isAuthenticated) {
                this._onAuthenticated(ngSupabase.user);
                return;
            }

            // Listen for auth changes
            if (typeof ngSupabase !== 'undefined') {
                const unsubscribe = ngSupabase.on('authChange', ({ event, user }) => {
                    if (event === 'SIGNED_IN' && user) {
                        unsubscribe();
                        this._onAuthenticated(user);
                    }
                });
            }
        });

        return this._authPromise;
    }

    /**
     * Handle successful authentication
     * @param {Object} user - Authenticated user
     */
    static _onAuthenticated(user) {
        this.hideBlockingOverlay();

        // Close auth modal if open
        if (authUI.isOpen) {
            authUI.hide();
        }

        // Resolve promise
        if (this._resolveAuth) {
            this._resolveAuth(user);
            this._resolveAuth = null;
            this._authPromise = null;
        }

        // Show success toast
        if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
            SharedUI.toast('Signed in successfully!', 'success');
        }
    }

    /**
     * Check if user is authenticated without blocking
     * @returns {boolean}
     */
    static isAuthenticated() {
        return typeof ngSupabase !== 'undefined' && ngSupabase.isAuthenticated;
    }

    /**
     * Get current user without blocking
     * @returns {Object|null}
     */
    static getUser() {
        return typeof ngSupabase !== 'undefined' ? ngSupabase.user : null;
    }
}


// ============================================
// EXPORTS
// ============================================

// Create singleton instances
const authUI = new AuthUI();

// Expose globally
window.AuthUI = AuthUI;
window.authUI = authUI;
window.AccountMenu = AccountMenu;
window.AuthGate = AuthGate;

// ============================================
// AUTO-INIT: Require auth on studio pages
// ============================================

/**
 * Pages that don't require authentication
 */
const AUTH_EXEMPT_PAGES = [
    'index.html',
    'gallery.html',
    'faq.html',
    'pricing.html',
    'docs.html',
    'settings.html',
    ''  // root path
];

/**
 * Check if current page requires authentication
 */
function isAuthRequiredPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || '';

    // Check if page is exempt
    if (AUTH_EXEMPT_PAGES.includes(page)) {
        return false;
    }

    // All other pages (studios) require auth
    return page.endsWith('.html') || page === '';
}

/**
 * Auto-initialize auth gate on page load
 */
function autoInitAuthGate() {
    if (!isAuthRequiredPage()) {
        console.log('[AuthGate] Page exempt from authentication');
        return;
    }

    // Don't auto-init if page explicitly opts out
    if (document.body.hasAttribute('data-no-auth')) {
        console.log('[AuthGate] Page opted out of authentication');
        return;
    }

    // Require authentication
    console.log('[AuthGate] Requiring authentication for this page');
    AuthGate.requireAuth().then(user => {
        console.log(`[AuthGate] Authenticated as ${user.email}`);

        // Dispatch event for studios to listen to
        window.dispatchEvent(new CustomEvent('authReady', { detail: { user } }));
    }).catch(error => {
        console.error('[AuthGate] Authentication error:', error);
    });
}

// Run auto-init after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitAuthGate);
} else {
    // DOM already loaded, run immediately
    autoInitAuthGate();
}
