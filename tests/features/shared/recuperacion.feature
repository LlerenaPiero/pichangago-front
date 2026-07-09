# language: es

Característica: Recuperación de contraseña
  Como usuario registrado
  Quiero recuperar mi contraseña
  Para poder acceder a mi cuenta si la olvido

  Escenario: Solicitar recuperación con correo válido
    Dado que soy un usuario registrado con email "carlos@test.com"
    Cuando abro el modal de inicio de sesión
    Y hago clic en "¿Olvidaste tu contraseña?"
    Y ingreso mi email "carlos@test.com" en el campo de recuperación
    Y envío la solicitud de recuperación
    Entonces veo un mensaje de éxito "Correo enviado"

  Escenario: Solicitar recuperación con correo no registrado
    Dado que soy un usuario registrado con email "carlos@test.com"
    Cuando abro el modal de inicio de sesión
    Y hago clic en "¿Olvidaste tu contraseña?"
    Y ingreso mi email "noexiste@test.com" en el campo de recuperación
    Y envío la solicitud de recuperación
    Entonces veo un mensaje de error "Correo no encontrado"
