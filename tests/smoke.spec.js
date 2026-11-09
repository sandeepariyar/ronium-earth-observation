import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Cinematic / console palette contrast debt is recorded in docs/ACCESSIBILITY.md
const RECORDED_RULES = new Set(['color-contrast']);

async function unexpectedSeriousOrCritical(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return results.violations.filter(
    (v) =>
      ['serious', 'critical'].includes(v.impact) && !RECORDED_RULES.has(v.id),
  );
}

test('home page loads with main heading', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toContainText(/Earth/i);
});

test('mission console loads', async ({ page }) => {
  await page.goto('./console/');
  await expect(page.getByRole('link', { name: /Back to RONIUM/i })).toBeVisible();
  await expect(page.getByText('MISSION PARAMETERS')).toBeVisible();
  await expect(page.locator('#explorer')).toBeVisible();
});

test('axe: no unexpected serious or critical violations', async ({ page }) => {
  for (const path of ['./', './console/']) {
    await page.goto(path);
    if (path.includes('console')) {
      await expect(page.getByText('MISSION PARAMETERS')).toBeVisible();
    } else {
      await expect(page.locator('h1')).toBeVisible();
    }
    const bad = await unexpectedSeriousOrCritical(page);
    if (bad.length) {
      const summary = bad
        .map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} node(s))`)
        .join('\n');
      throw new Error(`axe serious/critical on ${path}:\n${summary}`);
    }
  }
});
