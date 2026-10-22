# Semana 8 · Juan Andrés

## Contribución

Pruebas HTTP contra la compilación de producción, arranque y cierre automático del servidor,
workflow de CI, reportes de resultados y cobertura V8, estrategia de pruebas y documentación
de entrega. Rama `codex/semana-8-andres-e2e-ci`.

Commit de implementación:
[`f48033e0812bf0c645026ace77ea540d2243b41b`](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/f48033e0812bf0c645026ace77ea540d2243b41b).
Avance publicado en el [PR #22](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/22), en borrador.

Revisión técnica del [PR #21 de Kevin](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/21):
instalación limpia, 168 comprobaciones en 15 suites, build, `npm run verify` y `PUBLIC_OK`.
Merge `85fd5fd5de37f0cf8435e77b57564873b527e5f7`. Las pruebas y la evidencia de Kevin
conservan su autoría; no se escribió la evidencia de Ismael.

## Decisión y motivo

HTTP permite revisar las rutas y recursos de la aplicación compilada sin instalar otra
dependencia. El servidor usa un puerto libre y se detiene al terminar para evitar conflictos
entre ejecuciones. Se distingue esta comprobación del E2E desde la interfaz exigido por el
profesor. El cierre falla mientras ese flujo o una capa completa no estén demostrados.

## Comprobaciones

Los comandos de esta sesión son ejecutados por Codex en Windows. El resultado final del
avance se registra después de verificar el commit candidato, junto con la ejecución de CI.
La [estrategia](../../docs/test-strategy.md) contiene preparación, comandos y límites.

Primera ejecución de desarrollo: lint de sintaxis y comprobación de tipos aprobados;
176 comprobaciones en 16 suites, incluidas las ocho HTTP, aprobadas. Se generó cobertura
V8 real. El primer intento del check de inexistente suponía un encabezado h1; la página
usa h2 y el streaming entrega parte de la respuesta como datos de Next. Se corrigió el
check para exigir el texto de inexistente y `NEXT_NOT_FOUND`, sin afirmar un render visual.

Prueba negativa en la rama temporal `codex/w08-regresion-http`: se quitó `start_url` del
manifest. Resultado esperado y observado: `manifest-accesible` falla, código 1. Tras
restaurar, los ocho checks pasan y el manifest coincide con el original. Salidas reales:
[fallo](andres-http-fallo.txt) y [recuperación](andres-http-recuperacion.txt).

También se comprobó que un servidor externo ausente produce código 1, sin omitir casos.
La [protección de master](andres-proteccion.json) se volvió a consultar en GitHub:
PR obligatorio para administradores, sin push forzado ni borrado; no exige aprobaciones
automáticas adicionales. No se hizo una escritura de prueba a la rama principal.

## Verificación del avance publicado

Punto comprobado: `fad3dd83de8c4d3e96e24b116e0c1241edbd838f`, árbol limpio.
Codex ejecutó lint, tipos, pruebas con cobertura, `npm.cmd run verify` y chequeo público:
176 comprobaciones en 16 suites, build correcto y `PUBLIC_OK`. El reporte de cierre devolvió
código 1 y `incomplete` por ausencia de integración y de los dos escenarios de interfaz.

En [Actions](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39701089160),
Ubuntu 26.04.1 con Node 20.19.6, instalación, lint, tipos, build, pruebas, verificación y
chequeo público aprobaron. Solo falló el cierre de alcance con los mismos tres motivos.
La subida de [resultados y cobertura](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39701089160/artifacts/12393013525)
aprobó también después del fallo. [Registro de la ejecución](andres-ci-candidato.json).

Se descargó el artefacto y se comprobó que sus reportes coinciden con el SHA, árbol limpio,
16 suites y 176 comprobaciones; el JSON de cierre indica `incomplete`. El ZIP contiene
resultados, verificación, resumen de cobertura y dos JSON V8. El resumen de cobertura solo
atribuye archivos JS del runner y auxiliares; no declara cobertura fiable del TypeScript.

Este SHA es el punto de comprobación del avance, no el SHA final común para Classroom.

## Qué demuestra y qué falta

Las respuestas HTTP comprueban que el servidor entrega inicio, navegación, estado inicial
CSR, detalle SSR, respuesta de inexistente, manifest, worker y página de respaldo.
No ejecutan JavaScript ni prueban una captura offline que sobreviva a recargar.

Faltan el Bloque B de Ismael, una regla de validación de captura, almacenamiento durable y
el E2E de interfaz crear → offline → recargar → reconectar → sincronizar sin duplicar, además
de su variante con una capacidad ausente. El avance no se presenta como entrega final.

## Uso de IA

Codex ayudó con las pruebas, CI, documentación y ejecución de comandos. La revisión y
ejecución personal de Juan Andrés están pendientes; no se atribuyen los comandos de Codex
a una ejecución humana.
