# Portfolio

Static portfolio site for GitHub Pages. No build step.

- `index.html` — **Pro** (professional work, light/day theme)
- `personal.html` — **Per** (personal projects, dark/night theme)
- `style.css` — shared styles; the theme is driven by `data-mode="pro|per"` on `<html>`
- `assets/photo.jpg` — portrait (currently a gray placeholder — replace it)

Both pages have identical layout. Edit them in parallel when you change structure.

## Customize

1. Replace `assets/photo.jpg` with your photo (any size; it's cropped to 7:8).
2. Replace `you@example.com` in both HTML files with your email.
3. Fill in the four project cards on each page (label, title, one-line description, and `href`).

## Deploy to GitHub Pages

1. On GitHub, create a **public** repo named `<your-username>.github.io`.
2. From this folder:

   ```bash
   git remote add origin git@github.com:<your-username>/<your-username>.github.io.git
   git push -u origin main
   ```

3. In the repo: **Settings → Pages → Build and deployment** → Source: *Deploy from a branch*, Branch: `main` / `/ (root)`.
4. Your site is live at `https://<your-username>.github.io` within a minute or two.

`.nojekyll` is included so GitHub serves the files as-is.
