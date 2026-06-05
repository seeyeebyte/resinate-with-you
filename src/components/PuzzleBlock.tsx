import type { CSSProperties } from "react";
import { puzzlePaths, puzzleTransforms, type PuzzleVariant } from "@/components/PuzzleImage";

type PuzzleBlockProps = {
  className?: string;
  tone?: string;
  variant?: PuzzleVariant;
};

export function PuzzleBlock({ className = "", tone = "#bfe8f7", variant = "calm" }: PuzzleBlockProps) {
  const transform = puzzleTransforms[variant];

  return (
    <svg
      aria-hidden="true"
      className={`puzzle-block ${className}`}
      style={{ "--puzzle-tone": tone } as CSSProperties}
      viewBox="52 2 112 106"
    >
      <path d={puzzlePaths[variant]} transform={transform} />
    </svg>
  );
}
