// landing.js - validación básica del formulario de suscripción
const form = document.getElementById("form-suscripcion");
const mensaje = document.getElementById("mensaje-form");

form.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  const nombre = form.nombre.value.trim();
  const correo = form.correo.value.trim();
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  if (nombre.length < 3) {
    mensaje.textContent = "Escribe tu nombre (mínimo 3 letras).";
    mensaje.className = "mensaje-error";
  } else if (!correoValido) {
    mensaje.textContent = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    mensaje.className = "mensaje-error";
  } else {
    mensaje.textContent = "¡Gracias, " + nombre + "! Ya estás suscrito.";
    mensaje.className = "mensaje-ok";
    form.reset();
  }
});
