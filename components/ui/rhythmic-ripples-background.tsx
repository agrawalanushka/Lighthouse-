"use client";

import React, { useRef, useEffect } from "react";

// Background-only adaptation: just the ripple canvas (no dark hero wrapper),
// sized to its container, tuned soft + subtle for sitting behind content.
interface RipplesBackgroundProps {
  rippleColor?: string; // rgba(...) with a trailing alpha
  rippleCount?: number;
  rippleSpeed?: number;
  className?: string;
}

export function RipplesBackground({
  rippleColor = "rgba(59,130,246,0.5)", // soft blue
  rippleCount = 11,
  rippleSpeed = 0.4,
  className = "",
}: RipplesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ripples: Ripple[] = [];
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    class Ripple {
      x = 0;
      y = 0;
      radius = 0;
      maxRadius = 0;
      speed = 0;

      constructor() {
        this.reset();
        // Start each ripple at a random radius so they don't all pulse in sync
        this.radius = Math.random() * this.maxRadius;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = 0;
        this.maxRadius = Math.random() * 160 + 80;
        this.speed = Math.random() * rippleSpeed + 0.15;
      }

      update() {
        this.radius += this.speed;
        if (this.radius > this.maxRadius) this.reset();
      }

      draw() {
        if (!ctx) return;
        const alpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rippleColor.replace(
          /[\d.]+\)$/,
          `${(alpha * 0.32).toFixed(3)})`
        );
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ripples = Array.from({ length: rippleCount }, () => new Ripple());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ripples.forEach((r) => {
        r.update();
        r.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    setup();
    animate();

    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [rippleColor, rippleCount, rippleSpeed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

export default RipplesBackground;
