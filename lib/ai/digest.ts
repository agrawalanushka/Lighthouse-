import { randomUUID } from "crypto";
import { UserProfile, PulseDigest, PulseItem, NewsItem } from "@/lib/types";
import { callClaude } from "./index";
import { fetchCategorisedNews } from "./rss";
import {
  generalAINewsPrompt,
  personalizedNewsPrompt,
  selectGeneralAIItemsPrompt,
  selectPersonalizedItemsPrompt,
} from "./prompts";
import { createServerClient } from "@/lib/supabase-server";
import seedNews from "@/data/seed/news.json";

const GENERAL_COUNT = 2;
const PERSONALIZED_COUNT = 3;

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

  // items column stores { generalItems, personalizedItems }
  const stored = data.items as {
    generalItems: PulseItem[];
    personalizedItems: PulseItem[];
  };

  return {
    id: data.id,
    userId: data.user_id,
    weekOf: data.week_of,
    generatedAt: data.generated_at,
    generalItems: stored.generalItems ?? [],
    personalizedItems: stored.personalizedItems ?? [],
  };
}

async function saveDigest(digest: PulseDigest): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("pulse_digests").upsert(
    {
      id: digest.id,
      user_id: digest.userId,
      week_of: digest.weekOf,
      items: {
        generalItems: digest.generalItems,
        personalizedItems: digest.personalizedItems,
      },
      generated_at: digest.generatedAt,
    },
    { onConflict: "user_id,week_of" }
  );
  if (error) console.error("Failed to save digest:", error.message);
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

// --- Selection helpers ---

async function selectItems(
  pool: NewsItem[],
  prompt: string,
  count: number
): Promise<NewsItem[]> {
  if (pool.length <= count) return pool.slice(0, count);

  try {
    const response = await callClaude({ prompt, maxTokens: 80 });
    const match = response.match(/\[[\d,\s]+\]/);
    if (!match) throw new Error("No array in response");
    const indices: number[] = JSON.parse(match[0]);
    return indices
      .filter((i) => i >= 1 && i <= pool.length)
      .map((i) => pool[i - 1])
      .slice(0, count);
  } catch {
    return pool.slice(0, count);
  }
}

// --- Personalization ---

async function rewriteItem(
  newsItem: NewsItem,
  prompt: string
): Promise<PulseItem> {
  try {
    const response = await callClaude({ prompt, maxTokens: 400 });
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    const parsed = JSON.parse(match[0]);

    return {
      id: randomUUID(),
      headline: parsed.headline ?? newsItem.title,
      summary: parsed.summary ?? newsItem.summary,
      relevance: parsed.relevance ?? "",
      url: newsItem.url,
      source: newsItem.source,
      publishedAt: newsItem.publishedAt,
    };
  } catch {
    return {
      id: randomUUID(),
      headline: newsItem.title,
      summary: newsItem.summary,
      relevance: "",
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
  // 1. Fetch live news, categorised into AI-industry vs career items
  let aiPool: NewsItem[] = [];
  let careerPool: NewsItem[] = [];

  try {
    const { aiItems, careerItems } = await fetchCategorisedNews();
    aiPool = aiItems;
    careerPool = careerItems;
  } catch (err) {
    console.warn("RSS fetch failed, using seed data:", err);
  }

  // Pad with seed data if feeds return too little
  if (aiPool.length < GENERAL_COUNT || careerPool.length < PERSONALIZED_COUNT) {
    const seedAI = (seedNews as NewsItem[]).filter((n) =>
      n.title.toLowerCase().includes("ai") ||
      n.title.toLowerCase().includes("machine learning")
    );
    const seedCareer = (seedNews as NewsItem[]).filter(
      (n) => !seedAI.includes(n)
    );

    if (aiPool.length < GENERAL_COUNT) {
      const liveUrls = new Set(aiPool.map((n) => n.url));
      aiPool = [...aiPool, ...seedAI.filter((n) => !liveUrls.has(n.url))];
    }
    if (careerPool.length < PERSONALIZED_COUNT) {
      const liveUrls = new Set(careerPool.map((n) => n.url));
      careerPool = [
        ...careerPool,
        ...seedCareer.filter((n) => !liveUrls.has(n.url)),
      ];
    }
  }

  // 2. Claude selects the best items from each pool
  const [selectedAI, selectedCareer] = await Promise.all([
    selectItems(
      aiPool,
      selectGeneralAIItemsPrompt(aiPool, GENERAL_COUNT),
      GENERAL_COUNT
    ),
    selectItems(
      careerPool,
      selectPersonalizedItemsPrompt(careerPool, userProfile, PERSONALIZED_COUNT),
      PERSONALIZED_COUNT
    ),
  ]);

  // 3. Claude rewrites each item — general and personalized concurrently
  const [generalItems, personalizedItems] = await Promise.all([
    Promise.all(
      selectedAI.map((item) =>
        rewriteItem(item, generalAINewsPrompt(item))
      )
    ),
    Promise.all(
      selectedCareer.map((item) =>
        rewriteItem(item, personalizedNewsPrompt(item, userProfile))
      )
    ),
  ]);

  const digest: PulseDigest = {
    id: randomUUID(),
    userId: userProfile.id,
    weekOf: weekOf(),
    generatedAt: new Date().toISOString(),
    generalItems,
    personalizedItems,
  };

  // 4. Save to Supabase (non-blocking)
  saveDigest(digest).catch((err) =>
    console.error("Background save failed:", err)
  );

  return digest;
}

// Seed fallback — served when API key is missing or during demo recovery
export function seedDigest(userId: string): PulseDigest {
  const allSeed = seedNews as NewsItem[];

  const generalItems: PulseItem[] = allSeed
    .filter(
      (n) =>
        n.title.toLowerCase().includes("ai") ||
        n.title.toLowerCase().includes("machine learning")
    )
    .slice(0, GENERAL_COUNT)
    .map((n) => ({
      id: randomUUID(),
      headline: n.title,
      summary: n.summary,
      relevance: "AI is actively reshaping this part of the tech industry.",
      url: n.url,
      source: n.source,
      publishedAt: n.publishedAt,
    }));

  const personalizedItems: PulseItem[] = allSeed
    .filter(
      (n) =>
        !n.title.toLowerCase().includes("ai") &&
        !n.title.toLowerCase().includes("machine learning")
    )
    .slice(0, PERSONALIZED_COUNT)
    .map((n) => ({
      id: randomUUID(),
      headline: n.title,
      summary: n.summary,
      relevance: "Relevant to your skills and target roles.",
      url: n.url,
      source: n.source,
      publishedAt: n.publishedAt,
    }));

  return {
    id: randomUUID(),
    userId,
    weekOf: weekOf(),
    generatedAt: new Date().toISOString(),
    generalItems,
    personalizedItems,
  };
}
