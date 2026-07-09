import { Page } from '@playwright/test';
import canchas from '../../fixtures/canchas';
import reservas from '../../fixtures/reservas';

export function setupCanchasMocks(page: Page) {
  // API status check (used by MisReservas and others)
  page.route('**/api/status', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  // General catch-all for list/detail (MUST be first — Playwright uses LIFO,
  // so specific routes registered after will take priority over this one)
  page.route('**/api/canchas**', async (route) => {
    const url = route.request().url();
    // Detalle de cancha individual
    if (url.includes('/api/canchas/') && !url.includes('?')) {
      const parts = url.split('/api/canchas/');
      const id = parts[1]?.split('?')[0];
      const cancha = canchas.find((c: any) => c._id === id);
      if (cancha) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', data: cancha }),
        });
      }
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'Cancha no encontrada' }),
      });
    }
    // Listado con filtros
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: canchas }),
    });
  });

  // Reservar (MUST be AFTER general catch-all — LIFO means later wins)
  page.route('**/api/canchas/reservar', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          _id: 'reserva-new',
          codigo: 'RES-NEW-001',
          estado: 'CONFIRMADA',
        },
      }),
    });
  });

  // Slots (MUST be AFTER general catch-all)
  page.route('**/api/canchas/*/slots**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          { ID_Slots: 'slot-1', Hora_Inicio: '10:00', Hora_Fin: '11:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' },
          { ID_Slots: 'slot-2', Hora_Inicio: '11:00', Hora_Fin: '12:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' },
          { ID_Slots: 'slot-3', Hora_Inicio: '12:00', Hora_Fin: '13:00', EstadoSlot: 'RESERVADO', Tipo_Precio: 'BASE' },
          { ID_Slots: 'slot-4', Hora_Inicio: '14:00', Hora_Fin: '15:00', EstadoSlot: 'OFERTA', Tipo_Precio: 'BASE' },
          { ID_Slots: 'slot-5', Hora_Inicio: '15:00', Hora_Fin: '16:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' },
          { ID_Slots: 'slot-6', Hora_Inicio: '16:00', Hora_Fin: '17:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' },
        ],
      }),
    });
  });

  // Ofertas hoy (MUST be AFTER general catch-all)
  page.route('**/api/canchas/ofertas-hoy**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [],
      }),
    });
  });
}

export function setupReservasMocks(page: Page) {
  // Reservas del jugador
  page.route('**/api/jugador/reservas**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: reservas }),
    });
  });
}
