import { Briefcase, MapPin } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { Job } from "@/lib/types";

type MatchedJob = Job & { matchPercentage: number };

export function JobMatchesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function JobMatchesCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" />
          Top Job Matches
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load job matches</AlertTitle>
          <AlertDescription>
            Something went wrong fetching your top matches.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function JobMatchesCard({ jobs }: { jobs: MatchedJob[] }) {
  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            Top Job Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <Briefcase className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">
            Complete your profile to see job matches.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" />
          Top Job Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block rounded-md border p-3 transition-colors hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium leading-snug">{job.title}</p>
                <p className="text-sm text-muted-foreground">
                  {job.company}
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {job.matchPercentage}% match
              </Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
