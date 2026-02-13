/**
 * E2E tests for the Thai Address Autocomplete widget.
 *
 * Runs against the vanilla HTML fixture on a real Chromium browser via Playwright.
 *
 * Tests cover:
 * - Starting autocomplete from any field (ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์)
 * - Cross-field auto-fill on selection
 * - Dropdown visibility, keyboard navigation, mouse selection
 * - ARIA accessibility attributes
 * - Edge cases (clear, outside click, Escape, multiple inputs)
 */

import { test, expect } from '@playwright/test';

const PAGE_URL = '/index.html';

// ─── Helper: get the .tac-root wrapping a given input ─────────────────────
import type { Locator } from '@playwright/test';

function rootOf(inputLocator: Locator) {
  return inputLocator.locator('xpath=ancestor::div[contains(@class,"tac-root")]');
}

test.describe('Thai Address Autocomplete — E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 1. Starting from ตำบล (Sub-district)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Starting from ตำบล (Sub-district)', () => {
    test('should show suggestions when typing a sub-district name', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await input.fill('คลองต้นไทร');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const options = dropdown.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
    });

    test('should fill all fields when selecting from sub-district', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await input.fill('คลองต้นไทร');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Select the first suggestion via keyboard
      await input.press('ArrowDown');
      await input.press('Enter');

      // All 4 fields should be populated
      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');

      // Result panel should show
      await expect(page.locator('#result')).toBeVisible();
    });

    test('should fill all fields on mouse click from sub-district', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await input.fill('บางรัก');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await dropdown.locator('[role="option"]').first().click();

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 2. Starting from อำเภอ (District)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Starting from อำเภอ (District)', () => {
    test('should show suggestions when typing a district name', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('คลองสาน');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const options = dropdown.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
    });

    test('should fill all fields when selecting from district', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('คลองสาน');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');

      await expect(page.locator('#result')).toBeVisible();
    });

    test('should fill all fields on mouse click from district', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('บางรัก');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await dropdown.locator('[role="option"]').first().click();

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 3. Starting from จังหวัด (Province)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Starting from จังหวัด (Province)', () => {
    test('should show suggestions when typing a province name', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const options = dropdown.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
    });

    test('should fill all fields when selecting from province', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');

      await expect(page.locator('#result')).toBeVisible();
    });

    test('should fill all fields on mouse click from province', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('เชียงใหม่');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await dropdown.locator('[role="option"]').first().click();

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 4. Starting from รหัสไปรษณีย์ (Postal Code)
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Starting from รหัสไปรษณีย์ (Postal Code)', () => {
    test('should show suggestions when typing a postal code', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('10600');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const options = dropdown.locator('[role="option"]');
      expect(await options.count()).toBeGreaterThan(0);
    });

    test('should fill all fields when selecting from postal code', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('10600');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');

      await expect(page.locator('#result')).toBeVisible();
    });

    test('should fill all fields on mouse click from postal code', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('50200');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await dropdown.locator('[role="option"]').first().click();

      await expect(page.locator('#subdistrict-input')).not.toHaveValue('');
      await expect(page.locator('#district-input')).not.toHaveValue('');
      await expect(page.locator('#province-input')).not.toHaveValue('');
      await expect(page.locator('#postal-input')).not.toHaveValue('');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 5. Cross-field consistency — values should match the same address
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Cross-field consistency', () => {
    test('selecting from sub-district fills matching province and postal code', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await input.fill('คลองต้นไทร');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      // Parse the result JSON to verify consistency
      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });

    test('selecting from district fills matching sub-district and postal code', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('คลองสาน');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });

    test('selecting from province fills matching sub-district and district', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });

    test('selecting from postal code fills matching sub-district and district', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('10600');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 6. Switching entry point — start from one field, then another
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Switching entry point between fields', () => {
    test('can search from district after previously searching from province', async ({ page }) => {
      // First: search by province
      const provinceInput = page.locator('#province-input');
      await provinceInput.fill('กรุงเทพ');
      const root1 = rootOf(provinceInput);
      const dropdown1 = root1.locator('[role="listbox"]');
      await expect(dropdown1).toBeVisible({ timeout: 5000 });

      await provinceInput.press('ArrowDown');
      await provinceInput.press('Enter');
      await expect(dropdown1).toBeHidden();

      // Second: clear and search by district
      const districtInput = page.locator('#district-input');
      await districtInput.fill('');
      await districtInput.fill('บางรัก');
      const root2 = rootOf(districtInput);
      const dropdown2 = root2.locator('[role="listbox"]');
      await expect(dropdown2).toBeVisible({ timeout: 5000 });

      await districtInput.press('ArrowDown');
      await districtInput.press('Enter');

      // New selection should overwrite all fields
      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);
      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });

    test('can search from postal code after previously searching from sub-district', async ({ page }) => {
      // First: search by sub-district
      const subdistrictInput = page.locator('#subdistrict-input');
      await subdistrictInput.fill('บางรัก');
      const root1 = rootOf(subdistrictInput);
      const dropdown1 = root1.locator('[role="listbox"]');
      await expect(dropdown1).toBeVisible({ timeout: 5000 });

      await subdistrictInput.press('ArrowDown');
      await subdistrictInput.press('Enter');
      await expect(dropdown1).toBeHidden();

      // Second: search by postal code
      const postalInput = page.locator('#postal-input');
      await postalInput.fill('');
      await postalInput.fill('50200');
      const root2 = rootOf(postalInput);
      const dropdown2 = root2.locator('[role="listbox"]');
      await expect(dropdown2).toBeVisible({ timeout: 5000 });

      await postalInput.press('ArrowDown');
      await postalInput.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);
      await expect(page.locator('#subdistrict-input')).toHaveValue(result.sub_district);
      await expect(page.locator('#district-input')).toHaveValue(result.district);
      await expect(page.locator('#province-input')).toHaveValue(result.province);
      await expect(page.locator('#postal-input')).toHaveValue(result.postal_code);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 7. Dropdown visibility & controls
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Dropdown visibility & controls', () => {
    test('should hide dropdown when input is cleared', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.fill('');
      await expect(dropdown).toBeHidden({ timeout: 3000 });
    });

    test('should close dropdown on Escape', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('คลองสาน');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('Escape');
      await expect(dropdown).toBeHidden();
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await input.fill('บางรัก');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await page.locator('h1').click();
      await expect(dropdown).toBeHidden();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 8. Keyboard navigation
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Keyboard navigation', () => {
    test('should navigate suggestions with ArrowDown and ArrowUp', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // ArrowDown → first item active
      await input.press('ArrowDown');
      const firstOption = dropdown.locator('[role="option"]').first();
      await expect(firstOption).toHaveAttribute('aria-selected', 'true');

      // ArrowDown → second item active
      await input.press('ArrowDown');
      await expect(firstOption).toHaveAttribute('aria-selected', 'false');
      const secondOption = dropdown.locator('[role="option"]').nth(1);
      await expect(secondOption).toHaveAttribute('aria-selected', 'true');

      // ArrowUp → back to first
      await input.press('ArrowUp');
      await expect(firstOption).toHaveAttribute('aria-selected', 'true');
      await expect(secondOption).toHaveAttribute('aria-selected', 'false');
    });

    test('should select item on Enter and close dropdown', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('บางรัก');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      await expect(dropdown).toBeHidden();
      await expect(page.locator('#result')).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 9. ARIA accessibility
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('ARIA accessibility', () => {
    const fields = [
      { id: '#subdistrict-input', label: 'sub-district' },
      { id: '#district-input', label: 'district' },
      { id: '#province-input', label: 'province' },
      { id: '#postal-input', label: 'postal code' },
    ];

    for (const field of fields) {
      test(`${field.label} input should have correct ARIA combobox attributes`, async ({ page }) => {
        const input = page.locator(field.id);
        await expect(input).toHaveAttribute('role', 'combobox');
        await expect(input).toHaveAttribute('aria-autocomplete', 'list');
        await expect(input).toHaveAttribute('aria-expanded', 'false');
        await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      });
    }

    test('should update aria-expanded when dropdown opens', async ({ page }) => {
      const input = page.locator('#subdistrict-input');
      await expect(input).toHaveAttribute('aria-expanded', 'false');

      await input.fill('บางรัก');
      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    test('should set aria-activedescendant on keyboard navigation', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('10600');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const initialAttr = await input.getAttribute('aria-activedescendant');
      expect(initialAttr).toBeFalsy();

      await input.press('ArrowDown');
      const activeId = await input.getAttribute('aria-activedescendant');
      expect(activeId).toBeTruthy();
      expect(activeId).toContain('option-0');
    });

    test('should announce results via live region', async ({ page }) => {
      const input = page.locator('#district-input');
      await input.fill('คลองสาน');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      const liveRegion = root.locator('[role="status"][aria-live="polite"]');
      await expect(liveRegion).toContainText('suggestion');
      await expect(liveRegion).toContainText('available');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 10. Multiple inputs independence
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Multiple inputs independence', () => {
    test('only the active field dropdown should be visible', async ({ page }) => {
      // Type in sub-district
      const subdistrictInput = page.locator('#subdistrict-input');
      await subdistrictInput.fill('บางรัก');
      const root1 = rootOf(subdistrictInput);
      const dropdown1 = root1.locator('[role="listbox"]');
      await expect(dropdown1).toBeVisible({ timeout: 5000 });

      // Click on postal input (triggers outside-click → closes sub-district dropdown)
      const postalInput = page.locator('#postal-input');
      await postalInput.click();
      await expect(dropdown1).toBeHidden({ timeout: 3000 });

      // Now type in postal input
      await postalInput.fill('10600');
      const root2 = rootOf(postalInput);
      const dropdown2 = root2.locator('[role="listbox"]');
      await expect(dropdown2).toBeVisible({ timeout: 5000 });

      // Only one dropdown should be visible (the postal one)
      const allDropdowns = page.locator('.tac-root [role="listbox"]:not(.tac-dropdown--hidden)');
      expect(await allDropdowns.count()).toBe(1);
    });

    test('each field operates independently for different queries', async ({ page }) => {
      // Type different queries in two fields sequentially
      const provinceInput = page.locator('#province-input');
      await provinceInput.fill('เชียงใหม่');
      const root1 = rootOf(provinceInput);
      await expect(root1.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

      // Move to district
      const districtInput = page.locator('#district-input');
      await districtInput.fill('เมือง');
      const root2 = rootOf(districtInput);
      await expect(root2.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

      const districtOptions = root2.locator('[role="listbox"] [role="option"]');
      expect(await districtOptions.count()).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // 11. Result data integrity
  // ═══════════════════════════════════════════════════════════════════════

  test.describe('Result data integrity', () => {
    test('result JSON should contain all 4 address fields', async ({ page }) => {
      const input = page.locator('#province-input');
      await input.fill('กรุงเทพ');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      expect(result).toHaveProperty('sub_district');
      expect(result).toHaveProperty('district');
      expect(result).toHaveProperty('province');
      expect(result).toHaveProperty('postal_code');
      expect(result.sub_district).toBeTruthy();
      expect(result.district).toBeTruthy();
      expect(result.province).toBeTruthy();
      expect(result.postal_code).toBeTruthy();
    });

    test('postal code should be a valid 5-digit string', async ({ page }) => {
      const input = page.locator('#postal-input');
      await input.fill('10600');

      const root = rootOf(input);
      const dropdown = root.locator('[role="listbox"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      await input.press('ArrowDown');
      await input.press('Enter');

      const resultJson = await page.locator('#result-json').textContent();
      const result = JSON.parse(resultJson!);

      expect(result.postal_code).toMatch(/^\d{5}$/);
    });
  });
});
