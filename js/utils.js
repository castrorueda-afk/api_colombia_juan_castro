const API_BASE = "https://api-colombia.com/api/v1";

async function obtenerDatos(endpoint) {
  const respuesta = await fetch(`${API_BASE}${endpoint}`);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con el código ${respuesta.status}`);
  }
  return respuesta.json();
}

function mostrarCargando(contenedor, texto = "Cargando...") {
  contenedor.replaceChildren();

  const caja = document.createElement("div");
  caja.className = "loading";
  caja.setAttribute("role", "status");

  const spinner = document.createElement("span");
  spinner.className = "spinner";
  spinner.setAttribute("aria-hidden", "true");

  const mensaje = document.createElement("span");
  mensaje.textContent = texto;

  caja.append(spinner, mensaje);
  contenedor.append(caja);
}

function mostrarError(contenedor, detalle, alReintentar) {
  contenedor.replaceChildren();

  const caja = document.createElement("div");
  caja.className = "error";
  caja.setAttribute("role", "alert");

  const titulo = document.createElement("h2");
  titulo.textContent = "No se pudieron cargar los datos";

  const texto = document.createElement("p");
  texto.textContent = `${detalle}. Revisa tu conexión a internet e inténtalo de nuevo.`;

  const boton = document.createElement("button");
  boton.className = "btn";
  boton.type = "button";
  boton.textContent = "Reintentar";
  boton.addEventListener("click", alReintentar);

  caja.append(titulo, texto, boton);
  contenedor.append(caja);
}

function imagenRespaldo(texto) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="#dfe8e2"/>
      <circle cx="320" cy="210" r="48" fill="#b9cbc1"/>
      <text x="320" y="320" text-anchor="middle" font-family="sans-serif"
            font-size="26" fill="#4a5b52">${texto}</text>
    </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const FUENTES = new Map([
  ["tamal tolimense", ["Tamal tolimense", "Tamal", "https://cdn.colombia.com/gastronomia/2011/07/27/tamal-tolimense-1527.jpg"]],
  ["arroz de lisa", ["Arroz de lisa", "Mugil cephalus"]],
  ["dulce de guayaba", ["Dulce de guayaba", "Bocadillo veleño", "Guayaba"]],
  ["hacienda napoles", ["Hacienda Nápoles", "Hacienda Nápoles Puerto Triunfo"]],
  ["la ventana del mundo", ["La Ventana del Mundo Colombia", "Ventana del Mundo mirador Colombia"]],
  ["volcan del totumo", ["Volcán del Totumo", "Volcán de lodo del Totumo Bolívar"]],
  ["nevado del cocuy", ["Sierra Nevada del Cocuy", "Parque Nacional Natural El Cocuy"]],
  ["nevado del ruiz", ["Nevado del Ruiz", "Parque Nacional Natural Los Nevados"]],
  ["purace", ["Parque Nacional Natural Puracé", "Volcán Puracé"]],
  ["centro historico de popayan", ["Centro histórico de Popayán", "Popayán"]],
  ["villa de leyva", ["Villa de Leyva", "Villa de Leyva Boyacá"]],
  ["jaime duque", ["Parque Jaime Duque", "Parque Jaime Duque Tocancipá"]],
  ["cerro azul", ["Cerro Azul San José del Guaviare", "Serranía de la Lindosa", "Guaviare"]],
  ["jerico", ["Jericó Antioquia", "Jericó (Antioquia)"]],
]);

const cacheWikipedia = new Map();

function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buscarFuentes(nombre) {
  const n = normalizar(nombre);
  if (!n) return null;
  for (const [clave, fuentes] of FUENTES) {
    if (n === clave || n.includes(clave)) return fuentes;
  }
  return null;
}

function buscarImagenWikipedia(consulta) {
  const clave = normalizar(consulta);
  if (!cacheWikipedia.has(clave)) {
    cacheWikipedia.set(clave, consultarWikipedia(consulta));
  }
  return cacheWikipedia.get(clave);
}

async function consultarWikipedia(consulta) {
  for (const idioma of ["es", "en"]) {
    try {
      const parametros = new URLSearchParams({
        action: "query",
        format: "json",
        origin: "*",
        generator: "search",
        gsrsearch: consulta,
        gsrlimit: "5",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "900",
      });
      const respuesta = await fetch(`https://${idioma}.wikipedia.org/w/api.php?${parametros}`);
      if (!respuesta.ok) continue;
      const datos = await respuesta.json();
      const paginas = Object.values(datos.query?.pages || {}).sort((a, b) => a.index - b.index);
      const conImagen = paginas.find((p) => p.thumbnail?.source);
      if (conImagen) return conImagen.thumbnail.source;
    } catch (error) {
      console.error("Error al buscar imagen en Wikipedia:", error);
    }
  }
  return null;
}

function crearImagen(url, textoAlt, clase, textoRespaldo = "Imagen no disponible", opciones = {}) {
  const { nombre = "", contexto = "", carga = "lazy", alternativas = [] } = opciones;

  const img = document.createElement("img");
  img.className = clase;
  img.alt = textoAlt;
  img.loading = carga;
  img.referrerPolicy = "no-referrer";

  const respaldo = imagenRespaldo(textoRespaldo);
  const forzadas = buscarFuentes(nombre);

  const cola = forzadas
    ? [...forzadas]
    : [url, ...alternativas, nombre && `${nombre} ${contexto}`.trim(), nombre];

  let agotada = false;
  let buscando = false;

  async function avanzar() {
    if (buscando || agotada) return;
    buscando = true;

    while (cola.length) {
      const fuente = cola.shift();
      if (!fuente || !String(fuente).trim()) continue;

      if (/^https?:/i.test(fuente)) {
        img.src = fuente;
        buscando = false;
        return;
      }

      const encontrada = await buscarImagenWikipedia(fuente);
      if (encontrada) {
        img.src = encontrada;
        buscando = false;
        return;
      }
    }

    agotada = true;
    buscando = false;
    img.src = respaldo;
  }

  img.addEventListener("error", avanzar);
  avanzar();

  return img;
}

function formatearNumero(numero) {
  return typeof numero === "number" ? numero.toLocaleString("es-CO") : "No disponible";
}
