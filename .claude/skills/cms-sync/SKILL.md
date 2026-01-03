---
name: cms-sync
description: Verify HTML default content matches CMS database. Fix mismatches by updating HTML to match CMS (source of truth).
---

# CMS Sync Skill

Verifies that HTML default content matches CMS database content. Fixes mismatches by updating HTML to match CMS.

## Usage

```
/cms-sync
```

## What It Does

1. **Fetch CMS content** from Supabase `cms_homepage` table
2. **Compare with HTML** defaults in `index.html`
3. **Report mismatches** between HTML and CMS
4. **Update HTML** to match CMS (CMS is the source of truth)

## CMS Content Mapping

The `cms_homepage` table stores hero section content:

| CMS Field | HTML Element | Selector |
|-----------|--------------|----------|
| `hero.badge` | Badge text | `.hero-badge span` |
| `hero.title` | Main heading | `.hero-title` |
| `hero.subtitle` | Subtitle paragraph | `.hero-subtitle` |
| `hero.cta1_text` | Primary CTA button | `.hero-cta span` |
| `hero.cta1_link` | Primary CTA link | `.hero-cta[href]` |
| `hero.cta2_text` | Secondary CTA button | `.hero-cta-secondary span` |
| `hero.cta2_link` | Secondary CTA link | `.hero-cta-secondary[href]` |

## Procedure

### Step 1: Fetch CMS Content

```sql
SELECT id, content FROM cms_homepage WHERE id = 'hero';
```

### Step 2: Extract HTML Defaults

Read `index.html` and extract current values:

```bash
# Badge
grep -oP '(?<=<span>)[^<]+(?=</span>)' index.html | head -1

# Title
grep -oP '(?<=hero-title">)[^<]+' index.html

# Subtitle
grep -oP '(?<=hero-subtitle">)[^<]+' index.html
```

### Step 3: Compare and Update

For each field, compare CMS value with HTML value. If different:

1. Report the mismatch
2. Update HTML to match CMS using Edit tool

## Example Output

```
CMS SYNC CHECK
==============

Checking index.html against cms_homepage...

FIELD COMPARISON:
-----------------

hero.badge:
  HTML: "AI-Powered E-commerce Toolkit"
  CMS:  "AI-Powered E-commerce Toolkit"
  ✓ Match

hero.title:
  HTML: "Create stunning product visuals in seconds"
  CMS:  "Create Stunning Product Visuals in Seconds"
  ✗ Case mismatch - Updated HTML

hero.subtitle:
  HTML: "20+ AI studios for infographics..."
  CMS:  "HEFAISTOS helps e-commerce brands..."
  ✗ Mismatch - Updated HTML

hero.cta1_text:
  HTML: "Start Creating"
  CMS:  "Start Creating"
  ✓ Match

SUMMARY:
--------
Fields checked: 7
Matches: 5
Mismatches fixed: 2
```

## Why CMS is Source of Truth

- CMS content is editable via admin panel without code deployment
- HTML defaults are fallbacks for when CMS/Supabase is unavailable
- Keeping them in sync prevents "flash of wrong content" on page load
- The visible flash happens because:
  1. Browser renders HTML immediately
  2. JavaScript loads and fetches CMS
  3. CMS content replaces HTML content
  4. User sees the switch (bad UX)

## When to Run

- After updating CMS content via admin panel
- Before deploying to production
- As part of pre-commit hooks
- When investigating "flash of content" issues
