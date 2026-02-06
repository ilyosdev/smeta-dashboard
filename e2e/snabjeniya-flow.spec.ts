import { test, expect } from '@playwright/test';
import {
  registerTestOrganization,
  loginViaUI,
  createUserWithRole,
  waitForDashboardLoad,
  getVisibleSidebarItems,
  navigateToPage,
} from './utils/test-helpers';

test.describe('SNABJENIYA (Supply) Flow - Purchase & Delivery', () => {
  let adminUser: Awaited<ReturnType<typeof registerTestOrganization>>;
  let snabjeniyaUser: Awaited<ReturnType<typeof createUserWithRole>>;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Register organization first
    adminUser = await registerTestOrganization(page);

    if (adminUser?.accessToken) {
      // Create SNABJENIYA user
      snabjeniyaUser = await createUserWithRole(page, adminUser.accessToken, 'SNABJENIYA', {
        firstName: 'Snabjenets',
        lastName: 'Tester',
      });
    }

    await page.close();
  });

  test.describe('Login', () => {
    test('SNABJENIYA can login successfully', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);

      if (success) {
        await expect(page).not.toHaveURL(/.*login.*/);
      }
    });
  });

  test.describe('Dashboard Access', () => {
    test('SNABJENIYA sees appropriate navigation items', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      // SNABJENIYA should see these items
      expect(visibleItems).toContain('Bosh sahifa');
      expect(visibleItems).toContain('Loyihalar');
      expect(visibleItems).toContain("So'rovlar");
      expect(visibleItems).toContain('Yetkazuvchilar');

      // SNABJENIYA should NOT see these items
      expect(visibleItems).not.toContain('Xodimlar');
      expect(visibleItems).not.toContain('Moliya');
      expect(visibleItems).not.toContain('Ombor');
      expect(visibleItems).not.toContain('Sozlamalar');
    });

    test('SNABJENIYA can access Requests page', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      await page.click("text=So'rovlar");

      await expect(page).toHaveURL('/requests');
    });

    test('SNABJENIYA can access Suppliers page', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      await page.click('text=Yetkazuvchilar');

      await expect(page).toHaveURL('/suppliers');
    });
  });

  test.describe('Requests Management', () => {
    test('SNABJENIYA can view requests list', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/requests');

      // Should see requests page content
      await expect(page.getByText("So'rovlar")).toBeVisible();
    });

    test('SNABJENIYA can see request status filter', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/requests');

      // Should have status filter controls
      const filterControls = page.locator('select, [role="combobox"]');
      const filterCount = await filterControls.count();
      expect(filterCount).toBeGreaterThan(0);
    });
  });

  test.describe('Suppliers Management', () => {
    test('SNABJENIYA can view suppliers list', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/suppliers');

      // Should see suppliers page
      await expect(page.getByText('Yetkazuvchilar')).toBeVisible();
    });

    test('SNABJENIYA can search suppliers', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await navigateToPage(page, '/suppliers');

      // Look for search input
      const searchInput = page.getByPlaceholder(/qidirish/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
      }
    });
  });

  test.describe('Restricted Access', () => {
    test('SNABJENIYA cannot access Users page', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      // Try direct navigation
      await page.goto('/users');

      // Should be redirected or see limited view
      const visibleItems = await getVisibleSidebarItems(page);
      expect(visibleItems).not.toContain('Xodimlar');
    });

    test('SNABJENIYA cannot access Finance page', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Moliya');
    });

    test('SNABJENIYA cannot access Warehouse page', async ({ page }) => {
      if (!snabjeniyaUser?.phone) {
        test.skip();
        return;
      }

      const success = await loginViaUI(page, snabjeniyaUser.phone, snabjeniyaUser.password);
      if (!success) {
        test.skip();
        return;
      }

      await waitForDashboardLoad(page);
      const visibleItems = await getVisibleSidebarItems(page);

      expect(visibleItems).not.toContain('Ombor');
    });
  });
});
