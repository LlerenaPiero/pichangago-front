# language: es

Característica: Inicio de sesión
  Como usuario registrado
  Quiero iniciar sesión en la plataforma
  Para acceder a mis funcionalidades

  Escenario: Inicio de sesión exitoso como jugador
    Dado que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"
    Cuando abro el modal de inicio de sesión
    Y ingreso credenciales email "carlos@test.com" y contraseña "Clave@123"
    Y envío el formulario de inicio de sesión
    Entonces veo mi nombre en la barra de navegación

  Escenario: Inicio de sesión con credenciales inválidas
    Dado que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"
    Cuando abro el modal de inicio de sesión
    Y ingreso credenciales email "carlos@test.com" y contraseña "wrongpass"
    Y envío el formulario de inicio de sesión
    Entonces veo un mensaje de error "Credenciales inválidas"
