# Portfolio

Static portfolio site for GitHub Pages. No build step.

- `index.html` — **Pro** (professional work, white/pink day theme)
- `personal.html` — **Per** (personal projects, plum/pink night theme)
- `style.css` — shared styles; the theme is driven by `data-mode="pro|per"` on `<html>`
- `script.js` — fade-in on scroll for project cards (progressive enhancement)
- `assets/photo.jpg` — portrait (cropped to 7:8)
- `assets/projects/project-{1..4}.jpg` — project images (16:10; currently pink gradient placeholders)

Both pages have identical layout. Edit them in parallel when you change structure.

## Customize

1. Replace `you@example.com` in both HTML files with your email.
2. For each project: swap the image in `assets/projects/`, then set the title, tag, description, and `href` in the HTML.
3. Fill in the LinkedIn / Google Scholar links in the footer, and the `view more projects` link.

## Deploy to GitHub Pages

The repo is pushed to `jaewookng/jaewookang.github.io`. In that repo:
**Settings → Pages → Build and deployment** → Source: *Deploy from a branch*, Branch: `main` / `/ (root)`.

Note: GitHub only serves a repo at the root `https://<username>.github.io` when the repo is named exactly
`<username>.github.io`. With username `jaewookng`, that means the repo should be `jaewookng.github.io`;
as `jaewookang.github.io` it will be served at `https://jaewookng.github.io/jaewookang.github.io/` instead.
Everything here uses relative paths, so either URL works.

`.nojekyll` is included so GitHub serves the files as-is.
