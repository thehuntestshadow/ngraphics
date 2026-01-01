# HEFAISTOS Admin Panel Documentation

## Overview

The Admin Panel (`/admin.html`) provides administrative control over users, subscriptions, content management, and system analytics. Only users with `is_admin = true` in the `profiles` table can access this page.

**URL**: `/admin.html`

---

## Access Control

### How It Works

1. User navigates to `/admin.html`
2. System waits for Supabase authentication to initialize
3. Checks if user is logged in (`ngSupabase.isAuthenticated`)
4. Calls `is_current_user_admin()` RPC function to verify admin status
5. If not admin, redirects to `index.html`
6. If admin, displays the admin panel

### Granting Admin Access

Run this SQL in Supabase SQL Editor:

```sql
-- Grant admin access to a user
UPDATE profiles SET is_admin = TRUE WHERE email = 'user@example.com';

-- Verify admin users
SELECT id, email, is_admin FROM profiles WHERE is_admin = TRUE;

-- Revoke admin access
UPDATE profiles SET is_admin = FALSE WHERE email = 'user@example.com';
```

---

## Navigation Sections

The admin panel has a sidebar with these sections:

| Section | Description |
|---------|-------------|
| **Dashboard** | Overview stats, charts, recent users |
| **Users** | Full user list with search/filter/export |
| **Subscriptions** | Active paid subscriptions |
| **Usage** | Generation analytics (placeholder) |
| **Audit Log** | Admin action history |
| **CMS: Homepage** | Edit landing page content |
| **CMS: Gallery** | Manage showcase gallery |
| **CMS: FAQ** | Manage FAQ content |

---

## Dashboard

### Stats Cards

| Stat | Description |
|------|-------------|
| Total Users | Count of all registered users |
| Active Subscriptions | Users with active paid plans |
| MRR | Monthly Recurring Revenue |
| Pro Subscribers | Users on Pro plan ($19/mo) |
| Business Subscribers | Users on Business plan ($49/mo) |

### Charts

- **User Growth** - 30-day user count trend (line chart)
- **Subscription Breakdown** - Free/Pro/Business distribution (doughnut)

### Recent Users Table

Shows the 5 most recently registered users with:
- Email
- Subscription tier
- Status
- Join date
- Quick "View" action

---

## Users Section

### Features

1. **Search** - Filter by email or display name (debounced 300ms)
2. **Tier Filter** - Show only Free/Pro/Business users
3. **Status Filter** - Filter by subscription status
4. **Pagination** - 20 users per page
5. **Export CSV** - Download all users as CSV file

### User Table Columns

| Column | Description |
|--------|-------------|
| Email | User's email address |
| Display Name | User's display name |
| Tier | Subscription tier badge |
| Credits | Credit balance |
| Status | Subscription status |
| Joined | Registration date |
| Actions | "Manage" button |

### User Management Modal

Click "Manage" to open user details:

**View Information:**
- Email, Display Name
- Subscription Tier & Status
- Credit Balance
- Join Date
- This Month's Generations

**Administrative Actions:**
- **Set Pro** - Change user to Pro tier
- **Set Business** - Change user to Business tier
- **Set Free** - Downgrade to free tier
- **Add Credits** - Add credits with optional reason

All actions are logged to the audit log.

---

## Subscriptions Section

Shows all active paid subscriptions:

| Column | Description |
|--------|-------------|
| Email | Subscriber's email |
| Tier | Pro or Business |
| Started | Subscription start date |
| Renews | Next renewal date |
| Stripe ID | Stripe subscription ID |
| Actions | "View User" button |

---

## Audit Log

Tracks all administrative actions:

| Column | Description |
|--------|-------------|
| Time | When action occurred |
| Admin | Who performed the action |
| Action | What was done |
| Target | Affected user |
| Details | JSON details |

### Logged Actions

- `update_tier` - Subscription tier changed
- `adjust_credits` - Credits added/removed
- `update_admin_status` - Admin status changed
- `cms_update` - CMS content updated
- `cms_create` - CMS content created
- `cms_delete` - CMS content deleted

---

## CMS: Homepage

Edit the landing page hero section:

| Field | Description |
|-------|-------------|
| Badge | Top badge text (e.g., "AI-Powered") |
| Title | Main headline |
| Subtitle | Supporting text |
| CTA 1 Text/Link | Primary button |
| CTA 2 Text/Link | Secondary button |

### JSON Editor

For advanced sections (features, testimonials, etc.):
1. Select section from dropdown
2. Click "Edit JSON"
3. Modify JSON content
4. Save

