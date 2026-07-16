import { useState } from 'react';
import RegistroCanchaForm from './RegistroCanchaForm';
import PerfilFinanciero from './PerfilFinanciero';
import { duenoService } from '../../services/duenoService';
import { localService } from '../../services/localService';
import { generarBloquesHorarios } from '../../utils/horarios';

export default function DuenoOnboarding() {
    const [paso, setPaso] = useState(1); // Paso 1: Local, Paso 2: Cancha, Paso 3: Finanzas, Paso 4: Horarios
    const [idCanchaCreada, setIdCanchaCreada] = useState(null);
    const [localForm, setLocalForm] = useState({ nombre: '', direccion: '', distrito: '' });
    const [localMensaje, setLocalMensaje] = useState('');
    const [localEnviando, setLocalEnviando] = useState(false);
    
    // Estados para el constructor de horarios (Paso 3)
    const [listaHorarios, setListaHorarios] = useState([]);
    const [nuevoHorario, setNuevoHorario] = useState({ diaSemana: 1, horaInicio: '18:00', horaFin: '19:00', tipoPrecio: 'BASE' });
    const [mensajeHorario, setMensajeHorario] = useState('');

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diaValue = (index) => index === 6 ? 0 : index + 1;

    const agregarHorarioALista = () => {
        setMensajeHorario('');
        
        if (nuevoHorario.horaInicio >= nuevoHorario.horaFin) {
            return setMensajeHorario('⚠️ La hora de inicio debe ser menor que la hora de fin.');
        }

        const bloques = generarBloquesHorarios(nuevoHorario.horaInicio, nuevoHorario.horaFin);
        const dia = parseInt(nuevoHorario.diaSemana, 10);
        const nuevos = bloques.filter(b => !listaHorarios.some(h =>
            h.diaSemana === dia && h.horaInicio === b.horaInicio
        ));
        if (nuevos.length === 0) {
            return setMensajeHorario('⚠️ Todos los bloques en este rango ya están agregados.');
        }

        setListaHorarios([...listaHorarios, ...nuevos.map(b => ({
            diaSemana: dia,
            horaInicio: b.horaInicio,
            horaFin: b.horaFin,
            tipoPrecio: nuevoHorario.tipoPrecio
        }))]);
        if (nuevos.length > 1) setMensajeHorario(`✅ ${nuevos.length} bloques de 1 hora agregados.`);
    };

    // Enviar todos los horarios juntos al Backend (Bulk Insert)
    const guardarTodoElCronograma = async () => {
        if (listaHorarios.length === 0) {
            return setMensajeHorario('⚠️ Agrega al menos un horario antes de finalizar.');
        }

        const res = await duenoService.configurarHorariosTarifas(idCanchaCreada, listaHorarios);

        if (res.status === 'success') {
            await duenoService.generarSlotsDesdeHorarios(idCanchaCreada).catch(() => {});
            window.location.href = '/panel-dueno';
        } else {
            setMensajeHorario(res.error || 'Error al guardar el cronograma.');
        }
    };

    return (
        <div style={{ padding: '80px 24px', fontFamily: 'Arial, sans-serif' }}>
            {/* Indicador visual de pasos */}
            <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f0f4f8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ fontWeight: paso === 1 ? 'bold' : 'normal', color: paso === 1 ? '#008060' : '#999' }}>1. Registrar Local</span>
                <span style={{ fontWeight: paso === 2 ? 'bold' : 'normal', color: paso === 2 ? '#008060' : '#999' }}>2. Crear Cancha</span>
                <span style={{ fontWeight: paso === 3 ? 'bold' : 'normal', color: paso === 3 ? '#008060' : '#999' }}>3. Configurar Cobros</span>
                <span style={{ fontWeight: paso === 4 ? 'bold' : 'normal', color: paso === 4 ? '#008060' : '#999' }}>4. Asignar Horarios y Tarifas</span>
            </div>

            {/* RENDERIZADO DINÁMICO */}
            {paso === 1 && (
                <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h2>🏢 Registrar Local</h2>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Ingresa los datos del local (complejo deportivo) donde operarán tus canchas.</p>
                    {localMensaje && <div role="alert" style={{ color: localMensaje.startsWith('✅') ? 'green' : 'red', fontWeight: 'bold', padding: '10px', background: localMensaje.startsWith('✅') ? '#d4edda' : '#fee2e2', borderRadius: '6px', marginBottom: '15px' }}>{localMensaje}</div>}
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setLocalEnviando(true);
                        setLocalMensaje('');
                        try {
                            const res = await localService.registrarLocal(localForm);
                            if (res.status === 'success') {
                                setLocalMensaje('✅ Local registrado correctamente.');
                                setTimeout(() => setPaso(2), 800);
                            } else {
                                setLocalMensaje(res.error || 'Error al registrar el local.');
                            }
                        } catch (err) {
                            setLocalMensaje('Error de conexión al registrar el local.');
                        } finally {
                            setLocalEnviando(false);
                        }
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label htmlFor="ob-local-nombre">📌 Nombre del Local:</label>
                            <input id="ob-local-nombre" type="text" value={localForm.nombre} required onChange={e => setLocalForm({...localForm, nombre: e.target.value})} placeholder="Ej: Complejo Deportivo Los Olivos" style={{ width: '100%', padding: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label htmlFor="ob-local-direccion">📍 Dirección:</label>
                            <input id="ob-local-direccion" type="text" value={localForm.direccion} required onChange={e => setLocalForm({...localForm, direccion: e.target.value})} placeholder="Ej: Av. Principal 123" style={{ width: '100%', padding: '6px' }} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label htmlFor="ob-local-distrito">🗺️ Distrito:</label>
                            <input id="ob-local-distrito" type="text" value={localForm.distrito} required onChange={e => setLocalForm({...localForm, distrito: e.target.value})} placeholder="Ej: San Miguel" style={{ width: '100%', padding: '6px' }} />
                        </div>
                        <button type="submit" disabled={localEnviando} style={{ background: localEnviando ? '#ccc' : '#008060', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '5px', cursor: localEnviando ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 'bold', marginTop: '10px' }}>
                            {localEnviando ? 'Registrando...' : 'Guardar Local y Continuar'}
                        </button>
                    </form>
                </div>
            )}

            {paso === 2 && (
                <RegistroCanchaForm onCanchaCreada={(id) => {
                    setIdCanchaCreada(id);
                    setPaso(3);
                }} />
            )}

            {paso === 3 && (
                <PerfilFinanciero onConfiguracionExitosa={() => setPaso(4)} />
            )}

            {paso === 4 && (
                <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h2>📅 Configuración de Disponibilidad y Precios</h2>
                    <p style={{ fontSize: '14px', color: '#666' }}>Arma el cronograma de tu cancha. Puedes agregar múltiples turnos por día.</p>

                    <div aria-live="polite" aria-atomic="true" role="status" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>{mensajeHorario}</div>
                    {mensajeHorario && <p role="alert" style={{ color: 'red', fontWeight: 'bold', padding: '8px', background: '#fee2e2', borderRadius: '6px' }}>{mensajeHorario}</p>}

                    {/* Controles para armar un bloque horario - AHORA CONTROLADOS */}
                    <div style={{ display: 'grid', gap: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                        <div>
                            <label htmlFor="ob-dia">Día de la semana:</label>
                            <select id="ob-dia" value={nuevoHorario.diaSemana} onChange={e => setNuevoHorario({...nuevoHorario, diaSemana: e.target.value})}>
                                {dias.map((d, index) => <option key={d} value={diaValue(index)}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ob-horaInicio">Rango Horario:</label>
                            <input id="ob-horaInicio" type="time" value={nuevoHorario.horaInicio} onChange={e => setNuevoHorario({...nuevoHorario, horaInicio: e.target.value})} style={{ padding: '4px' }} aria-describedby="ob-rango-help" /> 
                            <span> a </span>
                            <input id="ob-horaFin" type="time" value={nuevoHorario.horaFin} onChange={e => setNuevoHorario({...nuevoHorario, horaFin: e.target.value})} style={{ padding: '4px' }} />
                            <span id="ob-rango-help" style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>Hora inicio — Hora fin</span>
                        </div>
                        <div>
                            <label htmlFor="ob-tarifa">Tarifa aplicable:</label>
                            <select id="ob-tarifa" value={nuevoHorario.tipoPrecio} onChange={e => setNuevoHorario({...nuevoHorario, tipoPrecio: e.target.value})} style={{ padding: '4px' }}>
                                <option value="BASE">Precio Base (🟢 Estándar)</option>
                                <option value="PRIME">Precio Prime (🔴 Noches/Fin de semana)</option>
                                <option value="BAJA">Precio Valle/Baja (🟡 Mañanas/Días muertos)</option>
                            </select>
                        </div>
                        <button type="button" onClick={agregarHorarioALista} style={{ background: '#1e2530', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.diaSemana === 0 ? 'Domingo' : dias[h.diaSemana - 1]}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{h.horaInicio} - {h.horaFin}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{h.tipoPrecio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button onClick={guardarTodoElCronograma} style={{ background: '#008060', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>
                        🚀 Finalizar Onboarding y Publicar Cancha
                    </button>
                </div>
            )}
        </div>
    );
}