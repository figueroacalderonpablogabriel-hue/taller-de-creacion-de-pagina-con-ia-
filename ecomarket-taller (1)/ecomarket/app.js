// app.js - panel de administración de EcoMarket
// Carga datos, muestra productos, filtra, hace CRUD y guarda en localStorage.
// Usa CATEGORIAS, CIUDADES y validarProductos() de validacion.js

const CLAVE = "ecomarket_productos"; // nombre con el que se guarda en localStorage
let productos = [];                  // arreglo ORIGINAL con todos los productos
let grafico = null;                  // referencia al gráfico de Chart.js
let vistaTabla = false;              // false = tarjetas, true = tabla

// ---------- Referencias al HTML ----------
const $ = (id) => document.getElementById(id);
const modal = $("modal");

// ---------- Funciones de apoyo ----------

// Da formato de pesos colombianos: 28000 -> $28.000
function formatoCOP(numero) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(numero);
}

// Calcula el estado según el stock (no se guarda en el JSON)
function calcularEstado(p) {
  if (p.stock === 0) return "Agotado";
  if (p.stock <= p.stockMinimo) return "Stock bajo";
  return "Disponible";
}

// Clase CSS del badge según el estado
function claseBadge(estado) {
  if (estado === "Agotado") return "badge-agotado";
  if (estado === "Stock bajo") return "badge-bajo";
  return "badge-disponible";
}

// Evita que un texto escrito por el usuario se interprete como HTML
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------- 1. Cargar y guardar ----------

// Si hay datos en localStorage los usa; si no, lee productos.json
async function cargarProductos() {
  const guardado = localStorage.getItem(CLAVE);
  if (guardado) {
    try {
      productos = JSON.parse(guardado);
      return;
    } catch (error) {
      console.warn("Datos guardados dañados, se carga el JSON inicial");
    }
  }
  try {
    const respuesta = await fetch("productos.json");
    productos = await respuesta.json();
    guardarProductos();
  } catch (error) {
    productos = [];
    $("mensaje-vacio").textContent = "No se pudo cargar productos.json. Abre el proyecto con un servidor local (Live Server).";
    $("mensaje-vacio").hidden = false;
  }
}

// Guarda el arreglo actual como texto JSON
function guardarProductos() {
  localStorage.setItem(CLAVE, JSON.stringify(productos));
}

// ---------- 2. Mostrar productos ----------

function renderizarProductos(lista) {
  const tarjetas = $("lista-tarjetas");
  const cuerpo = $("cuerpo-tabla");
  tarjetas.innerHTML = "";
  cuerpo.innerHTML = "";
  $("mensaje-vacio").textContent = "No hay productos que coincidan con los filtros.";
  $("mensaje-vacio").hidden = lista.length > 0;

  lista.forEach((p) => {
    const estado = calcularEstado(p);
    const badge = `<span class="badge ${claseBadge(estado)}">${estado}</span>`;
    const botones = `<button class="editar" data-id="${p.id}">Editar</button>
                     <button class="eliminar" data-id="${p.id}">Eliminar</button>`;

    // Tarjeta
    tarjetas.insertAdjacentHTML("beforeend", `
      <article class="tarjeta card-producto">
        ${badge}${p.activo ? "" : " <span class='badge'>Inactivo</span>"}
        <h3>${escapar(p.nombre)}</h3>
        <p>${p.categoria} · ${p.ciudad}</p>
        <p class="precio">${formatoCOP(p.precio)}</p>
        <p>Stock: ${p.stock}</p>
        <p>Productor: ${escapar(p.productor)}</p>
        <div class="acciones">${botones}</div>
      </article>`);

    // Fila de la tabla
    cuerpo.insertAdjacentHTML("beforeend", `
      <tr>
        <td>ECO${String(p.id).padStart(3, "0")}</td><td>${escapar(p.nombre)}</td><td>${p.categoria}</td>
        <td>${formatoCOP(p.precio)}</td><td>${p.stock}</td><td>${escapar(p.productor)}</td>
        <td>${badge}</td><td><div class="acciones">${botones}</div></td>
      </tr>`);
  });
}

// ---------- 3. Filtros ----------

// Siempre parte del arreglo original, así no se pierden productos
function filtrarProductos() {
  const texto = $("filtro-buscar").value.trim().toLowerCase();
  const categoria = $("filtro-categoria").value;
  const ciudad = $("filtro-ciudad").value;
  const estado = $("filtro-estado").value;

  const resultado = productos.filter((p) =>
    (p.nombre.toLowerCase().includes(texto) || p.productor.toLowerCase().includes(texto)) &&
    (categoria === "" || p.categoria === categoria) &&
    (ciudad === "" || p.ciudad === ciudad) &&
    (estado === "" || calcularEstado(p) === estado)
  );
  renderizarProductos(resultado);
}

function limpiarFiltros() {
  ["filtro-buscar", "filtro-categoria", "filtro-ciudad", "filtro-estado"].forEach((id) => ($(id).value = ""));
  filtrarProductos();
}

// ---------- 4. KPIs y gráfico ----------

function actualizarKPIs() {
  const activos = productos.filter((p) => p.activo);
  const bajos = activos.filter((p) => p.stock <= p.stockMinimo);
  const valor = activos.reduce((suma, p) => suma + p.precio * p.stock, 0);
  $("kpi-total").textContent = activos.length;
  $("kpi-bajo").textContent = bajos.length;
  $("kpi-valor").textContent = formatoCOP(valor);
}

