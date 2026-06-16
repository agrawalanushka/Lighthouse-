import type { NextRequest } from "next/server";
import { computeRiskScoreHistory, type Seniority } from "@/lib/risk/compute";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { searchParams } = new URL(request.url);
  const seniorityParam = (searchParams.get("seniority") ?? "mid") as Seniority;

  const history = computeRiskScoreHistory().find(
    (h) => h.roleId === roleId && h.seniority === seniorityParam
  );

  if (!history) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(history);
}
