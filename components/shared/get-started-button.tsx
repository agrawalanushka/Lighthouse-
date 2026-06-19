"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { HoverButton } from "@/components/ui/hover-button";
import { cn } from "@/lib/utils";

// Wraps HoverButton with client-side navigation so it can be used inside the
// (server) landing page without nesting a <button> in an <a>.
export function GetStartedButton({
  href = "/signup",
  className,
}: {
  href?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <>
      <style>{`
        @keyframes gs-glow {
          0%, 100% { box-shadow: 0 4px 16px -6px rgba(96,165,250,0.45); }
          50%      { box-shadow: 0 0 26px 1px rgba(96,165,250,0.55), 0 10px 28px -6px rgba(96,165,250,0.6); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gs-btn { animation: none !important; }
        }
      `}</style>
      <HoverButton
        onClick={() => router.push(href)}
        className={cn(
          "gs-btn group inline-flex items-center gap-2 transition-transform duration-300 ease-out hover:scale-[1.03] [animation:gs-glow_2.8s_ease-in-out_infinite]",
          className
        )}
      >
        Get started
        <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </HoverButton>
    </>
  );
}
