"use client";

import { ReactNode } from "react";
import { KeyboardTheme, getThemeColors } from "@/lib/themes";
import "./KeyboardContainer.css";

interface KeyboardContainerProps {
  children: ReactNode;
  className?: string;
  theme?: KeyboardTheme;
  bgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
}

export function KeyboardContainer({
  children,
  className = "",
  theme,
  bgColor,
  borderColor,
  shadowBgColor,
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
}: KeyboardContainerProps) {
  const colors = getThemeColors(theme, "container", {
    bgColor,
    borderColor,
    shadowBgColor,
  });

  return (
    <div
      className={`keyboard-container-wrapper ${className}`}
      style={
        {
          "--kc-bg": colors.bgColor,
          "--kc-border": colors.borderColor,
          "--kc-shadow-bg": colors.shadowBgColor,
          "--kc-shadow": shadowColor,
          "--kc-shadow-opacity": shadowOpacity,
        } as React.CSSProperties
      }
    >
      <div className="keyboard-container">{children}</div>
    </div>
  );
}
