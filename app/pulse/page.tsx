"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, ExternalLink, Zap, Globe, User } from "lucide-react";
import { PulseDigest, PulseItem } from "@/lib/types";
import { PulseBackground } from "@/components/ui/pulse-background";

type Tab = "general" | "personalized";

// TODO: replace with real auth user ID once Min wires Supabase auth
const DEMO_USER_ID = "demo-user";

async function fetchDigest(): Promise<PulseDigest> {
  const res = await fetch(`/api/pulse?userId=${DEMO_USER_ID}`);
  if (!res.ok) throw new Error("Failed to fetch digest");
  return res.json();
}

async function regenerateDigest(): Promise<PulseDigest> {
  const res = await fetch(`/api/pulse/generate?userId=${DEMO_USER_ID}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to regenerate");
  return res.json();
}

function NewsCard({ item, index }: { item: PulseItem; index: number }) {
  return (
    <article className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          {item.source}
        </span>
        <span className="text-xs text-gray-400">#{index + 1}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
        {item.headline}
      </h3>

      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {item.summary}
      </p>

      {item.relevance && (
        <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg mb-4">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Why it matters: </span>
            {item.relevance}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
        >
          Read full article
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
        </span>
      </div>
    </article>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-gray-100 rounded-xl p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
      <div className="h-10 bg-amber-50 rounded w-full" />
    </div>
  );
}

export default function PulsePage() {
  const queryClient = useQueryClient();

  const { data: digest, isLoading, error } = useQuery<PulseDigest>({
    queryKey: ["pulse", DEMO_USER_ID],
    queryFn: fetchDigest,
  });

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: regenerateDigest,
    onSuccess: (newDigest) => {
      queryClient.setQueryData(["pulse", DEMO_USER_ID], newDigest);
    },
  });

  const [activeTab, setActiveTab] = useState<Tab>("general");

  const generalCount = digest?.generalItems?.length ?? 0;
  const personalizedCount = digest?.personalizedItems?.length ?? 0;

  return (
    <div className="relative min-h-screen">
      <PulseBackground />
      <div className="relative z-10 p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">This Week&apos;s Pulse</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Curated from The Straits Times, MIT Technology Review &amp; Ars Technica
            {digest?.generatedAt && (
              <span className="ml-2 text-gray-400">
                · updated{" "}
                {formatDistanceToNow(new Date(digest.generatedAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => regenerate()}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <p className="text-red-700 text-sm font-medium">
            Could not load your Pulse digest. Try regenerating.
          </p>
        </div>
      )}

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "general"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Globe className="w-4 h-4" />
          AI &amp; The Industry
          {generalCount > 0 && (
            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {generalCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("personalized")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${
            activeTab === "personalized"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-4 h-4" />
          Personalised For You
          {personalizedCount > 0 && (
            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {personalizedCount}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: AI & The Industry ── */}
      {activeTab === "general" && (
        <section>
          <p className="text-sm text-gray-500 mb-5">
            How AI is reshaping tech — what every CS student should know
          </p>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : digest?.generalItems && digest.generalItems.length > 0 ? (
            <div className="space-y-4">
              {digest.generalItems.map((item, idx) => (
                <NewsCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          ) : (
            <EmptySection message="No AI industry news this week. Hit Regenerate to try again." />
          )}
        </section>
      )}

      {/* ── TAB 2: Personalised For You ── */}
      {activeTab === "personalized" && (
        <section>
          <p className="text-sm text-gray-500 mb-5">
            Based on your skills and target roles from your profile
          </p>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : digest?.personalizedItems && digest.personalizedItems.length > 0 ? (
            <div className="space-y-4">
              {digest.personalizedItems.map((item, idx) => (
                <NewsCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          ) : (
            <EmptySection message="Complete your profile to get personalised news. Hit Regenerate after." />
          )}
        </section>
      )}
      </div>
    </div>
  );
}
