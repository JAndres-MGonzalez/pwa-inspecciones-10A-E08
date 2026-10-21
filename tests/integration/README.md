# tests/integration — pirámide semana 8

Suites que prueban contratos compartidos entre módulos (cola + conflictos + schema,
registro del Service Worker con el harness). Cada archivo exporta `runChecks()` y su
`suiteId` es `integration/<nombre>`; el runner lo descubre solo mediante
`tests/discover.cjs`.

Regla del bloque: la suite de integración **no reimplementa** lo que ya prueban las
unitarias; combina los módulos en uso. Determinismo obligatorio: transportes falsos,
reloj inyectado, datos sintéticos.
