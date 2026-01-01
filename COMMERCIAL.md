# HEFAISTOS Commercial Strategy

## Executive Summary

Transform HEFAISTOS from a free tool to a sustainable SaaS business while maintaining the "works without account" philosophy that makes it accessible.

---

## Current State

| Aspect | Current | Problem |
|--------|---------|---------|
| API Keys | Users provide their own OpenRouter key | Works but friction for non-technical users |
| Revenue | None | Unsustainable |
| Hosting | Free tier / personal server | Costs scale with users |
| User data | Local only (optional cloud sync) | No usage insights |

---

## Monetization Model: Freemium Hybrid

### Recommended Pricing Tiers

| Tier | Price | Target User | Features |
|------|-------|-------------|----------|
| **Free** | $0 | Hobbyists, evaluators | BYOK (bring your own key), local storage, all tools, watermark on exports |
| **Pro** | $19/mo | Solo sellers, small brands | API included (200 gen/mo), cloud sync, no watermark, priority queue |
| **Business** | $49/mo | Agencies, power users | API included (1000 gen/mo), team seats, API access, white-label exports |
| **Enterprise** | Custom | Large brands | Unlimited, dedicated support, custom integrations, SLA |

### Why This Model Works

1. **Free tier costs nothing** - Users bring their own API key, you only pay Supabase free tier
2. **Clear upgrade path** - "Skip the API key hassle, just generate"
3. **Sustainable margins** - OpenRouter costs ~$0.01-0.05 per generation, you charge $0.10+ equivalent
4. **No commitment option** - Credits packages for occasional users ($5 = 50 generations)

---

## Technical Architecture

### Current Flow (Free/BYOK)
```
User Browser → OpenRouter API (user's key)
```

### Commercial Flow (Paid Users)
```
User Browser → Supabase Edge Function → OpenRouter API (your key)
                      ↓
              Usage Tracking DB
                      ↓
              Limit Enforcement
```

### Why Supabase Edge Functions?

1. Already using Supabase for auth
2. Secrets management built-in (no exposed API keys)
3. Same infrastructure, less complexity
4. Cold starts acceptable for AI generation (already slow)

---

## Database Schema Additions

```sql
-- Subscription tiers
CREATE TABLE subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INT NOT NULL,
  generations_per_month INT,  -- NULL = unlimited
  features JSONB DEFAULT '{}'
);

INSERT INTO subscription_tiers VALUES
  ('free', 'Free', 0, 0, '{"byok": true, "watermark": true}'),
  ('pro', 'Pro', 1900, 200, '{"byok": false, "watermark": false, "cloud_sync": true}'),
  ('business', 'Business', 4900, 1000, '{"byok": false, "watermark": false, "cloud_sync": true, "api_access": true}');

-- User subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles NOT NULL UNIQUE,
  tier_id TEXT REFERENCES subscription_tiers NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, past_due
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles NOT NULL,
  studio TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  cost_cents INT DEFAULT 0,  -- Track actual API cost
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly usage summary (for quick limit checks)
CREATE TABLE usage_monthly (
  user_id UUID REFERENCES profiles NOT NULL,
  month DATE NOT NULL,  -- First day of month
  generation_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  cost_cents INT DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- Credits for pay-as-you-go
CREATE TABLE credits (
  user_id UUID REFERENCES profiles PRIMARY KEY,
  balance INT DEFAULT 0,  -- Number of generations remaining
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles NOT NULL,
  amount INT NOT NULL,  -- Positive = purchase, negative = usage
  description TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Users can only see their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage is insert-only by Edge Functions, read by user
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- Service role inserts usage (Edge Functions)
CREATE POLICY "Service can insert usage" ON usage
  FOR INSERT WITH CHECK (true);  -- Edge Functions use service role
```

---

## Edge Functions

