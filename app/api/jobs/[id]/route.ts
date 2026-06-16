import type { NextRequest } from "next/server";
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const raw = (rawJobs as SeedJob[]).find((j) => j.id === id);

  if (!raw) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const job: Job = {
    id: raw.id,
    title: raw.title,
    company: raw.company,
    location: raw.location,
    requiredSkills: raw.requiredSkills,
    description: raw.description,
    url: raw.url,
    postedAt: raw.postedAt,
  };

  return Response.json(job);
}
