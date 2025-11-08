# Guía de Despliegue en Netlify - Bonamigo

## ⚠️ IMPORTANTE: Este proyecto tiene Backend Node.js

Tu proyecto tiene un **servidor Node.js con Express** y una **base de datos SQLite**. Netlify es principalmente para sitios estáticos, pero hay soluciones.

## 🎯 Opciones de Despliegue

### **Opción 1: Netlify + Servicio Backend Separado (RECOMENDADO)**

Esta es la mejor opción: usar Netlify para el frontend y otro servicio para el backend.

#### Paso 1: Desplegar Backend en Render/Railway/Heroku

**Render (Gratis y fácil):**
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub/GitLab
4. Configuración:
   - **Name:** bonamigo-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Agrega variable de entorno: `PORT=10000` (Render asigna un puerto automático)
6. Click "Create Web Service"
7. Copia la URL que te da (ej: `https://bonamigo-backend.onrender.com`)

**Railway (Alternativa):**
1. Ve a [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Selecciona tu repositorio
4. Railway detecta automáticamente Node.js
5. Copia la URL generada

#### Paso 2: Actualizar URLs en el Frontend

Necesitas cambiar todas las llamadas a `/api/` para que apunten a tu backend en Render/Railway.

**Crear archivo `js/config.js`:**
```javascript
// Configuración de API
const API_BASE_URL = 'https://tu-backend.onrender.com'; // Cambia esto por tu URL

// Función helper para hacer requests
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    credentials: 'include', // Para mantener las cookies de sesión
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
}
```

**Actualizar `server.js` para CORS:**
```javascript
// Agregar al inicio del archivo, después de const app = express();
const cors = require('cors');
app.use(cors({
  origin: ['https://tu-sitio.netlify.app', 'http://localhost:3000'],
  credentials: true
}));
```

#### Paso 3: Desplegar Frontend en Netlify

1. **Preparar archivos:**
   - Asegúrate de tener todos los archivos HTML, CSS, JS, e imágenes
   - NO subas `node_modules/`, `server.js`, `package.json` (solo el frontend)

2. **Opción A: Arrastrar y soltar (Más fácil):**
   - Ve a [netlify.com](https://netlify.com) y crea una cuenta
   - Arrastra la carpeta completa (sin `node_modules/` y `server.js`) a Netlify
   - Netlify detectará automáticamente los archivos estáticos

3. **Opción B: Desde Git (Recomendado):**
   - Sube tu código a GitHub
   - En Netlify: "Add new site" → "Import an existing project"
   - Conecta tu repositorio
   - Configuración:
     - **Build command:** (dejar vacío, es estático)
     - **Publish directory:** `/` (raíz del proyecto)
   - Click "Deploy site"

4. **Configurar variables de entorno (opcional):**
   - En Netlify: Site settings → Environment variables
   - Agrega: `API_BASE_URL` = `https://tu-backend.onrender.com`

---

### **Opción 2: Netlify Functions (Avanzado)**

Convertir el backend a funciones serverless de Netlify. Requiere más trabajo pero todo queda en un solo lugar.

**Pasos:**
1. Crear carpeta `netlify/functions/`
2. Convertir cada ruta de Express a una función Lambda
3. Configurar `netlify.toml`
4. Desplegar todo junto

**Ventajas:** Todo en un lugar
**Desventajas:** Más complejo, límites de tiempo de ejecución

---

### **Opción 3: Solo Frontend en Netlify (Sin Admin)**

Si solo quieres mostrar el catálogo público sin panel administrativo:
- Sube solo los archivos HTML, CSS, JS e imágenes
- El catálogo funcionará pero sin la parte administrativa

---

## 📋 Checklist para Despliegue

### Backend (Render/Railway):
- [ ] Crear cuenta en Render/Railway
- [ ] Conectar repositorio o subir código
- [ ] Configurar variables de entorno
- [ ] Copiar URL del backend
- [ ] Instalar `cors` en el backend: `npm install cors`
- [ ] Agregar configuración CORS en `server.js`
- [ ] Verificar que el backend funciona

### Frontend (Netlify):
- [ ] Crear cuenta en Netlify
- [ ] Crear archivo `js/config.js` con la URL del backend
- [ ] Actualizar todas las llamadas fetch para usar `apiRequest()`
- [ ] Subir archivos a Netlify
- [ ] Configurar dominio (opcional)

---

## 🔧 Configuración CORS en server.js

Agrega esto al inicio de `server.js`:

```javascript
const cors = require('cors');

// Configurar CORS para permitir requests desde Netlify
app.use(cors({
  origin: [
    'https://tu-sitio.netlify.app',
    'http://localhost:3000',
    'http://localhost:8888' // Netlify dev local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Luego instala cors:
```bash
npm install cors
```

---

## 📝 Archivo netlify.toml (Opcional)

Si usas Git, crea `netlify.toml` en la raíz:

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/api/*"
  to = "https://tu-backend.onrender.com/api/:splat"
  status = 200
  force = true
```

Esto redirige automáticamente las llamadas `/api/*` a tu backend.

---

## 🚀 Pasos Rápidos (Resumen)

1. **Backend:**
   ```bash
   # En Render/Railway, conecta tu repo o sube los archivos
   # Asegúrate de tener package.json y server.js
   ```

2. **Frontend:**
   ```bash
   # Crea js/config.js con la URL de tu backend
   # Sube a Netlify (arrastrar o Git)
   ```

3. **Actualizar URLs:**
   - Cambia todas las llamadas `/api/` para usar la URL completa del backend
   - O usa el archivo `config.js` que creaste

---

## ⚠️ Problemas Comunes

**Error: CORS bloqueado**
- Solución: Agregar configuración CORS en `server.js`

**Error: Sesión no persiste**
- Solución: Usar `credentials: 'include'` en fetch y configurar CORS con `credentials: true`

**Error: Base de datos no funciona**
- Solución: En Render/Railway, la base de datos SQLite se crea automáticamente. Asegúrate de que los permisos de escritura estén habilitados.

**Error: Puerto no encontrado**
- Solución: Usar `process.env.PORT || 3000` en server.js (ya debería estar)

---

## 💡 Recomendación Final

**Usa Render para el backend** (gratis, fácil) + **Netlify para el frontend** (gratis, rápido).

¿Necesitas ayuda con algún paso específico?

