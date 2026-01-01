# BACKLOG.md

Prioritized feature backlog for HEFAISTOS. Items are ordered by priority within each category.

---

## Priority Legend

| Priority | Meaning | Timeline |
|----------|---------|----------|
| **P0** | Critical / Blocking | This sprint |
| **P1** | High priority | This quarter |
| **P2** | Medium priority | Next quarter |
| **P3** | Low priority | Future |

---

## Admin Panel Improvements (P0)

Current focus area. See [ADMIN_PAGE.md](ADMIN_PAGE.md) for full details.

### Critical
| Feature | Effort | Status |
|---------|--------|--------|
| Real usage tracking (replace placeholder charts) | Medium | Planned |
| Table sorting (click headers) | Easy | Planned |
| Pagination info ("Showing 1-20 of 150") | Easy | Planned |
| Data refresh button per section | Easy | Planned |

### Important
| Feature | Effort | Status |
|---------|--------|--------|
| Bulk user operations (select, batch tier change) | Medium | Planned |
| Copy email to clipboard button | Easy | Planned |
| User search by date range | Easy | Planned |
| Inline tier/credits editing | Medium | Planned |
| User activity indicators (last login) | Medium | Needs DB |
| Notes/tags on user profiles | Medium | Needs DB |

### Nice to Have
| Feature | Effort | Status |
|---------|--------|--------|
| Send email to user from modal | Medium | Planned |
| Export audit logs to CSV | Easy | Planned |
| Drag-and-drop gallery/FAQ reordering | Medium | Planned |
| CMS preview before publish | Medium | Planned |
| CMS version history/rollback | Hard | Planned |

---

## New Studios (P1-P2)

### Video Generation (P1)

| Studio | Description | Effort | Priority |
|--------|-------------|--------|----------|
| **Infographic Video** | Animated callouts, text reveals, 5-30s | Hard | P1 |
| **Lifestyle Video** | Ambient motion (steam, leaves), 5-15s | Hard | P2 |

### Content Tools (P1)

| Studio | Description | Effort | Priority |
|--------|-------------|--------|----------|
| **Testimonial Generator** | Review quote graphics, star ratings | Easy-Medium | P1 |
| **Brand Kit Manager** | Colors, logos, fonts, auto-apply | Medium | P1 |

### Utility Tools (P2)

| Studio | Description | Effort | Priority |
|--------|-------------|--------|----------|
| **Image Enhancer** | AI upscaling 2x/4x, noise reduction | Medium | P2 |
| **Batch Processor** | CSV import, bulk operations | Medium-Hard | P2 |
| **Catalog Generator** | Multi-product lookbooks, PDF export | Medium-Hard | P3 |

---

## Copywriter Enhancements (P1)

### Platform Presets
| Platform | Content Types | Priority |
|----------|---------------|----------|
| Amazon | Bullet points, backend keywords, A+ text | P1 |
| Etsy | 13 tags, story descriptions, shop announcements | P1 |
| Shopify | Short/long descriptions, collection content | P2 |
| eBay | Item specifics, condition descriptions | P3 |

---

## Technical Improvements (P1-P2)

### Performance (P1)
| Task | Current | Target | Effort |
|------|---------|--------|--------|
| Lazy loading page JS | None | Per-page bundles | Medium |
| Virtual scrolling | 100+ items lag | 1000+ smooth | Medium |
| Image CDN | Supabase Storage | CloudFlare/Bunny | Medium |

### Code Quality (P1)
| Task | Effort | Priority |
|------|--------|----------|
| E2E tests (Playwright) | Hard | P1 |
| Remove inline onclick handlers | Medium | P1 |
| Standardize error retry UI | Medium | P1 |
| Custom confirmation modals | Easy | P1 |

