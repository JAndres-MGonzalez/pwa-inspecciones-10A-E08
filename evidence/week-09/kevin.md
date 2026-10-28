# Evidencia Semana 9 — Kevin Armando Montalvo Marcial

- **Identificador:** Kevin Armando Montalvo Marcial (3523110092)
- **Rol:** Bloque A — Validación de Entradas, Sanitización y Suite Base de Seguridad
- **Actividad:** `w09-security-privacy`
- **Rama:** `semana-9-arranque-seguridad`

---

## Archivos creados / modificados

| Archivo | Acción | Descripción |
|---|---|---|
| `src/lib/storage/schema.ts` | Modificado | Actualizado identificador de actividad `ASSIGNMENT_ID = "w09-security-privacy"` |
| `src/lib/security/input-validation.ts` | Creado | Módulo nativo de validación defensiva y sanitización contra inyecciones y XSS |
| `src/lib/security/index.ts` | Creado | Punto de exportación central para utilidades de seguridad |
| `tests/security.spec.ts` | Creado | Suite automatizada de seguridad con 8 checks deterministas (AC-02 / AC-03) |
| `evidence/week-09/kevin.md` | Creado | Documento de evidencia individual y justificación técnica |
| `evidence/week-09/kevin-linea-base.txt` | Creado | Salida de suite completa en verde previa a modificaciones |
| `evidence/week-09/kevin-negativo-rotura.txt` | Creado | Falla controlada al desactivar intencionalmente la sanitización |
| `evidence/week-09/kevin-restaurado.txt` | Creado | Recuperación exitosa en verde tras restaurar el código de producción |

---

## Decisiones Técnicas

### 1. Expresión regular segura para identificadores sintéticos (`SAFE_ID_REGEX`)
Se define `/^[a-zA-Z0-9_-]+$/` para admitir únicamente caracteres alfanuméricos, guiones y guiones bajos. Esto neutraliza vectores de path traversal (`../`), inyecciones de comandos o caracteres nulos antes de que cualquier identificador ingrese al subsistema de almacenamiento o enrutamiento.

### 2. Enumeración cerrada para estados (`status`)
En lugar de permitir texto arbitrario, el estado se restringe rígidamente a `ok`, `warning` y `danger` mediante un `Set`. Entradas alteradas o valores no permitidos son rechazados de forma determinista con mensajes de error explícitos.

### 3. Sanitización nativa sin dependencias externas
Para mitigar Cross-Site Scripting (XSS) sin vulnerabilidades de la cadena de suministro ni paquetería npm externa:
- Se purgan bloques de script completos (`<script>...</script>`).
- Se escapan entidades HTML fundamentales (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#x27;`).
- No se elimina texto genérico, transformando etiquetas arbitrarias en representaciones seguras de texto plano.

### 4. Límites de longitud para mitigación DoS y ahorro de almacenamiento
Se imponen topes estrictos de caracteres (64 para identificadores, 256 para campos textuales y 1000 para el resumen) para evitar agotamiento de cuota de almacenamiento local e incidentes de denegación de servicio por desbordamiento de memoria.

---

## Resultados de Pruebas Automatizadas

La suite `tests/security.spec.ts` evalúa 8 verificaciones de seguridad:
1. `sanitize-strips-script-tags`: Eliminación de etiquetas de script maliciosas.
2. `sanitize-escapes-html-entities`: Escape determinista de caracteres especiales HTML.
3. `validate-accepts-valid-synthetic-payload`: Admisión de cargas sintéticas válidas bajo contrato UTT.
4. `validate-rejects-invalid-id-characters`: Rechazo de identificadores con caracteres inseguros.
5. `validate-rejects-invalid-date-format`: Exigencia de formato de fecha ISO YYYY-MM-DD.
6. `validate-rejects-unauthorized-status`: Rechazo de estados ajenos a la enumeración permitida.
7. `validate-rejects-negative-or-decimal-findings`: Restricción de hallazgos a enteros mayores o iguales a 0.
8. `validate-sanitizes-summary-content`: Sanitización preventiva de resúmenes con código embebido.

---

## Demostración de Falla Reproducible (Regresión Negativa)

1. **Línea base (`kevin-linea-base.txt`):** Todas las suites históricas (capacidades, manifest, offline, rendering, service worker, sync, unitarias, integración, E2E) y la nueva suite de seguridad corren en verde (`starter.spec.mjs: PASS`).
2. **Rotura controlada (`kevin-negativo-rotura.txt`):** Al modificar temporalmente `sanitizeString` para devolver la entrada sin procesar, la suite falla inmediatamente en los 3 checks asociados (`sanitize-strips-script-tags`, `sanitize-escapes-html-entities`, `validate-sanitizes-summary-content`), provocando `security: FAIL`.
3. **Restauración (`kevin-restaurado.txt`):** Tras restaurar la función de sanitización en `src/lib/security/input-validation.ts`, la suite recupera el 100% de éxito determinista (`security: PASS`).

---

## Declaración de Uso de IA y Validación Humana

- **Uso de IA:** Asistencia en la formulación de expresiones regulares seguras, estructuración de interfaces TypeScript para cargas sintéticas y diseño sistemático de casos de prueba negativos.
- **Validación Humana:** Revisión manual de la suite contra los criterios de aceptación AC-01, AC-02 y AC-03 del kit académico, ejecución local determinista en PowerShell y verificación estricta de ausencia de credenciales embebidas (`npm run check-secrets`).
