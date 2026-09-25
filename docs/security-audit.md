# Auditoría de seguridad — Semana 4

**Integrante:** Montalvo Marcial Kevin Armando (10A-E08)
**Proyecto:** pwa-inspecciones-10A-E08
**Rama:** `week4/security-audit-kevin`
**Fecha:** 24 de septiembre de 2026

Esta auditoría sigue el proceso: **encontrar un problema → explicar por qué representa
un riesgo → corregirlo → demostrar que quedó corregido**. Todos los datos utilizados son
sintéticos y no se publica ninguna credencial real.

## Hallazgos

| # | Hallazgo | Riesgo | Solución aplicada | Evidencia |
|---|---|---|---|---|
| 1 | Los componentes de error mostraban el mensaje del error al usuario y registraban el objeto `Error` completo en consola | Información interna del proyecto (rutas y detalles de fallas) podía quedar visible en pantalla y en los registros de consola | Se muestran mensajes genéricos y se registra solo una etiqueta, sin el objeto `Error` ni su pila | `error-antes.png` y `error-despues.png` |
| 2 | Se documenta en el commit correspondiente | — | — | — |
| 3 | Se documenta en el commit correspondiente | — | — | — |

---

## Hallazgo 1 — Mensajes de error con información interna visibles en pantalla y consola

### Problema encontrado

Los tres componentes de error de la aplicación registraban en consola el objeto `Error`
completo y mostraron su mensaje tal cual:

- `src/app/error.tsx` (error general)
- `src/app/inspecciones/error.tsx` (error del listado)
- `src/app/inspecciones/[id]/error.tsx` (error del detalle)

En los tres casos el código hacía `console.error("<contexto>:", error)`, que imprime el
mensaje **y la pila de llamadas (stack)** con rutas internas del proyecto, y la pantalla
rendía `{error.message}` sin ningún tipo de filtro.

### Riesgo

Los mensajes de error detallados podían quedar visibles para cualquier persona en la
consola del navegador y en la pantalla. Si una falla llegara a contener datos internos
(direcciones de servicios, rutas de archivos o identificadores), esa información serviría
para entender cómo está construido el proyecto y para buscar otros puntos débiles. Además,
mostrar detalles internos a un usuario final no aporta información útil para él.

### Solución

Se quitaron los datos técnicos de la pantalla y de la consola:

- La consola solo registra una etiqueta fija que indica qué sección falló.
- La pantalla muestra un mensaje genérico para que el usuario reintente.
- El botón "Inténtalo de nuevo" se conserva.

### Antes

```tsx
useEffect(() => {
  console.error("Error en el detalle:", error);
}, [error]);

// ...
<p>{error.message}</p>
```

### Después

```tsx
useEffect(() => {
  console.error("No se pudo cargar el detalle");
}, [error]);

// ...
<p>El detalle no está disponible por el momento. Inténtalo de nuevo.</p>
```

### Evidencia

Antes: la consola exponía el objeto `Error` con su pila de ejecución.
![Consola con el objeto Error completo](evidence/error-antes.png)

Después: el error sigue ocurriendo (se simuló a propósito), pero la consola solo muestra
la etiqueta fija y la pantalla un mensaje general, sin detalles internos.
![Consola y pantalla con mensajes genéricos](evidence/error-despues.png)