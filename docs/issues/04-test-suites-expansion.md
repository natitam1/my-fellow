# Issue 04: Expand Automated Test Suites Across Mobile, Admin, and Bot

## Overview
While `apps/api` has 50 automated tests covering phone normalization, authentication rate limits, and payment validation, the remaining applications (`apps/mobile`, `apps/admin`, `apps/bot`, `apps/website`) primarily rely on TypeScript static type checking and ESLint without automated unit or integration tests.

## Proposed Solution
1. **Mobile (`apps/mobile`)**:
   - Set up Jest + `@testing-library/react-native`.
   - Add unit tests for Zustand state stores (`useAuthStore`, `useCommunityStore`, `useDevotionStore`).
   - Add unit tests for phone formatting, OTP input handling, and deep link parsing.
2. **Admin (`apps/admin`)**:
   - Set up Vitest or Jest with React Testing Library.
   - Add tests for RBAC route guards, giving ledger calculations, and coordinate input validation.
3. **Bot (`apps/bot`)**:
   - Add unit tests for Grammy bot handlers and command parsers using mock Telegram contexts.

## Acceptance Criteria
- [ ] `bun test` runs across all workspace packages via Turborepo (`turbo test`).
- [ ] At least 80% test coverage for critical business logic in stores and payment workflows.
