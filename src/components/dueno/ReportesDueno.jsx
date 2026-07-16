import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';

export default function ReportesDueno({ onMensaje }) {
    const [tabReporte, setTabReporte] = useState('ingresos');

    return (
        <div>
            <h3>📈 Reportes de Gestión</h3>
            <div role="tablist" aria-label="Tipos de reporte" style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
                {[
                    { key: 'ingresos', label: '💰 Ingresos' },
                    { key: 'saldo', label: '💳 Saldo Pendiente' },
                    { key: 'liquidaciones', label: '📄 Liquidaciones' },
                    { key: 'ocupacion', label: '📊 Ocupación' },
                    { key: 'historial', label: '📋 Historial Reservas' }
                ].map(tab => (
                    <button key={tab.key} role="tab" aria-selected={tabReporte === tab.key} tabIndex={tabReporte === tab.key ? 0 : -1} onClick={() => setTabReporte(tab.key)} onKeyDown={e => {
                        const tabs = ['ingresos', 'saldo', 'liquidaciones', 'ocupacion', 'historial'];
                        const idx = tabs.indexOf(tabReporte);
                        if (e.key === 'ArrowRight') { e.preventDefault(); setTabReporte(tabs[(idx + 1) % tabs.length]); }
                        if (e.key === 'ArrowLeft') { e.preventDefault(); setTabReporte(tabs[(idx - 1 + tabs.length) % tabs.length]); }
                    }} style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: tabReporte === tab.key ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabReporte === tab.key ? '#008060' : '#666', fontSize: '14px' }}>{tab.label}</button>
                ))}
            </div>

            {tabReporte === 'ingresos' && <ReporteIngresos onMensaje={onMensaje} />}
            {tabReporte === 'saldo' && <ReporteSaldoPendiente />}
            {tabReporte === 'liquidaciones' && <ReporteLiquidaciones />}
            {tabReporte === 'ocupacion' && <ReporteOcupacion />}
            {tabReporte === 'historial' && <ReporteHistorialReservas />}
        </div>
    );
}

function ReporteIngresos({ onMensaje }) {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const hoyStr = hoy.toISOString().split('T')[0];
    const [fechaInicio, setFechaInicio] = useState(inicioMes);
    const [fechaFin, setFechaFin] = useState(hoyStr);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const buscar = async () => {
        setLoading(true);
        const res = await duenoService.obtenerReporteIngresos(fechaInicio, fechaFin);
        setData(res.status === 'success' && res.data ? res.data : null);
        if (res.status !== 'success') onMensaje('❌ Error al cargar reporte de ingresos.');
        setLoading(false);
    };

    return (
        <div>
            <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>💰 Reporte de Ingresos</strong> — Revisa el detalle de todo el dinero generado por tus canchas en un período. 
                    Las <strong>comisiones</strong> son el porcentaje que cobra PichangaGO por cada reserva, y el <strong>neto</strong> 
                    es lo que finalmente recibirás.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div><label htmlFor="rep-ing-fechaInicio" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Desde:</label><input id="rep-ing-fechaInicio" type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
                <div><label htmlFor="rep-ing-fechaFin" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Hasta:</label><input id="rep-ing-fechaFin" type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
                <button onClick={buscar} disabled={loading} style={{ background: loading ? '#ccc' : '#1e2530', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Buscando...' : '🔍 Buscar'}</button>
            </div>

            {data && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                        <ResumenCard label="Reservas Realizadas" value={data.total_reservas} color="#3b82f6" subtitle={`En el período seleccionado`} />
                        <ResumenCard label="Total Ingresos (Bruto)" value={`S/${parseFloat(data.total_ingresos || 0).toFixed(2)}`} color="#22c55e" subtitle="Suma de montos pagados" />
                        <ResumenCard label="Comisiones PichangaGO" value={`S/${parseFloat(data.total_comisiones || 0).toFixed(2)}`} color="#ef4444" subtitle={data.total_reservas > 0 ? `~S/${(parseFloat(data.total_comisiones || 0) / data.total_reservas).toFixed(2)} por reserva` : ''} />
                        <ResumenCard label="Neto a Recibir" value={`S/${parseFloat(data.total_neto || 0).toFixed(2)}`} color="#008060" subtitle="Ingresos − Comisiones" />
                    </div>

                    {data.reservas && data.reservas.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead><tr style={{ background: '#1e2530', color: 'white' }}>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Cancha</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Jugador</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Fecha</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Hora</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Monto</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Pago</th>
                                    <th style={{ padding: '8px', border: '1px solid #333' }}>Estado</th>
                                </tr></thead>
                                <tbody>
                                    {data.reservas.map(r => (
                                        <tr key={r.ID_RESERVA} style={{ textAlign: 'center' }}>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.CanchaNombre}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.JugadorNombre} {r.JugadorApellido}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.FechaSlot ? new Date(r.FechaSlot + 'T12:00:00').toLocaleDateString('es-PE') : '—'}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.Hora_Inicio} - {r.Hora_Fin}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>S/{parseFloat(r.MONTO_TOTAL || 0).toFixed(2)}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}><span style={{ color: r.EstadoPago === 'PAGADO' ? 'green' : 'orange', fontWeight: 'bold' }}>{r.EstadoPago || '—'}</span></td>
                                            <td style={{ padding: '8px', border: '1px solid #ddd' }}><EstadoReservaBadge estado={r.EstadoReserva} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No hay reservas en este período.</p>
                    )}
                </>
            )}
        </div>
    );
}

