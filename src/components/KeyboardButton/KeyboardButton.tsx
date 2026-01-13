"use client";

import { ReactNode, useState } from "react";
import "./KeyboardButton.css";

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
  pressed?: boolean;
}

export function KeyboardButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  bgColor = "var(--color-secondary-bg)",
  hoverBgColor = "var(--color-secondary-hover)",
  borderColor = "var(--color-secondary-border)",
  shadowBgColor = "var(--color-secondary-shadow)",
  shadowColor = "var(--color-shadow)",
  shadowOpacity = 0.1,
  textColor = "var(--color-secondary-text)",
  fontSize = "1rem",
  pressed = false,
}: KeyboardButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const showPressed = isPressed || pressed;

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
          "--kb-bg": bgColor,
          "--kb-hover-bg": hoverBgColor,
          "--kb-border": borderColor,
          "--kb-shadow-bg": shadowBgColor,
          "--kb-shadow": shadowColor,
          "--kb-shadow-opacity": shadowOpacity,
          "--kb-text": textColor,
          "--kb-font-size": fontSize,
        } as React.CSSProperties
      }
    >
      <span className="keyboard-button-text">{children}</span>
    </button>
  );
}
