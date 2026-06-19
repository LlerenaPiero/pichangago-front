import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { canchaService } from '../services/canchaService';
import { getImageUrl } from '../utils/imageUrl';

const MisReservas = () => {
  const [activeTab, setActiveTab] = useState('proximas');
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar datos reales desde Azure
  useEffect(() => {
    const cargarReservas = async () => {
      try {
        // Ping de seguridad del radar global
        await authService.fetchProtected('/api/status');
        
        // Petición real de reservas
        const res = await canchaService.obtenerMisReservas();
        if (res.status === 'success') {
          setReservas(res.data || []);
        }
      } catch (error) {
        console.error("Error al cargar reservas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarReservas();
  }, []);

  // 2. Lógica de pestañas
  const filtradas = reservas.filter(r => {
    if (activeTab === 'proximas') return r.estado === 'CONFIRMADA';
    return r.estado !== 'CONFIRMADA';
  });

  const getBadgeClass = (estado) => {
    return {
      CONFIRMADA: 'badge-green',
      COMPLETADA: 'badge-gray',
      NO_SHOW: 'badge-red',
      CANCELADA: 'badge-amber'
    }[estado] || 'badge-gray';
  };

  const handleCancelarReserva = (id) => {
    setReservas(reservas.map(r => r.id === id ? { ...r, estado: 'CANCELADA' } : r));
    setSelectedReserva(null);
    alert('✅ Tu reserva ha sido cancelada en tu dispositivo. (Para cancelar en BD requiere otro endpoint).');
  };

  return (
    <div className="view active" style={{ animation: 'fadeIn .25s ease' }}>
      <div className="page-wrap" style={{ maxWidth: '800px' }}>
        
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 className="section-title">Mis Reservas</h2>
          <p className="section-sub">Gestiona tus partidos y revisa tus comprobantes de pago</p>
        </div>

        <div className="reservas-tabs">
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
              <span className="loader" style={{ borderTopColor: 'var(--green)', display: 'inline-block', marginBottom: '10px' }}></span>
              <p>Cargando tus partidos...</p>
            </div>
          ) : filtradas.length > 0 ? (
            filtradas.map(r => (
                <div className="reserva-item" key={r.id} onClick={() => setSelectedReserva(r)} style={{ cursor: 'pointer' }}>
                  <img className="reserva-foto" src={getImageUrl(r.foto)} alt={r.canchaNombre} />
                  <div className="reserva-info" style={{ textAlign: 'left' }}>
                    <div className="cancha-nombre" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px', color: 'var(--dark1)' }}>
                      {r.canchaNombre}
                    </div>
                    <div className="fecha" style={{ fontSize: '13.5px', color: 'var(--textMid)', marginTop: '2px' }}>
                      📅 {r.fecha}
                    </div>
                    <div className="horario" style={{ fontSize: '13px', color: 'var(--textMid)' }}>
                      🕐 {r.inicio} – {r.fin} · {r.distrito}
                    </div>
                  </div>
                  <div className="reserva-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div className="reserva-monto" style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '4px' }}>
                      S/ {r.precio.toFixed(2)}
                    </div>
                    <span className={`badge ${getBadgeClass(r.estado)}`}>
                      {r.estado}
                    </span>
                  </div>
                </div>
            ))
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--textMid)' }}>
              <div className="icon" style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>
                {activeTab === 'proximas' ? '⚽' : '📋'}
              </div>
              <p>No tienes reservas en esta sección</p>
            </div>
          )}
        </div>
      </div>

      {/* 🚨 MODAL DETALLE DE RESERVA BLINDADO 🚨 */}
      {selectedReserva && (
          <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div className="modal" style={{ background: 'var(--white)', borderRadius: 'var(--r24)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
              
              <div className="modal-head" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="modal-title">Detalle de reserva</div>
                <button className="modal-close" onClick={() => setSelectedReserva(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray4)' }}>✕</button>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                <img src={getImageUrl(selectedReserva.foto)} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--r12)', marginBottom: '16px' }} alt="Cancha" />
                
                <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                  <span className={`badge ${getBadgeClass(selectedReserva.estado)}`}>
                    {selectedReserva.estado}
                  </span>
                </div>

                <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, color: 'var(--dark1)', marginBottom: '16px', textAlign: 'left' }}>
                  {selectedReserva.canchaNombre}
                </div>

                <div className="resumen-box" style={{ marginBottom: '20px' }}>
                  <div className="resumen-row">
                    <span>Código</span>
                    <strong style={{ fontFamily: 'var(--font-head)', letterSpacing: '1px' }}>{selectedReserva.codigo}</strong>
                  </div>
                  <div className="resumen-row"><span>Fecha</span><span>{selectedReserva.fecha}</span></div>
                  <div className="resumen-row"><span>Horario</span><strong>{selectedReserva.inicio} – {selectedReserva.fin}</strong></div>
                  
                  <div className="resumen-row"><span>Precio total</span><strong>S/ {selectedReserva.precio?.toFixed(2)}</strong></div>
                  
                  <div className="resumen-row" style={{ borderBottom: 'none' }}>
                    <span>Estado del pago</span>
                    <span style={{ color: 'var(--green2)', fontWeight: 700 }}>Pagado Online</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => alert('⬇️ Descargando comprobante en formato PDF...')}>
                    ⬇️ PDF
                  </button>
                  {selectedReserva.estado === 'CONFIRMADA' && (
                    <button className="btn btn-red" style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r8)', fontWeight: 600 }} onClick={() => handleCancelarReserva(selectedReserva.id)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
    </div>
  );
};

export default MisReservas;