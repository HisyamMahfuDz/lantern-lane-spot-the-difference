// Lantern Lane — deterministic random numbers (mulberry32).
// Every scene is laid out from a fixed seed, so the same round always
// paints the same picture: screenshots stay reproducible run after run.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A small helper: n values in [min, max) from a seeded stream.
export function seededRange(rng, min, max, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(min + rng() * (max - min));
  return out;
}
