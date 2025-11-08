/* =====================
   Logo - Doble clic para login admin
===================== */
document.addEventListener('DOMContentLoaded', () => {
  const logoLink = document.getElementById('logo-admin-link');
  if (logoLink) {
    let clickCount = 0;
    let clickTimer = null;
    
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300); // 300ms para detectar doble clic
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        window.location.href = 'admin/login.html';
      }
    });
  }
});

/* =====================
   Menu hamburguesa
===================== */
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');

if (hamburger) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('show');
    hamburger.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (nav && hamburger && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('show');
      hamburger.classList.remove('active');
    }
  });

  // Cerrar menú al hacer click en un link
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('show');
      hamburger.classList.remove('active');
    });
  });
}

/* =====================
   Productos - Cargados desde API
===================== */
let productos = [];

// Cargar productos desde la API
async function cargarProductos() {
  try {
    const fetchFn = window.apiRequest || fetch;
    const response = await fetchFn('/api/productos');
    const productosAPI = await response.json();
    
    // Convertir formato de API al formato esperado por el frontend
    productos = await Promise.all(productosAPI.map(async (p) => {
      const imagenesPorColor = {};
      
      // Si el producto tiene imágenes organizadas por color desde la API
      if (p.imagenesPorColor) {
        Object.keys(p.imagenesPorColor).forEach(color => {
          imagenesPorColor[color] = Array.isArray(p.imagenesPorColor[color]) 
            ? p.imagenesPorColor[color] 
            : [p.imagenesPorColor[color]];
        });
      } else if (p.imagenes && p.imagenes.length > 0) {
        // Si hay imágenes pero no organizadas por color, asignarlas al primer color
        const primerColor = p.colores && p.colores.length > 0 ? p.colores[0] : 'default';
        imagenesPorColor[primerColor] = p.imagenes;
      }
      
      // Si no hay colores, usar 'default'
      const colores = p.colores && p.colores.length > 0 ? p.colores : ['default'];
      if (Object.keys(imagenesPorColor).length === 0 && colores.length > 0) {
        imagenesPorColor[colores[0]] = ['img/logo.png'];
      }
      
      return {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria_nombre ? p.categoria_nombre.toLowerCase() : 'otros',
        disponible: p.disponible,
        precio: parseFloat(p.precio),
        desc: p.descripcion || '',
        colores: colores,
        imagenesPorColor: imagenesPorColor
      };
    }));
    
    // Si no hay productos en la API, mostrar mensaje
    if (productos.length === 0) {
      console.log('No hay productos disponibles');
    }
  } catch (error) {
    console.error('Error al cargar productos desde API:', error);
    productos = [];
  }
}

/* =====================
   Contenedores y variables
===================== */
const productosContainer = document.getElementById('productos');
const botonesCategoria = document.querySelectorAll('[data-categoria]');
const botonesDisponibilidad = document.querySelectorAll('[data-disponibilidad]');
const inputPrecioMin = document.getElementById('precio-min');
const inputPrecioMax = document.getElementById('precio-max');

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const addToCartBtn = document.getElementById('add-to-cart');
const closeModal = document.querySelector('.close');
const colorContainer = document.getElementById('color-producto'); 
const cantidadInput = document.getElementById('cantidad-producto');

const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const carritoElement = document.getElementById('carrito');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout');

let categoriaSeleccionada = 'todos';
let disponibilidadSeleccionada = 'todos';
let precioMinimo = inputPrecioMin ? parseFloat(inputPrecioMin.value) : 0;
let precioMaximo = inputPrecioMax ? parseFloat(inputPrecioMax.value) : 1000000;

