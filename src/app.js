import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { create } from "express-handlebars";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { leerMensajes, guardarMensaje } from "./mensajes.js";
import * as helpers from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Handlebars
const viewsDir = path.join(__dirname, "views");
const hbs = create({
  extname: ".handlebars",
  partialsDir: path.join(viewsDir, "partials"),
  helpers,
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", viewsDir);

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", async (req, res) => {
  const mensajes = await leerMensajes();
  res.render("home", { mensajes });
});

// Socket.IO
let conectados = 0;

io.on("connection", (socket) => {
  conectados++;
  io.emit("conectados", conectados);

  socket.on("nuevoMensaje", async (datos) => {
    const nombre = String(datos?.nombre ?? "").trim();
    const publicidad = String(datos?.publicidad ?? "").trim();
    const mensaje = String(datos?.mensaje ?? "").trim();

    if (!nombre || !mensaje) {
      socket.emit("errorMensaje", "El nombre y el mensaje son obligatorios");
      return;
    }

    const nuevo = {
      nombre: nombre.slice(0, 40),
      publicidad: publicidad.slice(0, 120),
      mensaje: mensaje.slice(0, 500),
      hora: new Date().toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Bogota",
      }),
    };

    await guardarMensaje(nuevo);

    // Se usa la misma plantilla Handlebars del historial para el mensaje nuevo
    const html = await hbs.render(path.join(viewsDir, "partials", "mensaje.handlebars"), nuevo);
    io.emit("mensaje", { ...nuevo, html });
  });

  socket.on("disconnect", () => {
    conectados--;
    io.emit("conectados", conectados);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chat escuchando en http://localhost:${PORT}`);
});
