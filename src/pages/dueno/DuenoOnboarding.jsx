import { useState } from 'react';
import RegistroCanchaForm from './RegistroCanchaForm';
import PerfilFinanciero from './PerfilFinanciero';
import { duenoService } from '../../services/duenoService';

export default function DuenoOnboarding() {
    const [paso, setPaso] = useState(1); // Paso 1: Cancha, Paso 2: Finanzas, Paso 3: Horarios
    const [idCanchaCreada, setIdCanchaCreada] = useState(null);
    
    // Estados para el constructor de horarios (Paso 3)
    const [listaHorarios, setListaHorarios] = useState([]);
    const [nuevoHorario, setNuevoHorario] = useState({ diaSemana: 1, horaInicio: '18:00', horaFin: '19:00', tipoPrecio: 'BASE' });
    const [mensajeHorario, setMensajeHorario] = useState('');

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // Agregar un horario temporalmente a la tabla visual de React
    const agregarHorarioALista = () => {
        // Formateamos las horas al ISO String genérico que espera el Backend de SQL Server
        const fechaBase = "2026-06-15T"; // Usamos una fecha pivote para pasar el DateTime
        const itemFormateado = {
            diaSemana: parseInt(nuevoHorario.diaSemana),
            horaInicio: `${fechaBase}${nuevoHorario.horaInicio}:00`,
            horaFin: `${fechaBase}${nuevoHorario.horaFin}:00`,
            tipoPrecio: nuevoHorario.tipoPrecio
        };

        setListaHorarios([...listaHorarios, itemFormateado]);
    };

    // Enviar todos los horarios juntos al Backend (Bulk Insert)
    const guardarTodoElCronograma = async () => {
        if (listaHorarios.length === 0) {
            return setMensajeHorario('⚠️ Agrega al menos un horario antes de finalizar.');
        }

        const res = await duenoService.configurarHorariosTarifas(idCanchaCreada, listaHorarios);
        
        if (res.status === 'success') {
            alert('🎉 ¡Onboarding completado exitosamente! Tu cancha ya está operativa para recibir reservas.');
            window.location.href = '/panel-dueno/dashboard'; // Redirección al Momento 2
        } else {
            setMensajeHorario(res.error || 'Error al guardar el cronograma.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Indicador visual de pasos */}
            <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '3px' }}>
                <span style={{ fontWeight: paso === 1 ? 'bold' : 'normal', color: paso === 1 ? '#00b48a' : '#999' }}>1. Registrar Cancha</span>
                <span style={{ fontWeight: paso === 2 ? 'bold' : 'normal', color: paso === 2 ? '#00b48a' : '#999' }}>2. Configurar Cobros</span>
                <span style={{ fontWeight: paso === 3 ? 'bold' : 'normal', color: paso === 3 ? '#00b48a' : '#999' }}>3. Asignar Horarios y Tarifas</span>
            </div>

            {/* RENDERIZADO DINÁMICO SEGÚN EL PASO ACTUAL */}
            {paso === 1 && (
                <RegistroCanchaForm onCanchaCreada={(id) => {
                    setIdCanchaCreada(id);
                    setPaso(2);
                }} />
            )}

            {paso === 2 && (
                <PerfilFinanciero onConfiguracionExitosa={() => setPaso(3)} />
            )}

            {paso === 3 && (
                <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h2>📅 Configuración de Disponibilidad y Precios</h2>
                    <p style={{ fontSize: '14px', color: '#666' }}>Arma el cronograma de tu cancha. Puedes agregar múltiples turnos por día.</p>

                    {mensajeHorario && <p style={{ color: 'red' }}>{mensajeHorario}</p>}

                    {/* Controles para armar un bloque horario */}
                    <div style={{ display: 'grid', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                        <div>
                            <label>Día de la semana: </label>
                            <select value={nuevoHorario.diaSemana} onChange={e => setNuevoHorario({...nuevoHorario, diaSemana: e.target.value})}>
                                {dias.map((d, index) => <option key={d} value={index + 1}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label>Rango Horario: </label>
                            <input type="time" value={nuevoHorario.horaInicio} onChange={e => setNuevoHorario({...nuevoHorario, horaInicio: e.target.value})} /> 
                            <span> a </span>
                            <input type="time" value={nuevoHorario.horaFin} onChange={e => setNuevoHorario({...nuevoHorario, horaFin: e.target.value})} />
                        </div>
                        <div>
                            <label>Tarifa aplicable: </label>
                            <select value={nuevoHorario.tipoPrecio} onChange={e => setNuevoHorario({...nuevoHorario, tipoPrecio: e.target.value})}>
                                <option value="BASE">Precio Base (🟢 Estándar)</option>
                                <option value="PRIME">Precio Prime (🔴 Noches/Fin de semana)</option>
                                <option value="BAJA">Precio Valle/Baja (🟡 Mañanas/Días muertos)</option>
                            </select>
                        </div>
                        <button type="button" onClick={agregarHorarioALista} style={{ background: '#1e2530', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            ➕ Añadir este bloque al cronograma
                        </button>
                    </div>

                    {/* Tabla resumen temporal de bloques cargados */}
                    <h3>Resumen de la semana armada:</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead>
                            <tr style={{ background: '#eee' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Día</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Horario</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tipo Tarifa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaHorarios.map((h, i) => (
                                <tr key={i} style={{ textAlign: 'center' }}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{dias[h.diaSemana - 1]}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.horaInicio.split('T')[1].substring(0,5)} - {h.horaFin.split('T')[1].substring(0,5)}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{h.tipoPrecio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button onClick={guardarTodoElCronograma} style={{ background: '#00b48a', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>
                        🚀 Finalizar Onboarding y Publicar Cancha
                    </button>
                </div>
            )}
        </div>
    );
}