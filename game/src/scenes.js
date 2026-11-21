// Lantern Lane — the three scenes, painted procedurally on canvas.
// No image assets: every lantern, lily pad and plank is drawn in code, so the
// game ships zero pictures and loads nothing over the network. Each painter
// draws the base scene, then, when variant is 1, applies that round's seven
// differences exactly at the spots differences.js names. The two panels of a
// round are the same painter called with variant 0 (left) and 1 (right).
import { mulberry32 } from './random.js';

// --- small drawing helpers -------------------------------------------------
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function disc(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function poly(ctx, pts, fill) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function star4(ctx, x, y, r, fill, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function glowDisc(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// --- ROUND 1: Pasar Lentera (night market) ---------------------------------
function paintMarket(ctx, variant) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#241a45');
  sky.addColorStop(0.55, '#7a3b6e');
  sky.addColorStop(1, '#ff9a5c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 380);
  // Stars.
  const rng = mulberry32(11);
  for (let i = 0; i < 46; i++) {
    const x = rng() * 600;
    const y = rng() * 260;
    if (Math.hypot(x - 88, y - 66) < 42) continue;
    star4(ctx, x, y, 1.5 + rng() * 2.2, '#ffe9a8', 0.35 + rng() * 0.6);
  }
  // Moon: crescent on the left panel, full on the right.
  glowDisc(ctx, 88, 66, 46, '#ffd97a', 0.5);
  disc(ctx, 88, 66, 24, '#ffe9a8');
  if (variant === 0) {
    disc(ctx, 100, 58, 21, '#3a2a63');
  } else {
    disc(ctx, 80, 60, 5, '#e8b64c');
    disc(ctx, 96, 72, 4, '#e8b64c');
  }
  // Clouds.
  ctx.fillStyle = 'rgba(255,170,140,0.28)';
  ellipse(ctx, 240, 90, 70, 14, 'rgba(255,170,140,0.28)');
  ellipse(ctx, 420, 60, 56, 12, 'rgba(255,170,140,0.22)');
  // Rooftops silhouette.
  ctx.fillStyle = '#1c1433';
  ctx.fillRect(0, 320, 600, 60);
  for (const [x, w, h] of [[30, 120, 46], [170, 140, 62], [330, 110, 40], [460, 120, 56]]) {
    ctx.fillRect(x, 320 - h, w, h + 60);
    poly(ctx, [[x - 8, 320 - h], [x + w / 2, 320 - h - 26], [x + w + 8, 320 - h]], '#1c1433');
  }
  // Kite stuck on a roof: tail on the left panel, gone on the right.
  poly(ctx, [[520, 92], [542, 116], [520, 140], [498, 116]], '#39d0c4');
  ctx.strokeStyle = '#39d0c4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(520, 140);
  ctx.lineTo(520, 116);
  ctx.stroke();
  if (variant === 0) {
    ctx.strokeStyle = '#ffd97a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(520, 140);
    ctx.quadraticCurveTo(536, 168, 524, 196);
    ctx.stroke();
    for (const [bx, by] of [[528, 158], [524, 176], [528, 192]]) {
      poly(ctx, [[bx - 5, by], [bx + 5, by], [bx, by + 8]], '#ff6b5e');
    }
  }
  // String lights swag.
  ctx.strokeStyle = '#2a1f4d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 66);
  ctx.quadraticCurveTo(300, 118, 600, 70);
  ctx.stroke();
  const bulbCols = ['#ffd97a', '#ff8a7a', '#7ed491', '#7ac8ff'];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = t * 600;
    const y = 66 + (118 - 66) * 2 * t * (1 - t) * 2 + 22 * t * (1 - t);
    glowDisc(ctx, x, y + 8, 9, bulbCols[i % 4], 0.55);
    disc(ctx, x, y + 8, 3.4, bulbCols[i % 4]);
  }
  // Bunting flags: one flag (x 430) missing on the right panel.
  ctx.strokeStyle = '#2a1f4d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(340, 82);
  ctx.quadraticCurveTo(430, 104, 520, 84);
  ctx.stroke();
  const flagCols = ['#ff6b5e', '#ffc94d', '#39d0c4', '#ff8a7a'];
  for (let i = 0; i < 9; i++) {
    const x = 350 + i * 20;
    const y = 88 + Math.sin((i / 8) * Math.PI) * 10;
    if (variant === 1 && i === 4) continue; // the missing flag
    poly(ctx, [[x - 8, y], [x + 8, y], [x, y + 16]], flagCols[i % 4]);
  }
  // Hanging paper lanterns: the middle one (x 300) is red left, teal right.
  const lanternXs = [60, 120, 180, 240, 300, 360, 420, 480, 540];
  lanternXs.forEach((x, i) => {
    const isMid = x === 300;
    const col = isMid ? (variant === 0 ? '#ff5a4e' : '#2bb3a8') : ['#ff5a4e', '#ffc94d', '#ff8a7a'][i % 3];
    ctx.strokeStyle = '#2a1f4d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 118);
    ctx.lineTo(x, 132);
    ctx.stroke();
    glowDisc(ctx, x, 150, 26, col, 0.4);
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, 150, 15, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,10,10,0.55)';
    ctx.lineWidth = 1.5;
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath();
      ctx.ellipse(x, 150, Math.abs(dx) + 2, 19, 0, -Math.PI / 2.4, Math.PI / 2.4);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffd97a';
    ctx.fillRect(x - 5, 128, 10, 4);
    ctx.fillRect(x - 5, 168, 10, 4);
  });
  // Balloons over the toy stall: three left, two right.
  const balloonSet = variant === 0
    ? [[132, 292, '#ff6b5e'], [150, 282, '#ffc94d'], [168, 294, '#39d0c4']]
    : [[132, 292, '#ff6b5e'], [168, 294, '#39d0c4']];
  for (const [bx, by, col] of balloonSet) {
    ctx.strokeStyle = 'rgba(255,243,214,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, by + 14);
    ctx.quadraticCurveTo(bx + 6, by + 40, 150, 360);
    ctx.stroke();
    ellipse(ctx, bx, by, 13, 16, col);
    poly(ctx, [[bx - 4, by + 14], [bx + 4, by + 14], [bx, by + 20]], col);
  }
  // Stalls.
  drawStall(ctx, 40, 360, 160, '#ff5a4e', 'MAKANAN', ['#ff8a3c', '#ffc94d', '#7ed491']);
  drawStall(ctx, 230, 360, 160, '#2bb3a8', 'MAINAN', ['#ff6b5e', '#7ac8ff', '#ffc94d']);
  drawStall(ctx, 420, 360, 160, '#8a5cf6', 'BUNGA', ['#ff7eb6', '#ffb3d1', '#ffc94d']);
  ctx.fillStyle = '#ffc94d';
  ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PASAR LENTERA', 310, 352);
  // Cat on a crate: present left, gone right.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(468, 452, 62, 34);
  ctx.fillStyle = '#a9743c';
  ctx.fillRect(468, 452, 62, 8);
  ctx.strokeStyle = '#5d3a17';
  ctx.lineWidth = 2;
  ctx.strokeRect(468, 452, 62, 34);
  if (variant === 0) {
    ctx.fillStyle = '#2b2b3a';
    ellipse(ctx, 498, 436, 20, 13, '#2b2b3a');
    disc(ctx, 498, 416, 12, '#2b2b3a');
    poly(ctx, [[489, 410], [492, 396], [498, 408]], '#2b2b3a');
    poly(ctx, [[507, 410], [504, 396], [498, 408]], '#2b2b3a');
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(514, 440);
    ctx.quadraticCurveTo(528, 434, 524, 416);
    ctx.stroke();
    disc(ctx, 493, 414, 1.8, '#ffd97a');
  }
  // Bicycle: front wheel missing on the right panel.
  ctx.strokeStyle = '#d8d2ea';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(88, 528, 16, 0, Math.PI * 2);
  ctx.stroke();
  if (variant === 0) {
    ctx.beginPath();
    ctx.arc(148, 528, 16, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(88, 528);
  ctx.lineTo(118, 502);
  ctx.lineTo(148, 528);
  ctx.moveTo(118, 502);
  ctx.lineTo(112, 488);
  ctx.moveTo(118, 502);
  ctx.lineTo(140, 490);
  ctx.stroke();
  // Street.
  ctx.fillStyle = '#241a45';
  ctx.fillRect(0, 500, 600, 60);
  const rng2 = mulberry32(23);
  for (let i = 0; i < 26; i++) {
    ellipse(ctx, rng2() * 600, 508 + rng2() * 44, 14 + rng2() * 12, 5, 'rgba(255,243,214,0.10)');
  }
  glowDisc(ctx, 300, 512, 90, '#ff9a5c', 0.16);
}

// One market stall: striped awning, counter, and a row of goods.
function drawStall(ctx, x, y, w, awn, label, goods) {
  ctx.fillStyle = '#3a2a63';
  ctx.fillRect(x, y + 30, w, 130);
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? awn : '#fff3d6';
    ctx.fillRect(x + (i * w) / 6, y, w / 6, 34);
  }
  ctx.fillStyle = '#2a1f4d';
  ctx.fillRect(x, y + 30, w, 6);
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(x + 6, y + 96, w - 12, 64);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(x + 6, y + 96, w - 12, 10);
  goods.forEach((c, i) => {
    disc(ctx, x + 24 + i * 52, y + 84, 11, c);
    disc(ctx, x + 24 + i * 52 - 4, y + 80, 3, 'rgba(255,255,255,0.5)');
  });
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + 128);
}

// --- ROUND 2: Taman Kunang-Kunang (firefly garden) ---------------------------
function paintGarden(ctx, variant) {
  const sky = ctx.createLinearGradient(0, 0, 0, 340);
  sky.addColorStop(0, '#0f3446');
  sky.addColorStop(0.6, '#3f6d7a');
  sky.addColorStop(1, '#e88aa0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 340);
  const rng = mulberry32(31);
  for (let i = 0; i < 40; i++) {
    const x = rng() * 600;
    const y = rng() * 220;
    star4(ctx, x, y, 1.4 + rng() * 2, '#ffe9a8', 0.3 + rng() * 0.55);
  }
  // Moon and (maybe) its reflection in the pond.
  glowDisc(ctx, 300, 110, 44, '#ffe9a8', 0.5);
  disc(ctx, 300, 110, 20, '#fff3d6');
  disc(ctx, 292, 104, 4, '#e8d28a');
  disc(ctx, 308, 116, 3, '#e8d28a');
  // Willow tree, left: one drooping branch (x 92) missing on the right.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(44, 380);
  ctx.quadraticCurveTo(30, 260, 52, 130);
  ctx.stroke();
  ctx.lineWidth = 5;
  const branches = [[52, 140, 92, 180], [52, 160, 130, 210], [50, 180, 30, 240], [54, 200, 110, 250]];
  for (const [x0, y0, x1, y1] of branches) {
    if (variant === 1 && x1 === 92) continue; // the missing branch
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo((x0 + x1) / 2, y0 + 30, x1, y1);
    ctx.stroke();
    ctx.fillStyle = '#5da864';
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      disc(ctx, x0 + (x1 - x0) * t + (rng() - 0.5) * 8, y0 + (y1 - y0) * t + 8, 5, '#5da864');
    }
  }
  // Ground and pond.
  ctx.fillStyle = '#1e4d33';
  ctx.fillRect(0, 330, 600, 230);
  const pond = ctx.createRadialGradient(300, 440, 20, 300, 440, 300);
  pond.addColorStop(0, '#2f7d8c');
  pond.addColorStop(1, '#123a4a');
  ctx.fillStyle = pond;
  ctx.beginPath();
  ctx.ellipse(300, 440, 285, 112, 0, 0, Math.PI * 2);
  ctx.fill();
  // Moon reflection: present left, gone right.
  if (variant === 0) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffe9a8';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(286 + (i % 2) * 12, 486 + i * 9, 26 - i * 4, 3);
    }
    ctx.restore();
  }
  // Lily pads: one (x 120) missing on the right.
  const pads = [[120, 470], [200, 440], [300, 486], [420, 440], [500, 492]];
  for (const [px, py] of pads) {
    if (variant === 1 && px === 120) continue;
    ctx.fillStyle = '#3f8f4f';
    ctx.beginPath();
    ctx.ellipse(px, py, 30, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c6b38';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + 28, py - 6);
    ctx.stroke();
  }
  // Lotus: pink left, white right.
  drawLotus(ctx, 200, 378, variant === 0 ? '#ff7eb6' : '#fff3d6');
  drawLotus(ctx, 470, 430, '#ffb3d1');
  // Frog on a pad: present left, gone right.
  if (variant === 0) {
    ctx.fillStyle = '#58b368';
    ellipse(ctx, 420, 402, 15, 10, '#58b368');
    disc(ctx, 412, 390, 6, '#58b368');
    disc(ctx, 428, 390, 6, '#58b368');
    disc(ctx, 412, 388, 2.4, '#123a4a');
    disc(ctx, 428, 388, 2.4, '#123a4a');
    ctx.strokeStyle = '#123a4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(420, 400, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  // Stone lantern: flame on left, out right.
  ctx.fillStyle = '#7a7a86';
  ctx.fillRect(508, 210, 24, 46);
  ctx.fillRect(500, 200, 40, 12);
  poly(ctx, [[496, 200], [544, 200], [520, 182]], '#5d5d6b');
  if (variant === 0) {
    glowDisc(ctx, 520, 192, 18, '#ffb347', 0.7);
    ellipse(ctx, 520, 192, 5, 8, '#ffb347');
    ellipse(ctx, 520, 194, 3, 5, '#ffe9a8');
  }
  // Wooden bridge arc over the pond.
  ctx.strokeStyle = '#6b4a2a';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(180, 336);
  ctx.quadraticCurveTo(300, 296, 420, 336);
  ctx.stroke();
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = 180 + t * 240;
    const y = 336 - Math.sin(t * Math.PI) * 40;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
  }
  // Dragonflies: two left, one right.
  drawDragonfly(ctx, 306, 122, '#7ac8ff');
  if (variant === 0) drawDragonfly(ctx, 344, 140, '#b9a8e0');
  // Fireflies.
  for (let i = 0; i < 26; i++) {
    const x = rng() * 600;
    const y = 240 + rng() * 260;
    glowDisc(ctx, x, y, 7, '#d8ff9e', 0.35 + rng() * 0.4);
    disc(ctx, x, y, 1.8, '#eaffb0');
  }
  // Reeds, right edge.
  ctx.strokeStyle = '#2c6b38';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const x = 566 + i * 5;
    ctx.beginPath();
    ctx.moveTo(x, 560);
    ctx.quadraticCurveTo(x + (i % 2 ? 8 : -8), 480, x + (i % 2 ? 14 : -12), 420);
    ctx.stroke();
  }
}

