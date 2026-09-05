# Preparación de la entrega en Classroom

Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-laboratorio](https://github.com/JAndres-MGonzalez/pwa-inspecciones-laboratorio).

## Pendientes personales y del equipo

1. Indicar grupo, equipo e integrantes asignados.
2. Revisar requisitos y ADR, corregir supuestos y registrar aceptación real.
3. Completar una sección personal por integrante en [evidence/individual.md](evidence/individual.md), con contribución enlazada, ejecución propia explicada, limitación y declaración de IA.
4. Proporcionar cuentas de GitHub de compañeros y docente para invitarlas. No hay invitaciones realizadas. Si falta la cuenta docente, registrarlo como incidencia.
5. Confirmar la fecha límite directamente en Classroom.

## Fijar la versión después de completar los documentos

Integrar y confirmar los cambios del equipo. Hacer push y obtener el SHA después del último commit:

```bash
git status --short
git push
git rev-parse HEAD
npm run verify
```

El estado debe quedar limpio. El JSON debe tener `status: "pass"`, `workingTreeClean: true` y el mismo `commitSha`. Si se modifica un documento después, crear otro commit y volver a verificar esa nueva versión.

Abrir [Actions del repositorio](https://github.com/JAndres-MGonzalez/pwa-inspecciones-laboratorio/actions), seleccionar «Starter Semana 1 — feedback» para ese SHA y copiar el enlace de la ejecución. Descargar `starter-week-01-evidence` y adjuntar su `verification.json`, o utilizar el reporte local generado sobre ese mismo commit limpio.

## Formato personal

```text
Grupo y equipo: PENDIENTE
Mi nombre: PENDIENTE
Repositorio privado del equipo: https://github.com/JAndres-MGonzalez/pwa-inspecciones-laboratorio
SHA final (40 caracteres): COPIAR DESPUÉS DEL ÚLTIMO COMMIT
Enlace a Actions de ese SHA: COPIAR LA EJECUCIÓN CORRESPONDIENTE
Mi sección en evidence/individual.md: PENDIENTE
Mi contribución y enlace al archivo, commit o revisión: PENDIENTE
Acceso docente: falta cuenta por indicar
Incidencia: evidencia personal y acceso pendientes; revisar avisos de dependencias documentados
Adjuntos: verification.json y evidence/individual.md
```

Cada integrante registra su propia entrega. Este archivo es una guía, no constancia de entrega en Classroom ni de una calificación. El resultado técnico no sustituye la evidencia personal.
