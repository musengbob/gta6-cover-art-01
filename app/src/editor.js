// Editor wiring: boots the cover maker, binds every control to the
// shared state, and exports PNGs. The canvas is the preview — every
// change re-renders it through the same draw path the export uses.

import { SAMPLES, LAYOUTS, GRADES, EFFECTS, SIZES, defaultState } from './state.js';
import { renderCover, loadSamples, loadImage } from './draw.js';

const state = defaultState();
const images = new Map();

const stage = document.getElementById('stage');
const ctx = stage.getContext('2d');
const dropHint = document.getElementById('dropHint');
const exportStatus = document.getElementById('exportStatus');

function panelCount() {
  return LAYOUTS[state.layout].slots;
}

function render() {
  const size = SIZES[state.size];
  if (stage.width !== size.w || stage.height !== size.h) {
    stage.width = size.w;
    stage.height = size.h;
  }
  renderCover(ctx, size.w, size.h, state, images, { selection: true });
  document.getElementById('panelNumber').textContent = String(state.selected + 1);
}

function hitPanel(clientX, clientY) {
  const box = stage.getBoundingClientRect();
  const fx = (clientX - box.left) / box.width;
  const fy = (clientY - box.top) / box.height;
  const rects = LAYOUTS[state.layout].rects;
  for (let i = 0; i < rects.length; i += 1) {
    const [x, y, w, h] = rects[i];
    if (fx >= x && fx < x + w && fy >= y && fy < y + h) return i;
  }
  return -1;
}

function selectPanel(i) {
  if (i < 0 || i >= panelCount()) return;
  state.selected = i;
  syncPanelControls();
  render();
}

function syncPanelControls() {
  const panel = state.panels[state.selected];
  const zoom = document.getElementById('zoomSlider');
  const panX = document.getElementById('panXSlider');
  const panY = document.getElementById('panYSlider');
  zoom.value = panel.zoom;
  panX.value = panel.panX;
  panY.value = panel.panY;
  document.getElementById('zoomVal').textContent = `${panel.zoom.toFixed(2)}×`;
  document.getElementById('panXVal').textContent = panel.panX.toFixed(2);
  document.getElementById('panYVal').textContent = panel.panY.toFixed(2);
  document.querySelectorAll('.sample').forEach((el) => {
    const id = el.dataset.sample;
    el.classList.toggle('in-use', state.panels.some((p, i) => i < panelCount() && !p.custom && p.sample === id));
  });
}

function assignSample(sampleId) {
  const panel = state.panels[state.selected];
  panel.sample = sampleId;
  panel.custom = null;
  syncPanelControls();
  render();
}

async function assignFile(file, panelIndex) {
  if (!file || !file.type.startsWith('image/')) return;
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });
  const img = await loadImage(dataUrl);
  images.set(`custom:${panelIndex}`, img);
  const panel = state.panels[panelIndex];
  panel.custom = dataUrl;
  panel.zoom = 1;
  panel.panX = 0;
  panel.panY = 0;
  syncPanelControls();
  render();
}

