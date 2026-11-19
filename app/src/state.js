// Cover-maker state: the six sample photos, the six layouts, the five
// grades, and the default cover — the Key Art formula that wins boards:
// six DISTINCT panels, a gradient title overlapping the art, and full
// poster furniture. Nothing here touches the network.

export const SAMPLES = [
  { id: 'woman', src: 'samples/boulevard.jpg', label: 'Boulevard' },
  { id: 'pier', src: 'samples/pier.jpg', label: 'Pier' },
  { id: 'car', src: 'samples/car.jpg', label: 'Sports car' },
  { id: 'coast', src: 'samples/coast.jpg', label: 'Coast road' },
  { id: 'neon', src: 'samples/neon.jpg', label: 'Neon night' },
  { id: 'boat', src: 'samples/boat.jpg', label: 'Speedboat' },
];

// Panel rectangles are fractions of the cover: [x, y, width, height].
// Every layout keeps its panels distinct — no photo ever repeats.
export const LAYOUTS = {
  keyart: {
    name: 'Key Art',
    slots: 6,
    rects: [
      [0, 0, 0.55, 1],
      [0.55, 0, 0.45, 0.2],
      [0.55, 0.2, 0.45, 0.2],
      [0.55, 0.4, 0.45, 0.2],
      [0.55, 0.6, 0.45, 0.2],
      [0.55, 0.8, 0.45, 0.2],
    ],
  },
  herostrip: {
    name: 'Hero + Strip',
    slots: 6,
    rects: [
      [0, 0, 1, 0.62],
      [0, 0.62, 0.2, 0.38],
      [0.2, 0.62, 0.2, 0.38],
      [0.4, 0.62, 0.2, 0.38],
      [0.6, 0.62, 0.2, 0.38],
      [0.8, 0.62, 0.2, 0.38],
    ],
  },
  grid: {
    name: '2×2 Grid',
    slots: 4,
    rects: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
  columns: {
    name: '3-Column',
    slots: 3,
    rects: [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ],
  },
  comic: {
    name: 'Comic 5-Panel',
    slots: 5,
    rects: [
      [0, 0, 0.5, 0.38],
      [0.5, 0, 0.5, 0.38],
      [0, 0.38, 1, 0.26],
      [0, 0.64, 0.5, 0.36],
      [0.5, 0.64, 0.5, 0.36],
    ],
  },
  fullbleed: {
    name: 'Full-Bleed',
    slots: 1,
    rects: [[0, 0, 1, 1]],
  },
};

// ctx.filter strings plus a warm/cool wash laid over the panels.
export const GRADES = {
  vice: {
    name: 'Vice Sunset',
    filter: 'saturate(1.35) contrast(1.15) brightness(1.03)',
    wash: 'rgba(255,110,40,0.10)',
  },
  neon: {
    name: 'Neon Night',
    filter: 'saturate(1.5) contrast(1.2) brightness(0.95)',
    wash: 'rgba(255,0,128,0.09)',
  },
  golden: {
    name: 'Golden Hour',
    filter: 'saturate(1.25) contrast(1.08) brightness(1.06)',
    wash: 'rgba(255,180,60,0.12)',
  },
  noir: {
    name: 'Miami Noir',
    filter: 'saturate(0.7) contrast(1.25) brightness(0.9)',
    wash: 'rgba(10,10,40,0.10)',
  },
  pastel: {
    name: 'Pastel Dawn',
    filter: 'saturate(1.1) contrast(0.95) brightness(1.08)',
    wash: 'rgba(255,200,220,0.10)',
  },
};

export const EFFECTS = [
  { id: 'halftone', name: 'Halftone dots' },
  { id: 'grain', name: 'Film grain' },
  { id: 'vignette', name: 'Vignette' },
  { id: 'flare', name: 'Sun flare' },
];

export const SIZES = {
  square: { name: 'Square', w: 1080, h: 1080 },
  portrait: { name: 'Portrait', w: 1080, h: 1350 },
  wide: { name: 'Wide', w: 1920, h: 1080 },
};

export function freshPanel(sampleId) {
  return { sample: sampleId, custom: null, zoom: 1, panX: 0, panY: 0, flip: false };
}

export function defaultState() {
  return {
    layout: 'keyart',
    grade: 'vice',
    size: 'square',
    effects: { halftone: true, grain: true, vignette: true, flare: false },
    title: 'CORAL COAST',
    subtitle: 'Vice Nights',
    tagline: 'ONE COAST • NO RULES • COMING SOON',
    quote: 'A FEVER DREAM IN NEON',
    selected: 0,
    // Six panels, six different photos — the default never duplicates.
    panels: [
      freshPanel('woman'),
      freshPanel('pier'),
      freshPanel('car'),
      freshPanel('coast'),
      freshPanel('neon'),
      freshPanel('boat'),
    ],
  };
}
