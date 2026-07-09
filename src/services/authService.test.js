import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

const API_URL = 'http://localhost:5000';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('authService.getCurrentUser', () => {
  it('retorna null si no hay usuario en localStorage', () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it('retorna el usuario parseado si existe', () => {
    const user = { nombre: 'Juan', email: 'juan@test.com' };
    localStorage.setItem('usuario', JSON.stringify(user));
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it('retorna null si el JSON es inválido', () => {
    localStorage.setItem('usuario', 'no-es-json');
    expect(authService.getCurrentUser()).toBeNull();
  });
});

describe('authService.register', () => {
  it('registra y retorna data exitosamente', async () => {
    const mockData = { usuario: { nombre: 'Juan' }, token: 'abc', refreshToken: 'def' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    const result = await authService.register('Juan', 'Pérez', 'juan@test.com', 'Clave@123', 'jugador', '999888777');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/api/register`, expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('Juan'),
    }));
  });

  it('lanza error si la respuesta no es ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email ya registrado' }),
    });
    await expect(authService.register('Juan', 'Pérez', 'juan@test.com', 'Clave@123', 'jugador'))
      .rejects.toThrow('Email ya registrado');
  });
});

describe('authService.login', () => {
  it('loguea y guarda en localStorage', async () => {
    const mockData = {
      usuario: { _id: '1', nombre: 'Ana', email: 'ana@test.com', rol: 'DUENO' },
      token: 'token123',
      refreshToken: 'refresh123',
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });
    const result = await authService.login('ana@test.com', 'Clave@123');
    expect(result).toEqual(mockData);
    expect(localStorage.getItem('token')).toBe('token123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh123');
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(mockData.usuario);
  });

  it('lanza error si credenciales inválidas', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Credenciales inválidas' }),
    });
    try {
      await authService.login('bad@test.com', 'wrong');
    } catch (err) {
      expect(err.message).toBe('Credenciales inválidas');
      expect(err.status).toBe(401);
    }
  });
});

describe('authService.logout', () => {
  it('limpia localStorage y redirige', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('refreshToken', 'def');
    localStorage.setItem('usuario', '{}');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    delete global.window;
    global.window = { location: { href: '' } };
    await authService.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(global.window.location.href).toBe('/');
  });
});

describe('authService.refreshAccessToken', () => {
  it('renueva token exitosamente', async () => {
    localStorage.setItem('refreshToken', 'refresh123');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'nuevo-token' }),
    });
    const token = await authService.refreshAccessToken();
    expect(token).toBe('nuevo-token');
    expect(localStorage.getItem('token')).toBe('nuevo-token');
  });

  it('lanza error si no hay refreshToken', async () => {
    await expect(authService.refreshAccessToken()).rejects.toThrow('No hay refresh token guardado');
  });
});

describe('authService.fetchProtected', () => {
  it('incluye Authorization header', async () => {
    localStorage.setItem('token', 'mi-token');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await authService.fetchProtected('/api/status');
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/status`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer mi-token' }),
      })
    );
  });
});
