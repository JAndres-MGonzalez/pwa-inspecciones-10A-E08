# Semana 9 — Juan Andrés

- Nombre: Medina González Juan Andrés.
- Matrícula: 3523110131.
- Grupo y equipo: 10A-E08.
- Bloque: C y cierre de integración.

## Contribución

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

La comprobación final y la prueba negativa se registran después de cerrar este incremento.

## Límites

Scripts y estilos inline siguen permitidos; no hay autenticación, cifrado local ni
backend persistente. Las utilidades nuevas de privacidad no están conectadas a la
captura. El inventario del Bloque B necesita alinear almacenamiento y retención con
la implementación. El filtro de imágenes no elimina EXIF. No se declara una auditoría
integral ni cumplimiento institucional.

## Uso de IA

Codex (OpenAI): apoyo en código, pruebas y documentación. Validación humana de este
incremento: pendiente de mi revisión.
