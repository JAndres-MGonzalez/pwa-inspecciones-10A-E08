# Modelo de amenazas — Semana 9

Fecha: 29 de octubre de 2026. Actividad: `w09-security-privacy`.

## Alcance y supuestos

Caso académico de inspecciones de mantenimiento para la Universidad Tecnológica de
Tehuacán. Los registros de operación son sintéticos. No existe un despliegue
institucional, autenticación ni un servidor central de la universidad. Este análisis
no certifica cumplimiento legal ni autoriza tratar datos personales reales.

Se usa STRIDE para revisar suplantación, modificación, repudio, divulgación,
denegación de servicio y elevación de privilegios, conforme a la
[descripción de Microsoft](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats).

## Activos, flujo y fronteras de confianza

- **Activos:** contenido de inspecciones, cola de envío, clave de operación,
  adjuntos temporales, permisos del dispositivo y código del SW.
- **Entrada:** el formulario y las capacidades opcionales reciben datos no confiables.
  La validación se repite en la API; modificar el navegador no evita esa comprobación.
- **Navegador:** `LocalInspectionStore` guarda registros y cola en localStorage.
  CacheStorage guarda páginas y recursos mediante el service worker. No se usa IndexedDB.
- **Dispositivo:** cámara y ubicación se solicitan desde una acción del usuario.
  Los adjuntos permanecen en memoria y no forman parte del envío de inspecciones.
- **Red y servidor:** `SyncQueue` envía a `/api/inspecciones`. La API usa mapas en
  memoria y claves de operación para reconocer reintentos; se reinicia con el proceso.
- **Repositorio y CI:** el código y la evidencia académica están en un repositorio
  público. La identificación de integrantes no debe copiarse a los registros de operación.

```text
Formulario --> validación --> localStorage: registros y cola
                                  |
                           SyncQueue, al enviar
                                  |
                           /api/inspecciones
                                  |
                      validación y mapas en memoria

Service worker --> CacheStorage: páginas y recursos visitados
Cámara / ubicación --> adjuntos opcionales en memoria
```

Se utiliza HTTP de loopback para desarrollo y pruebas. Un despliegue real requiere
HTTPS configurado en el alojamiento; CSP no cifra el transporte. No se afirma que
esa configuración esté desplegada o probada.

## Matriz STRIDE

| Categoría | Amenaza y activo | Control verificable actual | Riesgo restante |
|---|---|---|---|
| S — Suplantación | Enviar una inspección con otro alias o ID | El formulario y la API validan estructura, alias sintético y clave de operación | Un alias o ID no autentica a una persona. La API no tiene control de usuarios |
| T — Modificación | Alterar la cola local o reutilizar una operación con otro contenido | Validación de API; una operación repetida con otro contenido recibe 409 | localStorage es modificable. No hay firma de registros ni autorización por propietario |
| R — Repudio | Negar haber creado o cambiado una inspección | ID, versión y fecha permiten relacionar operaciones de demostración | No hay bitácora inmutable ni identidad autenticada; las fechas del cliente no acreditan autoría |
| I — Divulgación | Leer el navegador compartido, exponer una nota o adjunto | Datos sintéticos, API `no-store`, permisos bajo demanda y ausencia de adjuntos en el envío | No hay cifrado local, autenticación ni borrado automático. El módulo de imágenes no elimina EXIF |
| D — Denegación de servicio | Agotar localStorage o la memoria de la API | Resumen de 3 a 500 caracteres y hallazgos de 0 a 999 en la captura; errores de cuota visibles | Los mapas del servidor no tienen límite global ni control de frecuencia; no es un backend de producción |
| E — Elevación de privilegios | Ejecutar contenido o incrustar la app en un marco ajeno | Texto renderizado por React, CSP, `X-Frame-Options: DENY`, `object-src` y `frame-ancestors` en `none` | Se permite código inline por compatibilidad con Next.js. No existe separación de roles |

La validación activa es `src/lib/inspection-validation.ts`, utilizada por formulario y
API. El módulo de Kevin `input-validation.ts` tiene su propia suite, pero todavía no
está conectado a esos puntos de entrada: usa otro conjunto de estados. No se afirma
que su sanitización esté aplicada a todas las capturas.

