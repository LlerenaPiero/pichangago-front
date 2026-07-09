# language: es

Característica: Dashboard del dueño
  Como dueño de cancha
  Quiero ver el resumen de mi negocio
  Para tener visibilidad de mis operaciones

  Escenario: Ver dashboard con resumen
    Dado que soy un dueño autenticado
    Cuando estoy en el panel de dueño
    Entonces veo las tarjetas de resumen del dashboard

  Escenario: Ver agenda del día
    Dado que soy un dueño autenticado
    Cuando estoy en el panel de dueño
    Entonces veo la tabla de reservas de hoy
