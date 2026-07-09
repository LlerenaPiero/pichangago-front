import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

const mockListarCanchas = vi.fn();
const mockObtenerOfertasHoy = vi.fn();

vi.mock('../services/canchaService', () => ({
  canchaService: {
    listarCanchas: (...args) => mockListarCanchas(...args),
    obtenerOfertasHoy: (...args) => mockObtenerOfertasHoy(...args),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderHome = () => render(
  <MemoryRouter>
    <Home />
  </MemoryRouter>
);

const canchaMock = {
  ID_Cancha: '1',
  Nombre: 'Cancha Test',
  Distrito: 'Miraflores',
  Precio_Base: 80,
  Rating: 4.5,
  TotalReviews: 10,
  Descripcion: 'Cancha de fútbol 7',
  Fotos: [{ URL_Foto: '/img/test.jpg' }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Home', () => {
  it('muestra loading inicialmente', () => {
    mockListarCanchas.mockReturnValue(new Promise(() => {}));
    mockObtenerOfertasHoy.mockReturnValue(new Promise(() => {}));
    renderHome();
    expect(screen.getByText('Cargando canchas...')).toBeInTheDocument();
  });

  it('renderiza canchas después de cargar', async () => {
    mockListarCanchas.mockResolvedValue({ status: 'success', data: [canchaMock] });
    mockObtenerOfertasHoy.mockResolvedValue({ status: 'success', data: [] });
    renderHome();
    expect(await screen.findByText('Cancha Test')).toBeInTheDocument();
    expect(screen.getAllByText('Miraflores')[0]).toBeInTheDocument();
  });

  it('muestra mensaje si no hay canchas', async () => {
    mockListarCanchas.mockResolvedValue({ status: 'success', data: [] });
    mockObtenerOfertasHoy.mockResolvedValue({ status: 'success', data: [] });
    renderHome();
    expect(await screen.findByText('No hay canchas disponibles en este momento.')).toBeInTheDocument();
  });

  it('navega a /buscar con filtros al hacer clic en Buscar', async () => {
    const user = userEvent.setup();
    mockListarCanchas.mockResolvedValue({ status: 'success', data: [canchaMock] });
    mockObtenerOfertasHoy.mockResolvedValue({ status: 'success', data: [] });
    renderHome();
    await screen.findByText('Cancha Test');
    await user.click(screen.getByText('🔍 Buscar'));
    expect(mockNavigate).toHaveBeenCalledWith('/buscar?');
  });

  it('navega a /buscar con nombre al escribir y presionar Enter', async () => {
    const user = userEvent.setup();
    mockListarCanchas.mockResolvedValue({ status: 'success', data: [canchaMock] });
    mockObtenerOfertasHoy.mockResolvedValue({ status: 'success', data: [] });
    renderHome();
    await screen.findByText('Cancha Test');
    const input = screen.getByPlaceholderText(/Buscar por nombre/i);
    await user.type(input, 'Mi Cancha{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/buscar?nombre=Mi+Cancha');
  });
});
