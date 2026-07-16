import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

const formatFecha = (f) => {
    if (!f) return '—';
    const d = new Date(f);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ESTADO_LABELS = {
    PROCESADO: 'Procesado',
    PENDIENTE: 'Pendiente',
    RECHAZADO: 'Rechazado'
};

const ESTADO_COLORS = {
    PROCESADO: { bg: '#d4edda', text: '#155724' },
    PENDIENTE: { bg: '#fff3cd', text: '#856404' },
    RECHAZADO: { bg: '#fee2e2', text: '#b91c1c' }
};

export default function ReembolsosDueno({ onMensaje }) {
    const [reembolsos, setReembolsos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({ fecha_desde: '', fecha_hasta: '' });

    const cargar = async (f = filtros) => {
        setLoading(true);
        const res = await duenoService.obtenerReembolsos(f);
        if (res.status === 'success') setReembolsos(res.data || []);
        else onMensaje('❌ Error al cargar reembolsos.');
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
            <h3 style={{ marginTop: 0 }}>↩️ Historial de Reembolsos</h3>
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
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando reembolsos...</div>
            ) : reembolsos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>↩️</div>
                    <p style={{ fontWeight: 600 }}>No hay reembolsos registrados</p>
                    <p style={{ fontSize: '13px' }}>Los reembolsos aparecerán aquí cuando se procesen devoluciones.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Solicitud</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Cancha</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Jugador</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Monto reembolsado</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Motivo</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '12px' }}>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reembolsos.map((r, i) => {
                                const c = ESTADO_COLORS[r.Estado] || { bg: '#f3f4f6', text: '#6b7280' };
                                return (
                                    <tr key={r.ID_Reembolso || i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{formatFecha(r.Fecha_Solicitud)}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Proc: {formatFecha(r.Fecha_Procesado)}</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{r.CanchaNombre || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>{r.JugadorNombre ? `${r.JugadorNombre} ${r.JugadorApellido || ''}` : '—'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#b91c1c', whiteSpace: 'nowrap' }}>
                                            - S/ {Number(r.Monto_Reembolsado || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6b7280' }}>
                                            {(r.Motivo || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                                background: c.bg, color: c.text
                                            }}>
                                                {ESTADO_LABELS[r.Estado] || r.Estado}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}