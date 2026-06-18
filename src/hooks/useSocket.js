import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (onNuevaReserva) => {
  const socketRef = useRef(null);
  const callbackRef = useRef(onNuevaReserva);

  // Keep callback ref in sync without causing reconnection
  useEffect(() => {
    callbackRef.current = onNuevaReserva;
  }, [onNuevaReserva]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000
    });

    socket.on('connect', () => {});

    socket.on('connect_error', (err) => {
      if (err.message.includes('Token') || err.message.includes('sesión')) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          fetch(`${SOCKET_URL}/api/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })
            .then(r => r.json())
            .then(data => {
              if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
                socket.auth.token = data.accessToken;
                socket.connect();
              }
            })
            .catch(() => {});
        }
      }
    });

    socket.on('nueva-reserva', (data) => {
      if (callbackRef.current) callbackRef.current(data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return socketRef;
};
