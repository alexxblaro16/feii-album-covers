// Los gritos de Michael ("¡Ji-ji!", "¡Au!", "¡Uuh!", "¡Hoo!") y los ruidos
// del baile, sintetizados con Web Audio. No hay ninguna grabación: es un
// sintetizador de voz por formantes hecho a mano, que imita su estilo, no su
// voz (sus grabaciones no se pueden volver a publicar, D8).
//
// Cómo se fabrica un grito en falsete:
//  1. Fuente: tren de pulsos de glotis (onda periódica con armónicos que caen
//     como en la voz real), con vibrato y un pequeño temblor aleatorio.
//  2. Aire: ruido de respiración que entra sobre todo al principio y al final.
//  3. Garganta: un rasgado (saturación suave) en el ataque, el "golpe".
//  4. Boca: cuatro filtros resonantes (formantes) que dan la vocal y pueden
//     moverse durante el grito (a → u = "au").
//  5. Sala: una reverberación corta de estudio, generada en el momento.

/** Formantes (Hz) de cada vocal cantada en falsete: F1..F4 y su peso. */
const VOWELS = {
  i: [[330, 1], [2400, 0.5], [3100, 0.32], [3900, 0.18]],
  e: [[480, 1], [2100, 0.45], [2900, 0.28], [3800, 0.15]],
  a: [[880, 1], [1300, 0.6], [2700, 0.3], [3700, 0.16]],
  o: [[560, 1], [950, 0.55], [2600, 0.22], [3600, 0.12]],
  u: [[380, 1], [800, 0.4], [2500, 0.16], [3500, 0.08]],
};

/** Onda de glotis: armónicos con caída de -12 dB por octava, como una voz. */
function glottalWave(ctx) {
  const n = 40;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k += 1) imag[k] = 1 / (k * k ** 0.5);
  return ctx.createPeriodicWave(real, imag);
}

/** Curva de saturación suave para el rasgado de garganta. */
function gritCurve(amount) {
  const c = new Float32Array(1024);
  for (let i = 0; i < c.length; i += 1) {
    const x = (i / (c.length - 1)) * 2 - 1;
    c[i] = Math.tanh(x * amount) / Math.tanh(amount);
  }
  return c;
}

/** Respuesta de una sala pequeña: ruido que se apaga en ~0,6 s. */
function roomImpulse(ctx) {
  const len = Math.floor(ctx.sampleRate * 0.6);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  return buf;
}

