/**
 * Procedural "photography" panels.
 *
 * The studio's real photography isn't available in this environment, so
 * every image slot below is an art-directed stand-in: a warm gradient
 * field, a single fine-line editorial motif, and a film-grain pass —
 * drawn once to a canvas and reused as a plain <canvas>, a CSS
 * background, or a Three.js CanvasTexture. Swap `drawPanel()` for real
 * photo drawing (or just point <img> tags at real files) to replace.
 */

export const PALETTES = [
  { name: 'ember',   stops: ['#c96a3a', '#8a3418', '#241713'] }, // oven glow
  { name: 'wheat',   stops: ['#e7d3ad', '#c79a5d', '#5c3a22'] }, // dough / crust
  { name: 'olive',   stops: ['#8a9068', '#4d5a34', '#232419'] }, // olive / basil
  { name: 'dusk',    stops: ['#caa98a', '#8a5a3c', '#2a1c14'] }, // interior warmth
  { name: 'stone',   stops: ['#efe6d6', '#c9bda6', '#6c604c'] }, // marble / flour
  { name: 'wine',    stops: ['#a24a3d', '#5e2420', '#1c1210'] }, // wine / tomato
  { name: 'night',   stops: ['#4a3a2e', '#241a15', '#0f0b09'] }, // road at night
];

