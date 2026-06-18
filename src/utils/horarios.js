export const generarBloquesHorarios = (horaInicio, horaFin) => {
  const [hI, mI] = horaInicio.split(':').map(Number);
  const [hF, mF] = horaFin.split(':').map(Number);
  const inicioMin = hI * 60 + mI;
  const finMin = hF * 60 + mF;
  const bloques = [];
  for (let m = inicioMin; m + 60 <= finMin; m += 60) {
    const h1 = Math.floor(m / 60);
    const min1 = m % 60;
    const h2 = Math.floor((m + 60) / 60);
    const min2 = (m + 60) % 60;
    bloques.push({
      horaInicio: `${String(h1).padStart(2, '0')}:${String(min1).padStart(2, '0')}`,
      horaFin: `${String(h2).padStart(2, '0')}:${String(min2).padStart(2, '0')}`
    });
  }
  return bloques;
};
