const contenedor = document.getElementById("contenido");
const contador = document.getElementById("contador");

let todosLosPlatos = [];
let regionActiva = "Todas";
let textoBusqueda = "";
let grilla = null;
let botonesRegion = [];

async function cargarPlatos() {
  contador.textContent = "";
  mostrarCargando(contenedor, "Cargando platos típicos...");

  try {
    const [platos, departamentos, regiones] = await Promise.all([
      obtenerDatos("/TypicalDish"),
      obtenerDatos("/Department").catch(() => []),
      obtenerDatos("/Region").catch(() => []),
    ]);

    const nombresRegion = new Map(regiones.map((r) => [r.id, r.name]));

    const infoDepartamento = new Map(
      departamentos.map((d) => [
        d.id,
        {
          nombre: d.name,
          region: d.region?.name || nombresRegion.get(d.regionId) || "Sin región",
        },
      ])
    );

    todosLosPlatos = platos.map((plato) => {
      const info = infoDepartamento.get(plato.departmentId ?? plato.department?.id);
      return {
        ...plato,
        nombreDepartamento: info?.nombre || plato.department?.name || "Departamento no indicado",
        region: info?.region || "Sin región",
      };
    });

    regionActiva = "Todas";
    textoBusqueda = "";
    prepararVista();
  } catch (error) {
    console.error("Error al cargar los platos:", error);
    mostrarError(contenedor, error.message, cargarPlatos);
  }
}

function prepararVista() {
  contenedor.replaceChildren();

  const regiones = [...new Set(todosLosPlatos.map((p) => p.region))]
    .sort((a, b) => a.localeCompare(b, "es"));

  const filtros = document.createElement("div");
  filtros.className = "filters";
  filtros.setAttribute("role", "group");
  filtros.setAttribute("aria-label", "Filtrar por región");

  botonesRegion = ["Todas", ...regiones].map((region) => {
    const cantidad = region === "Todas"
      ? todosLosPlatos.length
      : todosLosPlatos.filter((p) => p.region === region).length;

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "chip";
    boton.dataset.region = region;
    boton.textContent = `${region} (${cantidad})`;
    boton.setAttribute("aria-pressed", String(region === regionActiva));
    boton.addEventListener("click", () => {
      regionActiva = region;
      aplicarFiltros();
    });

    filtros.append(boton);
    return boton;
  });

  const buscador = document.createElement("input");
  buscador.type = "search";
  buscador.className = "search";
  buscador.placeholder = "Buscar por plato o departamento";
  buscador.setAttribute("aria-label", "Buscar por plato o departamento");
  buscador.addEventListener("input", () => {
    textoBusqueda = buscador.value;
    aplicarFiltros();
  });

  grilla = document.createElement("div");
  grilla.className = "dish-grid";

  contenedor.append(filtros, buscador, grilla);
  aplicarFiltros();
}

function aplicarFiltros() {
  const q = textoBusqueda.trim().toLowerCase();

  const resultado = todosLosPlatos.filter((plato) => {
    const coincideRegion = regionActiva === "Todas" || plato.region === regionActiva;
    const coincideTexto = !q || `${plato.name} ${plato.nombreDepartamento}`.toLowerCase().includes(q);
    return coincideRegion && coincideTexto;
  });

  botonesRegion.forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.dataset.region === regionActiva));
  });

  dibujarPlatos(resultado);
}

function dibujarPlatos(platos) {
  grilla.replaceChildren();

  contador.textContent =
    platos.length === todosLosPlatos.length
      ? `${platos.length} platos típicos`
      : `${platos.length} de ${todosLosPlatos.length} platos típicos`;

  if (platos.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "empty";
    vacio.textContent = "No hay platos que coincidan. Prueba con otra región o con otro nombre.";
    grilla.append(vacio);
    return;
  }

  const fragmento = document.createDocumentFragment();

  platos.forEach((plato) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "dish";

    const imagen = crearImagen(plato.imageUrl, `Plato típico: ${plato.name}`, "dish__img", "Sin imagen", { nombre: plato.name, contexto: "Colombia" });

    const cuerpo = document.createElement("div");
    cuerpo.className = "dish__body";

    const nombre = document.createElement("h2");
    nombre.className = "dish__name";
    nombre.textContent = plato.name;

    const etiquetas = document.createElement("div");
    etiquetas.className = "dish__tags";

    const depto = document.createElement("span");
    depto.className = "dish__dept";
    depto.textContent = plato.nombreDepartamento;

    const region = document.createElement("span");
    region.className = "dish__region";
    region.textContent = plato.region;

    etiquetas.append(depto, region);

    const descripcion = document.createElement("p");
    descripcion.className = "dish__desc";
    descripcion.textContent = plato.description || "Sin descripción disponible.";

    cuerpo.append(nombre, etiquetas, descripcion);
    tarjeta.append(imagen, cuerpo);
    fragmento.append(tarjeta);
  });

  grilla.append(fragmento);
}

cargarPlatos();
