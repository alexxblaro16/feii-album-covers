// Groove disco sintetizado en el navegador con Web Audio (nada grabado):
// bombo a negras, palmas en 2 y 4, charles a contratiempo, bajo de octavas y
// acordes cortos. Es una base propia de estilo disco de 1979; no reproduce
// ninguna canción del disco (no hay audio con derechos en la ruta).
//
// Programación con "lookahead": un temporizador cada 25 ms deja preparadas en
// el reloj de audio las notas de los próximos 120 ms, así el ritmo no depende
// de lo que tarde cada fotograma.

import { BPM } from './set.js';

const LOOKAHEAD = 0.12; // segundos que se dejan programados
const TICK_MS = 25;
const STEPS = 16; // semicorcheas por compás

// Bajo en La menor, por corcheas (dos compases): fundamental y su octava.
const BASS = [45, 57, 45, 57, 43, 55, 43, 55, 41, 53, 41, 53, 40, 52, 43, 55];
// Acordes (Am7, G, Fmaj7, Em7), uno por medio compás.
const CHORDS = [
  [57, 60, 64, 67],
  [55, 59, 62, 67],
  [53, 57, 60, 64],
  [52, 55, 59, 62],
];

const midi = (n) => 440 * 2 ** ((n - 69) / 12);

/** Crea el groove. Devuelve start/stop y la fase del pulso (0..1 por negra). */
export function createGroove() {
  /** @type {AudioContext | null} */
  let ctx = null;
  let master = null;
  let noise = null;
  let timer = 0;
  let step = 0;
  let nextTime = 0;
  let startTime = 0;
  const sixteenth = 60 / BPM / 4;

  function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.34);
  }

  function hiss(t, length, gain, freq) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + length);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + length + 0.02);
  }

  function bass(t, note) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = midi(note);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(180, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + sixteenth * 1.8);
    o.connect(f).connect(g).connect(master);
    o.start(t);
    o.stop(t + sixteenth * 2);
  }

  function stab(t, notes) {
    notes.forEach((n) => {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = midi(n);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 2200;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.connect(f).connect(g).connect(master);
      o.start(t);
      o.stop(t + 0.18);
    });
  }

  function schedule() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      const s = step % STEPS;
      const bar = Math.floor(step / STEPS) % 2;
      if (s % 4 === 0) kick(nextTime);
      if (s === 4 || s === 12) hiss(nextTime, 0.18, 0.35, 1200); // palmas
      if (s % 4 === 2) hiss(nextTime, s === 14 ? 0.22 : 0.05, 0.18, 7000); // charles
      if (s % 2 === 0) bass(nextTime, BASS[(bar * 8 + s / 2) % BASS.length]);
      if (s === 3 || s === 11) stab(nextTime, CHORDS[bar * 2 + (s === 11 ? 1 : 0)]);
      nextTime += sixteenth;
      step += 1;
    }
  }

  return {
    /** Empieza a sonar. Debe llamarse desde un gesto del usuario (clic). */
    async start() {
      if (ctx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      ctx = new Ctx();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      await ctx.resume();
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      startTime = nextTime;
      timer = window.setInterval(schedule, TICK_MS);
      schedule();
    },
    /** Para y libera el contexto de audio. */
    stop() {
      window.clearInterval(timer);
      timer = 0;
      if (ctx) ctx.close();
      ctx = null;
      master = null;
      noise = null;
    },
    /** Fase dentro de la negra actual (0 justo en el golpe de bombo). */
    beat() {
      if (!ctx) return 0;
      const beats = ((ctx.currentTime - startTime) * BPM) / 60;
      return beats > 0 ? beats % 1 : 0;
    },
  };
}
