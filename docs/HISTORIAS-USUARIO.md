# Historias de Usuario — PichangaGo

## Sección 1: Historias compartidas

### HU-01 | Registrarme en la plataforma

> **Como** persona interesada en usar PichangaGo  
> **Quiero** crear una cuenta con mi email y contraseña  
> **Para** poder reservar canchas o gestionar las mías como dueño

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Registro exitoso como jugador | La persona quiere reservar canchas | Completa el formulario con rol "Jugador" y envía | El sistema crea la cuenta, inicia sesión y le muestra su nombre en la barra de navegación |
| CA-02 | Registro exitoso como dueño | La persona quiere publicar sus canchas | Completa el formulario con rol "Dueño" y envía | El sistema crea la cuenta, inicia sesión y lo lleva al panel de administración |
| CA-03 | Email ya registrado | La persona ingresa un correo que ya tiene cuenta | Envía el formulario | El sistema le avisa "El email ya está registrado" y le sugiere iniciar sesión |
| CA-04 | Contraseña muy corta | La persona escribe una contraseña de 4 caracteres | Envía el formulario | El sistema le indica que la contraseña debe tener al menos 6 caracteres |

---

### HU-02 | Iniciar sesión

> **Como** usuario con cuenta  
> **Quiero** ingresar mi email y contraseña para entrar a la plataforma  
> **Para** acceder a mis reservas o a mi panel de administración

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ingreso exitoso | El usuario recuerda sus datos | Escribe email y contraseña correctos y presiona "Iniciar Sesión" | El sistema lo deja entrar y le muestra su nombre en la barra de navegación |
| CA-02 | Contraseña incorrecta | El usuario se equivoca al escribir su contraseña | Escribe mal la contraseña y envía | El sistema le dice "Credenciales inválidas" |
| CA-03 | Varios intentos fallidos | El usuario no recuerda su contraseña | Se equivoca 3 veces seguidas | El sistema le muestra una advertencia "3/3 intentos" |
| CA-04 | Sesión cerrada al reservar | Una persona encuentra una cancha y quiere reservarla sin haber iniciado sesión | Presiona "Reservar y Pagar" | El sistema le abre la ventana de inicio de sesión para que ingrese |

---

### HU-03 | Recuperar mi contraseña

> **Como** usuario que olvidó su contraseña  
> **Quiero** recibir un enlace al correo para crear una nueva contraseña  
> **Para** poder volver a entrar a mi cuenta

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Solicitud de recuperación | El usuario no recuerda su contraseña | Escribe su email y presiona "Enviar enlace de recuperación" | El sistema le muestra un mensaje "Revisa tu correo" y le envía el enlace |
| CA-02 | Cambio de contraseña exitoso | El usuario abrió el enlace que llegó a su correo | Escribe su nueva contraseña dos veces y guarda | El sistema actualiza su contraseña y lo redirige al inicio |
| CA-03 | Enlace expirado o inválido | El usuario hace clic en un enlace viejo o incorrecto | Abre la página de restablecimiento | El sistema le muestra "Enlace inválido o expirado" |
| CA-04 | Contraseñas no coinciden | El usuario escribe dos contraseñas diferentes | Intenta guardar | El sistema le avisa "Las contraseñas no coinciden" |

---

### HU-04 | Explorar canchas disponibles

> **Como** usuario  
> **Quiero** ver las canchas que hay disponibles y buscar por zona o nombre  
> **Para** encontrar una cancha que me quede cerca o me guste

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ver canchas en el inicio | El usuario entra a la página principal | Ingresa a la web | Ve un listado con fotos, nombres y precios de las canchas disponibles |
| CA-02 | Buscar por nombre o distrito | El usuario recuerda una cancha o quiere una en su distrito | Escribe en la barra de búsqueda o selecciona un distrito | El sistema muestra solo las canchas que coinciden |
| CA-03 | Filtrar por precio | El usuario tiene un presupuesto límite | Ingresa un precio máximo en los filtros de búsqueda | El sistema muestra solo las canchas dentro de su presupuesto |
| CA-04 | Ordenar resultados | El usuario quiere ver las más baratas primero | Selecciona "Precio: menor a mayor" | El sistema reordena las canchas de más barata a más cara |
| CA-05 | Sin resultados | El usuario busca en un distrito donde no hay canchas registradas | Aplica el filtro de distrito | El sistema le muestra "No se encontraron canchas" y le sugiere limpiar los filtros |
| CA-06 | Ofertas del día | El usuario quiere encontrar un descuento de último minuto | Ingresa al inicio | Ve una sección destacada con ofertas, precio rebajado y tiempo restante |

