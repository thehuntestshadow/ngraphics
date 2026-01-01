/**
 * HEFAISTOS - Generate Image Edge Function
 * Proxies OpenRouter API calls for paid users
 *
 * Deploy: supabase functions deploy generate-image
 * Set secrets: supabase secrets set OPENROUTER_API_KEY=sk-or-xxx
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data, error: authError } = await supabase.auth.getUser(token)

    if (authError || !data?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', code: 'AUTH_ERROR' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = data.user
    let isAdmin = false

    // Check if user is admin (bypass all restrictions)
    console.log('Checking profile for user:', user.id, user.email)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single()

    console.log('Profile query result:', JSON.stringify({ profile, error: profileError?.message }))

    // TEMPORARY: Force admin for debugging - remove after testing
    const adminEmails = ['auerbach.impex@gmail.com', 'thehuntestshadow@gmail.com']
    isAdmin = profile?.is_admin === true || adminEmails.includes(user.email || '')

    console.log('Admin check result:', user.email, 'isAdmin:', isAdmin, 'profileEmail:', profile?.email, 'forcedAdmin:', adminEmails.includes(user.email || ''))

    // DEBUG: Return debug info for troubleshooting
    const debugInfo = {
      userId: user.id,
      email: user.email,
      profileData: profile,
      profileError: profileError?.message,
      profileCode: profileError?.code,
      isAdmin,
      serviceKeySet: !!SUPABASE_SERVICE_KEY
    }

    // Get subscription and check tier
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier_id, status')
      .eq('user_id', user.id)
      .single()

    const tierId = sub?.tier_id || 'free'
    const isActive = sub?.status === 'active' || !sub // No sub means free

    // Subscription required - no free tier (admins bypass)
    if (tierId === 'free' && !isAdmin) {
      return new Response(
        JSON.stringify({
          error: 'Subscription required. Upgrade to Pro or Business to generate images.',
          code: 'SUBSCRIPTION_REQUIRED',
          tier: 'free',
          upgradeUrl: 'https://hefaistos.xyz/pricing.html',
          debug: debugInfo // Include debug info to troubleshoot
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription is active (admins bypass)
    if (!isActive && !isAdmin) {
      return new Response(
        JSON.stringify({
          error: 'Subscription is not active',
          code: 'SUBSCRIPTION_INACTIVE',
          status: sub?.status
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Admins have unlimited usage - skip limit checks
    if (!isAdmin) {
      // Get tier limits
      const { data: tier } = await supabase
        .from('subscription_tiers')
        .select('generations_per_month')
        .eq('id', tierId)
        .single()

      const monthlyLimit = tier?.generations_per_month

      // Check monthly usage if there's a limit
      if (monthlyLimit) {
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

        if (currentUsage >= monthlyLimit) {
          return new Response(
            JSON.stringify({
              error: 'Monthly generation limit reached',
              code: 'LIMIT_REACHED',
              limit: monthlyLimit,
              used: currentUsage,
              resetsAt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1).toISOString(),
              debug: debugInfo // Include debug info to troubleshoot
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Parse request body
    const body = await req.json()
    const { studio, ...openrouterPayload } = body

    // Proxy request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hefaistos.xyz',
        'X-Title': 'HEFAISTOS'
      },
      body: JSON.stringify(openrouterPayload)
    })

    const result = await response.json()

    // Log OpenRouter response for debugging
    console.log('OpenRouter response status:', response.status)
    console.log('OpenRouter result keys:', Object.keys(result))
    if (result.error) {
      console.log('OpenRouter error:', JSON.stringify(result.error))
    }
    if (result.choices?.[0]) {
      const content = result.choices[0].message?.content
      console.log('Content type:', typeof content, Array.isArray(content) ? 'array' : '')
      if (Array.isArray(content)) {
        console.log('Content parts:', content.map((p: any) => p.type || (p.inline_data ? 'inline_data' : 'unknown')))
      }
    }

    // Track usage (non-blocking)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthStr = monthStart.toISOString().split('T')[0]

    // Insert usage record
    supabase.from('usage').insert({
      user_id: user.id,
      studio: studio || 'unknown',
      model: openrouterPayload.model || 'unknown',
      tokens_used: result.usage?.total_tokens || 0
    }).then(() => {})

    // Increment monthly counter
    supabase.rpc('increment_monthly_usage', {
      p_user_id: user.id,
      p_month: monthStr
    }).then(() => {})

    // Return OpenRouter response
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
