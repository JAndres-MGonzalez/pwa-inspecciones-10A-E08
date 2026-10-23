# Entrega de Medina González Juan Andrés

## Semana 8 · w08-testing-ci

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).
Grupo y equipo: **10A-E08**. Mi sección: [Juan Andrés](evidence/individual.md#integrante-medina-gonzález-juan-andrés).

La entrega es individual en Classroom. Los tres integrantes utilizan el mismo SHA final integrado y cada quien identifica su propia evidencia. No se requiere tag.

Después del último merge, obtener `git rev-parse HEAD` y confirmar que coincide con Actions y con los reportes. El SHA final se escribe en Classroom o en el TXT de entrega generado fuera de Git; no se crea otro commit solo para incluirlo dentro de sí mismo.

Formato para copiar después de verificar la versión integrada:

```text
Semana / actividad: Semana 8 / w08-testing-ci
Grupo y equipo: 10A-E08
Mi nombre: Medina González Juan Andrés
Repositorio: https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08
SHA final común del equipo: obtener después del último merge
Actions de ese SHA: ejecución de academic-evaluation correspondiente a ese commit
Documentos y reporte: docs/test-strategy.md, README.md y artefacto academic-evidence-w08-testing-ci
Mi sección de evidencia individual: evidence/individual.md, Juan Andrés, Semana 8
Mi contribución y enlace: captura, persistencia, validación, E2E y CI; evidence/w08/juan-andres.md
Acceso del docente: repositorio público; acceso personal del docente no confirmado
Incidencias o limitaciones: API de demostración en memoria; localStorage con cuota y sujeto a borrado
```

Adjuntar `verification.json` del SHA final y `evidence/individual.md`. Incluir enlaces a estrategia, evidencia y resultados/cobertura de CI. El JSON debe indicar `status: pass`, árbol limpio y el mismo SHA.

Comprobaciones: `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, `npm test`, `npm run verify` (equivalente exacto de `make verify`), chequeo público y resumen de evaluación. Los comandos completos están en el README. El E2E requiere Chrome/Edge instalado.

El plazo es el que indique Classroom y la actividad dura como máximo siete días. Si alguna ejecución falla antes del plazo, conservar el enlace y describir el error; el color verde técnico no fija una calificación.

## Registro de la entrega inicial

Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

Grupo **10A**, equipo **E08** (**10A-E08**). Matrícula: **3523110131**.

Evidencia personal: [sección de Juan Andrés](evidence/individual.md#integrante-medina-gonzález-juan-andrés).

## Preparar la entrega

1. Revisar requisitos y ADR, corregir supuestos y registrar aceptación real.
2. Comprobar que la evidencia personal y el reporte correspondan a la versión que se entrega.
3. Confirmar el acceso docente al repositorio privado. Si falta su cuenta, registrarlo como incidencia.
4. Confirmar la fecha límite directamente en Classroom.

## Fijar la versión después de completar los documentos

Integrar y confirmar los cambios del equipo. Hacer push y obtener el SHA después del último commit:

```bash
git status --short
git push
git rev-parse HEAD
npm run verify
```

El estado debe quedar limpio. El JSON debe tener `status: "pass"`, `workingTreeClean: true` y el mismo `commitSha`. Si se modifica un documento después, crear otro commit y volver a verificar esa nueva versión.

Abrir [Actions del repositorio](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions), seleccionar «Starter Semana 1 — feedback» para ese SHA y copiar el enlace de la ejecución. Descargar `starter-week-01-evidence` y adjuntar su `verification.json`, o utilizar el reporte local generado sobre ese mismo commit limpio.

## Formato personal

```text
Grupo y equipo: 10A-E08
Mi nombre: Medina González Juan Andrés
Matrícula: 3523110131
Repositorio privado del equipo: https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08
SHA final (40 caracteres): COPIAR DESPUÉS DEL ÚLTIMO COMMIT
Enlace a Actions de ese SHA: COPIAR LA EJECUCIÓN CORRESPONDIENTE
Mi sección en evidence/individual.md: Integrante: Medina González Juan Andrés
Mi contribución y enlace al archivo, commit o revisión: Instalé las dependencias, inicié el servidor y ejecuté npm run verify en mi computadora. Registro: evidence/session-log.md, sección Ejecución de Juan Andrés.
Acceso docente: falta cuenta por indicar
Incidencia, si existe: falta la cuenta del docente para darle acceso. Los avisos de dependencias están registrados en el README.
Adjuntos: verification.json y evidence/individual.md
```

La entrega en Classroom es individual. La consigna pide el mismo repositorio y SHA del equipo, con una sección propia por integrante en `evidence/individual.md`.
