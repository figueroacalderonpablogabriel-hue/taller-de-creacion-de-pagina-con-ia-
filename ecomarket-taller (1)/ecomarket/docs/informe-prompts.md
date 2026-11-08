# Informe de prompts – Taller EcoMarket

Resumen de las técnicas de Prompt Engineering aplicadas, los prompts base (tomados del taller) y los ajustes hechos a las respuestas de la IA.

| Fase | Técnica | Prompt (resumen) | Ajustes realizados |
|---|---|---|---|
| 1 · Landing – contexto | Priming + meta-prompting | "Actúa como desarrollador frontend senior… confirma tu rol y pregúntame qué falta. No generes código." | Se completaron público (20–55 años), mercado (Colombia) y estilo (natural, limpio). |
| 1 · Landing – diseño | Chain of Thought | Propuesta en 6 puntos: secciones, jerarquía, paleta, tipografías, componentes, accesibilidad. | Se validó contraste: verde `#1f5c3f` sobre blanco y texto oscuro sobre ámbar `#e3a72f`. |
| 1 · Landing – código | Zero-shot (HTML y CSS por separado) | "Genera index.html… devuelve únicamente el archivo." | CSS y JS fuera del HTML; se añadió `landing.js` para validar el formulario. |
| 2 · Dashboard | Role prompting | "Eres un diseñador UX/UI con experiencia en dashboards… describe antes de codificar." | Se reutilizaron las variables de color de la landing para mantener identidad visual. |
| 2 · KPI, tabla, menú | Zero-shot con requisitos | Tres KPI, tabla con badges y menú hamburguesa con `aria-expanded`/`aria-controls`. | La tabla se integró como vista alternativa a las tarjetas; el menú quedó reutilizable (`iniciarMenu`). |
| 3 · Dataset | Few-shot | 5 registros manuales + reglas numeradas para generar 30 más (ids 6–35). | No se incluye campo `estado` (se calcula en la app). Se dejó un producto inactivo (id 23) para probar KPI. |
| 4 · Validación | Role prompting (auditor) + validación en JS | Auditoría en tabla: error, registro, causa, corrección. | Se implementó `validarProductos()` verificable; ver `docs/reporte-validacion.md`. |
| 5 · CRUD | Prompts por función | `cargarProductos`, `filtrarProductos`, `guardarProducto`, etc. | El formulario reutiliza `validarProductos()`; la fecha máxima se amplía a "hoy" para productos nuevos. |

## cambios 
en la primera version de pagina que me genero la ia , en la pagina para los clientes cuando mandaba a la seccion de categorias  solo mostraa las tarjetas pero no habia modo de agregarlas al carrito  asi que lo corregi, para que qel cliente pueda tener la experiencia completa de compra o no se quede solo visualizando los productos sin poder hacer ninguna accion 

## Preguntas de reflexión (borrador)
1. **Zero/one/few-shot:** zero-shot da una primera versión rápida pero genérica; few-shot fija el formato y reduce errores de estructura.
2. **Definir estructura antes:** sin reglas claras la IA inventa campos, categorías o tipos; las reglas permiten validar.
3. **Errores de la validación:** IDs duplicados, números como texto y fechas fuera de rango son fáciles de pasar por alto a simple vista.
4. **Separar datos, lógica y presentación:** cada archivo tiene una sola responsabilidad, se corrige más rápido y se reutiliza.
5. **Límites de localStorage:** solo ~5 MB, solo en ese navegador, sin usuarios ni seguridad, sin consultas ni respaldo.
6. **Para producción:** backend con base de datos, autenticación, validación en servidor, pruebas, accesibilidad auditada y despliegue con HTTPS.
