import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal'; // 🟢 Importamos el nuevo modal
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Buscar = lazy(() => import('./pages/Buscar'));
const CanchaDetail = lazy(() => import('./pages/CanchaDetail'));
const MisReservas = lazy(() => import('./pages/MisReservas'));

// COMPONENTE DE PROTECCIÓN DE RUTAS
const ProtectedRoute = ({ allowedRoles, userRole }) => {
  if (!userRole) return <Navigate to="/" replace />; // Si no está logueado y quiere forzar ruta, va al Home
  if (!allowedRoles.includes(userRole)) return <Navigate to="/403" replace />;
  return <Outlet />;
};

function App() {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🟢 Estado para controlar el Modal

  const logout = () => setUser(null);

  return (
    <BrowserRouter>
      {/* 🟢 Pasamos la función para abrir el modal al Navbar */}
      <Navbar user={user} onLogout={logout} onOpenLogin={() => setIsModalOpen(true)} />
      
      {/* 🟢 El Modal vive aquí globalmente para que se superponga a cualquier página */}
      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLogin={setUser} 
      />
      
      <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}><h2>Cargando... ⚽</h2></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cancha/:id" element={<CanchaDetail />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/mis-reservas" element={<MisReservas />} />
          {/* 🟢 RUTAS DE JUGADOR (Corregido a userRole) */}
          <Route element={<ProtectedRoute allowedRoles={['JUGADOR']} userRole={user?.role} />}>
            <Route path="/mis-reservas" element={<div className="page-wrap"><h2>Mis Reservas</h2><p>Bienvenido, Jugador.</p></div>} />
          </Route>

          {/* 🟢 RUTAS DE DUEÑO (Corregido a userRole) */}
          <Route element={<ProtectedRoute allowedRoles={['DUENO']} userRole={user?.role} />}>
            <Route path="/panel-dueno" element={<div className="page-wrap"><h2>Panel de Administración</h2><p>Bienvenido, Dueño de Cancha.</p></div>} />
          </Route>

          <Route path="/403" element={<div style={{padding:'50px', textAlign:'center'}}><h2>403 - Acceso Denegado 🚫</h2></div>} />
          <Route path="*" element={<div style={{padding:'50px', textAlign:'center'}}><h2>404 - No encontrado</h2></div>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;