---

## CMS: Gallery

Manage the showcase gallery displayed on the landing/gallery pages.

### Gallery Table

| Column | Description |
|--------|-------------|
| Image | Thumbnail preview |
| Title | Image title |
| Studio | Which studio created it |
| Order | Sort order (move up/down) |
| Active | Toggle visibility |
| Actions | Edit/Delete |

### Add/Edit Gallery Item

1. Click "Add Image" or "Edit"
2. Upload image (drag & drop or click)
3. Fill in:
   - Title
   - Description
   - Studio (dropdown)
   - Studio Label (display name)
4. Save

### Reordering

Use the ↑/↓ buttons to change display order.

---

## CMS: FAQ

Manage FAQ content for the FAQ page.

### FAQ Table

| Column | Description |
|--------|-------------|
| Question | The FAQ question |
| Category | Category tag |
| Order | Sort order |
| Active | Toggle visibility |
| Actions | Edit/Delete |

### Categories

- Getting Started
- Billing
- Features
- Technical
- Support

### Add/Edit FAQ

1. Click "Add FAQ" or "Edit"
2. Select category
3. Enter question
4. Use rich text editor for answer (bold, italic, links, lists)
5. Save

---

## Database Functions (RPC)

The admin panel uses `SECURITY DEFINER` functions to bypass RLS:

| Function | Purpose |
|----------|---------|
| `is_current_user_admin()` | Check if current user is admin |
| `get_admin_stats()` | Get dashboard statistics |
| `get_admin_users(search, tier, status, limit, offset)` | Get paginated user list |
| `count_admin_users(search, tier, status)` | Count users for pagination |
| `get_admin_user_details(user_id)` | Get single user details |
| `admin_update_user(user_id, is_admin, tier_id, credit_amount)` | Update user |
| `get_admin_subscriptions()` | Get active subscriptions |
| `get_admin_audit_logs(limit, offset)` | Get audit log entries |

### Why SECURITY DEFINER?

Supabase RLS (Row Level Security) normally restricts users to only see their own data. Admin functions use `SECURITY DEFINER` to:
1. Execute with elevated privileges
2. Access all user data
3. Still verify admin status before returning data

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close any open modal |

---

## Files

| File | Purpose |
|------|---------|
| `admin.html` | Page structure and layout |
| `admin.js` | All admin functionality |
| `admin.css` | Admin-specific styles |
| `supabase/migrations/20260101_admin_functions.sql` | Database functions |

---

## Troubleshooting

### "Redirected to index.html"

**Cause**: Not logged in or not an admin

**Fix**:
1. Log in first on any page
2. Verify admin status:
   ```sql
   SELECT is_admin FROM profiles WHERE email = 'your@email.com';
   ```
3. If `false`, grant admin:
   ```sql
   UPDATE profiles SET is_admin = TRUE WHERE email = 'your@email.com';
   ```

### "Failed to load users" or similar errors

**Cause**: Database functions not created or column mismatch

**Fix**: Run the latest migration in Supabase SQL Editor:
- `supabase/migrations/20260101_admin_functions.sql`

### White background / styling issues

**Cause**: CSS variables not mapped

**Fix**: Ensure `admin.css` has variable mappings at top:
```css
:root {
    --bg-primary: var(--bg-base);
    --accent-primary: var(--accent);
    --accent-hover: var(--accent);
}
```

---

## Security Considerations

1. **Admin check is server-side** - The `is_current_user_admin()` function runs in PostgreSQL, not client-side JavaScript
2. **All admin functions verify permissions** - Each RPC function checks admin status before executing
3. **Actions are logged** - All administrative actions create audit log entries
4. **No hardcoded admin emails** - Admin status is stored in the database, not code

---

## Adding New Admin Features

### 1. Create Database Function

```sql
CREATE OR REPLACE FUNCTION my_admin_function(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Always check admin first!
    IF NOT is_current_user_admin() THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;

    -- Your logic here
END;
$$;

GRANT EXECUTE ON FUNCTION my_admin_function(...) TO authenticated;
```

### 2. Add UI in admin.html

```html
<section class="admin-section" id="section-myfeature">
    <!-- Your UI here -->
</section>
```

### 3. Add Navigation

```html
<button class="nav-item" data-section="myfeature">
    <svg>...</svg>
    <span>My Feature</span>
</button>
```

### 4. Add JavaScript in admin.js

```javascript
async function loadMyFeature() {
    const { data, error } = await ngSupabase.client
        .rpc('my_admin_function', { ... });
    // Handle data
}

// Add to showSection switch
case 'myfeature':
    loadMyFeature();
    break;
```

