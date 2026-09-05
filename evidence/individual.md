# Evidencia individual del equipo

- Grupo y equipo: **pendientes de indicar por el usuario**.
- Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-laboratorio](https://github.com/JAndres-MGonzalez/pwa-inspecciones-laboratorio).
- Integrantes: **pendientes de identificar**. La cuenta de GitHub no demuestra el nombre académico ni la composición del equipo.
- Estado: evidencia personal incompleta; pendiente de revisión y aportación de cada integrante.

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
- **Limitación observada:** avisos de seguridad en dependencias y aviso de caché de Webpack. El proyecto funciona, pero no existe una auditoría integral ni evidencia humana confirmada.
- **Verificación humana:** pendiente. No se ha recibido una declaración personal de revisión o ejecución del equipo.

## Integrante: pendiente de identificar

Esta sección se reserva para una persona real; se añadirán secciones equivalentes cuando se confirme la lista de integrantes, conservando el equipo asignado.

- **Mi contribución concreta y enlace:** pendiente de declaración personal. No se atribuyen automáticamente a esta persona los documentos escritos con IA.
- **Decisión que puedo explicar y por qué:** pendiente de explicación personal tras revisar [el ADR](../docs/decision-record.md).
- **Comando o prueba que ejecuté:** pendiente de ejecución o confirmación personal. Los comandos de la bitácora fueron ejecutados por Codex.
- **Resultado real que observé:** pendiente de declaración personal, incluyendo fecha, comando y salida.
- **Qué verifica y qué no:** pendiente de explicación propia. Como referencia, la prueba inicial lee archivos, verifica `scripts.build === "next build"` y busca el título y «sintéticos» en el código; no inicia un navegador.
- **Limitación, dificultad o riesgo que identifiqué:** pendiente de reflexión personal.
- **Uso de IA:** este producto recibió ayuda de Codex para documentación y verificación. Cada integrante debe precisar qué partes utilizó, qué cambió y cómo las comprobó por su cuenta.

El SHA final se entrega en Classroom después del último commit. Este documento no contiene un SHA que deba volver a incorporarse a otro commit.
