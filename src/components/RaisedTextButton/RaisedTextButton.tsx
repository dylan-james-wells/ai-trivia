"use client";

import { ReactNode } from "react";

interface RaisedTextButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  shadowColor?: string;
}

export function RaisedTextButton({
  children,
  onClick,
  className = "",
  color = "var(--color-yellow)",
  shadowColor = "var(--color-yellow-shadow)",
}: RaisedTextButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`raised-text-button group relative rounded-2xl px-6 py-3 text-transparent transition-colors duration-200 cursor-pointer ${className}`}
      style={
        {
          "--rtb-color": color,
          "--rtb-shadow": shadowColor,
        } as React.CSSProperties
      }
    >
      {/* Shadow text layer */}
      <span className="raised-text-shadow inline-block text-5xl font-black transition-all duration-200">
        {children}
      </span>

      {/* Glare text layer */}
      <span
        aria-hidden="true"
        className="raised-text-glare absolute inset-3 z-10 inline-block text-5xl font-black transition-all duration-200"
      >
        {children}
      </span>
    </button>
  );
}
