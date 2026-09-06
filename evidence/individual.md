# Evidencia individual del equipo

- Grupo: **10A**.
- Equipo: **E08** (identificador completo: **10A-E08**).
- Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).
- Integrantes y matrículas proporcionados por el usuario el 5 de septiembre de 2026:

| Matrícula | Nombre completo |
|---|---|
| 3523110131 | Medina González Juan Andrés |
| 3523110741 | Montalvo Lopez Jose Ismael |
| 3523110092 | Montalvo Marcial Kevin Armando |

Estado: identificación del equipo completa. La sección de Juan Andrés documenta su instalación y verificación local, con redacción asistida por IA. Las secciones de Jose Ismael y Kevin Armando siguen pendientes de sus aportaciones personales. La identificación académica se conserva en el repositorio privado y Classroom; no forma parte del dataset de inspecciones.

## Registro de asistencia de IA

Esta sección atribuye el trabajo automatizado; **no sustituye una sección personal ni afirma que un integrante ejecutó los comandos**.

- **Herramienta:** Codex (OpenAI).
- **Propósito:** extraer y conservar el starter, ayudar a definir el producto, redactar documentación, ejecutar la comprobación local y preparar el repositorio privado.
- **Partes influidas:** [requirements.md](../docs/requirements.md), [decision-record.md](../docs/decision-record.md), [README](../README.md), esta evidencia y [bitácora](session-log.md). Se consultaron fuentes primarias enlazadas en el ADR.
- **Contribución verificable de esta sesión:** instalación, inspección del listado en navegador y ejecución de `npm run verify`. Los resultados observados se detallan en la bitácora.
- **Decisión documentada:** conservar Next.js y proponer evolución PWA porque el listado funciona por URL y la captura futura necesita continuidad ante cortes. Persistencia y sincronización requieren implementación propia.
- **Resultado real de la herramienta:** `npm ci` concluyó con código 0 en el reintento autorizado; `npm run verify` concluyó con código 0, prueba `starter.spec.mjs: PASS` y build exitoso. La auditoría de dependencias concluyó con código 1 y dos dependencias de severidad alta.
- **Qué comprueba:** instalación en el entorno registrado, presencia de archivos, tres aserciones de la prueba proporcionada y compilación. La consulta del navegador comprobó los tres registros.
- **Qué no comprueba:** calidad del análisis, aportación de cada persona, ausencia de vulnerabilidades, conformidad completa de accesibilidad, guardado, offline o sincronización.
- **Limitación observada:** avisos de seguridad en dependencias y aviso de caché de Webpack. El proyecto funciona, pero no existe una auditoría integral.
- **Verificación comunicada por el usuario:** después de clonar, compartió las salidas de `npm ci`, `npm run dev` y `npm run verify`; esta última indica `starter.spec.mjs: PASS`, compilación correcta y verificación técnica `pass`. Se conserva el detalle en [la bitácora](session-log.md#ejecución-local-compartida-por-el-usuario). Esa ejecución no acredita automáticamente el trabajo de los tres integrantes ni su revisión de los documentos.

## Integrante: Medina González Juan Andrés

- **Matrícula:** 3523110131.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** puse en marcha la copia del proyecto en mi computadora. Instalé las dependencias, inicié el servidor y ejecuté la verificación. Compartí las salidas de PowerShell, registradas en [la bitácora de mi ejecución](session-log.md#ejecución-local-compartida-por-el-usuario). El repositorio y la documentación se prepararon con apoyo de Codex.
- **Decisión que puedo explicar y por qué:** conservar el starter de Next.js y comprobar que funciona antes de agregar funciones. Esta semana se pide arrancar el proyecto y documentarlo. Partir de una base que compila facilita continuar después con la PWA; el funcionamiento sin conexión todavía debe programarse.
- **Comando o prueba que ejecuté:** el 5 de septiembre de 2026 ejecuté `npm ci`, `npm run dev` y después `npm run verify` desde la carpeta del proyecto.
- **Resultado real que observé:** la instalación añadió 28 paquetes. El servidor mostró `Ready in 3.9s` y `GET / 200`. La verificación mostró `starter.spec.mjs: PASS`, `Compiled successfully` y `Verificación técnica: pass`, y generó `reports/verification.json`.
- **Qué verifica y qué no:** la prueba proporcionada revisa que el script de compilación sea `next build` y que el archivo de la página contenga el título y la palabra «sintéticos». El comando completo también comprueba archivos y compila el proyecto. No prueba el funcionamiento sin conexión, la sincronización ni la calidad de los documentos; tampoco asegura que no existan vulnerabilidades.
- **Limitación, dificultad o riesgo que identifiqué:** la aplicación todavía solo muestra datos de ejemplo; no guarda nuevas inspecciones ni funciona offline. Además, npm reportó dos alertas de seguridad de severidad alta, que siguen documentadas y pendientes de atender.
- **Uso de IA:** utilicé Codex (OpenAI) para ayudar a preparar el repositorio, organizar la documentación, explicar las salidas de los comandos y redactar esta evidencia. Mi comprobación personal consistió en ejecutar la instalación, el servidor y la verificación en PowerShell y compartir los resultados. La redacción de esta sección recibió ayuda de IA.

## Integrante: Montalvo Lopez Jose Ismael

- **Matrícula:** 3523110741.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** pendiente de declaración personal, con enlace a archivo, commit o revisión.
- **Decisión que puedo explicar y por qué:** pendiente de explicación propia tras revisar [el ADR](../docs/decision-record.md).
- **Comando o prueba que ejecuté:** pendiente de registrar la ejecución personal; no se atribuye automáticamente la ejecución de otro integrante.
- **Resultado real que observé:** pendiente de declaración personal, con fecha, comando y resultado.
- **Qué verifica y qué no:** pendiente de explicación propia; puede contrastarse con [la descripción de la prueba](session-log.md#explicación-de-la-prueba-proporcionada).
- **Limitación, dificultad o riesgo que identifiqué:** pendiente de reflexión personal.
- **Uso de IA:** el producto recibió asistencia de Codex; pendiente precisar el uso personal, las partes utilizadas y la comprobación humana realizada.

## Integrante: Montalvo Marcial Kevin Armando

- **Matrícula:** 3523110092.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** pendiente de declaración personal, con enlace a archivo, commit o revisión.
- **Decisión que puedo explicar y por qué:** pendiente de explicación propia tras revisar [el ADR](../docs/decision-record.md).
- **Comando o prueba que ejecuté:** pendiente de registrar la ejecución personal; no se atribuye automáticamente la ejecución de otro integrante.
- **Resultado real que observé:** pendiente de declaración personal, con fecha, comando y resultado.
- **Qué verifica y qué no:** pendiente de explicación propia; puede contrastarse con [la descripción de la prueba](session-log.md#explicación-de-la-prueba-proporcionada).
- **Limitación, dificultad o riesgo que identifiqué:** pendiente de reflexión personal.
- **Uso de IA:** el producto recibió asistencia de Codex; pendiente precisar el uso personal, las partes utilizadas y la comprobación humana realizada.

El SHA final se entrega en Classroom después del último commit. Este documento no contiene un SHA que deba volver a incorporarse a otro commit.
