// Sunset Panels — editor wiring. Photos stay in the browser (FileReader /
// object URLs, never uploaded). State is a plain object; every control change
// redraws the live preview. Export renders an offscreen canvas at exact size.
import { drawCover, panelRects, LAYOUTS, GRADES } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const SIZES = { square: { w: 1080, h: 1080 }, portrait: { w: 1080, h: 1350 }, wide: { w: 1920, h: 1080 } };

const state = {
  layout: 'hero', grade: 'sunset',
  title: 'SUNSET PANELS', subtitle: 'VICE CITY • 2026',
  captionPos: 'bottom', lettering: 'outline',
  effects: { halftone: true, grain: true, vignette: true, flare: true },
  photos: [],           // Image objects, up to 4
  panels: [],           // per-panel { photo, zoom, panX, panY, flip }
  previewSize: 'wide',  // preview aspect follows export size picker
};

function defaultPanels() {
  const n = panelRects(state.layout, 100, 100).length;
  const out = [];
  for (let i = 0; i < n; i++) out.push({ photo: i % Math.max(1, state.photos.length), zoom: 1, panX: 0, panY: 0, flip: false });
  return out;
}

function render() {
  if (!state.panels.length) state.panels = defaultPanels();
  const s = SIZES[state.previewSize] || SIZES.wide;
  drawCover(canvas, state, { w: Math.min(s.w, 1280), h: Math.round(Math.min(s.w, 1280) * s.h / s.w) });
  $('status').textContent = `${state.photos.length} photo(s) · ${state.layout} · ${state.grade} grade`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function addPhoto(src) {
  if (state.photos.length >= 4) { $('status').textContent = 'Max 4 photos — remove one first.'; return; }
  const img = await loadImage(src);
  state.photos.push(img);
  state.panels = defaultPanels();
  render();
}

async function loadSamples() {
  state.photos = [];
  for (const f of ['samples/boulevard.jpg', 'samples/pier.jpg']) {
    try { state.photos.push(await loadImage(f)); } catch { /* sample missing: keep going */ }
  }
  state.panels = defaultPanels();
  render();
}

function exportPNG(sizeKey) {
  const s = SIZES[sizeKey];
  const off = document.createElement('canvas');
  drawCover(off, state, s);
  off.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${s.w}x${s.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    $('status').textContent = `Exported cover-${s.w}x${s.h}.png`;
  }, 'image/png');
}

function surprise() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  state.layout = pick(LAYOUTS);
  state.grade = pick(GRADES);
  state.lettering = pick(['outline', 'neon', 'ribbon']);
  state.captionPos = Math.random() < 0.5 ? 'top' : 'bottom';
  const titles = ['SUNSET PANELS', 'NEON DRIVE', 'VICE NIGHTS', 'PALM HEIST', 'GOLDEN HOUR'];
  state.title = pick(titles);
  $('title').value = state.title;
  $('layout').value = state.layout; $('grade').value = state.grade;
  $('lettering').value = state.lettering; $('captionPos').value = state.captionPos;
  state.panels = defaultPanels();
  render();
}

// ---- controls ----
function bind() {
  $('layout').addEventListener('change', (e) => { state.layout = e.target.value; state.panels = defaultPanels(); render(); });
  $('grade').addEventListener('change', (e) => { state.grade = e.target.value; render(); });
  $('lettering').addEventListener('change', (e) => { state.lettering = e.target.value; render(); });
  $('captionPos').addEventListener('change', (e) => { state.captionPos = e.target.value; render(); });
  $('title').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('previewSize').addEventListener('change', (e) => { state.previewSize = e.target.value; render(); });
  for (const k of ['halftone', 'grain', 'vignette', 'flare'])
    $(`fx-${k}`).addEventListener('change', (e) => { state.effects[k] = e.target.checked; render(); });
  $('surprise').addEventListener('click', surprise);
  $('loadSample').addEventListener('click', loadSamples);
  $('clearPhotos').addEventListener('click', () => { state.photos = []; state.panels = defaultPanels(); render(); });
  $('exportSquare').addEventListener('click', () => exportPNG('square'));
  $('exportPortrait').addEventListener('click', () => exportPNG('portrait'));
  $('exportWide').addEventListener('click', () => exportPNG('wide'));
  $('exportAll').addEventListener('click', () => { exportPNG('square'); exportPNG('portrait'); exportPNG('wide'); });

  // photo slots: file inputs 1-4
  document.querySelectorAll('input[data-slot]').forEach((input) => {
    input.addEventListener('change', async () => {
      const f = input.files?.[0]; if (!f) return;
      await addPhoto(URL.createObjectURL(f));
    });
  });
  // per-panel controls (selected panel)
  $('panelSelect').addEventListener('change', (e) => syncPanelControls(+e.target.value));
  $('panelPhoto').addEventListener('change', (e) => { panel().photo = +e.target.value; render(); });
  $('panelZoom').addEventListener('input', (e) => { panel().zoom = +e.target.value; render(); });
  $('panelPanX').addEventListener('input', (e) => { panel().panX = +e.target.value; render(); });
  $('panelPanY').addEventListener('input', (e) => { panel().panY = +e.target.value; render(); });
  $('panelFlip').addEventListener('click', () => { panel().flip = !panel().flip; render(); });

  // drag-drop a photo file onto the preview: drops into the panel under the cursor
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', async (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0]; if (!f || !f.type.startsWith('image/')) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * canvas.width;
    const y = (e.clientY - r.top) / r.height * canvas.height;
    await addPhoto(URL.createObjectURL(f));
    const rects = panelRects(state.layout, canvas.width, canvas.height);
    const hit = rects.findIndex((rc) => x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h);
    if (hit >= 0) { state.panels[hit].photo = state.photos.length - 1; render(); }
  });
}

function panel() {
  const i = +$('panelSelect').value || 0;
  if (!state.panels[i]) state.panels[i] = { photo: 0, zoom: 1, panX: 0, panY: 0, flip: false };
  return state.panels[i];
}

function syncPanelControls(i) {
  const p = state.panels[i] || { photo: 0, zoom: 1, panX: 0, panY: 0, flip: false };
  $('panelPhoto').value = String(p.photo ?? 0);
  $('panelZoom').value = String(p.zoom ?? 1);
  $('panelPanX').value = String(p.panX ?? 0);
  $('panelPanY').value = String(p.panY ?? 0);
}

// expose for shots.js scenes
window.__panels = { loadSamples, addPhoto, render, state, setTitle: (t) => { state.title = t; $('title').value = t; } };

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
bind();
render();
if (shot) {
  await runShot(shot, query, { loadSamples, addPhoto, render, state });
  await document.fonts.ready;
  render();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
} else {
  loadSamples();
}
