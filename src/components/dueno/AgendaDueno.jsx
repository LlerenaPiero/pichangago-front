import { useEffect, useState } from 'react';
import { duenoService } from '../../services/duenoService';
import { COLOR_MAP } from '../../utils/colorMap';

const extraerHora = (f) => {
    if (!f) return '';
    const m = f.match(/T(\d{2}:\d{2})/) || f.match(/\s(\d{2}:\d{2})/);
    return m ? m[1] : f.substring(0, 5);
};

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date.toISOString().split('T')[0];
};

const formatearFecha = (f) => new Date(f + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const STATUS_FILTERS = [
    { value: '', label: 'Todos los estados' },
    { value: 'DISPONIBLE', label: '✅ Disponibles' },
    { value: 'RESERVADO', label: '👤 Reservados' },
    { value: 'BLOQUEADO', label: '🔒 Bloqueados' },
    { value: 'OFERTA', label: '🔥 Ofertas' },
    { value: 'NO_ASISTIO', label: '🚫 No asistieron' },
];

const CARD_STYLES = {
    card: { border: '1px solid #e0e0e0', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0', cursor: 'pointer', userSelect: 'none' },
    headerTitle: { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e2530' },
    body: { padding: '0' },
    slotRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 18px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', minHeight: '48px' },
    time: { fontSize: '13px', fontWeight: 'bold', color: '#333', minWidth: '85px', fontFamily: 'monospace' },
    badge: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: color.bg, color: color.text, border: `1px solid ${color.hex}33` }),
    actions: { display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' },
};

export default function AgendaDueno({ canchas, onMensaje, onAbrirDetalleReserva, onAbrirGestionCancha }) {
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [vistaSemanal, setVistaSemanal] = useState(false);
    const [fechaSemana, setFechaSemana] = useState(() => getMonday(new Date()));
    const [agendaSemanal, setAgendaSemanal] = useState(null);
    const [cargandoSemanal, setCargandoSemanal] = useState(false);
    const [errorSemanal, setErrorSemanal] = useState('');
    const [filtroCancha, setFiltroCancha] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [canchasExpandidas, setCanchasExpandidas] = useState([]);
    const [diasExpandidos, setDiasExpandidos] = useState([]);
    const [ofertaMulti, setOfertaMulti] = useState({ visible: false, cancha: '', slots: [], porcentaje: 20, expira: '' });

    const toggleExpandida = (nombre) => {
        setCanchasExpandidas(prev => prev.includes(nombre) ? prev.filter(n => n !== nombre) : [...prev, nombre]);
    };

    const toggleDiaExpandido = (fecha) => {
        setDiasExpandidos(prev => prev.includes(fecha) ? prev.filter(f => f !== fecha) : [...prev, fecha]);
    };

    const cargarAgendaDiaria = async (fecha) => {
        setCargando(true);
        const res = await duenoService.obtenerAgendaDiaria(fecha);
        setSlots(res.status === 'success' ? (res.data || []) : []);
        setCargando(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarAgendaDiaria(fechaFiltro);
    }, [fechaFiltro]);

    const cargarSemanal = async (fechaInicio) => {
        setCargandoSemanal(true);
        setErrorSemanal('');
        try {
            const res = await duenoService.obtenerAgendaSemanal(fechaInicio);
            if (res.status === 'success' && res.data) {
                setAgendaSemanal(res.data);
            } else {
                setAgendaSemanal(null);
                setErrorSemanal(res.error || 'Error al cargar la vista semanal.');
            }
        } catch {
            setAgendaSemanal(null);
            setErrorSemanal('Error de conexión al cargar vista semanal.');
        } finally {
            setCargandoSemanal(false);
        }
    };

    useEffect(() => {
        if (vistaSemanal) {
            const lunes = getMonday(fechaSemana);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFechaSemana(lunes);
            setDiasExpandidos([new Date().toISOString().split('T')[0]]);
            cargarSemanal(lunes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vistaSemanal]);

    useEffect(() => {
        if (vistaSemanal && fechaSemana) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            cargarSemanal(fechaSemana);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fechaSemana]);

    const handleCambiarEstado = async (idSlot, nuevoEstado) => {
        const res = await duenoService.actualizarEstadoSlot(idSlot, nuevoEstado);
        if (res.status === 'success') {
            onMensaje(`✅ Slot actualizado a "${nuevoEstado}".`);
            cargarAgendaDiaria(fechaFiltro);
        }
    };

    const handleCrearOfertasMulti = async () => {
        const { cancha: nombreCancha, slots: slotsSeleccionados, porcentaje, expira } = ofertaMulti;
        if (!nombreCancha || slotsSeleccionados.length === 0 || !expira) return;
        if (porcentaje < 1 || porcentaje > 50) { onMensaje('⚠️ El % debe estar entre 1 y 50.'); return; }
        for (const idSlot of slotsSeleccionados) {
            const slotInfo = slots.find(s => s.ID_Slots === idSlot);
            const canchaInfo = canchas.find(c => c.Nombre === nombreCancha);
            let precioOfertado;
            if (slotInfo && canchaInfo) {
                const precioKey = slotInfo.Tipo_Precio === 'PRIME' ? 'Precio_Prime' : slotInfo.Tipo_Precio === 'BAJA' ? 'Precio_Baja' : 'Precio_Base';
                const precioBase = canchaInfo[precioKey] || canchaInfo.Precio_Base;
                if (precioBase) precioOfertado = Math.round(precioBase * (1 - parseInt(porcentaje, 10) / 100) * 100) / 100;
            }
            const body = { porcentajeDescuento: parseInt(porcentaje, 10), fechaExpira: expira };
            if (precioOfertado) body.precioOfertado = precioOfertado;
            const res = await duenoService.crearOfertaSlot(idSlot, body);
            if (res.status !== 'success') {
                onMensaje(`❌ Error en slot ${idSlot}: ${res.error || 'Error'}`);
                return;
            }
        }
        onMensaje(`🎉 Ofertas publicadas en ${slotsSeleccionados.length} slot(s).`);
        setOfertaMulti({ visible: false, cancha: '', slots: [], porcentaje: 20, expira: '' });
        cargarAgendaDiaria(fechaFiltro);
    };

    const cambiarFecha = (delta) => {
        const d = new Date(fechaFiltro + 'T12:00:00');
        d.setDate(d.getDate() + delta);
        setFechaFiltro(d.toISOString().split('T')[0]);
    };

    const canchaNombres = [...new Set(slots.map(s => s.CanchaNombre || 'Cancha'))].sort();

    const slotsFiltrados = slots.filter(s => {
        if (filtroCancha && (s.CanchaNombre || 'Cancha') !== filtroCancha) return false;
        if (filtroEstado && s.EstadoSlot !== filtroEstado) return false;
        return true;
    });

    const slotsPorCancha = {};
    slotsFiltrados.forEach(s => {
        const nombre = s.CanchaNombre || 'Cancha';
        if (!slotsPorCancha[nombre]) slotsPorCancha[nombre] = [];
        slotsPorCancha[nombre].push(s);
    });
    Object.values(slotsPorCancha).forEach(arr => arr.sort((a, b) => (a.Hora_Inicio || a.Fecha_Inicio || '').localeCompare(b.Hora_Inicio || b.Fecha_Inicio || '')));

    const stats = {
        total: slots.length,
        disponibles: slots.filter(s => s.EstadoSlot === 'DISPONIBLE').length,
        reservados: slots.filter(s => s.EstadoSlot === 'RESERVADO').length,
        bloqueados: slots.filter(s => s.EstadoSlot === 'BLOQUEADO').length,
        ofertas: slots.filter(s => s.EstadoSlot === 'OFERTA').length,
    };

    const tieneDisponibles = slots.some(s => s.EstadoSlot === 'DISPONIBLE');
    const slotStatesEsperados = ['DISPONIBLE', 'RESERVADO', 'BLOQUEADO', 'OFERTA', 'NO_ASISTIO'];

    const renderSlotRow = (slot) => {
        const color = COLOR_MAP[slot.EstadoSlot] || COLOR_MAP.BLOQUEADO;
        const hora = `${extraerHora(slot.Fecha_Inicio || slot.Hora_Inicio)} - ${extraerHora(slot.Fecha_Fin || slot.Hora_Fin)}`;

        const accionesDisponible = (
            <div style={CARD_STYLES.actions}>
                <button onClick={() => handleCambiarEstado(slot.ID_Slots, 'BLOQUEADO')} title="Bloquear"
                    style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔒 Bloquear</button>
            </div>
        );

        const accionesBloqueado = (
            <div style={CARD_STYLES.actions}>
                <button onClick={() => handleCambiarEstado(slot.ID_Slots, 'DISPONIBLE')} title="Reabrir"
                    style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔓 Desbloquear</button>
            </div>
        );

        const infoReservado = (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto', fontSize: '13px' }}>
                <span style={{ fontWeight: 'bold', color: '#1e40af' }}>👤 {slot.JugadorNombre || '—'}</span>
                {slot.JugadorTelefono && <span style={{ color: '#555' }}>📞 {slot.JugadorTelefono}</span>}
                {slot.Monto_Total && <span style={{ color: '#166534', fontWeight: 'bold' }}>💰 S/ {Number(slot.Monto_Total).toFixed(2)}</span>}
                {slot.EstadoReserva && <span style={{ background: '#dbeafe', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#1e40af' }}>{slot.EstadoReserva}</span>}
                <button onClick={() => onAbrirDetalleReserva(slot.ID_Reserva)} title="Ver detalle"
                    style={{ background: 'none', border: '1px solid #93c5fd', color: '#2563eb', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Ver más</button>
            </div>
        );

        if (slot.EstadoSlot === 'DISPONIBLE') return (
            <div key={slot.ID_Slots} style={CARD_STYLES.slotRow}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>✅ {color.label}</span>
                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{slot.Tipo_Precio || 'BASE'}</span>
                {accionesDisponible}
            </div>
        );

        if (slot.EstadoSlot === 'RESERVADO') return (
            <div key={slot.ID_Slots} style={{ ...CARD_STYLES.slotRow, background: '#f8faff' }}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>👤 {color.label}</span>
                {infoReservado}
                <div style={CARD_STYLES.actions}>
                    <button onClick={() => handleCambiarEstado(slot.ID_Slots, 'NO_ASISTIO')} title="Marcar como no asistió"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🚫 No asistió</button>
                </div>
            </div>
        );

        if (slot.EstadoSlot === 'BLOQUEADO') return (
            <div key={slot.ID_Slots} style={CARD_STYLES.slotRow}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>🔒 {color.label}</span>
                {accionesBloqueado}
            </div>
        );

        if (slot.EstadoSlot === 'OFERTA') return (
            <div key={slot.ID_Slots} style={{ ...CARD_STYLES.slotRow, background: '#fffbe6' }}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>🔥 {color.label}</span>
                <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 'bold', marginLeft: 'auto' }}>{slot.Tipo_Precio || 'BASE'}</span>
                <div style={CARD_STYLES.actions}>
                    <button onClick={() => handleCambiarEstado(slot.ID_Slots, 'DISPONIBLE')} title="Quitar oferta y liberar"
                        style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ Quitar oferta</button>
                </div>
            </div>
        );

        if (slot.EstadoSlot === 'NO_ASISTIO') return (
            <div key={slot.ID_Slots} style={{ ...CARD_STYLES.slotRow, background: '#fef2f2' }}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>🚫 {color.label}</span>
                <div style={CARD_STYLES.actions}>
                    <button onClick={() => handleCambiarEstado(slot.ID_Slots, 'DISPONIBLE')} title="Liberar slot"
                        style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔄 Reabrir slot</button>
                </div>
            </div>
        );

        return (
            <div key={slot.ID_Slots} style={CARD_STYLES.slotRow}>
                <span style={CARD_STYLES.time}>⏰ {hora}</span>
                <span style={CARD_STYLES.badge(color)}>{color.label}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: 'auto' }}>{slot.EstadoSlot}</span>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px' }}>📅 Agenda</h3>
                    <span style={{ fontSize: '13px', color: '#666' }}>{formatearFecha(fechaFiltro)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => cambiarFecha(-1)} title="Día anterior" style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>◀</button>
                        <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} style={{ padding: '6px 8px', border: 'none', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '13px', outline: 'none' }} />
                        <button onClick={() => cambiarFecha(1)} title="Día siguiente" style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>▶</button>
                    </div>
                    {tieneDisponibles && (
                        <button onClick={() => {
                            const manana = new Date(); manana.setDate(manana.getDate() + 1);
                            const slotsDisponibles = slots.filter(s => s.EstadoSlot === 'DISPONIBLE');
                            const canchasUnicas = [...new Set(slotsDisponibles.map(s => s.CanchaNombre || 'Cancha'))];
                            setOfertaMulti({ visible: true, cancha: canchasUnicas[0] || '', slots: [], porcentaje: 20, expira: manana.toISOString().split('T')[0] });
                        }} style={{ background: '#ffc107', color: '#333', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>🔥 Oferta Relámpago</button>
                    )}
                    <button onClick={() => {
                        const nuevaVista = !vistaSemanal;
                        setVistaSemanal(nuevaVista);
                        if (nuevaVista) {
                            const lunes = getMonday(fechaFiltro);
                            setFechaSemana(lunes);
                        }
                    }} style={{ background: vistaSemanal ? '#1e2530' : '#eee', color: vistaSemanal ? 'white' : '#333', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                        {vistaSemanal ? '📅 Diario' : '📆 Semanal'}
                    </button>
                </div>
            </div>

            {/* Offer panel */}
            {ofertaMulti.visible && (
                <div style={{ marginBottom: '20px', border: '2px solid #ffc107', borderRadius: '10px', padding: '20px', background: '#fffbe6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0 }}>🔥 Crear Ofertas Relámpago</h4>
                        <button onClick={() => setOfertaMulti({ ...ofertaMulti, visible: false })} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label htmlFor="agenda-cancha-oferta" style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Cancha:</label>
                        <select id="agenda-cancha-oferta" value={ofertaMulti.cancha} onChange={e => setOfertaMulti({ ...ofertaMulti, cancha: e.target.value, slots: [] })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="">-- Seleccionar --</option>
                            {[...new Set(slots.filter(s => s.EstadoSlot === 'DISPONIBLE').map(s => s.CanchaNombre || 'Cancha'))].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Slots disponibles para oferta:</label>
                        {slots.filter(s => (s.CanchaNombre || 'Cancha') === ofertaMulti.cancha && s.EstadoSlot === 'DISPONIBLE').length === 0 ? (
                            <p style={{ color: '#6b7280', fontSize: '13px' }}>No hay slots disponibles en esta cancha.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {slots.filter(s => (s.CanchaNombre || 'Cancha') === ofertaMulti.cancha && s.EstadoSlot === 'DISPONIBLE').map(s => {
                                    const hora = `${extraerHora(s.Fecha_Inicio || s.Hora_Inicio)} - ${extraerHora(s.Fecha_Fin || s.Hora_Fin)}`;
                                    const selected = ofertaMulti.slots.includes(s.ID_Slots);
                                    return (
                                        <label key={s.ID_Slots} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', border: selected ? '2px solid #ffc107' : '1px solid #ddd', background: selected ? '#fff8e1' : '#fafafa', cursor: 'pointer', fontWeight: selected ? 'bold' : 'normal' }}>
                                            <input type="checkbox" checked={selected} onChange={() => setOfertaMulti({
                                                ...ofertaMulti, slots: selected ? ofertaMulti.slots.filter(id => id !== s.ID_Slots) : [...ofertaMulti.slots, s.ID_Slots]
                                            })} />
                                            {hora}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {ofertaMulti.slots.length > 0 && <p style={{ fontSize: '12px', color: '#e6a800', marginTop: '6px' }}>✅ {ofertaMulti.slots.length} slot(s) seleccionados</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📉 % Descuento:</label>
                            <input type="number" min={1} max={50} value={ofertaMulti.porcentaje} onChange={e => /^\d*$/.test(e.target.value) && setOfertaMulti({ ...ofertaMulti, porcentaje: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Entre 1% y 50%</span>
                        </div>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📅 Válido hasta:</label>
                            <input type="date" value={ofertaMulti.expira} onChange={e => setOfertaMulti({ ...ofertaMulti, expira: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setOfertaMulti({ ...ofertaMulti, visible: false })} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={handleCrearOfertasMulti} disabled={ofertaMulti.slots.length === 0} style={{ background: ofertaMulti.slots.length === 0 ? '#ccc' : '#ffc107', color: '#333', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: ofertaMulti.slots.length === 0 ? 'not-allowed' : 'pointer' }}>🔥 Publicar en {ofertaMulti.slots.length} slot(s)</button>
                    </div>
                </div>
            )}

            {/* Weekly view */}
            {vistaSemanal ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => {
                                const d = new Date(fechaSemana + 'T12:00:00');
                                d.setDate(d.getDate() - 7);
                                setFechaSemana(d.toISOString().split('T')[0]);
                            }} style={{ background: '#eee', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>◀ Semana</button>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Semana del {new Date(fechaSemana + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => {
                                const d = new Date(fechaSemana + 'T12:00:00');
                                d.setDate(d.getDate() + 7);
                                setFechaSemana(d.toISOString().split('T')[0]);
                            }} style={{ background: '#eee', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Semana ▶</button>
                        </div>
                        <input type="date" value={fechaSemana} onChange={e => setFechaSemana(e.target.value)} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    {cargandoSemanal ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }} role="status">Cargando vista semanal...</p>
                    ) : errorSemanal ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#d32f2f' }}>
                            <p>❌ {errorSemanal}</p>
                            <button onClick={() => cargarSemanal(fechaSemana)} style={{ marginTop: '10px', background: '#1e2530', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Reintentar</button>
                        </div>
                    ) : agendaSemanal ? (
                        <>
                            {/* Weekly stats summary */}
                            {agendaSemanal.dias && (() => {
                                const todosSlots = agendaSemanal.dias.flatMap(d => (d.canchas || []).flatMap(c => c.slots || []));
                                const wStats = {
                                    disponibles: todosSlots.filter(s => s.EstadoSlot === 'DISPONIBLE').length,
                                    reservados: todosSlots.filter(s => s.EstadoSlot === 'RESERVADO').length,
                                    bloqueados: todosSlots.filter(s => s.EstadoSlot === 'BLOQUEADO').length,
                                    ofertas: todosSlots.filter(s => s.EstadoSlot === 'OFERTA').length,
                                };
                                return (
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                        <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #86efac' }}>✅ {wStats.disponibles} Disponibles</span>
                                        <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #93c5fd' }}>👤 {wStats.reservados} Reservados</span>
                                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>🔒 {wStats.bloqueados} Bloqueados</span>
                                        {wStats.ofertas > 0 && <span style={{ background: '#fffbeb', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #fde68a' }}>🔥 {wStats.ofertas} Ofertas</span>}
                                        <span style={{ color: '#666', fontSize: '13px', padding: '6px 0' }}>• {todosSlots.length} total</span>
                                    </div>
                                );
                            })()}

                            {/* Day cards */}
                            {agendaSemanal.dias.map(dia => {
                                const expandida = diasExpandidos.includes(dia.fecha);
                                const dStats = (dia.canchas || []).flatMap(c => c.slots || []).reduce((acc, s) => {
                                    if (s.EstadoSlot === 'DISPONIBLE') acc.disponibles++;
                                    else if (s.EstadoSlot === 'RESERVADO') acc.reservados++;
                                    else if (s.EstadoSlot === 'BLOQUEADO') acc.bloqueados++;
                                    else if (s.EstadoSlot === 'OFERTA') acc.ofertas++;
                                    return acc;
                                }, { disponibles: 0, reservados: 0, bloqueados: 0, ofertas: 0 });
                                const totalDia = dia.canchas ? dia.canchas.reduce((sum, c) => sum + (c.slots || []).length, 0) : 0;
                                return (
                                    <div key={dia.fecha} style={CARD_STYLES.card}>
                                        <div role="button" tabIndex={0} aria-expanded={expandida} aria-label={`${expandida ? 'Colapsar' : 'Expandir'} día ${new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}`} style={CARD_STYLES.header} onClick={() => toggleDiaExpandido(dia.fecha)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDiaExpandido(dia.fecha); } }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '12px', color: '#6b7280', transition: 'transform 0.2s', transform: expandida ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e2530' }}>
                                                    {new Date(dia.fecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </h4>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>({totalDia} slots)</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
                                                {dStats.disponibles > 0 && <span style={{ color: '#166534', fontWeight: 'bold' }}>✅{dStats.disponibles}</span>}
                                                {dStats.reservados > 0 && <span style={{ color: '#1e40af', fontWeight: 'bold' }}>👤{dStats.reservados}</span>}
                                                {dStats.bloqueados > 0 && <span style={{ color: '#374151', fontWeight: 'bold' }}>🔒{dStats.bloqueados}</span>}
                                                {dStats.ofertas > 0 && <span style={{ color: '#92400e', fontWeight: 'bold' }}>🔥{dStats.ofertas}</span>}
                                            </div>
                                        </div>

                                        {expandida && (
                                            <div style={CARD_STYLES.body}>
                                                {(!dia.canchas || dia.canchas.length === 0) ? (
                                                    <p style={{ padding: '14px 18px', color: '#6b7280', fontSize: '13px', margin: 0 }}>Sin horarios para este día.</p>
                                                ) : (
                                                    dia.canchas.map(cancha => {
                                                        const canchaRel = canchas.find(cc => cc.Nombre === cancha.Nombre || cc.ID_Cancha === cancha.ID_Cancha);
                                                        const slotsCancha = (cancha.slots || []).sort((a, b) => (a.Hora_Inicio || '').localeCompare(b.Hora_Inicio || ''));
                                                        if (slotsCancha.length === 0) return null;
                                                        return (
                                                            <div key={cancha.ID_Cancha}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px 4px', borderBottom: '1px solid #f0f0f0', marginBottom: '4px' }}>
                                                                    <h5 style={{ margin: 0, fontSize: '14px', color: '#1e2530' }}>🏟️ {cancha.Nombre}</h5>
                                                                    {canchaRel && (
                                                                        <button onClick={(e) => { e.stopPropagation(); onAbrirGestionCancha(canchaRel); }} title="Gestionar horarios"
                                                                            style={{ background: '#1e2530', color: 'white', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>📅 Gestionar</button>
                                                                    )}
                                                                </div>
                                                                {slotsCancha.map(slot => renderSlotRow(slot))}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Color legend */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', padding: '12px 0', borderTop: '1px solid #eee' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Leyenda:</span>
                                {slotStatesEsperados.map(st => {
                                    const c = COLOR_MAP[st];
                                    return (
                                        <span key={st} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: c.bg, color: c.text, fontWeight: 'bold', border: `1px solid ${c.hex}33` }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.hex, display: 'inline-block' }}></span>
                                            {c.label}
                                        </span>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No hay datos para esta semana.</p>
                    )}
                </div>
            ) : (
                /* Daily card view */
                <>
                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <span style={{ background: '#f0fdf4', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #86efac' }}>✅ {stats.disponibles} Disponibles</span>
                        <span style={{ background: '#eff6ff', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #93c5fd' }}>👤 {stats.reservados} Reservados</span>
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>🔒 {stats.bloqueados} Bloqueados</span>
                        {stats.ofertas > 0 && <span style={{ background: '#fffbeb', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #fde68a' }}>🔥 {stats.ofertas} Ofertas</span>}
                        <span style={{ color: '#666', fontSize: '13px', padding: '6px 0' }}>• {stats.total} total</span>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                        <select aria-label="Filtrar por cancha" value={filtroCancha} onChange={e => setFiltroCancha(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', background: '#fff' }}>
                            <option value="">Todas las canchas</option>
                            {canchaNombres.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <select aria-label="Filtrar por estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', background: '#fff' }}>
                            {STATUS_FILTERS.map(sf => <option key={sf.value} value={sf.value}>{sf.label}</option>)}
                        </select>
                        {(filtroCancha || filtroEstado) && (
                            <button onClick={() => { setFiltroCancha(''); setFiltroEstado(''); }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: '4px' }}>
                                Limpiar filtros
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {cargando ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px', fontSize: '14px' }} role="status">Cargando agenda...</p>
                    ) : slots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📅</p>
                            <p style={{ fontSize: '16px' }}>No hay horarios generados para este día.</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Usa la pestaña "Canchas" para configurar los horarios de tus canchas.</p>
                        </div>
                    ) : Object.keys(slotsPorCancha).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            <p>No hay slots que coincidan con los filtros seleccionados.</p>
                        </div>
                    ) : (
                        /* Cards */
                        Object.keys(slotsPorCancha).map(nombreCancha => {
                            const slotsCancha = slotsPorCancha[nombreCancha];
                            const canchaRel = canchas.find(c => c.Nombre === nombreCancha);
                            const expandida = canchasExpandidas.includes(nombreCancha);
                            return (
                                <div key={nombreCancha} style={CARD_STYLES.card}>
                                    <div role="button" tabIndex={0} aria-expanded={expandida} aria-label={`${expandida ? 'Colapsar' : 'Expandir'} cancha ${nombreCancha}`} style={CARD_STYLES.header} onClick={() => toggleExpandida(nombreCancha)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpandida(nombreCancha); } }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#6b7280', transition: 'transform 0.2s', transform: expandida ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                                            <h4 style={CARD_STYLES.headerTitle}>🏟️ {nombreCancha}</h4>
                                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>({slotsCancha.length} slots)</span>
                                        </div>
                                        {canchaRel && (
                                            <button onClick={(e) => { e.stopPropagation(); onAbrirGestionCancha(canchaRel); }} title="Gestionar horarios"
                                                style={{ background: '#1e2530', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                                📅 Gestionar
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ ...CARD_STYLES.body, display: expandida ? 'block' : 'none' }}>
                                        {slotsCancha.map(slot => renderSlotRow(slot))}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Color legend */}
                    {!cargando && slots.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', padding: '12px 0', borderTop: '1px solid #eee' }}>
                            <span style={{ fontSize: '12px', color: '#666' }}>Leyenda:</span>
                            {slotStatesEsperados.map(st => {
                                const c = COLOR_MAP[st];
                                return (
                                    <span key={st} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: c.bg, color: c.text, fontWeight: 'bold', border: `1px solid ${c.hex}33` }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.hex, display: 'inline-block' }}></span>
                                        {c.label}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
