import type { News } from "@/lib/api";

export function extractNewsText(value: unknown): string {
  const fragments: string[] = [];

  const visit = (node: unknown) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (!node || typeof node !== "object") return;

    for (const [key, child] of Object.entries(node)) {
      if (key === "text" && typeof child === "string") {
        fragments.push(child);
      } else {
        visit(child);
      }
    }
  };

  visit(value);
  return fragments.join(" ").replace(/\s+/g, " ").trim();
}

export function getNewsImage(news: News): string | undefined {
  if (news.coverImage) return news.coverImage;

  let image: string | undefined;
  const visit = (node: unknown) => {
    if (image || !node) return;

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (typeof node !== "object") return;

    for (const [key, child] of Object.entries(node)) {
      if (key === "src" && typeof child === "string") {
        image = child;
        return;
      }
      visit(child);
    }
  };

  visit(news.content);
  return image;
}
