---
name: e2e-test
description: Run Playwright E2E tests for HEFAISTOS. Tests auth flows, navigation, page rendering, and responsive design.
---

# E2E Test Skill

Run end-to-end tests using Playwright to verify critical user flows.

## Usage

```
/e2e-test [options]
```

Options:
- `all` - Run all E2E tests (default)
- `auth` - Run authentication tests only
- `landing` - Run landing page tests only
- `navigation` - Run navigation tests only
- `settings` - Run settings page tests only
- `headed` - Run tests in visible browser
- `debug` - Run in debug mode with inspector

## Test Suites

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Auth | `e2e/auth.spec.js` | 23 | Login/signup modal, form validation, OAuth, auth gate |
| Landing | `e2e/landing.spec.js` | 10 | Hero section, studios grid, navigation, theme toggle |
| Navigation | `e2e/navigation.spec.js` | 20 | Page links, studio links, page titles, header consistency |
| Gallery | `e2e/gallery.spec.js` | 6 | Gallery grid, items, responsive |
| Settings | `e2e/settings.spec.js` | 25 | All settings sections, theme, language, responsive |
| Pricing | `e2e/pricing.spec.js` | 6 | Pricing cards, features, responsive |

## Procedure

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Suite
```bash
npx playwright test e2e/auth.spec.js
npx playwright test e2e/landing.spec.js
npx playwright test e2e/navigation.spec.js
```

### Run in Headed Mode (Visible Browser)
```bash
npm run test:e2e:headed
```

### Run with Playwright UI
```bash
npm run test:e2e:ui
```

### Run in Debug Mode
```bash
npm run test:e2e:debug
```

### Run All Tests (Unit + E2E)
```bash
npm run test:all
```

## Example Output

```
Running 90 tests using 5 workers

  ✓ auth.spec.js:15:3 › Authentication Modal › should display login form
  ✓ auth.spec.js:31:3 › Authentication Modal › should switch to signup mode
  ✓ landing.spec.js:9:3 › Landing Page › should display hero section
  ...

  90 passed (19.8s)
```

## Test Categories

### Authentication Tests (`auth.spec.js`)
- Modal display and switching between login/signup
- Form validation (email, password, confirmation)
- Close modal via button, backdrop, Escape key
- OAuth provider buttons (Google, GitHub)
- Auth gate on protected pages
- Auth exempt pages (landing, gallery, FAQ, pricing, settings)

### Landing Page Tests (`landing.spec.js`)
- Hero section content (badge, title, subtitle, CTAs)
- Header elements (logo, theme toggle, account)
- Theme toggle functionality
- Studios section visibility
- Studio card navigation
- Footer content
- Responsive design

### Navigation Tests (`navigation.spec.js`)
- Page-to-page navigation
- Studio links from landing page
- Page titles
- Header consistency across pages

### Settings Tests (`settings.spec.js`)
- Page structure (title, sidebar, header)
- Section navigation via hash
- Appearance section (theme toggle)
- Language section (dropdowns)
- API Keys section
- Danger Zone section
- Responsive design

## Configuration

Tests are configured in `playwright.config.js`:
- Browser: Chromium
- Base URL: `http://localhost:8000`
- Timeout: 30 seconds
- Auto-starts local server via `python3 -m http.server 8000`

## When to Run

- Before deploying to production
- After modifying auth flows
- After changing page layouts
- After updating navigation
- As part of CI/CD pipeline
- When debugging user-reported issues

## Troubleshooting

### Tests Timing Out
```bash
# Increase timeout
npx playwright test --timeout=60000
```

### Server Not Starting
```bash
# Start server manually first
python3 -m http.server 8000 &
npx playwright test
```

### View Failed Test Screenshots
Failed tests save screenshots to `test-results/` directory.

### View Test Report
```bash
npx playwright show-report
```
