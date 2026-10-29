import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const archivo = path.join(__dirname, "..", "data", "mensajes.json");

let cola = Promise.resolve();

export async function leerMensajes() {
  try {
    const contenido = await fs.readFile(archivo, "utf-8");
    return JSON.parse(contenido);
  } catch {
    return [];
  }
}

// Las escrituras se encadenan para que dos mensajes simultáneos no se pisen
export function guardarMensaje(mensaje) {
  cola = cola.then(async () => {
    const mensajes = await leerMensajes();
    mensajes.push(mensaje);
    await fs.mkdir(path.dirname(archivo), { recursive: true });
    await fs.writeFile(archivo, JSON.stringify(mensajes, null, 2));
  });
  return cola;
}
