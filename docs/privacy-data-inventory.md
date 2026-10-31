# Inventario de Datos y Cumplimiento de Privacidad (LGPDPPSO)

- **Entidad:** Universidad Tecnologica de Tehuacan (UTT) - Sujeto Obligado.
- **Aplicacion:** PWA de Inspecciones de Mantenimiento de Laboratorios.
- **Marco Normativo:** Ley General de Proteccion de Datos Personales en Posesion de Sujetos Obligados (LGPDPPSO).
- **Ambito de Aplicacion:** Datos de operacion exclusivamente sinteticos en entorno offline-first.

---

## 1. Principios de Proteccion de Datos Aplicados

Conforme al Titulo Segundo de la LGPDPPSO, el diseno de la PWA implementa los siguientes principios rectores:

1. **Principio de Licitud:** El tratamiento de la informacion responde estrictamente al mantenimiento preventivo y correctivo de la infraestructura educativa de la UTT.
2. **Principio de Finalidad:** Los datos recolectados se limitan al registro de condiciones tecnicas de los laboratorios (redes, quimica, computo). No se utilizan para perfiles de conducta ni evaluacion laboral.
3. **Principio de Proporcionalidad y Minimizacion:** Solo se recolectan los campos estrictamente necesarios. Se prohibe almacenar datos personales de contacto, fotografias faciales o rastreo continuo.
4. **Principio de Responsabilidad:** Se implementan medidas tecnicas (sanitizacion, truncado de geolocalizacion, rechazo de imagenes vectoriales) para salvaguardar la confidencialidad.

---

## 2. Inventario de Datos Tratados

| Campo | Categoria | Finalidad Tecnica | Nivel de Riesgo | Medida de Mitigacion / Control |
|---|---|---|---|---|
| `id` | Identificador de Inspeccion | Identificacion unica del registro sintetico | Nulo | Formato controlado alfanumerico (`insp-utt-xxx`). |
| `location` | Datos de Infraestructura | Nombre del laboratorio inspeccionado | Bajo | Catalogo cerrado institucional; sanitizacion de texto. |
| `date` | Temporal | Fecha de ejecucion de la inspeccion | Bajo | Formato estandar ISO YYYY-MM-DD. |
| `inspector` | Seudonimo Operativo | Trazabilidad del rol ejecutor | Bajo | Seudonimizado (`Inspector Sintetico 01`). Prohibido usar nombres o matriculas reales. |
| `status` / `findings` | Diagnostico Operativo | Semaforo del estado del laboratorio | Nulo | Enumeracion estricta (`ok`, `warning`, `danger`) y enteros. |
| `summary` | Observaciones | Descripcion tecnica de fallas o mejoras | Medio | Sanitizacion contra scripting e inyeccion HTML; enmascarado de correos y telefonos. |
| **Geolocalizacion GPS** | Capacidad de Dispositivo | Validar proximidad fisica al campus universitario de la UTT | Alto | **Truncado de precision a 3 decimales** (~110 m). Prohibido el seguimiento en segundo plano. |
| **Fotografias de Evidencia** | Capacidad de Dispositivo | Respaldo visual del estado de equipos e instalaciones | Alto | Rechazo de imagenes SVG (riesgo XSS). Restriccion a equipos tecnicos (sin rostros). Limitacion: no se eliminan metadatos EXIF del binario (ver evidence/week-09/ismael.md). |

---

## 3. Politica de Datos Sinteticos (Zero PII)

- **Regla Absoluta:** En repositorios, pruebas y entornos de evaluacion queda prohibida la incorporacion de Datos Personales Identificables (PII) reales de docentes, estudiantes o personal administrativo.
- **Generacion Sintetica:** Todo valor de prueba utiliza nomenclaturas genericas institucionales auditables.
- **Auditoria Automatizada:** Se ejecuta en CI el script de deteccion para garantizar que ningun dato sensible sea indexado.

---

## 4. Ciclo de Vida y Almacenamiento Local (IndexedDB y Cache)

1. **Captura:** El usuario registra la inspeccion localmente mediante la PWA.
2. **Sanitizacion Inmediata:** Los datos ingresados pasan por el filtro de validacion y sanitizacion antes de escribir en `IndexedDB`.
3. **Retencion Local:** La informacion se conserva en el almacenamiento del navegador del dispositivo exclusivamente hasta que se complete la sincronizacion exitosa.
4. **Purga:** Tras recibir confirmacion del servidor, los registros locales pueden ser depurados para evitar acumulacion innecesaria en el dispositivo de trabajo.