import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Capturamos el token mágico de la URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validación básica de seguridad
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Inténtalo de nuevo.');
      setIsLoading(false);
      return;
    }

    try {
      // Enviamos la petición al Endpoint 4 del Backend que creamos hace un rato
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al actualizar la contraseña');

      setMessage('✅ ' + data.message);
      
      // Esperamos 3 segundos y mandamos al usuario al Home para que inicie sesión
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Si alguien entra a la ruta sin un token válido, le mostramos un error de seguridad
  if (!token) {
    return (
      <div className="page-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', color: '#dc2626', background: '#fee2e2', padding: '20px', borderRadius: '12px' }}>
          <h2>⛔ Acceso Denegado</h2>
          <p>No se encontró un token de seguridad válido. Por favor, solicita un nuevo enlace desde el inicio de sesión.</p>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ marginTop: '16px' }}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Nueva Contraseña</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Ingresa tu nueva clave de acceso para PichangaGo.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>
            ❌ {error}
          </div>
        )}

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '15px', fontWeight: '600' }}>
              {message}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Redirigiendo a la pantalla principal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                placeholder="Mínimo 6 caracteres"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Confirmar Contraseña</label>
              <input 
                type="password" 
                required 
                placeholder="Repite la contraseña"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#00b48a', color: 'white', fontWeight: 700, cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}
            >
              {isLoading ? 'Actualizando...' : 'Guardar y Entrar ⚽'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;