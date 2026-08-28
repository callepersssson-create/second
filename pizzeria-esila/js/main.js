import { createPanelCanvas } from './panels.js';
import { initHeroScene } from './scene-hero.js';
import { initGalleryDistortion } from './scene-gallery.js';
import { initMotion, initBookingForm } from './motion.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduced-motion', reducedMotion);

/* ---- static panels: about/chef portrait ---- */
function paintStaticPanels() {
  document.querySelectorAll('canvas[data-static-panel]').forEach((canvas) => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(rect.width, canvas.parentElement.clientWidth, 320);
    const h = Math.max(rect.height, canvas.parentElement.clientHeight, 320);
    const painted = createPanelCanvas(w, h, {
      palette: canvas.dataset.palette,
      motif: canvas.dataset.motif,
      seed: Number(canvas.dataset.seed || 1),
    });
    const ctx = canvas.getContext('2d');
    canvas.width = painted.width;
    canvas.height = painted.height;
    ctx.drawImage(painted, 0, 0);
  });
}
paintStaticPanels();
window.addEventListener('resize', () => {
  clearTimeout(window.__panelResize);
  window.__panelResize = setTimeout(paintStaticPanels, 200);
});

/* ---- hero WebGL scene ---- */
let heroScene = null;
const heroCanvas = document.querySelector('.hero-canvas');
if (heroCanvas) {
  try {
    heroScene = initHeroScene(heroCanvas, { reducedMotion });
  } catch (e) {
    heroCanvas.closest('.hero').style.background =
      'radial-gradient(120% 90% at 50% 20%, #6b3620 0%, #241713 70%)';
  }
}

/* ---- gallery hover distortion ---- */
initGalleryDistortion(Array.from(document.querySelectorAll('.g-item')), { reducedMotion });

/* ---- scroll motion ---- */
initMotion({ reducedMotion, heroScene });

/* ---- booking form ---- */
initBookingForm();

/* ---- current year in footer ---- */
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();
