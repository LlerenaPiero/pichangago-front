import { useState } from 'react';
import { duenoService } from '../../services/duenoService';
import { formatValidationErrors } from '../../utils/validationErrors';

const TIPOS_CANCHA = [
  { value: 'F5', label: 'Fútbol 5 (5 vs 5)' },
  { value: 'F6', label: 'Fútbol 6 (6 vs 6)' },
  { value: 'F7', label: 'Fútbol 7 (7 vs 7)' },
  { value: 'F8', label: 'Fútbol 8 (8 vs 8)' },
  { value: 'F11', label: 'Fútbol 11 (11 vs 11)' },
];

const canchaVacia = () => ({
    nombre: '', descripcion: '', idLocal: '',
    precioBase: '', precioPrime: '', precioBaja: '',
    tipoSuperficie: '', tipoCancha: '', esTechada: false, tieneIluminacion: true
});

export default function ModalNuevaCancha({ locales, onCerrar, onMensaje, onActualizar }) {
    const [nuevaCancha, setNuevaCancha] = useState(canchaVacia());
    const [nuevaCanchaFoto, setNuevaCanchaFoto] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleCrearCanchaSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!nuevaCancha.idLocal) {
            onMensaje('⚠️ Debes seleccionar un Local para la cancha.');
            return;
        }
        if (!nuevaCancha.tipoCancha) {
            onMensaje('⚠️ Debes seleccionar el tipo de cancha.');
            return;
        }
        const datos = {
            nombre: nuevaCancha.nombre,
            descripcion: nuevaCancha.descripcion,
            idLocal: nuevaCancha.idLocal,
            precioBase: parseFloat(nuevaCancha.precioBase) || 0,
            precioPrime: parseFloat(nuevaCancha.precioPrime || nuevaCancha.precioBase) || 0,
            precioBaja: parseFloat(nuevaCancha.precioBaja || nuevaCancha.precioBase) || 0,
            tipoSuperficie: nuevaCancha.tipoSuperficie,
            tipo: nuevaCancha.tipoCancha,
            esTechada: nuevaCancha.esTechada,
            tieneIluminacion: nuevaCancha.tieneIluminacion
        };
        const res = await duenoService.registrarCancha(datos, nuevaCanchaFoto);
        if (res.status === 'success') {
            onMensaje('🏟️ ¡Cancha registrada con éxito!');
            onCerrar();
            onActualizar();
        } else {
            const errText = formatValidationErrors(res);
            if (errText.includes('límite')) {
                setErrorMsg(errText);
            } else {
                onMensaje(`❌ ${errText}`);
            }
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
                            {locales.map(l => <option key={l.ID_LOCAL} value={l.ID_LOCAL}>{l.NOMBRE} - {l.DISTRITO}</option>)}
                        </select>
                        {locales.length === 0 && <p style={{ fontSize: '11px', color: 'red', marginTop: '2px' }}>Primero debes registrar un Local en la pestaña "Locales".</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioBase">💰 Precio Base:</label>
                            <input id="nueva-precioBase" type="number" min={1} required style={{ width: '100%', padding: '6px' }} placeholder="Ej: 70" value={nuevaCancha.precioBase} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioBase: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Horario normal</span>
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioPrime">⭐ P. Prime:</label>
                            <input id="nueva-precioPrime" type="number" min={1} style={{ width: '100%', padding: '6px' }} placeholder="Opcional" value={nuevaCancha.precioPrime} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioPrime: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Noches/Finde</span>
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label htmlFor="nueva-precioBaja">🌅 P. Baja:</label>
                            <input id="nueva-precioBaja" type="number" min={1} style={{ width: '100%', padding: '6px' }} placeholder="Opcional" value={nuevaCancha.precioBaja} onChange={e => /^\d*\.?\d*$/.test(e.target.value) && setNuevaCancha({ ...nuevaCancha, precioBaja: e.target.value })} />
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>Mañanas/Valle</span>
                        </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>⚽ Tipo de Cancha:</label>
                        <select required style={{ width: '100%', padding: '6px' }} value={nuevaCancha.tipoCancha} onChange={e => setNuevaCancha({ ...nuevaCancha, tipoCancha: e.target.value })}>
                            <option value="">-- Seleccionar --</option>
                            {TIPOS_CANCHA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🏟️ Tipo de Superficie:</label>
                        <select style={{ width: '100%', padding: '6px' }} value={nuevaCancha.tipoSuperficie} onChange={e => setNuevaCancha({ ...nuevaCancha, tipoSuperficie: e.target.value })}>
                            <option value="">-- Seleccionar --</option>
                            <option value="GRASS_SINTETICO">Grass Sintético</option>
                            <option value="GRASS_NATURAL">Grass Natural</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={nuevaCancha.esTechada} onChange={e => setNuevaCancha({ ...nuevaCancha, esTechada: e.target.checked })} />
                            <span>🏠 Techada</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={nuevaCancha.tieneIluminacion} onChange={e => setNuevaCancha({ ...nuevaCancha, tieneIluminacion: e.target.checked })} />
                            <span>💡 Iluminación</span>
                        </label>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="nueva-foto" style={{ fontWeight: 'bold' }}>📷 Foto <span style={{ color: 'red' }}>*</span>:</label>
                        <input id="nueva-foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required style={{ width: '100%', padding: '4px' }} onChange={e => { if (e.target.files.length > 0) setNuevaCanchaFoto(e.target.files[0]); }} />
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>JPG/PNG/WebP/AVIF — Máx 5MB</span>
                        {nuevaCanchaFoto && <p style={{ fontSize: '12px', color: '#008060', marginTop: '4px' }}>✅ {nuevaCanchaFoto.name}</p>}
                    </div>
                    {errorMsg && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }}>
                            {errorMsg}
                            <div style={{ marginTop: '10px' }}>
                                <a href="/panel-dueno" style={{ color: 'white', background: '#008060', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', fontWeight: 600, fontSize: '13px' }}>
                                    Mejorar plan →
                                </a>
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={() => { setNuevaCancha(canchaVacia()); setNuevaCanchaFoto(null); onCerrar(); }} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" style={{ background: '#008060', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
