import type { NextRequest } from "next/server";
import rawRiskScores from "@/data/seed/risk-scores.json";
import type { RiskScoreDetail } from "@/lib/risk/compute";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { searchParams } = new URL(request.url);
  const seniorityParam = searchParams.get("seniority") ?? "mid";

  const scores = rawRiskScores as RiskScoreDetail[];
  const detail = scores.find(
    (s) => s.roleId === roleId && s.seniority === seniorityParam
  );

  if (!detail) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(detail);
}
