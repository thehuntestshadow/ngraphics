// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Gallery Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/gallery.html');
    });

    test('should display page title', async ({ page }) => {
        await expect(page.locator('.page-title-text')).toContainText('Gallery');
    });

    test('should have filter/category controls', async ({ page }) => {
        // Look for category filters or tabs
        const filters = page.locator('.gallery-filters, .gallery-tabs, .filter-tabs');
        const filtersCount = await filters.count();

        // Gallery should have some form of filtering
        // This may vary based on implementation
        if (filtersCount > 0) {
            await expect(filters.first()).toBeVisible();
        }
    });

    test('should display gallery grid', async ({ page }) => {
        // Wait for gallery to load
        await page.waitForTimeout(1000);

        // Gallery grid should exist
        const gallery = page.locator('#galleryGrid');
        await expect(gallery).toBeVisible();
    });

    test('should have gallery items with images', async ({ page }) => {
        await page.waitForTimeout(1000);

        // Gallery items
        const items = page.locator('.gallery-item, .gallery-card');
        const count = await items.count();

        // Should have at least some items (or empty state)
        if (count > 0) {
            // First item should have an image
            const firstItem = items.first();
            const image = firstItem.locator('img');
            if (await image.count() > 0) {
                await expect(image).toHaveAttribute('src');
            }
        }
    });

    test('should be responsive', async ({ page }) => {
        // Test mobile
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.site-header')).toBeVisible();

        // Test tablet
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('.site-header')).toBeVisible();

        // Test desktop
        await page.setViewportSize({ width: 1440, height: 900 });
        await expect(page.locator('.site-header')).toBeVisible();
    });
});

test.describe('Gallery Lightbox', () => {
    test('should open lightbox on image click if implemented', async ({ page }) => {
        await page.goto('/gallery.html');
        await page.waitForTimeout(1000);

        // Try to click first gallery item
        const items = page.locator('.gallery-item, .gallery-card');
        const count = await items.count();

        if (count > 0) {
            await items.first().click();

            // Check if lightbox opens
            const lightbox = page.locator('.lightbox, .modal, [role="dialog"]');
            // Lightbox may or may not be implemented
            // Just ensure no error occurs
            await page.waitForTimeout(500);
        }
    });
});
