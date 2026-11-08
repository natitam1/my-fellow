import assert from "node:assert/strict";
import { describe, it } from "node:test";
import mongoose from "mongoose";
import {
  createDevotionSchema,
  updateDevotionSchema,
} from "../src/validators/devotion.validator.js";
import {
  resolveDevotionAuthor,
  DevotionController,
} from "../src/controllers/devotion.controller.js";
import { isApprovedDevotionAuthor } from "../src/routes/devotion.routes.js";
import {
  CANONICAL_TEAMS,
  OFFICIAL_ACTOR,
  canPostAs,
} from "../src/modules/actors/actor.service.js";
import { WriterRequestModel } from "../src/models/writerRequest.model.js";
import { UserModel } from "../src/models/user.model.js";
import { DevotionModel } from "../src/models/devotion.model.js";

describe("Devotion Validation & Parsing", () => {
  it("parses valid text devotion with JSON string tags", () => {
    const input = {
      title: "Morning Grace",
      author: "4 Kilo Fellowship",
      date: "2026-11-08",
      type: "text",
      content: "Deep reflections on campus ministry and spiritual growth.",
      tags: JSON.stringify(["Faith", "Grace", "Campus"]),
      featured: "true",
      image: "",
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, "Morning Grace");
      assert.deepEqual(result.data.tags, ["Faith", "Grace", "Campus"]);
      assert.equal(result.data.featured, true);
      assert.equal(result.data.image, undefined);
    }
  });

  it("parses valid text devotion with authorActorId and omitted author string", () => {
    const input = {
      title: "Kingdom Priority",
      authorActorId: "fellow",
      actorHandle: "fellow",
      actorType: "official",
      date: "2026-11-08",
      type: "text",
      content: "Seeking first the Kingdom in academic pursuits.",
      tags: ["Kingdom", "Academic"],
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.title, "Kingdom Priority");
      assert.equal(result.data.author, undefined);
      assert.equal(result.data.authorActorId, "fellow");
      assert.equal(result.data.actorType, "official");
    }
  });

  it("parses valid devotion with empty author string without failing validation", () => {
    const input = {
      title: "Grace Abounding",
      author: "",
      authorActorId: "biblestudy",
      date: "2026-11-08",
      type: "text",
      content: "Reflections on deep scriptural roots.",
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.author, undefined);
      assert.equal(result.data.authorActorId, "biblestudy");
    }
  });

  it("parses valid voice devotion with comma separated tags and empty image string", () => {
    const input = {
      title: "Walking in Faith",
      author: "Bereket T.",
      date: "2026-11-08",
      type: "voice",
      caption: "Audio devotion transcript for students walking in faith.",
      duration: "04:15",
      tags: "Prayer, Encouragement, Trust",
      audioUrl: "https://res.cloudinary.com/test/audio.m4a",
      image: "",
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.type, "voice");
      assert.deepEqual(result.data.tags, ["Prayer", "Encouragement", "Trust"]);
      assert.equal(result.data.duration, "04:15");
      assert.equal(result.data.image, undefined);
    }
  });

  it("rejects text devotions without content", () => {
    const input = {
      title: "No Content Article",
      author: "Leadership",
      date: "2026-11-08",
      type: "text",
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, false);
  });

  it("rejects voice devotions without duration", () => {
    const input = {
      title: "Voice Without Duration",
      author: "Leadership",
      date: "2026-11-08",
      type: "voice",
      caption: "Caption text",
    };

    const result = createDevotionSchema.safeParse(input);
    assert.equal(result.success, false);
  });

  it("updateDevotionSchema allows authorActorId and optional author", () => {
    const updateInput = {
      title: "Updated Title",
      authorActorId: "fellow",
      actorType: "official" as const,
    };

    const result = updateDevotionSchema.safeParse(updateInput);
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.authorActorId, "fellow");
      assert.equal(result.data.actorType, "official");
      assert.equal(result.data.author, undefined);
    }
  });
});

