import { useState } from 'react';
import { duenoService } from '../../services/duenoService';
import { formatValidationErrors } from '../../utils/validationErrors';

const canchaVacia = () => ({
    nombre: '', descripcion: '', idLocal: '',
    precioBase: '', precioPrime: '', precioBaja: ''
});

export default function ModalNuevaCancha({ locales, onCerrar, onMensaje, onActualizar }) {
    const [nuevaCancha, setNuevaCancha] = useState(canchaVacia());
    const [nuevaCanchaFoto, setNuevaCanchaFoto] = useState(null);

    const handleCrearCanchaSubmit = async (e) => {
        e.preventDefault();
        if (!nuevaCancha.idLocal) {
            onMensaje('⚠️ Debes seleccionar un Local para la cancha.');
            return;
        }
        const datos = {
            ...nuevaCancha,
            precioPrime: nuevaCancha.precioPrime || nuevaCancha.precioBase,
            precioBaja: nuevaCancha.precioBaja || nuevaCancha.precioBase
        };
        const res = await duenoService.registrarCancha(datos, nuevaCanchaFoto);
        if (res.status === 'success') {
            onMensaje('🏟️ ¡Cancha registrada con éxito!');
            onCerrar();
            onActualizar();
        } else {
            onMensaje(`❌ ${formatValidationErrors(res)}`);
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Registrar nueva cancha" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>🏗️ Registrar Cancha</h3>
                <form onSubmit={handleCrearCanchaSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="nueva-nombre">📌 Nombre:</label>
                        <input id="nueva-nombre" type="text" required style={{ width: '100%', padding: '6px' }} placeholder="Ej: Cancha Los Olivos" value={nuevaCancha.nombre} onChange={e => setNuevaCancha({ ...nuevaCancha, nombre: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="nueva-descripcion">📝 Descripción:</label>
                        <input id="nueva-descripcion" type="text" style={{ width: '100%', padding: '6px' }} placeholder="Breve reseña..." value={nuevaCancha.descripcion} onChange={e => setNuevaCancha({ ...nuevaCancha, descripcion: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="nueva-idLocal">🏢 Local:</label>
                        <select id="nueva-idLocal" required style={{ width: '100%', padding: '6px' }} value={nuevaCancha.idLocal} onChange={e => setNuevaCancha({ ...nuevaCancha, idLocal: e.target.value })}>
                            <option value="">-- Seleccionar Local --</option>
                            {locales.map(l => <option key={l.ID_Local} value={l.ID_Local}>{l.Nombre} - {l.Distrito}</option>)}
                        </select>
                        {locales.length === 0 && <p style={{ fontSize: '11px', color: 'red', marginTop: '2px' }}>Primero debes registrar un Local en la pestaña "Locales".</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioBase">💰 Precio Base:</label>
                            <input id="nueva-precioBase" type="number" min={1} required style={{ width: '100%', padding: '6px' }} placeholder="Ej: 70" value={nuevaCancha.precioBase} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioBase: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Horario normal</span>
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioPrime">⭐ P. Prime:</label>
                            <input id="nueva-precioPrime" type="number" min={1} style={{ width: '100%', padding: '6px' }} placeholder="Opcional" value={nuevaCancha.precioPrime} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioPrime: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Noches/Finde</span>
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioBaja">🌅 P. Baja:</label>
                            <input id="nueva-precioBaja" type="number" min={1} style={{ width: '100%', padding: '6px' }} placeholder="Opcional" value={nuevaCancha.precioBaja} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioBaja: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#888' }}>Mañanas/Valle</span>
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="nueva-foto" style={{ fontWeight: 'bold' }}>📷 Foto <span style={{ color: 'red' }}>*</span>:</label>
                        <input id="nueva-foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required style={{ width: '100%', padding: '4px' }} onChange={e => { if (e.target.files.length > 0) setNuevaCanchaFoto(e.target.files[0]); }} />
                        <span style={{ fontSize: '11px', color: '#888' }}>JPG/PNG/WebP/AVIF — Máx 5MB</span>
                        {nuevaCanchaFoto && <p style={{ fontSize: '12px', color: '#00b48a', marginTop: '4px' }}>✅ {nuevaCanchaFoto.name}</p>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={() => { setNuevaCancha(canchaVacia()); setNuevaCanchaFoto(null); onCerrar(); }} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
