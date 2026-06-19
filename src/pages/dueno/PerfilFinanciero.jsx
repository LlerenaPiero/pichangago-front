import { useState } from 'react';
import { duenoService } from '../../services/duenoService';

export default function PerfilFinanciero({ onConfiguracionExitosa }) {
    const [formData, setFormData] = useState({ ruc: '', razonSocial: '', cci: '', banco: 'BCP' });
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const bancosPeru = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'Banco de la Nación'];

    const handleChange = (e) => {
        // Solo permitir números en RUC y CCI
        if ((e.target.name === 'ruc' || e.target.name === 'cci') && !/^\d*$/.test(e.target.value)) {
            return; 
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });

        if (!/^(10|20)\d{9}$/.test(formData.ruc)) {
            return setMensaje({ tipo: 'error', texto: '⚠️ RUC inválido. Debe tener 11 dígitos, iniciar con 10 (natural) o 20 (jurídico).' });
        }
        if (!/^\d{20}$/.test(formData.cci)) {
            return setMensaje({ tipo: 'error', texto: '⚠️ El CCI debe tener exactamente 20 dígitos numéricos.' });
        }

        const res = await duenoService.actualizarPerfilFinanciero(formData);
        
        if (res.status === 'success') {
            setMensaje({ tipo: 'success', texto: '💳 Datos de cobro configurados con éxito.' });
            if (onConfiguracionExitosa) onConfiguracionExitosa();
        } else {
            setMensaje({ tipo: 'error', texto: res.error || 'Error al guardar los datos financieros.' });
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>💳 Configurar Cuenta de Cobro (Liquidaciones)</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>PichangaGo te transferirá las ganancias acumuladas semanalmente a esta cuenta.</p>

            <div aria-live="polite" aria-atomic="true" role="status" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{mensaje.texto}</div>
            {mensaje.texto && (
                <div role="alert" style={{ color: mensaje.tipo === 'success' ? 'green' : 'red', marginBottom: '15px', fontWeight: 'bold', padding: '10px', background: mensaje.tipo === 'success' ? '#d4edda' : '#fee2e2', borderRadius: '6px' }}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="pf-ruc" title="Registro Único de Contribuyente, 11 dígitos">📋 RUC <span style={{ color: 'red' }}>*</span>:</label>
                    <input id="pf-ruc" type="text" name="ruc" value={formData.ruc} maxLength={11} required aria-required="true" onChange={handleChange} placeholder="12345678901" title="RUC de 11 dígitos" aria-describedby="pf-ruc-help" style={{ width: '100%', marginBottom: '4px', padding: '6px' }} />
                    <span id="pf-ruc-help" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '10px' }}>11 dígitos, solo números</span>
                </div>
                <div>
                    <label htmlFor="pf-razonSocial" title="Nombre o razón social del titular de la cuenta">🏢 Razón Social <span style={{ color: 'red' }}>*</span>:</label>
                    <input id="pf-razonSocial" type="text" name="razonSocial" value={formData.razonSocial} required aria-required="true" onChange={handleChange} placeholder="Ej: Mi Empresa SAC" title="Nombre del titular" style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
                </div>
                <div>
                    <label htmlFor="pf-banco" title="Selecciona el banco para recibir tus pagos">🏦 Banco <span style={{ color: 'red' }}>*</span>:</label>
                    <select id="pf-banco" name="banco" value={formData.banco} onChange={handleChange} title="Banco de destino" style={{ width: '100%', marginBottom: '10px', padding: '6px' }}>
                        {bancosPeru.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="pf-cci" title="Código de Cuenta Interbancario, 20 dígitos">🔢 CCI <span style={{ color: 'red' }}>*</span>:</label>
                    <input id="pf-cci" type="text" name="cci" value={formData.cci} maxLength={20} required aria-required="true" onChange={handleChange} placeholder="12345678901234567890" title="CCI de 20 dígitos" aria-describedby="pf-cci-help" style={{ width: '100%', marginBottom: '4px', padding: '6px' }} />
                    <span id="pf-cci-help" style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '20px' }}>20 dígitos, solo números</span>
                </div>
                <button type="submit" style={{ background: '#008060', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
                    Guardar Configuración Financiera
                </button>
            </form>
        </div>
    );
}