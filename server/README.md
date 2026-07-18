# Mother Tatwa — Backend API

Express + MongoDB API for Mother Tatwa (Wellmaats).

**Live:** https://backend-mother-tatwa.onrender.com  
**Frontend:** https://frontend-tatwa.onrender.com

## Render deploy

| Setting | Value |
|---------|--------|
| Root Directory | `.` (repo root) |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Environment variables (production)

```
NODE_ENV=production
MONGODB_URI=your_atlas_uri
CLIENT_URL=https://frontend-tatwa.onrender.com
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

After first deploy, open **Shell** and run:

```bash
node seed.js
```

## Local dev

```bash
npm install
cp .env.example .env   # fill in values
npm run dev
```

Default port: `5001` (set `PORT` in `.env`).
