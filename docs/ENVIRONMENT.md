# Environment Variables Specification

This document details every environment variable used across the **My Fellow** monorepo, specifying requirements, defaults, and local stubbing instructions.

---

## 1. Master Variable Reference

| Variable | Target App(s) | Required | Default / Example | Purpose & Notes |
| :--- | :--- | :---: | :--- | :--- |
| `NODE_ENV` | All | No | `development` | Node runtime mode (`development`, `production`, `test`). |
| `PORT` | `apps/api` | No | `3000` | Local port for REST API server. |
| `DATABASE_URL` | `apps/api` | Yes | `postgresql://fellow:fellow@localhost:5432/myfellow` | PostgreSQL connection string for Prisma 7. |
| `MONGO_URI` | `apps/api` | Yes | `mongodb://localhost:27017/myfellow` | MongoDB connection string for Mongoose. |
| `JWT_SECRET` | `apps/api` | Yes | `secret_development_jwt_key_min_32_chars` | Secret key for signing and verifying JWT tokens. |
| `JWT_EXPIRES_IN`| `apps/api` | No | `30d` | JWT session lifetime duration. |
| `GEEZ_API_KEY` | `apps/api` | No (in dev) | `stub_key` | GeezSMS API key for sending Ethiopian OTP SMS. In development, OTP is printed to console if omitted. |
| `CLOUDINARY_CLOUD_NAME` | `apps/api` | No | `sample` | Cloudinary storage bucket name for devotion & profile images. |
| `CLOUDINARY_API_KEY` | `apps/api` | No | `sample_key` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | `apps/api` | No | `sample_secret` | Cloudinary API secret. |
| `JAMI_DEV_TOKEN`| `apps/api` | No | `jami_test_token` | Jami payment sandbox authorization token for giving checkouts. |
| `JAMI_LIVE_TOKEN`| `apps/api` | No | `jami_live_token` | Production Jami payment authorization token. |
| `JAMI_WEBHOOK_SECRET` | `apps/api` | No | `webhook_secret` | Cryptographic secret for verifying Jami checkout callback payloads. |
| `ADMIN_PHONE` | `apps/api` | No | `0900000001` | Default phone target for `bun run admin:promote`. |
| `EXPO_PUBLIC_API_URL` | `apps/mobile` | No | `http://localhost:3000` | REST API base endpoint for mobile client. Set to production URL on Render for release builds. |
| `NEXT_PUBLIC_API_URL` | `apps/admin`, `apps/website` | No | `http://localhost:3000` | REST API base endpoint for Next.js web applications. |
| `BOT_TOKEN` | `apps/bot` | Yes | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` | Telegram Bot token obtained from `@BotFather`. |
| `API_BASE_URL` | `apps/bot` | No | `http://localhost:3000` | REST API base endpoint called by the Telegram bot. |

---

## 2. Zero-Cost Local Development Setup

To run the full stack locally without any external paid subscriptions:

1. **Databases**: Start local MongoDB and PostgreSQL using the root Docker Compose setup:
   ```bash
   docker compose up -d
   ```
2. **OTP in Development**: When `GEEZ_API_KEY` is not provided, the API service logs the 6-digit OTP code directly to the standard output, allowing seamless login testing.
3. **Payments in Sandbox**: Jami calls gracefully fallback to simulated completion during development.
