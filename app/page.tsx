import Link from "next/link";
import { Newspaper, ShieldAlert, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const signals = [
  "Shopee expands engineering hub — 200+ roles open",
  "Frontend Engineer automation risk: 42 / 100",
  "Top missing skill this week: TypeScript",
  "GovTech hiring for AI policy & data roles",
  "Grab posts 18 new backend openings in Singapore",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-widest text-primary-foreground/60">
            For CS students in Singapore
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Know where the job market is heading — before it gets there.
          </h1>
          <p className="mt-4 max-w-xl text-base text-primary-foreground/70 sm:text-lg">
            Lighthouse reads the news, the job postings, and the automation
            trends so you don&apos;t have to. One dashboard for your weekly
            pulse, your best-matched jobs, and the skills worth learning
            next.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 bg-primary/95 overflow-hidden">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-xs">
            <span className="shrink-0 font-mono uppercase tracking-widest text-primary-foreground/60">
              Pulse
            </span>
            <div className="relative flex-1 overflow-hidden">
              <div className="flex w-max animate-[scroll_30s_linear_infinite] gap-10 whitespace-nowrap pl-6 font-mono text-primary-foreground/70">
                {[...signals, ...signals].map((signal, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-primary-foreground/60" />
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Everything you need to plan your next move
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Set your target role once. Lighthouse keeps watching the market
            for you.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <Newspaper className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="pt-2 text-base">
                  Weekly Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A personalised digest of tech news and hiring trends —
                  Shopee, Grab, Sea, GovTech and more — filtered to your
                  skills and goals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="pt-2 text-base">
                  Intervention Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See how AI is reshaping your target role, backed by
                  cited evidence — not a guess about the future.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="pt-2 text-base">
                  AI Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask about your pulse digest or your intervention score
                  and get answers grounded in your own dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            See it before you sign up
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            A real preview of what your dashboard looks like once your
            target role is set.
          </p>

          <Card className="mt-8 max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                Intervention Score — Frontend Engineer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-600">42</span>
                <span className="text-sm text-muted-foreground">
                  / 100 AI intervention
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Coverage: 31% of this role&apos;s tasks show meaningful
                Claude usage. Augmentation outweighs automation 68% to 32%,
                based on Singapore-specific collaboration patterns.
              </p>
              <p className="text-xs text-muted-foreground">
                Anthropic Economic Index · O*NET 29.2 Database
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-4 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Set your course.
            </h2>
            <p className="mt-1 text-muted-foreground">
              Takes about two minutes to get your first dashboard.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
