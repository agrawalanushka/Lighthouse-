"use client";

import { useQuery } from "@tanstack/react-query";
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
  WeeklyFocusWidget,
  WeeklyFocusWidgetSkeleton,
  WeeklyFocusWidgetError,
} from "@/components/dashboard/weekly-focus-widget";

async function fetchDashboard(): Promise<DashboardSnapshot> {
  // Cookies are sent automatically; the server client in
  // /lib/supabase-server.ts reads the session from them.
  const res = await fetch("/api/dashboard");

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
      </div>
    </div>
  );
}
