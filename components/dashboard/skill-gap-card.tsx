import { Target } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { SkillGap } from "@/lib/types";

export function SkillGapCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkillGapCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Skill Gap Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load skill gap</AlertTitle>
          <AlertDescription>
            Something went wrong computing your skill gap.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function SkillGapCard({ gap }: { gap: SkillGap | null }) {
  if (!gap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Skill Gap Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <Target className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">
            Set a target role to see your skill gap.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Skill Gap — {gap.targetRole}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          You match <span className="font-semibold">{gap.matchPercentage}%</span>{" "}
          of the skills required for this role.
        </p>
        {gap.missingSkills.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Skills to build:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {gap.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
