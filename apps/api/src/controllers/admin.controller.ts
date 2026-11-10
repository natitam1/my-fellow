import { Request, Response } from "express";
import mongoose from "mongoose";
import EventModel from "../models/event.model.js";
import LeaderModel from "../models/leader.model.js";
import LocationModel from "../models/location.model.js";
import ProgramModel from "../models/program.model.js";
import RegistrationModel from "../models/registration.model.js";
import TeamModel from "../models/team.model.js";
import { TransactionModel } from "../models/transaction.model.js";
import { UserModel } from "../models/user.model.js";
import { SupportTicket } from "../models/support.model.js";
import {
  NotificationModel,
  PushDeviceModel,
} from "../models/social.models.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { roleHasPermission } from "../rbac/permissions.js";

export class AdminController {
  static async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.max(
        1,
        parseInt((req.query.limit as string) || "20", 10),
      );
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
      const team = typeof req.query.team === "string" ? req.query.team.trim() : undefined;
      const department = typeof req.query.department === "string" ? req.query.department.trim() : undefined;
      const yearOfStudy = typeof req.query.yearOfStudy === "string" ? req.query.yearOfStudy.trim() : undefined;
      const role = typeof req.query.role === "string" ? req.query.role.trim() : undefined;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.$or = [
          { fullName: { $regex: escaped, $options: "i" } },
          { phoneNumber: { $regex: escaped, $options: "i" } },
          { telegramUserName: { $regex: escaped, $options: "i" } },
        ];
      }

      if (team && team !== "all") query.team = team;
      if (department && department !== "all") query.department = department;
      if (yearOfStudy && yearOfStudy !== "all") query.yearOfStudy = yearOfStudy;
      if (role && role !== "all") {
        if (role === "super_admin") {
          query.role = { $in: ["super_admin", "admin"] };
        } else if (role === "member") {
          query.role = { $in: ["member", "user", null] };
        } else {
          query.role = role;
        }
      }

      const [users, total] = await Promise.all([
        UserModel.find(query)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("team", "name")
          .lean(),
        UserModel.countDocuments(query),
      ]);

      const canViewContact = roleHasPermission(
        req.user?.role,
        "members.contact.view",
        req.user?.permissions,
      );
      const safeUsers = canViewContact
        ? users
        : users.map((user) => {
            const { phoneNumber, telegramUserName, ...safeUser } = user as any;
            return safeUser;
          });

      return res.status(200).json({
        success: true,
        data: safeUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await EventModel.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: events });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getAllRegistrations(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.max(
        1,
        parseInt((req.query.limit as string) || "10", 10),
      );
      const eventId = typeof req.query.eventId === "string" ? req.query.eventId.trim() : undefined;
      const userId = typeof req.query.userId === "string" ? req.query.userId.trim() : undefined;
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
      const skip = (page - 1) * limit;

      const pipeline: any[] = [];

      const match: any = {};
      if (eventId && mongoose.isValidObjectId(eventId))
        match.eventId = new mongoose.Types.ObjectId(eventId);
      if (userId && mongoose.isValidObjectId(userId))
        match.userId = new mongoose.Types.ObjectId(userId);

      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }

      pipeline.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
      pipeline.push({ $unwind: "$user" });

      pipeline.push({
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      });
      pipeline.push({ $unwind: "$event" });

      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "user.fullName": { $regex: search, $options: "i" } },
              { "user.phoneNumber": { $regex: search, $options: "i" } },
              { "event.title": { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push({ $sort: { createdAt: -1 } });

      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      });

      const [result] = await RegistrationModel.aggregate(pipeline);

      const total = result.metadata[0]?.total || 0;
      const registrations = result.data;

      return res.status(200).json({
        success: true,
        data: registrations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getRegistrationsReport(req: Request, res: Response) {
    try {
      const events = await EventModel.find().lean();

      const report = await Promise.all(
        events.map(async (event) => {
          const count = await RegistrationModel.countDocuments({
            eventId: event._id,
          });
          return {
            event: {
              id: event._id,
              title: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
            },
            registrationCount: count,
          };
        }),
      );

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getAllTransactions(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.max(
        1,
        parseInt((req.query.limit as string) || "10", 10),
      );
      const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
      const status = typeof req.query.status === "string" ? req.query.status.trim() : undefined;
      const skip = (page - 1) * limit;

      const pipeline: any[] = [];

      // Match Stage
      const match: any = {};
      if (status && status !== "all") {
        match.status = status;
      }
      if (Object.keys(match).length > 0) {
        pipeline.push({ $match: match });
      }

      // Lookup User
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      });
      pipeline.push({ $unwind: "$user" });

      // Search Stage
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { "user.fullName": { $regex: search, $options: "i" } },
              { "user.phoneNumber": { $regex: search, $options: "i" } },
              { tx_ref: { $regex: search, $options: "i" } },
              { sessionId: { $regex: search, $options: "i" } },
              { reason: { $regex: search, $options: "i" } },
            ],
          },
        });
      }

      pipeline.push({ $sort: { createdAt: -1 } });

      pipeline.push({
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      });

      const [result] = await TransactionModel.aggregate(pipeline);

      // Map back to a structure that frontend expects (userId populate emulation)
      const transactions = result.data.map((tx: any) => ({
        ...tx,
        userId: {
          _id: tx.user._id,
          fullName: tx.user.fullName,
          phoneNumber: tx.user.phoneNumber,
        },
      }));

      const total = result.metadata[0]?.total || 0;

      return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const [
        userCount,
        eventCount,
        registrationCount,
        transactionCount,
        programCount,
        locationCount,
        leaderCount,
        teamCount,
      ] = await Promise.all([
        UserModel.countDocuments(),
        EventModel.countDocuments(),
        RegistrationModel.countDocuments(),
        TransactionModel.countDocuments(),
        ProgramModel.countDocuments(),
        LocationModel.countDocuments(),
        LeaderModel.countDocuments(),
        TeamModel.countDocuments(),
      ]);

      const [totalRevenueResult] = await TransactionModel.aggregate([
        { $match: { status: { $in: ["success", "completed", "pending"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          users: userCount,
          events: eventCount,
          registrations: registrationCount,
          transactions: transactionCount,
          programs: programCount,
          locations: locationCount,
          leaders: leaderCount,
          teams: teamCount,
          totalRevenue: totalRevenueResult ? totalRevenueResult.total : 0,
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getSupportTickets(req: AuthRequest, res: Response) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.max(
        1,
        parseInt((req.query.limit as string) || "20", 10),
      );
      const status = typeof req.query.status === "string" ? req.query.status.trim() : undefined;
      const skip = (page - 1) * limit;

      const query: any = {};
      if (status && status !== "all") {
        query.status = status;
      }

      const [tickets, total] = await Promise.all([
        SupportTicket.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        SupportTicket.countDocuments(query),
      ]);

      const userIds = [
        ...new Set(tickets.map((t: any) => t.userId).filter(Boolean)),
      ];

      const validObjectIds = userIds.filter((id) =>
        mongoose.isValidObjectId(id),
      );
      const users = await UserModel.find({
        _id: { $in: validObjectIds },
      })
        .select("-password")
        .populate("team", "name")
        .lean();

      const userMap = new Map(users.map((u: any) => [u._id.toString(), u]));

      const ticketsWithUser = tickets.map((ticket: any) => ({
        ...ticket,
        user: userMap.get(ticket.userId) || null,
      }));

      return res.status(200).json({
        success: true,
        data: ticketsWithUser,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async updateSupportTicketStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, adminResponse, adminNote } = req.body;

      if (!id || !mongoose.isValidObjectId(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ticket ID" });
      }

      const validStatuses = ["pending", "in-progress", "resolved"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be pending, in-progress, or resolved",
        });
      }

      const ticket = await SupportTicket.findById(id);
      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: "Support ticket not found" });
      }

      ticket.status = status;
      const responseNote =
        adminResponse !== undefined ? adminResponse : adminNote;
      if (responseNote !== undefined) {
        ticket.adminResponse = responseNote;
      }

      await ticket.save();

      let user = null;
      if (ticket.userId && mongoose.isValidObjectId(ticket.userId)) {
        user = await UserModel.findById(ticket.userId)
          .select("-password")
          .populate("team", "name")
          .lean();
      }

      return res.status(200).json({
        success: true,
        message: "Support ticket status updated successfully",
        data: {
          ...ticket.toObject(),
          user,
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async broadcastNotification(req: AuthRequest, res: Response) {
    try {
      const { title, body, targetType, targetId, priority } = req.body;

      if (
        !title ||
        typeof title !== "string" ||
        !body ||
        typeof body !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message: "Title and body are required strings",
        });
      }

      if (!targetType || !["all", "team", "role"].includes(targetType)) {
        return res.status(400).json({
          success: false,
          message: "targetType must be 'all', 'team', or 'role'",
        });
      }

      if ((targetType === "team" || targetType === "role") && !targetId) {
        return res.status(400).json({
          success: false,
          message: `targetId is required when targetType is '${targetType}'`,
        });
      }

      const userQuery: any = {};
      if (targetType === "team") {
        userQuery.team = targetId;
      } else if (targetType === "role") {
        userQuery.role = targetId;
      }

      const targetUsers = await UserModel.find(userQuery).select("_id").lean();
      const recipientIds = targetUsers.map((u: any) => u._id.toString());
      const broadcastId = new mongoose.Types.ObjectId().toString();

      if (recipientIds.length > 0) {
        const notifications = recipientIds.map((recipientId) => ({
          recipientId,
          type: "broadcast",
          groupKey: `broadcast:${broadcastId}`,
          actorIds: req.user?.sub ? [req.user.sub] : [],
          actorCount: 1,
          entityType: "broadcast",
          entityId: broadcastId,
          data: {
            title,
            body,
            targetType,
            targetId: targetId || null,
            priority: priority || "normal",
            broadcastId,
          },
          readAt: null,
        }));

        await NotificationModel.insertMany(notifications);
      }

      let pushTokens: string[] = [];
      if (recipientIds.length > 0) {
        const devices = await PushDeviceModel.find({
          userId: { $in: recipientIds },
          disabledAt: null,
        })
          .select("expoPushToken")
          .lean();

        pushTokens = [
          ...new Set(
            devices.map((d: any) => d.expoPushToken).filter(Boolean),
          ),
        ];

        if (pushTokens.length > 0) {
          try {
            const chunks: string[][] = [];
            for (let i = 0; i < pushTokens.length; i += 100) {
              chunks.push(pushTokens.slice(i, i + 100));
            }

            for (const chunk of chunks) {
              const messages = chunk.map((token) => ({
                to: token,
                sound: "default",
                title,
                body,
                priority: priority === "high" ? "high" : "default",
                data: {
                  type: "broadcast",
                  broadcastId,
                  targetType,
                  targetId,
                },
              }));

              await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                  "Accept": "application/json",
                  "Accept-Encoding": "gzip, deflate",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(messages),
                signal: AbortSignal.timeout(5000),
              });
            }
          } catch (pushErr: any) {
            console.log(
              `[PushNotification] Offline / mock push delivery: ${pushErr.message}. Target tokens: ${pushTokens.length}`,
            );
          }
        }
      }

      return res.status(200).json({
        success: true,
        count: recipientIds.length,
        pushDevicesReached: pushTokens.length,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
      const limit = Math.max(
        1,
        parseInt((req.query.limit as string) || "20", 10),
      );
      const skip = (page - 1) * limit;

      const pipeline: any[] = [
        { $match: { type: "broadcast" } },
        {
          $group: {
            _id: "$groupKey",
            title: { $first: "$data.title" },
            body: { $first: "$data.body" },
            targetType: { $first: "$data.targetType" },
            targetId: { $first: "$data.targetId" },
            priority: { $first: "$data.priority" },
            broadcastId: { $first: "$data.broadcastId" },
            createdAt: { $first: "$createdAt" },
            recipientCount: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ];

      const [aggregateResult, totalRegisteredDevices, platformAggregation] =
        await Promise.all([
          NotificationModel.aggregate(pipeline),
          PushDeviceModel.countDocuments(),
          PushDeviceModel.aggregate([
            {
              $group: {
                _id: { $toLower: "$platform" },
                count: { $sum: 1 },
              },
            },
          ]),
        ]);

      const total = (aggregateResult as any)?.[0]?.metadata?.[0]?.total || 0;
      const notifications = ((aggregateResult as any)?.[0]?.data || []).map((item: any) => ({
        id: item._id,
        title: item.title,
        body: item.body,
        targetType: item.targetType,
        targetId: item.targetId,
        priority: item.priority || "normal",
        createdAt: item.createdAt,
        recipientCount: item.recipientCount,
      }));

      const platformBreakdown: Record<string, number> = {
        ios: 0,
        android: 0,
      };

      for (const item of platformAggregation) {
        const key = item._id || "unknown";
        platformBreakdown[key] = item.count;
      }

      return res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        devices: {
          total: totalRegisteredDevices,
          platformBreakdown,
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  static async getHealth(req: Request, res: Response) {
    try {
      const readyState = mongoose.connection.readyState;
      const isConnected = readyState === 1;
      const stateMap: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      };
      const databaseState = stateMap[readyState] || "unknown";
      const memoryUsage = process.memoryUsage();
      const status = isConnected ? "healthy" : "unhealthy";

      return res.status(isConnected ? 200 : 503).json({
        status,
        database: databaseState,
        uptime: process.uptime(),
        timestamp: new Date(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0",
        memoryUsage: {
          rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          externalMB: Math.round(memoryUsage.external / 1024 / 1024),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        status: "unhealthy",
        database: "error",
        uptime: process.uptime(),
        timestamp: new Date(),
        message: error.message || "Health check failed",
      });
    }
  }
}

export default AdminController;
