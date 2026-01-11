"use client";

import { ReactNode } from "react";

interface KeyboardButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  bgColor?: string;
  hoverBgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  textColor?: string;
  fontSize?: string;
  focusRingColor?: string;
}

export function KeyboardButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  bgColor = "#fff0f0",
  hoverBgColor = "#ffe9e9",
  borderColor = "#b18597",
  shadowBgColor = "#f9c4d2",
  shadowColor = "#ffe3e2",
  shadowOpacity = 0.5,
  textColor = "#382b22",
  fontSize = "1rem",
  focusRingColor,
}: KeyboardButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`keyboard-button ${disabled ? "keyboard-button-disabled" : ""} ${className}`}
      style={
        {
          "--kb-bg": bgColor,
          "--kb-hover-bg": hoverBgColor,
          "--kb-border": borderColor,
          "--kb-shadow-bg": shadowBgColor,
          "--kb-shadow": shadowColor,
          "--kb-shadow-opacity": shadowOpacity,
          "--kb-text": textColor,
          "--kb-font-size": fontSize,
          ...(focusRingColor && { "--kb-focus-ring": focusRingColor }),
        } as React.CSSProperties
      }
    >
      <span className="keyboard-button-text">{children}</span>
    </button>
  );
}
