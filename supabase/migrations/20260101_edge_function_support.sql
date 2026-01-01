-- Edge Function Support Migration
-- Run this in Supabase SQL Editor

-- 1. Create increment_monthly_usage function
-- Called by generate-image edge function to track usage
CREATE OR REPLACE FUNCTION increment_monthly_usage(
    p_user_id UUID,
    p_month DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO usage_monthly (user_id, month, generation_count, tokens_used, cost_cents)
    VALUES (p_user_id, p_month, 1, 0, 0)
    ON CONFLICT (user_id, month)
    DO UPDATE SET
        generation_count = usage_monthly.generation_count + 1,
        updated_at = now();
END;
$$;

-- 2. Create add_credits function (for stripe-webhook)
-- Called when user purchases credits
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT 'Credit purchase',
    p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update or insert credits balance
    INSERT INTO credits (user_id, balance, updated_at)
    VALUES (p_user_id, p_amount, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        balance = credits.balance + p_amount,
        updated_at = now();

    -- Log the transaction
    INSERT INTO credit_transactions (user_id, amount, description, stripe_payment_id)
    VALUES (p_user_id, p_amount, p_description, p_stripe_payment_id);
END;
$$;

-- 3. Create deduct_credit function (for using credits)
CREATE OR REPLACE FUNCTION deduct_credit(
    p_user_id UUID,
    p_studio TEXT DEFAULT 'unknown'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT balance INTO v_balance
    FROM credits
    WHERE user_id = p_user_id;

    -- Check if user has credits
    IF v_balance IS NULL OR v_balance <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Deduct 1 credit
    UPDATE credits
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = p_user_id;

    -- Log the usage
    INSERT INTO credit_transactions (user_id, amount, description)
    VALUES (p_user_id, -1, 'Used for generation in ' || p_studio);

    RETURN TRUE;
END;
$$;

-- 4. Ensure usage table can be written by service role
-- Edge functions use service role, so we need INSERT policy
DROP POLICY IF EXISTS "Service role can insert usage" ON usage;
CREATE POLICY "Service role can insert usage" ON usage
    FOR INSERT WITH CHECK (true);

-- 5. Add updated_at column to usage_monthly if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usage_monthly' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE usage_monthly ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 6. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_monthly_usage(UUID, DATE) TO service_role;
GRANT EXECUTE ON FUNCTION add_credits(UUID, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION deduct_credit(UUID, TEXT) TO authenticated;

COMMENT ON FUNCTION increment_monthly_usage IS 'Increments monthly generation count for a user. Called by generate-image edge function.';
COMMENT ON FUNCTION add_credits IS 'Adds credits to user balance. Called by stripe-webhook on credit purchase.';
COMMENT ON FUNCTION deduct_credit IS 'Deducts 1 credit from user balance. Returns FALSE if no credits available.';
