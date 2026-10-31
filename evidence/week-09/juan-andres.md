# Semana 9 — Juan Andrés

- Nombre: Medina González Juan Andrés.
- Matrícula: 3523110131.
- Grupo y equipo: 10A-E08.
- Bloque: C y cierre de integración.

## Contribución

Commit de implementación: [de7a554e6f64f230b08a1e6d1144b534b5bdb346](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/de7a554e6f64f230b08a1e6d1144b534b5bdb346).

Modelo STRIDE, contrato de cabeceras y configuración de Next.js, `robots.txt`, pruebas
de configuración y HTTP, workflows y documentación. Los auxiliares de cobertura y
resumen leen la actividad del contrato para no reutilizar reportes de la semana 8.
Las ramas de Kevin e Ismael se integraron conservando sus commits y archivos propios.

## Decisión técnica

Mantener una CSP de producción sin evaluación dinámica y separar las excepciones del
entorno de desarrollo. Se conserva la compatibilidad de hidratación y se permite la
vista previa de imágenes locales. Una prueba compara el contrato con `next.config.mjs`
y con el servidor real. `robots.txt` pide no rastreo, pero no controla acceso.

## Pruebas y resultados

Comprobaciones técnicas ejecutadas por Codex. La instalación limpia y la línea base
integrada aprobaron 214 comprobaciones en 23 suites, con build y verificación `pass`.
SHA de esa línea base: `8e6ca6e3efab428a4b2d279c2aef7cbb0101a1b7`.
Salida: [andres-linea-base.txt](andres-linea-base.txt).

Sobre ese commit, `npm.cmd run verify` aprobó build, 221 comprobaciones en 24 suites y
el barrido de credenciales. El chequeo público acumulado imprimió `PUBLIC_OK` y terminó
en 0. El resumen técnico indica `pass`, el SHA correcto y árbol limpio. Hay cinco suites
unitarias, tres de integración y dos E2E, además de las suites acumuladas de raíz.
Las siete comprobaciones nuevas de cabeceras aprobaron con respuestas HTTP del servidor.
También se ejecutaron lint, tipos y cobertura V8; no se calcula porcentaje del TS original.

Para probar una regresión, Codex cambió temporalmente `X-Frame-Options` de `DENY` a
`ALLOWALL` en el contrato. La suite detectó el cambio y terminó en 1. Tras restaurar el
archivo original, sus siete comprobaciones aprobaron y terminó en 0. Se verificó el
blob original `eab09263aa94e1f42028fc6355a9c8d021b1712a`; la rotura no se integró.

- [Fallo observado](andres-negativo.txt).
- [Recuperación](andres-restaurado.txt).
- [Comprobación pública original del kit](andres-kit-publico.txt): imprime `PUBLIC_OK`
  aunque su búsqueda encontró nombres de herramientas. No se usa como única prueba.
- [Auditoría de dependencias](andres-auditoria.txt): código 1, dos avisos altos y uno
  crítico. La propuesta automática incluye una versión mayor del framework.

Los reportes finales se generan después del último commit y se conservan en el artefacto
de Actions con el mismo SHA. No se incorpora un reporte dentro del commit que identifica.

## Cierre de integración

El 31 de octubre se integró el [PR #28 de Ismael](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/28),
con el inventario y su evidencia corregidos. El inventario ahora describe localStorage,
la conservación de registros y las utilidades de privacidad todavía aisladas. Actualicé
el README, el modelo y mi sección individual para reflejar ese estado.

Revisé el modelo de amenazas y los resultados de las pruebas. La ejecución técnica de
los comandos se conserva atribuida a Codex y a GitHub Actions.

## Límites

Scripts y estilos inline siguen permitidos; no hay autenticación, cifrado local ni
backend persistente. Las utilidades nuevas de privacidad no están conectadas a la
captura. El inventario del Bloque B documenta almacenamiento y retención conforme a
la implementación. El filtro de imágenes no elimina EXIF. No se declara una auditoría
integral ni cumplimiento institucional. La actualización de dependencias con avisos
de auditoría queda pendiente; el incremento no los resuelve.

## Uso de IA

Codex (OpenAI): apoyo en código, pruebas y documentación. Revisé el modelo de amenazas
y los resultados de las pruebas.
