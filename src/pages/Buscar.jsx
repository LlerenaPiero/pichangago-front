import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl, FALLBACK_IMG } from '../utils/imageUrl';
import { useDebounce } from '../hooks/useDebounce';
import { getCanchaSlug } from '../utils/slugify';

const ITEMS_POR_PAGINA = 10;

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'F5', label: 'Fútbol 5' },
  { value: 'F6', label: 'Fútbol 6' },
  { value: 'F7', label: 'Fútbol 7' },
  { value: 'F8', label: 'Fútbol 8' },
  { value: 'F11', label: 'Fútbol 11' },
];

const SUPERFICIES = [
  { value: '', label: 'Todas' },
  { value: 'GRASS_SINTETICO', label: 'Césped sintético' },
  { value: 'GRASS_NATURAL', label: 'Césped natural' },
];

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

const superficieLabel = (val) => {
  const s = SUPERFICIES.find(s => s.value === val);
  return s ? s.label : val;
};

const Buscar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    nombre: searchParams.get('nombre') || '',
    departamento: searchParams.get('departamento') || '',
    provincia: searchParams.get('provincia') || '',
    distrito: searchParams.get('distrito') || '',
    precioMax: searchParams.get('precioMax') || '',
    fecha: searchParams.get('fecha') || hoy(),
    hora: searchParams.get('hora') || '',
    tipo: searchParams.get('tipo') || '',
    superficie: searchParams.get('superficie') || '',
    techada: searchParams.get('techada') || '',
    iluminacion: searchParams.get('iluminacion') || ''
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [distritos, setDistritos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [pagina, setPagina] = useState(1);
  const mountedRef = useRef(true);

  const debouncedFiltros = useDebounce(filtros, 300);
  const filtrosActivos = useMemo(() => debouncedFiltros, [debouncedFiltros]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await canchaService.obtenerDepartamentos();
      if (cancelled) return;
      if (res.status === 'success' && Array.isArray(res.data)) {
        setDepartamentos(res.data.map(d => {
          if (typeof d === 'string') return d;
          return d.Departamento || d.NOMBRE || d.Nombre || d.DEPARTAMENTO || d.departamento || '';
        }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!filtros.departamento) {
      setProvincias([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await canchaService.obtenerProvincias(filtros.departamento);
      if (cancelled) return;
      if (res.status === 'success' && Array.isArray(res.data)) {
        setProvincias(res.data.map(d => {
          if (typeof d === 'string') return d;
          return d.Provincia || d.NOMBRE || d.Nombre || d.PROVINCIA || d.provincia || '';
        }));
      }
    })();
    return () => { cancelled = true; };
  }, [filtros.departamento]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await canchaService.obtenerDistritos(
        filtros.departamento || undefined,
        filtros.provincia || undefined
      );
      if (cancelled) return;
      if (res.status === 'success' && Array.isArray(res.data)) {
        setDistritos(res.data.map(d => {
          if (typeof d === 'string') return d;
          return d.Distrito || d.NOMBRE || d.Nombre || d.DISTRITO || d.distrito || '';
        }));
      }
    })();
    return () => { cancelled = true; };
  }, [filtros.departamento, filtros.provincia]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(debouncedFiltros).forEach(([k, v]) => { if (v) params.set(k, v); });
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [debouncedFiltros, sortBy, setSearchParams]);

  useEffect(() => {
    mountedRef.current = true;
    setPagina(1);
    const cargar = async () => {
      setLoading(true);
      setError('');
      const res = await canchaService.listarCanchas(filtrosActivos);
      if (!mountedRef.current) return;
      if (res.status === 'success' && Array.isArray(res.data)) {
        let data = res.data;
        if (sortBy === 'precio-asc') data.sort((a, b) => a.Precio_Base - b.Precio_Base);
        if (sortBy === 'precio-desc') data.sort((a, b) => b.Precio_Base - a.Precio_Base);
        if (sortBy === 'rating') data.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
        if (sortBy === 'nombre') data.sort((a, b) => (a.NOMBRE || '').localeCompare(b.NOMBRE || ''));
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
    setFiltros(prev => {
      const nuevos = { ...prev, [campo]: valor };
      if (campo === 'departamento' && valor !== prev.departamento) {
        nuevos.provincia = '';
        nuevos.distrito = '';
      }
      if (campo === 'provincia' && valor !== prev.provincia) {
        nuevos.distrito = '';
      }
      return nuevos;
    });
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: '', departamento: '', provincia: '', distrito: '', precioMax: '', fecha: hoy(), hora: '', tipo: '', superficie: '', techada: '', iluminacion: '' });
    setSortBy('');
  };

  const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_FOTO);
  const imgError = (e) => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; };

  const tieneFiltrosActivos = () => {
    return filtros.nombre || filtros.departamento || filtros.provincia || filtros.distrito || filtros.precioMax || filtros.hora || filtros.tipo || filtros.superficie || filtros.techada || filtros.iluminacion;
  };

  const ratingRedondeado = (r) => {
    if (!r || r <= 0) return null;
    return Math.round(r * 10) / 10;
  };

  const canchasPagina = canchas.slice(0, pagina * ITEMS_POR_PAGINA);
  const hayMas = canchasPagina.length < canchas.length;

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
            <label htmlFor="f-departamento">Departamento</label>
            <select id="f-departamento" value={filtros.departamento} onChange={e => handleFilterChange('departamento', e.target.value)}>
              <option value="">Todos</option>
              {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-provincia">Provincia</label>
            <select id="f-provincia" value={filtros.provincia} onChange={e => handleFilterChange('provincia', e.target.value)}>
              <option value="">{filtros.departamento ? 'Todas' : 'Primero elija departamento'}</option>
              {provincias.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-distrito">Distrito</label>
            <select id="f-distrito" value={filtros.distrito} onChange={e => handleFilterChange('distrito', e.target.value)}>
              <option value="">Todos</option>
              {distritos.map(d => <option key={d} value={d}>{d}</option>)}
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
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-superficie">Superficie</label>
            <select id="f-superficie" value={filtros.superficie} onChange={e => handleFilterChange('superficie', e.target.value)}>
              {SUPERFICIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-techada">Techada</label>
            <select id="f-techada" value={filtros.techada} onChange={e => handleFilterChange('techada', e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="buscar-field">
            <label htmlFor="f-iluminacion">Iluminación</label>
            <select id="f-iluminacion" value={filtros.iluminacion} onChange={e => handleFilterChange('iluminacion', e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
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
          {tieneFiltrosActivos() && (
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
            {canchasPagina.map((cancha, i) => {
              const r = ratingRedondeado(cancha.Rating);
              const id = cancha.ID_CANCHA ?? cancha.ID_Cancha ?? i;
              return (
                <Link key={id} to={`/cancha/${getCanchaSlug(cancha)}`} className="buscar-card-link">
                  <article className="buscar-card">
                    <div className="buscar-card-img">
                      {cancha.Fotos?.[0]?.URL_FOTO ? (
                        <img src={fotoUrl(cancha)} alt={cancha.NOMBRE} loading="lazy" onError={imgError} />
                      ) : (
                        <span className="buscar-card-icon">⚽</span>
                      )}
                    </div>
                    <div className="buscar-card-body">
                      <div className="buscar-card-header">
                        <div>
                          <h3 className="buscar-card-nombre">{cancha.NOMBRE}</h3>
                          <p className="buscar-card-ubicacion">
                            {cancha.Direccion} — {cancha.Distrito}
                          </p>
                          <div className="buscar-card-tags">
                            {cancha.TipoNombre && (
                              <span className="tag tag-prime">{cancha.TipoNombre}</span>
                            )}
                            {cancha.TIPO_SUPERFICIE && (
                              <span className="tag tag-green">{superficieLabel(cancha.TIPO_SUPERFICIE)}</span>
                            )}
                            {cancha.ES_TECHADA && (
                              <span className="tag tag-blue">Techada</span>
                            )}
                            {cancha.TIENE_ILUMINACION && (
                              <span className="tag tag-amber">Iluminación</span>
                            )}
                            {cancha.Precio_Baja && cancha.Precio_Baja !== cancha.Precio_Base && (
                              <span className="tag tag-green">Valle: S/ {Number(cancha.Precio_Baja).toFixed(0)}</span>
                            )}
                            {cancha.Precio_Prime && cancha.Precio_Prime !== cancha.Precio_Base && (
                              <span className="tag tag-amber">Punta: S/ {Number(cancha.Precio_Prime).toFixed(0)}</span>
                            )}
                          </div>
                          {cancha.DueñoNombre && (
                            <p className="buscar-card-contacto">
                              👤 {cancha.DueñoNombre} {cancha.DueñoApellido}
                              {cancha.DueñoTelefono && ` · 📱 ${cancha.DueñoTelefono}`}
                            </p>
                          )}
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
          {hayMas && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setPagina(p => p + 1)}>
                Mostrar m&aacute;s canchas ({canchas.length - canchasPagina.length} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Buscar;