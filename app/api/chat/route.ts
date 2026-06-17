import { NextRequest } from "next/server";
import { callClaude } from "@/lib/ai/index";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mockRiskScore, mockPulseItem } from "@/lib/mock-dashboard";
import type { RiskScore, PulseItem, UserProfile } from "@/lib/types";
import riskScoresData from "@/data/seed/risk-scores.json";
import rawJobs from "@/data/seed/jobs.json";

type Message = { role: "user" | "assistant"; content: string };

// Extends the canonical RiskScore with fields present in the seed JSON
// that the system prompt needs for accurate score methodology display.
type SeedRiskScore = RiskScore & {
  interventionBreadth: number;
  augShare: number;
  autoShare: number;
};

const FALLBACK_RISK_SCORE: SeedRiskScore = {
  ...mockRiskScore,
  seniority: "mid",
  interventionBreadth: 0,
  augShare: 0,
  autoShare: 0,
};

const ROLE_ID_MAP: Record<string, string> = {
  "Frontend Engineer": "frontend-engineer",
  "Backend Engineer": "backend-engineer",
  "Software Engineer": "backend-engineer",
  "ML Engineer": "ml-engineer",
  "Data Engineer": "data-engineer",
  "Data Scientist": "ml-engineer",
  "DevOps Engineer": "devops-engineer",
  "Cloud Engineer": "cloud-engineer",
  "Security Engineer": "security-engineer",
  "Data Analyst": "data-analyst",
};

function getAllUniqueRoleIds(targetRoles: string[]): string[] {
  const seen = new Set<string>();
  for (const role of targetRoles) {
    const id = ROLE_ID_MAP[role];
    if (id) seen.add(id);
  }
  if (seen.size === 0) seen.add("backend-engineer");
  return [...seen];
}

type JobListing = {
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  experienceLevel: string;
};

function getRelevantJobs(query: string, targetRoles: string[]): JobListing[] {
  if (targetRoles.length === 0) return [];
  const lowerRoles = targetRoles.map((r) => r.toLowerCase());
  const seen = new Set<string>();
  const results: JobListing[] = [];

  for (const job of rawJobs as JobListing[]) {
    const titleLower = job.title.toLowerCase();
    const matches = lowerRoles.some((role) => titleLower.includes(role));
    const key = `${job.company}::${job.title}`;
    if (matches && !seen.has(key)) {
      seen.add(key);
      results.push({
        title: job.title,
        company: job.company,
        location: job.location,
        requiredSkills: job.requiredSkills,
        experienceLevel: job.experienceLevel,
      });
      if (results.length >= 5) break;
    }
  }

  return results;
}

function lookupRiskScore(roleId: string): SeedRiskScore | null {
  const entry = (riskScoresData as SeedRiskScore[]).find(
    (r) => r.roleId === roleId && r.seniority === "mid"
  );
  return entry ?? null;
}

