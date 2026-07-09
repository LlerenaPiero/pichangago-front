import { createBdd } from 'playwright-bdd';
const { Given, When, Then, Before } = createBdd();
import { expect } from '@playwright/test';
import { setupAuthMocks } from '../../support/mocks/auth';
import { setupCanchasMocks, setupReservasMocks } from '../../support/mocks/canchas';
import { setupDuenoMocks } from '../../support/mocks/dueno';

Before(async ({ page }) => {
  setupAuthMocks(page);
  setupCanchasMocks(page);
  setupReservasMocks(page);
  setupDuenoMocks(page);
  await page.goto('/');
});

Given('que soy un visitante en la página de inicio', async ({ page }) => {
  await page.goto('/');
});

Given('que soy un usuario registrado con email {string} y contraseña {string}', async ({ page }, email: string, password: string) => {
  await page.goto('/');
});

Given('que soy un usuario registrado con email {string}', async ({ page }, email: string) => {
  await page.goto('/');
});

When('hago clic en {string}', async ({ page }, text: string) => {
  // Try button first, then tab, then text fallback
  const btn = page.getByRole('button', { name: text });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click();
    return;
  }
  const tabBtn = page.getByRole('tab', { name: text });
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click();
    return;
  }
  await page.getByText(text, { exact: true }).click();
});

When('abro el modal de inicio de sesión', async ({ page }) => {
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
});

When('ingreso credenciales email {string} y contraseña {string}', async ({ page }, email: string, password: string) => {
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
});

When('envío el formulario de inicio de sesión', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

When('envío el formulario de registro', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

When('envío la solicitud de recuperación', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

When('hago clic en la pestaña {string}', async ({ page }, text: string) => {
  await page.locator('div[style*="border-bottom"] button', { hasText: text }).click();
});

When('confirmo el cierre de sesión', async ({ page }) => {
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
});

Then('veo un mensaje de error {string}', async ({ page }, mensaje: string) => {
  await expect(page.getByRole('alert')).toContainText(mensaje);
});

Then('veo el botón {string}', async ({ page }, texto: string) => {
  await expect(page.getByRole('button', { name: texto })).toBeVisible();
});
