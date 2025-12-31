/**
 * NGRAPHICS - Stripe Webhook Edge Function
 * Handles Stripe events for subscriptions and payments
 *
 * Deploy: supabase functions deploy stripe-webhook
 * Set secrets:
 *   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
 *   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
 *
 * Configure webhook in Stripe Dashboard:
 *   URL: https://[project-ref].supabase.co/functions/v1/stripe-webhook
 *   Events: checkout.session.completed, customer.subscription.updated,
 *           customer.subscription.deleted, invoice.payment_failed
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Map Stripe price IDs to tier IDs
const PRICE_TO_TIER: Record<string, string> = {
  'price_pro_monthly': 'pro',
  'price_pro_yearly': 'pro',
  'price_business_monthly': 'business',
  'price_business_yearly': 'business',
}

// Map credit price IDs to amounts
const PRICE_TO_CREDITS: Record<string, number> = {
  'price_credits_50': 50,
  'price_credits_200': 200,
}

serve(async (req) => {
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing signature', { status: 400 })
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const priceId = session.metadata?.price_id

        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        if (session.mode === 'subscription') {
          // Subscription purchase
          const subscriptionId = session.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const stripePriceId = subscription.items.data[0]?.price.id

          // Determine tier from price
          const tierId = PRICE_TO_TIER[stripePriceId] || 'pro'

          await supabase.from('subscriptions').update({
            tier_id: tierId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          }).eq('user_id', userId)

          console.log(`User ${userId} subscribed to ${tierId}`)

        } else if (session.mode === 'payment') {
          // One-time payment (credits)
          const credits = PRICE_TO_CREDITS[priceId || ''] || 50

          await supabase.rpc('add_credits', {
            p_user_id: userId,
            p_amount: credits,
            p_description: `Purchased ${credits} credits`,
            p_stripe_payment_id: session.payment_intent as string
          })

          console.log(`User ${userId} purchased ${credits} credits`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by Stripe customer ID
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!sub) {
          console.error('No user found for customer:', customerId)
          break
        }

        const stripePriceId = subscription.items.data[0]?.price.id
        const tierId = PRICE_TO_TIER[stripePriceId] || 'pro'

        await supabase.from('subscriptions').update({
          tier_id: tierId,
          status: subscription.status === 'active' ? 'active' :
                  subscription.status === 'past_due' ? 'past_due' : 'cancelled',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        }).eq('user_id', sub.user_id)

        console.log(`Subscription updated for user ${sub.user_id}: ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by Stripe customer ID
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!sub) {
          console.error('No user found for customer:', customerId)
          break
        }

        // Downgrade to free tier
        await supabase.from('subscriptions').update({
          tier_id: 'free',
          status: 'cancelled',
          stripe_subscription_id: null
        }).eq('user_id', sub.user_id)

        console.log(`User ${sub.user_id} subscription cancelled, downgraded to free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get user by Stripe customer ID
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!sub) break

        // Mark as past due
        await supabase.from('subscriptions').update({
          status: 'past_due'
        }).eq('user_id', sub.user_id)

        console.log(`Payment failed for user ${sub.user_id}`)
        // TODO: Send email notification about failed payment
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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
