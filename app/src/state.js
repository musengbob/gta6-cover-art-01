// Cover-maker state: the eleven sample photos, the seven layouts, the
// five grades, and the default cover — the Cast Seven formula that wins
// boards: seven DISTINCT faces, every panel tagged with a role plus a
// place/time/one-line sub-caption, a central hero that pops out of its
// frame, a striped retro-chrome title overlapping the hero, and full
// poster furniture. Nothing here touches the network.

export const SAMPLES = [
  { id: 'woman', src: 'samples/boulevard.jpg', label: 'Boulevard', face: { x: 0.5, y: 0.22 } },
  { id: 'boss', src: 'samples/boss.jpg', label: 'The Boss', face: { x: 0.5, y: 0.38 } },
  { id: 'rider', src: 'samples/rider.jpg', label: 'The Rider', face: { x: 0.42, y: 0.35 } },
  { id: 'mechanic', src: 'samples/mechanic.jpg', label: 'Mechanic', face: { x: 0.5, y: 0.35 } },
  { id: 'pier', src: 'samples/pier.jpg', label: 'Pier', face: { x: 0.42, y: 0.28 } },
  { id: 'lookout', src: 'samples/lookout.jpg', label: 'Lookout', face: { x: 0.55, y: 0.38 } },
  { id: 'wheelman', src: 'samples/wheelman.jpg', label: 'Wheelman', face: { x: 0.5, y: 0.35 } },
  { id: 'car', src: 'samples/car.jpg', label: 'Sports car', face: null },
  { id: 'coast', src: 'samples/coast.jpg', label: 'Coast road', face: null },
  { id: 'neon', src: 'samples/neon.jpg', label: 'Neon night', face: null },
  { id: 'boat', src: 'samples/boat.jpg', label: 'Speedboat', face: null },
];

// The cast: one role + one place/time/line per panel slot. The billing
// block in the bottom strip is computed from this list, so the poster
// always names the people on it.
export const CAST = [
  { role: 'THE DRIVER', sub: 'OCEAN DRIVE · 6:42 PM · LOOKING FOR TROUBLE' },
  { role: 'THE BOSS', sub: 'BISCAYNE BAY · 7:15 PM · HE OWNS THE HARBOR' },
  { role: 'THE RIDER', sub: 'COLLINS AVE · 11:48 PM · NEVER LOOKS BACK' },
  { role: 'THE MECHANIC', sub: 'LITTLE HAVANA · 9:03 AM · SHE BUILDS THE GETAWAY' },
  { role: 'THE CAPTAIN', sub: 'SUNSET PIER · 5:27 PM · KNOWS EVERY CURRENT' },
  { role: 'THE LOOKOUT', sub: 'DOWNTOWN ROOFTOP · 8:19 PM · SEES EVERYTHING COMING' },
  { role: 'THE WHEELMAN', sub: 'OCEAN DRIVE · 6:44 PM · FOOT DOWN, NO BRAKES' },
];

export function billingLines() {
  return [
    'A CORAL COAST PICTURE  •  STARRING THE DRIVER  •  THE BOSS  •  THE RIDER  •  THE MECHANIC',
    'THE CAPTAIN  •  THE LOOKOUT  •  THE WHEELMAN  •  SHOT ON YOUR OWN CAMERA  •  GRADED BY HAND',
  ];
}

// Panel rectangles are fractions of the cover: [x, y, width, height].
// Every layout keeps its panels distinct — no photo ever repeats.
export const LAYOUTS = {
  castseven: {
    name: 'Cast Seven',
    slots: 7,
    popoutHero: 0,
    castSeven: true,
    rects: [
      [0.3, 0.02, 0.4, 0.62],
      [0, 0, 0.3, 0.32],
      [0.7, 0, 0.3, 0.32],
      [0, 0.32, 0.3, 0.32],
      [0.7, 0.32, 0.3, 0.32],
      [0, 0.64, 0.3, 0.24],
      [0.7, 0.64, 0.3, 0.24],
    ],
  },
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

export function freshPanel(sampleId, castIndex) {
  const sample = SAMPLES.find((s) => s.id === sampleId);
  const face = sample ? sample.face : null;
  return {
    sample: sampleId,
    custom: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    flip: false,
    // Face-aware crop: the crop window centres on the face zone of the
    // photo instead of the middle of the frame, so a portrait never
    // comes out headless or neck-cropped. Scenery photos have no face
    // and keep the plain centre crop.
    faceAware: face !== null,
    focalX: face ? face.x : 0.5,
    focalY: face ? face.y : 0.5,
    cast: castIndex !== undefined && CAST[castIndex] ? CAST[castIndex] : null,
  };
}

export function defaultState() {
  return {
    layout: 'castseven',
    grade: 'vice',
    size: 'square',
    effects: { halftone: true, grain: true, vignette: true, flare: false },
    title: 'CORAL COAST',
    subtitle: 'Vice Nights',
    tagline: 'SEVEN LIVES · ONE HARBOR · NO WAY BACK',
    quote: 'A FEVER DREAM IN NEON',
    selected: 0,
    // Seven panels, seven different faces — the default never duplicates.
    panels: [
      freshPanel('woman', 0),
      freshPanel('boss', 1),
      freshPanel('rider', 2),
      freshPanel('mechanic', 3),
      freshPanel('pier', 4),
      freshPanel('lookout', 5),
      freshPanel('wheelman', 6),
    ],
  };
}
