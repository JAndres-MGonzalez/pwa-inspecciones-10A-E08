# Evidencia Semana 9 - Bloque B (Ismael)

- **Responsable:** Jose Ismael Montalvo Lopez, Bloque B.
- **Actividad:** w09-security-privacy
- **Rama:** semana-9-ismael-privacidad

## Decision tecnica

Se adopto el principio de minimizacion de datos de la LGPDPPSO. La funcion de privacidad trunca las coordenadas a 3 decimales (~110 m) para permitir auditar presencia en el campus sin revelar la posicion exacta del inspector. La funcion de imagenes rechaza SVG por riesgo de scripts embebidos (XSS). Otra funcion enmascara correos y telefonos en notas. Estas funciones se prueban por separado y aun no estan conectadas al formulario.

## Pruebas

- Linea base (verde): [ismael-linea-base.txt](ismael-linea-base.txt)
- Rotura controlada (falla el check de truncado GPS): [ismael-negativo-rotura.txt](ismael-negativo-rotura.txt)
- Restaurado (verde): [ismael-restaurado.txt](ismael-restaurado.txt)

Al romper el truncado, el check `privacy-gps-truncates-to-campus-precision` falla, lo que demuestra que la prueba realmente protege el control. Al restaurar, la suite vuelve a verde.

## Limitaciones

- No se eliminan metadatos EXIF del binario de las imagenes: requeriria un parser de bytes, incompatible con la restriccion de no usar librerias externas. Control complementario: no capturar rostros ni PII.
- El enmascarado opera con expresiones regulares sobre texto; no cubre adjuntos binarios ni documentos escaneados.

## Uso de IA y validacion humana

La estructura LGPDPPSO y los casos de prueba se redactaron con apoyo de IA. Se reviso manualmente el cumplimiento, el determinismo de las pruebas y el resultado de la prueba negativa.