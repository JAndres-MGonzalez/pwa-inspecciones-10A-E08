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
