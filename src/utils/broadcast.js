const CHANNEL = 'pichangago-auth';

export const authBroadcast = (() => {
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL);
  } catch {
    return null;
  }
})();

export const broadcastLogout = () => {
  authBroadcast?.postMessage({ type: 'logout', timestamp: Date.now() });
};

export const broadcastLogin = () => {
  authBroadcast?.postMessage({ type: 'login', timestamp: Date.now() });
};

export const listenAuthBroadcast = (onLogout, onLogin) => {
  if (!authBroadcast) return () => {};
  const handler = (e) => {
    if (e.data.type === 'logout') onLogout?.();
    if (e.data.type === 'login') onLogin?.();
  };
  authBroadcast.addEventListener('message', handler);
  return () => authBroadcast.removeEventListener('message', handler);
};
