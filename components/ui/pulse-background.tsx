"use client";

import { motion } from "framer-motion";

// "Pulse" backdrop for the Pulse page: rings that emanate outward from a glowing
// center (radar/sonar vibe), over a faint drifting grid. Recolored to the app's
// blue and toned down so it sits subtly behind the digest.
const RING_COUNT = 4;
const PULSE_DURATION = 6; // seconds per ring

export function PulseBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Diagonal lines flowing down-right. Scrolls by exactly one 28px period
          along the 45° axis (28·cos45 ≈ 19.8px each way) so the loop is seamless. */}
      <motion.div
        className="absolute inset-0 opacity-[0.11] [mask-image:radial-gradient(ellipse_at_center,transparent_22%,black)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg,#3b82f6 0px,#3b82f6 1px,transparent 1px,transparent 28px)",
        }}
        animate={{ backgroundPosition: ["0px 0px", "19.8px 19.8px"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Center point of the pulse */}
      <div className="absolute left-1/2 top-1/2">
        {/* Soft glow behind the core */}
        <div
          className="absolute rounded-full bg-blue-400/15 blur-[80px]"
          style={{ left: -160, top: -160, width: 320, height: 320 }}
        />

        {/* Expanding rings — staggered so they keep emanating outward */}
        {Array.from({ length: RING_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-blue-500/25"
            style={{ left: -90, top: -90, width: 180, height: 180, borderWidth: 1 }}
            initial={{ scale: 0.25, opacity: 0 }}
            animate={{ scale: [0.25, 3.4], opacity: [0, 0.5, 0] }}
            transition={{
              duration: PULSE_DURATION,
              repeat: Infinity,
              ease: "easeOut",
              delay: (i * PULSE_DURATION) / RING_COUNT,
            }}
          />
        ))}

        {/* Glowing core */}
        <motion.div
          className="absolute rounded-full bg-blue-500/55 blur-[2px]"
          style={{ left: -6, top: -6, width: 12, height: 12 }}
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
