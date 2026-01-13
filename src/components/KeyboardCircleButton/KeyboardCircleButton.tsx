"use client";

import { ReactNode, useState } from "react";
import "./KeyboardCircleButton.css";

interface KeyboardCircleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
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
  bgColor = "#70c0ff",
  hoverBgColor = "#5090d0",
  borderColor = "#4080c0",
  shadowBgColor = "#3070b0",
  shadowColor = "#000000",
  shadowOpacity = 0.1,
  size = "3rem",
  title,
}: KeyboardCircleButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

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
          "--kcb-bg": bgColor,
          "--kcb-hover-bg": hoverBgColor,
          "--kcb-border": borderColor,
          "--kcb-shadow-bg": shadowBgColor,
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
