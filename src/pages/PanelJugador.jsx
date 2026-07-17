import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { jugadorService } from '../services/jugadorService';
import { canchaService } from '../services/canchaService';
import { getImageUrl, FALLBACK_IMG } from '../utils/imageUrl';
import { authService } from '../services/authService';
import { useDebounce } from '../hooks/useDebounce';

const ROLES_JUGADOR = ['CLIENTE'];
const ROL_DUENO = 'DUENO';

const ESTADO_LABELS = {
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  PENDIENTE: 'Pendiente',
  EXPIRADA: 'Expirada',
  REEMBOLSADA: 'Reembolsada',
  NO_SHOW: 'No asistió',
};

const getBadgeClass = (estado) => {
  return {
    CONFIRMADA: 'badge-green',
    PENDIENTE: 'badge-amber',
    CANCELADA: 'badge-red',
    EXPIRADA: 'badge-gray',
    REEMBOLSADA: 'badge-blue',
    NO_SHOW: 'badge-red',
  }[estado] || 'badge-gray';
};

const PanelJugador = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'resumen';
  const [tabActiva, setTabActiva] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [perfil, setPerfil] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [saving, setSaving] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [reservasLoading, setReservasLoading] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [motivoCancel, setMotivoCancel] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ calificacion: 0, comentarios: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reservaTab, setReservaTab] = useState('proximas');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [toast, setToast] = useState(null);

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [esGoogleAuth, setEsGoogleAuth] = useState(false);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const currentUser = authService.getCurrentUser();
      if (currentUser && (currentUser.rol === ROL_DUENO || currentUser.role === ROL_DUENO)) {
        navigate('/panel-dueno');
        return;
      }
      const [dashRes, perfilRes] = await Promise.all([
        jugadorService.obtenerDashboard(),
        jugadorService.obtenerPerfil(),
      ]);
      if (!mounted) return;
      if (dashRes.status === 'success' && dashRes.data) setDashboard(dashRes.data);
      if (perfilRes.status === 'success' && perfilRes.data) {
        setPerfil(perfilRes.data);
        setFormData({
          nombre: perfilRes.data.nombre || '',
          apellido: perfilRes.data.apellido || '',
          telefono: perfilRes.data.telefono || '',
        });
      }
      setLoading(false);
      setTabActiva(tabInicial);
    })();
    return () => { mounted = false; };
  }, [navigate, tabInicial]);

  const cargarReservas = async (page = 1) => {
    setReservasLoading(true);
    const estadoMap = { proximas: 'CONFIRMADA', historial: '', canceladas: 'CANCELADA' };
    const params = { page, limit: 10, estado: estadoMap[reservaTab] };
    if (debouncedSearch) params.q = debouncedSearch;
    const res = await jugadorService.obtenerReservas(params);
    if (res.status === 'success') {
      setReservas(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } else {
      setReservas([]);
    }
    setReservasLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleDownloadComprobante = async (idReserva) => {
    const res = await jugadorService.descargarComprobante(idReserva);
    if (res.status !== 'success') showToast(res.error || 'Error al descargar.', 'error');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    if (tabActiva === 'reservas') setSearchQuery('');
  }, [tabActiva, reservaTab]);

  useEffect(() => {
    if (tabActiva === 'reservas') cargarReservas(1);
  }, [debouncedSearch, reservaTab, tabActiva]);

  useEffect(() => {
    jugadorService.obtenerPerfil().then(res => {
      if (res?.data?.esGoogleAuth === true) setEsGoogleAuth(true);
    });
  }, []);

  const handleCancelarReserva = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    const res = await jugadorService.cancelarReserva(cancelModal, motivoCancel);
    if (res.status === 'success') {
      showToast('Reserva cancelada correctamente.');
      setCancelModal(null);
      setMotivoCancel('');
      setSelectedReserva(null);
      cargarReservas(pagination.page);
    } else {
      showToast(res.error || 'Error al cancelar reserva.', 'error');
    }
    setCancelLoading(false);
  };

  const actualizarYaCalifico = (idReserva) => {
    localStorage.setItem(`review_${idReserva}`, 'true');
    setReservas(prev => prev.map(r => r.id === idReserva ? { ...r, yaCalifico: true } : r));
    if (dashboard?.ultimaReserva?.id === idReserva) {
      setDashboard(prev => prev ? { ...prev, ultimaReserva: { ...prev.ultimaReserva, yaCalifico: true } } : prev);
    }
    if (selectedReserva?.id === idReserva) {
      setSelectedReserva(prev => prev ? { ...prev, yaCalifico: true } : prev);
    }
  };

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewLoading(true);
    const res = await jugadorService.crearReview({
      idReserva: reviewModal.id,
      calificacion: reviewData.calificacion,
      comentarios: reviewData.comentarios,
    });
    if (res.status === 'success') {
      showToast('¡Calificación guardada con éxito!');
      actualizarYaCalifico(reviewModal.id);
      setReviewModal(null);
      setReviewData({ calificacion: 0, comentarios: '' });
      setSelectedReserva(null);
    } else {
      if (res.error && res.error.includes('Ya calificaste')) {
        actualizarYaCalifico(reviewModal.id);
        showToast('Ya habías calificado esta reserva.', 'error');
        setReviewModal(null);
        setSelectedReserva(null);
      } else {
        showToast(res.error || 'Error al enviar reseña.', 'error');
      }
    }
    setReviewLoading(false);
  };

  const formatHora = (h) => {
    if (!h) return '';
    const [hh, mm] = h.split(':');
    const hora = parseInt(hh, 10);
    const ampm = hora >= 12 ? 'p. m.' : 'a. m.';
    const h12 = hora % 12 || 12;
    return `${h12}:${mm} ${ampm}`;
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T00:00:00');
    return d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFechaHumana = (fechaStr) => {
    if (!fechaStr) return '—';
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ');
  };

  const getInitials = (nombre, apellido) => {
    return ((nombre?.[0] || '') + (apellido?.[0] || '')).toUpperCase() || '?';
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    const pwd = passwordForm.newPassword;
    const pwdErrors = [];
    if (pwd.length < 8) pwdErrors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(pwd)) pwdErrors.push('una mayúscula');
    if (!/[a-z]/.test(pwd)) pwdErrors.push('una minúscula');
    if (!/[0-9]/.test(pwd)) pwdErrors.push('un número');
    if (!/[^A-Za-z0-9]/.test(pwd)) pwdErrors.push('un carácter especial');
    if (pwdErrors.length) {
      showToast('La contraseña debe tener: ' + pwdErrors.join(', '), 'error');
      return;
    }
    setPasswordSaving(true);
    const body = {
      ...(esGoogleAuth ? {} : { currentPassword: passwordForm.currentPassword }),
      newPassword: passwordForm.newPassword,
      confirmNewPassword: passwordForm.confirmPassword,
    };
    const res = await jugadorService.cambiarPassword(body);
    if (res.status === 'success') {
      showToast(esGoogleAuth ? 'Contraseña establecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.' : 'Contraseña actualizada correctamente.');
      setPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setEsGoogleAuth(false);
    } else {
      showToast(res.error || 'Error al cambiar contraseña.', 'error');
    }
    setPasswordSaving(false);
  };

  const ratingLabel = (n) => {
    if (n === 5) return 'Excelente';
    if (n === 4) return 'Muy buena';
    if (n === 3) return 'Regular';
    if (n === 2) return 'Mala';
    if (n === 1) return 'Muy mala';
    return '';
  };

  const estadoLabel = (r) => {
    if (r.estado === 'CONFIRMADA') {
      const fechaReserva = new Date(r.fecha + 'T' + (r.inicio || '23:59'));
      const hoy = new Date();
      if (fechaReserva > hoy) return 'Confirmada y pagada';
      return 'Finalizada';
    }
    if (r.estado === 'PENDIENTE') return 'Pendiente de pago';
    if (r.estado === 'CANCELADA') return r.reembolsoStatus ? `Cancelada · ${r.reembolsoStatus}` : 'Cancelada';
    if (r.estado === 'NO_SHOW') return 'No asistió';
    if (r.estado === 'REEMBOLSADA') return 'Reembolsada';
    if (r.estado === 'EXPIRADA') return 'Expirada';
    return ESTADO_LABELS[r.estado] || r.estado;
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await jugadorService.actualizarPerfil(formData);
    if (res.status === 'success') {
      showToast('Perfil actualizado correctamente.');
      setEditing(false);
      setPerfil(prev => ({ ...prev, ...formData }));
    } else {
      showToast(res.error || 'Error al actualizar perfil.', 'error');
    }
    setSaving(false);
  };

  const tabs = ['resumen', 'reservas', 'perfil'];

  const pwdValidation = (() => {
    const p = passwordForm.newPassword;
    const errors = [];
    if (p.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(p)) errors.push('Una mayúscula');
    if (!/[a-z]/.test(p)) errors.push('Una minúscula');
    if (!/[0-9]/.test(p)) errors.push('Un número');
    if (!/[^A-Za-z0-9]/.test(p)) errors.push('Un carácter especial');
    let strength = 0;
    if (p.length >= 8) strength++;
    if (p.length >= 12) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[a-z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    const label = ['', 'Débil', 'Débil', 'Media', 'Buena', 'Fuerte', 'Muy fuerte'];
    const color = ['', '#ef4444', '#ef4444', '#f59e0b', '#22c55e', '#22c55e', '#16a34a'];
    return { errors, strength, label: label[strength], color: color[strength] };
  })();

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center' }} role="status"><h2>Cargando panel... ⚽</h2></div>;
  }

  return (
    <div style={{ padding: '24px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 9999,
          padding: '14px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', animation: 'toastIn 0.25s ease-out',
          background: toast.type === 'error' ? '#fee2e2' : '#d1fae5',
          color: toast.type === 'error' ? '#b91c1c' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#6ee7b7'}`
        }}>
          {toast.message}
        </div>
      )}

      {/* TAB BAR */}
      <div role="tablist" aria-label="Secciones del panel"
        onKeyDown={e => {
          const idx = tabs.indexOf(tabActiva);
          if (e.key === 'ArrowRight') { e.preventDefault(); setTabActiva(tabs[(idx + 1) % tabs.length]); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); setTabActiva(tabs[(idx - 1 + tabs.length) % tabs.length]); }
        }}
        style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
        <button role="tab" aria-selected={tabActiva === 'resumen'} tabIndex={tabActiva === 'resumen' ? 0 : -1}
          onClick={() => setTabActiva('resumen')}
          style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'resumen' ? '3px solid var(--green)' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'resumen' ? 'var(--green)' : '#666', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Resumen
        </button>
        <button role="tab" aria-selected={tabActiva === 'reservas'} tabIndex={tabActiva === 'reservas' ? 0 : -1}
          onClick={() => setTabActiva('reservas')}
          style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'reservas' ? '3px solid var(--green)' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'reservas' ? 'var(--green)' : '#666', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
          Reservas
        </button>
        <button role="tab" aria-selected={tabActiva === 'perfil'} tabIndex={tabActiva === 'perfil' ? 0 : -1}
          onClick={() => setTabActiva('perfil')}
          style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: tabActiva === 'perfil' ? '3px solid var(--green)' : 'none', fontWeight: 'bold', cursor: 'pointer', color: tabActiva === 'perfil' ? 'var(--green)' : '#666', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-8 8-8s8 4 8 8"/></svg>
          Perfil
        </button>
      </div>

      {/* ============ TAB RESUMEN ============ */}
      {tabActiva === 'resumen' && (
        <div>
          {/* Tu próxima reserva - hero */}
          {dashboard?.proximasReservas?.length > 0 && (
            (() => {
              const r = dashboard.proximasReservas[0];
              const fecha = new Date(r.fecha + 'T' + (r.inicio || '00:00'));
              const hoy = new Date();
              const diffDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
              let cuando;
              if (diffDias <= 0) cuando = 'Hoy';
              else if (diffDias === 1) cuando = 'Mañana';
              else cuando = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

              return (
                <div style={{ background: 'linear-gradient(135deg, var(--dark1), #1e293b)', borderRadius: 'var(--r16)', padding: '24px', marginBottom: '24px', color: 'white', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r12)', background: 'var(--gray2)', flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚽</span>
                    {r.Fotos?.[0]?.URL_FOTO && <img src={getImageUrl(r.Fotos?.[0]?.URL_FOTO)} alt="" loading="lazy"
                      onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--green)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {diffDias <= 1 ? `Juegas ${cuando.toLowerCase()}` : 'Tu próxima reserva'}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{r.canchaNombre}</div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>{r.distrito} · {cuando} · {r.inicio?.substring(0,5)} - {r.fin?.substring(0,5)}</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>S/ {Number(r.precio).toFixed(2)}</div>
                      <span className="badge badge-green">{r.estado === 'CONFIRMADA' ? 'Confirmada' : r.estado}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button onClick={() => { const r2 = dashboard.proximasReservas[0]; setSelectedReserva(r2); jugadorService.obtenerReservaDetalle(r2.id).then(res => { if (res.status === 'success' && res.data) setSelectedReserva(res.data); }); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                        Ver detalle
                      </button>
                      <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.distrito || '')}`, '_blank')}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                        Cómo llegar
                      </button>
                      <button onClick={() => { navigator.clipboard?.writeText(window.location.origin + '/cancha/' + (r.canchaSlug || '')); showToast('Enlace copiado'); }}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                        Compartir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {/* Próximas reservas */}
          <div style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Próximas reservas</span>
              <button onClick={() => setTabActiva('reservas')} style={{ fontSize: '13px', color: 'var(--green2)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                Ver todas →
              </button>
            </div>
            {dashboard?.proximasReservas?.length > 0 ? (
              dashboard.proximasReservas.map((r, i) => {
                const fechaStr = new Date(r.fecha + 'T' + (r.inicio || '00:00')).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
                return (
                  <div key={r.id || i}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: i < dashboard.proximasReservas.length - 1 ? '1px solid var(--gray2)' : 'none' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: 'var(--r10)', background: 'var(--gray2)', flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚽</span>
                      {r.Fotos?.[0]?.URL_FOTO && <img src={getImageUrl(r.Fotos?.[0]?.URL_FOTO)} alt="" loading="lazy"
                        onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.canchaNombre}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.distrito} · {fechaStr} · {r.inicio?.substring(0,5)} - {r.fin?.substring(0,5)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>S/ {Number(r.precio).toFixed(2)}</div>
                      <span className={`badge ${r.estado === 'CONFIRMADA' ? 'badge-green' : 'badge-gray'}`}>{r.estado === 'CONFIRMADA' ? 'Confirmada' : r.estado}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray4)' }}>
                {dashboard?.resumen?.totalReservas > 0 ? (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚽</div>
                    <p style={{ marginBottom: '6px', fontWeight: 700, color: 'var(--text)' }}>No tienes próximas reservas</p>
                    <p style={{ marginBottom: '16px', fontSize: '13px' }}>Puedes repetir una cancha donde ya jugaste o buscar una nueva.</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {dashboard?.ultimaReserva && (
                        <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(dashboard.ultimaReserva.canchaNombre || '')}`)}
                          style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                          Repetir última cancha
                        </button>
                      )}
                      <Link to="/buscar" style={{ padding: '10px 20px', background: 'var(--green)', color: 'var(--dark1)', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>
                        Buscar canchas
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚽</div>
                    <p style={{ marginBottom: '6px', fontWeight: 700, color: 'var(--text)' }}>Aún no tienes reservas</p>
                    <p style={{ marginBottom: '16px', fontSize: '13px' }}>Busca una cancha disponible, elige horario y confirma tu reserva en minutos.</p>
                    <Link to="/buscar" style={{ padding: '10px 20px', background: 'var(--green)', color: 'var(--dark1)', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>
                      Buscar canchas
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Último partido */}
          {dashboard?.ultimaReserva ? (
            (() => {
              const r = dashboard.ultimaReserva;
              const yaCalifico = r.yaCalifico ?? localStorage.getItem(`review_${r.id}`) === 'true';
              const fechaStr = new Date(r.fecha + 'T' + (r.inicio || '00:00')).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
              const horaStr = r.inicio?.substring(0,5);
              return (
                <div style={{ background: yaCalifico ? '#f8f9fa' : '#f0fdf4', borderRadius: 'var(--r16)', padding: '20px', border: `1px solid ${yaCalifico ? 'var(--gray2)' : '#bbf7d0'}`, marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: 'var(--r10)', background: 'var(--gray2)', flexShrink: 0, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚽</span>
                    {r.Fotos?.[0]?.URL_FOTO && <img src={getImageUrl(r.Fotos?.[0]?.URL_FOTO)} alt="" loading="lazy"
                      onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!yaCalifico ? (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', marginBottom: '4px' }}>Califica tu último partido</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '2px' }}>{r.canchaNombre}</div>
                        <div style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '4px' }}>{fechaStr} · {horaStr}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '12px' }}>Tu opinión ayuda a otros jugadores a elegir mejor.</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => { setReviewModal({ id: r.id, canchaNombre: r.canchaNombre, fecha: r.fecha, inicio: r.inicio }); setReviewData({ calificacion: 0, comentarios: '' }); }}
                            style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                            Calificar cancha
                          </button>
                          <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                            style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Reservar de nuevo
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray4)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Último partido</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '2px' }}>{r.canchaNombre}</div>
                        <div style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '12px' }}>{fechaStr} · {horaStr}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                            style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Reservar de nuevo
                          </button>
                          <button onClick={() => { setSelectedReserva(r); jugadorService.obtenerReservaDetalle(r.id).then(res => { if (res.status === 'success' && res.data) setSelectedReserva(res.data); }); }}
                            style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Ver detalle
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()
          ) : dashboard?.resumen?.totalReservas > 0 ? null : (
            <div style={{ background: '#f8f9fa', borderRadius: 'var(--r16)', padding: '20px', border: '1px solid var(--gray2)', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚽</div>
              <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Aún no tienes partidos jugados</p>
              <p style={{ fontSize: '13px', color: 'var(--gray4)' }}>Cuando completes una reserva, podrás calificar la cancha aquí.</p>
            </div>
          )}

          {/* Acciones útiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <Link to="/buscar" style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', padding: '16px', textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray2)'}>
              <div style={{ marginBottom: '8px' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green2)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>Reservar otra cancha</div>
            </Link>
            {dashboard?.ultimaReserva && (
              <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(dashboard.ultimaReserva.canchaNombre || '')}`)}
                style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', padding: '16px', cursor: 'pointer', textAlign: 'center' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray2)'}>
                <div style={{ marginBottom: '8px' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green2)' }}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Repetir última cancha</div>
              </button>
            )}
            <button onClick={() => setTabActiva('reservas')}
              style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', padding: '16px', cursor: 'pointer', textAlign: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray2)'}>
              <div style={{ marginBottom: '8px' }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green2)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>Ver comprobantes</div>
            </button>
          </div>

          {/* Tu actividad */}
          {dashboard?.resumen && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--dark1)' }}>Tu actividad</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'white', borderRadius: 'var(--r12)', padding: '16px', border: '1px solid var(--gray2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dark1)' }}>{dashboard.resumen.totalReservas}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginTop: '2px' }}>Reservas</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--r12)', padding: '16px', border: '1px solid var(--gray2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--green)' }}>{dashboard.resumen.reservasConfirmadas}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginTop: '2px' }}>Jugados</div>
                </div>
                <div style={{ background: 'white', borderRadius: 'var(--r12)', padding: '16px', border: '1px solid var(--gray2)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--red)' }}>{dashboard.resumen.reservasCanceladas}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginTop: '2px' }}>Canceladas</div>
                </div>
                {dashboard.resumen.canchaFavorita && (
                  <div style={{ background: 'white', borderRadius: 'var(--r12)', padding: '16px', border: '1px solid var(--gray2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dashboard.resumen.canchaFavorita}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginTop: '2px' }}>Cancha favorita</div>
                  </div>
                )}
                {dashboard.resumen.horarioFrecuente && (
                  <div style={{ background: 'white', borderRadius: 'var(--r12)', padding: '16px', border: '1px solid var(--gray2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--dark1)' }}>{dashboard.resumen.horarioFrecuente}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginTop: '2px' }}>Horario frecuente</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ TAB RESERVAS ============ */}
      {tabActiva === 'reservas' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => setReservaTab('proximas')} style={{ padding: '7px 18px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', border: 'none', background: reservaTab === 'proximas' ? 'var(--dark1)' : 'var(--gray2)', color: reservaTab === 'proximas' ? 'white' : 'var(--textMid)' }}>Próximas</button>
            <button onClick={() => setReservaTab('historial')} style={{ padding: '7px 18px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', border: 'none', background: reservaTab === 'historial' ? 'var(--dark1)' : 'var(--gray2)', color: reservaTab === 'historial' ? 'white' : 'var(--textMid)' }}>Historial</button>
            <button onClick={() => setReservaTab('canceladas')} style={{ padding: '7px 18px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', border: 'none', background: reservaTab === 'canceladas' ? 'var(--dark1)' : 'var(--gray2)', color: reservaTab === 'canceladas' ? 'white' : 'var(--textMid)' }}>Canceladas</button>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <input type="text" placeholder="Buscar por cancha, complejo o distrito..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid var(--gray3)', fontSize: '13px', boxSizing: 'border-box' }} />
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--gray4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {searchQuery && (
                <button type="button" onClick={handleClearSearch} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--gray4)', padding: '4px' }}>✕</button>
              )}
            </div>
            <button type="submit" style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: 'var(--dark1)', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Buscar</button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--textMid)' }}>
              {reservaTab === 'proximas' && <>{(debouncedSearch ? reservas.length + ' resultados para "' + debouncedSearch + '"' : pagination.total + ' próxima' + (pagination.total !== 1 ? 's reservas' : ' reserva'))}</>}
              {reservaTab === 'historial' && <>{pagination.total} reserva{pagination.total !== 1 ? 's' : ''} en total</>}
              {reservaTab === 'canceladas' && <>{pagination.total} reserva{pagination.total !== 1 ? 's' : ''} cancelada{pagination.total !== 1 ? 's' : ''}</>}
            </p>
            <Link to="/buscar" style={{ padding: '8px 16px', background: 'var(--green)', color: 'var(--dark1)', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              + Nueva reserva
            </Link>
          </div>

          {reservasLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMid)' }}>Cargando reservas...</div>
          ) : reservas.length === 0 ? (
            (() => {
              if (debouncedSearch) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>🔍</div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No encontramos reservas con esos filtros</p>
                    <p style={{ fontSize: '13px', marginBottom: '16px' }}>Prueba cambiar la fecha, el estado o el nombre de la cancha.</p>
                    <button onClick={handleClearSearch} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Limpiar filtros</button>
                  </div>
                );
              }
              if (reservaTab === 'proximas') {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>⚽</div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No tienes reservas próximas</p>
                    <p style={{ fontSize: '13px', marginBottom: '16px' }}>Encuentra una cancha disponible y reserva en minutos.</p>
                    <Link to="/buscar" style={{ padding: '10px 20px', background: 'var(--green)', color: 'var(--dark1)', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>Buscar canchas</Link>
                  </div>
                );
              }
              if (reservaTab === 'historial') {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
                    <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Aún no tienes partidos jugados</p>
                    <p style={{ fontSize: '13px', marginBottom: '16px' }}>Cuando completes una reserva, aparecerá aquí tu historial.</p>
                  </div>
                );
              }
              return (
                <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📋</div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>No tienes reservas canceladas</p>
                  <p style={{ fontSize: '13px' }}>Tus cancelaciones aparecerán aquí si alguna reserva se cancela.</p>
                </div>
              );
            })()
          ) : (
            <>
              {reservas.map(r => {
                const esPasada = new Date(r.fecha + 'T' + (r.inicio || '23:59')) < new Date();
                const yaCalificoR = r.yaCalifico ?? localStorage.getItem(`review_${r.id}`) === 'true';
                const puedeCalificarR = (r.estado === 'CONFIRMADA' || r.estado === 'NO_SHOW') && !yaCalificoR;
                const fechaCard = new Date(r.fecha + 'T' + (r.inicio || '00:00'));
                const fechaStr = fechaCard.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
                const anioStr = fechaCard.getFullYear();
                const horaInicio = formatHora(r.inicio);
                const horaFin = formatHora(r.fin);
                return (
                  <div key={r.id} style={{ background: 'white', borderRadius: 'var(--r12)', border: '1px solid var(--gray2)', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: '14px', padding: '16px' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: 'var(--r10)', overflow: 'hidden', background: 'var(--gray2)', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚽</span>
                        {r.Fotos?.[0]?.URL_FOTO && <img src={getImageUrl(r.Fotos?.[0]?.URL_FOTO)} alt={r.canchaNombre} loading="lazy"
                          onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dark1)' }}>{r.canchaNombre}</div>
                          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px', color: 'var(--dark1)', whiteSpace: 'nowrap' }}>S/ {Number(r.precio).toFixed(2)}</div>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--textMid)', marginTop: '1px' }}>
                          {r.distrito}{r.localNombre ? ` · ${r.localNombre}` : ''}
                        </div>
                        <div style={{ fontSize: '12.5px', color: 'var(--textMid)', marginTop: '4px' }}>
                          {fechaStr} · {horaInicio} – {horaFin}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <span className={`badge ${getBadgeClass(r.estado)}`} style={{ fontSize: '11px' }}>{estadoLabel(r)}</span>
                        </div>

                        {/* Actions by estado */}
                        {reservaTab === 'proximas' && (r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE') && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                            <button onClick={() => { setSelectedReserva(r); jugadorService.obtenerReservaDetalle(r.id).then(res => { if (res.status === 'success' && res.data) setSelectedReserva(res.data); }); }}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Ver detalle
                            </button>
                            <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.distrito || r.localNombre || '')}`, '_blank')}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Cómo llegar
                            </button>
                            <button onClick={() => { const txt = `Tengo reserva en ${r.canchaNombre}\n${fechaStr} · ${horaInicio} - ${horaFin}\n${r.localNombre || r.distrito || ''}`; if (navigator.share) navigator.share({ title: 'Mi reserva', text: txt }); else { navigator.clipboard?.writeText(txt); showToast('Enlace copiado'); } }}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Compartir
                            </button>
                            {(r.estado === 'CONFIRMADA' || r.estado === 'PENDIENTE') && (
                              <button onClick={() => { setCancelModal(r.id); setMotivoCancel(''); }}
                                style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fecaca', background: 'white', color: 'var(--red)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                                Cancelar
                              </button>
                            )}
                          </div>
                        )}
                        {reservaTab === 'proximas' && r.estado === 'PENDIENTE' && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            <button onClick={() => {/* navigate to payment */}}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}>
                              Completar pago
                            </button>
                          </div>
                        )}
                        {reservaTab === 'historial' && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {puedeCalificarR && (
                              <button onClick={() => { setReviewModal({ id: r.id, canchaNombre: r.canchaNombre, fecha: r.fecha, inicio: r.inicio }); setReviewData({ calificacion: 0, comentarios: '' }); }}
                                style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '11.5px', cursor: 'pointer' }}>
                                Calificar cancha
                              </button>
                            )}
                            {yaCalificoR && (
                              <span style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--gray1)', color: 'var(--gray4)', fontWeight: 600, fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                Calificada
                              </span>
                            )}
                            <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Reservar de nuevo
                            </button>
                            <button onClick={() => { setSelectedReserva(r); jugadorService.obtenerReservaDetalle(r.id).then(res => { if (res.status === 'success' && res.data) setSelectedReserva(res.data); }); }}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Comprobante
                            </button>
                          </div>
                        )}
                        {reservaTab === 'canceladas' && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                            <button onClick={() => { setSelectedReserva(r); jugadorService.obtenerReservaDetalle(r.id).then(res => { if (res.status === 'success' && res.data) setSelectedReserva(res.data); }); }}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Ver detalle
                            </button>
                            <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '11.5px', cursor: 'pointer' }}>
                              Reservar de nuevo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => cargarReservas(p)}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--gray3)', background: p === pagination.page ? 'var(--dark1)' : 'white', color: p === pagination.page ? 'white' : 'var(--text)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ TAB MI PERFIL ============ */}
      {tabActiva === 'perfil' && (
        <div>
          {/* Card de identidad */}
          <div style={{
            background: 'linear-gradient(135deg, var(--dark1), #1e293b)', borderRadius: 'var(--r16)',
            padding: '18px 20px', marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', background: 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              fontSize: '20px', fontWeight: 800, color: 'var(--dark1)'
            }}>
              {getInitials(perfil?.nombre, perfil?.apellido)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>{perfil?.nombre} {perfil?.apellido}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{perfil?.email}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Jugador desde {formatFechaHumana(perfil?.fechaCreacion)}
              </div>
            </div>
          </div>

          {/* Grid de secciones: 2 columnas en desktop */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px', alignItems: 'start'
          }}>

            {/* Datos personales */}
            <div style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', overflow: 'hidden' }}>
              {!editing ? (
                <>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--gray2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Datos personales</h3>
                    <button onClick={() => setEditing(true)}
                      style={{ padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '11px' }}>
                      Editar datos
                    </button>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Nombre</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{perfil?.nombre} {perfil?.apellido}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Correo</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{perfil?.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Teléfono</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{perfil?.telefono || '—'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Miembro desde</div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{formatFechaHumana(perfil?.fechaCreacion)}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleGuardarPerfil}>
                  <div style={{ padding: '20px', borderBottom: '1px solid var(--gray2)' }}><h3 style={{ fontSize: '15px', fontWeight: 700 }}>Editar datos personales</h3></div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Nombre</label>
                      <input type="text" required value={formData.nombre} onChange={e => setFormData(d => ({ ...d, nombre: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Apellido</label>
                      <input type="text" required value={formData.apellido} onChange={e => setFormData(d => ({ ...d, apellido: e.target.value }))} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} /></div>
                    <div><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Teléfono</label>
                      <input type="tel" placeholder="999888777" value={formData.telefono} onChange={e => setFormData(d => ({ ...d, telefono: e.target.value }))} maxLength={9} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} /></div>
                  </div>
                  <div style={{ padding: '20px', borderTop: '1px solid var(--gray2)', display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => { setEditing(false); setFormData({ nombre: perfil?.nombre || '', apellido: perfil?.apellido || '', telefono: perfil?.telefono || '' }); }}
                      style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                    <button type="submit" disabled={saving}
                      style={{ flex: 2, padding: '10px 20px', borderRadius: '8px', border: 'none', background: saving ? '#94a3b8' : 'var(--dark1)', color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}</button>
                  </div>
                </form>
              )}
            </div>

            {/* Cuenta */}
            <div style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', overflow: 'hidden' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--gray2)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Cuenta</h3>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Tipo de cuenta</div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{perfil?.tipoCuenta || 'Jugador'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Contraseña</div>
                  <p style={{ fontSize: '13px', color: 'var(--textMid)', margin: '6px 0 14px', lineHeight: 1.4 }}>
                    {esGoogleAuth
                      ? 'Aún no tienes contraseña. Establécelas para iniciar sesión con correo y contraseña.'
                      : 'Actualízala si sospechas actividad extraña o por seguridad periódica.'}
                  </p>
                    <div style={{ textAlign: 'center' }}>
                    <button onClick={async () => {
                      const res = await jugadorService.obtenerPerfil();
                      setEsGoogleAuth(res?.data?.esGoogleAuth === true);
                      setPasswordModal(true);
                    }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                      {esGoogleAuth ? 'Establecer contraseña' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE RESERVA */}
      {selectedReserva && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setSelectedReserva(null)}>
          <div className="modal" style={{ background: 'var(--white)', borderRadius: 'var(--r24)', width: '100%', maxWidth: '480px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="modal-head" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="modal-title">Detalle de reserva</div>
              <button className="modal-close" onClick={() => setSelectedReserva(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray4)' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
              {detalleLoading ? <div style={{ textAlign: 'center', padding: '20px' }}>Cargando detalle...</div> : (() => {
                const r = selectedReserva;
                const fechaReserva = new Date(r.fecha + 'T' + (r.inicio || '23:59'));
                const esFutura = r.estado === 'CONFIRMADA' && fechaReserva > new Date();
                const esFinalizada = r.estado === 'CONFIRMADA' && fechaReserva < new Date();
                const esPendiente = r.estado === 'PENDIENTE';
                const esCancelada = r.estado === 'CANCELADA' || r.estado === 'REEMBOLSADA' || r.estado === 'EXPIRADA';
                const esNoShow = r.estado === 'NO_SHOW';
                const yaCalificoR = r.yaCalifico ?? localStorage.getItem(`review_${r.id}`) === 'true';
                const puedeCalificar = (esFinalizada || esNoShow) && !yaCalificoR;

                const precioNormal = r.precioBase || r.precio - (r.comision || 0) + (r.descuento || 0);
                const descuento = r.descuento || 0;
                const subtotal = precioNormal - descuento;
                const comision = r.comision || 0;

                return (
                  <>
                    <div style={{ marginBottom: '4px', textAlign: 'left' }}>
                      <span className={`badge ${getBadgeClass(r.estado)}`}>{estadoLabel(r)}</span>
                    </div>
                    {r.codigo && <div style={{ fontSize: '12px', color: 'var(--gray4)', fontFamily: 'monospace', letterSpacing: '1px', marginBottom: '10px' }}>Reserva {r.codigo}</div>}

                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '16px', textAlign: 'left' }}>{r.canchaNombre}</div>

                    {/* Reserva */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Reserva</div>
                      <div className="resumen-box">
                        <div className="resumen-row"><span>Fecha</span><span>{formatFecha(r.fecha)}</span></div>
                        <div className="resumen-row"><span>Horario</span><strong>{formatHora(r.inicio)} – {formatHora(r.fin)}</strong></div>
                        {r.tipoCancha && <div className="resumen-row"><span>Tipo</span><span>{r.tipoCancha}</span></div>}
                      </div>
                    </div>

                    {/* Ubicación */}
                    {(r.localNombre || r.localDireccion || r.distrito || r.referencia) && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Ubicación</div>
                        <div className="resumen-box">
                          {r.localNombre && <div className="resumen-row"><span>Complejo</span><span>{r.localNombre}</span></div>}
                          {r.localDireccion && <div className="resumen-row"><span>Dirección</span><span>{r.localDireccion}</span></div>}
                          {r.distrito && <div className="resumen-row"><span>Zona</span><span>{r.distrito}{r.departamento ? `, ${r.departamento}` : ''}</span></div>}
                          {r.referencia && <div className="resumen-row" style={{ borderBottom: 'none' }}><span>Referencia</span><span>{r.referencia}</span></div>}
                        </div>
                      </div>
                    )}

                    {/* Pago */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gray4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Pago</div>
                      <div className="resumen-box">
                        <div className="resumen-row"><span>Precio normal</span><span>S/ {Number(precioNormal).toFixed(2)}</span></div>
                        {descuento > 0 && <div className="resumen-row"><span>Descuento</span><span style={{ color: 'var(--red)' }}>- S/ {Number(descuento).toFixed(2)}</span></div>}
                        {descuento > 0 && <div className="resumen-row"><span>Subtotal</span><span>S/ {Number(subtotal).toFixed(2)}</span></div>}
                        {comision > 0 && <div className="resumen-row"><span>Comisión de servicio</span><span>S/ {Number(comision).toFixed(2)}</span></div>}
                        <div className="resumen-row" style={{ borderBottom: 'none' }}><span>Total pagado</span><strong style={{ color: 'var(--green)' }}>S/ {Number(r.precio).toFixed(2)}</strong></div>
                      </div>
                    </div>

                    {/* Contacto */}
                    {r.duenoNombre && (
                      <div style={{ background: 'var(--gray1)', borderRadius: 'var(--r12)', padding: '10px 12px', marginBottom: '14px', textAlign: 'left' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Contacto del complejo</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.duenoNombre}</div>
                            {r.duenoTelefono && <div style={{ fontSize: '13px', color: 'var(--textMid)' }}>{r.duenoTelefono}</div>}
                          </div>
                          {r.duenoTelefono && (
                            <a href={`https://wa.me/51${r.duenoTelefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: '#25D366', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              Abrir WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Acciones según estado */}
                    {esFutura && (
                      <div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.distrito || r.localNombre || '')}`, '_blank')}
                            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Cómo llegar
                          </button>
                          <button onClick={() => { const url = `${window.location.origin}/cancha/${r.canchaSlug || ''}`; if (navigator.share) navigator.share({ title: r.canchaNombre, text: `Reserva en ${r.canchaNombre}`, url }); else { navigator.clipboard?.writeText(url); showToast('Enlace de la cancha copiado'); } }}
                            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Compartir
                          </button>
                        </div>
                        {r.rutaPdf && (
                          <button onClick={() => handleDownloadComprobante(r.id)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', background: 'var(--dark1)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer', marginBottom: '14px', width: '100%' }}>
                            ⬇️ Descargar comprobante PDF
                          </button>
                        )}
                        <div style={{ borderTop: '1px solid var(--gray2)', paddingTop: '12px' }}>
                          <p style={{ fontSize: '12px', color: 'var(--gray4)', marginBottom: '8px' }}>Puedes cancelar según la política del complejo.</p>
                          <button onClick={() => { setCancelModal(r.id); setMotivoCancel(''); }}
                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: 'white', color: 'var(--red)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                            Cancelar reserva
                          </button>
                        </div>
                      </div>
                    )}

                    {esPendiente && (
                      <div>
                        <p style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '12px' }}>Tu horario aún no está confirmado. Completa el pago para asegurar la reserva.</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => {/* navigate to payment */}}
                            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                            Completar pago
                          </button>
                          <button onClick={() => { setCancelModal(r.id); setMotivoCancel(''); }}
                            style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #fecaca', background: 'white', color: 'var(--red)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {(esFinalizada || esNoShow) && (
                      <div>
                        {esFinalizada && <p style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '12px' }}>Esta reserva ya finalizó. Puedes calificar la cancha o reservar nuevamente.</p>}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {puedeCalificar && (
                            <button onClick={() => { setReviewModal({ id: r.id, canchaNombre: r.canchaNombre, fecha: r.fecha, inicio: r.inicio }); setReviewData({ calificacion: 0, comentarios: '' }); }}
                              style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'var(--green)', color: 'var(--dark1)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                              Calificar cancha
                            </button>
                          )}
                          {yaCalificoR && (
                            <span style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'var(--gray1)', color: 'var(--gray4)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              Ya calificaste esta cancha
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Reservar de nuevo
                          </button>
                          {r.rutaPdf && (
                            <button onClick={() => handleDownloadComprobante(r.id)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                              ⬇️ Comprobante PDF
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {esCancelada && (
                      <div>
                        <p style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '12px' }}>
                          {r.estado === 'CANCELADA' && !r.reembolsoStatus && 'No se realizó cobro.'}
                          {r.estado === 'CANCELADA' && r.reembolsoStatus === 'REEMBOLSADO' && 'Reembolso procesado.'}
                          {r.estado === 'CANCELADA' && r.reembolsoStatus === 'PENDIENTE' && 'Reembolso pendiente.'}
                          {r.estado === 'REEMBOLSADA' && 'Reembolso procesado.'}
                          {r.estado === 'EXPIRADA' && 'La reserva expiró.'}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => navigate(`/buscar?nombre=${encodeURIComponent(r.canchaNombre || '')}`)}
                            style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                            Reservar de nuevo
                          </button>
                          {r.rutaPdf && (
                            <button onClick={() => handleDownloadComprobante(r.id)}
                              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', color: 'var(--text)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                              ⬇️ Comprobante PDF
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {cancelModal && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => { if (!cancelLoading) setCancelModal(null); }}>
          <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '420px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1a2033' }}>¿Cancelar esta reserva?</h3>
            {(() => {
              const r = reservas.find(rr => rr.id === cancelModal) || (selectedReserva?.id === cancelModal ? selectedReserva : null);
              if (!r) return null;
              return (
                <div style={{ background: 'var(--gray1)', borderRadius: 'var(--r10)', padding: '14px', margin: '14px 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{r.canchaNombre}</div>
                  <div style={{ fontSize: '13px', color: 'var(--textMid)' }}>{formatFecha(r.fecha)} · {formatHora(r.inicio)} – {formatHora(r.fin)}</div>
                </div>
              );
            })()}
            <p style={{ color: '#5a6478', fontSize: '13px', marginBottom: '16px' }}>Según la política del complejo, podrías recibir un reembolso parcial.</p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Motivo (opcional)</label>
              <input type="text" placeholder="Ej: Imprevisto personal" value={motivoCancel} onChange={e => setMotivoCancel(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { if (!cancelLoading) setCancelModal(null); }}
                style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: cancelLoading ? 'not-allowed' : 'pointer', fontSize: '14px', color: '#374151' }}>No cancelar</button>
              <button onClick={handleCancelarReserva} disabled={cancelLoading}
                style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: cancelLoading ? '#94a3b8' : '#dc2626', color: 'white', fontWeight: 600, cursor: cancelLoading ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                {cancelLoading ? 'Cancelando...' : 'Sí, cancelar reserva'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CALIFICAR */}
      {reviewModal && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => { if (!reviewLoading) setReviewModal(null); }}>
          <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '420px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1a2033' }}>Calificar cancha</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{reviewModal.canchaNombre}</div>
              <div style={{ fontSize: '13px', color: 'var(--textMid)' }}>{formatFecha(reviewModal.fecha)} · {formatHora(reviewModal.inicio)}</div>
            </div>
            <p style={{ color: '#5a6478', fontSize: '14px', marginBottom: '20px' }}>¿Cómo fue tu experiencia?</p>
            <form onSubmit={handleEnviarReview}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>Puntuación</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewData(d => ({ ...d, calificacion: star }))}
                      style={{ fontSize: '32px', background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewData.calificacion ? '#f59e0b' : '#d1d5db' }}>
                      {star <= reviewData.calificacion ? '★' : '☆'}</button>
                  ))}
                </div>
                <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--gray4)', marginTop: '6px' }}>
                  {reviewData.calificacion > 0 ? `${reviewData.calificacion} de 5 · ${ratingLabel(reviewData.calificacion)}` : 'Selecciona una puntuación para continuar.'}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Comentario opcional</label>
                <textarea placeholder="Ej: buena iluminación, cancha en buen estado y atención rápida." maxLength={300} value={reviewData.comentarios}
                  onChange={e => setReviewData(d => ({ ...d, comentarios: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right', marginTop: '4px' }}>{reviewData.comentarios.length}/300</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { if (!reviewLoading) setReviewModal(null); }}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: reviewLoading ? 'not-allowed' : 'pointer', fontSize: '14px', color: '#374151' }}>Cancelar</button>
                <button type="submit" disabled={reviewLoading || reviewData.calificacion === 0}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: reviewLoading || reviewData.calificacion === 0 ? '#94a3b8' : 'var(--green)', color: 'var(--dark1)', fontWeight: 600, cursor: reviewLoading || reviewData.calificacion === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  {reviewLoading ? 'Enviando...' : 'Enviar calificación'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR/ESTABLECER CONTRASEÑA */}
      {passwordModal && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => { if (!passwordSaving) { setPasswordModal(false); setEsGoogleAuth(false); } }}>
          <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '420px', padding: '28px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1a2033' }}>{esGoogleAuth ? 'Establecer contraseña' : 'Cambiar contraseña'}</h3>
            <p style={{ color: '#5a6478', fontSize: '13px', marginBottom: '20px' }}>
              {esGoogleAuth
                ? 'Establece una contraseña para tu cuenta. Luego podrás iniciar sesión con correo y contraseña.'
                : 'Ingresa tu contraseña actual y una nueva.'}
            </p>
            <form onSubmit={handleGuardarPassword}>
              {!esGoogleAuth && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Contraseña actual</label>
                  <input type="password" required value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(d => ({ ...d, currentPassword: e.target.value }))}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} />
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Nueva contraseña</label>
                <input type="password" required value={passwordForm.newPassword}
                  onChange={e => { setPasswordForm(d => ({ ...d, newPassword: e.target.value })); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} />
                {passwordForm.newPassword && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ width: `${(pwdValidation.strength / 6) * 100}%`, height: '100%', backgroundColor: pwdValidation.color, transition: 'width 0.2s, background 0.2s' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: pwdValidation.color, fontWeight: 600, marginTop: '2px', display: 'block' }}>
                      {pwdValidation.label}
                    </span>
                    <ul style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0', paddingLeft: '14px', listStyle: 'disc', lineHeight: 1.5 }}>
                      {pwdValidation.errors.map((e, i) => (
                        <li key={i} style={{ color: '#ef4444' }}>{e}</li>
                      ))}
                      {pwdValidation.strength >= 6 && <li style={{ color: '#22c55e' }}>Contraseña muy segura ✓</li>}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Confirmar nueva contraseña</label>
                <input type="password" required value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(d => ({ ...d, confirmPassword: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { if (!passwordSaving) { setPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setEsGoogleAuth(false); } }}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: passwordSaving ? 'not-allowed' : 'pointer', fontSize: '14px', color: '#374151' }}>Cancelar</button>
                <button type="submit" disabled={passwordSaving}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: passwordSaving ? '#94a3b8' : 'var(--dark1)', color: 'white', fontWeight: 600, cursor: passwordSaving ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  {passwordSaving ? 'Guardando...' : (esGoogleAuth ? 'Establecer contraseña' : 'Guardar contraseña')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PanelJugador;
