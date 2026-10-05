# Política de sincronización

Semana 5 · `w05-sync-data` · Equipo 10A-E08

Este documento es el **índice** de la política de sincronización. Cada sección tiene un autor
distinto y se escribió de forma independiente, en paralelo, sin depender de las demás.

| Sección | Contenido | Autor |
|---|---|---|
| [Modelo y persistencia local](sync/01-modelo.md) | Qué se guarda, versión de esquema, migración, clave de idempotencia | Kevin Montalvo |
| [Política de conflictos](sync/02-conflictos.md) | Qué pasa cuando local y remoto difieren, qué campo gana, cómo se registra | Juan Andrés Medina |
| [Cola idempotente y reintentos](sync/03-cola.md) | Encolado, deduplicación, backoff, cierre de pestaña, respuestas fuera de orden | José Ismael Montalvo |

## Contrato compartido

Las tres secciones se apoyan en un contrato único, congelado en
[`src/lib/storage/schema.ts`](../src/lib/storage/schema.ts):

- `ASSIGNMENT_ID` y `SCHEMA_VERSION` — identidad de la actividad y del esquema local.
- `SyncEnvelope` — sobre que viaja un registro: `key`, `data`, `version`, `updatedAt`.
- `QueueEntry` — una operación pendiente: `key`, `attempts`, `state`, `envelope`.
- `ConflictRecord` — constancia de un conflicto ya resuelto.
- `InspectionStore` — almacenamiento local, incluida la cola persistida.
- `idempotencyKey(inspection, version)` — **la clave que evita duplicados**.

## Resumen de la política

- **Idempotencia.** La clave es `id::vN`: identifica una **operación**, no un registro. Reintentar
  la misma operación no crea un segundo registro; un cambio nuevo sí genera una operación nueva.
  Determinista: no depende de `Math.random()` ni de `Date.now()`.
- **Conflictos.** `field-level-merge` conserva los cambios de cada lado respecto a una base
  común. Si ambos cambian el mismo campo, gana la fecha mayor; en empate se conserva lo local.
  Cada diferencia queda registrada. Sin datos suficientes se marca para revisión manual y una
  versión remota vieja no reemplaza la local. Detalle en [Política de conflictos](sync/02-conflictos.md).
- **Reintentos.** *Pendiente de la sección de Ismael.*
- **Cierre de pestaña.** *Pendiente de la sección de Ismael.*

## Límites conocidos

- La cola y la política están probadas contra un transporte simulado en memoria. **No se probó
  contra un servidor real**: el repositorio no declara servicios privados y las pruebas deben ser
  deterministas.
- La persistencia local se implementa con un adapter en memoria
  (`MemoryInspectionStore`), suficiente para probar el comportamiento. La conexión real con
  IndexedDB queda declarada en la interfaz `InspectionStore` pero no está implementada.
- *Pendiente: cada sección declarará sus propios límites.*
