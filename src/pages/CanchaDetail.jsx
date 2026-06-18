import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';
import { authService } from '../services/authService';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const STEPS_LABELS = ['Resumen', 'Datos', 'Pago', 'Confirmación'];

const SportIcon = ({ tipo }) => {
    if (!tipo) return '⚽';
    const t = tipo.toLowerCase();
    if (t.includes('fútbol') || t.includes('futbol')) return '⚽';
    if (t.includes('vóley') || t.includes('voley')) return '🏐';
    if (t.includes('tenis')) return '🎾';
    if (t.includes('básquet') || t.includes('basquet')) return '🏀';
    return '⚽';
};

const CanchaDetail = ({ onOpenLogin }) => {
    const { id } = useParams();
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
    const [selectedPago, setSelectedPago] = useState('culqi');
    const [isLoading, setIsLoading] = useState(false);
    const [fotoIndex, setFotoIndex] = useState(0);
    const [formData, setFormData] = useState({ nombre: '', telefono: '' });

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError('');
            const res = await canchaService.obtenerCancha(id);
            if (res.status === 'success') {
                setCancha(res.data);
            } else {
                setError(res.error || 'Cancha no encontrada.');
            }
            setLoading(false);
        };
        cargar();
    }, [id]);

    const fechaSeleccionada = () => {
        const hoy = new Date();
        const d = new Date(hoy);
        d.setDate(hoy.getDate() + selectedDayIndex);
        return d.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (!cancha) return;
        const cargarSlots = async () => {
            setLoadingSlots(true);
            setSelectedSlots([]);
            const res = await canchaService.obtenerSlots(id, fechaSeleccionada());
            if (res.status === 'success') {
                setSlotsDelDia(res.data);
            } else {
                setSlotsDelDia([]);
            }
            setLoadingSlots(false);
        };
        cargarSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, cancha, selectedDayIndex]);

    const obtenerPrecioSlot = (slot) => {
        if (!cancha) return 0;
        const base = slot.Tipo_Precio === 'PRIME' ? (cancha.Precio_Prime || cancha.Precio_Base)
            : slot.Tipo_Precio === 'BAJA' ? (cancha.Precio_Baja || cancha.Precio_Base)
            : cancha.Precio_Base;
        return slot.EstadoSlot === 'OFERTA' ? Math.round(base * 0.8 * 100) / 100 : base;
    };

    const slotOcupado = (slot) => {
        return ['RESERVADO', 'BLOQUEADO', 'NO_ASISTIO'].includes(slot.EstadoSlot);
    };

    const handleSelectSlot = (slot) => {
        const existe = selectedSlots.find(s => s.ID_Slots === slot.ID_Slots);
        if (existe) {
            setSelectedSlots(selectedSlots.filter(s => s.ID_Slots !== slot.ID_Slots));
        } else {
            setSelectedSlots([...selectedSlots, slot].sort((a, b) => a.Hora_Inicio.localeCompare(b.Hora_Inicio)));
        }
    };

    const totalPrecio = selectedSlots.reduce((sum, s) => sum + obtenerPrecioSlot(s), 0);

    const handleOpenReserva = () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            if (onOpenLogin) onOpenLogin();
            else alert('Por favor, inicia sesión desde la barra superior.');
            return;
        }
        if (currentUser.rol === 'DUENO' || currentUser.role === 'DUENO') {
            alert('⛔ Acceso Restringido: Tu perfil actual es de Dueño de Cancha.');
            return;
        }
        setStep(1);
        setFormData({ nombre: '', telefono: '' });
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        if (step === 4) {
            setSelectedSlots([]);
            navigate('/mis-reservas');
        }
    };

    const generarFechasSelector = () => {
        const hoy = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() + i);
            return { index: i, diaNombre: DIAS_SEMANA[d.getDay()], diaNumero: d.getDate() };
        });
    };

    const fotoUrl = (foto) => getImageUrl(foto?.URL_Foto);

    const cambiarFoto = (dir) => {
        if (!cancha?.Fotos?.length) return;
        const total = cancha.Fotos.length;
        setFotoIndex(prev => ((prev + dir + total) % total));
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}><h2>Cargando cancha... ⚽</h2></div>;
    if (error) return <div style={{ padding: '100px', textAlign: 'center' }}><h2>❌ {error}</h2><button onClick={() => navigate(-1)} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }}>← Volver</button></div>;
    if (!cancha) return null;

    return (
        <div style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: '#666', marginBottom: '16px', padding: '4px 0', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>← Volver</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* LEFT COLUMN */}
                <div>
                    {/* Photo gallery */}
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '320px', marginBottom: '16px', background: '#eee' }}>
                        {cancha.Fotos?.length > 0 ? (
                            <>
                                <img src={fotoUrl(cancha.Fotos[fotoIndex])} alt={cancha.Nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {cancha.Fotos.length > 1 && (
                                    <>
                                        <button onClick={() => cambiarFoto(-1)} aria-label="Foto anterior" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>◀</button>
                                        <button onClick={() => cambiarFoto(1)} aria-label="Foto siguiente" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}>▶</button>
                                        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                                            {cancha.Fotos.map((_, i) => (
                                                <button key={i} onClick={() => setFotoIndex(i)} aria-label={`Foto ${i + 1}`} style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid white', background: i === fotoIndex ? 'white' : 'transparent', cursor: 'pointer', padding: 0 }} />
                                            ))}
                                        </div>
                                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '12px', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold' }}>{fotoIndex + 1} / {cancha.Fotos.length}</div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '48px' }}>{SportIcon({ tipo: cancha.Tipo_Deporte })}</div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ color: '#00b48a', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{cancha.Distrito}</span>
                            {cancha.Rating > 0 && (
                                <span style={{ background: '#fffbeb', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: '#92400e', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                    ⭐ {cancha.Rating.toFixed(1)} <span style={{ fontWeight: 'normal', color: '#a16207' }}>({cancha.TotalReviews})</span>
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {SportIcon({ tipo: cancha.Tipo_Deporte })} {cancha.Nombre}
                        </h1>
                        <p style={{ color: '#555', margin: '0 0 6px', fontSize: '14px' }}>📍 {cancha.Direccion}</p>
                        {cancha.Descripcion && <p style={{ color: '#555', margin: '0 0 12px', fontSize: '14px', lineHeight: 1.5 }}>{cancha.Descripcion}</p>}
                        {cancha.Tipo_Deporte && <p style={{ color: '#888', margin: '0 0 12px', fontSize: '13px' }}>{SportIcon({ tipo: cancha.Tipo_Deporte })} Deporte: {cancha.Tipo_Deporte}</p>}

                        {/* Local info */}
                        {cancha.LocalNombre && (
                            <div style={{ background: '#f0f7ff', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', color: '#2563eb', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Complejo Deportivo</div>
                                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{cancha.LocalNombre}</div>
                            </div>
                        )}

                        {/* Dueño info */}
                        {(cancha.DueñoNombre || cancha.DueñoTelefono) && (
                            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', color: '#666', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Información del Dueño</div>
                                {cancha.DueñoNombre && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '14px' }}>
                                        <span>👤</span>
                                        <span><strong>{cancha.DueñoNombre} {cancha.DueñoApellido}</strong></span>
                                    </div>
                                )}
                                {cancha.DueñoTelefono && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '14px' }}>
                                        <span>📞</span>
                                        <span>{cancha.DueñoTelefono}</span>
                                    </div>
                                )}
                                {cancha.DueñoTelefono && (() => {
                                    const telClean = cancha.DueñoTelefono.replace(/\D/g, '');
                                    const waNum = telClean.startsWith('51') ? telClean : `51${telClean}`;
                                    return (
                                        <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#25D366', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold' }}>
                                            💬 Contactar por WhatsApp
                                        </a>
                                    );
                                })()}
                            </div>
                        )}

                        {/* Trust / reviews */}
                        {cancha.Rating > 0 && (
                            <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '14px', marginTop: '12px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '28px', lineHeight: 1 }}>⭐</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#92400e' }}>{cancha.Rating.toFixed(1)} / 5.0</div>
                                    <div style={{ fontSize: '12px', color: '#a16207' }}>{cancha.TotalReviews || 0} reseña(s)</div>
                                </div>
                            </div>
                        )}

                        {/* Price tiers */}
                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', color: '#666', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Tarifas por franja</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                <span>🌅 Baja <span style={{ color: '#888', fontSize: '12px' }}>(antes 12:00)</span></span>
                                <span style={{ fontWeight: 'bold' }}>S/ {(cancha.Precio_Baja || cancha.Precio_Base)?.toFixed(2)} /hr</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                                <span>☀️ Base <span style={{ color: '#888', fontSize: '12px' }}>(12:00–17:00)</span></span>
                                <span style={{ fontWeight: 'bold' }}>S/ {cancha.Precio_Base?.toFixed(2)} /hr</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '14px' }}>
                                <span>⭐ Prime <span style={{ color: '#888', fontSize: '12px' }}>(18:00–22:00)</span></span>
                                <span style={{ fontWeight: 'bold' }}>S/ {(cancha.Precio_Prime || cancha.Precio_Base)?.toFixed(2)} /hr</span>
                            </div>
                        </div>

                        {/* Map link */}
                        {cancha.Direccion && (
                            <a href={`https://www.google.com/maps/search/${encodeURIComponent(cancha.Direccion + ', ' + (cancha.Distrito || ''))}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#2563eb', fontSize: '13px', textDecoration: 'none', fontWeight: 'bold' }}>
                                🗺️ Ver en Google Maps
                            </a>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Slot Picker */}
                <div>
                    <div style={{ border: '1px solid #e0e0e0', borderRadius: '16px', padding: '20px', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '17px' }}>📅 Seleccionar horario</h3>

                        {/* Day selector */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto' }}>
                            {generarFechasSelector().map(fecha => (
                                <button key={fecha.index} onClick={() => { setSelectedDayIndex(fecha.index); setSelectedSlots([]); }}
                                    style={{ flex: 1, minWidth: '56px', padding: '9px 4px', borderRadius: '8px', border: selectedDayIndex === fecha.index ? '2px solid #00b48a' : '1px solid #ddd', background: selectedDayIndex === fecha.index ? '#e6f8f4' : '#fafafa', cursor: 'pointer', textAlign: 'center', fontWeight: selectedDayIndex === fecha.index ? 'bold' : 'normal', transition: 'all 0.15s' }}>
                                    <div style={{ fontSize: '11px', color: '#666' }}>{fecha.diaNombre}</div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fecha.diaNumero}</div>
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#A3E6C7', borderRadius: '2px', marginRight: '4px' }}></span>Libre</span>
                            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#FFD066', borderRadius: '2px', marginRight: '4px' }}></span>Oferta −20%</span>
                            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#ddd', borderRadius: '2px', marginRight: '4px' }}></span>Ocupado</span>
                            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#00b48a', borderRadius: '2px', marginRight: '4px' }}></span>Elegido</span>
                        </div>

                        {/* Slot grid */}
                        {loadingSlots ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px' }}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{ padding: '12px 6px', borderRadius: '8px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', height: '54px' }} />
                                ))}
                            </div>
                        ) : slotsDelDia.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📅</p>
                                <p style={{ margin: 0, fontSize: '14px' }}>No hay horarios disponibles para esta fecha.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                                {slotsDelDia.map(slot => {
                                    const seleccionado = selectedSlots.some(s => s.ID_Slots === slot.ID_Slots);
                                    const ocupado = slotOcupado(slot);
                                    const esOferta = slot.EstadoSlot === 'OFERTA';
                                    const precio = obtenerPrecioSlot(slot);
                                    return (
                                        <div key={slot.ID_Slots} onClick={() => !ocupado && handleSelectSlot(slot)}
                                            style={{ padding: '10px 4px', borderRadius: '8px', border: seleccionado ? '2px solid #00b48a' : ocupado ? '1px solid #e0e0e0' : '1px solid #ccc', background: seleccionado ? '#e6f8f4' : ocupado ? '#f5f5f5' : esOferta ? '#fff8e1' : '#fff', cursor: ocupado ? 'not-allowed' : 'pointer', textAlign: 'center', opacity: ocupado ? 0.55 : 1, position: 'relative', transition: 'all 0.15s', boxShadow: seleccionado ? '0 0 0 1px #00b48a' : 'none' }}>
                                            {esOferta && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ffc107', color: '#333', fontSize: '8px', fontWeight: 'bold', padding: '1px 5px', borderRadius: '4px', lineHeight: '14px' }}>−20%</span>}
                                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{slot.Hora_Inicio?.substring(0, 5)}</div>
                                            <div style={{ fontSize: '11px', color: ocupado ? '#999' : '#00b48a', fontWeight: 'bold', marginTop: '2px' }}>
                                                {ocupado ? '—' : `S/ ${precio.toFixed(0)}`}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Summary + Reserve button */}
                        {selectedSlots.length > 0 ? (
                            <div style={{ animation: 'fadeIn 0.2s ease' }}>
                                <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' }}>
                                        <span style={{ color: '#666' }}>Horas elegidas</span>
                                        <span style={{ fontWeight: 'bold' }}>{selectedSlots.length} hr</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                                        {selectedSlots.map(s => `${s.Hora_Inicio?.substring(0, 5)}-${s.Hora_Fin?.substring(0, 5)}`).join(', ')}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                                        <span style={{ color: '#00b48a', fontWeight: 'bold', fontSize: '14px' }}>Total a pagar</span>
                                        <span style={{ color: '#00b48a', fontWeight: 'bold', fontSize: '18px' }}>S/ {totalPrecio.toFixed(2)}</span>
                                    </div>
                                </div>
                                <button onClick={handleOpenReserva} style={{ width: '100%', background: '#00b48a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#009d78'} onMouseLeave={e => e.currentTarget.style.background = '#00b48a'}>
                                    Reservar y Pagar ({selectedSlots.length} hrs) →
                                </button>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#999', fontSize: '13px', padding: '8px' }}>
                                Selecciona uno o más horarios disponibles
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE RESERVA */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                    <div role="dialog" aria-modal="true" aria-label="Reserva" style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Paso {step} de 4 — {STEPS_LABELS[step - 1]}</div>
                            <button onClick={handleClose} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
                        </div>

                        <div style={{ padding: '20px 24px' }}>
                            {/* Progress bar */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                {[1, 2, 3, 4].map(s => (
                                    <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? '#00b48a' : '#eee', transition: 'background 0.3s' }} />
                                ))}
                            </div>

                            {step === 1 && (
                                <>
                                    <h4 style={{ marginBottom: '16px' }}>Resumen de tu reserva</h4>
                                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{ color: '#666' }}>Cancha</span><strong>{cancha.Nombre}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{ color: '#666' }}>Total Horas</span><span>{selectedSlots.length} hora(s)</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}><span style={{ color: '#666' }}>Horarios</span><strong>{selectedSlots.map(s => `${s.Hora_Inicio?.substring(0, 5)}-${s.Hora_Fin?.substring(0, 5)}`).join(', ')}</strong></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
                                            <span>Total a Pagar</span>
                                            <strong style={{ color: '#00b48a', fontSize: '16px' }}>S/ {totalPrecio.toFixed(2)}</strong>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(2)} style={{ width: '100%', background: '#00b48a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Continuar al Pago →</button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h4 style={{ marginBottom: '16px' }}>Tus datos</h4>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label htmlFor="reserva-nombre" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Nombre completo <span style={{ color: 'red' }}>*</span></label>
                                        <input id="reserva-nombre" type="text" required placeholder="Ej: Juan Pérez" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }} />
                                    </div>
                                    <div style={{ marginBottom: '14px' }}>
                                        <label htmlFor="reserva-telefono" style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#333' }}>Teléfono <span style={{ color: 'red' }}>*</span></label>
                                        <input id="reserva-telefono" type="tel" required placeholder="Ej: 999 123 456" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <button onClick={() => setStep(1)} style={{ flex: 1, background: '#eee', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Atrás</button>
                                        <button onClick={() => setStep(3)} disabled={!formData.nombre.trim() || !formData.telefono.trim()} style={{ flex: 1, background: formData.nombre.trim() && formData.telefono.trim() ? '#00b48a' : '#ccc', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: formData.nombre.trim() && formData.telefono.trim() ? 'pointer' : 'not-allowed', fontSize: '14px' }}>Continuar →</button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <form onSubmit={e => { e.preventDefault(); if (!formData.nombre.trim() || !formData.telefono.trim()) return; setIsLoading(true); setTimeout(() => { setIsLoading(false); setStep(4); }, 1500); }}>
                                    <h4 style={{ marginBottom: '16px' }}>Método de pago</h4>
                                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#666', fontSize: '14px' }}>Total a pagar ahora</span>
                                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#00b48a' }}>S/ {totalPrecio.toFixed(2)}</span>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label htmlFor="pago-culqi" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '10px', border: selectedPago === 'culqi' ? '2px solid #00b48a' : '1px solid #ddd', background: selectedPago === 'culqi' ? '#e6f8f4' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                                            <input id="pago-culqi" type="radio" name="pago" checked={selectedPago === 'culqi'} onChange={() => setSelectedPago('culqi')} style={{ accentColor: '#00b48a' }} />
                                            <span style={{ fontSize: '18px' }}>💳</span>
                                            <span style={{ fontWeight: selectedPago === 'culqi' ? 'bold' : 'normal', fontSize: '14px' }}>Tarjeta / Culqi</span>
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                        <button type="button" onClick={handleClose} style={{ background: '#eee', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', flex: 1, fontSize: '14px' }}>Cancelar</button>
                                        <button type="submit" disabled={isLoading} style={{ flex: 2, background: '#00b48a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '15px' }}>
                                            {isLoading ? 'Procesando...' : `🔒 Pagar S/ ${totalPrecio.toFixed(2)}`}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 4 && (
                                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                    <div style={{ fontSize: '52px', marginBottom: '12px', color: '#00b48a' }}>✓</div>
                                    <h4 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>¡Reserva confirmada!</h4>
                                    <p style={{ color: '#666', marginBottom: '6px', fontSize: '14px' }}>
                                        {cancha.Nombre} — {fechaSeleccionada()}
                                    </p>
                                    <p style={{ color: '#888', marginBottom: '20px', fontSize: '13px' }}>
                                        {selectedSlots.map(s => `${s.Hora_Inicio?.substring(0, 5)}-${s.Hora_Fin?.substring(0, 5)}`).join(', ')}
                                    </p>
                                    <button onClick={handleClose} style={{ width: '100%', background: '#00b48a', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Mis Reservas →</button>
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
