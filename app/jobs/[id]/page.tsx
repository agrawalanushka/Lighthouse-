import { notFound } from "next/navigation";
import { Building2, MapPin, ExternalLink, ArrowLeft, Code } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
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
  experienceLevel?: string;
  niceToHaveSkills?: string[];
  salaryRange?: { min: number; max: number; currency: string };
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = (rawJobs as SeedJob[]).find((j) => j.id === id);

  if (!raw) notFound();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{job.company}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{job.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {raw.experienceLevel && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 capitalize">
                {raw.experienceLevel}
              </span>
            )}
            {raw.salaryRange && (
              <span className="text-sm text-gray-600">
                {raw.salaryRange.currency}{" "}
                {raw.salaryRange.min.toLocaleString()} –{" "}
                {raw.salaryRange.max.toLocaleString()} / month
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Posted {format(new Date(job.postedAt), "d MMM yyyy")}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed text-sm">
            {job.description}
          </p>
        </div>

        {/* Required skills */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" />
            Required Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Nice to have */}
        {raw.niceToHaveSkills && raw.niceToHaveSkills.length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Nice to Have
            </h2>
            <div className="flex flex-wrap gap-2">
              {raw.niceToHaveSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
