import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MisReservas from './MisReservas';

const mockFetchProtected = vi.fn();
const mockObtenerMisReservas = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    fetchProtected: (...args) => mockFetchProtected(...args),
  },
}));

vi.mock('../services/canchaService', () => ({
  canchaService: {
    obtenerMisReservas: (...args) => mockObtenerMisReservas(...args),
  },
}));

const reservasMock = [
  { id: 'r1', canchaNombre: 'Cancha Principal', fecha: '2026-06-20', inicio: '10:00', fin: '11:00', distrito: 'Miraflores', precio: 80, estado: 'CONFIRMADA', codigo: 'RES-001', foto: '/img/cancha.jpg' },
  { id: 'r2', canchaNombre: 'Cancha Secundaria', fecha: '2026-06-18', inicio: '14:00', fin: '15:00', distrito: 'Surco', precio: 60, estado: 'COMPLETADA', codigo: 'RES-002', foto: '/img/cancha2.jpg' },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchProtected.mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) });
});

describe('MisReservas', () => {
  it('muestra loading mientras carga', () => {
    mockObtenerMisReservas.mockReturnValue(new Promise(() => {}));
    render(<MisReservas />);
    expect(screen.getByText('Cargando tus partidos...')).toBeInTheDocument();
  });

  it('renderiza reservas confirmadas en pestaña Próximas', async () => {
    mockObtenerMisReservas.mockResolvedValue({ status: 'success', data: reservasMock });
    render(<MisReservas />);
    expect(await screen.findByText('Cancha Principal')).toBeInTheDocument();
    expect(screen.queryByText('Cancha Secundaria')).not.toBeInTheDocument();
  });

  it('cambia a historial y muestra reservas completadas', async () => {
    const user = userEvent.setup();
    mockObtenerMisReservas.mockResolvedValue({ status: 'success', data: reservasMock });
    render(<MisReservas />);
    await screen.findByText('Cancha Principal');
    await user.click(screen.getByText('Historial'));
    expect(screen.getByText('Cancha Secundaria')).toBeInTheDocument();
    expect(screen.queryByText('Cancha Principal')).not.toBeInTheDocument();
  });

  it('muestra modal de detalle al hacer clic en una reserva', async () => {
    const user = userEvent.setup();
    mockObtenerMisReservas.mockResolvedValue({ status: 'success', data: reservasMock });
    render(<MisReservas />);
    await screen.findByText('Cancha Principal');
    await user.click(screen.getByText('Cancha Principal'));
    expect(screen.getByText('Detalle de reserva')).toBeInTheDocument();
    expect(screen.getByText('RES-001')).toBeInTheDocument();
  });

  it('cancela una reserva desde el modal', async () => {
    const user = userEvent.setup();
    mockObtenerMisReservas.mockResolvedValue({ status: 'success', data: reservasMock });
    window.alert = vi.fn();
    render(<MisReservas />);
    await screen.findByText('Cancha Principal');
    await user.click(screen.getByText('Cancha Principal'));
    await screen.findByText('Detalle de reserva');
    await user.click(screen.getByText('Cancelar'));
    expect(window.alert).toHaveBeenCalled();
  });

  it('muestra estado vacío cuando no hay reservas', async () => {
    mockObtenerMisReservas.mockResolvedValue({ status: 'success', data: [] });
    render(<MisReservas />);
    expect(await screen.findByText('No tienes reservas en esta sección')).toBeInTheDocument();
  });
});
