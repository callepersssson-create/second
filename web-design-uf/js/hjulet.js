import { createBlobScene, createWheelPageScene, createStarfield } from "./webgl.js";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Smooth scroll                                                       */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!prefersReduced && window.Lenis) {
  lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: 0 });
    } else {
      target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    }
  });
});

/* ------------------------------------------------------------------ */
/* Starfield + ambient blob + the wheel                                 */
/* ------------------------------------------------------------------ */
const starfield = createStarfield(document.getElementById("starfield"), {
  count: prefersReduced ? 90 : 170,
  reducedMotion: prefersReduced,
});
if (lenis) {
  lenis.on("scroll", () => starfield.setScrollY(window.scrollY));
} else {
  window.addEventListener("scroll", () => starfield.setScrollY(window.scrollY), { passive: true });
}

const ambientCanvas = document.getElementById("wheel-ambient-canvas");
const ambientScene = ambientCanvas
  ? createBlobScene(ambientCanvas, {
      colorA: "#0a0b14",
      colorB: "#11167a",
      colorC: "#7c6fff",
      seed: 3.3,
      mouseScope: "local",
    })
  : null;

const wheelCanvas = document.getElementById("wheel-canvas");
const wheelScene = wheelCanvas ? createWheelPageScene(wheelCanvas) : null;

/* ------------------------------------------------------------------ */
/* Boot                                                                 */
/* ------------------------------------------------------------------ */
function boot() {
  const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
  tl.to(".loader span", { yPercent: -120, duration: 0.6, ease: "power3.in" })
    .to(".loader", { autoAlpha: 0, duration: 0.5 }, "-=0.15")
    .add(() => document.body.classList.remove("is-loading"))
    .from(".nav", { yPercent: -100, autoAlpha: 0, duration: 0.9 }, "-=0.35")
    .from(".wheel-scroll-cue", { autoAlpha: 0, y: 14, duration: 0.7 }, "-=0.5")
    .from(".wheel-phrase.is-active", { autoAlpha: 0, y: 24, duration: 0.8 }, "-=0.5");
}

if (prefersReduced) {
  document.querySelector(".loader").style.display = "none";
  document.body.classList.remove("is-loading");
} else if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
  setTimeout(boot, 1800);
} else {
  boot();
}

/* ------------------------------------------------------------------ */
/* The wheel turn, driven by scroll                                     */
/* ------------------------------------------------------------------ */
const phrases = gsap.utils.toArray(".wheel-phrase");
const dots = gsap.utils.toArray(".wheel-progress__dot");

function setActive(index) {
  phrases.forEach((p, i) => p.classList.toggle("is-active", i === index));
  dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
}

if (!prefersReduced && wheelScene) {
  ScrollTrigger.create({
    trigger: ".wheel-hero",
    start: "top top",
    end: () => "+=" + window.innerHeight * 3,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      wheelScene.setProgress(self.progress);
      setActive(Math.min(3, Math.floor(self.progress * 4)));
    },
  });
} else if (wheelScene) {
  wheelScene.setProgress(0.1);
  phrases.forEach((p) => {
    p.style.position = "relative";
    p.style.opacity = 1;
    p.style.transform = "none";
    p.style.margin = "2.5rem 0";
  });
  document.querySelector(".wheel-hero").style.height = "auto";
  document.querySelector(".wheel-hero").style.padding = "8rem 0";
  document.querySelector(".wheel-progress").style.display = "none";
}

document.getElementById("back-to-top").addEventListener("click", () => {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
});

window.addEventListener("beforeunload", () => {
  starfield.destroy();
  if (ambientScene) ambientScene.destroy();
  if (wheelScene) wheelScene.destroy();
});
