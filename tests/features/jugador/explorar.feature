# language: es

Característica: Explorar canchas
  Como jugador
  Quiero explorar canchas disponibles
  Para encontrar la cancha ideal para mis partidos

  Escenario: Buscar canchas en la página de inicio
    Dado que soy un visitante en la página de inicio
    Entonces veo el listado de canchas disponibles

  Escenario: Filtrar por distrito
    Dado que soy un visitante en la página de inicio
    Cuando selecciono el distrito "Miraflores" en el buscador
    Y hago clic en "🔍 Buscar"
    Entonces veo la página de resultados de búsqueda

  Escenario: Filtrar por nombre
    Dado que soy un visitante en la página de inicio
    Cuando ingreso "Central" en el campo de búsqueda por nombre
    Y hago clic en "🔍 Buscar"
    Entonces veo la página de resultados de búsqueda

  Escenario: Ver resultados de búsqueda en /buscar
    Dado que soy un visitante en la página de inicio
    Cuando navego a la página de búsqueda
    Entonces veo canchas listadas en los resultados

  Escenario: Navegar al detalle desde los resultados
    Dado que soy un visitante en la página de inicio
    Cuando hago clic en la primera cancha del listado
    Entonces veo los detalles de la cancha

  Escenario: Sin resultados de búsqueda
    Dado que soy un visitante en la página de inicio
    Cuando navego a la página de búsqueda
    Entonces veo el contador de canchas encontradas
