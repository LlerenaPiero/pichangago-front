import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout, onOpenLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    onLogout();
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, flexShrink: 0 }}>
        <div style={{ background: 'var(--green)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>⚽</div>
        PichangaGo
      </Link>

      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/buscar" className={`nav-link ${isActive('/buscar')}`} onClick={() => setIsOpen(false)}>
          Ver canchas
        </Link>

        {!user ? (
          <button
            onClick={() => { onOpenLogin(); setIsOpen(false); }}
            style={{
              background: 'var(--dark3)', color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: 'var(--r8)', fontWeight: 600,
              cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap'
            }}
          >
            Ingresar
          </button>
        ) : (
          <>
            {user.role === 'JUGADOR' && (
              <Link to="/mis-reservas" className={`nav-link ${isActive('/mis-reservas')}`} onClick={() => setIsOpen(false)}>
                Mis Reservas
              </Link>
            )}

            {(user.role === 'DUENO' || user.role === 'DUEÑO') && (
              <Link to="/panel-dueno" className={`nav-link ${isActive('/panel-dueno')}`} onClick={() => setIsOpen(false)}>
                Panel Dueño
              </Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', padding: '6px 0' }}>
              <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 500 }}>{user.role}</div>
              </div>
              <div
                style={{
                  flexShrink: 0, width: '36px', height: '36px',
                  borderRadius: '50%', background: 'var(--green)', color: 'var(--dark1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', userSelect: 'none'
                }}
              >
                {user.avatar}
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  background: 'none', border: '1px solid var(--gray3)', borderRadius: 'var(--r6, 6px)',
                  padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  color: 'var(--gray4)', whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--gray4)'; e.currentTarget.style.borderColor = 'var(--gray3)'; }}
              >
                Salir
              </button>
            </div>
          </>
        )}
      </div>

      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)'
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '16px', padding: '28px',
              maxWidth: '360px', width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.14)'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a2033' }}>¿Cerrar sesión?</h3>
            <p style={{ color: '#5a6478', fontSize: '14px', marginBottom: '24px' }}>
              {user?.name}, ¿estás seguro de que deseas salir?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db',
                  background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px', color: '#374151'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  background: '#dc2626', color: 'white', fontWeight: 600,
                  cursor: 'pointer', fontSize: '14px'
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;