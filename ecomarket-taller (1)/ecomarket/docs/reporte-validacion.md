# Reporte de validación

Ejecución de `validarProductos()` sobre dos versiones del dataset.

## 1. Versión ANTES (`docs/productos_antes.json`)
Copia de prueba con 6 errores sembrados a propósito para comprobar que la función los detecta.

| Índice | ID | Campo | Problema |
|---|---|---|---|
| 7 | 7 | id | ID repetido |
| 11 | 12 | categoria | Categoría no válida: Lácteos |
| 14 | 15 | precio | Debe ser un entero mayor que 0 |
| 19 | 20 | fechaRegistro | Fuera del rango 2026-01-01 a 2026-11-03 |
| 22 | 23 | activo | Debe ser true o false (booleano) |
| 27 | 28 | ciudad | Ciudad no válida: Pereira |

Total: **6 errores**.

## 2. Documentación de errores

| Error encontrado | Registro(s) afectado(s) | Causa probable | Corrección aplicada |
|---|---|---|---|
| ID repetido | índice 7 (id 7 duplicado) | Se repitió un número al numerar | Restaurar id 8 |
| Categoría no válida (Lácteos) | índice 11 | Categoría inventada fuera de la lista | Cambiar a Despensa |
| Precio como texto ("19000") | índice 14 | Tipo equivocado al generar el JSON | Convertir a número 19000 |
| Fecha fuera de rango (2026-12-15) | índice 19 | No se respetó el límite 2026-11-03 | Cambiar a 2026-06-15 |
| activo como texto ("true") | índice 22 | Booleano escrito entre comillas | Cambiar a true |
| Ciudad no permitida (Pereira) | índice 27 | Ciudad fuera de la lista del ejercicio | Cambiar a Cali |

## 3. Versión DESPUÉS (productos.json)

Resultado: **0 errores**. El dataset final de 35 productos cumple todas las reglas.
