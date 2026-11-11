// Los pasos de baile. Cada uno es una función del avance k (0..1) que devuelve
// cuánto se aparta cada articulación de la postura de reposo. Así no hay
// fotogramas clave ni ficheros de animación: todo es código.

/** Duración de cada paso, en segundos. */
export const MOVES = {
  spin: 1.5,
  toe: 1.6,
  kick: 1.15,
  glide: 3.9,
};

/** Medidas del moonwalk: pasos, duración de cada uno (s), avance (m), ángulo de pierna y talón. */
export const GLIDE = { steps: 5, step: 0.46, stride: 0.17, angle: 0.11, toe: 0.7, pause: 0.45 };

const clamp01 = (x) => Math.max(0, Math.min(1, x));
/** Suavizado de entrada y salida. */
const ease = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** Campana entre a y b: 0 fuera, 1 en el centro. */
const bell = (k, a, b) => (k <= a || k >= b ? 0 : Math.sin(((k - a) / (b - a)) * Math.PI));
/** Sube en [a, a+in], se mantiene y baja en [b-out, b]. */
const hold = (k, a, b, fade = 0.1) => ease((k - a) / fade) * (1 - ease((k - (b - fade)) / fade));

/** Postura neutra: nada se aparta del reposo. */
const ZERO = {
  lift: 0, turn: 0, back: 0, lean: 0, tilt: 0,
  headY: 0, headX: 0,
  armRZ: 0, armRX: 0, elbowR: 0, armLZ: 0, armLX: 0, elbowL: 0,
  toeL: 0, toeR: 0, legR: 0, legL: 0,
};

const POSES = {
  // La vuelta: se agacha un poco, gira dos veces sobre un pie con los brazos
  // recogidos y acaba de puntillas con el brazo arriba.
  spin(k) {
    const crouch = bell(k, 0, 0.2);
    const turning = hold(k, 0.12, 0.72, 0.08);
    const finish = hold(k, 0.7, 1, 0.08);
    return {
      lift: -crouch * 0.035 + turning * 0.03 + finish * 0.09,
      turn: ease((k - 0.14) / 0.56) * Math.PI * 4,
      headX: -finish * 0.16,
      headY: finish * 0.35,
      armRZ: -turning * 0.3 - finish * 2.3,
      armRX: -finish * 0.15,
      elbowR: -turning * 1.3,
      armLZ: turning * 0.3 + finish * 0.3,
      elbowL: -turning * 1.3 - finish * 0.5,
      toeL: turning * 0.45 + finish * 0.6,
      toeR: turning * 0.2 + finish * 0.6,
      legR: -turning * 0.25,
    };
  },
  // De puntillas con el brazo arriba (el paso que ya tenía).
  toe(k) {
    const s = Math.sin(k * Math.PI);
    return {
      lift: s * 0.085,
      tilt: s * 0.06,
      headY: s * 0.45,
      headX: -s * 0.12,
      armRZ: -s * 2.35,
      armRX: -s * 0.2,
      elbowR: s * 0.1,
      armLZ: s * 0.25,
      elbowL: -s * 0.6,
      toeL: s * 0.55,
      toeR: s * 0.55,
    };
  },
  // Patada al frente, seca, con los brazos abiertos para equilibrar.
  kick(k) {
    const up = bell(k, 0.12, 0.62);
    const snap = Math.pow(up, 0.6);
    const arms = hold(k, 0.08, 0.8, 0.1);
    return {
      legR: -snap * 1.25,
      lean: -up * 0.14,
      lift: up * 0.02,
      toeL: up * 0.35,
      headX: up * 0.12,
      armRZ: -arms * 0.95,
      armLZ: arms * 0.95,
      elbowR: -arms * 0.3,
      elbowL: -arms * 0.3,
    };
  },
  // Moonwalk: en cada paso un pie va plano y se arrastra hacia atrás mientras
  // el otro se queda clavado en el suelo con el talón levantado; luego se
  // cambian. El cuerpo retrocede a velocidad constante. Después, pausa de
  // puntillas y vuelta a su sitio andando.
  glide(k) {
    const t = k * MOVES.glide;
    const end = GLIDE.steps * GLIDE.step;
    const far = GLIDE.steps * GLIDE.stride;
    // Brazos de moonwalk: codos doblados, manos a la altura de la cadera.
    const arms = hold(t, 0, end + GLIDE.pause, 0.2);
    const base = {
      lean: arms * 0.07,
      armRZ: -arms * 0.16,
      armLZ: arms * 0.16,
      elbowR: -arms * 0.95,
      elbowL: -arms * 0.95,
    };
    if (t < end) {
      const s = Math.floor(t / GLIDE.step);
      const f = (t - s * GLIDE.step) / GLIDE.step;
      const right = s % 2 === 0;
      // El pie que se arrastra (plano) va de delante a atrás; el clavado, al
      // revés respecto al cuerpo, porque el cuerpo se va hacia atrás.
      const slide = -GLIDE.angle + 2 * GLIDE.angle * f;
      const plant = -slide;
      // El cambio de pie es rápido: el talón sube y baja en el primer 15 %.
      const up = clamp01(f / 0.15);
      return {
        ...base,
        back: -(s + f) * GLIDE.stride,
        legR: right ? slide : plant,
        legL: right ? plant : slide,
        toeR: right ? GLIDE.toe * (1 - up) : GLIDE.toe * up,
        toeL: right ? GLIDE.toe * up : GLIDE.toe * (1 - up),
        tilt: (right ? 1 : -1) * 0.035,
        headX: Math.sin(f * Math.PI) * 0.06,
      };
    }
    if (t < end + GLIDE.pause) {
      // Remate: los pies se juntan y se pone de puntillas un momento.
      const u = (t - end) / GLIDE.pause;
      const toes = Math.sin(u * Math.PI);
      const settle = 1 - ease(u * 3);
      return {
        ...base,
        back: -far,
        legR: GLIDE.angle * settle,
        legL: -GLIDE.angle * settle,
        toeR: toes * 0.65,
        toeL: toes * 0.65,
        lift: toes * 0.07,
        headY: toes * 0.35,
        headX: -toes * 0.1,
      };
    }
    // Vuelta a su sitio andando, con pasos normales.
    const u = clamp01((t - end - GLIDE.pause) / (MOVES.glide - end - GLIDE.pause));
    const sw = Math.sin(u * Math.PI * 4) * bell(u, 0, 1);
    return {
      back: -far * (1 - ease(u)),
      legR: -sw * 0.22,
      legL: sw * 0.22,
      toeR: Math.max(0, sw) * 0.25,
      toeL: Math.max(0, -sw) * 0.25,
      armRZ: -0.05,
      armLZ: 0.05,
      armRX: sw * 0.18,
      armLX: -sw * 0.18,
    };
  },
};

/** Postura del paso en curso (o la neutra si no hay ninguno). */
export function movePose(move, reduced) {
  if (!move) return ZERO;
  const dur = MOVES[move.name];
  const k = (performance.now() / 1000 - move.at) / dur;
  if (k < 0 || k > 1) return ZERO;
  // Sin animación: se enseña el momento más vistoso del paso, quieto.
  const kk = reduced ? { spin: 0.85, toe: 0.5, kick: 0.37, glide: 0.3 }[move.name] : k;
  const p = POSES[move.name](kk);
  if (reduced) p.turn = 0;
  return { ...ZERO, ...p };
}
