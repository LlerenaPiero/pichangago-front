import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
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

  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [googleAction, setGoogleAction] = useState(null);

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

  const handleGoogleSuccess = async (credentialResponse) => {
    const profile = decodeJWT(credentialResponse.credential);
    if (!profile) {
      setErrorMessage('Error al leer los datos de Google');
      return;
    }

    setGoogleProfile(profile);
    setGoogleCredential(credentialResponse.credential);
    setNombre(profile.given_name || '');
    setApellido(profile.family_name || '');
    setEmail(profile.email || '');

    if (authMode === 'login') {
      setGoogleAction('ask');
    } else if (authMode === 'register') {
      if (role === 'CLIENTE') {
        try {
          await doGoogleLogin(credentialResponse.credential);
        } catch (err) {
          setErrorMessage(err.message);
        }
      } else {
        setSuccessMessage('Completa tu registro como Dueño.');
      }
    }
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

  const tabStyle = (active) => ({
    flex: 1,
    padding: '12px 0',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #008060' : '2px solid transparent',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    color: active ? '#008060' : '#94a3b8',
    transition: 'color 0.2s, border-color 0.2s'
  });

  const roleCardStyle = (selected) => ({
    flex: 1,
    padding: '14px 10px',
    borderRadius: '12px',
    cursor: 'pointer',
    border: selected ? '2px solid #008060' : '2px solid #e2e8f0',
    backgroundColor: selected ? '#f0fdfa' : 'white',
    fontWeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={authMode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)'
      }}
    >
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '420px', position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '36px', height: '36px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#f1f5f9', border: 'none', borderRadius: '50%',
            fontSize: '16px', cursor: 'pointer', color: '#475569'
          }}
        >✕</button>

        <div style={{ display: 'flex', gap: '0', marginBottom: '28px', marginTop: '4px' }}>
          <button type="button" onClick={() => switchMode('login')} style={tabStyle(authMode === 'login')}>
            Iniciar sesión
          </button>
          <button type="button" onClick={() => switchMode('register')} style={tabStyle(authMode === 'register')}>
            Registrarse
          </button>
        </div>

        {authMode === 'register' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setRole('CLIENTE'); setGoogleProfile(null); }}
              style={roleCardStyle(role === 'CLIENTE')}
            >
              <span style={{ fontSize: '28px' }}>⚽</span>
              <span style={{ fontSize: '14px' }}>Jugador</span>
              <span style={{ fontSize: '11px', fontWeight: 400, color: role === 'CLIENTE' ? '#008060' : '#94a3b8' }}>
                Buscar y reservar canchas
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('DUENO'); setGoogleProfile(null); }}
              style={roleCardStyle(role === 'DUENO')}
            >
              <span style={{ fontSize: '28px' }}>🏟️</span>
              <span style={{ fontSize: '14px' }}>Dueño</span>
              <span style={{ fontSize: '11px', fontWeight: 400, color: role === 'DUENO' ? '#008060' : '#94a3b8' }}>
                Gestionar tus canchas
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
              backgroundColor: '#fef2f2', color: '#991b1b', padding: '12px 14px',
              borderRadius: '10px', marginBottom: '16px', fontSize: '14px',
              textAlign: 'center', border: '1px solid #fecaca'
            }}
          >{errorMessage}</div>
        )}

        {successMessage && (
          <div
            style={{
              backgroundColor: '#f0fdf4', color: '#166534', padding: '12px 14px',
              borderRadius: '10px', marginBottom: '16px', fontSize: '14px',
              textAlign: 'center', border: '1px solid #bbf7d0'
            }}
          >{successMessage}</div>
        )}

        {emailNoVerificado && (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #008060',
                backgroundColor: 'white', color: '#008060', fontWeight: 600,
                cursor: resending ? 'not-allowed' : 'pointer', fontSize: '14px',
              }}
            >
              {resending ? 'Enviando...' : 'Reenviar correo de verificación'}
            </button>
            {resendSuccess && (
              <div style={{
                marginTop: '8px', backgroundColor: '#f0fdf4', color: '#166534',
                padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
                textAlign: 'center', border: '1px solid #bbf7d0'
              }}>{resendSuccess}</div>
            )}
          </div>
        )}

