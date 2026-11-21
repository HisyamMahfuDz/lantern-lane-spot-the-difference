// Lantern Lane — Spot the Difference: configuration.
// One place for every number the game tunes: canvas, panels, rounds, scoring.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Two panels, side by side, each 600x560 in panel space (1 unit = 1 canvas px).
export const PANEL = { w: 600, h: 560, y: 84, gap: 40, x0: 20, x1: 660 };

export const ROUNDS = [
  { id: 'market', name: 'RONDE 1 · PASAR LENTERA', sub: 'Pasar malam di tepi sungai', time: 150 },
  { id: 'garden', name: 'RONDE 2 · TAMAN KUNANG-KUNANG', sub: 'Kolam teratai saat senja', time: 150 },
  { id: 'pier', name: 'RONDE 3 · DERMAGA SENJA', sub: 'Pelabuhan kecil, matahari terbenam', time: 120 },
];

export const DIFFS_PER_ROUND = 7;
export const HINTS_PER_ROUND = 3;
export const HINT_COOLDOWN_S = 8;
export const HINT_PULSE_S = 2.5;
export const CLEAR_PAUSE_S = 2.4;

export const SCORE = {
  find: 100, // base points per difference found
  comboStep: 10, // +10% per combo step, capped below
  comboCap: 50, // combo bonus caps at +50%
  wrong: -15, // wrong click costs 15 points and resets the combo
  hint: -25, // a hint costs 25 points
  timeBonusPerSec: 5, // round-clear bonus per second left
};

export const PALETTE = {
  ink: '#1c1433',
  panelEdge: '#3d2b63',
  hudBg: '#241a45',
  hudLine: '#4a3670',
  cream: '#fff3d6',
  gold: '#ffc94d',
  coral: '#ff6b5e',
  teal: '#39d0c4',
  leaf: '#7ed491',
  dim: '#b9a8e0',
};

export const BEST_KEY = 'lantern-lane-best';
