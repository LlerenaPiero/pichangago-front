import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl, FALLBACK_IMG } from '../utils/imageUrl';
import { getCanchaSlug } from '../utils/slugify';

const Home = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ofertas, setOfertas] = useState([]);
  const [loadingOfertas, setLoadingOfertas] = useState(true);
  const [coords, setCoords] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setGeoDenied(true); setLoading(false); },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setGeoDenied(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!coords && geoDenied) return;
      const filtros = {};
      if (coords) {
        filtros.lat = coords.lat;
        filtros.lng = coords.lng;
      }
      const res = await canchaService.listarCanchas(filtros);
      if (cancelled) return;
      if (res.status === 'success') {
        const data = Array.isArray(res.data) ? res.data : [];
        setCanchas(data.slice(0, 18));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [coords, geoDenied]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingOfertas(true);
      const res = await canchaService.obtenerOfertasHoy();
      if (cancelled) return;
      setOfertas(res.status === 'success' && Array.isArray(res.data) ? res.data : []);
      setLoadingOfertas(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleBuscar = () => navigate('/buscar');

  const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_FOTO);
  const imgError = (e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; };

  return (
    <div className="home-container">
      {/* HERO */}
      <div className="hero">
        <h1>Reserva una cancha<br /><span style={{ color: 'var(--green)' }}>cerca de ti</span></h1>
        <p>Elige horario, paga con Yape y recibe confirmaci&oacute;n inmediata.</p>

        <button className="btn-search" onClick={handleBuscar}>
          Buscar disponibles →
        </button>

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

      {/* CÓMO FUNCIONA */}
      <div className="como-funciona">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
          Cómo funciona
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
            <div className="paso-desc">Selecciona el día y la hora que mejor te quede.</div>
          </div>
          <div className="paso-divisor">
            <svg width="40" height="2" viewBox="0 0 40 2" fill="none"><path d="M0 2H40" stroke="#C8CDD6" strokeWidth="2"/></svg>
          </div>
          <div className="paso">
            <div className="paso-numero">3</div>
            <div className="paso-icono">&#127928;</div>
            <div className="paso-titulo">Paga y juega</div>
            <div className="paso-desc">Paga con Yape y recibe tu confirmación al instante.</div>
          </div>
        </div>
      </div>

      <div className="page-wrap">
        {geoDenied && (
          <div className="geo-invite-banner">
            <p className="geo-invite-text">Activa tu ubicaci&oacute;n para ver canchas cercanas</p>
            <p className="geo-invite-sub">Tambi&eacute;n puedes buscar por distrito o nombre de cancha.</p>
            <Link to="/buscar" className="geo-invite-btn">Explorar todas las canchas</Link>
          </div>
        )}

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
                const fotoOferta = getImageUrl(of.Fotos?.[0]?.URL_FOTO);
                const tieneDto = of.Precio_Original > 0 && of.Precio_Oferta > 0;
                const id = of.ID_CANCHA ?? of.ID_Cancha ?? i;
                return (
                  <Link
                    key={`${id}-${of.Hora_Inicio || ''}-${of.Hora_Fin || ''}-${i}`}
                    to={`/cancha/${getCanchaSlug(of)}`}
                    className="oferta-card"
                  >
                    {fotoOferta && (
                      <img src={fotoOferta} alt={of.NOMBRE} className="oferta-img" onError={imgError} />
                    )}
                    <div className="oferta-body">
                      <div className="oferta-meta">
                        <span>{of.DISTRITO || of.Dia_Semana || ''}</span>
                        {of.Rating > 0 && (
                          <span className="oferta-rating">
                            {of.Rating.toFixed(1)} &#9733;
                          </span>
                        )}
                        <span className="oferta-horario">
                          {of.Hora_Inicio?.substring(0, 5)} &mdash; {of.Hora_Fin?.substring(0, 5)}
                        </span>
                      </div>
                      <div className="oferta-nombre">{of.NOMBRE}</div>
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
              {loading ? 'Cargando...' : `Mostrando ${canchas.length} canchas cerca de ti`}
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
              <p>No encontramos canchas cerca de ti.</p>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>Prueba ampliando la b&uacute;squeda o revisa m&aacute;s tarde.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {canchas.map((cancha, i) => {
                const r = ratingRedondeado(cancha);
                const id = cancha.ID_CANCHA ?? cancha.ID_Cancha ?? i;
                return (
                  <Link
                    to={`/cancha/${getCanchaSlug(cancha)}`}
                    key={id}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="cancha-card">
                      <img className="cancha-card-img" src={fotoUrl(cancha)} alt={cancha.NOMBRE} loading="lazy" onError={imgError} />
                      <div className="cancha-card-body">
                        <div className="cancha-card-distrito">{cancha.Distrito}</div>
                        <div className="cancha-card-nombre">{cancha.NOMBRE}</div>
                        <div className="cancha-card-tipo">{cancha.DESCRIPCION || 'Cancha deportiva'}</div>
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
                      <div className="cancha-card-cta-visible"><span className="cta-text">Ver horarios</span></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
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