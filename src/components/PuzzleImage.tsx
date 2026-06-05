import type { CSSProperties } from "react";

const STANDARD_PUZZLE_PATH =
  "M148.3,43.7c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C154.8,47.7,151.9,43.7,148.3,43.7z";

export const puzzlePaths = {
  calm: STANDARD_PUZZLE_PATH,
  left: STANDARD_PUZZLE_PATH,
  right: STANDARD_PUZZLE_PATH,
  minimal: STANDARD_PUZZLE_PATH,
  top: STANDARD_PUZZLE_PATH,
  bottom: STANDARD_PUZZLE_PATH,
};

export type PuzzleVariant = keyof typeof puzzlePaths;

export const puzzleTransforms: Record<PuzzleVariant, string | undefined> = {
  calm: undefined,
  left: "rotate(90 108 53)",
  right: "rotate(-90 108 53)",
  minimal: "rotate(180 108 53)",
  top: "translate(216 0) scale(-1 1)",
  bottom: "translate(0 106) scale(1 -1)",
};

type PuzzleImageProps = {
  alt: string;
  className?: string;
  src: string;
  tone?: string;
  variant?: PuzzleVariant;
};

export function PuzzleImage({ alt, className = "", src, tone = "#bfe8f7", variant = "calm" }: PuzzleImageProps) {
  const clipId = `puzzle-${variant}`;
  const path = puzzlePaths[variant];
  const transform = puzzleTransforms[variant];

  return (
    <svg
      aria-label={alt}
      className={`puzzle-image ${className}`}
      role="img"
      style={{ "--puzzle-tone": tone } as CSSProperties}
      viewBox="52 2 112 106"
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={path} transform={transform} />
        </clipPath>
      </defs>
      <g className="puzzle-image-backdrop-layer">
        <path className="puzzle-image-backdrop" d={path} transform={transform} />
      </g>
      <image
        clipPath={`url(#${clipId})`}
        height="106"
        href={src}
        preserveAspectRatio="xMidYMid slice"
        width="112"
        x="52"
        y="2"
      />
    </svg>
  );
}
