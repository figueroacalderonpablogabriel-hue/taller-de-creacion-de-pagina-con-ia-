// validacion.js
// Revisa que una lista de productos cumpla las reglas del dataset de EcoMarket.

// Listas permitidas (también las usa app.js para llenar los <select>)
const CATEGORIAS = ["Frutas y verduras", "Despensa", "Cuidado personal", "Hogar sostenible"];
const CIUDADES = ["Bucaramanga", "Floridablanca", "Girón", "Bogotá", "Medellín", "Cali", "Tunja", "Cúcuta"];

// Rango de fechas permitido
const FECHA_MIN = "2026-01-01";
const FECHA_MAX = "2026-11-31";

// Devuelve true si el texto tiene formato AAAA-MM-DD y es una fecha real
function esFechaValida(texto) {
  if (typeof texto !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(texto + "T00:00:00");
  // Si la fecha no existe (ej. 2026-02-31) JavaScript la corrige y ya no coincide
  return !isNaN(fecha) && fecha.toISOString().slice(0, 10) === texto;
}

// Valida un texto con longitud entre 3 y 80
function textoValido(valor) {
  return typeof valor === "string" && valor.trim().length >= 3 && valor.trim().length <= 80;
}

// Recibe el arreglo de productos y devuelve un arreglo de errores.
// Cada error: { indice, id, campo, problema }. Si no hay errores, devuelve [].
function validarProductos(lista, fechaMax = FECHA_MAX) {
  const errores = [];
  const idsVistos = new Set();

  lista.forEach((p, indice) => {
    // Función corta para agregar un error
    const error = (campo, problema) => errores.push({ indice, id: p.id, campo, problema });

    // id: entero, mayor que 0 y único
    if (!Number.isInteger(p.id) || p.id <= 0) error("id", "Debe ser un entero mayor que 0");
    else if (idsVistos.has(p.id)) error("id", "ID repetido");
    idsVistos.add(p.id);

    // nombre y productor: 3 a 80 caracteres
    if (!textoValido(p.nombre)) error("nombre", "Debe tener entre 3 y 80 caracteres");
    if (!textoValido(p.productor)) error("productor", "Debe tener entre 3 y 80 caracteres");

    // categoria y ciudad: deben estar en las listas
    if (!CATEGORIAS.includes(p.categoria)) error("categoria", "Categoría no válida: " + p.categoria);
    if (!CIUDADES.includes(p.ciudad)) error("ciudad", "Ciudad no válida: " + p.ciudad);

    // precio: entero positivo
    if (!Number.isInteger(p.precio) || p.precio <= 0) error("precio", "Debe ser un entero mayor que 0");

    // stock y stockMinimo: enteros >= 0
    if (!Number.isInteger(p.stock) || p.stock < 0) error("stock", "Debe ser un entero mayor o igual a 0");
    if (!Number.isInteger(p.stockMinimo) || p.stockMinimo < 0) error("stockMinimo", "Debe ser un entero mayor o igual a 0");

    // organico y activo: booleanos reales (no texto)
    if (typeof p.organico !== "boolean") error("organico", "Debe ser true o false (booleano)");
    if (typeof p.activo !== "boolean") error("activo", "Debe ser true o false (booleano)");

    // fechaRegistro: fecha real dentro del rango
    if (!esFechaValida(p.fechaRegistro)) error("fechaRegistro", "Formato inválido (use AAAA-MM-DD)");
    else if (p.fechaRegistro < FECHA_MIN || p.fechaRegistro > fechaMax)
      error("fechaRegistro", "Fuera del rango " + FECHA_MIN + " a " + fechaMax);
  });

  return errores;
}

// Permite probar el archivo con Node (en el navegador esto se ignora)
if (typeof module !== "undefined") module.exports = { validarProductos, CATEGORIAS, CIUDADES };
