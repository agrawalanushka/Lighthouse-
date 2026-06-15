import { UserProfile, NewsItem } from "@/lib/types";

// --- GENERAL SECTION ---
// Rewrites a news article as a broad AI industry insight (not user-specific).
// These appear in the "AI & The Industry" section of the Pulse page.
export function generalAINewsPrompt(newsItem: NewsItem): string {
  return `You are a tech industry analyst writing for Singapore CS students. Rewrite this news as a concise, insightful take on how AI is changing the tech industry.

Article:
Title: ${newsItem.title}
Summary: ${newsItem.summary}
Source: ${newsItem.source}

Write for a computing student audience — assume they understand technical concepts but explain the industry implications clearly.

Return ONLY valid JSON:
{
  "headline": "One sharp sentence on what this means for the tech industry (max 15 words)",
  "summary": "2-3 sentences: what's happening and the broader industry impact — be specific, no fluff",
  "relevance": "One sentence: what this shift means for CS students entering the workforce in Singapore"
}`;
}

// --- PERSONALIZED SECTION ---
// Rewrites a news article tailored to the user's specific skills and target roles
// from their onboarding profile (handled by Min's /onboarding flow).
export function personalizedNewsPrompt(
  newsItem: NewsItem,
  userProfile: UserProfile
): string {
  const skills = userProfile.skills.length > 0
    ? userProfile.skills.join(", ")
    : "Not specified";
  const roles = userProfile.targetRoles.length > 0
    ? userProfile.targetRoles.join(", ")
    : "Exploring options";
  const interests = userProfile.interests.length > 0
    ? userProfile.interests.join(", ")
    : "General tech";

  return `You are a career mentor for a Singapore CS student. Rewrite this news article so it feels directly relevant to their specific career path.

Student Profile (from their onboarding):
- University: ${userProfile.university}, Year ${userProfile.yearOfStudy}
- Skills they listed: ${skills}
- Target roles they selected: ${roles}
- Interests: ${interests}

Article:
Title: ${newsItem.title}
Summary: ${newsItem.summary}
Source: ${newsItem.source}

Write like a senior friend in the SG tech industry giving real, specific advice. Reference actual SG companies (Grab, GovTech, Sea, DBS, Carousell, etc.) where relevant. Connect the news directly to their listed skills or target roles — do not be generic.

Return ONLY valid JSON:
{
  "headline": "One punchy sentence tailored to them and their skills/roles (max 15 words)",
  "summary": "2-3 sentences: what happened and why it matters specifically for their career path",
  "relevance": "One sentence connecting this to their specific skills or target roles"
}`;
}

// --- SELECTION PROMPTS ---
// Used by Claude to pick the best N articles from a larger pool.

export function selectGeneralAIItemsPrompt(
  items: NewsItem[],
  count: number = 2
): string {
  const list = items
    .slice(0, 15)
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}`)
    .join("\n");

  return `Pick the ${count} most impactful articles about AI's effect on the tech industry for a Singapore CS student audience.

Prefer articles about: AI replacing or augmenting developer roles, new AI tools changing how software is built, AI regulation affecting tech companies, AI funding/hiring trends.

Articles:
${list}

Return ONLY a JSON array of numbers, e.g. [2, 5]`;
}

export function selectPersonalizedItemsPrompt(
  items: NewsItem[],
  userProfile: UserProfile,
  count: number = 3
): string {
  const list = items
    .slice(0, 20)
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}`)
    .join("\n");

  return `Pick the ${count} articles most relevant to this specific CS student's career.

Student: ${userProfile.university} Year ${userProfile.yearOfStudy}
Skills: ${userProfile.skills.join(", ")}
Target Roles: ${userProfile.targetRoles.join(", ")}
Interests: ${userProfile.interests.join(", ")}

Prefer articles about: their target roles, their listed skills, SG companies hiring in their area, career advice for their specific track.

Articles:
${list}

Return ONLY a JSON array of numbers, e.g. [1, 4, 9]`;
}

// Used by Anushka's dashboard — generates the "This week's focus" widget text.
export function weeklyFocusPrompt(
  userProfile: UserProfile,
  pulseHighlight: string,
  topJobTitle: string,
  riskSummary: string,
  skillGapSummary: string
): string {
  return `You are a career mentor for a Singapore CS student. Based on this week's data, suggest ONE actionable focus for them this week.

Student: ${userProfile.fullName}, ${userProfile.university} Year ${userProfile.yearOfStudy}
Skills: ${userProfile.skills.join(", ")}
Target Roles: ${userProfile.targetRoles.join(", ")}

This Week's Data:
- Top News: ${pulseHighlight}
- Best Job Match: ${topJobTitle}
- Risk Alert: ${riskSummary}
- Skill Gap: ${skillGapSummary}

Write ONE specific, actionable sentence (max 15 words). Make it achievable this week.
Examples:
- "Build a small FastAPI project to match the ML Engineer role at Shopee."
- "Complete the AWS Cloud Practitioner exam — GovTech is actively hiring cloud engineers."

Return only the sentence. No quotes.`;
}
