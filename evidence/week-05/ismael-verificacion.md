# Verificación de Ismael — Semana 5, Bloque B (cola idempotente)

Fecha: 2 de octubre de 2026. Entorno: Windows, PowerShell. Rama `semana-5-b-ismael-cola`, creada desde `master` en `b7a1128` (arranque de Kevin, PR #6).

| Comando | Resultado |
|---|---|
| `npm.cmd ci --ignore-scripts --no-audit --no-fund` | 28 paquetes añadidos |
| `npm.cmd run build` | Código 0; `Compiled successfully`; tipos validados con `target: es5` |
| `npm.cmd test` | `starter.spec.mjs: PASS`; 5 suites y 55 checks (45 previos y 10 de `sync.cola`) |
| `npm.cmd run verify` | `Verificación técnica: pass`; revisión académica pendiente |

## Checks de `sync.cola`

`backoff-exponential`, `no-duplicate-on-enqueue`, `no-duplicate-on-retry`, `retry-increments-attempts`, `gives-up-after-max`, `survives-tab-close`, `syncing-reopens-as-pending`, `out-of-order-ignored`, `no-loss-on-failure` y `deterministic-retries`: las 10 en `pass`.

## Qué verifica y qué no

Verifica el comportamiento de la cola contra un transporte simulado y un almacenamiento en memoria, con reloj controlado y sin red. No prueba un servidor real, IndexedDB, el uso desde la interfaz ni varias pestañas a la vez.

## Capturas

Las capturas de esta carpeta corresponden a esta ejecución.