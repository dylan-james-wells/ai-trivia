"use client";

import "./LoadingIndicator.css";

interface LoadingIndicatorProps {
  className?: string;
}

export function LoadingIndicator({ className = "" }: LoadingIndicatorProps) {
  return (
    <div className={`banter-loader ${className}`}>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
      <div className="banter-loader__box"></div>
    </div>
  );
}
