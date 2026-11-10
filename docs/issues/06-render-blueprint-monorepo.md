# Issue 06: Unify Hosting Deployments with Render Blueprint Infrastructure as Code

## Overview
Currently, the REST API (`apps/api`) and Telegram Bot (`apps/bot`) are configured as standalone manual services on Render. Consolidating the infrastructure into a single declarative Render Blueprint (`render.yaml`) enables reproducible, zero-configuration staging and production deployments directly from the monorepo.

## Proposed Solution
1. Create `render.yaml` at the root of the monorepo.
2. Define services:
   - `my-fellow-api`: Web service built from `apps/api` with Bun build command and health check endpoint `/health`.
   - `my-fellow-bot`: Background worker or web service running `apps/bot`.
   - Managed PostgreSQL and Redis/Key-Value store references.
3. Parameterize environment variables across services with automatic secret generation for `JWT_SECRET`.

## Acceptance Criteria
- [ ] Validated `render.yaml` blueprint with Render CLI / validation schema.
- [ ] Staging and production environments can be provisioned in a single click from the monorepo root.
