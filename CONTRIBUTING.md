# Contributing to My Fellow

Thank you for your interest in contributing to the **My Fellow** ecosystem! We welcome contributions from developers of all skill levels.

---

## 1. Development Principles

- **Zero Breaking Changes**: Preserve existing functionality, API contracts, and user flows.
- **Type Safety**: Strictly preserve TypeScript typing. Do not use blanket `@ts-ignore` or `any`.
- **Package Management**: Exclusively use [Bun](https://bun.sh) for managing dependencies and running scripts.
- **Privacy & Security**: Never commit real personal details, credentials, API keys, or database secrets.

---

## 2. Getting Started

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/<your-username>/my-fellow.git
   cd my-fellow
   ```

2. **Install Dependencies**:
   ```bash
   bun install
   ```

3. **Spin Up Local Services**:
   ```bash
   docker compose up -d
   bun --filter my-fellow-api db:push
   ```

4. **Run Application of Choice**:
   ```bash
   bun run dev:api
   # or
   bun run dev:mobile
   ```

---

## 3. Branching and Commit Standards

We follow Conventional Commits:

- `feat(scope): add new feature`
- `fix(scope): resolve bug`
- `docs(scope): update documentation`
- `refactor(scope): internal code refactor without behavior changes`
- `test(scope): add or improve test coverage`

Common scopes: `mobile`, `api`, `admin`, `website`, `bot`, `monorepo`.

---

## 4. Verification Checklist Before Opening a PR

Before submitting your Pull Request, ensure all quality gates pass:

- [ ] All packages typecheck cleanly: `bun run check-types`
- [ ] Linter reports 0 errors: `bun run lint`
- [ ] Automated tests pass: `bun run test`
- [ ] Applications build without errors: `bun run build`

---

## 5. Explore Good First Issues

Looking for somewhere to start? Check our curated roadmap issues in [`docs/issues/`](docs/issues/):
- `01-extract-packages-shared.md`: Move duplicated types into a shared workspace package.
- `02-openapi-and-typed-client.md`: Generate OpenAPI specs and strongly-typed API clients.
- `03-mock-data-fallback-gating.md`: Formalize mock data fallbacks and offline mode gating.
- `04-test-suites-expansion.md`: Expand automated test suites across client applications.
