import { NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const owner = siteConfig.github.owner;
    const repo = siteConfig.github.repo;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "MyFellow-Website",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        stars: typeof data.stargazers_count === "number" ? data.stargazers_count : 42,
      });
    }

    // Rate limited or error from GitHub
    return NextResponse.json({ stars: 42 });
  } catch {
    return NextResponse.json({ stars: 42 });
  }
}
