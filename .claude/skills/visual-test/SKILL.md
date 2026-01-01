---
name: visual-test
description: Run visual regression tests across all HEFAISTOS pages using Playwright. Captures screenshots and compares against baselines.
---

# Visual Test Skill

Automated visual regression testing for all HEFAISTOS pages.

## Usage

```
/visual-test [command] [options]
```

Commands:
- `capture` - Take fresh screenshots of all pages (updates baselines)
- `compare` - Compare current state against baselines
- `page <name>` - Test a specific page only
- `report` - Show last test results

Options:
- `--light` - Also test light theme
- `--mobile` - Include mobile viewport (375px)

## What Gets Tested

### All 17 Pages
| Page | URL | Key Elements |
|------|-----|--------------|
| Infographics | index.html | Header, config panel, output panel |
| Model Studio | models.html | Scene grid, model options |
| Bundle Studio | bundle.html | Product slots, layout options |
| Lifestyle | lifestyle.html | Scene/mood selectors |
| Copywriter | copywriter.html | Text output areas |
| Packaging | packaging.html | Package type selector |
| Comparison | comparison.html | Comparison type tabs |
| Size Visualizer | size-visualizer.html | Reference object grid |
| FAQ Generator | faq-generator.html | Category checkboxes |
| Background | background.html | Background type options |
| Badge Generator | badge-generator.html | Badge style grid |
| Feature Cards | feature-cards.html | Card type tabs |
| Size Chart | size-chart.html | Size table editor |
| A+ Content | a-plus.html | Module type tabs |
| Product Variants | product-variants.html | Variant type tabs |
| Dashboard | dashboard.html | Stats cards, nav grid |
| Docs | docs.html | Documentation content |

### Test Scenarios
1. **Initial Load** - Page without any user interaction
2. **Dark Theme** - Default theme appearance
3. **Light Theme** - With `--light` flag
4. **Header** - Logo, navigation, theme toggle
5. **Empty States** - History/favorites when empty
6. **Collapsed Sections** - Advanced options, API settings

## Process

### Capture Mode (`/visual-test capture`)
1. Start local server on port 8000
2. Navigate to each page
3. Wait for fonts and images to load
4. Take full-page screenshot
5. Save to `.visual-tests/baselines/`

### Compare Mode (`/visual-test compare`)
1. Capture current screenshots to `.visual-tests/current/`
2. Compare against baselines pixel-by-pixel
3. Generate diff images for failures
4. Report pass/fail status

## Output

```
VISUAL TEST RESULTS
===================

Viewport: 1280x800 (desktop)
Theme: dark

PAGES
-----
✓ index.html (0.02% diff)
✓ models.html (0.00% diff)
✓ bundle.html (0.01% diff)
✗ lifestyle.html (2.34% diff)
  → Header shifted 5px
  → See: .visual-tests/diffs/lifestyle-diff.png
✓ dashboard.html (0.00% diff)
...

SUMMARY
-------
Passed: 16/17
Failed: 1
Threshold: 0.1%

Failed tests have diff images in .visual-tests/diffs/
```

## Folder Structure

```
.visual-tests/
├── baselines/           # Reference screenshots
│   ├── index-dark.png
│   ├── index-light.png
│   ├── models-dark.png
│   └── ...
├── current/             # Latest test run
│   └── ...
├── diffs/               # Visual differences
│   └── lifestyle-diff.png
└── config.json          # Test configuration
```

## Configuration

`.visual-tests/config.json`:
```json
{
  "threshold": 0.1,
  "viewport": { "width": 1280, "height": 800 },
  "waitForFonts": true,
  "pages": [
    "index.html",
    "models.html",
    ...
  ]
}
```

## When to Run

- Before committing UI changes
- After updating shared styles
- When fixing layout issues
- Before releases

## Fixing Failures

1. Review diff image in `.visual-tests/diffs/`
2. If change is intentional: run `/visual-test capture` to update baseline
3. If change is a bug: fix the issue and re-run `/visual-test compare`
