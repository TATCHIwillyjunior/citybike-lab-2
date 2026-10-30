const { test, expect } = require('@playwright/test');

// MISSION 4 — Mock the first /api/stations GET as 503, confirm the error banner,
// then let Retry loading reach the real server and recover to 4 stations.

test('handles 503 outage on initial load and recovers on retry', async ({ page }) => {
  let attempts = 0;

  // Intercept GET /api/stations with page.route
  await page.route('**/api/stations', async route => {
    attempts++;
    if (attempts === 1) {
      // First attempt -> reply with 503 Service Unavailable
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service Unavailable' })
      });
    } else {
      // Let the retry reach the real server.
      await route.continue();
    }
  });

  await page.goto('/');

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Unable to load stations.');

  await page.getByRole('button', { name: 'Retry loading' }).click();

  await expect(page.getByTestId('station-card')).toHaveCount(4);

  await expect(alert).toBeHidden();
  expect(attempts).toBe(2);
});
