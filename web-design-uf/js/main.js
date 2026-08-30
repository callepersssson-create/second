import { createBlobScene, createStudioScene, createTileScene, createStarfield, createGemScene, createTreeScene } from "./webgl.js";
import * as THREE from "../vendor/three.module.min.js";

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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
/* Custom cursor                                                       */
/* ------------------------------------------------------------------ */
if (supportsHover && !prefersReduced) {
  document.body.classList.add("has-custom-cursor");
  const dot = document.querySelector(".cursor--dot");
  const ring = document.querySelector(".cursor--ring");
  const moveDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
  const moveDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
  const moveRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
  const moveRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

  window.addEventListener(
    "pointermove",
    (e) => {
      moveDotX(e.clientX);
      moveDotY(e.clientY);
      moveRingX(e.clientX);
      moveRingY(e.clientY);
    },
    { passive: true }
  );

  document.querySelectorAll("a, button, .tile").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.classList.add("is-active");
      ring.classList.add("is-active");
    });
    el.addEventListener("mouseleave", () => {
      dot.classList.remove("is-active");
      ring.classList.remove("is-active");
    });
  });
}

/* ------------------------------------------------------------------ */
/* Starfield — the ambient layer that ties every section to one deep,  */
/* quiet atmosphere.                                                    */
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

/* ------------------------------------------------------------------ */
/* WebGL scenes                                                        */
/* ------------------------------------------------------------------ */
const heroScene = createBlobScene(document.getElementById("hero-canvas"), {
  colorA: "#0a0b14",
  colorB: "#1e2de0",
  colorC: "#7c6fff",
  seed: 0.4,
  mouseScope: "global",
});

const ctaScene = createBlobScene(document.getElementById("cta-canvas"), {
  colorA: "#1e2de0",
  colorB: "#11167a",
  colorC: "#8fa3ff",
  seed: 2.1,
  mouseScope: "global",
});

const manifestoCanvas = document.getElementById("manifesto-canvas");
const manifestoScene = manifestoCanvas
  ? createBlobScene(manifestoCanvas, {
      colorA: "#0a0b14",
      colorB: "#11167a",
      colorC: "#7c6fff",
      seed: 1.6,
      mouseScope: "local",
    })
  : null;

const supportCanvas = document.getElementById("support-canvas");
const supportScene = supportCanvas
  ? createBlobScene(supportCanvas, {
      colorA: "#0a0b14",
      colorB: "#1e2de0",
      colorC: "#7c6fff",
      seed: 4.6,
      mouseScope: "local",
    })
  : null;

const teamCanvas = document.getElementById("team-canvas");
const teamScene = teamCanvas
  ? createBlobScene(teamCanvas, {
      colorA: "#0a0b14",
      colorB: "#1e2de0",
      colorC: "#7c6fff",
      seed: 7.3,
      mouseScope: "local",
    })
  : null;

const testimonialsCanvas = document.getElementById("testimonials-canvas");
const testimonialsScene = testimonialsCanvas
  ? createBlobScene(testimonialsCanvas, {
      colorA: "#0a0b14",
      colorB: "#7c6fff",
      colorC: "#1e2de0",
      seed: 9.2,
      mouseScope: "local",
    })
  : null;

const studioCanvas = document.getElementById("studio-canvas");
const studioScene = studioCanvas ? createStudioScene(studioCanvas) : null;

const heroGemCanvas = document.getElementById("hero-gem-canvas");
const heroGemScene = heroGemCanvas
  ? createGemScene(heroGemCanvas, {
      geometry: new THREE.IcosahedronGeometry(1.4, 4),
      colorA: "#11167a",
      colorB: "#1e2de0",
      colorC: "#a9b8ff",
      rotSpeedX: 0.12,
      rotSpeedY: 0.18,
      floatAmp: 0.18,
    })
  : null;

const ctaGemCanvas = document.getElementById("cta-gem-canvas");
const ctaGemScene = ctaGemCanvas
  ? createGemScene(ctaGemCanvas, {
      geometry: new THREE.TorusGeometry(1.15, 0.32, 48, 128),
      colorA: "#1e2de0",
      colorB: "#11167a",
      colorC: "#7c6fff",
      rotSpeedX: 0.2,
      rotSpeedY: 0.14,
      floatAmp: 0.14,
    })
  : null;

