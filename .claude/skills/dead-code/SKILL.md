---
name: dead-code
description: Find unused CSS classes, JavaScript functions, and orphaned files in the HEFAISTOS codebase.
---

# Dead Code Detection Skill

Identifies unused code that can be safely removed to reduce maintenance burden.

## Usage

```
/dead-code [type]
```

Types:
- `css` - Find unused CSS classes and selectors
- `js` - Find unused JavaScript functions and variables
- `files` - Find orphaned files not referenced anywhere
- `all` - Run all checks (default)

## Checks Performed

### 1. Unused CSS (`/dead-code css`)

Finds CSS classes defined but never used in HTML or JS:

```
UNUSED CSS CLASSES
==================

Scanning:
- styles.css (2,847 lines)
- *.css (page-specific styles)

Cross-referencing with:
- *.html (class="...")
- *.js (classList, className, querySelector)

FINDINGS
--------
styles.css:
  Line 234: .old-button (0 usages)
  Line 567: .deprecated-modal (0 usages)
  Line 890: .unused-grid (0 usages)

models.css:
  Line 45: .legacy-option (0 usages)

Total unused: 4 classes
Estimated savings: ~120 lines

SAFE TO REMOVE
--------------
.old-button { ... }
.deprecated-modal { ... }

VERIFY BEFORE REMOVING
----------------------
.unused-grid - might be dynamically added via JS
```

### 2. Unused JavaScript (`/dead-code js`)

Detects functions and variables that are never called:

```
UNUSED JAVASCRIPT
=================

Scanning: *.js (excluding node_modules, tests)

UNUSED FUNCTIONS
----------------
shared.js:
  Line 456: function legacyUpload() - never called
  Line 789: function oldFormatDate() - never called

models.js:
  Line 234: function deprecatedAnalyze() - never called

UNUSED VARIABLES
----------------
api.js:
  Line 12: const OLD_ENDPOINT = '...' - never referenced

infographics.js:
  Line 89: let tempCache = {} - assigned but never read

EXPORTED BUT UNUSED
-------------------
shared.js exports SharedLegacy - not imported anywhere

Total: 5 functions, 2 variables, 1 export
```

### 3. Orphaned Files (`/dead-code files`)

Finds files not referenced by any other file:

```
ORPHANED FILES
==============

Checking references in:
- HTML: <script src>, <link href>, <img src>
- JS: import, require, fetch()
- CSS: @import, url()

POTENTIALLY ORPHANED
--------------------
/assets/old-logo.png - no references found
/legacy-page.html - no links from other pages
/unused-worker.js - not registered anywhere

REFERENCED BUT MAYBE UNUSED
---------------------------
/old-styles.css - only referenced in commented code

Total: 4 potentially orphaned files
```

## Analysis Methods

### CSS Analysis
```javascript
// Extract all class definitions from CSS
const cssClasses = extractFromCSS('.class-name');

// Search for usage in HTML
grep('class="[^"]*class-name[^"]*"', '*.html');

// Search for usage in JS
grep('classList|className|querySelector.*class-name', '*.js');
```

### JavaScript Analysis
```javascript
// Find function definitions
grep('function functionName|const functionName = |let functionName = .*=>', '*.js');

// Find function calls
grep('functionName(', '*.js');

// Check exports vs imports
// exports in file A, imports in other files
```

### File Reference Analysis
```javascript
// Check HTML script/link tags
grep('src="|href="', '*.html');

// Check JS imports
grep('import|require|fetch', '*.js');
```

## Output Format

```
DEAD CODE REPORT: HEFAISTOS
===========================

CSS
---
Unused classes: 4
Estimated lines: ~120

JAVASCRIPT
----------
Unused functions: 5
Unused variables: 2
Unused exports: 1

FILES
-----
Orphaned files: 4

SUMMARY
-------
Total dead code items: 16
Recommendation: Review and remove to reduce maintenance

QUICK WINS (safe to remove):
1. .old-button in styles.css
2. legacyUpload() in shared.js
3. /assets/old-logo.png

NEEDS REVIEW (might be dynamically used):
1. .unused-grid - check for JS classList.add
2. deprecatedAnalyze() - check for string-based calls
```

## Safe Removal Checklist

Before removing dead code:

1. **Search thoroughly**
   - Check for string-based references: `element.className = 'class-name'`
   - Check for dynamic calls: `window[functionName]()`
   - Check for conditional loading

2. **Check git history**
   - Was it recently added? Might be for upcoming feature
   - Is it in a feature branch?

3. **Test after removal**
   - Run `/visual-test compare`
   - Run `/functional-test`
   - Manual smoke test

## Exclusions

These are intentionally excluded from dead code detection:

### CSS
- `.active`, `.disabled`, `.loading` - state classes added by JS
- `.orb-*`, `.noise-*` - decorative elements
- Media query variants

### JavaScript
- Event handler functions passed to addEventListener
- Callback functions passed to APIs
- Exported functions (might be used elsewhere)

### Files
- Documentation (*.md)
- Configuration files
- Test files

## When to Run

- During refactoring sprints
- Before major releases (cleanup)
- Quarterly maintenance
- When bundle size is a concern
- After removing features

## Integration

Combine with other audits:
```
/dead-code && /audit && /perf
```

After removing dead code:
```
/visual-test compare  # Ensure no visual changes
/functional-test      # Ensure nothing broke
```
