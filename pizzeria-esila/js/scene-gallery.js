import * as THREE from '../vendor/three/three.module.min.js';
import { createPanelCanvas } from './panels.js';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Subtle ripple + chromatic-aberration distortion, driven by pointer
// position and a hover amount (0..1). Refinement over spectacle: small
// displacement magnitudes, soft falloff.
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uTime;

  void main(){
    vec2 uv = vUv;
    float dist = distance(uv, uMouse);
    float falloff = smoothstep(0.55, 0.0, dist);
    float ripple = sin(dist * 24.0 - uTime * 3.2) * 0.012 * falloff * uHover;
    vec2 dir = normalize(uv - uMouse + 1e-4);
    vec2 duv = uv + dir * ripple;

    float ab = 0.006 * falloff * uHover;
    float r = texture2D(uTex, duv + dir * ab).r;
    float g = texture2D(uTex, duv).g;
    float b = texture2D(uTex, duv - dir * ab).b;
    vec3 col = vec3(r, g, b);

    float lift = falloff * uHover * 0.05;
    col += lift;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function buildTri() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -1, -1, 0,  3, -1, 0,  -1, 3, 0,
  ]), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,  2, 0,  0, 2,
  ]), 2));
  return geometry;
}

export function initGalleryDistortion(items, { reducedMotion = false } = {}) {
  const instances = [];

  items.forEach((el) => {
    const canvas = el.querySelector('canvas');
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
    } catch (e) {
      return; // WebGL unavailable — canvas stays blank, panel still readable via fallback bg
    }
    renderer.setPixelRatio(dpr);

    const texture = new THREE.Texture();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const uniforms = {
      uTex: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uTime: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
    const mesh = new THREE.Mesh(buildTri(), material);
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();

    function paint() {
      const r = canvas.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      renderer.setSize(r.width, r.height, false);
      const panel = createPanelCanvas(r.width, r.height, {
        palette: el.dataset.palette,
        motif: el.dataset.motif,
        seed: Number(el.dataset.seed || 1),
      }, dpr);
      texture.image = panel;
      texture.needsUpdate = true;
      draw();
    }

    function draw() {
      renderer.render(scene, camera);
    }

    let hoverTarget = 0;
    let raf = null;

    function tick() {
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.09;
      uniforms.uTime.value += 0.016;
      draw();
      const settled = Math.abs(hoverTarget - uniforms.uHover.value) < 0.002 && hoverTarget < 0.5;
      if (!settled) {
        raf = requestAnimationFrame(tick);
      } else {
        uniforms.uHover.value = 0;
        draw();
        raf = null;
      }
    }

    function ensureLoop() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    if (!reducedMotion) {
      el.addEventListener('pointerenter', () => { hoverTarget = 1; ensureLoop(); });
      el.addEventListener('pointerleave', () => { hoverTarget = 0; ensureLoop(); });
      el.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        uniforms.uMouse.value.set(
          (e.clientX - r.left) / r.width,
          1 - (e.clientY - r.top) / r.height
        );
      });
    }

    paint();
    instances.push({ el, paint, renderer });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => instances.forEach((i) => i.paint()), 180);
  });

  return instances;
}
