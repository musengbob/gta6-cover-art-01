// Fixed scenes for screenshots. Each scene loads the bundled sample photos,
// picks a layout/grade/caption, renders, then sets window.__shotReady.
//  shot=cover    — 1920x1080 exported-style cover, hero layout, both samples
//  shot=editor   — the editor with photos loaded (default page)
//  shot=portrait — 1080x1350 cover, comic 5-panel, neon grade
//  shot=square   — 1080x1080 cover, 2x2 grid, golden grade
export async function runShot(shot, query, api) {
  const { loadSamples, render, state } = api;
  await loadSamples();
  if (shot === 'cover' || shot === 'wide') {
    document.body.classList.add('shot-cover');
    state.layout = 'hero'; state.grade = 'sunset'; state.lettering = 'outline';
    state.title = 'SUNSET PANELS'; state.subtitle = 'VICE CITY • 2026';
    state.captionPos = 'bottom';
    state.effects = { halftone: true, grain: true, vignette: true, flare: true };
    state.previewSize = 'wide';
  } else if (shot === 'portrait') {
    document.body.classList.add('shot-cover');
    state.layout = 'comic5'; state.grade = 'neon'; state.lettering = 'neon';
    state.title = 'NEON DRIVE'; state.subtitle = 'VICE CITY • AFTER DARK';
    state.captionPos = 'bottom';
    state.effects = { halftone: true, grain: true, vignette: true, flare: false };
    state.previewSize = 'portrait';
  } else if (shot === 'square') {
    document.body.classList.add('shot-cover');
    state.layout = 'grid'; state.grade = 'golden'; state.lettering = 'ribbon';
    state.title = 'GOLDEN HOUR'; state.subtitle = 'PALMS • PIER • BOULEVARD';
    state.captionPos = 'top';
    state.effects = { halftone: false, grain: true, vignette: true, flare: true };
    state.previewSize = 'square';
  } else if (shot === 'editor') {
    state.layout = 'hero'; state.grade = 'sunset'; state.lettering = 'outline';
    state.title = 'SUNSET PANELS'; state.subtitle = 'VICE CITY • 2026';
  }
  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.value = state.title;
  const subEl = document.getElementById('subtitle');
  if (subEl) subEl.value = state.subtitle;
  render();
}
