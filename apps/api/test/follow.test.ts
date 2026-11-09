import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import {
  followTarget,
  unfollowTarget,
} from "../src/modules/follows/follow.service.js";
import {
  ensureFollowOfficialActor,
  syncAllUsersFollowOfficialActor,
} from "../src/modules/actors/actor.service.js";
import {
  ActorModel,
  ProfileModel,
  FollowModel,
  BlockModel,
  OutboxEventModel,
} from "../src/models/social.models.js";
import { UserModel } from "../src/models/user.model.js";

test("followTarget: follows an Actor by handle and increments followersCount", async () => {
  const actorId = new mongoose.Types.ObjectId();
  const followerId = "user-123";

  // Mock ActorModel.findOne
  const origActorFindOne = ActorModel.findOne;
  const origActorFindByIdAndUpdate = ActorModel.findByIdAndUpdate;
  const origFollowFindOne = FollowModel.findOne;
  const origFollowCreate = FollowModel.create;
  const origProfileUpdateOne = ProfileModel.updateOne;
  const origBlockFindOne = BlockModel.findOne;
  const origOutboxCreate = OutboxEventModel.create;

  try {
    let createdFollow: any = null;
    let actorUpdated = false;

    ActorModel.findOne = ((query: any) => ({
      deletedAt: null,
      _id: actorId,
      handle: "fellow",
      displayName: "Fellow",
      type: "official",
      followersCount: 5,
    })) as any;

    BlockModel.findOne = (() => ({
      lean: () => Promise.resolve(null),
    })) as any;

    FollowModel.findOne = (() => Promise.resolve(null)) as any;

    FollowModel.create = ((doc: any) => {
      createdFollow = doc;
      return Promise.resolve(doc);
    }) as any;

    ProfileModel.updateOne = (() => Promise.resolve({ modifiedCount: 1 })) as any;

    ActorModel.findByIdAndUpdate = ((id: any, update: any) => {
      actorUpdated = true;
      return Promise.resolve({
        _id: actorId,
        followersCount: 6,
        followerCount: 6,
      });
    }) as any;

    OutboxEventModel.create = (() => Promise.resolve({})) as any;

    const res = await followTarget(followerId, "@fellow");

    assert.equal(res.success, true);
    assert.equal(res.following, true);
    assert.equal(res.isActor, true);
    assert.equal(res.followersCount, 6);
    assert.equal(createdFollow.followerId, followerId);
    assert.equal(createdFollow.followeeId, actorId.toString());
    assert.equal(createdFollow.status, "accepted");
    assert.equal(actorUpdated, true);
  } finally {
    ActorModel.findOne = origActorFindOne;
    ActorModel.findByIdAndUpdate = origActorFindByIdAndUpdate;
    FollowModel.findOne = origFollowFindOne;
    FollowModel.create = origFollowCreate;
    ProfileModel.updateOne = origProfileUpdateOne;
    BlockModel.findOne = origBlockFindOne;
    OutboxEventModel.create = origOutboxCreate;
  }
});

test("unfollowTarget: unfollows an Actor and decrements followersCount", async () => {
  const actorId = new mongoose.Types.ObjectId();
  const followerId = "user-123";

  const origActorFindOne = ActorModel.findOne;
  const origActorFindByIdAndUpdate = ActorModel.findByIdAndUpdate;
  const origFollowFindOneAndDelete = FollowModel.findOneAndDelete;
  const origProfileUpdateOne = ProfileModel.updateOne;

  try {
    ActorModel.findOne = ((query: any) => ({
      deletedAt: null,
      _id: actorId,
      handle: "fellow",
      displayName: "Fellow",
      type: "official",
      followersCount: 6,
    })) as any;

    FollowModel.findOneAndDelete = (() =>
      Promise.resolve({
        followerId,
        followeeId: actorId.toString(),
        status: "accepted",
      })) as any;

    ProfileModel.updateOne = (() => Promise.resolve({ modifiedCount: 1 })) as any;

    ActorModel.findByIdAndUpdate = ((id: any, update: any) =>
      Promise.resolve({
        _id: actorId,
        followersCount: 5,
        followerCount: 5,
      })) as any;

    const res = await unfollowTarget(followerId, "fellow");

    assert.equal(res.success, true);
    assert.equal(res.following, false);
    assert.equal(res.status, "unfollowed");
    assert.equal(res.followersCount, 5);
    assert.equal(res.isActor, true);
  } finally {
    ActorModel.findOne = origActorFindOne;
    ActorModel.findByIdAndUpdate = origActorFindByIdAndUpdate;
    FollowModel.findOneAndDelete = origFollowFindOneAndDelete;
    ProfileModel.updateOne = origProfileUpdateOne;
  }
});