### 1. `generate-image` - API Proxy
```typescript
// supabase/functions/generate-image/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Get user from auth header
  const authHeader = req.headers.get('Authorization')
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  )

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Check subscription and usage limits
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('tier_id, subscription_tiers(*)')
    .eq('user_id', user.id)
    .single()

  const tier = sub?.subscription_tiers || { id: 'free', generations_per_month: 0 }

  // Free tier must use BYOK
  if (tier.id === 'free') {
    return new Response(JSON.stringify({
      error: 'Free tier requires your own API key',
      code: 'BYOK_REQUIRED'
    }), { status: 403 })
  }

  // Check monthly limit
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: usage } = await supabase
    .from('usage_monthly')
    .select('generation_count')
    .eq('user_id', user.id)
    .eq('month', monthStart.toISOString().split('T')[0])
    .single()

  const currentUsage = usage?.generation_count || 0

  if (tier.generations_per_month && currentUsage >= tier.generations_per_month) {
    return new Response(JSON.stringify({
      error: 'Monthly generation limit reached',
      code: 'LIMIT_REACHED',
      limit: tier.generations_per_month,
      used: currentUsage
    }), { status: 429 })
  }

  // Proxy request to OpenRouter
  const body = await req.json()

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hefaistos.xyz',
      'X-Title': 'HEFAISTOS'
    },
    body: JSON.stringify(body)
  })

  const result = await response.json()

  // Track usage (don't block on this)
  supabase.from('usage').insert({
    user_id: user.id,
    studio: body.studio || 'unknown',
    model: body.model,
    tokens_used: result.usage?.total_tokens || 0
  }).then(() => {})

  // Update monthly counter
  supabase.rpc('increment_monthly_usage', {
    p_user_id: user.id,
    p_month: monthStart.toISOString().split('T')[0]
  }).then(() => {})

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 2. `create-checkout` - Stripe Integration
```typescript
// supabase/functions/create-checkout/index.ts
import Stripe from 'https://esm.sh/stripe@12'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16'
})

const PRICES = {
  pro_monthly: 'price_xxx',      // Create in Stripe Dashboard
  pro_yearly: 'price_xxx',
  business_monthly: 'price_xxx',
  business_yearly: 'price_xxx',
  credits_50: 'price_xxx',       // One-time purchase
  credits_200: 'price_xxx'
}

serve(async (req) => {
  const { priceId, successUrl, cancelUrl } = await req.json()

  // Get user
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const authHeader = req.headers.get('Authorization')
  const { data: { user } } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '')
  )

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Get or create Stripe customer
  let { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id }
    })
    customerId = customer.id

    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: customerId
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: PRICES[priceId], quantity: 1 }],
    mode: priceId.includes('credits') ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { user_id: user.id }
  })

  return new Response(JSON.stringify({ url: session.url }))
})
```

### 3. `stripe-webhook` - Handle Payments
```typescript
// supabase/functions/stripe-webhook/index.ts
serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  )

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata.user_id

      if (session.mode === 'subscription') {
        // Subscription purchase
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        const priceId = subscription.items.data[0].price.id
        const tierId = priceId.includes('business') ? 'business' : 'pro'

        await supabase.from('subscriptions').update({
          tier_id: tierId,
          stripe_subscription_id: subscription.id,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000)
        }).eq('user_id', userId)

      } else {
        // Credits purchase
        const amount = session.amount_total === 500 ? 50 : 200  // Map price to credits

        await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: amount,
          p_description: `Purchased ${amount} credits`,
          p_stripe_payment_id: session.payment_intent
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase.from('subscriptions')
        .update({ tier_id: 'free', status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }))
})
```

---

## Environment Variables

### Supabase Secrets (set via CLI or Dashboard)
```bash
# Set secrets for Edge Functions
supabase secrets set OPENROUTER_API_KEY=sk-or-xxx
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Client-Side Config
The Supabase anon key is **designed** to be public - it's a "publishable" key with RLS protection. However, for cleaner deployment:

