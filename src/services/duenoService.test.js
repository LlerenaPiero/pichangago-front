import { describe, it, expect, vi, beforeEach } from 'vitest';
import { duenoService } from './duenoService';

vi.mock('../utils/apiFetch', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../utils/apiFetch';

const mockJsonResponse = (data) => ({ json: async () => data });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('duenoService.obtenerMisCanchas', () => {
  it('retorna lista de canchas', async () => {
    const mockData = { status: 'success', data: [{ ID_Cancha: '1', Nombre: 'Cancha Dueño' }] };
    apiFetch.mockResolvedValue(mockJsonResponse(mockData));
    const result = await duenoService.obtenerMisCanchas();
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/canchas');
    expect(result.data[0].Nombre).toBe('Cancha Dueño');
  });
});

describe('duenoService.obtenerDetalleCancha', () => {
  it('retorna detalle por id', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { ID_Cancha: '1' } }));
    await duenoService.obtenerDetalleCancha('1');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/canchas/1');
  });
});

describe('duenoService.cambiarEstadoCancha', () => {
  it('envía el nuevo estado', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', message: 'Estado cambiado' }));
    await duenoService.cambiarEstadoCancha('1', 'SUSPENDIDO');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/canchas/1/estado', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estado: 'SUSPENDIDO' }),
    }));
  });
});

describe('duenoService.obtenerDashboard', () => {
  it('retorna datos del dashboard', async () => {
    const mockData = { status: 'success', data: { reservas_hoy: 5, ingresos_hoy: 400 } };
    apiFetch.mockResolvedValue(mockJsonResponse(mockData));
    const result = await duenoService.obtenerDashboard();
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/dashboard');
    expect(result.data.reservas_hoy).toBe(5);
  });
});

describe('duenoService.obtenerAgendaDiaria', () => {
  it('retorna agenda para fecha', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await duenoService.obtenerAgendaDiaria('2026-06-19');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/agenda/diaria?fecha=2026-06-19');
  });
});

describe('duenoService.obtenerPerfilDueno', () => {
  it('retorna perfil del dueño', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { Nombre: 'Ana' } }));
    const result = await duenoService.obtenerPerfilDueno();
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/perfil');
    expect(result.data.Nombre).toBe('Ana');
  });
});

describe('duenoService.actualizarPerfilDueno', () => {
  it('envía PUT con datos', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', message: 'Perfil actualizado' }));
    await duenoService.actualizarPerfilDueno({ nombre: 'Ana', telefono: '999888777' });
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/perfil', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ nombre: 'Ana', telefono: '999888777' }),
    }));
  });
});

describe('duenoService.obtenerPerfilFinanciero', () => {
  it('retorna perfil financiero', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { Ruc: '12345678901' } }));
    const result = await duenoService.obtenerPerfilFinanciero();
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/perfil-financiero');
    expect(result.data.Ruc).toBe('12345678901');
  });
});

describe('duenoService.obtenerHorariosCancha', () => {
  it('retorna horarios por id', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: [] }));
    await duenoService.obtenerHorariosCancha('1');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/canchas/1/horarios');
  });
});

describe('duenoService.configurarHorariosTarifas', () => {
  it('envía POST con lista de horarios', async () => {
    const horarios = [{ Dia_Semana: 0, Fecha_Inicio: '08:00', Fecha_Fin: '22:00' }];
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', message: 'Horarios guardados' }));
    await duenoService.configurarHorariosTarifas('1', horarios);
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/canchas/1/horarios', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ horarios }),
    }));
  });
});

describe('duenoService.obtenerAgendaSemanal', () => {
  it('retorna agenda semanal', async () => {
    apiFetch.mockResolvedValue(mockJsonResponse({ status: 'success', data: { dias: [] } }));
    await duenoService.obtenerAgendaSemanal('2026-06-15');
    expect(apiFetch).toHaveBeenCalledWith('/api/dueno/agenda/semanal?fecha_inicio=2026-06-15');
  });
});

describe('duenoService.generarSlotsDesdeHorarios', () => {
  it('retorna éxito al generar slots', async () => {
    apiFetch.mockResolvedValue({
      text: async () => JSON.stringify({ status: 'success', message: 'Slots generados' }),
    });
    const result = await duenoService.generarSlotsDesdeHorarios('1');
    expect(result.status).toBe('success');
  });

  it('retorna error si el endpoint falla', async () => {
    apiFetch.mockRejectedValue(new Error('Network error'));
    const result = await duenoService.generarSlotsDesdeHorarios('1');
    expect(result.status).toBe('error');
    expect(result.error).toContain('no tiene implementado');
  });
});
