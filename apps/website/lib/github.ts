export async function getGitHubStars(
  owner: string,
  repo: string,
): Promise<number> {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/github-stars");
      if (res.ok) {
        const data = await res.json();
        return typeof data.stars === "number" ? data.stars : 42;
      }
      return 42;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "MyFellow-Website",
      },
      next: { revalidate: 3600 }, // Cache stars for 1 hour
    });

    if (!res.ok) {
      return 42;
    }

    const data = await res.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : 42;
  } catch {
    return 42;
  }
}
