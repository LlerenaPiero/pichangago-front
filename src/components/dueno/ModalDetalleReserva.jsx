import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

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

    return (
        <div role="dialog" aria-modal="true" aria-label="Detalle de reserva" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }} onClick={onCerrar}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>📋 Detalle de Reserva</h3>
                    <button onClick={onCerrar} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
                </div>
                {cargandoDetalle ? (
                    <p style={{ color: '#999' }}>Cargando...</p>
                ) : reservaDetalle ? (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <div><strong>👤 Jugador:</strong> {reservaDetalle.JugadorNombre} {reservaDetalle.JugadorApellido}</div>
                        <div><strong>📧 Email:</strong> {reservaDetalle.JugadorEmail || '—'}</div>
                        <div><strong>📞 Teléfono:</strong> {reservaDetalle.JugadorTelefono || '—'}</div>
                        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                        <div><strong>🏟️ Cancha:</strong> {reservaDetalle.CanchaNombre}</div>
                        <div><strong>📍 Dirección:</strong> {reservaDetalle.Direccion}, {reservaDetalle.Distrito}</div>
                        <div><strong>📅 Fecha:</strong> {reservaDetalle.FechaSlot ? new Date(reservaDetalle.FechaSlot + 'T12:00:00').toLocaleDateString('es-PE') : '—'}</div>
                        <div><strong>⏰ Horario:</strong> {reservaDetalle.Hora_Inicio} - {reservaDetalle.Hora_Fin}</div>
                        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                        <div><strong>💰 Precio Base:</strong> S/{parseFloat(reservaDetalle.Precio_Base || 0).toFixed(2)}</div>
                        <div><strong>💳 Comisión QR:</strong> S/{parseFloat(reservaDetalle.Comi_Qr || 0).toFixed(2)}</div>
                        <div><strong>🧾 Total:</strong> <strong style={{ color: '#00b48a' }}>S/{parseFloat(reservaDetalle.Monto_Total || 0).toFixed(2)}</strong></div>
                        {reservaDetalle.EstadoPago && (
                            <>
                                <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
                                <div><strong>💳 Pago:</strong> <span style={{ color: reservaDetalle.EstadoPago === 'PAGADO' ? 'green' : 'orange', fontWeight: 'bold' }}>{reservaDetalle.EstadoPago}</span></div>
                                <div><strong>💰 Monto Pagado:</strong> S/{parseFloat(reservaDetalle.MontoPagado || 0).toFixed(2)}</div>
                                {reservaDetalle.Fecha_Proces && <div><strong>🕐 Procesado:</strong> {new Date(reservaDetalle.Fecha_Proces).toLocaleString('es-PE')}</div>}
                            </>
                        )}
                        <div><strong>📌 Estado:</strong> <span style={{ color: reservaDetalle.EstadoReserva === 'CONFIRMADA' ? 'green' : reservaDetalle.EstadoReserva === 'CANCELADA' ? 'red' : 'orange', fontWeight: 'bold' }}>{reservaDetalle.EstadoReserva}</span></div>
                        {reservaDetalle.EstadoReserva === 'CANCELADA' && (
                            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>
                                <div><strong>🚫 Cancelada:</strong> {reservaDetalle.Fecha_Cancel ? new Date(reservaDetalle.Fecha_Cancel).toLocaleString('es-PE') : '—'}</div>
                                <div><strong>📍 Zona:</strong> {reservaDetalle.Zona_Cancela || '—'}</div>
                                <div><strong>🔁 % Reembolso:</strong> {reservaDetalle.Porcen_Reemb || '0'}%</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p style={{ color: '#999' }}>No se pudo cargar el detalle.</p>
                )}
            </div>
        </div>
    );
}