function buildSystemPrompt(
  profile: UserProfile | null,
  riskScores: SeedRiskScore[],
  pulseItems: PulseItem[],
  relevantJobs: JobListing[]
): string {
  const profileSection = profile
    ? `
## Student Profile
- Name: ${profile.fullName}
- University: ${profile.university}, Year ${profile.yearOfStudy}
- Skills: ${profile.skills.join(", ")}
- Target roles: ${profile.targetRoles.join(", ")}
`
    : "";

  const scoresSection = riskScores
    .map(
      (r) =>
        `- Role: ${r.roleName} — Score: ${r.score}/100, Coverage: ${(r.interventionBreadth * 100).toFixed(1)}%, Automation: ${(r.autoShare * 100).toFixed(1)}%, Augmentation: ${(r.augShare * 100).toFixed(1)}%\n  Reasoning: ${r.reasoning}\n  Sources: ${r.sources.join(", ")}`
    )
    .join("\n");

  const pulseSection = pulseItems
    .slice(0, 3)
    .map((item) => `- ${item.headline}: ${item.summary}`)
    .join("\n");

  const jobsSection =
    relevantJobs.length > 0
      ? `\n## Relevant job listings from Singapore market (use these for company-specific skill comparisons):\n${relevantJobs
          .map(
            (j) =>
              `- Company: ${j.company} | Role: ${j.title} | Required Skills: ${j.requiredSkills.join(", ")}`
          )
          .join("\n")}\nWhen the student asks about a specific company or role, reference these listings to give concrete skill gap advice. Always mention that this data is from our curated Singapore job database and may not reflect the very latest openings. Never claim to have live access to company career pages.`
      : "";

  return `You are Lighthouse AI, a career advisor for Singapore CS students. You share observations, flag patterns, and offer perspectives grounded in data — but you never make decisions for students or give them direct orders.
${profileSection}
## AI Intervention Scores — Target Roles (mid level)
${scoresSection}
When the student asks about their score, address each of their target roles individually using the data above.
${jobsSection}
## This Week's Tech News
${pulseSection}

## How you behave

**Advisory tone — observations, not orders**
You CAN give advice and share perspectives. "Building TypeScript skills could strengthen your profile for this role" or "this score suggests augmentation is the dominant pattern here" are fine. What you must NOT do is issue direct instructions: avoid phrasing like "you should do X", "your priority is Y", or "I recommend you…". Think of yourself as a knowledgeable friend sharing observations, not a career coach handing down a plan.

**Skill fit assessment**
When the student asks about fit for a role, compare their listed skills against what that role typically requires in the Singapore market:
- If skills align well: say something like "based on your profile, you appear to be a reasonable fit for X"
- If there are gaps: say something like "based on your profile, building skills in X and Y could move you closer to that role" — present the gap as information, not a verdict
- Always close with a neutral phrase like "but the final call is yours"

**Score explanations**
Explain what the AI Intervention Score means in plain English — the breadth, the automation/augmentation split, what they imply about day-to-day work. Always clarify: AI changes HOW work is done, not WHETHER the role exists.

**News context**
Break down tech news and explain how it relates to the student's target roles. Present the facts and implications; don't tell them what to do with the information.

**Hard rules**
1. Always close substantive responses with a neutral phrase — "the final call is yours" or "that's for you to weigh".
2. NEVER recommend a specific company, job listing, or salary figure.
3. NEVER make up data — if you don't have it, say so.
4. If asked anything unrelated to tech, careers, or the Singapore job market, politely redirect.
5. Write in clean prose with simple markdown. Mix sentences and bullet points — do NOT bullet-point every single thing. Use headers sparingly.
6. Cite the Anthropic Economic Index only when directly explaining the AI Intervention Score — one citation per response maximum.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages: Message[] = body.messages ?? [];
  const bodyPulseItems: PulseItem[] | null =
    Array.isArray(body.pulseItems) && body.pulseItems.length > 0
      ? (body.pulseItems as PulseItem[])
      : null;

  if (messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  let profile: UserProfile | null = null;
  let riskScores: SeedRiskScore[] = [FALLBACK_RISK_SCORE];

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("fullName, skills, targetRoles, university, yearOfStudy")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[chat/route] profile fetch error:", error);
      } else if (data) {
        profile = data as unknown as UserProfile;

        const roleIds = getAllUniqueRoleIds(profile.targetRoles ?? []);
        const looked = roleIds
          .map((id) => lookupRiskScore(id))
          .filter((s): s is SeedRiskScore => s !== null);
        riskScores = looked.length > 0 ? looked : [FALLBACK_RISK_SCORE];
      }
    }
  } catch (err) {
    console.error("[chat/route] supabase error:", err);
    // fall through to mocks — never crash on auth/db errors
  }

  const pulseItems: PulseItem[] = bodyPulseItems ?? [mockPulseItem];

  const latestMessage = messages[messages.length - 1];
  const relevantJobs = getRelevantJobs(
    latestMessage.content,
    profile?.targetRoles ?? []
  );

  const systemPrompt = buildSystemPrompt(profile, riskScores, pulseItems, relevantJobs);

  const history = messages.slice(0, -1);

  const historyLines = history.map((m) =>
    m.role === "user" ? `Student: ${m.content}` : `You: ${m.content}`
  );

  const prompt =
    history.length > 0
      ? `Context — prior conversation:\n\n${historyLines.join("\n\n")}\n\n---\n\nStudent's current message: ${latestMessage.content}`
      : latestMessage.content;

  const reply = await callClaude({ prompt, system: systemPrompt });

  return Response.json({ reply });
}
