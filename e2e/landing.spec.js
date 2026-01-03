// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display hero section with correct content', async ({ page }) => {
        // Check hero badge
        await expect(page.locator('.hero-badge span')).toContainText('AI-Powered');

        // Check hero title
        await expect(page.locator('.hero-title')).toBeVisible();

        // Check hero subtitle
        await expect(page.locator('.hero-subtitle')).toBeVisible();

        // Check CTA buttons exist (use first() for multiple matches)
        await expect(page.locator('.hero-cta').first()).toBeVisible();
        await expect(page.locator('.hero-cta-secondary').first()).toBeVisible();
    });

    test('should have working navigation header', async ({ page }) => {
        // Logo should be visible
        await expect(page.locator('.logo-title')).toContainText('HEFAISTOS');

        // Theme toggle should be visible
        await expect(page.locator('#themeToggle')).toBeVisible();

        // Account container should exist
        await expect(page.locator('#accountContainer')).toBeVisible();
    });

    test('should toggle theme correctly', async ({ page }) => {
        const themeToggle = page.locator('#themeToggle');

        // Initial theme should be dark (default)
        const htmlElement = page.locator('html');
        const initialTheme = await htmlElement.getAttribute('data-theme');

        // Click toggle
        await themeToggle.click();

        // Theme should change
        await page.waitForTimeout(100);
        const newTheme = await htmlElement.getAttribute('data-theme');

        // Should have toggled
        if (initialTheme === 'light') {
            expect(newTheme).not.toBe('light');
        } else {
            expect(newTheme).toBe('light');
        }
    });

    test('should display studios section', async ({ page }) => {
        // Scroll to studios section
        const studiosSection = page.locator('.studios-section');
        await studiosSection.scrollIntoViewIfNeeded();

        // Studios section should be visible
        await expect(studiosSection).toBeVisible();

        // Should have studio cards
        const studioCards = page.locator('.studio-card');
        const count = await studioCards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should navigate to studio pages from cards', async ({ page }) => {
        // Scroll to studios section first
        await page.locator('.studios-section').scrollIntoViewIfNeeded();

        // Find first studio card link (studio-card IS the link)
        const studioLink = page.locator('a.studio-card').first();

        // Get href
        const href = await studioLink.getAttribute('href');
        expect(href).toBeTruthy();

        // Click and verify navigation
        await studioLink.click();
        await page.waitForURL(new RegExp(href.replace('.html', '')));
    });

    test('should have footer with correct content', async ({ page }) => {
        // Scroll to bottom of page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        // Footer should exist and contain HEFAISTOS
        const footer = page.locator('.site-footer, footer');
        await expect(footer.first()).toContainText('HEFAISTOS');
    });

    test('should be responsive', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Hero should still be visible
        await expect(page.locator('.hero-title')).toBeVisible();

        // Header should still be visible
        await expect(page.locator('.site-header')).toBeVisible();
    });
});

test.describe('Landing Page - Sign In Button', () => {
    test('should show sign in button when not authenticated', async ({ page }) => {
        await page.goto('/');

        // Wait for auth UI to initialize
        await page.waitForTimeout(500);

        // Should show sign in button (not authenticated by default)
        const signInBtn = page.locator('#accountLoginBtn, .account-login-btn');
        await expect(signInBtn).toBeVisible();
    });

    test('should open auth modal on sign in click', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        // Click sign in
        const signInBtn = page.locator('#accountLoginBtn, .account-login-btn');
        await signInBtn.click();

        // Auth modal should appear
        await expect(page.locator('.auth-modal')).toBeVisible();
        await expect(page.locator('.auth-modal-content')).toBeVisible();
    });
});
