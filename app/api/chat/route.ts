import { NextRequest } from "next/server";
import { callClaude } from "@/lib/ai/index";
import { supabase } from "@/lib/supabase";
import { mockRiskScore, mockPulseItem } from "@/lib/mock-dashboard";
import type { RiskScore, PulseItem, UserProfile } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(
  profile: UserProfile | null,
  riskScore: RiskScore,
  pulseItems: PulseItem[]
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

  return `You are Lighthouse AI, a career information tool for Singapore CS students. Your role is to present information clearly and help students understand data — you do NOT make decisions for them, recommend specific actions, or tell them what to do.

Context you have:
- The student's AI Intervention Score: ${riskScore.score} out of 100 for ${riskScore.roleName} (${riskScore.seniority} level)
- Score methodology: score = 100 × coverage × (0.6 × augShare + 1.0 × autoShare), where coverage = ${(riskScore.score * 100 / 71.94).toFixed(1)}% (% of O*NET tasks showing Claude usage from Anthropic Economic Index), autoShare = 29.85%, augShare = 70.15%
- Score reasoning: ${riskScore.reasoning}
- Sources: ${riskScore.sources.join(", ")}
- This week's tech news headlines: ${pulseItems.slice(0, 3).map((item) => item.headline).join("; ")}

Your rules:
1. Explain what the AI Intervention Score means in plain English — what the numbers represent, where they come from, what they imply about the role
2. Break down tech news and explain how it relates to the student's role — present the facts, not recommendations
3. Answer general tech and career questions for Singapore CS students — present information, perspectives, and tradeoffs
4. NEVER tell the student what to do, what to prioritise, or what decision to make — always close substantive responses with a neutral phrase like "the final call is yours" or "that's for you to weigh"
5. NEVER recommend a specific company, job listing, or salary figure
6. NEVER make up data — if you don't have it, say so
7. If asked anything unrelated to tech, careers, or the Singapore job market, politely redirect
8. Write in clean prose with simple markdown. Mix natural sentences with bullet points — do NOT bullet-point every single thing. Avoid excessive asterisks, pipe characters, or table formatting unless a table genuinely aids comparison. Use headers sparingly, only when a response is long enough to need navigation
9. When explaining the score, always clarify: skills and roles are evolving, not disappearing — AI changes HOW work is done, not WHETHER the role exists
10. Cite the Anthropic Economic Index only when directly explaining the AI Intervention Score — one citation per response maximum. Do NOT cite sources for general tech or career statements`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages: Message[] = body.messages ?? [];
  const userId: string | undefined = body.userId;
  const bodyRiskScore: RiskScore | null = body.riskScore ?? null;
  const bodyPulseItems: PulseItem[] | null =
    Array.isArray(body.pulseItems) && body.pulseItems.length > 0
      ? (body.pulseItems as PulseItem[])
      : null;

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

  const riskScore: RiskScore = bodyRiskScore ?? mockRiskScore;
  const pulseItems: PulseItem[] = bodyPulseItems ?? [mockPulseItem];

  const systemPrompt = buildSystemPrompt(profile, riskScore, pulseItems);

  const latestMessage = messages[messages.length - 1];
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
