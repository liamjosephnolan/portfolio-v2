import { clamp, reducedMotion, scrollToY } from "./lib";

/**
 * Project Carousel (port of the Framer code component ProjectCarousel.tsx).
 * The stage is pinned; one smoothed scroll value drives the cover planes and
 * the HTML title overlays together. With WebGL the covers are drawn as planes
 * curved onto a cylinder, with a liquid shader that reacts to scroll velocity
 * only (no idle sway at rest, no chromatic aberration). Titles move 1:1 and
 * reveal letter by letter; images trail slightly. Without WebGL the flat
 * [data-slide] elements are moved instead.
 */
const CFG = {
  curve: 1.4,
  parallax: 0.8,
  smoothness: 0.16,
  distortion: 2.6,
  maxWidth: 1400,
  radius: 20,
  tint: 0.4,
};

const VERT = `
attribute vec2 aPos;
uniform vec2 uHalf;
uniform vec2 uRes;
uniform float uAngle;
uniform float uRadius;
uniform float uPersp;
varying vec2 vUv;
void main(){
  vUv = vec2(aPos.x * 0.5 + 0.5, aPos.y * 0.5 + 0.5);
  vec2 lp = vec2(aPos.x * uHalf.x, aPos.y * uHalf.y);
  float ang = uAngle + lp.y / uRadius;
  float wx = lp.x;
  float wy = uRadius * sin(ang);
  float wz = uRadius * (1.0 - cos(ang));
  float scale = uPersp / (uPersp - wz);
  gl_Position = vec4((wx * scale) / (uRes.x * 0.5), (wy * scale) / (uRes.y * 0.5), 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uImgA;
uniform float uBoxA;
uniform float uTime;
uniform float uAmp;
uniform float uVel;
uniform float uTint;
uniform vec2 uPlanePx;
uniform float uRadiusPx;
vec2 cover(vec2 uv, float ia, float ba){
  vec2 s = ia > ba ? vec2(ba/ia, 1.0) : vec2(1.0, ia/ba);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = cover(vUv, uImgA, uBoxA);
  float mv = min(abs(uVel), 3.0);
  // Liquid flow scales with scroll speed only, so the image is still at rest.
  float v = uAmp * mv * 0.85;
  vec2 flow;
  flow.x = sin(uv.y * 9.0 + uTime * 1.3) * 0.012 * v;
  flow.y = cos(uv.x * 7.0 - uTime * 1.05) * 0.012 * v;
  uv += flow;
  vec3 col = texture2D(uTex, uv).rgb * (1.0 - uTint);
  vec2 halfP = uPlanePx * 0.5;
  vec2 p = (vUv - 0.5) * uPlanePx;
  float rr = min(uRadiusPx, min(halfP.x, halfP.y));
  vec2 q = abs(p) - (halfP - vec2(rr));
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rr;
  float alpha = 1.0 - smoothstep(0.0, 1.5, d);
  gl_FragColor = vec4(col, alpha);
}`;

interface Tex {
  tex: WebGLTexture;
  aspect: number;
  video?: HTMLVideoElement;
}

/** Sets up the cylinder renderer. Returns a draw function, or null without WebGL. */
function setupGL(canvas: HTMLCanvasElement, slides: HTMLElement[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gl: any = null;
  try {
    gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
  } catch {
    gl = null;
  }
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // A strip of horizontal segments so the plane can bend around the cylinder.
  const SEG = 26;
  const verts: number[] = [];
  for (let j = 0; j < SEG; j++) {
    const y0 = -1 + (2 * j) / SEG;
    const y1 = -1 + (2 * (j + 1)) / SEG;
    verts.push(-1, y0, 1, y0, -1, y1, -1, y1, 1, y0, 1, y1);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uni = {
    uHalf: u("uHalf"), uRes: u("uRes"), uAngle: u("uAngle"), uRadius: u("uRadius"), uPersp: u("uPersp"),
    uTex: u("uTex"), uImgA: u("uImgA"), uBoxA: u("uBoxA"), uTime: u("uTime"), uAmp: u("uAmp"),
    uVel: u("uVel"), uTint: u("uTint"), uPlanePx: u("uPlanePx"), uRadiusPx: u("uRadiusPx"),
  };

  const newTexture = () => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  };

  // Each slide starts from a still image (the <img>, or a video's poster);
  // video slides switch to live frames once the clip is playing.
  const texs: Array<Tex | null> = slides.map(() => null);
  slides.forEach((slide, i) => {
    const video = slide.querySelector("video");
    const src = video ? video.poster : slide.querySelector("img")?.currentSrc || slide.querySelector("img")?.src;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      const tex = newTexture();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      texs[i] = { tex, aspect: img.naturalWidth / (img.naturalHeight || 1) || 1.5, video: video ?? undefined };
    };
    img.src = src;
  });

  let W = 0;
  let H = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener("resize", resize);

  const { curve, maxWidth, radius, tint, distortion } = CFG;

  /** Draw every plane near the viewport. `offsets[i]` is slide i's distance from centre in px. */
  return (offsets: number[], vel: number, t: number, sizePct: { w: number; h: number }) => {
    if (W !== canvas.clientWidth || H !== canvas.clientHeight) resize();
    const tinyW = W < 600;
    const sideGutter = tinyW ? 40 : 128;
    const planeW = Math.min(tinyW ? W - sideGutter : (sizePct.w / 100) * W, maxWidth, W - sideGutter);
    const planeH = (sizePct.h / 100) * H;
    const arc = clamp(curve, 0, 2) * 0.9;
    const R = arc > 0.001 ? H / arc : H * 1000;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uni.uRes, W, H);
    gl.uniform2f(uni.uHalf, planeW / 2, planeH / 2);
    gl.uniform2f(uni.uPlanePx, planeW, planeH);
    gl.uniform1f(uni.uRadiusPx, radius);
    gl.uniform1f(uni.uRadius, R);
    gl.uniform1f(uni.uPersp, H * 2.2);
    gl.uniform1f(uni.uBoxA, planeW / planeH);
    gl.uniform1f(uni.uTime, t);
    gl.uniform1f(uni.uAmp, distortion);
    gl.uniform1f(uni.uVel, vel * 0.03);
    gl.uniform1f(uni.uTint, tint);

    // Far planes first so nearer ones blend over them.
    const order = offsets
      .map((off, i) => ({ off, i }))
      .filter(({ off, i }) => texs[i] && Math.abs(off) < 1.6 * H)
      .sort((a, b) => Math.abs(b.off) - Math.abs(a.off));
    for (const { off, i } of order) {
      const tx = texs[i]!;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tx.tex);
      const v = tx.video;
      if (v && !v.paused && v.readyState >= 2 && v.videoWidth) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
        tx.aspect = v.videoWidth / v.videoHeight;
      }
      gl.uniform1i(uni.uTex, 0);
      gl.uniform1f(uni.uImgA, tx.aspect);
      gl.uniform1f(uni.uAngle, -off / R);
      gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);
    }
  };
}

