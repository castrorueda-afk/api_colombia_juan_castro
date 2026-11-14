const INTERVALO_MS = 5000;
const CANTIDAD_CARRUSEL = 6;
const CANTIDAD_GALERIA = 18;

const carruselEl = document.getElementById("carrusel");
const galeriaEl = document.getElementById("galeria");
const seccionGaleria = document.getElementById("seccion-galeria");
const visor = document.getElementById("visor");
const visorImg = document.getElementById("visor-img");
const visorTitulo = document.getElementById("visor-titulo");
const visorCerrar = document.getElementById("visor-cerrar");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

let temporizador = null;

function extraerUrl(elemento) {
  const lista = Array.isArray(elemento.images) ? elemento.images : [];
  const candidatas = [...lista, elemento.imageUrl];
  return candidatas.find((u) => typeof u === "string" && u.trim()) || null;
}

async function obtenerImagenes() {
  const [atracciones, platos] = await Promise.all([
    obtenerDatos("/TouristicAttraction"),
    obtenerDatos("/TypicalDish").catch(() => []),
  ]);

  const vistas = new Set();
  const imagenes = [];

  const agregar = (url, titulo, detalle, contexto) => {
    if (!url || vistas.has(url)) return;
    vistas.add(url);
    imagenes.push({ url, titulo, detalle, contexto });
  };

  atracciones.forEach((a) => agregar(extraerUrl(a), a.name, a.city?.name || "Atractivo turístico", a.city?.name || "Colombia"));

  if (imagenes.length < CANTIDAD_CARRUSEL + CANTIDAD_GALERIA) {
    platos.forEach((p) => agregar(extraerUrl(p), p.name, "Plato típico", "Colombia"));
  }

  if (imagenes.length === 0) {
    throw new Error("La API no devolvió imágenes");
  }

  return imagenes;
}

async function cargarInicio() {
  detenerCarrusel();
  seccionGaleria.hidden = false;
  mostrarCargando(carruselEl, "Cargando imágenes de Colombia...");
  mostrarCargando(galeriaEl, "Cargando galería...");

  try {
    const imagenes = await obtenerImagenes();

    const paraCarrusel = imagenes.slice(0, CANTIDAD_CARRUSEL);
    let paraGaleria = imagenes.slice(CANTIDAD_CARRUSEL, CANTIDAD_CARRUSEL + CANTIDAD_GALERIA);
    if (paraGaleria.length < 6) {
      paraGaleria = imagenes.slice(0, CANTIDAD_GALERIA);
    }

    dibujarCarrusel(paraCarrusel);
    dibujarGaleria(paraGaleria);
  } catch (error) {
    console.error("Error al cargar las imágenes:", error);
    galeriaEl.replaceChildren();
    seccionGaleria.hidden = true;
    mostrarError(carruselEl, error.message, cargarInicio);
  }
}

function detenerCarrusel() {
  clearInterval(temporizador);
  temporizador = null;
}

