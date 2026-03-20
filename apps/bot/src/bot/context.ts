import { Context, SessionFlavor } from "grammy";
export interface SessionData {
  token?: string;
  user?: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };
  page?: number;
  __pendingLogin?: boolean;
  __pendingEventReg?: {
    eventTitle: string;
    username: string;
  };
  __pendingJoinReq?: {
    teamId: string;
  };
  __pendingPayment?: boolean;
}
export type BotContext = Context & SessionFlavor<SessionData>;
