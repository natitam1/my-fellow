import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_TEAMS,
  OFFICIAL_ACTOR,
  canPostAs,
  getPostableActors,
} from "../src/modules/actors/actor.service.js";
import { ActorModel, ProfileModel, TeamMemberModel } from "../src/models/social.models.js";
import { UserModel } from "../src/models/user.model.js";
import { WriterRequestModel } from "../src/models/writerRequest.model.js";
import { TeamMembershipModel } from "../src/models/rbac.model.js";
import { TeamModel } from "../src/models/team.model.js";

test("canonical fellowship teams strictly match the 8 teams from personalization", () => {
  const teamNames = CANONICAL_TEAMS.map((t) => t.displayName);
  const expectedTeams = [
    "Bible Study",
    "Evangelism",
    "Worship",
    "I4U",
    "Media & Literature",
    "Prayer",
    "Freshman",
    "Other Ministry",
  ];

  assert.equal(CANONICAL_TEAMS.length, 8);
  assert.deepEqual(teamNames, expectedTeams);

  // Verify handles match canonical requirements
  const expectedHandles = [
    "biblestudy",
    "evangelism",
    "worship",
    "i4u",
    "media",
    "prayer",
    "freshman",
    "fellowship_ministry",
  ];
  assert.deepEqual(
    CANONICAL_TEAMS.map((t) => t.handle),
    expectedHandles
  );

  // Verify no fictitious teams exist
  assert.equal(teamNames.includes("Counseling"), false);
  assert.equal(teamNames.includes("Admin"), false);
});

test("official actor matches fellowship identity strictly named 'fellow' with verified checkmark", () => {
  assert.equal(OFFICIAL_ACTOR.type, "official");
  assert.equal(OFFICIAL_ACTOR.handle, "fellow");
  assert.equal(OFFICIAL_ACTOR.displayName, "fellow");
  assert.equal(
    OFFICIAL_ACTOR.bio,
    "Official account of 4 Kilo Christian Students Fellowship (AAU ECSF)."
  );
  assert.equal(
    OFFICIAL_ACTOR.avatarUrl,
    "https://res.cloudinary.com/doi9bg69o/image/upload/v1794136664/fellowship-official/hrxszkmivxfwrhlpeany.png"
  );
  assert.equal(OFFICIAL_ACTOR.isVerified, true);
});

test("canPostAs allows super_admin and leader to post as 'fellow', canonical teams, and 'me'", async () => {
  const originalActorFindOne = ActorModel.findOne;
  try {
    (ActorModel as any).findOne = (query: any) => {
      const or = query?.$or || [];
      const isFellow = or.some((cond: any) => cond?.handle === "fellow" || cond?.type === "official");
      if (isFellow) {
        return Promise.resolve({
          _id: "actor-fellow",
          type: "official",
          displayName: "fellow",
          handle: "fellow",
          avatarUrl: OFFICIAL_ACTOR.avatarUrl,
          bio: OFFICIAL_ACTOR.bio,
          isVerified: true,
        });
      }
      return Promise.resolve({
        _id: "actor-team-1",
        type: "team",
        displayName: "Worship",
        handle: "worship",
        avatarUrl: "worship.jpg",
        bio: "Worship team",
        isVerified: true,
        teamId: "Worship",
      });
    };

    // Super Admin
    const superAdminUser = { sub: "super-1", role: "super_admin" };
    const meRes = await canPostAs(superAdminUser, "me");
    assert.equal(meRes.allowed, true);

    const fellowRes = await canPostAs(superAdminUser, "fellow");
    assert.equal(fellowRes.allowed, true);

    const worshipRes = await canPostAs(superAdminUser, "worship");
    assert.equal(worshipRes.allowed, true);

    // Leader
    const leaderUser = { sub: "leader-1", role: "leader" };
    const leaderMe = await canPostAs(leaderUser, "me");
    assert.equal(leaderMe.allowed, true);

    const leaderFellow = await canPostAs(leaderUser, "fellow");
    assert.equal(leaderFellow.allowed, true);

    const leaderBible = await canPostAs(leaderUser, "biblestudy");
    assert.equal(leaderBible.allowed, true);
  } finally {
    ActorModel.findOne = originalActorFindOne;
  }
});