function dibujarCarrusel(items) {
  carruselEl.replaceChildren();

  const contenedorCarrusel = document.createElement("div");
  contenedorCarrusel.className = "carousel";

  const marco = document.createElement("div");
  marco.className = "carousel__frame";
  marco.setAttribute("role", "region");
  marco.setAttribute("aria-roledescription", "carrusel");
  marco.setAttribute("aria-label", "Imágenes de Colombia");
  marco.tabIndex = 0;

  const diapositivas = items.map((item) => {
    const figura = document.createElement("figure");
    figura.className = "carousel__slide";

    const imagen = crearImagen(item.url, item.titulo, "carousel__img", "Sin imagen", { nombre: item.titulo, contexto: item.contexto, carga: "eager" });

    const leyenda = document.createElement("figcaption");
    leyenda.className = "carousel__caption";

    const nombre = document.createElement("span");
    nombre.className = "carousel__name";
    nombre.textContent = item.titulo;

    const lugar = document.createElement("span");
    lugar.className = "carousel__place";
    lugar.textContent = item.detalle;

    leyenda.append(nombre, lugar);
    figura.append(imagen, leyenda);
    marco.append(figura);
    return figura;
  });

  const anterior = document.createElement("button");
  anterior.type = "button";
  anterior.className = "carousel__btn carousel__btn--prev";
  anterior.setAttribute("aria-label", "Imagen anterior");
  anterior.textContent = "‹";

  const siguiente = document.createElement("button");
  siguiente.type = "button";
  siguiente.className = "carousel__btn carousel__btn--next";
  siguiente.setAttribute("aria-label", "Imagen siguiente");
  siguiente.textContent = "›";

  marco.append(anterior, siguiente);

  const puntos = document.createElement("div");
  puntos.className = "carousel__dots";

  const botonesPunto = items.map((item, indice) => {
    const punto = document.createElement("button");
    punto.type = "button";
    punto.className = "carousel__dot";
    punto.setAttribute("aria-label", `Ir a la imagen ${indice + 1}: ${item.titulo}`);
    punto.addEventListener("click", () => {
      mostrar(indice);
      iniciarCarrusel();
    });
    puntos.append(punto);
    return punto;
  });

  let actual = 0;

  function mostrar(indice) {
    actual = (indice + diapositivas.length) % diapositivas.length;
    diapositivas.forEach((diapositiva, i) => {
      const activa = i === actual;
      diapositiva.classList.toggle("is-active", activa);
      diapositiva.setAttribute("aria-hidden", String(!activa));
      botonesPunto[i].classList.toggle("is-active", activa);
      botonesPunto[i].setAttribute("aria-current", String(activa));
    });
  }

  function iniciarCarrusel() {
    detenerCarrusel();
    if (reducirMovimiento.matches || diapositivas.length < 2) return;
    temporizador = setInterval(() => mostrar(actual + 1), INTERVALO_MS);
  }

  anterior.addEventListener("click", () => {
    mostrar(actual - 1);
    iniciarCarrusel();
  });

  siguiente.addEventListener("click", () => {
    mostrar(actual + 1);
    iniciarCarrusel();
  });

  marco.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowLeft") {
      mostrar(actual - 1);
      iniciarCarrusel();
    } else if (evento.key === "ArrowRight") {
      mostrar(actual + 1);
      iniciarCarrusel();
    }
  });

  contenedorCarrusel.addEventListener("mouseenter", detenerCarrusel);
  contenedorCarrusel.addEventListener("mouseleave", iniciarCarrusel);
  contenedorCarrusel.addEventListener("focusin", detenerCarrusel);
  contenedorCarrusel.addEventListener("focusout", iniciarCarrusel);

  contenedorCarrusel.append(marco, puntos);
  carruselEl.append(contenedorCarrusel);

  mostrar(0);
  iniciarCarrusel();
}

function dibujarGaleria(items) {
  galeriaEl.replaceChildren();

  const grilla = document.createElement("div");
  grilla.className = "gallery";

  items.forEach((item) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "gallery__item";
    boton.setAttribute("aria-label", `Ampliar imagen: ${item.titulo}`);

    const imagen = crearImagen(item.url, item.titulo, "gallery__img", "Sin imagen", { nombre: item.titulo, contexto: item.contexto });

    const leyenda = document.createElement("span");
    leyenda.className = "gallery__caption";
    leyenda.textContent = item.titulo;

    boton.append(imagen, leyenda);
    boton.addEventListener("click", () => abrirVisor(item, imagen.currentSrc || imagen.src));
    grilla.append(boton);
  });

  galeriaEl.append(grilla);
}

function abrirVisor(item, url) {
  visorImg.src = url || item.url;
  visorImg.alt = item.titulo;
  visorTitulo.textContent = item.detalle ? `${item.titulo} · ${item.detalle}` : item.titulo;
  visor.showModal();
}

visorImg.addEventListener("error", () => {
  if (!visorImg.src.startsWith("data:")) {
    visorImg.src = imagenRespaldo("Sin imagen");
  }
});

visorCerrar.addEventListener("click", () => visor.close());

visor.addEventListener("click", (evento) => {
  if (evento.target === visor) visor.close();
});

cargarInicio();
