"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { LoginRequiredDialog } from "@/components/shared/login-required-dialog";
import { DashboardBackground } from "@/components/ui/dashboard-background";
import type { DashboardSnapshot } from "@/lib/types";
import {
  PulseCard,
  PulseCardSkeleton,
  PulseCardError,
} from "@/components/dashboard/pulse-card";
import {
  RiskSnapshotCard,
  RiskSnapshotCardSkeleton,
  RiskSnapshotCardError,
} from "@/components/dashboard/risk-snapshot-card";
import { ChatCard } from "@/components/dashboard/chat-card";
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
  // Live auth state — reads the current session and updates immediately on
  // sign-in / sign-out. A one-shot cached query would go stale and keep showing
  // the login prompt even after logging in.
  const [user, setUser] = useState<User | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setAuthResolved(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthResolved(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const loggedOut = authResolved && !user;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    enabled: !!user,
  });

  // Show skeletons while auth resolves or the dashboard loads — never errors
  // while logged out (we only fetch once a user exists).
  const showLoading = !authResolved || isLoading;

  if (loggedOut) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <LoginRequiredDialog />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <DashboardBackground />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalised career insights for this week.
          </p>
        </div>

      {/* Weekly focus — full width */}
      {showLoading ? (
        <WeeklyFocusWidgetSkeleton />
      ) : isError ? (
        <WeeklyFocusWidgetError />
      ) : (
        <WeeklyFocusWidget focus={data?.weeklyFocus ?? null} />
      )}

      {/* Insight cards grid: Pulse, AI Intervention Score, Chat */}
      <div className="grid gap-4 sm:grid-cols-2">
        {showLoading ? (
          <PulseCardSkeleton />
        ) : isError ? (
          <PulseCardError />
        ) : (
          <PulseCard item={data?.pulseItem ?? null} />
        )}

        {showLoading ? (
          <RiskSnapshotCardSkeleton />
        ) : isError ? (
          <RiskSnapshotCardError />
        ) : (
          <RiskSnapshotCard risk={data?.riskScore ?? null} />
        )}

        <ChatCard />
        </div>
      </div>
    </div>
  );
}