---

## Quick Reference

### Grant Admin
```sql
UPDATE profiles SET is_admin = TRUE WHERE email = 'user@example.com';
```

### Check Admin Status
```sql
SELECT email, is_admin FROM profiles WHERE is_admin = TRUE;
```

### View Audit Log
```sql
SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 20;
```

### Export All Users (SQL)
```sql
SELECT p.email, p.display_name, s.tier_id, s.status, c.balance as credits, p.created_at
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
LEFT JOIN credits c ON c.user_id = p.id
ORDER BY p.created_at DESC;
```

---

## Future Improvements

This section documents planned enhancements and known limitations.

### High-Impact UX Improvements

| Area | Current State | Improvement |
|------|---------------|-------------|
| **Charts** | Placeholder/random data | Connect to real `usage_monthly` table, add date range picker |
| **Stat Cards** | Static numbers | Add trend indicators (+12% vs last week), sparklines |
| **Tables** | Basic display | Add sorting by clicking headers, column visibility toggle |
| **User Actions** | One at a time | Bulk select + bulk actions (change tier, export, email) |
| **Confirmations** | Browser `confirm()` | Styled modal confirmations with context |
| **Loading States** | "Loading..." text | Skeleton loaders for better perceived performance |

### Missing Features (by priority)

#### Critical
1. **Real usage tracking** - The Usage section shows random placeholder data
2. **Table sorting** - No way to sort users by date, tier, credits
3. **Pagination info** - Missing "Showing 1-20 of 150" display
4. **Data refresh** - No manual refresh button, stale data risk

#### Important
5. **Bulk operations** - Select multiple users for batch tier changes
6. **User search improvements** - Search by name, filter by date range
7. **Copy to clipboard** - Quick copy email, user ID buttons
8. **Inline editing** - Edit tier/credits without opening modal
9. **Activity indicators** - Last login, active status
10. **Notes/Tags** - Add internal notes to user profiles

#### Nice to Have
11. **Announcements** - Send messages to users/groups
12. **Email integration** - Send email from user modal
13. **Export audit logs** - CSV export for compliance
14. **Drag-and-drop** - Gallery/FAQ reordering
15. **Preview mode** - CMS changes before publish
16. **Version history** - CMS rollback capability

### Technical Debt

| Issue | Location | Fix |
|-------|----------|-----|
| Inline `onclick` handlers | Throughout HTML/JS | Move to `addEventListener` |
| Hardcoded tier prices | `admin.js:434-435` | Use config/database |
| No error retry | API calls | Add retry button on failure |
| Browser `confirm()` | Delete actions | Custom modal component |
| No virtual scroll | Large tables | Implement for 100+ rows |

### Accessibility Gaps

- Missing `aria-label` on icon-only buttons
- No `role="status"` for toast notifications
- Table lacks `scope` attributes on headers
- No skip-to-content link
- Modal focus trap not implemented

### Mobile Experience

- Tables overflow horizontally (need card view alternative)
- Touch targets too small for order buttons (24px, should be 44px minimum)
- No swipe gestures for common actions
- Filter dropdowns hard to use on small screens

### Quick Wins (< 1 hour each)

1. Add "Showing X-Y of Z" to pagination
2. Add "Refresh" button to each section header
3. Add "Copy" button next to email addresses
4. Add `title` tooltips to truncated text
5. Add row count badge to nav items
6. Add loading spinner to action buttons while processing
7. Add "Clear filters" button when filters are active
8. Add keyboard shortcut hint (`Esc` to close) in modals
9. Animate stat card numbers counting up
10. Add "Last updated: X mins ago" timestamp

### Database Improvements Needed

```sql
-- Track user last login
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;

-- Track daily signups for growth chart
CREATE TABLE IF NOT EXISTS daily_stats (
    date DATE PRIMARY KEY,
    new_users INT DEFAULT 0,
    new_subscriptions INT DEFAULT 0,
    generations INT DEFAULT 0,
    revenue_cents INT DEFAULT 0
);

-- Track per-studio usage
ALTER TABLE usage_monthly ADD COLUMN studio_breakdown JSONB DEFAULT '{}';
```

### New Sections to Consider

| Section | Purpose |
|---------|---------|
| **Settings** | System config, feature flags, maintenance mode |
| **Reports** | Scheduled reports, custom report builder |
| **Notifications** | System announcements, email templates |
| **Health** | API status, error rates, external service status |
| **Security** | Admin sessions, IP logs, rate limit status |
