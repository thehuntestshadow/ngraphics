-- Admin Panel Migration
-- Run this in Supabase SQL Editor

-- 1. Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_user ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON admin_audit_log(created_at DESC);

-- 3. RLS Policies

-- Enable RLS on admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs" ON admin_audit_log
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Update existing profiles policy to allow admins to view all
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Allow admins to update any profile (for ban functionality)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        auth.uid() = id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can update any subscription
DROP POLICY IF EXISTS "Admins can update all subscriptions" ON subscriptions;
CREATE POLICY "Admins can update all subscriptions" ON subscriptions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can view all credits
DROP POLICY IF EXISTS "Admins can view all credits" ON credits;
CREATE POLICY "Admins can view all credits" ON credits
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Admins can update credits
DROP POLICY IF EXISTS "Admins can update all credits" ON credits;
CREATE POLICY "Admins can update all credits" ON credits
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 4. Function to add credits (for admin use)
CREATE OR REPLACE FUNCTION admin_add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Admin credit adjustment'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update or insert credits
    INSERT INTO credits (user_id, balance)
    VALUES (p_user_id, p_amount)
    ON CONFLICT (user_id)
    DO UPDATE SET balance = credits.balance + p_amount;

    -- Log the transaction
    INSERT INTO credit_transactions (user_id, amount, description)
    VALUES (p_user_id, p_amount, p_description);
END;
$$;

-- 5. View for admin dashboard stats
CREATE OR REPLACE VIEW admin_stats AS
SELECT
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND tier_id = 'pro') as pro_subscribers,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND tier_id = 'business') as business_subscribers,
    (SELECT COALESCE(SUM(
        CASE
            WHEN tier_id = 'pro' THEN 19
            WHEN tier_id = 'business' THEN 49
            ELSE 0
        END
    ), 0) FROM subscriptions WHERE status = 'active') as mrr_dollars;

-- Grant access to the view for authenticated users (RLS will filter)
GRANT SELECT ON admin_stats TO authenticated;

-- 6. Set yourself as admin (replace with your email)
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

COMMENT ON TABLE admin_audit_log IS 'Tracks all administrative actions for accountability';
COMMENT ON COLUMN profiles.is_admin IS 'Whether this user has admin access to the admin panel';
