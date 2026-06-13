import Parser from "rss-parser";
import { NewsItem } from "@/lib/types";
import { randomUUID } from "crypto";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Lighthouse-Career-Navigator/1.0" },
});

const SG_FEEDS = [
  { url: "https://e27.co/feed/", name: "e27" },
  { url: "https://www.techinasia.com/feed", name: "Tech in Asia" },
  { url: "https://vulcanpost.com/feed/", name: "Vulcan Post" },
];

// Keywords that indicate relevance to CS students / tech careers
const TECH_KEYWORDS = [
  "ai", "machine learning", "software", "developer", "engineer",
  "startup", "tech", "coding", "data", "cloud", "cybersecurity",
  "product", "fintech", "deeptech", "vc", "funding", "hiring",
  "singapore", "sea", "grab", "sea limited", "shopee", "govtech",
  "open government", "ncs", "singtel", "dbs", "ocbc", "uob", "stripe",
  "bytedance", "tiktok", "lazada", "carousell", "ninja van",
];

function isTechRelevant(title: string, summary: string): boolean {
  const combined = `${title} ${summary}`.toLowerCase();
  return TECH_KEYWORDS.some((kw) => combined.includes(kw));
}

async function fetchFeed(feedUrl: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = [];

    for (const item of feed.items.slice(0, 15)) {
      const title = item.title ?? "";
      const summary = item.contentSnippet ?? item.content ?? item.summary ?? "";
      const url = item.link ?? "";
      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      if (!title || !url) continue;
      if (!isTechRelevant(title, summary)) continue;

      items.push({
        id: randomUUID(),
        title,
        summary: summary.slice(0, 500),
        url,
        source: sourceName,
        publishedAt,
        relevantSkills: [],
      });
    }

    return items;
  } catch (err) {
    console.warn(`Failed to fetch feed ${sourceName}:`, err);
    return [];
  }
}

export async function fetchSGTechNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    SG_FEEDS.map((f) => fetchFeed(f.url, f.name))
  );

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by most recent, deduplicate by URL
  const seen = new Set<string>();
  const deduped = allItems
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

  return deduped;
}
