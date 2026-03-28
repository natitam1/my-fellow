import { Context, SessionFlavor } from "grammy";
export type BotState = "IDLE" | "WAIT_PHONE" | "COLLECT_NAME" | "COLLECT_TEAM" | "COLLECT_DEPARTMENT" | "COLLECT_YEAR" | "COLLECT_PASSWORD" | "BROWSING";
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
    currentSection?: string;
    currentPage: number;
    onboardingData?: {
        fullName?: string;
        phoneNumber?: string;
        team?: string;
        department?: string;
        yearOfStudy?: string;
        password?: string;
    };
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