test("canPostAs denies regular members with no leadership or writer request", async () => {
  const originalExists = WriterRequestModel.exists;
  const originalTeamMembershipExists = TeamMembershipModel.exists;
  const originalTeamMembershipFind = TeamMembershipModel.find;
  const originalTeamMemberExists = TeamMemberModel.exists;
  const originalUserFindById = UserModel.findById;
  const originalActorFindOne = ActorModel.findOne;

  try {
    (WriterRequestModel as any).exists = async () => null;
    (TeamMembershipModel as any).exists = async () => null;
    (TeamMembershipModel as any).find = () => ({ lean: async () => [] });
    (TeamMemberModel as any).exists = async () => null;
    (UserModel as any).findById = () => ({
      lean: async () => ({ role: "member", team: null }),
    });
    (ActorModel as any).findOne = (query: any) => {
      const or = query?.$or || [];
      const isFellow = or.some((cond: any) => cond?.handle === "fellow" || cond?.type === "official");
      if (isFellow) {
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439014",
          type: "official",
          displayName: "fellow",
          handle: "fellow",
          avatarUrl: OFFICIAL_ACTOR.avatarUrl,
          bio: OFFICIAL_ACTOR.bio,
          isVerified: true,
        });
      }
      return Promise.resolve({
        _id: "507f1f77bcf86cd799439015",
        type: "team",
        displayName: "Worship",
        handle: "worship",
        avatarUrl: "worship.jpg",
        bio: "Worship team",
        isVerified: true,
        teamId: "Worship",
      });
    };

    const regUser = { sub: "507f1f77bcf86cd799439011", role: "member" };
    const meRes = await canPostAs(regUser, "me");
    assert.equal(meRes.allowed, false);

    const fellowRes = await canPostAs(regUser, "fellow");
    assert.equal(fellowRes.allowed, false);

    const worshipRes = await canPostAs(regUser, "worship");
    assert.equal(worshipRes.allowed, false);
  } finally {
    WriterRequestModel.exists = originalExists;
    TeamMembershipModel.exists = originalTeamMembershipExists;
    TeamMembershipModel.find = originalTeamMembershipFind;
    TeamMemberModel.exists = originalTeamMemberExists;
    UserModel.findById = originalUserFindById;
    ActorModel.findOne = originalActorFindOne;
  }
});

test("canPostAs allows approved writer to post as 'me' but not 'fellow' or teams", async () => {
  const originalExists = WriterRequestModel.exists;
  const originalTeamMembershipExists = TeamMembershipModel.exists;
  const originalTeamMembershipFind = TeamMembershipModel.find;
  const originalTeamMemberExists = TeamMemberModel.exists;
  const originalUserFindById = UserModel.findById;
  const originalActorFindOne = ActorModel.findOne;

  try {
    const writerId = "507f1f77bcf86cd799439012";
    (WriterRequestModel as any).exists = async (query: any) => {
      if (query.userId === writerId) return { _id: "req-1" };
      return null;
    };
    (TeamMembershipModel as any).exists = async () => null;
    (TeamMembershipModel as any).find = () => ({ lean: async () => [] });
    (TeamMemberModel as any).exists = async () => null;
    (UserModel as any).findById = () => ({
      lean: async () => ({ role: "member", team: null }),
    });
    (ActorModel as any).findOne = (query: any) => {
      const or = query?.$or || [];
      const isFellow = or.some((cond: any) => cond?.handle === "fellow" || cond?.type === "official");
      if (isFellow) {
        return Promise.resolve({
          _id: "507f1f77bcf86cd799439014",
          type: "official",
          displayName: "fellow",
          handle: "fellow",
          avatarUrl: OFFICIAL_ACTOR.avatarUrl,
          bio: OFFICIAL_ACTOR.bio,
          isVerified: true,
        });
      }
      return Promise.resolve({
        _id: "507f1f77bcf86cd799439015",
        type: "team",
        displayName: "Worship",
        handle: "worship",
        avatarUrl: "worship.jpg",
        bio: "Worship team",
        isVerified: true,
        teamId: "Worship",
      });
    };

    const writerUser = { sub: writerId, role: "member" };
    const meRes = await canPostAs(writerUser, "me");
    assert.equal(meRes.allowed, true);

    const fellowRes = await canPostAs(writerUser, "fellow");
    assert.equal(fellowRes.allowed, false);

    const worshipRes = await canPostAs(writerUser, "worship");
    assert.equal(worshipRes.allowed, false);
  } finally {
    WriterRequestModel.exists = originalExists;
    TeamMembershipModel.exists = originalTeamMembershipExists;
    TeamMembershipModel.find = originalTeamMembershipFind;
    TeamMemberModel.exists = originalTeamMemberExists;
    UserModel.findById = originalUserFindById;
    ActorModel.findOne = originalActorFindOne;
  }
});

