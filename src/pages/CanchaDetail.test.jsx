import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CanchaDetail from './CanchaDetail';

const mockObtenerCancha = vi.fn();
const mockObtenerSlots = vi.fn();
const mockReservarCancha = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock('../services/canchaService', () => ({
  canchaService: {
    obtenerCancha: (...args) => mockObtenerCancha(...args),
    obtenerSlots: (...args) => mockObtenerSlots(...args),
    reservarCancha: (...args) => mockReservarCancha(...args),
  },
}));

vi.mock('../services/authService', () => ({
  authService: {
    getCurrentUser: () => mockGetCurrentUser(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const canchaData = {
  ID_Cancha: '1',
  ID_Cancha_Nav: '1',
  Nombre: 'Cancha Principal',
  Distrito: 'Miraflores',
  Direccion: 'Av. Principal 123',
  Tipo_Deporte: 'fútbol 7',
  Precio_Base: 80,
  Precio_Prime: 100,
  Precio_Baja: 60,
  Rating: 4.5,
  TotalReviews: 10,
  Descripcion: 'Cancha de fútbol 7 excelente',
  LocalNombre: 'Sport Center',
  Fotos: [{ URL_Foto: '/img/cancha.jpg' }],
};

const renderCanchaDetail = () => render(
  <MemoryRouter initialEntries={['/cancha/1']}>
    <Routes>
      <Route path="/cancha/:id" element={<CanchaDetail onOpenLogin={vi.fn()} />} />
    </Routes>
  </MemoryRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CanchaDetail', () => {
  it('muestra loading mientras carga', () => {
    mockObtenerCancha.mockReturnValue(new Promise(() => {}));
    renderCanchaDetail();
    expect(screen.getByText(/Cargando cancha/i)).toBeInTheDocument();
  });

  it('muestra detalle de cancha después de cargar', async () => {
    mockObtenerCancha.mockResolvedValue({ status: 'success', data: canchaData });
    mockObtenerSlots.mockResolvedValue({ status: 'success', data: [] });
    renderCanchaDetail();
    expect(await screen.findByText(/Cancha Principal/)).toBeInTheDocument();
    expect(screen.getByText('Miraflores')).toBeInTheDocument();
    expect(screen.getByText('Sport Center')).toBeInTheDocument();
  });

  it('muestra error si la cancha no se encuentra', async () => {
    mockObtenerCancha.mockResolvedValue({ status: 'error', error: 'Cancha no encontrada.' });
    renderCanchaDetail();
    expect(await screen.findByText(/Cancha no encontrada/i)).toBeInTheDocument();
  });

  it('renderiza slots disponibles', async () => {
    const slots = [
      { ID_Slots: 'slot-1', Hora_Inicio: '10:00', Hora_Fin: '11:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' },
      { ID_Slots: 'slot-2', Hora_Inicio: '11:00', Hora_Fin: '12:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'PRIME' },
    ];
    mockObtenerCancha.mockResolvedValue({ status: 'success', data: canchaData });
    mockObtenerSlots.mockResolvedValue({ status: 'success', data: slots });
    renderCanchaDetail();
    expect(await screen.findByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });

  it('abre modal de reserva al seleccionar slot y hacer clic en reservar', async () => {
    const user = userEvent.setup();
    mockGetCurrentUser.mockReturnValue({ nombre: 'Carlos', rol: 'JUGADOR' });
    mockObtenerCancha.mockResolvedValue({ status: 'success', data: canchaData });
    mockObtenerSlots.mockResolvedValue({
      status: 'success',
      data: [{ ID_Slots: 'slot-1', Hora_Inicio: '10:00', Hora_Fin: '11:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' }],
    });
    renderCanchaDetail();
    await screen.findByText(/Cancha Principal/);
    await user.click(await screen.findByText('10:00'));
    await user.click(screen.getByText(/Reservar y Pagar/i));
    expect(screen.getByRole('dialog', { name: 'Reserva' })).toBeInTheDocument();
    expect(screen.getByText(/Paso 1 de 4/)).toBeInTheDocument();
  });

  it('navega a través del wizard de reserva exitosamente', async () => {
    const user = userEvent.setup();
    mockGetCurrentUser.mockReturnValue({ nombre: 'Carlos', rol: 'JUGADOR' });
    mockReservarCancha.mockResolvedValue({ status: 'success', data: { _id: 'res-1' } });
    mockObtenerCancha.mockResolvedValue({ status: 'success', data: canchaData });
    mockObtenerSlots.mockResolvedValue({
      status: 'success',
      data: [{ ID_Slots: 'slot-1', Hora_Inicio: '10:00', Hora_Fin: '11:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' }],
    });
    renderCanchaDetail();
    await screen.findByText(/Cancha Principal/);
    await user.click(await screen.findByText('10:00'));
    await user.click(screen.getByText(/Reservar y Pagar/i));
    await screen.findByText(/Paso 1 de 4/);
    await user.click(screen.getByText('Continuar al Pago →'));
    await screen.findByText(/Paso 2 de 4/);
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Carlos López');
    await user.type(screen.getByLabelText(/Teléfono/i), '999888777');
    await user.click(screen.getByText('Continuar →'));
    await screen.findByText(/Paso 3 de 4/);
    await user.click(screen.getByRole('button', { name: /Pagar S\// }));
    await screen.findByText(/Paso 4 de 4/);
    expect(screen.getByText('¡Reserva confirmada!')).toBeInTheDocument();
  });

  it('pide iniciar sesión si no hay usuario logueado', async () => {
    const mockOpenLogin = vi.fn();
    mockGetCurrentUser.mockReturnValue(null);
    mockObtenerCancha.mockResolvedValue({ status: 'success', data: canchaData });
    mockObtenerSlots.mockResolvedValue({
      status: 'success',
      data: [{ ID_Slots: 'slot-1', Hora_Inicio: '10:00', Hora_Fin: '11:00', EstadoSlot: 'DISPONIBLE', Tipo_Precio: 'BASE' }],
    });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/cancha/1']}>
        <Routes>
          <Route path="/cancha/:id" element={<CanchaDetail onOpenLogin={mockOpenLogin} />} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByText(/Cancha Principal/);
    await user.click(await screen.findByText('10:00'));
    await user.click(screen.getByText(/Reservar y Pagar/i));
    expect(mockOpenLogin).toHaveBeenCalledOnce();
  });
});
