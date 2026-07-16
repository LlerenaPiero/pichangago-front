import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import { duenoService } from '../../services/duenoService';
import { localService } from '../../services/localService';
import { getImageUrl, FALLBACK_IMG } from '../../utils/imageUrl';
import { useSocket } from '../../hooks/useSocket';
import GestionLocales from '../../components/dueno/GestionLocales';
import DashboardDueno from '../../components/dueno/DashboardDueno';
import ReportesDueno from '../../components/dueno/ReportesDueno';
import AgendaDueno from '../../components/dueno/AgendaDueno';
import PerfilDueno from '../../components/dueno/PerfilDueno';
import PagosDueno from '../../components/dueno/PagosDueno';
import ReembolsosDueno from '../../components/dueno/ReembolsosDueno';
import ModalNuevaCancha from '../../components/dueno/ModalNuevaCancha';
import ModalGestionCancha from '../../components/dueno/ModalGestionCancha';
import ModalDetalleReserva from '../../components/dueno/ModalDetalleReserva';

export default function PanelDueno() {
    const [tabActiva, setTabActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [perfilConfigurado, setPerfilConfigurado] = useState(false);
    const [canchas, setCanchas] = useState([]);
    const [locales, setLocales] = useState([]);
    const [mensajeGlobal, setMensajeGlobal] = useState('');
    const [configVersion, setConfigVersion] = useState(0);

    const [mostrarFormNuevaCancha, setMostrarFormNuevaCancha] = useState(false);
    const [gestionCanchaId, setGestionCanchaId] = useState(null);
    const [reservaDetalleId, setReservaDetalleId] = useState(null);

    const inicializarRef = useRef(null);

    const { toasts, addToast, removeToast } = useToast();
    const handleMensaje = useCallback((msg) => {
        setMensajeGlobal(msg);
        const type = msg.includes('❌') ? 'error' : msg.includes('⚠️') ? 'warning' : 'success';
        addToast(msg, type);
    }, [addToast]);

    const handleNuevaReserva = useCallback((data) => {
        handleMensaje(`📩 Nueva reserva de ${data.jugadorNombre} en ${data.nombreCancha} (${data.horaInicio} - ${data.horaFin})`);
        if (inicializarRef.current) inicializarRef.current();
    }, [handleMensaje]);

    useSocket(handleNuevaReserva);

    const inicializarModuloDueno = async () => {
        setLoading(true);
        try {
            const [resCanchas, resLocales, resPerfil] = await Promise.all([
                duenoService.obtenerMisCanchas(),
                localService.listarMisLocales(),
                duenoService.obtenerPerfilFinanciero()
            ]);
            if (resLocales.status === 'success') setLocales(resLocales.data || []);
            if (resCanchas.status === 'success') {
                const unicas = Array.from(new Map((resCanchas.data || []).map(c => [c.ID_CANCHA, c])).values());
                setCanchas(unicas);
            } else {
                setCanchas([]);
            }
            const perfilOk = resPerfil.status === 'success' && (resPerfil.data?.RUC || resPerfil.data?.Ruc);
            setPerfilConfigurado(!!perfilOk);
        } catch (error) {
            console.error('🚨 Error de sincronización del panel:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        inicializarRef.current = inicializarModuloDueno;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        inicializarModuloDueno();
    }, []);

    useEffect(() => {
        if (!loading && perfilConfigurado && tabActiva === null) {
            setTabActiva(locales.length === 0 ? 'locales' : 'dashboard');
        }
    }, [loading, perfilConfigurado, locales, tabActiva]);

    const estadosCiclo = ['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA'];
    const estadosValidos = new Set(estadosCiclo);
    const etiquetaEstado = { DISPONIBLE: 'Pausar', MANTENIMIENTO: 'Dar de Baja', INACTIVA: 'Activar' };

    const handleToggleEstadoCancha = async (idCancha, estadoActual) => {
        const idx = estadosCiclo.indexOf(estadoActual);
        const nuevoEstado = idx === -1 ? 'DISPONIBLE' : estadosCiclo[(idx + 1) % estadosCiclo.length];
        const res = await duenoService.cambiarEstadoCancha(idCancha, nuevoEstado);
        if (res.status === 'success') {
            handleMensaje(nuevoEstado === 'DISPONIBLE' ? '▶️ Cancha activada.' : nuevoEstado === 'MANTENIMIENTO' ? '⏸️ Cancha en mantenimiento.' : '⛔ Cancha dada de baja.');
            inicializarModuloDueno();
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }} role="status"><h2>Sincronizando PichangaGO... ⚽</h2></div>;

    if (!perfilConfigurado) {
        return (
            <div style={{ padding: '80px 24px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                <PerfilDueno onActualizar={inicializarModuloDueno} modoOnboarding />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div role="tablist" aria-label="Secciones del panel de dueño" onKeyDown={e => {
                const tabs = ['dashboard', 'locales', 'canchas', 'agenda', 'reportes', 'pagos', 'reembolsos', 'perfil'];
                const idx = tabs.indexOf(tabActiva);
                if (e.key === 'ArrowRight') { e.preventDefault(); setTabActiva(tabs[(idx + 1) % tabs.length]); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); setTabActiva(tabs[(idx - 1 + tabs.length) % tabs.length]); }
            }} style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
                <button role="tab" aria-selected={tabActiva === 'dashboard'} tabIndex={tabActiva === 'dashboard' ? 0 : -1} onClick={() => setTabActiva('dashboard')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'dashboard' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'dashboard' ? '#008060' : '#666', fontSize: '14px' }}>📊 Resumen</button>
                <button role="tab" aria-selected={tabActiva === 'locales'} tabIndex={tabActiva === 'locales' ? 0 : -1} onClick={() => setTabActiva('locales')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'locales' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'locales' ? '#008060' : '#666', fontSize: '14px' }}>🏢 Locales</button>
                <button role="tab" aria-selected={tabActiva === 'canchas'} tabIndex={tabActiva === 'canchas' ? 0 : -1} onClick={() => setTabActiva('canchas')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'canchas' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'canchas' ? '#008060' : '#666', fontSize: '14px' }}>🏟️ Mis Canchas ({canchas.length})</button>
                <button role="tab" aria-selected={tabActiva === 'agenda'} tabIndex={tabActiva === 'agenda' ? 0 : -1} onClick={() => setTabActiva('agenda')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'agenda' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'agenda' ? '#008060' : '#666', fontSize: '14px' }}>📅 Agenda</button>
                <button role="tab" aria-selected={tabActiva === 'reportes'} tabIndex={tabActiva === 'reportes' ? 0 : -1} onClick={() => setTabActiva('reportes')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'reportes' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'reportes' ? '#008060' : '#666', fontSize: '14px' }}>📈 Reportes</button>
                <button role="tab" aria-selected={tabActiva === 'pagos'} tabIndex={tabActiva === 'pagos' ? 0 : -1} onClick={() => setTabActiva('pagos')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'pagos' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'pagos' ? '#008060' : '#666', fontSize: '14px' }}>💰 Pagos</button>
                <button role="tab" aria-selected={tabActiva === 'reembolsos'} tabIndex={tabActiva === 'reembolsos' ? 0 : -1} onClick={() => setTabActiva('reembolsos')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'reembolsos' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'reembolsos' ? '#008060' : '#666', fontSize: '14px' }}>↩️ Reembolsos</button>
                <button role="tab" aria-selected={tabActiva === 'perfil'} tabIndex={tabActiva === 'perfil' ? 0 : -1} onClick={() => { setTabActiva('perfil'); setConfigVersion(v => v + 1); }} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'perfil' ? '3px solid #008060' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'perfil' ? '#008060' : '#666', fontSize: '14px' }}>👤 Mi Perfil</button>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }} role="status">{mensajeGlobal}</div>

            {tabActiva === 'locales' && (
                <GestionLocales onMensaje={handleMensaje} onLocalCambio={inicializarModuloDueno} />
            )}

            {tabActiva === 'canchas' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <h3>Mis Canchas</h3>
                        <button onClick={() => setMostrarFormNuevaCancha(true)} style={{ background: '#008060', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Nueva Cancha</button>
                    </div>

                    {canchas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <h3>Aún no tienes canchas registradas.</h3>
                            <p style={{ color: 'gray' }}>Registra tu primera cancha para empezar a recibir reservas.</p>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Haz clic en <strong>"⚙️ Gestionar"</strong> para editar la cancha, configurar sus horarios o administrar fotos.</p>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {canchas.map((cancha) => (
                                    <div key={cancha.ID_CANCHA} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center', background: cancha.ESTADO === 'MANTENIMIENTO' ? '#fff3cd' : cancha.ESTADO === 'INACTIVA' ? '#f8d7da' : '#fff' }}>
                                        <img src={getImageUrl(cancha.Fotos?.[0]?.URL_FOTO)} alt={cancha.NOMBRE || 'Cancha'} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', background: '#eee' }}
                                            onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                                                🏟️ {cancha.NOMBRE}
                                                {cancha.TipoCodigo && <span style={{ fontSize: '12px', color: '#008060', marginLeft: '6px' }}>({cancha.TipoCodigo})</span>}
                                                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', marginLeft: '8px', background: cancha.ESTADO === 'DISPONIBLE' ? '#d4edda' : cancha.ESTADO === 'MANTENIMIENTO' ? '#fff3cd' : '#fee2e2', color: cancha.ESTADO === 'DISPONIBLE' ? 'green' : cancha.ESTADO === 'MANTENIMIENTO' ? '#856404' : 'red' }}>{cancha.ESTADO}</span>
                                            </h4>
                                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>📍 {cancha.LocalDireccion || cancha.DIRECCION} - {cancha.LocalDistrito || cancha.DISTRITO} {cancha.LocalNombre ? <span style={{ color: '#008060' }}>({cancha.LocalNombre})</span> : ''}</p>
                                            {cancha.TipoNombre && <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#475569' }}>⚽ {cancha.TipoNombre}</p>}
                                            <span style={{ fontSize: '13px' }}>Base S/{parseFloat(cancha.Precio_Base || cancha.PRECIO_BASE).toFixed(2)} | Prime S/{parseFloat(cancha.Precio_Prime || cancha.PRECIO_BASE).toFixed(2)} | Baja S/{parseFloat(cancha.Precio_Baja || cancha.PRECIO_BASE).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', minWidth: '130px' }}>
                                            <button onClick={() => setGestionCanchaId(cancha.ID_CANCHA)} style={{ background: '#1e2530', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>⚙️ Gestionar</button>
                                            <button onClick={() => handleToggleEstadoCancha(cancha.ID_CANCHA, cancha.ESTADO)} style={{ background: cancha.ESTADO === 'DISPONIBLE' ? '#ffc107' : !estadosValidos.has(cancha.ESTADO) || cancha.ESTADO === 'INACTIVA' ? '#28a745' : '#dc3545', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                                                {etiquetaEstado[cancha.ESTADO] || 'Activar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {tabActiva === 'agenda' && (
                <AgendaDueno
                    canchas={canchas}
                    onMensaje={handleMensaje}
                    onAbrirDetalleReserva={setReservaDetalleId}
                    onAbrirGestionCancha={(cancha) => setGestionCanchaId(cancha.ID_CANCHA)}
                />
            )}

            {tabActiva === 'dashboard' && <DashboardDueno />}

            {tabActiva === 'reportes' && <ReportesDueno onMensaje={handleMensaje} />}

            {tabActiva === 'pagos' && <PagosDueno onMensaje={handleMensaje} />}

            {tabActiva === 'reembolsos' && <ReembolsosDueno onMensaje={handleMensaje} />}

            {tabActiva === 'perfil' && (
                <PerfilDueno version={configVersion} onActualizar={inicializarModuloDueno} />
            )}

            {mostrarFormNuevaCancha && (
                <ModalNuevaCancha
                    locales={locales}
                    onCerrar={() => setMostrarFormNuevaCancha(false)}
                    onMensaje={handleMensaje}
                    onActualizar={inicializarModuloDueno}
                />
            )}

            {gestionCanchaId && (
                <ModalGestionCancha
                    canchaId={gestionCanchaId}
                    onCerrar={() => setGestionCanchaId(null)}
                    onMensaje={handleMensaje}
                    onActualizar={inicializarModuloDueno}
                />
            )}

            {reservaDetalleId && (
                <ModalDetalleReserva
                    idReserva={reservaDetalleId}
                    onCerrar={() => setReservaDetalleId(null)}
                />
            )}
        </div>
    );
}
