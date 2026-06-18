import { useState, useEffect } from 'react';
import { duenoService } from '../../services/duenoService';
import { formatValidationErrors } from '../../utils/validationErrors';

export default function ConfigDueno({ version, onActualizar }) {
    const [editandoPerfil, setEditandoPerfil] = useState(false);
    const [perfilData, setPerfilData] = useState(null);
    const [perfilForm, setPerfilForm] = useState({ ruc: '', razonSocial: '', cci: '', banco: 'BCP' });
    const [msjPerfil, setMsjPerfil] = useState('');
    const [verDatosSensibles, setVerDatosSensibles] = useState(false);

    const cargarPerfil = async () => {
        const res = await duenoService.obtenerPerfilFinanciero();
        if (res.status === 'success') {
            setPerfilData(res.data);
            setPerfilForm({
                ruc: res.data.Ruc || '',
                razonSocial: res.data.Razon_Social || '',
                cci: res.data.CCI || '',
                banco: res.data.Banco || 'BCP'
            });
        } else {
            setPerfilData(null);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPerfil();
    }, [version]);

    const handleGuardarPerfil = async (e) => {
        e.preventDefault();
        if (!/^(10|20)\d{9}$/.test(perfilForm.ruc)) {
            return setMsjPerfil('⚠️ RUC inválido. Debe tener 11 dígitos, iniciar con 10 (natural) o 20 (jurídico).');
        }
        if (!/^\d{20}$/.test(perfilForm.cci)) {
            return setMsjPerfil('⚠️ El CCI debe tener exactamente 20 dígitos numéricos.');
        }
        const res = await duenoService.actualizarPerfilFinanciero(perfilForm);
        if (res.status === 'success') {
            setEditandoPerfil(false);
            setMsjPerfil('✅ Perfil financiero actualizado.');
            cargarPerfil();
            onActualizar();
        } else {
            setMsjPerfil(`❌ ${formatValidationErrors(res)}`);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h3>⚙️ Configuración de la Cuenta</h3>
            <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }} role="status">{msjPerfil}</div>
            {msjPerfil && (
                <p role="alert" style={{
                    color: msjPerfil.includes('✅') ? 'green' : msjPerfil.includes('⚠️') ? 'orange' : 'red',
                    fontWeight: 'bold', marginBottom: '15px', padding: '10px',
                    background: msjPerfil.includes('✅') ? '#d4edda' : '#fff3cd', borderRadius: '6px'
                }}>{msjPerfil}</p>
            )}
            {!editandoPerfil ? (
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '24px', background: '#fff' }}>
                    {perfilData ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                <button onClick={() => setVerDatosSensibles(!verDatosSensibles)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: '#666' }}>
                                    {verDatosSensibles ? '🙈 Ocultar datos sensibles' : '👁 Mostrar datos sensibles'}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                                <div><strong>📋 RUC:</strong> {verDatosSensibles ? perfilData.Ruc : '••• ••• •••' + (perfilData.Ruc?.slice(-3) || '')}</div>
                                <div><strong>🏢 Razón Social:</strong> {perfilData.Razon_Social}</div>
                                <div><strong>🏦 Banco:</strong> {perfilData.Banco}</div>
                                <div><strong>🔢 CCI:</strong> {verDatosSensibles ? perfilData.CCI : '••• ••• ••• ••• •••' + (perfilData.CCI?.slice(-4) || '')}</div>
                                <div><strong>📌 Estado:</strong> <span style={{ color: perfilData.Estado === 'ACTIVO' ? 'green' : 'red' }}>{perfilData.Estado}</span></div>
                                {perfilData.Fecha_Afiliacion && <div><strong>📅 Afiliado desde:</strong> {new Date(perfilData.Fecha_Afiliacion).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                            </div>
                            <button onClick={() => { setEditandoPerfil(true); setMsjPerfil(''); setPerfilForm({
                                ruc: perfilData.Ruc || '',
                                razonSocial: perfilData.Razon_Social || '',
                                cci: perfilData.CCI || '',
                                banco: perfilData.Banco || 'BCP'
                            }); }} style={{ background: '#1e2530', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Editar Perfil Financiero</button>
                        </>
                    ) : (
                        <p style={{ color: '#999' }}>Cargando datos del perfil...</p>
                    )}
                </div>
            ) : (
                <form onSubmit={handleGuardarPerfil} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '24px', background: '#fff' }}>
                    <p style={{ marginBottom: '15px', color: '#666' }}>Modifica los datos bancarios donde recibirás tus pagos.</p>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="config-ruc">📋 RUC <span style={{ color: 'red' }}>*</span>:</label>
                        <input id="config-ruc" type="text" maxLength={11} required value={perfilForm.ruc} style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => /^\d*$/.test(e.target.value) && setPerfilForm({ ...perfilForm, ruc: e.target.value })} />
                        <span style={{ fontSize: '11px', color: '#888' }}>11 dígitos — inicia con 10 (natural) o 20 (jurídico)</span>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="config-razonSocial">🏢 Razón Social <span style={{ color: 'red' }}>*</span>:</label>
                        <input id="config-razonSocial" type="text" required value={perfilForm.razonSocial} maxLength={100} style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => setPerfilForm({ ...perfilForm, razonSocial: e.target.value })} />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="config-banco">🏦 Banco <span style={{ color: 'red' }}>*</span>:</label>
                        <select id="config-banco" value={perfilForm.banco} style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => setPerfilForm({ ...perfilForm, banco: e.target.value })}>
                            <option value="BCP">BCP</option>
                            <option value="Interbank">Interbank</option>
                            <option value="BBVA">BBVA</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="config-cci">🔢 CCI <span style={{ color: 'red' }}>*</span>:</label>
                        <input id="config-cci" type="text" maxLength={20} required value={perfilForm.cci} style={{ width: '100%', padding: '8px', marginTop: '4px' }} onChange={e => /^\d*$/.test(e.target.value) && setPerfilForm({ ...perfilForm, cci: e.target.value })} />
                        <span style={{ fontSize: '11px', color: '#888' }}>20 dígitos, solo números</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => { setEditandoPerfil(false); setMsjPerfil(''); }} style={{ background: '#eee', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Guardar Cambios</button>
                    </div>
                </form>
            )}
        </div>
    );
}
