import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canchaService } from './canchaService';

vi.mock('../utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../utils/apiFetch';

const mockJsonResponse = (data) => ({ json: async () => data });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('canchaService.listarCanchas', () => {
  it('llama sin filtros', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    const result = await canchaService.listarCanchas();
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas');
    expect(result.status).toBe('success');
  });

  it('llama con filtro de distrito', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await canchaService.listarCanchas({ distrito: 'Miraflores' });
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas?distrito=Miraflores');
  });

  it('llama con múltiples filtros', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await canchaService.listarCanchas({ distrito: 'Surco', nombre: 'Cancha', precioMin: '50', precioMax: '150' });
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas?distrito=Surco&nombre=Cancha&precioMin=50&precioMax=150');
  });

  it('retorna datos de canchas', async () => {
    const mockData = { status: 'success', data: [{ ID_Cancha: '1', Nombre: 'Cancha Test' }] };
    apiFetch.mockResolvedValue(mockJsonResponse(mockData));
    const result = await canchaService.listarCanchas();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].Nombre).toBe('Cancha Test');
  });
});

describe('canchaService.obtenerCancha', () => {
  it('llama con el id correcto', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: {} }));
    await canchaService.obtenerCancha('cancha-123');
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas/cancha-123');
  });
});

describe('canchaService.obtenerSlots', () => {
  it('llama con id y fecha', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await canchaService.obtenerSlots('cancha-1', '2026-06-19');
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas/cancha-1/slots?fecha=2026-06-19');
  });
});

describe('canchaService.obtenerOfertasHoy', () => {
  it('llama al endpoint correcto', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await canchaService.obtenerOfertasHoy();
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas/ofertas-hoy');
  });
});

describe('canchaService.reservarCancha', () => {
  it('envía datos de reserva', async () => {
    const datos = { idCancha: '1', slots: ['slot-1'], metodoPago: 'culqi', montoTotal: 80 };
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { _id: 'res-1' } }));
    const result = await canchaService.reservarCancha(datos);
    expect(apiFetch).toHaveBeenCalledWith('/api/canchas/reservar', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(datos),
    }));
    expect(result.status).toBe('success');
  });
});

describe('canchaService.obtenerMisReservas', () => {
  it('llama al endpoint de jugador', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await canchaService.obtenerMisReservas();
    expect(apiFetch).toHaveBeenCalledWith('/api/jugador/reservas', expect.objectContaining({ method: 'GET' }));
  });
});
