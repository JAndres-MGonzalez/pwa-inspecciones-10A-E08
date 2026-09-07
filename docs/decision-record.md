# ADR-001: estrategia PWA para inspecciones de laboratorio

## Estado

6 de septiembre de 2026. **Revisada y ajustada por Kevin Armando Montalvo Marcial y aceptada por el equipo para la entrega de Semana 1.** Se mantiene Next.js y se plantea desarrollar las funciones PWA en las siguientes etapas del curso. El uso de IA está declarado en [la evidencia individual](../evidence/individual.md).

Equipo **10A-E08**. Identificación actualizada el 5 de septiembre de 2026.

## Contexto y restricciones

La persona coordinadora consulta inspecciones en computadora o teléfono (E-01). La persona inspectora necesitará conservar capturas durante interrupciones de red y enviarlas después (E-02). Véanse escenarios y condiciones en [requirements.md](requirements.md).

El alcance publicado del curso delimita el producto. **Dentro del producto:** inspecciones de laboratorio, hallazgos y seguimiento, consulta con conectividad intermitente, evidencia opcional de dispositivo, notificaciones con degradación segura y datos sintéticos versionados. **Fuera del producto:** datos reales de estudiantes o personal, integraciones institucionales reales, secretos o llaves personales, servicios de pago obligatorios y requisitos no publicados. La decisión de esta semana considera ese alcance para elegir una estrategia que permita llegar a una producción académica sin depender de servicios externos.

Se parte de un starter obligatorio, una semana de alcance documental y datos exclusivamente sintéticos. Se asume un equipo con recursos limitados y navegadores disponibles, sin dispositivos institucionales administrados ni presupuesto aprobado para tiendas. No se necesita hardware especializado. Son supuestos que deben contrastarse antes de ampliar el producto.

Actualmente existe una pantalla web ejecutable; la instalación y el offline son etapas futuras.

## Comparación de alternativas

Se compara una PWA con persistencia y sincronización diseñadas; una web tradicional centrada en conexión; apps nativas específicas para Android e iOS; y una app multiplataforma con Flutter como referencia. Las estimaciones de esfuerzo son juicios relativos a este proyecto, no presupuestos medidos.

| Criterio | PWA | Web tradicional | Nativa por plataforma | Multiplataforma |
|---|---|---|---|---|
| Instalación | URL e instalación opcional según sistema/navegador; preparar manifest y probar flujo compatible | Acceso por URL, suficiente para consulta ocasional de E-01 | Paquetes por plataforma, firma y canal de instalación | Paquetes por destino móvil; compartir código no elimina firma e instalación |
| Conexión intermitente | Puede cubrir E-02 con caché, datos persistentes y cola de envío implementados expresamente | La variante solo conectada cubre E-01; no garantiza E-02. Añadir persistencia y recuperación también añade complejidad | Almacenamiento local e integración del sistema; consistencia y reintentos igualmente requieren diseño | Persistencia mediante bibliotecas y servicios del sistema; también requiere protocolo de reintentos |
| Distribución | Enlace y hosting HTTPS facilitan revisión en distintos equipos sin depender de tienda | Mismo acceso por enlace y hosting para trabajo conectado | Tiendas o distribución administrada según plataforma; mayor preparación para el piloto | Publicaciones y paquetes en destinos elegidos; conserva tareas de cada plataforma |
| Desarrollo | Reutiliza Next.js/React; trabajo adicional en caché, persistencia y sincronización | Menor esfuerzo inicial para consulta conectada; no resuelve continuidad por sí sola | Dos implementaciones específicas y sus entornos de prueba elevan esfuerzo del equipo | Comparte interfaz/lógica, pero Flutter implica aprender otra tecnología y rehacer el starter |
| Mantenimiento | Base web común; políticas de actualización, migración de datos y compatibilidad de versiones | Base web común y despliegue central; menor gestión offline en la variante comparada | SDK, paquetes, permisos y versiones por plataforma | Framework, plugins y compilaciones por destino; posibles adaptaciones específicas |
| Dispositivo | APIs web sujetas a permisos y soporte; texto y listado bastan. La evidencia opcional puede usar la cámara mediante las APIs web con permiso del navegador, sin integrar SDK del sistema. No se asume ejecución continua en segundo plano | Las mismas APIs web disponibles; no se excluye hardware por no ser PWA | Integración directa con SDK, útil para periféricos específicos o control fino de la cámara, bajo límites del propio sistema | Plugins y canales hacia código nativo; depende de compatibilidad y mantenimiento |

