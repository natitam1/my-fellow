# Issue 02: Generate OpenAPI Specification & Strongly-Typed API Client

## Overview
Currently, API calls across `apps/mobile`, `apps/admin`, and `apps/bot` rely on handcrafted Axios/fetch calls and manually maintained request/response types. Discrepancies between backend responses and client expectations can introduce subtle runtime bugs.

## Proposed Solution
1. Introduce Swagger / OpenAPI 3.1 documentation generation in `apps/api` (e.g. using `tsoa`, `@asteasolutions/zod-to-openapi`, or route annotations).
2. Host Swagger UI at `/api/docs` during development.
3. Generate a strongly-typed TypeScript SDK or `@hey-api/openapi-ts` / `openapi-fetch` client into `packages/api-client`.
4. Migrate client repositories to consume the generated client.

## Acceptance Criteria
- [ ] `apps/api` exports a deterministic `openapi.json` artifact on build.
- [ ] CI validates that the OpenAPI spec matches committed contracts.
- [ ] End-to-end type safety between backend endpoints and client consumers.
