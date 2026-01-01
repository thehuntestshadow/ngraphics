-- HEFAISTOS - Fix RLS Policies
-- Run this in Supabase SQL Editor to fix 500 errors
-- This script drops and recreates all policies correctly

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Ensure profiles table has correct structure
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;
DROP POLICY IF EXISTS "Profiles are editable by owner" ON profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SUBSCRIPTIONS TABLE
-- ============================================

-- Create if not exists
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tier_id TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable read for own subscription" ON subscriptions;

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. CREDITS TABLE
-- ============================================

-- Create if not exists
CREATE TABLE IF NOT EXISTS credits (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own credits" ON credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON credits;
DROP POLICY IF EXISTS "Enable read for own credits" ON credits;

-- Enable RLS
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Users can view own credits"
ON credits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
ON credits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. USAGE_MONTHLY TABLE
-- ============================================

-- Create if not exists
CREATE TABLE IF NOT EXISTS usage_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month DATE NOT NULL,
    generation_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own usage" ON usage_monthly;
DROP POLICY IF EXISTS "Users can insert own usage" ON usage_monthly;
DROP POLICY IF EXISTS "Users can update own usage" ON usage_monthly;

-- Enable RLS
ALTER TABLE usage_monthly ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Users can view own usage"
ON usage_monthly FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON usage_monthly FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
ON usage_monthly FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 5. VERIFY ADMIN STATUS
-- ============================================

-- Set is_admin = true for your email addresses
UPDATE profiles SET is_admin = TRUE
WHERE email IN ('auerbach.impex@gmail.com', 'your-other-email@example.com');

-- ============================================
-- 6. VERIFICATION QUERY
-- ============================================

-- Run this to verify everything works:
SELECT
    p.id,
    p.email,
    p.is_admin,
    s.tier_id,
    s.status,
    c.balance as credits,
    u.generation_count
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
LEFT JOIN credits c ON c.user_id = p.id
LEFT JOIN usage_monthly u ON u.user_id = p.id AND u.month = DATE_TRUNC('month', CURRENT_DATE)::DATE
WHERE p.email = 'auerbach.impex@gmail.com';
