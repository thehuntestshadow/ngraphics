---
name: audit
description: Audit HEFAISTOS codebase for consistency issues - tooltips, UI patterns, naming conventions, and code duplication.
---

# Code Audit Skill

Performs comprehensive consistency checks across all HEFAISTOS pages.

## Usage

```
/audit [area]
```

Areas:
- `tooltips` - Check tooltip coverage and duplicates
- `patterns` - Verify UI pattern compliance
- `naming` - Check ID/class naming consistency
- `all` - Run all checks (default)

## Checks Performed

### 1. Tooltip Audit
- Count `data-tooltip` attributes per page
- Find elements missing tooltips (section-labels, option buttons)
- Detect duplicate tooltips (nested data-tooltip + title)
- Verify tooltip text quality (not empty, descriptive)

### 2. UI Pattern Compliance
Check against `UI_PATTERNS.md`:
- [ ] Generate button has `btn-glow` span
- [ ] Settings toggle uses sun-ray gear icon
- [ ] Advanced toggle uses slider icon
- [ ] History/Favorites are stacked (not tabbed)
- [ ] Panel headers use correct numbering (01, 02)
- [ ] Footer present with keyboard hints
- [ ] Scripts in correct order
- [ ] Favorites modal present (if page has favorites)

### 3. Naming Consistency
Cross-page comparison of:
- Element IDs (resultPlaceholder vs outputPlaceholder)
- CSS classes (panel-output vs panel-result)
- JavaScript variable names (loadingContainer vs loadingState)
- Storage keys (consistent prefix pattern)

### 4. Code Duplication
Find repeated code that could be shared:
- Similar function implementations across pages
- Duplicated HTML structures
- Repeated CSS blocks

## Output Format

```
AUDIT REPORT: HEFAISTOS
========================

TOOLTIPS
--------
✓ index.html: 45 tooltips
✓ models.html: 52 tooltips
✗ bundle.html: 38 tooltips (missing 4 section-labels)
  - Line 123: .section-label "Layout Style" missing tooltip
  - Line 156: .section-label "Background" missing tooltip

UI PATTERNS
-----------
✓ All pages: btn-glow present
✓ All pages: Correct icon patterns
✗ bundle.html: Footer missing

NAMING
------
✗ Inconsistency found:
  - lifestyle.html uses #outputPlaceholder
  - Other pages use #resultPlaceholder

SUMMARY
-------
Issues found: 6
Pages checked: 5
Recommendation: Fix tooltip gaps in bundle.html
```

## How to Fix Issues

After audit, the skill provides:
1. Specific file:line locations
2. Expected vs actual values
3. Copy-paste fixes from UI_PATTERNS.md

## Files Checked

- `index.html` + `script.js`
- `models.html` + `models.js`
- `bundle.html` + `bundle.js`
- `lifestyle.html` + `lifestyle.js`
- `dashboard.html` + `dashboard.js`
- `docs.html`
