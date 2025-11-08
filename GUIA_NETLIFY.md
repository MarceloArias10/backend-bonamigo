# 🚀 Guía Rápida: Subir a Netlify

## ⚠️ IMPORTANTE: Tu proyecto tiene Backend Node.js

Netlify es para sitios estáticos. Tu proyecto necesita **2 servicios separados**:
1. **Netlify** → Frontend (HTML, CSS, JS)
2. **Render/Railway** → Backend (Node.js + Base de datos)

---

## 📋 PASO 1: Desplegar Backend en Render (GRATIS)

### 1. Crear cuenta en Render
- Ve a [render.com](https://render.com)
- Crea una cuenta (gratis con GitHub/Google)

### 2. Crear Web Service
1. Click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub (o sube los archivos)
3. Configuración:
   - **Name:** `bonamigo-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`
4. Click **"Create Web Service"**
5. Espera a que se despliegue (5-10 minutos)
6. **Copia la URL** que te da (ej: `https://bonamigo-backend.onrender.com`)

### 3. Instalar dependencia CORS
En tu proyecto local, ejecuta:
```bash
npm install cors
```

Ya está agregado en `package.json`, solo necesitas ejecutar `npm install`.

---

## 📋 PASO 2: Configurar Frontend para Netlify

### 1. Actualizar URL del Backend

**Opción A: Variable de entorno (Recomendado)**
1. En Netlify, ve a: **Site settings** → **Environment variables**
2. Agrega:
   - **Key:** `API_BASE_URL`
   - **Value:** `https://tu-backend.onrender.com` (la URL que copiaste)

**Opción B: Editar archivo directamente**
Edita `js/config.js` y cambia:
```javascript
const API_BASE_URL = 'https://tu-backend.onrender.com'; // Tu URL aquí
```

### 2. Subir a Netlify

**Opción A: Arrastrar y soltar (Más fácil)**
1. Ve a [netlify.com](https://netlify.com) y crea cuenta
2. Arrastra toda la carpeta del proyecto (sin `node_modules/`)
3. Netlify detectará automáticamente los archivos
4. Click **"Deploy site"**

**Opción B: Desde Git (Recomendado)**
1. Sube tu código a GitHub
2. En Netlify: **"Add new site"** → **"Import an existing project"**
3. Conecta tu repositorio
4. Configuración:
   - **Build command:** (dejar vacío)
   - **Publish directory:** `/` (raíz)
5. Click **"Deploy site"**

---

## ✅ Checklist Final

- [ ] Backend desplegado en Render y funcionando
- [ ] URL del backend copiada
- [ ] Variable `API_BASE_URL` configurada en Netlify (o editada en `config.js`)
- [ ] Frontend subido a Netlify
- [ ] Probar login en el sitio de Netlify

---

## 🔧 Si algo no funciona

**Error: CORS bloqueado**
- Verifica que `cors` esté instalado en el backend
- Verifica que el backend esté corriendo

**Error: No se puede conectar al API**
- Verifica que la URL del backend sea correcta
- Verifica que el backend esté desplegado y funcionando
- Revisa la consola del navegador (F12) para ver errores

**Error: Sesión no persiste**
- Verifica que uses `credentials: 'include'` en las llamadas (ya está configurado)

---

## 📝 Archivos Importantes

- `js/config.js` - Configuración de URL del backend
- `server.js` - Backend (va a Render)
- `netlify.toml` - Configuración de Netlify
- `.gitignore` - Archivos a ignorar

---

## 🎯 Resumen Rápido

1. **Backend → Render:** Sube `server.js`, `package.json` y archivos del backend
2. **Frontend → Netlify:** Sube HTML, CSS, JS, imágenes (sin `node_modules/`, `server.js`)
3. **Configurar URL:** Agrega la URL de Render en Netlify (variable `API_BASE_URL`)

¡Listo! Tu sitio estará funcionando en Netlify. 🎉

