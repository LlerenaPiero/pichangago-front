import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ToastContainer';
import { duenoService } from '../../services/duenoService';
import { localService } from '../../services/localService';
import { getImageUrl } from '../../utils/imageUrl';
import { formatValidationErrors } from '../../utils/validationErrors';
import { useSocket } from '../../hooks/useSocket';
import GestionLocales from '../../components/dueno/GestionLocales';
import DashboardDueno from '../../components/dueno/DashboardDueno';
import ReportesDueno from '../../components/dueno/ReportesDueno';
import AgendaDueno from '../../components/dueno/AgendaDueno';
import ConfigDueno from '../../components/dueno/ConfigDueno';
import ModalNuevaCancha from '../../components/dueno/ModalNuevaCancha';
import ModalGestionCancha from '../../components/dueno/ModalGestionCancha';
import ModalDetalleReserva from '../../components/dueno/ModalDetalleReserva';

export default function PanelDueno() {
    const [tabActiva, setTabActiva] = useState('canchas');
    const [loading, setLoading] = useState(true);
    const [perfilConfigurado, setPerfilConfigurado] = useState(false);
    const [canchas, setCanchas] = useState([]);
    const [locales, setLocales] = useState([]);
    const [mensajeGlobal, setMensajeGlobal] = useState('');
    const [configVersion, setConfigVersion] = useState(0);

    const [mostrarFormNuevaCancha, setMostrarFormNuevaCancha] = useState(false);
    const [gestionCanchaId, setGestionCanchaId] = useState(null);
    const [reservaDetalleId, setReservaDetalleId] = useState(null);

    const [datosFinancieros, setDatosFinancieros] = useState({ ruc: '', razonSocial: '', cci: '', banco: 'BCP' });

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
            const [resCanchas, resLocales] = await Promise.all([
                duenoService.obtenerMisCanchas(),
                localService.listarMisLocales()
            ]);
            if (resLocales.status === 'success') setLocales(resLocales.data || []);
            if (resCanchas.status === 'success') {
                setPerfilConfigurado(true);
                setCanchas(resCanchas.data || []);
            } else {
                setPerfilConfigurado(false);
                setCanchas([]);
            }
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

    const handleToggleEstadoCancha = async (idCancha, estadoActual) => {
        const nuevoEstado = estadoActual === 'DISPONIBLE' ? 'SUSPENDIDO' : 'DISPONIBLE';
        const res = await duenoService.cambiarEstadoCancha(idCancha, nuevoEstado);
        if (res.status === 'success') {
            handleMensaje(nuevoEstado === 'SUSPENDIDO' ? '⏸️ Cancha suspendida.' : '▶️ Cancha activada.');
            inicializarModuloDueno();
        }
    };

    const handleOnboardingFinanciero = async (e) => {
        e.preventDefault();
        if (!/^(10|20)\d{9}$/.test(datosFinancieros.ruc)) {
            handleMensaje('⚠️ RUC inválido. Debe tener 11 dígitos, iniciar con 10 (natural) o 20 (jurídico).');
            return;
        }
        if (!/^\d{20}$/.test(datosFinancieros.cci)) {
            handleMensaje('⚠️ El CCI debe tener exactamente 20 dígitos numéricos.');
            return;
        }
        const res = await duenoService.actualizarPerfilFinanciero(datosFinancieros);
        if (res.status === 'success') {
            handleMensaje('🎉 ¡Perfil Financiero guardado! Ahora registra un local.');
            setPerfilConfigurado(true);
            setTabActiva('locales');
            inicializarModuloDueno();
        } else {
            handleMensaje(`❌ ${formatValidationErrors(res)}`);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }} role="status"><h2>Sincronizando PichangaGO... ⚽</h2></div>;

    if (!perfilConfigurado && canchas.length === 0) {
        return (
            <div style={{ padding: '100px 24px', maxWidth: '550px', margin: '0 auto', fontFamily: 'Arial' }}>
                <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>💳 Configuración de Pagos</h2>
                <p style={{ color: 'gray', marginBottom: '20px' }}>Tu cuenta de dueño está casi lista. Solo necesitamos tus datos bancarios para depositar tus ganancias.</p>
                <form onSubmit={handleOnboardingFinanciero} style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '8px', background: '#fff' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>📋 RUC <span style={{ color: 'red' }}>*</span>:</label>
                        <input type="text" maxLength={11} required placeholder="12345678901" style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => /^\d*$/.test(e.target.value) && setDatosFinancieros({ ...datosFinancieros, ruc: e.target.value })} />
                        <span style={{ fontSize: '11px', color: '#888' }}>11 dígitos — inicia con 10 (natural) o 20 (jurídico)</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>🏢 Razón Social <span style={{ color: 'red' }}>*</span>:</label>
                        <input type="text" required placeholder="Ej: Mi Empresa SAC" maxLength={100} style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => setDatosFinancieros({ ...datosFinancieros, razonSocial: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>🏦 Banco <span style={{ color: 'red' }}>*</span>:</label>
                        <select style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => setDatosFinancieros({ ...datosFinancieros, banco: e.target.value })}>
                            <option value="BCP">BCP</option><option value="Interbank">Interbank</option><option value="BBVA">BBVA</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label>🔢 CCI <span style={{ color: 'red' }}>*</span>:</label>
                        <input type="text" maxLength={20} required placeholder="12345678901234567890" style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => /^\d*$/.test(e.target.value) && setDatosFinancieros({ ...datosFinancieros, cci: e.target.value })} />
                        <span style={{ fontSize: '11px', color: '#888' }}>20 dígitos, solo números</span>
                    </div>
                    <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', width: '100%', fontWeight: 'bold', cursor: 'pointer' }}>Guardar e Ir al Panel</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div role="tablist" aria-label="Secciones del panel de dueño" onKeyDown={e => {
                const tabs = ['locales', 'canchas', 'agenda', 'dashboard', 'reportes', 'config'];
                const idx = tabs.indexOf(tabActiva);
                if (e.key === 'ArrowRight') { e.preventDefault(); setTabActiva(tabs[(idx + 1) % tabs.length]); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); setTabActiva(tabs[(idx - 1 + tabs.length) % tabs.length]); }
            }} style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '25px', gap: '12px', flexWrap: 'wrap' }}>
                <button role="tab" aria-selected={tabActiva === 'locales'} tabIndex={tabActiva === 'locales' ? 0 : -1} onClick={() => setTabActiva('locales')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'locales' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'locales' ? '#00b48a' : '#666', fontSize: '14px' }}>🏢 Locales</button>
                <button role="tab" aria-selected={tabActiva === 'canchas'} tabIndex={tabActiva === 'canchas' ? 0 : -1} onClick={() => setTabActiva('canchas')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'canchas' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'canchas' ? '#00b48a' : '#666', fontSize: '14px' }}>🏟️ Canchas ({canchas.length})</button>
                <button role="tab" aria-selected={tabActiva === 'agenda'} tabIndex={tabActiva === 'agenda' ? 0 : -1} onClick={() => setTabActiva('agenda')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'agenda' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'agenda' ? '#00b48a' : '#666', fontSize: '14px' }}>📅 Agenda</button>
                <button role="tab" aria-selected={tabActiva === 'dashboard'} tabIndex={tabActiva === 'dashboard' ? 0 : -1} onClick={() => setTabActiva('dashboard')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'dashboard' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'dashboard' ? '#00b48a' : '#666', fontSize: '14px' }}>📊 Dashboard</button>
                <button role="tab" aria-selected={tabActiva === 'reportes'} tabIndex={tabActiva === 'reportes' ? 0 : -1} onClick={() => setTabActiva('reportes')} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'reportes' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'reportes' ? '#00b48a' : '#666', fontSize: '14px' }}>📈 Reportes</button>
                <button role="tab" aria-selected={tabActiva === 'config'} tabIndex={tabActiva === 'config' ? 0 : -1} onClick={() => { setTabActiva('config'); setConfigVersion(v => v + 1); }} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'config' ? '3px solid #00b48a' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'config' ? '#00b48a' : '#666', fontSize: '14px' }}>⚙️ Configuración</button>
            </div>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }} role="status">{mensajeGlobal}</div>

            {tabActiva === 'locales' && (
                <GestionLocales onMensaje={handleMensaje} />
            )}

            {tabActiva === 'canchas' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                        <h3>Mis Canchas</h3>
                        <button onClick={() => setMostrarFormNuevaCancha(true)} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Nueva Cancha</button>
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
                                    <div key={cancha.ID_Cancha} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', display: 'flex', gap: '20px', alignItems: 'center', background: cancha.Estado === 'SUSPENDIDO' ? '#f8d7da' : '#fff' }}>
                                        <img src={getImageUrl(cancha.Fotos?.[0]?.URL_Foto)} alt={cancha.Nombre || 'Cancha'} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', background: '#eee' }} />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
                                                🏟️ {cancha.Nombre}
                                                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', marginLeft: '8px', background: cancha.Estado === 'DISPONIBLE' ? '#d4edda' : '#fee2e2', color: cancha.Estado === 'DISPONIBLE' ? 'green' : 'red' }}>{cancha.Estado}</span>
                                            </h4>
                                            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>📍 {cancha.LocalDireccion || cancha.Direccion} - {cancha.LocalDistrito || cancha.Distrito} {cancha.LocalNombre ? <span style={{ color: '#00b48a' }}>({cancha.LocalNombre})</span> : ''}</p>
                                            <span style={{ fontSize: '13px' }}>Base S/{parseFloat(cancha.Precio_Base).toFixed(2)} | Prime S/{parseFloat(cancha.Precio_Prime || cancha.Precio_Base).toFixed(2)} | Baja S/{parseFloat(cancha.Precio_Baja || cancha.Precio_Base).toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', minWidth: '130px' }}>
                                            <button onClick={() => setGestionCanchaId(cancha.ID_Cancha)} style={{ background: '#1e2530', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>⚙️ Gestionar</button>
                                            <button onClick={() => handleToggleEstadoCancha(cancha.ID_Cancha, cancha.Estado)} style={{ background: cancha.Estado === 'DISPONIBLE' ? '#dc3545' : '#28a745', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                                                {cancha.Estado === 'DISPONIBLE' ? '⏸ Pausar Cancha' : '▶ Reactivar Cancha'}
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
                    onAbrirGestionCancha={(cancha) => setGestionCanchaId(cancha.ID_Cancha)}
                />
            )}

            {tabActiva === 'dashboard' && <DashboardDueno />}

            {tabActiva === 'reportes' && <ReportesDueno onMensaje={handleMensaje} />}

            {tabActiva === 'config' && (
                <ConfigDueno version={configVersion} onActualizar={inicializarModuloDueno} />
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
