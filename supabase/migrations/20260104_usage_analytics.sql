-- Usage Analytics Migration
-- Adds detailed generation tracking for admin analytics
-- Run this in Supabase SQL Editor

-- 1. Create generations table for detailed tracking
CREATE TABLE IF NOT EXISTS generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    studio TEXT NOT NULL,
    model TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Users can see their own generations
CREATE POLICY "Users can view own generations" ON generations
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (for edge functions)
CREATE POLICY "Service role can insert generations" ON generations
    FOR INSERT WITH CHECK (true);

-- 2. Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_studio ON generations(studio);
CREATE INDEX IF NOT EXISTS idx_generations_model ON generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_user_studio ON generations(user_id, studio);

-- 3. RPC: Get generation trends (daily counts for last N days)
CREATE OR REPLACE FUNCTION get_generation_trends(p_days INTEGER DEFAULT 30)
RETURNS TABLE(date DATE, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check admin access
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    RETURN QUERY
    SELECT DATE(g.created_at) as date, COUNT(*) as count
    FROM generations g
    WHERE g.created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(g.created_at)
    ORDER BY date;
END;
$$;

-- 4. RPC: Get studio usage breakdown
CREATE OR REPLACE FUNCTION get_studio_usage(p_days INTEGER DEFAULT 30)
RETURNS TABLE(studio TEXT, count BIGINT, percentage NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count BIGINT;
BEGIN
    -- Check admin access
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Get total count for percentage calculation
    SELECT COUNT(*) INTO total_count
    FROM generations
    WHERE created_at >= CURRENT_DATE - p_days;

    RETURN QUERY
    SELECT
        g.studio,
        COUNT(*) as count,
        ROUND(COUNT(*)::NUMERIC / NULLIF(total_count, 0) * 100, 1) as percentage
    FROM generations g
    WHERE g.created_at >= CURRENT_DATE - p_days AND g.studio IS NOT NULL
    GROUP BY g.studio
    ORDER BY count DESC
    LIMIT 10;
END;
$$;

-- 5. RPC: Get model usage breakdown
CREATE OR REPLACE FUNCTION get_model_usage(p_days INTEGER DEFAULT 30)
RETURNS TABLE(model TEXT, count BIGINT, percentage NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_count BIGINT;
BEGIN
    -- Check admin access
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    -- Get total count for percentage calculation
    SELECT COUNT(*) INTO total_count
    FROM generations
    WHERE created_at >= CURRENT_DATE - p_days;

    RETURN QUERY
    SELECT
        g.model,
        COUNT(*) as count,
        ROUND(COUNT(*)::NUMERIC / NULLIF(total_count, 0) * 100, 1) as percentage
    FROM generations g
    WHERE g.created_at >= CURRENT_DATE - p_days AND g.model IS NOT NULL
    GROUP BY g.model
    ORDER BY count DESC
    LIMIT 10;
END;
$$;

-- 6. RPC: Get total generation count
CREATE OR REPLACE FUNCTION get_total_generations(p_days INTEGER DEFAULT NULL)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result BIGINT;
BEGIN
    -- Check admin access
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Admin access required';
    END IF;

    IF p_days IS NULL THEN
        SELECT COUNT(*) INTO result FROM generations;
    ELSE
        SELECT COUNT(*) INTO result FROM generations
        WHERE created_at >= CURRENT_DATE - p_days;
    END IF;

    RETURN result;
END;
$$;

-- 7. Function to log a generation (called from edge function)
CREATE OR REPLACE FUNCTION log_generation(
    p_user_id UUID,
    p_studio TEXT,
    p_model TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO generations (user_id, studio, model)
    VALUES (p_user_id, p_studio, p_model);
END;
$$;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION get_generation_trends(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_studio_usage(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_model_usage(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_generations(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION log_generation(UUID, TEXT, TEXT) TO service_role;

-- 9. Comments
COMMENT ON TABLE generations IS 'Detailed per-generation tracking for analytics';
COMMENT ON FUNCTION get_generation_trends IS 'Returns daily generation counts for admin analytics';
COMMENT ON FUNCTION get_studio_usage IS 'Returns studio usage breakdown for admin analytics';
COMMENT ON FUNCTION get_model_usage IS 'Returns model usage breakdown for admin analytics';
COMMENT ON FUNCTION log_generation IS 'Logs a generation event. Called by generate-image edge function.';
