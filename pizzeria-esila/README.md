# Pizzeria Esila — landing page

Editorial, image-forward one-page site for Pizzeria Esila (est. 2024,
Osman & Maide Çeken). Static HTML/CSS/JS — no build step, no framework.

## Run locally

```
cd pizzeria-esila
python3 -m http.server 8080   # any static server works
```

Open `http://localhost:8080`. A local server is required (not `file://`)
because `js/main.js` uses native ES module imports for Three.js.

## Structure

- `index.html` — all sections (nav, hero, manifesto, gallery, services,
  about/chef, testimonials, booking CTA, footer)
- `css/style.css` — design tokens (colour, type, spacing) + layout
- `js/panels.js` — procedural "photography" panels (gradient field + fine
  editorial line motif + film grain), drawn to canvas
- `js/scene-hero.js` — Three.js hero background: a custom shader that
  cross-fades between drifting warm gradient "scenes" for an ambient,
  slow-motion feel
- `js/scene-gallery.js` — Three.js hover distortion (ripple + subtle
  chromatic aberration) on the gallery tiles
- `js/motion.js` — all GSAP / ScrollTrigger work: parallax, clip-path
  reveals, the pinned horizontal testimonials scrub, nav show/hide,
  reduced-motion handling
- `vendor/` — self-hosted GSAP + ScrollTrigger + Three.js builds (no CDN
  dependency at runtime)

## About the imagery

This environment has no access to stock photo services, so every image
slot is a **bespoke stand-in**: a warm gradient field with a single fine
editorial line motif (flame, wheat, olive branch, pizza slice, …) and a
grain pass, generated procedurally in `panels.js` — not real photography.

To drop in the studio's real photos: swap the `<canvas>` in each
`.g-item`, `.about-media`, etc. for an `<img>` (or keep the canvas and
`drawImage()` a loaded photo instead of `drawPanel()`). The clip-path
reveal, parallax and WebGL hover-distortion effects all work the same
way against a real photo texture — nothing else needs to change.

## Content placeholders

Address, phone, and email in the footer / CTA section are placeholders
(`Route 9, Northbound`, `+00 000 000 000`, `table@pizzeriaesila.example`)
— swap for the real details before shipping. The booking form is
front-end only (no backend): it shows a success state on submit but
doesn't send anywhere yet.
