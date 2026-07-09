import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';

const hoy = () => new Date().toISOString().split('T')[0];

const Home = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [ubicacion, setUbicacion] = useState('');
  const [fecha, setFecha] = useState(hoy());
  const [hora, setHora] = useState('');
  const [coords, setCoords] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const filtros = {};
      if (coords) {
        filtros.lat = coords.lat;
        filtros.lng = coords.lng;
      }
      const res = await canchaService.listarCanchas(filtros);
      if (res.status === 'success') {
        setCanchas(res.data || []);
      }
      setLoading(false);
    })();
  }, [coords]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLoading(false),
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
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
    if (ubicacion) params.append('nombre', ubicacion);
    if (fecha) params.append('fecha', fecha);
    if (hora) params.append('hora', hora);
    
    navigate(`/buscar?${params.toString()}`);
  };

  const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_Foto);

  return (
    <div className="home-container">
      {/* HERO */}
      <div className="hero">
        <h1>Reserva una cancha<br /><span style={{ color: 'var(--green)' }}>cerca de ti</span></h1>
        <p>Elige horario, paga con Yape y recibe confirmaci&oacute;n inmediata.</p>

        <div className="search-bar">
          <div className="search-fields">
            <input
              type="text"
              placeholder="Ciudad / distrito / cancha"
              value={ubicacion}
              onChange={e => setUbicacion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBuscar()}
              aria-label="Ubicación"
              className="search-input-ubicacion"
            />
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              aria-label="Fecha"
              className="search-input-date"
            />
            <input
              type="time"
              value={hora}
              onChange={e => setHora(e.target.value)}
              aria-label="Hora (opcional)"
              className="search-input-time"
            />
          </div>
          <button className="btn-search" onClick={handleBuscar}>
            Buscar disponibles
          </button>
        </div>

        {/* Trust badges */}
        <div className="trust-badges">
          <span className="trust-badge">
            <span className="trust-dot" style={{ background: '#00D084' }}></span>
            Disponibilidad actualizada
          </span>
          <span className="trust-badge">
            <span className="trust-dot" style={{ background: '#7B5CF5' }}></span>
            Pago con Yape
          </span>
          <span className="trust-badge">
            <span className="trust-dot" style={{ background: '#FFB800' }}></span>
            Comprobante inmediato
          </span>
        </div>
      </div>

      <div className="page-wrap">
        {/* OFERTAS — solo si hay ofertas reales */}
        {ofertas.length > 0 && (
          <div className="ofertas-section">
            <div className="ofertas-header">
              <div className="ofertas-title">
                <span className="ofertas-pulse"></span>
                Ofertas de &uacute;ltimo minuto
              </div>
              <Link to="/buscar?ofertas=1" className="ofertas-ver-todas">
                Ver todas &rarr;
              </Link>
            </div>
            <div className="ofertas-scroll">
              {ofertas.map((of, i) => {
                const fotoOferta = getImageUrl(of.Foto_URL || of.Fotos?.[0]?.URL_Foto);
                const tieneDto = of.Precio_Original > 0 && of.Precio_Oferta > 0;
                return (
                  <Link
                    key={`${of.ID_Cancha}-${of.Hora_Inicio || ''}-${of.Hora_Fin || ''}-${i}`}
                    to={`/cancha/${of.ID_Cancha}`}
                    className="oferta-card"
                  >
                    {fotoOferta && (
                      <img src={fotoOferta} alt={of.Nombre} className="oferta-img" />
                    )}
                    <div className="oferta-body">
                      <div className="oferta-meta">
                        <span>{of.Distrito || of.Dia_Semana || ''}</span>
                        <span className="oferta-horario">
                          {of.Hora_Inicio?.substring(0, 5)} &mdash; {of.Hora_Fin?.substring(0, 5)}
                        </span>
                      </div>
                      <div className="oferta-nombre">{of.Nombre}</div>
                      <div className="oferta-footer">
                        {tieneDto ? (
                          <>
                            <span className="oferta-precio-original">S/ {parseFloat(of.Precio_Original).toFixed(2)}</span>
                            <span className="oferta-precio-oferta">S/ {parseFloat(of.Precio_Oferta).toFixed(2)}</span>
                            {of.Descuento > 0 && (
                              <span className="oferta-descuento">-{of.Descuento}%</span>
                            )}
                          </>
                        ) : of.Precio_Oferta > 0 ? (
                          <span className="oferta-precio-oferta">S/ {parseFloat(of.Precio_Oferta).toFixed(2)}</span>
                        ) : null}
                        {of.Minutos_Restantes && (
                          <span className="oferta-restante">{of.Minutos_Restantes} restantes</span>
                        )}
                      </div>
                      <button className="btn-reservar-oferta">Reservar</button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {loadingOfertas && ofertas.length === 0 && (
          <div className="skeleton-ofertas">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        )}

        {/* CANCHAS RECOMENDADAS — todas las canchas según ubicación */}
        <div className="recomendadas-section">
          <div className="section-header">
            <h2 className="section-title">Canchas recomendadas cerca de ti</h2>
            <p className="section-sub">
              {loading ? 'Cargando...' : `${canchas.length} canchas disponibles`}
            </p>
          </div>

          {loading ? (
            <div className="cards-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card-cancha" />
              ))}
            </div>
          ) : canchas.length === 0 ? (
            <div className="empty-state">
              <p>No hay canchas disponibles en este momento.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {canchas.map((cancha) => {
                const r = ratingRedondeado(cancha);
                return (
                  <Link
                    to={`/cancha/${cancha.ID_Cancha}`}
                    key={cancha.ID_Cancha}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="cancha-card">
                      <img className="cancha-card-img" src={fotoUrl(cancha)} alt={cancha.Nombre} loading="lazy" />
                      <div className="cancha-card-body">
                        <div className="cancha-card-distrito">{cancha.Distrito}</div>
                        <div className="cancha-card-nombre">{cancha.Nombre}</div>
                        <div className="cancha-card-tipo">{cancha.Descripcion || 'Cancha deportiva'}</div>
                      </div>
                      <div className="cancha-card-footer">
                        <div className="cancha-card-precio">S/ {Number(cancha.Precio_Base).toFixed(2)} <small>/ hora</small></div>
                        {r !== null && (
                          <div className="cancha-card-rating">
                            {r.toFixed(1)} <span className="rating-star">&#9733;</span>
                            {cancha.TotalReviews > 0 && <span className="rating-count">({cancha.TotalReviews})</span>}
                          </div>
                        )}
                      </div>
                      <div className="cancha-card-cta"><span className="cta-text">Ver horarios</span></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* CÓMO FUNCIONA */}
        <div className="como-funciona">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>
            C&oacute;mo funciona
          </h2>
          <div className="pasos-grid">
            <div className="paso">
              <div className="paso-numero">1</div>
              <div className="paso-icono">&#128269;</div>
              <div className="paso-titulo">Busca</div>
              <div className="paso-desc">Encuentra canchas cerca de ti por distrito, fecha y horario.</div>
            </div>
            <div className="paso-divisor">
              <svg width="40" height="2" viewBox="0 0 40 2" fill="none"><path d="M0 1H40" stroke="#C8CDD6" strokeWidth="2"/></svg>
            </div>
            <div className="paso">
              <div className="paso-numero">2</div>
              <div className="paso-icono">&#128197;</div>
              <div className="paso-titulo">Elige horario</div>
              <div className="paso-desc">Selecciona el d&iacute;a y la hora que mejor te quede.</div>
            </div>
            <div className="paso-divisor">
              <svg width="40" height="2" viewBox="0 0 40 2" fill="none"><path d="M0 2H40" stroke="#C8CDD6" strokeWidth="2"/></svg>
            </div>
            <div className="paso">
              <div className="paso-numero">3</div>
              <div className="paso-icono">&#127928;</div>
              <div className="paso-titulo">Paga y juega</div>
              <div className="paso-desc">Paga con Yape y recibe tu confirmaci&oacute;n al instante.</div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

const ratingRedondeado = (cancha) => {
  if (!cancha.Rating || cancha.Rating <= 0) return null;
  return Math.round(cancha.Rating * 10) / 10;
};

export default Home;