test("getPostableActors sorting logic enforces expected default actor index", async () => {
  const originalActorFindOne = ActorModel.findOne;
  const originalActorFind = ActorModel.find;
  const originalUserFindById = UserModel.findById;
  const originalProfileFindOne = ProfileModel.findOne;
  const originalWriterExists = WriterRequestModel.exists;
  const originalTeamMembershipExists = TeamMembershipModel.exists;
  const originalTeamMembershipFind = TeamMembershipModel.find;
  const originalTeamMemberExists = TeamMemberModel.exists;
  const originalActorUpdate = ActorModel.findOneAndUpdate;
  const originalActorUpdateOne = ActorModel.updateOne;
  const originalActorDeleteOne = ActorModel.deleteOne;

  try {
    (ActorModel as any).updateOne = async () => ({ modifiedCount: 1 });
    (ActorModel as any).deleteOne = async () => ({ deletedCount: 0 });
    (TeamMembershipModel as any).exists = async () => null;
    (TeamMembershipModel as any).find = () => ({ lean: async () => [] });
    (TeamMemberModel as any).exists = async () => null;
    const mockActorList = [
      {
        _id: "507f1f77bcf86cd799439014",
        type: "official",
        displayName: "fellow",
        handle: "fellow",
        avatarUrl: OFFICIAL_ACTOR.avatarUrl,
        bio: OFFICIAL_ACTOR.bio,
        isVerified: true,
      },
      {
        _id: "507f1f77bcf86cd799439015",
        type: "team",
        displayName: "Worship",
        handle: "worship",
        avatarUrl: "worship.jpg",
        bio: "Worship team",
        isVerified: true,
        teamId: "Worship",
      },
    ];

    (ActorModel as any).find = (query: any) => {
      const or = query?.$or || [];
      const isOfficialQuery = or.some(
        (c: any) => c?.type === "official" || c?.handle === "fellow" || c?.handle === "4kilo_ecsf"
      );
      const list = isOfficialQuery ? [mockActorList[0]] : mockActorList;
      const p: any = Promise.resolve(list);
      p.lean = () => Promise.resolve(list);
      return p;
    };
    (ActorModel as any).findOne = (query: any) => {
      const or = query?.$or || [];
      const isOfficial = or.some(
        (c: any) => c?.type === "official" || c?.handle === "fellow" || c?.handle === "4kilo_ecsf"
      );
      const chosen = isOfficial ? mockActorList[0] : mockActorList[1];
      const p: any = Promise.resolve(chosen);
      p.lean = () => Promise.resolve(chosen);
      return p;
    };
    (ActorModel as any).findOneAndUpdate = async () => null;
    (UserModel as any).findById = () => ({
      lean: async () => ({
        _id: "user-super",
        fullName: "Admin Leader",
        role: "super_admin",
      }),
    });
    (ProfileModel as any).findOne = () => ({
      lean: async () => ({
        userId: "user-super",
        username: "adminleader",
        displayName: "Admin Leader",
        isVerified: true,
      }),
    });

    // 1. Leader / super_admin: Official actor `fellow` is index 0 with isDefault: true
    const leaderActors = await getPostableActors({ sub: "user-super", role: "super_admin" });
    assert.ok(leaderActors.length >= 2);
    assert.equal(leaderActors[0].handle, "fellow");
    assert.equal(leaderActors[0].type, "official");
    assert.equal(leaderActors[0].isDefault, true);

    // Any subsequent actors should have isDefault: false
    for (let i = 1; i < leaderActors.length; i++) {
      assert.equal(leaderActors[i].isDefault, false);
    }

    // 2. Approved writer: "me" is index 0 with isDefault: true
    (WriterRequestModel as any).exists = async (q: any) =>
      q.userId === "user-writer" ? { _id: "req-1" } : null;
    (UserModel as any).findById = () => ({
      lean: async () => ({
        _id: "user-writer",
        fullName: "Grace Writer",
        role: "member",
      }),
    });
    (ProfileModel as any).findOne = () => ({
      lean: async () => ({
        userId: "user-writer",
        username: "gracewriter",
        displayName: "Grace Writer",
      }),
    });
    (TeamMembershipModel as any).exists = async () => null;
    (TeamMemberModel as any).exists = async () => null;

    const writerActors = await getPostableActors({ sub: "user-writer", role: "member" });
    assert.equal(writerActors.length, 1);
    assert.equal(writerActors[0].id, "me");
    assert.equal(writerActors[0].type, "user");
    assert.equal(writerActors[0].isDefault, true);

    // 3. Regular member: returns empty array
    (WriterRequestModel as any).exists = async () => null;
    const regularActors = await getPostableActors({ sub: "user-regular", role: "member" });
    assert.equal(regularActors.length, 0);
  } finally {
    ActorModel.findOne = originalActorFindOne;
    ActorModel.find = originalActorFind;
    UserModel.findById = originalUserFindById;
    ProfileModel.findOne = originalProfileFindOne;
    WriterRequestModel.exists = originalWriterExists;
    TeamMembershipModel.exists = originalTeamMembershipExists;
    TeamMembershipModel.find = originalTeamMembershipFind;
    TeamMemberModel.exists = originalTeamMemberExists;
    ActorModel.findOneAndUpdate = originalActorUpdate;
    ActorModel.updateOne = originalActorUpdateOne;
    ActorModel.deleteOne = originalActorDeleteOne;
  }
});
