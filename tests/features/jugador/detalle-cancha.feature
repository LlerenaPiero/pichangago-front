# language: es

Característica: Detalle de cancha
  Como jugador
  Quiero ver el detalle de una cancha y seleccionar horarios
  Para poder realizar una reserva

  Escenario: Ver detalle de cancha
    Dado que estoy en la página de detalle de la cancha "cancha-1"
    Entonces veo el nombre y distrito de la cancha

  Escenario: Ver slots disponibles
    Dado que estoy en la página de detalle de la cancha "cancha-1"
    Entonces veo los horarios disponibles para reservar

  Escenario: Seleccionar un slot
    Dado que estoy en la página de detalle de la cancha "cancha-1"
    Cuando selecciono un horario disponible
    Entonces veo el resumen de la reserva con el total a pagar

  Escenario: Abrir modal de reserva
    Dado que soy un jugador autenticado en el detalle de la cancha "cancha-1"
    Cuando selecciono un horario disponible
    Y hago clic en "Reservar y Pagar (1 hrs) →"
    Entonces veo el modal de reserva con el paso de resumen

  Escenario: Reserva exitosa
    Dado que soy un jugador autenticado en el detalle de la cancha "cancha-1"
    Cuando selecciono un horario disponible
    Y hago clic en "Reservar y Pagar (1 hrs) →"
    Y avanzo al paso de datos y completo nombre "Juan Pérez" y teléfono "999888777"
    Y avanzo al paso de pago y confirmo la reserva
    Entonces veo la confirmación de reserva exitosa
