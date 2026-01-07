# Settings Page

The settings page (`settings.html`) provides a dedicated space for users to manage their account, preferences, and data. It replaces the previous modal-based settings in favor of a full-page experience.

## Files

| File | Purpose |
|------|---------|
| `settings.html` | Page structure with sidebar navigation and sections |
| `settings.css` | Layout and component styles |
| `settings.js` | Logic, event handlers, and API integration |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: HEFAISTOS | Settings | [Dashboard] [Account] [Theme]   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │ Sidebar Nav │  │  Content Area                           │   │
│  │             │  │                                         │   │
│  │ • Profile   │  │  [Active Section Content]               │   │
│  │ • Billing   │  │                                         │   │
│  │ • Analytics │  │                                         │   │
│  │ • API Keys  │  │                                         │   │
│  │ • Appearance│  │                                         │   │
│  │ • Language  │  │                                         │   │
│  │ • Data      │  │                                         │   │
│  │ • Danger    │  │                                         │   │
│  └─────────────┘  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Sections

### 1. Profile
- **Display Name**: Editable text field
- **Email**: Read-only (from Supabase auth)
- **Save Profile**: Updates profile via `ngSupabase.updateProfile()`

### 2. Usage & Billing
- **Plan Badge**: Shows current tier (FREE/PRO)
- **Reset Date**: "Resets in X days" countdown
- **Monthly Generations**: Progress bar with used/limit
  - Warning state at 70%
  - Danger state at 90%
- **Credits Balance**: Shown if credits > 0
- **Upgrade to Pro**: Link to pricing.html (free users)
- **Manage Subscription**: Opens Stripe billing portal (pro users)

### 3. Analytics & Usage
- **Overview Cards**: Generations count, favorites, storage usage, API status
- **Cost Tracker**: Monthly spending breakdown with model costs
- **Charts Grid**:
  - Generation Trends (7-day line chart)
  - Model Usage (doughnut chart)
  - Studio Breakdown (bar chart)
  - Quick Access (recent thumbnails grid)
- **Storage Panel**: Per-studio storage usage, Export All, Clear Old Items
- **Trash Section**: Recently deleted items with restore/delete options
- **Activity Table**: Recent activity log with studio filtering
- **Tabs**: Overview, Infographics, Models, Bundles filters for charts

### 4. API Keys
- **Luma AI Key**: For video generation in Model Video studio
  - Password input with show/hide toggle
  - Test button to validate key against Luma API
  - Stored in localStorage
- **Save API Key**: Persists to localStorage

### 5. Appearance
- **Theme Toggle**: Three-button toggle:
  - **Dark**: Force dark mode
  - **Light**: Force light mode
  - **System**: Follow OS preference (auto-updates on system change)

### 6. Language
- **Interface Language**: Dropdown for UI language (10 languages)
- **Generation Language**: Dropdown for AI-generated content language
- Languages displayed as: "Native (English)" e.g., "Deutsch (German)"
- Supported: EN, RO, DE, FR, ES, IT, PT, NL, PL, CS
- Interface change requires page refresh

### 7. Data & Sync
- **Cloud Sync Toggle**: Enable/disable automatic sync
- **Sync Status**: Shows last sync timestamp or "Never synced"
- **Sync Now**: Manual sync trigger with loading state

### 8. Danger Zone
- **Clear All History**: Removes history from all 19 studios
- **Clear All Favorites**: Removes favorites from all studios
- **Delete Account**: Permanently deletes account and all data
- All actions use custom confirm dialogs (double confirmation for delete)

## URL Navigation

Hash-based navigation for direct linking:

| URL | Section |
|-----|---------|
| `/settings.html` | Profile (default) |
| `/settings.html#profile` | Profile |
| `/settings.html#billing` | Usage & Billing |
| `/settings.html#analytics` | Analytics & Usage |
| `/settings.html#api-keys` | API Keys |
| `/settings.html#appearance` | Appearance |
| `/settings.html#language` | Language |
| `/settings.html#data` | Data & Sync |
| `/settings.html#danger` | Danger Zone |

## Access Control

- **No Auth Gate**: Page handles its own auth state via `ngSupabase`
- **Not Logged In**: Shows login prompt with Sign In / Create Account buttons
- **Logged In**: Shows full settings interface with sidebar navigation

## Storage Keys

| Key | Purpose |
|-----|---------|
| `luma_api_key` | Luma AI API key |
| `ngraphics_ui_language` | Interface language code |
| `ngraphics_gen_language` | Generation language code |
| `copywriter_language` | Legacy key (synced with gen_language) |
| `cloud_sync_enabled` | Cloud sync toggle state |
| `last_sync_time` | Timestamp of last sync |
| `theme` | Current theme (dark/light/system) |
| `ngraphics_theme` | Theme for initial flash prevention |

## Dependencies

| File | Purpose |
|------|---------|
| `config.js` | API URLs (SUPABASE_URL) |
| `supabase.js` | Auth, profile management, usage data |
| `auth-ui.js` | AccountMenu component |
| `i18n.js` | LANGUAGES array, language settings |
| `shared.js` | SharedTheme, SharedUI, SharedDashboard, SharedCostEstimator, SharedTrash utilities |
| `dashboard.css` | Analytics section styles (charts, cards, tables) |
| `Chart.js` | Chart library for analytics (CDN) |

Optional (checked with typeof):
- `cloudSync` - For sync functionality
- `ImageStore` - For clearing IndexedDB history

## Studios List

The danger zone actions affect these 19 studios:

```javascript
const STUDIOS = [
    'ngraphics', 'model_studio', 'bundle_studio', 'lifestyle_studio',
    'copywriter', 'packaging', 'comparison_generator', 'size_visualizer',
    'faq_generator', 'background_studio', 'badge_generator', 'feature_cards',
    'size_chart', 'aplus_generator', 'product_variants', 'social_studio',
    'export_center', 'ad_creative', 'model_video'
];
```

## Mobile Responsiveness

**At 768px and below:**
- Sidebar becomes horizontal scrollable tabs
- Icons only (text hidden)
- Sections stack vertically
- Full-width buttons

**At 480px and below:**
- Reduced padding
- Smaller font sizes
- Stacked form elements

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Navigate to dashboard |

## CSS Architecture

### Section Display
Sections use class-based visibility:
- `.settings-section` - Hidden by default (`display: none`)
- `.settings-section.active` - Visible (`display: block`)

**Important**: `settings.css` uses `.settings-page .settings-content` selector to override the global `.settings-content { display: none }` rule from `styles.css` (which is used for collapsible dropdowns on studio pages).

### Loading States
Buttons use `.btn-loading` class during async operations:
```javascript
setButtonLoading(button, isLoading, originalText)
```

### Theme System
System theme follows OS preference with real-time listener:
```javascript
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)
```

## Known Issues

None currently.

---

*Updated: January 2026*
