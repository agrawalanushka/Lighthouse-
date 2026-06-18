"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShieldAlert, AlertCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RiskScoreDetail, RiskScoreHistory } from "@/lib/risk/compute";
import { SENIORITIES, riskColor, riskBand } from "@/lib/risk/ui";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { RiskTrendChart } from "./risk-trend-chart";

export default function RiskDetailPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const searchParams = useSearchParams();
  const [seniority, setSeniority] = useState(
    searchParams.get("seniority") ?? "mid"
  );
  const [fromLabel, setFromLabel] = useState<string | null>(null);
  const [toLabel, setToLabel] = useState<string | null>(null);

  const { data: risk, isLoading, isError } = useQuery<RiskScoreDetail | null>({
    queryKey: ["risk-score-detail", roleId, seniority],
    queryFn: async () => {
      const res = await fetch(`/api/risk/${roleId}?seniority=${seniority}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery<RiskScoreHistory | null>({
    queryKey: ["risk-score-history", roleId, seniority],
    queryFn: async () => {
      const res = await fetch(`/api/risk/${roleId}/history?seniority=${seniority}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Resolved once per render so the "from"/"to" Selects and the chart below
  // always agree on which range is showing, instead of each re-deriving it.
  const historyPoints = history?.points ?? [];
  const releaseLabels = historyPoints.map((p) => p.releaseLabel);
  const effectiveFromLabel =
    fromLabel && releaseLabels.includes(fromLabel) ? fromLabel : releaseLabels[0];
  const effectiveToLabel =
    toLabel && releaseLabels.includes(toLabel) ? toLabel : releaseLabels[releaseLabels.length - 1];
  const fromIdx = releaseLabels.indexOf(effectiveFromLabel);
  const toIdx = releaseLabels.indexOf(effectiveToLabel);
  const visiblePoints = historyPoints.slice(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1);
  const hasVisibleGlobalPoint = visiblePoints.some((p) => p.source === "global");

  return (
    <div className="relative min-h-screen bg-gray-50">
      <FallingPattern className="pointer-events-none absolute inset-0 opacity-[0.85] [mask-image:radial-gradient(ellipse_at_center,transparent_3%,black_100%)]" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/risk"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to risk scores
        </Link>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load risk score</AlertTitle>
            <AlertDescription>Please try refreshing the page.</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && !risk && (
          <div className="text-center py-20 text-gray-500">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">Role not found</p>
          </div>
        )}

        {!isLoading && !isError && risk && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldAlert className="h-5 w-5" />
                  {risk.roleName}
                </CardTitle>
                <Select value={seniority} onValueChange={setSeniority}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="mt-1">
                {risk.industry}
              </Badge>
              {risk.aliases.length > 0 && (
                <CardDescription>
                  Also covers: {risk.aliases.join(", ")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold ${riskColor(risk.score)}`}>
                  {risk.score}
                </span>
                <span className="text-sm text-muted-foreground">
                  / 100 · {riskBand(risk.score)} automation risk
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm font-medium">Intervention Breadth</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(risk.interventionBreadth * 100)}% coverage
                    </span>
                  </div>
                  <Progress value={risk.interventionBreadth * 100} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Share of this role&apos;s {risk.onetTaskCount} O*NET tasks with meaningful AI usage
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm font-medium">Intervention Mode</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(risk.autoShare * 100)}% automation / {Math.round(risk.augShare * 100)}% augmentation
                    </span>
                  </div>
                  <Progress value={risk.autoShare * 100} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Split between AI replacing tasks (automation) vs. assisting on them (augmentation)
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="text-sm font-medium">Score over time</p>
                  {historyPoints.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Select value={effectiveFromLabel} onValueChange={setFromLabel}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseLabels.map((label) => (
                            <SelectItem key={label} value={label}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">to</span>
                      <Select value={effectiveToLabel} onValueChange={setToLabel}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {releaseLabels.map((label) => (
                            <SelectItem key={label} value={label}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {isHistoryLoading && <Skeleton className="h-48 w-full" />}
                {isHistoryError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Failed to load history</AlertTitle>
                    <AlertDescription>Please try refreshing the page.</AlertDescription>
                  </Alert>
                )}
                {!isHistoryLoading && !isHistoryError && historyPoints.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No historical data available for this role</p>
                  </div>
                )}
                {!isHistoryLoading && !isHistoryError && historyPoints.length > 0 && (
                  <>
                    <RiskTrendChart points={visiblePoints} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tracks {visiblePoints.length} of {historyPoints.length} Anthropic Economic Index report
                      releases. Coverage held at the current global exposure baseline (Anthropic has not
                      published a historical exposure series) — only the automation/augmentation mix varies by
                      period.
                      {hasVisibleGlobalPoint &&
                        " Dashed points predate Singapore-specific reporting and use worldwide (not Singapore) usage data."}
                    </p>
                  </>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {risk.reasoning}
              </p>

              <div className="space-y-1.5 pt-2 border-t">
                {risk.sources.map((source) => (
                  <p
                    key={source}
                    className="flex items-start gap-1.5 text-xs text-muted-foreground"
                  >
                    <LinkIcon className="h-3 w-3 mt-0.5 shrink-0" />
                    {source}
                  </p>
                ))}
                <p className="text-xs text-muted-foreground">
                  O*NET {risk.onetCode} · Updated{" "}
                  {format(new Date(risk.generatedAt), "d MMM yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
