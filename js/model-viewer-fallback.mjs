/**
 * Show PNG fallbacks until each <model-viewer> finishes loading.
 * Keeps the site readable when WebGL/CDN/GLB fetch fails (e.g. file:// preview).
 */
function revealModelViewer(mv, fallback) {
  if (!mv) return;
  mv.classList.add("is-ready");
  if (fallback) fallback.hidden = true;
}

function wireModelViewer(mv) {
  if (!mv || mv.dataset.fallbackWired === "true") return;
  mv.dataset.fallbackWired = "true";

  const fallback = mv.previousElementSibling?.matches?.("[data-mv-fallback]")
    ? mv.previousElementSibling
    : null;

  const onReady = () => revealModelViewer(mv, fallback);

  try {
    if (mv.loaded === true) {
      onReady();
      return;
    }
  } catch (e) {
    /* older model-viewer builds */
  }

  mv.addEventListener("load", onReady, { once: true });
  mv.addEventListener("error", () => {
    if (fallback) fallback.hidden = false;
  }, { once: true });
}

async function initModelViewerFallbacks() {
  try {
    await Promise.race([
      customElements.whenDefined("model-viewer"),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("model-viewer timeout")), 8000);
      }),
    ]);
  } catch (e) {
    return;
  }

  for (const mv of document.querySelectorAll("model-viewer")) {
    wireModelViewer(mv);
  }
}

initModelViewerFallbacks();
