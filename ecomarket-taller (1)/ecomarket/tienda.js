// tienda.js - catálogo por categorías y carrito de compras de la landing

// ---------- Datos ----------
const CLAVE_PRODUCTOS = "ecomarket_productos"; // la misma clave que usa el panel (app.js)
const CLAVE_CARRITO = "ecomarket_carrito";     // aquí se guarda el carrito del cliente
const CATEGORIAS_TIENDA = ["Frutas y verduras", "Despensa", "Cuidado personal", "Hogar sostenible"];

let productos = [];            // todos los productos
let carrito = [];              // lista de { id, cantidad }
let categoriaActiva = "Todas"; // categoría que se está viendo

const $ = (id) => document.getElementById(id);

// ---------- Funciones de apoyo ----------

// Formato de pesos colombianos: 28000 -> $28.000
function formatoCOP(numero) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(numero);
}

// Evita que un texto se interprete como HTML
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Busca un producto por su id
function buscarProducto(id) {
  return productos.find((p) => p.id === id);
}

// Muestra un mensaje corto y lo borra a los 2.5 segundos
function mostrarAviso(idElemento, texto) {
  $(idElemento).textContent = texto;
  setTimeout(() => ($(idElemento).textContent = ""), 2500);
}

// ---------- Cargar datos ----------

// Usa los productos del panel (localStorage); si no hay, lee productos.json
async function cargarProductos() {
  const guardado = localStorage.getItem(CLAVE_PRODUCTOS);
  if (guardado) {
    try { productos = JSON.parse(guardado); return; } catch (e) { /* si está dañado, sigue abajo */ }
  }
  try {
    const respuesta = await fetch("productos.json");
    productos = await respuesta.json();
  } catch (error) {
    productos = [];
    $("catalogo-vacio").textContent = "No se pudo cargar el catálogo. Abre el proyecto con Live Server.";
    $("catalogo-vacio").hidden = false;
  }
}

