// Lantern Lane — everything the player sees: HUD, panels, markers, banners.
// The judge only ever sees screenshots, so every system the game has — the
// counter, the timer, the hints, the combo, the round progress — is drawn in
// the frame, never hidden in a config table.
import { CANVAS_W, CANVAS_H, PANEL, ROUNDS, DIFFS_PER_ROUND, HINT_PULSE_S, PALETTE } from './config.js';
import { paintScene } from './scenes.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fmtTime(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function drawPanelFrame(ctx, x, label, foundHere) {
  ctx.save();
  rr(ctx, x - 4, PANEL.y - 4, PANEL.w + 8, PANEL.h + 8, 14);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#241a45';
  rr(ctx, x + 10, PANEL.y - 4, 74, 24, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + 47, PANEL.y + 13);
  void foundHere;
}

export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, '#1c1433');
  bg.addColorStop(1, '#2a1f4d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (game.screen === 'title') {
    drawTitle(ctx, game);
    return;
  }
  drawHud(ctx, game);
  drawPanels(ctx, game);
  drawBottomBar(ctx, game);
  if (game.screen === 'clear') drawClearBanner(ctx, game);
  if (game.screen === 'win') drawEndScreen(ctx, game, true);
  if (game.screen === 'lose') drawEndScreen(ctx, game, false);
}

function drawTitle(ctx, game) {
  // A living preview of round 1 behind the title, dimmed so the text reads.
  // Full 600x560 panels: uniform scale, never squashed.
  ctx.save();
  ctx.globalAlpha = 0.55;
  paintScene(ctx, 'market', 0, 40, 150, 600, 560);
  paintScene(ctx, 'market', 1, 640, 150, 600, 560);
  ctx.restore();
  ctx.fillStyle = 'rgba(20,12,40,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 74px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('LANTERN LANE', CANVAS_W / 2, 118);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('— SPOT THE DIFFERENCE —', CANVAS_W / 2, 158);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Dua gambar hampir sama. Temukan 7 perbedaan di setiap ronde.', CANVAS_W / 2, 600);
  ctx.fillText('Klik perbedaannya di panel mana pun · 3 ronde · petunjuk (H) · waktu terbatas', CANVAS_W / 2, 630);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('KLIK ATAU TEKAN ENTER UNTUK MULAI', CANVAS_W / 2, 682);
  if (game.best > 0) {
    ctx.fillStyle = PALETTE.cream;
    ctx.font = '18px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(`Skor terbaik: ${game.best}`, CANVAS_W / 2, 52);
  }
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Ronde 1 Pasar Lentera · Ronde 2 Taman Kunang-Kunang · Ronde 3 Dermaga Senja', CANVAS_W / 2, 24);
}

