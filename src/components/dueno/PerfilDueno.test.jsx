import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PerfilDueno from './PerfilDueno';

const mockObtenerPerfilDueno = vi.fn();
const mockObtenerPerfilFinanciero = vi.fn();
const mockActualizarPerfilDueno = vi.fn();
const mockActualizarPerfilFinanciero = vi.fn();

vi.mock('../../services/duenoService', () => ({
  duenoService: {
    obtenerPerfilDueno: (...args) => mockObtenerPerfilDueno(...args),
    obtenerPerfilFinanciero: (...args) => mockObtenerPerfilFinanciero(...args),
    actualizarPerfilDueno: (...args) => mockActualizarPerfilDueno(...args),
    actualizarPerfilFinanciero: (...args) => mockActualizarPerfilFinanciero(...args),
  },
}));

const perfilData = {
  ID_USER: 'dueno-1',
  Nombre: 'Ana',
  Apellido: 'Martínez',
  Correo: 'ana@test.com',
  Telefono: '999888776',
};

const finanData = {
  Ruc: '12345678901',
  Razon_Social: 'Ana Martínez SAC',
  CCI: '12345678901234567890',
  Banco: 'BCP',
  Estado: 'ACTIVO',
  Fecha_Afiliacion: '2026-01-15',
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('PerfilDueno', () => {
  it('carga y muestra datos del perfil', async () => {
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: perfilData });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'success', data: finanData });
    render(<PerfilDueno version={1} onActualizar={vi.fn()} />);
    expect(await screen.findByText('Ana Martínez')).toBeInTheDocument();
    expect(screen.getByText('ana@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Martínez')).toBeInTheDocument();
    expect(screen.getByDisplayValue('999888776')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678901')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678901234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BCP')).toBeInTheDocument();
  });

  it('muestra onboarding cuando modoOnboarding es true', async () => {
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: { Nombre: '', Apellido: '', Correo: '' } });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'error' });
    render(<PerfilDueno modoOnboarding onActualizar={vi.fn()} />);
    expect(await screen.findByText('Completa tu perfil')).toBeInTheDocument();
    expect(screen.queryByText('👤 Mi Perfil')).not.toBeInTheDocument();
  });

  it('guarda cambios exitosamente', async () => {
    const onActualizar = vi.fn();
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: perfilData });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'success', data: finanData });
    mockActualizarPerfilDueno.mockResolvedValue({ status: 'success', message: 'Perfil actualizado' });
    mockActualizarPerfilFinanciero.mockResolvedValue({ status: 'success', message: 'Perfil financiero actualizado' });
    const user = userEvent.setup();
    render(<PerfilDueno version={1} onActualizar={onActualizar} />);
    await screen.findByText('Ana Martínez');
    const nombreInput = screen.getByDisplayValue('Ana');
    await user.clear(nombreInput);
    await user.type(nombreInput, 'Ana María');
    await user.click(screen.getByText('💾 Guardar Cambios'));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(onActualizar).toHaveBeenCalled();
  });

  it('muestra advertencia si no hay cambios', async () => {
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: perfilData });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'success', data: finanData });
    const user = userEvent.setup();
    render(<PerfilDueno version={1} onActualizar={vi.fn()} />);
    await screen.findByText('Ana Martínez');
    await user.click(screen.getByText('💾 Guardar Cambios'));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('valida RUC incorrecto', async () => {
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: perfilData });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'success', data: { ...finanData, Ruc: '' } });
    const user = userEvent.setup();
    render(<PerfilDueno version={1} onActualizar={vi.fn()} />);
    await screen.findByText('Ana Martínez');
    const rucInput = screen.getByDisplayValue('');
    await user.type(rucInput, '123');
    await user.click(screen.getByText('💾 Guardar Cambios'));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('detecta banco automáticamente del CCI', async () => {
    mockObtenerPerfilDueno.mockResolvedValue({ status: 'success', data: perfilData });
    mockObtenerPerfilFinanciero.mockResolvedValue({ status: 'success', data: { ...finanData, CCI: '', Banco: '' } });
    const user = userEvent.setup();
    render(<PerfilDueno version={1} onActualizar={vi.fn()} />);
    await screen.findByText('Ana Martínez');
    const cciInput = screen.getByDisplayValue('');
    await user.type(cciInput, '00021234567890123456');
    expect(screen.getByText(/Banco seleccionado: BCP/i)).toBeInTheDocument();
  });
});