---

### HU-05 | Ver detalle de una cancha

> **Como** usuario  
> **Quiero** entrar a una cancha para ver sus fotos, dirección, precios y horarios libres  
> **Para** decidir si me conviene reservarla

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ver información completa | El usuario encontró una cancha que le interesa | Hace clic en la cancha | Ve fotos, dirección, descripción, precio por hora y los horarios disponibles |
| CA-02 | Ver horarios de otro día | El usuario quiere ir otro día | Selecciona una fecha diferente en el calendario | El sistema muestra los horarios disponibles para ese día |
| CA-03 | Horarios ocupados | El día que el usuario quiere ya tiene reservas | Mira la cuadrícula de horarios | Los horarios ocupados se ven atenuados y no se pueden seleccionar |
| CA-04 | Seleccionar varias horas | El usuario quiere jugar 2 horas seguidas | Hace clic en dos horarios consecutivos | Ambos horarios se marcan y el sistema le muestra el total a pagar |
| CA-05 | Cancha no encontrada | El usuario entra a un enlace de una cancha que ya no existe | Navega a la página de la cancha | El sistema le muestra un mensaje de error y un botón para volver |

---

### HU-06 | Cerrar sesión

> **Como** usuario que terminó de usar la plataforma  
> **Quiero** salir de mi cuenta  
> **Para** que nadie más pueda entrar si uso un computador compartido

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Cierre de sesión | El usuario ya terminó de usar la web | Presiona "Salir" y confirma | El sistema cierra la sesión y lo regresa a la página principal |
| CA-02 | Cancelar cierre | El usuario presionó "Salir" sin querer | Presiona "Cancelar" en la ventana de confirmación | La sesión sigue activa y puede seguir navegando |

---

## Sección 2: Historias del Jugador

### HU-07 | Reservar una cancha

> **Como** jugador con sesión iniciada  
> **Quiero** elegir horarios, poner mis datos y pagar para apartar mi turno  
> **Para** asegurarme de tener cancha el día que quiero jugar

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Reserva exitosa | El jugador eligió horarios y quiere pagar | Completa sus datos, confirma el pago y presiona "Pagar" | El sistema le muestra "Reserva confirmada" con un resumen y un botón "Mis Reservas" |
| CA-02 | Reserva sin haber iniciado sesión | Una persona encuentra una cancha y quiere reservar pero no ha entrado a su cuenta | Presiona "Reservar y Pagar" | El sistema le abre la ventana de inicio de sesión |
| CA-03 | Dueño intenta reservar | Un usuario con cuenta de dueño quiere reservar una cancha | Presiona "Reservar y Pagar" | El sistema le avisa que no puede reservar porque su perfil es de dueño |
| CA-04 | Datos incompletos | El jugador no escribe su nombre o teléfono | Llega al paso de datos y el botón "Continuar" no funciona | El botón está deshabilitado hasta que complete todos los campos |
| CA-05 | Error al reservar | Otro jugador ya reservó el mismo horario justo antes | Confirma el pago | El sistema le avisa del conflicto y le sugiere elegir otro horario |

---

### HU-08 | Ver mis reservas

> **Como** jugador  
> **Quiero** ver un listado de mis reservas, tanto las próximas como las anteriores  
> **Para** recordar cuándo y dónde tengo partido

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ver próximos partidos | El jugador tiene reservas para los próximos días | Entra a "Mis Reservas" | Ve sus reservas confirmadas con fecha, hora, cancha y precio |
| CA-02 | Ver historial | El jugador quiere ver sus partidos anteriores | Cambia a la pestaña "Historial" | Ve sus reservas pasadas con el estado en que terminaron |
| CA-03 | Sin reservas | El jugador nunca ha reservado o ya se vencieron todas | Entra a "Mis Reservas" | Ve "No tienes reservas en esta sección" |
| CA-04 | Ver detalle de una reserva | El jugador quiere recordar los datos exactos de su partido | Hace clic en una reserva | Ve un resumen con cancha, dirección, fecha, horario y monto pagado |

