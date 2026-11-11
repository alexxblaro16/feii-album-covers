// Los pasos de baile. Cada uno es una función del avance k (0..1) que devuelve
// cuánto se aparta cada articulación de la postura de reposo. Así no hay
// fotogramas clave ni ficheros de animación: todo es código.

/** Duración de cada paso, en segundos. */
export const MOVES = {
  spin: 1.5,
  toe: 1.6,
  kick: 1.15,
  glide: 2.6,
};

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
  // Deslizarse hacia atrás alternando los talones, y volver a su sitio.
  glide(k) {
    const w = hold(k, 0, 0.78, 0.08);
    const phase = clamp01(k / 0.78) * 7;
    const sw = Math.sin(phase * Math.PI);
    return {
      back: -ease(k / 0.78) * 0.5 + ease((k - 0.78) / 0.22) * 0.5,
      toeL: w * Math.max(0, sw) * 0.7,
      toeR: w * Math.max(0, -sw) * 0.7,
      lean: w * 0.06,
      headX: w * Math.abs(sw) * 0.06,
      armRZ: -w * 0.18,
      armLZ: w * 0.18,
      elbowR: -w * (0.5 + Math.max(0, -sw) * 0.4),
      elbowL: -w * (0.5 + Math.max(0, sw) * 0.4),
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
  const kk = reduced ? { spin: 0.85, toe: 0.5, kick: 0.37, glide: 0.4 }[move.name] : k;
  const p = POSES[move.name](kk);
  if (reduced) p.turn = 0;
  return { ...ZERO, ...p };
}
