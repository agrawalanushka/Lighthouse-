import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/lib/types";
import rawJobs from "@/data/seed/jobs.json";

type SeedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  requiredSkills: string[];
  description: string;
  url: string;
  postedAt: string;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("skills")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const userSkills: string[] = profile.skills ?? [];

  const scored = (rawJobs as SeedJob[]).map(
    (job): Job & { matchPercentage: number } => {
      const matching = job.requiredSkills.filter((s) =>
        userSkills.some((us) => us.toLowerCase() === s.toLowerCase())
      ).length;
      const matchPercentage =
        job.requiredSkills.length > 0
          ? Math.round((matching / job.requiredSkills.length) * 100)
          : 0;

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        requiredSkills: job.requiredSkills,
        description: job.description,
        url: job.url,
        postedAt: job.postedAt,
        matchPercentage,
      };
    }
  );

  const top3 = scored
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

  return Response.json(top3);
}
