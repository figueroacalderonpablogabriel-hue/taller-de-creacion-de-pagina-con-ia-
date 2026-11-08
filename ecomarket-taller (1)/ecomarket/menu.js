// menu.js - menú hamburguesa reutilizable (sin jQuery)
// Uso: iniciarMenu("id-del-boton", "id-del-sidebar")

function iniciarMenu(idBoton, idSidebar) {
  const boton = document.getElementById(idBoton);
  const sidebar = document.getElementById(idSidebar);

  // Abre o cierra el menú y actualiza el icono y aria-expanded
  function cambiar(abrir) {
    sidebar.classList.toggle("abierto", abrir);
    boton.textContent = abrir ? "×" : "☰";
    boton.setAttribute("aria-expanded", String(abrir));
    boton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
  }

  // 1) Clic en el botón: alterna
  boton.addEventListener("click", () => cambiar(!sidebar.classList.contains("abierto")));

  // 2) Clic fuera del sidebar (solo en pantallas pequeñas): cierra
  document.addEventListener("click", (e) => {
    const esPequena = window.innerWidth < 900;
    if (esPequena && !sidebar.contains(e.target) && !boton.contains(e.target)) cambiar(false);
  });

  // 3) Clic en una opción del menú: cierra
  sidebar.querySelectorAll("a").forEach((enlace) => enlace.addEventListener("click", () => cambiar(false)));
}

iniciarMenu("btn-menu", "sidebar");
