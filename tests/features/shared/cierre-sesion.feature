# language: es

Característica: Cierre de sesión
  Como usuario autenticado
  Quiero cerrar sesión
  Para proteger mi cuenta cuando termino de usar la plataforma

  Escenario: Cierre de sesión exitoso
    Dado que soy un usuario registrado con email "carlos@test.com" y contraseña "Clave@123"
    Cuando abro el modal de inicio de sesión
    Y ingreso credenciales email "carlos@test.com" y contraseña "Clave@123"
    Y envío el formulario de inicio de sesión
    Y hago clic en "Salir"
    Y confirmo el cierre de sesión
    Entonces veo el botón "Iniciar Sesión"
