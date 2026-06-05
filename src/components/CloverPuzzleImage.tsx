import { useId } from "react";
import { cloverImageFrame, cloverPiecePaths, cloverViewBox } from "@/components/CloverPuzzlePiece";

type CloverPuzzleImageProps = {
  alt: string;
  className?: string;
  src: string;
};

export function CloverPuzzleImage({ alt, className = "", src }: CloverPuzzleImageProps) {
  const baseId = useId().replaceAll(":", "");
  const pieces = [
    ["topLeft", cloverPiecePaths.topLeft],
    ["topRight", cloverPiecePaths.topRight],
    ["bottomLeft", cloverPiecePaths.bottomLeft],
    ["bottomRight", cloverPiecePaths.bottomRight],
  ] as const;

  return (
    <svg aria-label={alt} className={`clover-puzzle-image ${className}`} role="img" viewBox={cloverViewBox}>
      <defs>
        {pieces.map(([name, path]) => (
          <clipPath key={name} id={`${baseId}-${name}`} clipPathUnits="userSpaceOnUse">
            <path d={path} />
          </clipPath>
        ))}
      </defs>
      {pieces.map(([name, path]) => (
        <g key={name}>
          <image
            clipPath={`url(#${baseId}-${name})`}
            height={cloverImageFrame.height}
            href={src}
            preserveAspectRatio="xMidYMid slice"
            width={cloverImageFrame.width}
            x={cloverImageFrame.x}
            y={cloverImageFrame.y}
          />
          <path className="clover-puzzle-seam" d={path} />
        </g>
      ))}
    </svg>
  );
}
