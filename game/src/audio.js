// Lantern Lane — sound effects, synthesized with WebAudio (no audio files).
// Everything is generated in code, so the game ships zero sound assets and
// loads nothing over the network. Audio starts only after the first user
// gesture, as browsers require; until then every call is a safe no-op.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, dur, type = 'sine', gain = 0.12, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // A sound must never break the game.
    }
  }

  click() {
    this.tone(660, 0.06, 'triangle', 0.06);
  }

  // A satisfying two-note chime on each find, rising with the combo.
  find(combo = 0) {
    const base = 523 * Math.pow(1.059463, Math.min(combo, 6));
    this.tone(base, 0.14, 'sine', 0.14);
    this.tone(base * 1.5, 0.22, 'sine', 0.12, null, 0.07);
    this.tone(base * 2, 0.3, 'triangle', 0.05, null, 0.12);
  }

  wrong() {
    this.tone(160, 0.18, 'sawtooth', 0.07, 90);
  }

  hint() {
    this.tone(880, 0.1, 'sine', 0.08);
    this.tone(1174, 0.12, 'sine', 0.08, null, 0.08);
    this.tone(1568, 0.18, 'sine', 0.07, null, 0.16);
  }

  roundClear() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.1, null, i * 0.09));
  }

  win() {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.1, null, i * 0.1));
  }

  lose() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.09, null, i * 0.13));
  }

  tick() {
    this.tone(980, 0.05, 'square', 0.04);
  }
}
