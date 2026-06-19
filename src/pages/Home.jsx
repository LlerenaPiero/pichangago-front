import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';

const DISTRITOS = ['San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 'La Victoria', 'Chorrillos', 'San Borja', 'Miraflores', 'Magdalena del Mar', 'Barranco'];

const Home = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
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

  useEffect(() => {
    (async () => {
      setLoadingOfertas(true);
      const res = await canchaService.obtenerOfertasHoy();
      setOfertas(res.status === 'success' && res.data ? res.data : []);
      setLoadingOfertas(false);
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
          <select aria-label="Distrito" value={searchDistrito} onChange={e => setSearchDistrito(e.target.value)}>
            <option value="">Todos los distritos</option>
            {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="btn-search" onClick={handleBuscar}>🔍 Buscar</button>
        </div>
      </div>

      <div className="page-wrap">
        {/* Ofertas del día */}
        {ofertas.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #0D1117 0%, #161B25 100%)',
            borderRadius: '16px', padding: '24px', marginBottom: '32px',
            border: '1px solid #2A3345', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,208,132,0.2) 0%, transparent 70%)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '17px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00D084', boxShadow: '0 0 0 0 rgba(0,208,132,0.4)', animation: 'pulse 1.8s infinite' }}></span>
                ⚡ Último Minuto — Hoy
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              {ofertas.map((of, i) => {
                const fotoOferta = getImageUrl(of.Foto_URL || of.Fotos?.[0]?.URL_Foto);
                const tieneDto = of.Precio_Original > 0 && of.Precio_Oferta > 0;
                return (
                  <Link key={`${of.ID_Cancha}-${of.Hora_Inicio || ''}-${of.Hora_Fin || ''}-${i}`} to={`/cancha/${of.ID_Cancha}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{
                      background: '#1E2535', borderRadius: '12px', padding: '16px',
                      minWidth: '260px', border: '1px solid #2A3345', flexShrink: 0, cursor: 'pointer'
                    }}>
                      {fotoOferta && (
                        <img src={fotoOferta} alt={of.Nombre} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px', background: '#2A3345' }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', fontSize: '11px', color: '#8A93A2' }}>
                        <span>{of.Distrito || of.Dia_Semana || ''}</span>
                        {of.Rating > 0 && (
                          <span style={{ color: '#FFB800' }}>⭐ {of.Rating.toFixed(1)}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#C8CDD6', marginBottom: '2px' }}>{of.Nombre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8A93A2', marginBottom: '6px' }}>
                        {of.Dia_Semana && <span>📅 {of.Dia_Semana}</span>}
                        <span>🕐 {of.Hora_Inicio?.substring(0, 5)} — {of.Hora_Fin?.substring(0, 5)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {tieneDto ? (
                          <>
                            <span style={{ fontSize: '13px', color: '#8A93A2', textDecoration: 'line-through' }}>S/ {parseFloat(of.Precio_Original).toFixed(2)}</span>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: '#00D084' }}>S/ {parseFloat(of.Precio_Oferta).toFixed(2)}</span>
                            {of.Descuento > 0 && (
                              <span style={{ background: '#FFB800', color: '#0D1117', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>-{of.Descuento}%</span>
                            )}
                          </>
                        ) : (
                          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 600, color: '#C8CDD6' }}>
                            {of.Precio_Oferta > 0 ? `S/ ${parseFloat(of.Precio_Oferta).toFixed(2)}` : ''}
                          </span>
                        )}
                      </div>
                      {of.Minutos_Restantes && (
                        <div style={{ fontSize: '12px', color: '#FFB800', fontWeight: 600, marginTop: '8px' }}>
                          ⏱ {of.Minutos_Restantes} restantes
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {loadingOfertas && ofertas.length === 0 && (
          <div style={{ background: '#0D1117', borderRadius: '16px', padding: '24px', marginBottom: '32px', border: '1px solid #2A3345' }}>
            <div style={{ display: 'flex', gap: '14px', overflow: 'hidden' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ minWidth: '240px', height: '160px', borderRadius: '12px', background: 'linear-gradient(90deg, #1E2535 25%, #2A3345 50%, #1E2535 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          </div>
        )}

        <div className="section-header">
          <div>
            <h2 className="section-title">Canchas disponibles</h2>
            <p className="section-sub">{loading ? 'Cargando...' : `Mostrando ${canchas.length} canchas cerca de ti`}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Cargando canchas...</div>
        ) : canchas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
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
