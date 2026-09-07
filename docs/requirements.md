Requisitos del producto: inspecciones de laboratorio

Fecha: 4 de septiembre de 2026. Estado: revisado y ajustado para revisión final del equipo.

Documento del equipo 10A-E08. Identificación actualizada el 5 de septiembre de 2026.

1. Problema, contexto y límites

En el caso académico propuesto, una persona recorre laboratorios y registra observaciones de mantenimiento. Si depende de un formulario conectado y la red se interrumpe, puede perder la captura o anotarla en otro medio. La transcripción posterior puede omitir hallazgos o duplicar inspecciones. Quien coordina mantenimiento necesita distinguir espacios sin incidencias de aquellos que requieren atención.

Se propone un registro consultable desde teléfono y computadora, con captura local y envío posterior en etapas futuras. Es una hipótesis de producto: no se realizaron entrevistas ni se afirma un diagnóstico real de la Universidad Tecnológica de Tehuacán.

Semana 1: ejecutar el starter Next.js, consultar sus tres inspecciones sintéticas y documentar requisitos, decisión y evidencia. Producto futuro: registrar observaciones, conservarlas durante interrupciones y enviarlas al recuperar conexión. Estas capacidades futuras aún no están implementadas.

Quedan fuera el mantenimiento físico, compras, inventario, diagnóstico automático de equipos, seguimiento disciplinario, integración institucional y datos reales. Manifest, service worker, offline, sincronización, notificaciones y autenticación quedan fuera de la implementación de esta semana. Actualmente no hay backend ni captura de registros.

2. Usuarios y escenarios

Usuario

Necesidad

Restricción asumida

Persona encargada de inspección

Consultar el estado y conservar observaciones durante el recorrido

Teléfono, red intermitente; no se presupone formación técnica

Persona que coordina mantenimiento

Identificar laboratorios que requieren atención

Consulta en teléfono o computadora; debe distinguir registros pendientes de enviados en el producto futuro

E-01: consulta para preparar seguimiento

Situación inicial: la persona coordinadora tiene conexión y abre la aplicación para revisar inspecciones recientes.

Acción: lee laboratorios, fechas, alias responsables, estados, resúmenes y cantidades de hallazgos.

Resultado esperado actual: aparecen Redes, Electrónica y Software. Electrónica muestra dos hallazgos y «Requiere atención»; los otros dos muestran cero y «Sin incidencias». Puede identificar el registro que merece revisión, sin que esto asigne ni cierre un trabajo de mantenimiento.

E-02: captura con conectividad intermitente

Situación inicial: en una etapa futura, la persona inspectora abrió y preparó la app con conexión. Durante el recorrido pierde la red y detecta una observación ficticia.

Acción: selecciona laboratorio y fecha, escribe la observación y guarda. Cierra y vuelve a abrir la app. Al reconectarse, con la aplicación abierta, solicita el envío.

Resultado esperado futuro: conserva los mismos valores y muestra «Pendiente de envío». Cambia a «Enviada» solo tras confirmación del servidor. Reintentar no crea duplicados. Un error de almacenamiento no muestra un éxito falso; un error de envío mantiene el pendiente.

Límite: no cubre la primera apertura sin red ni garantiza conservación después de borrar datos del navegador, desinstalar o perder el dispositivo.

3. Requisitos funcionales

ID

Escenario

Acción

Condición observable de aceptación

Alcance

RF-01

E-01

Mostrar inspecciones sintéticas

Al abrir la página se ven exactamente las tres inspecciones del dataset con laboratorio, fecha, alias, estado, resumen y hallazgos correspondientes

Semana 1; implementado en el starter

RF-02

E-01

Distinguir registros que requieren atención

Electrónica muestra «Requiere atención» y 2; Redes y Software, «Sin incidencias» y 0. La distinción usa texto además de color

Semana 1; implementado en el starter

RF-03

E-02

Capturar laboratorio, fecha y observación

Laboratorio del catálogo, fecha válida y observación de 1 a 500 caracteres tras quitar espacios externos producen un registro con los mismos valores. Campos ausentes o inválidos generan error identificado y no guardan registros incompletos

Futuro; pendiente

RF-04

E-02

Guardar sin red y consultar pendientes

Tras preparar la app en línea, guardar en offline y cerrar/reabrir conserva campos y estado «Pendiente de envío». Si falla el guardado, informa el error sin anunciar éxito

Futuro; pendiente

RF-05

E-02

Enviar pendientes sin duplicarlos

Con app abierta y red restablecida, «Enviar pendientes» reutiliza el mismo ID local. Tres intentos del mismo registro producen una sola inspección en el servidor. Una respuesta fallida conserva el pendiente

Futuro; pendiente

RF-06

E-01, E-02

Mostrar registros confirmados

Después de confirmación del servidor, el registro pasa a «Enviada» y aparece una sola vez al refrescar el listado conectado. Antes de confirmación permanece pendiente

Futuro; pendiente

RF-03 a RF-06 se especifican para etapas posteriores; su documentación no demuestra implementación.

4. Requisitos no funcionales medibles

Los umbrales son metas propuestas, no mediciones realizadas. La bitácora de ejecución registra resultados reales. Para ensayos futuros se propone un teléfono Android con Chrome y una computadora Windows con Edge; se anotarán modelo, RAM, sistema y versión del navegador antes de medir. Si se usan otros dispositivos, se documentará el cambio.

ID / aspecto

Condición o meta

Método

Momento

RNF-01 Reproducibilidad

