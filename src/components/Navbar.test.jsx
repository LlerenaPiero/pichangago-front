import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderNavbar = (props = {}) => render(
  <MemoryRouter>
    <Navbar user={null} onLogout={vi.fn()} onOpenLogin={vi.fn()} {...props} />
  </MemoryRouter>
);

describe('Navbar', () => {
  it('renderiza logo y enlaces básicos', () => {
    renderNavbar();
    expect(screen.getByText('PichangaGo')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Buscar canchas')).toBeInTheDocument();
  });

  it('muestra botón Iniciar Sesión cuando no hay usuario', () => {
    renderNavbar();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  it('llama a onOpenLogin al hacer clic en Iniciar Sesión', async () => {
    const onOpenLogin = vi.fn();
    const user = userEvent.setup();
    renderNavbar({ onOpenLogin });
    await user.click(screen.getByText('Iniciar Sesión'));
    expect(onOpenLogin).toHaveBeenCalledOnce();
  });

  it('muestra nombre y avatar cuando hay usuario jugador', () => {
    const user = { name: 'Carlos', role: 'JUGADOR', avatar: 'CA' };
    renderNavbar({ user });
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    expect(screen.getByText('JUGADOR')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument();
    expect(screen.getByText('Mis Reservas')).toBeInTheDocument();
    expect(screen.queryByText('Panel Dueño')).not.toBeInTheDocument();
  });

  it('muestra Panel Dueño cuando el rol es DUENO', () => {
    const user = { name: 'Ana', role: 'DUENO', avatar: 'AN' };
    renderNavbar({ user });
    expect(screen.getByText('Panel Dueño')).toBeInTheDocument();
    expect(screen.queryByText('Mis Reservas')).not.toBeInTheDocument();
  });

  it('muestra confirmación de cierre de sesión', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    const usuario = { name: 'Carlos', role: 'JUGADOR', avatar: 'CA' };
    renderNavbar({ user: usuario, onLogout });
    await user.click(screen.getByText('Salir'));
    expect(screen.getByText(/¿Cerrar sesión/i)).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    await user.click(screen.getByText('Cerrar sesión'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('cierra sesión sin confirmar al hacer clic en Cancelar', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    const usuario = { name: 'Carlos', role: 'JUGADOR', avatar: 'CA' };
    renderNavbar({ user: usuario, onLogout });
    await user.click(screen.getByText('Salir'));
    await user.click(screen.getByText('Cancelar'));
    expect(onLogout).not.toHaveBeenCalled();
  });
});
