# Issue 01: Extract Shared Code to `packages/shared`

## Overview
Currently, types (e.g. `User`, `Devotion`, `Leader`, `Team`, `Payment`), validation logic (Ethiopian phone normalization regex `^(\+251|0)?(9|7)[0-9]{8}$`), and common constants are duplicated across `apps/mobile`, `apps/api`, `apps/admin`, and `apps/bot`.

## Proposed Solution
1. Create workspace package `packages/shared` with:
   - `packages/shared/src/types/`: Domain models and API DTOs.
   - `packages/shared/src/validators/`: Zod schemas for auth, join requests, givings, devotions.
   - `packages/shared/src/utils/`: Phone normalization (`normalizePhone`, `isValidEthiopianPhone`).
   - `packages/shared/src/constants/`: Teams, leadership roles, academic years.
2. Export TypeScript declaration maps and ESM modules.
3. Reference `"@my-fellow/shared": "workspace:*"` inside `apps/*/package.json`.

## Acceptance Criteria
- [ ] `packages/shared` builds cleanly via Bun/Turbo.
- [ ] Duplicated types in mobile, api, admin, and bot replaced by imports from `@my-fellow/shared`.
- [ ] All apps compile cleanly with 0 TypeScript errors.
