import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

Then('veo el listado de canchas disponibles', async ({ page }) => {
  await expect(page.locator('.cancha-card').first()).toBeVisible();
});

When('selecciono el distrito {string} en el buscador', async ({ page }, distrito: string) => {
  await page.locator('select[aria-label="Distrito"]').selectOption(distrito);
});

When('ingreso {string} en el campo de búsqueda por nombre', async ({ page }, nombre: string) => {
  await page.locator('input[placeholder*="Buscar por nombre"]').fill(nombre);
});

Then('veo la página de resultados de búsqueda', async ({ page }) => {
  await expect(page).toHaveURL(/\/buscar/);
});

When('navego a la página de búsqueda', async ({ page }) => {
  await page.goto('/buscar');
});

Then('veo canchas listadas en los resultados', async ({ page }) => {
  await expect(page.locator('a[href*="/cancha/"]').first()).toBeVisible();
});

When('hago clic en la primera cancha del listado', async ({ page }) => {
  await page.locator('.cancha-card').first().click();
});

Then('veo los detalles de la cancha', async ({ page }) => {
  await expect(page).toHaveURL(/\/cancha\//);
});

Then('veo el contador de canchas encontradas', async ({ page }) => {
  await expect(page.getByText(/cancha\(s\) encontrada\(s\)/)).toBeVisible();
});
