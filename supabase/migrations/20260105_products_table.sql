-- ============================================
-- Products Table Migration
-- Product library for HEFAISTOS studios
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Product identification
    name TEXT NOT NULL,
    sku TEXT,

    -- Product details
    category TEXT NOT NULL,  -- electronics, clothing, beauty, home, food, sports, jewelry, toys, automotive, health, pet, office
    description TEXT,

    -- Features and benefits (JSONB arrays)
    features JSONB DEFAULT '[]'::jsonb,     -- [{text: string, starred: boolean}]
    benefits JSONB DEFAULT '[]'::jsonb,     -- [string]

    -- Images stored in Supabase Storage
    primary_image_path TEXT,
    image_paths JSONB DEFAULT '[]'::jsonb,  -- Array of up to 3 additional image paths
    thumbnail_path TEXT,

    -- Organization
    tags JSONB DEFAULT '[]'::jsonb,
    is_archived BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ  -- Track when product was last loaded in a studio
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(user_id, category);
CREATE INDEX IF NOT EXISTS idx_products_archived ON products(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_products_last_used ON products(user_id, last_used_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(user_id, name);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own products
CREATE POLICY "Users can view own products"
    ON products FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
    ON products FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
    ON products FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Comment on table
COMMENT ON TABLE products IS 'Product library for HEFAISTOS - stores product info that can be loaded into any studio';
COMMENT ON COLUMN products.features IS 'Array of feature objects: [{text: string, starred: boolean}]';
COMMENT ON COLUMN products.benefits IS 'Array of benefit strings';
COMMENT ON COLUMN products.image_paths IS 'Array of additional image paths (up to 3)';
COMMENT ON COLUMN products.last_used_at IS 'Timestamp when product was last loaded into a studio';
