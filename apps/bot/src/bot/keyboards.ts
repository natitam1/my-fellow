import { InlineKeyboard, Keyboard } from "grammy";
export const DEPARTMENTS: string[] = [
  "Freshman",
  "Applied Chemistry",
  "Applied Mathematics",
  "Applied Biology",
  "Applied Physics",
  "Information System",
  "Computer Science",
  "Statistics",
  "Engineering(5 Kilo)",
  "Social Science(6 Kilo)",
  "Other",
];
export const TEAM_NAMES = [
  "Bible Study",
  "Evangelism",
  "Freshman",
  "I4U",
  "Media",
  "Prayer",
  "Worship",
  "Other",
];
export const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Other",
];
export function mainReplyKeyboard(isAdmin?: boolean) {
  const kb = new Keyboard()
    .text("Events")
    .text("Leaders")
    .row()
    .text("Fellow Info")
    .text("Give")
    .row();

  if (isAdmin) {
    kb.text("Admin").row();
  }

  return kb.resized();
}
export function fellowInfoReplyKeyboard() {
  return new Keyboard()
    .text("Programs")
    .text("Teams")
    .row()
    .text("Locations")
    .text("Social Links")
    .row()
    .text("Back to Main Menu")
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
    .text("Social Media", "fi_social")
    .row()
    .text("Back", "back_to_menu");
}

export function adminInlineMenu() {
  return new InlineKeyboard()
    .text("Stats", "adm_stats")
    .text("Users", "adm_users")
    .row()
    .text("Events", "adm_events")
    .text("Devotions", "adm_devotions")
    .row()
    .text("Leaders", "adm_leaders")
    .text("Programs", "adm_programs")
    .row()
    .text("Teams", "adm_teams")
    .text("Locations", "adm_locations")
    .row()
    .text("Registrations", "adm_registrations")
    .text("Transactions", "adm_transactions")
    .row()
    .text("Orders", "adm_orders")
    .text("Join Requests", "adm_joinreqs")
    .row()
    .text("Back", "back_to_main");
}

export function adminEntityMenu(entity: string) {
  return new InlineKeyboard()
    .text("List All", `adm_${entity}_list`)
    .text("Add New", `adm_${entity}_add`)
    .row()
    .text("Back", "adm_menu");
}

export function adminEntityListMenu(entity: string) {
  return new InlineKeyboard()
    .text("Add New", `adm_${entity}_add`)
    .row()
    .text("Back", `adm_${entity}`);
}

export function confirmDeleteKeyboard(entity: string, id: string) {
  return new InlineKeyboard()
    .text("Yes, Delete", `adm_${entity}_confirmdelete_${id}`)
    .text("Cancel", `adm_${entity}_list`);
}

export function adminBackButton(target: string) {
  return new InlineKeyboard().text("Back", target);
}

export function buildPaginationKeyboard(
  section: string,
  currentPage: number,
  hasMore: boolean,
  backAction: string = "back_to_main",
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
  kb.text(backAction === "back_to_main" ? "Home" : "Back", backAction);
  return kb;
}
export function selectionKeyboard(options: string[], prefix: string) {
  const kb = new InlineKeyboard();
  options.forEach((opt, index) => {
    kb.text(opt, `${prefix}${opt}`);
    if ((index + 1) % 2 === 0) kb.row();
  });
  return kb;
}
