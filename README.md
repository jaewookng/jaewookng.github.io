# Portfolio

Static portfolio site for GitHub Pages. No build step.

- `index.html` — **Pro** (professional work, white/pink day theme)
- `personal.html` — **Per** (personal projects, plum/pink night theme)
- `style.css` — shared styles; the theme is driven by `data-mode="pro|per"` on `<html>`
- `script.js` — progressive enhancement: fade-in on scroll, the cursor-following pipette, the gel scroll-nav, and the cursor-following dot glow. Without JS everything still works as plain links.
- `assets/photo.jpg` — portrait (cropped to 7:8)
- `assets/projects/project-{1..4}.jpg` — project images (16:10; currently pink gradient placeholders)

Both pages have identical layout. Edit them in parallel when you change structure.

## Interactive bits

- **Dot grid** — a fixed layer masked to a grid of dots; a red hotspot inside it eases toward the cursor (`.dots` / `.dots__glow`). Tune colours with `--dots-*` and spacing with `--dot-gap` / `--dot-size` in `style.css`.
- **Micropipette** — rests beside the Pro/Per switch; move the pointer into the toggle area and it becomes your cursor, leave and it glides back. The switch itself navigates instantly; the theme cross-fades via the View Transitions API where supported.
- **Footer** — full-bleed, inverted: black on Pro, white on Per (`--footer-*` tokens).
- **Gel scroll-nav** — a lane on the right edge with one band per section (`#about`, `#work`, `#contact`); the dye front tracks scroll and the passed band glows. Hidden under 900px.

## Customize

1. Replace `you@example.com` in both HTML files with your email.
2. For each project: swap the image in `assets/projects/`, then set the title, tag, description, and `href` in the HTML.
3. Fill in the LinkedIn / Google Scholar links in the footer, and the `view more projects` link.

## Deploy to GitHub Pages

The repo is pushed to `jaewookng/jaewookng.github.io`. In that repo:
**Settings → Pages → Build and deployment** → Source: *Deploy from a branch*, Branch: `main` / `/ (root)`.

The site is served at `https://jaewookng.github.io`.

`.nojekyll` is included so GitHub serves the files as-is.
