[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/HisyamMahfuDz/lantern-lane-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/HisyamMahfuDz/lantern-lane-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Lantern Lane — Spot the Difference

A complete, original spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) "Make the best spot the difference game". Two near-identical pictures side by side, seven differences per round, three hand-painted scenes, a countdown, hints, and a combo score — all art, sounds and names made for this game, drawn and synthesized in code.

Play it on make.fun: https://make.fun/r/0a6j83jv

## How to play

- **Find 7 differences** in each round. Click a difference on either panel — it is marked with a red circle on both.
- **3 rounds**: Pasar Lentera (night market), Taman Kunang-Kunang (firefly garden), Dermaga Senja (sunset pier). Each round raises the difficulty: the differences get smaller and better hidden.
- **Score**: +100 per find, with a combo bonus for finds in a row; a wrong click costs 15 points and resets the combo; a hint (H) costs 25 points and pulses the next unfound difference. Clearing a round pays a time bonus of +5 per second left.
- **Win** by finding all 21 differences before the clock runs out. **Lose** when the timer hits zero.
- Keyboard: `H` hint · `R` restart · `M` mute · `Enter` start.

## Run it

Node.js 22.18 or later, no install, no network:

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. The game is plain static files under `game/` — `game/index.html` opens and plays offline.

## Structure

- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library.
- `game/index.html` — the page; everything else is ES modules under `game/src/`.
- `game/src/config.js` — canvas, panels, rounds, scoring.
- `game/src/scenes.js` — the three scenes, painted procedurally on canvas (no image assets).
- `game/src/differences.js` — the 7 differences per round and their exact spots.
- `game/src/state.js` — screens, rounds, scoring, timer, hints.
- `game/src/input.js` — mouse + keyboard.
- `game/src/render.js` — HUD, panels, markers, banners.
- `game/src/audio.js` — sound effects synthesized with WebAudio (no audio files).
- `game/src/shots.js` — deterministic screenshot staging (`?shot=play&found=4`).
- `vendor/makefun-game.ts` — the kit's library, unchanged.