{authMode !== 'forgot' && !googleAction && !(authMode === 'register' && googleProfile && role === 'DUENO') && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMessage('Error al iniciar sesión con Google')}
                theme="outline"
                size="large"
                text={authMode === 'login' ? 'signin_with' : 'signup_with'}
                shape="rectangular"
                width="340"
              />
            </div>
            {googleProfile && (
              <div style={{
                marginTop: '12px', padding: '10px 14px', backgroundColor: '#f8fafc',
                borderRadius: '10px', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px'
              }}>
                {googleProfile.picture && (
                  <img
                    src={googleProfile.picture}
                    alt=""
                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {googleProfile.given_name} {googleProfile.family_name}
                  </div>
                  <div style={{ color: '#64748b' }}>{googleProfile.email}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>o con correo electrónico</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }}></div>
            </div>
          </div>
        )}

        {authMode === 'register' && googleProfile && role === 'DUENO' && (
          <div style={{
            padding: '14px', backgroundColor: '#f8fafc',
            borderRadius: '10px', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px',
            marginBottom: '16px'
          }}>
            {googleProfile.picture && (
              <img
                src={googleProfile.picture}
                alt=""
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                {googleProfile.given_name} {googleProfile.family_name}
              </div>
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                {googleProfile.email} &middot; Completando registro como Dueño
              </div>
            </div>
          </div>
        )}

        {authMode === 'login' && googleAction === 'ask' && googleProfile && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{
              padding: '14px', backgroundColor: '#f8fafc',
              borderRadius: '10px', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px',
              marginBottom: '16px'
            }}>
              {googleProfile.picture && (
                <img
                  src={googleProfile.picture}
                  alt=""
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {googleProfile.given_name} {googleProfile.family_name}
                </div>
                <div style={{ color: '#64748b' }}>{googleProfile.email}</div>
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
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                backgroundColor: '#1a73e8', color: 'white', fontWeight: 600,
                cursor: 'pointer', fontSize: '15px', marginBottom: '10px'
              }}
            >Iniciar sesión con Google</button>
            <div>
              <span
                onClick={() => { switchMode('register'); setGoogleAction(null); }}
                style={{ fontSize: '14px', color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >¿Eres nuevo? Regístrate y elige tu rol</span>
            </div>
          </div>
        )}

        {authMode === 'forgot' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px' }}>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div>
              <label htmlFor="auth-email-forgot" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#475569' }}>Correo electrónico</label>
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
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                backgroundColor: isLoading ? '#94a3b8' : '#0f172a',
                color: 'white', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '6px', fontSize: '15px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              {isLoading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span
                onClick={() => switchMode('login')}
                style={{ fontSize: '14px', color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >Volver a iniciar sesión</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-nombre" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#475569' }}>Nombre</label>
                  <input id="auth-nombre" type="text" placeholder="Ej: Carlos" required value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="auth-apellido" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#475569' }}>Apellido</label>
                  <input id="auth-apellido" type="text" placeholder="Ej: Pérez" required value={apellido} onChange={(e) => setApellido(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="auth-telefono" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#475569' }}>Teléfono</label>
                  <input id="auth-telefono" type="tel" placeholder="Ej: 999888777" maxLength={12} value={telefono} onChange={(e) => setTelefono(e.target.value)} style={inputStyle} />
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '5px', color: '#475569' }}>Correo electrónico</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label htmlFor="auth-password" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569' }}>Contraseña</label>
                {authMode === 'login' && (
                  <span
                    onClick={() => switchMode('forgot')}
                    style={{ fontSize: '13px', color: '#008060', fontWeight: 500, cursor: 'pointer' }}
                  >¿Olvidaste tu contraseña?</span>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                aria-describedby={authMode === 'register' ? 'auth-pwd-help' : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              {authMode === 'register' && (
                <span id="auth-pwd-help" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Mínimo 6 caracteres
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isBlocked}
              style={{
                width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                backgroundColor: isLoading || isBlocked ? '#94a3b8' : '#0f172a',
                color: 'white', fontWeight: 600, cursor: isLoading || isBlocked ? 'not-allowed' : 'pointer',
                marginTop: '6px', fontSize: '15px',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
              }}
            >
              {isLoading ? (
                <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span> Procesando...</>
              ) : (
                authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>
        )}

        {authMode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              ¿No tienes cuenta?{' '}
              <span
                onClick={() => { switchMode('register'); resetForm(); }}
                style={{ color: '#008060', fontWeight: 600, cursor: 'pointer' }}
              >Regístrate</span>
            </span>
          </div>
        )}

        {authMode === 'register' && role === 'CLIENTE' && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Al registrarte con Google aceptas crear una cuenta como Jugador
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
