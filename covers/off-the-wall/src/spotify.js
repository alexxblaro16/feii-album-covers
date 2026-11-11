// El disco en Spotify, con su reproductor oficial (Spotify iFrame API).
// Con sesión de Spotify abierta en el navegador suenan las canciones enteras;
// sin sesión, Spotify da fragmentos. En el repositorio no hay ningún audio.
//
// El reproductor de Spotify vive en un iframe de otro dominio: la página no
// puede leer su sonido (a diferencia de los fragmentos de Apple, que sí pasan
// por un AnalyserNode). Lo que sí cuenta la API es si suena y por dónde va,
// así que el ritmo se aproxima con un pulso a tempo de disco (BPM) enganchado
// a la posición real de la canción.

const API = 'https://open.spotify.com/embed/iframe-api/v1';
const ALBUM_ID = '2ZytN2cY4Zjrr9ukb2rqTP';
export const SPOTIFY_URL = `https://open.spotify.com/album/${ALBUM_ID}`;
// Tempo aproximado del disco (casi todo va entre 110 y 125 BPM).
const BPM = 118;

let apiPromise = null;

/** Carga la API una sola vez; si vuelve a montarse la ruta, se reutiliza. */
function loadApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      resolve(api);
      prev?.(api);
    };
    const s = document.createElement('script');
    s.src = API;
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error('No se ha podido cargar Spotify'));
    };
    document.body.appendChild(s);
  });
  return apiPromise;
}

/**
 * Monta el reproductor dentro de `host` (un div que no toca React).
 * @param {HTMLElement} host
 * @param {{ onPlaying: (on: boolean) => void, height: number }} o
 */
export async function createSpotify(host, { onPlaying, height }) {
  const api = await loadApi();
  // La API sustituye el elemento por el iframe: se le da uno propio.
  const slot = document.createElement('div');
  host.appendChild(slot);
  let playing = false;
  // Posición (s) y momento en que se midió, para extrapolar entre avisos.
  let pos = 0;
  let stamp = 0;

  const controller = await new Promise((resolve) => {
    api.createController(slot, { uri: `spotify:album:${ALBUM_ID}`, width: '100%', height }, resolve);
  });
  controller.addListener('playback_update', (e) => {
    const now = !e.data.isPaused && !e.data.isBuffering;
    pos = e.data.position / 1000;
    stamp = performance.now() / 1000;
    if (now !== playing) {
      playing = now;
      onPlaying(now);
    }
  });

  return {
    toggle() {
      controller.togglePlay();
    },
    pause() {
      if (playing) controller.togglePlay();
    },
    get playing() {
      return playing;
    },
    /** Pulso de graves aproximado (0..1): golpe en cada tiempo del compás. */
    level() {
      if (!playing) return 0;
      const t = pos + (performance.now() / 1000 - stamp);
      const beat = (t * BPM) / 60;
      const f = beat - Math.floor(beat);
      return Math.exp(-f * 7) * 0.85;
    },
    // Solo quita su propio iframe: en desarrollo React monta dos veces y el
    // contenedor puede tener ya el reproductor del segundo montaje.
    dispose() {
      controller.destroy();
      slot.remove();
    },
  };
}
