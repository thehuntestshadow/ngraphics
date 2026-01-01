# TESTING.md

Testing guide for HEFAISTOS - ensuring quality across all studio pages.

---

## Overview

HEFAISTOS uses a combination of automated and manual testing approaches:

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Vitest | Test shared utilities (EventBus, API, etc.) |
| Visual Regression | Playwright + `/visual-test` | Catch UI layout shifts |
| Performance | Lighthouse + `/perf` | Monitor load times, accessibility |
| Code Quality | Pre-commit hooks + ESLint | Syntax validation, pattern compliance |
| Manual | Browser testing | Feature verification |

---

## Quick Start

### Run All Checks
```bash
# NPM scripts
npm test            # Unit tests (vitest)
npm run lint        # Code style (eslint)

# In Claude Code
/audit              # Code quality audit
/visual-test compare # Visual regression
/perf               # Performance audit
```

### Before Committing
The pre-commit hook runs automatically when you commit via Claude Code.

To run manually:
```bash
.claude/hooks/pre-commit-audit.sh
```

---

## Unit Testing

### Setup

Unit tests use Vitest with jsdom for a browser-like environment.

```bash
npm install         # Install dependencies
npm test            # Run tests once
npm run test:watch  # Run in watch mode
```

### Test Files

| File | Tests |
|------|-------|
| `tests/setup.js` | Test environment (localStorage mock, fetch mock) |
| `tests/core.test.js` | EventBus, ReactiveState |
| `tests/api.test.js` | APIError, error classification, response normalization, retry logic, cache |

### Configuration

`vitest.config.js`:
```javascript
export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/**/*.test.js'],
        setupFiles: ['tests/setup.js']
    }
});
```

### Writing Tests

```javascript
import { describe, it, expect, vi } from 'vitest';

describe('MyFeature', () => {
    it('should do something', () => {
        const result = myFunction();
        expect(result).toBe(expected);
    });
});
```

### Test Coverage

Run with coverage:
```bash
npm test -- --coverage
```

---

## Visual Testing

### Setup
Visual tests use Playwright MCP to capture and compare screenshots.

### Commands

| Command | Description |
|---------|-------------|
| `/visual-test capture` | Update baseline screenshots |
| `/visual-test compare` | Compare current vs baseline |
| `/visual-test page index` | Test specific page |
| `/visual-test --light` | Include light theme tests |

### Test Coverage

All 17 pages are tested:
- index.html (Infographics)
- models.html (Model Studio)
- bundle.html (Bundle Studio)
- lifestyle.html (Lifestyle Studio)
- copywriter.html (Copywriter)
- packaging.html (Packaging Mockup)
- comparison.html (Comparison Generator)
- size-visualizer.html (Size Visualizer)
- faq-generator.html (FAQ Generator)
- background.html (Background Studio)
- badge-generator.html (Badge Generator)
- feature-cards.html (Feature Cards)
- size-chart.html (Size Chart)
- a-plus.html (A+ Content)
- product-variants.html (Product Variants)
- dashboard.html (Dashboard)
- docs.html (Documentation)

### Updating Baselines

When you intentionally change the UI:
```bash
/visual-test capture  # Updates all baselines
```

### Fixing Failures

1. Check diff images in `.visual-tests/diffs/`
2. If intentional change: update baseline
3. If bug: fix the issue and re-run

---

## Performance Testing

### Commands

| Command | Description |
|---------|-------------|
| `/perf` | Audit all pages |
| `/perf index` | Audit specific page |
| `/perf --mobile` | Mobile viewport audit |
| `/perf --a11y` | Accessibility focus |
| `/perf --full` | Generate HTML reports |

### Score Thresholds

| Category | Minimum | Target |
|----------|---------|--------|
| Performance | 80 | 90+ |
| Accessibility | 90 | 95+ |
| Best Practices | 90 | 100 |
| SEO | 80 | 90+ |

### Key Metrics

- **FCP** (First Contentful Paint): < 1.5s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TBT** (Total Blocking Time): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Common Issues & Fixes

#### Layout Shift (CLS)
```css
/* Reserve space for dynamic content */
.site-header {
  min-height: 73px;
}

/* Set explicit dimensions on images */
img {
  width: 400px;
  height: 300px;
}
```

