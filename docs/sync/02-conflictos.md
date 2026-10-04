# Política de conflictos

**Autor: Juan Andrés Medina** · Bloque C · Semana 5 `w05-sync-data`

## Qué se considera un conflicto

Hay conflicto cuando dos copias tienen el mismo `id` y distinto contenido en `location`,
`date`, `inspector`, `status`, `statusLabel`, `findings` o `summary`. El `id` identifica la
inspección: no se mezcla. `resolve()` rechaza copias de inspecciones diferentes.

Una copia remota con `updatedAt: 0` representa una respuesta sin fecha utilizable: se
conserva lo local sin generar conflictos. Dos copias iguales tampoco generan registros.

## Estrategias

| Estrategia | Regla | Coste o limitación |
|---|---|---|
| `last-write-wins` | Gana la copia completa con mayor `updatedAt`. En empate se conserva la local. | Puede borrar una edición local en otro campo, aunque la copia remota no haya cambiado ese campo. |
| `field-level-merge` | Compara cada campo con una base común. Conserva los cambios hechos de un solo lado; si ambos cambiaron el mismo campo, gana la copia con mayor `updatedAt`. En empate gana la local. | Necesita la copia anterior y metadatos locales. No combina dos textos dentro del mismo campo. |
| `manual-review` | Conserva la copia local y devuelve las diferencias marcadas para revisión. | Hace falta que una persona decida; este módulo no incluye una pantalla de revisión. |

La estrategia por defecto es **`field-level-merge`**. En una inspección, una persona puede
corregir el laboratorio y otra actualizar el resumen. Conservar ambos cambios evita que una
copia completa borre el trabajo de la otra. Por ejemplo, si la base tiene ubicación A y
resumen inicial, una edición local del resumen y una remota de la ubicación producen ubicación
B y el resumen local, incluso si la copia remota tiene una fecha menor.

## Uso del contrato

El módulo usa `Inspection`, `SyncEnvelope`, `ConflictRecord` e `idempotencyKey()` de
[`schema.ts`](../../src/lib/storage/schema.ts), sin modificar ese contrato.

`Inspection` no contiene versión ni fecha de edición. Por eso el quinto argumento de
`resolve()` recibe esos datos desde el sobre local y, para mezclar campos, la copia común
anterior a las dos ediciones:

```ts
const result = resolve(local.data, remote, DEFAULT_STRATEGY, now, {
  localVersion: local.version,
  localUpdatedAt: local.updatedAt,
  base
});
```

Aquí `local` y `remote` son `SyncEnvelope<Inspection>`, `base` es la inspección antes de
editarla y `now` es la fecha de la decisión en milisegundos desde epoch. No se usa la fecha
de la visita (`Inspection.date`) como si fuera la fecha de edición.

Si falta el contexto local, o se pide mezclar campos sin una base común, se aplica
`manual-review`. El resultado y sus registros indican esa estrategia real. No se inventan
fechas ni se adivina qué lado editó cada campo. La función valida identificadores, clave,
versiones enteras no negativas y fechas finitas no negativas antes de decidir.

## Respuestas fuera de orden

`isStale(localVersion, remoteVersion)` devuelve `true` cuando la versión remota es menor.
`resolve()` comprueba esa condición **antes** de aplicar cualquier estrategia: conserva la
copia local, aunque la respuesta vieja tenga una fecha mayor. La versión pertenece a la
operación; no es `SCHEMA_VERSION`.

El descarte devuelve `conflicts: []`: no se resolvió una nueva divergencia. El llamador puede
usar `isStale()` con los mismos metadatos para distinguir ese descarte de una respuesta igual.
Sin versión local no se puede comprobar el orden; por eso no se reemplaza la copia local.

## Registro observable

Cada campo divergente de una respuesta vigente produce un `ConflictRecord` con:

- `key`: inspección y versión remota, calculadas con `idempotencyKey()`.
- `field`, `local` y `remote`: campo y valores que se compararon.
- `strategy`: regla aplicada, incluida la revisión manual cuando falta información.
- `resolvedAt`: el valor de `now` recibido; si se omite, queda en `0` y no representa una fecha real.

Esto permite revisar qué valores entraron, qué regla se aplicó y cuándo se tomó la decisión.
En `manual-review`, esa fecha marca la clasificación del conflicto, no una aprobación humana.
La función devuelve los registros sin guardar estado ni modificar las entradas. Quien la
integre debe conservarlos; una llamada nueva no elimina ni guarda los de llamadas anteriores.

## Pruebas y ejecución

[`tests/sync.conflictos.spec.ts`](../../tests/sync.conflictos.spec.ts) contiene los diez casos
de la guía y cuatro adicionales: contexto incompleto, fecha remota cero, entradas sin mutación
y metadatos inválidos. Utiliza datos sintéticos, fechas fijas y el cargador TypeScript existente.
El runner descubre la suite automáticamente, sin registrar archivos ni instalar librerías.

Desde la raíz, en PowerShell:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd test
npm.cmd run verify
```

`npm.cmd run verify` es el equivalente exacto de `make verify` en Windows: el Makefile llama
a `npm run verify`. Incluye pruebas, comprobación de archivos, barrido y `next build`.
Los reportes quedan en `reports/verification.json` y `reports/w05-sync-data/tests.json`.

## Límites conocidos

- Sin base común no se puede saber qué cambió cada persona. Se solicita revisión manual.
- Solo existe una fecha por copia, no por campo. Cuando ambos cambian el mismo campo se usa
  esa fecha general; relojes desajustados pueden elegir la copia incorrecta.
- El empate favorece la copia local: invertir los lados puede cambiar el resultado. No es un
  algoritmo de consenso entre varios dispositivos.
- El módulo compara campos planos. No valida relaciones entre campos, como `status` y
  `statusLabel`, ni resuelve borrados o cambios dentro de un texto.
- Es una política aislada: no envía peticiones, no guarda los registros en IndexedDB y todavía
  no está conectada a la cola ni a la interfaz. Las pruebas no acreditan sincronización real.
- El workflow de semana 5 exige también `queue.ts` y `tests/sync.spec.ts`. La comprobación
  completa de Actions requiere integrar los otros bloques y la suite conjunta.