// Single-stroke editorial line motifs, drawn in normalized 0..1 coords.
export const MOTIFS = {
  pizzaSlice(ctx, w, h) {
    const cx = w * 0.5, cy = h * 0.52, r = Math.min(w, h) * 0.34;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI / 4);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.stroke();
    // pepperoni dots
    const dots = [[-0.14, -0.55], [0.05, -0.4], [-0.02, -0.22], [0.18, -0.3]];
    dots.forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * r, cy + dy * r, r * 0.07, 0, Math.PI * 2);
      ctx.stroke();
    });
  },
  wheatSprig(ctx, w, h) {
    const x0 = w * 0.5, y0 = h * 0.82, y1 = h * 0.2;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(x0 + w * 0.04, h * 0.5, x0, y1);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const y = y0 + (y1 - y0) * t;
      const spread = (1 - t) * w * 0.09 + w * 0.02;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.quadraticCurveTo(x0 - spread * 0.4, y - h * 0.05, x0 - spread, y - h * 0.09);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.quadraticCurveTo(x0 + spread * 0.4, y - h * 0.05, x0 + spread, y - h * 0.09);
      ctx.stroke();
    }
  },
  flame(ctx, w, h) {
    const cx = w * 0.5, base = h * 0.86, top = h * 0.14;
    ctx.beginPath();
    ctx.moveTo(cx, base);
    ctx.bezierCurveTo(cx - w * 0.22, h * 0.6, cx + w * 0.16, h * 0.5, cx - w * 0.02, top);
    ctx.bezierCurveTo(cx + w * 0.02, h * 0.32, cx + w * 0.24, h * 0.42, cx + w * 0.02, base);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.02, h * 0.62);
    ctx.bezierCurveTo(cx - w * 0.1, h * 0.52, cx, h * 0.4, cx + w * 0.01, h * 0.3);
    ctx.stroke();
  },
  oliveBranch(ctx, w, h) {
    const x0 = w * 0.16, y0 = h * 0.78, x1 = w * 0.84, y1 = h * 0.22;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(w * 0.5, h * 0.42, x1, y1);
    ctx.stroke();
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * h * 0.06;
      const rx = h * 0.05, ry = h * 0.025;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.6 + t * 0.4);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.arc(x + rx * 1.6, y + ry * 2, h * 0.018, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  },
  ovenArch(ctx, w, h) {
    const cx = w * 0.5, floor = h * 0.78, r = w * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx - r, floor);
    ctx.lineTo(cx - r, h * 0.42);
    ctx.arc(cx, h * 0.42, r, Math.PI, 0);
    ctx.lineTo(cx + r, floor);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.62, floor);
    ctx.lineTo(cx - r * 0.62, h * 0.5);
    ctx.arc(cx, h * 0.5, r * 0.62, Math.PI, 0);
    ctx.lineTo(cx + r * 0.62, floor);
    ctx.stroke();
  },
  wineGlass(ctx, w, h) {
    const cx = w * 0.5;
    const bowlTop = h * 0.2, bowlBottom = h * 0.52, stemBottom = h * 0.82, r = w * 0.16;
    ctx.beginPath();
    ctx.moveTo(cx - r, bowlTop);
    ctx.bezierCurveTo(cx - r, bowlBottom, cx - r * 0.05, bowlBottom, cx - r * 0.05, bowlBottom + h * 0.02);
    ctx.lineTo(cx - r * 0.05, stemBottom - h * 0.06);
    ctx.moveTo(cx + r, bowlTop);
    ctx.bezierCurveTo(cx + r, bowlBottom, cx + r * 0.05, bowlBottom, cx + r * 0.05, bowlBottom + h * 0.02);
    ctx.lineTo(cx + r * 0.05, stemBottom - h * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.05, stemBottom - h * 0.06);
    ctx.lineTo(cx - r * 0.05, stemBottom);
    ctx.moveTo(cx + r * 0.05, stemBottom - h * 0.06);
    ctx.lineTo(cx + r * 0.05, stemBottom);
    ctx.moveTo(cx - r * 0.4, stemBottom);
    ctx.lineTo(cx + r * 0.4, stemBottom);
    ctx.stroke();
  },
  roadLine(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 1.05);
    ctx.lineTo(w * 0.5, h * -0.05);
    ctx.setLineDash([h * 0.06, h * 0.05]);
    ctx.stroke();
    ctx.setLineDash([]);
  },
};

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function hexToRgb(hex) {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/**
 * Draws one art-directed panel into a canvas 2D context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} w
 * @param {number} h
 * @param {{palette?: string, motif?: string, seed?: number, angle?: number}} opts
 */
export function drawPanel(ctx, w, h, opts = {}) {
  const palette = PALETTES.find((p) => p.name === opts.palette) || PALETTES[0];
  const motifFn = MOTIFS[opts.motif] || null;
  const seed = opts.seed ?? 1;
  const rnd = seededRandom(seed * 9973 + 17);
  const angle = opts.angle ?? rnd() * Math.PI * 2;

  // gradient field
  const cx = w / 2 + Math.cos(angle) * w * 0.25;
  const cy = h / 2 + Math.sin(angle) * h * 0.25;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.9);
  grad.addColorStop(0, palette.stops[0]);
  grad.addColorStop(0.55, palette.stops[1]);
  grad.addColorStop(1, palette.stops[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // soft secondary light
  const lgx = w * (0.2 + rnd() * 0.6);
  const lgy = h * (0.1 + rnd() * 0.3);
  const lg = ctx.createRadialGradient(lgx, lgy, 0, lgx, lgy, Math.max(w, h) * 0.6);
  lg.addColorStop(0, 'rgba(255,236,210,0.22)');
  lg.addColorStop(1, 'rgba(255,236,210,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 0, w, h);

  // vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.max(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  // motif (fine editorial line art)
  if (motifFn) {
    ctx.save();
    const pad = Math.min(w, h) * 0.16;
    ctx.translate(w * 0.5 + (rnd() - 0.5) * w * 0.12, 0);
    ctx.lineWidth = Math.max(1.2, Math.min(w, h) * 0.0026);
    ctx.strokeStyle = 'rgba(255,246,232,0.9)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = Math.min(w, h) * 0.01;
    ctx.translate(-w * 0.5, 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
    ctx.clip();
    motifFn(ctx, w, h);
    ctx.restore();
    ctx.restore();
  }

  // grain
  const gw = Math.max(48, Math.floor(w / 4));
  const gh = Math.max(48, Math.floor(h / 4));
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = gw;
  grainCanvas.height = gh;
  const gctx = grainCanvas.getContext('2d');
  const imgData = gctx.createImageData(gw, gh);
  const rnd2 = seededRandom(seed * 613 + 4);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 255 * rnd2();
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 26;
  }
  gctx.putImageData(imgData, 0, 0);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(grainCanvas, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

/**
 * Creates a canvas with a panel drawn at device-pixel-ratio-aware resolution.
 */
export function createPanelCanvas(cssW, cssH, opts = {}, dpr = Math.min(window.devicePixelRatio || 1, 2)) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(cssW * dpr));
  canvas.height = Math.max(2, Math.round(cssH * dpr));
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  drawPanel(ctx, cssW, cssH, opts);
  return canvas;
}

export { hexToRgb };
