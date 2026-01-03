// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test('should navigate from landing to gallery', async ({ page }) => {
        await page.goto('/');
        // Gallery link may be in header or footer
        const galleryLink = page.locator('a[href="gallery.html"]').first();
        await galleryLink.click();
        await expect(page).toHaveURL(/gallery/);
    });

    test('should navigate from landing to pricing', async ({ page }) => {
        await page.goto('/');
        await page.click('a[href="pricing.html"]');
        await expect(page).toHaveURL(/pricing/);
    });

    test('should navigate from landing to FAQ', async ({ page }) => {
        await page.goto('/');
        await page.click('a[href="faq.html"]');
        await expect(page).toHaveURL(/faq/);
    });

    test('should navigate back to home from gallery', async ({ page }) => {
        await page.goto('/gallery.html');
        await page.click('a.logo-link, .logo-title');
        await expect(page).toHaveURL(/index|\/$/);
    });

    test('should navigate to dashboard from header when visible', async ({ page }) => {
        await page.goto('/settings.html');

        // Dashboard link should be visible
        const dashboardLink = page.locator('.dashboard-link');
        if (await dashboardLink.isVisible()) {
            await dashboardLink.click();
            await expect(page).toHaveURL(/dashboard/);
        }
    });
});

test.describe('Studio Links', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Scroll to studios section
        await page.locator('.studios-section').scrollIntoViewIfNeeded();
    });

    const studios = [
        { name: 'Infographics', href: 'infographics.html' },
        { name: 'Models', href: 'models.html' },
        { name: 'Lifestyle', href: 'lifestyle.html' },
        { name: 'Bundle', href: 'bundle.html' },
        { name: 'Copywriter', href: 'copywriter.html' },
        { name: 'Background', href: 'background.html' },
        { name: 'Comparison', href: 'comparison.html' },
        { name: 'Packaging', href: 'packaging.html' }
    ];

    for (const studio of studios) {
        test(`should have link to ${studio.name} studio`, async ({ page }) => {
            const link = page.locator(`a.studio-card[href="${studio.href}"]`);
            await expect(link).toBeVisible();
        });
    }
});

test.describe('Page Titles', () => {
    const pages = [
        { path: '/', expectedTitle: /HEFAISTOS/i },
        { path: '/gallery.html', expectedTitle: /Gallery/i },
        { path: '/pricing.html', expectedTitle: /Pricing/i },
        { path: '/faq.html', expectedTitle: /FAQ/i },
        { path: '/settings.html', expectedTitle: /Settings/i }
    ];

    for (const { path, expectedTitle } of pages) {
        test(`should have correct title for ${path}`, async ({ page }) => {
            await page.goto(path);
            await expect(page).toHaveTitle(expectedTitle);
        });
    }
});

test.describe('Header Consistency', () => {
    const publicPages = ['/gallery.html', '/pricing.html', '/faq.html', '/settings.html'];

    for (const path of publicPages) {
        test(`${path} should have consistent header elements`, async ({ page }) => {
            await page.goto(path);

            // Logo
            await expect(page.locator('.logo-title')).toContainText('HEFAISTOS');

            // Theme toggle
            await expect(page.locator('#themeToggle')).toBeVisible();

            // Account container
            await expect(page.locator('#accountContainer')).toBeVisible();
        });
    }
});
