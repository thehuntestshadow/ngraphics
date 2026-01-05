-- ============================================
-- Nested Folders Migration
-- Adds parent_id for hierarchical folder structure
-- ============================================

-- Add parent_id column for folder nesting
ALTER TABLE user_categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES user_categories(id) ON DELETE CASCADE;

-- Add path column for efficient tree queries (materialized path)
-- Stores the full path of folder IDs: "root/parent-id/this-id"
ALTER TABLE user_categories
ADD COLUMN IF NOT EXISTS path TEXT DEFAULT '';

-- Index for efficient tree queries
CREATE INDEX IF NOT EXISTS idx_user_categories_parent ON user_categories(user_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_path ON user_categories(user_id, path);

-- Function to update path when parent changes
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = NEW.id::TEXT;
    ELSE
        SELECT path INTO parent_path FROM user_categories WHERE id = NEW.parent_id;
        NEW.path = parent_path || '/' || NEW.id::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update path on insert/update
DROP TRIGGER IF EXISTS trigger_update_category_path ON user_categories;
CREATE TRIGGER trigger_update_category_path
    BEFORE INSERT OR UPDATE OF parent_id ON user_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_path();

-- Initialize paths for existing categories (all root-level)
UPDATE user_categories SET path = id::TEXT WHERE path = '' OR path IS NULL;

-- Comments
COMMENT ON COLUMN user_categories.parent_id IS 'Parent folder ID for nesting (NULL = root level)';
COMMENT ON COLUMN user_categories.path IS 'Materialized path for efficient tree queries';