describe("Devotion Route Permissions (isApprovedDevotionAuthor)", () => {
  it("allows fellowship leaders (super_admin, leader, admin)", async () => {
    const superAdmin = { sub: "user-super", role: "super_admin" };
    const leader = { sub: "user-leader", role: "leader" };
    const admin = { sub: "user-admin", role: "admin" };

    assert.equal(await isApprovedDevotionAuthor(superAdmin), true);
    assert.equal(await isApprovedDevotionAuthor(leader), true);
    assert.equal(await isApprovedDevotionAuthor(admin), true);
  });

  it("allows team leaders", async () => {
    const teamLeader = { sub: "user-team-leader", role: "team_leader" };
    assert.equal(await isApprovedDevotionAuthor(teamLeader), true);
  });

  it("allows users with sermons.media.manage permission", async () => {
    const userWithPermission = {
      sub: "user-perm",
      role: "member",
      permissions: ["sermons.media.manage"],
    };
    assert.equal(await isApprovedDevotionAuthor(userWithPermission), true);
  });

  it("allows approved devotion writers with WriterRequest status 'accepted' or 'approved'", async () => {
    const originalExists = WriterRequestModel.exists;
    try {
      // Mock WriterRequestModel.exists returning true
      WriterRequestModel.exists = (async () => ({ _id: new mongoose.Types.ObjectId() } as any)) as any;

      const writerUser = { sub: "user-writer-approved", role: "member" };
      assert.equal(await isApprovedDevotionAuthor(writerUser), true);
    } finally {
      WriterRequestModel.exists = originalExists;
    }
  });

  it("denies regular non-approved members", async () => {
    const originalExists = WriterRequestModel.exists;
    try {
      // Mock WriterRequestModel.exists returning null
      WriterRequestModel.exists = (async () => null) as any;

      const regularUser = { sub: "user-regular-unapproved", role: "member" };
      assert.equal(await isApprovedDevotionAuthor(regularUser), false);
    } finally {
      WriterRequestModel.exists = originalExists;
    }
  });
});

describe("Actor-Based Identity & Author Spoofing Prevention (resolveDevotionAuthor)", () => {
  const superAdminUser = {
    sub: new mongoose.Types.ObjectId().toString(),
    role: "super_admin",
  };

  const regularMemberUser = {
    sub: new mongoose.Types.ObjectId().toString(),
    role: "member",
  };

  it("defaults to official 'fellow' actor for fellowship leaders when no actor is specified", async () => {
    const resolution = await resolveDevotionAuthor(superAdminUser, null);
    assert.equal(resolution.error, undefined);
    assert.ok(resolution.authorInfo);
    assert.equal(resolution.authorInfo.author, "fellow");
    assert.equal(resolution.authorInfo.authorHandle, "fellow");
    assert.equal(resolution.authorInfo.actorType, "official");
    assert.equal(resolution.authorInfo.authorRole, "Executive Ministry");
  });

  it("resolves official 'fellow' actor when specified by an authorized leader", async () => {
    const resolution = await resolveDevotionAuthor(superAdminUser, "fellow");
    assert.equal(resolution.error, undefined);
    assert.ok(resolution.authorInfo);
    assert.equal(resolution.authorInfo.author, "fellow");
    assert.equal(resolution.authorInfo.authorHandle, "fellow");
    assert.equal(resolution.authorInfo.actorType, "official");
    assert.equal(resolution.authorInfo.authorRole, "Executive Ministry");
  });

  it("resolves team actor when posted as a canonical team", async () => {
    const bibleStudyTeam = CANONICAL_TEAMS[0]; // Bible Study
    const resolution = await resolveDevotionAuthor(superAdminUser, bibleStudyTeam.handle);
    assert.equal(resolution.error, undefined);
    assert.ok(resolution.authorInfo);
    assert.equal(resolution.authorInfo.author, bibleStudyTeam.displayName);
    assert.equal(resolution.authorInfo.authorHandle, bibleStudyTeam.handle);
    assert.equal(resolution.authorInfo.actorType, "team");
    assert.equal(resolution.authorInfo.authorAvatar, bibleStudyTeam.avatarUrl);
  });

  it("defaults to personal ('me') actor for approved writers and populates user info", async () => {
    const originalFindById = UserModel.findById;
    try {
      UserModel.findById = (() => ({
        lean: async () => ({
          _id: regularMemberUser.sub,
          fullName: "Samuel Kifle",
          profileImage: "https://example.com/avatar.jpg",
          role: "member",
        }),
      })) as any;

      const resolution = await resolveDevotionAuthor(regularMemberUser, "me");
      assert.equal(resolution.error, undefined);
      assert.ok(resolution.authorInfo);
      assert.equal(resolution.authorInfo.author, "Samuel Kifle");
      assert.equal(resolution.authorInfo.actorType, "user");
      assert.equal(resolution.authorInfo.authorAvatar, "https://example.com/avatar.jpg");
    } finally {
      UserModel.findById = originalFindById;
    }
  });

  it("strictly denies unauthorized users from posting as the official 'fellow' actor", async () => {
    const resolution = await resolveDevotionAuthor(regularMemberUser, "fellow");
    assert.ok(resolution.error);
    assert.equal(resolution.error.status, 403);
    assert.equal(
      resolution.error.message,
      "You are not authorized to post as this actor"
    );
  });

  it("strictly denies unauthorized users from posting as another team actor", async () => {
    const resolution = await resolveDevotionAuthor(regularMemberUser, "evangelism");
    assert.ok(resolution.error);
    assert.equal(resolution.error.status, 403);
    assert.equal(
      resolution.error.message,
      "You are not authorized to post as this actor"
    );
  });
});

