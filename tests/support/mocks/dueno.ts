import { Page } from '@playwright/test';

export function setupDuenoMocks(page: Page) {
  // Perfil personal del dueño
  page.route('**/api/dueno/perfil', async (route) => {
    if (route.request().method() === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Perfil actualizado', data: body }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          ID_USER: 'dueno-1',
          Nombre: 'Ana',
          Apellido: 'Martínez',
          Correo: 'ana@test.com',
          Telefono: '999888776',
        },
      }),
    });
  });

  // Perfil financiero (incluye Ruc para que perfilConfigurado = true)
  page.route('**/api/dueno/perfil-financiero', async (route) => {
    if (route.request().method() === 'PUT') {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Perfil financiero actualizado', data: body }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          Ruc: '12345678901',
          Razon_Social: 'Ana Martínez SAC',
          CCI: '12345678901234567890',
          Banco: 'BCP',
          Estado: 'ACTIVO',
          Fecha_Afiliacion: '2026-01-15',
        },
      }),
    });
  });

  // Locales del dueño
  page.route('**/api/dueno/locales**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          { ID_Local: 'local-1', Nombre: 'Sport Center', Direccion: 'Av. Principal 123', Distrito: 'Miraflores' },
        ],
      }),
    });
  });

  // Canchas del dueño - catch-all for list, detail, horarios, reviews
  page.route('**/api/dueno/canchas**', async (route) => {
    const url = route.request().method();
    const fullUrl = route.request().url();

    // POST - crear nueva cancha
    if (url === 'POST' && !fullUrl.match(/\/api\/dueno\/canc.has\/[^\/]+\//)) {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', idCancha: 'cancha-nueva-1', message: 'Cancha registrada' }),
      });
    }

    // Horarios de una cancha (GET/POST)
    if (fullUrl.includes('/horarios')) {
      if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', message: 'Horarios guardados' }),
        });
      }
      // GET horarios
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [
            { Dia_Semana: 0, Fecha_Inicio: 'T10:00', Fecha_Fin: 'T11:00', Tipo_Precio: 'PRIME', Estado: 'ACTIVO' },
            { Dia_Semana: 1, Fecha_Inicio: 'T08:00', Fecha_Fin: 'T09:00', Tipo_Precio: 'BASE', Estado: 'ACTIVO' },
            { Dia_Semana: 2, Fecha_Inicio: 'T08:00', Fecha_Fin: 'T09:00', Tipo_Precio: 'BASE', Estado: 'ACTIVO' },
            { Dia_Semana: 3, Fecha_Inicio: 'T08:00', Fecha_Fin: 'T09:00', Tipo_Precio: 'BASE', Estado: 'ACTIVO' },
            { Dia_Semana: 4, Fecha_Inicio: 'T08:00', Fecha_Fin: 'T09:00', Tipo_Precio: 'BASE', Estado: 'ACTIVO' },
            { Dia_Semana: 5, Fecha_Inicio: 'T08:00', Fecha_Fin: 'T09:00', Tipo_Precio: 'BASE', Estado: 'ACTIVO' },
            { Dia_Semana: 6, Fecha_Inicio: 'T10:00', Fecha_Fin: 'T11:00', Tipo_Precio: 'PRIME', Estado: 'ACTIVO' },
          ],
        }),
      });
    }

    // Reviews de una cancha
    if (fullUrl.includes('/reviews')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: { reviews: [], total_reviews: 0, promedio: 0 },
        }),
      });
    }

    // Slots/generar
    if (fullUrl.includes('/slots/generar')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Slots generados' }),
      });
    }

    // Estado de cancha
    if (fullUrl.includes('/estado')) {
      const body = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: `Estado cambiado a ${body.estado}` }),
      });
    }

    // GET detalle de cancha individual (by ID)
    const match = fullUrl.match(/\/api\/dueno\/canc.has\/([^\/\?]+)$/);
    if (match) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            ID_Cancha: match[1],
            Nombre: 'Cancha Principal',
            Tipo_Deporte: 'fútbol 7',
            Precio_Base: 80,
            Precio_Prime: 100,
            Precio_Baja: 60,
            Estado: 'DISPONIBLE',
            Direccion: 'Av. Principal 123',
            Distrito: 'Miraflores',
            LocalNombre: 'Sport Center',
            LocalDireccion: 'Av. Principal 123',
            LocalDistrito: 'Miraflores',
            Descripcion: 'Cancha principal del complejo',
            Fotos: [{ ID_Foto: 'foto-1', URL_Foto: '/img/cancha1.jpg' }],
          },
        }),
      });
    }

    // PUT editar cancha
    if (route.request().method() === 'PUT') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Cancha actualizada' }),
      });
    }

    // GET listado de canchas
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          {
            ID_Cancha: 'cancha-dueno-1',
            Nombre: 'Cancha Principal',
            Tipo_Deporte: 'fútbol 7',
            Precio_Base: 80,
            Precio_Prime: 100,
            Precio_Baja: 60,
            Estado: 'DISPONIBLE',
            Direccion: 'Av. Principal 123',
            Distrito: 'Miraflores',
            LocalNombre: 'Sport Center',
            LocalDireccion: 'Av. Principal 123',
            LocalDistrito: 'Miraflores',
            Fotos: [{ ID_Foto: 'foto-1', URL_Foto: '/img/cancha1.jpg' }],
          },
        ],
      }),
    });
  });

  // Dashboard
  page.route('**/api/dueno/dashboard**', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          reservas_hoy: 5,
          ingresos_hoy: 400,
          ocupacion: { porcentaje: 60, reservados: 3, total_slots: 5 },
          total_canchas: 1,
          proxima_liquidacion: {
            fecha_inicio: '2026-06-15',
            fecha_fin: '2026-06-21',
            monto_neto: 2800,
            estado: 'PENDIENTE',
          },
        },
      }),
    });
  });

  // Agenda diaria y semanal
  page.route('**/api/dueno/agenda/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/semanal')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            dias: [
              {
                fecha: new Date().toISOString().split('T')[0],
                canchas: [
                  {
                    ID_Cancha: 'cancha-dueno-1',
                    Nombre: 'Cancha Principal',
                    slots: [
                      {
                        ID_Slots: 'slot-1',
                        Hora_Inicio: '10:00',
                        Hora_Fin: '11:00',
                        EstadoSlot: 'RESERVADO',
                        EstadoReserva: 'CONFIRMADA',
                        JugadorNombre: 'Carlos López',
                        Monto_Total: 80,
                      },
                      {
                        ID_Slots: 'slot-2',
                        Hora_Inicio: '11:00',
                        Hora_Fin: '12:00',
                        EstadoSlot: 'DISPONIBLE',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          {
            ID_Slots: 'slot-1',
            CanchaNombre: 'Cancha Principal',
            Hora_Inicio: '10:00',
            Hora_Fin: '11:00',
            EstadoSlot: 'RESERVADO',
            EstadoReserva: 'CONFIRMADA',
            JugadorNombre: 'Carlos López',
            JugadorTelefono: '999888777',
            Monto_Total: 80,
          },
          {
            ID_Slots: 'slot-2',
            CanchaNombre: 'Cancha Principal',
            Hora_Inicio: '11:00',
            Hora_Fin: '12:00',
            EstadoSlot: 'DISPONIBLE',
          },
          {
            ID_Slots: 'slot-3',
            CanchaNombre: 'Cancha Principal',
            Hora_Inicio: '12:00',
            Hora_Fin: '13:00',
            EstadoSlot: 'BLOQUEADO',
          },
        ],
      }),
    });
  });

  // Horarios (ruta legacy, las nuevas van por /api/dueno/canchas/{id}/horarios)
  page.route('**/api/dueno/horarios**', async (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Horario actualizado' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          lunes: { apertura: '08:00', cierre: '22:00' },
          martes: { apertura: '08:00', cierre: '22:00' },
          miercoles: { apertura: '08:00', cierre: '22:00' },
          jueves: { apertura: '08:00', cierre: '22:00' },
          viernes: { apertura: '08:00', cierre: '23:00' },
          sabado: { apertura: '09:00', cierre: '23:00' },
          domingo: { apertura: '09:00', cierre: '22:00' },
        },
      }),
    });
  });

  // Tarifas
  page.route('**/api/dueno/tarifas**', async (route) => {
    if (route.request().method() === 'PUT' || route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Tarifa actualizada' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          { dia: 'lunes', precio: 80 },
          { dia: 'martes', precio: 80 },
          { dia: 'miercoles', precio: 80 },
          { dia: 'jueves', precio: 80 },
          { dia: 'viernes', precio: 100 },
          { dia: 'sabado', precio: 120 },
          { dia: 'domingo', precio: 100 },
        ],
      }),
    });
  });
}