const treeCanvas = document.getElementById("tree-canvas");
const treeCaption = document.getElementById("tree-caption");
const treeDataEl = document.getElementById("tree-data");
let treeScene = null;
if (treeCanvas && treeCaption && treeDataEl) {
  const projects = JSON.parse(treeDataEl.textContent);
  const renderCaption = (project) => {
    if (!project) {
      treeCaption.classList.remove("is-active");
      return;
    }
    treeCaption.classList.add("is-active");
    treeCaption.querySelector(".tree-caption__date").textContent = project.dateLabel;
    treeCaption.querySelector(".tree-caption__name").textContent = project.name;
    treeCaption.querySelector(".tree-caption__tag").textContent = project.tag;
    const link = treeCaption.querySelector(".tree-caption__link");
    if (project.href) {
      link.href = project.href;
      link.target = project.href.startsWith("#") ? "_self" : "_blank";
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  };
  renderCaption(projects[0]);
  treeScene = createTreeScene(treeCanvas, projects, { onActive: (project) => renderCaption(project || projects[0]) });

  treeCaption.querySelector(".tree-caption__link").addEventListener("click", (e) => {
    const href = e.currentTarget.getAttribute("href") || "";
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  });
}

const tileScenes = [];
document.querySelectorAll(".tile").forEach((tile) => {
  const canvas = tile.querySelector(".tile__canvas");
  const scene = createTileScene(canvas, tile.dataset.hue);
  tileScenes.push(scene);

  tile.addEventListener("pointerenter", () => {
    gsap.to({ v: 0 }, { v: 1, duration: 0.5, ease: "power2.out", onUpdate() {
      scene.setHover(this.targets()[0].v);
    } });
  });
  tile.addEventListener("pointermove", (e) => {
    const rect = tile.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    scene.setHoverPoint(x, y);
    if (supportsHover && !prefersReduced) {
      gsap.to(tile, {
        rotateX: (0.5 - y) * 10,
        rotateY: (x - 0.5) * -10,
        transformPerspective: 700,
        duration: 0.4,
        ease: "power3.out",
      });
    }
  });
  tile.addEventListener("pointerleave", () => {
    gsap.to({ v: 1 }, { v: 0, duration: 0.6, ease: "power2.out", onUpdate() {
      scene.setHover(this.targets()[0].v);
    } });
    gsap.to(tile, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
  });
});

/* ------------------------------------------------------------------ */
/* 3D tilt on the team and testimonial cards                            */
/* ------------------------------------------------------------------ */
if (supportsHover && !prefersReduced) {
  document.querySelectorAll(".member, .t-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      gsap.to(card, {
        rotateX: (0.5 - y) * 8,
        rotateY: (x - 0.5) * -8,
        scale: 1.015,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power3.out",
      });
    });
    card.addEventListener("pointerleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: "power3.out" });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Boot sequence                                                       */
/* ------------------------------------------------------------------ */
function boot() {
  gsap.set(".hero__headline .line span", { yPercent: 115 });

  const tl = gsap.timeline({
    defaults: { ease: "power4.out" },
    onComplete: () => ScrollTrigger.refresh(),
  });

  tl.to(".loader span", { yPercent: -120, duration: 0.6, ease: "power3.in" })
    .to(".loader", { autoAlpha: 0, duration: 0.5 }, "-=0.15")
    .add(() => {
      document.body.classList.remove("is-loading");
    })
    .from(".nav", { yPercent: -100, autoAlpha: 0, duration: 0.9 }, "-=0.35")
    .to(".hero__headline .line span", { yPercent: 0, duration: 1.15, stagger: 0.12 }, "-=0.55")
    .from(".hero__eyebrow", { autoAlpha: 0, y: 14, duration: 0.7 }, "-=1.0")
    .from(".hero__sub", { autoAlpha: 0, y: 14, duration: 0.7 }, "-=0.85")
    .from(".hero__actions", { autoAlpha: 0, y: 14, duration: 0.7 }, "-=0.75")
    .from(".marquee", { autoAlpha: 0, duration: 0.6 }, "-=0.5");
}

if (prefersReduced) {
  document.querySelector(".loader").style.display = "none";
  document.body.classList.remove("is-loading");
  gsap.set(".hero__headline .line span", { yPercent: 0 });
} else if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
  setTimeout(boot, 1800); // fallback in case font-loading stalls
} else {
  boot();
}

