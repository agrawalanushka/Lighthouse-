"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { DashboardSnapshot } from "@/lib/types";
import {
  PulseCard,
  PulseCardSkeleton,
  PulseCardError,
} from "@/components/dashboard/pulse-card";
import {
  JobMatchesCard,
  JobMatchesCardSkeleton,
  JobMatchesCardError,
} from "@/components/dashboard/job-matches-card";
import {
  RiskSnapshotCard,
  RiskSnapshotCardSkeleton,
  RiskSnapshotCardError,
} from "@/components/dashboard/risk-snapshot-card";
import {
  SkillGapCard,
  SkillGapCardSkeleton,
  SkillGapCardError,
} from "@/components/dashboard/skill-gap-card";
import {
  WeeklyFocusWidget,
  WeeklyFocusWidgetSkeleton,
  WeeklyFocusWidgetError,
} from "@/components/dashboard/weekly-focus-widget";

async function fetchDashboard(): Promise<DashboardSnapshot> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch("/api/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Your personalised career insights for this week.
        </p>
      </div>

      {/* Weekly focus — full width */}
      {isLoading ? (
        <WeeklyFocusWidgetSkeleton />
      ) : isError ? (
        <WeeklyFocusWidgetError />
      ) : (
        <WeeklyFocusWidget focus={data?.weeklyFocus ?? null} />
      )}

      {/* Insight cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <PulseCardSkeleton />
        ) : isError ? (
          <PulseCardError />
        ) : (
          <PulseCard item={data?.pulseItem ?? null} />
        )}

        {isLoading ? (
          <JobMatchesCardSkeleton />
        ) : isError ? (
          <JobMatchesCardError />
        ) : (
          <JobMatchesCard jobs={data?.topJobs ?? []} />
        )}

        {isLoading ? (
          <RiskSnapshotCardSkeleton />
        ) : isError ? (
          <RiskSnapshotCardError />
        ) : (
          <RiskSnapshotCard risk={data?.riskScore ?? null} />
        )}

        {isLoading ? (
          <SkillGapCardSkeleton />
        ) : isError ? (
          <SkillGapCardError />
        ) : (
          <SkillGapCard gap={data?.skillGap ?? null} />
        )}
      </div>
    </div>
  );
}