function cargarCarrito() {
  try { carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || []; } catch (e) { carrito = []; }
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// ---------- Catálogo ----------

// Botones: Todas + una por categoría
function renderizarFiltros() {
  const contenedor = $("filtros-categoria");
  contenedor.innerHTML = "";
  ["Todas", ...CATEGORIAS_TIENDA].forEach((cat) => {
    const activo = cat === categoriaActiva ? " activo" : "";
    contenedor.insertAdjacentHTML("beforeend",
      `<button class="btn btn-secundario filtro-cat${activo}" type="button" data-categoria="${cat}" aria-pressed="${cat === categoriaActiva}">${cat}</button>`);
  });
}

// Tarjetas de los productos de la categoría activa (solo productos activos)
function renderizarCatalogo() {
  const lista = $("lista-productos");
  lista.innerHTML = "";
  const visibles = productos.filter((p) => p.activo && (categoriaActiva === "Todas" || p.categoria === categoriaActiva));
  $("catalogo-vacio").hidden = visibles.length > 0;

  visibles.forEach((p) => {
    const agotado = p.stock === 0;
    // Aviso de stock: agotado o pocas unidades
    let aviso = "";
    if (agotado) aviso = "<p class='aviso-stock'>Agotado</p>";
    else if (p.stock <= p.stockMinimo) aviso = `<p class='aviso-stock'>Quedan ${p.stock} unidades</p>`;

    lista.insertAdjacentHTML("beforeend", `
      <article class="tarjeta producto-tienda">
        <h3>${escapar(p.nombre)}</h3>
        <p>${p.categoria} · ${p.ciudad}</p>
        <p>Productor: ${escapar(p.productor)}</p>
        <p class="precio">${formatoCOP(p.precio)}</p>
        ${aviso}
        <button class="btn btn-primary agregar" type="button" data-id="${p.id}" ${agotado ? "disabled" : ""}>
          ${agotado ? "No disponible" : "Agregar al carrito"}
        </button>
      </article>`);
  });
}

// Cambia de categoría y vuelve a dibujar
function elegirCategoria(categoria) {
  categoriaActiva = categoria;
  renderizarFiltros();
  renderizarCatalogo();
}

// ---------- Carrito ----------

function agregarAlCarrito(id) {
  const p = buscarProducto(id);
  const item = carrito.find((x) => x.id === id);
  const enCarrito = item ? item.cantidad : 0;

  // No se puede pedir más de lo que hay en stock
  if (enCarrito + 1 > p.stock) {
    mostrarAviso("aviso", "No hay más unidades disponibles de " + p.nombre + ".");
    return;
  }
  if (item) item.cantidad++;
  else carrito.push({ id: id, cantidad: 1 });

  guardarCarrito();
  renderizarCarrito();
  mostrarAviso("aviso", p.nombre + " se agregó al carrito.");
}

// delta = +1 o -1
function cambiarCantidad(id, delta) {
  const item = carrito.find((x) => x.id === id);
  const p = buscarProducto(id);
  if (!item) return;
  if (item.cantidad + delta > p.stock) return mostrarAviso("aviso-carrito", "No hay más unidades disponibles.");
  item.cantidad += delta;
  if (item.cantidad <= 0) quitarDelCarrito(id);
  else { guardarCarrito(); renderizarCarrito(); }
}

function quitarDelCarrito(id) {
  carrito = carrito.filter((x) => x.id !== id);
  guardarCarrito();
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
}

// Dibuja la lista del carrito, el total y el contador del encabezado
function renderizarCarrito() {
  // Si un producto ya no existe (lo borraron en el panel), se descarta
  carrito = carrito.filter((x) => buscarProducto(x.id));

  const lista = $("lista-carrito");
  lista.innerHTML = "";
  let total = 0;
  let unidades = 0;

  carrito.forEach((item) => {
    const p = buscarProducto(item.id);
    total += p.precio * item.cantidad;
    unidades += item.cantidad;
    lista.insertAdjacentHTML("beforeend", `
      <li>
        <span>${escapar(p.nombre)}<br><small>${formatoCOP(p.precio)} c/u</small></span>
        <span class="cantidad">
          <button type="button" class="menos" data-id="${p.id}" aria-label="Quitar una unidad">−</button>
          ${item.cantidad}
          <button type="button" class="mas" data-id="${p.id}" aria-label="Agregar una unidad">+</button>
        </span>
        <strong>${formatoCOP(p.precio * item.cantidad)}</strong>
        <button type="button" class="btn-quitar" data-id="${p.id}">Quitar</button>
      </li>`);
  });

  $("carrito-vacio").hidden = carrito.length > 0;
  $("carrito-total").textContent = formatoCOP(total);
  $("contador").textContent = unidades;
  $("btn-comprar").disabled = carrito.length === 0;
  $("btn-vaciar").disabled = carrito.length === 0;
}

// Compra simulada (no hay pagos reales)
function finalizarCompra() {
  vaciarCarrito();
  mostrarAviso("aviso-carrito", "¡Gracias por tu compra! (simulación, no se cobró nada)");
}

// ---------- Inicio ----------

async function iniciar() {
  await cargarProductos();
  cargarCarrito();
  renderizarFiltros();
  renderizarCatalogo();
  renderizarCarrito();

  // Un solo listener para todos los botones de la página
  document.addEventListener("click", (e) => {
    const boton = e.target.closest("button");
    if (!boton) return;
    const id = Number(boton.dataset.id);

    if (boton.classList.contains("ver-categoria")) {   // botón de las tarjetas de categoría
      elegirCategoria(boton.dataset.categoria);
      $("catalogo").scrollIntoView({ behavior: "smooth" });
    }
    if (boton.classList.contains("filtro-cat")) elegirCategoria(boton.dataset.categoria);
    if (boton.classList.contains("agregar")) agregarAlCarrito(id);
    if (boton.classList.contains("mas")) cambiarCantidad(id, 1);
    if (boton.classList.contains("menos")) cambiarCantidad(id, -1);
    if (boton.classList.contains("btn-quitar")) quitarDelCarrito(id);
  });

  $("btn-carrito").addEventListener("click", () => $("carrito").showModal());
  $("btn-cerrar-carrito").addEventListener("click", () => $("carrito").close());
  $("btn-vaciar").addEventListener("click", vaciarCarrito);
  $("btn-comprar").addEventListener("click", finalizarCompra);
}

iniciar();
