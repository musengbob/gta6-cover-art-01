// Canvas renderer: draws the whole cover — panels, grade, gradient
// title, neon subtitle and poster furniture — onto any canvas at any
// export size. The live preview and the exported PNG share this one
// code path, so what the user sees is exactly what ships.

import { LAYOUTS, GRADES, SAMPLES } from './state.js';

const GAP = 6; // white gutter between panels, in export pixels at 1080 wide

function sampleSrc(id) {
  const hit = SAMPLES.find((s) => s.id === id);
  return hit ? hit.src : SAMPLES[0].src;
}

// Cover-fit source rect for one image inside one panel, with the
// panel's zoom, pan and flip applied.
function coverRect(img, pw, ph, panel) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const panelRatio = pw / ph;
  let sw;
  let sh;
  if (imgRatio > panelRatio) {
    sh = img.naturalHeight;
    sw = sh * panelRatio;
  } else {
    sw = img.naturalWidth;
    sh = sw / panelRatio;
  }
  sw /= panel.zoom;
  sh /= panel.zoom;
  const maxX = img.naturalWidth - sw;
  const maxY = img.naturalHeight - sh;
  const sx = Math.max(0, Math.min(maxX, maxX * (0.5 + panel.panX)));
  const sy = Math.max(0, Math.min(maxY, maxY * (0.5 + panel.panY)));
  return { sx, sy, sw, sh };
}

