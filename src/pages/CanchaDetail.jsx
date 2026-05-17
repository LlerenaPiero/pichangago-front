import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// ── BANCO DE DATOS REAL
const CANCHAS_DATA = [
  {
    id: "c1",
    nombre: "Cancha Los Cóndores",
    distrito: "Miraflores",
    direccion: "Av. Benavides 1240, Miraflores",
    tipo: "Fútbol 7 · Sintético",
    precioBase: 80,
    precioValle: 60,
    precioPrime: 110,
    yape: "987 654 321",
    foto: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=700&q=80",
    rating: 4.7,
    totalReservas: 312,
    amenidades: ["Vestuarios", "Estacionamiento", "Iluminación LED", "Cafetería"]
  },
  {
    id: "c2",
    nombre: "FútbolPark San Borja",
    distrito: "San Borja",
    direccion: "Jr. Las Artes 560, San Borja",
    tipo: "Fútbol 5 · Sintético",
    precioBase: 65,
    precioValle: 50,
    precioPrime: 90,
    yape: "976 543 210",
    foto: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=700&q=80",
    rating: 4.4,
    totalReservas: 198,
    amenidades: ["Vestuarios", "Iluminación LED", "Wifi"]
  },
  {
    id: "c3",
    nombre: "Arena Soccer La Molina",
    distrito: "La Molina",
    direccion: "Av. La Fontana 850, La Molina",
    tipo: "Fútbol 7 · Sintético",
    precioBase: 90,
    precioValle: 70,
    precioPrime: 120,
    yape: "987 654 321",
    foto: "https://images.unsplash.com/photo-1516566775063-24e0cef04c83?w=700&q=80",
    rating: 4.9,
    totalReservas: 421,
    amenidades: ["Vestuarios", "Estacionamiento", "Tribuna", "Bar deportivo"]
  },
  {
    id: "c4",
    nombre: "Estadito Surco",
    distrito: "Santiago de Surco",
    direccion: "Calle Monte Bello 234, Surco",
    tipo: "Fútbol 5 · Sintético",
    precioBase: 55,
    precioValle: 40,
    precioPrime: 75,
    yape: "965 432 109",
    foto: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=700&q=80",
    rating: 4.2,
    totalReservas: 87,
    amenidades: ["Iluminación LED", "Wifi"]
  },
  {
    id: "c5",
    nombre: "Gol & Gol Barranco",
    distrito: "Barranco",
    direccion: "Av. Grau 890, Barranco",
    tipo: "Fútbol 5 · Sintético",
    precioBase: 70,
    precioValle: 55,
    precioPrime: 95,
    yape: "965 432 109",
    foto: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=700&q=80",
    rating: 4.6,
    totalReservas: 154,
    amenidades: ["Vestuarios", "Bar deportivo", "Vista panorámica"]
  }
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const STEPS_LABELS = ['Resumen', 'Datos', 'Pago', 'Confirmación'];

const CanchaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const cancha = CANCHAS_DATA.find(c => c.id === id) || CANCHAS_DATA[0];

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [slotsDelDia, setSlotsDelDia] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPago, setSelectedPago] = useState('culqi');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const estadosBase = ["libre", "ocupado", "libre", "libre", "libre", "ocupado", "oferta", "libre", "libre", "libre", "ocupado", "libre", "libre", "libre", "libre", "ocupado"];
    const slotsCalculados = [];
    let hora = 7;

    for (let i = 0; i < 16; i++) {
      const horaStr = `${String(hora).padStart(2, '0')}:00`;
      const horaFinStr = `${String(hora + 1).padStart(2, '0')}:00`;
      const esPrime = hora >= 18 && hora <= 21;
      const esValle = hora < 12;
      
      const precio = esPrime ? cancha.precioPrime : (esValle ? cancha.precioValle : cancha.precioBase);
      let estado = estadosBase[i];
      
      if (selectedDayIndex > 0 && i % 4 === 0) estado = 'libre';
      if (selectedDayIndex > 0 && i % 6 === 0) estado = 'ocupado';

      slotsCalculados.push({
        id: `slot-${i}`,
        inicio: horaStr,
        fin: horaFinStr,
        precio: estado === 'oferta' ? precio * 0.8 : precio, 
        franja: esPrime ? "prime" : (esValle ? "valle" : "normal"),
        estado: estado
      });
      hora++;
    }
    setSlotsDelDia(slotsCalculados);
  }, [selectedDayIndex, cancha]);

  const handleSelectSlot = (slot) => {
    const existe = selectedSlots.find(s => s.id === slot.id);
    if (existe) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort((a, b) => a.inicio.localeCompare(b.inicio)));
    }
  };

  // ── REGLA DE NEGOCIO ÉPICA 3: PAGO 100% ONLINE CON CULQI ──
  const totalPrecio = selectedSlots.reduce((sum, s) => sum + s.precio, 0);

  const handleOpenReserva = () => {
    setStep(1);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    if (step === 4) {
      setSelectedSlots([]);
      navigate('/mis-reservas');
    }
  };

  const procesarPago = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
    }, 1800);
  };

  const generarFechasSelector = () => {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      return {
        index: i,
        diaNombre: DIAS_SEMANA[d.getDay()],
        diaNumero: d.getDate()
      };
    });
  };

  return (
    <div className="view active" style={{ animation: 'fadeIn .25s ease' }}>
      
      {/* HEADER */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--textMid)' }}>Inicio / Canchas / {cancha.distrito}</div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--dark1)' }}>{cancha.nombre}</div>
        </div>
      </div>

      <div className="detail-body">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
        <div>
          <div className="detail-gallery" style={{ borderRadius: 'var(--r16)', overflow: 'hidden', height: '320px', marginBottom: '24px' }}>
            <img src={cancha.foto} alt={cancha.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div className="detail-info" style={{ marginTop: 0 }}>
            <div className="detail-distrito" style={{ color: 'var(--green2)', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.8px' }}>
              {cancha.distrito}
            </div>
            <h1 className="detail-nombre" style={{ fontSize: '28px', fontWeight: 800, margin: '6px 0 12px' }}>
              {cancha.nombre}
            </h1>
            
            <div className="detail-meta" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span className="badge badge-gray">{cancha.tipo}</span>
              <span className="badge badge-green">⭐ {cancha.rating}</span>
              <span className="badge badge-gray">📍 {cancha.direccion.split(',')[0]}</span>
            </div>

            <div className="detail-amenidades" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {cancha.amenidades.map((amenidad, idx) => (
                <span key={idx} className="amenidad">{amenidad}</span>
              ))}
            </div>

            <div className="precios-tabla">
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--textMid)', letterSpacing: '0.5px' }}>
                TARIFAS POR FRANJA
              </div>
              <div className="precio-row">
                <span className="precio-label">🌅 Valle (antes de 12:00)</span>
                <span className="precio-val">S/ {cancha.precioValle.toFixed(2)} /hr</span>
              </div>
              <div className="precio-row">
                <span className="precio-label">☀️ Normal (12:00 – 17:00)</span>
                <span className="precio-val">S/ {cancha.precioBase.toFixed(2)} /hr</span>
              </div>
              <div className="precio-row">
                <span className="precio-label">⭐ Prime (18:00 – 22:00)</span>
                <span className="precio-val">S/ {cancha.precioPrime.toFixed(2)} /hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESERVAS */}
        <div>
          <div className="reserva-panel">
            <div className="reserva-panel-title">📅 Seleccionar horario</div>
            
            <div className="fecha-selector">
              {generarFechasSelector().map((fecha) => (
                <button 
                  key={fecha.index} 
                  className={`fecha-btn ${selectedDayIndex === fecha.index ? 'active' : ''}`}
                  onClick={() => { setSelectedDayIndex(fecha.index); setSelectedSlots([]); }}
                >
                  <span className="dia">{fecha.diaNombre}</span>
                  <span className="num">{fecha.diaNumero}</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--textMid)', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#A3E6C7', borderRadius: '2px', marginRight: '4px' }}></span>Libre</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#FFD066', borderRadius: '2px', marginRight: '4px' }}></span>Oferta</span>
              <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: 'var(--gray3)', borderRadius: '2px', marginRight: '4px' }}></span>Ocupado</span>
            </div>

            <div className="slots-grid">
              {slotsDelDia.map((slot) => {
                const estaSeleccionado = selectedSlots.some(s => s.id === slot.id);
                return (
                  <div 
                    key={slot.id} 
                    className={`slot ${slot.estado} ${estaSeleccionado ? 'selected' : ''}`} 
                    onClick={() => slot.estado !== 'ocupado' && handleSelectSlot(slot)}
                  >
                    {slot.franja === 'prime' && slot.estado !== 'ocupado' && <span className="slot-tag prime">PRIME</span>}
                    {slot.estado === 'oferta' && <span className="slot-tag oferta">−20%</span>}

                    <span className="slot-hora">{slot.inicio}</span>
                    <span className="slot-precio">
                      {slot.estado === 'ocupado' ? '—' : `S/ ${slot.precio.toFixed(0)}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* PANEL VISTA PREVIA (PAGO ÚNICO 100%) */}
            {selectedSlots.length > 0 ? (
              <div id="adelanto-preview" style={{ display: 'block', animation: 'fadeIn 0.2s ease' }}>
                <div className="adelanto-info">
                  <div className="adelanto-row">
                    <span className="adelanto-lbl">Horas elegidas</span>
                    <span className="adelanto-val">{selectedSlots.length} hr ({selectedSlots.map(s => s.inicio).join(', ')})</span>
                  </div>
                  <div className="adelanto-row adelanto-total" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <span className="adelanto-lbl" style={{ color: 'var(--green)' }}>Total a pagar</span>
                    <span className="adelanto-val" style={{ color: 'var(--green)', fontSize: '18px' }}>S/ {totalPrecio.toFixed(2)}</span>
                  </div>
                </div>
                <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleOpenReserva}>
                  Reservar y Pagar ({selectedSlots.length} hrs) →
                </button>
              </div>
            ) : (
              <div id="no-slot-msg" style={{ textAlign: 'center', color: 'var(--textMid)', fontSize: '13px', padding: '8px' }}>
                Selecciona uno o más horarios disponibles
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL RESERVAS DE 4 PASOS */}
      {isModalOpen && (
        <div className="overlay" style={{ display: 'flex' }}>
          <div className="modal" style={{ background: 'var(--white)', borderRadius: 'var(--r24)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="modal-head">
              <div className="modal-title">Paso {step} de 4 — {STEPS_LABELS[step-1]}</div>
              <button className="modal-close" onClick={handleClose}>✕</button>
            </div>

            <div className="modal-body">
              <div className="steps">
                <div className={`step-item ${step > 1 ? 'done' : (step === 1 ? 'active' : '')}`}></div>
                <div className={`step-item ${step > 2 ? 'done' : (step === 2 ? 'active' : '')}`}></div>
                <div className={`step-item ${step > 3 ? 'done' : (step === 3 ? 'active' : '')}`}></div>
                <div className={`step-item ${step === 4 ? 'active' : ''}`}></div>
              </div>

              {/* PASO 1: RESUMEN Y POLÍTICA DE REEMBOLSO DE 3 ZONAS */}
              {step === 1 && (
                <>
                  <div className="step-label">Resumen de tu reserva</div>
                  <div className="resumen-box">
                    <div className="resumen-row"><span>Cancha</span><strong>{cancha.nombre}</strong></div>
                    <div className="resumen-row"><span>Total Horas</span><span>{selectedSlots.length} hora(s)</span></div>
                    <div className="resumen-row"><span>Horarios</span><strong>{selectedSlots.map(s => `${s.inicio}-${s.fin}`).join(', ')}</strong></div>
                    <div className="resumen-row" style={{ borderBottom: 'none', paddingTop: '10px', fontWeight: 700 }}>
                      <span>Total a Pagar Hoy</span>
                      <strong style={{ color: 'var(--green)', fontSize: '16px' }}>S/ {totalPrecio.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* 🛡️ POLÍTICA DE REEMBOLSO AÑADIDA */}
                  <div style={{ background: '#F8FAFC', borderRadius: 'var(--r8)', padding: '14px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dark1)', marginBottom: '8px' }}>🛡️ Política de Reembolso</div>
                    <div style={{ fontSize: '12px', color: 'var(--textMid)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{color: 'var(--green2)', fontWeight: 600}}>🟢 Zona Verde ({'>'} 48 hrs)</span> <span>100% reembolso</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{color: 'var(--amber)', fontWeight: 600}}>🟡 Zona Ámbar (24-48 hrs)</span> <span>50% reembolso</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{color: 'var(--red)', fontWeight: 600}}>🔴 Zona Roja ({'<'} 24 hrs)</span> <span>Sin reembolso</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--textMid)', marginBottom: '16px', textAlign: 'center' }}>
                    ⏱️ Tus slots serán bloqueados por <strong>10 minutos</strong> mientras completas el pago online.
                  </div>
                  <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={() => setStep(2)}>
                    Continuar al Pago →
                  </button>
                </>
              )}

              {/* PASO 2: DATOS */}
              {step === 2 && (
                <>
                  <div className="step-label">Confirma tus datos</div>
                  <div className="form-group"><label className="form-label">Nombre completo</label><input className="form-input" defaultValue="Diego Salcedo" type="text"/></div>
                  <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" defaultValue="999 123 456" type="tel"/></div>
                  <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="diego@gmail.com" type="email"/></div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Atrás</button>
                    <button className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>Continuar →</button>
                  </div>
                </>
              )}

              {/* PASO 3: PAGO */}
              {step === 3 && (
                <form onSubmit={procesarPago}>
                  <div className="step-label">Método de pago</div>
                  <div style={{ background: 'var(--gray1)', borderRadius: 'var(--r12)', padding: '14px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--textMid)' }}>Total a pagar ahora</span>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>S/ {totalPrecio.toFixed(2)}</span>
                  </div>
                  
                  <div className="pago-metodos">
                    <div className={`pago-card ${selectedPago === 'culqi' ? 'active' : ''}`} onClick={() => setSelectedPago('culqi')}>
                      <div className="pago-icon">💳</div>
                      <div className="pago-name">Tarjeta / Culqi</div>
                    </div>
                    <div className={`pago-card ${selectedPago === 'yape' ? 'active' : ''}`} onClick={() => setSelectedPago('yape')}>
                      <div className="pago-icon">📱</div>
                      <div className="pago-name">Yape</div>
                    </div>
                  </div>

                  {selectedPago === 'culqi' ? (
                    <div>
                      <div className="form-group"><label className="form-label">Número de tarjeta</label><input className="form-input" placeholder="4111 1111 1111 1111" required maxLength="19"/></div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">Vencimiento</label><input className="form-input" placeholder="MM/AA" required maxLength="5"/></div>
                        <div className="form-group" style={{ flex: 1 }}><label className="form-label">CVV</label><input className="form-input" type="password" placeholder="123" required maxLength="4"/></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: 'var(--dark1)', borderRadius: 'var(--r12)', padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--gray4)', marginBottom: '8px' }}>Transferir a</div>
                        <div style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, color: 'var(--white)' }}>{cancha.yape}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray4)', marginTop: '4px' }}>{cancha.nombre}</div>
                      </div>
                      <div className="form-group" style={{ marginTop: '14px' }}><label className="form-label">Número de operación Yape</label><input className="form-input" placeholder="Ej: YP123456789" required/></div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClose}>Cancelar</button>
                    <button type="submit" className="btn btn-green" disabled={isLoading} style={{ flex: 2, justifyContent: 'center', padding: '14px' }}>
                      {isLoading ? <><span className="loader" style={{ marginRight: '8px', borderTopColor: 'var(--dark1)' }}></span> Procesando...</> : `🔒 Pagar S/ ${totalPrecio.toFixed(2)}`}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 4: CONFIRMACIÓN */}
              {step === 4 && (
                <div className="confirmacion">
                  <div className="check" style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>✓</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>¡Reserva confirmada!</div>
                  
                  <div className="codigo-reserva">PG-2026-R{Math.floor(1800 + Math.random() * 200)}</div>
                  
                  <div style={{ fontSize: '13px', color: 'var(--textMid)', marginBottom: '20px' }}>{cancha.nombre} · {selectedSlots.length} hora(s) elegida(s)</div>
                  
                  <div style={{ background: 'var(--dark1)', borderRadius: 'var(--r12)', padding: '14px', textAlign: 'left', marginBottom: '18px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray4)', marginBottom: '8px' }}>RECUERDA AL LLEGAR</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray3)', lineHeight: 1.7 }}>
                      📱 Muestra tu código de reserva al administrador del complejo.<br/>
                      ✅ Tu reserva ha sido pagada al <strong>100% online</strong>. ¡Disfruta el partido!
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleClose}>Mis reservas</button>
                    <button className="btn btn-dark" style={{ flex: 1, justifyContent: 'center', fontWeight: 600 }} onClick={handleClose}>⬇️ PDF</button>
                  </div>
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