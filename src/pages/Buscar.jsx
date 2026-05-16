import { useState } from 'react';
import { Link } from 'react-router-dom';

// ── MOCK DATA DIRECTO DE TU PROTOTIPO ──
const CANCHAS_MOCK = [
  { id: "c1", nombre: "Cancha Los Cóndores", distrito: "Miraflores", direccion: "Av. Benavides 1240, Miraflores", tipo: "Fútbol 7 · Sintético", precioBase: 80, rating: 4.7, totalReservas: 312, foto: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=700&q=80" },
  { id: "c2", nombre: "FútbolPark San Borja", distrito: "San Borja", direccion: "Jr. Las Artes 560, San Borja", tipo: "Fútbol 5 · Sintético", precioBase: 65, rating: 4.4, totalReservas: 198, foto: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=700&q=80" },
  { id: "c3", nombre: "Arena Soccer La Molina", distrito: "La Molina", direccion: "Av. La Fontana 850, La Molina", tipo: "Fútbol 7 · Sintético", precioBase: 90, rating: 4.9, totalReservas: 421, foto: "https://images.unsplash.com/photo-1516566775063-24e0cef04c83?w=700&q=80" },
  { id: "c4", nombre: "Estadito Surco", distrito: "Santiago de Surco", direccion: "Calle Monte Bello 234, Surco", tipo: "Fútbol 5 · Sintético", precioBase: 55, rating: 4.2, totalReservas: 87, foto: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=700&q=80" },
  { id: "c5", nombre: "Gol & Gol Barranco", distrito: "Barranco", direccion: "Av. Grau 890, Barranco", tipo: "Fútbol 5 · Sintético", precioBase: 70, rating: 4.6, totalReservas: 154, foto: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=700&q=80" }
];

const Buscar = () => {
  // Estados para los inputs de búsqueda
  const [distritoInput, setDistritoInput] = useState('');
  const [nombreInput, setNombreInput] = useState('');
  
  // Estado para la lista que se va a renderizar en pantalla
  const [resultadoCanchas, setResultadoCanchas] = useState(CANCHAS_MOCK);

  // Función de filtrado (El equivalente React de tu renderBuscarList)
  const handleSearch = (e) => {
    e.preventDefault();
    
    let filtradas = CANCHAS_MOCK.filter(cancha => {
      const matchDistrito = cancha.distrito.toLowerCase().includes(distritoInput.toLowerCase()) || 
                            cancha.direccion.toLowerCase().includes(distritoInput.toLowerCase());
      const matchNombre = cancha.nombre.toLowerCase().includes(nombreInput.toLowerCase());
      
      return matchDistrito && matchNombre;
    });

    setResultadoCanchas(filtradas);
  };

  return (
    <div className="view active" style={{ animation: 'fadeIn .25s ease' }}>
      <div className="page-wrap" style={{ maxWidth: '900px' }}>
        
        <div className="section-header">
          <h2 className="section-title">Encuentra tu Cancha Ideal</h2>
          <p className="section-sub" style={{ marginBottom: '24px' }}>Filtra por ubicación o nombre en tiempo real</p>
        </div>

        {/* CONTENEDOR DE FILTROS */}
        <form onSubmit={handleSearch} className="search-row" style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dark1)' }}>
              Distrito, urbanización o calle
            </label>
            <input 
              className="form-input" 
              placeholder="Ej: Miraflores"
              value={distritoInput}
              onChange={(e) => setDistritoInput(e.target.value)}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
            <label className="form-label" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--dark1)' }}>
              Nombre de la cancha
            </label>
            <input 
              className="form-input" 
              placeholder="Ej: Los Cóndores"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-dark" style={{ height: '42px' }}>
            🔍 Buscar
          </button>
        </form>

        {/* LISTADO HORIZONTAL DE TARJETAS */}
        <div id="buscar-list">
          {resultadoCanchas.length > 0 ? (
            resultadoCanchas.map(cancha => (
              <div className="list-card" key={cancha.id}>
                <img src={cancha.foto} alt={cancha.nombre} className="list-card-img" />
                <div className="list-card-body">
                  <h4>{cancha.nombre}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--textMid)', marginBottom: '12px' }}>
                    📍 {cancha.direccion} · {cancha.tipo}<br />
                    ⭐ {cancha.rating} ({cancha.totalReservas} reservas)
                  </p>
                  <div>
                    {/* Vinculamos de forma dinámica al componente detalle que ya tienes */}
                    <Link to={`/cancha/${cancha.id}`} className="btn btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                      Ver Cancha
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMid)' }}>
              😞 No se encontraron canchas con esos filtros.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Buscar;