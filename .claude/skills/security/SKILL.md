---
name: security
description: Security audit for HEFAISTOS. Checks for exposed secrets, XSS vectors, and security best practices.
---

# Security Audit Skill

Comprehensive security checks for the HEFAISTOS production application.

## Usage

```
/security [area]
```

Areas:
- `secrets` - Scan for hardcoded API keys and credentials
- `xss` - Check for XSS vulnerabilities
- `storage` - Audit localStorage/sessionStorage usage
- `headers` - Check security headers in HTML
- `all` - Run all checks (default)

## Checks Performed

### 1. Secrets Scan (`/security secrets`)

Detects hardcoded credentials and API keys:

```
SECRETS SCAN
============

Patterns checked:
- API keys: sk-, pk_, api_key, apiKey, API_KEY
- Supabase: supabase_key, anon_key, service_role
- OpenRouter: openrouter, OPENROUTER
- Generic: password, secret, token, credential

Files scanned: *.js, *.html, *.json, *.md

FINDINGS
--------
[PASS] No hardcoded API keys found
[WARN] api.js:45 - localStorage key 'openrouter_api_key' (expected)
[PASS] No Supabase service_role keys exposed
[PASS] No passwords in source code
```

### 2. XSS Vulnerability Check (`/security xss`)

Identifies potential Cross-Site Scripting vectors:

```
XSS VULNERABILITY SCAN
======================

Dangerous patterns:
- innerHTML with user input
- document.write()
- eval() usage
- setTimeout/setInterval with strings
- jQuery .html() with variables

FINDINGS
--------
[WARN] models.js:234 - innerHTML assignment
       -> elements.description.innerHTML = userInput
       -> Recommendation: Use textContent or sanitize

[PASS] No eval() usage found
[PASS] No document.write() found
[INFO] 12 innerHTML usages found (review manually)

Safe patterns detected:
- textContent: 45 usages (good)
- DOMPurify: not installed (consider adding)
```

### 3. Storage Audit (`/security storage`)

Reviews client-side storage for sensitive data:

```
STORAGE AUDIT
=============

localStorage keys used:
- ngraphics_api_key [EXPECTED - user's own key]
- ngraphics_history [OK - non-sensitive]
- ngraphics_favorites [OK - non-sensitive]
- ngraphics_theme [OK - preference]
- supabase_auth_token [EXPECTED - auth token]

FINDINGS
--------
[PASS] No passwords stored in localStorage
[PASS] No credit card data
[INFO] API key stored locally (user-controlled, acceptable)
[WARN] Check session expiry on auth tokens

sessionStorage keys:
- (none found)

IndexedDB databases:
- hefaistos_images [OK - user's generated images]
```

### 4. Security Headers (`/security headers`)

Checks HTML files for security-related headers and meta tags:

```
SECURITY HEADERS
================

Files checked: *.html

Content Security Policy:
[WARN] No CSP meta tag found
       -> Add: <meta http-equiv="Content-Security-Policy" content="...">

X-Frame-Options equivalent:
[PASS] Not needed for static site (no sensitive iframes)

Referrer Policy:
[INFO] No referrer policy set
       -> Consider: <meta name="referrer" content="strict-origin-when-cross-origin">

External scripts:
- supabase CDN (trusted)
- No other external scripts (good)

Forms:
[PASS] All forms have autocomplete="off" on sensitive fields
```

## Risk Levels

| Level | Meaning | Action |
|-------|---------|--------|
| [CRITICAL] | Immediate security risk | Fix before deploy |
| [WARN] | Potential vulnerability | Review and fix |
| [INFO] | Best practice suggestion | Consider fixing |
| [PASS] | Check passed | No action needed |

## Output Format

```
SECURITY AUDIT: HEFAISTOS
=========================

SECRETS
-------
[PASS] No hardcoded credentials

XSS
---
[WARN] 2 potential innerHTML issues
[PASS] No eval() or document.write()

STORAGE
-------
[PASS] No sensitive data exposed
[INFO] API key stored (user-controlled)

HEADERS
-------
[WARN] No CSP configured

SUMMARY
-------
Critical: 0
Warnings: 3
Info: 2
Passed: 8

Overall: GOOD (address warnings before next release)
```

## Common Fixes

### innerHTML with user input
```javascript
// UNSAFE
element.innerHTML = userInput;

// SAFE - use textContent for plain text
element.textContent = userInput;

// SAFE - sanitize HTML if needed
element.innerHTML = DOMPurify.sanitize(userInput);
```

### API key handling
```javascript
// NEVER do this
const API_KEY = 'sk-live-xxxxx';

// CORRECT - user provides their own key
const apiKey = localStorage.getItem('openrouter_api_key');
```

### Content Security Policy
```html
<!-- Add to <head> -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  connect-src 'self' https://openrouter.ai https://*.supabase.co;
">
```

## Supabase-Specific Checks

- Verify RLS policies are enabled on all tables
- Check that anon key (not service_role) is used client-side
- Ensure auth tokens are handled properly
- Validate redirect URLs in auth config

## When to Run

- Before each production deployment
- After adding new user input handling
- When adding external dependencies
- Monthly security review
- After security-related code changes

## Integration with Other Skills

Run security after functional changes:
```
/functional-test && /security
```

Include in pre-release checklist:
```
/audit && /security && /perf
```
