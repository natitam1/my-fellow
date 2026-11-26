import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { isAllowedReturnUrl } from "../src/controllers/payment.controller.js";
import { isAllowedCorsOrigin } from "../src/app.js";
import { updateProfileSchema } from "../src/validators/auth.validator.js";
import { RbacController } from "../src/controllers/rbac.controller.js";
import { AdminController } from "../src/controllers/admin.controller.js";
import { UserModel } from "../src/models/user.model.js";

function createMockRes() {
  let statusCode = 200;
  let body: unknown = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  };
  return { res: res as any, getStatus: () => statusCode, getBody: () => body };
}

test("isAllowedReturnUrl strictly enforces scheme and origin allowlist", () => {
  assert.equal(isAllowedReturnUrl("my-fellow://giving/complete"), true);
  assert.equal(isAllowedReturnUrl("https://my-fellow.vercel.app/giving"), true);
  assert.equal(isAllowedReturnUrl("https://my-fellow-web-git-main.vercel.app/pay"), true);
  assert.equal(isAllowedReturnUrl("https://t.me/myfellowbot"), true);
  assert.equal(isAllowedReturnUrl("http://localhost:3000/giving"), true);

  assert.equal(isAllowedReturnUrl("https://evil.com/phish"), false);
  assert.equal(isAllowedReturnUrl("https://my-fellow.evil.com/pay"), false);
  assert.equal(isAllowedReturnUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedReturnUrl("http://localhost/no-port"), false);
  assert.equal(isAllowedReturnUrl(""), false);
});

test("isAllowedCorsOrigin allows trusted origins and rejects arbitrary domains", () => {
  assert.equal(isAllowedCorsOrigin("https://my-fellow.vercel.app"), true);
  assert.equal(isAllowedCorsOrigin("https://my-fellow-preview.vercel.app"), true);
  assert.equal(isAllowedCorsOrigin("https://fellow.primeuat.app"), true);
  assert.equal(isAllowedCorsOrigin("http://localhost:3000"), true);

  assert.equal(isAllowedCorsOrigin("https://evil.onrender.com"), false);
  assert.equal(isAllowedCorsOrigin("https://evil.com"), false);
});

test("updateProfileSchema strips phoneNumber to prevent unverified phone overwrite", () => {
  const parsed = updateProfileSchema.parse({
    fullName: "Abebe Kebede",
    phoneNumber: "0999999999",
    department: "CS",
  }) as Record<string, unknown>;

  assert.equal(parsed.fullName, "Abebe Kebede");
  assert.equal(parsed.department, "CS");
  assert.equal("phoneNumber" in parsed, false);
});

test("RbacController.assignRole blocks lower/equal roles from demoting higher/equal roles", async () => {
  const originalFindById = UserModel.findById;
  const targetId = new mongoose.Types.ObjectId().toString();
  const actorId = new mongoose.Types.ObjectId().toString();

  (UserModel as any).findById = () => ({
    select: async () => ({ _id: targetId, role: "super_admin", authVersion: 0 }),
  });

  try {
    const { res, getStatus } = createMockRes();
    await RbacController.assignRole(
      {
        params: { userId: targetId },
        body: { role: "member" },
        user: { sub: actorId, phoneNumber: "0911000000", role: "leader" },
      } as any,
      res,
    );
    assert.equal(getStatus(), 403);
  } finally {
    UserModel.findById = originalFindById;
  }
});

test("RbacController.assignTeamRole blocks leader from modifying super_admin", async () => {
  const originalFindById = UserModel.findById;
  const targetId = new mongoose.Types.ObjectId().toString();
  const teamId = new mongoose.Types.ObjectId().toString();
  const actorId = new mongoose.Types.ObjectId().toString();

  (UserModel as any).findById = () => ({
    select: async () => ({ _id: targetId, role: "super_admin", authVersion: 0 }),
  });

  try {
    const { res, getStatus } = createMockRes();
    await RbacController.assignTeamRole(
      {
        params: { userId: targetId, teamId },
        body: { role: "coordinator" },
        user: { sub: actorId, phoneNumber: "0911000000", role: "leader" },
      } as any,
      res,
    );
    assert.equal(getStatus(), 403);
  } finally {
    UserModel.findById = originalFindById;
  }
});

test("AdminController.broadcastNotification rejects non-string targetId payloads", async () => {
  const { res, getStatus } = createMockRes();
  await AdminController.broadcastNotification(
    {
      body: {
        title: "Notice",
        body: "Hello",
        targetType: "role",
        targetId: { $ne: null },
      },
      user: { sub: "admin-1", phoneNumber: "0911000000", role: "super_admin" },
    } as any,
    res,
  );
  assert.equal(getStatus(), 400);
});
