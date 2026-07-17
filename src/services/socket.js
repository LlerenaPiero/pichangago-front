import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;
const listeners = {};

const refreshTokenAndReconnect = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;
  fetch(`${SOCKET_URL}/api/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        if (socket) {
          socket.auth.token = data.accessToken;
          socket.connect();
        }
      }
    })
    .catch(() => {});
};

const createSocket = () => {
  if (socket?.connected) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
  });

  socket.on('connect_error', (err) => {
    if (err.message.includes('Token') || err.message.includes('sesión')) {
      refreshTokenAndReconnect();
    }
  });

  Object.keys(listeners).forEach((event) => {
    socket.off(event);
    socket.on(event, listeners[event]);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket?.connected) return createSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  Object.keys(listeners).forEach(k => delete listeners[k]);
};

export const on = (event, handler) => {
  listeners[event] = handler;
  if (socket) {
    socket.off(event);
    socket.on(event, handler);
  }
};

export const off = (event) => {
  delete listeners[event];
  if (socket) socket?.off(event);
};

export const emit = (event, data) => {
  getSocket()?.emit(event, data);
};
