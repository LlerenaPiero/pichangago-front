import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService'; // Asegúrate de que la ruta apunte bien a tu authService.js

const Login = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [selectedRole, setSelectedRole] = useState('jugador'); // 'jugador' o 'dueno'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 📝 ESTADOS PARA CAPTURAR LOS DATOS DE LOS INPUTS REALES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Limpiar errores previos

    const rolFormateado = selectedRole.toUpperCase(); // 'JUGADOR' o 'DUENO'

    try {
      if (authMode === 'login') {
        // ==========================================
        // 🔑 FLUJO REAL DE LOGIN (M1)
        // ==========================================
        const response = await authService.login(email, password);
        
        // Formateamos los datos para mantener compatibilidad con tu App.jsx
        const userSession = {
          name: response.usuario.nombre,
          role: response.usuario.rol,
          avatar: response.usuario.nombre.substring(0, 2).toUpperCase()
        };

        onLogin(userSession); // Actualiza el estado global de tu sesión en App.jsx
        navigate('/'); // Redirección al Home o Dashboard

      } else {
        // ==========================================
        // 📝 FLUJO REAL DE REGISTRO (M1)
        // ==========================================
        // Si se registra, enviamos los campos que exige tu tabla de Azure
        await authService.register(nombre, apellido, email, password, rolFormateado);
        
        // Auto-login inmediato tras registrarse para mejorar la experiencia de usuario
        const responseLogin = await authService.login(email, password);
        
        const userSession = {
          name: responseLogin.usuario.nombre,
          role: responseLogin.usuario.rol,
          avatar: responseLogin.usuario.nombre.substring(0, 2).toUpperCase()
        };

        onLogin(userSession);
        navigate('/');
      }
    } catch (error) {
      // Capturamos el mensaje de error HTTP controlado que viene desde tu backend en Render
      setErrorMessage(error.message || 'Ocurrió un problema con la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 65px)' }}>
      <div className="modal" style={{ position: 'relative', width: '100%', maxWidth: '400px', animation: 'none' }}>
        
        <div className="modal-head">
          <div className="modal-title">Acceder a PichangaGo</div>
        </div>

        <div className="modal-body">
          {/* TABS DE LOGIN / REGISTRO */}
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} 
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            >
              Ingresar
            </div>
            <div 
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} 
              onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
            >
              Registrarse
            </div>
          </div>
          
          {/* OPCIONES DE ROL */}
          <div className="role-options">
            <div 
              className={`role-opt ${selectedRole === 'jugador' ? 'active' : ''}`} 
              onClick={() => setSelectedRole('jugador')}
            >
              ⚽ Soy Jugador
            </div>
            <div 
              className={`role-opt ${selectedRole === 'dueno' ? 'active' : ''}`} 
              onClick={() => setSelectedRole('dueno')}
            >
              🏟️ Soy Dueño
            </div>
          </div>

          {/* ⚠️ ALERTA DE ERROR VISUAL (REQUERIDO POR LA RÚBRICA DE CONTROL DE ACCESOS) */}
          {errorMessage && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9em', textAlign: 'center', fontWeight: '500', border: '1px solid #fca5a5' }}>
              ❌ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* CAMPOS ADICIONALES SOLO PARA REGISTRO */}
            {authMode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Tu nombre" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    placeholder="Tu apellido" 
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    required 
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input 
                className="form-input" 
                type="email" 
                placeholder="ejemplo@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            {/* CONTROL DE NEGOCIO: RUC PARA DUEÑO (MANTENIDO PARA EL CASO DE USO) */}
            {authMode === 'register' && selectedRole === 'dueno' && (
              <div className="form-group" id="ruc-field">
                <label className="form-label">RUC de la Cancha / Empresa</label>
                <input className="form-input" type="text" placeholder="Ej: 20123456789" required />
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-dark" 
              disabled={isLoading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px' }}
            >
              {isLoading 
                ? <><span className="loader" style={{marginRight: '8px'}}></span> Conectando a Azure...</> 
                : (authMode === 'login' ? 'Iniciar Sesión' : 'Registrarse')
              }
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;