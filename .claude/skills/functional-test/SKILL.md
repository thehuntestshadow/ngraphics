# Functional Test Skill

Automated functional testing for all HEFAISTOS pages using Playwright. Tests buttons, dropdowns, toggles, and other interactive elements.

## Usage

```
/functional-test [command] [options]
```

Commands:
- `all` - Test all pages (default)
- `page <name>` - Test a specific page (e.g., `page models`)
- `report` - Show last test results

Options:
- `--fix` - Attempt to identify the root cause of failures
- `--verbose` - Show detailed test output

## What Gets Tested

### Interactive Elements
| Element Type | Test Action | Expected Result |
|--------------|-------------|-----------------|
| Option buttons | Click each button | `.active` class toggles, only one active |
| Dropdowns/Selects | Change selection | Value updates, no console errors |
| Toggle switches | Click toggle | Checked state changes |
| Collapsible sections | Click toggle | Content expands/collapses |
| Theme toggle | Click button | `data-theme` attribute changes |
| Upload zones | Check clickable | File input triggers |
| Generate button | Check enabled | Not disabled when form valid |
| Tab buttons | Click each tab | Content switches, active state |
| Scene grid buttons | Click buttons | Selection changes |
| Checkboxes | Click checkbox | Checked state toggles |
| Range sliders | Drag slider | Value updates |
| Language toggle | Click EN/RO | Language state changes |

### Pages to Test (20 studios)
1. `index.html` - Infographics
2. `models.html` - Model Studio
3. `bundle.html` - Bundle Studio
4. `lifestyle.html` - Lifestyle Studio
5. `copywriter.html` - Copywriter
6. `packaging.html` - Packaging Mockup
7. `comparison.html` - Comparison Generator
8. `size-visualizer.html` - Size Visualizer
9. `faq-generator.html` - FAQ Generator
10. `background.html` - Background Studio
11. `badge-generator.html` - Badge Generator
12. `feature-cards.html` - Feature Cards
13. `size-chart.html` - Size Chart
14. `a-plus.html` - A+ Content
15. `product-variants.html` - Product Variants
16. `social-studio.html` - Social Studio
17. `export-center.html` - Export Center
18. `ad-creative.html` - Ad Creative
19. `model-video.html` - Model Video
20. `dashboard.html` - Dashboard

## Test Process

1. **Start local server** on port 8000 if not running
2. **Navigate to each page**
3. **Wait for page load** (fonts, scripts)
4. **Find interactive elements** by class/role
5. **Test each element type**:
   - Click and verify state change
   - Check for console errors
   - Verify no JavaScript exceptions
6. **Report results** with pass/fail per element

## Output Format

```
FUNCTIONAL TEST RESULTS
=======================

index.html (Infographics)
-------------------------
[PASS] Theme toggle - toggles data-theme attribute
[PASS] Language buttons - EN/RO toggle works
[PASS] Background style buttons - selection changes
[FAIL] Advanced Options toggle - does not expand
       -> Console: "Cannot read property 'classList' of null"
       -> Missing element: #advancedContent
[PASS] API Settings toggle - expands correctly
[PASS] Option buttons (variations) - selection works

models.html (Model Studio)
--------------------------
[PASS] Theme toggle
[FAIL] Gender buttons - click has no effect
       -> Event listener not attached
[PASS] Scene grid buttons - selection works
...

SUMMARY
-------
Pages tested: 20
Total elements: 156
Passed: 142
Failed: 14

FAILURES BY TYPE
----------------
- Option buttons: 6 failures
- Collapsible toggles: 4 failures
- Dropdowns: 2 failures
- Tab buttons: 2 failures

COMMON ISSUES
-------------
1. Event listeners not attached (8 occurrences)
   Files: models.js, bundle.js, lifestyle.js
   Pattern: querySelectorAll returns empty, forEach does nothing

2. Missing DOM elements (4 occurrences)
   Files: comparison.js, size-chart.js
   Pattern: getElementById returns null

3. Wrong selector (2 occurrences)
   Files: packaging.js, badge-generator.js
   Pattern: Class name mismatch between HTML and JS
```

## Element Selectors

### Option Buttons
```javascript
// Find all option button groups
document.querySelectorAll('.option-buttons')
// Each group should have buttons that toggle .active
```

### Collapsible Sections
```javascript
// Advanced options
document.querySelector('.advanced-toggle')
document.querySelector('.advanced-content')

// API settings
document.querySelector('.settings-toggle')
document.querySelector('.settings-content')
```

### Scene/Style Grids
```javascript
document.querySelectorAll('.scene-btn')
document.querySelectorAll('.style-btn')
```

### Tab Buttons
```javascript
document.querySelectorAll('.tab-btn')
document.querySelectorAll('[role="tab"]')
```

## Debugging Tips

When a test fails:

1. **Check console errors** - Often reveals the root cause
2. **Verify element exists** - Use `document.querySelector()` in browser
3. **Check event listener** - Use Chrome DevTools "Event Listeners" panel
4. **Compare with working page** - Most pages share similar patterns
5. **Check JS initialization** - Look for `initElements()` or `DOMContentLoaded`

## Common Fixes

### Event listener not attached
```javascript
// WRONG: Element doesn't exist at init time
document.querySelector('.option-btn').addEventListener('click', ...)

// RIGHT: Use event delegation or check existence
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', ...)
})
```

### Selector mismatch
```javascript
// HTML: <button class="scene-btn">
// WRONG JS: document.querySelectorAll('.sceneBtn')
// RIGHT JS: document.querySelectorAll('.scene-btn')
```

### Missing initialization
```javascript
// Ensure init runs after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    setupEventListeners();
});
```

## When to Run

Run `/functional-test` after:
- Adding new interactive elements
- Refactoring JavaScript
- Changing HTML structure
- Before deploying changes
- When users report broken buttons
