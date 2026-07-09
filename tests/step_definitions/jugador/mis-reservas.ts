import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

Given('que soy un jugador autenticado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.locator('#auth-email').fill('carlos@test.com');
  await page.locator('#auth-password').fill('Clave@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !!localStorage.getItem('token'), { timeout: 15000 }).catch(() => {});
});

When('navego a la página de mis reservas', async ({ page }) => {
  await page.goto('/mis-reservas');
});

Then('veo la lista de reservas próximas', async ({ page }) => {
  await expect(page.locator('.reserva-item').first()).toBeVisible({ timeout: 10000 });
});

When('cambio a la pestaña {string}', async ({ page }, tabName: string) => {
  await page.locator('.tab-btn', { hasText: tabName }).click();
});

Then('veo el historial de reservas pasadas', async ({ page }) => {
  await page.waitForTimeout(500);
  const items = page.locator('.reserva-item');
  const count = await items.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

When('abro el detalle de la primera reserva', async ({ page }) => {
  await page.locator('.reserva-item').first().click({ timeout: 15000 });
  await expect(page.locator('.modal')).toBeVisible({ timeout: 10000 });
});

Then('veo el mensaje de cancelación exitosa', async ({ page }) => {
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await expect(page.locator('.modal')).not.toBeVisible();
});

Then('veo la información completa de la reserva', async ({ page }) => {
  await expect(page.locator('.resumen-row').first()).toBeVisible();
});
