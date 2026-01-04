# ROADMAP.md

Active development roadmap for HEFAISTOS. For historical changes see [CHANGELOG.md](CHANGELOG.md), for future ideas see [IDEAS.md](IDEAS.md), for prioritized backlog see [BACKLOG.md](BACKLOG.md).

---

## Vision

**For** e-commerce sellers, marketers, and small brands
**Who** need professional product visuals and marketing tools but lack design resources
**HEFAISTOS** is an AI-powered toolkit that generates marketing-ready content in seconds
**Unlike** hiring photographers, designers, or copywriters
**We** let anyone create professional marketing materials with just a product image

### Core Principles

1. **Each tool solves one specific problem well**
2. **Subscription-based with cloud sync**
3. **AI-powered but user-controlled**
4. **Fast iteration**: upload → configure → generate → download

---

## Current Status

**Version**: 4.2 (Jan 2026)
**Live URL**: https://hefaistos.xyz
**Studios**: 19 production-ready tools
**Infrastructure**: Supabase Auth + Stripe payments live

### Platform Health

| Component | Status | Notes |
|-----------|--------|-------|
| Auth | Live | Supabase Auth |
| Payments | Live | Stripe subscriptions |
| API Proxy | Live | Edge Function |
| Cloud Sync | Live | History/favorites |
| Admin Panel | Live | User management, CMS |

---

## Active Sprint (Jan 2026)

### In Progress

| Task | Progress | Notes |
|------|----------|-------|
| Admin panel polish | 100% | All quick wins completed |
| Table UX polish | 100% | Sorting, striping, sticky headers |
| Real usage analytics | 100% | Generations table + RPC functions |
| Mobile table cards | 100% | Responsive card view for all tables |

### Recently Completed

- [x] Admin: Real usage analytics (generations table, RPC functions)
- [x] Admin: Charts use real data (trends, studios, models)
- [x] Admin: Mobile card view for tables (Users, Subscriptions, Audit)
- [x] Admin: Items-per-page selector (20/50/100)
- [x] Admin: Click-to-sort table columns (Users table)
- [x] Admin: Table row striping for readability
- [x] Admin: Sticky table headers
- [x] Admin: Column width optimization
- [x] Admin: Clear filters button (visible when filters active)
- [x] Admin: Loading spinners on action buttons
- [x] Admin: Animated stat card numbers (count-up on load)
- [x] Admin: Last updated timestamps per section
- [x] Admin: Keyboard shortcut hints in modals
- [x] Admin: Title tooltips for truncated text
- [x] Admin: Pagination info ("Showing 1-20 of 150")
- [x] Admin: Refresh button per section
- [x] Admin: Copy email button
- [x] Admin: Bulk user actions (select all, set tier, add credits)

### Up Next

1. ~~E2E tests for critical flows~~ ✅ (72 tests in 6 spec files)
2. Skeleton loading states
3. Additional admin panel polish (as needed)

### Blockers

None currently.

---

## Q1 2026 Goals

### Features
- [ ] Complete admin panel improvements
- [ ] Brand Kit Manager (colors, logos, fonts)
- [ ] Testimonial Generator (review quote graphics)
- [ ] Platform presets for Copywriter (Amazon, Etsy, Shopify)

### Technical
- [x] E2E tests for critical flows (72 tests)
- [ ] Full i18n coverage (~400 strings)
- [ ] Skeleton loading states
- [ ] Tooltips for all options

### Business
- [ ] 100 paying subscribers
- [ ] <3% monthly churn
- [ ] 4.5+ app store rating (if applicable)

---

## Q2 2026 Goals

### Features
- [ ] Infographic Video Generator (animated callouts, 5-30s)
- [ ] Lifestyle Video Generator (ambient motion, 5-15s)
- [ ] Image Enhancer (AI upscaling 2x/4x)
- [ ] Batch Processor Studio (CSV + bulk operations)

### Technical
- [ ] Model capability detection
- [ ] Fallback model chains
- [ ] Virtual scrolling for 1000+ items
- [ ] CDN for generated images

### Business
- [ ] 500 paying subscribers
- [ ] Enterprise tier launch
- [ ] API access for Business tier

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Monthly Active Users | 1,000 | - |
| Paid Conversion Rate | 5% | - |
| Generation Success Rate | >95% | - |
| Avg Generation Time | <30s | - |
| Cloud Sync Adoption | >40% | - |
| Monthly Churn | <5% | - |

---

## Technical Debt (Priority)

| Issue | Location | Impact | Effort | Status |
|-------|----------|--------|--------|--------|
| ~~Inline onclick handlers~~ | ~~admin.js, studios~~ | ~~Maintainability~~ | ~~Medium~~ | ✅ Done |
| ~~Hardcoded tier prices~~ | ~~config.js~~ | ~~Flexibility~~ | ~~Easy~~ | ✅ Done |
| ~~No error retry UI~~ | ~~API failures~~ | ~~UX~~ | ~~Medium~~ | ✅ Done |
| ~~Browser confirm()~~ | ~~Delete actions~~ | ~~UX~~ | ~~Easy~~ | ✅ Done |
| ~~Missing ARIA labels~~ | ~~Icon buttons~~ | ~~Accessibility~~ | ~~Easy~~ | ✅ Done |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenRouter API changes | Medium | High | Abstract API client, fallback models |
| Stripe webhook failures | Low | High | Idempotent handlers, retry queue |
| Supabase outage | Low | High | Local-first with sync queue |
| Model quality regression | Medium | Medium | User feedback loop, model switching |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Jan 2026 | Split roadmap into 4 files | Original was 1100+ lines, hard to maintain |
| Jan 2026 | Admin CMS over external CMS | Keep everything in one codebase |
| Dec 2025 | Stripe Payment Links | Simpler than custom checkout |
| Dec 2025 | Supabase over Firebase | Better PostgreSQL, cheaper |
| Nov 2025 | No build step | Simpler deployment, faster iteration |

---

## Links

- [BACKLOG.md](BACKLOG.md) - Prioritized feature backlog
- [IDEAS.md](IDEAS.md) - Unvalidated ideas parking lot
- [CHANGELOG.md](CHANGELOG.md) - Version history and completed work
- [ADMIN_PAGE.md](ADMIN_PAGE.md) - Admin panel documentation
- [COMMERCIAL.md](COMMERCIAL.md) - Business model details

---

*Updated: Jan 2026*
