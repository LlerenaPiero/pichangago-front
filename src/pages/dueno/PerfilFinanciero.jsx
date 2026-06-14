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

        if (formData.ruc.length !== 11) {
            return setMensaje({ tipo: 'error', texto: '⚠️ El RUC debe tener exactamente 11 dígitos.' });
        }
        if (formData.cci.length !== 20) {
            return setMensaje({ tipo: 'error', texto: '⚠️ El CCI debe tener exactamente 20 dígitos.' });
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

            {mensaje.texto && (
                <div style={{ color: mensaje.tipo === 'success' ? 'green' : 'red', marginBottom: '15px', fontWeight: 'bold' }}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>RUC (11 dígitos):</label>
                    <input type="text" name="ruc" value={formData.ruc} maxLength={11} required onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
                </div>
                <div>
                    <label>Razón Social (Titular de la cuenta):</label>
                    <input type="text" name="razonSocial" value={formData.razonSocial} required onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '6px' }} />
                </div>
                <div>
                    <label>Banco:</label>
                    <select name="banco" value={formData.banco} onChange={handleChange} style={{ width: '100%', marginBottom: '10px', padding: '6px' }}>
                        {bancosPeru.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label>Código de Cuenta Interbancario (CCI - 20 dígitos):</label>
                    <input type="text" name="cci" value={formData.cci} maxLength={20} required onChange={handleChange} style={{ width: '100%', marginBottom: '20px', padding: '6px' }} />
                </div>
                <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
                    Guardar Configuración Financiera
                </button>
            </form>
        </div>
    );
}