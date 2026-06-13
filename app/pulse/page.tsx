"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, ExternalLink, Zap } from "lucide-react";
import { PulseDigest } from "@/lib/types";

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
  if (!res.ok) throw new Error("Failed to regenerate digest");
  return res.json();
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

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-100 rounded w-48" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-6 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-10 bg-blue-50 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">Could not load your Pulse digest.</p>
          <p className="text-red-600 text-sm mt-1">
            Try refreshing, or check that your API keys are set.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">This Week&apos;s Pulse</h1>
          </div>
          <p className="text-gray-500 text-sm">
            SG tech news personalised for your career path
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
          <RefreshCw
            className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
          />
          {isRegenerating ? "Generating…" : "Regenerate"}
        </button>
      </div>

      {/* Digest items */}
      {digest && digest.items.length > 0 ? (
        <div className="space-y-5">
          {digest.items.map((item, idx) => (
            <article
              key={item.id}
              className="border border-gray-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition"
            >
              {/* Source + index */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  {item.source}
                </span>
                <span className="text-xs text-gray-400">#{idx + 1}</span>
              </div>

              {/* Headline */}
              <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                {item.headline}
              </h2>

              {/* Summary */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {item.summary}
              </p>

              {/* Why it matters */}
              <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-lg mb-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Why it matters: </span>
                  {item.relevance}
                </p>
              </div>

              {/* Read link + date */}
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
                  {formatDistanceToNow(new Date(item.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No digest yet.</p>
          <p className="text-sm mt-1">Hit Regenerate to build your first one.</p>
        </div>
      )}
    </div>
  );
}
