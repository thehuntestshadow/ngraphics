// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication Modal', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        // Open auth modal
        const signInBtn = page.locator('#accountLoginBtn, .account-login-btn');
        await signInBtn.click();
        await expect(page.locator('.auth-modal')).toBeVisible();
    });

    test('should display login form by default', async ({ page }) => {
        // Modal title should say "Welcome Back"
        await expect(page.locator('.auth-modal-title')).toContainText('Welcome Back');

        // Email and password fields should be visible
        await expect(page.locator('#authEmail')).toBeVisible();
        await expect(page.locator('#authPassword')).toBeVisible();

        // Should NOT have confirm password field (login mode)
        await expect(page.locator('#authConfirmPassword')).not.toBeVisible();

        // Submit button should say "Sign In"
        await expect(page.locator('.auth-submit-text')).toContainText('Sign In');
    });

    test('should switch to signup mode', async ({ page }) => {
        // Click "Sign Up" link
        await page.locator('.auth-switch-btn').click();

        // Modal title should change
        await expect(page.locator('.auth-modal-title')).toContainText('Create Account');

        // Confirm password field should appear
        await expect(page.locator('#authConfirmPassword')).toBeVisible();

        // Submit button should say "Create Account"
        await expect(page.locator('.auth-submit-text')).toContainText('Create Account');
    });

    test('should switch back to login mode', async ({ page }) => {
        // Switch to signup
        await page.locator('.auth-switch-btn').click();
        await expect(page.locator('.auth-modal-title')).toContainText('Create Account');

        // Switch back to login
        await page.locator('.auth-switch-btn').click();
        await expect(page.locator('.auth-modal-title')).toContainText('Welcome Back');
    });

    test('should close modal on close button click', async ({ page }) => {
        // Click close button
        await page.locator('.auth-modal-close').click();

        // Modal should be hidden
        await expect(page.locator('.auth-modal')).not.toBeVisible();
    });

    test('should close modal on backdrop click', async ({ page }) => {
        // Click at coordinates outside the modal content (backdrop area)
        const modal = page.locator('.auth-modal-content');
        const box = await modal.boundingBox();
        if (box) {
            // Click to the left of the modal content (on backdrop)
            await page.mouse.click(box.x - 50, box.y + box.height / 2);
        }

        // Wait for animation
        await page.waitForTimeout(400);

        // Modal should be hidden
        await expect(page.locator('.auth-modal.visible')).not.toBeVisible();
    });

    test('should close modal on Escape key', async ({ page }) => {
        // Press Escape
        await page.keyboard.press('Escape');

        // Modal should be hidden
        await expect(page.locator('.auth-modal')).not.toBeVisible();
    });

    test('should have OAuth provider buttons', async ({ page }) => {
        // Google button
        const googleBtn = page.locator('[data-provider="google"]');
        await expect(googleBtn).toBeVisible();
        await expect(googleBtn).toContainText('Google');

        // GitHub button
        const githubBtn = page.locator('[data-provider="github"]');
        await expect(githubBtn).toBeVisible();
        await expect(githubBtn).toContainText('GitHub');
    });

    test('should have forgot password link in login mode', async ({ page }) => {
        await expect(page.locator('#forgotPasswordBtn')).toBeVisible();
    });

    test('should not have forgot password link in signup mode', async ({ page }) => {
        // Switch to signup
        await page.locator('.auth-switch-btn').click();

        // Forgot password should not be visible
        await expect(page.locator('#forgotPasswordBtn')).not.toBeVisible();
    });
});

