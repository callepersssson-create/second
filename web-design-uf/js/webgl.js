import * as THREE from "../vendor/three.module.min.js";

/* Simplex 3D noise — Ashima Arts / Stefan Gustavson (MIT), used verbatim
   in every fragment shader below to drive the organic motion. */
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX_PASSTHROUGH = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

function hexToVec3(hex) {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  return renderer;
}

function observeVisibility(el, onChange) {
  if (!("IntersectionObserver" in window)) {
    onChange(true);
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => onChange(entries[0].isIntersecting),
    { rootMargin: "15% 0px 15% 0px" }
  );
  io.observe(el);
  return () => io.disconnect();
}

function observeResize(el, onResize) {
  const ro = new ResizeObserver(() => onResize());
  ro.observe(el);
  return () => ro.disconnect();
}

/* ---------------------------------------------------------------------
   BlobScene — the site's signature liquid gradient field. Reused for
   the hero, the CTA and the "about" portrait frame with different
   colors/seeds so the whole page reads as one visual system.
   ------------------------------------------------------------------- */
export function createBlobScene(canvas, { colorA, colorB, colorC, seed = 0, mouseScope = "global" }) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: hexToVec3(colorA) },
    uColorB: { value: hexToVec3(colorB) },
    uColorC: { value: hexToVec3(colorC) },
    uSeed: { value: seed },
    uScroll: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_PASSTHROUGH,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform float uSeed;
      uniform float uScroll;
      ${NOISE_GLSL}
      void main() {
        vec2 aspect = vec2(max(uResolution.x / uResolution.y, 1.0), max(uResolution.y / uResolution.x, 1.0));
        vec2 p = (vUv - 0.5) * aspect;
        vec2 m = (uMouse - 0.5) * aspect;

        float mDist = length(p - m);
        vec2 warp = p + 0.16 * vec2(
          snoise(vec3(p * 1.35, uTime * 0.07 + uSeed)),
          snoise(vec3(p * 1.35 + 4.2, uTime * 0.07 + uSeed))
        );
        warp -= 0.16 * normalize(p - m + 0.0001) * smoothstep(0.6, 0.0, mDist);

        float n1 = snoise(vec3(warp * 1.05, uTime * 0.045 + uSeed));
        float n2 = snoise(vec3(warp * 2.1 - 3.1, uTime * 0.06 + uSeed * 1.7));
        float n = n1 * 0.65 + n2 * 0.35;
        n = n * 0.5 + 0.5;
        n += 0.06 * sin(uScroll * 3.14159 + uSeed);

        vec3 col = mix(uColorA, uColorB, smoothstep(0.18, 0.62, n));
        col = mix(col, uColorC, smoothstep(0.6, 0.94, n));

        float vign = smoothstep(1.05, 0.3, length(p));
        gl_FragColor = vec4(col, vign);
      }
    `,
    transparent: true,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const mouseTarget = new THREE.Vector2(0.5, 0.5);
  const mouseCurrent = new THREE.Vector2(0.5, 0.5);

  function setMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    mouseTarget.set(
      (e.clientX - rect.left) / rect.width,
      1 - (e.clientY - rect.top) / rect.height
    );
  }

  if (mouseScope === "global") {
    window.addEventListener("pointermove", setMouseFromEvent, { passive: true });
  } else {
    canvas.parentElement.addEventListener("pointermove", setMouseFromEvent, { passive: true });
    canvas.parentElement.addEventListener("pointerleave", () => mouseTarget.set(0.5, 0.5));
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();
  const stopResize = observeResize(canvas, resize);

  let visible = true;
  const stopVisibility = observeVisibility(canvas, (v) => (visible = v));

  let raf = null;
  let scrollProgress = 0;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    mouseCurrent.lerp(mouseTarget, 0.06);
    uniforms.uMouse.value.copy(mouseCurrent);
    uniforms.uTime.value = t * 0.001;
    uniforms.uScroll.value = scrollProgress;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  return {
    setScroll(p) {
      scrollProgress = p;
    },
    destroy() {
      cancelAnimationFrame(raf);
      stopResize();
      stopVisibility();
      renderer.dispose();
      material.dispose();
    },
  };
}

/* ---------------------------------------------------------------------
   Wheel — a literal wheel (glossy gradient rim, spokes, hub) built once
   and reused by two scenes below: the studio panel's auto-spinning
   version, and the "Hjulet" page's scroll-driven one turn. Kept all in
   the blue family so it reads as one piece with the rest of the site.
   ------------------------------------------------------------------- */
function buildWheelGroup({
  colorA = "#0a1050",
  colorB = "#1e2de0",
  colorC = "#a9b8ff",
  spokeColor = 0x1e2de0,
  hubColor = 0x0a1050,
  radius = 1.2,
  tube = 0.16,
  spokeCount = 6,
} = {}) {
  const group = new THREE.Group();

  const rimGeo = new THREE.TorusGeometry(radius, tube, 32, 120);
  rimGeo.computeBoundingSphere();
  const r = rimGeo.boundingSphere.radius || 1;
  const cA = new THREE.Color(colorA);
  const cB = new THREE.Color(colorB);
  const cC = new THREE.Color(colorC);
  const pos = rimGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.getY(i) / r) * 0.5 + 0.5));
    const mixed = t < 0.5 ? cA.clone().lerp(cB, t * 2) : cB.clone().lerp(cC, (t - 0.5) * 2);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  rimGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const rimMat = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.22,
    metalness: 0.4,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
  });
  group.add(new THREE.Mesh(rimGeo, rimMat));

  const hubRadius = radius * 0.18;
  const hubMat = new THREE.MeshPhysicalMaterial({ color: hubColor, roughness: 0.3, metalness: 0.55, clearcoat: 0.5 });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(hubRadius, 24, 24), hubMat));

  const rimInner = radius - tube;
  const spokeLen = Math.max(0.1, rimInner - hubRadius);
  const centerDist = hubRadius + spokeLen / 2;
  const spokeGeo = new THREE.CylinderGeometry(radius * 0.035, radius * 0.035, spokeLen, 12);
  const spokeMat = new THREE.MeshPhysicalMaterial({ color: spokeColor, roughness: 0.35, metalness: 0.45, clearcoat: 0.4 });
  for (let i = 0; i < spokeCount; i++) {
    const theta = (i / spokeCount) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeo, spokeMat);
    spoke.rotation.z = theta - Math.PI / 2;
    spoke.position.set(Math.cos(theta) * centerDist, Math.sin(theta) * centerDist, 0);
    group.add(spoke);
  }

  return {
    group,
    dispose() {
      rimGeo.dispose();
      rimMat.dispose();
      hubMat.dispose();
      spokeGeo.dispose();
      spokeMat.dispose();
    },
  };
}

function addWheelLighting(scene) {
  scene.add(new THREE.AmbientLight(0x1c2560, 0.55));
  const key = new THREE.DirectionalLight(0xd9e0ff, 1.15);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c6fff, 0.85);
  rim.position.set(-4, -2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x5a72ff, 0.35);
  fill.position.set(0, -3, 4);
  scene.add(fill);
}

/* ---------------------------------------------------------------------
   StudioScene — the wheel, auto-spinning with a slow hypnotic tumble +
   pointer parallax. Built to catch the eye without competing with the
   liquid-shader system used everywhere else.
   ------------------------------------------------------------------- */
export function createStudioScene(canvas) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  addWheelLighting(scene);
  const wheel = buildWheelGroup();
  scene.add(wheel.group);

  const mouseTarget = new THREE.Vector2(0, 0);
  canvas.parentElement.addEventListener(
    "pointermove",
    (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * 2 - 1
      );
    },
    { passive: true }
  );

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const stopResize = observeResize(canvas, resize);

  let visible = true;
  const stopVisibility = observeVisibility(canvas, (v) => (visible = v));

  let raf = null;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const time = t * 0.001;
    wheel.group.rotation.z = time * 0.22;
    wheel.group.rotation.x = Math.sin(time * 0.3) * 0.15;
    wheel.group.position.y = Math.sin(time * 0.5) * 0.1;
    camera.position.x += (mouseTarget.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouseTarget.y * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stopResize();
      stopVisibility();
      wheel.dispose();
      renderer.dispose();
    },
  };
}

/* ---------------------------------------------------------------------
   WheelPageScene — the same wheel, but rotation is driven entirely by
   scroll progress (setProgress) rather than time, for the "Hjulet" page.
   ------------------------------------------------------------------- */
export function createWheelPageScene(canvas) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 7);

  addWheelLighting(scene);
  const wheel = buildWheelGroup({ radius: 1.5, tube: 0.2, spokeCount: 8 });
  scene.add(wheel.group);

  const mouseTarget = new THREE.Vector2(0, 0);
  window.addEventListener(
    "pointermove",
    (e) => {
      mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const stopResize = observeResize(canvas, resize);

  let progress = 0;
  let raf = null;
  function tick() {
    raf = requestAnimationFrame(tick);
    wheel.group.rotation.z = -progress * Math.PI * 2;
    camera.position.x += (mouseTarget.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (-mouseTarget.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  return {
    setProgress(p) {
      progress = p;
    },
    destroy() {
      cancelAnimationFrame(raf);
      stopResize();
      wheel.dispose();
      renderer.dispose();
    },
  };
}

/* ---------------------------------------------------------------------
   TileScene — the gallery thumbnails' color field, with a ripple
   distortion that plays outward from the pointer on hover.
   ------------------------------------------------------------------- */
export function createTileScene(canvas, hue) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const hues = {
    cobalt: ["#1e2de0", "#11167a", "#a9b8ff"],
    coral: ["#ff4433", "#971d13", "#f2ecdd"],
    lime: ["#16130f", "#1e2de0", "#a9b8ff"],
    ink: ["#16130f", "#ff4433", "#f2ecdd"],
  };
  const [a, b, c] = hues[hue] || hues.cobalt;

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uColorA: { value: hexToVec3(a) },
    uColorB: { value: hexToVec3(b) },
    uColorC: { value: hexToVec3(c) },
    uHover: { value: 0 },
    uHoverPoint: { value: new THREE.Vector2(0.5, 0.5) },
    uHoverStart: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_PASSTHROUGH,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform float uHover;
      uniform vec2 uHoverPoint;
      uniform float uHoverStart;
      ${NOISE_GLSL}
      void main() {
        vec2 uv = vUv;
        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

        vec2 d = (uv - uHoverPoint) * aspect;
        float dist = length(d);
        float t = uTime - uHoverStart;
        float ripple = sin(dist * 42.0 - t * 5.5) * exp(-dist * 5.5) * uHover;
        uv += normalize(d + 1e-4) * ripple * 0.045;

        vec2 p = uv * 1.6;
        float n = snoise(vec3(p, uTime * 0.035));
        n += 0.35 * snoise(vec3(p * 2.3 + 5.0, uTime * 0.05));
        n = n * 0.5 + 0.5;

        vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.7, n));
        col = mix(col, uColorC, smoothstep(0.55, 0.95, n) * (0.4 + 0.6 * uHover));
        col += uHover * 0.05 * ripple;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();
  const stopResize = observeResize(canvas, resize);

  let visible = true;
  const stopVisibility = observeVisibility(canvas, (v) => (visible = v));

  let raf = null;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    uniforms.uTime.value = t * 0.001;
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  return {
    setHoverPoint(x, y) {
      uniforms.uHoverPoint.value.set(x, y);
    },
    setHover(value) {
      if (value > 0 && uniforms.uHover.value === 0) {
        uniforms.uHoverStart.value = uniforms.uTime.value;
      }
      uniforms.uHover.value = value;
    },
    destroy() {
      cancelAnimationFrame(raf);
      stopResize();
      stopVisibility();
      renderer.dispose();
    },
  };
}

/* ---------------------------------------------------------------------
   Starfield — a fixed, page-wide ambient layer of slow drifting motes
   that shows through every section (they're painted semi-transparent),
   the thread that ties the whole site to one deep, quiet atmosphere.
   Plain Canvas2D — cheap enough to sit behind the WebGL scenes above.
   ------------------------------------------------------------------- */
export function createStarfield(canvas, { count = 160, reducedMotion = false } = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  const palette = ["242,236,221", "168,158,255", "220,255,120"];
  const weights = [0.72, 0.18, 0.1];

  function pickColor() {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r <= acc) return palette[i];
    }
    return palette[0];
  }

  const motes = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.3 + 0.3,
    depth: Math.random() * 0.5 + 0.15,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.4 + 0.15,
    color: pickColor(),
  }));

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  let scrollY = 0;
  let raf = null;

  function paint(time) {
    ctx.clearRect(0, 0, w, h);
    motes.forEach((m) => {
      const twinkle = reducedMotion ? 0.5 : 0.35 + 0.65 * Math.abs(Math.sin(time * m.speed + m.phase));
      const baseY = m.y * h;
      const parallax = (scrollY * m.depth * 0.12) % (h + 60);
      let y = baseY - parallax;
      if (y < -30) y += h + 60;
      if (y > h + 30) y -= h + 60;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${m.color}, ${(0.08 + 0.5 * twinkle).toFixed(3)})`;
      ctx.arc(m.x * w, y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    paint(t * 0.001);
  }

  if (reducedMotion) {
    paint(0);
  } else {
    raf = requestAnimationFrame(tick);
  }

  return {
    setScrollY(y) {
      scrollY = y;
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}

/* ---------------------------------------------------------------------
   GemScene — a smooth, glossy floating solid with a flowing vertex-color
   gradient. Generalized version of the studio torus knot so hero and
   CTA can each get their own distinct shape from the same recipe,
   bookending the page with a second, varied 3D motif.
   ------------------------------------------------------------------- */
export function createGemScene(canvas, { geometry, colorA, colorB, colorC, rotSpeedX = 0.18, rotSpeedY = 0.24, floatAmp = 0.14 }) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(0, 0, 6.5);

  scene.add(new THREE.AmbientLight(0x362f6b, 0.5));
  const key = new THREE.DirectionalLight(0xd9e0ff, 1.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7c6fff, 0.9);
  rim.position.set(-4, -1, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x5a72ff, 0.35);
  fill.position.set(-1, -3, 4);
  scene.add(fill);

  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere.radius || 1;
  const cA = new THREE.Color(colorA);
  const cB = new THREE.Color(colorB);
  const cC = new THREE.Color(colorC);
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  for (let i = 0; i < positions.count; i++) {
    const y = (positions.getY(i) / radius) * 0.5 + 0.5;
    const t = Math.min(1, Math.max(0, y));
    const mixed = t < 0.5 ? cA.clone().lerp(cB, t * 2) : cB.clone().lerp(cC, (t - 0.5) * 2);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.22,
    metalness: 0.35,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const mouseTarget = new THREE.Vector2(0, 0);
  canvas.parentElement.addEventListener(
    "pointermove",
    (e) => {
      const rect = canvas.parentElement.getBoundingClientRect();
      mouseTarget.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * 2 - 1
      );
    },
    { passive: true }
  );

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const stopResize = observeResize(canvas, resize);

  let visible = true;
  const stopVisibility = observeVisibility(canvas, (v) => (visible = v));

  let raf = null;
  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const time = t * 0.001;
    mesh.rotation.x = time * rotSpeedX;
    mesh.rotation.y = time * rotSpeedY;
    mesh.position.y = Math.sin(time * 0.45) * floatAmp;
    camera.position.x += (mouseTarget.x * 0.7 - camera.position.x) * 0.03;
    camera.position.y += (-mouseTarget.y * 0.5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      stopResize();
      stopVisibility();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
