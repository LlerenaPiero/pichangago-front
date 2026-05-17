import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal'; 
import './index.css';

// 🔌 Importamos las utilidades de cookies para persistencia OWASP
import { getSessionCookie, setSessionCookie, eraseSessionCookie } from './utils/cookies';

// 📦 CARGA PEREZOSA DE PÁGINAS (Lazy Loading)
const Home = lazy(() => import('./pages/Home'));
const Buscar = lazy(() => import('./pages/Buscar'));
const CanchaDetail = lazy(() => import('./pages/CanchaDetail'));
const MisReservas = lazy(() => import('./pages/MisReservas'));
const SystemStatus = lazy(() => import('./pages/SystemStatus'));

// 🚧 COMPONENTE TEMPORAL (Evita el error de archivo no encontrado hasta iniciar la Épica 5)
const PanelDuenoPlaceholder = () => (
  <div className="view active page-wrap" style={{ padding: '80px 24px', textAlign: 'center' }}>
    <h2 className="section-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Panel Dueño — Épica 5 🏟️</h2>
    <p style={{ color: 'var(--textMid)', fontSize: '14px' }}>Métricas de ingresos, cobro de comisiones del 5% y gestión de ofertas.</p>
  </div>
);

// 🛡️ COMPONENTE DE PROTECCIÓN DE RUTAS (MIDDLEWARE INTERCEPTOR)
const ProtectedRoute = ({ allowedRoles, user }) => {
  // Caso 1: Si no hay usuario en sesión, intercepta y redirige al Home (HTTP 401)
  if (!user) return <Navigate to="/" replace />; 
  
  // Caso 2: Si el rol del usuario no está autorizado para este módulo (HTTP 403)
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  // Caso 3: Luz verde, renderiza el componente interno
  return <Outlet />;
};

function App() {
  // 🔄 Estado Inicial: Recupera al usuario directamente de la cookie para aguantar los F5
  const [user, setUser] = useState(() => getSessionCookie());
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Interceptor de login exitoso desde el Modal
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setSessionCookie(userData); // 💾 Inyecta la cookie SameSite segura en el navegador
    setIsModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    eraseSessionCookie(); // 🗑️ Destruye la cookie inmediatamente del navegador
  };

  return (
    <BrowserRouter>
      {/* NAVBAR */}
      <Navbar user={user} onLogout={logout} onOpenLogin={() => setIsModalOpen(true)} />
      
      {/* MODAL GLOBAL DE AUTENTICACIÓN */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLogin={handleLoginSuccess} 
      />
      
      {/* CONTENEDOR ASÍNCRONO PARA LA COMPILACIÓN DE RUTAS */}
      <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}><h2>Cargando... ⚽</h2></div>}>
        <Routes>
          {/* 🔓 RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Buscar />} /> 
          <Route path="/cancha/:id" element={<CanchaDetail />} />
          <Route path="/status" element={<SystemStatus />} />

          {/* 🔐 MIDDLEWARE: SÓLO JUGADORES (Épica 4) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['JUGADOR']} />}>
            <Route path="/mis-reservas" element={<MisReservas />} />
          </Route>

          {/* 🔐 MIDDLEWARE: SÓLO DUEÑOS (Épica 5) */}
          <Route element={<ProtectedRoute user={user} allowedRoles={['DUENO']} />}>
            <Route path="/panel-dueno" element={<PanelDuenoPlaceholder />} />
          </Route>

          {/* Redirección por defecto si meten una URL errónea */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;