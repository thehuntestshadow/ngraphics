-- CMS Tables for HEFAISTOS Admin Content Management
-- Enables non-developer content updates for Homepage, Gallery, and FAQ

-- ============================================
-- 1. Homepage Content (JSONB sections)
-- ============================================
CREATE TABLE IF NOT EXISTS cms_homepage (
    id TEXT PRIMARY KEY,                    -- 'hero', 'features', 'pricing', 'studios', 'cta'
    content JSONB NOT NULL,                 -- Section-specific structure
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Content structure examples:
-- 'hero': { "badge": "...", "title": "...", "subtitle": "...", "cta1_text": "...", "cta1_link": "...", "cta2_text": "...", "cta2_link": "..." }
-- 'features': [{ "icon": "...", "title": "...", "description": "..." }]
-- 'pricing': [{ "name": "...", "price": "...", "period": "...", "features": [...], "badge": "..." }]
-- 'studios': [{ "key": "...", "title": "...", "description": "...", "icon": "...", "link": "..." }]

COMMENT ON TABLE cms_homepage IS 'Homepage content sections - editable via admin panel';

-- ============================================
-- 2. Gallery Items
-- ============================================
CREATE TABLE IF NOT EXISTS cms_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    studio_key TEXT NOT NULL,               -- 'infographics', 'models', 'lifestyle', etc.
    studio_label TEXT NOT NULL,             -- Display name: 'Infographics', 'Model Photos'
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_active ON cms_gallery(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_studio ON cms_gallery(studio_key);

COMMENT ON TABLE cms_gallery IS 'Gallery showcase images - filterable by studio';

-- ============================================
-- 3. FAQ Items
-- ============================================
CREATE TABLE IF NOT EXISTS cms_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,                   -- HTML content (rich text)
    category TEXT NOT NULL,                 -- 'getting-started', 'billing', 'features', 'technical', 'support'
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_category ON cms_faq(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_active ON cms_faq(is_active);

COMMENT ON TABLE cms_faq IS 'FAQ items with rich text answers - organized by category';

-- ============================================
-- 4. Row Level Security Policies
-- ============================================

-- Homepage: Public read, admin write
ALTER TABLE cms_homepage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read homepage content"
    ON cms_homepage FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage homepage content"
    ON cms_homepage FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Gallery: Public read, admin write
ALTER TABLE cms_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active gallery items"
    ON cms_gallery FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage gallery items"
    ON cms_gallery FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- FAQ: Public read, admin write
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active FAQ items"
    ON cms_faq FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage FAQ items"
    ON cms_faq FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- ============================================
-- 5. Update Triggers
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_homepage_updated_at
    BEFORE UPDATE ON cms_homepage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_gallery_updated_at
    BEFORE UPDATE ON cms_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_faq_updated_at
    BEFORE UPDATE ON cms_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. Seed Data (from existing hardcoded content)
-- ============================================

-- Hero section
INSERT INTO cms_homepage (id, content) VALUES (
    'hero',
    '{
        "badge": "AI-Powered E-commerce Toolkit",
        "title": "Create Stunning Product Visuals in Seconds",
        "subtitle": "HEFAISTOS helps e-commerce brands generate professional product photography, marketing graphics, and content using AI.",
        "cta1_text": "Start Creating",
        "cta1_link": "#studios",
        "cta2_text": "View Gallery",
        "cta2_link": "gallery.html"
    }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- FAQ Categories seed data
INSERT INTO cms_faq (question, answer, category, sort_order) VALUES
    ('What is HEFAISTOS?', 'HEFAISTOS is an AI-powered toolkit designed specifically for e-commerce brands. It helps you create professional product photography, marketing graphics, infographics, and written content using advanced AI models. No design skills required.', 'getting-started', 1),
    ('Do I need design experience?', 'Not at all! HEFAISTOS is designed for everyone. Simply upload your product images, choose your settings, and let AI do the heavy lifting. The interface guides you through each step.', 'getting-started', 2),
    ('What file formats are supported?', 'HEFAISTOS accepts JPG, PNG, and WebP images for uploads. Generated images can be downloaded in high-resolution PNG or JPG format, optimized for e-commerce platforms.', 'getting-started', 3),
    ('How does the subscription work?', 'We offer three tiers: Free (use your own API key), Pro ($29/month for 200 generations), and Business ($79/month for 1000 generations). All paid plans include cloud sync, priority support, and no watermarks.', 'billing', 1),
    ('Can I cancel anytime?', 'Yes! You can cancel your subscription at any time from your account settings. You''ll continue to have access until the end of your billing period.', 'billing', 2),
    ('What payment methods do you accept?', 'We accept all major credit cards (Visa, Mastercard, American Express) through our secure Stripe payment system. We also support Apple Pay and Google Pay.', 'billing', 3),
    ('What AI models power HEFAISTOS?', 'We use state-of-the-art AI models including Google''s Gemini for image generation, GPT-4 for copywriting, and specialized models for specific tasks like background removal. Models are regularly updated for best results.', 'features', 1),
    ('Can I use generated images commercially?', 'Yes! All images you generate are yours to use commercially. There are no restrictions on using them for your product listings, ads, social media, or any other business purpose.', 'features', 2),
    ('What studios are available?', 'HEFAISTOS includes 15+ specialized studios: Infographics, Model Photos, Lifestyle, Bundle, Background Removal, Packaging Mockups, Comparison Charts, Size Guides, FAQ Generator, Ad Creative, Social Media, and more.', 'features', 3),
    ('How do I get the best results?', 'For best results: 1) Use high-quality product images with clean backgrounds, 2) Be specific in your descriptions, 3) Experiment with different styles and settings, 4) Save favorites to reuse successful settings.', 'technical', 1),
    ('What image resolution do you support?', 'Generated images are high-resolution, typically 1024x1024 or larger depending on the selected aspect ratio. This is suitable for most e-commerce platforms and marketing materials.', 'technical', 2),
    ('Is there an API available?', 'Currently, HEFAISTOS is a web-based application. We''re exploring API access for enterprise customers. Contact us if you''re interested in bulk or automated generation.', 'technical', 3),
    ('How do I contact support?', 'You can reach our support team via email at support@hefaistos.xyz. Pro and Business subscribers get priority support with faster response times.', 'support', 1),
    ('Is my data secure?', 'Yes! We take security seriously. Your images and data are encrypted in transit and at rest. We never share or sell your data. See our Privacy Policy for details.', 'support', 2),
    ('Can I request new features?', 'Absolutely! We love hearing from users. Send feature requests to feedback@hefaistos.xyz or use the feedback form in the app. Many of our features came from user suggestions.', 'support', 3)
ON CONFLICT DO NOTHING;

-- Gallery seed data (sample entries)
INSERT INTO cms_gallery (title, description, image_url, studio_key, studio_label, sort_order) VALUES
    ('Product Infographic Example', 'Clean product infographic with feature callouts', '/images/gallery/infographic-1.webp', 'infographics', 'Infographics', 1),
    ('Model Studio Demo', 'AI-generated model wearing product', '/images/gallery/model-1.webp', 'models', 'Model Photos', 2),
    ('Lifestyle Photography', 'Product in lifestyle setting', '/images/gallery/lifestyle-1.webp', 'lifestyle', 'Lifestyle', 3),
    ('Bundle Showcase', 'Multi-product bundle layout', '/images/gallery/bundle-1.webp', 'bundles', 'Bundles', 4),
    ('Background Removal', 'Clean product on white background', '/images/gallery/background-1.webp', 'background', 'Background', 5),
    ('Packaging Mockup', 'Product packaging visualization', '/images/gallery/packaging-1.webp', 'packaging', 'Packaging', 6),
    ('Comparison Chart', 'Before/after product comparison', '/images/gallery/comparison-1.webp', 'comparison', 'Comparison', 7),
    ('Size Guide', 'Visual size reference chart', '/images/gallery/size-1.webp', 'size', 'Size Charts', 8),
    ('Social Media Post', 'Instagram-ready product graphic', '/images/gallery/social-1.webp', 'social', 'Social Media', 9),
    ('Ad Creative', 'Banner ad example', '/images/gallery/ad-1.webp', 'ads', 'Ad Creative', 10),
    ('Feature Cards', 'Individual feature highlight card', '/images/gallery/feature-1.webp', 'features', 'Feature Cards', 11),
    ('A+ Content', 'Amazon A+ content module', '/images/gallery/aplus-1.webp', 'aplus', 'A+ Content', 12)
ON CONFLICT DO NOTHING;
