const contenedor = document.getElementById("contenido");

async function cargarPais() {
  mostrarCargando(contenedor, "Cargando datos de Colombia...");

  try {
    const pais = await obtenerDatos("/Country/Colombia");
    dibujarPais(pais);
  } catch (error) {
    console.error("Error al cargar Colombia:", error);
    mostrarError(contenedor, error.message, cargarPais);
  }
}

function aTexto(valor) {
  if (Array.isArray(valor)) return valor.map(aTexto).filter(Boolean).join(", ");
  if (valor && typeof valor === "object") return valor.name || "";
  return valor ? String(valor) : "";
}

function dibujarPais(pais) {
  contenedor.replaceChildren();

  const hero = document.createElement("div");
  hero.className = "country-hero";

  const urlBandera =
    Array.isArray(pais.flags) && pais.flags.length
      ? pais.flags[0]
      : "https://flagcdn.com/w640/co.png";
  const bandera = crearImagen(urlBandera, "Bandera de Colombia", "country-flag", "Bandera no disponible", {
    carga: "eager",
    alternativas: ["https://flagcdn.com/w640/co.png"],
  });

  const texto = document.createElement("div");

  const capital = document.createElement("p");
  capital.className = "country-capital";
  capital.textContent = `Capital: ${pais.stateCapital || "Bogotá"}`;

  const nombre = document.createElement("h2");
  nombre.className = "country-name";
  nombre.textContent = pais.name || "Colombia";

  const descripcion = document.createElement("p");
  descripcion.className = "country-desc";
  descripcion.textContent = pais.description || "Sin descripción disponible.";

  texto.append(capital, nombre, descripcion);
  hero.append(bandera, texto);

  const moneda = [pais.currency, pais.currencyCode ? `(${pais.currencyCode})` : ""]
    .filter(Boolean).join(" ");

  const datos = [
    ["Población", formatearNumero(pais.population)],
    ["Superficie", typeof pais.surface === "number" ? `${formatearNumero(pais.surface)} km²` : null],
    ["Moneda", moneda],
    ["Símbolo de la moneda", pais.currencySymbol],
    ["Idiomas", aTexto(pais.languages)],
    ["Zona horaria", pais.timeZone],
    ["Continente", aTexto(pais.continents ?? pais.continent)],
    ["Región", pais.region],
    ["Subregión", pais.subRegion],
    ["Código ISO", pais.isoCode],
    ["Dominio de internet", pais.internetDomain],
    ["Prefijo telefónico", pais.phonePrefix],
    ["Prefijo de radio", pais.radioPrefix],
    ["Prefijo de aeronaves", pais.aircraftPrefix],
    ["Países vecinos", aTexto(pais.borders)],
  ];

  const lista = document.createElement("dl");
  lista.className = "facts";

  datos.forEach(([etiqueta, valor]) => {
    if (!valor) return;

    const fila = document.createElement("div");
    fila.className = "fact";

    const dt = document.createElement("dt");
    dt.textContent = etiqueta;

    const dd = document.createElement("dd");
    dd.textContent = valor;

    fila.append(dt, dd);
    lista.append(fila);
  });

  contenedor.append(hero, lista);
}

cargarPais();
