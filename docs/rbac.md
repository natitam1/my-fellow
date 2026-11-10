# Roles and permissions

The API is the authorization source of truth. Client-side checks only control
visibility and must never be treated as security controls.

## Roles

Roles are stored on MongoDB users:

1. `super_admin`
2. `leader`
3. `team_leader`
4. `coordinator`
5. `member`

`admin` and `user` remain accepted as legacy values during migration. The
authorization layer normalizes them to `super_admin` and `member`,
respectively, so existing tokens remain compatible until migration.

## Permission policy

The canonical permission list and role defaults are in
`my-fellow-api/src/rbac/permissions.ts`. Sensitive permissions are never
inherited by Leader, Team Leader, Coordinator, or Member:

- `members.contact.view`
- `finance.view`
- `pastoral_notes.view`
- `pastoral_notes.edit`
- `minors_data.view`
- `reports.export`
- `audit_logs.view`
- `audit_logs.export`

These are assigned through explicit `RoleGrant` documents by an authorized
Super Admin. Grants may have an expiry.

## Scope policy

Team-scoped operations use `TeamMembership` documents. Team Leaders and
Coordinators must have a membership for the target team; Super Admins and
Leaders can operate across teams. The server validates scope on every request.
Client-supplied role or team data is never trusted.

## Migration and rollback

Before migration:

1. Take a MongoDB snapshot/export of the users collection and related auth
   collections (`sessions`, `accounts`, and any existing role data).
2. Export PostgreSQL schema/data if the deployment uses the Prisma database.
3. Record the count and IDs of users with `role=admin` and `role=user`.
4. Verify that the deployment can restore the snapshots.

Run:

```bash
bun run rbac:migrate
```

If more than one legacy admin exists, the migration intentionally stops rather
than guessing the platform owner:

```bash
bun run rbac:migrate -- --super-admin-id=<mongo-user-id>
```

The selected existing legacy admin becomes `super_admin`; other legacy admins
become `leader`; legacy users become `member`. Role changes increment
`authVersion`, invalidating old JWTs at the next request. No
`ADMIN_PHONE_NUMBER` environment variable is used.

Rollback:

```bash
bun run rbac:rollback
```

Rollback maps `super_admin` and `leader` to legacy `admin`, all other roles to
legacy `user`, removes explicit grants/team memberships, and increments
`authVersion`. Restore the database snapshot if application data must also be
reverted.

## Video content deployment

The video library uses the Prisma `content_items` table. After deploying the
schema change, apply it through the normal database release process:

```bash
cd my-fellow-api
bun run db:push
```

Take a PostgreSQL snapshot before applying this change. Video binaries are
stored in Cloudinary; the database stores only the secure playback URL,
thumbnail URL, provider reference, publisher, and publication metadata.

## Role assignment safeguards

- Users cannot promote themselves.
- A caller cannot assign a role equal to or higher than their own.
- Only a Super Admin can assign Super Admin.
- The last Super Admin cannot be demoted.
- Role and grant changes increment `authVersion`.
- Denied and allowed permission decisions are recorded in `AuditLog`.
