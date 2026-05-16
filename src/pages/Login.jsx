import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [selectedRole, setSelectedRole] = useState('jugador'); // 'jugador' o 'dueno'
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulamos que va al backend
    setTimeout(() => {
      setIsLoading(false);
      
      // 🟢 SIMULAMOS EL LOGIN EXITOSO
      // Creamos un usuario basado en el rol seleccionado en los tabs
      const fakeUser = {
        name: selectedRole === 'jugador' ? 'Diego Salcedo' : 'Claudia Ramos',
        role: selectedRole.toUpperCase(), // 'JUGADOR' o 'DUENO'
        avatar: selectedRole === 'jugador' ? 'DS' : 'CR'
      };

      props.onLogin(fakeUser); // Esto actualiza el estado en App.jsx
      navigate('/');
    }, 1500);
  };

  return (
    <div className="page-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 65px)' }}>
      {/* Esta es tu clase .modal del prototipo */}
      <div className="modal" style={{ position: 'relative', width: '100%', maxWidth: '400px', animation: 'none' }}>
        
        <div className="modal-head">
          <div className="modal-title">Acceder a PichangaGo</div>
        </div>

        <div className="modal-body">
          {/* TABS DE LOGIN / REGISTRO */}
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} 
              onClick={() => setAuthMode('login')}
            >
              Ingresar
            </div>
            <div 
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} 
              onClick={() => setAuthMode('register')}
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="ejemplo@correo.com" required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="••••••••" required />
            </div>

            {/* SOLO MOSTRAR RUC SI SE REGISTRA COMO DUEÑO */}
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
                ? <><span className="loader" style={{marginRight: '8px'}}></span> Procesando...</> 
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