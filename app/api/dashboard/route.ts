import { createSupabaseServerClient } from "@/lib/supabase";
import type { DashboardSnapshot } from "@/lib/types";
import {
  mockPulseItem,
  mockRiskScore,
  mockSkillGap,
  mockWeeklyFocus,
} from "@/lib/mock-dashboard";
import type { NextRequest } from "next/server";

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
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Forward the user's cookies to Amudhan's top-matches route so its
  // server client can also resolve the session.
  let topJobs: DashboardSnapshot["topJobs"] = [];
  try {
    const jobsRes = await fetch(
      `${request.nextUrl.origin}/api/jobs/top-matches`,
      {
        headers: { cookie: request.headers.get("cookie") ?? "" },
        cache: "no-store",
      }
    );
    if (jobsRes.ok) {
      topJobs = await jobsRes.json();
    }
  } catch {
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
