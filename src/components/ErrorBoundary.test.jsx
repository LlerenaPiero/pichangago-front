import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary';

const GoodChild = () => <div>Todo bien</div>;
const BadChild = () => { throw new Error('Algo salió mal'); };

describe('ErrorBoundary', () => {
  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('captura error y muestra fallback UI', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    expect(screen.getByText(/Ocurrió un error inesperado/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Recargar página')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
