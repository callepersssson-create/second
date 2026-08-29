# Web Design UF

Marketing homepage for Web Design UF, a fictional web design studio. Static
site, no build step and no framework — plain HTML/CSS/JS.

## Run locally

```
cd web-design-uf
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

- `index.html` — page markup
- `css/style.css` — design tokens and layout
- `js/main.js` — GSAP/ScrollTrigger timelines, Lenis smooth scroll, cursor
- `js/webgl.js` — the three Three.js scene types (liquid gradient blob,
  the studio sphere cluster, gallery tile ripple distortion)
- `vendor/` — pinned, self-hosted copies of GSAP, ScrollTrigger, Three.js
  and Lenis (see `package.json` for exact versions). The site has zero
  runtime CDN dependency; nothing here needs `npm install` to run.

## Updating a vendored library

```
npm install gsap@<version> three@<version> lenis@<version> --no-save
cp node_modules/gsap/dist/{gsap,ScrollTrigger}.min.js vendor/
cp node_modules/three/build/three.module.min.js node_modules/three/build/three.core.min.js vendor/
cp node_modules/lenis/dist/lenis.min.js vendor/
rm -rf node_modules package-lock.json
```

Three.js ships ES-module builds only from ~0.170 onward — `three.module.min.js`
imports `three.core.min.js` as a peer file, so both must be copied together.
