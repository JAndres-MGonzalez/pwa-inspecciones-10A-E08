# Cola idempotente y reintentos

**Autor: José Ismael Montalvo** · Bloque B · Semana 5 `w05-sync-data`

> Estado: **en redacción**. Esta sección la completa su autor.

## Alcance

Cómo se encola una inspección, cómo se evita el duplicado, cómo se reintenta sin perder datos y
qué sobrevive al cierre de la pestaña.

## Contrato

Definido en [`src/lib/storage/schema.ts`](../../src/lib/storage/schema.ts): `QueueEntry`,
`InspectionStore.saveQueue` / `loadQueue`.

## Contenido pendiente

1. Ciclo de vida de una entrada: `pending` → `syncing` → `synced` | `failed` | `conflict`.
2. Idempotencia: la clave `id::vN` y qué garantiza y qué no.
3. Reintentos con backoff exponencial, el tope de 30 s y el jitter con semilla fija.
4. Cierre de pestaña: qué se persiste y por qué `syncing` vuelve a `pending`.
5. Respuestas fuera de orden: por qué una respuesta vieja se descarta.
6. Observabilidad: qué se expone para diagnosticar sin abrir el código.
7. Límites conocidos de este bloque.
