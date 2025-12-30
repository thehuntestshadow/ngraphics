---
name: update-docs
description: Update NGRAPHICS documentation files (CLAUDE.md, ROADMAP.md, UI_PATTERNS.md) to reflect current codebase state.
---

# Update Documentation Skill

Syncs documentation with actual codebase state.

## Usage

```
/update-docs [file]
```

Files:
- `claude` - Update CLAUDE.md
- `roadmap` - Update ROADMAP.md
- `patterns` - Update UI_PATTERNS.md
- `all` - Update all docs (default)

## What Gets Updated

### CLAUDE.md Updates
1. **Pages table** - Add/remove pages, update file lists
2. **Page sections** - Sync features, options, functions documented
3. **Storage keys** - Update favorites/history key names
4. **SharedHeader options** - Update currentPage options list
5. **Common patterns** - Update if new patterns emerge

### ROADMAP.md Updates
1. **Completed Pages** - Mark new pages as done
2. **Feature checkboxes** - Mark implemented features ✅
3. **Version sections** - Update what's in each version
4. **Technical improvements** - Check off completed items

### UI_PATTERNS.md Updates
1. **New patterns** - Add patterns discovered during development
2. **Icon reference** - Add new icons used
3. **Checklist** - Add new verification items
4. **Examples** - Update code examples if patterns changed

## Process

1. **Scan codebase** - Read all HTML/JS/CSS files
2. **Extract current state** - Pages, features, patterns, storage keys
3. **Compare to docs** - Find discrepancies
4. **Generate diff** - Show what needs updating
5. **Apply updates** - Make changes (with confirmation)

## Example Output

```
DOCUMENTATION SYNC
==================

CLAUDE.md
---------
+ Add: Lifestyle Studio section (lines 256-297) ✓ Already present
~ Update: SharedHeader options - add 'lifestyle' ✓ Already present
~ Update: Storage keys - add lifestyle_studio_favorites ✓ Already present

ROADMAP.md
----------
✓ Lifestyle Studio marked complete
~ Update: v2.0 section - mark "1-2 new studio pages" done

UI_PATTERNS.md
--------------
+ Add: Footer section
+ Add: Checklist items for footer and favorites modal

Changes to apply: 3
Proceed? [y/n]
```

## When to Run

Run `/update-docs` after:
- Creating a new page
- Adding major features
- Changing UI patterns
- Modifying shared utilities
- Before committing significant changes
