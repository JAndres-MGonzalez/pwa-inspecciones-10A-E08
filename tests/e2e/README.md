# tests/e2e — pirámide semana 8

Camino crítico contra el servidor de producción (`npm run build` + `npm run start`,
HTTP con `fetch`, sin navegador). Cada archivo exporta `runChecks()` y su `suiteId` es
`e2e/<nombre>`; el runner lo descubre solo mediante `tests/discover.cjs`.

Después de `npm run build`, `npm test` levanta un servidor de producción local en un
puerto libre y lo detiene al terminar. No necesita una segunda terminal. El auxiliar
usa Next en producción, con la misma compilación y manejador de rutas de `next start`.

Para usar un servidor ya iniciado con `npm run start`, define
`E2E_BASE_URL=http://127.0.0.1:3000`. En ese caso la suite no lo detiene porque no lo creó.
Solo se permiten direcciones HTTP locales. El arranque tiene un límite de 30 segundos
y cada petición de 5 segundos; un fallo devuelve código distinto de cero, nunca se omite.

`camino-critico.spec.ts` comprueba ocho respuestas HTTP reales. No ejecuta JavaScript del
navegador ni el flujo crear → guardar offline → recargar → sincronizar. Ese flujo y su
variante con capacidad ausente siguen pendientes; el reporte de cierre no los da por aprobados.
