import { createBdd } from 'playwright-bdd';
const { When, Then } = createBdd();
import { expect } from '@playwright/test';

When('completo el formulario de registro con nombre {string}, apellido {string}, email {string}, contraseña {string}, teléfono {string}', async ({ page }, nombre: string, apellido: string, email: string, password: string, telefono: string) => {
  await page.locator('#auth-nombre').fill(nombre);
  await page.locator('#auth-apellido').fill(apellido);
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-password').fill(password);
  await page.locator('#auth-telefono').fill(telefono);
});

When('selecciono el rol de {string}', async ({ page }, rol: string) => {
  if (rol === 'Jugador') {
    await page.getByText('Soy Jugador').click();
  } else {
    await page.getByText('Soy Dueño').click();
  }
});

Then('veo un mensaje de bienvenida con mi nombre', async ({ page }) => {
  await expect(page.locator('.navbar')).toContainText('Juan');
});

Then('veo que los campos obligatorios muestran error', async ({ page }) => {
  await expect(page.getByText('Acceder a PichangaGo')).toBeVisible();
});
