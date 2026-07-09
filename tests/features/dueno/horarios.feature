# language: es

Característica: Horarios y tarifas
  Como dueño de cancha
  Quiero gestionar los horarios y tarifas de mis canchas
  Para configurar la disponibilidad

  Escenario: Ver horarios actuales
    Dado que soy un dueño autenticado
    Cuando navego a la página de horarios
    Entonces veo los horarios configurados

  Escenario: Modificar horario
    Dado que soy un dueño autenticado
    Cuando navego a la página de horarios
    Entonces veo las opciones para modificar horarios

  Escenario: Ver tarifas
    Dado que soy un dueño autenticado
    Cuando navego a la página de tarifas
    Entonces veo las tarifas configuradas por día