function ReporteSaldoPendiente() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await duenoService.obtenerSaldoPendiente();
            setData(res.status === 'success' && res.data ? res.data : null);
            setLoading(false);
        })();
    }, []);

    if (loading) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Cargando...</p>;
    if (!data) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No hay datos disponibles.</p>;

    return (
        <div>
            <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>💳 Saldo Pendiente</strong> — Aquí ves el dinero que está por liquidarse. 
                    Una <strong>liquidación</strong> es el proceso donde juntamos todas las reservas de un período, 
                    descontamos las comisiones y te transferimos el neto a tu cuenta bancaria.
                </p>
            </div>

            {data.liquidacion_pendiente && (
                <div style={{ border: '1px solid #f59e0b33', borderRadius: '10px', padding: '20px', background: '#fffbeb', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🕐</span>
                        <div>
                            <h4 style={{ margin: 0, color: '#d97706' }}>Liquidación Pendiente</h4>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#a16207' }}>Reservas agrupadas para transferencia bancaria</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                        <div><strong>Período:</strong><br />{new Date(data.liquidacion_pendiente.periodo.inicio).toLocaleDateString('es-PE')} — {new Date(data.liquidacion_pendiente.periodo.fin).toLocaleDateString('es-PE')}</div>
                        <div><strong>Monto Bruto (reservas):</strong><br />S/{parseFloat(data.liquidacion_pendiente.monto_bruto || 0).toFixed(2)}</div>
                        <div><strong>Comisión PichangaGO:</strong><br /><span style={{ color: '#dc2626' }}>-S/{parseFloat(data.liquidacion_pendiente.comision_pgo || 0).toFixed(2)}</span></div>
                        <div><strong>Neto a Transferir:</strong><br /><span style={{ fontWeight: 'bold', color: '#008060', fontSize: '20px' }}>S/{parseFloat(data.liquidacion_pendiente.monto_neto || 0).toFixed(2)}</span></div>
                    </div>
                </div>
            )}
            {data.suscripcion && (
                <div style={{ border: '1px solid #3b82f633', borderRadius: '10px', padding: '20px', background: '#eff6ff', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '24px' }}>📋</span>
                        <div>
                            <h4 style={{ margin: 0, color: '#2563eb' }}>Suscripción</h4>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Tu plan actual en PichangaGO</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                        <div><strong>Plan:</strong> {data.suscripcion.plan}</div>
                        <div><strong>Precio Mensual:</strong> S/{parseFloat(data.suscripcion.precio_mensual || 0).toFixed(2)}</div>
                        <div><strong>Canchas incluidas:</strong> {data.suscripcion.cantidad_canchas}</div>
                    </div>
                </div>
            )}
            {data.fecha_estimada_transferencia && (
                <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '14px', fontSize: '14px' }}>
                    📅 <strong>Fecha estimada de transferencia:</strong>{' '}
                    {new Date(data.fecha_estimada_transferencia + 'T12:00:00').toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    <span style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>El dinero se depositará en tu cuenta registrada (CCI) en esta fecha.</span>
                </div>
            )}
        </div>
    );
}

