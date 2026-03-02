# Deployment Guide

This document covers deploying the Fitness Program app as a **web app** and as **installable/mobile apps** (PWA, and optionally iOS/Android via Capacitor or Expo).

---

## 1. Environment variables

Set these in your host (e.g. Vercel **Settings → Environment Variables**). Do not commit them to the repo.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (include `?sslmode=require` for cloud databases). |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT/session signing. Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full public URL of the app, no trailing slash (e.g. `https://your-app.vercel.app`). |
| `AUTH_TRUST_HOST` | Optional | Set to `true` on Vercel if NextAuth has issues with host detection. |
| `ENABLE_DEMO_MODE` | Optional | Set to `true` to allow unauthenticated demo trainee in production. Omit for production login-only. |

---

## 2. Web deployment (Vercel + PostgreSQL)

### 2.1 Database

Create a PostgreSQL database with one of:

- [Vercel Postgres](https://vercel.com/storage)
- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

Copy the connection string and set it as `DATABASE_URL`.

### 2.2 Vercel project

1. Push the repo to GitHub/GitLab/Bitbucket and import it in [Vercel](https://vercel.com).
2. **Framework Preset:** Next.js (auto-detected).
3. **Build Command:** Default `npm run build` runs `prisma generate` and `next build`.  
   To run database migrations on every deploy, set **Build Command** to:  
   `npm run vercel-build`
4. **Environment variables:** Add `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` for Production (and Preview if needed).
5. Deploy. The first deploy will use the assigned URL (e.g. `https://fitness-program-app.vercel.app`). Set `NEXTAUTH_URL` to that URL (or your custom domain) if you had used a placeholder.

### 2.3 Migrations and seed (if not using vercel-build)

Run once from your machine with production `DATABASE_URL` set:

```bash
npx prisma migrate deploy
```

Optional: seed and demo data:

```bash
npm run db:seed
npm run db:demo
```

### 2.4 Custom domain

In Vercel: **Project → Settings → Domains**, add your domain and follow the DNS instructions. Then set `NEXTAUTH_URL` to that domain (e.g. `https://fitness.yourdomain.com`).

---

## 3. PWA (installable on phones)

The app is already set up as a PWA:

- **Manifest:** `app/manifest.ts` (name, icons, standalone display).
- **Icons:** `public/icon-192x192.png` and `public/icon-512x512.png` (replace with your own 192×192 and 512×512 PNGs for best results).
- **Service worker:** `public/sw.js`, registered by `ServiceWorkerRegister` in the root layout.

After deploying the web app:

- **Android:** Open the site in Chrome → menu → “Add to Home screen” or “Install app”.
- **iOS:** Open the site in Safari → Share → “Add to Home Screen”.

No app store submission is required for this.

---

## 4. Mobile apps (iOS / Android) – optional

For distribution via **App Store** and **Google Play**, you can use:

### Option A: Capacitor (WebView wrapper)

Wrap the deployed website in a native shell so it can be submitted as an app:

1. Create a Capacitor project (e.g. `npm create @capacitor/app`) and configure it to load your deployed URL (e.g. `https://your-app.vercel.app`).
2. Add iOS: `npx cap add ios` (requires Xcode and Apple Developer Program).
3. Add Android: `npx cap add android` (requires Android Studio and Google Play Console).
4. Build and submit to App Store Connect and Google Play Console.

Details: [Capacitor](https://capacitorjs.com).

### Option B: Expo / React Native (native app)

Build a separate mobile app (e.g. Expo) that calls your deployed Next.js API (`/api/auth/*`, `/api/programs`, `/api/sessions`, etc.). You will need a token-based login endpoint for the mobile client (e.g. a route that returns a JWT) and then use that token in the `Authorization` header for API requests.

Details: [Expo](https://expo.dev).

---

## 5. Required software and services (checklist)

### Accounts and services

- **Vercel** – [vercel.com](https://vercel.com) – Host Next.js (web).
- **Git provider** – GitHub / GitLab / Bitbucket – For repo and Vercel connection.
- **PostgreSQL** – Vercel Postgres, Neon, Supabase, or Railway (see links above).

### Optional

- **Custom domain** – Any registrar (e.g. Namecheap, Cloudflare) and DNS.
- **Apple Developer Program** – [developer.apple.com](https://developer.apple.com) – For iOS App Store (~$99/year).
- **Google Play Console** – [play.google.com/console](https://play.google.com/console) – For Android Play Store (one-time fee).
- **Capacitor** – [capacitorjs.com](https://capacitorjs.com) – For WebView-based iOS/Android apps.
- **Expo** – [expo.dev](https://expo.dev) – For native React Native apps.

### Local development and builds

- **Node.js** (v18+ LTS) – [nodejs.org](https://nodejs.org)
- **Git** – [git-scm.com](https://git-scm.com)
- **Xcode** (macOS) – For iOS builds and App Store submission.
- **Android Studio** – [developer.android.com/studio](https://developer.android.com/studio) – For Android builds and Play Store submission.

---

## 6. Demo mode in production

- By default, **production** requires login; unauthenticated users are redirected to `/login`.
- To allow the demo trainee (no login) in production, set `ENABLE_DEMO_MODE=true` in your host’s environment variables. Only enable this if you want a public demo.
