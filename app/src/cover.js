// Sunset Panels — cover renderer. Pure canvas 2D, deterministic:
// same state + size always paints the same pixels (grain uses a seeded PRNG).
// A panel is { photo, zoom, panX, panY, flip }; state.photos holds Image objects.
// Layouts return panel rects as fractions of (w, h); diagonal uses clip paths.

export const LAYOUTS = ['hero', 'grid', 'strip3', 'diagonal', 'poster', 'comic5'];
export const GRADES = ['sunset', 'neon', 'golden', 'teal', 'noir'];

// Grade: [top overlay rgba, bottom overlay rgba, duotone tint]
const GRADE_DEF = {
  sunset: ['rgba(255,110,60,0.10)', 'rgba(190,30,120,0.42)', 'rgba(255,90,140,0.10)'],
  neon:   ['rgba(255,0,180,0.16)', 'rgba(0,220,255,0.30)', 'rgba(255,0,200,0.14)'],
  golden: ['rgba(255,190,60,0.14)', 'rgba(220,90,10,0.34)', 'rgba(255,170,40,0.12)'],
  teal:   ['rgba(0,220,200,0.12)', 'rgba(0,40,90,0.42)', 'rgba(0,200,220,0.10)'],
  noir:   ['rgba(120,120,130,0.10)', 'rgba(0,0,0,0.45)', 'rgba(90,90,110,0.16)'],
};

export function panelRects(layout, w, h) {
  const g = Math.max(4, Math.round(Math.min(w, h) * 0.008)); // gutter
  const R = (x, y, pw, ph) => ({ x, y, w: pw, h: ph });
  switch (layout) {
    case 'hero': {
      const lw = Math.round(w * 0.62);
      return [R(0, 0, lw - g, h),
        R(lw, 0, w - lw, Math.round(h / 3) - g),
        R(lw, Math.round(h / 3), w - lw, Math.round(h / 3) - g),
        R(lw, Math.round(2 * h / 3), w - lw, h - Math.round(2 * h / 3))];
    }
    case 'grid': {
      const hw = Math.round(w / 2), hh = Math.round(h / 2);
      return [R(0, 0, hw - g, hh - g), R(hw, 0, w - hw, hh - g),
        R(0, hh, hw - g, h - hh), R(hw, hh, w - hw, h - hh)];
    }
    case 'strip3': {
      const cw = Math.round(w / 3);
      return [R(0, 0, cw - g, h), R(cw, 0, cw - g, h), R(2 * cw, 0, w - 2 * cw, h)];
    }
    case 'diagonal': // two panels split on a diagonal; clip handled in drawPanel
      return [R(0, 0, w, h), R(0, 0, w, h)];
    case 'poster':
      return [R(0, 0, w, h)];
    case 'comic5': {
      const top = Math.round(h * 0.42), mid = Math.round(h * 0.30);
      const hw = Math.round(w / 2);
      return [R(0, 0, w, top - g),
        R(0, top, hw - g, mid - g), R(hw, top, w - hw, mid - g),
        R(0, top + mid, hw - g, h - top - mid), R(hw, top + mid, w - hw, h - top - mid)];
    }
    default: return [R(0, 0, w, h)];
  }
}

function seededRandom(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function drawPanelPhoto(ctx, img, rect, panel) {
  if (!img) return;
  const zoom = panel.zoom || 1, panX = panel.panX || 0, panY = panel.panY || 0;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const pw = iw * base, ph = ih * base;
  const cx = rect.x + rect.w / 2 + panX * rect.w * 0.25;
  const cy = rect.y + rect.h / 2 + panY * rect.h * 0.25;
  ctx.save();
  ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
  if (panel.flip) { ctx.translate(cx, cy); ctx.scale(-1, 1); ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph); }
  else ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
  ctx.restore();
}

function drawGrade(ctx, w, h, grade) {
  const [top, bottom, tint] = GRADE_DEF[grade] || GRADE_DEF.sunset;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, top); grad.addColorStop(1, bottom);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = tint; ctx.fillRect(0, 0, w, h);
}