function buildChips(containerId, entries, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  Object.entries(entries).forEach(([id, entry]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${id === current ? ' active' : ''}`;
    btn.textContent = entry.name;
    btn.addEventListener('click', () => {
      onPick(id);
      box.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
    });
    box.appendChild(btn);
  });
}

function buildEffects() {
  const box = document.getElementById('effectToggles');
  EFFECTS.forEach((effect) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = state.effects[effect.id];
    input.addEventListener('change', () => {
      state.effects[effect.id] = input.checked;
      render();
    });
    label.append(input, document.createTextNode(effect.name));
    box.appendChild(label);
  });
}

function buildSamples() {
  const row = document.getElementById('sampleRow');
  SAMPLES.forEach((sample) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sample';
    btn.dataset.sample = sample.id;
    btn.title = `Use “${sample.label}” in the selected panel`;
    const img = document.createElement('img');
    img.src = sample.src;
    img.alt = sample.label;
    const tag = document.createElement('span');
    tag.textContent = sample.label;
    btn.append(img, tag);
    btn.addEventListener('click', () => assignSample(sample.id));
    row.appendChild(btn);
  });
}

function bindCaptions() {
  const fields = [
    ['capTitle', 'title'],
    ['capSubtitle', 'subtitle'],
    ['capTagline', 'tagline'],
    ['capQuote', 'quote'],
  ];
  fields.forEach(([id, key]) => {
    document.getElementById(id).addEventListener('input', (event) => {
      state[key] = event.target.value;
      render();
    });
  });
}

function bindSliders() {
  const zoom = document.getElementById('zoomSlider');
  const panX = document.getElementById('panXSlider');
  const panY = document.getElementById('panYSlider');
  zoom.addEventListener('input', () => {
    state.panels[state.selected].zoom = Number(zoom.value);
    document.getElementById('zoomVal').textContent = `${Number(zoom.value).toFixed(2)}×`;
    render();
  });
  panX.addEventListener('input', () => {
    state.panels[state.selected].panX = Number(panX.value);
    document.getElementById('panXVal').textContent = Number(panX.value).toFixed(2);
    render();
  });
  panY.addEventListener('input', () => {
    state.panels[state.selected].panY = Number(panY.value);
    document.getElementById('panYVal').textContent = Number(panY.value).toFixed(2);
    render();
  });
  document.getElementById('flipBtn').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.flip = !panel.flip;
    render();
  });
  document.getElementById('resetPanelBtn').addEventListener('click', () => {
    const panel = state.panels[state.selected];
    panel.zoom = 1;
    panel.panX = 0;
    panel.panY = 0;
    panel.flip = false;
    syncPanelControls();
    render();
  });
}

function download(canvas, name) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      resolve();
    }, 'image/png');
  });
}

async function exportSize(sizeId) {
  const size = SIZES[sizeId];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  renderCover(off.getContext('2d'), size.w, size.h, state, images, { selection: false });
  const slug = state.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
  await download(off, `${slug}-${size.w}x${size.h}.png`);
}

function bindExport() {
  document.getElementById('exportCurrent').addEventListener('click', async () => {
    exportStatus.textContent = 'Rendering…';
    await exportSize(state.size);
    const size = SIZES[state.size];
    exportStatus.textContent = `Saved ${size.w}×${size.h} PNG.`;
  });
  document.getElementById('exportAll').addEventListener('click', async () => {
    exportStatus.textContent = 'Rendering all 3 sizes…';
    for (const sizeId of Object.keys(SIZES)) {
      // eslint-disable-next-line no-await-in-loop
      await exportSize(sizeId);
    }
    exportStatus.textContent = 'Saved all 3 sizes.';
  });
}

function bindStage() {
  stage.addEventListener('click', (event) => {
    selectPanel(hitPanel(event.clientX, event.clientY));
  });
  stage.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropHint.classList.add('show');
  });
  stage.addEventListener('dragleave', () => dropHint.classList.remove('show'));
  stage.addEventListener('drop', async (event) => {
    event.preventDefault();
    dropHint.classList.remove('show');
    const panelIndex = hitPanel(event.clientX, event.clientY);
    const file = event.dataTransfer.files[0];
    if (panelIndex >= 0 && file) await assignFile(file, panelIndex);
  });
  document.getElementById('uploadInput').addEventListener('change', async (event) => {
    await assignFile(event.target.files[0], state.selected);
    event.target.value = '';
  });
}

function bindSizeTabs() {
  document.querySelectorAll('.size-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.size = tab.dataset.size;
      document.querySelectorAll('.size-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      render();
    });
  });
}

async function boot() {
  buildChips('layoutChips', LAYOUTS, state.layout, (id) => {
    state.layout = id;
    if (state.selected >= panelCount()) state.selected = 0;
    syncPanelControls();
    render();
  });
  buildChips('gradeChips', GRADES, state.grade, (id) => {
    state.grade = id;
    render();
  });
  buildEffects();
  buildSamples();
  bindCaptions();
  bindSliders();
  bindExport();
  bindStage();
  bindSizeTabs();
  syncPanelControls();

  // Fonts first, so the first render already has the real title face.
  await Promise.all([
    document.fonts.load('100px "Anton"'),
    document.fonts.load('100px "Bebas Neue"'),
    document.fonts.load('100px "Pacifico"'),
    document.fonts.ready,
  ]);
  const loaded = await loadSamples();
  loaded.forEach((img, id) => images.set(id, img));
  render();
}

boot().catch((error) => {
  exportStatus.textContent = `Could not start the cover maker: ${error.message}`;
});
