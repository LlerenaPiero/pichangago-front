import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';
import { localService } from '../../services/localService';

const AYUDA = {
    nombre: 'Nombre comercial de la cancha. Ej: "Cancha Los Olivos"',
    descripcion: 'Breve reseña del lugar: tipo de césped, medidas, servicios destacados.',
    idLocal: 'Selecciona el local (complejo deportivo) al que pertenece esta cancha.',
    precioBase: 'Tarifa estándar por hora en horario normal (12:00 - 17:00).',
    precioPrime: 'Tarifa para horario prime (18:00 - 22:00). Si se deja vacío, se usa el Precio Base.',
    precioBaja: 'Tarifa reducida para horario valle (antes de 12:00). Si se deja vacío, se usa el Precio Base.',
    foto: 'Selecciona una foto de la cancha (JPG, PNG, WebP o AVIF, máx 5MB).'
};

export default function RegistroCanchaForm({ onCanchaCreada }) {
    const [locales, setLocales] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        idLocal: '',
        precioBase: '',
        precioPrime: '',
        precioBaja: '',
        tipoSuperficie: '',
        tipoCancha: '',
        esTechada: false,
        tieneIluminacion: true
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        (async () => {
            const res = await localService.listarMisLocales();
            if (res.status === 'success') setLocales(res.data || []);
        })();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['precioBase', 'precioPrime', 'precioBaja'].includes(name) && !/^\d*\.?\d*$/.test(value)) return;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fotoFile) return setMensaje({ tipo: 'error', texto: '⚠️ Debes seleccionar una foto para la cancha.' });

        if (!formData.tipoCancha) return setMensaje({ tipo: 'error', texto: '⚠️ Debes seleccionar el tipo de cancha.' });

        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });

        const datosParaEnviar = {
            ...formData,
            precioBase: parseFloat(formData.precioBase) || 0,
            precioPrime: parseFloat(formData.precioPrime || formData.precioBase) || 0,
            precioBaja: parseFloat(formData.precioBaja || formData.precioBase) || 0,
            tipo: formData.tipoCancha,
            esTechada: formData.esTechada,
            tieneIluminacion: formData.tieneIluminacion
        };

        const res = await duenoService.registrarCancha(datosParaEnviar, fotoFile);

        setEnviando(false);

        if (res.status === 'success') {
            setMensaje({ tipo: 'success', texto: `⚽ ¡Cancha registrada! ID: ${res.idCancha}` });

            setFormData({
                nombre: '', descripcion: '', idLocal: '',
                precioBase: '', precioPrime: '', precioBaja: '',
                tipoSuperficie: '', tipoCancha: '', esTechada: false, tieneIluminacion: true
            });
            setFotoFile(null);

            if (onCanchaCreada) onCanchaCreada(res.idCancha);
        } else {
            const esLimite = res.error && res.error.includes('límite');
            setMensaje({
                tipo: 'error',
                texto: esLimite ? `⚠️ ${res.error}` : (res.error || 'Ocurrió un error inesperado.')
            });
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>🏗️ Registrar Nueva Cancha</h2>
            
            <div aria-live="polite" aria-atomic="true" role="status" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{mensaje.texto}</div>
            {mensaje.texto && (
                <div role="alert" style={{ color: mensaje.tipo === 'success' ? 'green' : 'red', marginBottom: '15px', fontWeight: 'bold', padding: '10px', background: mensaje.tipo === 'success' ? '#d4edda' : '#fee2e2', borderRadius: '6px' }}>
                    {mensaje.texto}
                    {mensaje.tipo === 'error' && mensaje.texto.includes('límite') && (
                        <div style={{ marginTop: '10px' }}>
                            <a href="/panel-dueno" style={{ color: 'white', background: '#008060', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block', fontWeight: 600, fontSize: '13px' }}>
                                Mejorar plan →
                            </a>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="rcf-nombre" title={AYUDA.nombre}>📌 Nombre del Complejo:</label>
                    <input id="rcf-nombre" type="text" name="nombre" value={formData.nombre} required aria-required="true" onChange={handleChange} placeholder="Ej: Cancha Los Olivos" title={AYUDA.nombre} aria-describedby="rcf-nombre-help" style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
                    <span id="rcf-nombre-help" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginTop: '-8px', marginBottom: '10px' }}>{AYUDA.nombre}</span>
                </div>
                <div>
                    <label htmlFor="rcf-descripcion" title={AYUDA.descripcion}>📝 Descripción:</label>
                    <input id="rcf-descripcion" type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Breve reseña del lugar..." title={AYUDA.descripcion} style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
                </div>
                <div>
                    <label htmlFor="rcf-idLocal" title="Local al que pertenece la cancha">🏢 Local:</label>
                    <select id="rcf-idLocal" name="idLocal" value={formData.idLocal} required aria-required="true" onChange={handleChange} title="Selecciona el local" style={{ width: '100%', padding: '6px', marginBottom: '10px' }}>
                        <option value="">-- Seleccionar Local --</option>
                        {locales.map(l => <option key={l.ID_LOCAL} value={l.ID_LOCAL}>{l.NOMBRE} - {l.DISTRITO}</option>)}
                    </select>
                    {locales.length === 0 && <p style={{ fontSize: '11px', color: 'red', marginTop: '-8px', marginBottom: '10px' }}>No hay locales registrados. Crea uno primero.</p>}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label htmlFor="rcf-precioBase" title={AYUDA.precioBase}>💰 Precio Base (S/):</label>
                        <input id="rcf-precioBase" type="number" min={1} name="precioBase" value={formData.precioBase} required aria-required="true" onChange={handleChange} placeholder="Ej: 70" title={AYUDA.precioBase} aria-describedby="rcf-pbase-help" style={{ width: '100%', padding: '6px' }} />
                        <span id="rcf-pbase-help" style={{ fontSize: '11px', color: '#6b7280' }}>Horario normal (12-17hrs)</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label htmlFor="rcf-precioPrime" title={AYUDA.precioPrime}>⭐ Precio Prime (S/):</label>
                        <input id="rcf-precioPrime" type="number" min={1} name="precioPrime" value={formData.precioPrime} onChange={handleChange} placeholder="Opcional" title={AYUDA.precioPrime} aria-describedby="rcf-pprime-help" style={{ width: '100%', padding: '6px' }} />
                        <span id="rcf-pprime-help" style={{ fontSize: '11px', color: '#6b7280' }}>Noches/Finde (18-22hrs)</span>
                    </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="rcf-precioBaja" title={AYUDA.precioBaja}>🟡 Precio Baja (S/):</label>
                    <input id="rcf-precioBaja" type="number" min={1} name="precioBaja" value={formData.precioBaja} onChange={handleChange} placeholder="Opcional" title={AYUDA.precioBaja} aria-describedby="rcf-pbaja-help" style={{ width: '100%', padding: '6px' }} />
                    <span id="rcf-pbaja-help" style={{ fontSize: '11px', color: '#6b7280' }}>Mañanas (antes 12hrs)</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>⚽ Tipo de Cancha:</label>
                    <select name="tipoCancha" value={formData.tipoCancha} onChange={handleChange} required style={{ width: '100%', padding: '6px' }}>
                        <option value="">-- Seleccionar --</option>
                        <option value="F5">Fútbol 5 (5 vs 5)</option>
                        <option value="F6">Fútbol 6 (6 vs 6)</option>
                        <option value="F7">Fútbol 7 (7 vs 7)</option>
                        <option value="F8">Fútbol 8 (8 vs 8)</option>
                        <option value="F11">Fútbol 11 (11 vs 11)</option>
                    </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🏟️ Tipo de Superficie:</label>
                    <select name="tipoSuperficie" style={{ width: '100%', padding: '6px' }} value={formData.tipoSuperficie} onChange={handleChange}>
                        <option value="">-- Seleccionar --</option>
                        <option value="GRASS_SINTETICO">Grass Sintético</option>
                        <option value="GRASS_NATURAL">Grass Natural</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" name="esTechada" checked={formData.esTechada} onChange={e => setFormData({ ...formData, esTechada: e.target.checked })} />
                        <span>🏠 Techada</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" name="tieneIluminacion" checked={formData.tieneIluminacion} onChange={e => setFormData({ ...formData, tieneIluminacion: e.target.checked })} />
                        <span>💡 Iluminación</span>
                    </label>
                </div>
                <div>
                    <label htmlFor="rcf-foto" title={AYUDA.foto} style={{ fontWeight: 'bold' }}>📷 Foto de la Cancha <span style={{ color: 'red' }}>*</span>:</label>
                    <input id="rcf-foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={handleFileChange} required aria-required="true" aria-describedby="rcf-foto-help" style={{ width: '100%', marginBottom: '4px', padding: '4px' }} />
                    <span id="rcf-foto-help" style={{ fontSize: '11px', color: '#6b7280' }}>JPG/PNG/WebP/AVIF — Máx 5MB</span>
                    {fotoFile && <p style={{ fontSize: '12px', color: '#008060', marginTop: '4px', marginBottom: '15px' }}>✅ {fotoFile.name}</p>}
                </div>
                <button type="submit" disabled={enviando} style={{ background: enviando ? '#ccc' : '#008060', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '5px', cursor: enviando ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold', marginTop: '10px' }}>
                    {enviando ? 'Registrando...' : 'Guardar Cancha y Continuar'}
                </button>
            </form>
        </div>
    );
}