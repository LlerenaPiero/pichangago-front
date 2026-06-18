import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';

const DISTRITOS = ['San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 'La Victoria', 'Chorrillos', 'San Borja', 'Miraflores', 'Magdalena del Mar', 'Barranco'];

const Home = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchDistrito, setSearchDistrito] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await canchaService.listarCanchas();
      if (res.status === 'success') {
        setCanchas(res.data || []);
      }
      setLoading(false);
    })();
  }, []);

  const handleBuscar = () => {
    const params = new URLSearchParams();
    if (searchNombre) params.append('nombre', searchNombre);
    if (searchDistrito) params.append('distrito', searchDistrito);
    navigate(`/buscar?${params.toString()}`);
  };

  const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_Foto);

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Reserva tu cancha<br /><span style={{ color: 'var(--green)' }}>en 30 segundos</span></h1>
        <p>Disponibilidad en tiempo real · Paga con Yape · Comprobante PDF automático</p>

        <div className="search-bar">
          <input type="text" placeholder="Buscar por nombre o dirección…" value={searchNombre} onChange={e => setSearchNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBuscar()} />
          <select value={searchDistrito} onChange={e => setSearchDistrito(e.target.value)}>
            <option value="">Todos los distritos</option>
            {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn-search" onClick={handleBuscar}>🔍 Buscar</button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="section-header">
          <div>
            <h2 className="section-title">Canchas disponibles</h2>
            <p className="section-sub">{loading ? 'Cargando...' : `Mostrando ${canchas.length} canchas cerca de ti`}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>Cargando canchas...</div>
        ) : canchas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No hay canchas disponibles en este momento.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {canchas.map((cancha) => (
              <Link
                to={`/cancha/${cancha.ID_Cancha}`}
                key={cancha.ID_Cancha}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="cancha-card">
                  <img
                    className="cancha-card-img"
                    src={fotoUrl(cancha)}
                    alt={cancha.Nombre}
                    loading="lazy"
                  />
                  <div className="cancha-card-body">
                    <div className="cancha-card-distrito">{cancha.Distrito}</div>
                    <div className="cancha-card-nombre">{cancha.Nombre}</div>
                    <div className="cancha-card-tipo">{cancha.Descripcion || 'Cancha deportiva'}</div>
                  </div>
                  <div className="cancha-card-footer">
                    <div className="cancha-price">
                      S/ {cancha.Precio_Base.toFixed(2)} <small>/ hora</small>
                    </div>
                    {cancha.Rating > 0 && (
                      <div className="cancha-rating">
                        ⭐ {cancha.Rating} <span>({cancha.TotalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
