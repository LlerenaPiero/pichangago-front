import { useState, useEffect } from 'react';
import { localService } from '../../services/localService';
import { formatValidationErrors } from '../../utils/validationErrors';

const DISTRITOS_LIMA = ['San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 'La Victoria', 'Chorrillos', 'San Borja', 'Miraflores', 'Magdalena del Mar', 'Barranco'];

export default function GestionLocales({ onMensaje }) {
    const [locales, setLocales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState({ nombre: '', direccion: '', distrito: 'San Juan de Miraflores', referencia: '' });
    const [enviando, setEnviando] = useState(false);

    const cargarLocales = async () => {
        setLoading(true);
        const res = await localService.listarMisLocales();
        if (res.status === 'success') {
            setLocales(res.data || []);
        } else {
            setLocales([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        let ignore = false;
        (async () => {
            setLoading(true);
            const res = await localService.listarMisLocales();
            if (ignore) return;
            if (res.status === 'success') setLocales(res.data || []);
            setLoading(false);
        })();
        return () => { ignore = true; };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        const datos = { ...form };
        const res = editandoId
            ? await localService.editarLocal(editandoId, datos)
            : await localService.registrarLocal(datos);
        setEnviando(false);
        if (res.status === 'success') {
            onMensaje(editandoId ? '✏️ Local actualizado con éxito.' : '🏠 Local registrado con éxito.');
            setMostrarForm(false);
            setEditandoId(null);
            setForm({ nombre: '', direccion: '', distrito: 'San Juan de Miraflores', referencia: '' });
            cargarLocales();
        } else {
            onMensaje(`❌ ${formatValidationErrors(res)}`);
        }
    };

    const abrirEditar = async (idLocal) => {
        const res = await localService.obtenerDetalleLocal(idLocal);
        if (res.status === 'success' && res.data) {
            const d = res.data;
            setForm({ nombre: d.Nombre || '', direccion: d.Direccion || '', distrito: d.Distrito || 'San Juan de Miraflores', referencia: d.Referencia || '' });
            setEditandoId(idLocal);
            setMostrarForm(true);
        } else {
            onMensaje('❌ Error al cargar detalle del local.');
        }
    };

    const cerrarForm = () => {
        setMostrarForm(false);
        setEditandoId(null);
        setForm({ nombre: '', direccion: '', distrito: 'San Juan de Miraflores', referencia: '' });
    };

    if (loading) return <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Cargando locales...</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>🏢 Mis Locales ({locales.length})</h3>
                <button onClick={() => { setMostrarForm(true); setEditandoId(null); setForm({ nombre: '', direccion: '', distrito: 'San Juan de Miraflores', referencia: '' }); }} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Nuevo Local</button>
            </div>

            {locales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h4>Aún no tienes locales registrados.</h4>
                    <p style={{ color: 'gray' }}>Registra un local (complejo deportivo) para luego asociar tus canchas.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {locales.map((loc) => (
                        <div key={loc.ID_Local} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>🏢 {loc.Nombre}</h4>
                                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>📍 {loc.Direccion} - {loc.Distrito}</p>
                                    {loc.Referencia && <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '13px' }}>📍 Ref: {loc.Referencia}</p>}
                                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', background: loc.Estado === 'ACTIVO' ? '#d4edda' : '#fee2e2', color: loc.Estado === 'ACTIVO' ? 'green' : 'red', fontWeight: 'bold' }}>{loc.Estado}</span>
                                </div>
                                <button onClick={() => abrirEditar(loc.ID_Local)} style={{ background: '#1e2530', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>✏️ Editar</button>
                            </div>
                            {loc.Canchas && loc.Canchas.length > 0 && (
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                                    <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>🏟️ Canchas asociadas ({loc.Canchas.length}):</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {loc.Canchas.map((c, i) => (
                                            <span key={c.ID_Cancha || i} style={{ padding: '4px 10px', borderRadius: '4px', background: '#f0f0f0', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                🏟️ {c.CanchaNombre || c.Nombre}
                                                <span style={{ fontSize: '10px', color: c.CanchaEstado === 'DISPONIBLE' ? 'green' : 'red' }}>({c.CanchaEstado || c.Estado})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {mostrarForm && (
                <div role="dialog" aria-modal="true" aria-label={editandoId ? 'Editar local' : 'Registrar local'} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
                        <h3>{editandoId ? '✏️ Editar Local' : '🏗️ Registrar Local'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="loc-nombre">📌 Nombre del Local:</label>
                                <input id="loc-nombre" type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{ width: '100%', padding: '6px', marginTop: '4px' }} placeholder="Ej: Complejo Deportivo Los Olivos" />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="loc-direccion">🏠 Dirección:</label>
                                <input id="loc-direccion" type="text" required value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} style={{ width: '100%', padding: '6px', marginTop: '4px' }} placeholder="Av./Calle y número" />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="loc-distrito">📍 Distrito:</label>
                                <select id="loc-distrito" value={form.distrito} onChange={e => setForm({...form, distrito: e.target.value})} style={{ width: '100%', padding: '6px', marginTop: '4px' }}>
                                    {DISTRITOS_LIMA.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label htmlFor="loc-referencia">📍 Referencia (opcional):</label>
                                <input id="loc-referencia" type="text" value={form.referencia} onChange={e => setForm({...form, referencia: e.target.value})} style={{ width: '100%', padding: '6px', marginTop: '4px' }} placeholder="Altura de la Av. Panamericana" />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={cerrarForm} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" disabled={enviando} style={{ background: enviando ? '#ccc' : '#00b48a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: enviando ? 'not-allowed' : 'pointer' }}>
                                    {enviando ? 'Guardando...' : (editandoId ? '💾 Guardar Cambios' : 'Guardar')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