function drawPanels(ctx, W, H, state, images) {
  const layout = LAYOUTS[state.layout];
  const gap = (GAP * W) / 1080;
  const grade = GRADES[state.grade];
  ctx.save();
  ctx.filter = grade.filter;
  layout.rects.forEach((rect, i) => {
    const panel = state.panels[i];
    const img = images.get(panel.custom ? `custom:${i}` : panel.sample);
    if (!img) return;
    const x = rect[0] * W + gap / 2;
    const y = rect[1] * H + gap / 2;
    const w = rect[2] * W - gap;
    const h = rect[3] * H - gap;
    const { sx, sy, sw, sh } = coverRect(img, w, h, panel);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    if (panel.flip) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }
    ctx.restore();
  });
  ctx.restore();
  // Warm/cool wash over the whole panel area.
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = grade.wash;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawHalftone(ctx, W, H, bandY, bandH) {
  const step = Math.max(7, W / 135);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for (let y = bandY; y < bandY + bandH; y += step) {
    for (let x = (Math.round(y / step) % 2) * step * 0.5; x < W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, step * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawVignette(ctx, W, H) {
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(10,0,20,0.42)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawFlare(ctx, W, H) {
  const fx = W * 0.82;
  const fy = H * 0.16;
  const r = W * 0.22;
  const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
  g.addColorStop(0, 'rgba(255,240,180,0.85)');
  g.addColorStop(0.25, 'rgba(255,180,90,0.35)');
  g.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = g;
  ctx.fillRect(fx - r, fy - r, r * 2, r * 2);
  ctx.restore();
}

let noiseTile = null;
function drawGrain(ctx, W, H) {
  if (!noiseTile) {
    noiseTile = document.createElement('canvas');
    noiseTile.width = 160;
    noiseTile.height = 160;
    const nctx = noiseTile.getContext('2d');
    const data = nctx.createImageData(160, 160);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data.data[i] = v;
      data.data[i + 1] = v;
      data.data[i + 2] = v;
      data.data[i + 3] = 14;
    }
    nctx.putImageData(data, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = ctx.createPattern(noiseTile, 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function starPath(ctx, cx, cy, points, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStarburst(ctx, W, H) {
  const cx = W * 0.88;
  const cy = H * 0.075;
  const outer = W * 0.062;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.22);
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = W * 0.012;
  ctx.shadowOffsetY = W * 0.004;
  starPath(ctx, 0, 0, 12, outer, outer * 0.78);
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.lineWidth = W * 0.003;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.round(W * 0.016)}px "Anton", sans-serif`;
  ctx.fillText('ORIGINAL', 0, -W * 0.014);
  ctx.fillText('COVER ART', 0, W * 0.006);
  ctx.font = `${Math.round(W * 0.011)}px "Bebas Neue", sans-serif`;
  ctx.fillText('★ ★ ★', 0, W * 0.026);
  ctx.restore();
}

function drawTitleBlock(ctx, W, H, state) {
  const u = W / 1080; // scale unit: 1 at 1080 wide
  const cx = W / 2;
  // The title block is anchored to the strip, not to the top: the title
  // size is capped by the cover height, and the stars and quote sit a
  // fixed step above the strip. That keeps the whole block on-canvas
  // in every aspect ratio — wide covers used to push the quote off the
  // bottom edge because the title scaled with width alone.
  const titleSize = Math.min(W * 0.128, H * 0.17);
  const quoteY = H * 0.925;
  const starY = quoteY - Math.min(W, H) * 0.03;
  const titleY = starY - titleSize * 0.68;
  const bandH = titleSize * 2.1;

  // Soft dark band so the title stays readable over any photo.
  const band = ctx.createLinearGradient(0, titleY - bandH * 0.62, 0, titleY + bandH * 0.42);
  band.addColorStop(0, 'rgba(0,0,0,0)');
  band.addColorStop(0.5, 'rgba(0,0,0,0.42)');
  band.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, titleY - bandH * 0.62, W, bandH);

  if (state.effects.halftone) {
    drawHalftone(ctx, W, H, titleY - bandH * 0.62, bandH);
  }

  // Neon pink script subtitle, floating just above the title.
  ctx.save();
  ctx.translate(cx, titleY - titleSize * 0.92);
  ctx.rotate(-0.035);
  ctx.font = `${Math.round(W * 0.052)}px "Pacifico", cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = 22 * u;
  ctx.lineWidth = 6 * u;
  ctx.strokeStyle = 'rgba(40,0,30,0.9)';
  ctx.strokeText(state.subtitle, 0, 0);
  ctx.fillStyle = '#ff7ac0';
  ctx.fillText(state.subtitle, 0, 0);
  ctx.restore();

  // The title: gradient fill, thick black outline, slight slant.
  ctx.save();
  ctx.translate(cx, titleY);
  ctx.rotate(-0.035);
  ctx.font = `${Math.round(titleSize)}px "Anton", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try {
    ctx.letterSpacing = `${Math.round(2 * u)}px`;
  } catch {
    // Older canvas builds ignore letterSpacing; spacing is cosmetic.
  }
  const grad = ctx.createLinearGradient(-W * 0.45, 0, W * 0.45, 0);
  grad.addColorStop(0, '#FFE259');
  grad.addColorStop(0.5, '#FF7A18');
  grad.addColorStop(1, '#FF2E88');
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 14 * u;
  ctx.shadowOffsetX = 7 * u;
  ctx.shadowOffsetY = 7 * u;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, W * 0.011);
  ctx.strokeStyle = '#0d0d0d';
  ctx.strokeText(state.title, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = grad;
  ctx.fillText(state.title, 0, 0);
  ctx.restore();

  // Five gold stars and the review quote, under the title. Both scale
  // with the shorter side so the stars never crowd the quote on wide.
  const starR = Math.min(W, H) * 0.016;
  ctx.save();
  ctx.fillStyle = '#ffd21f';
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1.5 * u;
  for (let i = 0; i < 5; i += 1) {
    const sx = cx + (i - 2) * starR * 2.6;
    starPath(ctx, sx, starY, 5, starR, starR * 0.45);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.font = `${Math.round(Math.min(W, H) * 0.024)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4 * u;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  const quote = `“${state.quote}” — THE COAST HERALD`;
  ctx.strokeText(quote, cx, quoteY);
  ctx.fillStyle = '#fff';
  ctx.fillText(quote, cx, quoteY);
  ctx.restore();
}

function drawPalm(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  // Trunk: a leaning curve.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -45, -6, -78);
  ctx.stroke();
  // Fronds: six drooping arcs from the crown.
  for (let i = 0; i < 6; i += 1) {
    const a = -Math.PI * (0.12 + i * 0.15);
    const ex = Math.cos(a) * 52;
    const ey = -78 + Math.sin(a) * 30 + 26;
    ctx.beginPath();
    ctx.moveTo(-6, -78);
    ctx.quadraticCurveTo(-6 + ex * 0.5, -78 - 26, -6 + ex, ey);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  const widths = [3, 1, 2, 1, 1, 3, 2, 2, 1, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2];
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111';
  let cx = x + w * 0.06;
  const unit = (w * 0.88) / widths.reduce((a, b) => a + b, 0);
  widths.forEach((bw, i) => {
    if (i % 2 === 0) ctx.fillRect(cx, y + h * 0.08, bw * unit, h * 0.68);
    cx += bw * unit;
  });
  ctx.font = `${Math.round(h * 0.16)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('8 901234 567890', x + w / 2, y + h * 0.94);
  ctx.restore();
}

function drawBottomStrip(ctx, W, H, state) {
  const stripH = H * 0.062;
  const y0 = H - stripH;
  const grad = ctx.createLinearGradient(0, y0, 0, H);
  grad.addColorStop(0, '#160a2e');
  grad.addColorStop(1, '#05020c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, y0, W, stripH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y0, W, Math.max(2, H * 0.002));

  // Palm silhouettes on the left.
  const palmScale = stripH / 84;
  drawPalm(ctx, W * 0.045, H - stripH * 0.08, palmScale * 0.9);
  drawPalm(ctx, W * 0.085, H - stripH * 0.08, palmScale * 0.62);
  drawPalm(ctx, W * 0.015, H - stripH * 0.08, palmScale * 0.55);

  // Tagline, centred.
  ctx.save();
  ctx.font = `${Math.round(stripH * 0.4)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(state.tagline, W * 0.5, y0 + stripH * 0.34);
  ctx.font = `${Math.round(stripH * 0.19)}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('CORAL COAST © 2026 SUNSET BAY STUDIOS • A FAN-MADE COVER MAKER • NOT AFFILIATED WITH ROCKSTAR GAMES', W * 0.5, y0 + stripH * 0.76);
  ctx.restore();

  // Barcode on the right.
  drawBarcode(ctx, W * 0.885, y0 + stripH * 0.12, W * 0.085, stripH * 0.76);
}

function drawSelection(ctx, W, H, state) {
  const layout = LAYOUTS[state.layout];
  const rect = layout.rects[state.selected];
  if (!rect) return;
  ctx.save();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = Math.max(3, W * 0.004);
  ctx.setLineDash([W * 0.014, W * 0.008]);
  ctx.strokeRect(rect[0] * W + 3, rect[1] * H + 3, rect[2] * W - 6, rect[3] * H - 6);
  ctx.restore();
}

// The single render path: preview and export both call this.
export function renderCover(ctx, W, H, state, images, { selection = false } = {}) {
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drawPanels(ctx, W, H, state, images);
  if (state.effects.flare) drawFlare(ctx, W, H);
  drawStarburst(ctx, W, H);
  drawTitleBlock(ctx, W, H, state);
  drawBottomStrip(ctx, W, H, state);
  if (state.effects.vignette) drawVignette(ctx, W, H);
  if (state.effects.grain) drawGrain(ctx, W, H);
  if (selection) drawSelection(ctx, W, H, state);
  ctx.restore();
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export async function loadSamples() {
  const images = new Map();
  await Promise.all(
    SAMPLES.map(async (s) => {
      images.set(s.id, await loadImage(s.src));
    }),
  );
  return images;
}

export { sampleSrc };
