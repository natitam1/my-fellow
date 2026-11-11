# 4 Kilo Fellowship Ecosystem — Agent & Developer Guide

This repository hosts the complete open-source digital ecosystem for the **4 Kilo Christian Students Fellowship (AAU ECSF)** as a unified Bun workspaces and Turborepo monorepo.

---

## 1. Monorepo Applications & Structure

| Directory | Tech Stack | Role | Target Port / Environment |
| :--- | :--- | :--- | :--- |
| **`apps/mobile`** | Expo SDK 58, React Native 0.88, NativeWind, Bun | Cross-platform mobile client (Android & iOS) | Expo Dev Server (`8081`) / EAS |
| **`apps/api`** | Node.js (v24), Express 5, Prisma 7, PostgreSQL, MongoDB, Bun | Backend REST API server | Port `3000` / Render |
| **`apps/web`** | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Bun | Unified public web app, student portal, and admin dashboard | Next.js Dev (`3000`) / Vercel |
| **`apps/bot`** | Grammy.js, TypeScript, Axios, Bun | Telegram community automation bot | Long Polling / Webhook / Render |
| **`packages/shared`** | TypeScript (Workspace Package) | Shared contracts, types, and validators | Monorepo internal |
| **`docs/`** | Markdown Documentation | Architecture, Environment, Deployment, API | Specification reference |

---

## 2. Package Management Standard: Bun Workspaces

The entire monorepo strictly standardizes on **Bun** as the package manager with a single root `bun.lock`:
- Install dependencies at root: `bun install`
- Run task pipelines via Turborepo: `bun run build`, `bun run test`, `bun run lint`, `bun run check-types`
- Run individual applications:
  ```bash
  bun run dev:mobile   # Starts Expo dev server
  bun run dev:web      # Starts Next.js unified web app & admin portal
  bun run dev:api      # Starts API server with hot-reload
  bun run dev:bot      # Starts Telegram bot
  ```
- **Do not commit** per-application lockfiles (`bun.lock`, `package-lock.json`, `yarn.lock`).

---

## 3. Local Development (Zero-Cost Onboarding)

New contributors can run the full ecosystem locally without paid third-party accounts:
1. Copy `.env.example` to `.env` or create appropriate `.env` files in `apps/*`.
2. Start local MongoDB and PostgreSQL instances:
   ```bash
   docker compose up -d
   ```
3. Initialize the Prisma database schema:
   ```bash
   bun --filter my-fellow-api db:push
   ```
4. **Development OTP**: When `GEEZ_API_KEY` is omitted, `apps/api` logs the 6-digit OTP code directly to standard output for instant login verification.

---

## 4. Authentication Architecture

The mobile client and REST backend implement passwordless phone-only authentication tailored for Ethiopian mobile networks:

1. **Passwordless Phone OTP**:
   - Accepts Ethiopian mobile numbers (`09...`, `07...`, `+251...`).
   - Normalizes all formats to E.164 (`+251...`) standard.
   - SMS delivery dispatched via GeezSMS gateway with a 60-second rate-limiting cooldown per phone number.
   - 6-digit OTP verified using constant-time hash comparison with 5-minute expiration.
2. **Backend Authentication Endpoints**:
   - `POST /api/auth/phone/send-otp`: Sends 6-digit OTP code.
   - `POST /api/auth/phone/verify-otp`: Verifies OTP, upserts user account, issues JWT token, and returns `isNewUser: boolean`.
   - `POST /api/auth/signin`: Preserved for administrative password-based logins (`apps/admin`).
3. **Onboarding & Fellowship Profile Flow**:
   - First-time users or profiles missing required fields are guided to profile personalization (full name, ministry team, academic department, academic year).
   - Returning members transition seamlessly into the main application tabs.

---

## 5. Coding Agent Guidelines

1. **Type Safety**: Strictly preserve TypeScript typing. Avoid `any`, blanket `@ts-ignore`, or disabling compiler strictness.
2. **Behavioral Integrity**: Monorepo refactors must preserve exact runtime behavior. Changes to shared packages or database migrations must be isolated, verified, and accompanied by automated tests.
3. **Expo Package Alignment**: When modifying Expo dependencies, verify alignment with `bunx expo-doctor` and `bunx tsc --noEmit`.
