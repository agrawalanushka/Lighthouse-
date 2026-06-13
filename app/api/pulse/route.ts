import { NextRequest, NextResponse } from "next/server";
import { generateDigest, getCachedDigest, getUserProfile, seedDigest, weekOf } from "@/lib/ai/digest";
import { createServerClient } from "@/lib/supabase-server";

async function resolveUser(req: NextRequest): Promise<string | null> {
  // Try cookie-based auth first (once Min wires Supabase auth)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const supabase = createServerClient();
    const { data } = await supabase.auth.getUser(token);
    if (data.user) return data.user.id;
  }
  // Fallback: explicit userId param (used during dev / demo)
  return req.nextUrl.searchParams.get("userId");
}

export async function GET(req: NextRequest) {
  const userId = (await resolveUser(req)) ?? "demo-user";

  try {
    // 1. Return cached digest for this week if it exists
    const cached = await getCachedDigest(userId, weekOf());
    if (cached) return NextResponse.json(cached);

    // 2. Fetch real profile; fall back to demo profile if not set up yet
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

    // 3. Generate (and auto-save) a fresh digest
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(seedDigest(userId));
    }

    const digest = await generateDigest(profile);
    return NextResponse.json(digest);
  } catch (err) {
    console.error("GET /api/pulse error:", err);
    return NextResponse.json(seedDigest(userId));
  }
}
