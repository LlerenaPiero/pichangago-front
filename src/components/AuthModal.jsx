import { useState } from 'react';
import { authService } from '../services/authService'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('JUGADOR'); 
  
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

  if (!isOpen) return null;

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
          role: response.usuario.rol,
          avatar: response.usuario.nombre.substring(0, 2).toUpperCase()
        });
        onClose();
      } else if (authMode === 'register') {
        await authService.register(nombre, apellido, email, password, role.toUpperCase(), telefono);
        const responseLogin = await authService.login(email, password);
        onLogin({
          name: responseLogin.usuario.nombre,
          role: responseLogin.usuario.rol,
          avatar: responseLogin.usuario.nombre.substring(0, 2).toUpperCase()
        });
        onClose();
      } else if (authMode === 'forgot') {
        const response = await fetch(`${API_URL}/api/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || 'Error al procesar la solicitud');
        
        setSuccessMessage('📩 ' + data.message);
        setEmail('');
      }
    } catch (error) {
      const msg = error.message || 'Ocurrió un problema de conexión.';
      if (authMode === 'login') {
        if (error.status === 403) {
          setIsBlocked(true);
          setErrorMessage(`🚫 ${msg}`);
        } else {
          const newAttempts = Math.min(loginAttempts + 1, 3);
          setLoginAttempts(newAttempts);
          setErrorMessage(newAttempts >= 2 ? `⚠️ ${msg} (${newAttempts}/3 intentos)` : `⚠️ ${msg}`);
        }
      } else {
        setErrorMessage(`⚠️ ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={authMode === 'forgot' ? 'Recuperar contraseña' : authMode === 'register' ? 'Registrarse' : 'Iniciar sesión'} style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        
        <button onClick={onClose} aria-label="Cerrar modal" style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>

        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>
          {authMode === 'forgot' ? 'Recuperar Contraseña' : 'Acceder a PichangaGo'}
        </h3>

       
        {authMode !== 'forgot' && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <button 
              type="button"
              onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); setIsBlocked(false); }} 
              style={{ flex: 1, paddingBottom: '12px', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', color: authMode === 'login' ? '#00b48a' : '#64748b', borderBottom: authMode === 'login' ? '2px solid #00b48a' : 'none' }}
            >
              Ingresar
            </button>
            <button 
              type="button"
              onClick={() => { setAuthMode('register'); setErrorMessage(''); setSuccessMessage(''); setIsBlocked(false); }} 
              style={{ flex: 1, paddingBottom: '12px', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', color: authMode === 'register' ? '#00b48a' : '#64748b', borderBottom: authMode === 'register' ? '2px solid #00b48a' : 'none' }}
            >
              Registrarse
            </button>
          </div>
        )}

    
        {authMode === 'register' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setRole('JUGADOR')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', border: role === 'JUGADOR' ? '2px solid #00b48a' : '1px solid #e2e8f0', backgroundColor: role === 'JUGADOR' ? '#e6f8f4' : 'white', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
              ⚽ Soy Jugador
            </button>
            <button type="button" onClick={() => setRole('DUENO')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', border: role === 'DUENO' ? '2px solid #00b48a' : '1px solid #e2e8f0', backgroundColor: role === 'DUENO' ? '#e6f8f4' : 'white', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
              🏟️ Soy Dueño
            </button>
          </div>
        )}

        <div aria-live="polite" aria-atomic="true" role="status" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{errorMessage || successMessage}</div>
        {errorMessage && (
          <div role="alert" style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center', fontWeight: 'bold', border: '1px solid #fca5a5' }}>
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div role="status" style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center', fontWeight: '500', border: '1px solid #6ee7b7' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {authMode === 'register' && (
            <>
              <div>
                <label htmlFor="auth-nombre" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>👤 Nombre</label>
                <input id="auth-nombre" type="text" placeholder="Ej: Carlos" required aria-required="true" title="Tu nombre real" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label htmlFor="auth-apellido" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>👤 Apellido</label>
                <input id="auth-apellido" type="text" placeholder="Ej: Pérez" required aria-required="true" title="Tu apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label htmlFor="auth-telefono" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>📞 Teléfono</label>
                <input id="auth-telefono" type="tel" placeholder="Ej: 999888777" maxLength={12} title="Teléfono de contacto (opcional)" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
              📧 Correo electrónico
            </label>
            <input id="auth-email" type="email" placeholder="ejemplo@correo.com" required aria-required="true" title="Correo electrónico válido" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label htmlFor="auth-password" style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#475569' }}>🔒 Contraseña</label>
                
                {authMode === 'login' && (
                  <span 
                    onClick={() => { setAuthMode('forgot'); setErrorMessage(''); setSuccessMessage(''); setIsBlocked(false); }}
                    style={{ fontSize: '13px', color: '#00b48a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    ¿Olvidaste tu contraseña?
                  </span>
                )}
              </div>
              <input id="auth-password" type="password" placeholder="••••••••" required aria-required="true" title="Mínimo 6 caracteres" aria-describedby="auth-pwd-help" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              {authMode === 'register' && <span id="auth-pwd-help" style={{ fontSize: '11px', color: '#888' }}>Mínimo 6 caracteres</span>}
            </div>
          )}

          <button type="submit" disabled={isLoading || isBlocked} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: isLoading || isBlocked ? '#94a3b8' : '#1e2530', color: 'white', fontWeight: 600, cursor: isLoading || isBlocked ? 'not-allowed' : 'pointer', marginTop: '10px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isLoading ? (
              <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></span> Procesando...</>
            ) : (
              authMode === 'login' ? 'Iniciar Sesión' : 
              authMode === 'register' ? 'Registrarse' : 'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        {authMode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span 
              onClick={() => { setAuthMode('login'); setErrorMessage(''); setSuccessMessage(''); setIsBlocked(false); }} 
              style={{ fontSize: '14px', color: '#64748b', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
            >
              Volver a iniciar sesión
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;