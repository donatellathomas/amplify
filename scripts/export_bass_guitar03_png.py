#!/usr/bin/env python3
"""Headless export of BassGuitar03 glb via model-viewer (same env/reflection as the site)."""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "assets" / "exports" / "BassGuitar03-reflection.png"
PORT = 8877


def main() -> None:
    out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUT
    out.parent.mkdir(parents=True, exist_ok=True)

    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(0.8)
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
            page.goto(
                f"http://127.0.0.1:{PORT}/export-bass-guitar03-png.html",
                wait_until="networkidle",
                timeout=180_000,
            )
            page.wait_for_selector("model-viewer#mv", timeout=120_000)
            page.evaluate(
                """async () => {
                  const mv = document.getElementById('mv');
                  await mv.loaded;
                  await mv.updateComplete;
                  for (let i = 0; i < 12; i++) {
                    await new Promise((r) => requestAnimationFrame(r));
                  }
                }"""
            )
            time.sleep(1.5)
            # Element screenshot captures the lit canvas more reliably than toBlob() in CI headless GL.
            page.locator("model-viewer#mv").screenshot(path=str(out))
            browser.close()
        print(str(out))
    finally:
        server.terminate()
        try:
            server.wait(timeout=8)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    main()
