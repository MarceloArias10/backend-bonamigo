// Configuración de API
// Para producción: Cambia esta URL por la URL de tu backend en Render/Railway/Heroku
// Ejemplo: 'https://bonamigo-backend.onrender.com'
const API_BASE_URL = window.API_BASE_URL || '';

// Función helper para hacer requests a la API
// Si API_BASE_URL está configurado, usa esa URL, sino usa la ruta relativa (modo local)
async function apiRequest(endpoint, options = {}) {
  let url;
  
  if (endpoint.startsWith('http')) {
    // URL completa, usar tal cual
    url = endpoint;
  } else if (API_BASE_URL) {
    // Producción: usar URL del backend
    url = `${API_BASE_URL}${endpoint}`;
  } else {
    // Desarrollo local: usar ruta relativa
    url = endpoint;
  }
  
  return fetch(url, {
    ...options,
    credentials: 'include', // Para mantener las cookies de sesión
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}

// Exportar para uso global
window.apiRequest = apiRequest;
window.API_BASE_URL = API_BASE_URL;

