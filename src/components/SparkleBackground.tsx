"use client";

import { useEffect, useState, useCallback } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  size: number;
}

const SPARKLE_COUNT = 20;
const DELAY_STEP = 0.15;

function generateSparkle(id: number): Sparkle {
  return {
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.8 + Math.random() * 0.45, // 0.8 to 1.25, similar to CodePen
    delay: Math.floor(Math.random() * 5) + 1,
    size: 8 + Math.random() * 8, // 8px to 16px - much smaller like the CodePen
  };
}

interface SparkleIconProps {
  className?: string;
  style?: React.CSSProperties;
}

function SparkleIcon({ className, style }: SparkleIconProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M93.781 51.578C95 50.969 96 49.359 96 48c0-1.375-1-2.969-2.219-3.578 0 0-22.868-1.514-31.781-10.422-8.915-8.91-10.438-31.781-10.438-31.781C50.969 1 49.375 0 48 0s-2.969 1-3.594 2.219c0 0-1.5 22.87-10.406 31.781-8.908 8.913-31.781 10.422-31.781 10.422C1 45.031 0 46.625 0 48c0 1.359 1 2.969 2.219 3.578 0 0 22.873 1.51 31.781 10.422 8.906 8.911 10.406 31.781 10.406 31.781C45.031 95 46.625 96 48 96s2.969-1 3.562-2.219c0 0 1.523-22.871 10.438-31.781 8.913-8.908 31.781-10.422 31.781-10.422Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SparkleBackground() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const regenerateSparkles = useCallback(() => {
    setSparkles(
      Array.from({ length: SPARKLE_COUNT }, (_, i) => generateSparkle(i))
    );
  }, []);

  useEffect(() => {
    regenerateSparkles();

    // Regenerate sparkles periodically to keep the effect fresh
    const interval = setInterval(regenerateSparkles, 10000);
    return () => clearInterval(interval);
  }, [regenerateSparkles]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1: Animated Gradient Background */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Layer 2: Sparkle Container */}
      <div className="absolute inset-0">
        {sparkles.map((sparkle) => (
          <SparkleIcon
            key={sparkle.id}
            className="absolute text-white/30 animate-sparkle"
            style={
              {
                top: `${sparkle.y}%`,
                left: `${sparkle.x}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
                "--sparkle-scale": sparkle.scale,
                "--sparkle-delay": `${DELAY_STEP * sparkle.delay}s`,
                transform: "translate(-50%, -50%) scale(0)",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Layer 3: Glass Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(0.5px)",
        }}
      />
    </div>
  );
}
