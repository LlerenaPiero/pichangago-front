import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl, FALLBACK_IMG } from '../utils/imageUrl';
import { authService } from '../services/authService';
import { jugadorService } from '../services/jugadorService';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const SUPERFICIES_MAP = {
  GRASS_SINTETICO: 'Césped sintético',
  GRASS_NATURAL: 'Césped natural',
};

const superficieLabel = (val) => SUPERFICIES_MAP[val] || val;

const SportIcon = ({ tipo }) => {
    if (!tipo) return '⚽';
    const t = tipo.toLowerCase();
    if (t.includes('fútbol') || t.includes('futbol') || t.includes('f5') || t.includes('f7') || t.includes('f11')) return '⚽';
    if (t.includes('vóley') || t.includes('voley')) return '🏐';
    if (t.includes('tenis')) return '🎾';
    if (t.includes('básquet') || t.includes('basquet')) return '🏀';
    return '⚽';
};

const generarCodigoReserva = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PC-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const formatHora = (timeStr) => String(timeStr || '').substring(0, 5);

const CanchaDetail = ({ onOpenLogin }) => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [cancha, setCancha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [slotsDelDia, setSlotsDelDia] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedPago, setSelectedPago] = useState('yape');
    const [isProcessing, setIsProcessing] = useState(false);
    const [fotoIndex, setFotoIndex] = useState(0);
    const [formData, setFormData] = useState({ nombre: '', telefono: '' });
    const [bookingCode] = useState(generarCodigoReserva);
    const [contiguityWarning, setContiguityWarning] = useState('');
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showOccupied, setShowOccupied] = useState(true);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fechaSeleccionada = () => {
        const hoy = new Date();
        const d = new Date(hoy);
        d.setDate(hoy.getDate() + selectedDayIndex);
        return d.toISOString().split('T')[0];
    };

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError('');
            const res = await canchaService.obtenerCancha(slug);
            if (res.status === 'success') {
                setCancha(res.data);
            } else {
                setError(res.error || 'Cancha no encontrada.');
            }
            setLoading(false);
        };
        cargar();
    }, [slug]);

    useEffect(() => {
        if (!cancha || !cancha.SLUG) return;
        if (slug !== cancha.SLUG) {
            navigate(`/cancha/${cancha.SLUG}`, { replace: true });
        }
    }, [cancha]);

    useEffect(() => {
        if (!cancha) return;
        const cargarSlots = async () => {
            setLoadingSlots(true);
            setSelectedSlots([]);
            setContiguityWarning('');
            const res = await canchaService.obtenerSlots(cancha.ID_CANCHA, fechaSeleccionada());
            if (res.status === 'success') {
                setSlotsDelDia(res.data);
            } else {
                setSlotsDelDia([]);
            }
            setLoadingSlots(false);
        };
        cargarSlots();
    }, [cancha, selectedDayIndex]);

    const cargarReviews = async () => {
        if (!cancha) return;
        setLoadingReviews(true);
        const res = await canchaService.obtenerReviews(cancha.ID_CANCHA);
        if (res.status === 'success' && Array.isArray(res.data)) {
            setReviews(res.data);
        }
        setLoadingReviews(false);
    };

    useEffect(() => {
        if (cancha) cargarReviews();
    }, [cancha]);

    const obtenerPrecioSlot = (slot) => {
        if (!cancha) return 0;
        const precio = slot.Precio ?? (
            slot.Tipo_Precio === 'PRIME' ? (cancha.Precio_Prime ?? cancha.Precio_Base)
            : slot.Tipo_Precio === 'BAJA' ? (cancha.Precio_Baja ?? cancha.Precio_Base)
            : cancha.Precio_Base
        ) ?? 0;
        return slot.EstadoSlot === 'OFERTA' ? Math.round(precio * 0.8 * 100) / 100 : precio;
    };

    const slotOcupado = (slot) => {
        if (['RESERVADO', 'BLOQUEADO', 'NO_ASISTIO'].includes(slot.EstadoSlot)) return true;
        const hoyStr = new Date().toISOString().split('T')[0];
        if (fechaSeleccionada() === hoyStr && slot.Hora_Inicio) {
            const ahora = new Date();
            const [hh, mm] = slot.Hora_Inicio.split(':').map(Number);
            const inicioSlot = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), hh, mm);
            if (inicioSlot <= ahora) return true;
        }
        return false;
    };

    const validarContiguidad = (slots) => {
        if (slots.length < 2) return '';
        const sorted = [...slots].sort((a, b) => String(a.Hora_Inicio).localeCompare(String(b.Hora_Inicio)));
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i - 1].Hora_Fin !== sorted[i].Hora_Inicio) {
                return 'Los horarios seleccionados no son contiguos. Quedará un hueco sin reservar.';
            }
        }
        return '';
    };

    const handleSelectSlot = (slot) => {
        if (slotOcupado(slot)) return;
        const existe = selectedSlots.find(s => s.ID_SLOT === slot.ID_SLOT);
        let nuevos;
        if (existe) {
            nuevos = selectedSlots.filter(s => s.ID_SLOT !== slot.ID_SLOT);
        } else {
            nuevos = [...selectedSlots, slot].sort((a, b) => String(a.Hora_Inicio).localeCompare(String(b.Hora_Inicio)));
        }
        setSelectedSlots(nuevos);
        setContiguityWarning(validarContiguidad(nuevos));
    };

    const totalPrecio = selectedSlots.reduce((sum, s) => sum + obtenerPrecioSlot(s), 0);

    const handleOpenReserva = () => {
        const currentUser = authService.getCurrentUser();

        if (!currentUser) {
            if (onOpenLogin) onOpenLogin();
            else alert('Por favor, inicia sesión desde la barra superior.');
            return;
        }

        const userRole = (currentUser.rol || currentUser.role || currentUser.ROL || '').toUpperCase().trim();
        if (userRole === 'DUENO' || userRole === 'DUEÑO') {
            alert('⛔ Tu perfil es de Dueño. Usa una cuenta de Jugador para reservar.');
            return;
        }

        setFormData({
            nombre: currentUser.nombre || currentUser.name || '',
            telefono: currentUser.telefono || ''
        });
        setIsModalOpen(true);

        jugadorService.obtenerPerfil().then(res => {
            if (res.status === 'success' && res.data) {
                setFormData(prev => ({
                    nombre: res.data.nombre + ' ' + (res.data.apellido || ''),
                    telefono: res.data.telefono || prev.telefono
                }));
            }
        });
    };

    const handleClose = () => {
        setIsModalOpen(false);
        if (step === 2) {
            setSelectedSlots([]);
            navigate('/panel-jugador?tab=reservas');
        }
    };

    const handleConfirmarReserva = async (e) => {
        e.preventDefault();
        if (!formData.nombre.trim() || !formData.telefono.trim()) return;

        setIsProcessing(true);
        try {
            const slotIds = selectedSlots.map(s => s.ID_SLOT);
            const response = await canchaService.reservarCancha({
                idCancha: cancha.ID_CANCHA,
                slots: slotIds,
                metodoPago: selectedPago,
                montoTotal: totalPrecio
            });

            if (response.status === 'success') {
                setStep(2);
            } else {
                alert(response.error || 'Error al procesar la reserva.');
            }
        } catch (error) {
            alert(error.message || 'Error de red. Inténtalo de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const fotoUrl = (foto) => getImageUrl(foto?.URL_FOTO);

    const cambiarFoto = (dir) => {
        if (!cancha?.Fotos?.length) return;
        setFotoIndex(prev => ((prev + dir + cancha.Fotos.length) % cancha.Fotos.length));
    };

    const generarFechas = () => {
        const hoy = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() + i);
            return { index: i, diaNombre: DIAS_SEMANA[d.getDay()], diaNumero: d.getDate() };
        });
    };

    if (loading) return <div className="detail-loading" style={{ padding: '100px 24px', textAlign: 'center' }}><h2>Cargando cancha... ⚽</h2></div>;
    if (error) return <div className="detail-error" style={{ padding: '100px 24px', textAlign: 'center' }}><h2>❌ {error}</h2><button className="back-btn" onClick={() => navigate('/buscar')} style={{ marginTop: '16px', width: 'auto', padding: '0 20px', background: '#008060', color: 'white', borderRadius: '6px' }}>← Volver</button></div>;
    if (!cancha) return null;

    return (
        <div>
            <div className="detail-header">
                <button className="back-btn" onClick={() => navigate('/buscar')} aria-label="Volver">←</button>
                <button className="detail-back-link" onClick={() => navigate('/buscar')}>Volver a resultados</button>
            </div>

            <div className="detail-body">
                <div>
                    <div className="detail-gallery-wrap">
                        {cancha.Fotos?.length > 0 ? (
                            <>
                                <img src={fotoUrl(cancha.Fotos[fotoIndex])} alt={cancha.NOMBRE}
                                        onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }} />
                                {cancha.Fotos.length > 1 && (
                                    <>
                                        <button className="detail-gallery-nav detail-gallery-nav--prev" onClick={() => cambiarFoto(-1)} aria-label="Foto anterior">◀</button>
                                        <button className="detail-gallery-nav detail-gallery-nav--next" onClick={() => cambiarFoto(1)} aria-label="Foto siguiente">▶</button>
                                        <div className="detail-gallery-dots">
                                            {cancha.Fotos.map((_, i) => (
                                                <button key={i} className={`detail-gallery-dot ${i === fotoIndex ? 'active' : ''}`} onClick={() => setFotoIndex(i)} aria-label={`Foto ${i + 1}`} />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="detail-gallery-empty">{SportIcon({ tipo: cancha.Tipo_Deporte })}</div>
                        )}
                    </div>

                    <div className="detail-info">
                        <div className="detail-info-head">
                            <h1 className="detail-nombre">{cancha.NOMBRE}</h1>
                            <button className="detail-share-btn" onClick={() => { const url = window.location.href; if (navigator.share) navigator.share({ title: cancha.NOMBRE, url }).catch(() => {}); else { navigator.clipboard?.writeText(url); } showToast('Enlace de la cancha copiado'); }}>Compartir</button>
                        </div>

                        {cancha.DESCRIPCION && <p className="detail-descripcion">{cancha.DESCRIPCION}</p>}

                        <div className="detail-subtitle">
                            <span>{[cancha.Distrito, cancha.Provincia, cancha.Departamento].filter(Boolean).join(', ')}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                {cancha.Rating > 0 && (
                                    <span className="detail-rating-badge">
                                        ⭐ {cancha.Rating.toFixed(1)}
                                    </span>
                                )}
                                {(cancha.Rating > 0 || cancha.TotalReviews > 0 || reviews.length > 0) && (
                                    <button onClick={() => { cargarReviews(); setIsReviewModalOpen(true); }}
                                        style={{ background: 'var(--gray2)', border: '1px solid var(--gray3)', borderRadius: '8px', cursor: 'pointer', padding: '4px 12px', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                        {(cancha.TotalReviews || reviews.length)} reseña{(cancha.TotalReviews || reviews.length) !== 1 ? 's' : ''}
                                    </button>
                                )}
                            </span>
                        </div>

                        {/* Amenidades badges */}
                        <div className="detail-amenidades">
                            {cancha.TipoNombre && (
                                <span className="amenidad">{cancha.TipoNombre}</span>
                            )}
                            {cancha.TipoCodigo && (
                                <span className="amenidad amenidad-tipo">{cancha.TipoCodigo}</span>
                            )}
                            {cancha.TIPO_SUPERFICIE && (
                                <span className="amenidad amenidad-superficie">{superficieLabel(cancha.TIPO_SUPERFICIE)}</span>
                            )}
                            {cancha.ES_TECHADA && (
                                <span className="amenidad amenidad-techada">Techada</span>
                            )}
                            {cancha.TIENE_ILUMINACION && (
                                <span className="amenidad amenidad-iluminacion">Iluminación</span>
                            )}
                            {cancha.JUGADORES_TOTAL > 0 && (
                                <span className="amenidad amenidad-jugadores">
                                    {cancha.JUGADORES_POR_EQUIPO}v{cancha.JUGADORES_POR_EQUIPO} · {cancha.JUGADORES_TOTAL} jugadores
                                </span>
                            )}
                            {cancha.TAMANO && (
                                <span className="amenidad amenidad-tamano">
                                    {cancha.TAMANO === 'PEQUENA' ? 'Cancha pequeña' : cancha.TAMANO === 'MEDIANA' ? 'Cancha mediana' : cancha.TAMANO === 'GRANDE' ? 'Cancha grande' : cancha.TAMANO}
                                </span>
                            )}
                            {cancha.ESTADO === 'MANTENIMIENTO' && (
                                <span className="amenidad amenidad-suspendido">Mantenimiento</span>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div className="detail-ubicacion">
                            <div className="detail-ubicacion-inner">
                                <span className="detail-ubicacion-icon">📍</span>
                                <div>
                                    <span className="detail-section-title">Ubicación</span>
                                    <p className="detail-direccion">{cancha.Direccion}, {cancha.Distrito}</p>
                                </div>
                            </div>
                            {cancha.Direccion && (
                                <a className="detail-maps-link"
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cancha.Direccion + ', ' + cancha.Distrito)}`}
                                    target="_blank" rel="noopener noreferrer">
                                    Ver en Google Maps →
                                </a>
                            )}
                        </div>

                        {/* Tarifas por hora */}
                        <div className="detail-tarifas">
                            <span className="detail-section-title">Tarifas por hora</span>
                            <p className="detail-tarifas-rango">
                                Desde S/ {Math.min(...[cancha.Precio_Base, cancha.Precio_Prime, cancha.Precio_Baja].filter(Boolean))} hasta S/ {Math.max(...[cancha.Precio_Base, cancha.Precio_Prime, cancha.Precio_Baja].filter(Boolean))} según horario
                            </p>
                            <div className="detail-tarifas-detalle">
                                {cancha.Precio_Baja && cancha.Precio_Baja !== cancha.Precio_Base && (
                                    <span className="tarifa-chip tarifa-chip--valle">Valle S/ {Number(cancha.Precio_Baja).toFixed(0)}</span>
                                )}
                                    <span className="tarifa-chip tarifa-chip--base">Normal S/ {Number(cancha.Precio_Base).toFixed(0)}</span>
                                {cancha.Precio_Prime && cancha.Precio_Prime !== cancha.Precio_Base && (
                                    <span className="tarifa-chip tarifa-chip--punta">Punta S/ {Number(cancha.Precio_Prime).toFixed(0)}</span>
                                )}
                            </div>
                        </div>

                        {/* Complejo + Dueño combinados */}
                        {(cancha.LocalNombre || cancha.DueñoNombre) && (
                            <div className="detail-lugar-card">
                                <span className="detail-section-title">Información del complejo</span>
                                <div className="detail-lugar-grid">
                                    {cancha.LocalNombre && (
                                        <div className="detail-lugar-row">
                                            <span className="detail-lugar-icon">🏟️</span>
                                            <div>
                                                <span className="detail-lugar-label">Complejo</span>
                                                <span className="detail-lugar-val">{cancha.LocalNombre}</span>
                                            </div>
                                        </div>
                                    )}
                                    {cancha.DueñoNombre && (
                                        <div className="detail-lugar-row">
                                            <span className="detail-lugar-icon">👤</span>
                                            <div>
                                                <span className="detail-lugar-label">Administrado por</span>
                                                <span className="detail-lugar-val">{cancha.DueñoNombre} {cancha.DueñoApellido}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {cancha.DueñoTelefono && (
                                    <div className="lugar-soporte">
                                        <span className="lugar-soporte-text">¿Tienes dudas sobre la cancha?</span>
                                        <a className="lugar-soporte-link"
                                            href={`https://wa.me/51${cancha.DueñoTelefono.replace(/\D/g, '')}`}
                                            target="_blank" rel="noopener noreferrer">
                                            Consultar por WhatsApp
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="reserva-panel">
                    <h3 className="reserva-panel-title">Selecciona tu horario</h3>
                    <p className="reserva-panel-sub">Elige un horario disponible para continuar con tu reserva.</p>

                    <div className="fecha-selector">
                        {generarFechas().map(fecha => (
                            <button key={fecha.index}
                                className={`fecha-btn ${selectedDayIndex === fecha.index ? 'active' : ''}`}
                                onClick={() => { setSelectedDayIndex(fecha.index); setSelectedSlots([]); setContiguityWarning(''); }}>
                                <span className="dia">{fecha.index === 0 ? 'Hoy' : fecha.diaNombre}</span>
                                <span className="num">{fecha.diaNumero}</span>
                            </button>
                        ))}
                    </div>

                    {/* Leyenda de horarios */}
                    <div className="slots-leyenda">
                        <span className="leyenda-label">Estado de horarios</span>
                        <div className="leyenda-items">
                            <span className="leyenda-chip leyenda-chip--libre">Disponible</span>
                            <span className="leyenda-chip leyenda-chip--oferta">Oferta</span>
                            <span className="leyenda-chip leyenda-chip--ocupado">No disponible</span>
                        </div>
                    </div>

                    <div className="slots-toggle-wrap">
                        <label className="slots-toggle">
                            <input type="checkbox" checked={showOccupied} onChange={() => setShowOccupied(v => !v)} />
                            <span>Mostrar no disponibles</span>
                        </label>
                    </div>

                    {loadingSlots ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#4b5563' }}>
                            Cargando horarios...
                        </div>
                    ) : slotsDelDia.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', fontSize: '13px', padding: '12px' }}>
                            No hay horarios disponibles para este día
                        </div>
                    ) : (
                        <div className="slots-grid">
                            {slotsDelDia.map(slot => {
                                if (!showOccupied && slotOcupado(slot)) return null;
                                const seleccionado = selectedSlots.some(s => s.ID_SLOT === slot.ID_SLOT);
                                const ocupado = slotOcupado(slot);
                                const esOferta = slot.EstadoSlot === 'OFERTA';
                                const precio = obtenerPrecioSlot(slot);
                                return (
                                    <div key={slot.ID_SLOT}
                                        className={`slot ${ocupado ? 'ocupado' : 'libre'} ${esOferta && !ocupado ? 'oferta' : ''} ${seleccionado ? 'selected' : ''}`}
                                        onClick={() => handleSelectSlot(slot)}
                                        role="button"
                                        tabIndex={ocupado ? -1 : 0}
                                        aria-label={`${formatHora(slot.Hora_Inicio)} - ${ocupado ? 'Ocupado' : `S/ ${precio.toFixed(2)}`}`}
                                        aria-pressed={seleccionado}
                                        onKeyDown={e => e.key === 'Enter' && handleSelectSlot(slot)}>
                                        {esOferta && <span className="slot-tag oferta">−20%</span>}
                                        <span className="slot-hora">{formatHora(slot.Hora_Inicio)}</span>
                                        <span className="slot-precio">{ocupado ? 'No disponible' : `S/ ${precio.toFixed(0)}`}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Resumen de reserva */}
                    <div className="resumen-seleccion">
                        {selectedSlots.length === 0 ? (
                            <div className="resumen-empty">
                                <p>Selecciona un horario disponible para ver el resumen.</p>
                            </div>
                        ) : (
                            <div className="resumen-activo">
                                <h4 className="resumen-title">Resumen de reserva</h4>
                                <div className="resumen-grid">
                                    <div className="resumen-item">
                                        <span className="resumen-item-label">Día</span>
                                        <span className="resumen-item-val">
                                            {(() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + selectedDayIndex);
                                                return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
                                            })()}
                                        </span>
                                    </div>
                                    <div className="resumen-item">
                                        <span className="resumen-item-label">Horario</span>
                                        <span className="resumen-item-val">
                                            {selectedSlots.length === 1
                                                ? `${formatHora(selectedSlots[0].Hora_Inicio)} - ${formatHora(selectedSlots[0].Hora_Fin)}`
                                                : `${formatHora(selectedSlots[0].Hora_Inicio)} - ${formatHora(selectedSlots[selectedSlots.length - 1].Hora_Fin)}`
                                            }
                                        </span>
                                    </div>
                                    <div className="resumen-item">
                                        <span className="resumen-item-label">Duración</span>
                                        <span className="resumen-item-val">{selectedSlots.length} {selectedSlots.length === 1 ? 'hora' : 'horas'}</span>
                                    </div>
                                    <div className="resumen-item resumen-item--total">
                                        <span className="resumen-item-label">Total</span>
                                        <span className="resumen-item-val">S/ {totalPrecio.toFixed(2)}</span>
                                    </div>
                                </div>
                                {selectedSlots.length > 1 && contiguityWarning && (
                                    <div className="contiguity-warning">⚠️ {contiguityWarning}</div>
                                )}
                                <button className="resumen-cta"
                                    disabled={selectedSlots.length > 1 && !!contiguityWarning}
                                    onClick={handleOpenReserva}>
                                    {selectedSlots.length > 1 && contiguityWarning ? 'Selecciona horarios contiguos' : 'Continuar reserva'}
                                </button>
                                <p className="resumen-trust">Tu horario se confirma al completar el pago.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, padding: '12px 20px', borderRadius: '10px',
                    fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    animation: 'toastIn 0.25s ease-out',
                    background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
                    color: toast.type === 'error' ? '#b91c1c' : '#065f46',
                    border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#6ee7b7'}`
                }}>
                    {toast.message}
                </div>
            )}

            {isReviewModalOpen && (
                <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
                    onClick={() => setIsReviewModalOpen(false)}>
                    <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-head" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="modal-title">Reseñas de {cancha.NOMBRE}</div>
                            <button className="modal-close" onClick={() => setIsReviewModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray4)' }}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
                            {loadingReviews ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray4)' }}>
                                    <p>Cargando reseñas...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray4)' }}>
                                    <p>Aún no hay reseñas para esta cancha.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {reviews.map(r => (
                                        <div key={r.ID_REVIEW} style={{
                                            background: 'var(--gray1)', borderRadius: 'var(--r12)', padding: '14px',
                                            border: '1px solid var(--gray2)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green)',
                                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', fontWeight: 700
                                                    }}>
                                                        {(r.JugadorNombre || 'A')[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.JugadorNombre} {r.JugadorApellido || ''}</span>
                                                </div>
                                                <span style={{ fontSize: '13px', color: 'var(--gray4)' }}>
                                                    {new Date(r.FECHA_CREA).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: r.COMENTARIOS ? '8px' : '0' }}>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span key={i} style={{ fontSize: '16px', color: i < r.CALIFICACION ? '#f59e0b' : '#d1d5db' }}>★</span>
                                                ))}
                                                <span style={{ marginLeft: '6px', fontSize: '13px', color: 'var(--textMid)' }}>
                                                    {r.CALIFICACION} de 5
                                                </span>
                                            </div>
                                            {r.COMENTARIOS && (
                                                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.5', margin: 0 }}>{r.COMENTARIOS}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="overlay" onClick={step === 2 ? handleClose : undefined}>
                    <div className="modal" role="dialog" aria-modal="true" aria-label="Reserva" onClick={e => e.stopPropagation()}>
                        <div className="modal-head">
                            <span className="modal-title">{step === 1 ? 'Confirmar reserva' : '¡Reserva lista!'}</span>
                            <button className="modal-close" onClick={handleClose} aria-label="Cerrar">✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="steps">
                                <div className={`step-item ${step >= 1 ? 'active' : ''}`} />
                                <div className={`step-item ${step >= 2 ? 'active' : ''}`} />
                            </div>

                            {step === 1 && (
                                <>
                                    <span className="step-label">Paso 1 de 2 — Confirma tus datos</span>

                                    <div className="resumen-box">
                                        <div className="resumen-row"><span>Cancha</span><strong>{cancha.NOMBRE}</strong></div>
                                        <div className="resumen-row"><span>Fecha</span><strong>{fechaSeleccionada()}</strong></div>
                                        <div className="resumen-row"><span>Horario</span><strong>{selectedSlots.map(s => `${formatHora(s.Hora_Inicio)}-${formatHora(s.Hora_Fin)}`).join(', ')}</strong></div>
                                        <div className="resumen-row"><span>Total</span><strong style={{ color: 'var(--green)' }}>S/ {totalPrecio.toFixed(2)}</strong></div>
                                    </div>

                                    <form onSubmit={handleConfirmarReserva}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="reserva-nombre">Nombre completo <span style={{ color: 'red' }}>*</span></label>
                                            <input id="reserva-nombre" className="form-input" type="text" required placeholder="Ej: Juan Pérez"
                                                value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="reserva-telefono">Teléfono <span style={{ color: 'red' }}>*</span></label>
                                            <input id="reserva-telefono" className="form-input" type="tel" required placeholder="Ej: 999 123 456"
                                                value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                        </div>

                                        <span className="step-label">Método de pago</span>

                                        <div className="pago-metodos">
                                            <label className={`pago-card ${selectedPago === 'yape' ? 'active' : ''}`}>
                                                <input type="radio" name="pago" checked={selectedPago === 'yape'}
                                                    onChange={() => setSelectedPago('yape')} style={{ display: 'none' }} />
                                                <div className="pago-icon">📱</div>
                                                <div className="pago-name">Yape</div>
                                            </label>
                                            <label className={`pago-card ${selectedPago === 'culqi' ? 'active' : ''}`}>
                                                <input type="radio" name="pago" checked={selectedPago === 'culqi'}
                                                    onChange={() => setSelectedPago('culqi')} style={{ display: 'none' }} />
                                                <div className="pago-icon">💳</div>
                                                <div className="pago-name">Tarjeta</div>
                                            </label>
                                        </div>

                                        {selectedPago === 'yape' && (
                                            <div className="yape-instructions">
                                                📲 Abre Yape, busca el número <strong>999 888 777</strong> y paga <strong>S/ {totalPrecio.toFixed(2)}</strong>.
                                                Luego confirma tu pago aquí.
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                            <button type="button" className="btn btn-outline" onClick={handleClose} style={{ flex: 1, justifyContent: 'center' }}>
                                                Cancelar
                                            </button>
                                            <button type="submit" className="btn btn-green" disabled={isProcessing || !formData.nombre.trim() || !formData.telefono.trim()}
                                                style={{ flex: 2, justifyContent: 'center' }}>
                                                {isProcessing ? 'Procesando...' : selectedPago === 'yape' ? `✅ Ya pagué — S/ ${totalPrecio.toFixed(2)}` : `🔒 Pagar S/ ${totalPrecio.toFixed(2)}`}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {step === 2 && (
                                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                    <div className="confirmacion-icon">✓</div>
                                    <h4 className="confirmacion-title">¡Reserva confirmada!</h4>
                                    <div className="confirmacion-code" title="Toca para copiar"
                                        onClick={() => navigator.clipboard?.writeText(bookingCode)}>
                                        {bookingCode}
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '16px' }}>Toca el código para copiarlo</p>
                                    <p className="confirmacion-details">{cancha.NOMBRE} — {fechaSeleccionada()}</p>
                                    <p className="confirmacion-sub">{selectedSlots.map(s => `${formatHora(s.Hora_Inicio)}-${formatHora(s.Hora_Fin)}`).join(', ')}</p>
                                    <button className="btn btn-green" onClick={handleClose} style={{ width: '100%', justifyContent: 'center' }}>
                                        Mis Reservas →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CanchaDetail;
