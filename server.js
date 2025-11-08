const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir requests desde Netlify y localhost
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (Postman, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8888',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8888'
    ];
    
    // Permitir cualquier dominio de Netlify
    if (origin.includes('netlify.app') || origin.includes('netlify.com')) {
      return callback(null, true);
    }
    
    // Permitir orígenes en la lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos por ahora (cambiar en producción)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Configuración de sesiones
app.use(session({
  secret: 'bonamigo-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'img/productos/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'producto-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Inicializar base de datos
const db = new sqlite3.Database('bonamigo.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    initDatabase();
  }
});

// Inicializar tablas
function initDatabase() {
  // Tabla de usuarios (administradores)
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de categorías
  db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, () => {
    // Insertar categorías por defecto si no existen
    db.get("SELECT COUNT(*) as count FROM categorias", (err, row) => {
      if (row.count === 0) {
        const categoriasDefault = [
          ['Accesorios', 'Collares, pulseras y más'],
          ['Camping', 'Productos para camping'],
          ['Generador', 'Generadores eléctricos'],
          ['Electro', 'Electrodomésticos'],
          ['Bici', 'Bicicletas y accesorios'],
          ['Ropa', 'Remeras y prendas originales'],
          ['Decoración', 'Velas y objetos de diseño']
        ];
        const stmt = db.prepare("INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)");
        categoriasDefault.forEach(cat => stmt.run(cat));
        stmt.finalize();
      }
    });
  });

  // Tabla de productos
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio REAL NOT NULL,
    categoria_id INTEGER,
    stock INTEGER DEFAULT 0,
    destacado INTEGER DEFAULT 0,
    disponible INTEGER DEFAULT 1,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )`);

  // Tabla de colores de productos
  db.run(`CREATE TABLE IF NOT EXISTS producto_colores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    color TEXT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
  )`);

  // Tabla de imágenes de productos
  db.run(`CREATE TABLE IF NOT EXISTS producto_imagenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    color TEXT,
    imagen_path TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
  )`);

  // Tabla de ventas
  db.run(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total REAL NOT NULL,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de items de venta
  db.run(`CREATE TABLE IF NOT EXISTS venta_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    color TEXT,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  // Tabla de compras (mayorista)
  db.run(`CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    proveedor TEXT,
    total REAL NOT NULL,
    notas TEXT,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de items de compra
  db.run(`CREATE TABLE IF NOT EXISTS compra_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    color TEXT,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  // Crear usuarios administradores por defecto (verificar cada uno individualmente)
  const usuarios = [
    { usuario: 'admin', password: 'admin123' },
    { usuario: 'admin-marcelo', password: 'admin123' },
    { usuario: 'admin-franco', password: 'admin123' },
    { usuario: 'admin-mariano', password: 'admin123' }
  ];
  
  usuarios.forEach(user => {
    db.get("SELECT * FROM usuarios WHERE usuario = ?", [user.usuario], (err, existingUser) => {
      if (err) {
        console.error(`Error al verificar usuario ${user.usuario}:`, err);
        return;
      }
      
      if (!existingUser) {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.run("INSERT INTO usuarios (usuario, password) VALUES (?, ?)", [user.usuario, hashedPassword], (err) => {
          if (err) {
            console.error(`Error al crear usuario ${user.usuario}:`, err);
          } else {
            console.log(`Usuario creado: usuario=${user.usuario}, password=${user.password}`);
          }
        });
      }
    });
  });
}

// Middleware para verificar autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
}

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login
app.post('/api/login', (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  db.get("SELECT * FROM usuarios WHERE usuario = ?", [usuario], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      req.session.userId = user.id;
      req.session.usuario = user.usuario;
      res.json({ success: true, usuario: user.usuario });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ success: true });
  });
});

// Verificar sesión
app.get('/api/session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, usuario: req.session.usuario });
  } else {
    res.json({ authenticated: false });
  }
});

