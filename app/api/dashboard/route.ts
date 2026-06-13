import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { DashboardSnapshot } from "@/lib/types";
import {
  mockPulseItem,
  mockRiskScore,
  mockSkillGap,
  mockWeeklyFocus,
} from "@/lib/mock-dashboard";

// /api/dashboard is the only route allowed to consume other features' APIs
// (per CLAUDE.md cross-feature consumption rule).
//
// Currently wired:
//   - topJobs  -> real call to /api/jobs/top-matches (Amudhan, merged)
// Still mocked, swap when ready:
//   - pulseItem -> /api/pulse/highlight (Rishi)
//   - riskScore -> /api/risk/[roleId] (Vidush)
//   - skillGap  -> /api/skill-gap (Vidush)
//   - weeklyFocus -> LLM-generated, cached 24h (Rishi's /lib/ai)

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Real call to Amudhan's top-matches route
  let topJobs: DashboardSnapshot["topJobs"] = [];
  try {
    const jobsRes = await fetch(
      `${request.nextUrl.origin}/api/jobs/top-matches`,
      {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    );
    if (jobsRes.ok) {
      topJobs = await jobsRes.json();
    }
  } catch {
    // Jobs API unreachable — leave empty, JobMatchesCard shows its empty state
    topJobs = [];
  }

  const snapshot: DashboardSnapshot = {
    userId: user.id,
    pulseItem: mockPulseItem,
    topJobs,
    riskScore: mockRiskScore,
    skillGap: mockSkillGap,
    weeklyFocus: mockWeeklyFocus,
    generatedAt: new Date().toISOString(),
  };

  return Response.json(snapshot);
}
