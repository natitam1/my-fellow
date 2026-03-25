import { BotContext } from "../context";
import { sharePhoneKeyboard, mainReplyKeyboard } from "../keyboards";
import { lookupByPhone, signIn, registerUser } from "../../api/auth";
import { deleteLastBotMessage } from "../message-manager";
import { handleFellowInfo } from "./fellow-info";

function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\D/g, "");
  if (normalized.startsWith("251")) {
    normalized = "0" + normalized.substring(3);
  } else if (
    normalized.length === 9 &&
    (normalized.startsWith("9") || normalized.startsWith("7"))
  ) {
    normalized = "0" + normalized;
  }
  return normalized;
}

export async function handleStart(ctx: BotContext) {
  ctx.session.state = "WAIT_PHONE";
  ctx.session.lastBotMessageId = undefined;

  await ctx.reply(
    "Welcome to My Fellow Bot. Share your phone number to sign in or get started.",
    {
      reply_markup: sharePhoneKeyboard(),
    },
  );
}

export async function handleContact(ctx: BotContext) {
  const contact = ctx.message?.contact;
  if (!contact || !contact.phone_number) return;

  const phone = normalizePhoneNumber(contact.phone_number);

  try {
    // Check if user exists
    const { user } = await lookupByPhone(phone);

    // User found, ask for password
    ctx.session.onboardingData = { phoneNumber: phone };
    ctx.session.state = "BROWSING"; // We'll handle via password capture in index.ts or separate handler
    (ctx.session as any).__pendingPassword = true;

    await deleteLastBotMessage(ctx);
    await ctx.reply(
      `Account found for ${user.fullName}. Please enter your password to sign in.`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );
  } catch (err: any) {
    // User not found, start onboarding
    ctx.session.onboardingData = { phoneNumber: phone };
    ctx.session.state = "COLLECT_NAME";

    await deleteLastBotMessage(ctx);
    await ctx.reply(
      "Welcome. Lets create your profile. What is your full name?",
      {
        reply_markup: { remove_keyboard: true },
      },
    );
  }
}

export async function handlePasswordSubmitted(
  ctx: BotContext,
  password: string,
) {
  const phone = ctx.session.onboardingData?.phoneNumber;
  if (!phone) {
    ctx.session.state = "WAIT_PHONE";
    return ctx.reply("Session expired. Please start again with /start.");
  }

  try {
    const { user, token } = await signIn({ phoneNumber: phone, password });

    ctx.session.user = user;
    ctx.session.token = token;
    ctx.session.state = "BROWSING";
    delete ctx.session.onboardingData;
    delete (ctx.session as any).__pendingPassword;

    await ctx.reply(`Logged in successfully. Welcome back ${user.fullName}.`, {
      reply_markup: mainReplyKeyboard(),
    });

    // Automatically redirect to Home/Fellow Info without swapping the keyboard
    return handleFellowInfo(ctx, true);
  } catch (err: any) {
    await ctx.reply("Invalid password. Please try again.");
  }
}

export async function handleNameCollected(ctx: BotContext, name: string) {
  if (name.length < 3) {
    return ctx.reply(
      "Please provide a valid full name (at least 3 characters).",
    );
  }

  const phone = ctx.session.onboardingData?.phoneNumber!;

  try {
    const { user, token } = await registerUser({
      fullName: name,
      phoneNumber: phone,
    });

    ctx.session.user = {
      id: user.id || user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
    ctx.session.token = token;
    ctx.session.state = "BROWSING";
    delete ctx.session.onboardingData;

    await ctx.reply(`Registration complete. Welcome ${user.fullName}.`, {
      reply_markup: mainReplyKeyboard(),
    });

    // Automatically redirect to Home/Fellow Info without swapping the keyboard
    return handleFellowInfo(ctx, true);
  } catch (err: any) {
    await ctx.reply(
      `Failed to register: ${err.message || "Unknown error"}. Try /start again.`,
    );
    ctx.session.state = "IDLE";
  }
}

export async function handleLogout(ctx: BotContext) {
  ctx.session = { state: "IDLE", currentPage: 1 };
  await ctx.reply("Logged out. Share your phone again to sign in.", {
    reply_markup: sharePhoneKeyboard(),
  });
}
