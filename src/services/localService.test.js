import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localService } from './localService';

vi.mock('../utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../utils/apiFetch';

const mockJsonResponse = (data) => ({ json: async () => data });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('localService.registrarLocal', () => {
  it('envía POST con datos del local', async () => {
    const datos = { Nombre: 'Nuevo Local', Direccion: 'Av. Test 123', Distrito: 'Miraflores' };
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', message: 'Local creado' }));
    await localService.registrarLocal(datos);
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/locales', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(datos),
    }));
  });
});

describe('localService.listarMisLocales', () => {
  it('retorna lista de locales', async () => {
    const mockData = { status: 'success', data: [{ ID_Local: '1', Nombre: 'Sport Center' }] };
    apiFetch.mockResolvedValue(mockJsonResponse(mockData));
    const result = await localService.listarMisLocales();
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/locales');
    expect(result.data[0].Nombre).toBe('Sport Center');
  });
});

describe('localService.obtenerDetalleLocal', () => {
  it('retorna detalle por id', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { ID_Local: '1' } }));
    await localService.obtenerDetalleLocal('1');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/locales/1');
  });
});

describe('localService.editarLocal', () => {
  it('envía PUT con datos actualizados', async () => {
    const datos = { Nombre: 'Sport Center Editado' };
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', message: 'Local actualizado' }));
    await localService.editarLocal('1', datos);
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/locales/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(datos),
    }));
  });
});
