# wellmaats-Ecomm

Full-stack MERN store (React + Express + MongoDB).

## Hostinger (Node.js Web App) — `wellmaats.in`

1. In hPanel, pick domain **wellmaats.in** → Next.
2. Choose **Import Git Repository** and use:
   `https://github.com/prince62058/wellmaats-Ecomm.git`
3. Branch: `main`
4. Build settings:

| Setting | Value |
|---------|--------|
| Node.js version | **20** |
| Install command | leave default / empty |
| Build command | `npm run build` |
| Start command | `npm start` |
| Entry file | `server/server.js` |

5. Add environment variables (required):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/mern-ecommerce?retryWrites=true&w=majority
CLIENT_URL=https://wellmaats.in
JWT_SECRET=use_a_long_random_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Leave `VITE_API_URL` unset so the frontend calls `/api` on the same domain.

6. Deploy. After first successful deploy, seed products (Hostinger terminal/SSH if available):

```bash
npm run seed
```

### MongoDB

Hostinger Node hosting does not include MongoDB. Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster and paste the connection string as `MONGODB_URI`.

## Local development

```bash
# Terminal 1 — API (Node 20/22)
cd server && cp .env.example .env && npm install && PORT=5001 npm run dev

# Terminal 2 — Vite
cd client && npm install && npm run dev
```
