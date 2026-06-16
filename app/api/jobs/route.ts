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
  experienceLevel: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get("role");
  const experienceLevelParam = searchParams.get("experienceLevel");
  const skillsParam = searchParams.get("skills");

  const filterSkills = skillsParam
    ? skillsParam
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

  let jobs = rawJobs as SeedJob[];

  if (roleParam) {
    const roleLower = roleParam.toLowerCase();
    jobs = jobs.filter((j) => j.title.toLowerCase().includes(roleLower));
  }

  if (experienceLevelParam) {
    jobs = jobs.filter((j) => j.experienceLevel === experienceLevelParam);
  }

  if (filterSkills.length > 0) {
    jobs = jobs.filter((j) =>
      filterSkills.some((fs) =>
        j.requiredSkills.some((rs) => rs.toLowerCase().includes(fs))
      )
    );
  }

  const result: Job[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    requiredSkills: j.requiredSkills,
    description: j.description,
    url: j.url,
    postedAt: j.postedAt,
  }));

  return Response.json(result);
}
