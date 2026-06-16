import type { NextRequest } from "next/server";
import type { RiskScore } from "@/lib/types";
import rawRiskScores from "@/data/seed/risk-scores.json";
import type { RiskScoreDetail } from "@/lib/risk/compute";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roleIdParam = searchParams.get("roleId");
  const seniorityParam = searchParams.get("seniority");

  let scores = rawRiskScores as RiskScoreDetail[];

  if (roleIdParam) {
    scores = scores.filter((s) => s.roleId === roleIdParam);
  }

  if (seniorityParam) {
    scores = scores.filter((s) => s.seniority === seniorityParam);
  }

  const result: RiskScore[] = scores.map((s) => ({
    roleId: s.roleId,
    roleName: s.roleName,
    score: s.score,
    reasoning: s.reasoning,
    sources: s.sources,
    industry: s.industry,
    seniority: s.seniority,
  }));

  return Response.json(result);
}