En copia limpia, con versiones declaradas en README, npm ci y npm run verify terminan con código 0 y el lockfile no cambia

Registrar versiones y códigos; ejecutar git diff --exit-code -- package-lock.json. Para entrega final, comparar SHA del reporte con git rev-parse HEAD y exigir workingTreeClean: true

Semana 1; repetir sobre commit final. CI usa Node 20.19.6 según el workflow

RNF-02 Accesibilidad

Listado legible a 320 px y zoom 200%, sin pérdida de información ni desplazamiento horizontal; un h1, jerarquía comprensible y estados textuales. Meta de contraste: 4.5:1 para texto normal y 3:1 para grande

Revisar tamaños, zoom, encabezados y contraste en navegador. En formularios futuros, recorrer todos los controles con teclado y comprobar etiquetas, foco visible y errores asociados

Listado en Semana 1; controles cuando existan. Un build no valida accesibilidad

RNF-03 Seguridad

Cero archivos .env, claves o credenciales versionados. Antes de publicación, revisar y resolver o justificar hallazgos altos/críticos en dependencias

Inspeccionar git ls-files, revisar contenido y resultado de npm audit. En backend futuro, repetir validación en servidor y comprobar rechazo de entradas inválidas

Repositorio en Semana 1; dependencias antes de publicar; validación del servidor al implementarlo

RNF-04 Privacidad

100% de registros y alias sintéticos; cero nombres reales, matrículas, correos, fotos o ubicación precisa de personas en el dataset

Revisar cada registro y cambio de datos. La identificación académica queda en evidencia del repositorio privado y Classroom. Antes de persistir, añadir borrado local y comprobar eliminación de todos los registros de prueba

Semana 1 y en cada cambio; borrado cuando exista persistencia

RNF-05 Rendimiento

En producción y con 100 registros sintéticos, listado visible en menos de 2 segundos en al menos 4 de 5 ejecuciones por dispositivo declarado

Medir desde navegación hasta listado completo, caché caliente, sin limitación de CPU y red simulada de 10 Mbps / 100 ms de latencia. Conservar los cinco tiempos y condiciones

Futuro, al existir 100 registros. Las tres tarjetas actuales no validan esta meta

RNF-06 Offline y recuperación

Cero pérdidas en 10 capturas sin red tras preparación en línea; cero duplicados tras tres reintentos por registro; guardado local menor a 1 segundo en al menos 9 de 10 capturas

Activar offline, guardar, cerrar/reabrir y comparar IDs/campos; reconectar con app abierta y reintentar. Simular falta de espacio y comprobar error sin falso éxito

Futuro, con almacenamiento y servidor. Excluye borrado deliberado o expulsión de datos por el navegador

No se declara conformidad integral con WCAG, seguridad completa ni operación offline mediante la prueba inicial. Los ensayos de rendimiento y recuperación necesitan implementaciones posteriores.

5. Datos sintéticos y límites

El archivo src/lib/data/inspections.ts contiene datos ficticios y sirve como fuente del listado que se verifica en Semana 1:

ID

Laboratorio

Fecha

Alias

Estado

Hallazgos

inspection-001

Laboratorio de Redes

2026-08-28

Técnica A

Sin incidencias (ok)

0

inspection-002

Laboratorio de Electrónica

2026-08-27

Técnico B

Requiere atención (attention)

2

inspection-003

Laboratorio de Software

2026-08-26

Técnica C

Sin incidencias (ok)

0

Cada registro incluye un resumen ficticio. Las etiquetas no acreditan inspecciones reales. No existen cuentas ni expedientes de personas en la aplicación.

En etapas futuras se propone añadir observación, ID local estable y estado de envío a conjuntos igualmente sintéticos. Se excluyen datos de estudiantes y personal, matrículas, teléfonos, correos, rostros, geolocalización, credenciales y reportes reales. Los nombres y matrículas de los integrantes de 10A-E08 están registrados aparte en el README, dentro del repositorio privado, y no forman parte de los datos del producto.

6. Criterios de aceptación de Semana 1

Entrega / criterio

Comprobación

Qué demuestra y límite

Instalación / AC-01

npm ci, versiones y lockfile conservado

Dependencias instaladas en el entorno registrado; no demuestra build

Pantalla / RF-01 y RF-02

npm run dev, abrir localhost:3000 e inspeccionar las tres tarjetas y valores; detener servidor

Consulta real de datos ficticios; no demuestra captura ni offline

Build / AC-01

npm run verify, check build aprobado

Compilación del starter; no calidad documental ni seguridad completa

Requisitos / AC-02

Leer secciones 1 a 5 y seguir escenarios hacia RF y aceptación

Coherencia, trazabilidad y metas; requiere juicio humano

Prueba proporcionada / AC-03 compartido

npm run verify, check test aprobado y starter.spec.mjs: PASS

Script de build igual a next build y presencia del título y mención de datos sintéticos en el archivo de página; no renderiza ni cuenta tarjetas

Evidencia / AC-03 individual

Sección confirmada por cada integrante en evidence/individual.md con contribución enlazada y ejecución propia explicada

Participación y comprensión personal; no se infieren de comandos ejecutados por IA

Estrategia / AC-04

Leer docs/decision-record.md: cuatro opciones, restricciones, riesgos y validación

Justificación de trayectoria PWA; no exige implementar alternativas

Versión entregada

Comparar repositorio, SHA, enlace a Actions y reporte; comprobar árbol limpio y acceso docente

Identifica la versión. Un reporte previo al commit final debe regenerarse