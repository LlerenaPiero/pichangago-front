# language: es

Característica: Mis reservas
  Como jugador autenticado
  Quiero gestionar mis reservas
  Para ver el estado de mis partidos

  Escenario: Ver reservas activas
    Dado que soy un jugador autenticado
    Cuando navego a la página de mis reservas
    Entonces veo la lista de reservas próximas

  Escenario: Cambiar a pestaña historial
    Dado que soy un jugador autenticado
    Cuando navego a la página de mis reservas
    Y cambio a la pestaña "Historial"
    Entonces veo el historial de reservas pasadas

  Escenario: Cancelar una reserva
    Dado que soy un jugador autenticado
    Cuando navego a la página de mis reservas
    Y abro el detalle de la primera reserva
    Y hago clic en "Cancelar"
    Entonces veo el mensaje de cancelación exitosa

  Escenario: Ver detalle de reserva
    Dado que soy un jugador autenticado
    Cuando navego a la página de mis reservas
    Y abro el detalle de la primera reserva
    Entonces veo la información completa de la reserva
