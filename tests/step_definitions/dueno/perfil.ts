import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

Given('que soy un dueño autenticado', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.locator('#auth-email').fill('ana@test.com');
  await page.locator('#auth-password').fill('Clave@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !!localStorage.getItem('token'), { timeout: 15000 }).catch(() => {});
});

async function esperarPanelDueno(page) {
  await page.waitForSelector('#root > *', { timeout: 30000 });
  await Promise.race([
    page.waitForSelector('[role="tablist"]', { timeout: 30000 }),
    page.waitForSelector('h3:has-text("Completa tu perfil")', { timeout: 30000 }),
  ]);
}

When('estoy en el panel de dueño', async ({ page }) => {
  await page.goto('/panel-dueno');
  await esperarPanelDueno(page);
});

Then('veo mi información personal', async ({ page }) => {
  await expect(page.getByText('Ana').or(page.getByText('Perfil')).first()).toBeVisible();
});

Then('veo la sección de información de pagos', async ({ page }) => {
  await expect(page.getByText('Información de pagos').or(page.getByText('RUC')).first()).toBeVisible();
});
