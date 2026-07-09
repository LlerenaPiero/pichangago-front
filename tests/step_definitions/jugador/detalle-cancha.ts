import { createBdd } from 'playwright-bdd';
const { Given, When, Then } = createBdd();
import { expect } from '@playwright/test';

Given('que estoy en la página de detalle de la cancha {string}', async ({ page }, id: string) => {
  await page.goto(`/cancha/${id}`);
});

Then('veo el nombre y distrito de la cancha', async ({ page }) => {
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByText('Miraflores').or(page.getByText('San Isidro')).first()).toBeVisible();
});

Then('veo los horarios disponibles para reservar', async ({ page }) => {
  await expect(page.locator('text=Seleccionar horario')).toBeVisible();
});

When('selecciono un horario disponible', async ({ page }) => {
  const slots = page.locator('div[style*="cursor: pointer"]:not([style*="cursor: not-allowed"])').filter({ hasText: /\d{2}:\d{2}/ });
  await slots.first().click();
});

Then('veo el resumen de la reserva con el total a pagar', async ({ page }) => {
  await expect(page.getByText('Total a pagar')).toBeVisible();
});

Given('que soy un jugador autenticado en el detalle de la cancha {string}', async ({ page }, id: string) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.locator('#auth-email').fill('carlos@test.com');
  await page.locator('#auth-password').fill('Clave@123');
  await page.locator('button[type="submit"]').click();
  await page.waitForFunction(() => !!localStorage.getItem('token'), { timeout: 15000 }).catch(() => {});
  await page.goto(`/cancha/${id}`);
});

Then('veo el modal de reserva con el paso de resumen', async ({ page }) => {
  await expect(page.locator('div[role="dialog"][aria-label="Reserva"]')).toBeVisible();
});

When('avanzo al paso de datos y completo nombre {string} y teléfono {string}', async ({ page }, nombre: string, telefono: string) => {
  await page.getByRole('button', { name: 'Continuar al Pago' }).click();
  await page.locator('#reserva-nombre').fill(nombre);
  await page.locator('#reserva-telefono').fill(telefono);
  await page.getByRole('button', { name: 'Continuar' }).click();
});

When('avanzo al paso de pago y confirmo la reserva', async ({ page }) => {
  await page.locator('button[type="submit"]').click();
});

Then('veo la confirmación de reserva exitosa', async ({ page }) => {
  await expect(page.getByText('¡Reserva confirmada!')).toBeVisible();
});
