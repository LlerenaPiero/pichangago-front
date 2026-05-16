import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isIngresar, setIsIngresar] = useState(true); // Controla la pestaña activa
  const [role, setRole] = useState('JUGADOR'); // Controla el rol seleccionado
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulamos el login pasando el objeto usuario según el rol seleccionado
    onLogin({
      name: email.split('@')[0] || (role === 'JUGADOR' ? 'Javier Jugador' : 'Cesar Dueño'),
      role: role,
      avatar: role === 'JUGADOR' ? '🏃‍♂️' : '🏟️'
    });
    onClose(); // Cerramos el modal tras loguear
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '32px',
        width: '100%', maxWidth: '420px', position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        
        {/* Botón Cerrar (X) */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', background: 'none',
          border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af'
        }}>✕</button>

        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#0f172a' }}>
          Acceder a PichangaGo
        </h3>

        {/* TABS: Ingresar / Registrarse */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button 
            onClick={() => setIsIngresar(true)}
            style={{
              flex: 1, paddingBottom: '12px', background: 'none', border: 'none',
              fontWeight: 600, cursor: 'pointer',
              color: isIngresar ? '#00b48a' : '#64748b',
              borderBottom: isIngresar ? '2px solid #00b48a' : 'none'
            }}
          >
            Ingresar
          </button>
          <button 
            onClick={() => setIsIngresar(false)}
            style={{
              flex: 1, paddingBottom: '12px', background: 'none', border: 'none',
              fontWeight: 600, cursor: 'pointer',
              color: !isIngresar ? '#00b48a' : '#64748b',
              borderBottom: !isIngresar ? '2px solid #00b48a' : 'none'
            }}
          >
            Registrarse
          </button>
        </div>

        {/* SELECTOR DE ROL: Jugador / Dueño */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => setRole('JUGADOR')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
              border: role === 'JUGADOR' ? '2px solid #00b48a' : '1px solid #e2e8f0',
              backgroundColor: role === 'JUGADOR' ? '#e6f8f4' : 'white',
              fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
            }}
          >
            ⚽ Soy Jugador
          </button>
          <button 
            type="button"
            onClick={() => setRole('DUENO')}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
              border: role === 'DUENO' ? '2px solid #00b48a' : '1px solid #e2e8f0',
              backgroundColor: role === 'DUENO' ? '#e6f8f4' : 'white',
              fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
            }}
          >
            🏟️ Soy Dueño
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
              Correo electrónico
            </label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            backgroundColor: '#1e2530', color: 'white', fontWeight: 600,
            cursor: 'pointer', marginTop: '10px', fontSize: '16px'
          }}>
            {isIngresar ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;