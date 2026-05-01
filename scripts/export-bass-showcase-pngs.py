#!/usr/bin/env python3
"""Export acoustic, double, and fretless bass showcase <model-viewer> tiles from bass.html as PNGs."""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from playwright_site_helpers import ensure_playwright_browser_env, prepare_heavy_media

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "assets" / "book"
BASE_URL = "http://127.0.0.1:8899"

SHOWCASE_EXPORTS = [
    ("model-viewer.bass-showcase__mv--acoustic", "bass-showcase-acoustic.png"),
    ("model-viewer.bass-showcase__mv--double", "bass-showcase-double.png"),
    ("model-viewer.bass-showcase__mv--fretless", "bass-showcase-fretless.png"),
]


def main() -> None:
    ensure_playwright_browser_env()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    url = f"{BASE_URL}/bass.html"
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-dev-shm-usage"],
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=90_000)
        prepare_heavy_media(page)

        for selector, filename in SHOWCASE_EXPORTS:
            loc = page.locator(selector)
            loc.scroll_into_view_if_needed(timeout=15_000)
            page.wait_for_timeout(900)
            out_path = OUT_DIR / filename
            loc.screenshot(path=str(out_path), animations="disabled")
            print(url, selector, "->", out_path.relative_to(REPO))

        context.close()
        browser.close()


if __name__ == "__main__":
    main()
