import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { getSessionCookie, setSessionCookie, eraseSessionCookie } from './utils/cookies';
import { authService } from './services/authService';
import { listenAuthBroadcast, broadcastLogin } from './utils/broadcast';
import { getSocket, on, off } from './services/socket';

const Home = lazy(() => import('./pages/Home'));
const Buscar = lazy(() => import('./pages/Buscar'));
const CanchaDetail = lazy(() => import('./pages/CanchaDetail'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const PanelJugador = lazy(() => import('./pages/PanelJugador'));
const PerfilJugador = lazy(() => import('./pages/PerfilJugador'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const EmailVerificado = lazy(() => import('./pages/EmailVerificado'));

const PanelDueno = lazy(() => import('./pages/dueno/PanelDueno'));
const DuenoOnboarding = lazy(() => import('./pages/dueno/DuenoOnboarding'));
const RegistroCanchaForm = lazy(() => import('./pages/dueno/RegistroCanchaForm'));
const PerfilFinanciero = lazy(() => import('./pages/dueno/PerfilFinanciero'));

const ROLES_JUGADOR = ['CLIENTE'];
const ROL_DUENO = 'DUENO';
const ROLES_DUENO = ['DUENO', 'DUEÑO'];

const normalizeRole = (role) => ROLES_DUENO.includes(role) ? 'DUENO' : role;

const ProtectedRoute = ({ allowedRoles, user }) => {
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getSessionCookie());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/validate-session`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.status === 403) {
          eraseSessionCookie();
          setUser(null);
          navigate('/');
        }
      } catch { /* ignore polling errors */ }
    };
    pollingRef.current = setInterval(checkSession, 60000);
    return () => clearInterval(pollingRef.current);
  }, [user, navigate]);

  useEffect(() => {
    return listenAuthBroadcast(
      () => {
        if (!user) return;
        eraseSessionCookie();
        setUser(null);
        navigate('/');
      },
      () => {}
    );
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const handler = () => {
      authService.logout();
      setUser(null);
      navigate('/');
    };
    on('sesion:cerrada', handler);
    getSocket();
    return () => off('sesion:cerrada');
  }, [user, navigate]);

  const handleLoginSuccess = (userData) => {
    const normalized = { ...userData, role: normalizeRole(userData.role) };
    setUser(normalized);
    setSessionCookie(normalized);
    setIsModalOpen(false);
    broadcastLogin();
    if (normalized.role === ROL_DUENO) {
      navigate('/panel-dueno');
    } else if (ROLES_JUGADOR.includes(normalized.role)) {
      navigate('/panel-jugador');
    } else {
      navigate('/');
    }
  };

const logout = async () => {
    await authService.logout();
    setUser(null);
    eraseSessionCookie();
    navigate('/');
  };

  return (
    <>
      <a href="#main-content" style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: 9999, background: 'var(--dark1)', color: 'white', padding: '10px 16px', fontWeight: 600 }} onFocus={e => e.currentTarget.style.left = '0'} onBlur={e => e.currentTarget.style.left = '-9999px'}>
        Saltar al contenido principal
      </a>
      <Navbar user={user} onLogout={logout} onOpenLogin={() => setIsModalOpen(true)} />

      <AuthModal
        key={isModalOpen ? 'open' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLoginSuccess}
      />

      <ErrorBoundary>
      <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }} role="status"><h2>Cargando... ⚽</h2></div>}>
        <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/email-verificado" element={<EmailVerificado />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cancha/:slug" element={<CanchaDetail onOpenLogin={() => setIsModalOpen(true)} />} />
          <Route path="/status" element={<SystemStatus />} />

          <Route element={<ProtectedRoute user={user} allowedRoles={ROLES_JUGADOR} />}>
            <Route path="/panel-jugador" element={<PanelJugador />} />
            <Route path="/mis-reservas" element={<MisReservas />} />
            <Route path="/perfil" element={<PerfilJugador />} />
          </Route>

          <Route element={<ProtectedRoute user={user} allowedRoles={[ROL_DUENO]} />}>
            <Route path="/panel-dueno" element={<PanelDueno />} />
            <Route path="/panel-dueno/onboarding" element={<DuenoOnboarding />} />
            <Route path="/panel-dueno/registrar-cancha" element={<RegistroCanchaForm />} />
            <Route path="/panel-dueno/perfil-financiero" element={<PerfilFinanciero />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
      </Suspense>
      </ErrorBoundary>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;