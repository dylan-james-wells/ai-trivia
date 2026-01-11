"use client";

import { InputHTMLAttributes } from "react";

interface KeyboardInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
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
  bgColor = "#ffffff",
  borderColor = "#d1d5db",
  shadowBgColor = "#e5e7eb",
  shadowColor = "#9ca3af",
  shadowOpacity = 0.5,
  textColor = "#111827",
  fontSize = "1rem",
  focusRingColor,
  ...inputProps
}: KeyboardInputProps) {
  return (
    <div
      className={`keyboard-input-wrapper ${className}`}
      style={
        {
          "--ki-bg": bgColor,
          "--ki-border": borderColor,
          "--ki-shadow-bg": shadowBgColor,
          "--ki-shadow": shadowColor,
          "--ki-shadow-opacity": shadowOpacity,
          "--ki-text": textColor,
          "--ki-font-size": fontSize,
          ...(focusRingColor && { "--ki-focus-ring": focusRingColor }),
        } as React.CSSProperties
      }
    >
      <input {...inputProps} className="keyboard-input" />
    </div>
  );
}
