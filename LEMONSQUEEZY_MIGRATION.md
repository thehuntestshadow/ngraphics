# LemonSqueezy Migration Plan

Migrate from Stripe to LemonSqueezy for international B2B sales compliance.

## Why LemonSqueezy?

| Benefit | Description |
|---------|-------------|
| **Merchant of Record** | LemonSqueezy is the legal seller - they handle all tax compliance |
| **Automatic VAT/Tax** | EU VAT, UK VAT, US sales tax, etc. - all handled automatically |
| **B2B Invoicing** | Proper invoices with VAT IDs for business customers |
| **Global Pricing** | Show EUR prices to EU, GBP to UK, etc. |
| **No Registration** | No need to register for VAT in each country |

**Trade-off:** Higher fees (5% + $0.50 vs Stripe's 2.9% + $0.30)

---

## Current Architecture (Stripe)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CURRENT FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  pricing.html                                                    │
│       │                                                          │
│       ▼                                                          │
│  Stripe Payment Link ──────────────────────────┐                 │
│  (buy.stripe.com/xxx)                          │                 │
│       │                                        │                 │
│       ▼                                        ▼                 │
│  Stripe Checkout ────────► Stripe ────► stripe-webhook          │
│                                         (Edge Function)         │
│                                              │                   │
│                                              ▼                   │
│                                         Supabase                 │
│                                         - subscriptions          │
│                                         - credits                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Target Architecture (LemonSqueezy)

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEW FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  pricing.html                                                    │
│       │                                                          │
│       ▼                                                          │
│  LemonSqueezy Checkout URL ────────────────────┐                 │
│  (hefaistos.lemonsqueezy.com/buy/xxx)          │                 │
│       │                                        │                 │
│       ▼                                        ▼                 │
│  LS Checkout ────────► LemonSqueezy ───► lemonsqueezy-webhook   │
│  (handles tax, VAT ID)                   (Edge Function)        │
│                                              │                   │
│                                              ▼                   │
│                                         Supabase                 │
│                                         - subscriptions          │
│                                         - credits                │
│                                                                  │
│  Customer Portal: hefaistos.lemonsqueezy.com/billing             │
│  (manage subscription, update payment, download invoices)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: LemonSqueezy Setup (Day 1)

### 1.1 Create Account

1. Sign up at [lemonsqueezy.com](https://lemonsqueezy.com)
2. Complete business verification (requires ID, address proof)
3. Set up payout method (bank account or PayPal)

### 1.2 Store Settings

1. **Store Name**: HEFAISTOS
2. **Store URL**: hefaistos.lemonsqueezy.com
3. **Support Email**: support@hefaistos.xyz
4. **Logo/Branding**: Upload HEFAISTOS logo

### 1.3 Tax Settings

1. Go to Settings → Tax
2. Enable "Collect tax automatically"
3. Enter your business address (for nexus determination)
4. LemonSqueezy handles the rest automatically

### 1.4 Create Products

| Product | Type | Description |
|---------|------|-------------|
| HEFAISTOS Pro | Subscription | For solo sellers and small brands |
| HEFAISTOS Business | Subscription | For agencies and power users |
| Credits Pack (50) | One-time | 50 generation credits |
| Credits Pack (200) | One-time | 200 generation credits |

### 1.5 Create Variants (Prices)

**Pro Subscription:**
| Variant | Price | Billing |
|---------|-------|---------|
| Pro Monthly | $19/mo | Monthly |
| Pro Yearly | $180/yr ($15/mo) | Yearly |

**Business Subscription:**
| Variant | Price | Billing |
|---------|-------|---------|
| Business Monthly | $49/mo | Monthly |
| Business Yearly | $468/yr ($39/mo) | Yearly |

**Credits:**
| Variant | Price | Type |
|---------|-------|------|
| 50 Credits | $5 | One-time |
| 200 Credits | $15 | One-time |

### 1.6 Checkout Settings

1. Enable "Collect billing address" (required for tax)
2. Enable "Collect tax ID" (for B2B customers)
3. Set success URL: `https://hefaistos.xyz/pricing.html?checkout=success`
4. Set cancel URL: `https://hefaistos.xyz/pricing.html`

### 1.7 Webhook Setup

1. Go to Settings → Webhooks
2. Create webhook:
   - **URL**: `https://rodzatuqkfqcdqgntdnd.supabase.co/functions/v1/lemonsqueezy-webhook`
   - **Events**: All subscription and order events
3. Copy the **Signing Secret** for verification

---

## Phase 2: Backend Changes (Day 2-3)

### 2.1 Database Updates

No schema changes needed - the `subscriptions` table works for both:

```sql
-- Optional: Add LemonSqueezy fields (non-breaking)
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ls_customer_id TEXT,
ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT;

-- Keep Stripe fields for existing customers during transition
-- stripe_customer_id, stripe_subscription_id remain
```

### 2.2 Create LemonSqueezy Webhook Edge Function

Create `supabase/functions/lemonsqueezy-webhook/index.ts`:

```typescript
/**
 * HEFAISTOS - LemonSqueezy Webhook Edge Function
 * Handles LemonSqueezy events for subscriptions and payments
 *
 * Deploy: supabase functions deploy lemonsqueezy-webhook
 * Set secrets:
 *   supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.168.0/crypto/mod.ts'

const WEBHOOK_SECRET = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Map LemonSqueezy variant IDs to tier IDs
// Replace with your actual variant IDs from LemonSqueezy dashboard
const VARIANT_TO_TIER: Record<string, string> = {
  'variant_pro_monthly': 'pro',
  'variant_pro_yearly': 'pro',
  'variant_business_monthly': 'business',
  'variant_business_yearly': 'business',
}

// Map variant IDs to credit amounts
const VARIANT_TO_CREDITS: Record<string, number> = {
  'variant_credits_50': 50,
  'variant_credits_200': 200,
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const hmac = createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return digest === signature
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Verify webhook signature
    const signature = req.headers.get('x-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    const body = await req.text()

    const isValid = await verifySignature(body, signature)
    if (!isValid) {
      console.error('Webhook signature verification failed')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)
    const eventName = event.meta.event_name
    const data = event.data

    console.log('Received event:', eventName)

    switch (eventName) {
      // ============================================
      // SUBSCRIPTION EVENTS
      // ============================================

      case 'subscription_created': {
        const customEmail = data.attributes.user_email
        const variantId = data.attributes.variant_id.toString()
        const lsCustomerId = data.attributes.customer_id.toString()
        const lsSubscriptionId = data.id

        // Find user by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customEmail)
          .single()

        if (!profile) {
          console.error('No user found for email:', customEmail)
          break
        }

        const tierId = VARIANT_TO_TIER[variantId] || 'pro'

        // Update subscription
        await supabase.from('subscriptions').upsert({
          user_id: profile.id,
          tier_id: tierId,
          ls_customer_id: lsCustomerId,
          ls_subscription_id: lsSubscriptionId,
          status: 'active',
          current_period_start: data.attributes.created_at,
          current_period_end: data.attributes.renews_at
        }, { onConflict: 'user_id' })

        console.log(`User ${profile.id} subscribed to ${tierId}`)
        break
      }

      case 'subscription_updated': {
        const lsSubscriptionId = data.id
        const status = data.attributes.status // active, cancelled, expired, past_due
        const variantId = data.attributes.variant_id.toString()

        // Find subscription by LS subscription ID
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('ls_subscription_id', lsSubscriptionId)
          .single()

        if (!sub) {
          console.error('No subscription found for:', lsSubscriptionId)
          break
        }

        const tierId = VARIANT_TO_TIER[variantId] || 'pro'

        // Map LS status to our status
        let ourStatus = 'active'
        if (status === 'cancelled' || status === 'expired') {
          ourStatus = 'cancelled'
        } else if (status === 'past_due') {
          ourStatus = 'past_due'
        }

        await supabase.from('subscriptions').update({
          tier_id: tierId,
          status: ourStatus,
          current_period_end: data.attributes.renews_at
        }).eq('user_id', sub.user_id)

        console.log(`Subscription updated for user ${sub.user_id}: ${ourStatus}`)
        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const lsSubscriptionId = data.id

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('ls_subscription_id', lsSubscriptionId)
          .single()

        if (!sub) break

        // Downgrade to free tier
        await supabase.from('subscriptions').update({
          tier_id: 'free',
          status: 'cancelled',
          ls_subscription_id: null
        }).eq('user_id', sub.user_id)

        console.log(`User ${sub.user_id} subscription cancelled, downgraded to free`)
        break
      }

      case 'subscription_payment_failed': {
        const lsSubscriptionId = data.id

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('ls_subscription_id', lsSubscriptionId)
          .single()

        if (!sub) break

        await supabase.from('subscriptions').update({
          status: 'past_due'
        }).eq('user_id', sub.user_id)

        console.log(`Payment failed for user ${sub.user_id}`)
        break
      }

      // ============================================
      // ORDER EVENTS (One-time purchases / Credits)
      // ============================================

      case 'order_created': {
        const customEmail = data.attributes.user_email
        const variantId = data.attributes.first_order_item?.variant_id?.toString()
        const orderId = data.id

        // Check if this is a credits purchase
        const credits = VARIANT_TO_CREDITS[variantId]
        if (!credits) {
          // Not a credits purchase (might be subscription first payment)
          break
        }

        // Find user by email
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customEmail)
          .single()

        if (!profile) {
          console.error('No user found for email:', customEmail)
          break
        }

        // Add credits
        await supabase.rpc('add_credits', {
          p_user_id: profile.id,
          p_amount: credits,
          p_description: `Purchased ${credits} credits`,
          p_stripe_payment_id: `ls_${orderId}` // Reuse field, prefix with ls_
        })

        console.log(`User ${profile.id} purchased ${credits} credits`)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventName}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 2.3 Deploy and Configure

```bash
# Deploy the new webhook function
supabase functions deploy lemonsqueezy-webhook

# Set the webhook secret
supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## Phase 3: Frontend Changes (Day 3-4)

### 3.1 Update config.js

```javascript
const CONFIG = {
    // ... existing config ...

    // LemonSqueezy (replaces Stripe for new purchases)
    LEMONSQUEEZY_STORE_ID: 'your_store_id',
    LEMONSQUEEZY_CHECKOUT_URLS: {
        PRO_MONTHLY: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}',
        PRO_YEARLY: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}',
        BUSINESS_MONTHLY: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}',
        BUSINESS_YEARLY: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}',
        CREDITS_50: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}',
        CREDITS_200: 'https://hefaistos.lemonsqueezy.com/buy/xxx?checkout[custom][user_email]={email}'
    },
    LEMONSQUEEZY_CUSTOMER_PORTAL: 'https://hefaistos.lemonsqueezy.com/billing',

    // Keep Stripe config for existing subscribers (read-only)
    STRIPE_PUBLISHABLE_KEY: 'pk_live_xxx', // For billing portal only
    // ... rest of Stripe config for legacy support ...
};
```

### 3.2 Update pricing.js

```javascript
// Replace handleUpgrade function
async function handleUpgrade(tier) {
    // Get checkout URL based on tier and billing period
    const urlKey = `${tier.toUpperCase()}_${state.billing.toUpperCase()}`;
    let checkoutUrl = CONFIG.LEMONSQUEEZY_CHECKOUT_URLS?.[urlKey];

    if (!checkoutUrl) {
        console.error('Checkout URL not found for:', urlKey);
        alert('Checkout not available. Please try again later.');
        return;
    }

    // Show loading state
    const btn = document.getElementById(`cta${tier.charAt(0).toUpperCase() + tier.slice(1)}`);
    if (btn) {
        btn.classList.add('loading');
        btn.disabled = true;
    }

    // Pre-fill email if user is authenticated
    if (typeof ngSupabase !== 'undefined' && ngSupabase.isAuthenticated && ngSupabase.user?.email) {
        checkoutUrl = checkoutUrl.replace('{email}', encodeURIComponent(ngSupabase.user.email));
    } else {
        // Remove the placeholder if not authenticated
        checkoutUrl = checkoutUrl.replace('?checkout[custom][user_email]={email}', '');
    }

    // Redirect to LemonSqueezy checkout
    window.location.href = checkoutUrl;
}

// Replace handleCreditPurchase function
async function handleCreditPurchase(priceId) {
    const urlKey = priceId.toUpperCase(); // credits_50 -> CREDITS_50
    let checkoutUrl = CONFIG.LEMONSQUEEZY_CHECKOUT_URLS?.[urlKey];

    if (!checkoutUrl) {
        console.error('Checkout URL not found for:', urlKey);
        alert('Checkout not available. Please try again later.');
        return;
    }

    const btn = document.querySelector(`[data-price="${priceId}"]`);
    if (btn) {
        btn.classList.add('loading');
        btn.disabled = true;
    }

    // Pre-fill email if authenticated
    if (typeof ngSupabase !== 'undefined' && ngSupabase.isAuthenticated && ngSupabase.user?.email) {
        checkoutUrl = checkoutUrl.replace('{email}', encodeURIComponent(ngSupabase.user.email));
    } else {
        checkoutUrl = checkoutUrl.replace('?checkout[custom][user_email]={email}', '');
    }

    window.location.href = checkoutUrl;
}

// Update billing portal function
async function openBillingPortal() {
    if (!ngSupabase.isAuthenticated) return;

    // Check if user has LemonSqueezy subscription
    const { data: sub } = await ngSupabase.client
        .from('subscriptions')
        .select('ls_subscription_id, stripe_subscription_id')
        .eq('user_id', ngSupabase.user.id)
        .single();

    if (sub?.ls_subscription_id) {
        // LemonSqueezy customer - redirect to LS portal
        window.location.href = CONFIG.LEMONSQUEEZY_CUSTOMER_PORTAL;
    } else if (sub?.stripe_subscription_id) {
        // Legacy Stripe customer - use Stripe billing portal
        // Keep existing Stripe billing portal logic
        try {
            const response = await fetch(
                `${CONFIG.SUPABASE_URL}/functions/v1/billing-portal`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ngSupabase.session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ returnUrl: window.location.href })
                }
            );
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (error) {
            console.error('Billing portal error:', error);
            alert('Failed to open billing portal');
        }
    }
}
```

### 3.3 Update settings.js (Billing Section)

```javascript
// In renderBillingSection or loadUsageSettings
async function loadBillingSettings() {
    const { data: sub } = await ngSupabase.client
        .from('subscriptions')
        .select('tier_id, status, ls_subscription_id, stripe_subscription_id')
        .eq('user_id', ngSupabase.user.id)
        .single();

    // Determine which portal to show
    const manageBtn = document.getElementById('manageSubscriptionBtn');
    if (manageBtn) {
        if (sub?.ls_subscription_id) {
            manageBtn.onclick = () => {
                window.location.href = CONFIG.LEMONSQUEEZY_CUSTOMER_PORTAL;
            };
            manageBtn.textContent = 'Manage Subscription';
        } else if (sub?.stripe_subscription_id) {
            manageBtn.onclick = openBillingPortal;
            manageBtn.textContent = 'Manage Subscription (Legacy)';
        } else {
            manageBtn.onclick = () => {
                window.location.href = 'pricing.html';
            };
            manageBtn.textContent = 'Upgrade';
        }
    }
}
```

### 3.4 Remove Stripe.js from pricing.html

```html
<!-- Remove this line -->
<!-- <script src="https://js.stripe.com/v3/"></script> -->

<!-- Stripe.js is no longer needed for new purchases -->
<!-- Keep it only if you need Stripe billing portal for legacy customers -->
```

---

## Phase 4: Testing (Day 4-5)

### 4.1 LemonSqueezy Test Mode

1. In LemonSqueezy dashboard, enable Test Mode
2. Get test checkout URLs
3. Update config.js with test URLs

### 4.2 Test Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| New Pro subscription | Click upgrade, complete checkout | User gets Pro tier, receives invoice email |
| New Business subscription | Click upgrade, complete checkout | User gets Business tier |
| Credit purchase | Buy 50 credits | Credits added to balance |
| Subscription cancellation | Cancel in LS portal | User downgraded to Free at period end |
| Payment failure | Use test card that fails | Status set to past_due |
| B2B with VAT ID | Enter EU VAT ID at checkout | Invoice shows reverse charge |

### 4.3 Webhook Testing

```bash
# Use LemonSqueezy CLI or webhook.site to test locally
# Forward webhooks to your local Edge Function

# Test with Supabase local dev
supabase functions serve lemonsqueezy-webhook --env-file .env.local
```

---

## Phase 5: Migration Strategy (Day 5-6)

### 5.1 Existing Stripe Subscribers

**Strategy: Grandfather existing customers on Stripe**

- Keep Stripe webhook running for existing subscribers
- They continue billing through Stripe until they cancel
- When they cancel and re-subscribe, they go through LemonSqueezy
- Billing portal detects which system they're on

### 5.2 Database Migration

```sql
-- Add LemonSqueezy fields without breaking existing data
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS ls_customer_id TEXT,
ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT;

-- No data migration needed - existing Stripe customers keep their data
-- New LemonSqueezy customers get ls_* fields populated
```

### 5.3 Gradual Rollout

| Day | Action |
|-----|--------|
| 1 | Deploy LS webhook (inactive, just logging) |
| 2 | Test with internal team accounts |
| 3 | Enable LS checkout for new signups (keep Stripe for existing) |
| 7 | Monitor, fix any issues |
| 14 | Full launch, update pricing page |
| 30 | Disable Stripe for new purchases |
| 90 | All existing Stripe customers naturally migrated or still grandfathered |

---

## Phase 6: Go Live Checklist

### Pre-Launch

- [ ] LemonSqueezy account verified and approved
- [ ] All products and variants created
- [ ] Webhook endpoint deployed and tested
- [ ] Config updated with production URLs
- [ ] Test purchases successful
- [ ] Invoice emails look correct
- [ ] Customer portal accessible

### Launch Day

- [ ] Switch config to production LemonSqueezy URLs
- [ ] Deploy frontend changes
- [ ] Monitor webhook logs for errors
- [ ] Test one real purchase
- [ ] Verify subscription shows in Supabase

### Post-Launch

- [ ] Monitor conversion rates
- [ ] Check customer support for billing issues
- [ ] Review LemonSqueezy analytics
- [ ] Ensure invoices are being delivered

---

## Files Changed Summary

| File | Change |
|------|--------|
| `config.js` | Add LemonSqueezy URLs, keep Stripe for legacy |
| `pricing.js` | Update checkout functions to use LS |
| `settings.js` | Update billing portal logic |
| `pricing.html` | Remove Stripe.js (optional) |
| `supabase/functions/lemonsqueezy-webhook/index.ts` | New webhook handler |
| `supabase/migrations/xxx_add_lemonsqueezy.sql` | Add ls_* columns |

---

## Cost Comparison

| Plan | Monthly | Stripe Fee (2.9%+$0.30) | LS Fee (5%+$0.50) | Difference |
|------|---------|-------------------------|-------------------|------------|
| Pro Monthly | $19 | $0.85 | $1.45 | +$0.60 |
| Pro Yearly | $180 | $5.52 | $9.50 | +$3.98 |
| Business Monthly | $49 | $1.72 | $2.95 | +$1.23 |
| Business Yearly | $468 | $13.87 | $23.90 | +$10.03 |
| Credits 50 | $5 | $0.45 | $0.75 | +$0.30 |
| Credits 200 | $15 | $0.74 | $1.25 | +$0.51 |

**At 100 paid customers (75 Pro, 25 Business):**
- Stripe fees: ~$130/mo
- LemonSqueezy fees: ~$220/mo
- Difference: ~$90/mo

**But you save:**
- VAT registration fees (~$500-2000/year per country)
- Accountant fees for VAT filing (~$100-500/quarter)
- Time spent on tax compliance (~10-20 hours/quarter)
- Risk of VAT audit penalties

---

## Support Resources

- [LemonSqueezy Docs](https://docs.lemonsqueezy.com)
- [Webhook Events Reference](https://docs.lemonsqueezy.com/api/webhooks)
- [Checkout Customization](https://docs.lemonsqueezy.com/help/checkout/customizing-checkout)
- [Customer Portal](https://docs.lemonsqueezy.com/help/online-store/customer-portal)