function actualizarGrafico() {
  if (typeof Chart === "undefined") return; // si no cargó Chart.js, no hace nada
  const cantidades = CATEGORIAS.map((c) => productos.filter((p) => p.categoria === c).length);
  if (grafico) {
    grafico.data.datasets[0].data = cantidades;
    grafico.update();
  } else {
    grafico = new Chart($("grafico-categorias"), {
      type: "bar",
      data: { labels: CATEGORIAS, datasets: [{ label: "Productos", data: cantidades, backgroundColor: "#1f5c3f" }] },
      options: { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }
}

// Refresca todo lo que depende de los datos
function actualizarTodo() {
  filtrarProductos();
  actualizarKPIs();
  actualizarGrafico();
}

// ---------- 5. Modal y CRUD ----------

// Sin id = crear; con id = editar (precarga los datos)
function abrirModal(id) {
  $("error-form").textContent = "";
  const form = $("form-producto");
  form.reset();
  if (id) {
    const p = productos.find((x) => x.id === id);
    $("modal-titulo").textContent = "Editar producto";
    $("campo-id").value = p.id;
    $("campo-nombre").value = p.nombre;
    $("campo-categoria").value = p.categoria;
    $("campo-precio").value = p.precio;
    $("campo-stock").value = p.stock;
    $("campo-stockMinimo").value = p.stockMinimo;
    $("campo-productor").value = p.productor;
    $("campo-ciudad").value = p.ciudad;
    $("campo-fechaRegistro").value = p.fechaRegistro;
    $("campo-organico").checked = p.organico;
    $("campo-activo").checked = p.activo;
  } else {
    $("modal-titulo").textContent = "Agregar producto";
    $("campo-id").value = "";
    $("campo-fechaRegistro").value = new Date().toISOString().slice(0, 10); // hoy
    $("campo-activo").checked = true;
  }
  modal.showModal();
}

// Valida el formulario, crea o actualiza y guarda
function guardarProducto() {
  const idEditado = Number($("campo-id").value);
  // Siguiente id = mayor id existente + 1
  const nuevoId = idEditado || Math.max(0, ...productos.map((p) => p.id)) + 1;

  const producto = {
    id: nuevoId,
    nombre: $("campo-nombre").value.trim(),
    categoria: $("campo-categoria").value,
    precio: Number($("campo-precio").value),
    stock: Number($("campo-stock").value),
    stockMinimo: Number($("campo-stockMinimo").value),
    productor: $("campo-productor").value.trim(),
    ciudad: $("campo-ciudad").value,
    organico: $("campo-organico").checked,
    fechaRegistro: $("campo-fechaRegistro").value,
    activo: $("campo-activo").checked
  };

  // Probamos la lista con el producto ya incluido y reutilizamos validarProductos()
  const copia = idEditado ? productos.map((p) => (p.id === idEditado ? producto : p)) : [...productos, producto];
  const hoy = new Date().toISOString().slice(0, 10);
  const errores = validarProductos(copia, hoy).filter((e) => e.id === nuevoId);
  if (errores.length > 0) {
    $("error-form").textContent = errores.map((e) => e.campo + ": " + e.problema).join(" | ");
    return;
  }

  productos = copia;
  guardarProductos();
  modal.close();
  actualizarTodo();
}

function eliminarProducto(id) {
  const p = productos.find((x) => x.id === id);
  if (!confirm("¿Eliminar \"" + p.nombre + "\"? Esta acción no se puede deshacer.")) return;
  productos = productos.filter((x) => x.id !== id);
  guardarProductos();
  actualizarTodo();
}

// ---------- Inicio ----------

// Llena los <select> con las listas permitidas
function llenarSelects() {
  CATEGORIAS.forEach((c) => {
    $("filtro-categoria").add(new Option(c, c));
    $("campo-categoria").add(new Option(c, c));
  });
  CIUDADES.forEach((c) => {
    $("filtro-ciudad").add(new Option(c, c));
    $("campo-ciudad").add(new Option(c, c));
  });
}

async function iniciar() {
  llenarSelects();
  await cargarProductos();
  actualizarTodo();

  // Filtros en tiempo real
  ["filtro-buscar", "filtro-categoria", "filtro-ciudad", "filtro-estado"].forEach((id) => {
    $(id).addEventListener("input", filtrarProductos);
  });
  $("btn-limpiar").addEventListener("click", limpiarFiltros);

  // Cambiar entre tarjetas y tabla
  $("btn-vista").addEventListener("click", () => {
    vistaTabla = !vistaTabla;
    $("lista-tarjetas").hidden = vistaTabla;
    $("contenedor-tabla").hidden = !vistaTabla;
    $("btn-vista").textContent = vistaTabla ? "Ver como tarjetas" : "Ver como tabla";
  });

  // Modal
  $("btn-agregar").addEventListener("click", () => abrirModal());
  $("btn-cancelar").addEventListener("click", () => modal.close());
  $("form-producto").addEventListener("submit", (e) => { e.preventDefault(); guardarProducto(); });

  // Botones Editar y Eliminar (delegación: un solo listener para toda la página)
  document.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("editar")) abrirModal(id);
    if (e.target.classList.contains("eliminar")) eliminarProducto(id);
  });
}

iniciar();
