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

    