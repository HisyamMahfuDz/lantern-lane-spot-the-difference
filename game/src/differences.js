// Lantern Lane — the differences: 7 per round, in panel space (600x560).
// Each entry is the exact spot the painter changes between the two panels:
// the left panel always shows the base scene, the right panel the changed one.
// x/y is the centre of the change, r the click radius the game accepts.
export const DIFFS = {
  market: [
    { id: 'moon', x: 88, y: 66, r: 28, name: 'Bulan sabit jadi purnama' },
    { id: 'lantern', x: 300, y: 148, r: 22, name: 'Lentera tengah berubah warna' },
    { id: 'cat', x: 498, y: 428, r: 26, name: 'Kucing di atas peti hilang' },
    { id: 'balloon', x: 150, y: 296, r: 22, name: 'Satu balon hilang' },
    { id: 'flag', x: 430, y: 96, r: 16, name: 'Satu bendera hilang' },
    { id: 'wheel', x: 118, y: 528, r: 24, name: 'Roda depan sepeda hilang' },
    { id: 'kite', x: 520, y: 116, r: 22, name: 'Ekor layang-layang hilang' },
  ],
  garden: [
    { id: 'frog', x: 420, y: 398, r: 26, name: 'Katak di atas daun teratai hilang' },
    { id: 'lotus', x: 200, y: 378, r: 24, name: 'Bunga teratai berubah warna' },
    { id: 'flame', x: 520, y: 198, r: 22, name: 'Api lentera batu padam' },
    { id: 'dragonfly', x: 320, y: 128, r: 18, name: 'Satu capung hilang' },
    { id: 'pad', x: 120, y: 470, r: 24, name: 'Satu daun teratai hilang' },
    { id: 'branch', x: 92, y: 180, r: 22, name: 'Satu dahan willow hilang' },
    { id: 'reflection', x: 300, y: 500, r: 20, name: 'Pantulan bulan di kolam hilang' },
  ],
  pier: [
    { id: 'beam', x: 556, y: 118, r: 26, name: 'Sinar mercusuar padam' },
    { id: 'gull', x: 250, y: 88, r: 18, name: 'Satu burung camar hilang' },
    { id: 'sail', x: 180, y: 328, r: 28, name: 'Layar perahu berubah warna' },
    { id: 'fish', x: 400, y: 428, r: 20, name: 'Ikan yang melompat hilang' },
    { id: 'buoy', x: 480, y: 478, r: 20, name: 'Pelampung berubah warna' },
    { id: 'postflag', x: 92, y: 258, r: 18, name: 'Bendera di tiang dermaga hilang' },
    { id: 'crate', x: 540, y: 468, r: 24, name: 'Satu peti di dermaga hilang' },
  ],
};

// Look a difference up by id within its round.
export function diffOf(roundId, id) {
  return DIFFS[roundId].find((d) => d.id === id);
}
