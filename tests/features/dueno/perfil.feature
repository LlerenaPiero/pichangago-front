# language: es

Característica: Perfil de dueño
  Como dueño de cancha
  Quiero ver y gestionar mi perfil
  Para mantener mis datos actualizados

  Escenario: Ver perfil de dueño en el panel
    Dado que soy un dueño autenticado
    Cuando estoy en el panel de dueño
    Y hago clic en "👤 Mi Perfil"
    Entonces veo mi información personal

  Escenario: Ver datos financieros
    Dado que soy un dueño autenticado
    Cuando estoy en el panel de dueño
    Y hago clic en "👤 Mi Perfil"
    Entonces veo la sección de información de pagos
