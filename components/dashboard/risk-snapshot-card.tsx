import { ShieldAlert, Link as LinkIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { RiskScore } from "@/lib/types";

export function RiskSnapshotCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-44" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function RiskSnapshotCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4" />
          AI Intervention Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load score</AlertTitle>
          <AlertDescription>
            Something went wrong fetching your role&apos;s AI intervention score.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

function scoreColor(score: number) {
  if (score < 33) return "text-green-600";
  if (score < 66) return "text-amber-600";
  return "text-red-600";
}

export function RiskSnapshotCard({ risk }: { risk: RiskScore | null }) {
  if (!risk) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" />
            AI Intervention Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <ShieldAlert className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">Set a target role to see your score.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4" />
          AI Intervention Score — {risk.roleName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${scoreColor(risk.score)}`}>
            {risk.score}
          </span>
          <span className="text-sm text-muted-foreground">
            / 100 AI intervention
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{risk.reasoning}</p>
        {risk.sources.length > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <LinkIcon className="h-3 w-3" />
            {risk.sources.join(", ")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
