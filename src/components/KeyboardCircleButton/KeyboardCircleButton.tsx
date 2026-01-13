"use client";

import { ReactNode, useState } from "react";
import { KeyboardTheme, getThemeColors } from "@/lib/themes";
import "./KeyboardCircleButton.css";

interface KeyboardCircleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  theme?: KeyboardTheme;
  bgColor?: string;
  hoverBgColor?: string;
  borderColor?: string;
  shadowBgColor?: string;
  shadowColor?: string;
  shadowOpacity?: number;
  size?: string;
  title?: string;
}

export function KeyboardCircleButton({
  children,
  onClick,
  className = "",
  disabled = false,
  theme,
  bgColor,
  hoverBgColor,
  borderColor,
  shadowBgColor,
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
  size = "3rem",
  title,
}: KeyboardCircleButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const colors = getThemeColors(theme, "primary", {
    bgColor,
    hoverBgColor,
    borderColor,
    shadowBgColor,
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => setIsPressed(false)}
      title={title}
      className={`keyboard-circle-button ${disabled ? "keyboard-circle-button-disabled" : ""} ${isPressed ? "keyboard-circle-button-pressed" : ""} ${className}`}
      style={
        {
          "--kcb-bg": colors.bgColor,
          "--kcb-hover-bg": colors.hoverBgColor,
          "--kcb-border": colors.borderColor,
          "--kcb-shadow-bg": colors.shadowBgColor,
          "--kcb-shadow": shadowColor,
          "--kcb-shadow-opacity": shadowOpacity,
          "--kcb-size": size,
        } as React.CSSProperties
      }
    >
      <span className="keyboard-circle-button-content">{children}</span>
    </button>
  );
}