/* =====================
   Mostrar productos
===================== */
function mostrarProductos() {
  if (!productosContainer) return;
  productosContainer.innerHTML = '';

  productos
    .filter(p =>
      (categoriaSeleccionada === 'todos' || p.categoria === categoriaSeleccionada) &&
      (disponibilidadSeleccionada === 'todos' ||
       (disponibilidadSeleccionada === 'disponible' ? p.disponible : !p.disponible)) &&
      p.precio >= precioMinimo && p.precio <= precioMaximo
    )
    .forEach((producto, i) => {
      const div = document.createElement('div');
      div.classList.add('producto');
      div.style.animationDelay = `${i * 0.05}s`;
      const primeraImagen = producto.colores.length > 0 && producto.imagenesPorColor[producto.colores[0]] 
        ? producto.imagenesPorColor[producto.colores[0]][0] 
        : 'img/logo.png';
      div.innerHTML = `
        <img src="${primeraImagen}" alt="${producto.nombre}">
        <h4>${producto.nombre}</h4>
        <div class="precio">${producto.precio.toLocaleString('es-AR')}</div>
      `;
      div.addEventListener('click', () => abrirModal(producto));
      productosContainer.appendChild(div);
    });
}

/* =====================
   Mostrar productos destacados en index
===================== */
async function mostrarProductosDestacados() {
  const container = document.getElementById('productos-destacados');
  if (!container) return;
  
  try {
    const fetchFn = window.apiRequest || fetch;
    const response = await fetchFn('/api/productos?destacados=true');
    const productosDestacados = await response.json();
    
    if (productosDestacados.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--ml-gray);">No hay productos destacados</div>';
      return;
    }
    
    container.innerHTML = productosDestacados.slice(0, 6).map(p => {
      const primeraImagen = p.imagenes && p.imagenes.length > 0 
        ? p.imagenes[0] 
        : 'img/logo.png';
      return `
        <div class="producto">
          <img src="${primeraImagen}" alt="${p.nombre}">
          <h4>${p.nombre}</h4>
          <div class="precio">${parseFloat(p.precio).toLocaleString('es-AR')}</div>
        </div>
      `;
    }).join('');
    
    // Agregar event listeners para abrir modal
    container.querySelectorAll('.producto').forEach((div, index) => {
      const producto = productos.find(p => p.id === productosDestacados[index].id);
      if (producto) {
        div.addEventListener('click', () => abrirModal(producto));
      }
    });
  } catch (error) {
    console.error('Error al cargar productos destacados:', error);
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--ml-gray);">Error al cargar productos</div>';
  }
}

// Cargar productos y mostrar al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  await cargarProductos();
  mostrarProductos();
  mostrarProductosDestacados();
});

/* =====================
   Filtros
===================== */
botonesCategoria.forEach(btn => {
  btn.addEventListener('click', () => {
    botonesCategoria.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    categoriaSeleccionada = btn.dataset.categoria;
    mostrarProductos();
  });
});

botonesDisponibilidad.forEach(btn => {
  btn.addEventListener('click', () => {
    botonesDisponibilidad.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    disponibilidadSeleccionada = btn.dataset.disponibilidad;
    mostrarProductos();
  });
});

if (inputPrecioMin && inputPrecioMax) {
  const actualizarFiltroPrecio = () => {
    precioMinimo = parseFloat(inputPrecioMin.value) || 0;
    precioMaximo = parseFloat(inputPrecioMax.value) || 1000000;
    mostrarProductos();
  };
  inputPrecioMin.addEventListener('input', actualizarFiltroPrecio);
  inputPrecioMax.addEventListener('input', actualizarFiltroPrecio);
}

/* =====================
   Modal con carrusel e imagenes por color
===================== */
let productoActual = null;
let imagenIndex = 0;

