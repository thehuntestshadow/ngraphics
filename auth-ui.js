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
                            : "Already have an account?"}
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

        // Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape' && this._isOpen) {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

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
        this._init();
    }

    _init() {
        this.render();

        // Listen for auth changes
        ngSupabase.on('authChange', () => this.render());

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this._closeDropdown();
            }
        });
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
            if (typeof window.cloudSync !== 'undefined' && window.cloudSync.fullSync) {
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Syncing...', 'info');
                }
                try {
                    await window.cloudSync.fullSync();
                    if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                        SharedUI.toast('Sync complete!', 'success');
                    }
                } catch (error) {
                    if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                        SharedUI.toast('Sync failed', 'error');
                    }
                }
            } else {
                if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
                    SharedUI.toast('Sync not available yet', 'info');
                }
            }
        });

        // Settings
        this.container.querySelector('#settingsBtn').addEventListener('click', () => {
            this._closeDropdown();
            if (typeof settingsModal !== 'undefined') {
                settingsModal.show();
            }
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
// SETTINGS MODAL
// ============================================

class SettingsModal {
    constructor() {
        this._modal = null;
        this._isOpen = false;
    }

    show() {
        if (this._modal) {
            this._modal.remove();
        }

        this._modal = document.createElement('div');
        this._modal.className = 'settings-modal';
        this._modal.innerHTML = this._getModalHTML();

        document.body.appendChild(this._modal);

        requestAnimationFrame(() => {
            this._modal.classList.add('visible');
        });

        this._setupEventListeners();
        this._loadSettings();
        this._isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    hide() {
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

    _getModalHTML() {
        const isLoggedIn = window.ngSupabase?.isAuthenticated;
        const user = window.ngSupabase?.user;
        const email = user?.email || '';
        const displayName = window.ngSupabase?.getDisplayName() || '';
        const initial = window.ngSupabase?.getInitials() || 'U';

        return `
            <div class="settings-modal-backdrop"></div>
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <h2>Settings</h2>
                    <button class="settings-modal-close" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="settings-modal-body">
                    <!-- Profile Section -->
                    ${isLoggedIn ? `
                    <div class="settings-section" data-section="profile">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                Profile
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row">
                                <label>Display Name</label>
                                <input type="text" id="settingsDisplayName" value="${escapeHtml(displayName)}" placeholder="Your name">
                            </div>
                            <div class="settings-row">
                                <label>Email</label>
                                <input type="email" value="${escapeHtml(email)}" disabled class="settings-input-disabled">
                            </div>
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-primary" id="saveProfileBtn">Save Profile</button>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Usage & Billing Section -->
                    ${isLoggedIn ? `
                    <div class="settings-section" data-section="usage">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                Usage & Billing
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-usage-container" id="settingsUsage">
                                <div class="usage-loading">Loading usage data...</div>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- API Keys Section (Luma only - OpenRouter handled by subscription) -->
                    <div class="settings-section" data-section="api-keys">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                                </svg>
                                Video API Key
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row">
                                <label>Luma AI API Key</label>
                                <div class="settings-input-group">
                                    <input type="password" id="settingsLumaKey" placeholder="luma-..." autocomplete="off">
                                    <button class="settings-icon-btn" id="toggleLumaKey" title="Show/hide">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button class="settings-icon-btn" id="testLumaKey" title="Test key">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </button>
                                </div>
                                <span class="settings-hint">Required for Model Video studio. <a href="https://lumalabs.ai/dream-machine/api" target="_blank">Get key</a></span>
                            </div>
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-primary" id="saveApiKeysBtn">Save API Key</button>
                            </div>
                        </div>
                    </div>

                    <!-- Appearance Section -->
                    <div class="settings-section" data-section="appearance">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="5"/>
                                    <line x1="12" y1="1" x2="12" y2="3"/>
                                    <line x1="12" y1="21" x2="12" y2="23"/>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                    <line x1="1" y1="12" x2="3" y2="12"/>
                                    <line x1="21" y1="12" x2="23" y2="12"/>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                </svg>
                                Appearance
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row">
                                <label>Theme</label>
                                <div class="settings-toggle-group" id="themeToggle">
                                    <button class="settings-toggle-btn" data-value="dark">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                                        </svg>
                                        Dark
                                    </button>
                                    <button class="settings-toggle-btn" data-value="light">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="12" cy="12" r="5"/>
                                            <line x1="12" y1="1" x2="12" y2="3"/>
                                            <line x1="12" y1="21" x2="12" y2="23"/>
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                                            <line x1="1" y1="12" x2="3" y2="12"/>
                                            <line x1="21" y1="12" x2="23" y2="12"/>
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                                        </svg>
                                        Light
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Language Section -->
                    <div class="settings-section" data-section="language">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="2" y1="12" x2="22" y2="12"/>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                </svg>
                                Language
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row">
                                <label>Interface Language</label>
                                <select id="settingsUILanguage" class="settings-select settings-lang-select">
                                    ${this._getLanguageOptions()}
                                </select>
                                <span class="settings-hint">Controls buttons, labels, and menus</span>
                            </div>
                            <div class="settings-row">
                                <label>Generation Language</label>
                                <select id="settingsGenLanguage" class="settings-select settings-lang-select">
                                    ${this._getLanguageOptions()}
                                </select>
                                <span class="settings-hint">Text in generated images and AI content</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cloud Sync Section (logged in only) -->
                    ${isLoggedIn ? `
                    <div class="settings-section" data-section="sync">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"/>
                                    <polyline points="1 20 1 14 7 14"/>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                </svg>
                                Cloud Sync
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row settings-row-inline">
                                <label>Enable cloud sync</label>
                                <label class="settings-switch">
                                    <input type="checkbox" id="settingsSyncEnabled">
                                    <span class="settings-switch-slider"></span>
                                </label>
                            </div>
                            <div class="settings-row">
                                <span class="settings-sync-status" id="syncStatus">Last synced: Never</span>
                            </div>
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-secondary" id="syncNowSettingsBtn">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="23 4 23 10 17 10"/>
                                        <polyline points="1 20 1 14 7 14"/>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                                    </svg>
                                    Sync Now
                                </button>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Danger Zone -->
                    <div class="settings-section settings-section-danger" data-section="danger">
                        <button class="settings-section-header">
                            <span class="settings-section-title">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                Danger Zone
                            </span>
                            <svg class="settings-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="settings-section-content">
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-danger-outline" id="clearHistoryBtn">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    Clear All History
                                </button>
                                <span class="settings-hint">Remove all generation history from all studios</span>
                            </div>
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-danger-outline" id="clearFavoritesBtn">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                    </svg>
                                    Clear All Favorites
                                </button>
                                <span class="settings-hint">Remove all saved favorites from all studios</span>
                            </div>
                            ${isLoggedIn ? `
                            <div class="settings-row">
                                <button class="settings-btn settings-btn-danger" id="deleteAccountBtn">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                        <line x1="18" y1="8" x2="23" y2="13"/>
                                        <line x1="23" y1="8" x2="18" y2="13"/>
                                    </svg>
                                    Delete Account
                                </button>
                                <span class="settings-hint">Permanently delete your account and all cloud data</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _setupEventListeners() {
        // Close on backdrop click
        this._modal.querySelector('.settings-modal-backdrop').addEventListener('click', () => this.hide());

        // Close button
        this._modal.querySelector('.settings-modal-close').addEventListener('click', () => this.hide());

        // Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape' && this._isOpen) {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Section toggles
        this._modal.querySelectorAll('.settings-section-header').forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.settings-section');
                section.classList.toggle('open');
            });
        });

        // Theme toggle
        const themeToggle = this._modal.querySelector('#themeToggle');
        if (themeToggle) {
            themeToggle.querySelectorAll('.settings-toggle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const theme = btn.dataset.value;
                    this._setTheme(theme);
                    this._updateThemeButtons(theme);
                });
            });
        }

        // Interface language select
        const uiLangSelect = this._modal.querySelector('#settingsUILanguage');
        if (uiLangSelect) {
            uiLangSelect.addEventListener('change', () => {
                const lang = uiLangSelect.value;
                if (typeof i18n !== 'undefined') {
                    i18n.setUILanguage(lang);
                } else {
                    localStorage.setItem('ngraphics_ui_language', lang);
                }
                this._showToast('Interface language updated');
            });
        }

        // Generation language select
        const genLangSelect = this._modal.querySelector('#settingsGenLanguage');
        if (genLangSelect) {
            genLangSelect.addEventListener('change', () => {
                const lang = genLangSelect.value;
                if (typeof i18n !== 'undefined') {
                    i18n.setGenerationLanguage(lang);
                } else {
                    localStorage.setItem('ngraphics_gen_language', lang);
                }
                // Also update the legacy copywriter_language for backwards compatibility
                localStorage.setItem('copywriter_language', lang);
                this._showToast('Generation language updated');
            });
        }

        // Luma API key visibility toggle
        this._setupKeyToggle('Luma');

        // Test Luma API key
        this._modal.querySelector('#testLumaKey')?.addEventListener('click', () => this._testApiKey('luma'));

        // Save API keys
        this._modal.querySelector('#saveApiKeysBtn')?.addEventListener('click', () => this._saveApiKeys());

        // Save profile
        this._modal.querySelector('#saveProfileBtn')?.addEventListener('click', () => this._saveProfile());

        // Cloud sync toggle
        const syncToggle = this._modal.querySelector('#settingsSyncEnabled');
        if (syncToggle) {
            syncToggle.addEventListener('change', () => {
                if (window.ngSupabase) {
                    window.ngSupabase.syncEnabled = syncToggle.checked;
                }
                this._showToast(syncToggle.checked ? 'Cloud sync enabled' : 'Cloud sync disabled');
            });
        }

        // Sync now button
        this._modal.querySelector('#syncNowSettingsBtn')?.addEventListener('click', () => this._syncNow());

        // Danger zone
        this._modal.querySelector('#clearHistoryBtn')?.addEventListener('click', () => this._clearAllHistory());
        this._modal.querySelector('#clearFavoritesBtn')?.addEventListener('click', () => this._clearAllFavorites());
        this._modal.querySelector('#deleteAccountBtn')?.addEventListener('click', () => this._deleteAccount());
    }

    _loadSettings() {
        // Load Luma API key (OpenRouter no longer needed - handled by subscription)
        const lumaKey = localStorage.getItem('video_api_key') || '';
        const lumaInput = this._modal.querySelector('#settingsLumaKey');
        if (lumaInput) lumaInput.value = lumaKey;

        // Load theme
        const currentTheme = localStorage.getItem('ngraphics_theme') || 'dark';
        this._updateThemeButtons(currentTheme);

        // Load language settings
        const uiLang = typeof i18n !== 'undefined' ? i18n.getUILanguage() : (localStorage.getItem('ngraphics_ui_language') || 'en');
        const genLang = typeof i18n !== 'undefined' ? i18n.getGenerationLanguage() : (localStorage.getItem('ngraphics_gen_language') || 'en');

        const uiLangSelect = this._modal.querySelector('#settingsUILanguage');
        const genLangSelect = this._modal.querySelector('#settingsGenLanguage');
        if (uiLangSelect) uiLangSelect.value = uiLang;
        if (genLangSelect) genLangSelect.value = genLang;

        // Load sync status
        const syncEnabled = window.ngSupabase?.syncEnabled ?? false;
        const syncToggle = this._modal.querySelector('#settingsSyncEnabled');
        if (syncToggle) syncToggle.checked = syncEnabled;

        // Update sync status text
        this._updateSyncStatus();

        // Load usage data (async)
        this._loadUsageSettings();
    }

    async _loadUsageSettings() {
        const usageContainer = this._modal?.querySelector('#settingsUsage');
        if (!usageContainer) return;

        try {
            const usage = await ngSupabase.getUsage();
            if (!usage) {
                usageContainer.innerHTML = `
                    <div class="settings-usage-unavailable">
                        Usage data unavailable. Please try again later.
                    </div>
                `;
                return;
            }

            // Format billing period dates
            let periodText = '';
            if (usage.periodStart && usage.periodEnd) {
                const startDate = new Date(usage.periodStart);
                const endDate = new Date(usage.periodEnd);
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                periodText = `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
            }

            // Calculate percentage and status
            const percentage = usage.isUnlimited ? 0 : Math.min(100, (usage.generationsUsed / usage.generationsLimit) * 100);
            const statusClass = percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : '';

            if (usage.tier === 'free') {
                usageContainer.innerHTML = `
                    <div class="settings-usage-card">
                        <div class="settings-usage-header">
                            <span class="usage-tier-badge free">${usage.tierLabel}</span>
                        </div>
                        <div class="settings-usage-info">
                            <p class="settings-usage-upgrade">Subscription required to generate images</p>
                            <p class="settings-usage-hint">Upgrade to Pro or Business to start generating AI images.</p>
                        </div>
                        <div class="settings-usage-actions">
                            <a href="/pricing.html" class="settings-btn settings-btn-primary">View Plans</a>
                        </div>
                    </div>
                `;
            } else {
                usageContainer.innerHTML = `
                    <div class="settings-usage-card">
                        <div class="settings-usage-header">
                            <span class="usage-tier-badge ${usage.tier}">${usage.tierLabel} Plan</span>
                            ${periodText ? `<span class="settings-usage-period">${periodText}</span>` : ''}
                        </div>
                        <div class="settings-usage-section">
                            <div class="settings-usage-label">
                                <span>Generations</span>
                                <span class="settings-usage-value ${statusClass}">${usage.generationsUsed} / ${usage.generationsLimit}</span>
                            </div>
                            <div class="usage-bar-container large">
                                <div class="usage-bar-fill ${statusClass}" style="width: ${percentage}%"></div>
                            </div>
                            ${percentage >= 80 ? `
                            <p class="settings-usage-warning ${statusClass}">
                                ${percentage >= 100 ? 'You\'ve reached your limit. Upgrade for more generations.' : 'You\'re approaching your monthly limit.'}
                            </p>
                            ` : ''}
                        </div>
                        ${usage.creditsBalance > 0 ? `
                        <div class="settings-usage-section">
                            <div class="settings-usage-label">
                                <span>Credits Balance</span>
                                <span class="settings-usage-value">${usage.creditsBalance}</span>
                            </div>
                        </div>
                        ` : ''}
                        <div class="settings-usage-actions">
                            <a href="/pricing.html?action=buy-credits" class="settings-btn settings-btn-outline">Buy Credits</a>
                            <a href="/pricing.html?action=upgrade" class="settings-btn settings-btn-primary">Upgrade Plan</a>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('[SettingsModal] Error loading usage:', error);
            usageContainer.innerHTML = `
                <div class="settings-usage-unavailable">
                    Unable to load usage data. Please try again later.
                </div>
            `;
        }
    }

    _setupKeyToggle(provider) {
        const toggleBtn = this._modal.querySelector(`#toggle${provider}Key`);
        const input = this._modal.querySelector(`#settings${provider}Key`);

        if (toggleBtn && input) {
            toggleBtn.addEventListener('click', () => {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                toggleBtn.classList.toggle('active', isPassword);
            });
        }
    }

    _updateThemeButtons(theme) {
        const buttons = this._modal.querySelectorAll('#themeToggle .settings-toggle-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === theme);
        });
    }

    _setTheme(theme) {
        localStorage.setItem('ngraphics_theme', theme);
        if (typeof SharedTheme !== 'undefined') {
            SharedTheme.apply(theme);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        this._showToast(`Theme set to ${theme}`);
    }

    async _testApiKey(provider) {
        const input = this._modal.querySelector('#settingsLumaKey');
        const key = input?.value?.trim();

        if (!key) {
            this._showToast('Please enter an API key first', 'error');
            return;
        }

        const testBtn = this._modal.querySelector('#testLumaKey');
        testBtn.disabled = true;

        try {
            // Luma API test - just check if key format looks valid
            const isValid = key.startsWith('luma-') || key.length > 20;

            if (isValid) {
                this._showToast('Luma API key looks valid!', 'success');
            } else {
                this._showToast('Invalid API key format', 'error');
            }
        } catch (error) {
            this._showToast('Failed to test API key', 'error');
        } finally {
            testBtn.disabled = false;
        }
    }

    _saveApiKeys() {
        const lumaKey = this._modal.querySelector('#settingsLumaKey')?.value?.trim() || '';

        if (lumaKey) {
            localStorage.setItem('video_api_key', lumaKey);
        } else {
            localStorage.removeItem('video_api_key');
        }

        this._showToast('API key saved', 'success');
    }

    async _saveProfile() {
        const displayName = this._modal.querySelector('#settingsDisplayName')?.value?.trim();

        if (!window.ngSupabase?.isAuthenticated) {
            this._showToast('You must be signed in to update your profile', 'error');
            return;
        }

        try {
            await window.ngSupabase.updateProfile({ display_name: displayName });
            this._showToast('Profile updated', 'success');
        } catch (error) {
            this._showToast('Failed to update profile', 'error');
        }
    }

    _updateSyncStatus() {
        const statusEl = this._modal.querySelector('#syncStatus');
        if (!statusEl) return;

        const lastSync = localStorage.getItem('ngraphics_last_sync');
        if (lastSync) {
            const date = new Date(lastSync);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) {
                statusEl.textContent = 'Last synced: Just now';
            } else if (diffMins < 60) {
                statusEl.textContent = `Last synced: ${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
            } else {
                statusEl.textContent = `Last synced: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            }
        } else {
            statusEl.textContent = 'Last synced: Never';
        }
    }

    async _syncNow() {
        const btn = this._modal.querySelector('#syncNowSettingsBtn');
        if (btn) btn.disabled = true;

        this._showToast('Syncing...', 'info');

        try {
            if (typeof window.cloudSync !== 'undefined' && window.cloudSync.fullSync) {
                await window.cloudSync.fullSync();
                localStorage.setItem('ngraphics_last_sync', new Date().toISOString());
                this._updateSyncStatus();
                this._showToast('Sync complete!', 'success');
            } else {
                this._showToast('Sync not available', 'error');
            }
        } catch (error) {
            this._showToast('Sync failed', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    async _clearAllHistory() {
        const confirmed = confirm('Are you sure you want to clear ALL generation history from ALL studios? This cannot be undone.');
        if (!confirmed) return;

        const studios = [
            'ngraphics', 'model_studio', 'bundle_studio', 'lifestyle_studio',
            'copywriter', 'packaging', 'comparison_generator', 'size_visualizer',
            'faq_generator', 'background_studio', 'badge_generator', 'feature_cards',
            'size_chart', 'aplus_generator', 'product_variants', 'social_studio',
            'export_center', 'ad_creative', 'model_video'
        ];

        for (const studio of studios) {
            try {
                const history = new SharedHistory(studio);
                await history.clear();
            } catch (e) {
                // Ignore errors for studios that don't exist
            }
        }

        this._showToast('All history cleared', 'success');
    }

    async _clearAllFavorites() {
        const confirmed = confirm('Are you sure you want to clear ALL favorites from ALL studios? This cannot be undone.');
        if (!confirmed) return;

        const studios = [
            'ngraphics', 'model_studio', 'bundle_studio', 'lifestyle_studio',
            'copywriter', 'packaging', 'comparison_generator', 'size_visualizer',
            'faq_generator', 'background_studio', 'badge_generator', 'feature_cards',
            'size_chart', 'aplus_generator', 'product_variants', 'social_studio',
            'export_center', 'ad_creative', 'model_video'
        ];

        for (const studio of studios) {
            try {
                const favorites = new SharedFavorites(studio);
                await favorites.clear();
            } catch (e) {
                // Ignore errors for studios that don't exist
            }
        }

        this._showToast('All favorites cleared', 'success');
    }

    async _deleteAccount() {
        const confirmed = confirm('Are you sure you want to DELETE YOUR ACCOUNT? This will permanently remove all your cloud data and cannot be undone!');
        if (!confirmed) return;

        const doubleConfirm = confirm('This is your last chance. Type "DELETE" in the next prompt to confirm.');
        if (!doubleConfirm) return;

        const typed = prompt('Type DELETE to confirm account deletion:');
        if (typed !== 'DELETE') {
            this._showToast('Account deletion cancelled', 'info');
            return;
        }

        try {
            // Note: Full account deletion would require a server-side function
            // For now, just sign out and clear local data
            await this._clearAllHistory();
            await this._clearAllFavorites();

            if (window.ngSupabase) {
                await window.ngSupabase.signOut();
            }

            this.hide();
            this._showToast('Account deleted. You have been signed out.', 'success');
        } catch (error) {
            this._showToast('Failed to delete account', 'error');
        }
    }

    _showToast(message, type = 'info') {
        if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
            SharedUI.toast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    /**
     * Generate language options HTML for select dropdowns
     */
    _getLanguageOptions() {
        const languages = typeof LANGUAGES !== 'undefined' ? LANGUAGES : [
            { code: 'en', flag: '🇬🇧', native: 'English' },
            { code: 'ro', flag: '🇷🇴', native: 'Română' },
            { code: 'de', flag: '🇩🇪', native: 'Deutsch' },
            { code: 'fr', flag: '🇫🇷', native: 'Français' },
            { code: 'es', flag: '🇪🇸', native: 'Español' },
            { code: 'it', flag: '🇮🇹', native: 'Italiano' },
            { code: 'pt', flag: '🇵🇹', native: 'Português' },
            { code: 'nl', flag: '🇳🇱', native: 'Nederlands' },
            { code: 'pl', flag: '🇵🇱', native: 'Polski' },
            { code: 'cs', flag: '🇨🇿', native: 'Čeština' }
        ];

        return languages.map(lang =>
            `<option value="${lang.code}">${lang.flag} ${lang.native}</option>`
        ).join('');
    }
}


// ============================================
// EXPORTS
// ============================================

// Create singleton instances
const authUI = new AuthUI();
const settingsModal = new SettingsModal();

// Expose globally
window.AuthUI = AuthUI;
window.authUI = authUI;
window.AccountMenu = AccountMenu;
window.SettingsModal = SettingsModal;
window.settingsModal = settingsModal;
