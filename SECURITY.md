# Security Configuration

This document describes security measures for the HEFAISTOS application.

## Current Security Measures

### XSS Protection
- **escapeHtml utility** (`shared.js:39-44`): Global function to escape user input before inserting into innerHTML
- Usage: `escapeHtml(userInput)` - use when displaying any user-provided data

### Authentication
- Supabase Auth handles all authentication
- Sessions stored securely via Supabase SDK
- Row Level Security (RLS) policies isolate user data

### Production Logging
- **ngLog utility** (`core.js:15-52`): Conditional logging disabled in production
- Auto-detects production by hostname (`hefaistos.xyz`)
- Override via console: `ngLog.setEnabled(true)` or localStorage: `ngraphics_debug=1`
- Errors always logged regardless of setting

### API Keys
- Local storage (client-side limitation)
- Cloud-stored keys encrypted via Supabase Edge Functions (when signed in)

---

## Recommended Security Headers

### For Coolify (Caddy/Nginx/Traefik)

Add these headers to your reverse proxy configuration:

#### Caddy (Caddyfile)
```caddy
hefaistos.xyz {
    root * /srv
    file_server

    header {
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"

        # Prevent MIME-type sniffing
        X-Content-Type-Options "nosniff"

        # Enable XSS filter
        X-XSS-Protection "1; mode=block"

        # Referrer policy
        Referrer-Policy "strict-origin-when-cross-origin"

        # Permissions policy (restrict browser features)
        Permissions-Policy "geolocation=(), microphone=(), camera=()"

        # Content Security Policy
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://openrouter.ai https://api.luma.ai https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';"

        # HTTPS enforcement (production only)
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
    }
}
```

#### Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name hefaistos.xyz;
    root /var/www/ngraphics;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://openrouter.ai https://api.luma.ai https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Headers Explanation

| Header | Purpose |
|--------|---------|
| `X-Frame-Options` | Prevents clickjacking by disabling iframe embedding |
| `X-Content-Type-Options` | Prevents MIME-type sniffing attacks |
| `X-XSS-Protection` | Enables browser XSS filter (legacy) |
| `Referrer-Policy` | Controls referrer information sent with requests |
| `Permissions-Policy` | Disables unnecessary browser features |
| `Content-Security-Policy` | Controls what resources can be loaded |
| `Strict-Transport-Security` | Enforces HTTPS connections |

### CSP Breakdown

The Content Security Policy allows:
- **default-src 'self'**: Only load resources from same origin by default
- **script-src**: Self + CDNs (jsdelivr, esm.sh) + inline scripts (needed for event handlers)
- **style-src**: Self + inline styles + Google Fonts
- **font-src**: Self + Google Fonts CDN
- **img-src**: Self + data URIs + blobs + any HTTPS (for generated images)
- **connect-src**: Self + OpenRouter API + Luma API + Supabase
- **frame-ancestors**: Only allow embedding by same origin

---

## Checklist for Production

### Supabase Dashboard
1. [ ] Verify RLS policies are enabled on all tables
2. [ ] Add production URL to allowed redirect URLs: `https://hefaistos.xyz`
3. [ ] Disable unused auth providers
4. [ ] Set up rate limiting on Edge Functions

### Coolify/Server
1. [ ] Enable security headers (see above)
2. [ ] Enable HTTPS with valid certificate
3. [ ] Configure firewall to block unused ports

### Codebase
1. [x] Use `escapeHtml()` for user-provided data in innerHTML
2. [x] Auth errors use safe `textContent` not `innerHTML`
3. [x] Production logging disabled by default (`ngLog` utility)
4. [ ] Consider adding subresource integrity (SRI) for CDN scripts

---

## Known Limitations

### API Keys in localStorage
API keys are stored in browser localStorage. This is inherent to client-side apps:
- **Mitigation**: Keys are per-browser, cleared on logout
- **Best practice**: Users should use API keys with spending limits
- **When signed in**: Keys can be stored encrypted in Supabase (preferred)

### Third-party CDN Dependencies
The app loads Supabase SDK from jsdelivr CDN:
- **Mitigation**: CDN is reputable with SRI support
- **Future**: Consider bundling dependencies or using SRI hashes

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the maintainer directly rather than creating a public issue.
