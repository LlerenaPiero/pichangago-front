import { useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const ROLES_DUENO = ['DUENO', 'DUEÑO'];
const normalizeRole = (role) => ROLES_DUENO.includes(role) ? 'DUENO' : role;

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('CLIENTE');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [emailNoVerificado, setEmailNoVerificado] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordErrors = [];
  if (authMode === 'register' && passwordTouched) {
    if (password.length < 8) passwordErrors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) passwordErrors.push('Una mayúscula');
    if (!/[a-z]/.test(password)) passwordErrors.push('Una minúscula');
    if (!/[0-9]/.test(password)) passwordErrors.push('Un número');
    if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push('Un carácter especial');
  }

  const passwordStrength = (() => {
    if (!password || authMode !== 'register') return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Débil', 'Débil', 'Media', 'Buena', 'Fuerte', 'Muy fuerte'];
  const strengthColor = ['', '#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#22c55e', '#16a34a'];

  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleAction, setGoogleAction] = useState(null);
  const gsiInitRef = useRef(false);
  const googleBtnRef = useRef(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsBlocked(false);
    setLoginAttempts(0);
    setEmailNoVerificado(false);
    setResendSuccess('');
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const doGoogleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);
    const rol = normalizeRole(data.usuario.rol);
    onLogin({
      name: data.usuario.nombre,
      role: rol,
      avatar: data.usuario.nombre.substring(0, 2).toUpperCase()
    });
    onClose();
  };

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '114641106525-u57huj0gjhlj6vtr2qnf3kfe08mdk8ch.apps.googleusercontent.com';

  const gsiCallbackRef = useRef(null);

  useEffect(() => {
    gsiCallbackRef.current = (response) => {
      const profile = decodeJWT(response.credential);
      if (!profile) { setErrorMessage('Error al leer los datos de Google'); return; }
      setGoogleProfile(profile);
      setGoogleCredential(response.credential);
      setNombre(profile.given_name || '');
      setApellido(profile.family_name || '');
      setEmail(profile.email || '');
      if (authMode === 'login') {
        doGoogleLogin(response.credential).catch(err => setErrorMessage(err.message));
      } else if (authMode === 'register') {
        if (role === 'CLIENTE') {
          doGoogleLogin(response.credential).catch(err => setErrorMessage(err.message));
        } else {
          setSuccessMessage('Completa tu registro como Dueño.');
        }
      }
    };
  });

  useEffect(() => {
    if (gsiInitRef.current) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      gsiInitRef.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (gsiCallbackRef.current) gsiCallbackRef.current(response);
        },
      });
    };
    if (window.google?.accounts?.id) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = init;
      document.body.appendChild(script);
    }
  }, [GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (!isOpen) return;
    if (!gsiInitRef.current) return;
    if (!window.google?.accounts?.id) return;
    const showGoogleBtn = authMode !== 'forgot' && !googleAction && !(authMode === 'register' && googleProfile && role === 'DUENO');
    if (!showGoogleBtn) return;
    const el = document.getElementById('googleButton');
    if (!el) return;
    window.google.accounts.id.renderButton(el, {
      theme: 'outline',
      size: 'large',
      text: authMode === 'login' ? 'signin_with' : 'signup_with',
      shape: 'rectangular',
      width: 340,
    });
  }, [isOpen, authMode, googleAction, googleProfile, role]);

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    setIsBlocked(false);
    setEmailNoVerificado(false);
    setResendSuccess('');
    setGoogleProfile(null);
    setGoogleCredential(null);
    setGoogleAction(null);
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendSuccess('');
    setErrorMessage('');
    try {
      await authService.resendVerification(email);
      setResendSuccess('Si el correo está registrado y no verificado, recibirás un nuevo enlace.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (authMode === 'login') {
        const response = await authService.login(email, password);
        setLoginAttempts(0);
        onLogin({
          name: response.usuario.nombre,
          role: normalizeRole(response.usuario.rol),
          avatar: response.usuario.nombre.substring(0, 2).toUpperCase()
        });
        onClose();
      } else if (authMode === 'register') {
        const pwdErrors = [];
        if (password.length < 8) pwdErrors.push('Mínimo 8 caracteres');
        if (!/[A-Z]/.test(password)) pwdErrors.push('una mayúscula');
        if (!/[a-z]/.test(password)) pwdErrors.push('una minúscula');
        if (!/[0-9]/.test(password)) pwdErrors.push('un número');
        if (!/[^A-Za-z0-9]/.test(password)) pwdErrors.push('un carácter especial');
        if (pwdErrors.length) {
          throw new Error('La contraseña debe tener: ' + pwdErrors.join(', '));
        }
        const rol = role.toUpperCase();
        await authService.register(nombre, apellido, email, password, rol, telefono);
        setSuccessMessage('Te enviamos un correo de confirmación. Revisa tu bandeja de entrada.');
        setAuthMode('login');
      } else if (authMode === 'forgot') {
        const response = await fetch(`${API_URL}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al procesar la solicitud');
        setSuccessMessage(data.message);
        setEmail('');
      }
    } catch (error) {
      const msg = error.message || 'Ocurrió un problema de conexión.';
      if (authMode === 'login') {
        if (error.emailNoVerificado) {
          setEmailNoVerificado(true);
          setErrorMessage(msg);
        } else if (error.status === 403) {
          setIsBlocked(true);
          setErrorMessage(msg);
        } else {
          const newAttempts = Math.min(loginAttempts + 1, 3);
          setLoginAttempts(newAttempts);
          setErrorMessage(newAttempts >= 2 ? `${msg} (${newAttempts}/3 intentos)` : msg);
        }
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const mq = '(max-height: 700px)';
  const isShortScreen = typeof window !== 'undefined' && window.matchMedia?.(mq)?.matches;
  const compact = isShortScreen;

  const tabStyle = (active) => ({
    flex: 1,
    padding: compact ? '8px 0' : '10px 0',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #008060' : '2px solid transparent',
    fontWeight: 600,
    fontSize: compact ? '13px' : '14px',
    cursor: 'pointer',
    color: active ? '#008060' : '#94a3b8',
    transition: 'color 0.2s, border-color 0.2s'
  });

  const roleCardStyle = (selected) => ({
    flex: 1,
    padding: '10px 8px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: selected ? '2px solid #008060' : '1.5px solid #e2e8f0',
    backgroundColor: selected ? '#f0fdfa' : 'white',
    fontWeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    transition: 'all 0.2s',
    fontSize: '13px'
  });

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const modalStyle = {
    background: 'white', borderRadius: '16px', padding: compact ? '20px' : '24px',
    width: '100%', maxWidth: '400px', position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    maxHeight: compact ? '95vh' : '85vh',
    overflowY: 'auto',
  };

  const sp = compact ? (n) => n * 0.7 : (n) => n;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
        padding: '12px'
      }}
    >
      <div style={modalStyle}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: '12px', right: '12px',
            width: '32px', height: '32px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#f1f5f9', border: 'none', borderRadius: '50%',
            fontSize: '14px', cursor: 'pointer', color: '#475569'
          }}
        >✕</button>

        <div style={{ display: 'flex', gap: '0', marginBottom: sp(20), marginTop: '2px' }}>
          <button type="button" onClick={() => switchMode('login')} style={tabStyle(authMode === 'login')}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => switchMode('register')} style={tabStyle(authMode === 'register')}>
            Registrarse
          </button>
        </div>

        {authMode === 'register' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: sp(16) }}>
            <button
              type="button"
              onClick={() => { setRole('CLIENTE'); setGoogleProfile(null); }}
              style={roleCardStyle(role === 'CLIENTE')}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>⚽</span>
              <span>Jugador</span>
              <span style={{ fontSize: '10px', fontWeight: 400, color: role === 'CLIENTE' ? '#008060' : '#94a3b8', lineHeight: 1.2 }}>
                Reservar canchas
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('DUENO'); setGoogleProfile(null); }}
              style={roleCardStyle(role === 'DUENO')}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>🏟️</span>
              <span>Dueño</span>
              <span style={{ fontSize: '10px', fontWeight: 400, color: role === 'DUENO' ? '#008060' : '#94a3b8', lineHeight: 1.2 }}>
                Gestionar canchas
              </span>
            </button>
          </div>
        )}

        <div aria-live="polite" aria-atomic="true" role="status" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
          {errorMessage || successMessage}
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 12px',
              borderRadius: '8px', marginBottom: sp(12), fontSize: '13px',
              textAlign: 'center', border: '1px solid #fecaca'
            }}
          >{errorMessage}</div>
        )}

        {successMessage && (
          <div
            style={{
              backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 12px',
              borderRadius: '8px', marginBottom: sp(12), fontSize: '13px',
              textAlign: 'center', border: '1px solid #bbf7d0'
            }}
          >{successMessage}</div>
        )}

        {emailNoVerificado && (
          <div style={{ marginBottom: sp(12) }}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #008060',
                backgroundColor: 'white', color: '#008060', fontWeight: 600,
                cursor: resending ? 'not-allowed' : 'pointer', fontSize: '13px',
              }}
            >
              {resending ? 'Enviando...' : 'Reenviar correo de verificación'}
            </button>
            {resendSuccess && (
              <div style={{
                marginTop: '6px', backgroundColor: '#f0fdf4', color: '#166534',
                padding: '8px 10px', borderRadius: '6px', fontSize: '12px',
                textAlign: 'center', border: '1px solid #bbf7d0'
              }}>{resendSuccess}</div>
            )}
          </div>
        )}

{authMode !== 'forgot' && !googleAction && !(authMode === 'register' && googleProfile && role === 'DUENO') && (
          <div style={{ marginBottom: sp(14) }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div id="googleButton" ref={googleBtnRef}></div>
            </div>
            {googleProfile && (
              <div style={{
                marginTop: '8px', padding: '8px 12px', backgroundColor: '#f8fafc',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px'
              }}>
                {googleProfile.picture && (
                  <img
                    src={googleProfile.picture}
                    alt=""
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {googleProfile.given_name} {googleProfile.family_name}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px' }}>{googleProfile.email}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: sp(12) + 'px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}>o con correo</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>
          </div>
        )}

        {authMode === 'register' && googleProfile && role === 'DUENO' && (
          <div style={{
            padding: '10px 12px', backgroundColor: '#f8fafc',
            borderRadius: '8px', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px',
            marginBottom: sp(12)
          }}>
            {googleProfile.picture && (
              <img
                src={googleProfile.picture}
                alt=""
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {googleProfile.given_name} {googleProfile.family_name}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                {googleProfile.email} &middot; Completando registro como Dueño
              </div>
            </div>
          </div>
        )}

        {authMode === 'login' && googleAction === 'ask' && googleProfile && (
          <div style={{ marginBottom: sp(14), textAlign: 'center' }}>
            <div style={{
              padding: '10px 12px', backgroundColor: '#f8fafc',
              borderRadius: '8px', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px',
              marginBottom: sp(12)
            }}>
              {googleProfile.picture && (
                <img
                  src={googleProfile.picture}
                  alt=""
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {googleProfile.given_name} {googleProfile.family_name}
                </div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>{googleProfile.email}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await doGoogleLogin(googleCredential);
                } catch (err) {
                  setErrorMessage(err.message);
                }
              }}
              style={{
                width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
                backgroundColor: '#1a73e8', color: 'white', fontWeight: 600,
                cursor: 'pointer', fontSize: '14px', marginBottom: '8px'
              }}
            >Iniciar sesión con Google</button>
            <div>
              <span
                onClick={() => { switchMode('register'); setGoogleAction(null); }}
                style={{ fontSize: '13px', color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >¿Eres nuevo? Regístrate y elige tu rol</span>
            </div>
          </div>
        )}

        {authMode === 'forgot' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: sp(10) }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px' }}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div>
              <label htmlFor="auth-email-forgot" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Correo electrónico</label>
              <input
                id="auth-email-forgot"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                backgroundColor: isLoading ? '#94a3b8' : '#0f172a',
                color: 'white', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '4px', fontSize: '14px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span
                onClick={() => switchMode('login')}
                style={{ fontSize: '13px', color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >Volver a iniciar sesión</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: sp(10) }}>
            {authMode === 'register' && (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="auth-nombre" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Nombre</label>
                    <input id="auth-nombre" type="text" placeholder="Carlos" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="auth-apellido" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Apellido</label>
                    <input id="auth-apellido" type="text" placeholder="Pérez" required value={apellido} onChange={(e) => setApellido(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label htmlFor="auth-telefono" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Teléfono</label>
                  <input id="auth-telefono" type="tel" placeholder="999888777" maxLength={12} value={telefono} onChange={(e) => setTelefono(e.target.value)} style={inputStyle} />
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#475569' }}>Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label htmlFor="auth-password" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Contraseña</label>
                {authMode === 'login' && (
                  <span
                    onClick={() => switchMode('forgot')}
                    style={{ fontSize: '12px', color: '#008060', fontWeight: 500, cursor: 'pointer' }}
                  >¿Olvidaste tu contraseña?</span>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
                aria-describedby={authMode === 'register' ? 'auth-pwd-help' : undefined}
                value={password}
                onBlur={() => setPasswordTouched(true)}
                onChange={(e) => { setPassword(e.target.value); if (!passwordTouched) setPasswordTouched(true); }}
                style={inputStyle}
              />
              {authMode === 'register' && passwordTouched && (
                <div id="auth-pwd-help" style={{ marginTop: '6px' }}>
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: `${(passwordStrength / 6) * 100}%`, height: '100%', backgroundColor: strengthColor[passwordStrength], transition: 'width 0.2s, background 0.2s' }}></div>
                  </div>
                  <span style={{ fontSize: '10px', color: strengthColor[passwordStrength], fontWeight: 600, marginTop: '2px', display: 'block' }}>
                    {strengthLabel[passwordStrength]}
                  </span>
                  <ul style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0', paddingLeft: '14px', listStyle: 'disc', lineHeight: 1.5 }}>
                    {passwordErrors.map((e, i) => (
                      <li key={i} style={{ color: '#ef4444' }}>{e}</li>
                    ))}
                    {passwordStrength >= 6 && <li style={{ color: '#22c55e' }}>Contraseña muy segura ✓</li>}
                  </ul>
                </div>
              )}
              {authMode === 'register' && !passwordTouched && (
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', display: 'block' }}>
                  Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isBlocked}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
                backgroundColor: isLoading || isBlocked ? '#94a3b8' : '#0f172a',
                color: 'white', fontWeight: 600, cursor: isLoading || isBlocked ? 'not-allowed' : 'pointer',
                marginTop: '4px', fontSize: '14px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
              }}
            >
              {isLoading ? (
                <><span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span> Procesando...</>
              ) : (
                authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>
        )}

        {authMode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: sp(10) }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              ¿No tienes cuenta?{' '}
              <span
                onClick={() => { switchMode('register'); resetForm(); }}
                style={{ color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >Regístrate</span>
            </span>
          </div>
        )}

        {authMode === 'register' && role === 'CLIENTE' && (
          <div style={{ textAlign: 'center', marginTop: sp(8) }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
              Al registrarte con Google aceptas crear una cuenta como Jugador
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