function abrirModal(producto) {
  productoActual = { ...producto, color: producto.colores[0], cantidad: parseInt(cantidadInput.value) || 1 };
  modal.style.display = 'flex';

  // Carrusel inicial
  const carousel = document.querySelector('.carousel-images');
  carousel.innerHTML = '';
  const imgsArray = producto.imagenesPorColor[productoActual.color];
  imagenIndex = 0;
  imgsArray.forEach((img, i) => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imgEl.style.display = i === 0 ? 'block' : 'none';
    imgEl.style.width = '100%';
    imgEl.style.borderRadius = '10px';
    carousel.appendChild(imgEl);
  });

  document.querySelector('.prev').onclick = () => cambiarImagen(-1, carousel);
  document.querySelector('.next').onclick = () => cambiarImagen(1, carousel);

  // Info producto
  modalTitle.textContent = producto.nombre;
  modalDesc.textContent = producto.desc;
  modalPrice.textContent = `$${producto.precio.toLocaleString('es-AR')}`;

  // Colores
  colorContainer.innerHTML = '';
  producto.colores.forEach(color => {
    const btn = document.createElement('button');
    btn.className = `color-btn color-${color.toLowerCase()}`;
    btn.title = color.charAt(0).toUpperCase() + color.slice(1);
    if(color === productoActual.color) btn.classList.add('selected');

    btn.onclick = () => {
      productoActual.color = color;
      Array.from(colorContainer.children).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      // Actualizar carrusel
      const newImgs = producto.imagenesPorColor[color];
      carousel.innerHTML = '';
      imagenIndex = 0;
      newImgs.forEach((img, i) => {
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.style.display = i === 0 ? 'block' : 'none';
        imgEl.style.width = '100%';
        imgEl.style.borderRadius = '10px';
        carousel.appendChild(imgEl);
      });
    };

    colorContainer.appendChild(btn);
  });

  cantidadInput.value = productoActual.cantidad || 1;
  cantidadInput.onchange = () => productoActual.cantidad = parseInt(cantidadInput.value) || 1;
}

function cambiarImagen(direccion, carousel) {
  const imgs = carousel.querySelectorAll('img');
  imgs[imagenIndex].style.display = 'none';
  imagenIndex = (imagenIndex + direccion + imgs.length) % imgs.length;
  imgs[imagenIndex].style.display = 'block';
}

if (closeModal) closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

/* =====================
   Carrito
===================== */
let carrito = [];
const carritoGuardado = localStorage.getItem('carritoBonamigo');
if (carritoGuardado) {
  carrito = JSON.parse(carritoGuardado);
  actualizarCarrito();
}

// Función para obtener la imagen del producto según el color
function obtenerImagenProducto(item) {
  const producto = productos.find(p => p.id === item.id);
  if (producto && producto.imagenesPorColor && producto.imagenesPorColor[item.color]) {
    return producto.imagenesPorColor[item.color][0];
  }
  // Fallback si no encuentra la imagen
  if (producto && producto.imagenesPorColor && producto.colores.length > 0) {
    return producto.imagenesPorColor[producto.colores[0]][0];
  }
  return 'img/logo.png'; // Imagen por defecto
}

// Función para obtener el color CSS según el nombre del color
function obtenerColorCSS(colorNombre) {
  const coloresMap = {
    'blanco': '#ffffff',
    'negro': '#000000',
    'azul': '#0066cc',
    'verde': '#00cc00',
    'amarillo': '#ffcc00',
    'gris': '#808080',
    'rosa': '#ff69b4',
    'violeta': '#8a2be2',
    'rojo': '#ff0000',
    'plateado': '#c0c0c0'
  };
  return coloresMap[colorNombre.toLowerCase()] || '#cccccc';
}

// Función para mostrar notificación
function mostrarNotificacion(mensaje) {
  // Eliminar notificación anterior si existe
  const notifAnterior = document.querySelector('.cart-notification');
  if (notifAnterior) {
    notifAnterior.remove();
  }

  const notificacion = document.createElement('div');
  notificacion.className = 'cart-notification';
  notificacion.innerHTML = `
    <span class="cart-notification-icon">✓</span>
    <span>${mensaje}</span>
  `;
  document.body.appendChild(notificacion);

  // Remover después de la animación
  setTimeout(() => {
    notificacion.remove();
  }, 3000);
}

