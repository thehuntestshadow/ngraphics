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
│  Header: HEFAISTOS | Settings | [Dashboard] [Theme]             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────────────┐   │
│  │ Sidebar Nav │  │  Content Area                           │   │
│  │             │  │                                         │   │
│  │ • Profile   │  │  [Active Section Content]               │   │
│  │ • Billing   │  │                                         │   │
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
- **Display Name**: Editable text field with loading state on save
- **Email**: Read-only (from auth provider)
- **Save Changes**: Updates profile via Supabase

### 2. Usage & Billing
- **Plan Badge**: Shows current subscription tier (Free/Pro)
- **Reset Date**: Shows "Resets in X days" countdown
- **Generation Usage**: Progress bar with used/limit (warning at 70%, danger at 90%)
- **Credits Balance**: If applicable
- **Upgrade Button**: Links to pricing.html (free users)
- **Manage Subscription**: Opens Stripe billing portal (pro users)

### 3. API Keys
- **Luma AI Key**: For video generation in Model Video studio
- **Show/Hide Toggle**: Password visibility toggle
- **Test Connection**: Validates API key with Luma API (with loading spinner)
- **Save Keys**: Stores in localStorage

### 4. Appearance
- **Theme Toggle**: Three options:
  - **Dark**: Force dark mode
  - **Light**: Force light mode
  - **System**: Follow OS preference (auto-updates on system change)

### 5. Language
- **Interface Language**: Dropdown for UI language (10 languages)
- **Generation Language**: Dropdown for AI-generated content language
- Languages displayed as: "Native (English)" e.g., "Deutsch (German)"
- Supported: EN, RO, DE, FR, ES, IT, PT, NL, PL, CS

### 6. Data & Storage
- **Cloud Sync Toggle**: Enable/disable automatic sync
- **Last Sync**: Timestamp of last successful sync
- **Sync Now**: Manual sync trigger with loading spinner

### 7. Danger Zone
- **Clear All History**: Removes generation history from all studios
- **Clear All Favorites**: Removes saved favorites from all studios
- **Delete Account**: Permanently deletes account and all data
- All actions require confirmation dialogs (double confirmation for delete)

## URL Navigation

The page supports hash-based navigation for direct linking to sections:

- `/settings.html` - Default (Profile)
- `/settings.html#profile` - Profile section
- `/settings.html#billing` - Usage & Billing
- `/settings.html#api-keys` - API Keys
- `/settings.html#appearance` - Appearance
- `/settings.html#language` - Language
- `/settings.html#data` - Data & Storage
- `/settings.html#danger` - Danger Zone

## Access Control

- **No Auth Gate**: The page handles its own auth state
- **Not Logged In**: Shows a login prompt instead of settings
- **Logged In**: Shows full settings interface

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

## Dependencies

- `config.js` - API URLs
- `supabase.js` - Auth and profile management
- `auth-ui.js` - AccountMenu, AuthUI classes
- `i18n.js` - Language settings
- `shared.js` - SharedTheme, SharedUI utilities
- `cloud-sync.js` - Optional, for sync functionality

## Mobile Responsiveness

At 768px and below:
- Sidebar becomes horizontal tabs with icons only
- Sections stack vertically
- Full-width buttons
- Touch-friendly toggle switches

At 480px and below:
- Reduced padding
- Smaller font sizes
- Stacked buttons

## Keyboard Shortcuts

- **Escape**: Navigate back to dashboard

## UI Components

### Loading States
Buttons use the `.btn-loading` class during async operations:
- Shows a spinning indicator
- Disables pointer events
- Reduces opacity

```css
.btn-loading {
    position: relative;
    pointer-events: none;
    opacity: 0.7;
}
```

Helper function:
```javascript
setButtonLoading(button, isLoading, originalText)
```

### Section Display
Sections use CSS class-based visibility instead of inline styles:
- `.settings-section` - Hidden by default (`display: none`)
- `.settings-section.active` - Visible (`display: block`)

### Theme System
The System theme option follows OS preference:
```javascript
window.matchMedia('(prefers-color-scheme: dark)').matches
```
Listens for real-time changes when System theme is active.
