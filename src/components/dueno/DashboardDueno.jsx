import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

export default function DashboardDueno() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await duenoService.obtenerDashboard();
            setDashboard(res.status === 'success' && res.data ? res.data : null);
            setLoading(false);
        })();
    }, []);

    if (loading) return <p style={{ color: '#999', textAlign: 'center', padding: '20px' }} role="status">Cargando dashboard...</p>;
    if (!dashboard) return <p style={{ color: '#999', textAlign: 'center', padding: '20px' }} role="status">No hay datos de dashboard disponibles.</p>;

    const cards = [
        { label: 'Reservas hoy', value: dashboard.reservas_hoy, icon: '📅', color: '#3b82f6' },
        { label: 'Ingresos hoy', value: `S/${parseFloat(dashboard.ingresos_hoy || 0).toFixed(2)}`, icon: '💰', color: '#22c55e' },
        { label: 'Ocupación', value: `${dashboard.ocupacion?.porcentaje || 0}%`, sub: `${dashboard.ocupacion?.reservados || 0}/${dashboard.ocupacion?.total_slots || 0} slots`, icon: '📊', color: '#f59e0b' },
        { label: 'Canchas activas', value: dashboard.total_canchas, icon: '🏟️', color: '#8b5cf6' }
    ];

    return (
        <div>
            <h3>📊 Dashboard</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {cards.map((card, i) => (
                    <div key={i} style={{ border: `1px solid ${card.color}33`, borderRadius: '10px', padding: '20px', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{card.icon}</div>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{card.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                        {card.sub && <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{card.sub}</div>}
                    </div>
                ))}
            </div>

            {dashboard.proxima_liquidacion && (
                <div style={{ border: '1px solid #00b48a33', borderRadius: '10px', padding: '20px', background: '#f0fdfa' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#00b48a' }}>📄 Próxima Liquidación</h4>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                        <div><strong>Período:</strong> {new Date(dashboard.proxima_liquidacion.fecha_inicio).toLocaleDateString('es-PE')} - {new Date(dashboard.proxima_liquidacion.fecha_fin).toLocaleDateString('es-PE')}</div>
                        <div><strong>Monto Neto:</strong> <span style={{ fontWeight: 'bold', color: '#00b48a' }}>S/{parseFloat(dashboard.proxima_liquidacion.monto_neto || 0).toFixed(2)}</span></div>
                        <div><strong>Estado:</strong> <span style={{ padding: '3px 8px', borderRadius: '12px', background: dashboard.proxima_liquidacion.estado === 'PENDIENTE' ? '#fff3cd' : '#d4edda', color: dashboard.proxima_liquidacion.estado === 'PENDIENTE' ? '#856404' : '#155724', fontWeight: 'bold', fontSize: '12px' }}>{dashboard.proxima_liquidacion.estado}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
}
