// Lantern Lane — mouse + keyboard input.
// Pointer clicks are mapped from canvas pixels into panel space (600x560);
// either panel accepts the click. Keyboard: Enter/Space starts, H hints,
// R restarts, M mutes.
import { CANVAS_W, CANVAS_H, PANEL } from './config.js';

export function attachInput(canvas, game) {
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * CANVAS_W, y: ((e.clientY - r.top) / r.height) * CANVAS_H };
  }

  function panelAt(x, y) {
    if (y < PANEL.y || y > PANEL.y + PANEL.h) return null;
    if (x >= PANEL.x0 && x <= PANEL.x0 + PANEL.w) return { panel: 0, x: x - PANEL.x0, y: y - PANEL.y };
    if (x >= PANEL.x1 && x <= PANEL.x1 + PANEL.w) return { panel: 1, x: x - PANEL.x1, y: y - PANEL.y };
    return null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    game.sfx.ensure();
    const p = toCanvas(e);
    if (game.screen === 'title') {
      game.sfx.click();
      game.newGame();
      return;
    }
    if (game.screen === 'win' || game.screen === 'lose') {
      game.sfx.click();
      game.newGame();
      return;
    }
    if (game.screen === 'clear') return;
    const hit = panelAt(p.x, p.y);
    if (hit) game.clickAt(hit.panel, hit.x, hit.y);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'enter' || k === ' ') {
      game.sfx.ensure();
      if (game.screen === 'title' || game.screen === 'win' || game.screen === 'lose') {
        game.sfx.click();
        game.newGame();
      }
      e.preventDefault();
    } else if (k === 'h') {
      game.sfx.ensure();
      game.useHint();
    } else if (k === 'r') {
      game.sfx.ensure();
      game.newGame();
    } else if (k === 'm') {
      game.sfx.muted = !game.sfx.muted;
    }
  });
}
