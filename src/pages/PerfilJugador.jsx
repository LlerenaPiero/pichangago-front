import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jugadorService } from '../services/jugadorService';

const PerfilJugador = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await jugadorService.obtenerPerfil();
      if (!mounted) return;
      if (res.status === 'success' && res.data) {
        setPerfil(res.data);
        setFormData({
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          telefono: res.data.telefono || '',
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleGuardar = async (e) => {
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

  if (loading) {
    return (
      <div className="page-wrap" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap" style={{ maxWidth: '600px' }}>
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

      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Mi Perfil</h2>
        <p className="section-sub">Administra tus datos personales</p>
      </div>


      <div style={{ background: 'white', borderRadius: 'var(--r16)', border: '1px solid var(--gray2)', overflow: 'hidden' }}>
        {!editing ? (
          <>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--gray2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Datos personales</h3>
              <button onClick={() => setEditing(true)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--gray3)', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                Editar
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px' }}>NOMBRE</div>
                  <div style={{ fontWeight: 600 }}>{perfil?.nombre} {perfil?.apellido}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px' }}>CORREO</div>
                  <div style={{ fontWeight: 600 }}>{perfil?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px' }}>TELÉFONO</div>
                  <div style={{ fontWeight: 600 }}>{perfil?.telefono || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px' }}>ROL</div>
                  <div style={{ fontWeight: 600 }}>{perfil?.rol}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray4)', fontWeight: 600, marginBottom: '2px' }}>MIEMBRO DESDE</div>
                  <div style={{ fontWeight: 600 }}>{perfil?.fechaCreacion ? new Date(perfil.fechaCreacion).toLocaleDateString('es-PE') : '—'}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleGuardar}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--gray2)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Editar datos personales</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Nombre</label>
                <input type="text" required value={formData.nombre}
                  onChange={e => setFormData(d => ({ ...d, nombre: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Apellido</label>
                <input type="text" required value={formData.apellido}
                  onChange={e => setFormData(d => ({ ...d, apellido: e.target.value }))}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#475569' }}>Teléfono</label>
                <input type="tel" placeholder="999888777" value={formData.telefono}
                  onChange={e => setFormData(d => ({ ...d, telefono: e.target.value }))}
                  maxLength={9}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--gray2)', display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => { setEditing(false); setFormData({ nombre: perfil?.nombre || '', apellido: perfil?.apellido || '', telefono: perfil?.telefono || '' }); }}
                style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                style={{ flex: 2, padding: '10px 20px', borderRadius: '8px', border: 'none', background: saving ? '#94a3b8' : 'var(--dark1)', color: 'white', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px' }}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/reset-password" style={{ fontSize: '13px', color: 'var(--gray4)', textDecoration: 'underline' }}>
          Cambiar contraseña
        </Link>
      </div>
    </div>
  );
};

export default PerfilJugador;
