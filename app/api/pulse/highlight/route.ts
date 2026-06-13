import { NextRequest, NextResponse } from "next/server";
import { generateDigest, getCachedDigest, getUserProfile, seedDigest, weekOf } from "@/lib/ai/digest";
import { createServerClient } from "@/lib/supabase-server";

async function resolveUser(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createServerClient();
    const { data } = await supabase.auth.getUser(token);
    if (data.user) return data.user.id;
  }
  return req.nextUrl.searchParams.get("userId");
}

// Used by Anushka's /api/dashboard — returns the single top PulseItem.
export async function GET(req: NextRequest) {
  const userId = (await resolveUser(req)) ?? "demo-user";

  try {
    // Prefer cached digest for this week to avoid re-running Claude
    const cached = await getCachedDigest(userId, weekOf());
    if (cached?.items?.[0]) {
      return NextResponse.json(cached.items[0]);
    }

    const profile = (await getUserProfile(userId)) ?? {
      id: userId,
      email: "student@nus.edu.sg",
      fullName: "Alex Tan",
      university: "NUS" as const,
      yearOfStudy: 3 as const,
      major: "Computer Science",
      skills: ["Python", "React", "TypeScript", "SQL"],
      targetRoles: ["Software Engineer", "ML Engineer"],
      interests: ["web", "ml", "data"] as ("web" | "ml" | "data")[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const digest = process.env.ANTHROPIC_API_KEY
      ? await generateDigest(profile)
      : seedDigest(userId);

    return NextResponse.json(digest.items[0] ?? null);
  } catch (err) {
    console.error("GET /api/pulse/highlight error:", err);
    return NextResponse.json(seedDigest(userId).items[0] ?? null);
  }
}
