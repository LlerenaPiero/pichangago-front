import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';
import { useDebounce } from '../hooks/useDebounce';

const DISTRITOS = ['San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 'La Victoria', 'Chorrillos', 'San Borja', 'Miraflores', 'Magdalena del Mar', 'Barranco'];
const TIPOS = ['Fútbol 5', 'Fútbol 6', 'Fútbol 7', 'Fútbol 8', 'Fútbol 11'];

const hoy = () => new Date().toISOString().split('T')[0];

const horas = () => {
  const h = [];
  for (let i = 6; i <= 23; i++) {
    h.push(`${String(i).padStart(2, '0')}:00`);
  }
  return h;
};

const Skeleton = () => (
  <div className="list-card-skeleton">
    <div className="skeleton-img" />
    <div className="skeleton-body">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-40" />
      <div className="skeleton-line w-80" />
      <div className="skeleton-line w-30" />
    </div>
  </div>
);

const Buscar = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    nombre: '', distrito: '', precioMax: '', fecha: hoy(), hora: '', tipo: ''
  });
  const [sortBy, setSortBy] = useState('');
  const mountedRef = useRef(true);

  const debouncedFiltros = useDebounce(filtros, 300);
  const filtrosActivos = useMemo(() => debouncedFiltros, [debouncedFiltros]);

  useEffect(() => {
    mountedRef.current = true;
    const cargar = async () => {
      setLoading(true);
      setError('');
      const res = await canchaService.listarCanchas(filtrosActivos);
      if (!mountedRef.current) return;
      if (res.status === 'success') {
        let data = res.data;
        if (sortBy === 'precio-asc') data.sort((a, b) => a.Precio_Base - b.Precio_Base);
        if (sortBy === 'precio-desc') data.sort((a, b) => b.Precio_Base - a.Precio_Base);
        if (sortBy === 'rating') data.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
        if (sortBy === 'nombre') data.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        setCanchas(data);
      } else {
        setError(res.error || 'Error al cargar canchas.');
      }
      setLoading(false);
    };
    cargar();
    return () => { mountedRef.current = false; };
  }, [filtrosActivos, sortBy]);

  const handleFilterChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', distrito: '', precioMax: '', fecha: hoy(), hora: '', tipo: '' });
    setSortBy('');
  };

  const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_Foto);

  const tieneFiltrosActivos = () => {
    return filtros.nombre || filtros.distrito || filtros.precioMax || filtros.hora || filtros.tipo;
  };

  const ratingRedondeado = (r) => {
    if (!r || r <= 0) return null;
    return Math.round(r * 10) / 10;
  };

  return (
    <div className="buscar-page">
      <h1 className="buscar-h1">Busca canchas disponibles</h1>
      <p className="buscar-sub">Encuentra cancha para jugar hoy, a la hora que quieras</p>

      {/* Filtros */}
      <div className="buscar-filtros">
        <div className="buscar-filtros-grid">
          <div className="buscar-field">
            <label htmlFor="f-nombre">Buscar</label>
            <input id="f-nombre" type="text" placeholder="Cancha, distrito o dirección" value={filtros.nombre} onChange={e => handleFilterChange('nombre', e.target.value)} />
          </div>
          <div className="buscar-field">
            <label htmlFor="f-distrito">Distrito</label>
            <select id="f-distrito" value={filtros.distrito} onChange={e => handleFilterChange('distrito', e.target.value)}>
              <option value="">Todos</option>
              {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-fecha">Fecha</label>
            <input id="f-fecha" type="date" value={filtros.fecha} onChange={e => handleFilterChange('fecha', e.target.value)} />
          </div>
          <div className="buscar-field">
            <label htmlFor="f-hora">Hora</label>
            <select id="f-hora" value={filtros.hora} onChange={e => handleFilterChange('hora', e.target.value)}>
              <option value="">Cualquier hora</option>
              {horas().map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-tipo">Tipo de cancha</label>
            <select id="f-tipo" value={filtros.tipo} onChange={e => handleFilterChange('tipo', e.target.value)}>
              <option value="">Todos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-precioMax">Precio máx (S/)</label>
            <input id="f-precioMax" type="number" min={0} placeholder="200" value={filtros.precioMax} onChange={e => handleFilterChange('precioMax', e.target.value)} />
          </div>
          <div className="buscar-field">
            <label htmlFor="f-sort">Ordenar</label>
            <select id="f-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Recomendadas</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="rating">Mejor valoradas</option>
              <option value="nombre">Nombre A-Z</option>
            </select>
          </div>
          {tieneFiltros() && (
            <button className="buscar-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="buscar-skeleton-list">
          {[1, 2, 3].map(i => <Skeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="buscar-empty">❌ {error}</div>
      ) : canchas.length === 0 ? (
        <div className="buscar-empty">
          <p className="buscar-empty-icon">🔍</p>
          <p className="buscar-empty-title">No encontramos canchas con esos filtros</p>
          <p className="buscar-empty-desc">Probá cambiar el horario, el distrito o ampliar el presupuesto.</p>
          <button className="buscar-empty-btn" onClick={limpiarFiltros}>Restablecer filtros</button>
        </div>
      ) : (
        <>
          <p className="buscar-resultados-count">
            {canchas.length} {canchas.length === 1 ? 'cancha disponible' : 'canchas disponibles'}
            {filtros.distrito ? ` en ${filtros.distrito}` : ''}
            {filtros.hora ? ` para las ${filtros.hora}` : ''}
          </p>
          <div className="buscar-lista">
            {canchas.map(cancha => {
              const r = ratingRedondeado(cancha.Rating);
              return (
                <Link key={cancha.ID_Cancha} to={`/cancha/${cancha.ID_Cancha}`} className="buscar-card-link">
                  <article className="buscar-card">
                    <div className="buscar-card-img">
                      {cancha.Fotos?.[0]?.URL_Foto ? (
                        <img src={fotoUrl(cancha)} alt={cancha.Nombre} loading="lazy" />
                      ) : (
                        <span className="buscar-card-icon">⚽</span>
                      )}
                    </div>
                    <div className="buscar-card-body">
                      <div className="buscar-card-header">
                        <div>
                          <h3 className="buscar-card-nombre">{cancha.Nombre}</h3>
                          <p className="buscar-card-ubicacion">
                            {cancha.Direccion} — {cancha.Distrito}
                          </p>
                          <div className="buscar-card-tags">
                            {(cancha.Descripcion || cancha.Tipo_Deporte) && (
                              <span className="tag tag-gray">
                                {cancha.Descripcion || cancha.Tipo_Deporte}
                              </span>
                            )}
                            {cancha.Precio_Baja && cancha.Precio_Baja !== cancha.Precio_Base && (
                              <span className="tag tag-green">Hora valle: S/ {Number(cancha.Precio_Baja).toFixed(2)}</span>
                            )}
                            {cancha.Precio_Prime && cancha.Precio_Prime !== cancha.Precio_Base && (
                              <span className="tag tag-amber">Hora punta: S/ {Number(cancha.Precio_Prime).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        {r !== null && (
                          <div className="buscar-card-rating">
                            {r.toFixed(1)} <span className="rating-star">&#9733;</span>
                            {cancha.TotalReviews > 0 && (
                              <span className="rating-count">({cancha.TotalReviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="buscar-card-footer">
                        <div className="buscar-card-precio">
                          S/ {Number(cancha.Precio_Base).toFixed(2)}
                          <small>/ hora</small>
                        </div>
                        <div className="buscar-card-actions">
                          <span className="buscar-card-btn">Ver horarios</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Buscar;