// ==================== RUTAS DE PRODUCTOS ====================

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const destacados = req.query.destacados === 'true';
  let query = `
    SELECT p.*, c.nombre as categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
  `;
  
  if (destacados) {
    query += " WHERE p.destacado = 1";
  }
  
  query += " ORDER BY p.creado_en DESC";

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Obtener colores e imágenes para cada producto
    const productosPromises = rows.map(row => {
      return new Promise((resolve, reject) => {
        const productoId = row.id;
        
        // Obtener colores
        db.all("SELECT color FROM producto_colores WHERE producto_id = ?", [productoId], (err, colores) => {
          if (err) return reject(err);
          
          // Obtener imágenes por color
          db.all("SELECT color, imagen_path FROM producto_imagenes WHERE producto_id = ? ORDER BY orden", [productoId], (err, imagenes) => {
            if (err) return reject(err);
            
            const imagenesPorColor = {};
            imagenes.forEach(img => {
              if (!imagenesPorColor[img.color]) {
                imagenesPorColor[img.color] = [];
              }
              imagenesPorColor[img.color].push(img.imagen_path);
            });
            
            // Si no hay imágenes por color pero hay imágenes, asignarlas al primer color
            const coloresArray = colores.map(c => c.color);
            if (Object.keys(imagenesPorColor).length === 0 && imagenes.length > 0) {
              const primerColor = coloresArray.length > 0 ? coloresArray[0] : 'default';
              imagenesPorColor[primerColor] = imagenes.map(img => img.imagen_path);
            }
            
            resolve({
              ...row,
              colores: coloresArray,
              imagenes: imagenes.map(img => img.imagen_path),
              imagenesPorColor: imagenesPorColor,
              destacado: row.destacado === 1,
              disponible: row.disponible === 1
            });
          });
        });
      });
    });
    
    Promise.all(productosPromises)
      .then(productos => res.json(productos))
      .catch(err => res.status(500).json({ error: err.message }));
  });
});

// Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  
  db.get(`
    SELECT p.*, c.nombre as categoria_nombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
  `, [id], (err, producto) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener colores
    db.all("SELECT color FROM producto_colores WHERE producto_id = ?", [id], (err, colores) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Obtener imágenes por color
      db.all("SELECT color, imagen_path FROM producto_imagenes WHERE producto_id = ? ORDER BY orden", [id], (err, imagenes) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const imagenesPorColor = {};
        imagenes.forEach(img => {
          if (!imagenesPorColor[img.color]) {
            imagenesPorColor[img.color] = [];
          }
          imagenesPorColor[img.color].push(img.imagen_path);
        });

        res.json({
          ...producto,
          colores: colores.map(c => c.color),
          imagenesPorColor: imagenesPorColor,
          destacado: producto.destacado === 1,
          disponible: producto.disponible === 1
        });
      });
    });
  });
});

// Crear producto
app.post('/api/productos', requireAuth, upload.array('imagenes', 10), (req, res) => {
  const { nombre, descripcion, precio, categoria_id, stock, destacado, disponible, colores } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });
  }

  const destacadoValue = destacado === 'true' || destacado === true ? 1 : 0;
  const disponibleValue = disponible === 'true' || disponible === true ? 1 : 0;

  db.run(`
    INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock, destacado, disponible)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [nombre, descripcion, precio, categoria_id || null, stock || 0, destacadoValue, disponibleValue], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const productoId = this.lastID;

    // Guardar colores
    if (colores) {
      const coloresArray = Array.isArray(colores) ? colores : JSON.parse(colores);
      const stmt = db.prepare("INSERT INTO producto_colores (producto_id, color) VALUES (?, ?)");
      coloresArray.forEach(color => {
        stmt.run(productoId, color);
      });
      stmt.finalize();
    }

    // Guardar imágenes
    if (req.files && req.files.length > 0) {
      const coloresArray = colores ? (Array.isArray(colores) ? colores : JSON.parse(colores)) : [];
      const stmt = db.prepare("INSERT INTO producto_imagenes (producto_id, color, imagen_path, orden) VALUES (?, ?, ?, ?)");
      
      req.files.forEach((file, index) => {
        const color = coloresArray[index] || coloresArray[0] || 'default';
        stmt.run(productoId, color, file.path, index);
      });
      stmt.finalize();
    }

    res.json({ id: productoId, message: 'Producto creado exitosamente' });
  });
});

// Actualizar producto
app.put('/api/productos/:id', requireAuth, upload.array('imagenes', 10), (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, precio, categoria_id, stock, destacado, disponible, colores } = req.body;

  const destacadoValue = destacado === 'true' || destacado === true ? 1 : 0;
  const disponibleValue = disponible === 'true' || disponible === true ? 1 : 0;

  db.run(`
    UPDATE productos 
    SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, stock = ?, destacado = ?, disponible = ?, actualizado_en = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [nombre, descripcion, precio, categoria_id || null, stock || 0, destacadoValue, disponibleValue, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Actualizar colores
    db.run("DELETE FROM producto_colores WHERE producto_id = ?", [id], () => {
      if (colores) {
        const coloresArray = Array.isArray(colores) ? colores : JSON.parse(colores);
        const stmt = db.prepare("INSERT INTO producto_colores (producto_id, color) VALUES (?, ?)");
        coloresArray.forEach(color => {
          stmt.run(id, color);
        });
        stmt.finalize();
      }
    });

    // Agregar nuevas imágenes si hay
    if (req.files && req.files.length > 0) {
      const coloresArray = colores ? (Array.isArray(colores) ? colores : JSON.parse(colores)) : [];
      const stmt = db.prepare("INSERT INTO producto_imagenes (producto_id, color, imagen_path, orden) VALUES (?, ?, ?, ?)");
      
      req.files.forEach((file, index) => {
        const color = coloresArray[index] || coloresArray[0] || 'default';
        stmt.run(id, color, file.path, index);
      });
      stmt.finalize();
    }

    res.json({ message: 'Producto actualizado exitosamente' });
  });
});

