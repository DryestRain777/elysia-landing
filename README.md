# Elysia Landing

This landing page is now configured for permanent hosting on GitHub Pages.

## Permanent shareable URL
After the first push to GitHub, your site will be available at:

- `https://<your-github-username>.github.io/elysia-landing/`

## One-time publish steps
1. Create a new GitHub repository named `elysia-landing`.
2. Push this folder to the `main` branch.
3. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` will deploy automatically on each push.

## Local preview
Open `index.html` directly, or run a local server:

```bash
python3 -m http.server 4173
```