#### Slow Paint (FCP/LCP)
```html
<!-- Preload critical fonts -->
<link rel="preload" href="fonts/Outfit.woff2" as="font" crossorigin>

<!-- Defer non-critical scripts -->
<script defer src="analytics.js"></script>
```

#### Accessibility
```html
<!-- Add labels to icon buttons -->
<button aria-label="Close modal" title="Close">
  <svg>...</svg>
</button>

<!-- Ensure color contrast ratio >= 4.5:1 -->
```

---

## Pre-Commit Hooks

### What Gets Checked

1. **JavaScript Syntax** - All `.js` files validated with Node
2. **Pre-rendered Headers** - Verify headers aren't empty (prevents flash)
3. **Theme Toggle** - Each page has `#themeToggle` button
4. **Footer Presence** - Studio pages include `.site-footer`
5. **Debug Statements** - Warns if excessive `console.log` usage

### Hook Location
```
.claude/hooks/pre-commit-audit.sh
```

### Configuration
```
.claude/settings.json
```

### Bypassing (Emergency Only)
If you need to bypass the hook:
```bash
git commit --no-verify -m "message"
```

---

## Code Audit

### Commands

| Command | Description |
|---------|-------------|
| `/audit` | Full audit (all checks) |
| `/audit tooltips` | Tooltip coverage only |
| `/audit patterns` | UI pattern compliance |
| `/audit naming` | ID/class naming consistency |

### Checks Performed

1. **Tooltip Audit**
   - Coverage per page
   - Missing tooltips on interactive elements
   - Duplicate tooltips (data-tooltip + title)

2. **UI Pattern Compliance**
   - Generate button structure
   - Settings/Advanced toggle icons
   - History/Favorites layout
   - Footer presence

3. **Naming Consistency**
   - Element IDs across pages
   - CSS class naming
   - Storage key prefixes

4. **Code Duplication**
   - Similar functions across pages
   - Repeated HTML structures

---

## Manual Testing Checklist

Before releases, manually verify:

### All Pages
- [ ] Page loads without errors (check console)
- [ ] Theme toggle works (dark ↔ light)
- [ ] Header logo links to home (except on home)
- [ ] Dashboard link works
- [ ] Footer displays correctly
- [ ] Keyboard shortcuts work (Ctrl+Enter, Ctrl+D, Escape)

### Studio Pages
- [ ] Image upload works (drag & drop, click)
- [ ] Preview shows uploaded image
- [ ] Remove button clears image
- [ ] Generate button shows loading state
- [ ] Results display in output panel
- [ ] Download works (single + variations)
- [ ] History populates after generation
- [ ] Favorites can be added/removed
- [ ] Favorites modal opens and shows details
- [ ] Load settings from favorite works
- [ ] Clear history/favorites works (with confirmation)

### Advanced Options
- [ ] Section expands/collapses
- [ ] AI Model dropdown works
- [ ] Seed input accepts numbers
- [ ] Randomize seed button works
- [ ] Negative prompt saves

### API Settings
- [ ] Section expands/collapses
- [ ] API key show/hide toggle works
- [ ] Save button stores key
- [ ] Key persists after reload

---

## Test Data

### Sample Images
For consistent testing, use these image types:
- Product on white background (PNG)
- Product on complex background (JPG)
- Transparent product image (PNG with alpha)
- Large image (> 5MB, tests compression)

### API Key
Tests requiring generation need a valid OpenRouter API key stored in localStorage.

---

## CI/CD Integration (Future)

When setting up CI:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: npx playwright install chromium

      - name: Start server
        run: python3 -m http.server 8000 &

      - name: Run visual tests
        run: npx playwright test

      - name: Run Lighthouse
        run: npx lighthouse http://localhost:8000 --chrome-flags="--headless"
```

---

## Troubleshooting

### Visual Tests Failing
1. Check if change was intentional
2. Review diff images
3. Update baselines if needed
4. Check for CSS specificity issues

### Performance Score Dropped
1. Check recent changes to JS/CSS
2. Look for new render-blocking resources
3. Verify image optimization
4. Check for layout shifts

### Hook Not Running
1. Verify `.claude/settings.json` exists
2. Check hook script is executable
3. Ensure jq is installed (for JSON parsing)
4. Check Claude Code version supports hooks

### Audit Errors
1. Fix syntax errors first (blocks other checks)
2. Address pattern compliance
3. Update baselines if patterns changed intentionally

---

*Last updated: Jan 2026*