export function initCarousel(root: HTMLElement) {
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
  const overlays = Array.from(root.querySelectorAll<HTMLElement>("[data-overlay]"));
  const bar = root.querySelector<HTMLElement>("[data-bar]");
  const navBtns = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-goto]"));
  const canvas = root.querySelector<HTMLCanvasElement>(".pc-canvas");
  const n = overlays.length;
  const tablet = window.matchMedia("(max-width: 1199px)");
  const phone = window.matchMedia("(max-width: 809px)");
  const spacing = () => (phone.matches ? 60 : 75);
  const step = () => (clamp(spacing(), 40, 300) / 100) * window.innerHeight;
  const sizePct = () => ({
    w: phone.matches ? 92 : tablet.matches ? 84 : 80,
    h: phone.matches ? 50 : tablet.matches ? 58 : 68,
  });
  // Reduced motion: no smoothing, no trailing images and no velocity effects.
  const calm = reducedMotion();
  const ease = calm ? 1 : CFG.smoothness;
  const imgEase = calm ? 1 : clamp(ease * (1 - 0.75 * clamp(CFG.parallax, 0, 1)), 0.02, 1);

  let active = 0;
  const setActive = (i: number) => {
    active = i;
    overlays.forEach((o, k) => o.classList.toggle("pc-ref-active", k === i));
    navBtns.forEach((b, k) => {
      if (k === i) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
      b.firstElementChild?.classList.toggle("pc-nav-active", k === i);
    });
  };

  navBtns.forEach((b) =>
    b.addEventListener("click", () => {
      const rootTopAbs = root.getBoundingClientRect().top + window.scrollY;
      scrollToY(rootTopAbs + Number(b.dataset.goto) * step());
    })
  );

  const draw = canvas ? setupGL(canvas, slides) : null;
  if (draw) root.classList.add("pc-gl");

  let smooth: number | null = null;
  let smoothImg: number | null = null;
  let lastS = 0;
  let velSmooth = 0;
  let raf = 0;
  let inView = true;
  const t0 = performance.now();

  const frame = () => {
    raf = 0;
    const target = -root.getBoundingClientRect().top;
    if (smooth === null) smooth = target;
    if (smoothImg === null) smoothImg = target;
    smooth += (target - smooth) * ease;
    smoothImg += (target - smoothImg) * imgEase;
    if (Math.abs(target - smooth) < 0.5) smooth = target;
    if (Math.abs(target - smoothImg) < 0.5) smoothImg = target;
    const s = smooth;
    const sImg = smoothImg;
    velSmooth += (s - lastS - velSmooth) * 0.1;
    lastS = s;
    const st = step();
    if (bar) bar.style.opacity = String(1 - clamp((s - (n - 1) * st) / (st * 0.5), 0, 1));

    let best = 0;
    let bestDist = Infinity;
    const imgOffsets: number[] = [];
    for (let i = 0; i < n; i++) {
      const offset = i * st - s;
      overlays[i].style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      imgOffsets.push(i * st - sImg);
      if (!draw && slides[i]) slides[i].style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      if (Math.abs(offset) < bestDist) {
        bestDist = Math.abs(offset);
        best = i;
      }
    }
    if (draw) draw(imgOffsets, calm ? 0 : velSmooth, calm ? 0 : (performance.now() - t0) / 1000, sizePct());

    // hysteresis: only switch when clearly closer, kills midpoint flicker
    if (best !== active && bestDist < Math.abs(active * st - s) - st * 0.15) setActive(best);

    // WebGL keeps drawing while on screen (video frames, velocity decay);
    // the flat fallback stops once the scroll has settled.
    const settled = s === target && sImg === target && Math.abs(velSmooth) < 0.01;
    if (inView && (draw ? true : !settled)) raf = requestAnimationFrame(frame);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) schedule();
    }).observe(root);
  }
  frame();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}
