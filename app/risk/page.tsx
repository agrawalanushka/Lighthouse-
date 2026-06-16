"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { RiskScore } from "@/lib/types";
import { ROLE_DEFINITIONS } from "@/lib/risk/constants";
import { SENIORITIES, riskColor, riskBand } from "@/lib/risk/ui";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function RiskCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

const ALIASES_BY_ROLE_ID = new Map(ROLE_DEFINITIONS.map((r) => [r.roleId, r.aliases]));

function RiskCard({ risk }: { risk: RiskScore }) {
  const aliases = ALIASES_BY_ROLE_ID.get(risk.roleId) ?? [];

  return (
    <Link href={`/risk/${risk.roleId}?seniority=${risk.seniority}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base group-hover:text-blue-600 transition-colors">
            {risk.roleName}
          </CardTitle>
          {aliases.length > 0 && (
            <CardDescription className="text-xs">
              Also covers: {aliases.join(", ")}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${riskColor(risk.score)}`}>
              {risk.score}
            </span>
            <span className="text-sm text-muted-foreground">
              / 100 · {riskBand(risk.score)} automation risk
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {risk.reasoning}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function groupByIndustry(scores: RiskScore[]) {
  const groups = new Map<string, RiskScore[]>();
  for (const risk of scores) {
    const group = groups.get(risk.industry) ?? [];
    group.push(risk);
    groups.set(risk.industry, group);
  }
  return [...groups.entries()];
}

export default function RiskPage() {
  const [seniority, setSeniority] = useState("mid");

  const { data: scores, isLoading, isError } = useQuery<RiskScore[]>({
    queryKey: ["risk-scores", seniority],
    queryFn: () =>
      fetch(`/api/risk?seniority=${seniority}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
              <ShieldAlert className="w-8 h-8 text-blue-600" />
              AI Risk Scores
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              How exposed each role is to AI automation, by O*NET task coverage and Singapore usage patterns
            </p>
          </div>
          <Select value={seniority} onValueChange={setSeniority}>
            <SelectTrigger className="w-32">
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

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to load risk scores</AlertTitle>
            <AlertDescription>Please try refreshing the page.</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <RiskCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && !isError && scores?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No risk scores found</p>
          </div>
        )}

        {!isLoading && !isError && scores && scores.length > 0 && (
          <div className="space-y-10">
            {groupByIndustry(scores).map(([industry, group]) => (
              <section key={industry}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{industry}</h2>
                  <Badge variant="outline">{group.length}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((risk) => (
                    <RiskCard key={risk.roleId} risk={risk} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
