import { cloverPiecePaths, cloverViewBox } from "@/components/CloverPuzzlePiece";
import { themeConfig } from "@/lib/customization";

export function PuzzleCloverLogo({ className = "" }: { className?: string }) {
  const pieces = [
    [cloverPiecePaths.topLeft, themeConfig.puzzle.cloverLogoTones[0]],
    [cloverPiecePaths.topRight, themeConfig.puzzle.cloverLogoTones[1]],
    [cloverPiecePaths.bottomLeft, themeConfig.puzzle.cloverLogoTones[2]],
    [cloverPiecePaths.bottomRight, themeConfig.puzzle.cloverLogoTones[3]],
  ] as const;

  return (
    <svg aria-hidden="true" className={className} viewBox={cloverViewBox}>
      <defs>
        <filter id="cloverShadow" x="-10" y="-10" width="120" height="120" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#46606f" floodOpacity="0.12" />
        </filter>
      </defs>
      <g filter="url(#cloverShadow)" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2">
        {pieces.map(([path, fill]) => (
          <path key={fill} d={path} fill={fill} />
        ))}
      </g>
    </svg>
  );
}
