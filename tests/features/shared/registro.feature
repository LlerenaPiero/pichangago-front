# language: es

Característica: Registro de nuevo usuario
  Como visitante de PichangaGo
  Quiero registrarme en la plataforma
  Para acceder a las funcionalidades de jugador o dueño

  Escenario: Registro exitoso con datos válidos
    Dado que soy un visitante en la página de inicio
    Cuando hago clic en "Iniciar Sesión"
    Y hago clic en la pestaña "Registrarse"
    Y completo el formulario de registro con nombre "Juan", apellido "Pérez", email "juan@test.com", contraseña "Clave@123", teléfono "999888777"
    Y selecciono el rol de "Jugador"
    Y envío el formulario de registro
    Entonces veo un mensaje de bienvenida con mi nombre

  Escenario: Registro con correo duplicado
    Dado que soy un visitante en la página de inicio
    Cuando hago clic en "Iniciar Sesión"
    Y hago clic en la pestaña "Registrarse"
    Y completo el formulario de registro con nombre "Carlos", apellido "López", email "carlos@test.com", contraseña "Clave@123", teléfono "999888777"
    Y selecciono el rol de "Jugador"
    Y envío el formulario de registro
    Entonces veo un mensaje de error "ya está registrado"

  Escenario: Registro con campos obligatorios vacíos
    Dado que soy un visitante en la página de inicio
    Cuando hago clic en "Iniciar Sesión"
    Y hago clic en la pestaña "Registrarse"
    Y envío el formulario de registro
    Entonces veo que los campos obligatorios muestran error
