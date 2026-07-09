import { createBdd } from 'playwright-bdd';
const { When, Then } = createBdd();
import { expect } from '@playwright/test';

When('ingreso mi email {string} en el campo de recuperación', async ({ page }, email: string) => {
  await page.locator('#auth-email').fill(email);
});

Then('veo un mensaje de éxito {string}', async ({ page }, mensaje: string) => {
  await expect(page.getByRole('status').last()).toContainText(mensaje);
});