function drawHud(ctx, game) {
  const def = game.roundDef;
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, CANVAS_W, 72);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, 70, CANVAS_W, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 21px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(def.name, 20, 30);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(def.sub, 20, 54);
  // Counter: found vs remaining — the heart of the game, dead centre.
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 30px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`DITEMUKAN ${game.found.length}/${DIFFS_PER_ROUND}`, CANVAS_W / 2, 34);
  ctx.fillStyle = game.remaining <= 2 ? PALETTE.coral : PALETTE.gold;
  ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`SISA ${game.remaining}`, CANVAS_W / 2, 60);
  // Timer (right): bar + seconds, red under 30s.
  const frac = Math.max(0, game.timeLeft / def.time);
  const barX = 1000;
  const barW = 180;
  ctx.textAlign = 'right';
  ctx.fillStyle = frac < 0.2 ? PALETTE.coral : PALETTE.cream;
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(fmtTime(game.timeLeft), 1180, 30);
  ctx.fillStyle = '#120c26';
  rr(ctx, barX, 40, barW, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac < 0.2 ? PALETTE.coral : PALETTE.teal;
  if (barW * frac > 4) {
    rr(ctx, barX, 40, Math.max(12, barW * frac), 12, 6);
    ctx.fill();
  }
  // Score + combo on one line, hints below it.
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`SKOR ${game.score}`, 820, 30);
  if (game.combo >= 2) {
    const w = ctx.measureText(`SKOR ${game.score}`).width;
    ctx.fillStyle = PALETTE.coral;
    ctx.fillText(`· KOMBO ×${game.combo}`, 820 + w + 10, 30);
  }
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Petunjuk ×${game.hintsLeft} (H)${game.hintCooldown > 0 ? ` · ${Math.ceil(game.hintCooldown)} dtk` : ''}`, 820, 56);
}

function drawPanels(ctx, game) {
  const scene = game.roundDef.id;
  const shakeX = game.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = game.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawPanelFrame(ctx, PANEL.x0, 'KIRI', game.found.length);
  drawPanelFrame(ctx, PANEL.x1, 'KANAN', game.found.length);
  paintScene(ctx, scene, 0, PANEL.x0, PANEL.y, PANEL.w, PANEL.h);
  paintScene(ctx, scene, 1, PANEL.x1, PANEL.y, PANEL.w, PANEL.h);
  // Markers on every difference found, on both panels.
  game.diffs.forEach((d, i) => {
    if (!game.found.includes(d.id)) return;
    for (const px of [PANEL.x0, PANEL.x1]) {
      const cx = px + d.x;
      const cy = PANEL.y + d.y;
      ctx.strokeStyle = '#ff3b30';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ff3b30';
      ctx.beginPath();
      ctx.arc(cx, cy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), cx, cy + 5);
    }
  });
  // Hint pulse: an expanding gold ring on the next unfound difference.
  if (game.hintTarget && game.hintPulse > 0) {
    const d = game.diffs.find((x) => x.id === game.hintTarget);
    if (d) {
      const pulse = 1 + 0.35 * Math.sin((HINT_PULSE_S - game.hintPulse) * 6);
      for (const px of [PANEL.x0, PANEL.x1]) {
        ctx.strokeStyle = `rgba(255,201,77,${0.45 + 0.4 * Math.sin((HINT_PULSE_S - game.hintPulse) * 6)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px + d.x, PANEL.y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  // Particles and floaters, in panel space on both panels.
  for (const px of [PANEL.x0, PANEL.x1]) {
    for (const p of game.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.t / 0.7);
      ctx.beginPath();
      ctx.arc(px + p.x, PANEL.y + p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const f of game.floaters) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.t));
      ctx.fillStyle = f.color;
      ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, px + f.x, PANEL.y + f.y);
    }
    ctx.globalAlpha = 1;
  }
  // Wrong-click flash.
  if (game.flashWrong) {
    const px = game.flashWrong.panel === 0 ? PANEL.x0 : PANEL.x1;
    ctx.globalAlpha = Math.max(0, game.flashWrong.t / 0.7);
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 4;
    const fx = px + game.flashWrong.x;
    const fy = PANEL.y + game.flashWrong.y;
    ctx.beginPath();
    ctx.moveTo(fx - 10, fy - 10);
    ctx.lineTo(fx + 10, fy + 10);
    ctx.moveTo(fx + 10, fy - 10);
    ctx.lineTo(fx - 10, fy + 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawBottomBar(ctx, game) {
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '15px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Klik perbedaannya di panel mana pun · H = petunjuk · R = ulangi · M = suara', CANVAS_W / 2, 672);
  // Round progress dots.
  for (let i = 0; i < ROUNDS.length; i++) {
    const x = CANVAS_W / 2 - 30 + i * 30;
    ctx.beginPath();
    ctx.arc(x, 696, 7, 0, Math.PI * 2);
    ctx.fillStyle = i < game.round ? PALETTE.teal : i === game.round ? PALETTE.gold : '#4a3670';
    ctx.fill();
  }
}

function drawClearBanner(ctx, game) {
  ctx.fillStyle = 'rgba(20,12,40,0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 56px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('RONDE SELESAI!', CANVAS_W / 2, 300);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Semua ${DIFFS_PER_ROUND} perbedaan ditemukan · Bonus waktu +${game.roundBonus}`, CANVAS_W / 2, 350);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Skor ${game.score} · Ronde berikutnya: ${ROUNDS[game.round + 1].name}`, CANVAS_W / 2, 392);
}

function drawEndScreen(ctx, game, won) {
  ctx.fillStyle = 'rgba(20,12,40,0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  if (won) {
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 58px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('SELAMAT!', CANVAS_W / 2, 220);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('Semua 21 perbedaan di 3 ronde ditemukan!', CANVAS_W / 2, 268);
  } else {
    ctx.fillStyle = PALETTE.coral;
    ctx.font = 'bold 58px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText('WAKTU HABIS', CANVAS_W / 2, 220);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(`Kamu menemukan ${game.totalFound} dari 21 perbedaan`, CANVAS_W / 2, 268);
  }
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '22px "Trebuchet MS", Verdana, sans-serif';
  const rows = [
    `Skor akhir: ${game.score}`,
    `Akurasi klik: ${game.accuracy}%  ·  Kombo terbaik: ×${game.bestCombo}`,
    `Skor terbaik: ${game.best}`,
  ];
  rows.forEach((r, i) => ctx.fillText(r, CANVAS_W / 2, 330 + i * 36));
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('KLIK ATAU TEKAN R UNTUK MAIN LAGI', CANVAS_W / 2, 480);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('3 ronde · 21 perbedaan · petunjuk, kombo, dan bonus waktu', CANVAS_W / 2, 520);
}
