import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeRole,
  permissionsForRole,
  roleHasPermission,
} from "../src/rbac/permissions.js";

test("legacy roles normalize without losing compatibility", () => {
  assert.equal(normalizeRole("admin"), "super_admin");
  assert.equal(normalizeRole("user"), "member");
});

test("role permission matrix follows least privilege", () => {
  assert.equal(roleHasPermission("super_admin", "finance.view"), true);
  assert.equal(roleHasPermission("super_admin", "users.manage"), true);
  assert.equal(roleHasPermission("leader", "reports.view"), true);
  assert.equal(roleHasPermission("leader", "users.manage"), true);
  assert.equal(roleHasPermission("leader", "finance.view"), false);
  assert.equal(roleHasPermission("team_leader", "attendance.record"), true);
  assert.equal(roleHasPermission("team_leader", "teams.manage"), true);
  assert.equal(roleHasPermission("team_leader", "users.manage"), false);
  assert.equal(roleHasPermission("team_leader", "roles.assign_super_admin"), false);
  assert.equal(roleHasPermission("coordinator", "attendance.record"), true);
  assert.equal(roleHasPermission("coordinator", "members.contact.view"), false);
  assert.equal(roleHasPermission("coordinator", "teams.manage"), false);
  assert.equal(roleHasPermission("member", "finance.give"), true);
  assert.equal(roleHasPermission("member", "members.view"), false);
  assert.equal(roleHasPermission("member", "teams.manage"), false);
  assert.equal(roleHasPermission("member", "users.manage"), false);
  assert.equal(roleHasPermission("member", "settings.manage"), false);
});

test("explicit grants add sensitive access without changing role", () => {
  assert.equal(
    roleHasPermission("leader", "finance.view", ["finance.view"]),
    true,
  );
  assert.equal(
    permissionsForRole("leader").has("pastoral_notes.view"),
    false,
  );
});
