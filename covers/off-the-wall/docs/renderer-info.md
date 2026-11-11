# renderer.info — cover

Album: Michael Jackson — Off the Wall (1979).
Scene: pared de ladrillo de 4,2 m (1 InstancedMesh de unos 1.340 ladrillos con bisel + mortero), suelo, Michael (unas 55 mallas con perfiles de torno; los dedos no proyectan sombra), plató (2 ventanas de luz, trípode con cámara, reflector, marca en el suelo). Una sola luz con sombra (la principal, mapa de 2048 px, PCF); el plató y la pared no proyectan sombra, solo la reciben. Entorno de reflejos con `Environment` + `Lightformer` (se pinta una vez, sin HDR descargado). DPR [1, 1.5].
Unit cap, any scene: desktop ≤ 200 calls, mobile ≤ 80.
Accepted ceiling for this tree: calls ≤ 98, triangles ≤ 193 000, geometries ≤ 90, textures ≤ 8 (antes 6; la séptima es el monitor en directo y la octava el espejo).

Pins: three@0.185.1, @react-three/fiber@9.8.2, @react-three/drei@10.7.9, react@19.3.1 (this repo's package.json).

Medido con el `BudgetProbe` de la galería (panel en `/covers/off-the-wall?budget`), Microsoft Edge sin ventana, ANGLE D3D11 sobre Intel UHD Graphics (portátil i7-13620H), 1440x900, 2026-11-11. Los triángulos y las llamadas incluyen la pasada del mapa de sombras.

| Run | Machine, date | Shadows | calls | triangles | geometries | textures | Accepted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| task1, primer intento (bisel de 2 segmentos, pared con sombra) | Intel UHD, 2026-11-11 | 1 luz | 77 | 704 566 | 80 | 6 | No: rechazado, ver merge log |
| task1, versión anterior — vista El plató (pared de 3,6 m, manos sin dedos) | Intel UHD, 2026-11-11 | 1 luz | 88 | 167 094 | 80 | 6 | Superada |
| task1 — vista Portada | Intel UHD, 2026-11-11 | 1 luz | 79 | 191 066 | 71 | 6 | Sí |
| task1 — vista De lado | Intel UHD, 2026-11-11 | 1 luz | 76 | 190 946 | 77 | 6 | Sí |
| task1 — vista Por detrás de Michael | Intel UHD, 2026-11-11 | 1 luz | 79 | 189 040 | 87 | 6 | Sí |
| task1 — vista El plató (la más cara) | Intel UHD, 2026-11-11 | 1 luz | 96 | 191 574 | 88 | 6 | Sí (escritorio) |

`memory.textures` es un recuento, no bytes: el mapa de sombras, el mapa de entorno y los objetivos internos de `Environment`. La ruta no carga ninguna imagen.

Fotogramas: unos 60 por segundo en esa máquina (contados con `requestAnimationFrame` durante 3 s). El grano de película del DOM va sin `mix-blend-mode`: con él bajaba a unos 57.

task2 (shader de los ladrillos): mismas lecturas en las cuatro vistas (79 / 76 / 79 / 96 calls, unos 191 000 triángulos, 6 texturas); el shader no añade llamadas ni texturas.

Cabeza nueva (afro que enmarca la cara, ojos, cejas, patillas, nariz y sonrisa) con las piezas de la cara fundidas en una malla por material (`mergeGeometries`): la cabeza pasa de unas 25 llamadas a 7. Medido en Intel UHD el 2026-11-11: Portada 70 calls / 189 090 tri / 63 geometrías; De lado 67 / 188 970 / 69; Por detrás 72 / 187 808 / 80; El plató 87 / 189 598 / 80; 6 texturas y unos 60 fps. Las cuatro vistas quedan por debajo del techo aceptado.

Plató horneado (todas sus piezas fundidas por material, `Studio.jsx`) y ventana en la pared. Medido en Intel UHD el 2026-11-11: Portada 71 calls / 189 592 tri / 64 geometrías; De lado 70 / 189 552 / 66; Por detrás 62 / 187 922 / 66; El plató 73 / 189 684 / 66; 6 texturas y unos 60 fps.

Móvil: sin medir en un teléfono real, pero las cuatro vistas quedan ya por debajo del tope de 80 llamadas (62–73). El lienzo usa `preserveDrawingBuffer` para poder guardar la foto de la portada; no cambia las llamadas.

Monitor en directo del plató (`LiveMonitor.jsx`) y moonwalk nuevo. Medido en Intel UHD el 2026-11-11 con el panel ?budget: Portada 74 calls / 189 646 tri / 67 geometrías; De lado 70 / 189 552 / 69; Por detrás 66 / 188 056 / 71; El plató 76 / 189 738 / 71; 7 texturas; unos 60 fps. El monitor hace una segunda pasada de render a una textura de 512 px que `renderer.info` no recoge (se reinicia en cada render), así que se midió aparte contando las llamadas de WebGL de cada fotograma con todas las pasadas (sombra, monitor y escena): como mucho 95 en escritorio y 95 en móvil simulado (390x844), por debajo del tope de 200 de escritorio. La pasada del monitor solo se hace si se ve y está de cara, cada 2 fotogramas en escritorio y una sola vez en pantallas pequeñas o táctiles.


Esmoquin abierto (fajín y botones de camisa) y monitor a 512 px, medido en Intel UHD el 2026-11-11: Portada 77 calls / 189 998 tri / 70 geometrías; De lado 73 / 189 904 / 72; Por detrás 70 / 188 548 / 74; El plató 80 / 190 230 / 74; 7 texturas. Todas dentro del techo y en el tope de móvil (El plató, justo en 80).

Espejo detrás de las cámaras (Reflector, 512 px), medido en Intel UHD el 2026-11-11: Portada 77 calls; De lado 73; Por detrás 69; El plató 79; 8 texturas. Contando todas las pasadas de WebGL por fotograma (sombra, monitor, espejo y escena): como mucho 98 en escritorio y 102 en móvil simulado.
