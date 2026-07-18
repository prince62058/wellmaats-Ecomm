# wellmaats-Ecomm

A full-stack MERN e-commerce application with an admin panel, product management, cart, orders, payments (Razorpay), and image uploads (Cloudinary).

## Stack

- **Frontend**: React 18 + Vite, Redux Toolkit, React Router, Tailwind CSS, Radix UI
- **Backend**: Node.js + Express, MongoDB (Mongoose), JWT auth, Cloudinary, Razorpay

## How to Run

Two workflows run simultaneously:

| Workflow | Command | Port |
|---|---|---|
| **Start application** (webview) | `cd client && npm run dev -- --port 5000` | 5000 |
| **Backend** (console) | `cd server && PORT=5001 node server.js` | 5001 |

The Vite dev server proxies all `/api/*` requests to the Express backend on port 5001.

## Required Secrets

Set these in Replit Secrets:

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing JWTs
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret
- `RAZORPAY_KEY_ID` — Razorpay key ID
- `RAZORPAY_KEY_SECRET` — Razorpay key secret

## Project Structure

```
client/   — React frontend (Vite)
  src/
    components/   — UI components
    pages/        — Route pages (admin + shop)
    store/        — Redux slices
    hooks/        — Custom hooks
    config/       — Axios instance & config
server/   — Express backend
  controllers/  — Route handlers
  models/       — Mongoose models
  routes/       — API routes (auth, admin, shop, common)
  middleware/   — Auth middleware
  helpers/      — Cloudinary, Razorpay helpers
```

## User Preferences

- Keep existing project structure and stack as-is