// Eliminar producto
app.delete('/api/productos/:id', requireAuth, (req, res) => {
  const id = req.params.id;

  // Obtener imágenes para eliminarlas del sistema de archivos
  db.all("SELECT imagen_path FROM producto_imagenes WHERE producto_id = ?", [id], (err, imagenes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Eliminar imágenes del sistema de archivos
    imagenes.forEach(img => {
      const filePath = path.join(__dirname, img.imagen_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Eliminar producto (las relaciones se eliminan en cascada)
    db.run("DELETE FROM productos WHERE id = ?", [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Producto eliminado exitosamente' });
    });
  });
});

// ==================== RUTAS DE CATEGORÍAS ====================

// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  db.all("SELECT * FROM categorias ORDER BY nombre", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Crear categoría
app.post('/api/categorias', requireAuth, (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  db.run("INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)", [nombre, descripcion], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Categoría creada exitosamente' });
  });
});

// Actualizar categoría
app.put('/api/categorias/:id', requireAuth, (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  db.run("UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?", [nombre, descripcion, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Categoría actualizada exitosamente' });
  });
});

// Eliminar categoría
app.delete('/api/categorias/:id', requireAuth, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM categorias WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Categoría eliminada exitosamente' });
  });
});

// ==================== RUTAS DE VENTAS ====================