test.describe('Authentication Form Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        // Open auth modal
        await page.locator('#accountLoginBtn, .account-login-btn').click();
        await expect(page.locator('.auth-modal')).toBeVisible();
    });

    test('should require email field', async ({ page }) => {
        // Fill only password
        await page.fill('#authPassword', 'testpassword123');

        // Submit form
        await page.locator('.auth-submit-btn').click();

        // Email field should show validation error (native HTML5)
        const emailInput = page.locator('#authEmail');
        await expect(emailInput).toHaveAttribute('required');
    });

    test('should require password field', async ({ page }) => {
        // Fill only email
        await page.fill('#authEmail', 'test@example.com');

        // Submit form
        await page.locator('.auth-submit-btn').click();

        // Password field should show validation error
        const passwordInput = page.locator('#authPassword');
        await expect(passwordInput).toHaveAttribute('required');
    });

    test('should validate email format', async ({ page }) => {
        // Fill invalid email
        await page.fill('#authEmail', 'notanemail');
        await page.fill('#authPassword', 'testpassword123');

        // Submit form - should not proceed due to email validation
        await page.locator('.auth-submit-btn').click();

        // Should still be on the form
        await expect(page.locator('.auth-modal')).toBeVisible();
    });

    test('should validate password length in signup mode', async ({ page }) => {
        // Switch to signup
        await page.locator('.auth-switch-btn').click();

        // Fill short password
        await page.fill('#authEmail', 'test@example.com');
        await page.fill('#authPassword', 'short');
        await page.fill('#authConfirmPassword', 'short');

        // Password should have minlength attribute
        const passwordInput = page.locator('#authPassword');
        await expect(passwordInput).toHaveAttribute('minlength', '8');
    });

    test('should validate password confirmation matches', async ({ page }) => {
        // Switch to signup
        await page.locator('.auth-switch-btn').click();

        // Fill mismatched passwords
        await page.fill('#authEmail', 'test@example.com');
        await page.fill('#authPassword', 'password123');
        await page.fill('#authConfirmPassword', 'different123');

        // Submit form
        await page.locator('.auth-submit-btn').click();

        // Error message should appear
        await expect(page.locator('#authError')).toContainText('Passwords do not match');
    });
});

test.describe('Auth Gate - Studio Pages', () => {
    test('should show auth overlay on protected pages', async ({ page }) => {
        // Navigate to a studio page (requires auth)
        await page.goto('/lifestyle.html');

        // Wait for auth gate to initialize
        await page.waitForTimeout(1000);

        // Auth overlay should be visible
        const authOverlay = page.locator('#authOverlay, .auth-overlay');
        await expect(authOverlay).toBeVisible();
    });

    test('should have sign in and create account buttons on auth overlay', async ({ page }) => {
        await page.goto('/lifestyle.html');
        await page.waitForTimeout(1000);

        // Sign In button
        await expect(page.locator('#authOverlayLogin')).toBeVisible();
        await expect(page.locator('#authOverlayLogin')).toContainText('Sign In');

        // Create Account button
        await expect(page.locator('#authOverlaySignup')).toBeVisible();
        await expect(page.locator('#authOverlaySignup')).toContainText('Create Account');
    });

    test('should open auth modal from overlay sign in button', async ({ page }) => {
        await page.goto('/lifestyle.html');
        await page.waitForTimeout(1000);

        // Click Sign In on overlay
        await page.locator('#authOverlayLogin').click();

        // Auth modal should open
        await expect(page.locator('.auth-modal')).toBeVisible();
        await expect(page.locator('.auth-modal-title')).toContainText('Welcome Back');
    });

    test('should open signup modal from overlay create account button', async ({ page }) => {
        await page.goto('/lifestyle.html');
        await page.waitForTimeout(1000);

        // Click Create Account on overlay
        await page.locator('#authOverlaySignup').click();

        // Auth modal should open in signup mode
        await expect(page.locator('.auth-modal')).toBeVisible();
        await expect(page.locator('.auth-modal-title')).toContainText('Create Account');
    });
});

test.describe('Auth Exempt Pages', () => {
    const exemptPages = [
        { path: '/', name: 'Landing' },
        { path: '/gallery.html', name: 'Gallery' },
        { path: '/faq.html', name: 'FAQ' },
        { path: '/pricing.html', name: 'Pricing' },
        { path: '/settings.html', name: 'Settings' }
    ];

    for (const { path, name } of exemptPages) {
        test(`${name} page should not show auth overlay`, async ({ page }) => {
            await page.goto(path);
            await page.waitForTimeout(1000);

            // Auth overlay should NOT be visible
            const authOverlay = page.locator('#authOverlay.visible, .auth-overlay.visible');
            await expect(authOverlay).not.toBeVisible();
        });
    }
});
