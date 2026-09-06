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

Estado: identificación del equipo completa. La sección de Juan Andrés documenta su instalación y verificación local. Las secciones de Jose Ismael y Kevin Armando siguen pendientes de sus aportaciones personales. La identificación académica se conserva en el repositorio privado y Classroom; no forma parte del dataset de inspecciones.

## Integrante: Medina González Juan Andrés

- **Matrícula:** 3523110131.
- **Grupo y equipo:** 10A-E08.
- **Mi contribución concreta y enlace:** puse en marcha la copia del proyecto en mi computadora. Instalé las dependencias, inicié el servidor y ejecuté la verificación. Compartí las salidas de PowerShell, registradas en [la bitácora de mi ejecución](session-log.md#ejecución-local-compartida-por-el-usuario).
- **Decisión que puedo explicar y por qué:** conservar el starter de Next.js y comprobar que funciona antes de agregar funciones. Esta semana se pide arrancar el proyecto y documentarlo. Partir de una base que compila facilita continuar después con la PWA; el funcionamiento sin conexión todavía debe programarse.
- **Comando o prueba que ejecuté:** el 5 de septiembre de 2026 ejecuté `npm ci`, `npm run dev` y después `npm run verify` desde la carpeta del proyecto.
- **Resultado real que observé:** la instalación añadió 28 paquetes. El servidor mostró `Ready in 3.9s` y `GET / 200`. La verificación mostró `starter.spec.mjs: PASS`, `Compiled successfully` y `Verificación técnica: pass`, y generó `reports/verification.json`.
- **Qué verifica y qué no:** la prueba proporcionada revisa que el script de compilación sea `next build` y que el archivo de la página contenga el título y la palabra «sintéticos». El comando completo también comprueba archivos y compila el proyecto. No prueba el funcionamiento sin conexión, la sincronización ni la calidad de los documentos; tampoco asegura que no existan vulnerabilidades.
- **Limitación, dificultad o riesgo que identifiqué:** la aplicación todavía solo muestra datos de ejemplo; no guarda nuevas inspecciones ni funciona offline. Además, npm reportó dos alertas de seguridad de severidad alta, que siguen documentadas y pendientes de atender.
- **Uso de IA:** usé Codex (OpenAI) para preparar el repositorio, apoyar la redacción de requisitos, decisión PWA, README, evidencia y bitácora, y explicar los resultados. Comprobé el proyecto ejecutando personalmente `npm ci`, `npm run dev` y `npm run verify`, y compartí sus salidas.

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
