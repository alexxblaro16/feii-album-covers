export const GIF_LOOPS_PER_CLIP = 2;

const DEFAULT_FRAME_DELAY_MS = 100;
const MIN_FRAME_DELAY_MS = 20;

export function advanceGifAfterLoop(gifIndex, loopsCompleted, gifCount) {
  const completedLoops = loopsCompleted + 1;
  if (completedLoops < GIF_LOOPS_PER_CLIP) {
    return { gifIndex, loopsCompleted: completedLoops };
  }
  return { gifIndex: (gifIndex + 1) % gifCount, loopsCompleted: 0 };
}

export function gifLoopDurationMs(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const signature = String.fromCharCode(...bytes.subarray(0, 6));
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    throw new Error('Invalid GIF signature');
  }

  let offset = 13;
  if (bytes[10] & 0x80) offset += 3 * (1 << ((bytes[10] & 0x07) + 1));

  let frameCount = 0;
  let frameDelayMs = DEFAULT_FRAME_DELAY_MS;
  let durationMs = 0;
  while (offset < bytes.length) {
    const marker = bytes[offset++];
    if (marker === 0x3b) break;

    if (marker === 0x21) {
      if (offset >= bytes.length) throw new Error('Truncated GIF extension');
      const label = bytes[offset++];
      if (label === 0xf9) {
        if (offset >= bytes.length) throw new Error('Truncated GIF graphic control block');
        const blockSize = bytes[offset++];
        if (blockSize !== 4 || offset + blockSize >= bytes.length) {
          throw new Error('Invalid GIF graphic control block');
        }
        const delayCentiseconds = bytes[offset + 1] | (bytes[offset + 2] << 8);
        frameDelayMs = Math.max(delayCentiseconds * 10, MIN_FRAME_DELAY_MS);
        offset += blockSize;
        if (bytes[offset] === 0) offset += 1;
      } else {
        offset = skipSubBlocks(bytes, offset);
      }
      continue;
    }

    if (marker === 0x2c) {
      if (offset + 9 > bytes.length) throw new Error('Truncated GIF image descriptor');
      const flags = bytes[offset + 8];
      offset += 9;
      if (flags & 0x80) offset += 3 * (1 << ((flags & 0x07) + 1));
      if (offset >= bytes.length) throw new Error('Truncated GIF image data');
      offset += 1;
      offset = skipSubBlocks(bytes, offset);
      frameCount += 1;
      durationMs += frameDelayMs;
      frameDelayMs = DEFAULT_FRAME_DELAY_MS;
      continue;
    }

    throw new Error(`Unexpected GIF block: 0x${marker.toString(16)}`);
  }

  if (!frameCount) throw new Error('GIF contains no frames');
  return durationMs;
}

function skipSubBlocks(bytes, start) {
  let offset = start;
  while (offset < bytes.length) {
    const size = bytes[offset++];
    if (size === 0) return offset;
    offset += size;
    if (offset > bytes.length) throw new Error('Truncated GIF data sub-block');
  }
  throw new Error('Unterminated GIF data sub-block');
}
