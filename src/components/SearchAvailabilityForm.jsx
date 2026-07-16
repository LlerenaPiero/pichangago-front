import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TIPOS = [
  { value: '', label: 'Cualquier tipo', players: null },
  { value: 'F5', label: 'Fútbol 5', players: '10' },
  { value: 'F6', label: 'Fútbol 6', players: '12' },
  { value: 'F7', label: 'Fútbol 7', players: '14' },
  { value: 'F8', label: 'Fútbol 8', players: '16' },
  { value: 'F11', label: 'Fútbol 11', players: '22' },
];

const HORARIOS = [
  { value: '', label: 'Cualquier hora' },
  { value: '06:00', label: '6:00 a. m.' },
  { value: '07:00', label: '7:00 a. m.' },
  { value: '08:00', label: '8:00 a. m.' },
  { value: '09:00', label: '9:00 a. m.' },
  { value: '10:00', label: '10:00 a. m.' },
  { value: '11:00', label: '11:00 a. m.' },
  { value: '12:00', label: '12:00 p. m.' },
  { value: '13:00', label: '1:00 p. m.' },
  { value: '14:00', label: '2:00 p. m.' },
  { value: '15:00', label: '3:00 p. m.' },
  { value: '16:00', label: '4:00 p. m.' },
  { value: '17:00', label: '5:00 p. m.' },
  { value: '18:00', label: '6:00 p. m.' },
  { value: '19:00', label: '7:00 p. m.' },
  { value: '20:00', label: '8:00 p. m.' },
  { value: '21:00', label: '9:00 p. m.' },
  { value: '22:00', label: '10:00 p. m.' },
  { value: '23:00', label: '11:00 p. m.' },
];

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const hoy = () => new Date().toISOString().split('T')[0];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T12:00:00');
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy · ' + `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;
  if (diff === 1) return 'Mañana · ' + `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;
  const diaSem = DIAS_ES[d.getDay()];
  return `${diaSem} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;
};

const SearchAvailabilityForm = ({ variant = 'home', initialValues = {}, onSubmit }) => {
  const navigate = useNavigate();
  const [ubicacion, setUbicacion] = useState(initialValues.ubicacion || '');
  const [fecha, setFecha] = useState(initialValues.fecha || hoy());
  const [hora, setHora] = useState(initialValues.hora || '');
  const [tipo, setTipo] = useState(initialValues.tipo || '');
  const [showQuickDates, setShowQuickDates] = useState(false);
  const quickRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (quickRef.current && !quickRef.current.contains(e.target)) {
        setShowQuickDates(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBuscar = () => {
    const params = new URLSearchParams();
    if (ubicacion) params.append('nombre', ubicacion);
    if (fecha) params.append('fecha', fecha);
    if (hora) params.append('hora', hora);
    if (tipo) params.append('tipo', tipo);

    if (onSubmit) {
      onSubmit({ ubicacion, fecha, hora, tipo });
    } else {
      navigate(`/buscar?${params.toString()}`);
    }
  };

  const fechasRapidas = () => {
    const arr = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const val = d.toISOString().split('T')[0];
      const diff = i;
      let label;
      if (diff === 0) label = `Hoy · ${DIAS_ES[d.getDay()]} ${d.getDate()}`;
      else if (diff === 1) label = `Mañana · ${DIAS_ES[d.getDay()]} ${d.getDate()}`;
      else label = `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;
      arr.push({ value: val, label });
    }
    return arr;
  };

  const getButtonLabel = () => {
    if (!ubicacion && !hora && !tipo) return 'Buscar canchas disponibles';
    if (ubicacion && !hora) return `Buscar en ${ubicacion}`;
    if (hora && !ubicacion) return `Ver canchas para las ${HORARIOS.find(h => h.value === hora)?.label || hora}`;
    return 'Ver horarios disponibles';
  };

  return (
    <div className={`search-form search-form--${variant}`}>
      <div className="search-fields">
        <div className="search-field search-field--ubicacion">
          <input
            type="text"
            placeholder="Ciudad / distrito / cancha"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
            aria-label="Ubicación"
          />
        </div>

        <div className="search-field search-field--fecha" ref={quickRef}>
          <div
            className="search-date-trigger"
            onClick={() => setShowQuickDates(!showQuickDates)}
            role="button"
            tabIndex={0}
            aria-label="Fecha"
            onKeyDown={e => e.key === 'Enter' && setShowQuickDates(!showQuickDates)}
          >
            <span className="search-date-label">{formatearFecha(fecha)}</span>
            <span className="search-date-arrow">&#9660;</span>
          </div>
          {showQuickDates && (
            <div className="search-date-quick">
              {fechasRapidas().map(f => (
                <button
                  key={f.value}
                  type="button"
                  className={`search-date-option ${fecha === f.value ? 'active' : ''}`}
                  onClick={() => { setFecha(f.value); setShowQuickDates(false); }}
                >
                  {f.label}
                </button>
              ))}
              <div className="search-date-quick-divider" />
              <label className="search-date-custom-label">
                <input
                  type="date"
                  value={fecha}
                  onChange={e => { setFecha(e.target.value); setShowQuickDates(false); }}
                  className="search-date-custom-input"
                  aria-label="Fecha personalizada"
                />
              </label>
            </div>
          )}
        </div>

        <div className="search-field search-field--hora">
          <select
            value={hora}
            onChange={e => setHora(e.target.value)}
            aria-label="Hora"
            className="search-select"
          >
            {HORARIOS.map(h => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>

        <div className="search-field search-field--tipo">
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            aria-label="Tipo de cancha"
            className="search-select"
          >
            {TIPOS.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}{t.players ? ` (${t.players} pers.)` : ''}
              </option>
            ))}
          </select>
        </div>

      </div>

      <button className="btn-search" onClick={handleBuscar}>
        {getButtonLabel()}
      </button>
    </div>
  );
};

export default SearchAvailabilityForm;
