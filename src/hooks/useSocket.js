import { useEffect, useRef } from 'react';
import { getSocket, on, off } from '../services/socket';

export const useSocket = (onNuevaReserva) => {
  const callbackRef = useRef(onNuevaReserva);

  useEffect(() => {
    callbackRef.current = onNuevaReserva;
  }, [onNuevaReserva]);

  useEffect(() => {
    getSocket();
    const handler = (data) => {
      if (callbackRef.current) callbackRef.current(data);
    };
    on('reserva:nueva', handler);
    return () => off('reserva:nueva');
  }, []);
};
