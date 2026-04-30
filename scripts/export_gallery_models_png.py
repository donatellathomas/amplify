#!/usr/bin/env python3
"""PNG exports for Drum02, Guitar02, and Keys.glb using gallery reflection envs (see index.html)."""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORTS = ROOT / "assets" / "exports"
PORT = 8879

MODELS = (
    ("drum", "Drum02-reflection.png"),
    ("guitar", "Guitar02-reflection.png"),
    ("keys", "Keys-reflection.png"),
)


def main() -> None:
    EXPORTS.mkdir(parents=True, exist_ok=True)

    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(0.85)
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=(
                    "--enable-webgl",
                    "--enable-webgl2",
                    "--ignore-gpu-blocklist",
                    "--use-gl=angle",
                    "--use-angle=swiftshader",
                ),
            )
            context = browser.new_context(
                viewport={"width": 1280, "height": 1280},
                device_scale_factor=2,
            )
            page = context.new_page()

            for slug, filename in MODELS:
                out = EXPORTS / filename
                page.goto(
                    f"http://127.0.0.1:{PORT}/export-gallery-instrument-png.html?model={slug}",
                    wait_until="networkidle",
                    timeout=180_000,
                )
                page.wait_for_selector("model-viewer#mv", timeout=120_000)
                page.evaluate(
                    """async () => {
                      const mv = document.getElementById('mv');
                      await mv.loaded;
                      await mv.updateComplete;
                      for (let i = 0; i < 14; i++) {
                        await new Promise((r) => requestAnimationFrame(r));
                      }
                    }"""
                )
                time.sleep(1.2)
                page.locator("model-viewer#mv").screenshot(path=str(out))
                print(out)

            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=8)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    main()
