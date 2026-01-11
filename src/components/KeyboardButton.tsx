"use client";

import { ReactNode, useState } from "react";

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
  bgColor = "#fff0f0",
  hoverBgColor = "#ffe9e9",
  borderColor = "#b18597",
  shadowBgColor = "#f9c4d2",
  shadowColor = "#000000",
  shadowOpacity = 0.1,
  textColor = "#382b22",
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
