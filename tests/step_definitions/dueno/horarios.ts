import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

async function esperarPanelDueno(page) {
  await page.waitForSelector('#root > *', { timeout: 30000 });
  await Promise.race([
    page.waitForSelector('[role="tablist"]', { timeout: 30000 }),
    page.waitForSelector('h3:has-text("Completa tu perfil")', { timeout: 30000 }),
  ]);
}

When('navego a la página de horarios', async ({ page }) => {
  await page.goto('/panel-dueno');
  await esperarPanelDueno(page);
  await page.getByRole('tab', { name: /Mis Canchas/ }).click();
});

Then('veo los horarios configurados', async ({ page }) => {
  await expect(page.getByText('Cancha Principal').or(page.getByText('Canchas')).first()).toBeVisible();
});

Then('veo las opciones para modificar horarios', async ({ page }) => {
  await expect(page.locator('button:has-text("Gestionar")').first()).toBeVisible();
});

When('navego a la página de tarifas', async ({ page }) => {
  await page.goto('/panel-dueno');
  await esperarPanelDueno(page);
  await page.getByRole('tab', { name: /Mis Canchas/ }).click();
});

Then('veo las tarifas configuradas por día', async ({ page }) => {
  await expect(page.getByText('Base').or(page.getByText('Precio')).first()).toBeVisible();
});
