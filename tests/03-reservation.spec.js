const { test, expect } = require('@playwright/test');

// MISSION 3 — Add two realistic tests:
// (a) invalid email gives visible error without a POST to /api/reservations
// (b) a successful reservation; intercept/mock POST /api/reservations and assert
//     the JSON request payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  let postTriggered = false;

  // Intercept any POST requests to reservations endpoint
  await page.route('**/api/reservations', async route => {
    if (route.request().method() === 'POST') {
      postTriggered = true;
    }
    await route.continue();
  });

  await page.goto('/');

  // 1. Wait for station cards to load, then select Central Station
  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();

  // 2. Fill invalid email format using a semantic label locator
  await page.getByLabel('Email address').fill('invalid-email-format');

  // 3. Click the confirm button
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  // 4. Assert error message is visible and no POST request hit the API
  await expect(
    page.getByRole('alert').filter({ hasText: 'Enter a valid email address.' })
  ).toBeVisible();
  expect(postTriggered).toBe(false);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  let capturedPayload = null;

  // Intercept POST /api/reservations with page.route
  await page.route('**/api/reservations', async route => {
    // Capture request payload
    capturedPayload = route.request().postDataJSON();

    // Mock response with HTTP 201 and reservation ID CB-DEMO-777
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ reservationId: 'CB-DEMO-777' })
    });
  });

  await page.goto('/');

  // 1. Wait for stations to load and select Central Station
  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();

  // 2. Enter valid student email using a semantic label locator
  await page.getByLabel('Email address').fill('student@example.com');

  // 3. Submit reservation
  const reservationRequest = page.waitForRequest(request =>
    request.url().endsWith('/api/reservations') && request.method() === 'POST'
  );
  await page.getByRole('button', { name: 'Confirm reservation' }).click();
  await reservationRequest;

  // 4. Verify JSON request payload sent to the backend matches acceptance criteria
  expect(capturedPayload).toEqual({
    stationId: 'central',
    email: 'student@example.com'
  });

  // 5. Assert UI displays returned reservation ID
  await expect(page.getByRole('status')).toContainText('CB-DEMO-777');
});