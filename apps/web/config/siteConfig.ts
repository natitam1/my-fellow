export const siteConfig = {
  name: "My Fellow",
  fellowshipName: "4 Kilo Christian Students Fellowship (AAU ECSF)",
  shortCampus: "AAU 4 Kilo Campus",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "2.0.0",
  description:
    "The official digital platform of the 4 Kilo Christian Students Fellowship (AAU ECSF). Daily devotionals, student community, campus programs, and transparent welfare giving.",
  links: {
    catalog: "/catalog",
    appDownload: process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/community",
    telegramBot:
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/I4U_TEAM_bot",
    githubRepo:
      process.env.NEXT_PUBLIC_GITHUB_REPO_URL ||
      "https://github.com/natitam1/my-fellow",
    docs: "/docs",
    changelog: "/changelog",
    support: "/support",
    faqs: "/#faqs",
  },
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || "natitam1",
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || "my-fellow",
  },
};
