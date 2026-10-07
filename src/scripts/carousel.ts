import { clamp, reducedMotion, scrollToY } from "./lib";

/**
 * Project Carousel. The stage is pinned; one smoothed scroll value moves the
 * flat cover images and the HTML title overlays together. Titles reveal
 * letter by letter for the slide nearest the centre.
 */
export function initCarousel(root: HTMLElement) {
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
  const overlays = Array.from(root.querySelectorAll<HTMLElement>("[data-overlay]"));
  const bar = root.querySelector<HTMLElement>("[data-bar]");
  const navBtns = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-goto]"));
  const n = overlays.length;
  const phone = window.matchMedia("(max-width: 809px)");
  const spacing = () => (phone.matches ? 60 : 75);
  const step = () => (clamp(spacing(), 40, 300) / 100) * window.innerHeight;
  const ease = reducedMotion() ? 1 : 0.16;

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

  let smooth: number | null = null;
  let raf = 0;

  const frame = () => {
    raf = 0;
    const target = -root.getBoundingClientRect().top;
    if (smooth === null) smooth = target;
    smooth += (target - smooth) * ease;
    if (Math.abs(target - smooth) < 0.5) smooth = target;
    const s = smooth;
    const st = step();
    if (bar) bar.style.opacity = String(1 - clamp((s - (n - 1) * st) / (st * 0.5), 0, 1));

    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const offset = i * st - s;
      const t = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      overlays[i].style.transform = t;
      if (slides[i]) slides[i].style.transform = t;
      if (Math.abs(offset) < bestDist) {
        bestDist = Math.abs(offset);
        best = i;
      }
    }
    // hysteresis: only switch when clearly closer, kills midpoint flicker
    if (best !== active && bestDist < Math.abs(active * st - s) - st * 0.15) setActive(best);

    if (s !== target) raf = requestAnimationFrame(frame);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  frame();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}