export function createVoice() {
  let ctx = null;
  let out = null;
  let wave = null;
  let noiseBuf = null;

  // Se crea con el primer gesto del usuario (los navegadores no dejan sonar antes).
  function ensure() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      wave = glottalWave(ctx);
      // Un segundo de ruido blanco reutilizable para el aire y los chasquidos.
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;

      out = ctx.createGain();
      out.gain.value = 0.5;
      // Compresor: los gritos llegan con fuerza sin saturar el altavoz.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;
      const dry = ctx.createGain();
      dry.gain.value = 0.85;
      const verb = ctx.createConvolver();
      verb.buffer = roomImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.22;
      out.connect(dry).connect(comp);
      out.connect(verb).connect(wet).connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseSource(t0, dur) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
    return src;
  }

  /**
   * Un grito en falsete.
   * @param {{
   *   delay?: number, dur: number,
   *   pitch: [number, number][],   // puntos [segundo, Hz] de la melodía
   *   vowels: [number, string][],  // puntos [segundo, vocal]
   *   vol?: number, grit?: number, breath?: number, vib?: number,
   * }} o
   */
  function yelp({ delay = 0, dur, pitch, vowels, vol = 1, grit = 3, breath = 0.25, vib = 0.03 }) {
    const t0 = ctx.currentTime + delay;
    const end = t0 + dur;

    // 1. Fuente: glotis con la melodía, vibrato y un temblor aleatorio.
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.setValueAtTime(pitch[0][1], t0);
    for (const [s, f] of pitch.slice(1)) osc.frequency.exponentialRampToValueAtTime(f, t0 + s);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5.5, t0);
    lfo.frequency.linearRampToValueAtTime(7, end);
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(0, t0);
    lfoDepth.gain.linearRampToValueAtTime(pitch[0][1] * vib, t0 + dur * 0.6);
    lfo.connect(lfoDepth).connect(osc.frequency);

    // 3. Garganta: el rasgado se nota en el ataque y luego se limpia.
    const drive = ctx.createGain();
    drive.gain.setValueAtTime(grit, t0);
    drive.gain.exponentialRampToValueAtTime(1, t0 + Math.min(0.08, dur * 0.4));
    const shaper = ctx.createWaveShaper();
    shaper.curve = gritCurve(2.2);
    osc.connect(drive).connect(shaper);

    // 2. Aire: ruido que pasa por la misma boca.
    const air = noiseSource(t0, dur);
    const airHp = ctx.createBiquadFilter();
    airHp.type = 'highpass';
    airHp.frequency.value = 900;
    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(breath, t0);
    airGain.gain.linearRampToValueAtTime(breath * 0.35, t0 + dur * 0.4);
    airGain.gain.linearRampToValueAtTime(breath, end);
    air.connect(airHp).connect(airGain);

    // Envolvente: entrada rápida y salida que cae con el tono.
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    env.gain.setValueAtTime(vol, t0 + dur * 0.5);
    env.gain.exponentialRampToValueAtTime(0.0001, end);

    // 4. Boca: formantes en paralelo que siguen la vocal.
    const mix = ctx.createGain();
    for (let i = 0; i < 4; i += 1) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 6 + i * 3;
      const [f0, w] = VOWELS[vowels[0][1]][i];
      bp.frequency.setValueAtTime(f0, t0);
      for (const [s, v] of vowels.slice(1)) bp.frequency.linearRampToValueAtTime(VOWELS[v][i][0], t0 + s);
      const g = ctx.createGain();
      g.gain.value = w * (1 + i * 0.6);
      shaper.connect(bp);
      airGain.connect(bp);
      bp.connect(g).connect(mix);
    }
    mix.connect(env).connect(out);

    osc.start(t0);
    lfo.start(t0);
    osc.stop(end + 0.05);
    lfo.stop(end + 0.05);
  }

  /** Ruido corto filtrado: chasquido de dedos, palmada o suela. */
  function burst({ delay = 0, dur, type, freq, q = 1, vol = 1, sweep }) {
    const t0 = ctx.currentTime + delay;
    const src = noiseSource(t0, dur);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(vol, t0 + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(env).connect(out);
  }

  const sounds = {
    // "¡Ji-ji!": dos golpes muy cortos y agudos, con la i cerrada y aire al final.
    hee() {
      const one = (delay, top) =>
        yelp({
          delay,
          dur: 0.11,
          pitch: [[0, top * 0.78], [0.025, top], [0.11, top * 0.9]],
          vowels: [[0, 'i'], [0.11, 'i']],
          grit: 3.5,
          breath: 0.35,
          vib: 0,
        });
      one(0, 1560);
      one(0.15, 1640);
    },
    // "¡Au!": entra desde abajo de golpe, sube, y cae cerrando la boca (a → o → u).
    ow() {
      yelp({
        dur: 0.38,
        pitch: [[0, 820], [0.04, 1380], [0.12, 1320], [0.38, 760]],
        vowels: [[0, 'a'], [0.14, 'a'], [0.26, 'o'], [0.38, 'u']],
        grit: 4.5,
        breath: 0.22,
        vib: 0.025,
      });
    },
    // "¡Uuh!": sube en glissando y se queda arriba temblando.
    whoo() {
      yelp({
        dur: 0.62,
        pitch: [[0, 560], [0.3, 1380], [0.5, 1420], [0.62, 1250]],
        vowels: [[0, 'u'], [0.3, 'o'], [0.62, 'u']],
        grit: 2.2,
        breath: 0.3,
        vib: 0.04,
      });
    },
    // "¡Hoo!": corto, de pecho a falsete, con mucho aire en la h.
    hoo() {
      yelp({
        dur: 0.24,
        pitch: [[0, 700], [0.05, 1180], [0.24, 1050]],
        vowels: [[0, 'o'], [0.24, 'u']],
        grit: 3,
        breath: 0.6,
        vib: 0,
      });
    },
    // Chasquido de dedos: golpe seco y brillante.
    snap() {
      burst({ dur: 0.045, type: 'bandpass', freq: 2600, q: 1.4, vol: 2.4 });
      burst({ delay: 0.004, dur: 0.02, type: 'highpass', freq: 5000, vol: 1.2 });
    },
    // La suela del mocasín girando sobre el suelo del estudio.
    squeak() {
      burst({ dur: 0.2, type: 'bandpass', freq: 2300, q: 18, vol: 3, sweep: 3900 });
    },
  };

  return {
    /** @param {keyof typeof sounds} name */
    play(name) {
      ensure();
      sounds[name]();
    },
    dispose() {
      if (ctx) ctx.close();
      ctx = null;
    },
  };
}
