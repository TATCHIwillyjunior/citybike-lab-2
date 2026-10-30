const { test, expect } = require('@playwright/test');

// MISSION 2 — Add a Playwright test that first FAILS because of BUG-101.
// Behavior required: enabling "Available bikes only" hides Riverside Park (0 bikes)
// and shows exactly three station cards. Fix public/app.js only AFTER the test fails.


test('filter available bikes only', async ({ page }) => {
  await page.goto('/');

  // Web-first assertion waiting for initial 4 station cards
  const stationCards = page.getByTestId('station-card');
  await expect(stationCards).toHaveCount(4);

  // Check checkbox by accessible name
  await page.getByRole('checkbox', { name: /available bikes only/i }).check();

  // Assert exactly 3 visible cards and Riverside Park absent
  await expect(stationCards).toHaveCount(3);
  await expect(page.getByText('Riverside Park')).not.toBeVisible();
});
