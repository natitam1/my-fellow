import { InlineKeyboard, Keyboard } from "grammy";

export function mainReplyKeyboard() {
  return new Keyboard()
    .text("Events")
    .text("Fellow Info")
    .row()
    .text("My Profile")
    .text("Payments")
    .row()
    .text("Help")
    .text("Logout")
    .resized();
}

export function sharePhoneKeyboard() {
  return new Keyboard()
    .requestContact("Share Phone Number")
    .resized()
    .oneTime();
}

export function fellowInfoInlineMenu() {
  return new InlineKeyboard()
    .text("Leaders", "fi_leaders")
    .row()
    .text("Teams", "fi_teams")
    .row()
    .text("Programs", "fi_programs")
    .row()
    .text("Locations", "fi_locations")
    .row()
    .text("Devotions", "fi_devotions")
    .row()
    .text("Marketplace", "fi_marketplace")
    .row()
    .text("Events", "fi_events")
    .row()
    .text("Back", "back_to_menu");
}

export function buildPaginationKeyboard(
  section: string,
  currentPage: number,
  hasMore: boolean,
  backAction: string = "fi_menu",
) {
  const kb = new InlineKeyboard();

  if (currentPage > 1 || hasMore) {
    if (currentPage > 1) {
      kb.text("Back", `${section}_page_${currentPage - 1}`);
    }
    if (hasMore) {
      kb.text("Next", `${section}_page_${currentPage + 1}`);
    }
    kb.row();
  }

  kb.text("Return", backAction);
  return kb;
}
