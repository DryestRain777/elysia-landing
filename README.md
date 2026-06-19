# Elysia Landing

This landing page is permanently hosted on GitHub Pages.

## Permanent shareable URL
- **Live site:** https://dryestrain777.github.io/elysia-landing/
- **Repository:** https://github.com/DryestRain777/elysia-landing

## How updates are published
Every push to the `main` branch automatically rebuilds and redeploys the site via
the workflow at `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages).

```bash
git add -A
git commit -m "Update site"
git push
```

## Local preview
Open `index.html` directly, or run a local server:

```bash
python3 -m http.server 4173
```
