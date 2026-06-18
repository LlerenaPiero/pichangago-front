
export const setSessionCookie = (user) => {
  const cookieName = "pichangago_session";
  const cookieValue = encodeURIComponent(JSON.stringify(user));
  // La cookie expirará en 1 día
  const maxAge = 24 * 60 * 60; 
  
  // 🛡️ Atributos OWASP: SameSite=Strict (evita CSRF) y Path=/ (disponible en toda la app)
  document.cookie = `${cookieName}=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Strict`;
};


export const getSessionCookie = () => {
  const nameEQ = "pichangago_session=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(decodeURIComponent(c.substring(nameEQ.length)));
      } catch {
        return null;
      }
    }
  }
  return null;
};


export const eraseSessionCookie = () => {
  document.cookie = "pichangago_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict";
};