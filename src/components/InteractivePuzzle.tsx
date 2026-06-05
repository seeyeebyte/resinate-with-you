"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

type InteractivePuzzleProps = {
  children: ReactNode;
  className?: string;
  label: string;
  style?: CSSProperties;
};

export function InteractivePuzzle({ children, className = "", label, style }: InteractivePuzzleProps) {
  const [pulse, setPulse] = useState(0);

  return (
    <button
      aria-label={label}
      className={`interactive-puzzle ${className}`}
      onClick={() => setPulse((current) => current + 1)}
      style={style}
      type="button"
    >
      <span key={pulse} className={pulse > 0 ? "interactive-puzzle-motion puzzle-pop" : "interactive-puzzle-motion"}>
        {children}
      </span>
    </button>
  );
}
