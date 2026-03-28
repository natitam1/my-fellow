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

export function mainReplyKeyboard() {
  return new Keyboard()
    .text("Events")
    .text("Leaders")
    .row()
    .text("Fellow Info")
    .text("Give")
    .row()
    .resized();
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
    .text("Back", "back_to_menu");
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
