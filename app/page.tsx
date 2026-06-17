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
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* Reduced-motion guard: hiding SMIL <animate> elements freezes them at base value */}
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .hero-waves animate { display: none; }
          }
        `}</style>

        {/* Lighthouse silhouette — absolute to section, decorative, behind content */}
        <svg
          aria-hidden="true"
          className="hidden sm:block absolute right-0 top-0 h-full z-0 opacity-[0.18] pointer-events-none select-none"
          viewBox="0 0 160 420"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <rect x="30" y="398" width="100" height="18" rx="4" fill="white" />
          <path d="M50,398 L62,135 L98,135 L110,398 Z" fill="white" />
          <rect x="53" y="290" width="54" height="16" fill="white" opacity="0.55" />
          <rect x="56" y="238" width="48" height="12" fill="white" opacity="0.45" />
          <rect x="42" y="130" width="76" height="7" rx="2" fill="white" />
          <rect x="50" y="86" width="60" height="46" rx="4" fill="white" />
          <circle cx="80" cy="109" r="14" fill="#fbbf24" opacity="0.75" />
          <path d="M50,86 L80,58 L110,86 Z" fill="white" />
          <rect x="77" y="48" width="6" height="12" rx="3" fill="white" />
          <path d="M94,103 L160,38 L160,78 L98,116 Z" fill="#fbbf24" opacity="0.25" />
          <rect x="70" y="308" width="20" height="26" rx="10" fill="white" opacity="0.45" />
          <rect x="71" y="198" width="18" height="22" rx="9" fill="white" opacity="0.38" />
          <rect x="72" y="158" width="16" height="18" rx="8" fill="white" opacity="0.32" />
        </svg>

        {/*
          Wrapper scopes the waves to the content area only.
          The ticker sits OUTSIDE this div so waves are never hidden under it.
        */}
        <div className="relative overflow-hidden">
          {/* Animated waves — absolute bottom of content area, z-0 */}
          <div
            aria-hidden="true"
            className="hero-waves absolute bottom-0 left-0 right-0 h-40 z-0 overflow-hidden pointer-events-none"
          >
            {/* Wave 1 — slower (8s), deeper */}
            <svg
              viewBox="0 0 1440 160"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 w-full h-full"
            >
              <path
                d="M0,90 C360,40 720,140 1080,90 C1260,65 1440,110 1440,110 L1440,160 L0,160 Z"
                fill="rgba(10,30,100,0.45)"
              >
                <animate
                  attributeName="d"
                  values="M0,90 C360,40 720,140 1080,90 C1260,65 1440,110 1440,110 L1440,160 L0,160 Z;M0,110 C360,145 720,50 1080,110 C1260,138 1440,75 1440,75 L1440,160 L0,160 Z;M0,90 C360,40 720,140 1080,90 C1260,65 1440,110 1440,110 L1440,160 L0,160 Z"
                  keyTimes="0;0.5;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  dur="8s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            {/* Wave 2 — faster (6s), shallower */}
            <svg
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute bottom-0 w-full h-3/4"
            >
              <path
                d="M0,55 C360,95 720,20 1080,60 C1260,80 1440,35 1440,35 L1440,120 L0,120 Z"
                fill="rgba(10,30,100,0.30)"
              >
                <animate
                  attributeName="d"
                  values="M0,55 C360,95 720,20 1080,60 C1260,80 1440,35 1440,35 L1440,120 L0,120 Z;M0,75 C360,25 720,100 1080,45 C1260,20 1440,80 1440,80 L1440,120 L0,120 Z;M0,55 C360,95 720,20 1080,60 C1260,80 1440,35 1440,35 L1440,120 L0,120 Z"
                  keyTimes="0;0.5;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  dur="6s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>

          {/* Hero text/buttons — z-10 sits above waves */}
          <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:py-28">
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
        </div>
        {/* end content wrapper */}

        {/* PULSE ticker — outside the content wrapper, sits below the waves */}
        <div className="relative z-10 border-t border-primary-foreground/10 bg-primary/95 overflow-hidden">
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
