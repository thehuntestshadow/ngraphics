/**
 * NGRAPHICS - Pricing Page
 * Handles billing toggle, subscription management, and Stripe checkout
 */

// ============================================
// STATE
// ============================================

const state = {
    billing: 'monthly', // 'monthly' | 'yearly'
    currentTier: 'free',
    isLoading: false
};

// ============================================
// PRICE CONFIGURATION
// ============================================

const PRICES = {
    pro: {
        monthly: { amount: 19, priceId: 'pro_monthly' },
        yearly: { amount: 15, priceId: 'pro_yearly' }  // Per month when billed yearly
    },
    business: {
        monthly: { amount: 49, priceId: 'business_monthly' },
        yearly: { amount: 39, priceId: 'business_yearly' }
    },
    credits: {
        credits_50: { amount: 5, credits: 50 },
        credits_200: { amount: 15, credits: 200 }
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Initialize theme
    SharedTheme.init();
    SharedTheme.setupToggle(document.getElementById('themeToggle'));

    // Initialize account menu
    const accountContainer = document.getElementById('accountContainer');
    if (accountContainer && typeof AccountMenu !== 'undefined') {
        new AccountMenu(accountContainer);
    }

    // Setup billing toggle
    setupBillingToggle();

    // Setup CTA buttons
    setupCTAButtons();

    // Setup credit buttons
    setupCreditButtons();

    // Check URL params for checkout result
    checkCheckoutResult();

    // Load current subscription if authenticated
    await loadCurrentSubscription();
}

// ============================================
// BILLING TOGGLE
// ============================================

function setupBillingToggle() {
    const buttons = document.querySelectorAll('.billing-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const billing = btn.dataset.billing;
            if (billing === state.billing) return;

            state.billing = billing;

            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update prices
            updateDisplayedPrices();
        });
    });
}

function updateDisplayedPrices() {
    const priceElements = document.querySelectorAll('.price-amount[data-monthly]');

    priceElements.forEach(el => {
        const monthly = el.dataset.monthly;
        const yearly = el.dataset.yearly;
        el.textContent = state.billing === 'monthly' ? monthly : yearly;
    });
}

// ============================================
// CTA BUTTONS
// ============================================

function setupCTAButtons() {
    // Free tier
    document.getElementById('ctaFree')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Pro tier
    document.getElementById('ctaPro')?.addEventListener('click', () => {
        handleUpgrade('pro');
    });

    // Business tier
    document.getElementById('ctaBusiness')?.addEventListener('click', () => {
        handleUpgrade('business');
    });
}

