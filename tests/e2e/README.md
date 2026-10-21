# tests/e2e — pirámide semana 8

Camino crítico contra el servidor de producción (`npm run build` + `npm run start`,
HTTP con `fetch`, sin navegador). Cada archivo exporta `runChecks()` y su `suiteId` es
`e2e/<nombre>`; el runner lo descubre solo mediante `tests/discover.cjs`.

Las suites de esta capa esperan el servidor levantado (por defecto
`http://127.0.0.1:3000`, configurable con `E2E_BASE_URL`). Sin servidor, los checks
fallan con un mensaje claro, no con esperas infinitas.
