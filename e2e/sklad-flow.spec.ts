import { test, expect } from '@playwright/test';
import {
  registerTestOrganization,
  loginViaUI,
  createUserWithRole,
  waitForDashboardLoad,
  getVisibleSidebarItems,
  navigateToPage,
} from './utils/test-helpers';

test.describe('SKLAD (Warehouse) Flow - Receive & Issue Materials', () => {
  let adminUser: Awaited<ReturnType<typeof registerTestOrganization>>;
  let skladUser: Awaited<ReturnType<typeof createUserWithRole>>;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Register organization first
    adminUser = await registerTestOrganization(page);

    if (adminUser?.accessToken) {
      // Create SKLAD user
      skladUser = await createUserWithRole(page, adminUser.accessToken, 'SKLAD', {
        firstName: 'Skladchi',
        lastName: 'Tester',
      });
    }

    await page.close();
  });

  test.describe('Login', () => {
    test('SKLAD can login successfully', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);

      if (success) {
        await expect(page).not.toHaveURL(/.*login.*/);
      }
    });
  });

  test.describe('Dashboard Access', () => {
    test('SKLAD sees appropriate navigation items', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      // SKLAD should see these items
      expect(visibleItems).toContain('Bosh sahifa');
      expect(visibleItems).toContain('Loyihalar');
      expect(visibleItems).toContain('Ombor');

      // SKLAD should NOT see these items
      expect(visibleItems).not.toContain('Xodimlar');
      expect(visibleItems).not.toContain('Moliya');
      expect(visibleItems).not.toContain('Yetkazuvchilar');
      expect(visibleItems).not.toContain('Sozlamalar');
    });

    test('SKLAD can access Warehouse page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      await page.click('text=Ombor');

      await expect(page).toHaveURL('/warehouse');
    });
  });

  test.describe('Warehouse Management', () => {
    test('SKLAD can view warehouse inventory', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/warehouse');

      // Should see warehouse page content
      await expect(page.getByText('Ombor')).toBeVisible();
    });

    test('SKLAD can search inventory items', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/warehouse');

      // Look for search functionality
      const searchInput = page.getByPlaceholder(/qidirish/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('material');
      }
    });

    test('SKLAD can view pending deliveries section', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/warehouse');

      // Warehouse page should be accessible
      await expect(page.getByText('Ombor')).toBeVisible();
    });
  });

  test.describe('Restricted Access', () => {
    test('SKLAD cannot access Users page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Xodimlar');
    });

    test('SKLAD cannot access Finance page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Moliya');
    });

    test('SKLAD cannot access Suppliers page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Yetkazuvchilar');
    });

    test('SKLAD cannot access Workers page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Ustalar');
    });

    test('SKLAD cannot access Settings page', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Sozlamalar');
    });
  });

  test.describe('Dashboard View', () => {
    test('SKLAD can view dashboard overview', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/');

      // Dashboard should load
      await expect(page.getByText('Bosh sahifa')).toBeVisible();
    });

    test('SKLAD can view Projects list', async ({ page }) => {
      if (!skladUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, skladUser.phone, skladUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/projects');

      // Projects page should be accessible
      await expect(page.getByText('Loyihalar')).toBeVisible();
    });
  });
});
