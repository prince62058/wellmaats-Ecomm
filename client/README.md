# Mother Tatwa — Frontend

React + Vite storefront for Mother Tatwa (Wellmaats).

## Render deploy (Static Site)

| Setting | Value |
|---------|--------|
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### Environment variable (required at build time)

```
VITE_API_URL=https://backend-mother-tatwa.onrender.com
```

After deploy, set backend `CLIENT_URL` to this site's URL and redeploy the API.

## Local dev

```bash
npm install
cp .env.example .env
npm run dev
```

For local API: leave `VITE_API_URL` empty (Vite proxies to `localhost:5001`).
