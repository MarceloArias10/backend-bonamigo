# 🚀 Guía Completa: Desplegar Backend en Render

## 📋 ¿Qué es Render?

Render es un servicio gratuito que te permite subir tu aplicación Node.js (backend) y que esté disponible en internet 24/7.

---

## ✅ PASO 1: Preparar tu Proyecto

### 1.1 Verificar que tienes estos archivos:
- ✅ `server.js` (tu servidor)
- ✅ `package.json` (dependencias)
- ✅ Todos los archivos del proyecto

### 1.2 Instalar CORS (si no lo hiciste)
Abre PowerShell/CMD en la carpeta del proyecto y ejecuta:
```bash
npm install cors
```

Esto agregará `cors` a tu `package.json` automáticamente.

---

## ✅ PASO 2: Crear Cuenta en Render

### 2.1 Ir a Render
1. Abre tu navegador
2. Ve a: **https://render.com**
3. Click en **"Get Started for Free"** o **"Sign Up"**

### 2.2 Elegir método de registro
Puedes registrarte con:
- **GitHub** (recomendado - más fácil)
- **Google**
- **Email** (crear cuenta nueva)

**Si usas GitHub:**
- Click en "Sign up with GitHub"
- Autoriza a Render a acceder a tu cuenta
- Listo ✅

**Si usas Email:**
- Ingresa tu email
- Crea una contraseña
- Confirma tu email
- Listo ✅

---

## ✅ PASO 3: Subir tu Código a GitHub (Recomendado)

### 3.1 ¿Por qué GitHub?
Render puede conectarse automáticamente a GitHub y actualizar tu sitio cada vez que subas cambios.

### 3.2 Si NO tienes GitHub:
**Opción A: Crear repositorio en GitHub**
1. Ve a **https://github.com**
2. Crea cuenta (si no tienes)
3. Click en **"New repository"** (botón verde)
4. Nombre: `bonamigo-backend` (o el que quieras)
5. Click **"Create repository"**
6. Sigue las instrucciones para subir tu código

**Opción B: Subir archivos directamente a Render**
- Puedes subir los archivos manualmente (ver Paso 4)

---

## ✅ PASO 4: Crear Web Service en Render

### 4.1 Acceder al Dashboard
1. Una vez en Render, verás tu **Dashboard**
2. Click en el botón **"New +"** (arriba a la derecha)
3. Selecciona **"Web Service"**

### 4.2 Conectar Repositorio

**Si usas GitHub:**
1. Render te mostrará tus repositorios
2. Busca `bonamigo-backend` (o el nombre que le pusiste)
3. Click en **"Connect"**
4. Si no aparece, click en **"Configure account"** y autoriza

**Si NO usas GitHub (Subir manualmente):**
1. Click en **"Public Git repository"**
2. Ingresa la URL de tu repositorio (si tienes)
3. O selecciona **"Manual Deploy"** para subir archivos después

---

## ✅ PASO 5: Configurar el Servicio

### 5.1 Información Básica

Render te pedirá llenar estos campos:

```
Name: bonamigo-backend
     ↑
     (Puede ser cualquier nombre, ej: "bonamigo-api")
```

```
Region: Oregon (US West)
        ↑
        (Elige el más cercano a ti, Oregon es bueno)
```

```
Branch: main
        ↑
        (O "master" si tu repo usa master)
```

```
Root Directory: (dejar vacío)
                ↑
                (Solo si tu código está en una subcarpeta)
```

### 5.2 Configuración de Build y Start

**Build Command:**
```
npm install
```
↑ Esto instala todas las dependencias

**Start Command:**
```
node server.js
```
↑ Esto inicia tu servidor

### 5.3 Plan (Gratis)

```
Plan: Free
      ↑
      (El plan gratuito es suficiente para empezar)
```

**Nota:** El plan gratuito tiene algunas limitaciones:
- Se "duerme" después de 15 minutos sin uso
- Tarda unos segundos en "despertar" cuando alguien lo usa
- Es perfecto para proyectos pequeños

---

## ✅ PASO 6: Variables de Entorno (Opcional)

### 6.1 ¿Qué son?
Son configuraciones secretas que tu aplicación necesita.

### 6.2 Para tu proyecto:
Por ahora **NO necesitas agregar variables de entorno** porque:
- El puerto se configura automáticamente
- La base de datos se crea sola
- El secret de sesión ya está en el código

**Más adelante puedes agregar:**
- `SESSION_SECRET` - Para mayor seguridad
- `PORT` - Si quieres especificar un puerto

### 6.3 Cómo agregarlas (si las necesitas):
1. En la configuración del servicio
2. Busca **"Environment"** o **"Environment Variables"**
3. Click **"Add Environment Variable"**
4. Agrega Key y Value
5. Click **"Save Changes"**

---

## ✅ PASO 7: Crear el Servicio

### 7.1 Revisar Configuración
Antes de crear, verifica que todo esté así:

```
Name: bonamigo-backend
Region: Oregon (US West)
Branch: main
Build Command: npm install
Start Command: node server.js
Plan: Free
```

### 7.2 Crear
1. Click en el botón **"Create Web Service"** (abajo)
2. Render comenzará a construir tu aplicación
3. Verás un log en tiempo real del proceso

---

## ✅ PASO 8: Esperar el Despliegue

### 8.1 Proceso Automático
Render hará lo siguiente (automáticamente):

