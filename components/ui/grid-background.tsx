import { cn } from "@/lib/utils";

// Subtle, light, slowly-drifting grid. Pure CSS (no WebGL) so it's cheap and
// demo-safe. Sits behind content; edges fade out via a radial mask.
export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <style>{`
        @keyframes grid-drift {
          from { background-position: 0px 0px, 0px 0px; }
          to   { background-position: 56px 56px, 56px 56px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .grid-bg-drift { animation: none !important; }
        }
      `}</style>
      <div
        className="grid-bg-drift absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-drift 24s linear infinite",
          maskImage:
            "radial-gradient(ellipse 90% 90% at center, black 65%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at center, black 65%, transparent 100%)",
        }}
      />
    </div>
  );
}
