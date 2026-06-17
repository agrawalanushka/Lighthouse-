import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Static entry-point card — the chatbot itself lives at /chat,
// this just links there. No loading/error states needed since
// there's no data fetch on the dashboard for this card.
export function ChatCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="h-4 w-4" />
          AI Chatbot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Ask about your job matches, your AI intervention score, or this
          week&apos;s pulse.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href="/chat">
            Open chat
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
