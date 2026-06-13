import { Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function WeeklyFocusWidgetSkeleton() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

export function WeeklyFocusWidgetError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          This Week&apos;s Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load weekly focus</AlertTitle>
          <AlertDescription>
            Something went wrong generating your weekly focus.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function WeeklyFocusWidget({ focus }: { focus: string | null }) {
  if (!focus) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            This Week&apos;s Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground">
          <p className="text-sm">
            Complete your profile to get a personalized weekly focus.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          This Week&apos;s Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{focus}</p>
      </CardContent>
    </Card>
  );
}
