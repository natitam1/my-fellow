import { BotContext } from "../context";
import {
  sharePhoneKeyboard,
  mainReplyKeyboard,
  selectionKeyboard,
  TEAM_NAMES,
  DEPARTMENTS,
  YEARS,
} from "../keyboards";
import { lookupByPhone, signIn, registerUser } from "../../api/auth";
import { deleteLastBotMessage } from "../message-manager";
import { InlineKeyboard, InputFile } from "grammy";
import path from "path";
async function sendFellowInfoPhoto(ctx: BotContext) {
  const imagePath = path.join(__dirname, "../../../src/assets/felow.jpg");
  const photo = new InputFile(imagePath);
  const caption =
    `AAU 4-Killo Evangelical Christian Students' Fellowship (ECSF) official telegram bot.\n\n` +
    `It is a centralized platform designed to connect members with fellowship activities, announcements, devotionals, and community updates—all in one place.\n\n` +
    `<b>Contact:</b>\n` +
    `• @Jesus_died_for_me\n` +
    `• @fellowship_leader\n\n` +
    `<b>Developer:</b> 0911000002\n` +
    `<b>Telegram:</b> @natitam1`;
  const kb = new InlineKeyboard().url(
    "Official Channel",
    "https://t.me/AAU_4Killo_Fellowship",
  );
  const msg = await ctx.replyWithPhoto(photo, {
    caption,
    parse_mode: "HTML",
    reply_markup: kb,
  });
  ctx.session.lastBotMessageId = msg.message_id;
}
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
    "Welcome to 4killo ECSF Bot. Share your phone number to sign in or get started.",
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
    const { user } = await lookupByPhone(phone);
    ctx.session.onboardingData = { phoneNumber: phone };
    ctx.session.state = "BROWSING";
    (ctx.session as any).__pendingPassword = true;
    await deleteLastBotMessage(ctx);
    await ctx.reply(
      `Account found for ${user.fullName}. Please enter your password to sign in.`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );
  } catch (err: any) {
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
      reply_markup: mainReplyKeyboard(user.role === "admin"),
    });
    await sendFellowInfoPhoto(ctx);
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
  ctx.session.onboardingData = {
    ...ctx.session.onboardingData,
    fullName: name,
  };
  ctx.session.state = "COLLECT_TEAM";
  await ctx.reply("Great! Which team are you in?", {
    reply_markup: selectionKeyboard(TEAM_NAMES, "reg_team_"),
  });
}
export async function handleTeamCollected(ctx: BotContext, team: string) {
  ctx.session.onboardingData = {
    ...ctx.session.onboardingData,
    team: team,
  };
  ctx.session.state = "COLLECT_DEPARTMENT";
  await ctx.reply("Which department are you in?", {
    reply_markup: selectionKeyboard(DEPARTMENTS, "reg_dept_"),
  });
}
export async function handleDepartmentCollected(ctx: BotContext, dept: string) {
  ctx.session.onboardingData = {
    ...ctx.session.onboardingData,
    department: dept,
  };
  ctx.session.state = "COLLECT_YEAR";
  await ctx.reply("What is your current year of study?", {
    reply_markup: selectionKeyboard(YEARS, "reg_year_"),
  });
}
export async function handleYearCollected(ctx: BotContext, year: string) {
  ctx.session.onboardingData = {
    ...ctx.session.onboardingData,
    yearOfStudy: year,
  };
  ctx.session.state = "COLLECT_PASSWORD";
  await ctx.reply(
    "Please enter a password for your account (at least 6 characters). You'll need this to sign in later.",
    {
      reply_markup: { remove_keyboard: true },
    },
  );
}
export async function handlePasswordCollected(
  ctx: BotContext,
  password: string,
) {
  if (password.length < 6) {
    return ctx.reply("Password must be at least 6 characters long.");
  }
  ctx.session.onboardingData = {
    ...ctx.session.onboardingData,
    password: password,
  };
  ctx.session.state = "BROWSING";
  (ctx.session as any).__awaitingPhoto = true;
  const kb = new InlineKeyboard().text("Skip for now", "skip_photo");
  await ctx.reply(
    "Almost done! Would you like to upload a profile picture? Send it as a photo or click skip.",
    {
      reply_markup: kb,
    },
  );
}
export async function finalizeRegistration(ctx: BotContext, photoFile?: any) {
  const data = ctx.session.onboardingData;
  if (!data || !data.phoneNumber || !data.fullName) {
    ctx.session.state = "WAIT_PHONE";
    return ctx.reply("Session expired. Please start again with /start.");
  }
  try {
    const telegramUserName = ctx.from?.username || null;
    const { user, token } = await registerUser({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      team: data.team,
      department: data.department,
      yearOfStudy: data.yearOfStudy,
      telegramUserName: telegramUserName,
      profileImage: photoFile,
      password: data.password,
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
    delete (ctx.session as any).__awaitingPhoto;
    await ctx.reply(`Registration complete. Welcome ${user.fullName}!`, {
      reply_markup: mainReplyKeyboard(user.role === "admin"),
    });
    await sendFellowInfoPhoto(ctx);
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
