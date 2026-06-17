import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { DashboardSnapshot, PulseItem, RiskScore } from "@/lib/types";
import type { NextRequest } from "next/server";

// /api/dashboard is the only route allowed to consume other features' APIs
// (per CLAUDE.md cross-feature consumption rule).
//
// Wired to real routes:
//   - pulseItem -> /api/pulse/highlight (Rishi)
//   - topJobs   -> /api/jobs/top-matches (Amudhan)
//   - riskScore -> /api/risk/[roleId] (Vidush) — uses user's first targetRole,
//                  falls back to "software-engineer" if profile has none yet.
// Still placeholder:
//   - weeklyFocus -> short heuristic for now; swap for LLM-generated +
//     24h cache once that's built.

const FALLBACK_ROLE_ID = "software-engineer";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const origin = request.nextUrl.origin;

  // --- Pulse (real) ---
  let pulseItem: PulseItem | null = null;
  try {
    const res = await fetch(`${origin}/api/pulse/highlight`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) pulseItem = await res.json();
  } catch {
    pulseItem = null;
  }

  // --- Jobs (real) ---
  // Amudhan's route still expects a Bearer token rather than cookies.
  // Forward the user's access token if the current session has one.
  let topJobs: DashboardSnapshot["topJobs"] = [];
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const jobsRes = await fetch(`${origin}/api/jobs/top-matches`, {
      headers: token
        ? { Authorization: `Bearer ${token}`, cookie: cookieHeader }
        : { cookie: cookieHeader },
      cache: "no-store",
    });
    if (jobsRes.ok) topJobs = await jobsRes.json();
  } catch {
    topJobs = [];
  }

  // --- Risk (real) ---
  // Needs a roleId. Pull the user's first target role from their profile;
  // fall back to a default so the card still renders something useful.
  let riskScore: RiskScore | null = null;
  try {
    let roleId = FALLBACK_ROLE_ID;
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("target_roles")
      .eq("id", user.id)
      .single();

    if (profile?.target_roles?.[0]) {
      roleId = profile.target_roles[0];
    }

    const riskRes = await fetch(`${origin}/api/risk/${roleId}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (riskRes.ok) {
      const detail = await riskRes.json();
      riskScore = {
        roleId: detail.roleId,
        roleName: detail.roleName,
        score: detail.score,
        reasoning: detail.reasoning,
        sources: detail.sources,
        industry: detail.industry,
        seniority: detail.seniority,
      };
    }
  } catch {
    riskScore = null;
  }

  // --- Weekly focus (placeholder heuristic, not yet LLM-generated) ---
  const weeklyFocus = pulseItem
    ? `This week, keep an eye on: ${pulseItem.headline}`
    : "Complete your profile to get a personalised weekly focus.";

  const snapshot: Partial<DashboardSnapshot> & { userId: string } = {
    userId: user.id,
    pulseItem: pulseItem ?? undefined,
    topJobs,
    riskScore: riskScore ?? undefined,
    weeklyFocus,
    generatedAt: new Date().toISOString(),
  };

  return Response.json(snapshot);
}