### Accessibility (P2)
| Task | Effort | Priority |
|------|--------|----------|
| ARIA labels on icon buttons | Easy | P2 |
| Keyboard navigation in modals | Medium | P2 |
| Focus trap in modals | Medium | P2 |
| Skip-to-content links | Easy | P2 |
| Screen reader announcements | Medium | P2 |

### i18n (P2)
| Task | Current | Target | Effort |
|------|---------|--------|--------|
| String coverage | ~50 strings | ~400 strings | Hard |
| RTL support | None | Arabic, Hebrew | Hard |
| Auto-translation | Manual | AI-assisted | Medium |

---

## UX Improvements (P1-P2)

### High Priority (P1)
| Feature | Effort | Notes |
|---------|--------|-------|
| Skeleton loading states | Medium | Replace "Loading..." text |
| Tooltips for all options | Medium | Explain each setting |
| Progress indicators | Easy | Long operation feedback |
| Error retry buttons | Easy | "Try again" on failures |

### Medium Priority (P2)
| Feature | Effort | Notes |
|---------|--------|-------|
| Drag-and-drop reordering | Medium | Everywhere applicable |
| Undo/redo for settings | Hard | State management |
| Keyboard shortcut customization | Medium | User preferences |
| Recent generations quick-access | Easy | Dashboard widget |

---

## API Improvements (P2)

| Feature | Description | Effort |
|---------|-------------|--------|
| Model capability detection | Query which models support images | Medium |
| Fallback model chains | Auto-switch on failure | Medium |
| Usage statistics API | Track per-user generation stats | Medium |
| Public API for Business tier | REST API access | Hard |
| Webhook notifications | Generation complete callbacks | Medium |

---

## Design Polish (P2)

| Task | Status | Notes |
|------|--------|-------|
| Improved dropdown styling | Planned | Native selects look dated |
| Subtle parallax effects | Planned | Landing page depth |
| Elegant shimmer loading | Planned | Skeleton animations |
| Mobile card view for tables | Planned | Better than horizontal scroll |

---

## Database Improvements (P1)

```sql
-- User activity tracking
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN login_count INT DEFAULT 0;

-- Admin notes
CREATE TABLE admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    admin_id UUID REFERENCES profiles(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregates for charts
CREATE TABLE daily_stats (
    date DATE PRIMARY KEY,
    new_users INT DEFAULT 0,
    new_subscriptions INT DEFAULT 0,
    generations INT DEFAULT 0,
    revenue_cents INT DEFAULT 0
);

-- Per-studio usage breakdown
ALTER TABLE usage_monthly
ADD COLUMN studio_breakdown JSONB DEFAULT '{}';
```

---

## Security Improvements (P2)

| Task | Priority | Notes |
|------|----------|-------|
| Admin 2FA | P2 | TOTP for admin accounts |
| Session management UI | P2 | View/revoke active sessions |
| Rate limit indicators | P3 | Show when approaching limits |
| IP-based anomaly detection | P3 | Alert on suspicious patterns |

---

## Effort Estimates

| Effort | Time | Examples |
|--------|------|----------|
| Easy | <4 hours | Copy button, tooltip, config change |
| Medium | 4-16 hours | New component, API integration |
| Hard | 1-3 days | New studio, major refactor |
| Very Hard | 1+ week | Video generation, batch processor |

---

## Dependencies

```
Brand Kit Manager
    └── Required for: Auto-apply colors across studios

Batch Processor
    └── Requires: Robust error handling, queue system

Video Generators
    └── Requires: Luma AI integration (Model Video uses this)
    └── May need: Additional API keys

E2E Tests
    └── Requires: Playwright setup
    └── Blocks: Confident refactoring
```

---

## Not Prioritized Yet

These items need validation before prioritizing:

- Template marketplace (buy/sell templates)
- White-label version for agencies
- Chrome extension
- Figma/Canva plugins
- Real-time collaboration
- AI style learning

See [IDEAS.md](IDEAS.md) for the full ideas parking lot.

---

*Updated: Jan 2026*
