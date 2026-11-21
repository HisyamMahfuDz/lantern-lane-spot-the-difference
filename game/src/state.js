// Lantern Lane — game state: screens, rounds, scoring, timer, hints.
// One class owns every rule, so the renderer only draws what this says.
import { ROUNDS, DIFFS_PER_ROUND, HINTS_PER_ROUND, HINT_COOLDOWN_S, HINT_PULSE_S, CLEAR_PAUSE_S, SCORE, BEST_KEY } from './config.js';
import { DIFFS } from './differences.js';
import { SoundFX } from './audio.js';

export class SpotGame {
  constructor() {
    this.sfx = new SoundFX();
    this.screen = 'title'; // title | play | clear | win | lose
    this.round = 0;
    this.found = []; // diff ids found this round
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.timeLeft = ROUNDS[0].time;
    this.hintsLeft = HINTS_PER_ROUND;
    this.hintCooldown = 0;
    this.hintTarget = null; // diff id currently pulsing
    this.hintPulse = 0;
    this.clicks = 0;
    this.wrongs = 0;
    this.totalFound = 0;
    this.roundBonus = 0;
    this.clearTimer = 0;
    this.frozen = false; // screenshots freeze the timer
    this.shake = 0;
    this.particles = [];
    this.floaters = [];
    this.flashWrong = null; // {x, y, panel, t} of the last wrong click
    this.best = 0;
    try {
      this.best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch {
      this.best = 0;
    }
    this._lastTickSecond = -1;
  }

  get roundDef() {
    return ROUNDS[this.round];
  }

  get diffs() {
    return DIFFS[this.roundDef.id];
  }

  get remaining() {
    return DIFFS_PER_ROUND - this.found.length;
  }

  get accuracy() {
    return this.clicks === 0 ? 100 : Math.round((100 * (this.clicks - this.wrongs)) / this.clicks);
  }

  newGame() {
    this.screen = 'play';
    this.round = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.clicks = 0;
    this.wrongs = 0;
    this.totalFound = 0;
    this.startRound(0);
  }

  startRound(i) {
    this.round = i;
    this.found = [];
    this.timeLeft = ROUNDS[i].time;
    this.hintsLeft = HINTS_PER_ROUND;
    this.hintCooldown = 0;
    this.hintTarget = null;
    this.hintPulse = 0;
    this.roundBonus = 0;
    this.screen = 'play';
    this._lastTickSecond = -1;
  }

  // A click inside a panel, in panel space (600x560). Either panel counts:
  // the difference is marked on both panels at once.
  clickAt(panel, x, y) {
    if (this.screen !== 'play') return null;
    this.clicks++;
    const hit = this.diffs.find((d) => !this.found.includes(d.id) && Math.hypot(x - d.x, y - d.y) <= d.r + 10);
    if (hit) {
      this.found.push(hit.id);
      this.totalFound++;
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const mult = 1 + Math.min(this.combo - 1, 5) * (SCORE.comboStep / 100);
      const pts = Math.round(SCORE.find * mult);
      this.score += pts;
      this.sfx.find(this.combo);
      this.burst(hit.x, hit.y);
      this.floaters.push({ x: hit.x, y: hit.y - 24, text: `+${pts}`, t: 1.1, color: '#ffc94d' });
      if (this.found.length === DIFFS_PER_ROUND) this.finishRound();
      return { hit: hit.id, pts };
    }
    this.wrongs++;
    this.combo = 0;
    this.score = Math.max(0, this.score + SCORE.wrong);
    this.sfx.wrong();
    this.shake = 0.25;
    this.flashWrong = { x, y, panel, t: 0.7 };
    this.floaters.push({ x, y: y - 18, text: 'BUKAN!', t: 0.9, color: '#ff6b5e' });
    return { hit: null };
  }

  useHint() {
    if (this.screen !== 'play') return false;
    if (this.hintsLeft <= 0 || this.hintCooldown > 0) return false;
    const next = this.diffs.find((d) => !this.found.includes(d.id));
    if (!next) return false;
    this.hintsLeft--;
    this.score = Math.max(0, this.score + SCORE.hint);
    this.hintTarget = next.id;
    this.hintPulse = HINT_PULSE_S;
    this.hintCooldown = HINT_COOLDOWN_S;
    this.sfx.hint();
    return true;
  }

  finishRound() {
    this.roundBonus = Math.round(this.timeLeft) * SCORE.timeBonusPerSec;
    this.score += this.roundBonus;
    this.sfx.roundClear();
    if (this.round + 1 < ROUNDS.length) {
      this.screen = 'clear';
      this.clearTimer = CLEAR_PAUSE_S;
    } else {
      this.screen = 'win';
      this.sfx.win();
      if (this.score > this.best) {
        this.best = this.score;
        try {
          localStorage.setItem(BEST_KEY, String(this.best));
        } catch {
          // Best score is nice-to-have only.
        }
      }
    }
  }

  burst(x, y) {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.particles.push({ x, y, vx: Math.cos(a) * (40 + (i % 5) * 22), vy: Math.sin(a) * (40 + (i % 5) * 22), t: 0.7, color: ['#ffc94d', '#ff6b5e', '#fff3d6'][i % 3] });
    }
  }

  update(dt) {
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.hintCooldown > 0) this.hintCooldown = Math.max(0, this.hintCooldown - dt);
    if (this.hintPulse > 0) {
      this.hintPulse = Math.max(0, this.hintPulse - dt);
      if (this.hintPulse === 0) this.hintTarget = null;
    }
    if (this.flashWrong) {
      this.flashWrong.t -= dt;
      if (this.flashWrong.t <= 0) this.flashWrong = null;
    }
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.t -= dt;
    }
    this.particles = this.particles.filter((p) => p.t > 0);
    for (const f of this.floaters) {
      f.y -= 26 * dt;
      f.t -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.t > 0);
    if (this.screen === 'clear') {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) this.startRound(this.round + 1);
      return;
    }
    if (this.screen !== 'play' || this.frozen) return;
    this.timeLeft -= dt;
    const sec = Math.ceil(this.timeLeft);
    if (sec <= 10 && sec >= 0 && sec !== this._lastTickSecond) {
      this._lastTickSecond = sec;
      this.sfx.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = 'lose';
      this.sfx.lose();
    }
  }
}
