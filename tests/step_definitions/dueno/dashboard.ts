import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

Then('veo las tarjetas de resumen del dashboard', async ({ page }) => {
  await page.waitForSelector('p:has-text("Cargando resumen")', { state: 'detached', timeout: 20000 }).catch(() => {});
  await expect(page.getByRole('heading', { name: /Resumen/ }).first()).toBeVisible();
});

Then('veo la tabla de reservas de hoy', async ({ page }) => {
  await page.waitForSelector('p:has-text("Cargando resumen")', { state: 'detached', timeout: 20000 }).catch(() => {});
  await expect(page.getByText('Reservas de hoy').or(page.getByText('No hay reservas')).first()).toBeVisible();
});
