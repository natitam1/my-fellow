export async function getGitHubStars(
  owner: string,
  repo: string,
): Promise<number> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      next: { revalidate: 3600 }, // Cache stars for 1 hour
    });

    if (!res.ok) {
      throw new Error("Failed to fetch GitHub data");
    }

    const data = await res.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return 0;
  }
}
