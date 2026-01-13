"use client";

import { InputHTMLAttributes } from "react";
import "./KeyboardInput.css";

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
  bgColor = "var(--color-bg-white)",
  borderColor = "var(--color-gray-200)",
  shadowBgColor = "var(--color-gray-100)",
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
  textColor = "var(--color-text-dark)",
  fontSize = "1rem",
  focusRingColor = "var(--color-text-white)",
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
