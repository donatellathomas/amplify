#!/usr/bin/env python3
"""Full-page PNG screenshots of static HTML pages via local HTTP + Playwright."""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from playwright_site_helpers import ensure_playwright_browser_env, prepare_heavy_media

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "assets" / "book" / "site-screenshots"
BASE_URL = "http://127.0.0.1:8899"

# Main site pages (exclude internal export-* tooling HTML).
PAGES = [
    "index.html",
    "bass.html",
    "bass-electric.html",
    "bass-electric-repairs.html",
    "bass-electric-repair-string-change.html",
    "bass-electric-diagram.html",
    "bass-electric-diagram-ibanez-iv1sr.html",
]


def hover_nav_flyout_open(page) -> None:
    """Site nav uses mouseenter on `.nav-dropdown` (see nav-instruments-dropdown.js)."""
    trigger = page.locator("#nav-instruments-trigger")
    trigger.hover(timeout=10_000)
    page.wait_for_timeout(550)
    menu = page.locator("#nav-instruments-menu")
    try:
        bass = menu.locator(".nav-flyout__shadow--l1").locator(
            "> ul > li.nav-flyout__tier > a.nav-flyout__hit"
        ).first
        bass.hover(timeout=5000)
        page.wait_for_timeout(500)
    except Exception:
        pass


def main() -> None:
    ensure_playwright_browser_env()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
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
        for html_name in PAGES:
            path = REPO / html_name
            if not path.is_file():
                print(f"skip missing: {html_name}")
                continue
            url = f"{BASE_URL}/{html_name}"
            out_file = OUT_DIR / (path.stem + ".png")
            out_nav = OUT_DIR / (path.stem + "-nav-open.png")
            print(url, "->", out_file.relative_to(REPO))
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=90_000)
            except Exception as e:
                print(f"  goto error: {e}")
                continue

            prepare_heavy_media(page)
            page.screenshot(path=str(out_file), full_page=True)

            print(url, "->", out_nav.relative_to(REPO), "(nav)")
            hover_nav_flyout_open(page)
            page.wait_for_timeout(500)
            page.screenshot(path=str(out_nav), full_page=True)

        context.close()
        browser.close()


if __name__ == "__main__":
    main()
