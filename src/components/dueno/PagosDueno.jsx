import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

const formatFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatHora = (f) => {
    if (!f) return '';
    const d = new Date(f);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

export default function PagosDueno({ onMensaje }) {
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({ fecha_desde: '', fecha_hasta: '', estado: '' });

    const cargar = async (f = filtros) => {
        setLoading(true);
        const res = await duenoService.obtenerPagos(f);
        if (res.status === 'success') setPagos(res.data || []);
        else onMensaje('❌ Error al cargar pagos.');
        setLoading(false);
    };

    useEffect(() => { cargar(); }, []);

    const handleFilterChange = (campo, valor) => {
        const nuevos = { ...filtros, [campo]: valor };
        setFiltros(nuevos);
        cargar(nuevos);
    };

    return (
        <div>
            <h3 style={{ marginTop: 0 }}>💰 Historial de Pagos</h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#475569' }}>Desde</label>
                    <input type="date" value={filtros.fecha_desde} onChange={e => handleFilterChange('fecha_desde', e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#475569' }}>Hasta</label>
                    <input type="date" value={filtros.fecha_hasta} onChange={e => handleFilterChange('fecha_hasta', e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }} />
                </div>
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px', color: '#475569' }}>Estado</label>
                    <select value={filtros.estado} onChange={e => handleFilterChange('estado', e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}>
                        <option value="">Todos</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="REEMBOLSADO">Reembolsado</option>
                        <option value="FALLIDO">Fallido</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando pagos...</div>
            ) : pagos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>💰</div>
                    <p style={{ fontWeight: 600 }}>No hay pagos registrados</p>
                    <p style={{ fontSize: '13px' }}>Los pagos aparecerán aquí cuando los jugadores reserven tus canchas.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Fecha</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Cancha</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Jugador</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Monto</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Método</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.map((p, i) => (
                                <tr key={p.ID_Pago || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{formatFecha(p.Fecha_Pago)}</div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{formatHora(p.Fecha_Pago)}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>{p.CanchaNombre || '—'}</td>
                                    <td style={{ padding: '12px 16px' }}>{p.JugadorNombre ? `${p.JugadorNombre} ${p.JugadorApellido || ''}` : '—'}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#059669', whiteSpace: 'nowrap' }}>
                                        S/ {Number(p.Monto || p.Monto_Total || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{p.Metodo_Pago || '—'}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                            background: p.Estado === 'COMPLETADO' ? '#d4edda' : p.Estado === 'PENDIENTE' ? '#fff3cd' : p.Estado === 'REEMBOLSADO' ? '#cce5ff' : '#fee2e2',
                                            color: p.Estado === 'COMPLETADO' ? '#155724' : p.Estado === 'PENDIENTE' ? '#856404' : p.Estado === 'REEMBOLSADO' ? '#004085' : '#b91c1c'
                                        }}>
                                            {p.Estado || '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}