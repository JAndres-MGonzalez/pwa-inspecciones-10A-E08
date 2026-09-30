# Modelo y persistencia local

**Autor: Kevin Montalvo** · Bloque A · Semana 5 `w05-sync-data`

> Estado: **en redacción**. Esta sección la completa su autor.

## Alcance

Qué se guarda localmente, cómo se versiona el esquema, cómo se migra y por qué la clave de
idempotencia lleva la versión del registro.

## Contrato

Definido en [`src/lib/storage/schema.ts`](../../src/lib/storage/schema.ts):

- `SCHEMA_VERSION` y `migrate(record, from, to)`
- `idempotencyKey(inspection, version)`
- `InspectionStore` y su adapter `MemoryInspectionStore`

## Contenido pendiente

1. Qué guarda exactamente una inspección y qué guarda su `SyncEnvelope`.
2. Por qué IndexedDB sobre `localStorage`, y qué queda fuera con la interfaz actual.
3. Por qué la migración descendente lanza error en vez de adivinar.
4. Por qué la clave es `id::vN` y no solo `id`.
5. Límites conocidos de este bloque.
