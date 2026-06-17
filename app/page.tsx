import Link from "next/link";
import {
  Newspaper,
  ShieldAlert,
  MessageCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Typewriter } from "@/components/ui/typewriter-text";

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
            .lighthouse animate { display: none; }
          }
        `}</style>

        {/* Lighthouse silhouette — absolute to section, decorative, behind content.
            Lamp + beam pulse periodically to "glow". */}
        <svg
          aria-hidden="true"
          className="lighthouse hidden sm:block absolute right-0 top-0 h-full z-0 pointer-events-none select-none"
          viewBox="0 0 160 420"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <filter id="lh-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* Faint structural silhouette */}
          <g opacity="0.18">
            <rect x="30" y="398" width="100" height="18" rx="4" fill="white" />
            <path d="M50,398 L62,135 L98,135 L110,398 Z" fill="white" />
            <rect x="53" y="290" width="54" height="16" fill="white" opacity="0.55" />
            <rect x="56" y="238" width="48" height="12" fill="white" opacity="0.45" />
            <rect x="42" y="130" width="76" height="7" rx="2" fill="white" />
            <rect x="50" y="86" width="60" height="46" rx="4" fill="white" />
            <path d="M50,86 L80,58 L110,86 Z" fill="white" />
            <rect x="77" y="48" width="6" height="12" rx="3" fill="white" />
            <rect x="70" y="308" width="20" height="26" rx="10" fill="white" opacity="0.45" />
            <rect x="71" y="198" width="18" height="22" rx="9" fill="white" opacity="0.38" />
            <rect x="72" y="158" width="16" height="18" rx="8" fill="white" opacity="0.32" />
          </g>

          {/* Glowing lamp + beam + blurred halo — pulse on a 3.5s loop */}
          <g>
            {/* Soft halo */}
            <circle cx="80" cy="109" r="24" fill="#fbbf24" filter="url(#lh-glow)" opacity="0.18">
              <animate
                attributeName="opacity"
                values="0.05;0.5;0.05"
                keyTimes="0;0.5;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="20;30;20"
                keyTimes="0;0.5;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Lamp core */}
            <circle cx="80" cy="109" r="14" fill="#fbbf24" opacity="0.5">
              <animate
                attributeName="opacity"
                values="0.3;0.95;0.3"
                keyTimes="0;0.5;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>

        {/* Wrapper scopes the waves to the content area; ticker sits outside it */}
        <div className="relative overflow-hidden">
          {/* Animated waves — absolute bottom of content area */}
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
              For computing students in Singapore
            </p>
            <h1 className="mt-4 block min-h-[1.2em] max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              <Typewriter text="Light up your career path" speed={70} />
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/70 sm:text-lg">
              Lighthouse reads the news, the job postings, and the automation
              trends so you don&apos;t have to.
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

      {/* Scroll-reveal dashboard preview */}
      <section className="bg-background">
        <ContainerScroll
          titleComponent={
            <div className="pb-4">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Your dashboard
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-5xl">
                Your whole market, <br />
                <span className="text-primary">in one view.</span>
              </h2>
            </div>
          }
        >
          <div className="flex h-full w-full flex-col bg-gray-50 p-4 text-left sm:p-6">
            {/* Mock top bar */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-sm font-semibold text-gray-800">
                  Lighthouse
                </span>
              </div>
              <div className="hidden gap-4 text-xs text-gray-500 sm:flex">
                <span className="font-medium text-primary">Dashboard</span>
                <span>Pulse</span>
                <span>Intervention Score</span>
                <span>Chat</span>
              </div>
            </div>

            {/* Greeting */}
            <div className="pt-4">
              <p className="text-sm text-gray-500">Good morning, Alex</p>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">
                Here&apos;s your week in tech.
              </p>
            </div>

            {/* Mock insight cards */}
            <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
              {/* Pulse card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Newspaper className="h-4 w-4" />
                  Weekly Pulse
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  React 19 is stable — your TypeScript + React skills just got an
                  upgrade
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Server Components will show up in SWE interviews within 12
                  months.
                </p>
              </div>

              {/* Intervention score card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <ShieldAlert className="h-4 w-4" />
                  Intervention Score
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-amber-600">42</span>
                  <span className="text-xs text-gray-500">/ 100 · Frontend Engineer</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Augmentation outweighs automation 68% to 32%.
                </p>
              </div>

              {/* Trend card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <TrendingUp className="h-4 w-4" />
                  This week&apos;s focus
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  Build a small Server Components project before applying to
                  Shopee&apos;s frontend roles.
                </p>
              </div>

              {/* Chat card */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <MessageCircle className="h-4 w-4" />
                  Ask Lighthouse
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  &ldquo;Why is my intervention score 42?&rdquo;
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Grounded in your own dashboard data.
                </p>
              </div>
            </div>
          </div>
        </ContainerScroll>
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
