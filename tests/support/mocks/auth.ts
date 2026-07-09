import { Page } from '@playwright/test';
import usuarios from '../../fixtures/usuarios';

const registeredEmails = new Set<string>();
const registeredNames: { [email: string]: { nombre: string, rol: string } } = {};

export function setupAuthMocks(page: Page) {
  // Registro
  page.route('**/api/register', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const { email, password } = body;

    if (!email || !password || password.length < 6) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Datos inválidos' }),
      });
    }

    if (email === usuarios.existente.email) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'El correo ya está registrado' }),
      });
    }

    const nombreCompleto = `${body.nombre} ${body.apellido || ''}`.trim();
    registeredEmails.add(email);
    registeredNames[email] = { nombre: nombreCompleto, rol: body.rol || 'JUGADOR' };

    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        usuario: { nombre: nombreCompleto, apellido: body.apellido, email, rol: body.rol || 'JUGADOR' },
        token: 'mock-jwt-token-new',
        refreshToken: 'mock-refresh-token-new',
      }),
    });
  });

  // Login
  page.route('**/api/login', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    const { email, password } = body;

    // Usuarios predefinidos
    if (email === usuarios.existente.email && password === usuarios.existente.password) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          usuario: { _id: 'user-carlos', nombre: usuarios.existente.name, email, rol: usuarios.existente.role },
          token: usuarios.existente.token,
          refreshToken: 'mock-refresh-token-carlos',
        }),
      });
    }

    if (email === usuarios.duenoExistente.email && password === usuarios.duenoExistente.password) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          usuario: { _id: 'user-ana', nombre: usuarios.duenoExistente.name, email, rol: usuarios.duenoExistente.role },
          token: usuarios.duenoExistente.token,
          refreshToken: 'mock-refresh-token-ana',
        }),
      });
    }

    // Usuarios recién registrados
    if (registeredEmails.has(email) && password && password.length >= 6) {
      const info = registeredNames[email];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          usuario: { _id: 'user-' + email.split('@')[0], nombre: info.nombre, email, rol: info.rol },
          token: 'mock-jwt-token-' + email.split('@')[0],
          refreshToken: 'mock-refresh-token-' + email.split('@')[0],
        }),
      });
    }

    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Credenciales inválidas' }),
    });
  });

  // Refresh token
  page.route('**/api/refresh', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'mock-jwt-token-refreshed' }),
    });
  });

  // Logout
  page.route('**/api/logout', async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Sesión cerrada' }),
    });
  });

  // Recuperación contraseña
  const knownEmails = [usuarios.existente.email, usuarios.duenoExistente.email];
  page.route('**/api/forgot-password', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (!body.email) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'El correo es obligatorio' }),
      });
    }
    if (!knownEmails.includes(body.email) && !registeredEmails.has(body.email)) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Correo no encontrado' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Correo enviado' }),
    });
  });

  page.route('**/api/reset-password', async (route) => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (!body.token || !body.password || body.password.length < 6) {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Token inválido o contraseña débil' }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Contraseña actualizada' }),
    });
  });
}
