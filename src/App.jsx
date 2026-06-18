import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { authService } from './services/authService';


import { getSessionCookie, setSessionCookie, eraseSessionCookie } from './utils/cookies';

const Home = lazy(() => import('./pages/Home'));
const Buscar = lazy(() => import('./pages/Buscar'));
const CanchaDetail = lazy(() => import('./pages/CanchaDetail'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

const PanelDueno = lazy(() => import('./pages/dueno/PanelDueno'));
const DuenoOnboarding = lazy(() => import('./pages/dueno/DuenoOnboarding'));
const RegistroCanchaForm = lazy(() => import('./pages/dueno/RegistroCanchaForm'));
const PerfilFinanciero = lazy(() => import('./pages/dueno/PerfilFinanciero'));

const ROL_DUENO = 'DUENO';

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

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setSessionCookie(userData);
    setIsModalOpen(false);
    if (userData.role === ROL_DUENO) {
      navigate('/panel-dueno');
    }
  };

const logout = () => {
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/cancha/:id" element={<CanchaDetail onOpenLogin={() => setIsModalOpen(true)} />} />
          <Route path="/status" element={<SystemStatus />} />

          <Route element={<ProtectedRoute user={user} allowedRoles={['JUGADOR']} />}>
            <Route path="/mis-reservas" element={<MisReservas />} />
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