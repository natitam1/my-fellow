import { BotContext } from "../context";
import { sharePhoneKeyboard, mainReplyKeyboard } from "../keyboards";
import { lookupByPhone, registerUser } from "../../api/auth";
import { deleteLastBotMessage } from "../message-manager";

export async function handleStart(ctx: BotContext) {
  ctx.session.state = "WAIT_PHONE";
  ctx.session.lastBotMessageId = undefined;
  
  await ctx.reply("Welcome to My Fellow Bot. Share your phone number to sign in or get started.", {
    reply_markup: sharePhoneKeyboard()
  });
}

export async function handleContact(ctx: BotContext) {
  const contact = ctx.message?.contact;
  if (!contact || !contact.phone_number) return;

  const phone = contact.phone_number.startsWith("+") 
    ? contact.phone_number 
    : `+${contact.phone_number}`;

  try {
    const { user, token } = await lookupByPhone(phone);
    
    ctx.session.user = user;
    ctx.session.token = token;
    ctx.session.state = "BROWSING";

    await deleteLastBotMessage(ctx);
    await ctx.reply(`Welcome back ${user.fullName}. Use the bottom buttons to navigate.`, {
      reply_markup: mainReplyKeyboard()
    });
  } catch (err: any) {
    // User not found, start onboarding
    ctx.session.onboardingData = { phoneNumber: phone };
    ctx.session.state = "COLLECT_NAME";
    
    await deleteLastBotMessage(ctx);
    await ctx.reply("User not found. Lets create your profile. What is your full name?", {
      reply_markup: { remove_keyboard: true }
    });
  }
}

export async function handleNameCollected(ctx: BotContext, name: string) {
  if (name.length < 3) {
    return ctx.reply("Please provide a valid full name (at least 3 characters).");
  }

  const phone = ctx.session.onboardingData?.phoneNumber!;
  
  try {
    const { user, token } = await registerUser({ fullName: name, phoneNumber: phone });
    
    ctx.session.user = user;
    ctx.session.token = token;
    ctx.session.state = "BROWSING";
    delete ctx.session.onboardingData;

    await ctx.reply(`Registration complete. Welcome ${user.fullName}.`, {
      reply_markup: mainReplyKeyboard()
    });
  } catch (err: any) {
    await ctx.reply(`Failed to register: ${err.message || "Unknown error"}. Try /start again.`);
    ctx.session.state = "IDLE";
  }
}

export async function handleLogout(ctx: BotContext) {
  ctx.session = { state: "IDLE", currentPage: 1 };
  await ctx.reply("You have been logged out. Share your phone again if you want to sign in.", {
    reply_markup: sharePhoneKeyboard()
  });
}
