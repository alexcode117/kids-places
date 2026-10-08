# 6. Formato del dataset

El importador acepta **CSV** o **Excel (.xlsx)**, una fila por sitio. Hay una plantilla en [`data/dataset/plantilla.csv`](../data/dataset/plantilla.csv).

Si tu dataset tiene otras columnas u otros nombres, no hace falta rehacerlo: déjalo tal cual en `data/dataset/` y el importador se adapta a él.

## Columnas

| Columna | Obligatoria | Ejemplo | Notas |
|---|---|---|---|
| `nombre` | sí | Parque del Este | |
| `categoria` | sí | parques | Uno de: parques, restaurantes, juegos, piscinas, museos, naturaleza, comerciales, fiestas, deportes, hospedaje, salud |
| `ciudad` | sí | Caracas | |
| `zona` | sí | Los Ruices | Urbanización o sector |
| `direccion` | sí | Av. Francisco de Miranda… | |
| `latitud` | recomendada | 10.4925 | Si falta, se calcula a partir de la dirección (puede requerir revisión manual) |
| `longitud` | recomendada | -66.8331 | |
| `descripcion` | sí | Texto de 2 a 4 frases | |
| `servicios` | no | juegos;gratis;banos | Separados por `;` |
| `telefono` | no | 0212-555-0101 | |
| `instagram` | no | @cuenta | |
| `web` | no | https://… | |
| `horario` | no | Mar–Dom 8:00–17:00 | Texto libre; se normaliza después |
| `precio` | no | 0, 1, 2 o 3 | 0 = gratis |
| `fotos` | no | foto1.jpg;foto2.jpg | Nombres de archivo en `data/dataset/fotos/` o URLs |

## Servicios válidos

`juegos`, `cambiador`, `lactancia`, `menu`, `estacionamiento`, `accesible`, `gratis`, `sombra`, `banos`, `aire`, `pet`, `comida`

## Fotos

- Formato JPG o WebP, idealmente de 1600 px de ancho como máximo.
- Asegúrate de tener permiso para usarlas (fotos propias o cedidas por el negocio).
- Evita fotos donde se reconozca la cara de niños.
