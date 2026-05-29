# Amplify

Static site for the Amplify instrument reference project.

## Preview locally

The 3D models and large assets need a local web server. From the repo root:

```bash
python3 -m http.server 8899 --bind 127.0.0.1
```

Then open [http://127.0.0.1:8899/index.html](http://127.0.0.1:8899/index.html).

Opening HTML files directly (`file://`) often blocks GLB loading, which makes the gallery look empty.

## GitHub Pages

Workflow: `.github/workflows/deploy-github-pages.yml`

After pushing to `main`, enable GitHub Pages (Settings → Pages → Source: GitHub Actions). The site URL will be:

`https://donatellathomas.github.io/amplify/`

This branch is ahead of `origin/main` — push your latest commits (including `assets/` and `js/vendor/model-viewer.min.js`) so images and 3D models deploy.
