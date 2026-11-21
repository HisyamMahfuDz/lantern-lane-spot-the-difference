// Lantern Lane — screenshot staging for the entry's own screenshots.
// ?shot=title | play | play2 | win  (plus &found=N to set how many
// differences are already marked). A staged shot is the game itself running
// its own code with a fixed state: the timer is frozen, the markers are the
// game's own markers, and window.__shotInfo records what the frame must
// show, so the maker can assert the screenshot before submitting it.
import { DIFFS_PER_ROUND } from './config.js';

export function applyShot(game) {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const foundN = Math.max(0, Math.min(DIFFS_PER_ROUND, Number(q.get('found') || 0)));
  game.frozen = true;

  if (shot === 'title') {
    game.screen = 'title';
  } else if (shot === 'play' || shot === 'play2') {
    game.screen = 'play';
    game.round = shot === 'play2' ? 1 : 0;
    game.startRound(game.round);
    game.frozen = true;
    game.timeLeft = shot === 'play2' ? 97 : 83;
    game.score = shot === 'play2' ? 315 : 430;
    game.combo = shot === 'play2' ? 1 : 2;
    game.bestCombo = game.combo;
    game.clicks = foundN + (shot === 'play2' ? 1 : 0);
    game.wrongs = shot === 'play2' ? 1 : 0;
    game.found = game.diffs.slice(0, foundN).map((d) => d.id);
    game.totalFound = game.round * DIFFS_PER_ROUND + foundN;
    if (shot === 'play2' && q.get('hint') === '1') {
      game.hintsLeft = 2;
      game.hintTarget = game.diffs[foundN].id;
      game.hintPulse = 2.5;
    }
  } else if (shot === 'win') {
    game.screen = 'win';
    game.round = 2;
    game.score = 2840;
    game.timeLeft = 0;
    game.totalFound = 21;
    game.clicks = 24;
    game.wrongs = 2;
    game.bestCombo = 5;
    game.best = 2840;
    game.found = game.diffs.map((d) => d.id);
  } else {
    return null;
  }

  const info = {
    shot,
    screen: game.screen,
    round: game.round,
    roundId: game.roundDef.id,
    found: game.found.length,
    remaining: game.remaining,
    panels: 2,
    score: game.score,
    timeLeft: Math.round(game.timeLeft),
    hintsLeft: game.hintsLeft,
    hintTarget: game.hintTarget,
    width: 1280,
    height: 720,
    errors: [],
  };
  window.__shotInfo = info;
  const el = document.getElementById('shot-info');
  if (el) el.textContent = JSON.stringify(info);
  return info;
}