function drawLotus(ctx, x, y, petal) {
  for (const [dx, dy, rot] of [[-14, -4, -0.6], [0, -12, 0], [14, -4, 0.6], [-7, 2, -0.3], [7, 2, 0.3]]) {
    ctx.save();
    ctx.translate(x + dx, y + dy);
    ctx.rotate(rot);
    ellipse(ctx, 0, 0, 6, 12, petal);
    ctx.restore();
  }
  disc(ctx, x, y + 2, 5, '#ffc94d');
}

function drawDragonfly(ctx, x, y, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 6);
  ctx.lineTo(x + 12, y + 6);
  ctx.moveTo(x - 12, y + 6);
  ctx.lineTo(x + 12, y - 6);
  ctx.stroke();
  ctx.strokeStyle = '#2b2b3a';
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 10, y);
  ctx.stroke();
  disc(ctx, x + 11, y, 2.4, '#2b2b3a');
}

// --- ROUND 3: Dermaga Senja (sunset pier) ----------------------------------
function paintPier(ctx, variant) {
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, '#ff7a3c');
  sky.addColorStop(0.55, '#c94f7c');
  sky.addColorStop(1, '#5b2a6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 360);
  // Sun with glitter path on the sea.
  glowDisc(ctx, 300, 150, 70, '#ffd97a', 0.65);
  disc(ctx, 300, 150, 34, '#ffe9a8');
  const sea = ctx.createLinearGradient(0, 330, 0, 560);
  sea.addColorStop(0, '#7a3b8f');
  sea.addColorStop(1, '#2a1a4d');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 330, 600, 230);
  ctx.fillStyle = 'rgba(255,217,122,0.35)';
  for (let i = 0; i < 9; i++) {
    const w = 60 - i * 4;
    ctx.fillRect(300 - w / 2, 340 + i * 24, w, 3);
  }
  // Clouds.
  ctx.fillStyle = 'rgba(255,190,170,0.4)';
  ellipse(ctx, 140, 90, 64, 13, 'rgba(255,190,170,0.4)');
  ellipse(ctx, 460, 70, 52, 11, 'rgba(255,190,170,0.35)');
  // Seagulls: three left, two right.
  const gulls = [[228, 82], [250, 88], [272, 80]];
  gulls.forEach(([gx, gy], i) => {
    if (variant === 1 && i === 1) return; // the missing gull
    ctx.strokeStyle = '#2b2b3a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 7, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 7, gx + 10, gy);
    ctx.stroke();
  });
  // Waves.
  ctx.strokeStyle = 'rgba(255,243,214,0.35)';
  ctx.lineWidth = 2;
  const rng = mulberry32(41);
  for (let i = 0; i < 12; i++) {
    const y = 360 + rng() * 180;
    const x = rng() * 560;
    ctx.beginPath();
    ctx.arc(x, y, 12 + rng() * 10, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  // Lighthouse, right: beam on left, off right.
  ctx.fillStyle = '#f2ede4';
  ctx.fillRect(540, 90, 34, 250);
  ctx.fillStyle = '#ff5a4e';
  ctx.fillRect(540, 130, 34, 26);
  ctx.fillRect(540, 200, 34, 26);
  ctx.fillRect(540, 270, 34, 26);
  ctx.fillStyle = '#2b2b3a';
  ctx.fillRect(534, 66, 46, 26);
  ctx.fillStyle = variant === 0 ? '#ffe9a8' : '#5d5d6b';
  ctx.fillRect(544, 72, 26, 14);
  if (variant === 0) {
    const beam = ctx.createLinearGradient(544, 79, 300, 120);
    beam.addColorStop(0, 'rgba(255,233,168,0.5)');
    beam.addColorStop(1, 'rgba(255,233,168,0)');
    ctx.fillStyle = beam;
    poly(ctx, [[544, 72], [544, 86], [300, 130], [300, 60]], 'rgba(255,233,168,0.4)');
    glowDisc(ctx, 557, 79, 30, '#ffe9a8', 0.6);
  }
  ctx.fillStyle = '#2b2b3a';
  poly(ctx, [[532, 66], [578, 66], [557, 50]], '#2b2b3a');
  // Pier deck with posts.
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(0, 400, 600, 70);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 400, 600, 12);
  ctx.strokeStyle = '#4a3018';
  ctx.lineWidth = 2;
  for (let x = 40; x < 600; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 412);
    ctx.lineTo(x, 470);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a3018';
  for (const px of [40, 200, 360, 520]) ctx.fillRect(px - 6, 470, 12, 46);
  // Flag on the pier post: present left, gone right.
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(92, 400);
  ctx.lineTo(92, 258);
  ctx.stroke();
  if (variant === 0) {
    poly(ctx, [[92, 258], [122, 266], [92, 276]], '#ff5a4e');
  }
  // Sailboat: red sail left, blue sail right.
  ctx.fillStyle = '#3a2a1a';
  poly(ctx, [[140, 360], [224, 360], [204, 348], [160, 348]], '#3a2a1a');
  ctx.strokeStyle = '#2b2b3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(182, 350);
  ctx.lineTo(182, 290);
  ctx.stroke();
  poly(ctx, [[182, 292], [182, 348], [216, 348]], variant === 0 ? '#ff5a4e' : '#2f7fd0');
  poly(ctx, [[178, 300], [178, 348], [152, 348]], '#fff3d6');
  // Rowboat.
  ctx.fillStyle = '#7a5a3a';
  ellipse(ctx, 350, 392, 34, 9, '#7a5a3a');
  // Jumping fish: present left, gone right.
  if (variant === 0) {
    ctx.strokeStyle = '#7ac8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(400, 442, 16, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ellipse(ctx, 400, 426, 8, 5, '#7ac8ff');
    poly(ctx, [[408, 424], [418, 418], [414, 430]], '#7ac8ff');
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const [dx, dy] of [[-12, 4], [-6, -4], [4, -6], [12, 2]]) disc(ctx, 400 + dx, 446 + dy, 2, 'rgba(255,255,255,0.7)');
  }
  // Buoy: orange left, yellow right.
  const buoyCol = variant === 0 ? '#ff7a3c' : '#ffd94d';
  ellipse(ctx, 480, 478, 16, 10, buoyCol);
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(474, 462, 12, 6);
  disc(ctx, 480, 458, 3, '#ff5a4e');
  // Crates: three left, two right.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(516, 452, 26, 22);
  ctx.fillRect(544, 452, 26, 22);
  if (variant === 0) ctx.fillRect(530, 430, 26, 22);
  ctx.strokeStyle = '#5d3a17';
  ctx.lineWidth = 2;
  ctx.strokeRect(516, 452, 26, 22);
  ctx.strokeRect(544, 452, 26, 22);
  if (variant === 0) ctx.strokeRect(530, 430, 26, 22);
}

// --- entry point -----------------------------------------------------------
// Paints one panel of a round. (px, py) is the panel's top-left on the canvas.
export function paintScene(ctx, sceneId, variant, px, py, pw, ph) {
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(pw / 600, ph / 560);
  ctx.beginPath();
  ctx.rect(0, 0, 600, 560);
  ctx.clip();
  if (sceneId === 'market') paintMarket(ctx, variant);
  else if (sceneId === 'garden') paintGarden(ctx, variant);
  else paintPier(ctx, variant);
  ctx.restore();
}
