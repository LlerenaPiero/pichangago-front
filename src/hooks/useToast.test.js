import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from './useToast';

describe('useToast', () => {
  it('inicia con toasts vacío', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('agrega un toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('Mensaje de prueba', 'success'));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Mensaje de prueba');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('agrega múltiples toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('Primero', 'success'));
    act(() => result.current.addToast('Segundo', 'error'));
    expect(result.current.toasts).toHaveLength(2);
  });

  it('elimina un toast por id', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('A eliminar', 'success'));
    const id = result.current.toasts[0].id;
    act(() => result.current.removeToast(id));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('usa type default success si no se especifica', () => {
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('Default type'));
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('usa duration 4000 por defecto', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('Temporizado', 'success'));
    expect(result.current.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(4000); });
    expect(result.current.toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('no elimina automáticamente si duration es 0', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useToast());
    act(() => result.current.addToast('Persistente', 'success', 0));
    expect(result.current.toasts).toHaveLength(1);
    act(() => { vi.advanceTimersByTime(10000); });
    expect(result.current.toasts).toHaveLength(1);
    vi.useRealTimers();
  });
});
