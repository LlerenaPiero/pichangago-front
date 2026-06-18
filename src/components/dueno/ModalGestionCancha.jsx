import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';
import { getImageUrl } from '../../utils/imageUrl';
import { generarBloquesHorarios } from '../../utils/horarios';
import { formatValidationErrors } from '../../utils/validationErrors';
import ConfirmDialog from '../ConfirmDialog';

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const GRID_COLUMNAS = [
    { dia: 1, label: 'Lun' }, { dia: 2, label: 'Mar' }, { dia: 3, label: 'Mié' },
    { dia: 4, label: 'Jue' }, { dia: 5, label: 'Vie' }, { dia: 6, label: 'Sáb' },
    { dia: 0, label: 'Dom' },
];
const HORAS = generarBloquesHorarios('06:00', '23:00').map(b => b.horaInicio);

const extraerHora = (fechaStr) => {
    if (!fechaStr) return '';
    const match = fechaStr.match(/T(\d{2}:\d{2})/) || fechaStr.match(/\s(\d{2}:\d{2})/);
    return match ? match[1] : fechaStr.substring(0, 5);
};

export default function ModalGestionCancha({ canchaId, onCerrar, onMensaje, onActualizar }) {
    const [gestionSubTab, setGestionSubTab] = useState('info');
    const [gestionandoCancha, setGestionandoCancha] = useState(null);
    const [editandoCancha, setEditandoCancha] = useState(null);
    const [editFotoFile, setEditFotoFile] = useState(null);
    const [gridState, setGridState] = useState({});
    const [horariosExistentes, setHorariosExistentes] = useState([]);
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [mensajeHorario, setMensajeHorario] = useState('');
    const [qfDays, setQfDays] = useState([1, 2, 3, 4, 5]);
    const [qfDesde, setQfDesde] = useState('08:00');
    const [qfHasta, setQfHasta] = useState('18:00');
    const [qfTipoPrecio, setQfTipoPrecio] = useState('BASE');
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [confirmEliminar, setConfirmEliminar] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const abrirGestionCancha = async (idCancha) => {
        const detalle = await duenoService.obtenerDetalleCancha(idCancha);
        if (detalle.status !== 'success') {
            onMensaje('❌ No se pudo cargar la cancha.');
            return;
        }
        const data = detalle.data;
        const base = {
            _id: data.ID_Cancha,
            _nombre: data.Nombre || '',
            _fotos: data.Fotos || []
        };
        setGestionandoCancha(base);
        setGestionSubTab('info');
        setEditandoCancha({
            _id: data.ID_Cancha,
            _fotos: data.Fotos || [],
            _localNombre: data.LocalNombre || data.Nombre || '',
            _localDireccion: data.LocalDireccion || data.Direccion || '',
            _localDistrito: data.LocalDistrito || data.Distrito || '',
            nombre: data.Nombre || '',
            descripcion: data.Descripcion || '',
            precioBase: data.Precio_Base || '',
            precioPrime: data.Precio_Prime || '',
            precioBaja: data.Precio_Baja || ''
        });
        setEditFotoFile(null);
        setGridState({});
        setHorariosExistentes([]);
        setMensajeHorario('');
    };

    const cargarHorariosExistentes = async (idCancha) => {
        setCargandoHorarios(true);
        try {
            const res = await duenoService.obtenerHorariosCancha(idCancha);
            setHorariosExistentes(res.status === 'success' && res.data ? res.data : []);
        } catch {
            setHorariosExistentes([]);
        } finally {
            setCargandoHorarios(false);
        }
    };

    const cargarReviews = async (idCancha) => {
        setReviewsLoading(true);
        try {
            const res = await duenoService.obtenerReviewsCancha(idCancha);
            setReviews(res.status === 'success' && res.data ? res.data : { reviews: [], total_reviews: 0, promedio: 0 });
        } catch {
            setReviews({ reviews: [], total_reviews: 0, promedio: 0 });
        } finally {
            setReviewsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (canchaId) abrirGestionCancha(canchaId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canchaId]);

    useEffect(() => {
        if (gestionSubTab === 'horarios' && gestionandoCancha) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            cargarHorariosExistentes(gestionandoCancha._id);
        }
        if (gestionSubTab === 'reviews' && gestionandoCancha) {
            cargarReviews(gestionandoCancha._id);
        }
    }, [gestionSubTab, gestionandoCancha]);

    useEffect(() => {
        if (horariosExistentes.length > 0) {
            const map = {};
            horariosExistentes.forEach(h => {
                const dia = h.Dia_Semana !== undefined ? h.Dia_Semana : 0;
                const hora = extraerHora(h.Fecha_Inicio || h.Hora_Inicio);
                if (hora && h.Estado !== 'INACTIVO') {
                    const horaFin = extraerHora(h.Fecha_Fin || h.Hora_Fin);
                    const [hh, mm] = hora.split(':').map(Number);
                    map[`${dia}:${hora}`] = {
                        diaSemana: dia,
                        horaInicio: hora,
                        horaFin: horaFin || `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
                        tipoPrecio: h.Tipo_Precio || 'BASE'
                    };
                }
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGridState(map);
        } else {
            setGridState({});
        }
    }, [horariosExistentes]);

    const toggleCell = (diaSemana, horaInicio) => {
        if (guardando) return;
        const key = `${diaSemana}:${horaInicio}`;
        setGridState(prev => {
            const updated = { ...prev };
            const cell = updated[key];
            if (!cell) {
                const [hh, mm] = horaInicio.split(':').map(Number);
                updated[key] = { diaSemana, horaInicio, horaFin: `${String(hh + 1).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, tipoPrecio: 'BASE' };
            } else if (cell.tipoPrecio === 'BASE') {
                updated[key] = { ...cell, tipoPrecio: 'PRIME' };
            } else if (cell.tipoPrecio === 'PRIME') {
                updated[key] = { ...cell, tipoPrecio: 'BAJA' };
            } else {
                delete updated[key];
            }
            return updated;
        });
    };

    const handleQuickFill = (days, desde, hasta, tipoPrecio) => {
        if (guardando) return;
        if (desde >= hasta) return setMensajeHorario('⚠️ La hora de inicio debe ser menor que la de fin.');
        const bloques = generarBloquesHorarios(desde, hasta);
        setGridState(prev => {
            const updated = { ...prev };
            days.forEach(dia => {
                bloques.forEach(b => {
                    const key = `${dia}:${b.horaInicio}`;
                    updated[key] = { diaSemana: dia, horaInicio: b.horaInicio, horaFin: b.horaFin, tipoPrecio };
                });
            });
            return updated;
        });
        setMensajeHorario(`✅ ${bloques.length} bloques × ${days.length} días = ${bloques.length * days.length} bloques agregados.`);
    };

    const toggleQfDay = (dia) => {
        setQfDays(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
    };

    const handleEditarCanchaSubmit = async (e) => {
        e.preventDefault();
        const datos = {
            nombre: editandoCancha.nombre,
            descripcion: editandoCancha.descripcion,
            precioBase: editandoCancha.precioBase,
            precioPrime: editandoCancha.precioPrime || editandoCancha.precioBase,
            precioBaja: editandoCancha.precioBaja || editandoCancha.precioBase
        };
        const res = await duenoService.editarCancha(editandoCancha._id, datos, editFotoFile);
        if (res.status === 'success') {
            onMensaje('✏️ ¡Cancha actualizada!');
            abrirGestionCancha(editandoCancha._id);
            onActualizar();
        } else {
            onMensaje(`❌ ${formatValidationErrors(res)}`);
        }
    };

    const eliminarFotoCancha = async (idFoto) => {
        const res = await duenoService.eliminarFoto(idFoto);
        if (res.status === 'success') {
            onMensaje('🗑️ Foto eliminada.');
            abrirGestionCancha(editandoCancha._id);
            onActualizar();
        } else {
            onMensaje(`❌ ${formatValidationErrors(res)}`);
        }
        setConfirmEliminar(null);
    };

    const guardarHorarios = async () => {
        const horarios = Object.values(gridState);
        if (horarios.length === 0) return setMensajeHorario('⚠️ Selecciona al menos un bloque en la tabla.');
        const idCancha = gestionandoCancha?._id;
        if (!idCancha) return;
        setGuardando(true);
        setMensajeHorario('');
        try {
            console.log('[Horarios] Enviando:', JSON.stringify(horarios));
            const res = await duenoService.configurarHorariosTarifas(idCancha, horarios);
            console.log('[Horarios] Respuesta:', JSON.stringify(res));
            if (res.status === 'success') {
                console.log('[Horarios] Generando slots...');
                const slotsRes = await duenoService.generarSlotsDesdeHorarios(idCancha);
                console.log('[Horarios] Slots generados:', JSON.stringify(slotsRes));
                if (slotsRes.status === 'success') {
                    onMensaje('📅 ¡Horarios guardados y slots generados!');
                } else {
                    onMensaje('📅 Horarios guardados. ⚠️ No se pudieron generar los slots. Contacta al administrador.');
                }
                onActualizar();
                onCerrar();
                return;
            }
            setMensajeHorario(res.error || 'Error al guardar horarios.');
        } catch (err) {
            console.error('[Horarios] Error:', err);
            setMensajeHorario('Error al guardar horarios.');
        }
        setGuardando(false);
    };

    if (!gestionandoCancha) return null;

    return (
        <div role="dialog" aria-modal="true" aria-label={`Gestionar ${gestionandoCancha._nombre}`} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', padding: '28px 28px 20px', borderRadius: '16px', maxWidth: gestionSubTab === 'horarios' ? '900px' : '680px', width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>⚙️ {gestionandoCancha._nombre}</h3>
                    <button onClick={onCerrar} aria-label="Cerrar" style={{ background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', color: '#666', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✕</button>
                </div>

                <div role="tablist" aria-label="Opciones de gestión" style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '22px', gap: '4px', flexWrap: 'wrap' }}>
                    {['info', 'horarios', 'fotos', 'reviews'].map(tab => (
                        <button key={tab} role="tab" aria-selected={gestionSubTab === tab} onClick={() => setGestionSubTab(tab)}
                            style={{
                                padding: '10px 18px', background: gestionSubTab === tab ? '#f0fdfa' : 'transparent',
                                border: 'none', borderBottom: gestionSubTab === tab ? '3px solid #00b48a' : '3px solid transparent',
                                fontWeight: gestionSubTab === tab ? 'bold' : '500',
                                cursor: 'pointer', color: gestionSubTab === tab ? '#00b48a' : '#666',
                                fontSize: '14px', borderRadius: '6px 6px 0 0', transition: 'all 0.15s'
                            }}>
                            {tab === 'info' ? '✏️ Información' : tab === 'horarios' ? '📅 Horarios' : tab === 'fotos' ? '📷 Fotos' : '⭐ Reviews'}
                        </button>
                    ))}
                </div>

                {/* SUBTAB: INFORMACIÓN */}
                {gestionSubTab === 'info' && editandoCancha && (
                    <form onSubmit={handleEditarCanchaSubmit}>
                        <div style={{ marginBottom: '14px', padding: '12px 14px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #00b48a33' }}>
                            <strong style={{ fontSize: '13px', color: '#00b48a' }}>🏢 {editandoCancha._localNombre}</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>📍 {editandoCancha._localDireccion} - {editandoCancha._localDistrito}</p>
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label htmlFor="edit-nombre" style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: '#333' }}>📌 Nombre de la cancha</label>
                            <input id="edit-nombre" type="text" required value={editandoCancha.nombre} onChange={e => setEditandoCancha({ ...editandoCancha, nombre: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', outline: 'none' }} />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label htmlFor="edit-descripcion" style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: '4px', color: '#333' }}>📝 Descripción (opcional)</label>
                            <input id="edit-descripcion" type="text" value={editandoCancha.descripcion} onChange={e => setEditandoCancha({ ...editandoCancha, descripcion: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', outline: 'none' }} />
                        </div>
                        <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#333', marginBottom: '12px' }}>💰 Precios</p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '110px' }}>
                                    <label htmlFor="edit-precioBase" style={{ display: 'block', fontWeight: 600, fontSize: '12px', marginBottom: '3px', color: '#555' }}>Base</label>
                                    <input id="edit-precioBase" type="number" min={1} required value={editandoCancha.precioBase} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setEditandoCancha({ ...editandoCancha, precioBase: e.target.value })}
                                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', fontWeight: 'bold', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '110px' }}>
                                    <label htmlFor="edit-precioPrime" style={{ display: 'block', fontWeight: 600, fontSize: '12px', marginBottom: '3px', color: '#555' }}>Prime</label>
                                    <input id="edit-precioPrime" type="number" min={1} value={editandoCancha.precioPrime} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setEditandoCancha({ ...editandoCancha, precioPrime: e.target.value })}
                                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', fontWeight: 'bold', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '110px' }}>
                                    <label htmlFor="edit-precioBaja" style={{ display: 'block', fontWeight: 600, fontSize: '12px', marginBottom: '3px', color: '#555' }}>Baja</label>
                                    <input id="edit-precioBaja" type="number" min={1} value={editandoCancha.precioBaja} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setEditandoCancha({ ...editandoCancha, precioBaja: e.target.value })}
                                        style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', fontWeight: 'bold', outline: 'none' }} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '14px' }}>💾 Guardar Cambios</button>
                    </form>
                )}

                {/* SUBTAB: HORARIOS */}
                {gestionSubTab === 'horarios' && (
                    <div>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Selecciona los bloques que quieras activar. Haz clic en cada celda para activar/desactivar o cambiar la tarifa.</p>
                        <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px', padding: '8px 12px', background: '#f0fdfa', borderRadius: '6px', border: '1px solid #6ee7b7' }}> Los horarios se aplican de forma semanal recurrente. Cada bloque se repite automáticamente todas las semanas.</p>
                        {mensajeHorario && <p style={{ color: mensajeHorario.includes('⚠') ? '#d32f2f' : '#2e7d32', fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>{mensajeHorario}</p>}

                        {cargandoHorarios ? (
                            <p style={{ color: '#999', marginBottom: '15px' }}>Cargando horarios...</p>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                {guardando && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, borderRadius: '8px' }}>
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <div className="loader" style={{ borderColor: '#00b48a33', borderTopColor: '#00b48a', width: '32px', height: '32px', borderWidth: '3px', margin: '0 auto 12px' }} />
                                            <p style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>Guardando horarios...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Quick Fill */}
                                <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Rellenado rápido</h4>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                        <button disabled={guardando} onClick={() => handleQuickFill([1, 2, 3, 4, 5], '08:00', '18:00', 'BASE')} style={{ background: guardando ? '#ccc' : '#e8f5e9', border: `1px solid ${guardando ? '#bbb' : '#4caf50'}`, borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: guardando ? '#999' : '#2e7d32' }}>Lun-Vie 8-18 Base</button>
                                        <button disabled={guardando} onClick={() => handleQuickFill([6, 0], '09:00', '22:00', 'PRIME')} style={{ background: guardando ? '#ccc' : '#e3f2fd', border: `1px solid ${guardando ? '#bbb' : '#2196f3'}`, borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: guardando ? '#999' : '#1565c0' }}>Sáb-Dom 9-22 Prime</button>
                                        <button disabled={guardando} onClick={() => handleQuickFill([1, 2, 3, 4, 5, 6, 0], '06:00', '12:00', 'BAJA')} style={{ background: guardando ? '#ccc' : '#fff3e0', border: `1px solid ${guardando ? '#bbb' : '#ff9800'}`, borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: guardando ? '#999' : '#e65100' }}>Todos 6-12 Baja</button>
                                        <button disabled={guardando} onClick={() => { if (!guardando) { setGridState({}); setMensajeHorario('🗑️ Todos los bloques eliminados.'); }}} style={{ background: guardando ? '#ccc' : '#fce4ec', border: `1px solid ${guardando ? '#bbb' : '#e57373'}`, borderRadius: '4px', padding: '4px 10px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: guardando ? '#999' : '#c62828' }}>Limpiar todo</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px' }}>
                                        <span style={{ color: '#666', fontWeight: 'bold' }}>Personalizado:</span>
                                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                            {GRID_COLUMNAS.map(col => (
                                                <label key={col.dia} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer' }}>
                                                    <input type="checkbox" disabled={guardando} checked={qfDays.includes(col.dia)} onChange={() => toggleQfDay(col.dia)} />
                                                    {col.label}
                                                </label>
                                            ))}
                                        </div>
                                        <input type="time" disabled={guardando} value={qfDesde} onChange={e => setQfDesde(e.target.value)} style={{ width: '80px', padding: '3px', fontSize: '12px' }} />
                                        <span>a</span>
                                        <input type="time" disabled={guardando} value={qfHasta} onChange={e => setQfHasta(e.target.value)} style={{ width: '80px', padding: '3px', fontSize: '12px' }} />
                                        <select disabled={guardando} value={qfTipoPrecio} onChange={e => setQfTipoPrecio(e.target.value)} style={{ padding: '3px', fontSize: '12px' }}>
                                            <option value="BASE">Base</option>
                                            <option value="PRIME">Prime</option>
                                            <option value="BAJA">Baja</option>
                                        </select>
                                        <button disabled={guardando} onClick={() => handleQuickFill(qfDays, qfDesde, qfHasta, qfTipoPrecio)} style={{ background: guardando ? '#ccc' : '#1e2530', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 12px', fontSize: '12px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Llenar</button>
                                    </div>
                                </div>

                                {/* Grid */}
                                <div style={{ overflowX: 'auto', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '580px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ border: '1px solid #ddd', padding: '6px 4px', background: '#f3f4f6', position: 'sticky', left: 0, zIndex: 2, fontSize: '11px', fontWeight: 700, color: '#333', width: '32px' }}>Hora</th>
                                                {GRID_COLUMNAS.map(col => (
                                                    <th key={col.dia} style={{ border: '1px solid #ddd', padding: '6px 2px', background: '#f3f4f6', textAlign: 'center', fontSize: '11px', minWidth: '80px', fontWeight: 700, color: '#333' }}>{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {HORAS.map(hora => (
                                                <tr key={hora}>
                                                    <td style={{ border: '1px solid #ddd', padding: '3px 4px', fontWeight: 'bold', background: '#fafafa', position: 'sticky', left: 0, zIndex: 1, fontSize: '11px', color: '#444' }}>{hora}</td>
                                                    {GRID_COLUMNAS.map(col => {
                                                        const key = `${col.dia}:${hora}`;
                                                        const cell = gridState[key];
                                                        const bg = !cell ? '#f5f5f5' : cell.tipoPrecio === 'BASE' ? '#4caf50' : cell.tipoPrecio === 'PRIME' ? '#2196f3' : '#ff9800';
                                                        const txt = !cell ? '' : cell.tipoPrecio === 'BASE' ? 'B' : cell.tipoPrecio === 'PRIME' ? 'P' : 'Bj';
                                                        return (
                                                            <td key={key} onClick={() => toggleCell(col.dia, hora)}
                                                                style={{ border: '1px solid #ddd', padding: '0', textAlign: 'center', cursor: guardando ? 'not-allowed' : 'pointer', background: bg, minWidth: '80px', height: '30px', fontSize: '12px', fontWeight: 'bold', color: cell ? 'white' : '#ddd', transition: 'background 0.12s' }}
                                                                title={cell ? `${DAY_SHORT[col.dia] || 'Dom'} ${hora} - ${cell.tipoPrecio}` : `${DAY_SHORT[col.dia] || 'Dom'} ${hora} - Inactivo`}>
                                                                {txt}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Legend + Summary */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '15px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ color: '#666' }}>Leyenda:</span>
                                        <span style={{ background: '#4caf50', color: 'white', padding: '1px 8px', borderRadius: '3px', fontWeight: 'bold' }}>B</span>
                                        <span style={{ background: '#2196f3', color: 'white', padding: '1px 8px', borderRadius: '3px', fontWeight: 'bold' }}>P</span>
                                        <span style={{ background: '#ff9800', color: 'white', padding: '1px 8px', borderRadius: '3px', fontWeight: 'bold' }}>Bj</span>
                                        <span style={{ background: '#f5f5f5', color: '#ccc', padding: '1px 8px', borderRadius: '3px', fontWeight: 'bold' }}>-</span>
                                    </div>
                                    <span style={{ fontWeight: 'bold', color: '#555' }}>Activos: {Object.keys(gridState).length} bloques</span>
                                </div>

                                <button disabled={guardando} onClick={guardarHorarios} style={{ background: guardando ? '#ccc' : '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: guardando ? 'not-allowed' : 'pointer', width: '100%' }}>
                                    {guardando ? '⏳ Guardando...' : '💾 Guardar Horarios'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* SUBTAB: REVIEWS */}
                {gestionSubTab === 'reviews' && (
                    <div>
                        {reviewsLoading ? (
                            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Cargando reviews...</p>
                        ) : reviews && reviews.reviews && reviews.reviews.length > 0 ? (
                            <>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '32px' }}>⭐</span>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{parseFloat(reviews.promedio || 0).toFixed(1)}</div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>{reviews.total_reviews} review(s)</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {reviews.reviews.map(r => (
                                        <div key={r.ID_Review} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '14px', background: '#fafafa' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>👤 {r.JugadorNombre} {r.JugadorApellido}</span>
                                                <span style={{ fontSize: '16px' }}>{'⭐'.repeat(Math.min(r.Calificacion || 0, 5))}</span>
                                            </div>
                                            {r.Comentarios && <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>{r.Comentarios}</p>}
                                            <span style={{ fontSize: '11px', color: '#999', marginTop: '6px', display: 'block' }}>{new Date(r.Fecha_Crea).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                <p style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</p>
                                <p>Aún no hay reviews para esta cancha.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* SUBTAB: FOTOS */}
                {gestionSubTab === 'fotos' && (
                    <div>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Administra las fotos de la cancha.</p>
                        {editandoCancha?._fotos?.length > 0 ? (
                            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                {editandoCancha._fotos.map(f => (
                                    <div key={f.ID_Foto} style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                        <img src={getImageUrl(f.URL_Foto)} alt={`Foto de ${editandoCancha._nombre || 'la cancha'}`} style={{ width: '130px', height: '100px', objectFit: 'cover', display: 'block' }} />
                                        <button type="button" onClick={() => setConfirmEliminar(f.ID_Foto)} title="Eliminar esta foto"
                                            style={{ position: 'absolute', top: '6px', right: '6px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '14px', lineHeight: '26px', padding: 0, fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>×</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f9fafb', borderRadius: '10px', marginBottom: '20px' }}>
                                <p style={{ fontSize: '28px', marginBottom: '6px', opacity: 0.4 }}>📷</p>
                                <p style={{ color: '#999', fontSize: '13px' }}>No hay fotos registradas.</p>
                            </div>
                        )}
                        <div style={{ border: '2px dashed #ddd', borderRadius: '10px', padding: '20px', textAlign: 'center', background: '#fafafa' }}>
                            <p style={{ fontWeight: 600, fontSize: '13px', color: '#555', marginBottom: '10px' }}>📷 Agregar una foto</p>
                            <input id="edit-foto-file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    if (file.size > 5 * 1024 * 1024) {
                                        onMensaje('⚠️ La foto no puede superar los 5 MB.');
                                        e.target.value = '';
                                        return;
                                    }
                                    setEditFotoFile(file);
                                }
                            }} style={{ marginBottom: '8px' }} />
                            <p style={{ fontSize: '11px', color: '#888' }}>JPG / PNG / WebP / AVIF — Máx 5 MB</p>
                            {editFotoFile && (
                                <button onClick={async () => {
                                    if (!editandoCancha) return;
                                    const datos = {
                                        nombre: editandoCancha.nombre,
                                        descripcion: editandoCancha.descripcion,
                                        precioBase: editandoCancha.precioBase,
                                        precioPrime: editandoCancha.precioPrime,
                                        precioBaja: editandoCancha.precioBaja
                                    };
                                    const res = await duenoService.editarCancha(editandoCancha._id, datos, editFotoFile);
                                    if (res.status === 'success') {
                                        setEditFotoFile(null);
                                        abrirGestionCancha(editandoCancha._id);
                                    } else {
                                        onMensaje(`❌ ${formatValidationErrors(res)}`);
                                    }
                                }} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '13px' }}>📤 Subir {editFotoFile.name}</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ConfirmDialog
                open={confirmEliminar !== null}
                title="Eliminar foto"
                message="¿Estás seguro de eliminar esta foto? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={() => eliminarFotoCancha(confirmEliminar)}
                onCancel={() => setConfirmEliminar(null)}
                variant="danger"
            />
        </div>
    );
}
