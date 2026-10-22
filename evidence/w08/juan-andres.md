# Semana 8 · Juan Andrés

## Contribución

Pruebas HTTP contra la compilación de producción, arranque y cierre automático del servidor,
workflow de CI, reportes de resultados y cobertura V8, estrategia de pruebas y documentación
de entrega. Rama `codex/semana-8-andres-e2e-ci`.

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
