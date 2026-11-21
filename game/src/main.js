// Lantern Lane — bootstrap: canvas, fixed-step loop, error capture.
// The canvas is a fixed 1280x720 stage; CSS scales it to the window while
// keeping the aspect ratio, so screenshots are always 1280x720.
import { CANVAS_W, CANVAS_H } from './config.js';
import { SpotGame } from './state.js';
import { attachInput } from './input.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Any runtime error is written into #shot-info too, so a broken screenshot
// cannot pass its assertion silently.
window.addEventListener('error', (e) => {
  const el = document.getElementById('shot-info');
  if (!el) return;
  try {
    const info = JSON.parse(el.textContent || '{}');
    info.errors = info.errors || [];
    info.errors.push(String(e.message || e.error || 'error'));
    el.textContent = JSON.stringify(info);
    if (window.__shotInfo) window.__shotInfo.errors = info.errors;
  } catch {
    el.textContent = JSON.stringify({ errors: [String(e.message || 'error')] });
  }
});

const game = new SpotGame();
window.__game = game;
attachInput(canvas, game);
applyShot(game);

function fitCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_W, window.innerHeight / CANVAS_H);
  canvas.style.width = `${Math.floor(CANVAS_W * scale)}px`;
  canvas.style.height = `${Math.floor(CANVAS_H * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  game.update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
