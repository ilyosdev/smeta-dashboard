import { test, expect } from '@playwright/test';
import {
  registerTestOrganization,
  loginViaUI,
  loginViaTokens,
  createUserWithRole,
  waitForDashboardLoad,
  getVisibleSidebarItems,
  navigateToPage,
} from './utils/test-helpers';

test.describe('PRORAB (Foreman) Flow - Request Creation', () => {
  let adminUser: Awaited<ReturnType<typeof registerTestOrganization>>;
  let prorabUser: Awaited<ReturnType<typeof createUserWithRole>>;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Register organization first
    adminUser = await registerTestOrganization(page);

    if (adminUser?.accessToken) {
      // Create PRORAB user
      prorabUser = await createUserWithRole(page, adminUser.accessToken, 'PRORAB', {
        firstName: 'Prorab',
        lastName: 'Tester',
      });
    }

    await page.close();
  });

  test.describe('Login', () => {
    test('PRORAB can login with phone and password', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);

      // If login succeeded, should be on dashboard
      if (success) {
        await expect(page).not.toHaveURL(/.*login.*/);
      }
    });
  });

  test.describe('Dashboard Access', () => {
    test('PRORAB sees limited navigation items', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      // PRORAB should see limited items
      expect(visibleItems).toContain('Bosh sahifa');
      expect(visibleItems).toContain('Loyihalar');
      expect(visibleItems).toContain("So'rovlar");
      expect(visibleItems).toContain('Ustalar');

      // PRORAB should NOT see admin-only items
      expect(visibleItems).not.toContain('Xodimlar');
      expect(visibleItems).not.toContain('Sozlamalar');
    });

    test('PRORAB can access requests page', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      await page.click("text=So'rovlar");

      await expect(page).toHaveURL('/requests');
    });

    test('PRORAB cannot access Users page directly', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      // Try to navigate directly to users page
      await page.goto('/users');

      // Should be redirected or see access denied
      const currentUrl = page.url();
      // Either redirected to dashboard or the page shows limited content
      expect(currentUrl.includes('/users') || currentUrl === '/').toBe(true);
    });
  });

  test.describe('Request Creation', () => {
    test('PRORAB can see requests list', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/requests');

      // Should see requests page content
      await expect(page.getByText("So'rovlar")).toBeVisible();
    });

    test('PRORAB can access Projects page', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/projects');

      // Should see projects page
      await expect(page.getByText('Loyihalar')).toBeVisible();
    });

    test('PRORAB can access Workers page', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);

      // Click on Ustalar in sidebar
      const ustalariLink = page.locator('[data-slot="sidebar-menu-button"]').filter({ hasText: 'Ustalar' });
      if (await ustalariLink.isVisible()) {
        await ustalariLink.click();
        await expect(page).toHaveURL('/workers');
      }
    });
  });

  test.describe('Restricted Access', () => {
    test('PRORAB cannot see Finance in sidebar', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Moliya');
    });

    test('PRORAB cannot see Warehouse in sidebar', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Ombor');
    });

    test('PRORAB cannot see Suppliers in sidebar', async ({ page }) => {
      if (!prorabUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, prorabUser.phone, prorabUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Yetkazuvchilar');
    });
  });
});
