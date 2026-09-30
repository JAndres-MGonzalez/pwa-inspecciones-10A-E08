# Política de conflictos

**Autor: Juan Andrés Medina** · Bloque C · Semana 5 `w05-sync-data`

> Estado: **en redacción**. Esta sección la completa su autor.

## Alcance

Qué se considera un conflicto, qué estrategia se aplica, qué campo gana y cómo queda constancia
de la resolución.

## Contrato

Definido en [`src/lib/storage/schema.ts`](../../src/lib/storage/schema.ts): `SyncEnvelope`,
`ConflictRecord`.

## Contenido pendiente

1. Definición operativa de conflicto.
2. Las estrategias comparadas: `last-write-wins`, `field-level-merge`, `manual-review`.
3. Cuál es la estrategia por defecto y **por qué**, con el argumento del dominio.
4. Por qué una respuesta con versión vieja no puede pisar un dato más nuevo.
5. Por qué el conflicto se registra en vez de resolverse en silencio.
6. Límites conocidos de este bloque.