async function handleUpgrade(tier) {
    // Check if authenticated
    if (!ngSupabase.isAuthenticated) {
        // Show login modal
        if (typeof authUI !== 'undefined') {
            authUI.show('signup');

            // Wait for auth, then redirect back
            ngSupabase.once('authChange', ({ user }) => {
                if (user) {
                    handleUpgrade(tier);
                }
            });
        } else {
            alert('Please sign in to upgrade');
        }
        return;
    }

    // Get price ID based on billing period
    const priceId = PRICES[tier][state.billing].priceId;

    // Show loading state
    const btn = document.getElementById(`cta${tier.charAt(0).toUpperCase() + tier.slice(1)}`);
    if (btn) {
        btn.classList.add('loading');
        btn.disabled = true;
    }

    try {
        // Call checkout Edge Function
        const response = await fetch(
            `${CONFIG.SUPABASE_URL}/functions/v1/create-checkout`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ngSupabase.session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priceId,
                    successUrl: `${window.location.origin}/pricing.html?checkout=success`,
                    cancelUrl: `${window.location.origin}/pricing.html?checkout=cancelled`
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Redirect to Stripe checkout
        if (data.url) {
            window.location.href = data.url;
        }

    } catch (error) {
        console.error('Checkout error:', error);

        if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
            SharedUI.toast('Failed to start checkout. Please try again.', 'error');
        } else {
            alert('Failed to start checkout. Please try again.');
        }
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
}

// ============================================
// CREDIT BUTTONS
// ============================================

function setupCreditButtons() {
    document.querySelectorAll('.credit-buy').forEach(btn => {
        btn.addEventListener('click', () => {
            const priceId = btn.dataset.price;
            handleCreditPurchase(priceId);
        });
    });
}

async function handleCreditPurchase(priceId) {
    // Check if authenticated
    if (!ngSupabase.isAuthenticated) {
        if (typeof authUI !== 'undefined') {
            authUI.show('signup');
            ngSupabase.once('authChange', ({ user }) => {
                if (user) handleCreditPurchase(priceId);
            });
        }
        return;
    }

    const btn = document.querySelector(`[data-price="${priceId}"]`);
    if (btn) {
        btn.classList.add('loading');
        btn.disabled = true;
    }

    try {
        const response = await fetch(
            `${CONFIG.SUPABASE_URL}/functions/v1/create-checkout`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ngSupabase.session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priceId,
                    successUrl: `${window.location.origin}/pricing.html?checkout=success&credits=true`,
                    cancelUrl: `${window.location.origin}/pricing.html?checkout=cancelled`
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        if (data.url) {
            window.location.href = data.url;
        }

    } catch (error) {
        console.error('Credit purchase error:', error);
        alert('Failed to start checkout. Please try again.');
    } finally {
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
}

// ============================================
// CHECKOUT RESULT
// ============================================

function checkCheckoutResult() {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const isCredits = params.get('credits') === 'true';

    if (checkout === 'success') {
        // Show success message
        if (typeof SharedUI !== 'undefined' && SharedUI.toast) {
            const message = isCredits
                ? 'Credits added to your account!'
                : 'Subscription activated! Welcome to Pro.';
            SharedUI.toast(message, 'success');
        }

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);

        // Reload subscription info
        loadCurrentSubscription();

    } else if (checkout === 'cancelled') {
        // User cancelled - just clean URL
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// ============================================
// SUBSCRIPTION STATUS
// ============================================

async function loadCurrentSubscription() {
    if (!ngSupabase.isAuthenticated) {
        updateUIForTier('free');
        return;
    }

    try {
        await ngSupabase.init();

        // Get subscription from database
        const { data: sub, error } = await ngSupabase.client
            .from('subscriptions')
            .select('tier_id, status')
            .eq('user_id', ngSupabase.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error loading subscription:', error);
        }

        const tier = (sub?.status === 'active' && sub?.tier_id) || 'free';
        state.currentTier = tier;
        updateUIForTier(tier);

    } catch (error) {
        console.error('Failed to load subscription:', error);
        updateUIForTier('free');
    }
}

function updateUIForTier(tier) {
    // Remove current-plan from all cards
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.classList.remove('current-plan');
    });

    // Add current-plan to active tier
    const currentCard = document.querySelector(`.pricing-card[data-tier="${tier}"]`);
    if (currentCard) {
        currentCard.classList.add('current-plan');

        // Update button text
        const btn = currentCard.querySelector('.card-cta');
        if (btn) {
            btn.innerHTML = '<span>Current Plan</span>';
        }
    }

    // Update other buttons based on tier
    if (tier === 'pro') {
        const freeBtn = document.getElementById('ctaFree');
        if (freeBtn) freeBtn.textContent = 'Downgrade';

        const businessBtn = document.getElementById('ctaBusiness');
        if (businessBtn) businessBtn.textContent = 'Upgrade to Business';

    } else if (tier === 'business') {
        const freeBtn = document.getElementById('ctaFree');
        if (freeBtn) freeBtn.textContent = 'Downgrade';

        const proBtn = document.getElementById('ctaPro');
        if (proBtn) proBtn.textContent = 'Downgrade to Pro';
    }
}

// ============================================
// MANAGE SUBSCRIPTION
// ============================================

async function openBillingPortal() {
    if (!ngSupabase.isAuthenticated) return;

    try {
        // Get Stripe billing portal URL
        // This would be another Edge Function
        const response = await fetch(
            `${CONFIG.SUPABASE_URL}/functions/v1/billing-portal`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ngSupabase.session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            }
        );

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        }

    } catch (error) {
        console.error('Billing portal error:', error);
        alert('Failed to open billing portal');
    }
}

// Expose for debugging
window.pricingState = state;
window.openBillingPortal = openBillingPortal;
