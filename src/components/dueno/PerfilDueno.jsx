import { useState, useEffect, useCallback } from 'react';
import { duenoService } from '../../services/duenoService';
import { formatValidationErrors } from '../../utils/validationErrors';

const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', marginTop: '6px',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
    outline: 'none'
};

const detectarBanco = (cci) => {
    if (cci.length < 4) return '';
    const prefix = cci.slice(0, 4);
    if (prefix === '0002') return 'BCP';
    if (prefix === '0003') return 'Interbank';
    if (prefix === '0011') return 'BBVA';
    return '';
};

export default function PerfilDueno({ version, onActualizar, modoOnboarding }) {
    const [userData, setUserData] = useState(null);
    const [finanData, setFinanData] = useState(null);
    const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', ruc: '', razonSocial: '', cci: '', banco: '' });
    const [msj, setMsj] = useState({ texto: '', tipo: '' });
    const [guardando, setGuardando] = useState(false);
    const [mostrarSensibles, setMostrarSensibles] = useState(false);

    useEffect(() => { cargarPerfil(); }, [version]);

    const cargarPerfil = async () => {
        const [resUser, resFinan] = await Promise.all([
            duenoService.obtenerPerfilDueno(),
            duenoService.obtenerPerfilFinanciero()
        ]);

        if (resUser.status === 'success') {
            setUserData(resUser.data);
            setForm(prev => ({
                ...prev,
                nombre: resUser.data.Nombre || '',
                apellido: resUser.data.Apellido || '',
                telefono: resUser.data.Telefono || ''
            }));
            const usuario = {
                nombre: resUser.data.Nombre,
                apellido: resUser.data.Apellido,
                email: resUser.data.Correo,
                telefono: resUser.data.Telefono,
                id_usuario: resUser.data.ID_USER
            };
            localStorage.setItem('usuario', JSON.stringify(usuario));
        } else {
            setUserData(null);
        }

        if (resFinan.status === 'success') {
            setFinanData(resFinan.data);
            setForm(prev => ({
                ...prev,
                ruc: resFinan.data.RUC || '',
                razonSocial: resFinan.data.RAZON_SOCIAL || '',
                cci: resFinan.data.CCI || '',
                banco: resFinan.data.BANCO || ''
            }));
        } else {
            setFinanData(null);
        }
    };

    const handleChange = (campo, valor) => setForm(prev => ({ ...prev, [campo]: valor }));

    const handleCciChange = useCallback((valor) => {
        if (!/^\d*$/.test(valor)) return;
        setForm(prev => {
            const next = { ...prev, cci: valor };
            if (valor.length === 20) {
                const banco = detectarBanco(valor);
                if (banco) next.banco = banco;
            }
            return next;
        });
    }, []);

    const detectarBancoDesdeCCI = useCallback((cci) => detectarBanco(cci), []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsj({ texto: '', tipo: '' });

        const personalCambio = {};
        if (form.nombre !== (userData?.Nombre || '')) personalCambio.nombre = form.nombre.trim();
        if (form.apellido !== (userData?.Apellido || '')) personalCambio.apellido = form.apellido.trim();
        if (form.telefono !== (userData?.Telefono || '')) personalCambio.telefono = form.telefono;

        const finanCambio = {};
        if (form.ruc !== (finanData?.RUC || '')) finanCambio.ruc = form.ruc;
        if (form.razonSocial !== (finanData?.RAZON_SOCIAL || '')) finanCambio.razonSocial = form.razonSocial;
        if (form.cci !== (finanData?.CCI || '')) finanCambio.cci = form.cci;
        if (form.banco && form.banco !== (finanData?.BANCO || '')) finanCambio.banco = form.banco;

        if (Object.keys(personalCambio).length === 0 && Object.keys(finanCambio).length === 0) {
            setMsj({ texto: '✅ No hay cambios que guardar.', tipo: 'success' });
            if (onActualizar) onActualizar();
            return;
        }

        if (personalCambio.telefono && !/^\d{9}$/.test(personalCambio.telefono)) {
            return setMsj({ texto: '⚠️ El teléfono debe tener exactamente 9 dígitos.', tipo: 'warning' });
        }

        if (Object.keys(finanCambio).length > 0) {
            if (finanCambio.ruc && !/^(10|20)\d{9}$/.test(finanCambio.ruc)) {
                return setMsj({ texto: '⚠️ RUC inválido. Debe tener 11 dígitos, iniciar con 10 o 20.', tipo: 'warning' });
            }
            if (finanCambio.cci && !/^\d{20}$/.test(finanCambio.cci)) {
                return setMsj({ texto: '⚠️ El CCI debe tener exactamente 20 dígitos numéricos.', tipo: 'warning' });
            }
            if (form.banco && form.banco !== detectarBancoDesdeCCI(form.cci)) {
                return setMsj({ texto: `⚠️ El banco "${form.banco}" no coincide con el CCI. Los primeros dígitos indican "${detectarBancoDesdeCCI(form.cci) || 'desconocido'}".`, tipo: 'warning' });
            }
            if (!form.banco && form.cci.length >= 4 && detectarBancoDesdeCCI(form.cci)) {
                finanCambio.banco = detectarBancoDesdeCCI(form.cci);
            }
        }

        setGuardando(true);

        const personalBody = {};
        if (personalCambio.nombre) personalBody.nombre = personalCambio.nombre;
        if (personalCambio.apellido) personalBody.apellido = personalCambio.apellido;
        if (personalCambio.telefono) personalBody.telefono = personalCambio.telefono;

        const financieroBody = Object.keys(finanCambio).length > 0
            ? { ruc: form.ruc, razonSocial: form.razonSocial, cci: form.cci, ...(form.banco ? { banco: form.banco } : {}) }
            : {};

        let errores = [];

        if (Object.keys(personalBody).length > 0) {
            const r1 = await duenoService.actualizarPerfilDueno(personalBody);
            if (r1.status !== 'success') errores.push(r1.mensaje || r1.error || 'Error al guardar datos personales');
        }

        if (Object.keys(financieroBody).length > 0) {
            const r2 = await duenoService.actualizarPerfilFinanciero(financieroBody);
            if (r2.status !== 'success') errores.push(formatValidationErrors(r2));
        }

        setGuardando(false);

        if (errores.length > 0) {
            setMsj({ texto: '❌ ' + errores.join(' | '), tipo: 'error' });
        } else {
            setMsj({ texto: '🎉 Datos guardados correctamente.', tipo: 'success' });
            cargarPerfil();
            if (onActualizar) onActualizar();
        }
    };

    const nombreCompleto = userData ? `${userData.Nombre || ''} ${userData.Apellido || ''}`.trim() : 'Dueño';
    const iniciales = userData ? ((userData.Nombre?.[0] || '') + (userData.Apellido?.[0] || '')).toUpperCase() : 'D';
    const email = userData?.Correo || '';
    const telefono = userData?.Telefono || '';
    const estadoDueno = finanData?.ESTADO || finanData?.ESTADO_DUENO || userData?.ESTADO || '—';

    const msgColors = { success: '#d4edda', warning: '#fff3cd', error: '#fee2e2' };
    const msgTextColors = { success: 'green', warning: 'orange', error: 'red' };

    return (
        <div style={{ maxWidth: '720px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '20px', color: '#1f2937' }}>
                {modoOnboarding ? 'Completa tu perfil' : '👤 Mi Perfil'}
            </h3>

            <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }} role="status">{msj.texto}</div>
            {msj.texto && (
                <p role="alert" style={{
                    color: msgTextColors[msj.tipo] || 'red', fontWeight: 'bold',
                    marginBottom: '16px', padding: '12px 16px',
                    background: msgColors[msj.tipo] || '#fee2e2', borderRadius: '8px', fontSize: '14px'
                }}>{msj.texto}</p>
            )}

            <div style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                borderRadius: '12px', padding: '28px',
                background: 'linear-gradient(135deg, #008060 0%, #00916e 100%)',
                color: '#fff', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,180,138,0.2)'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px', fontWeight: 'bold', flexShrink: 0
                }}>
                    {iniciales}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{nombreCompleto}</div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>{email}</div>
                    {telefono && <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '2px' }}>📞 {telefono}</div>}
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{
                border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Nombre</label>
                        <input type="text" value={form.nombre} maxLength={50} required
                            style={inputStyle}
                            onChange={e => handleChange('nombre', e.target.value)} />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Apellido</label>
                        <input type="text" value={form.apellido} maxLength={50} required
                            style={inputStyle}
                            onChange={e => handleChange('apellido', e.target.value)} />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Teléfono</label>
                    <input type="text" value={form.telefono} maxLength={9}
                        style={inputStyle}
                        onChange={e => /^\d*$/.test(e.target.value) && handleChange('telefono', e.target.value)} />
                    <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>9 dígitos, solo números</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: 0 }}>💳 Información de pagos</p>
                    <button type="button" onClick={() => setMostrarSensibles(prev => !prev)}
                        style={{
                            background: 'none', border: '1px solid #d1d5db', borderRadius: '6px',
                            padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: '#6b7280',
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                        {mostrarSensibles ? '🙈 Ocultar' : '👁 Mostrar'} datos sensibles
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>RUC</label>
                        <input type={mostrarSensibles ? 'text' : 'password'} value={form.ruc} maxLength={11}
                            style={inputStyle}
                            onChange={e => /^\d*$/.test(e.target.value) && handleChange('ruc', e.target.value)} />
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>11 dígitos — 10 (natural) o 20 (jurídico)</span>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Razón Social</label>
                        <input type="text" value={form.razonSocial} maxLength={100}
                            style={inputStyle}
                            onChange={e => handleChange('razonSocial', e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label htmlFor="pd-banco" style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Banco</label>
                        <select id="pd-banco" value={form.banco} style={inputStyle}
                            onChange={e => handleChange('banco', e.target.value)}>
                            <option value="">— Auto-detectar —</option>
                            <option value="BCP">BCP</option>
                            <option value="Interbank">Interbank</option>
                            <option value="BBVA">BBVA</option>
                        </select>
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                            {form.banco
                                ? `✅ Banco seleccionado: ${form.banco}`
                                : form.cci.length >= 4 ? (detectarBanco(form.cci) ? `🔍 Detectado: ${detectarBanco(form.cci)}` : '⚠️ CCI no reconocido') : ''}
                        </span>
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>CCI</label>
                        <input type={mostrarSensibles ? 'text' : 'password'} value={form.cci} maxLength={20}
                            style={inputStyle}
                            onChange={e => handleCciChange(e.target.value)} />
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'block' }}>20 dígitos, solo números</span>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        📌 Estado:{' '}
                        <span style={{
                            color: estadoDueno === 'ACTIVO' ? '#059669' : '#dc2626',
                            fontWeight: '600'
                        }}>{estadoDueno}</span>
                    </span>
                    {finanData?.FECHA_AFILIACION && (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            📅 Afiliado desde: {new Date(finanData.FECHA_AFILIACION).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    )}
                </div>

                <button type="submit" disabled={guardando}
                    style={{
                        background: guardando ? '#9ca3af' : '#008060', color: 'white', border: 'none',
                        padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px',
                        cursor: guardando ? 'not-allowed' : 'pointer', width: '100%',
                        transition: 'background 0.2s'
                    }}>
                    {guardando ? '⌛ Guardando...' : '💾 Guardar Cambios'}
                </button>
            </form>
        </div>
    );
}