describe("Devotion Controller Creation & Edit Verification", () => {
  it("createDevotion strictly enforces actor identity and rejects manual author spoofing", async () => {
    const superAdminUser = {
      sub: new mongoose.Types.ObjectId().toString(),
      role: "super_admin",
    };

    let createdPayload: any = null;
    const originalCreate = DevotionModel.create;

    try {
      DevotionModel.create = (async (doc: any) => {
        createdPayload = doc;
        return { ...doc, _id: new mongoose.Types.ObjectId() };
      }) as any;

      const req: any = {
        user: superAdminUser,
        body: {
          title: "Truth and Spirit",
          // Attempting manual author spoofing:
          author: "Manual Spoofed Author Name",
          authorActorId: "fellow",
          date: "2026-11-08",
          type: "text",
          content: "Living in the light of the Gospel on campus.",
        },
        files: undefined,
      };

      let responseStatusCode = 0;
      let responseBody: any = null;
      const res: any = {
        status(code: number) {
          responseStatusCode = code;
          return this;
        },
        json(data: any) {
          responseBody = data;
          return this;
        },
      };

      await DevotionController.createDevotion(req, res);

      assert.equal(responseStatusCode, 201);
      assert.equal(responseBody.success, true);
      assert.ok(createdPayload);

      // Verify that the spoofed author was completely ignored and replaced strictly by the validated actor:
      assert.equal(createdPayload.author, "fellow");
      assert.equal(createdPayload.authorHandle, "fellow");
      assert.equal(createdPayload.actorType, "official");
      assert.notEqual(createdPayload.author, "Manual Spoofed Author Name");
    } finally {
      DevotionModel.create = originalCreate;
    }
  });

  it("createDevotion returns 403 when user specifies an unauthorized actor", async () => {
    const regularMemberUser = {
      sub: new mongoose.Types.ObjectId().toString(),
      role: "member",
    };

    const req: any = {
      user: regularMemberUser,
      body: {
        title: "Unauthorized Post",
        authorActorId: "fellow",
        date: "2026-11-08",
        type: "text",
        content: "Trying to post as official fellow without leader permission.",
      },
      files: undefined,
    };

    let responseStatusCode = 0;
    let responseBody: any = null;
    const res: any = {
      status(code: number) {
        responseStatusCode = code;
        return this;
      },
      json(data: any) {
        responseBody = data;
        return this;
      },
    };

    await DevotionController.createDevotion(req, res);

    assert.equal(responseStatusCode, 403);
    assert.equal(responseBody.success, false);
    assert.equal(responseBody.message, "You are not authorized to post as this actor");
  });

  it("updateDevotion maintains actor consistency and strips manual author spoofing", async () => {
    const authorUserId = new mongoose.Types.ObjectId();
    const devotionId = new mongoose.Types.ObjectId();

    const existingDevotion = {
      _id: devotionId,
      title: "Original Devotion",
      author: "fellow",
      authorHandle: "fellow",
      authorActorId: "fellow",
      actorType: "official",
      authorRole: "Executive Ministry",
      authorId: authorUserId,
      type: "text",
      content: "Original text",
    };

    const originalFindById = DevotionModel.findById;
    const originalFindByIdAndUpdate = DevotionModel.findByIdAndUpdate;

    try {
      DevotionModel.findById = (async (id: any) => existingDevotion as any) as any;

      let updatedData: any = null;
      DevotionModel.findByIdAndUpdate = ((id: any, data: any) => ({
        lean: async () => {
          updatedData = data;
          return { ...existingDevotion, ...data };
        },
      })) as any;

      // Editor is super_admin
      const req: any = {
        params: { id: devotionId.toString() },
        user: { sub: authorUserId.toString(), role: "super_admin" },
        body: {
          title: "Updated Title",
          // Attempting manual author spoofing in update
          author: "Spoofed Updated Author",
          authorRole: "Spoofed Role",
        },
        files: undefined,
      };

      let responseStatusCode = 0;
      let responseBody: any = null;
      const res: any = {
        status(code: number) {
          responseStatusCode = code;
          return this;
        },
        json(data: any) {
          responseBody = data;
          return this;
        },
      };

      await DevotionController.updateDevotion(req, res);

      assert.equal(responseStatusCode, 200);
      assert.equal(responseBody.success, true);
      assert.ok(updatedData);
      assert.equal(updatedData.title, "Updated Title");

      // Verify that spoofed author was deleted/stripped from the update
      assert.equal(updatedData.author, undefined);
      assert.equal(updatedData.authorRole, undefined);
    } finally {
      DevotionModel.findById = originalFindById;
      DevotionModel.findByIdAndUpdate = originalFindByIdAndUpdate;
    }
  });
});
