"use client";

import { useEffect, useState, useCallback } from "react";
import "./SparkleBackground.css";

interface SparkleData {
  x: number;
  y: number;
  scale: number;
  size: number;
}

interface ShootingStarData {
  top: number;
  left: number;
  visible: boolean;
}

const SPARKLE_COUNT = 20;
const DELAY_STEP = 0.15;
const SHOOTING_STAR_COUNT = 1;

function generateSparkleData(): SparkleData {
  return {
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.8 + Math.random() * 0.45,
    size: 16 + Math.random() * 16,
  };
}

function generateShootingStarData(): ShootingStarData {
  // 10% chance to spawn a shooting star each cycle
  const visible = Math.random() < 0.1;

  // Avoid center 50% of screen (25-75% range)
  // So we spawn in 0-25% or 75-100% for top, but limit to 80% max so trail stays visible
  // For left, spawn in 0-25% or 50-80% (shifted down since star moves right)
  const topZone = Math.random() < 0.5 ? Math.random() * 25 : 50 + Math.random() * 30;
  const leftZone = Math.random() < 0.5 ? Math.random() * 25 : 50 + Math.random() * 30;

  return {
    top: topZone,
    left: leftZone,
    visible,
  };
}

function Sparkle({ delay }: { delay: number }) {
  const [data, setData] = useState<SparkleData>(generateSparkleData);

  const handleAnimationIteration = useCallback(() => {
    setData(generateSparkleData());
  }, []);

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute text-white/30 animate-sparkle"
      style={
        {
          top: `${data.y}%`,
          left: `${data.x}%`,
          width: `${data.size}px`,
          height: `${data.size}px`,
          "--sparkle-scale": data.scale,
          "--sparkle-delay": `${DELAY_STEP * delay}s`,
        } as React.CSSProperties
      }
      onAnimationIteration={handleAnimationIteration}
    >
      <path
        d="M93.781 51.578C95 50.969 96 49.359 96 48c0-1.375-1-2.969-2.219-3.578 0 0-22.868-1.514-31.781-10.422-8.915-8.91-10.438-31.781-10.438-31.781C50.969 1 49.375 0 48 0s-2.969 1-3.594 2.219c0 0-1.5 22.87-10.406 31.781-8.908 8.913-31.781 10.422-31.781 10.422C1 45.031 0 46.625 0 48c0 1.359 1 2.969 2.219 3.578 0 0 22.873 1.51 31.781 10.422 8.906 8.911 10.406 31.781 10.406 31.781C45.031 95 46.625 96 48 96s2.969-1 3.562-2.219c0 0 1.523-22.871 10.438-31.781 8.913-8.908 31.781-10.422 31.781-10.422Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ShootingStar({ delay }: { delay: number }) {
  const [data, setData] = useState<ShootingStarData>(generateShootingStarData);

  const handleAnimationIteration = useCallback((e: React.AnimationEvent) => {
    // Only update on the 'shooting-move' animation to avoid double-firing
    if (e.animationName === 'shooting-move') {
      setData(generateShootingStarData());
    }
  }, []);

  return (
    <div
      className="shooting-star"
      style={{
        top: `${data.top}%`,
        left: `${data.left}%`,
        "--shooting-delay": `${delay}ms`,
        opacity: data.visible ? 1 : 0,
      } as React.CSSProperties}
      onAnimationIteration={handleAnimationIteration}
    />
  );
}

interface SparkleBackgroundProps {
  shootingStarCount?: number;
}

export function SparkleBackground({ shootingStarCount = SHOOTING_STAR_COUNT }: SparkleBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none min-h-[100dvh]">
      {/* Layer 1: Animated Gradient Background */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background:
            "linear-gradient(135deg, var(--color-bg-dark-1) 0%, var(--color-bg-dark-2) 25%, var(--color-bg-dark-3) 50%, var(--color-bg-dark-1) 75%, var(--color-bg-dark-2) 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Layer 2: Shooting Stars */}
      {mounted && shootingStarCount > 0 && (
        <div className="shooting-stars-container">
          {Array.from({ length: shootingStarCount }, (_, i) => (
            <ShootingStar key={i} delay={i * 8000} />
          ))}
        </div>
      )}

      {/* Layer 3: Sparkle Container */}
      <div className="absolute inset-0">
        {mounted &&
          Array.from({ length: SPARKLE_COUNT }, (_, i) => (
            <Sparkle key={i} delay={(i % 5) + 1} />
          ))}
      </div>

      {/* Layer 4: Glass Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(2.5px)",
        }}
      />
    </div>
  );
}
