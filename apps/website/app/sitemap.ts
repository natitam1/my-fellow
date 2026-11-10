import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://4kilofellowship.org";
  const lastModified = new Date("2026-11-10");

  const routes = [
    "",
    "/catalog",
    "/changelog",
    "/docs",
    "/support",
    "/privacy",
    "/terms",
    "/delete-account",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/delete-account" ? 0.8 : 0.7,
  }));
}
