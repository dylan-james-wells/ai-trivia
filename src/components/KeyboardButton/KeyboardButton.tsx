"use client";

import { ReactNode, useState } from "react";
import { KeyboardTheme, getThemeColors } from "@/lib/themes";
import "./KeyboardButton.css";

interface KeyboardButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  theme?: KeyboardTheme;
  bgColor?: string;
  hoverBgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  textColor?: string;
  fontSize?: string;
  pressed?: boolean;
}

export function KeyboardButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  theme,
  bgColor,
  hoverBgColor,
  borderColor,
  shadowBgColor,
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
  textColor,
  fontSize = "1rem",
  pressed = false,
}: KeyboardButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const showPressed = isPressed || pressed;

  const colors = getThemeColors(theme, "secondary", {
    bgColor,
    hoverBgColor,
    borderColor,
    shadowBgColor,
    textColor,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsPressed(true);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsPressed(false);
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => setIsPressed(false)}
      className={`keyboard-button ${disabled ? "keyboard-button-disabled" : ""} ${showPressed ? "keyboard-button-pressed" : ""} ${className}`}
      style={
        {
          "--kb-bg": colors.bgColor,
          "--kb-hover-bg": colors.hoverBgColor,
          "--kb-border": colors.borderColor,
          "--kb-shadow-bg": colors.shadowBgColor,
          "--kb-shadow": shadowColor,
          "--kb-shadow-opacity": shadowOpacity,
          "--kb-text": colors.textColor,
          "--kb-font-size": fontSize,
        } as React.CSSProperties
      }
    >
      <span className="keyboard-button-text">{children}</span>
    </button>
  );
}
