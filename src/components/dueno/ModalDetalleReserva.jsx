import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

function Badge({ children, color, bg }) {
    return (
        <span style={{
            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
            color: color || '#155724', background: bg || '#d4edda', display: 'inline-block'
        }}>{children}</span>
    );
}

function InfoRow({ label, value, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#6b7280' }}>{label}</span>
            <span style={{ fontWeight: '500', color: color || '#1f2937' }}>{value || '—'}</span>
        </div>
    );
}

function SectionCard({ title, icon, children }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px 0' }}>
                {icon} {title}
            </p>
            <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px 16px' }}>
                {children}
            </div>
        </div>
    );
}

export default function ModalDetalleReserva({ idReserva, onCerrar }) {
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [reservaDetalle, setReservaDetalle] = useState(null);

    useEffect(() => {
        if (!idReserva) return;
        (async () => {
            setCargandoDetalle(true);
            setReservaDetalle(null);
            try {
                const res = await duenoService.obtenerDetalleReserva(idReserva);
                setReservaDetalle(res.status === 'success' && res.data ? res.data : null);
            } catch {
                setReservaDetalle(null);
            } finally {
                setCargandoDetalle(false);
            }
        })();
    }, [idReserva]);

    if (!idReserva) return null;

    const estadoColores = {
        CONFIRMADA: { color: '#155724', bg: '#d4edda' },
        PENDIENTE: { color: '#856404', bg: '#fff3cd' },
        CANCELADA: { color: '#b91c1c', bg: '#fee2e2' },
        NO_SHOW: { color: '#c62828', bg: '#fce4ec' }
    };
    const ec = estadoColores[reservaDetalle?.EstadoReserva] || { color: '#6b7280', bg: '#f3f4f6' };

    const pagoColores = {
        PAGADO: { color: '#155724', bg: '#d4edda' },
        PENDIENTE: { color: '#856404', bg: '#fff3cd' },
        RECHAZADO: { color: '#b91c1c', bg: '#fee2e2' }
    };
    const pc = pagoColores[reservaDetalle?.EstadoPago] || { color: '#6b7280', bg: '#f3f4f6' };

    return (
        <div role="dialog" aria-modal="true" aria-label="Detalle de reserva"
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
                alignItems: 'center', zIndex: 2000, padding: '16px'
            }} onClick={onCerrar}>
            <div style={{
                background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%',
                maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
                    background: '#f9fafb', borderRadius: '16px 16px 0 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>📋</span>
                        <h3 style={{ margin: 0, fontSize: '17px', color: '#1f2937' }}>Detalle de Reserva</h3>
                    </div>
                    <button onClick={onCerrar} aria-label="Cerrar"
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                            background: '#e5e7eb', cursor: 'pointer', fontSize: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#6b7280', fontWeight: 'bold'
                        }}>✕</button>
                </div>

                <div style={{ padding: '20px 24px' }}>
                    {cargandoDetalle ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                            <p style={{ color: '#6b7280', margin: 0 }}>Cargando detalle...</p>
                        </div>
                    ) : reservaDetalle ? (
                        <>
                            <div style={{
                                display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'
                            }}>
                                <Badge {...ec}>{reservaDetalle.EstadoReserva}</Badge>
                                {reservaDetalle.EstadoPago && <Badge {...pc}>{reservaDetalle.EstadoPago}</Badge>}
                            </div>

                            <SectionCard title="Jugador" icon="👤">
                                <InfoRow label="Nombre" value={`${reservaDetalle.JugadorNombre || ''} ${reservaDetalle.JugadorApellido || ''}`.trim()} />
                                <InfoRow label="Email" value={reservaDetalle.JugadorEmail} />
                                <InfoRow label="Teléfono" value={reservaDetalle.JugadorTelefono} />
                            </SectionCard>

                            <SectionCard title="Cancha" icon="🏟️">
                                <InfoRow label="Cancha" value={reservaDetalle.CanchaNombre} />
                                <InfoRow label="Dirección" value={`${reservaDetalle.Direccion || ''}, ${reservaDetalle.Distrito || ''}`} />
                                <InfoRow label="Fecha" value={reservaDetalle.FechaSlot ? new Date(reservaDetalle.FechaSlot + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
                                <InfoRow label="Horario" value={`${reservaDetalle.Hora_Inicio} — ${reservaDetalle.Hora_Fin}`} />
                            </SectionCard>

                            <SectionCard title="Pago" icon="💳">
                                <InfoRow label="Precio Base" value={`S/ ${parseFloat(reservaDetalle.Precio_Base || 0).toFixed(2)}`} />
                                <InfoRow label="Comisión QR" value={`S/ ${parseFloat(reservaDetalle.Comi_Qr || 0).toFixed(2)}`} />
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '8px 0 0 0',
                                    fontSize: '15px', fontWeight: '700', color: '#059669',
                                    borderTop: '2px solid #d1fae5', marginTop: '4px'
                                }}>
                                    <span>Total</span>
                                    <span>S/ {parseFloat(reservaDetalle.Monto_Total || 0).toFixed(2)}</span>
                                </div>
                                {reservaDetalle.MontoPagado > 0 && (
                                    <InfoRow label="Monto Pagado" value={`S/ ${parseFloat(reservaDetalle.MontoPagado).toFixed(2)}`} />
                                )}
                                {reservaDetalle.Fecha_Proces && (
                                    <InfoRow label="Procesado" value={new Date(reservaDetalle.Fecha_Proces).toLocaleString('es-PE')} />
                                )}
                            </SectionCard>

                            {reservaDetalle.EstadoReserva === 'CANCELADA' && (
                                <SectionCard title="Cancelación" icon="🚫">
                                    <InfoRow label="Fecha" value={reservaDetalle.Fecha_Cancel ? new Date(reservaDetalle.Fecha_Cancel).toLocaleString('es-PE') : '—'} />
                                    <InfoRow label="Zona" value={reservaDetalle.Zona_Cancela} />
                                    <InfoRow label="% Reembolso" value={`${reservaDetalle.Porcen_Reemb || 0}%`} />
                                </SectionCard>
                            )}

                            {reservaDetalle.EstadoReserva === 'NO_SHOW' && (
                                <SectionCard title="No Show" icon="🚫">
                                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                        El jugador no asistió a la reserva.
                                    </p>
                                </SectionCard>
                            )}

                            {reservaDetalle.ComprobanteURL && (
                                <div style={{ marginTop: '16px' }}>
                                    <a href={reservaDetalle.ComprobanteURL} target="_blank" rel="noopener noreferrer"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            background: '#1e2530', color: '#fff', padding: '10px', borderRadius: '8px',
                                            textDecoration: 'none', fontSize: '14px', fontWeight: '600'
                                        }}>
                                        📎 Ver Comprobante
                                    </a>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>❌</div>
                            <p style={{ color: '#6b7280', margin: 0 }}>No se pudo cargar el detalle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
