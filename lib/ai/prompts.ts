import { UserProfile, NewsItem } from "@/lib/types";

export function personalizedNewsRewritingPrompt(
  newsItem: NewsItem,
  userProfile: UserProfile
): string {
  return `You are an AI career advisor for Singapore CS students. Your job is to rewrite tech news so it feels personally relevant to a specific student.

Student Profile:
- Name: ${userProfile.fullName}
- University: ${userProfile.university}
- Year: Year ${userProfile.yearOfStudy}
- Major: ${userProfile.major}
- Current Skills: ${userProfile.skills.length > 0 ? userProfile.skills.join(", ") : "Not specified yet"}
- Target Roles: ${userProfile.targetRoles.length > 0 ? userProfile.targetRoles.join(", ") : "Exploring options"}
- Interests: ${userProfile.interests.length > 0 ? userProfile.interests.join(", ") : "General tech"}

News Article:
Title: ${newsItem.title}
Summary: ${newsItem.summary}
Source: ${newsItem.source}
Published: ${newsItem.publishedAt}

Rewrite this into a short, personalized insight for the student. Be direct and conversational — like a senior friend in the SG tech industry giving real advice. Reference Singapore companies (Grab, Sea, Shopee, GovTech, DBS, OCBC, Carousell, Ninja Van, etc.) where relevant. Do NOT be generic.

Return ONLY valid JSON in this exact format:
{
  "headline": "One punchy sentence tailored to the student (max 15 words)",
  "summary": "2-3 sentences: what happened, why it matters for their specific career path",
  "relevance": "One sentence connecting this directly to their skills or target roles"
}`;
}

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
Examples of good outputs:
- "Build a small FastAPI project to match the ML Engineer role at Shopee."
- "Complete the AWS Cloud Practitioner exam — GovTech is actively hiring cloud engineers."
- "Add a React project to GitHub before applying to the Grab frontend role."

Return only the sentence. No quotes, no punctuation at start.`;
}

export function selectTopNewsPrompt(
  newsItems: NewsItem[],
  userProfile: UserProfile,
  count: number = 5
): string {
  const itemList = newsItems
    .slice(0, 20)
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}`)
    .join("\n");

  return `You are selecting the most career-relevant news for a Singapore CS student.

Student:
- Skills: ${userProfile.skills.join(", ")}
- Target Roles: ${userProfile.targetRoles.join(", ")}
- Interests: ${userProfile.interests.join(", ")}

News articles (choose the ${count} most relevant to their career path):
${itemList}

Return ONLY a JSON array of the ${count} article numbers you selected, e.g. [1, 3, 7, 12, 15].
Prefer articles about: hiring trends, new technologies in their interest areas, Singapore/SEA tech companies, skills they should learn.`;
}
