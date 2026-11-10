# Issue 03: Mock Data Fallback Gating & Deterministic Offline Mode

## Overview
In several screens of `apps/mobile`, when network requests fail or when backend data is empty, mock data arrays (e.g. sample devotions, sample products, static leaders) are returned to maintain UI completeness. However, this fallback behavior is currently implicit and can mask backend API failures during staging and production testing.

## Proposed Solution
1. Introduce an explicit environment flag `EXPO_PUBLIC_ENABLE_MOCK_FALLBACK=true|false`.
2. Wrap all static fallback providers in `apps/mobile/services/*` and `apps/mobile/stores/*` with this feature gate.
3. In `production` builds, disable silent mock fallbacks and render standard error/empty state components with retry actions.
4. Provide a developer menu toggle inside the app settings to toggle offline simulation mode.

## Acceptance Criteria
- [ ] Production builds never display dummy/mock seed data on network failure.
- [ ] Explicit error banners and retry buttons are shown when API requests fail.
- [ ] Local development retains mock fallback capability when explicitly configured.
