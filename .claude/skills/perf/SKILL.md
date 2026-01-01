---
name: perf
description: Run Lighthouse performance audits on HEFAISTOS pages. Checks performance, accessibility, best practices, and SEO scores.
---

# Performance Audit Skill

Run Lighthouse audits to measure page performance, accessibility, and best practices.

## Usage

```
/perf [page] [options]
```

Arguments:
- `page` - Specific page to audit (e.g., `index`, `dashboard`). Default: all pages
- `--mobile` - Run mobile audit (default: desktop)
- `--a11y` - Focus on accessibility only
- `--full` - Generate full HTML report

## What Gets Measured

### Performance (0-100)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Total Blocking Time (TBT)
- Cumulative Layout Shift (CLS)
- Speed Index

### Accessibility (0-100)
- Color contrast
- ARIA labels
- Keyboard navigation
- Focus management
- Alt text

### Best Practices (0-100)
- HTTPS usage
- Console errors
- Deprecated APIs
- Image aspect ratios

### SEO (0-100)
- Meta descriptions
- Title tags
- Crawlability
- Mobile-friendly

## Output

```
LIGHTHOUSE AUDIT: HEFAISTOS
===========================

PAGE: index.html
----------------
Performance:    92  ████████████████████░░░░
Accessibility:  88  █████████████████░░░░░░░
Best Practices: 100 ████████████████████████
SEO:            90  ██████████████████░░░░░░

Key Metrics:
  FCP: 0.8s ✓
  LCP: 1.2s ✓
  TBT: 50ms ✓
  CLS: 0.02 ✓

Issues Found:
  ⚠ [A11Y] Button missing accessible name (line 234)
  ⚠ [A11Y] Low contrast on .label-hint (4.2:1, need 4.5:1)
  ⚠ [PERF] Render-blocking CSS: styles.css

PAGE: dashboard.html
--------------------
Performance:    85  █████████████████░░░░░░░
...

SUMMARY
-------
Average Scores:
  Performance:    89
  Accessibility:  86
  Best Practices: 98
  SEO:            91

Pages Below Threshold (<80):
  ✗ None

Top 3 Issues to Fix:
  1. Add preload for critical CSS
  2. Fix 3 accessibility contrast issues
  3. Add lazy loading to history images
```

## Thresholds

Default passing scores:
| Category | Minimum |
|----------|---------|
| Performance | 80 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 80 |

## Common Fixes

### Performance
```html
<!-- Preload critical fonts -->
<link rel="preload" href="fonts/Outfit.woff2" as="font" crossorigin>

<!-- Lazy load images -->
<img loading="lazy" src="..." alt="...">

<!-- Defer non-critical JS -->
<script defer src="analytics.js"></script>
```

### Accessibility
```html
<!-- Add aria-label to icon buttons -->
<button aria-label="Close modal">
  <svg>...</svg>
</button>

<!-- Ensure sufficient contrast -->
/* Change from rgba(255,255,255,0.4) to rgba(255,255,255,0.6) */
```

### CLS Prevention
```css
/* Reserve space for dynamic content */
.site-header {
  min-height: 73px;
}

/* Set dimensions on images -->
<img width="400" height="300" src="..." alt="...">
```

## Integration

### With Visual Tests
Run both for comprehensive testing:
```
/visual-test compare && /perf
```

### CI/CD
Export JSON for CI integration:
```
/perf --json > lighthouse-results.json
```

## Output Files

When using `--full`:
```
.lighthouse/
├── index-report.html
├── dashboard-report.html
├── summary.json
└── ...
```

## When to Run

- After adding new features
- Before releases
- When optimizing performance
- Periodic audits (weekly/monthly)