/* ------------------------------------------------------------------ */
/* Scroll-triggered reveals                                             */
/* ------------------------------------------------------------------ */
gsap.utils.toArray("[data-reveal]").forEach((el) => {
  gsap.to(el, {
    clipPath: "inset(0 0 0% 0)",
    duration: 1.2,
    ease: "power4.out",
    scrollTrigger: { trigger: el, start: "top 88%" },
  });
});

gsap.utils.toArray(".stat").forEach((el, i) => {
  gsap.from(el, {
    y: 24,
    autoAlpha: 0,
    duration: 0.8,
    ease: "power3.out",
    delay: i * 0.05,
    scrollTrigger: { trigger: ".manifesto__stats", start: "top 85%" },
  });
});

/* ------------------------------------------------------------------ */
/* Services — pinned horizontal index                                   */
/* ------------------------------------------------------------------ */
const servicesTrack = document.querySelector(".services__track");
const panels = gsap.utils.toArray(".service-panel");

if (!prefersReduced && servicesTrack) {
  gsap.to(servicesTrack, {
    x: () => -(panels.length - 1) * window.innerWidth,
    ease: "none",
    scrollTrigger: {
      trigger: ".services",
      start: "top top",
      end: () => "+=" + (panels.length - 1) * window.innerWidth,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
} else if (servicesTrack) {
  servicesTrack.style.display = "block";
  panels.forEach((p) => {
    p.style.width = "100%";
    p.style.height = "auto";
    p.style.padding = "4rem var(--gutter)";
  });
  document.querySelector(".services__viewport").style.height = "auto";
}

/* ------------------------------------------------------------------ */
/* Testimonials — pinned horizontal scrub                               */
/* ------------------------------------------------------------------ */
const testimonialsTrack = document.querySelector(".testimonials__track");

if (!prefersReduced && testimonialsTrack) {
  ScrollTrigger.create({
    trigger: ".testimonials__viewport",
    start: "top top",
    end: () => "+=" + Math.max(1, testimonialsTrack.scrollWidth - window.innerWidth),
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
    animation: gsap.to(testimonialsTrack, {
      x: () => -(testimonialsTrack.scrollWidth - window.innerWidth + 32),
      ease: "none",
    }),
  });
} else if (testimonialsTrack) {
  testimonialsTrack.style.overflowX = "auto";
  testimonialsTrack.style.paddingBottom = "1rem";
}

/* ------------------------------------------------------------------ */
/* Hero / CTA parallax tied to scroll position                         */
/* ------------------------------------------------------------------ */
ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  scrub: true,
  onUpdate: (self) => heroScene.setScroll(self.progress),
});

ScrollTrigger.create({
  trigger: ".cta",
  start: "top bottom",
  end: "bottom top",
  scrub: true,
  onUpdate: (self) => ctaScene.setScroll(self.progress),
});

gsap.to(".hero__content", {
  yPercent: 18,
  opacity: 0.2,
  ease: "none",
  scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
});

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */
document.getElementById("back-to-top").addEventListener("click", () => {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
});

window.addEventListener("beforeunload", () => {
  heroScene.destroy();
  ctaScene.destroy();
  if (manifestoScene) manifestoScene.destroy();
  if (supportScene) supportScene.destroy();
  if (teamScene) teamScene.destroy();
  if (testimonialsScene) testimonialsScene.destroy();
  if (studioScene) studioScene.destroy();
  if (heroGemScene) heroGemScene.destroy();
  if (ctaGemScene) ctaGemScene.destroy();
  if (treeScene) treeScene.destroy();
  tileScenes.forEach((s) => s.destroy());
  starfield.destroy();
});
