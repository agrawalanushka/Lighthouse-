import { NextRequest, NextResponse } from "next/server";
import { generateDigest, getUserProfile, seedDigest } from "@/lib/ai/digest";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function resolveUser(req: NextRequest): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) return data.user.id;
  } catch {
    // no session — fall through to demo param
  }
  return req.nextUrl.searchParams.get("userId");
}

// Force-regenerates the digest, bypassing cache.
// Called by the "Regenerate" button on the Pulse page.
export async function POST(req: NextRequest) {
  const userId = (await resolveUser(req)) ?? "demo-user";

  try {
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(seedDigest(userId));
    }

    const digest = await generateDigest(profile);
    return NextResponse.json(digest);
  } catch (err) {
    console.error("POST /api/pulse/generate error:", err);
    return NextResponse.json(seedDigest(userId));
  }
}
