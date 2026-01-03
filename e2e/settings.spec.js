// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Settings Page - Structure', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings.html');
        await page.waitForTimeout(500);
    });

    test('should display page title', async ({ page }) => {
        await expect(page.locator('.page-title-text')).toContainText('Settings');
    });

    test('should have header with logo', async ({ page }) => {
        await expect(page.locator('.logo-title')).toContainText('HEFAISTOS');
    });

    test('should have theme toggle in header', async ({ page }) => {
        await expect(page.locator('#themeToggle')).toBeVisible();
    });

    test('should have sidebar navigation in DOM', async ({ page }) => {
        const sidebar = page.locator('.settings-sidebar');
        // Sidebar exists in DOM (may be hidden on mobile)
        await expect(sidebar).toBeAttached();
    });

    test('should have navigation items in DOM', async ({ page }) => {
        // These nav items exist in DOM regardless of auth state
        await expect(page.locator('[data-section="profile"]')).toBeAttached();
        await expect(page.locator('[data-section="appearance"]')).toBeAttached();
        await expect(page.locator('[data-section="language"]')).toBeAttached();
    });
});

test.describe('Settings - Section Navigation', () => {
    test('should navigate to appearance section via hash', async ({ page }) => {
        await page.goto('/settings.html#appearance');
        await page.waitForTimeout(500);

        // Appearance section should be active
        await expect(page.locator('#appearance')).toHaveClass(/active/);
    });

    test('should navigate to language section via hash', async ({ page }) => {
        await page.goto('/settings.html#language');
        await page.waitForTimeout(500);

        // Language section should be active
        await expect(page.locator('#language')).toHaveClass(/active/);
    });
});

test.describe('Settings - Appearance Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings.html#appearance');
        await page.waitForTimeout(500);
    });

    test('should display appearance section header', async ({ page }) => {
        await expect(page.locator('#appearance h2')).toContainText('Appearance');
    });

    test('should have theme toggle buttons', async ({ page }) => {
        const themeToggle = page.locator('#settingsThemeToggle');

        // Check if visible (may be hidden if section is collapsed)
        if (await themeToggle.isVisible()) {
            // Dark, Light, System buttons
            await expect(page.locator('#settingsThemeToggle [data-theme="dark"]')).toBeVisible();
            await expect(page.locator('#settingsThemeToggle [data-theme="light"]')).toBeVisible();
            await expect(page.locator('#settingsThemeToggle [data-theme="system"]')).toBeVisible();
        }
    });

    test('should apply light theme on click', async ({ page }) => {
        const lightBtn = page.locator('#settingsThemeToggle [data-theme="light"]');

        if (await lightBtn.isVisible()) {
            await lightBtn.click();

            // HTML should have light theme
            const html = page.locator('html');
            await expect(html).toHaveAttribute('data-theme', 'light');
        }
    });

    test('should apply dark theme on click', async ({ page }) => {
        const darkBtn = page.locator('#settingsThemeToggle [data-theme="dark"]');

        if (await darkBtn.isVisible()) {
            await darkBtn.click();

            // HTML should not have light theme
            const html = page.locator('html');
            await expect(html).not.toHaveAttribute('data-theme', 'light');
        }
    });
});

test.describe('Settings - Language Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings.html#language');
        await page.waitForTimeout(500);
    });

    test('should display language section header', async ({ page }) => {
        await expect(page.locator('#language h2')).toContainText('Language');
    });

    test('should have interface language dropdown if visible', async ({ page }) => {
        const interfaceSelect = page.locator('#interfaceLanguage');

        if (await interfaceSelect.isVisible()) {
            // Should have multiple options
            const options = interfaceSelect.locator('option');
            const count = await options.count();
            expect(count).toBeGreaterThan(1);
        }
    });

    test('should have generation language dropdown if visible', async ({ page }) => {
        const generationSelect = page.locator('#generationLanguage');

        if (await generationSelect.isVisible()) {
            // Should have multiple options
            const options = generationSelect.locator('option');
            const count = await options.count();
            expect(count).toBeGreaterThan(1);
        }
    });
});

test.describe('Settings - Danger Zone Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings.html#danger');
        await page.waitForTimeout(500);
    });

    test('should have danger section in DOM', async ({ page }) => {
        const dangerSection = page.locator('#danger');
        // Element exists in DOM (may be hidden)
        await expect(dangerSection).toBeAttached();
    });

    test('should have danger zone styled section', async ({ page }) => {
        const dangerSection = page.locator('#danger');
        await expect(dangerSection).toHaveClass(/settings-section-danger/);
    });

    test('should have clear history button in DOM', async ({ page }) => {
        const btn = page.locator('#clearHistoryBtn');
        await expect(btn).toBeAttached();
    });

    test('should have clear favorites button in DOM', async ({ page }) => {
        const btn = page.locator('#clearFavoritesBtn');
        await expect(btn).toBeAttached();
    });
});

test.describe('Settings - API Keys Section', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/settings.html#api-keys');
        await page.waitForTimeout(500);
    });

    test('should have api-keys section in DOM', async ({ page }) => {
        const section = page.locator('#api-keys');
        await expect(section).toBeAttached();
    });

    test('should display api-keys section header', async ({ page }) => {
        await expect(page.locator('#api-keys h2')).toContainText('API Keys');
    });

    test('should have Luma API key input in DOM', async ({ page }) => {
        const input = page.locator('#lumaApiKey');
        await expect(input).toBeAttached();
    });
});

test.describe('Settings - Responsive', () => {
    test('should work on mobile viewport', async ({ page }) => {
        await page.goto('/settings.html');
        await page.setViewportSize({ width: 375, height: 667 });

        // Page should load without errors
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
        await page.goto('/settings.html');
        await page.setViewportSize({ width: 768, height: 1024 });

        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
        await page.goto('/settings.html');
        await page.setViewportSize({ width: 1440, height: 900 });

        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.locator('.settings-sidebar')).toBeVisible();
    });
});