// Función para calcular cantidad total de items
function calcularCantidadTotal() {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function actualizarCarrito() {
  if (!cartItems) return;
  
  cartItems.innerHTML = '';
  let total = 0;

  // Si el carrito está vacío, mostrar estado vacío
  if (carrito.length === 0) {
    cartItems.innerHTML = `
      <div class="carrito-vacio">
        <div class="carrito-vacio-icon">🛒</div>
        <p>Tu carrito está vacío</p>
        <a href="catalogo.html" class="btn-catalogo">Ver Catálogo</a>
      </div>
    `;
    cartTotal.textContent = '0';
    cartCount.textContent = '0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    localStorage.setItem('carritoBonamigo', JSON.stringify(carrito));
    return;
  }

  // Habilitar botón de checkout
  if (checkoutBtn) checkoutBtn.disabled = false;

  // Renderizar cada item del carrito
  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.dataset.index = index;

    const imagenSrc = obtenerImagenProducto(item);
    const colorCSS = obtenerColorCSS(item.color);

    itemDiv.innerHTML = `
      <img src="${imagenSrc}" alt="${item.nombre}" class="cart-item-img" onerror="this.src='img/logo.png'">
      <div class="cart-item-info">
        <h4 class="cart-item-nombre">${item.nombre}</h4>
        <div class="cart-item-color">
          <span class="cart-item-color-badge" style="background-color: ${colorCSS}"></span>
          <span>${item.color.charAt(0).toUpperCase() + item.color.slice(1)}</span>
        </div>
        <p class="cart-item-precio">$${item.precio.toLocaleString('es-AR')} c/u</p>
        <p class="cart-item-subtotal">$${subtotal.toLocaleString('es-AR')}</p>
      </div>
      <div class="cart-item-controls">
        <div class="cart-item-cantidad">
          <button class="cantidad-btn menos" data-index="${index}" data-cambio="-1">−</button>
          <input type="number" value="${item.cantidad}" min="1" 
                 class="cantidad-input" data-index="${index}">
          <button class="cantidad-btn mas" data-index="${index}" data-cambio="1">+</button>
        </div>
        <button class="cart-item-remove" data-index="${index}" title="Eliminar">×</button>
      </div>
    `;

    cartItems.appendChild(itemDiv);

    // Agregar event listeners para los controles
    const btnMenos = itemDiv.querySelector('.cantidad-btn.menos');
    const btnMas = itemDiv.querySelector('.cantidad-btn.mas');
    const inputCantidad = itemDiv.querySelector('.cantidad-input');
    const btnEliminar = itemDiv.querySelector('.cart-item-remove');

    btnMenos.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      modificarCantidad(index, -1);
    });

    btnMas.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      modificarCantidad(index, 1);
    });

    inputCantidad.addEventListener('change', (e) => {
      e.stopPropagation();
      actualizarCantidad(index, e.target.value);
    });

    inputCantidad.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    btnEliminar.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      eliminarProducto(index);
    });
  });

  cartTotal.textContent = total.toLocaleString('es-AR');
  cartCount.textContent = calcularCantidadTotal();
  localStorage.setItem('carritoBonamigo', JSON.stringify(carrito));

  // Animación del contador
  if (cartCount) {
    cartCount.style.animation = 'none';
    setTimeout(() => {
      cartCount.style.animation = 'bounce 0.5s ease';
    }, 10);
  }
}

// Función para modificar cantidad con botones +/-
function modificarCantidad(index, cambio) {
  if (index < 0 || index >= carrito.length) return;
  
  carrito[index].cantidad += cambio;
  
  if (carrito[index].cantidad < 1) {
    carrito[index].cantidad = 1;
  }
  
  actualizarCarrito();
}

// Función para actualizar cantidad desde el input
function actualizarCantidad(index, nuevaCantidad) {
  if (index < 0 || index >= carrito.length) return;
  
  const cantidad = parseInt(nuevaCantidad);
  
  if (isNaN(cantidad) || cantidad < 1) {
    carrito[index].cantidad = 1;
  } else {
    carrito[index].cantidad = cantidad;
  }
  
  actualizarCarrito();
}

