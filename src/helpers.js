// Helpers de Handlebars: funciones que se pueden usar dentro de las plantillas

// {{iniciales nombre}} -> "Jaider Bautista" = "JB"
export function iniciales(nombre) {
  return String(nombre ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

// {{colorAvatar nombre}} -> siempre el mismo color para el mismo nombre
export function colorAvatar(nombre) {
  let hash = 0;
  for (const letra of String(nombre ?? "")) {
    hash = (hash * 31 + letra.charCodeAt(0)) % 360;
  }
  return `hsl(${hash}, 65%, 50%)`;
}