La instalación varía por navegador y sistema: [MDN, hacer instalable una PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable). La caché de recursos y los límites de ejecución en segundo plano se explican en [MDN, operación offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation). Flutter documenta [canales de plataforma](https://docs.flutter.dev/platform-integration/platform-channels) y [distribución por destino](https://docs.flutter.dev/deployment). Las consecuencias para este equipo son inferencias de diseño a partir de esas capacidades y las restricciones del curso.

## Decisión y justificación

Se propone continuar con **Next.js y evolución a PWA**. Para E-01, un enlace evita preparar un paquete móvil solo para consultar el listado. Para E-02, la persistencia web permite aprovechar el starter y concentrar el aprendizaje en conservación de datos y recuperación. El plazo académico y la ausencia de hardware especializado favorecen compartir la base web.

Se acepta el costo futuro de implementar y probar persistencia, sincronización y compatibilidad. Usar React o instalar un icono no soluciona esos aspectos. Se propone un envío explícito con la aplicación abierta para que el flujo esencial no dependa de sincronización en segundo plano.

Las notificaciones del producto futuro deben ofrecer **degradación segura**: cuando no haya red o la API no esté disponible, la aplicación avisará de la limitación y conservará los datos sin pérdida, en lugar de fallar o simular un envío. Esta exigencia no cambia la estrategia: la degradación segura se diseña en la capa de persistencia y sincronización de la PWA, no depende de la plataforma seleccionada.

Una web tradicional sería suficiente si se descartara E-02 y siempre hubiera red. Una nativa sería preferible con necesidades críticas de hardware no cubiertas de forma fiable por la web y presupuesto para mantenerla. Una multiplataforma sería candidata si la distribución móvil y las integraciones se volvieran prioritarias y el equipo pudiera asumir otro framework. Comparar estas condiciones no cambia el stack de la entrega.

## Consecuencias, riesgos y mitigaciones

| Consecuencia o riesgo | Impacto | Respuesta propuesta |
|---|---|---|
| Base web y distribución por enlace | Facilita consultar y revisar el mismo producto en varios dispositivos | Mantener starter, declarar versiones y ejecutar workflow |
| Eliminación o expulsión de datos locales | Pérdida posible de pendientes de E-02 | Mostrar pendientes y límites; solicitar persistencia donde se admita, manejar cuota y priorizar envío. Sin servidor no se promete respaldo |
| Reintento tras perder una respuesta | Duplicación de inspecciones | ID estable e idempotencia; marcar enviada solo con confirmación; ensayar repeticiones |
| Caché o esquema antiguo | Código y datos incompatibles en clientes | Versionar caché/esquema; probar actualización con pendientes sin descartarlos |
| Diferencias entre navegadores | Instalación y APIs pueden variar | Matriz explícita de dispositivos; conservar consulta por URL y envío con app abierta |
| Ediciones desde dos dispositivos | Sobrescritura de observaciones | Primera etapa de registros nuevos sin edición concurrente; si se añade edición, detectar versiones y resolver conflictos explícitamente |
| Dependencias del starter | Un build correcto puede coexistir con avisos de seguridad | Registrar auditoría real; corregir o justificar antes de publicación y repetir validación; el check del curso no es una auditoría |

## Validación futura

1. **Usuarios:** representar E-01 y E-02 con datos ficticios y registrar si cada rol entiende qué requiere atención y qué está pendiente. Revisar requisitos si confunden el listado con una orden de reparación.
2. **Offline y consistencia:** ejecutar RNF-06: diez capturas, reapertura y tres reintentos por ID; cero pérdidas bajo condiciones declaradas y cero duplicados. Simular cuota agotada y respuesta perdida. Corregir almacenamiento y protocolo si falla.
3. **Compatibilidad:** registrar equipo y versiones, abrir por URL, instalar donde se admita y reabrir sin red tras preparación inicial. Documentar límites por plataforma; pendiente hasta implementar PWA.
4. **Experiencia y rendimiento:** aplicar RNF-02 y RNF-05 en la matriz acordada, con 100 registros y todas las mediciones originales.
5. **Revisión de decisión:** conservar estrategia si cubre escenarios y metas del piloto. Reconsiderar alternativas si una capacidad crítica del dispositivo resulta inviable. Cambiar de plataforma no elimina por sí solo un error de diseño de sincronización.
6. **Evidencia opcional y notificaciones con degradación segura:** cuando exista persistencia y service worker (RNF-06), ensayar la captura de una imagen opcional asociada a una inspección y comprobar que el aviso de "sin conexión" no descarta datos ni simula un envío. Registrar los resultados junto con los ensayos de RNF-06 en el dispositivo y navegador declarados.

No se han ejecutado estos ensayos futuros. La evidencia actual se limita a las comprobaciones de Semana 1 que efectivamente registre la bitácora.