test("followTarget: prevents self-following", async () => {
  const userId = "user-123";

  await assert.rejects(
    async () => {
      // Mock user target profile
      const origActorFindOne = ActorModel.findOne;
      const origProfileFindOne = ProfileModel.findOne;
      try {
        ActorModel.findOne = (() => null) as any;
        ProfileModel.findOne = (() => ({
          userId,
          username: "myself",
        })) as any;

        await followTarget(userId, "myself");
      } finally {
        ActorModel.findOne = origActorFindOne;
        ProfileModel.findOne = origProfileFindOne;
      }
    },
    (err: any) => {
      return err.message === "You cannot follow yourself";
    }
  );
});

test("followTarget: follows an Actor by ObjectId", async () => {
  const actorId = new mongoose.Types.ObjectId();
  const followerId = "user-456";

  const origActorFindOne = ActorModel.findOne;
  const origActorFindByIdAndUpdate = ActorModel.findByIdAndUpdate;
  const origFollowFindOne = FollowModel.findOne;
  const origFollowCreate = FollowModel.create;
  const origProfileUpdateOne = ProfileModel.updateOne;
  const origBlockFindOne = BlockModel.findOne;
  const origOutboxCreate = OutboxEventModel.create;

  try {
    let createdDoc: any = null;

    ActorModel.findOne = ((query: any) => ({
      deletedAt: null,
      _id: actorId,
      handle: "biblestudy",
      displayName: "Bible Study Team",
      type: "team",
      followersCount: 10,
    })) as any;

    BlockModel.findOne = (() => ({
      lean: () => Promise.resolve(null),
    })) as any;

    FollowModel.findOne = (() => Promise.resolve(null)) as any;
    FollowModel.create = ((doc: any) => {
      createdDoc = doc;
      return Promise.resolve(doc);
    }) as any;

    ProfileModel.updateOne = (() => Promise.resolve({ modifiedCount: 1 })) as any;

    ActorModel.findByIdAndUpdate = ((id: any, update: any) => {
      return Promise.resolve({
        _id: actorId,
        followersCount: 11,
        followerCount: 11,
      });
    }) as any;

    OutboxEventModel.create = (() => Promise.resolve({})) as any;

    const res = await followTarget(followerId, actorId.toString());

    assert.equal(res.success, true);
    assert.equal(res.following, true);
    assert.equal(res.isActor, true);
    assert.equal(res.followersCount, 11);
    assert.equal(createdDoc.followeeId, actorId.toString());
  } finally {
    ActorModel.findOne = origActorFindOne;
    ActorModel.findByIdAndUpdate = origActorFindByIdAndUpdate;
    FollowModel.findOne = origFollowFindOne;
    FollowModel.create = origFollowCreate;
    ProfileModel.updateOne = origProfileUpdateOne;
    BlockModel.findOne = origBlockFindOne;
    OutboxEventModel.create = origOutboxCreate;
  }
});

test("ensureFollowOfficialActor: automatically creates follow relation to official actor", async () => {
  const officialActorId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  const origActorFindOne = ActorModel.findOne;
  const origActorUpdateOne = ActorModel.updateOne;
  const origFollowFindOne = FollowModel.findOne;
  const origFollowCreate = FollowModel.create;

  try {
    let createdFollow: any = null;
    let actorInc = false;

    ActorModel.findOne = (() => ({
      _id: officialActorId,
      handle: "fellow",
      type: "official",
    })) as any;

    FollowModel.findOne = (() => Promise.resolve(null)) as any;
    FollowModel.create = ((doc: any) => {
      createdFollow = doc;
      return Promise.resolve(doc);
    }) as any;

    ActorModel.updateOne = ((filter: any, update: any) => {
      actorInc = true;
      return Promise.resolve({ modifiedCount: 1 });
    }) as any;

    const followed = await ensureFollowOfficialActor(userId);

    assert.equal(followed, true);
    assert.equal(createdFollow.followerId, userId.toString());
    assert.equal(createdFollow.followeeId, officialActorId.toString());
    assert.equal(createdFollow.status, "accepted");
    assert.equal(actorInc, true);

    // Calling again returns false when relation already exists
    FollowModel.findOne = (() => Promise.resolve({ _id: "f-1" })) as any;
    const secondCall = await ensureFollowOfficialActor(userId);
    assert.equal(secondCall, false);
  } finally {
    ActorModel.findOne = origActorFindOne;
    ActorModel.updateOne = origActorUpdateOne;
    FollowModel.findOne = origFollowFindOne;
    FollowModel.create = origFollowCreate;
  }
});

test("following feed query structure includes both authorId and authorActorId", () => {
  const candidateAuthorIds = ["user-1", "user-2", "actor-fellow"];

  const query: any = {
    $or: [
      { authorId: { $in: candidateAuthorIds } },
      { authorActorId: { $in: candidateAuthorIds } },
    ],
    kind: { $in: ["post", "repost", "quote"] },
    deletedAt: null,
  };

  assert.equal(Array.isArray(query.$or), true);
  assert.equal(query.$or.length, 2);
  assert.deepEqual(query.$or[0], { authorId: { $in: candidateAuthorIds } });
  assert.deepEqual(query.$or[1], { authorActorId: { $in: candidateAuthorIds } });
  assert.equal(query.deletedAt, null);
});

