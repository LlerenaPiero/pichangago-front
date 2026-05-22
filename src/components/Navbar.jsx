import { useState, useEffect } from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = ({ user, onLogout, onOpenLogin }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const location = useLocation();

  // 🚨 RADAR AUTOMÁTICO: Valida token + TOKEN_VERSION en BD cada 3 segundos
  useEffect(() => {
    const radarBackend = async () => {
      if (user && localStorage.getItem('token')) {
        try {
          const response = await authService.fetchProtected('/api/validate-session');
          if (response.status === 403) {
            onLogout();
          }
        } catch (error) {
          // Error de red, ignorar
        }
      }
    };

    radarBackend();
    const radarInterval = setInterval(radarBackend, 3000);
    return () => clearInterval(radarInterval);
  }, [location.pathname, user, onLogout]);

  // 🚨 SINCRONIZACIÓN ENTRE PESTAÑAS DEL MISMO CONTEXTO
  useEffect(() => {
    const sincronizarPestanas = (e) => {
      if (e.key === 'refreshToken' && e.newValue === null) {
        onLogout();
      }
    };
    window.addEventListener('storage', sincronizarPestanas);
    return () => window.removeEventListener('storage', sincronizarPestanas);
  }, [onLogout]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" style={{textDecoration:'none', color:'inherit', display:'flex', alignItems:'center', gap:'8px', fontWeight:800}}>
        <div style={{background:'var(--green)', width:'30px', height:'30px', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center'}}>⚽</div>
        PichangaGo
      </Link>

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>
      
      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsOpen(false)}>
          Inicio
        </Link>
        
        <Link to="/buscar" className={`nav-link ${isActive('/buscar')}`} onClick={() => setIsOpen(false)}>
          Buscar canchas
        </Link>

        {!user ? (
          <button 
            onClick={() => { onOpenLogin(); setIsOpen(false); }} 
            className="nav-link login-btn"
            style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
          >
            Iniciar Sesión
          </button>
        ) : (
          <>
            {user.role === 'JUGADOR' && (
              <Link to="/mis-reservas" className={`nav-link ${isActive('/mis-reservas')}`} onClick={() => setIsOpen(false)}>
                Mis Reservas
              </Link>
            )}
            
            {user.role === 'DUENO' && (
              <Link to="/panel-dueno" className={`nav-link ${isActive('/panel-dueno')}`} onClick={() => setIsOpen(false)}>
                Panel Dueño
              </Link>
            )}

            <div style={{display:'flex', alignItems:'center', gap:'12px', marginLeft:'10px', padding:'8px 0'}}>
              <span style={{fontSize:'13px', fontWeight:600, color:'var(--text)'}}>{user.name}</span>
              <div 
                className="avatar green" 
                onClick={() => { onLogout(); setIsOpen(false); }} 
                title="Cerrar Sesión"
                style={{cursor:'pointer', flexShrink: 0}}
              >
                {user.avatar}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;