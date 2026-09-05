# Evidencia individual del equipo

- Grupo: **10A**.
- Equipo: **E08** (identificador completo: **10A-E08**).
- Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-laboratorio](https://github.com/JAndres-MGonzalez/pwa-inspecciones-laboratorio).
- Integrantes y matrículas proporcionados por el usuario el 5 de septiembre de 2026:

| Matrícula | Nombre completo |
|---|---|
| 3523110131 | Medina González Juan Andrés |
| 3523110741 | Montalvo Lopez Jose Ismael |
| 3523110092 | Montalvo Marcial Kevin Armando |

Estado: identificación del equipo completa; aportaciones y explicaciones personales pendientes de revisión por cada integrante. La identificación académica se conserva en el repositorio privado y Classroom; no forma parte del dataset de inspecciones.

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
- **Mi contribución concreta y enlace:** pendiente de declaración personal, con enlace a archivo, commit o revisión.
- **Decisión que puedo explicar y por qué:** pendiente de explicación propia tras revisar [el ADR](../docs/decision-record.md).
- **Comando o prueba que ejecuté:** pendiente de confirmar y vincular la ejecución personal correspondiente. La ejecución local compartida en la conversación está registrada en [la bitácora](session-log.md#ejecución-local-compartida-por-el-usuario).
- **Resultado real que observé:** pendiente de confirmación personal, con fecha y resultado de la ejecución indicada.
- **Qué verifica y qué no:** pendiente de explicación propia; puede contrastarse con [la descripción de la prueba](session-log.md#explicación-de-la-prueba-proporcionada).
- **Limitación, dificultad o riesgo que identifiqué:** pendiente de reflexión personal.
- **Uso de IA:** el producto recibió asistencia de Codex; pendiente precisar el uso personal, las partes utilizadas y la comprobación humana realizada.

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
