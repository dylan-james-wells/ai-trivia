"use client";

import { ReactNode } from "react";
import "./KeyboardContainer.css";

interface KeyboardContainerProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
}

export function KeyboardContainer({
  children,
  className = "",
  bgColor = "var(--color-bg-white)",
  borderColor = "var(--color-gray-200)",
  shadowBgColor = "var(--color-gray-100)",
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
}: KeyboardContainerProps) {
  return (
    <div
      className={`keyboard-container-wrapper ${className}`}
      style={
        {
          "--kc-bg": bgColor,
          "--kc-border": borderColor,
          "--kc-shadow-bg": shadowBgColor,
          "--kc-shadow": shadowColor,
          "--kc-shadow-opacity": shadowOpacity,
        } as React.CSSProperties
      }
    >
      <div className="keyboard-container">{children}</div>
    </div>
  );
}
