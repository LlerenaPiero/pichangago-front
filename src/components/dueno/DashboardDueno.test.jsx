import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardDueno from './DashboardDueno';

const mockObtenerDashboard = vi.fn();
const mockObtenerAgendaDiaria = vi.fn();

vi.mock('../../services/duenoService', () => ({
  duenoService: {
    obtenerDashboard: (...args) => mockObtenerDashboard(...args),
    obtenerAgendaDiaria: (...args) => mockObtenerAgendaDiaria(...args),
  },
}));

const dashboardData = {
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
};

const agendaData = [
  {
    ID_Slots: 'slot-1',
    CanchaNombre: 'Cancha Principal',
    Hora_Inicio: '10:00',
    Hora_Fin: '11:00',
    EstadoSlot: 'RESERVADO',
    EstadoReserva: 'CONFIRMADA',
    JugadorNombre: 'Carlos López',
    Monto_Total: 80,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardDueno', () => {
  it('muestra loading mientras carga', () => {
    mockObtenerDashboard.mockReturnValue(new Promise(() => {}));
    mockObtenerAgendaDiaria.mockReturnValue(new Promise(() => {}));
    render(<DashboardDueno />);
    expect(screen.getByText('Cargando resumen...')).toBeInTheDocument();
  });

  it('muestra cards de resumen con datos', async () => {
    mockObtenerDashboard.mockResolvedValue({ status: 'success', data: dashboardData });
    mockObtenerAgendaDiaria.mockResolvedValue({ status: 'success', data: agendaData });
    render(<DashboardDueno />);
    expect(await screen.findByText(/Resumen/)).toBeInTheDocument();
    expect(screen.getByText('Reservas hoy')).toBeInTheDocument();
    expect(screen.getByText('Ingresos hoy')).toBeInTheDocument();
    expect(screen.getByText('Ocupación')).toBeInTheDocument();
    expect(screen.getByText('Canchas activas')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('S/400.00')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('muestra tabla de reservas de hoy', async () => {
    mockObtenerDashboard.mockResolvedValue({ status: 'success', data: dashboardData });
    mockObtenerAgendaDiaria.mockResolvedValue({ status: 'success', data: agendaData });
    render(<DashboardDueno />);
    expect(await screen.findByText(/Reservas de hoy/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos López/)).toBeInTheDocument();
    expect(screen.getByText('S/ 80.00')).toBeInTheDocument();
  });

  it('muestra "No hay reservas para hoy" cuando no hay agenda', async () => {
    mockObtenerDashboard.mockResolvedValue({ status: 'success', data: dashboardData });
    mockObtenerAgendaDiaria.mockResolvedValue({ status: 'success', data: [] });
    render(<DashboardDueno />);
    expect(await screen.findByText('No hay reservas para hoy')).toBeInTheDocument();
  });

  it('muestra próxima liquidación', async () => {
    mockObtenerDashboard.mockResolvedValue({ status: 'success', data: dashboardData });
    mockObtenerAgendaDiaria.mockResolvedValue({ status: 'success', data: agendaData });
    render(<DashboardDueno />);
    expect(await screen.findByText(/Próxima Liquidación/)).toBeInTheDocument();
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
  });

  it('muestra "No hay datos disponibles" si dashboard falla', async () => {
    mockObtenerDashboard.mockResolvedValue({ status: 'error', data: null });
    mockObtenerAgendaDiaria.mockResolvedValue({ status: 'success', data: [] });
    render(<DashboardDueno />);
    expect(await screen.findByText('No hay datos disponibles.')).toBeInTheDocument();
  });
});
