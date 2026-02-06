import { Page, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:4001';
const TEST_PASSWORD = 'TestPassword123!';

export interface TestUser {
  phone: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  orgId?: string;
  userId?: string;
}

/**
 * Generate a unique phone number for testing
 */
export function generateTestPhone(): string {
  const timestamp = Date.now();
  const randomDigits = timestamp.toString().slice(-7);
  return `+99890${randomDigits}`;
}

/**
 * Register a new organization and admin user via API
 */
export async function registerTestOrganization(
  page: Page,
  overrides?: Partial<{
    orgName: string;
    name: string;
    phone: string;
    email: string;
    password: string;
  }>
): Promise<TestUser | null> {
  const timestamp = Date.now();
  const phone = overrides?.phone || generateTestPhone();

  try {
    const response = await page.request.post(`${API_URL}/vendor/auth/register`, {
      data: {
        orgName: overrides?.orgName || `Test Org ${timestamp}`,
        name: overrides?.name || 'Test Admin',
        phone: phone,
        email: overrides?.email || `test_${timestamp}@test.com`,
        password: overrides?.password || TEST_PASSWORD,
      },
    });

    if (!response.ok()) {
      console.error('Failed to register:', await response.text());
      return null;
    }

    const data = await response.json();
    return {
      phone,
      password: overrides?.password || TEST_PASSWORD,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      orgId: data.user?.orgId,
      userId: data.user?.id,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

/**
 * Login with phone and password via the UI
 */
export async function loginViaUI(
  page: Page,
  phone: string,
  password: string
): Promise<boolean> {
  await page.goto('/login');

  // Remove +998 prefix if present for input
  const phoneDigits = phone.replace('+998', '');

  await page.getByLabel('Telefon raqam').fill(phoneDigits);
  await page.getByPlaceholder('Parolingizni kiriting').fill(password);
  await page.getByRole('button', { name: 'Kirish', exact: true }).click();

  // Wait for navigation or error
  try {
    await Promise.race([
      page.waitForURL('/', { timeout: 10000 }),
      page.waitForSelector('.bg-destructive\\/10', { timeout: 10000 }),
    ]);

    // Check if we're on the dashboard
    return page.url().endsWith('/') || !page.url().includes('login');
  } catch {
    return false;
  }
}

/**
 * Login by setting tokens directly in localStorage (faster)
 */
export async function loginViaTokens(
  page: Page,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await page.goto('/login');

  await page.evaluate(
    ({ access, refresh }) => {
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    },
    { access: accessToken, refresh: refreshToken }
  );

  await page.goto('/');
}

/**
 * Create a user with specific role via API
 */
export async function createUserWithRole(
  page: Page,
  accessToken: string,
  role: string,
  overrides?: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  }>
): Promise<TestUser | null> {
  const timestamp = Date.now();
  const phone = overrides?.phone || generateTestPhone();

  try {
    const response = await page.request.post(`${API_URL}/vendor/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        firstName: overrides?.firstName || `Test ${role}`,
        lastName: overrides?.lastName || 'User',
        phone: phone,
        password: overrides?.password || TEST_PASSWORD,
        role: role,
      },
    });

    if (!response.ok()) {
      console.error('Failed to create user:', await response.text());
      return null;
    }

    return {
      phone,
      password: overrides?.password || TEST_PASSWORD,
    };
  } catch (error) {
    console.error('Create user error:', error);
    return null;
  }
}

/**
 * Logout by clearing tokens
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  });

  await page.goto('/login');
}

/**
 * Wait for dashboard to fully load
 */
export async function waitForDashboardLoad(page: Page): Promise<void> {
  await expect(page.locator('[data-slot="sidebar"]').first()).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to a dashboard page and verify it loaded
 */
export async function navigateToPage(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Check if current user can see a sidebar item
 */
export async function canSeeSidebarItem(page: Page, itemText: string): Promise<boolean> {
  const sidebarItem = page.locator(`[data-slot="sidebar"] a, [data-slot="sidebar"] button`)
    .filter({ hasText: itemText });
  return await sidebarItem.isVisible().catch(() => false);
}

/**
 * Get all visible sidebar navigation items
 */
export async function getVisibleSidebarItems(page: Page): Promise<string[]> {
  const items = page.locator('[data-slot="sidebar-menu-button"] span');
  const count = await items.count();
  const texts: string[] = [];

  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    if (text) texts.push(text.trim());
  }

  return texts;
}