// Función para eliminar producto con animación
function eliminarProducto(index) {
  if (index < 0 || index >= carrito.length) return;
  
  const itemDiv = document.querySelector(`.cart-item[data-index="${index}"]`);
  if (itemDiv) {
    itemDiv.classList.add('removing');
    setTimeout(() => {
      carrito.splice(index, 1);
      actualizarCarrito();
    }, 300);
  } else {
    carrito.splice(index, 1);
    actualizarCarrito();
  }
}

// Agregar producto al carrito
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    if (productoActual) {
      const indexExistente = carrito.findIndex(item => 
        item.id === productoActual.id && item.color === productoActual.color
      );
      
      if (indexExistente > -1) {
        carrito[indexExistente].cantidad += productoActual.cantidad;
        mostrarNotificacion('Cantidad actualizada en el carrito');
      } else {
        carrito.push({ ...productoActual });
        mostrarNotificacion('Producto agregado al carrito');
      }
      
      actualizarCarrito();
      modal.style.display = 'none';
      
      // Abrir carrito automáticamente
      if (carritoElement) {
        carritoElement.classList.add('show');
      }
    }
  });
}

// Checkout
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (carrito.length === 0) {
      mostrarNotificacion('El carrito está vacío');
      return;
    }
    
    let mensaje = "Hola! Quiero consultar sobre los siguientes productos de Bonamigo:%0A%0A";
    carrito.forEach(p => {
      mensaje += `• ${p.nombre}%0A`;
      mensaje += `  Color: ${p.color.charAt(0).toUpperCase() + p.color.slice(1)}%0A`;
      mensaje += `  Cantidad: ${p.cantidad}%0A`;
      mensaje += `  Precio: $${(p.precio * p.cantidad).toLocaleString('es-AR')}%0A%0A`;
    });
    let total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
    mensaje += `Total aproximado: $${total.toLocaleString('es-AR')}`;
    
    let waLink = `https://wa.me/5491123456789?text=${mensaje}`;
    window.open(waLink, "_blank");
    carritoElement.classList.remove('show');
  });
}

/* =====================
   Mostrar/ocultar carrito
===================== */
if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    carritoElement.classList.toggle('show');
  });
}

// Botón cerrar del carrito
const carritoCloseBtn = document.getElementById('carrito-close');
if (carritoCloseBtn) {
  carritoCloseBtn.addEventListener('click', () => {
    carritoElement.classList.remove('show');
  });
}

// Cerrar carrito al hacer click fuera (pero no si es dentro del carrito)
document.addEventListener('click', (e) => {
  if (!carritoElement || !cartIcon) return;
  
  // No cerrar si el click es dentro del carrito o en el icono
  if (carritoElement.contains(e.target) || cartIcon.contains(e.target)) {
    return;
  }
  
  // Cerrar solo si el carrito está abierto y el click es fuera
  if (carritoElement.classList.contains('show')) {
    carritoElement.classList.remove('show');
  }
});

/* =====================
   Menús desplegables de filtros con animación
===================== */
const botonesToggle = document.querySelectorAll('.filtro-titulo');
botonesToggle.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.toggle);
    target.classList.toggle('active');
    btn.classList.toggle('active');
  });
});

/* =====================
   Leer categoría desde URL (para abrir el catálogo filtrado)
===================== */
document.addEventListener('DOMContentLoaded', () => {
  // Detectar página activa automáticamente
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isIndex = href === 'index.html' || href === '/' || href.endsWith('index.html');
    const isCurrentPage = 
      (isIndex && (currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath === '' || currentPath.endsWith('bonamigo/'))) ||
      (!isIndex && currentPath.includes(href));
    
    if (isCurrentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Leer categoría desde URL para el catálogo
  if (window.location.pathname.includes('catalogo.html')) {
    const params = new URLSearchParams(window.location.search);
    const categoriaURL = params.get('categoria');
    if (categoriaURL) {
      const btn = document.querySelector(`[data-categoria="${categoriaURL}"]`);
      if (btn) {
        document.querySelectorAll('[data-categoria]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        categoriaSeleccionada = categoriaURL;
        // Mostrar productos después de cargarlos
        cargarProductos().then(() => mostrarProductos());
      }
    }
  }

  // Año automático
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
