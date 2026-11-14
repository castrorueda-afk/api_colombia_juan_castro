# Mini Portal de Colombia

## Descripción

Sitio web informativo sobre Colombia que consume datos en vivo desde la API pública [api-colombia.com](https://api-colombia.com/) y los muestra de forma dinámica en el DOM con JavaScript.

El portal tiene tres páginas conectadas por hipervínculos:

| Página | Archivo | Endpoint | Contenido |
|---|---|---|---|
| Inicio | `index.html` | `/api/v1/TouristicAttraction` | Carrusel, galería y enlaces a las dos secciones |
| Colombia en datos | `pagina1.html` | `/api/v1/Country/Colombia` | Bandera, capital, población, superficie, moneda, idiomas, zona horaria y más |
| Sabores de Colombia | `pagina2.html` | `/api/v1/TypicalDish` y `/api/v1/Department` | Platos típicos con nombre, descripción, departamento e imagen. Incluye contador de platos y buscador |

**Características técnicas**

- Datos obtenidos con `fetch` usando `async/await`.
- Mensaje de "Cargando..." mientras se consulta la API.
- Manejo de errores con `try/catch` y botón para reintentar.
- Contenido creado dinámicamente con `createElement` (sin `innerHTML`).
- Imágenes rotas reemplazadas automáticamente por una imagen alternativa.
- Carrusel automático y manual en el inicio, con botones, puntos y teclado.
- Galería de imágenes con visor ampliado.
- Filtro de platos típicos por región.
- Diseño responsivo con CSS Grid, Flexbox y variables CSS.

## Tecnologías usadas

- HTML5
- CSS3 (variables, Grid, Flexbox, media queries)
- JavaScript vanilla (ES6+)
- [api-colombia.com](https://api-colombia.com/)
- Google Fonts (Bricolage Grotesque y Source Sans 3)

## Estructura del proyecto

```
juan-castro-api-colombia/
├── index.html
├── pagina1.html
├── pagina2.html
├── css/
│   └── styles.css
├── js/
│   ├── utils.js       (fetch, carga, errores e imágenes)
│   ├── inicio.js      (carrusel y galería)
│   ├── colombia.js    (lógica de la página 1)
│   └── sabores.js     (lógica de la página 2)
└── README.md
```

## Instrucciones de uso

1. Clona o descarga el repositorio:
   ```bash
   git clone https://github.com/TU-USUARIO/juan-castro-api-colombia.git
   ```
2. Abre la carpeta del proyecto.
3. Abre `index.html` en el navegador (doble clic) o usa la extensión **Live Server** de VS Code.
4. Navega entre las secciones con los enlaces del menú.

> Se necesita conexión a internet para consultar la API.

## Capturas

_(Opcional: agrega aquí capturas de pantalla de cada página.)_

## Autor

**Juan Manuel Castro Rueda**
