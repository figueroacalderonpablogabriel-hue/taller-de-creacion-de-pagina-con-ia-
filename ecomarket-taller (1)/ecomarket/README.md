# EcoMarket – Taller práctico

Plataforma web para comercio sostenible: landing page, panel administrativo con CRUD, dataset validado y gráfico con Chart.js. HTML5, CSS3 y JavaScript vanilla.

## Estructura
| Archivo | Función |
|---|---|
| `index.html`, `styles.css`, `landing.js` | Landing page |
| `admin.html`, `admin.css`, `menu.js`, `app.js` | Panel: KPI, filtros, tarjetas/tabla, modal CRUD, gráfico |
| `productos.json` | 35 productos (5 manuales + 30 generados con IA) |
| `validacion.js` | `validarProductos(lista)` |
| `docs/` | Informe de prompts y reporte de validación |
| `capturas/` | Capturas de pantalla (pendientes de agregar) |

## Cómo ejecutarlo
`fetch()` necesita servidor local: abre la carpeta en VS Code y usa **Live Server** sobre `index.html`.

## Probar la validación
`node -e "console.log(require('./validacion.js').validarProductos(require('./productos.json')))"` → `[]`

## Subir a GitHub
```bash
git init
git add .
git commit -m "Taller EcoMarket: landing, panel CRUD, dataset y validación"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ecomarket-taller.git
git push -u origin main
```
