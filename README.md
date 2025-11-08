# Bonamigo - Sistema Administrativo

Sistema completo de gestión para Bonamigo, incluyendo panel administrativo y sitio web público.

## 🚀 Características

- **Panel Administrativo Completo**: Gestión de productos, categorías, ventas y compras
- **Autenticación Segura**: Sistema de login con sesiones persistentes
- **Productos Destacados**: Sección en el sitio público para mostrar productos destacados
- **Base de Datos SQLite**: Almacenamiento local sin necesidad de servidor de base de datos
- **API REST**: Backend completo con Node.js y Express
- **Diseño Responsivo**: Funciona perfectamente en escritorio y móviles

## 📋 Requisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Iniciar el servidor:**
```bash
npm start
```

O para desarrollo con auto-reload:
```bash
npm run dev
```

3. **Acceder al sitio:**
- Sitio público: http://localhost:3000
- Panel administrativo: http://localhost:3000/admin/login.html

## 🔐 Credenciales por Defecto

- **Usuario:** admin
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer inicio de sesión.

## 📁 Estructura del Proyecto

```
bonamigo/
├── admin/              # Panel administrativo
│   ├── login.html      # Página de login
│   ├── dashboard.html  # Dashboard principal
│   ├── productos.html  # Gestión de productos
│   ├── categorias.html # Gestión de categorías
│   ├── ventas.html     # Registro de ventas
│   ├── compras.html    # Registro de compras
│   └── estadisticas.html # Estadísticas y alertas
├── css/
│   ├── styles.css      # Estilos del sitio público
│   └── admin.css       # Estilos del panel administrativo
├── js/
│   ├── script.js       # JavaScript del sitio público
│   └── admin.js        # JavaScript común del panel
├── img/                # Imágenes y recursos
├── server.js           # Servidor Node.js
├── package.json        # Dependencias del proyecto
└── bonamigo.db         # Base de datos SQLite (se crea automáticamente)
```

## 🎯 Funcionalidades del Panel Administrativo

### 1. Dashboard
- Resumen de estadísticas generales
- Alertas de stock bajo y sin stock
- Métricas de ventas y compras del mes

### 2. Productos
- Crear, editar y eliminar productos
- Subir múltiples imágenes por producto
- Asignar colores disponibles
- Marcar productos como destacados
- Control de stock

### 3. Categorías
- Crear, editar y eliminar categorías
- Organizar productos por categorías

### 4. Ventas
- Registrar ventas realizadas
- Asociar productos y cantidades
- Actualización automática de stock

### 5. Compras
- Registrar compras a mayoristas/proveedores
- Ingreso de stock automático
- Control de proveedores

### 6. Estadísticas
- Métricas de stock
- Alertas de productos con poco o sin stock
- Estadísticas de ventas y compras

## 🌐 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/session` - Verificar sesión

### Productos
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos?destacados=true` - Productos destacados
- `GET /api/productos/:id` - Obtener un producto
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Registrar venta

### Compras
- `GET /api/compras` - Listar compras
- `POST /api/compras` - Registrar compra

### Estadísticas
- `GET /api/estadisticas` - Obtener estadísticas

## 🎨 Paleta de Colores

El sistema mantiene la paleta de colores estilo MercadoLibre:
- Azul principal: `#3483fa`
- Amarillo: `#fff159`
- Grises y blancos para fondos
- Colores de estado (éxito, error, advertencia)

## 📱 Responsive Design

El panel administrativo y el sitio público son completamente responsivos y funcionan perfectamente en:
- Escritorio
- Tablets
- Móviles

## 🔒 Seguridad

- Autenticación con sesiones
- Contraseñas hasheadas con bcrypt
- Protección de rutas administrativas
- Validación de archivos subidos

## 📝 Notas

- La base de datos SQLite se crea automáticamente al iniciar el servidor
- Las imágenes se guardan en `img/productos/`
- El usuario administrador se crea automáticamente si no existe
- Las categorías por defecto se crean automáticamente

## 🚀 Despliegue

Para desplegar en producción:

1. Cambiar `secure: false` a `secure: true` en `server.js` (si usas HTTPS)
2. Cambiar la clave secreta de sesión en `server.js`
3. Cambiar la contraseña del administrador por defecto
4. Configurar variables de entorno si es necesario
5. Usar un proceso manager como PM2 para mantener el servidor corriendo

## 📞 Soporte

Para cualquier consulta o problema, revisa la documentación o contacta al equipo de desarrollo.

---

Desarrollado con ❤️ para Bonamigo


