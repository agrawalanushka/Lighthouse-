import { cn } from "@/lib/utils";

// Subtle, light dashboard backdrop: a faint blue grid + soft glow that slowly
// drifts and gently fades in and out. Pure CSS — cheap and demo-safe. Sits
// behind content; edges fade via a radial mask. Matches the landing grid.
export function DashboardBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <style>{`
        @keyframes dash-bg-drift {
          from { background-position: 0px 0px, 0px 0px, 0px 0px, 0px 0px; }
          to   { background-position: 60px 60px, 60px 60px, 60px 60px, 60px 60px; }
        }
        @keyframes dash-bg-fade {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes dash-bg-glow {
          0%   { transform: translate(-26%, -14%); }
          25%  { transform: translate(24%, -6%);   }
          50%  { transform: translate(30%, 20%);   }
          75%  { transform: translate(-18%, 16%);  }
          100% { transform: translate(-26%, -14%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dash-bg { animation: none !important; opacity: 0.55; }
          .dash-glow { animation: none !important; }
        }
      `}</style>
      {/* Soft blue glow — a blurred circle (feathered edges, no hard ring/line)
          that floats slowly around the screen behind the lines */}
      <div
        className="dash-glow absolute rounded-full"
        style={{
          left: "50%",
          top: "40%",
          width: 620,
          height: 620,
          marginLeft: -310,
          marginTop: -310,
          background: "#C9EBFF",
          filter: "blur(110px)",
          opacity: 0.4,
          animation: "dash-bg-glow 24s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      <div
        className="dash-bg absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(75,85,99,0.10) 20px, rgba(75,85,99,0.10) 21px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(107,114,128,0.08) 30px, rgba(107,114,128,0.08) 31px), repeating-linear-gradient(60deg, transparent, transparent 40px, rgba(55,65,81,0.06) 40px, rgba(55,65,81,0.06) 41px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(31,41,55,0.05) 35px, rgba(31,41,55,0.05) 36px)",
          animation:
            "dash-bg-drift 20s linear infinite, dash-bg-fade 11s ease-in-out infinite",
          maskImage:
            "radial-gradient(ellipse 95% 90% at center, black 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 95% 90% at center, black 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
