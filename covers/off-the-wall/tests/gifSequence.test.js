import { describe, expect, it } from 'vitest';
import { advanceGifAfterLoop, gifLoopDurationMs } from '../src/gifSequence.js';

const oneFrameGif = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x21, 0xf9, 0x04, 0x00, 0x0a, 0x00, 0x00, 0x00,
  0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
  0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

describe('GIF rotation', () => {
  it('shows each clip for two loops before switching and repeats the playlist', () => {
    let state = advanceGifAfterLoop(0, 0, 2);
    expect(state).toEqual({ gifIndex: 0, loopsCompleted: 1 });
    state = advanceGifAfterLoop(state.gifIndex, state.loopsCompleted, 2);
    expect(state).toEqual({ gifIndex: 1, loopsCompleted: 0 });
    state = advanceGifAfterLoop(state.gifIndex, state.loopsCompleted, 2);
    expect(state).toEqual({ gifIndex: 1, loopsCompleted: 1 });
    state = advanceGifAfterLoop(state.gifIndex, state.loopsCompleted, 2);
    expect(state).toEqual({ gifIndex: 0, loopsCompleted: 0 });
  });

  it('reads the frame delay to estimate a loop duration', () => {
    expect(gifLoopDurationMs(oneFrameGif)).toBe(100);
  });
});