function drawCaption(ctx, w, h, state) {
  const title = (state.title || '').trim().toUpperCase();
  const sub = (state.subtitle || '').trim();
  if (!title && !sub) return;
  const bottom = state.captionPos !== 'top';
  const bandH = Math.round(h * (state.layout === 'poster' ? 0.20 : 0.16));
  const bandY = bottom ? h - bandH : 0;
  ctx.fillStyle = bottom ? 'rgba(10,4,20,0.72)' : 'rgba(10,4,20,0.55)';
  ctx.fillRect(0, bandY, w, bandH);
  ctx.fillStyle = 'rgba(255,60,160,0.9)';
  ctx.fillRect(0, bottom ? bandY : bandY + bandH - 4, w, 4);
  const cx = w / 2;
  const ty = bottom ? bandY + bandH * 0.62 : bandY + bandH * 0.60;
  if (title) {
    let size = Math.min(bandH * 0.62, w * 0.11);
    const fam = '"Anton","Bebas Neue",sans-serif';
    ctx.font = `${size}px ${fam}`;
    while (ctx.measureText(title).width > w * 0.92 && size > 14) {
      size -= 2; ctx.font = `${size}px ${fam}`;
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    const style = state.lettering || 'outline';
    if (style === 'ribbon') {
      const tw = ctx.measureText(title).width;
      ctx.fillStyle = '#ff2e88';
      ctx.fillRect(cx - tw / 2 - 18, ty - size * 0.62, tw + 36, size * 1.24);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 6;
      ctx.fillText(title, cx, ty + 2);
      ctx.shadowBlur = 0;
    } else if (style === 'neon') {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = size * 0.45;
      ctx.fillText(title, cx, ty);
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = size * 0.18;
      ctx.fillText(title, cx, ty);
      ctx.shadowBlur = 0;
    } else { // outline
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.strokeStyle = '#12041f';
      ctx.strokeText(title, cx, ty);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = size * 0.14;
      ctx.fillText(title, cx, ty);
      ctx.shadowBlur = 0;
    }
  }
  if (sub) {
    const sy = bottom ? bandY + bandH * 0.88 : bandY + bandH * 0.86;
    ctx.font = `600 ${Math.max(12, Math.round(h * 0.022))}px "Archivo Black",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(sub.toUpperCase(), cx, sy);
  }
}

function drawEffects(ctx, w, h, fx, seed) {
  if (fx.vignette) {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  }
  if (fx.flare) {
    const f = ctx.createRadialGradient(w * 0.82, h * 0.12, 0, w * 0.82, h * 0.12, Math.min(w, h) * 0.45);
    f.addColorStop(0, 'rgba(255,240,180,0.85)'); f.addColorStop(0.25, 'rgba(255,150,80,0.35)');
    f.addColorStop(1, 'rgba(255,150,80,0)');
    ctx.fillStyle = f; ctx.fillRect(0, 0, w, h);
  }
  if (fx.halftone) {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    const step = Math.max(7, Math.round(Math.min(w, h) / 90));
    for (let y = h * 0.55; y < h; y += step)
      for (let x = (Math.round(y / step) % 2) * step / 2; x < w; x += step) {
        ctx.beginPath(); ctx.arc(x, y, step * 0.22, 0, Math.PI * 2); ctx.fill();
      }
  }
  if (fx.grain) {
    const rnd = seededRandom(seed);
    const n = Math.round(w * h / 900);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < n; i++) ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
  }
}

function drawDiagonal(ctx, w, h, photos, panels) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(0, h); ctx.closePath(); ctx.clip();
  drawPanelPhoto(ctx, photos[panels[0]?.photo ?? 0], { x: 0, y: 0, w, h }, panels[0] || {});
  ctx.restore();
  ctx.save();
  ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.clip();
  const img1 = photos[panels[1]?.photo ?? 1] || photos[0];
  drawPanelPhoto(ctx, img1, { x: 0, y: 0, w, h }, panels[1] || {});
  ctx.restore();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.beginPath(); ctx.moveTo(w, 0); ctx.lineTo(0, h); ctx.stroke();
}

export function drawCover(canvas, state, size) {
  const ctx = canvas.getContext('2d');
  const w = size?.w || canvas.width, h = size?.h || canvas.height;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const photos = state.photos || [];
  const panels = state.panels || [];
  ctx.fillStyle = '#160a24'; ctx.fillRect(0, 0, w, h);
  if (!photos.length) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#ff7a3d'); g.addColorStop(0.5, '#e83e8c'); g.addColorStop(1, '#4b1d8f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `600 ${Math.round(h * 0.03)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.fillText('LOAD A PHOTO — OR TAP "LOAD SAMPLE"', w / 2, h / 2);
  } else if (state.layout === 'diagonal') {
    drawDiagonal(ctx, w, h, photos, panels);
  } else {
    const rects = panelRects(state.layout || 'hero', w, h);
    rects.forEach((r, i) => {
      const p = panels[i] || { photo: i % photos.length, zoom: 1, panX: 0, panY: 0, flip: false };
      drawPanelPhoto(ctx, photos[p.photo ?? (i % photos.length)], r, p);
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(2, w * 0.002);
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    });
  }
  drawGrade(ctx, w, h, state.grade || 'sunset');
  drawEffects(ctx, w, h, state.effects || {}, 1234 + (state.title || '').length);
  drawCaption(ctx, w, h, state);
  return canvas;
}
