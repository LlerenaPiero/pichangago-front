import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jugadorService } from '../services/jugadorService';
import { getImageUrl, FALLBACK_IMG } from '../utils/imageUrl';
import { getCanchaSlug } from '../utils/slugify';

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

const MisReservas = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('proximas');
  const [reservas, setReservas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [motivoCancel, setMotivoCancel] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ calificacion: 5, comentarios: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const estado = activeTab === 'proximas' ? 'CONFIRMADA' : '';
      const res = await jugadorService.obtenerReservas({ page: 1, limit: 10, estado });
      if (!mounted) return;
      if (res.status === 'success') {
        setReservas(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      } else {
        setReservas([]);
      }
      setIsLoading(false);
    })();
    return () => { mounted = false; };
  }, [activeTab]);

  const recargarReservas = async (page = 1) => {
    setIsLoading(true);
    const estado = activeTab === 'proximas' ? 'CONFIRMADA' : '';
    const res = await jugadorService.obtenerReservas({ page, limit: pagination.limit, estado });
    if (res.status === 'success') {
      setReservas(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } else {
      setReservas([]);
    }
    setIsLoading(false);
  };

  const cargarDetalle = async (reserva) => {
    setDetalleLoading(true);
    setSelectedReserva(reserva);
    const res = await jugadorService.obtenerReservaDetalle(reserva.id);
    if (res.status === 'success' && res.data) {
      setSelectedReserva(res.data);
    }
    setDetalleLoading(false);
  };

  const handleCancelarReserva = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    const res = await jugadorService.cancelarReserva(cancelModal, motivoCancel);
    if (res.status === 'success') {
      showToast('Reserva cancelada correctamente.');
      setCancelModal(null);
      setMotivoCancel('');
      setSelectedReserva(null);
      recargarReservas(pagination.page);
    } else {
      showToast(res.error || 'Error al cancelar reserva.', 'error');
    }
    setCancelLoading(false);
  };

  const handleEnviarReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    setReviewLoading(true);
    const res = await jugadorService.crearReview({
      idReserva: reviewModal,
      calificacion: reviewData.calificacion,
      comentarios: reviewData.comentarios,
    });
    const setYaCalificoEnLista = () => {
      localStorage.setItem(`review_${reviewModal}`, 'true');
      setReservas(prev => prev.map(r => r.id === reviewModal ? { ...r, yaCalifico: true } : r));
      if (selectedReserva?.id === reviewModal) {
        setSelectedReserva(prev => prev ? { ...prev, yaCalifico: true } : prev);
      }
    };
    if (res.status === 'success') {
      showToast('¡Calificación guardada con éxito!');
      setYaCalificoEnLista();
      setReviewModal(null);
      setReviewData({ calificacion: 5, comentarios: '' });
      setSelectedReserva(null);
    } else {
      if (res.error && res.error.includes('Ya calificaste')) {
        setYaCalificoEnLista();
        showToast('Ya habías calificado esta reserva.', 'error');
        setReviewModal(null);
        setSelectedReserva(null);
      } else {
        showToast(res.error || 'Error al enviar reseña.', 'error');
      }
    }
    setReviewLoading(false);
  };

  const filtradas = reservas;

  const puedeCalificar = (r) => {
    const yaCalificoFinal = r.yaCalifico ?? localStorage.getItem(`review_${r.id}`) === 'true';
    return (r.estado === 'CONFIRMADA' || r.estado === 'NO_SHOW') && !yaCalificoFinal;
  };

  return (
    <div className="view active" style={{ animation: 'fadeIn .25s ease' }}>
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

      <div className="page-wrap" style={{ maxWidth: '800px' }}>
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Mis Reservas</h2>
          <p className="section-sub">Gestiona tus partidos y revisa tus comprobantes de pago</p>
        </div>

        <div className="reservas-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button className={`tab-btn ${activeTab === 'proximas' ? 'active' : ''}`} onClick={() => setActiveTab('proximas')}>
            Próximas
          </button>
          <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
            Historial
          </button>
        </div>

        <div id="reservas-lista">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMid)' }}>
              <p>Cargando tus partidos...</p>
            </div>
          ) : filtradas.length > 0 ? (
            <>
              {filtradas.map(r => (
                <div className="reserva-item" key={r.id} onClick={() => cargarDetalle(r)} style={{ cursor: 'pointer' }}>
                  <img className="reserva-foto" src={getImageUrl(r.Fotos?.[0]?.URL_FOTO)} alt={r.canchaNombre}
                    onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }} />
                  <div className="reserva-info" style={{ textAlign: 'left' }}>
                    <div className="cancha-nombre" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px', color: 'var(--dark1)' }}>
                      {r.canchaNombre}
                    </div>
                    <div style={{ fontSize: '13.5px', color: 'var(--textMid)', marginTop: '2px' }}>
                      📅 {r.fecha}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--textMid)' }}>
                      🕐 {r.inicio} – {r.fin} · {r.distrito}
                    </div>
                    {r.localNombre && (
                      <div style={{ fontSize: '12px', color: 'var(--gray4)', marginTop: '2px' }}>
                        📍 {r.localNombre}
                      </div>
                    )}
                  </div>
                  <div className="reserva-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '4px' }}>
                      S/ {Number(r.precio).toFixed(2)}
                    </div>
                    <span className={`badge ${getBadgeClass(r.estado)}`}>
                      {ESTADO_LABELS[r.estado] || r.estado}
                    </span>
                  </div>
                </div>
              ))}

              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => recargarReservas(p)}
                      style={{
                        padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--gray3)',
                        background: p === pagination.page ? 'var(--dark1)' : 'white',
                        color: p === pagination.page ? 'white' : 'var(--text)',
                        fontWeight: 600, cursor: 'pointer', fontSize: '14px'
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>
                {activeTab === 'proximas' ? '⚽' : '📋'}
              </div>
              <p>No tienes reservas en esta secci&oacute;n</p>
              {activeTab === 'proximas' && (
                <Link to="/buscar" className="btn btn-green" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
                  Buscar canchas disponibles
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE DE RESERVA */}
      {selectedReserva && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setSelectedReserva(null)}>
          <div className="modal" style={{ background: 'var(--white)', borderRadius: 'var(--r24)', width: '100%', maxWidth: '480px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div className="modal-head" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="modal-title">Detalle de reserva</div>
              <button className="modal-close" onClick={() => setSelectedReserva(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray4)' }}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              {detalleLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Cargando detalle...</div>
              ) : (
                <>
                  {selectedReserva.Fotos?.[0]?.URL_FOTO && (
                    <img src={getImageUrl(selectedReserva.Fotos?.[0]?.URL_FOTO)} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--r12)', marginBottom: '16px' }} alt="Cancha"
                      onError={e => { if (e.target.src !== FALLBACK_IMG) e.target.src = FALLBACK_IMG; }} />
                  )}

                  <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                    <span className={`badge ${getBadgeClass(selectedReserva.estado)}`}>
                      {ESTADO_LABELS[selectedReserva.estado] || selectedReserva.estado}
                    </span>
                    {selectedReserva.codigo && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--gray4)', fontFamily: 'monospace', letterSpacing: '1px' }}>
                        {selectedReserva.codigo}
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, color: 'var(--dark1)', marginBottom: '16px', textAlign: 'left' }}>
                    {selectedReserva.canchaNombre}
                  </div>

                  <div className="resumen-box" style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <div className="resumen-row"><span>Fecha</span><span>{selectedReserva.fecha}</span></div>
                    <div className="resumen-row"><span>Horario</span><strong>{selectedReserva.inicio} – {selectedReserva.fin}</strong></div>
                    {selectedReserva.localNombre && (
                      <div className="resumen-row"><span>Local</span><span>{selectedReserva.localNombre}</span></div>
                    )}
                    {selectedReserva.localDireccion && (
                      <div className="resumen-row"><span>Dirección</span><span>{selectedReserva.localDireccion}</span></div>
                    )}
                    {selectedReserva.distrito && (
                      <div className="resumen-row"><span>Distrito</span><span>{selectedReserva.distrito}</span></div>
                    )}
                    {selectedReserva.tipoCancha && (
                      <div className="resumen-row"><span>Tipo</span><span>{selectedReserva.tipoCancha}</span></div>
                    )}
                    <div className="resumen-row" style={{ borderBottom: 'none' }}>
                      <span>Precio total</span>
                      <strong style={{ color: 'var(--green)' }}>S/ {Number(selectedReserva.precio).toFixed(2)}</strong>
                    </div>
                    {selectedReserva.comision > 0 && (
                      <div className="resumen-row"><span>Comisión</span><span>S/ {Number(selectedReserva.comision).toFixed(2)}</span></div>
                    )}
                  </div>

                  {selectedReserva.duenoNombre && (
                    <div style={{ background: 'var(--gray1)', borderRadius: 'var(--r12)', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray4)', marginBottom: '6px' }}>CONTACTO DEL DUEÑO</div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>👤 {selectedReserva.duenoNombre}</div>
                      {selectedReserva.duenoTelefono && (
                        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📱 {selectedReserva.duenoTelefono}</span>
                          <a href={`https://wa.me/51${selectedReserva.duenoTelefono.replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding: '4px 12px', background: '#25D366', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                            WhatsApp
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedReserva.referencia && (
                    <div style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '16px', textAlign: 'left' }}>
                      📍 Referencia: {selectedReserva.referencia}
                    </div>
                  )}

                  {selectedReserva.rutaPdf && (
                    <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                      <button onClick={async () => { const res = await jugadorService.descargarComprobante(selectedReserva.id); if (res.status !== 'success') showToast(res.error || 'Error al descargar.', 'error'); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'var(--dark1)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                        ⬇️ Descargar comprobante
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {(selectedReserva.estado === 'CONFIRMADA' || selectedReserva.estado === 'PENDIENTE') && (
                      <button className="btn btn-red" style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r8)', fontWeight: 600, padding: '10px 20px', cursor: 'pointer' }}
                        onClick={() => { setCancelModal(selectedReserva.id); setMotivoCancel(''); }}>
                        Cancelar reserva
                      </button>
                    )}
                    {puedeCalificar(selectedReserva) && (
                      <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center', background: 'var(--green)', color: 'var(--dark1)', border: 'none', borderRadius: 'var(--r8)', fontWeight: 600, padding: '10px 20px', cursor: 'pointer' }}
                        onClick={() => { setReviewModal(selectedReserva.id); setReviewData({ calificacion: 5, comentarios: '' }); }}>
                        Calificar cancha
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '10px 20px', cursor: 'pointer' }}
                      onClick={() => {
                        const tmp = { ID_CANCHA: selectedReserva.canchaId, NOMBRE: selectedReserva.canchaNombre };
                        navigate(`/cancha/${getCanchaSlug(tmp)}`);
                      }}>
                      Ver cancha
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR RESERVA */}
      {cancelModal && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => { if (!cancelLoading) setCancelModal(null); }}>
          <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '400px', padding: '28px' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a2033' }}>¿Cancelar reserva?</h3>
            <p style={{ color: '#5a6478', fontSize: '14px', marginBottom: '16px' }}>
              Esta acci&oacute;n no se puede deshacer. El slot quedar&aacute; disponible para otros jugadores.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Motivo (opcional)</label>
              <input type="text" placeholder="Ej: Imprevisto personal" value={motivoCancel}
                onChange={e => setMotivoCancel(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { if (!cancelLoading) setCancelModal(null); }}
                style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: cancelLoading ? 'not-allowed' : 'pointer', fontSize: '14px', color: '#374151' }}>
                Volver
              </button>
              <button onClick={handleCancelarReserva} disabled={cancelLoading}
                style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: cancelLoading ? '#94a3b8' : '#dc2626', color: 'white', fontWeight: 600, cursor: cancelLoading ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                {cancelLoading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CALIFICAR */}
      {reviewModal && (
        <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => { if (!reviewLoading) setReviewModal(null); }}>
          <div className="modal" style={{ background: 'white', borderRadius: 'var(--r24)', width: '100%', maxWidth: '420px', padding: '28px' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a2033' }}>Calificar cancha</h3>
            <p style={{ color: '#5a6478', fontSize: '14px', marginBottom: '20px' }}>
              ¿C&oacute;mo fue tu experiencia en esta cancha?
            </p>
            <form onSubmit={handleEnviarReview}>
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#475569' }}>Puntuaci&oacute;n</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button"
                      onClick={() => setReviewData(d => ({ ...d, calificacion: star }))}
                      style={{
                        fontSize: '32px', background: 'none', border: 'none', cursor: 'pointer',
                        color: star <= reviewData.calificacion ? '#f59e0b' : '#d1d5db',
                        transition: 'color 0.15s'
                      }}>
                      {star <= reviewData.calificacion ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Comentario (opcional)</label>
                <textarea placeholder="Cu&eacute;ntanos c&oacute;mo fue tu experiencia..." maxLength={300}
                  value={reviewData.comentarios}
                  onChange={e => setReviewData(d => ({ ...d, comentarios: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'right', marginTop: '4px' }}>{reviewData.comentarios.length}/300</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => { if (!reviewLoading) setReviewModal(null); }}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: reviewLoading ? 'not-allowed' : 'pointer', fontSize: '14px', color: '#374151' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={reviewLoading}
                  style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', background: reviewLoading ? '#94a3b8' : 'var(--green)', color: 'var(--dark1)', fontWeight: 600, cursor: reviewLoading ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                  {reviewLoading ? 'Enviando...' : 'Enviar calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReservas;
