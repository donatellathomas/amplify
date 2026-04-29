/**
 * Hero logo: smooth Y-axis spin only (no pointer parallax).
 */
const mv = document.querySelector(".hero__model");
if (mv) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let azimuth = 0;
  const polar = 75;
  const dist = 105;
  const degPerSec = 20;
  let last = performance.now();

  function tick(now) {
    if (reduced.matches) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    azimuth = (azimuth + degPerSec * dt) % 360;
    mv.setAttribute("camera-orbit", `${azimuth}deg ${polar}deg ${dist}%`);
    raf = requestAnimationFrame(tick);
  }

  if (!reduced.matches) {
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  reduced.addEventListener("change", () => {
    cancelAnimationFrame(raf);
    if (!reduced.matches) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  });
}
