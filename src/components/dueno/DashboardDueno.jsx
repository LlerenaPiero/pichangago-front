import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

const hoy = new Date();
const fechaHoy = hoy.toISOString().split('T')[0];
const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const fechaFormateada = hoy.toLocaleDateString('es-PE', opcionesFecha);

const PLAN_NAMES = { BASICO: 'Básico', PRO: 'Pro', PREMIUM: 'Premium' };
const PLAN_COLORS = { BASICO: '#6b7280', PRO: '#008060', PREMIUM: '#8b5cf6' };

function extraerHora(fecha) {
    if (!fecha) return '--:--';
    if (fecha.includes('T')) return fecha.split('T')[1].slice(0, 5);
    return fecha.slice(0, 5);
}

export default function DashboardDueno() {
    const [dashboard, setDashboard] = useState(null);
    const [reservasHoy, setReservasHoy] = useState([]);
    const [suscripcion, setSuscripcion] = useState(null);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const [res, resAgenda, resSuscripcion, resPlanes] = await Promise.all([
                duenoService.obtenerDashboard(),
                duenoService.obtenerAgendaDiaria(fechaHoy),
                duenoService.obtenerSuscripcion(),
                duenoService.obtenerPlanes()
            ]);
            setDashboard(res.status === 'success' && res.data ? res.data : null);

            if (resAgenda.status === 'success' && resAgenda.data) {
                const reservados = resAgenda.data
                    .filter(s => s.EstadoSlot === 'RESERVADO' && s.JugadorNombre)
                    .sort((a, b) => (a.HORA_INICIO || a.Fecha_Inicio || '').localeCompare(b.HORA_INICIO || b.Fecha_Inicio || ''));
                setReservasHoy(reservados);
            }

            if (resSuscripcion.status === 'success' && resSuscripcion.data) {
                setSuscripcion(resSuscripcion.data);
            }
            if (resPlanes.status === 'success' && resPlanes.data) {
                setPlanes(resPlanes.data);
            }

            setLoading(false);
        })();
    }, []);

    if (loading) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }} role="status">Cargando resumen...</p>;
    if (!dashboard) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }} role="status">No hay datos disponibles.</p>;

    const cards = [
        { label: 'Reservas hoy', value: dashboard.reservas_hoy, icon: '📅', color: '#3b82f6' },
        { label: 'Ingresos hoy', value: `S/${parseFloat(dashboard.ingresos_hoy || 0).toFixed(2)}`, icon: '💰', color: '#22c55e' },
        { label: 'Ocupación', value: `${dashboard.ocupacion?.porcentaje || 0}%`, sub: `${dashboard.ocupacion?.reservados || 0}/${dashboard.ocupacion?.total_slots || 0} slots`, icon: '📊', color: '#f59e0b' },
        { label: 'Canchas activas', value: dashboard.total_canchas, icon: '🏟️', color: '#8b5cf6' }
    ];

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
            }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#1f2937' }}>📊 Resumen</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>{fechaFormateada}</p>
                </div>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px', marginBottom: '28px'
            }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        border: `1px solid ${card.color}22`, borderRadius: '12px', padding: '20px',
                        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{card.icon}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>{card.label}</div>
                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: card.color }}>{card.value}</div>
                        {card.sub && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{card.sub}</div>}
                    </div>
                ))}
            </div>

            {reservasHoy.length > 0 ? (
                <div style={{
                    border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden',
                    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '24px'
                }}>
                    <div style={{
                        padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
                        background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#1f2937' }}>📋 Reservas de hoy</h4>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{reservasHoy.length} reserva(s)</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>Hora</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>Cancha</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>Cliente</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'right', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>Monto</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'center', color: '#6b7280', fontWeight: '600', fontSize: '12px' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasHoy.map(slot => (
                                    <tr key={slot.ID_SLOT} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                            ⏰ {extraerHora(slot.HORA_INICIO)} - {extraerHora(slot.HORA_FIN)}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>{slot.CanchaNombre || '—'}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ fontWeight: '500' }}>👤 {slot.JugadorNombre}</span>
                                            {slot.JugadorTelefono && <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>📞 {slot.JugadorTelefono}</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#059669' }}>
                                            S/ {Number(slot.MONTO_TOTAL || 0).toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                                                background: slot.EstadoReserva === 'CONFIRMADA' ? '#d4edda' : '#fff3cd',
                                                color: slot.EstadoReserva === 'CONFIRMADA' ? '#155724' : '#856404'
                                            }}>
                                                {slot.EstadoReserva || 'RESERVADO'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{
                    border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', textAlign: 'center',
                    background: '#fff', marginBottom: '24px'
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                    <p style={{ color: '#6b7280', fontWeight: '500' }}>No hay reservas para hoy</p>
                    <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Los próximos clientes aparecerán aquí automáticamente.</p>
                </div>
            )}

            {/* Estado de suscripción */}
            {suscripcion && (
                <div style={{
                    border: `1px solid ${PLAN_COLORS[suscripcion.Plan] || '#008060'}33`,
                    borderRadius: '12px', padding: '20px 24px',
                    background: `linear-gradient(135deg, ${PLAN_COLORS[suscripcion.Plan] || '#008060'}08 0%, #ffffff 100%)`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{suscripcion.Plan === 'PREMIUM' ? '⭐' : suscripcion.Plan === 'PRO' ? '🌟' : '📦'}</span>
                            <div>
                                <h4 style={{ margin: 0, color: '#1f2937', fontSize: '15px' }}>Plan {PLAN_NAMES[suscripcion.Plan] || suscripcion.Plan}</h4>
                                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                                    {suscripcion.Cantidad_Canchas} cancha{suscripcion.Cantidad_Canchas !== 1 ? 's' : ''} permitida{suscripcion.Cantidad_Canchas !== 1 ? 's' : ''}
                                    {suscripcion.Precio_Mensual > 0 && ` · S/ ${Number(suscripcion.Precio_Mensual).toFixed(2)}/mes`}
                                </p>
                            </div>
                        </div>
                        <span style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                            background: suscripcion.Estado === 'ACTIVO' ? '#d4edda' : '#fff3cd',
                            color: suscripcion.Estado === 'ACTIVO' ? '#155724' : '#856404'
                        }}>{suscripcion.Estado}</span>
                    </div>
                    {planes.length > 0 && suscripcion.Plan !== 'PREMIUM' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {planes.filter(p => p.plan !== suscripcion.Plan).map(p => (
                                <a key={p.plan} href="/panel-dueno"
                                    style={{
                                        padding: '7px 14px', borderRadius: '8px', textDecoration: 'none',
                                        background: p.plan === 'PREMIUM' ? '#8b5cf6' : p.plan === 'PRO' ? '#008060' : '#6b7280',
                                        color: 'white', fontWeight: 600, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px'
                                    }}>
                                    Mejorar a {PLAN_NAMES[p.plan] || p.plan} (S/ {Number(p.precio).toFixed(2)})
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {dashboard.proxima_liquidacion && (
                <div style={{
                    border: '1px solid #00806022', borderRadius: '12px', padding: '20px 24px',
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, color: '#059669', fontSize: '15px' }}>📄 Próxima Liquidación</h4>
                        <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                            background: dashboard.proxima_liquidacion.estado === 'PENDIENTE' ? '#fff3cd' : '#d4edda',
                            color: dashboard.proxima_liquidacion.estado === 'PENDIENTE' ? '#856404' : '#155724'
                        }}>{dashboard.proxima_liquidacion.estado}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px' }}>
                        <div>
                            <span style={{ color: '#6b7280' }}>Período:</span>{' '}
                            <strong>{new Date(dashboard.proxima_liquidacion.fecha_inicio).toLocaleDateString('es-PE')}</strong>
                            {' — '}
                            <strong>{new Date(dashboard.proxima_liquidacion.fecha_fin).toLocaleDateString('es-PE')}</strong>
                        </div>
                        <div>
                            <span style={{ color: '#6b7280' }}>Monto Neto:</span>{' '}
                            <strong style={{ color: '#059669', fontSize: '16px' }}>
                                S/{parseFloat(dashboard.proxima_liquidacion.monto_neto || 0).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
