"""Shared Playwright helpers for static-site screenshots (model-viewer, video)."""

import os
from pathlib import Path

_MV_LOAD_DEADLINE_MS = 120_000
_POST_MV_SETTLE_MS = 3_000

DEFAULT_BROWSER_CACHE = Path.home() / "Library" / "Caches" / "ms-playwright-amplify-book"


def ensure_playwright_browser_env() -> None:
    if not os.environ.get("PLAYWRIGHT_BROWSERS_PATH") and DEFAULT_BROWSER_CACHE.is_dir():
        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(DEFAULT_BROWSER_CACHE)


def scroll_lazy_roots(page) -> None:
    """Kick intersection observers / lazy roots so below-the-fold model-viewers mount."""
    page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(700)
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_timeout(400)


def wait_for_model_viewers(page) -> None:
    """Scroll each <model-viewer> into view and await its load event (WebGL scene)."""
    try:
        page.wait_for_function(
            "() => !!window.customElements && customElements.get('model-viewer') !== undefined",
            timeout=30_000,
        )
    except Exception:
        pass

    n = page.locator("model-viewer").count()
    for i in range(n):
        loc = page.locator("model-viewer").nth(i)
        try:
            loc.scroll_into_view_if_needed(timeout=15_000)
        except Exception:
            pass
        page.wait_for_timeout(650)

    page.evaluate(
        f"""
        async () => {{
          const els = [...document.querySelectorAll('model-viewer')];
          if (!els.length) return;
          const deadline = {_MV_LOAD_DEADLINE_MS};
          await Promise.all(
            els.map(
              (el) =>
                new Promise((resolve) => {{
                  const t = setTimeout(resolve, deadline);
                  const finish = () => {{
                    clearTimeout(t);
                    resolve(null);
                  }};
                  try {{
                    if (el.loaded === true) {{
                      finish();
                      return;
                    }}
                  }} catch (e) {{
                    /* older builds */
                  }}
                  el.addEventListener('load', finish, {{ once: true }});
                  el.addEventListener('error', finish, {{ once: true }});
                }})
            )
          );
        }}
        """
    )


def wait_for_videos(page) -> None:
    page.evaluate(
        """
        async () => {
          const vids = [...document.querySelectorAll('video')];
          await Promise.all(
            vids.map(
              (v) =>
                new Promise((resolve) => {
                  if (v.readyState >= 2) {
                    resolve(null);
                    return;
                  }
                  const t = setTimeout(resolve, 12000);
                  v.addEventListener(
                    'loadeddata',
                    () => {
                      clearTimeout(t);
                      resolve(null);
                    },
                    { once: true }
                  );
                })
            )
          );
        }
        """
    )


def prepare_heavy_media(page) -> None:
    """Ensure 3D models + poster meshes get time to render before screenshots."""
    page.wait_for_timeout(1800)
    scroll_lazy_roots(page)
    wait_for_model_viewers(page)
    wait_for_videos(page)
    page.wait_for_timeout(_POST_MV_SETTLE_MS)
