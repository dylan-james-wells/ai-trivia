"use client";

import { InputHTMLAttributes } from "react";
import { KeyboardTheme, getThemeColors } from "@/lib/themes";
import "./KeyboardInput.css";

interface KeyboardInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
  theme?: KeyboardTheme;
  bgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  textColor?: string;
  fontSize?: string;
  focusRingColor?: string;
}

export function KeyboardInput({
  className = "",
  theme,
  bgColor,
  borderColor,
  shadowBgColor,
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
  textColor,
  fontSize = "1rem",
  focusRingColor = "var(--color-text-white)",
  ...inputProps
}: KeyboardInputProps) {
  const colors = getThemeColors(theme, "container", {
    bgColor,
    borderColor,
    shadowBgColor,
    textColor,
  });

  return (
    <div
      className={`keyboard-input-wrapper ${className}`}
      style={
        {
          "--ki-bg": colors.bgColor,
          "--ki-border": colors.borderColor,
          "--ki-shadow-bg": colors.shadowBgColor,
          "--ki-shadow": shadowColor,
          "--ki-shadow-opacity": shadowOpacity,
          "--ki-text": colors.textColor,
          "--ki-font-size": fontSize,
          ...(focusRingColor && { "--ki-focus-ring": focusRingColor }),
        } as React.CSSProperties
      }
    >
      <input {...inputProps} className="keyboard-input" />
    </div>
  );
}
