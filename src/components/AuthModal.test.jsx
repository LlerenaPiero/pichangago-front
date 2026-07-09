import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from './AuthModal';

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../services/authService', () => ({
  authService: {
    login: (...args) => mockLogin(...args),
    register: (...args) => mockRegister(...args),
  },
}));

const mockOnLogin = vi.fn();
const mockOnClose = vi.fn();

const renderModal = (props = {}) => render(
  <AuthModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} {...props} />
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthModal', () => {
  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={mockOnClose} onLogin={mockOnLogin} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza el modal de login por defecto', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Ingresar')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  it('cambia a modo registro al hacer clic en Registrarse', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText('Registrarse'));
    expect(screen.getByText('⚽ Soy Jugador')).toBeInTheDocument();
    expect(screen.getByText('🏟️ Soy Dueño')).toBeInTheDocument();
  });

  it('cambia a recuperación al hacer clic en olvidaste contraseña', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText('¿Olvidaste tu contraseña?'));
    expect(screen.getByText('Recuperar Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Enviar enlace de recuperación')).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en cerrar', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByLabelText('Cerrar modal'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('cierra con tecla Escape', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('login exitoso llama a onLogin', async () => {
    mockLogin.mockResolvedValue({
      usuario: { nombre: 'Ana', rol: 'JUGADOR' },
      token: 'abc',
      refreshToken: 'def',
    });
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} />);
    await user.type(screen.getByLabelText(/correo/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'Clave@123');
    await user.click(screen.getByText('Iniciar Sesión'));
    await vi.waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ana@test.com', 'Clave@123');
      expect(mockOnLogin).toHaveBeenCalledWith({ name: 'Ana', role: 'JUGADOR', avatar: 'AN' });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('registro exitoso loguea automáticamente', async () => {
    mockRegister.mockResolvedValue({ usuario: { nombre: 'Carlos', rol: 'JUGADOR' } });
    mockLogin.mockResolvedValue({
      usuario: { nombre: 'Carlos', rol: 'JUGADOR' },
      token: 'abc',
    });
    const user = userEvent.setup();
    render(<AuthModal isOpen={true} onClose={mockOnClose} onLogin={mockOnLogin} />);
    await user.click(screen.getByText('Registrarse'));
    await user.type(screen.getByLabelText(/nombre/i), 'Carlos');
    await user.type(screen.getByLabelText(/apellido/i), 'López');
    await user.type(screen.getByLabelText(/correo/i), 'carlos@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), 'Clave@123');
    await user.click(screen.getAllByText('Registrarse')[1]);
    await vi.waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
