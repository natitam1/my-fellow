# Deployment & Hosting Guide — My Fellow Ecosystem

This guide covers production deployment workflows for each application in the **My Fellow** monorepo across Render, EAS (Expo Application Services), and Vercel.

---

## 1. REST API Server (`apps/api`) — Render Web Service

- **Service Type**: Web Service
- **Environment**: Node / Bun
- **Root Directory**: `apps/api` (or monorepo root with `bun --filter my-fellow-api`)
- **Build Command**:
  ```bash
  bun install && bun run db:generate && bun run build
  ```
- **Start Command**:
  ```bash
  bun run start
  ```
- **Required Environment Variables**:
  - `PORT`: `3000`
  - `NODE_ENV`: `production`
  - `MONGO_URI`: MongoDB connection string
  - `DATABASE_URL`: PostgreSQL connection string (Prisma)
  - `JWT_SECRET`: Minimum 32-character secure secret
  - `GEEZ_API_KEY`: SMS OTP gateway production token
  - `JAMI_LIVE_TOKEN`, `JAMI_WEBHOOK_SECRET`: Giving payment processing

---

## 2. Telegram Bot (`apps/bot`) — Render Background Worker

- **Service Type**: Background Worker (Long Polling) or Web Service (Webhook)
- **Environment**: Node / Bun
- **Root Directory**: `apps/bot`
- **Build Command**:
  ```bash
  bun install && bun run build
  ```
- **Start Command**:
  ```bash
  bun run start
  ```
- **Required Environment Variables**:
  - `BOT_TOKEN`: Telegram bot token from `@BotFather`
  - `API_BASE_URL`: Deployed REST API endpoint

---

## 3. Mobile App (`apps/mobile`) — Expo Application Services (EAS)

- **Platform Targets**: Android (.apk / .aab) & iOS (.ipa)
- **Local Preparation**:
  ```bash
  cd apps/mobile
  bun install
  bunx expo-doctor
  ```
- **Build Commands**:
  - Android APK (Preview/Testing):
    ```bash
    bunx eas-cli build --platform android --profile preview
    ```
  - Android App Bundle (Production Google Play):
    ```bash
    bunx eas-cli build --platform android --profile production
    ```
  - iOS IPA (TestFlight & App Store):
    ```bash
    bunx eas-cli build --platform ios --profile production
    ```
- **OTA Updates (Over-The-Air)**:
  ```bash
  bun run update:production
  ```

---

## 4. Admin Dashboard (`apps/admin`) — Vercel

- **Framework Preset**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL of the deployed `my-fellow-api`

---

## 5. Public Website (`apps/website`) — Vercel

- **Framework Preset**: Next.js
- **Root Directory**: `apps/website`
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: URL of the deployed `my-fellow-api`
