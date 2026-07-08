# Elysia Landing

This landing page is permanently hosted on GitHub Pages with a custom domain.

## Live URLs
- **Custom domain:** https://elysiabiosci.com (DNS via Hostinger)
- **GitHub Pages:** https://dryestrain777.github.io/elysia-landing/
- **Repository:** https://github.com/DryestRain777/elysia-landing

The custom domain is bound through the `CNAME` file at the repo root, which is
included in every deploy so the domain stays connected across builds.

## Hostinger DNS records
Point the domain at GitHub Pages from Hostinger's DNS zone editor:

| Type  | Name / Host | Value                   |
| ----- | ----------- | ----------------------- |
| A     | @           | 185.199.108.153         |
| A     | @           | 185.199.109.153         |
| A     | @           | 185.199.110.153         |
| A     | @           | 185.199.111.153         |
| CNAME | www         | dryestrain777.github.io |

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
