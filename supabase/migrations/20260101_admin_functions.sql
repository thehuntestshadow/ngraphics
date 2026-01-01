-- HEFAISTOS - Admin Functions Migration
-- Fix admin panel by using SECURITY DEFINER functions to bypass RLS
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. HELPER FUNCTION: Check if current user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(
        (SELECT is_admin FROM profiles WHERE id = auth.uid()),
        FALSE
    );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- ============================================
-- 2. GET ADMIN STATS (bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_users BIGINT,
    active_subscriptions BIGINT,
    pro_subscribers BIGINT,
    business_subscribers BIGINT,
    mrr_dollars NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM profiles)::BIGINT as total_users,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active')::BIGINT as active_subscriptions,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND tier_id = 'pro')::BIGINT as pro_subscribers,
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND tier_id = 'business')::BIGINT as business_subscribers,
        (SELECT COALESCE(SUM(
            CASE
                WHEN tier_id = 'pro' THEN 19
                WHEN tier_id = 'business' THEN 49
                ELSE 0
            END
        ), 0) FROM subscriptions WHERE status = 'active')::NUMERIC as mrr_dollars;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;

-- ============================================
-- 3. GET ALL USERS (paginated, bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_users(
    p_search TEXT DEFAULT NULL,
    p_tier TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    is_admin BOOLEAN,
    created_at TIMESTAMPTZ,
    tier_id TEXT,
    subscription_status TEXT,
    credit_balance INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.email,
        p.full_name,
        COALESCE(p.is_admin, FALSE) as is_admin,
        p.created_at,
        COALESCE(s.tier_id, 'free') as tier_id,
        COALESCE(s.status, 'none') as subscription_status,
        COALESCE(c.balance, 0) as credit_balance
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id
    LEFT JOIN credits c ON c.user_id = p.id
    WHERE
        (p_search IS NULL OR p_search = '' OR
         p.email ILIKE '%' || p_search || '%' OR
         p.full_name ILIKE '%' || p_search || '%')
        AND (p_tier IS NULL OR p_tier = '' OR COALESCE(s.tier_id, 'free') = p_tier)
        AND (p_status IS NULL OR p_status = '' OR COALESCE(s.status, 'none') = p_status)
    ORDER BY p.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_users(TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- ============================================
-- 4. COUNT USERS (for pagination)
-- ============================================
CREATE OR REPLACE FUNCTION count_admin_users(
    p_search TEXT DEFAULT NULL,
    p_tier TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count BIGINT;
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    SELECT COUNT(*)
    INTO v_count
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id
    WHERE
        (p_search IS NULL OR p_search = '' OR
         p.email ILIKE '%' || p_search || '%' OR
         p.full_name ILIKE '%' || p_search || '%')
        AND (p_tier IS NULL OR p_tier = '' OR COALESCE(s.tier_id, 'free') = p_tier)
        AND (p_status IS NULL OR p_status = '' OR COALESCE(s.status, 'none') = p_status);

    RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION count_admin_users(TEXT, TEXT, TEXT) TO authenticated;

-- ============================================
-- 5. GET USER DETAILS (for user modal)
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_user_details(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN,
    created_at TIMESTAMPTZ,
    tier_id TEXT,
    subscription_status TEXT,
    subscription_started TIMESTAMPTZ,
    subscription_ends TIMESTAMPTZ,
    credit_balance INTEGER,
    generation_count INTEGER,
    month_start DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        p.id,
        p.email,
        p.full_name,
        p.avatar_url,
        COALESCE(p.is_admin, FALSE) as is_admin,
        p.created_at,
        COALESCE(s.tier_id, 'free') as tier_id,
        COALESCE(s.status, 'none') as subscription_status,
        s.current_period_start as subscription_started,
        s.current_period_end as subscription_ends,
        COALESCE(c.balance, 0) as credit_balance,
        COALESCE(u.generation_count, 0) as generation_count,
        DATE_TRUNC('month', CURRENT_DATE)::DATE as month_start
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id
    LEFT JOIN credits c ON c.user_id = p.id
    LEFT JOIN usage_monthly u ON u.user_id = p.id
        AND u.month = DATE_TRUNC('month', CURRENT_DATE)::DATE
    WHERE p.id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_user_details(UUID) TO authenticated;

-- ============================================
-- 6. UPDATE USER (admin action)
-- ============================================
CREATE OR REPLACE FUNCTION admin_update_user(
    p_user_id UUID,
    p_is_admin BOOLEAN DEFAULT NULL,
    p_tier_id TEXT DEFAULT NULL,
    p_credit_amount INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    v_admin_id := auth.uid();

    -- Update admin status if provided
    IF p_is_admin IS NOT NULL THEN
        UPDATE profiles SET is_admin = p_is_admin WHERE id = p_user_id;

        INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
        VALUES (v_admin_id, 'update_admin_status', p_user_id,
            jsonb_build_object('is_admin', p_is_admin));
    END IF;

    -- Update tier if provided
    IF p_tier_id IS NOT NULL THEN
        INSERT INTO subscriptions (user_id, tier_id, status)
        VALUES (p_user_id, p_tier_id, 'active')
        ON CONFLICT (user_id)
        DO UPDATE SET tier_id = p_tier_id, status = 'active', updated_at = NOW();

        INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
        VALUES (v_admin_id, 'update_tier', p_user_id,
            jsonb_build_object('tier_id', p_tier_id));
    END IF;

    -- Add credits if provided
    IF p_credit_amount IS NOT NULL AND p_credit_amount != 0 THEN
        INSERT INTO credits (user_id, balance)
        VALUES (p_user_id, GREATEST(p_credit_amount, 0))
        ON CONFLICT (user_id)
        DO UPDATE SET balance = GREATEST(credits.balance + p_credit_amount, 0), updated_at = NOW();

        INSERT INTO admin_audit_log (admin_id, action, target_user_id, details)
        VALUES (v_admin_id, 'adjust_credits', p_user_id,
            jsonb_build_object('amount', p_credit_amount));
    END IF;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_update_user(UUID, BOOLEAN, TEXT, INTEGER) TO authenticated;

-- ============================================
-- 7. GET SUBSCRIPTIONS (for subscriptions tab)
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_subscriptions()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    tier_id TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        s.id,
        s.user_id,
        p.email,
        s.tier_id,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.created_at
    FROM subscriptions s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.status = 'active'
    ORDER BY s.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_subscriptions() TO authenticated;

-- ============================================
-- 8. GET AUDIT LOGS (paginated)
-- ============================================
CREATE OR REPLACE FUNCTION get_admin_audit_logs(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    admin_email TEXT,
    action TEXT,
    target_email TEXT,
    details JSONB,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin status first
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        admin_p.email as admin_email,
        a.action,
        target_p.email as target_email,
        a.details,
        a.created_at
    FROM admin_audit_log a
    LEFT JOIN profiles admin_p ON admin_p.id = a.admin_id
    LEFT JOIN profiles target_p ON target_p.id = a.target_user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_audit_logs(INTEGER, INTEGER) TO authenticated;

-- ============================================
-- 9. ENSURE YOUR USER IS ADMIN
-- ============================================
-- Update this with your actual email
UPDATE profiles SET is_admin = TRUE
WHERE email = 'auerbach.impex@gmail.com';

-- Verify
SELECT id, email, is_admin FROM profiles WHERE is_admin = TRUE;