function ReporteLiquidaciones() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const res = await duenoService.obtenerHistorialLiquidaciones();
            setData(res.status === 'success' && res.data ? res.data : []);
            setLoading(false);
        })();
    }, []);

    if (loading) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Cargando...</p>;
    if (!data || data.length === 0) return <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No hay liquidaciones registradas.</p>;

    return (
        <div>
            <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>📄 Historial de Liquidaciones</strong> — Cada fila representa un período en el que agrupamos tus reservas 
                    y te transferimos el dinero. <strong>Pendiente</strong> = en proceso, <strong>Pagada</strong> = ya transferida a tu cuenta.
                </p>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead><tr style={{ background: '#1e2530', color: 'white' }}>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Período</th>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Bruto (Reservas)</th>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Comisión</th>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Neto Recibido</th>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Transferencia</th>
                        <th style={{ padding: '8px', border: '1px solid #333' }}>Estado</th>
                    </tr></thead>
                    <tbody>
                        {data.map(liq => (
                            <tr key={liq.ID_LIQUIDACION} style={{ textAlign: 'center' }}>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Date(liq.FECHA_INICIO).toLocaleDateString('es-PE')} - {new Date(liq.FECHA_FIN).toLocaleDateString('es-PE')}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>S/{parseFloat(liq.MONTO_BRUTO || 0).toFixed(2)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', color: '#dc2626' }}>-S/{parseFloat(liq.COMISION_PGO || 0).toFixed(2)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#008060' }}>S/{parseFloat(liq.MONTO_NETO || 0).toFixed(2)}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{liq.FECHA_TRANSF ? new Date(liq.FECHA_TRANSF).toLocaleDateString('es-PE') : '—'}</td>
                                <td style={{ padding: '8px', border: '1px solid #ddd' }}><span style={{ padding: '3px 8px', borderRadius: '12px', background: liq.ESTADO === 'PAGADA' ? '#d4edda' : '#fff3cd', color: liq.ESTADO === 'PAGADA' ? '#155724' : '#856404', fontWeight: 'bold', fontSize: '12px' }}>{liq.ESTADO === 'PAGADA' ? '✅ Pagada' : '⏳ Pendiente'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReporteOcupacion() {
    const hoy = new Date();
    const [mes, setMes] = useState(hoy.getMonth() + 1);
    const [anio, setAnio] = useState(hoy.getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const buscar = async () => {
        setLoading(true);
        const res = await duenoService.obtenerEstadisticasOcupacion(mes, anio);
        setData(res.status === 'success' && res.data ? res.data : null);
        setLoading(false);
    };

    const totalOcupados = data ? (data.por_dia_semana || []).reduce((sum, d) => sum + (d.ocupados || 0), 0) : 0;
    const totalSlots = data ? (data.por_dia_semana || []).reduce((sum, d) => sum + (d.total_slots || 0), 0) : 0;
    const overallPct = totalSlots > 0 ? Math.round((totalOcupados / totalSlots) * 100) : 0;

    return (
        <div>
            <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>📊 ¿Qué es la ocupación?</strong> Mide el porcentaje de tus <strong>slots disponibles</strong> que 
                    están siendo <strong>reservados</strong> en un mes. Una ocupación alta significa que tus canchas tienen buena 
                    demanda. Úsalo para identificar qué días y horarios rinden mejor y ajusta tus precios u ofertas donde sea necesario.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div><label htmlFor="rep-ocu-mes" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Mes:</label>
                    <select id="rep-ocu-mes" value={mes} onChange={e => setMes(parseInt(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <option key={m} value={m}>{new Date(anio, m - 1).toLocaleString('es-PE', { month: 'long' })}</option>)}
                    </select>
                </div>
                <div><label htmlFor="rep-ocu-anio" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Año:</label>
                    <input id="rep-ocu-anio" type="number" min={2024} max={2030} value={anio} onChange={e => setAnio(parseInt(e.target.value) || hoy.getFullYear())} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }} />
                </div>
                <button onClick={buscar} disabled={loading} style={{ background: loading ? '#ccc' : '#1e2530', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? '...' : '🔍 Consultar'}</button>
            </div>

            {data && (
                <>
                    {totalSlots > 0 && (
                        <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '18px', marginBottom: '20px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '40px', lineHeight: 1 }}>{overallPct > 70 ? '🚀' : overallPct > 40 ? '📈' : '📉'}</div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '28px', color: '#92400e' }}>{overallPct}%</span>
                                    <span style={{ fontSize: '14px', color: '#a16207' }}>de ocupación general</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#a16207', marginTop: '2px' }}>
                                    {totalOcupados} de {totalSlots} slots reservados en {new Date(anio, mes - 1).toLocaleString('es-PE', { month: 'long' })}
                                </div>
                                <div style={{ fontSize: '12px', color: '#a16207', marginTop: '4px', padding: '4px 10px', background: '#fef3c7', borderRadius: '6px', display: 'inline-block' }}>
                                    {overallPct > 70 ? '✅ Buena demanda. Considera aumentar precios en horas pico.'
                                        : overallPct > 40 ? '💡 Demanda moderada. Promociona horarios libres con ofertas.'
                                        : '⚠️ Baja ocupación. Revisa tus precios y horarios disponibles.'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {data.por_dia_semana && data.por_dia_semana.length > 0 && (
                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px' }}>
                                <h4 style={{ margin: '0 0 2px', fontSize: '15px' }}>📅 Por Día de Semana</h4>
                                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6b7280' }}>¿Qué días se reserva más? Ajusta precios según la demanda de cada día.</p>
                                <BarraOcupacion data={data.por_dia_semana} labelKey="dia_nombre" />
                            </div>
                        )}
                        {data.por_franja && data.por_franja.length > 0 && (
                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px' }}>
                                <h4 style={{ margin: '0 0 2px', fontSize: '15px' }}>⏰ Por Franja Horaria</h4>
                                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6b7280' }}>Identifica tus horas pico (más demanda) y horas valle (menos demanda) para ajustar tarifas.</p>
                                <BarraOcupacion data={data.por_franja} labelKey="franja" />
                            </div>
                        )}
                        {data.por_mes && data.por_mes.length > 0 && (
                            <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '18px' }}>
                                <h4 style={{ margin: '0 0 2px', fontSize: '15px' }}>📆 Tendencia Mensual</h4>
                                <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6b7280' }}>Evolución de la ocupación mes a mes. Detecta temporadas altas y bajas.</p>
                                <BarraOcupacion data={data.por_mes} labelKey={d => `${new Date(d.anio, d.mes - 1).toLocaleString('es-PE', { month: 'short' })} ${d.anio}`} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', color: '#666', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e', display: 'inline-block' }}></span> Alta (&gt;70%) — Buena demanda</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b', display: 'inline-block' }}></span> Media (40–70%) — Demanda moderada</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6', display: 'inline-block' }}></span> Baja (&lt;40%) — Poca demanda</span>
                    </div>
                </>
            )}
        </div>
    );
}

function BarraOcupacion({ data, labelKey }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.map((d, i) => {
                const label = typeof labelKey === 'function' ? labelKey(d) : d[labelKey];
                const pct = Math.min(d.porcentaje || 0, 100);
                const color = pct > 70 ? '#22c55e' : pct > 40 ? '#f59e0b' : '#3b82f6';
                return (
                    <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 500 }}>{label}</span>
                            <span style={{ fontWeight: 'bold', color }}>{d.ocupados}/{d.total_slots} slots — {pct}%</span>
                        </div>
                        <div style={{ background: '#eee', borderRadius: '6px', height: '22px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.3s', minWidth: pct > 0 ? '16px' : 0 }}></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function ReporteHistorialReservas() {
    const [filtros, setFiltros] = useState({ fecha_desde: '', fecha_hasta: '', estado: '' });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buscado, setBuscado] = useState(false);

    const buscar = async () => {
        setLoading(true);
        setBuscado(true);
        const res = await duenoService.obtenerHistorialReservas(filtros);
        setData(res.status === 'success' && res.data ? res.data : []);
        setLoading(false);
    };

    return (
        <div>
            <div style={{ background: '#f0fdfa', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    <strong>📋 Historial de Reservas</strong> — Busca y revisa todas las reservas de tus canchas. 
                    Filtra por rango de fechas y estado para encontrar rápidamente lo que necesitas.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div><label htmlFor="rep-his-desde" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Desde:</label><input id="rep-his-desde" type="date" value={filtros.fecha_desde} onChange={e => setFiltros({...filtros, fecha_desde: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
                <div><label htmlFor="rep-his-hasta" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Hasta:</label><input id="rep-his-hasta" type="date" value={filtros.fecha_hasta} onChange={e => setFiltros({...filtros, fecha_hasta: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
                <div><label htmlFor="rep-his-estado" style={{ fontWeight: 'bold', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Estado:</label>
                    <select id="rep-his-estado" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="">Todos</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="NO_SHOW">No Show</option>
                    </select>
                </div>
                <button onClick={buscar} disabled={loading} style={{ background: loading ? '#ccc' : '#1e2530', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? '...' : '🔍 Buscar'}</button>
            </div>

            {buscado && (
                loading ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Buscando...</p> :
                !data || data.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No se encontraron reservas.</p> :
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead><tr style={{ background: '#1e2530', color: 'white' }}>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Cancha</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Jugador</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Fecha</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Hora</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Total</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Pago</th>
                            <th style={{ padding: '8px', border: '1px solid #333' }}>Estado</th>
                        </tr></thead>
                        <tbody>
                            {data.map(r => (
                                <tr key={r.ID_RESERVA} style={{ textAlign: 'center' }}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.CanchaNombre}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.JugadorNombre} {r.JugadorApellido}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.FechaSlot ? new Date(r.FechaSlot + 'T12:00:00').toLocaleDateString('es-PE') : '—'}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{r.Hora_Inicio} - {r.Hora_Fin}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>S/{parseFloat(r.MONTO_TOTAL || 0).toFixed(2)}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><span style={{ color: r.EstadoPago === 'PAGADO' ? 'green' : 'orange', fontWeight: 'bold' }}>{r.EstadoPago || '—'}</span></td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd' }}><EstadoReservaBadge estado={r.EstadoReserva} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function ResumenCard({ label, value, color, subtitle }) {
    return (
        <div style={{ border: `1px solid ${color}33`, borderRadius: '8px', padding: '16px', background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
            {subtitle && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{subtitle}</div>}
        </div>
    );
}

function EstadoReservaBadge({ estado }) {
    const config = {
        CONFIRMADA: { bg: '#d4edda', color: '#155724' },
        PENDIENTE: { bg: '#fff3cd', color: '#856404' },
        CANCELADA: { bg: '#fee2e2', color: '#b91c1c' },
        NO_SHOW: { bg: '#fce4ec', color: '#c62828' }
    };
    const c = config[estado] || { bg: '#f0f0f0', color: '#666' };
    return <span style={{ padding: '3px 8px', borderRadius: '12px', background: c.bg, color: c.color, fontWeight: 'bold', fontSize: '12px' }}>{estado || '—'}</span>;
}
