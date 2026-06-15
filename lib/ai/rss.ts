import Parser from "rss-parser";
import { NewsItem } from "@/lib/types";
import { randomUUID } from "crypto";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Lighthouse-Career-Navigator/1.0" },
});

const FEEDS = [
  {
    url: "https://www.straitstimes.com/news/singapore/rss.xml",
    name: "The Straits Times",
  },
  {
    url: "https://www.technologyreview.com/feed/",
    name: "MIT Technology Review",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    name: "Ars Technica",
  },
];

// Keywords for GENERAL section — AI reshaping the industry
export const AI_INDUSTRY_KEYWORDS = [
  "artificial intelligence", "ai ", " ai,", "generative ai", "large language model",
  "llm", "gpt", "machine learning", "deep learning", "neural network",
  "automation", "ai model", "chatbot", "ai tool", "foundation model",
  "ai regulation", "ai safety", "ai ethics", "ai startup", "ai funding",
  "openai", "anthropic", "google deepmind", "microsoft ai", "meta ai",
  "ai hiring", "ai jobs", "ai productivity", "ai coding", "github copilot",
];

// Keywords for PERSONALIZED section — what CS students care about for their careers
export const CS_CAREER_KEYWORDS = [
  // Roles
  "software engineer", "software developer", "full stack", "frontend", "backend",
  "data engineer", "data scientist", "ml engineer", "devops", "cloud engineer",
  "product manager", "cybersecurity", "security engineer",
  // Skills & technologies
  "python", "javascript", "typescript", "react", "node.js", "golang", "rust",
  "kubernetes", "docker", "aws", "gcp", "azure", "sql", "postgresql",
  "system design", "api", "microservices", "open source",
  // Career & hiring
  "internship", "fresh grad", "entry level", "junior developer", "hiring",
  "salary", "tech job", "tech career", "coding interview", "leetcode",
  // SG companies
  "govtech", "grab", "sea limited", "shopee", "garena", "seamoney",
  "dbs", "ocbc", "uob", "singtel", "ncs", "carousell", "ninja van",
  "lazada", "bytedance", "tiktok", "stripe", "google singapore",
  "meta singapore", "microsoft singapore", "amazon singapore",
  // SG context
  "singapore tech", "singapore startup", "sg tech", "imda", "mas fintech",
  "smart nation", "digital government",
];

function classifyItem(title: string, summary: string): "ai" | "career" | null {
  const text = `${title} ${summary}`.toLowerCase();
  const isAI = AI_INDUSTRY_KEYWORDS.some((kw) => text.includes(kw));
  const isCareer = CS_CAREER_KEYWORDS.some((kw) => text.includes(kw));
  if (isAI) return "ai";
  if (isCareer) return "career";
  return null;
}

async function fetchFeed(
  feedUrl: string,
  sourceName: string
): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = [];

    for (const item of feed.items.slice(0, 20)) {
      const title = item.title ?? "";
      const summary =
        item.contentSnippet ?? item.content ?? item.summary ?? "";
      const url = item.link ?? "";
      const publishedAt = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      if (!title || !url) continue;

      const category = classifyItem(title, summary);
      if (!category) continue;

      // ST's general feed has crime/property/lifestyle noise — require tech keywords
      // in the title itself (not just the summary) for ST articles
      if (sourceName === "The Straits Times") {
        const titleLower = title.toLowerCase();
        const hasTechInTitle = [...AI_INDUSTRY_KEYWORDS, ...CS_CAREER_KEYWORDS].some(
          (kw) => titleLower.includes(kw)
        );
        if (!hasTechInTitle) continue;
      }

      items.push({
        id: randomUUID(),
        title,
        summary: summary.slice(0, 600),
        url,
        source: sourceName,
        publishedAt,
        // Stash category in relevantSkills temporarily so digest.ts can split
        relevantSkills: [category],
      });
    }

    return items;
  } catch (err) {
    console.warn(`Failed to fetch feed ${sourceName}:`, err);
    return [];
  }
}

export interface CategorisedNews {
  aiItems: NewsItem[];
  careerItems: NewsItem[];
}

export async function fetchCategorisedNews(): Promise<CategorisedNews> {
  const results = await Promise.allSettled(
    FEEDS.map((f) => fetchFeed(f.url, f.name))
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // Deduplicate by URL, sort newest first
  const seen = new Set<string>();
  const deduped = all
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

  return {
    aiItems: deduped.filter((n) => n.relevantSkills[0] === "ai"),
    careerItems: deduped.filter((n) => n.relevantSkills[0] === "career"),
  };
}
