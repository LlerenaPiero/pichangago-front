import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';
import { useDebounce } from '../hooks/useDebounce';

const DISTRITOS = ['San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 'La Victoria', 'Chorrillos', 'San Borja', 'Miraflores', 'Magdalena del Mar', 'Barranco'];
const PRECIO_MAX = 200;

const Skeleton = () => (
    <div style={{ display: 'flex', gap: '20px', border: '1px solid #eee', borderRadius: '12px', padding: '16px', background: '#fff' }}>
        <div style={{ width: '200px', height: '140px', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <div style={{ height: '20px', width: '60%', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '14px', width: '40%', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '14px', width: '80%', background: '#f0f0f0', borderRadius: '4px', marginBottom: '12px' }} />
            <div style={{ height: '18px', width: '30%', background: '#f0f0f0', borderRadius: '4px' }} />
        </div>
    </div>
);

const SportIcon = ({ tipo }) => {
    if (!tipo) return '⚽';
    const t = tipo.toLowerCase();
    if (t.includes('fútbol') || t.includes('futbol')) return '⚽';
    if (t.includes('vóley') || t.includes('voley')) return '🏐';
    if (t.includes('tenis')) return '🎾';
    if (t.includes('básquet') || t.includes('basquet')) return '🏀';
    if (t.includes('frontón') || t.includes('fronton')) return '🎯';
    return '⚽';
};

const Buscar = () => {
    const [canchas, setCanchas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState({ nombre: '', distrito: '', precioMin: '', precioMax: '' });
    const [sortBy, setSortBy] = useState('');
    const [fetchVersion, setFetchVersion] = useState(0);
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
    }, [filtrosActivos, sortBy, fetchVersion]);

    const handleFilterChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const limpiarFiltros = () => {
        setFiltros({ nombre: '', distrito: '', precioMin: '', precioMax: '' });
        setSortBy('');
    };

    const fotoUrl = (cancha) => getImageUrl(cancha.Fotos?.[0]?.URL_Foto);

    return (
        <div style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ marginBottom: '28px' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '28px' }}>Encuentra tu Cancha Ideal ⚽</h2>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Explora canchas disponibles cerca de ti</p>
            </div>

            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '18px 20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label htmlFor="filtro-nombre" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#333' }}>Nombre</label>
                        <input id="filtro-nombre" type="text" placeholder="Ej: Los Olivos" value={filtros.nombre} onChange={e => handleFilterChange('nombre', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label htmlFor="filtro-distrito" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#333' }}>Distrito</label>
                        <select id="filtro-distrito" value={filtros.distrito} onChange={e => handleFilterChange('distrito', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}>
                            <option value="">Todos</option>
                            {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                        <label htmlFor="filtro-precioMin" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#333' }}>Precio min (S/)</label>
                        <input id="filtro-precioMin" type="number" min={0} max={PRECIO_MAX} placeholder="0" value={filtros.precioMin} onChange={e => handleFilterChange('precioMin', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                        <label htmlFor="filtro-precioMax" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#333' }}>Precio max (S/)</label>
                        <input id="filtro-precioMax" type="number" min={0} max={PRECIO_MAX} placeholder={String(PRECIO_MAX)} value={filtros.precioMax} onChange={e => handleFilterChange('precioMax', e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '13px' }} />
                    </div>
                    <div style={{ minWidth: '110px' }}>
                        <label htmlFor="filtro-sort" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px', color: '#333' }}>Ordenar</label>
                        <select id="filtro-sort" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}>
                            <option value="">Relevancia</option>
                            <option value="precio-asc">Precio: menor a mayor</option>
                            <option value="precio-desc">Precio: mayor a menor</option>
                            <option value="rating">Mejor calificados</option>
                            <option value="nombre">Nombre A-Z</option>
                        </select>
                    </div>
                    <button onClick={() => setFetchVersion(v => v + 1)} style={{ background: '#1e2530', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', height: '36px' }}>🔍 Buscar</button>
                    <button onClick={limpiarFiltros} style={{ background: '#eee', border: 'none', padding: '9px 14px', borderRadius: '6px', cursor: 'pointer', height: '36px', color: '#666', fontSize: '13px' }}>✕ Limpiar</button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} />)}
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'red' }}>❌ {error}</div>
            ) : canchas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</p>
                    <p style={{ fontSize: '18px', marginBottom: '4px' }}>No se encontraron canchas con esos filtros.</p>
                    <p style={{ fontSize: '13px', marginBottom: '16px', color: '#aaa' }}>Intentá con otros términos o limpiá los filtros.</p>
                    <button onClick={limpiarFiltros} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Limpiar filtros</button>
                </div>
            ) : (
                <>
                    <p style={{ color: '#888', marginBottom: '16px', fontSize: '13px' }}>{canchas.length} cancha(s) encontrada(s)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {canchas.map(cancha => (
                            <Link key={cancha.ID_Cancha} to={`/cancha/${cancha.ID_Cancha}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', gap: '20px', border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px', background: '#fff', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'pointer' }}
                                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    onFocus={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                    onBlur={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                    <div style={{ width: '180px', height: '130px', borderRadius: '8px', overflow: 'hidden', background: '#f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {cancha.Fotos?.[0]?.URL_Foto ? (
                                            <img src={fotoUrl(cancha)} alt={cancha.Nombre} width="180" height="130" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                        ) : (
                                            <span style={{ fontSize: '36px', opacity: 0.4 }}>{SportIcon({ tipo: cancha.Tipo_Deporte })}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                            <div>
                                                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#1e2530' }}>{SportIcon({ tipo: cancha.Tipo_Deporte })} {cancha.Nombre}</h3>
                                                <p style={{ margin: '0 0 2px 0', color: '#666', fontSize: '13px' }}>📍 {cancha.Direccion} — {cancha.Distrito}</p>
                                                <p style={{ margin: '0 0 6px 0', color: '#888', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{cancha.Descripcion || 'Cancha deportiva'}</p>
                                            </div>
                                            {cancha.Rating > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fffbeb', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fde68a', fontSize: '13px', fontWeight: 'bold', color: '#92400e', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                    ⭐ {cancha.Rating.toFixed(1)} <span style={{ fontWeight: 'normal', color: '#a16207', fontSize: '11px' }}>({cancha.TotalReviews})</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#00b48a' }}>S/ {cancha.Precio_Base?.toFixed(2)} <span style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>/ hora</span></span>
                                            {cancha.Precio_Baja && cancha.Precio_Baja !== cancha.Precio_Base && <span style={{ fontSize: '12px', color: '#888' }}>🌅 Baja: S/ {Number(cancha.Precio_Baja).toFixed(2)}</span>}
                                            {cancha.Precio_Prime && cancha.Precio_Prime !== cancha.Precio_Base && <span style={{ fontSize: '12px', color: '#888' }}>⭐ Prime: S/ {Number(cancha.Precio_Prime).toFixed(2)}</span>}
                                            {cancha.Fotos?.length > 1 && <span style={{ fontSize: '12px', color: '#888' }}>📷 {cancha.Fotos.length}</span>}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Buscar;
