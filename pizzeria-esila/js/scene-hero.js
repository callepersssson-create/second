import * as THREE from '../vendor/three/three.module.min.js';

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uMix;       // 0..1 crossfade between scene A and B
  uniform float uScroll;    // 0..1 scroll progress through hero
  uniform float uPointer;   // -1..1 pointer x influence
  uniform vec3 uColA0; uniform vec3 uColA1; uniform vec3 uColA2;
  uniform vec3 uColB0; uniform vec3 uColB1; uniform vec3 uColB2;
  uniform float uSeedA; uniform float uSeedB;

  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p){
    float v = 0.0; float amp = 0.55;
    for(int i = 0; i < 5; i++){
      v += amp * noise(p);
      p *= 2.02;
      amp *= 0.55;
    }
    return v;
  }

  vec3 scene(vec2 uv, float seed, float t, vec3 c0, vec3 c1, vec3 c2){
    vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * asp;

    // slow drifting warm blobs
    vec2 driftA = vec2(sin(t * 0.05 + seed) * 0.35, cos(t * 0.04 + seed * 1.7) * 0.28);
    vec2 driftB = vec2(cos(t * 0.035 + seed * 2.1) * 0.4, sin(t * 0.045 + seed * 0.6) * 0.3);

    float n = fbm(p * 1.6 + driftA * 1.2 + seed);
    float n2 = fbm(p * 2.4 - driftB + seed * 3.3);

    float base = smoothstep(0.15, 0.95, n * 0.7 + n2 * 0.5);

    vec3 col = mix(c2, c1, smoothstep(0.0, 0.7, base));
    col = mix(col, c0, smoothstep(0.55, 1.0, base));

    // soft top-light glow
    float glow = smoothstep(0.9, -0.3, length(p - vec2(driftA.x * 0.5, -0.55)));
    col += c0 * glow * 0.28;

    // vignette
    float vig = smoothstep(1.15, 0.25, length(p));
    col *= mix(0.55, 1.05, vig);

    return col;
  }

  void main(){
    vec2 uv = vUv;
    uv.x += uPointer * 0.012 * (uv.y - 0.5);
    uv.y += uScroll * 0.06;

    vec3 a = scene(uv, uSeedA, uTime, uColA0, uColA1, uColA2);
    vec3 b = scene(uv, uSeedB, uTime, uColB0, uColB1, uColB2);
    vec3 col = mix(a, b, smoothstep(0.0, 1.0, uMix));

    // filmic grain, coarse time-stepped so it flickers like real film
    float gt = floor(uTime * 10.0);
    float g = hash(gl_FragCoord.xy * 0.9 + gt) - 0.5;
    col += g * 0.035;

    // bottom scrim for legibility of headline
    float scrim = smoothstep(0.35, 1.0, vUv.y) * -0.001; // reserved
    float bottomShade = smoothstep(0.0, 0.62, 1.0 - vUv.y);
    col *= mix(1.0, 0.62, bottomShade * 0.0); // handled in DOM via .hero-scrim instead

    gl_FragColor = vec4(col, 1.0);
  }
`;

const HEX = (h) => new THREE.Color(h);

const SCENES = [
  { seed: 1.3, colors: [HEX('#e08a4f'), HEX('#8a3418'), HEX('#1c120f')] }, // ember
  { seed: 4.7, colors: [HEX('#e7d3ad'), HEX('#a9713f'), HEX('#26170f')] }, // wheat/dusk
  { seed: 7.1, colors: [HEX('#c98a6a'), HEX('#5c2e22'), HEX('#150d0b')] }, // dusk road
];

export function initHeroScene(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    -1, -1, 0,  3, -1, 0,  -1, 3, 0,
  ]), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
    0, 0,  2, 0,  0, 2,
  ]), 2));

  let sceneIndex = 0;
  let nextIndex = 1;

  const uniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uMix: { value: 0 },
    uScroll: { value: 0 },
    uPointer: { value: 0 },
    uColA0: { value: SCENES[sceneIndex].colors[0] },
    uColA1: { value: SCENES[sceneIndex].colors[1] },
    uColA2: { value: SCENES[sceneIndex].colors[2] },
    uColB0: { value: SCENES[nextIndex].colors[0] },
    uColB1: { value: SCENES[nextIndex].colors[1] },
    uColB2: { value: SCENES[nextIndex].colors[2] },
    uSeedA: { value: SCENES[sceneIndex].seed },
    uSeedB: { value: SCENES[nextIndex].seed },
  };

  const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, depthTest: false, depthWrite: false });
  const mesh = new THREE.Mesh(geometry, material);

  const scene = new THREE.Scene();
  scene.add(mesh);
  const camera = new THREE.Camera();

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let raf = null;
  const clock = new THREE.Clock();
  let mixState = { v: 0 };

  function advanceScene() {
    sceneIndex = nextIndex;
    nextIndex = (nextIndex + 1) % SCENES.length;
    uniforms.uColA0.value = SCENES[sceneIndex].colors[0];
    uniforms.uColA1.value = SCENES[sceneIndex].colors[1];
    uniforms.uColA2.value = SCENES[sceneIndex].colors[2];
    uniforms.uColB0.value = SCENES[nextIndex].colors[0];
    uniforms.uColB1.value = SCENES[nextIndex].colors[1];
    uniforms.uColB2.value = SCENES[nextIndex].colors[2];
    uniforms.uSeedA.value = SCENES[sceneIndex].seed;
    uniforms.uSeedB.value = SCENES[nextIndex].seed;
    mixState.v = 0;
    uniforms.uMix.value = 0;
  }

  let gsapTween = null;
  const gsap = window.gsap;

  function loopCrossfade() {
    if (!gsap) return;
    gsapTween = gsap.to(mixState, {
      v: 1,
      duration: 7,
      ease: 'sine.inOut',
      delay: 3.4,
      onUpdate() { uniforms.uMix.value = mixState.v; },
      onComplete() {
        advanceScene();
        loopCrossfade();
      },
    });
  }

  if (!reducedMotion && gsap) {
    loopCrossfade();
  }

  function render() {
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    if (!reducedMotion) raf = requestAnimationFrame(render);
  }
  render();

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    uniforms.uPointer.value += (nx - uniforms.uPointer.value) * 0.06;
  }, { passive: true });

  return {
    setScroll(v) { uniforms.uScroll.value = v; },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      if (gsapTween) gsapTween.kill();
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}
