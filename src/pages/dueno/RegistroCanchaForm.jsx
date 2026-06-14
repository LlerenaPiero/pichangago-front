import { useState } from 'react';
import { duenoService } from '../../services/duenoService';

export default function RegistroCanchaForm({ onCanchaCreada }) {
    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', distrito: 'San Juan de Miraflores',
        precioBase: '', precioPrime: '', precioBaja: ''
    });
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    // Lista de distritos clave para el negocio futbolero de Lima
    const distritosLima = [
        'San Juan de Miraflores', 'Santiago de Surco', 'Los Olivos', 
        'La Victoria', 'Chorrillos', 'San Borja', 'Magdalena del Mar'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ tipo: '', texto: '' });

        const res = await duenoService.registrarCancha(formData);
        
        if (res.status === 'success') {
            setMensaje({ tipo: 'success', texto: `⚽ ¡Cancha registrada! ID: ${res.idCancha}` });
            if (onCanchaCreada) onCanchaCreada(res.idCancha); // Pasa el ID al contenedor padre
        } else {
            setMensaje({ tipo: 'error', texto: res.error || 'Ocurrió un error inesperado.' });
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>🏗️ Registrar Nueva Cancha</h2>
            
            {mensaje.texto && (
                <div style={{ color: mensaje.tipo === 'success' ? 'green' : 'red', marginBottom: '15px' }}>
                    {mensaje.texto}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre del Complejo:</label>
                    <input type="text" name="nombre" required onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Descripción / Dirección:</label>
                    <input type="text" name="descripcion" onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Distrito de Lima:</label>
                    <select name="distrito" onChange={handleChange} style={{ width: '100%', padding: '5px', marginBottom: '10px' }}>
                        {distritosLima.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label>Precio Base (S/ por Hora):</label>
                    <input type="number" name="precioBase" required onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Precio Prime (Tardes/Noches - S/):</label>
                    <input type="number" name="precioPrime" onChange={handleChange} style={{ width: '100%', marginBottom: '10px' }} />
                </div>
                <div>
                    <label>Precio Baja/Valle (Mañanas - S/):</label>
                    <input type="number" name="precioBaja" onChange={handleChange} style={{ width: '100%', marginBottom: '20px' }} />
                </div>
                <button type="submit" style={{ background: '#00b48a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', width: '100%' }}>
                    Guardar Cancha y Continuar
                </button>
            </form>
        </div>
    );
}