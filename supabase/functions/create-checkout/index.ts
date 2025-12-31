/**
 * NGRAPHICS - Create Checkout Edge Function
 * Creates Stripe checkout sessions for subscriptions and credits
 *
 * Deploy: supabase functions deploy create-checkout
 * Set secrets:
 *   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// TODO: Create these prices in Stripe Dashboard and update IDs
const PRICES: Record<string, string> = {
  pro_monthly: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
  pro_yearly: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
  business_monthly: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
  business_yearly: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
  credits_50: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
  credits_200: 'price_REPLACE_WITH_STRIPE_PRICE_ID',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { priceId, successUrl, cancelUrl } = await req.json()

    if (!priceId || !PRICES[priceId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid price ID', validPrices: Object.keys(PRICES) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get or create Stripe customer
    let { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = sub?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      })
      customerId = customer.id

      // Save to subscriptions table
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        tier_id: 'free',
        stripe_customer_id: customerId,
        status: 'active'
      })
    }

    // Determine if subscription or one-time
    const isCredits = priceId.startsWith('credits_')

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price: PRICES[priceId],
        quantity: 1
      }],
      mode: isCredits ? 'payment' : 'subscription',
      success_url: successUrl || 'https://hefaistos.xyz/?checkout=success',
      cancel_url: cancelUrl || 'https://hefaistos.xyz/?checkout=cancelled',
      metadata: {
        user_id: user.id,
        price_id: priceId
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Collect billing address for subscriptions
      billing_address_collection: isCredits ? 'auto' : 'required',
    })

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
