import { Context, SessionFlavor } from "grammy";

export type BotState =
  | "IDLE"
  | "WAIT_PHONE"
  | "COLLECT_NAME"
  | "COLLECT_TEAM"
  | "COLLECT_DEPARTMENT"
  | "COLLECT_YEAR"
  | "BROWSING";

export interface SessionData {
  state: BotState;
  token?: string;
  user?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
  };
  lastBotMessageId?: number;

  // Pagination
  currentSection?: string;
  currentPage: number;

  // Registration / Multi-step data
  onboardingData?: {
    fullName?: string;
    phoneNumber?: string;
    team?: string;
    department?: string;
    yearOfStudy?: string;
  };

  // Pending actions
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
