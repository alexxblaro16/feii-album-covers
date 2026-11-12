// Todo el plató se puede tocar. Cada objeto tiene una caja invisible que
// recoge el ratón o el dedo: al pasar por encima sale su nombre junto al
// cursor y al pulsarlo la cámara vuela a verlo de cerca y se cuenta qué es.
// Las cajas no se pintan (visible=false): no cuestan llamadas de dibujo, solo
// sirven para el rayo del puntero.

import { goTo } from './cameraEvents.js';

/**
 * Objetos del plató: centro y tamaño de la caja, nombre, lo que se cuenta y
 * desde dónde mirarlo (posición de la cámara y punto al que mira).
 */
const SPOTS = [
  {
    name: 'Cámara del trípode',
    en: ['Tripod camera', 'The medium-format camera from the shoot: the cover was taken from here. Press “Full photo” and shoot.'],
    text: 'La cámara de medio formato de la sesión: desde aquí se hizo la portada. Pulsa «Foto entera» y dispara.',
    box: [0.9, 1.07, 3.9, 0.3, 0.3, 0.35],
    view: [[-0.3, 1.4, 5.6], [0.9, 1.07, 3.9]],
  },
  {
    name: 'Ventana de luz',
    en: ['Softbox', 'Softbox: a box with diffusion fabric that gives a big, soft light. It flashes when you take the photo.'],
    text: 'Ventana de luz: una caja con tela difusora que da una luz grande y suave. Destella al hacer la foto.',
    box: [-2.1, 1.75, 2.7, 0.6, 0.6, 0.5],
    view: [[-0.7, 1.55, 1.3], [-2.1, 1.7, 2.7]],
  },
  {
    name: 'Ventana de luz',
    en: ['Softbox', 'The other softbox, on the opposite side: it fills the shadows on Michael’s face.'],
    text: 'La otra ventana de luz, al otro lado: rellena las sombras de la cara de Michael.',
    box: [2.3, 1.75, 2.2, 0.6, 0.6, 0.5],
    view: [[0.9, 1.55, 0.9], [2.3, 1.7, 2.2]],
  },
  {
    name: 'Paraguas de luz',
    en: ['Light umbrella', 'White umbrella: the flash bounces off it and the light lands softer.'],
    text: 'Paraguas blanco: el flash rebota en él y la luz llega más suave.',
    box: [2.9, 1.85, 3.3, 1.1, 0.6, 1.1],
    view: [[1.2, 1.7, 5.0], [2.9, 1.8, 3.3]],
  },
  {
    name: 'Reflector',
    en: ['Reflector', 'Silver reflector: it bounces light back onto the face from below so there are no dark circles.'],
    text: 'Reflector plateado: devuelve luz a la cara desde abajo para que no queden ojeras.',
    box: [-1.7, 0.42, 2.0, 0.9, 0.9, 0.3],
    view: [[-0.4, 1.2, 3.4], [-1.7, 0.42, 2.0]],
  },
  {
    name: 'Bandera negra',
    en: ['Black flag', 'Black flag: it blocks the light that leaks towards the lens.'],
    text: 'Bandera negra: corta la luz que se escapa hacia el objetivo.',
    box: [-3.3, 1.42, 2.8, 0.6, 0.7, 0.4],
    view: [[-1.6, 1.5, 4.2], [-3.3, 1.4, 2.8]],
  },
  {
    name: 'Burro de vestuario',
    en: ['Wardrobe rack', 'The wardrobe rack: spare tuxedos and white shirts, in case of a change between shots.'],
    text: 'El burro de vestuario: esmóquines de recambio y camisas blancas, por si hay que cambiarse entre fotos.',
    box: [-2.75, 1.0, 6.1, 0.6, 2.0, 1.45],
    view: [[-0.6, 1.5, 6.6], [-2.75, 1.1, 6.1]],
  },
  {
    name: 'Silla de director',
    en: ["Director's chair", "The shoot's director's chair, facing Michael."],
    text: 'La silla de director de la sesión, mirando a Michael.',
    box: [-1.55, 0.5, 6.3, 0.6, 1.0, 0.5],
    view: [[-0.5, 1.3, 7.6], [-1.55, 0.6, 6.3]],
  },
  {
    name: 'Baúles de material',
    en: ['Equipment cases', 'Cases with the gear: cables, light stands and spares.'],
    text: 'Baúles con el material: cables, pies de luz y repuestos.',
    box: [2.0, 0.42, 7.7, 0.8, 0.85, 0.6],
    view: [[0.7, 1.3, 8.8], [2.0, 0.5, 7.7]],
  },
  {
    name: 'Baúl de material',
    en: ['Equipment case', 'Another equipment case, by the exit.'],
    text: 'Otro baúl de material, junto a la salida.',
    box: [-2.7, 0.25, 8.3, 0.9, 0.5, 0.65],
    view: [[-1.3, 1.3, 9.4], [-2.7, 0.4, 8.3]],
  },
  {
    name: 'Salida del estudio',
    en: ['Studio exit', 'The studio exit. The red light is on: shoot in progress, do not enter.'],
    text: 'La salida del estudio. El piloto rojo encendido avisa de que hay sesión: no se entra.',
    box: [-2.6, 1.2, 10.4, 1.2, 2.5, 0.2],
    view: [[-2.0, 1.6, 7.6], [-2.6, 1.4, 10.4]],
  },
  {
    name: 'Los Jackson 5',
    en: ['The Jackson 5', 'Before going solo, Michael sang as a kid with his brothers in the Jackson 5. In 1976 they became The Jacksons: that year’s album hangs here in gold.'],
    text: 'Antes de ir en solitario, Michael cantó de niño con sus hermanos en los Jackson 5. En 1976 pasaron a llamarse The Jacksons: su disco de ese año cuelga aquí en oro.',
    box: [4.25, 1.75, 4.6, 0.1, 1.1, 1.5],
    view: [[0.95, 1.6, 4.75], [3.9, 1.45, 4.68]],
  },
  {
    name: 'La ventana',
    en: ['The window', 'The window from the cover: a blue sky fading down to green.'],
    text: 'La ventana de la portada: un cielo azul que baja hasta el verde.',
    box: [1.585, 2.22, -0.85, 1.1, 2.15, 0.1],
    view: [[0.6, 1.8, 3.0], [1.6, 2.0, -0.9]],
  },
  {
    name: 'El título en tiza',
    en: ['The chalk title', 'The name and title, handwritten in chalk on the wall, as on the cover.'],
    text: 'El nombre y el título, escritos a mano con tiza en la pared, como en la portada.',
    box: [-0.675, 1.5, -0.86, 0.85, 1.2, 0.08],
    view: [[-0.4, 1.5, 2.6], [-0.7, 1.5, -0.9]],
  },
  {
    name: 'El monitor',
    en: ['The monitor', 'The set monitor, next to the camera.'],
    text: 'El monitor del plató, junto a la cámara.',
    box: [-0.95, 1.32, 4.25, 0.7, 0.7, 0.2],
    view: [[-1.85, 1.42, 5.3], [-0.95, 1.3, 4.25]],
  },
];

/**
 * @param {{
 *   onHover: (on: boolean, name?: string) => void,
 *   onInspect: (text: string, id: string) => void,
 *   lang: string,
 * }} props
 */
export default function Hotspots({ onHover, onInspect, lang }) {
  return (
    <group>
      {SPOTS.map((s) => {
        const [x, y, z, w, h, d] = s.box;
        return (
          <mesh
            key={`${s.name}-${x}`}
            position={[x, y, z]}
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              // Un arrastre para girar la cámara no cuenta como pulsar.
              if (e.delta > 6) return;
              goTo(s.view[0], s.view[1]);
              const [name, text] = lang === 'en' ? s.en : [s.name, s.text];
              onInspect(text, s.name === 'Los Jackson 5' ? 'j5' : name);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(true, lang === 'en' ? s.en[0] : s.name);
            }}
            onPointerOut={() => onHover(false)}
          >
            <boxGeometry args={[w, h, d]} />
          </mesh>
        );
      })}
    </group>
  );
}
