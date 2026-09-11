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

## Integrante: Montalvo Marcial Kevin Armando

- **Matrícula:** 3523110092.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** revisé y ajusté la decisión de producto [docs/decision-record.md](../docs/decision-record.md): cité el alcance oficial del curso, precisé el uso de la cámara para la evidencia opcional con APIs web, añadí la exigencia de notificaciones con degradación segura y un ensayo de validación futuro (punto 6). También restauré el formato Markdown de [docs/requirements.md](../docs/requirements.md), cuyas tablas y encabezados se habían roto al integrar los cambios del equipo, sin alterar su contenido.
- **Decisión que puedo explicar y por qué:** usar `npm.cmd` en vez de `npm` porque la política de ejecución de PowerShell bloquea `npm.ps1` en mi máquina; decidí además mantener Node v22.22.0 porque cumple el requisito de la actividad (20.19 o posterior) y ya estaba instalado, lo que refuerza RNF-01 al declarar un segundo entorno verificado distinto al de Juan Andrés.
- **Comando o prueba que ejecuté:** el 5 y 6 de septiembre de 2026 ejecuté desde la carpeta del proyecto `npm.cmd ci`, `npm.cmd run dev`, `npm.cmd run build` y `npm.cmd test`, y posteriormente `npm.cmd run verify`.
- **Resultado real que observé:** `npm.cmd ci` añadió 28 paquetes y auditó 29 (2 vulnerabilidades de severidad alta, sin corregir a propósito para conservar el lockfile). El servidor en `http://localhost:3000` mostró las tres inspecciones sintéticas (Redes, Electrónica y Software) con sus valores esperados. `npm.cmd test` terminó con `starter.spec.mjs: PASS` y `npm.cmd run build` compiló correctamente; `npm.cmd run verify` generó `reports/verification.json` con estado `pass`.
- **Qué verifica y qué no:** la prueba proporcionada comprueba que el script `build` sea exactamente `next build` y que `src/app/page.tsx` contenga el título «Inspecciones de laboratorio» y la mención de datos «sintéticos»; no renderiza la página, no cuenta tarjetas, no mide accesibilidad ni prueba offline, persistencia o sincronización. Un resultado `pass` técnico no evalúa la calidad de los documentos ni certifica ausencia de secretos.
- **Limitación, dificultad o riesgo que identifiqué:** mi verificación se ejecutó en un solo entorno (Windows, Node v22.22.0); la CI usa Node 20.19.6 y debe confirmarse en Actions. Además, al integrar los cambios del equipo apareció un `reports/verification.json` con `commitSha` nulo y marcadores «PENDIENTE», que retiré de Git porque el reporte no debe versionarse; se regenerará sobre el commit final con `npm.cmd run verify`.
- **Uso de IA:** usé un asistente de IA de terminal (opencode) como apoyo para revisar el ADR, restaurar el formato de los documentos, redactar esta evidencia y explicar los resultados. Las decisiones de contenido y los comandos de verificación los ejecuté y confirmé personalmente en PowerShell: instalación, servidor con las tres inspecciones, `npm.cmd test` en `PASS` y `npm.cmd run verify` con `reports/verification.json` real.

### Semana 2

- **Decisión técnica que puedo explicar:** construí el app shell como componente de servidor (`src/components/app-shell.tsx`) con puntos de referencia accesibles: enlace para saltar al contenido, encabezado con marca y navegación principal, `<main id="contenido-principal">` y pie; los estados de carga, error y vacío se cubren con `src/app/loading.tsx`, `src/app/error.tsx` y una rama en `src/app/page.tsx`. La página usa `export const dynamic = "force-dynamic"` y `await loadInspections()`, con un cargador sintético determinista (700 ms de latencia simulada y fallo desactivado mediante `src/lib/data/inspection-controls.ts`), para que el estado de carga sea observable sin depender de servicios externos.
- **Prueba que ejecuté y resultado:** `npm.cmd test` terminó con `starter.spec.mjs: PASS`; `npm run build` compiló con código 0 (ruta `/` dinámica, First Load JS 87.4 kB); `npm run dev` con el AppShell integrado temporalmente en `layout.tsx` respondió HTTP 200 e incluyó el enlace «Saltar al contenido», la navegación principal, `main#contenido-principal`, el pie y el título. Después de verificar restauré `layout.tsx` a su versión de Semana 1 (el Turno 2 lo integra).
- **Limitación o fallo diagnosticado:** `npm test` y `npm run build` no comprueban los estados de carga/error/vacío ni la accesibilidad del shell en un navegador real; la validación visual que ejecuté es una comprobación separada. Además, el AppShell solo estará visible en el sitio oficial cuando el Turno 2 (layout y manifest) se integre en `master`.
- **Uso declarado de IA (herramienta, propósito, validación):** usé opencode para redactar los componentes, ajustar los estilos y guiar la verificación; los comandos de prueba, build y servidor los ejecuté personalmente en PowerShell y comprobé el HTML servido.

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
- el sistema esté libre de vulnerabilidades o secretos;
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

