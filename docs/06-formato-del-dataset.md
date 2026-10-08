# 6. Dataset e importación

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `data/dataset/PLANES VACACIONALES 2026.xlsx - Hoja1.csv` | Dataset original | No (se deja como fuente) |
| `data/dataset/ajustes.csv` | Categoría, zona y coordenadas de cada sitio | **Sí, aquí trabaja el administrador** |
| `supabase/datos/sitios-dataset.sql` | SQL generado para cargar los sitios en Supabase | No (se genera) |
| `apps/web/src/data/dataset.json` | Sitios del modo demostración | No (se genera) |

## Qué se toma del dataset

Solo los **sitios y sus datos**: nombre, dirección, Instagram, teléfono y una descripción armada con el resumen de actividades y las edades.

Las fechas, turnos y costos de los planes vacacionales **no se importan**, porque son de temporada.

## Agregar o corregir coordenadas

1. Abre `data/dataset/ajustes.csv` (con Excel, Google Sheets o un editor de texto).
2. Busca el sitio por su número de `fila` o su `nombre`.
3. Completa `latitud` y `longitud`. Para obtenerlas en Google Maps, haz clic derecho sobre el lugar y copia los números que aparecen arriba del menú.
4. En `ubicacion` escribe `verificada` cuando confirmes el punto exacto. Si es un punto por zona, déjalo como `aproximada`.
5. Ejecuta:

```bash
npm run importar
```

6. Ejecuta `supabase/datos/sitios-dataset.sql` en el SQL Editor de Supabase. Se puede repetir sin duplicar sitios.

Reglas:
- **Sin coordenadas**, el sitio queda como **borrador** y no aparece en el mapa.
- **Con ubicación `aproximada`**, se publica, y el detalle avisa que el punto es aproximado.
- Si varios sitios comparten el mismo punto aproximado, el importador los separa unos metros para que no se tapen.

Cuando exista el panel de administración (Fase 2), las coordenadas se podrán marcar directamente sobre el mapa.

## Categorías válidas

`parques`, `restaurantes`, `juegos`, `piscinas`, `museos`, `naturaleza`, `comerciales`, `fiestas`, `deportes`, `cursos`, `hospedaje`, `salud`

## Estado actual del dataset

- 33 sitios en Barquisimeto y Cabudare.
- 15 tienen ubicación **aproximada por zona**: Urb. del Este, Santa Elena, Los Leones, El Kilovatico, Parque Bararida y Cabudare. Hay que verificarlas.
- 18 no tienen ubicación y quedan como borrador. Kurios es virtual y Zifeng tiene varias sedes: hay que decidir cómo mostrarlos.

## Formato para futuros datasets

Para nuevas cargas sirve `data/dataset/plantilla.csv`, que ya incluye coordenadas y servicios.
