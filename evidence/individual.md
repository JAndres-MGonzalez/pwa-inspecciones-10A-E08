# Evidencia individual

- Grupo: **10A**.
- Equipo: **E08** (identificador completo: **10A-E08**).
- Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Integrante: Medina González Juan Andrés

- **Matrícula:** 3523110131.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** instalé las dependencias del proyecto en mi computadora, inicié el servidor y ejecuté la verificación. Los comandos y resultados están en [mi registro de ejecución](session-log.md#ejecución-de-juan-andrés).
- **Decisión que puedo explicar y por qué:** mantener el starter de Next.js y comprobar que funciona antes de agregar funciones. Así contamos con una base para continuar el proyecto. Esta semana trabajamos en el arranque y la documentación; el funcionamiento sin conexión se desarrollará después.
- **Comando o prueba que ejecuté:** el 5 de septiembre de 2026 ejecuté `npm ci`, `npm run dev` y después `npm run verify` desde la carpeta del proyecto.
- **Resultado real que observé:** la instalación añadió 28 paquetes. El servidor mostró `Ready in 3.9s` y `GET / 200`. La verificación mostró `starter.spec.mjs: PASS`, `Compiled successfully` y `Verificación técnica: pass`, y generó `reports/verification.json`.
- **Qué verifica y qué no:** la prueba revisa que el comando de compilación sea `next build` y que el código de la página incluya el título y la palabra «sintéticos». La verificación completa también revisa los archivos requeridos y compila el proyecto. No comprueba el funcionamiento sin conexión, la sincronización ni la calidad de los documentos. Un resultado aprobado tampoco significa que no haya problemas de seguridad.
- **Limitación, dificultad o riesgo que identifiqué:** la aplicación todavía solo muestra datos de ejemplo; no guarda nuevas inspecciones ni funciona offline. Además, npm reportó dos alertas de seguridad de severidad alta, que siguen documentadas y pendientes de atender.
- **Uso de IA:** usé Codex (OpenAI) como apoyo para preparar el repositorio, redactar los requisitos, la decisión PWA, el README, la evidencia y la bitácora, y entender los resultados. Para comprobar el proyecto ejecuté personalmente `npm ci`, `npm run dev` y `npm run verify` en PowerShell.

### Semana 2 — Integración y verificación

- **Contribución y enlace:** integración de pruebas del manifest y de los estados, workflow de Semana 2 y corrección del área principal duplicada y del enlace a inspecciones. Cambio: [1cbb793](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/1cbb79364bcdc44ca3213e392d4207cd8d5aa793). Detalle: [reporte de integración](week-02/reports/3523110131.md).
- **Decisión técnica:** ejecutar el spec de TypeScript con el compilador ya incluido en el proyecto. Así se conserva el comando `npm test`, se prueban los componentes reales y no se agregan dependencias ni se duplican las pruebas.
- **Comprobación y resultado:** Codex ejecutó `npm.cmd ci`, `npm.cmd test` y `npm.cmd run verify`. La primera suite detectó dos fallos de integración; después de corregirlos pasaron nueve casos y la compilación. El [registro del antes y después](week-02/integration-check.json) conserva las salidas. La revisión con navegador comprobó escritorio, ancho de 320 px y navegación con teclado.
- **Verificación que ejecuté personalmente:** el 13 de septiembre de 2026 ejecuté `npm.cmd run verify` y compartí la salida. Los nueve casos mostraron `pass`, la prueba terminó con `starter.spec.mjs: PASS` y la compilación con `Compiled successfully`. El reporte de mi computadora registró `status: pass`, Node v26.4.0 y el árbol de Git limpio sobre el commit `1471561f63249025132ead7e37a4ac8e6d67d51f`. El detalle está en [mi registro de Semana 2](session-log.md#verificación-personal-de-juan-andrés--semana-2).
- **Limitación diagnosticada:** el chequeo público devuelve código 0 incluso cuando imprime coincidencias. Los tests y el build no acreditan instalación en un teléfono ni funcionamiento offline. La auditoría actual reporta una dependencia alta y una crítica.
- **Cambio que puedo defender o modificar:** explicar por qué el layout contiene una sola área principal y cómo el enlace interno coincide con el identificador de la sección.
- **Uso de IA y validación personal:** Codex (OpenAI) ayudó con código de integración, pruebas, documentación y comprobaciones. Después ejecuté personalmente `npm.cmd run verify` y compartí el resultado. La instalación, la comparación de pruebas antes y después y la revisión de navegador de esta integración fueron realizadas por Codex.

### Semana 3 — CI y revisión de integración

- **Mi commit SHA:** [dff4721120ae426ad8a5c3bef9df3bebef3fecac](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/dff4721120ae426ad8a5c3bef9df3bebef3fecac).
- **GitHub Actions:** [Semana 3 aprobada](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554301129) sobre `2b6267b7aa2cf0c65fc5efb14aac5397164294ad`; [captura del resultado](week-03/actions-2b6267b.png). Los workflows de Semanas 1 y 2 también aprobaron sobre ese SHA. Este es el commit de integración revisado; mi contribución está enlazada arriba.
- **Contribución:** preparación del workflow de Semana 3, actualización del README y registro de la decisión de caché y los fallos de integración.
- **Decisión técnica:** conservar el workflow de la guía con Node 20.19.6 y los comandos del proyecto. Un resultado aprobado debe acompañarse de pruebas que comprueben el funcionamiento sin conexión.
- **Prueba ejecutada y resultado:** Codex ejecutó `npm.cmd ci --ignore-scripts --no-audit --no-fund`, `node scripts/verify.mjs` y `bash public-tests/check.sh`. Todos terminaron con código 0: 35 casos aprobados (9 de manifest y estructura, 19 del Service Worker y 7 de offline), barrido aprobado, compilación correcta y cuatro chequeos públicos aprobados. El reporte identifica Semana 3 y el SHA revisado. El detalle está en [la revisión final](session-log.md#revisión-final-de-juan-andrés--semana-3).
- **Limitación:** las pruebas automáticas del worker usan un navegador simulado en memoria. El funcionamiento sin conexión necesita una primera visita con red y la instalación completa del worker; no hay captura de nuevas inspecciones ni sincronización. Los fallos de la revisión inicial quedaron corregidos en el turno de Ismael.
- **Uso de IA:** Codex (OpenAI) como apoyo para configurar CI, revisar la integración, ejecutar comprobaciones y redactar documentación. Validación humana de esta semana: pendiente de registrar la revisión personal.

## Integrante: Montalvo Marcial Kevin Armando

- **Matrícula:** 3523110092.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** revisé y ajusté la decisión de producto [docs/decision-record.md](../docs/decision-record.md): cité el alcance oficial del curso, precisé el uso de la cámara para la evidencia opcional con APIs web, añadí la exigencia de notificaciones con degradación segura y un ensayo de validación futuro (punto 6). También restauré el formato Markdown de [docs/requirements.md](../docs/requirements.md), cuyas tablas y encabezados se habían roto al integrar los cambios del equipo, sin alterar su contenido.
- **Decisión que puedo explicar y por qué:** usar `npm.cmd` en vez de `npm` porque la política de ejecución de PowerShell bloquea `npm.ps1` en mi máquina; decidí además mantener Node v22.22.0 porque cumple el requisito de la actividad (20.19 o posterior) y ya estaba instalado, lo que refuerza RNF-01 al declarar un segundo entorno verificado distinto al de Juan Andrés.
- **Comando o prueba que ejecuté:** el 5 y 6 de septiembre de 2026 ejecuté desde la carpeta del proyecto `npm.cmd ci`, `npm.cmd run dev`, `npm.cmd run build` y `npm.cmd test`, y posteriormente `npm.cmd run verify`.
- **Resultado real que observé:** `npm.cmd ci` añadió 28 paquetes y auditó 29 (2 vulnerabilidades de severidad alta, sin corregir a propósito para conservar el lockfile). El servidor en `http://localhost:3000` mostró las tres inspecciones sintéticas (Redes, Electrónica y Software) con sus valores esperados. `npm.cmd test` terminó con `starter.spec.mjs: PASS` y `npm.cmd run build` compiló correctamente; `npm.cmd run verify` generó `reports/verification.json` con estado `pass`.
- **Qué verifica y qué no:** la prueba proporcionada comprueba que el script `build` sea exactamente `next build` y que `src/app/page.tsx` contenga el título «Inspecciones de laboratorio» y la mención de datos «sintéticos»; no renderiza la página, no cuenta tarjetas, no mide accesibilidad ni prueba offline, persistencia o sincronización. Un resultado `pass` técnico no evalúa la calidad de los documentos ni certifica ausencia de información sensible.
- **Limitación, dificultad o riesgo que identifiqué:** mi verificación se ejecutó en un solo entorno (Windows, Node v22.22.0); la CI usa Node 20.19.6 y debe confirmarse en Actions. Además, al integrar los cambios del equipo apareció un `reports/verification.json` con `commitSha` nulo y marcadores «PENDIENTE», que retiré de Git porque el reporte no debe versionarse; se regenerará sobre el commit final con `npm.cmd run verify`.
- **Uso de IA:** usé un asistente de IA de terminal (opencode) como apoyo para revisar el ADR, restaurar el formato de los documentos, redactar esta evidencia y explicar los resultados. Las decisiones de contenido y los comandos de verificación los ejecuté y confirmé personalmente en PowerShell: instalación, servidor con las tres inspecciones, `npm.cmd test` en `PASS` y `npm.cmd run verify` con `reports/verification.json` real.

### Semana 2

- **Decisión técnica que puedo explicar:** construí el app shell como componente de servidor (`src/components/app-shell.tsx`) con puntos de referencia accesibles: enlace para saltar al contenido, encabezado con marca y navegación principal, `<main id="contenido-principal">` y pie; los estados de carga, error y vacío se cubren con `src/app/loading.tsx`, `src/app/error.tsx` y una rama en `src/app/page.tsx`. La página usa `export const dynamic = "force-dynamic"` y `await loadInspections()`, con un cargador sintético determinista (700 ms de latencia simulada y fallo desactivado mediante `src/lib/data/inspection-controls.ts`), para que el estado de carga sea observable sin depender de servicios externos.
- **Prueba que ejecuté y resultado:** `npm.cmd test` terminó con `starter.spec.mjs: PASS`; `npm run build` compiló con código 0 (ruta `/` dinámica, First Load JS 87.4 kB); `npm run dev` con el AppShell integrado temporalmente en `layout.tsx` respondió HTTP 200 e incluyó el enlace «Saltar al contenido», la navegación principal, `main#contenido-principal`, el pie y el título. Después de verificar restauré `layout.tsx` a su versión de Semana 1 (el Turno 2 lo integra).
- **Limitación o fallo diagnosticado:** `npm test` y `npm run build` no comprueban los estados de carga/error/vacío ni la accesibilidad del shell en un navegador real; la validación visual que ejecuté es una comprobación separada. Además, el AppShell solo estará visible en el sitio oficial cuando el Turno 2 (layout y manifest) se integre en `master`.
- **Uso declarado de IA (herramienta, propósito, validación):** usé opencode para redactar los componentes, ajustar los estilos y guiar la verificación; los comandos de prueba, build y servidor los ejecuté personalmente en PowerShell y comprobé el HTML servido.
- **Commit de mi turno (SHA):** `3f3f0754c297424f069c6bc554b3e2a9958ce3bd` — `feat(w02): app shell y estados de carga, error y vacio`, empujado a `origin/master` el 10 de septiembre de 2026.

### Semana 3 · Turno 1 — Service Worker y respaldo offline

- **Entregado por:** Kevin.
- **Descripción de lo que hice (consigna):** declaré en `public/sw.js` el service worker de la app: precache de la shell (/, offline.html, manifest e íconos), estrategia network-first para navegaciones con fallback a `public/offline.html`, caché runtime stale-while-revalidate para `/_next/static/*`, caché primero a cache para el resto, siempre por red para `/api/...` y las peticiones con encabezado de autorización (evita guardar datos personales en caché), y mensajes `SKIP_WAITING` / `PURGE_CACHES` para actualizaciones y depuración manual. Lo registré desde `src/lib/pwa/register-service-worker.ts` y lo monté en el cliente con `src/components/register-sw.tsx`. Agregué `<RegisterSw />` al layout y una cabecera `Cache-Control: public, max-age=0, no-cache` para `/sw.js` en `next.config.mjs`.
- **Reflexión:** la entrega cumple el objetivo de que la app funcione sin conexión tras la primera visita. El service worker aísla la red: las navegaciones desconocidas caen en la página de respaldo, la lista ya visitada se sirve desde caché, y las versiones anteriores de las cachés se depuran al activar.
- **Archivos modificados:** `public/sw.js`, `public/offline.html`, `src/lib/pwa/register-service-worker.ts`, `src/components/register-sw.tsx`, `src/app/layout.tsx`, `next.config.mjs`. Sin declaraciones especiales.
- **Decisión técnica que puedo explicar:** versiono las cachés con el prefijo `inspecciones-` y depuro versiones anteriores al activar; fuerzo `no-cache` sobre `/sw.js` para que el navegador siempre baje la versión nueva del worker.
- **Fallos diagnosticados y solución:** en la prueba offline el navegador reportaba `Uncaught (in promise) TypeError: Failed to fetch` en `cacheFirst` al pedir recursos no precacheados (p. ej. los íconos); esa estrategia era la única sin control de errores. Agregué `try/catch` que devuelve un `Response` 503 si la red falla y no hay caché, sin romper el precache ni el fallback.
- **Prueba que ejecuté y resultado:** `npm.cmd test` terminó con `starter.spec.mjs: PASS` (casos de Semanas 1 y 2 intactos); `npm run build` compiló con código 0 (ruta `/` dinámica, First Load JS 87.4 kB). Prueba manual en navegador: `sw.js` registrado con scope `/`; con offline activado la lista de inspecciones se sirve desde caché; `http://localhost:3000/xyz` en offline mostró la página «Estás sin conexión»; la consola quedó sin errores del service worker tras la corrección.
- **Uso de IA:** usé un asistente de IA de terminal (opencode) como apoyo para redactar el service worker, el registro, la evidencia y guiar la verificación; los comandos `npm.cmd test`, `npm run build`, el servidor y la prueba manual los ejecuté y confirmé personalmente en PowerShell y en el navegador.
- **Commit del turno (SHA):** `d7a92e4` — `feat(w03): service worker con precache, runtime cache y fallback offline`; evidencia en `7d7d654` — `docs(w03): evidencia y bitacora de Kevin — Turno 1`.

### Semana 4 · Turno 1 — Rutas CSR y SSR con estados verificables

- **Entregado por:** Kevin.
- **Rama y PR:** rama `semana-4-t1-kevin-rutas`; PR `<completar>` (URL: `<completar>`); revisor y merge: Ismael (SHA del merge: `<completar>`).
- **Descripción de lo que hice (consigna):** creé la ruta CSR `src/app/inspecciones/page.tsx`
  (listado con estado inicial de carga idéntico en servidor y cliente, sin hydration mismatch;
  estados de carga, error con reintento y vacío) y la ruta SSR
  `src/app/inspecciones/[id]/page.tsx` (datos cargados en servidor con `force-dynamic` y
  `notFound()` para identificadores inexistentes, con `not-found.tsx` propio). Agregué el
  componente reutilizable `src/components/loading-state.tsx` y los subcomponentes del listado
  (grid, vacío y error) en `src/components/inspecciones-view.tsx`, los `loading.tsx`/`error.tsx`
  de ambas rutas y la navegación: enlace "Inspecciones" en el shell y "Ver detalle" en las
  tarjetas de la home; agregué también estilos en `globals.css`.
- **Reflexión:** el primer render del listado CSR es idéntico en servidor y cliente, lo que
  evita el hydration mismatch; el detalle SSR entrega contenido verificable en el HTML inicial.
  La ruta CSR mostrará la métrica de carga en ms al usuario, sin que las pruebas dependan de su valor.
- **Archivos modificados:** `src/app/inspecciones/page.tsx`, `src/app/inspecciones/[id]/page.tsx`,
  `src/app/inspecciones/[id]/not-found.tsx`, `src/app/inspecciones/loading.tsx`,
  `src/app/inspecciones/error.tsx`, `src/app/inspecciones/[id]/loading.tsx`,
  `src/app/inspecciones/[id]/error.tsx`, `src/components/loading-state.tsx`,
  `src/components/inspecciones-view.tsx`, `src/components/app-shell.tsx`,
  `src/app/page.tsx`, `src/app/globals.css`.
- **Decisión técnica que puedo explicar:** el listado es CSR para cargar en cliente con
  interacción (reintento, métrica visible) y el detalle es SSR para que el contenido llegue en el
  HTML inicial; el estado inicial del CSR es "cargando" para que servidor y cliente coincidan.
  Los subcomponentes del listado viven en `src/components/inspecciones-view.tsx` (fuera de la
  ruta) porque Next.js no permite exportar componentes con nombre desde un `page.tsx`.
- **Fallos diagnosticados y solución:** el build fallaba porque la página del listado exportaba
  `InspeccionesGrid`/`InspeccionesEmpty`/`InspeccionesError` además del `default`
  (`Property 'InspeccionesGrid' is incompatible with index signature`); moví esos subcomponentes
  a `src/components/inspecciones-view.tsx` y el build compiló. También observé que la ruta
  inexistente renderiza la página "Inspección no encontrada" pero con status HTTP 200, por el
  streaming de `loading.tsx`: Next.js fija el status antes de saber que habrá `notFound()`; es
  comportamiento de plataforma y la prueba del Turno 2 valida el rechazo a nivel de componente.
- **Prueba que ejecuté y resultado:** `npm.cmd test` con `starter.spec.mjs: PASS` (3 suites,
  35 casos previos intactos) y `npm run build` con código 0 (First Load JS 97.6 kB en
  `/inspecciones` y 96.1 kB en `/inspecciones/[id]`). Verificación HTTP: `/` con tarjetas y
  "Ver detalle", `/inspecciones` con estado de carga inicial, detalle SSR con "Laboratorio de
  Redes" en el HTML y 404 renderizado. Detalle en
  [la verificación del turno](week-04/kevin-verificacion.md).
- **Uso de IA:** usé un asistente de IA de terminal (opencode) como apoyo para crear los
  componentes, diagnosticar el fallo del build, ejecutar las comprobaciones y redactar la
  evidencia; validé los resultados con las suites, el build y las respuestas HTTP que el
  asistente me mostró, y dejaré registrada mi comprobación personal en navegador antes de cerrar
  la semana.

# Evidencia individual — Jose Ismael Montalvo Lopez

- **Grupo y equipo:** 10A-E08
- **Integrante:** José Ismael Montalvo Lopes
- **Repositorio privado del equipo:** https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08

## Contribución personal

Mi contribución fue revisar y ajustar el documento `docs/requirements.md`, enfocándome en que el problema estuviera claramente delimitado, que los usuarios y escenarios fueran coherentes, que uno de los escenarios contemplara conectividad intermitente y que los requisitos fueran verificables y estuvieran vinculados con los escenarios.

También revisé que el documento distinguiera entre las funciones implementadas en la Semana 1 y las funciones futuras, incluyera datos ficticios y excluyera datos reales, y que los requisitos no funcionales indicaran una forma concreta de comprobación.

## Decisión que puedo explicar

La decisión que puedo explicar es mantener **Next.js con una trayectoria hacia PWA** en lugar de cambiar el stack. Esta opción permite comenzar con el starter proporcionado y mantener una aplicación web accesible desde teléfono y computadora. Para el escenario con conectividad intermitente, la estrategia contempla como evolución futura la persistencia local y el envío posterior de registros.

También considero importante no afirmar que las funciones offline ya existen: en esta actividad se documentan como requisitos futuros y se limita la implementación actual a la consulta de los datos sintéticos del starter.

## Verificación ejecutada

Ejecuté personalmente en Windows PowerShell, desde la carpeta del proyecto:

```text
npm ci
npm run verify
```

### Resultado real

`npm ci` terminó correctamente:

- **28 paquetes añadidos**
- **29 paquetes auditados**
- npm reportó **2 vulnerabilidades de severidad alta**

Después, `npm run verify` terminó correctamente con:

```text
starter.spec.mjs: PASS
Compiled successfully
Generating static pages (4/4)
Verificación técnica: pass. Revisión académica: pendiente.
Reporte: reports/verification.json
```

El build de Next.js terminó correctamente y generó las 4 páginas estáticas. La verificación técnica final fue **pass**.

## Qué comprueba la verificación

La verificación proporcionada comprueba la estructura requerida, ejecuta la prueba incluida y realiza el build del proyecto.

La prueba `starter.spec.mjs` comprueba condiciones básicas del starter, entre ellas que el script de build sea `next build` y que la página contenga el título de inspecciones y una referencia a datos sintéticos.

El build confirma que el proyecto puede compilarse correctamente en el entorno donde ejecuté el comando.

## Qué no comprueba

La verificación no demuestra que:

- la aplicación funcione realmente sin conexión;
- exista persistencia local o sincronización;
- los requisitos documentales sean correctos o completos;
- la accesibilidad cumpla todas las metas propuestas;
- el sistema esté libre de vulnerabilidades o información sensible;
- exista un backend real;
- las funciones futuras de captura y envío estén implementadas.

## Limitación identificada

Una limitación importante es que `npm run verify` puede terminar en `pass` aunque todavía existan aspectos pendientes del producto. En mi ejecución, además, `npm ci` informó **2 vulnerabilidades de severidad alta**. Esto no impidió la instalación ni el build, pero debe revisarse antes de una publicación.

Por tanto, el resultado `pass` demuestra la verificación técnica proporcionada para esta versión, pero no constituye una auditoría completa de seguridad ni una validación académica de los requisitos.

## Uso de IA y comprobación personal

Utilicé **Codex (OpenAI)** como apoyo para revisar la documentación, proponer ajustes de redacción y trazabilidad de los requisitos, y entender la salida de los comandos de verificación.

La comprobación personal consistió en ejecutar directamente `npm ci` y `npm run verify` en mi entorno Windows PowerShell y revisar el resultado real mostrado por los comandos. No tomé un resultado generado por IA como evidencia de ejecución.

## Estado de entrega

- **SHA final de 40 caracteres:** PENDIENTE — completar con `git rev-parse HEAD` después del último commit.
- **Enlace de GitHub Actions correspondiente al SHA:** PENDIENTE — copiar la ejecución que corresponda exactamente a ese SHA.
- **Acceso docente:** PENDIENTE — indicar `invitado` o `confirmado` según el estado real.
- **Incidencia:** npm reportó 2 vulnerabilidades de severidad alta; no impidieron `npm ci` ni `npm run verify`.

### Semana 2

- **Decisión técnica que puedo explicar:** el manifest (`public/manifest.webmanifest`) actúa como el contrato de instalación PWA: define `name`, `short_name`, `display: "standalone"`, `scope` y `start_url: "/"` según lo acordado por el equipo, y los tres iconos PNG generados (192, 512 y 512 maskable) cubren lo que exige el proceso de instalación del navegador. También reemplacé `src/app/layout.tsx` para enlazar el manifest, declarar los iconos/apple-touch-icon en los metadatos de Next.js y envolver la app con el `AppShell` que ya había integrado Kevin en el Turno 1.
- **Prueba que ejecuté y resultado:** ejecuté `git pull` y `npm ci` sin cambios en el lockfile; generé los iconos con el script de PowerShell y confirmé su existencia con `Get-ChildItem`; corrí `npm run dev`, que compiló sin errores (`Compiled / in 15.6s`, `GET / 200`) y verifiqué visualmente `http://localhost:3000` (encabezado, navegación y contenido) y `http://localhost:3000/manifest.webmanifest` (JSON válido con los valores del Paso 3).
- **Limitación o fallo diagnosticado:** el manifest y los iconos no garantizan que el botón de instalación aparezca en todos los navegadores (depende de heurísticas propias de cada uno); los iconos son generados por script con texto "UTT" sobre un fondo de color, no diseñados gráficamente. Tampoco ejecuté `npm run build` ni `npm run verify` en mi turno, ya que eso corresponde al Turno 3 (Juan Andrés).
- **Uso declarado de IA (herramienta, propósito, validación):** no usé ninguna herramienta de IA para esta parte del turno. Seguí directamente la guía de trabajo (pasos y comandos indicados) y ejecuté yo mismo cada comando en PowerShell, comprobando los resultados en la terminal y en el navegador.
- **Commit de mi turno (SHA):** `a6a1962340814075c49e3a77709cc40035eca010` — `feat(w02): manifest instalable y layout con app shell`, empujado a `origin/master` el 13 de septiembre de 2026.

### Semana 3 · Turno 2 — Pruebas, verificador local y estrategia de caché

- **Integrante:** Ismael, cuenta GitHub `Ismael2509`. Trabajo preparado con Codex sobre la base `d1e2451`. Publicado en master como [af14463309588b2a81de63a90d153a985140ea87](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/af14463309588b2a81de63a90d153a985140ea87), con autor y responsable del commit `Ismael2509`. [Actions de Semana 3 aprobado](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554182934) sobre ese SHA.
- **Contribución:** se añadieron `tests/sw-harness.cjs`, las suites de Service Worker y offline, `docs/cache-strategy.md` y el comprobador local. Se actualizaron el runner, `verify`, el comando del paquete y los cuatro chequeos públicos, conservando dependencias y lockfile.
- **Corrección de integración:** la versión presente de `public/sw.js` solo tenía instalación y activación. Se completó el precache de HTML, respaldo, manifest, iconos y CSS/JavaScript iniciales, las estrategias de respuesta, los mensajes y la limpieza limitada al prefijo de la app. El registro y los componentes existentes se conservaron.
- **Decisión técnica:** reutilizar `source-loader.cjs` y las APIs de Node, con un simulador por prueba que normaliza URLs y clona respuestas. Las pruebas de registro respetan el contrato real existente, que devuelve `undefined` si no hay soporte. Se corrigió el falso resultado aprobado del runner de ejemplo y la comprobación invertida de archivos de la guía.
- **Comprobaciones ejecutadas por Codex:** antes de corregir el worker fallaron 19 de 34 casos; después pasaron 35 de 35 (9 anteriores, 19 del worker y 7 offline, incluyendo un caso adicional de fallo de escritura en caché). `node scripts/verify.mjs` terminó en `pass`, con build correcto y revisión académica pendiente. Los cuatro apartados públicos aprobaron; siete pruebas adicionales comprobaron que los verificadores sí rechazan entradas inválidas.
- **Comprobación real en navegador:** Edge con la versión de producción, contexto limpio y conexión desactivada después de instalar el worker. Se guardaron 15 recursos iniciales; al recargar se conservaron datos y estilos. Una ruta sin copia mostró el respaldo; la purga conservó una caché ajena y sin respaldo se obtuvo 503. No hubo errores JavaScript de página. Evidencia: [resultados](week-03/ismael-verification.json), [inicio offline](week-03/ismael-offline-home.png) y [respaldo](week-03/ismael-offline-fallback.png).
- **Límites y validación personal:** esta ejecución la realizó Codex; la revisión personal de Ismael queda pendiente. No acredita instalación en un teléfono, ausencia de vulnerabilidades, captura de nuevas inspecciones ni sincronización. La comprobación de palabras documenta sus excepciones y conserva el reporte histórico de Semana 2 intacto.
- **Uso de IA:** se utilizó Codex (OpenAI) para revisar la guía, implementar correcciones, ejecutar pruebas y redactar esta evidencia. No se adopta la frase de la plantilla que negaba el uso de IA.
