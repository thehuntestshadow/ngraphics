-- ============================================
-- User Categories Table Migration
-- User-defined product categories for HEFAISTOS
-- ============================================

-- User categories table
CREATE TABLE IF NOT EXISTS user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Category details
    name TEXT NOT NULL,              -- Display name: "Electronics", "My Custom Category"
    slug TEXT NOT NULL,              -- URL-safe: "electronics", "my-custom-category"
    display_order INT DEFAULT 0,     -- For sidebar ordering
    icon TEXT,                       -- Optional emoji or icon name
    color TEXT,                      -- Optional accent color hex

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one category slug per user
    UNIQUE(user_id, slug)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_categories_user ON user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_order ON user_categories(user_id, display_order);

-- Enable Row Level Security
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own categories
CREATE POLICY "Users can view own categories"
    ON user_categories FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON user_categories FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON user_categories FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
    ON user_categories FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Update trigger for updated_at (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_user_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_categories_updated_at
    BEFORE UPDATE ON user_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_user_categories_updated_at();

-- ============================================
-- Migration: Seed categories from existing products
-- Creates categories for each user based on their products
-- ============================================
INSERT INTO user_categories (user_id, name, slug, display_order)
SELECT DISTINCT
    p.user_id,
    -- Capitalize first letter for display name
    CONCAT(UPPER(SUBSTRING(p.category, 1, 1)), LOWER(SUBSTRING(p.category, 2))) as name,
    LOWER(p.category) as slug,
    -- Order by most used categories first
    ROW_NUMBER() OVER (
        PARTITION BY p.user_id
        ORDER BY COUNT(*) DESC, MIN(p.created_at)
    ) as display_order
FROM products p
WHERE p.category IS NOT NULL AND p.category != ''
GROUP BY p.user_id, p.category
ON CONFLICT (user_id, slug) DO NOTHING;

-- Comments
COMMENT ON TABLE user_categories IS 'User-defined product categories for organizing products';
COMMENT ON COLUMN user_categories.slug IS 'URL-safe identifier, auto-generated from name';
COMMENT ON COLUMN user_categories.display_order IS 'Sort order in sidebar (lower = higher)';
COMMENT ON COLUMN user_categories.icon IS 'Optional emoji or icon identifier';
COMMENT ON COLUMN user_categories.color IS 'Optional hex color code for category accent';
