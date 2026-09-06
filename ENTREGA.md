# Entrega de Medina González Juan Andrés

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
