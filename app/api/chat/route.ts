import { NextRequest } from "next/server";
import { callClaude } from "@/lib/ai/index";
import { supabase } from "@/lib/supabase";
import { mockRiskScore, mockPulseItem } from "@/lib/mock-dashboard";
import type { RiskScore, PulseItem, UserProfile } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(
  profile: UserProfile | null,
  riskScore: RiskScore,
  pulseItem: PulseItem
): string {
  const profileSection = profile
    ? `
## Student Profile
- Name: ${profile.fullName}
- University: ${profile.university}, Year ${profile.yearOfStudy}
- Major: ${profile.major}
- Skills: ${profile.skills.join(", ")}
- Target roles: ${profile.targetRoles.join(", ")}
`
    : "";

  return `You are Lighthouse AI, a friendly and practical career advisor for Singapore CS students.
${profileSection}
## AI Intervention Score Methodology
The AI Intervention Score (0–100) measures how much a role is affected by AI.
Formula: score = 100 × coverage × (0.6 × augShare + 1.0 × autoShare)
- coverage: % of O*NET tasks for the role where Claude usage is observed (from Anthropic Economic Index)
- autoShare: 29.85% — the share of those tasks where AI fully automates the work (Singapore-specific Claude.ai data)
- augShare: 70.15% — the share where AI augments but a human remains in the loop
Higher scores mean more AI exposure. A score of 42 means moderate exposure — AI handles some tasks but human judgment remains essential.

## Current Role Risk Context
Role: ${riskScore.roleName}
AI Intervention Score: ${riskScore.score}/100
Reasoning: ${riskScore.reasoning}

## Latest Tech Pulse
Headline: ${pulseItem.headline}
Summary: ${pulseItem.summary}

## Your guidelines
- Explain the AI Intervention Score clearly in plain English when asked — avoid jargon.
- Help students understand what tech news means for their career.
- Answer general questions about tech, jobs, and careers in the Singapore CS context.
- If asked something unrelated to tech, jobs, or careers, politely redirect: "I'm focused on tech careers — happy to help with that instead!"
- Never invent job listings, salary figures, or company-specific hiring information.
- Always remind students that the final career decision is theirs.
- Keep responses concise and practical — 3–5 sentences unless more depth is clearly needed.`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages: Message[] = body.messages ?? [];
  const userId: string | undefined = body.userId;

  if (messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  let profile: UserProfile | null = null;
  if (userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        profile = data as UserProfile;
      }
    } catch {
      // fall through to null profile — never crash on missing data
    }
  }

  const riskScore: RiskScore = mockRiskScore;
  const pulseItem: PulseItem = mockPulseItem;

  const systemPrompt = buildSystemPrompt(profile, riskScore, pulseItem);

  const latestMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1);

  const historyText =
    history.length > 0
      ? history
          .map(
            (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
          )
          .join("\n")
      : "";

  const prompt = historyText
    ? `Previous conversation:\n${historyText}\n\nUser: ${latestMessage.content}`
    : latestMessage.content;

  const reply = await callClaude({ prompt, system: systemPrompt });

  return Response.json({ reply });
}
