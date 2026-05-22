import { useState, useEffect } from 'react';
import { authService } from '../services/authService'; // 👈 Importamos el servicio

// ── DATA REAL DE TU PROTOTIPO (pichangago-data.js)
const CANCHAS_MOCK = {
  c1: { nombre: "Cancha Los Cóndores", distrito: "Miraflores", foto: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80" },
  c2: { nombre: "FútbolPark San Borja", distrito: "San Borja", foto: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80" },
  c3: { nombre: "Arena Soccer La Molina", distrito: "La Molina", foto: "https://images.unsplash.com/photo-1516566775063-24e0cef04c83?w=600&q=80" }
};

const RESERVAS_MOCK = [
  { id: "r1", canchaId: "c1", fecha: "2026-05-24", inicio: "19:00", fin: "20:00", precio: 110, estado: "confirmada", codigo: "PG-2026-R1847" },
  { id: "r2", canchaId: "c3", fecha: "2026-05-16", inicio: "20:00", fin: "21:00", precio: 120, estado: "completada", codigo: "PG-2026-R1811" },
  { id: "r3", canchaId: "c2", fecha: "2026-05-12", inicio: "18:00", fin: "19:00", precio: 90, estado: "completada", codigo: "PG-2026-R1755" },
  { id: "r4", canchaId: "c1", fecha: "2026-05-08", inicio: "19:00", fin: "20:00", precio: 110, estado: "no_show", codigo: "PG-2026-R1720" }
];

const MisReservas = () => {
  const [activeTab, setActiveTab] = useState('proximas');
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reservas, setReservas] = useState(RESERVAS_MOCK);

  // 🛡️ TRAMPA PARA EL INCÓGNITO: Obligamos a la pantalla a validar el token con el backend
  useEffect(() => {
    const verificarSesionGlobal = async () => {
      try {
        // Hacemos un ping al backend protegido para forzar la validación de la lista negra
        await authService.fetchProtected('/api/status');
      } catch (error) {
        // Si el token está en lista negra, el interceptor ya habrá cerrado la sesión automáticamente
        console.warn('La sesión fue destruida remotamente.');
      }
    };
    verificarSesionGlobal();
  }, []);

  const filtradas = reservas.filter(r => {
    if (activeTab === 'proximas') return r.estado === 'confirmada';
    return r.estado !== 'confirmada';
  });

  const getBadgeClass = (estado) => {
    return {
      confirmada: 'badge-green',
      completada: 'badge-gray',
      no_show: 'badge-red',
      cancelada: 'badge-amber'
    }[estado] || 'badge-gray';
  };

  const getEstadoLabel = (estado) => {
    return {
      confirmada: 'Confirmada',
      completada: 'Completada',
      no_show: 'No asistió',
      cancelada: 'Cancelada'
    }[estado] || estado;
  };

  const handleCancelarReserva = (id) => {
    setReservas(reservas.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
    setSelectedReserva(null);
    alert('✅ Tu reserva ha sido cancelada con éxito y se procesará tu reembolso según las políticas de la zona.');
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
          {filtradas.length > 0 ? (
            filtradas.map(r => {
              const cancha = CANCHAS_MOCK[r.canchaId];
              return (
                <div className="reserva-item" key={r.id} onClick={() => setSelectedReserva(r)} style={{ cursor: 'pointer' }}>
                  <img className="reserva-foto" src={cancha?.foto} alt={cancha?.nombre} />
                  <div className="reserva-info" style={{ textAlign: 'left' }}>
                    <div className="cancha-nombre" style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '16px', color: 'var(--dark1)' }}>
                      {cancha?.nombre}
                    </div>
                    <div className="fecha" style={{ fontSize: '13.5px', color: 'var(--textMid)', marginTop: '2px' }}>
                      📅 {r.fecha}
                    </div>
                    <div className="horario" style={{ fontSize: '13px', color: 'var(--textMid)' }}>
                      🕐 {r.inicio} – {r.fin} · {cancha?.distrito}
                    </div>
                  </div>
                  <div className="reserva-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div className="reserva-monto" style={{ fontFamily: 'var(--font-head)', fontSize: '17px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '4px' }}>
                      S/ {r.precio.toFixed(2)}
                    </div>
                    <span className={`badge ${getBadgeClass(r.estado)}`}>
                      {getEstadoLabel(r.estado)}
                    </span>
                  </div>
                </div>
              );
            })
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
      {selectedReserva && (() => {
        const cancha = CANCHAS_MOCK[selectedReserva.canchaId];
        return (
          <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div className="modal" style={{ background: 'var(--white)', borderRadius: 'var(--r24)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>
              
              {/* ¡CORREGIDO: justifyContent! */}
              <div className="modal-head" style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--gray2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="modal-title">Detalle de reserva</div>
                <button className="modal-close" onClick={() => setSelectedReserva(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--gray4)' }}>✕</button>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                <img src={cancha?.foto} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--r12)', marginBottom: '16px' }} alt="Cancha" />
                
                <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                  <span className={`badge ${getBadgeClass(selectedReserva.estado)}`}>
                    {getEstadoLabel(selectedReserva.estado)}
                  </span>
                </div>

                <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, color: 'var(--dark1)', marginBottom: '16px', textAlign: 'left' }}>
                  {cancha?.nombre}
                </div>

                <div className="resumen-box" style={{ marginBottom: '20px' }}>
                  <div className="resumen-row">
                    <span>Código</span>
                    <strong style={{ fontFamily: 'var(--font-head)', letterSpacing: '1px' }}>{selectedReserva.codigo}</strong>
                  </div>
                  <div className="resumen-row"><span>Fecha</span><span>{selectedReserva.fecha}</span></div>
                  <div className="resumen-row"><span>Horario</span><strong>{selectedReserva.inicio} – {selectedReserva.fin}</strong></div>
                  
                  {/* ¡CORREGIDO: OPTIONAL CHAINING PARA EVITAR PANTALLA BLANCA! */}
                  <div className="resumen-row"><span>Precio total</span><strong>S/ {selectedReserva?.precio?.toFixed(2) || '0.00'}</strong></div>
                  
                  <div className="resumen-row" style={{ borderBottom: 'none' }}>
                    <span>Estado del pago</span>
                    <span style={{ color: 'var(--green2)', fontWeight: 700 }}>100% Pagado Online</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => alert('⬇️ Descargando comprobante en formato PDF...')}>
                    ⬇️ PDF
                  </button>
                  {selectedReserva.estado === 'confirmada' && (
                    <button className="btn btn-red" style={{ flex: 1, justifyContent: 'center', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r8)', fontWeight: 600 }} onClick={() => handleCancelarReserva(selectedReserva.id)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MisReservas;