# Cola de sincronización: idempotencia, reintentos y recuperación

**Autor: José Ismael Montalvo** · Bloque B · Semana 5 `w05-sync-data`

Archivo: `src/lib/sync/queue.ts`. Pruebas: `tests/sync.cola.spec.ts`.

Contrato: [`src/lib/storage/schema.ts`](../../src/lib/storage/schema.ts).

La cola guarda cada cambio local como una entrada y lo envía al servidor a través de un
`Transport`. Debe resistir tres cosas: **reintentos**, **cierre de pestaña** y **respuestas
fuera de orden**.

## Ciclo de una entrada

```
        enqueue
           │
           ▼
      ┌─────────┐   drain: envía    ┌─────────┐   ok          ┌────────┐
      │ pending │ ────────────────► │ syncing │ ────────────► │ synced │
      └─────────┘                   └─────────┘               └────────┘
        ▲     ▲                          │ error
        │     └──────────────────────────┤ (attempts < máximo, con backoff)
        │ al reabrir la pestaña          ▼
        └── "syncing" guardado      ┌────────┐
                                    │ failed │  (attempts >= máximo, no se reintenta)
                                    └────────┘
```

El estado `conflict` existe en el contrato (`SyncState`), pero esta cola no lo asigna: la
detección de conflictos es del bloque de la política de conflictos.

## Idempotencia

La clave de cada operación es `id::vN` (`idempotencyKey(inspección, versión)`).

- Encolar dos veces la misma inspección con la misma versión **no crea una segunda entrada**:
  devuelve la que ya existe.
- Un reintento reutiliza la misma entrada y la misma clave, así que el servidor puede
  reconocerlo como la misma operación.
- Si la clave fuera solo `id`, un reintento de una actualización que el servidor ya aplicó se
  confundiría con otra y un cambio nuevo se perdería. Con la versión, cada cambio es una
  operación distinta y el mismo cambio reintentado es la misma.

**Qué garantiza:** que la cola no duplica ni pierde entradas. **Qué no garantiza:** que el
servidor deduplique; eso depende de que el servidor respete la clave.

## Reintentos con backoff exponencial

- Fórmula: `retardo = base × 2^(intento−1)`, con base de 1 s y tope de **30 s**
  (`backoffDelay`). Los retardos van 1 s, 2 s, 4 s, 8 s...
- Al retardo se le suma un **jitter de hasta 10 %** para que varias pestañas no reintenten al
  mismo tiempo.
- El jitter usa una fuente aleatoria **inyectable con valor fijo por defecto** (0.5) y
  `seededRandom(semilla)` para pruebas. Con `Math.random()` las pruebas serían intermitentes y
  el criterio pide pruebas deterministas.
- Cada fallo sube `attempts`, guarda `lastError` y fija `nextAttemptAt`. Mientras no llegue esa
  hora, `drain()` salta la entrada.
- Tras `maxAttempts` (5 por defecto) la entrada queda `failed` y deja de reintentarse sola.
  Sigue en la cola: no se borra ni se pierde.

## Cierre de pestaña

Después de cada cambio de estado la cola se persiste con `store.saveQueue`. Al reabrir,
`rehydrate()` la lee otra vez.

Una entrada guardada como `syncing` volvió a `pending`: la pestaña se cerró en pleno envío y
**no se sabe si la petición llegó al servidor**.

- Asumir que sí llegó puede perder el cambio.
- Asumir que no puede reenviarlo, y eso es inofensivo porque la clave de idempotencia lo
  absorbe.

Se elige la opción que no pierde datos. `rehydrate()` también reconstruye la última versión
aplicada de cada inspección a partir de las entradas `synced`.

## Respuestas fuera de orden

Caso: el usuario edita dos veces seguidas (v2 y v3) y el servidor procesa la v3 antes de que
llegue la respuesta de la v2.

- La versión aplicada se lleva **por inspección** (no por clave, porque la clave ya incluye la
  versión).
- Una entrada con versión menor a la ya aplicada no se envía y se marca `synced` (superada).
- Si la respuesta vieja llega con la versión ya aplicada más nueva, se **descarta**: la v2 no
  puede pisar el dato de la v3, y la versión aplicada nunca retrocede.
- Al encolar, el dato local solo se guarda si esa versión no es más vieja que otra ya encolada.

## Observabilidad

Sin abrir el código se puede diagnosticar con:

| Qué | Dónde |
|---|---|
| Entradas esperando envío | `pending()` |
| Entradas que agotaron reintentos | `failed()` |
| Todas las entradas y su estado | `all()` |
| Último error de una entrada | `entry.lastError` |
| Cuándo vuelve a intentarse | `entry.nextAttemptAt` |
| Cuántos intentos lleva | `entry.attempts` |
| Resultado de un ciclo | `DrainReport`: `sent`, `failed`, `skipped`, `pending` |
| Última versión confirmada | `lastApplied(id)` |
| Error al persistir | `lastPersistError` |

En `DrainReport`, `skipped` agrupa las entradas superadas por una versión más nueva y las que
siguen esperando su backoff.

## Límites conocidos

- **No hay reintento automático por reloj:** alguien debe llamar `drain()` (al volver la red,
  al abrir la app o con un temporizador). La cola no se despierta sola.
- **Las entradas `failed` no se reintentan solas.** Requieren una acción explícita; hoy no hay
  método para reactivarlas.
- **Las entradas `synced` no se purgan:** la cola crece con el tiempo.
- **No detecta conflictos:** solo ordena por versión. Si dos dispositivos cambian la misma
  inspección, la política de conflictos decide, no esta cola.
- **No hay exclusión entre pestañas:** dos pestañas abiertas podrían enviar la misma entrada.
  La idempotencia lo absorbe si el servidor respeta la clave.
- **La clave solo sirve si el servidor deduplica por ella.**
- Si falla el almacenamiento, el error queda en `lastPersistError`, pero la cola sigue
  trabajando en memoria y ese estado se perdería al cerrar la pestaña.
