// Los gritos de Michael ("¡Ji-ji!", "¡Au!", "¡Uuh!") y los ruidos del baile,
// sintetizados con Web Audio. No hay ninguna grabación: cada grito es una onda
// en falsete (diente de sierra con vibrato) pasada por tres filtros que imitan
// las resonancias de una vocal (formantes). Suena a "dibujo animado", a
// propósito: es un guiño a su estilo, no su voz.

/** Formantes aproximados (Hz) de cada vocal: F1, F2, F3. */
const VOWELS = {
  i: [300, 2300, 3000],
  u: [320, 900, 2300],
  a: [750, 1150, 2500],
};

export function createVoice() {
  let ctx = null;
  let out = null;

  // Se crea con el primer gesto del usuario (los navegadores no dejan sonar antes).
  function ensure() {
    if (!ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      out = ctx.createGain();
      out.gain.value = 0.32;
      out.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /**
   * Un grito en falsete.
   * @param {{ delay?: number, dur: number, pitch: [number, number][], from: string, to?: string, vol?: number }} o
   *   pitch: puntos [segundo, Hz] de la melodía del grito.
   */
  function yelp({ delay = 0, dur, pitch, from, to = from, vol = 1 }) {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(pitch[0][1], t0);
    for (const [s, f] of pitch.slice(1)) osc.frequency.exponentialRampToValueAtTime(f, t0 + s);

    // Vibrato: el falsete nunca está quieto.
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 6.5;
    depth.gain.value = pitch[0][1] * 0.025;
    lfo.connect(depth).connect(osc.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(vol, t0 + 0.018);
    env.gain.setValueAtTime(vol, t0 + dur * 0.55);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    // Tres formantes en paralelo; la vocal puede cambiar durante el grito (a → u = "au").
    VOWELS[from].forEach((f, i) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 9;
      bp.frequency.setValueAtTime(f, t0);
      bp.frequency.linearRampToValueAtTime(VOWELS[to][i], t0 + dur * 0.8);
      const g = ctx.createGain();
      g.gain.value = [1, 0.55, 0.25][i];
      osc.connect(bp).connect(g).connect(env);
    });
    env.connect(out);

    osc.start(t0);
    lfo.start(t0);
    osc.stop(t0 + dur + 0.05);
    lfo.stop(t0 + dur + 0.05);
  }

  /** Ruido corto filtrado: chasquido de dedos o chirrido de la suela. */
  function noise({ delay = 0, dur, type, freq, q = 1, vol = 1, sweep }) {
    const t0 = ctx.currentTime + delay;
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(vol, t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(env).connect(out);
    src.start(t0);
  }

  const sounds = {
    // "¡Ji-ji!": dos golpes cortos y agudos con la i.
    hee() {
      yelp({ dur: 0.15, pitch: [[0, 1050], [0.05, 1420], [0.15, 1300]], from: 'i' });
      yelp({ delay: 0.2, dur: 0.17, pitch: [[0, 1100], [0.05, 1480], [0.17, 1320]], from: 'i' });
    },
    // "¡Au!": arranca arriba y cae, de la a a la u.
    ow() {
      yelp({ dur: 0.42, pitch: [[0, 980], [0.06, 1300], [0.42, 760]], from: 'a', to: 'u' });
    },
    // "¡Uuh!": sube, como al terminar una vuelta.
    whoo() {
      yelp({ dur: 0.5, pitch: [[0, 620], [0.32, 1350], [0.5, 1280]], from: 'u' });
    },
    // Chasquido de dedos.
    snap() {
      noise({ dur: 0.05, type: 'highpass', freq: 2200, vol: 1.4 });
    },
    // La suela del mocasín girando sobre el suelo del estudio.
    squeak() {
      noise({ dur: 0.18, type: 'bandpass', freq: 2400, q: 14, vol: 2.2, sweep: 3600 });
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
