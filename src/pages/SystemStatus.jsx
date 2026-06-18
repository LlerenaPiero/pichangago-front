import { useState, useEffect } from 'react';

const SystemStatus = () => {
  const [webStatus, setWebStatus] = useState({ loading: true, code: null, label: '' });
  const [dbStatus, setDbStatus] = useState({ loading: true, code: null, label: '', latency: 0 });

const verificarServicios = async () => {
  setWebStatus({ loading: true, code: null, label: '' });
  setDbStatus({ loading: true, code: null, label: '', latency: 0 });

  // 1. Frontend status is always operational if this page renders
  setWebStatus({ loading: false, code: 200, label: 'OPERATIONAL' });

  // 2. Check backend health
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  try {
    const response = await fetch(`${API_URL}/api/status`);
    const data = await response.json();

    if (response.ok && data.database === 'CONNECTED') {
      setDbStatus({
        loading: false,
        code: data.statusCode,
        label: data.database,
        latency: data.latency
      });
    } else {
      setDbStatus({ 
        loading: false, 
        code: data.statusCode || 500, 
        label: data.database || 'DATABASE_ERROR', 
        latency: data.latency || 0 
      });
    }
  } catch {
    setDbStatus({ loading: false, code: 500, label: 'SERVER_DOWN', latency: 0 });
  }
};

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarServicios();
  }, []);

  return (
    <div className="view active page-wrap" style={{ maxWidth: '600px', padding: '40px 24px', animation: 'fadeIn .25s ease' }}>
      
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <h2 className="section-title">Panel de Disponibilidad (Testing SRE)</h2>
        <p className="section-sub">Monitoreo en tiempo real de la infraestructura de PichangaGo</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* SERVICIO 1: APLICACIÓN WEB */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: 'var(--r12)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: 'var(--dark1)', fontSize: '15px' }}>🖥️ Servidor Web (Vercel Cloud)</div>
            <div style={{ fontSize: '13px', color: 'var(--textMid)', marginTop: '2px' }}>Verifica si el hosting del cliente responde HTTP solicitudes.</div>
          </div>
          <div>
            {webStatus.loading ? (
              <span className="loader" style={{ borderTopColor: 'var(--dark1)' }}></span>
            ) : (
              <span className="badge badge-green" style={{ fontSize: '12px', padding: '6px 12px' }}>
                🟢 {webStatus.code} {webStatus.label}
              </span>
            )}
          </div>
        </div>

        {/* SERVICIO 2: BASE DE DATOS */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray2)', borderRadius: 'var(--r12)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: 'var(--dark1)', fontSize: '15px' }}>🗄️ Capa de Datos (AZURE sql server)</div>
            <div style={{ fontSize: '13px', color: 'var(--textMid)', marginTop: '2px' }}>
              Latencia de respuesta de red: {dbStatus.latency > 0 ? <strong>{dbStatus.latency}ms</strong> : '—'}
            </div>
          </div>
          <div>
            {dbStatus.loading ? (
              <span className="loader" style={{ borderTopColor: 'var(--dark1)' }}></span>
            ) : (
              <span className={`badge ${dbStatus.code === 200 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                {dbStatus.code === 200 ? `🟢 200 ${dbStatus.label}` : `🔴 ${dbStatus.code} ${dbStatus.label}`}
              </span>
            )}
          </div>
        </div>

      </div>

      <button 
        className="btn btn-dark" 
        style={{ width: '100%', marginTop: '24px', padding: '12px', justifyContent: 'center' }}
        onClick={verificarServicios}
      >
        🔄 Ejecutar Re-Testing Completo
      </button>

    </div>
  );
};

export default SystemStatus;