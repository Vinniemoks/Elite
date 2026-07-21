# Elite Tours – tooling

## `serve.js` – local static server
Serves the site locally with no dependencies.
```bash
node tools/serve.js 8000   # http://localhost:8000
```

## `check-live.js` – post-deploy live check
Confirms https://elitetours.co.ke is up and serving the right content, and
(optionally) that the API responds. Exits non-zero on failure so CI can gate on it.

```bash
# Production, single pass
node tools/check-live.js

# Poll for up to 10 minutes (use right after a push, while Pages deploys)
node tools/check-live.js --wait 10

# Site only, skip the API (backend not hosted yet)
SKIP_API=true node tools/check-live.js

# Point it anywhere (e.g. local dev)
SITE_URL=http://localhost:8000 API_URL=http://localhost:5001 node tools/check-live.js
```

### How it runs automatically
`.github/workflows/site-live-check.yml` runs this on every push to `main`,
on a 30-minute schedule, and on manual dispatch. It reports pass/fail in the
Actions tab so you know the moment the site is (or isn't) live.

## Deployment
The site deploys via **GitHub Pages → Deploy from a branch (`main`, `/`)**.
Every push to `main` publishes automatically; the `CNAME` file maps it to
`elitetours.co.ke`. No custom deploy workflow is needed.

When the backend is hosted at `api.elitetours.co.ke`, set `SKIP_API: 'false'`
in the workflow to verify the API health endpoint too.
