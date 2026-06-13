import { randomUUID } from "crypto";
import { UserProfile, PulseDigest, PulseItem, NewsItem } from "@/lib/types";
import { callClaude } from "./index";
import { fetchSGTechNews } from "./rss";
import { personalizedNewsRewritingPrompt, selectTopNewsPrompt } from "./prompts";
import { createServerClient } from "@/lib/supabase-server";
import seedNews from "@/data/seed/news.json";

const ITEMS_PER_DIGEST = 5;

export function weekOf(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// --- Supabase helpers ---

export async function getCachedDigest(
  userId: string,
  week: string
): Promise<PulseDigest | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("pulse_digests")
    .select("*")
    .eq("user_id", userId)
    .eq("week_of", week)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    weekOf: data.week_of,
    generatedAt: data.generated_at,
    items: data.items as PulseItem[],
  };
}

async function saveDigest(digest: PulseDigest): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("pulse_digests").upsert(
    {
      id: digest.id,
      user_id: digest.userId,
      week_of: digest.weekOf,
      items: digest.items,
      generated_at: digest.generatedAt,
    },
    { onConflict: "user_id,week_of" }
  );
  if (error) console.error("Failed to save digest to Supabase:", error.message);
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// --- News selection & personalization ---

async function selectTopItems(
  items: NewsItem[],
  userProfile: UserProfile
): Promise<NewsItem[]> {
  if (items.length <= ITEMS_PER_DIGEST) return items;

  try {
    const prompt = selectTopNewsPrompt(items, userProfile, ITEMS_PER_DIGEST);
    const response = await callClaude({ prompt, maxTokens: 100 });
    const match = response.match(/\[[\d,\s]+\]/);
    if (!match) throw new Error("Could not parse selection");

    const indices: number[] = JSON.parse(match[0]);
    return indices
      .filter((i) => i >= 1 && i <= items.length)
      .map((i) => items[i - 1])
      .slice(0, ITEMS_PER_DIGEST);
  } catch {
    return items.slice(0, ITEMS_PER_DIGEST);
  }
}

async function personalizeItem(
  newsItem: NewsItem,
  userProfile: UserProfile
): Promise<PulseItem> {
  try {
    const prompt = personalizedNewsRewritingPrompt(newsItem, userProfile);
    const response = await callClaude({ prompt, maxTokens: 400 });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      id: randomUUID(),
      headline: parsed.headline ?? newsItem.title,
      summary: parsed.summary ?? newsItem.summary,
      relevance: parsed.relevance ?? "Relevant to your career path.",
      url: newsItem.url,
      source: newsItem.source,
      publishedAt: newsItem.publishedAt,
    };
  } catch {
    return {
      id: randomUUID(),
      headline: newsItem.title,
      summary: newsItem.summary,
      relevance: "Check this out — it's relevant to your interests.",
      url: newsItem.url,
      source: newsItem.source,
      publishedAt: newsItem.publishedAt,
    };
  }
}

// --- Public API ---

export async function generateDigest(
  userProfile: UserProfile
): Promise<PulseDigest> {
  const week = weekOf();

  // 1. Fetch live SG tech news; fall back to seed if feeds are down
  let rawNews: NewsItem[] = [];
  try {
    rawNews = await fetchSGTechNews();
  } catch (err) {
    console.warn("RSS fetch failed, using seed news:", err);
  }

  if (rawNews.length < ITEMS_PER_DIGEST) {
    const liveUrls = new Set(rawNews.map((n) => n.url));
    const seedItems = (seedNews as NewsItem[]).filter(
      (n) => !liveUrls.has(n.url)
    );
    rawNews = [...rawNews, ...seedItems];
  }

  // 2. Claude selects the top N most relevant items for this user
  const selected = await selectTopItems(rawNews, userProfile);

  // 3. Claude personalizes each item concurrently
  const items = await Promise.all(
    selected.map((item) => personalizeItem(item, userProfile))
  );

  const digest: PulseDigest = {
    id: randomUUID(),
    userId: userProfile.id,
    weekOf: week,
    generatedAt: new Date().toISOString(),
    items,
  };

  // 4. Persist to Supabase (non-blocking — don't fail the response if this errors)
  saveDigest(digest).catch((err) =>
    console.error("Background save failed:", err)
  );

  return digest;
}

// Returns a pre-built digest from seed data — used when API key is missing or
// the user's profile hasn't been set up yet.
export function seedDigest(userId: string): PulseDigest {
  const items: PulseItem[] = (seedNews as NewsItem[])
    .slice(0, ITEMS_PER_DIGEST)
    .map((n) => ({
      id: randomUUID(),
      headline: n.title,
      summary: n.summary,
      relevance: "Relevant to Singapore CS students and tech careers.",
      url: n.url,
      source: n.source,
      publishedAt: n.publishedAt,
    }));

  return {
    id: randomUUID(),
    userId,
    weekOf: weekOf(),
    generatedAt: new Date().toISOString(),
    items,
  };
}
