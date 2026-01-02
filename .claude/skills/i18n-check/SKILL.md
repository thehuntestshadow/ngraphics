---
name: i18n-check
description: Validate translations across all 10 languages. Find missing keys, unused translations, and formatting issues.
---

# i18n Validation Skill

Validates translation completeness and consistency across all supported languages.

## Usage

```
/i18n-check [command]
```

Commands:
- `missing` - Find keys missing from non-English languages (default)
- `unused` - Find translation keys not used in code
- `format` - Check formatting consistency (placeholders, special chars)
- `all` - Run all checks

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| en | English | Base language |
| ro | Romanian | |
| de | German | |
| fr | French | |
| es | Spanish | |
| it | Italian | |
| pt | Portuguese | |
| nl | Dutch | |
| pl | Polish | |
| cs | Czech | |

## Checks Performed

### 1. Missing Translations (`/i18n-check missing`)

Compares all language objects against English (base language):

```
MISSING TRANSLATIONS
====================

German (de) - 3 missing:
  - 'settings.dangerZone'
  - 'msg.durationLong'
  - 'error.rateLimit'

French (fr) - 1 missing:
  - 'label.variations'

Czech (cs) - 5 missing:
  - 'nav.syncNow'
  - 'btn.retry'
  - 'msg.syncing'
  - 'msg.synced'
  - 'settings.cloudSync'

SUMMARY
-------
Total keys: 62
Languages checked: 9
Missing translations: 9
```

### 2. Unused Translations (`/i18n-check unused`)

Finds translation keys defined but never used in code:

```javascript
// Search for i18n.t('key') calls across all JS files
// Compare against keys defined in i18n.js
```

```
UNUSED TRANSLATIONS
===================

Keys defined but not used:
  - 'btn.confirm' (defined in all languages)
  - 'msg.cleared' (defined in all languages)
  - 'label.noHistory' (duplicate of 'msg.noHistory')

Recommendation: Remove unused keys to reduce bundle size
```

### 3. Format Validation (`/i18n-check format`)

Checks for consistency issues:

- **Placeholder mismatches**: `{name}` in English but `{nombre}` in Spanish
- **Missing special characters**: German umlauts (ä, ö, ü, ß)
- **Punctuation consistency**: Trailing periods, exclamation marks
- **Length warnings**: Translations significantly longer than English (may break UI)

```
FORMAT ISSUES
=============

Placeholder mismatch:
  - 'msg.welcome': EN has {name}, ES has {usuario}

Length warnings (>50% longer than English):
  - 'settings.interfaceLangDesc' in German (89 chars vs 42 chars EN)

Missing special characters:
  - German 'btn.close' should use 'Schließen' not 'Schliessen'
```

## Process

1. **Read i18n.js** - Parse all translation objects
2. **Extract English keys** - Use as reference
3. **Compare each language** - Find missing/extra keys
4. **Scan codebase** - Find `i18n.t()` calls in all JS files
5. **Cross-reference** - Detect unused keys
6. **Validate format** - Check placeholders and special chars

## Files Checked

- `i18n.js` - Translation definitions
- `*.js` - All JavaScript files for `i18n.t()` usage
- `*.html` - HTML files for `data-i18n` attributes (if used)

## Output Format

```
i18n VALIDATION REPORT
======================

MISSING TRANSLATIONS
--------------------
de: 3 missing
fr: 1 missing
cs: 5 missing
(other languages complete)

UNUSED KEYS
-----------
3 keys defined but never used

FORMAT ISSUES
-------------
2 placeholder mismatches
1 length warning

SUMMARY
-------
Status: NEEDS ATTENTION
Missing: 9 translations across 3 languages
Action: Add missing translations to i18n.js
```

## Adding New Translations

When adding new UI text:

1. Add English key first: `'new.key': 'English text'`
2. Run `/i18n-check missing` to see what's needed
3. Add translations for all 9 other languages
4. Run `/i18n-check all` to verify

## Common Fixes

### Adding missing translation
```javascript
// In i18n.js, add to each language object:
de: {
    // ... existing
    'new.key': 'German translation',
},
```

### Fixing placeholder mismatch
```javascript
// Ensure same placeholder names across languages:
en: { 'msg.hello': 'Hello {name}!' },
de: { 'msg.hello': 'Hallo {name}!' },  // Same {name} placeholder
```

## When to Run

- After adding new UI strings
- Before releases
- When adding new languages
- During code review of i18n changes
