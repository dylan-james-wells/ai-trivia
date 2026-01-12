"use client";

import { useRef, useState, useLayoutEffect } from "react";
import "./LogoText.css";

interface LogoTextProps {
  text: string;
  width: number;
  className?: string;
}

const LAYER_COUNT = 10;
const MAX_FONT_SIZE = 190;

export function LogoText({ text, width, className = "" }: LogoTextProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ height: 0, scale: 1 });

  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const textWidth = measureRef.current.offsetWidth;
    const textHeight = measureRef.current.offsetHeight;

    const scale = width / textWidth;
    const scaledHeight = textHeight * scale;

    setDimensions({ height: scaledHeight, scale });
  }, [text, width]);

  return (
    <>
      <div
        ref={measureRef}
        className="logo-text-measure"
        aria-hidden="true"
        style={{ fontSize: `${MAX_FONT_SIZE}px` }}
      >
        {text}
      </div>
      <div
        className={`logo-text-container ${className}`}
        style={
          {
            "--scale": dimensions.scale,
            width: `${width}px`,
            height: `${dimensions.height}px`,
            margin: "0 auto",
          } as React.CSSProperties
        }
      >
        {Array.from({ length: LAYER_COUNT }, (_, i) => (
          <div
            key={i}
            className="logo-text-layer"
            style={
              {
                "--layer-index": i,
              } as React.CSSProperties
            }
          >
            {text}
          </div>
        ))}
      </div>
    </>
  );
}