---

### HU-09 | Cancelar una reserva

> **Como** jugador que no podrá asistir  
> **Quiero** cancelar una reserva que ya tenía confirmada  
> **Para** liberar el horario y no perder el turno si no puedo ir

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Cancelación | Al jugador le surgió un imprevisto | Abre el detalle de la reserva y presiona "Cancelar" | El sistema marca la reserva como cancelada |
| CA-02 | Reserva que ya pasó | El jugador quiere cancelar un partido que ya se jugó | Ve el detalle de una reserva completada | El botón de cancelar no aparece porque el partido ya terminó |

---

## Sección 3: Historias del Dueño

### HU-10 | Completar mis datos personales

> **Como** dueño de cancha  
> **Quiero** registrar mi nombre, teléfono y datos de contacto  
> **Para** que los jugadores puedan ubicarme si tienen algún problema

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Guardar datos | El dueño quiere actualizar su información | Modifica nombre, apellido o teléfono y guarda | El sistema actualiza sus datos y le muestra "Datos guardados" |
| CA-02 | Teléfono inválido | El dueño escribe un número de menos de 9 dígitos | Intenta guardar | El sistema le pide que ingrese un número válido de 9 dígitos |

---

### HU-11 | Configurar mis datos de cobro

> **Como** dueño de cancha  
> **Quiero** registrar mi RUC, banco y número de cuenta  
> **Para** recibir el pago de las reservas que hagan los jugadores

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Configuración inicial | El dueño es nuevo y aún no ha puesto sus datos de cobro | Completa RUC, Razón Social, CCI y guarda | El sistema guarda los datos y lo lleva a registrar su primer local |
| CA-02 | Banco detectado automáticamente | El dueño ingresa su número de CCI | Escribe los 20 dígitos del CCI | El sistema reconoce el banco automáticamente y lo selecciona |
| CA-03 | CCI no reconocido | El dueño ingresa un CCI de un banco no soportado | Guarda sin que el sistema reconozca el banco | El sistema le pide que seleccione el banco manualmente |
| CA-04 | RUC inválido | El dueño escribe un RUC que no tiene 11 dígitos | Intenta guardar | El sistema le avisa "El RUC debe tener 11 dígitos" |

---

### HU-12 | Ocultar mis datos financieros

> **Como** dueño de cancha  
> **Quiero** que mis datos bancarios se vean como puntos por defecto  
> **Para** que nadie los vea si dejo mi pantalla abierta

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Datos ocultos al entrar | El dueño abre su perfil | Entra a "Mi Perfil" | Su RUC y CCI se muestran como puntos, no como números visibles |
| CA-02 | Revelar datos | El dueño necesita ver sus números | Presiona "Mostrar datos sensibles" | Los números se vuelven visibles |
| CA-03 | Volver a ocultar | El dueño ya verificó sus datos | Presiona "Ocultar datos sensibles" | Los números vuelven a mostrarse como puntos |

---

### HU-13 | Registrar un local

> **Como** dueño de cancha  
> **Quiero** agregar la dirección de mi local deportivo  
> **Para** que los jugadores sepan dónde queda

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Registro exitoso | El dueño quiere publicar su local | Completa nombre, dirección y distrito y guarda | El sistema registra el local y lo muestra en la lista |
| CA-02 | Sin perfil de cobro | El dueño intenta registrar un local sin haber puesto sus datos financieros | Intenta acceder a "Locales" | El sistema lo redirige a completar sus datos de cobro primero |

---

### HU-14 | Publicar una cancha

> **Como** dueño de cancha  
> **Quiero** agregar una cancha con nombre, fotos y precios  
> **Para** que los jugadores puedan verla y reservarla

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Cancha publicada | El dueño tiene un local registrado | Completa nombre, selecciona local, sube foto, pone precios y guarda | La cancha aparece en "Mis Canchas" y en las búsquedas de los jugadores |
| CA-02 | Sin locales registrados | El dueño quiere crear una cancha pero no ha registrado ningún local | Abre el formulario de nueva cancha | El sistema le recuerda que primero debe registrar un local |
| CA-03 | Foto opcional | El dueño no tiene una foto para la cancha | Guarda la cancha sin foto | La cancha se crea igual y se muestra con una imagen por defecto |

---

### HU-15 | Configurar horarios y precios

