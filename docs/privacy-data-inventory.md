# Inventario de Datos y Cumplimiento de Privacidad (LGPDPPSO)

- **Entidad:** Universidad Tecnologica de Tehuacan (UTT) - Sujeto Obligado.
- **Aplicacion:** PWA de Inspecciones de Mantenimiento de Laboratorios.
- **Marco Normativo:** Ley General de Proteccion de Datos Personales en Posesion de Sujetos Obligados (LGPDPPSO).
- **Ambito de Aplicacion:** Datos de operacion exclusivamente sinteticos en entorno offline-first.

---

## 1. Principios de Proteccion de Datos Aplicados

Conforme al Titulo Segundo de la LGPDPPSO, el diseno de la PWA se orienta a los siguientes principios rectores:

1. **Principio de Licitud:** El tratamiento de la informacion responde estrictamente al mantenimiento preventivo y correctivo de la infraestructura educativa de la UTT.
2. **Principio de Finalidad:** Los datos recolectados se limitan al registro de condiciones tecnicas de los laboratorios (redes, quimica, computo). No se utilizan para perfiles de conducta ni evaluacion laboral.
3. **Principio de Proporcionalidad y Minimizacion:** Solo se deben recolectar los campos estrictamente necesarios. Es lineamiento del proyecto no almacenar datos personales de contacto, fotografias faciales ni rastreo continuo.
4. **Principio de Responsabilidad:** Se desarrollaron funciones de privacidad (truncado de geolocalizacion, enmascarado de correos y telefonos, rechazo de imagenes vectoriales). Estas funciones todavia **no estan conectadas al formulario de captura** (ver seccion 5), por lo que hoy son una medida preparada y no un control activo de la app.

---

## 2. Inventario de Datos Tratados

| Campo | Categoria | Finalidad Tecnica | Nivel de Riesgo | Medida de Mitigacion / Control |
|---|---|---|---|---|
| `id` | Identificador de Inspeccion | Identificacion unica del registro sintetico | Nulo | Formato controlado alfanumerico (`insp-utt-xxx`). |
| `location` | Datos de Infraestructura | Nombre del laboratorio inspeccionado | Bajo | Catalogo cerrado institucional. |
| `date` | Temporal | Fecha de ejecucion de la inspeccion | Bajo | Formato estandar ISO YYYY-MM-DD. |
| `inspector` | Seudonimo Operativo | Trazabilidad del rol ejecutor | Bajo | Seudonimizado (`Inspector Sintetico 01`). Prohibido usar nombres o matriculas reales. |
| `status` / `findings` | Diagnostico Operativo | Semaforo del estado del laboratorio | Nulo | Enumeracion estricta (`ok`, `warning`, `danger`) y enteros. |
| `summary` | Observaciones | Descripcion tecnica de fallas o mejoras | Medio | Existe la funcion `maskSensitiveData` para enmascarar correos y telefonos; **no esta conectada al formulario**. Mientras tanto, no escribir datos personales en este campo. |
| **Geolocalizacion GPS** | Capacidad de Dispositivo | Validar proximidad fisica al campus universitario de la UTT | Alto | Existe la funcion `truncateCoordinatesForPrivacy` (3 decimales, ~110 m); **no esta conectada al formulario**. Lineamiento: sin seguimiento en segundo plano. |
| **Fotografias de Evidencia** | Capacidad de Dispositivo | Respaldo visual del estado de equipos e instalaciones | Alto | Existe la funcion `sanitizeImageEvidence`, que rechaza imagenes SVG (riesgo XSS); **no esta conectada al formulario**. **Limitacion: no elimina los metadatos EXIF** del binario de la imagen. Lineamiento: fotografiar solo equipos tecnicos, sin rostros. |

---

## 3. Politica de Datos Sinteticos (Zero PII)

- **Regla Absoluta:** En repositorios, pruebas y entornos de evaluacion queda prohibida la incorporacion de Datos Personales Identificables (PII) reales de docentes, estudiantes o personal administrativo.
- **Generacion Sintetica:** Todo valor de prueba utiliza nomenclaturas genericas institucionales auditables.
- **Verificacion:** La auditoria automatizada del CI revisa palabras prohibidas relacionadas con credenciales; **no detecta PII**. La ausencia de PII se garantiza por la politica de datos sinteticos y la revision de los Pull Requests.

---

## 4. Ciclo de Vida y Almacenamiento Local (localStorage)

1. **Captura:** El usuario registra la inspeccion localmente mediante la PWA.
2. **Almacenamiento:** Los registros se guardan en `localStorage` del navegador del dispositivo. `localStorage` no cifra su contenido y es accesible para cualquier persona que use ese navegador.
3. **Sincronizacion:** Al sincronizar con el servidor, los registros locales **se conservan**. No existe borrado automatico ni politica de expiracion.
4. **Eliminacion:** Solo es manual, limpiando los datos del sitio desde el navegador.
5. **Riesgo y mejora pendiente:** En un dispositivo compartido, los registros permanecen despues de sincronizar. Purgar los registros tras una sincronizacion confirmada es una mejora futura y **no esta implementada**.

---

## 5. Estado de los Controles de Privacidad

| Control | Funcion (`src/lib/security/privacy-controls.ts`) | Pruebas | Conectado al formulario |
|---|---|---|---|
| Truncado de GPS a 3 decimales | `truncateCoordinatesForPrivacy` | `tests/unit/security-privacy.spec.ts` | No |
| Enmascarado de correos y telefonos | `maskSensitiveData` | `tests/unit/security-privacy.spec.ts` | No |
| Rechazo de imagenes SVG | `sanitizeImageEvidence` | `tests/unit/security-privacy.spec.ts` | No |

- Las funciones se prueban de forma aislada con datos sinteticos. Las pruebas demuestran que cada funcion se comporta como se espera, pero **no demuestran que la app las aplique** a lo que captura el usuario.
- **Limitacion conocida:** `sanitizeImageEvidence` no elimina metadatos EXIF (requeriria un parser de bytes, incompatible con la restriccion de no usar librerias externas). Las fotografias podrian conservar metadatos como geoetiquetas.
- **Siguiente paso:** conectar estas funciones al flujo de captura antes de considerarlas controles activos.