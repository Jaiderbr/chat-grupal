const socket = io();

const form = document.getElementById("formChat");
const inputNombre = document.getElementById("nombre");
const inputPublicidad = document.getElementById("publicidad");
const inputMensaje = document.getElementById("mensaje");
const contenedor = document.getElementById("mensajes");
const error = document.getElementById("error");

// Recordar el nombre entre recargas
inputNombre.value = localStorage.getItem("nombre") || "";

// Resalta los mensajes escritos por el usuario actual
function marcarPropios() {
  const nombre = inputNombre.value.trim();
  contenedor.querySelectorAll(".mensaje").forEach((el) => {
    el.classList.toggle("propio", nombre !== "" && el.dataset.nombre === nombre);
  });
}

function bajarAlFinal() {
  contenedor.scrollTop = contenedor.scrollHeight;
}

inputNombre.addEventListener("input", () => {
  localStorage.setItem("nombre", inputNombre.value.trim());
  marcarPropios();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = inputNombre.value.trim();
  const mensaje = inputMensaje.value.trim();

  if (!nombre || !mensaje) {
    error.textContent = "El nombre y el mensaje son obligatorios";
    return;
  }

  error.textContent = "";
  socket.emit("nuevoMensaje", {
    nombre,
    publicidad: inputPublicidad.value.trim(),
    mensaje,
  });
  inputMensaje.value = "";
  inputMensaje.focus();
});

socket.on("mensaje", (msg) => {
  document.getElementById("vacio")?.remove();
  contenedor.insertAdjacentHTML("beforeend", msg.html);
  marcarPropios();
  bajarAlFinal();
});

socket.on("conectados", (total) => {
  document.getElementById("conectados").textContent = total;
});

socket.on("errorMensaje", (texto) => {
  error.textContent = texto;
});

marcarPropios();
bajarAlFinal();