> **Como** dueño de cancha  
> **Quiero** definir en qué días y horarios está disponible mi cancha y a qué precio  
> **Para** que los jugadores puedan reservar solo en los horarios que yo dispongo

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Agregar bloque de horario | El dueño quiere que su cancha esté disponible los sábados de 6pm a 10pm | Selecciona "Sábado", horario 18:00-22:00, tarifa "Prime" y agrega | El sistema crea bloques de 1 hora para ese día y horario |
| CA-02 | Guardar cronograma | El dueño configuró todos los horarios de la semana | Presiona "Guardar Cronograma" | Los horarios se guardan y los jugadores ya pueden reservar |
| CA-03 | Quitar un bloque | El dueño ya no quiere tener horarios los lunes | Elimina el bloque del lunes | El sistema elimina ese bloque y los jugadores ya no ven disponibles esos horarios |

---

### HU-16 | Pausar o reactivar una cancha

> **Como** dueño de cancha  
> **Quiero** desactivar temporalmente una cancha sin borrarla  
> **Para** que no la reserven mientras le hago mantenimiento

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Pausar cancha | La cancha está en mantenimiento | Presiona "Pausar Cancha" | La cancha deja de aparecer en las búsquedas de los jugadores |
| CA-02 | Reactivar cancha | El mantenimiento terminó | Presiona "Reactivar Cancha" | La cancha vuelve a estar disponible para reservas |

---

### HU-17 | Ver el resumen del día

> **Como** dueño de cancha  
> **Quiero** ver de un vistazo cuántas reservas tengo hoy, cuánto he ganado y cómo va la ocupación  
> **Para** saber cómo está yendo el día sin tener que revisar todo

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Día con reservas | El dueño tiene partidos agendados para hoy | Entra al panel | Ve tarjetas con: reservas de hoy, ingresos del día, % de ocupación, y la lista de reservas del día |
| CA-02 | Día sin reservas | El dueño no tiene ningún partido hoy | Entra al panel | Las tarjetas muestran 0 y la lista de reservas dice "No hay reservas para hoy" |

---

### HU-18 | Ver mi agenda de reservas

> **Como** dueño de cancha  
> **Quiero** ver un calendario con las reservas de la semana  
> **Para** saber qué horarios están ocupados y cuáles libres

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Vista por día | El dueño quiere ver las reservas de hoy | Abre la Agenda | Ve todos los horarios de todas sus canchas marcados como ocupados o libres |
| CA-02 | Vista semanal | El dueño quiere planificar la semana | Cambia a vista semanal | Ve una tabla con los días y canchas, y el estado de cada horario |
| CA-03 | Bloquear un horario para uso propio | El dueño quiere usar su propia cancha | Presiona "Bloquear" en un horario disponible | Ese horario se marca como bloqueado y los jugadores ya no pueden reservarlo |

---

### HU-19 | Poner una cancha en oferta

> **Como** dueño de cancha  
> **Quiero** marcar algunos horarios con descuento  
> **Para** atraer jugadores en horarios donde casi no reservan

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Crear oferta | El dueño tiene horarios vacíos entre semana | Selecciona los slots, ingresa 30% de descuento y guarda | Los slots se marcan como oferta y aparecen destacados en la página principal |
| CA-02 | Quitar oferta | El dueño ya no quiere mantener el descuento | Presiona "Quitar oferta" en el slot | El slot vuelve a su precio normal |
| CA-03 | Descuento fuera de rango | El dueño ingresa 70% de descuento | Intenta guardar | El sistema le avisa que el descuento máximo es 50% |

---

### HU-20 | Marcar que un jugador no asistió

> **Como** dueño de cancha  
> **Quiero** marcar una reserva como "no asistió" cuando el jugador no llega  
> **Para** liberar el horario y que quede registro de la inasistencia

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Marcar No Show | Pasó la hora de la reserva y el jugador no llegó | Presiona "No asistió" en el slot reservado | El slot se libera y queda registrado que el jugador no asistió |

---

### HU-21 | Ver detalle de una reserva

> **Como** dueño de cancha  
> **Quiero** ver los datos del jugador que reservó, el método de pago y el comprobante  
> **Para** saber quién viene y tener el registro del pago

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ver datos de la reserva | El dueño quiere saber quién va a venir | Presiona "Ver más" en una reserva | Ve el nombre del jugador, su teléfono, horario, monto y comprobante de pago |

