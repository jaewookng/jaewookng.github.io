# Portfolio

Static portfolio site for GitHub Pages. No build step.

- `index.html` — **Pro** (professional work, white/pink day theme)
- `personal.html` — **Per** (personal projects, plum/pink night theme)
- `style.css` — shared styles; the theme is driven by `data-mode="pro|per"` on `<html>`
- `script.js` — progressive enhancement: fade-in on scroll, the cursor-following pipette, the gel scroll-nav, and the cursor-following dot glow. Without JS everything still works as plain links.
- `assets/photo.jpg` — portrait for the Pro page; `assets/photo-personal.jpg` — portrait for the Per page (both cropped to 7:8)
- `assets/projects/project-{1..4}.jpg` — project images (16:10; currently pink gradient placeholders)

Both pages have identical layout but their own copy (about text, project cards). Edit them in parallel when you change structure.

Assets and the Pro/Per toggle links carry a version query (`style.css?v=N`, `personal.html?v=N`). Bump `N` everywhere in both pages whenever you change anything, so a page switch always fetches fresh copies (the `?v=` is stripped from the address bar on load). GitHub Pages caches every file for 10 minutes, so a direct visit to a URL you've already opened can still show the previous version for up to that long; a hard refresh (⌘⇧R) clears it.

## Interactive bits

- **Dot grid** — a fixed layer masked to a grid of dots; a red hotspot inside it eases toward the cursor (`.dots` / `.dots__glow`). Tune colours with `--dots-*` and spacing with `--dot-gap` / `--dot-size` in `style.css`.
- **Sterile station** — a rounded brushed-steel hood under the portrait that holds the pipette and the Pro/Per switch (`--station-*` tokens; light steel on Pro, dark on Per). The cursor is a hand inside it; move onto the station and the hand picks the pipette up by its body; while held, clicks register at the tip (the button under the tip is highlighted). Leave and it glides back. Switching pages while holding it hands the position to the next page, so it doesn't jump. The switch itself navigates instantly; the theme cross-fades via the View Transitions API where supported.
- **Footer** — full-bleed, inverted: black on Pro, white on Per (`--footer-*` tokens).
- **DNA-ladder scroll-nav** — a black lane on the right edge with four white bands of varying thickness and a bloomy glow, unevenly spaced like a real ladder. The three thick bands are the `#about` / `#work` / `#contact` links; the one for the section in view glows harder. Hover the lane for bp labels; the dye front tracks scroll. Positions are `--p`, thickness `--h`, in the HTML. Hidden under 900px wide or 460px tall.

## Customize

1. For each project: swap the image in `assets/projects/`, then set the title, tag, description, and `href` in the HTML.
2. Set the YouTube channel URL in the footer (LinkedIn is already linked), and the `view more projects` link.

## Deploy to GitHub Pages

The repo is pushed to `jaewookng/jaewookng.github.io`. In that repo:
**Settings → Pages → Build and deployment** → Source: *Deploy from a branch*, Branch: `main` / `/ (root)`.

The site is served at `https://jaewookng.github.io`.

`.nojekyll` is included so GitHub serves the files as-is.