## Cabeceras, mínimo privilegio y rastreo

`headers-csp.ts` define el contrato y `next.config.mjs` aplica las cabeceras en todas
las rutas. Se comprueba su igualdad y la respuesta HTTP, evitando que el contrato
declare una protección que el servidor no envía.

- Producción: recursos y conexiones del mismo origen; imágenes `data:` y `blob:`
  para las vistas previas; SW del mismo origen; objetos y marcos externos bloqueados.
- Desarrollo: evaluación de código y WebSocket para las herramientas de Next.js.
  Esas excepciones no aparecen en la política de producción.
- Cámara y ubicación solo del mismo origen, micrófono bloqueado. CSP no concede
  permisos del dispositivo: el navegador conserva esa decisión.
- Scripts y estilos inline siguen permitidos para la hidratación de Next.js. Esto
  limita la mitigación de XSS; una política con nonce por respuesta queda pendiente.
  La [documentación de Next.js 14](https://nextjs.org/docs/14/app/building-your-application/configuring/content-security-policy)
  explica la alternativa con nonce y su configuración.

`robots.txt` pide no rastrear `/inspecciones`, `/captura`, `/api/` y `/evidence/`.
La regla sin barra final también cubre el listado `/inspecciones`. Es una indicación
para rastreadores cooperativos; no impide visitas, no garantiza desindexación y no
protege los archivos de GitHub. Véase la
[documentación de Google](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

## Privacidad y límites del incremento

La [LGPDPPSO publicada por la Cámara de Diputados](https://www.diputados.gob.mx/LeyesBiblio/pdf/LGPDPPSO.pdf),
texto consultado con reforma del 14 de noviembre de 2025, establece principios de
finalidad, proporcionalidad, información y responsabilidad en su artículo 10.
Se toman como referencia para reducir datos y documentar el propósito del ejercicio.
Una aplicación institucional necesitaría revisión jurídica y organizativa, aviso de
privacidad, medidas de seguridad y atención de derechos; este prototipo no los acredita.

El módulo `privacy-controls.ts` se comprueba de forma aislada: trunca coordenadas,
enmascara algunos patrones de contacto y rechaza SVG. No está conectado al guardado
del formulario. Truncar no anonimiza una ubicación y el filtro de imágenes no elimina
metadatos ni valida completamente los bytes.

El [inventario del Bloque B](privacy-data-inventory.md), corregido en el
[PR #28](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/28), describe
localStorage, registros conservados tras el envío y controles nuevos todavía aislados.
El documento y este modelo mantienen esos límites sin atribuir controles al formulario
que aún no utiliza.

La [auditoría de dependencias](../evidence/week-09/andres-auditoria.txt) informó dos
avisos altos y uno crítico en la base instalada. No se considera apta para publicar
un servicio real con esa auditoría pendiente. Una actualización mayor del framework
requiere su propia comprobación de compatibilidad; las cabeceras no corrigen esos avisos.

## Pruebas y trazabilidad

| Riesgo | Comprobación reproducible |
|---|---|
| CSP solo declarada o permisos demasiado amplios | `tests/security-headers.spec.ts`: contrato, configuración y HTTP real |
| Relajar producción para arreglar desarrollo | Comparación de ambas configuraciones y rechazo de evaluación en producción |
| Romper actualización del SW o cachear la API | Revalidación de `/sw.js` y `no-store` de la API |
| Perder datos o duplicar tras reconectar | E2E existente: guardar offline, recargar, perder respuesta y reintentar |
| Entradas o utilidades de privacidad incorrectas | `tests/security.spec.ts` y `tests/unit/security-privacy.spec.ts` |
| Una prueba que nunca falla | Rotura temporal de `X-Frame-Options`, fallo observado y restauración |

Instalación, build, pruebas y reportes se describen en el README. Las salidas reales
y los límites de la comprobación pública están en
[la evidencia de Juan Andrés](../evidence/week-09/juan-andres.md).