---

### HU-22 | Recibir aviso de nueva reserva

> **Como** dueño de cancha  
> **Quiero** que me llegue una notificación en el panel cuando alguien reserve  
> **Para** enterarme al instante sin tener que estar recargando la página

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Notificación en pantalla | El dueño está en el panel y un jugador reserva | Un jugador hace una reserva | El sistema le muestra un aviso "Nueva reserva de [nombre] en [cancha]" y actualiza los datos |

---

### HU-23 | Ver mis ingresos

> **Como** dueño de cancha  
> **Quiero** consultar cuánto he ganado en un período de tiempo  
> **Para** saber si el negocio está yendo bien

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Consulta con resultados | El dueño quiere ver sus ganancias del mes | Selecciona un rango de fechas y busca | Ve el total de ingresos, cantidad de reservas y el promedio por reserva |
| CA-02 | Consulta sin resultados | El dueño busca en un período donde no tuvo reservas | Selecciona fechas y busca | Ve "No se encontraron ingresos en este período" |

---

### HU-24 | Ver mi saldo pendiente

> **Como** dueño de cancha  
> **Quiero** saber cuánto dinero tengo acumulado sin cobrar  
> **Para** tener una idea de lo que me deben pagar

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Saldo disponible | El dueño tiene reservas confirmadas no cobradas aún | Abre la sección de saldo | Ve el monto total pendiente con el detalle de cada reserva |

---

### HU-25 | Ver pagos recibidos

> **Como** dueño de cancha  
> **Quiero** ver el historial de pagos que ya me depositaron  
> **Para** llevar un control de lo que he cobrado

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Liquidaciones previas | El dueño tiene pagos anteriores registrados | Abre el reporte de liquidaciones | Ve una lista con período, monto y estado de cada pago recibido |
| CA-02 | Sin pagos previos | El dueño es nuevo y aún no ha recibido ningún pago | Abre el reporte | Ve "Aún no tienes liquidaciones" |

---

### HU-26 | Ver qué tan ocupada está mi cancha

> **Como** dueño de cancha  
> **Quiero** ver el porcentaje de ocupación de mis canchas por mes  
> **Para** identificar en qué meses o días reservan más

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Ocupación del mes | El dueño quiere saber cómo le fue en enero | Selecciona el mes y consulta | Ve una tabla con cada cancha, cuántos slots se ocuparon vs disponibles y el % de ocupación |
| CA-02 | Mes sin datos | El dueño consulta un mes futuro | Busca | Ve "No hay datos para este período" |

---

### HU-27 | Buscar reservas antiguas

> **Como** dueño de cancha  
> **Quiero** buscar reservas pasadas por fecha o por estado  
> **Para** revisar algún problema o reclamo de un jugador

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Búsqueda con resultados | El dueño necesita encontrar una reserva específica | Selecciona fechas y estado, presiona "Buscar" | Ve una lista con los datos de las reservas que coinciden |
| CA-02 | Búsqueda sin resultados | El dueño busca en un período sin reservas | Busca | Ve "No se encontraron reservas" |

---

### HU-28 | Onboarding: dar de alta mi negocio

> **Como** nuevo dueño que acaba de registrarse  
> **Quiero** que el sistema me guíe paso a paso para completar mis datos, registrar mi local y publicar mi cancha  
> **Para** empezar a recibir reservas lo antes posible

| Código | Escenario | Contexto | Acción | Resultado esperado |
|--------|-----------|----------|--------|--------------------|
| CA-01 | Flujo completo de onboarding | El dueño se registró y quiere activar su negocio | Sigue los pasos: completa perfil financiero → registra local → configura horarios | El sistema lo guía en cada paso y al final su cancha ya está publicada |
| CA-02 | Saltar el onboarding | El dueño prefiere configurar todo después | Cierra la guía o navega a otra sección | El sistema recuerda qué pasos le faltan y se los muestra pendientes |

---

## Resumen

| Sección | Historias | Escenarios (CA) |
|---------|-----------|-----------------|
| Compartidas | HU-01 a HU-06 | 23 |
| Jugador | HU-07 a HU-09 | 14 |
| Dueño | HU-10 a HU-28 | 31 |
| **Total** | **28 HU** | **68 CA** |