1. **Clonar repositorio** (si usas GitHub)
2. **Instalar dependencias** (`npm install`)
3. **Iniciar servidor** (`node server.js`)
4. **Verificar que funcione**

### 8.2 Tiempo de Espera
- **Primera vez:** 5-10 minutos
- **Actualizaciones:** 2-5 minutos

### 8.3 Ver el Progreso
Verás un log en tiempo real:
```
==> Cloning from https://github.com/tu-usuario/bonamigo-backend
==> Using Node version 18.x
==> Installing dependencies
   npm install
==> Building
==> Starting service
   node server.js
✓ Your service is live!
```

---

## ✅ PASO 9: Obtener la URL

### 9.1 URL Automática
Una vez desplegado, Render te dará una URL automática:

```
https://bonamigo-backend.onrender.com
     ↑
     (El nombre puede variar según lo que pusiste)
```

### 9.2 Dónde Encontrarla
1. En el Dashboard de Render
2. En la parte superior de tu servicio
3. Verás: **"Your service is live at: [URL]"**

### 9.3 Copiar la URL
1. Click en la URL
2. O copia el texto completo
3. **Guárdala** - la necesitarás para Netlify

---

## ✅ PASO 10: Verificar que Funciona

### 10.1 Probar la URL
1. Abre la URL en tu navegador
2. Deberías ver algo como:
   - Página en blanco (normal, no hay página de inicio)
   - O un error 404 (también normal)

### 10.2 Probar la API
Abre en tu navegador:
```
https://tu-backend.onrender.com/api/productos
```

**Deberías ver:**
- Un JSON con productos (si hay productos)
- O un array vacío `[]` (si no hay productos)

**Si ves un error:**
- Revisa los logs en Render
- Verifica que `server.js` esté correcto

### 10.3 Ver Logs
1. En Render, ve a tu servicio
2. Click en la pestaña **"Logs"**
3. Verás todos los mensajes del servidor
4. Si hay errores, aparecerán aquí

---

## ✅ PASO 11: Configurar para Netlify

### 11.1 Copiar URL
Ya tienes la URL de tu backend, por ejemplo:
```
https://bonamigo-backend.onrender.com
```

### 11.2 Usar en Netlify
Cuando despliegues en Netlify, agrega esta URL como variable de entorno:
- **Key:** `API_BASE_URL`
- **Value:** `https://bonamigo-backend.onrender.com`

---

## 🔧 Solución de Problemas Comunes

### ❌ Error: "Build failed"
**Causa:** Falta alguna dependencia o hay un error en el código

**Solución:**
1. Revisa los logs en Render
2. Verifica que `package.json` tenga todas las dependencias
3. Prueba localmente primero: `npm install` y `node server.js`

### ❌ Error: "Service crashed"
**Causa:** El servidor se detuvo por un error

**Solución:**
1. Ve a **"Logs"** en Render
2. Lee el último error
3. Corrige el problema en tu código
4. Render se actualizará automáticamente (si usas GitHub)

### ❌ Error: "Port already in use"
**Causa:** Conflicto de puerto

**Solución:**
- Render asigna el puerto automáticamente
- Asegúrate de usar `process.env.PORT || 3000` en `server.js`
- Ya debería estar así ✅

### ❌ El servicio está "sleeping"
**Causa:** Plan gratuito - se duerme después de 15 min sin uso

**Solución:**
- Es normal en el plan gratuito
- La primera petición tarda unos segundos en "despertar"
- Las siguientes son rápidas
- Para evitar esto, necesitas el plan pago ($7/mes)

### ❌ No se conecta a la base de datos
**Causa:** La base de datos SQLite necesita permisos de escritura

**Solución:**
- Render permite escribir archivos
- La base de datos se crea automáticamente
- Si hay problemas, revisa los logs

---

## 📝 Checklist Final

Antes de considerar que está listo, verifica:

- [ ] Cuenta en Render creada
- [ ] Código subido a GitHub (o listo para subir)
- [ ] Web Service creado en Render
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Servicio desplegado exitosamente
- [ ] URL obtenida y guardada
- [ ] API responde correctamente (`/api/productos`)
- [ ] Logs sin errores críticos

---

## 🎯 Resumen Rápido

1. **Crear cuenta** en render.com
2. **Click "New +"** → **"Web Service"**
3. **Conectar repositorio** (GitHub) o subir archivos
4. **Configurar:**
   - Build: `npm install`
   - Start: `node server.js`
5. **Click "Create Web Service"**
6. **Esperar 5-10 minutos**
7. **Copiar URL** que te da Render
8. **Usar esa URL** en Netlify como `API_BASE_URL`

---

## 💡 Tips Importantes

1. **GitHub es más fácil:** Si conectas GitHub, cada vez que subas cambios, Render se actualiza automáticamente

2. **Logs son tu amigo:** Siempre revisa los logs si algo no funciona

3. **Primera vez es lenta:** El primer despliegue tarda más, los siguientes son más rápidos

4. **Plan gratuito se duerme:** Es normal que tarde unos segundos en responder la primera vez después de estar dormido

5. **URL puede cambiar:** Si eliminas y recreas el servicio, la URL cambiará

---

## 🆘 ¿Necesitas Ayuda?

Si tienes algún problema:
1. Revisa los **Logs** en Render
2. Verifica que tu código funcione **localmente** primero
3. Asegúrate de que todas las **dependencias** estén en `package.json`
4. Revisa que `server.js` use `process.env.PORT || 3000`

---

¡Con esto deberías poder desplegar tu backend en Render sin problemas! 🚀

