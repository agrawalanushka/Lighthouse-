"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Building2, MapPin, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Job } from "@/lib/types";

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-white p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-16" />
        <div className="h-5 bg-gray-200 rounded-full w-16" />
        <div className="h-5 bg-gray-200 rounded-full w-14" />
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {job.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.requiredSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              +{job.requiredSkills.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

const EXPERIENCE_LEVELS = [
  { label: "All levels", value: "" },
  { label: "Intern", value: "intern" },
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
];

export default function JobsPage() {
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState("");

  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (experienceLevel) params.set("experienceLevel", experienceLevel);
  if (skills) params.set("skills", skills);
  const qs = params.toString();

  const { data: jobs, isLoading, isError } = useQuery<Job[]>({
    queryKey: ["jobs", role, experienceLevel, skills],
    queryFn: () =>
      fetch(`/api/jobs${qs ? `?${qs}` : ""}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Job Listings
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            Find your next role in Singapore&apos;s tech scene
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-1.5 text-gray-500 mb-3">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Role (e.g. Frontend Engineer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Skills (e.g. Python, React)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Failed to load jobs
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                Please try refreshing the page.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && jobs?.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Briefcase className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
            </p>
          </>
        )}
      </div>
    </div>
  );
}
