/**
 * Guarda la sesión del usuario en una cookie segura.
 * (En producción real, el backend envía esto cifrado mediante el header Set-Cookie con HttpOnly)
 */
export const setSessionCookie = (user) => {
  const cookieName = "pichangago_session";
  const cookieValue = encodeURIComponent(JSON.stringify(user));
  // La cookie expirará en 1 día
  const maxAge = 24 * 60 * 60; 
  
  // 🛡️ Atributos OWASP: SameSite=Strict (evita CSRF) y Path=/ (disponible en toda la app)
  document.cookie = `${cookieName}=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Strict`;
};

/**
 * Lee la cookie de sesión y la transforma de vuelta a un objeto JS
 */
export const getSessionCookie = () => {
  const nameEQ = "pichangago_session=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length)));
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

/**
 * Destruye la cookie al cerrar sesión
 */
export const eraseSessionCookie = () => {
  document.cookie = "pichangago_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
};