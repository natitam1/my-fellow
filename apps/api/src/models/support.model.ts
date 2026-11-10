import mongoose, { Document, Schema } from "mongoose";

export interface ISupportTicket extends Document {
  userId: string;
  message?: string;
  imageUrl?: string;
  status: "pending" | "resolved" | "in-progress";
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    message: { type: String, default: "" },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "resolved", "in-progress"],
      default: "pending",
      index: true,
    },
    adminResponse: { type: String, default: null },
  },
  { timestamps: true },
);

export const SupportTicket =
  (mongoose.models.SupportTicket as mongoose.Model<ISupportTicket>) ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
