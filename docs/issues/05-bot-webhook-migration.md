# Issue 05: Migrate Telegram Bot from Long Polling to Production Webhooks

## Overview
Currently, `apps/bot` uses Telegram long polling (`bot.start()`) to receive incoming updates. In production deployments (such as Render or serverless environments), long polling holds active connections indefinitely, incurs restart latencies, and prevents horizontal scaling.

## Proposed Solution
1. Add webhook support to `apps/bot` using Grammy's `webhookCallback(bot, "express")` or `webhookCallback(bot, "std/http")`.
2. Introduce environment variables:
   - `BOT_MODE=polling|webhook` (defaults to `polling` in development, `webhook` in production).
   - `WEBHOOK_URL=https://bot.myfellow.org/telegram/webhook`.
   - `WEBHOOK_SECRET=...` (Telegram secret token header verification).
3. Update server startup in `apps/bot/src/index.ts` to switch between `bot.start()` and webhook handler.

## Acceptance Criteria
- [ ] Bot operates with zero latency over HTTPS webhook in production.
- [ ] Polling mode remains default for local development.
- [ ] Webhook requests are verified using Telegram's secret token header.
