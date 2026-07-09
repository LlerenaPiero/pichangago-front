import { createBdd } from 'playwright-bdd';
const { Then } = createBdd();
import { expect } from '@playwright/test';

Then('veo mi nombre en la barra de navegación', async ({ page }) => {
  await expect(page.locator('.navbar')).toContainText('Carlos');
});
