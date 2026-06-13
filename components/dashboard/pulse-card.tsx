import { Newspaper, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { PulseItem } from "@/lib/types";

export function PulseCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function PulseCardError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          Pulse Highlight
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load Pulse</AlertTitle>
          <AlertDescription>
            Something went wrong fetching your weekly digest.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function PulseCard({ item }: { item: PulseItem | null }) {
  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Newspaper className="h-4 w-4" />
            Pulse Highlight
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <Newspaper className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No digest yet this week.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          Pulse Highlight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium leading-snug">{item.headline}</p>
        <p className="text-sm text-muted-foreground">{item.summary}</p>
        <p className="text-xs text-muted-foreground italic">
          {item.relevance}
        </p>
        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>
            {item.source} ·{" "}
            {format(new Date(item.publishedAt), "d MMM yyyy")}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            Read more <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
