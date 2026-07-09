import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ToastContainer from './ToastContainer';

describe('ToastContainer', () => {
  it('retorna null si no hay toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} removeToast={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza un toast de tipo success', () => {
    const toasts = [{ id: 1, message: 'Operación exitosa', type: 'success' }];
    render(<ToastContainer toasts={toasts} removeToast={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Operación exitosa')).toBeInTheDocument();
  });

  it('renderiza toast de tipo error', () => {
    const toasts = [{ id: 1, message: 'Error crítico', type: 'error' }];
    render(<ToastContainer toasts={toasts} removeToast={vi.fn()} />);
    expect(screen.getByText('Error crítico')).toBeInTheDocument();
  });

  it('renderiza toast de tipo warning', () => {
    const toasts = [{ id: 1, message: 'Advertencia', type: 'warning' }];
    render(<ToastContainer toasts={toasts} removeToast={vi.fn()} />);
    expect(screen.getByText('Advertencia')).toBeInTheDocument();
  });

  it('renderiza múltiples toasts', () => {
    const toasts = [
      { id: 1, message: 'Primero', type: 'success' },
      { id: 2, message: 'Segundo', type: 'error' },
    ];
    render(<ToastContainer toasts={toasts} removeToast={vi.fn()} />);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('llama a removeToast al hacer clic en cerrar', async () => {
    const removeToast = vi.fn();
    const user = userEvent.setup();
    const toasts = [{ id: 1, message: 'Toast a cerrar', type: 'success' }];
    render(<ToastContainer toasts={toasts} removeToast={removeToast} />);
    await user.click(screen.getByLabelText('Cerrar'));
    expect(removeToast).toHaveBeenCalledWith(1);
  });
});
