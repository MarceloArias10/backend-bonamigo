# Guía de Despliegue - Bonamigo

## ✅ ¿Funcionará en un servidor?

**SÍ**, el proyecto está listo para subirse a un servidor, pero necesitas seguir estos pasos:

## 📋 Requisitos del Servidor

1. **Node.js** (versión 14 o superior)
2. **npm** (incluido con Node.js)
3. **Acceso SSH** o panel de control para subir archivos y ejecutar comandos

## 🚀 Pasos para Desplegar

### 1. Subir archivos al servidor

Sube TODOS los archivos del proyecto a tu servidor (excepto `node_modules` y `.git` si los tienes).

### 2. Instalar dependencias

En el servidor, ejecuta:
```bash
npm install
```

### 3. Configurar el puerto (opcional)

Si necesitas cambiar el puerto, edita `server.js` y modifica:
```javascript
const PORT = process.env.PORT || 3000;
```

O configura una variable de entorno `PORT` en tu servidor.

### 4. Iniciar el servidor

#### Opción A: Ejecutar directamente
```bash
node server.js
```

#### Opción B: Usar PM2 (recomendado para producción)
```bash
npm install -g pm2
pm2 start server.js --name bonamigo
pm2 save
pm2 startup
```

#### Opción C: Usar systemd (Linux)
Crea un archivo `/etc/systemd/system/bonamigo.service`:
```ini
[Unit]
Description=Bonamigo Web Server
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/ruta/a/tu/proyecto
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
sudo systemctl enable bonamigo
sudo systemctl start bonamigo
```

### 5. Configurar dominio (opcional)

Si tienes un dominio, configura un proxy reverso con Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ⚠️ Importante

1. **Base de datos**: La base de datos SQLite se creará automáticamente en `bonamigo.db` cuando inicies el servidor.

2. **Carpeta de imágenes**: Asegúrate de que la carpeta `img/productos/` tenga permisos de escritura:
   ```bash
   chmod -R 755 img/productos/
   ```

3. **Variables de entorno**: Para producción, considera:
   - Cambiar el `secret` de sesión en `server.js`
   - Configurar HTTPS
   - Cambiar las contraseñas por defecto de los usuarios

4. **Firewall**: Asegúrate de que el puerto 3000 (o el que uses) esté abierto.

## 🔒 Seguridad para Producción

1. **Cambiar secret de sesión**:
   ```javascript
   secret: process.env.SESSION_SECRET || 'tu-secret-super-seguro-aqui'
   ```

2. **HTTPS**: Configura SSL/TLS con Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com
   ```

3. **Cambiar contraseñas**: Los usuarios por defecto tienen password `admin123`. Cámbialos desde el panel administrativo.

## 📝 Estructura de Archivos Necesarios

```
bonamigo/
├── server.js          # Servidor Node.js
├── package.json       # Dependencias
├── bonamigo.db        # Base de datos (se crea automáticamente)
├── admin/             # Panel administrativo
├── css/               # Estilos
├── js/                # JavaScript
├── img/               # Imágenes
└── uploads/           # Imágenes subidas (se crea automáticamente)
```

## 🆘 Solución de Problemas

- **Error: Puerto en uso**: Cambia el puerto en `server.js` o detén el proceso que lo usa
- **Error: Permisos**: Verifica permisos de escritura en carpetas `img/productos/` y `uploads/`
- **Error: Módulos no encontrados**: Ejecuta `npm install` nuevamente

## 📞 Soporte

Si tienes problemas, verifica:
1. Que Node.js esté instalado: `node --version`
2. Que las dependencias estén instaladas: `npm list`
3. Los logs del servidor para ver errores específicos