// Obtener todas las ventas
app.get('/api/ventas', requireAuth, (req, res) => {
  db.all(`
    SELECT v.*
    FROM ventas v
    ORDER BY v.fecha DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Extraer información de productos y cantidad de las notas
    const ventas = rows.map(v => {
      let productos = '';
      let cantidad = '';
      let notasLimpias = '';
      
      if (v.notas) {
        const lineas = v.notas.split('\n');
        lineas.forEach(linea => {
          if (linea.startsWith('Productos: ')) {
            productos = linea.replace('Productos: ', '');
          } else if (linea.startsWith('Cantidad de productos: ')) {
            cantidad = linea.replace('Cantidad de productos: ', '');
          } else if (linea.trim() !== '') {
            // Solo agregar líneas que no sean productos ni cantidad
            notasLimpias += (notasLimpias ? '\n' : '') + linea;
          }
        });
      }
      
      return {
        ...v,
        productos: productos,
        cantidad: cantidad,
        notas: notasLimpias || null
      };
    });
    
    res.json(ventas);
  });
});

// Crear venta
app.post('/api/ventas', requireAuth, (req, res) => {
  const { fecha, total, cantidad, productos, notas } = req.body;

  if (!total || total <= 0) {
    return res.status(400).json({ error: 'El monto total es requerido y debe ser mayor a 0' });
  }

  // Guardar productos vendidos y cantidad en las notas
  let notasCompletas = '';
  if (productos) {
    notasCompletas += 'Productos: ' + productos;
  }
  if (cantidad) {
    notasCompletas += (notasCompletas ? '\n' : '') + 'Cantidad de productos: ' + cantidad;
  }
  if (notas) {
    notasCompletas += (notasCompletas ? '\n\n' : '') + notas;
  }

  db.run("INSERT INTO ventas (fecha, total, notas) VALUES (?, ?, ?)", 
    [fecha || new Date().toISOString(), total, notasCompletas || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ id: this.lastID, message: 'Venta registrada exitosamente' });
  });
});

// Eliminar venta
app.delete('/api/ventas/:id', requireAuth, (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM ventas WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Venta eliminada exitosamente' });
  });
});

// ==================== RUTAS DE COMPRAS ====================

// Obtener todas las compras
app.get('/api/compras', requireAuth, (req, res) => {
  db.all(`
    SELECT c.*, 
           GROUP_CONCAT(ci.producto_id || ':' || ci.cantidad || ':' || ci.precio_unitario) as items
    FROM compras c
    LEFT JOIN compra_items ci ON c.id = ci.compra_id
    GROUP BY c.id
    ORDER BY c.fecha DESC
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Crear compra
app.post('/api/compras', requireAuth, (req, res) => {
  const { fecha, proveedor, total, notas, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'La compra debe tener al menos un item' });
  }

  db.run("INSERT INTO compras (fecha, proveedor, total, notas) VALUES (?, ?, ?, ?)", 
    [fecha || new Date().toISOString(), proveedor, total, notas], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const compraId = this.lastID;
    const stmt = db.prepare(`
      INSERT INTO compra_items (compra_id, producto_id, color, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      const subtotal = item.cantidad * item.precio_unitario;
      stmt.run(compraId, item.producto_id, item.color || null, item.cantidad, item.precio_unitario, subtotal);
      
      // Actualizar stock del producto
      db.run("UPDATE productos SET stock = stock + ? WHERE id = ?", [item.cantidad, item.producto_id]);
    });

    stmt.finalize();
    res.json({ id: compraId, message: 'Compra registrada exitosamente' });
  });
});

// ==================== RUTAS DE ESTADÍSTICAS ====================

app.get('/api/estadisticas', requireAuth, (req, res) => {
  const estadisticas = {};

  // Total de productos
  db.get("SELECT COUNT(*) as total FROM productos", [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    estadisticas.totalProductos = row.total;

    // Productos con stock bajo (menos de 5)
    db.get("SELECT COUNT(*) as total FROM productos WHERE stock < 5 AND stock > 0", [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      estadisticas.productosStockBajo = row.total;

      // Productos sin stock
      db.get("SELECT COUNT(*) as total FROM productos WHERE stock = 0", [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        estadisticas.productosSinStock = row.total;

        // Total de ventas del mes
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        db.get("SELECT SUM(total) as total FROM ventas WHERE fecha >= ?", [inicioMes.toISOString()], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          estadisticas.ventasMes = row.total || 0;

          // Total de compras del mes
          db.get("SELECT SUM(total) as total FROM compras WHERE fecha >= ?", [inicioMes.toISOString()], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            estadisticas.comprasMes = row.total || 0;

            // Productos destacados
            db.get("SELECT COUNT(*) as total FROM productos WHERE destacado = 1", [], (err, row) => {
              if (err) return res.status(500).json({ error: err.message });
              estadisticas.productosDestacados = row.total;

              // Productos con stock bajo (detalle)
              db.all("SELECT id, nombre, stock FROM productos WHERE stock < 5 AND stock > 0 ORDER BY stock ASC", [], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                estadisticas.alertasStockBajo = rows;

                // Productos sin stock (detalle)
                db.all("SELECT id, nombre, stock FROM productos WHERE stock = 0 ORDER BY nombre", [], (err, rows) => {
                  if (err) return res.status(500).json({ error: err.message });
                  estadisticas.alertasSinStock = rows;

                  res.json(estadisticas);
                });
              });
            });
          });
        });
      });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