```javascript
// config.js - Can be generated at build/deploy time
const CONFIG = {
  SUPABASE_URL: 'https://rodzatuqkfqcdqgntdnd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_...',
  STRIPE_PUBLISHABLE_KEY: 'pk_live_...',
  APP_URL: 'https://hefaistos.xyz'
};
```

For Coolify, you can inject these at deploy time:
```bash
# In Coolify build settings
echo "const CONFIG = {
  SUPABASE_URL: '$SUPABASE_URL',
  SUPABASE_ANON_KEY: '$SUPABASE_ANON_KEY',
  STRIPE_PUBLISHABLE_KEY: '$STRIPE_PUBLISHABLE_KEY',
  APP_URL: '$APP_URL'
};" > config.js
```

---

## Client-Side Changes

### 1. Modify `api.js` to Support Proxy
```javascript
// In APIClient class
async _makeRequest(endpoint, options) {
  // Check if user has paid subscription
  const useProxy = ngSupabase.isAuthenticated &&
                   await this._hasPaidSubscription();

  if (useProxy) {
    // Route through Edge Function
    return this._makeProxyRequest(endpoint, options);
  } else {
    // Direct to OpenRouter (BYOK)
    return this._makeDirectRequest(endpoint, options);
  }
}

async _makeProxyRequest(endpoint, options) {
  const response = await fetch(
    `${CONFIG.SUPABASE_URL}/functions/v1/generate-image`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ngSupabase.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...options.body,
        studio: this._currentStudio  // For usage tracking
      })
    }
  );

  if (response.status === 403) {
    const error = await response.json();
    if (error.code === 'BYOK_REQUIRED') {
      // Fall back to direct request
      return this._makeDirectRequest(endpoint, options);
    }
  }

  return response;
}
```

### 2. Add Pricing Page
Create `pricing.html` with tier comparison and Stripe checkout buttons.

### 3. Add Usage Dashboard
Show in account menu:
- Current tier
- Usage this month
- Upgrade button
- Manage subscription link (Stripe portal)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create config.js with environment variables
- [ ] Update supabase.js to use config
- [ ] Create subscription/usage database tables
- [ ] Set up Stripe account and products

### Phase 2: Edge Functions (Week 2)
- [ ] Create generate-image proxy function
- [ ] Create create-checkout function
- [ ] Create stripe-webhook function
- [ ] Test locally with Supabase CLI

### Phase 3: Client Integration (Week 3)
- [ ] Modify api.js for proxy routing
- [ ] Create pricing.html page
- [ ] Add usage display to account menu
- [ ] Add upgrade prompts

### Phase 4: Polish (Week 4)
- [ ] Add watermark logic for free tier
- [ ] Create billing portal integration
- [ ] Add email notifications (Supabase + Resend)
- [ ] Analytics and monitoring

---

## Revenue Projections

| Users | Free | Pro | Business | MRR |
|-------|------|-----|----------|-----|
| 100 | 80 | 15 | 5 | $530 |
| 500 | 400 | 75 | 25 | $2,650 |
| 1000 | 800 | 150 | 50 | $5,300 |
| 5000 | 4000 | 750 | 250 | $26,500 |

*Assuming 20% convert to paid, 75% Pro / 25% Business split*

---

## Costs at Scale

| Users | OpenRouter | Supabase | Stripe Fees | Net Margin |
|-------|------------|----------|-------------|------------|
| 100 | ~$50/mo | Free tier | ~$15 | ~88% |
| 1000 | ~$500/mo | $25/mo | ~$150 | ~87% |
| 5000 | ~$2500/mo | $599/mo | ~$750 | ~85% |

*OpenRouter cost assumes ~$0.25/user/mo average for paid users*

---

## Questions to Decide

1. **Watermark on free tier?** - Adds friction, encourages upgrade
2. **Credit expiration?** - Credits expire after 1 year?
3. **Team features?** - Business tier only?
4. **Annual discount?** - 20% off for yearly billing?
5. **Trial period?** - 7-day Pro trial for new signups?
