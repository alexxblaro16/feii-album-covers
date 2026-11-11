# renderer.info — cover

Album: Michael Jackson — Off the Wall (1979).
Scene: pared de ladrillo (1 InstancedMesh de 1.150 ladrillos con bisel + mortero), suelo, Michael (unas 45 mallas con perfiles de torno), plató (2 ventanas de luz, trípode con cámara, reflector, marca en el suelo). Una sola luz con sombra (la principal, mapa de 2048 px, PCF); el plató y la pared no proyectan sombra, solo la reciben. Entorno de reflejos con `Environment` + `Lightformer` (se pinta una vez, sin HDR descargado). DPR [1, 1.5].
Unit cap, any scene: desktop ≤ 200 calls, mobile ≤ 80.
Accepted ceiling for this tree: calls ≤ 90, triangles ≤ 170 000, geometries ≤ 82, textures ≤ 6.

Pins: three@0.185.1, @react-three/fiber@9.8.2, @react-three/drei@10.7.9, react@19.3.1 (this repo's package.json).

Medido con el `BudgetProbe` de la galería (panel en `/covers/off-the-wall?budget`), Microsoft Edge sin ventana, ANGLE D3D11 sobre Intel UHD Graphics (portátil i7-13620H), 1440x900, 2026-11-11. Los triángulos y las llamadas incluyen la pasada del mapa de sombras.

| Run | Machine, date | Shadows | calls | triangles | geometries | textures | Accepted |
| --- | --- | --- | --- | --- | --- | --- | --- |
| task1, primer intento (bisel de 2 segmentos, pared con sombra) | Intel UHD, 2026-11-11 | 1 luz | 77 | 704 566 | 80 | 6 | No: rechazado, ver merge log |
| task1 — vista Portada | Intel UHD, 2026-11-11 | 1 luz | 71 | 166 586 | 63 | 6 | Sí |
| task1 — vista De lado | Intel UHD, 2026-11-11 | 1 luz | 68 | 166 466 | 69 | 6 | Sí |
| task1 — vista Por detrás de Michael | Intel UHD, 2026-11-11 | 1 luz | 75 | 165 136 | 80 | 6 | Sí |
| task1 — vista El plató (la más cara) | Intel UHD, 2026-11-11 | 1 luz | 88 | 167 094 | 80 | 6 | Sí (escritorio) |

`memory.textures` es un recuento, no bytes: el mapa de sombras, el mapa de entorno y los objetivos internos de `Environment`. La ruta no carga ninguna imagen.

Fotogramas: unos 165 por segundo en esa máquina (contados con `requestAnimationFrame` durante 3 s, sin sincronía vertical en el modo sin ventana).

Móvil: sin medir en un teléfono real. En la vista "El plató" se pasa del tope de 80 llamadas (88); en las otras tres vistas queda por debajo. Si hace falta, el siguiente paso es fusionar las piezas estáticas de Michael en menos mallas.
