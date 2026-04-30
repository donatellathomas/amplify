#!/usr/bin/env python3
"""Export Keys.glb as a horizontal, front-facing PNG (matches export-keys-front-horizontal-png.html)."""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "exports" / "Keys-front-horizontal.png"
PORT = 8881


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)

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
                viewport={"width": 2000, "height": 1200},
                device_scale_factor=1,
            )
            page = context.new_page()
            page.goto(
                f"http://127.0.0.1:{PORT}/export-keys-front-horizontal-png.html",
                wait_until="networkidle",
                timeout=180_000,
            )
            page.wait_for_selector("model-viewer#mv", timeout=120_000)
            page.evaluate(
                """async () => {
                  const mv = document.getElementById('mv');
                  await mv.loaded;
                  mv.orientation = '0deg 0deg 180deg';
                  mv.cameraOrbit = '118deg 73deg auto';
                  await mv.updateComplete;
                  if (typeof mv.jumpCameraToGoal === 'function') {
                    mv.jumpCameraToGoal();
                    await mv.updateComplete;
                  }
                  for (let i = 0; i < 24; i++) {
                    await new Promise((r) => requestAnimationFrame(r));
                  }
                }"""
            )
            time.sleep(2)
            page.locator("model-viewer#mv").screenshot(path=str(OUT))
            browser.close()
        print(OUT.resolve())
    finally:
        server.terminate()
        try:
            server.wait(timeout=8)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    main()
