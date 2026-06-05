"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PlatformLinks } from "@/components/PlatformLinks";
import { themeConfig } from "@/lib/customization";
import type { Artist } from "@/lib/mock-data";

type ArtistPuzzleWallProps = {
  artists: Artist[];
  preview?: boolean;
};

const BASE_VIEWBOX = { x: 56, y: 0, width: 438 };
const COLUMNS = 6;
const MIN_ROWS = 4;
const MAX_ROWS = 15;
const ROW_GAP = 66;
const BASE_HEIGHT = 297.6;
const SLOT_CENTERS_X = [108, 174, 240, 306, 372, 438];
const SLOT_CENTERS_Y = [54, 120, 186, 252];
const THEME_COLORS = themeConfig.puzzle.artistWallTones;
const REPEAT_COLUMN_SHIFT = 264;
const LABEL_LAYOUTS = [
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5, maxLocationLength: 7, maxNameLength: 12 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 22, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 23, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 22, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -7, locationX: 23, locationY: 23, nameY: 9, lineGap: 5.2, maxLocationLength: 7, maxNameLength: 13 },
  { avatarY: -8, locationX: 22, locationY: 22, nameY: 8, lineGap: 5.1, maxLocationLength: 7, maxNameLength: 13 },
] as const;

const basePuzzlePaths = [
  "M148.3,43.7c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C154.8,47.7,151.9,43.7,148.3,43.7z",
  "M208.8,67.7c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C208.8,68.2,208.8,68,208.8,67.7z",
  "M280.4,43.7c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C286.8,47.7,284,43.7,280.4,43.7z",
  "M340.8,67.7c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C340.8,68.2,340.8,68,340.8,67.7z",
  "M142.8,133.8c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C142.8,134.3,142.8,134.1,142.8,133.8z",
  "M214.4,109.7c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C220.8,113.8,217.9,109.7,214.4,109.7z",
  "M274.8,133.8c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C274.8,134.3,274.8,134.1,274.8,133.8z",
  "M346.4,109.7c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C352.9,113.8,350,109.7,346.4,109.7z",
  "M148.3,175.8c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C154.8,179.8,151.9,175.8,148.3,175.8z",
  "M208.8,199.8c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C208.8,200.3,208.8,200.1,208.8,199.8z",
  "M280.4,175.8c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C286.8,179.8,284,175.8,280.4,175.8z",
  "M340.8,199.8c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C340.8,200.3,340.8,200.1,340.8,199.8z",
  "M142.8,265.9c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C142.8,266.4,142.8,266.2,142.8,265.9z",
  "M214.4,241.8c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C220.8,245.9,217.9,241.8,214.4,241.8z",
  "M274.8,265.9c-0.1-4.3-2-7.7-4.3-7.6c-0.6,0-1.1,0.2-1.6,0.6c-0.9,0.8-2,1.2-3.1,1.2c-3.6,0-6.5-4.1-6.5-9.1 c0-5,2.9-9.1,6.5-9.1c1.1,0,2.2,0.4,3.1,1.2c0.5,0.4,1,0.6,1.6,0.6c2.3,0,4.2-3.4,4.3-7.6c0-0.3,0-0.6,0-0.9 c-0.3-6-0.8-11.8-1.7-17.2c-5.4,0.9-11.2,1.4-17.2,1.7c-0.3,0-0.6,0-0.9,0c-4.3-0.1-7.7-2-7.6-4.3c0-0.6,0.2-1.1,0.6-1.6 c0.8-0.9,1.2-2,1.2-3.1c0-3.6-4.1-6.5-9.1-6.5c-5,0-9.1,2.9-9.1,6.5c0,1.1,0.4,2.2,1.2,3.1c0.4,0.5,0.6,1,0.6,1.6 c0,2.3-3.4,4.2-7.6,4.3c-0.3,0-0.5,0-0.8,0c-6-0.3-11.8-0.8-17.3-1.7c-0.9,5.4-1.4,11.2-1.7,17.2c0,0.3,0,0.6,0,0.9 c0.1,4.3,2,7.7,4.3,7.6c0.6,0,1.1-0.2,1.6-0.6c0.9-0.8,2-1.2,3.1-1.2c3.6,0,6.5,4.1,6.5,9.1c0,5-2.9,9.1-6.5,9.1 c-1.1,0-2.2-0.4-3.1-1.2c-0.5-0.4-1-0.6-1.6-0.6c-2.3,0-4.2,3.4-4.3,7.6c0,0.3,0,0.5,0,0.8c0.3,6,0.8,11.8,1.7,17.3 c5.4-0.9,11.2-1.5,17.3-1.8c0.3,0,0.5,0,0.8,0c4.3,0.1,7.7,2,7.6,4.3c0,0.6-0.2,1.1-0.6,1.6c-0.8,0.9-1.2,2-1.2,3.1 c0,3.6,4.1,6.5,9.1,6.5c5,0,9.1-2.9,9.1-6.5c0-1.1-0.4-2.2-1.2-3.1c-0.4-0.5-0.6-1-0.6-1.6c0-2.3,3.4-4.2,7.6-4.3c0.3,0,0.6,0,0.9,0 c6,0.3,11.8,0.9,17.2,1.8c0.9-5.4,1.4-11.2,1.7-17.3C274.8,266.4,274.8,266.2,274.8,265.9z",
  "M346.4,241.8c-1.1,0-2.2,0.4-3.1,1.2c-0.5,0.4-1,0.6-1.6,0.6c-2.3,0-4.2-3.4-4.3-7.6c0-0.3,0-0.5,0-0.8 c0.3-6,0.8-11.8,1.7-17.3c-5.4-0.9-11.2-1.4-17.2-1.7c-0.3,0-0.6,0-0.9,0c-4.3,0.1-7.7,2-7.6,4.3c0,0.6,0.2,1.1,0.6,1.6 c0.8,0.9,1.2,2,1.2,3.1c0,3.6-4.1,6.5-9.1,6.5c-5,0-9.1-2.9-9.1-6.5c0-1.1,0.4-2.2,1.2-3.1c0.4-0.5,0.6-1,0.6-1.6 c0-2.3-3.4-4.2-7.6-4.3c-0.3,0-0.5,0-0.8,0c-6,0.3-11.8,0.8-17.3,1.7c0.9,5.4,1.5,11.2,1.8,17.3c0,0.3,0,0.5,0,0.8 c-0.1,4.3-2,7.7-4.3,7.6c-0.6,0-1.1-0.2-1.6-0.6c-0.9-0.8-2-1.2-3.1-1.2c-3.6,0-6.5,4.1-6.5,9.1c0,5,2.9,9.1,6.5,9.1 c1.1,0,2.2-0.4,3.1-1.2c0.5-0.4,1-0.6,1.6-0.6c2.3,0,4.2,3.4,4.3,7.6c0,0.3,0,0.6,0,0.9c-0.3,6-0.9,11.8-1.8,17.2 c5.4,0.9,11.2,1.4,17.3,1.7c0.3,0,0.5,0,0.8,0c4.3-0.1,7.7-2,7.6-4.3c0-0.6-0.2-1.1-0.6-1.6c-0.8-0.9-1.2-2-1.2-3.1 c0-3.6,4.1-6.5,9.1-6.5c5,0,9.1,2.9,9.1,6.5c0,1.1-0.4,2.2-1.2,3.1c-0.4,0.5-0.6,1-0.6,1.6c0,2.3,3.4,4.2,7.6,4.3c0.3,0,0.6,0,0.9,0 c6-0.3,11.8-0.8,17.2-1.7c-0.9-5.4-1.4-11.2-1.7-17.2c0-0.3,0-0.6,0-0.9c0.1-4.3,2-7.7,4.3-7.6c0.6,0,1.1,0.2,1.6,0.6 c0.9,0.8,2,1.2,3.1,1.2c3.6,0,6.5-4.1,6.5-9.1C352.9,245.9,350,241.8,346.4,241.8z"
];

type PuzzleSlot = {
  artist?: Artist;
  baseCenterX: number;
  baseCenterY: number;
  centerX: number;
  centerY: number;
  index: number;
  labelLayout: (typeof LABEL_LAYOUTS)[number];
  path: string;
  tone: string;
  translateX: number;
  translateY: number;
};

export function ArtistPuzzleWall({ artists, preview = false }: ArtistPuzzleWallProps) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null);
  const rowCount = Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.ceil(artists.length / COLUMNS)));
  const visibleArtists = artists.slice(0, rowCount * COLUMNS);
  const viewBoxHeight = BASE_HEIGHT + Math.max(0, rowCount - MIN_ROWS) * ROW_GAP;

  const slots = useMemo<PuzzleSlot[]>(() => {
    return Array.from({ length: rowCount * COLUMNS }, (_, index) => {
      const row = Math.floor(index / COLUMNS);
      const column = index % COLUMNS;
      const baseRow = row % MIN_ROWS;
      const baseColumn = column % 4;
      const baseIndex = baseRow * 4 + baseColumn;
      const translateX = Math.floor(column / 4) * REPEAT_COLUMN_SHIFT;
      const translateY = (row - baseRow) * ROW_GAP;
      const baseCenterX = SLOT_CENTERS_X[baseColumn];
      const baseCenterY = SLOT_CENTERS_Y[baseRow];

      return {
        artist: visibleArtists[index],
        baseCenterX,
        baseCenterY,
        centerX: baseCenterX + translateX,
        centerY: baseCenterY + translateY,
        index,
        labelLayout: LABEL_LAYOUTS[baseIndex],
        path: basePuzzlePaths[baseIndex],
        tone: THEME_COLORS[(row + column) % THEME_COLORS.length],
        translateX,
        translateY,
      };
    });
  }, [rowCount, visibleArtists]);

  const selectedSlot = selectedIndex === null ? null : slots[selectedIndex];
  const selectedArtist = selectedSlot?.artist ?? null;

  useEffect(() => {
    const node = wallRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -14% 0px", threshold: 0.18 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function handlePointerMove(event: PointerEvent<SVGGElement>, index: number) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    setHover({ index, x, y });
  }

  function openSlot(slot: PuzzleSlot) {
    if (!slot.artist) {
      return;
    }
    setSelectedIndex((current) => (current === slot.index ? null : slot.index));
  }

  function handleKeyDown(event: KeyboardEvent<SVGGElement>, slot: PuzzleSlot) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSlot(slot);
    }
  }

  return (
    <div ref={wallRef} className={`artist-puzzle-wall ${hasEntered ? "is-visible" : ""}`}>
      <div className="artist-puzzle-mobile-list">
        {visibleArtists.map((artist) => (
          <article key={artist.id} className="artist-puzzle-mobile-card">
            <div className={`artist-puzzle-mobile-avatar ${artist.avatarUrl ? "" : `bg-gradient-to-br ${artist.avatarTone}`}`}>
              {artist.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artist.avatarUrl} alt={`${artist.brandName} avatar`} />
              ) : (
                initials(artist.brandName)
              )}
            </div>
            <div className="min-w-0">
              <h3>{artist.brandName}</h3>
              <p>
                {artist.city}, {artist.country}
              </p>
              <div className="artist-puzzle-mobile-tags">
                {artist.categories.slice(0, 2).map((category) => (
                  <span key={category}>{category}</span>
                ))}
                {artist.acceptsCustom ? <span>Custom</span> : null}
              </div>
              <div className="mt-3">
                <PlatformLinks links={artist.platformLinks} compact />
              </div>
              <a className="artist-puzzle-mobile-link" href={`/artists/${artist.slug}`}>
                View artist profile
              </a>
            </div>
          </article>
        ))}
      </div>
      <svg
        className="artist-puzzle-svg"
        viewBox={`${BASE_VIEWBOX.x} ${BASE_VIEWBOX.y} ${BASE_VIEWBOX.width} ${viewBoxHeight}`}
        role="list"
        aria-label={preview ? "Featured artist puzzle wall" : "Artist puzzle wall"}
      >
        <defs>
          <filter id="artistPuzzleGlow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#7ea8c8" floodOpacity="0.16" />
          </filter>
        </defs>
        {slots.map((slot) => {
          const active = slot.index === selectedIndex;
          const currentHover = hover?.index === slot.index ? hover : null;
          const style = {
            "--piece-fill": slot.tone,
            "--piece-x": `${(currentHover?.x ?? 0) * 3}px`,
            "--piece-y": `${(currentHover?.y ?? 0) * 3}px`,
            "--piece-rotate": `${(currentHover?.x ?? 0) * 1.4}deg`,
            "--piece-tilt-x": `${(currentHover?.y ?? 0) * -10}deg`,
            "--piece-tilt-y": `${(currentHover?.x ?? 0) * 10}deg`,
            "--breathe-delay": `${(slot.index % COLUMNS) * 0.18 + Math.floor(slot.index / COLUMNS) * 0.1}s`,
            "--fade-delay": `${slot.index * 42}ms`,
          } as CSSProperties;

          return (
            <g key={slot.index} transform={slot.translateX || slot.translateY ? `translate(${slot.translateX} ${slot.translateY})` : undefined}>
              <g
                role={slot.artist ? "button" : "listitem"}
                tabIndex={slot.artist ? 0 : undefined}
                aria-label={slot.artist ? `${slot.artist.brandName}, ${slot.artist.city}, ${slot.artist.country}` : "Empty artist puzzle block"}
                className={`artist-puzzle-piece ${slot.artist ? "is-clickable" : "is-empty"} ${active ? "is-active" : ""}`}
                style={style}
                onPointerMove={(event) => handlePointerMove(event, slot.index)}
                onPointerLeave={() => setHover(null)}
                onClick={() => openSlot(slot)}
                onKeyDown={(event) => handleKeyDown(event, slot)}
              >
                <path d={slot.path} />
                {slot.artist ? (
                  <ArtistPuzzleLabel artist={slot.artist} centerX={slot.baseCenterX} centerY={slot.baseCenterY} layout={slot.labelLayout} tone={slot.tone} />
                ) : null}
              </g>
            </g>
          );
        })}
      </svg>

      {selectedArtist && selectedSlot ? (
        <div
          className="artist-puzzle-popover"
          style={
            {
              "--popover-x": `${clamp(((selectedSlot.centerX - BASE_VIEWBOX.x) / BASE_VIEWBOX.width) * 100, 22, 78)}%`,
              "--popover-y": `${clamp((selectedSlot.centerY / viewBoxHeight) * 100, 44, 78)}%`,
            } as CSSProperties
          }
        >
          <button className="artist-puzzle-close" type="button" onClick={() => setSelectedIndex(null)} aria-label="Close artist detail">
            ×
          </button>
          <div className={`artist-puzzle-detail-avatar ${selectedArtist.avatarUrl ? "" : `bg-gradient-to-br ${selectedArtist.avatarTone}`}`}>
            {selectedArtist.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedArtist.avatarUrl} alt={`${selectedArtist.brandName} avatar`} />
            ) : (
              initials(selectedArtist.brandName)
            )}
          </div>
          <p className="eyebrow">Artist Profile</p>
          <h3>{selectedArtist.brandName}</h3>
          <p className="artist-puzzle-location">
            {selectedArtist.city}, {selectedArtist.country}
          </p>
          <p>{selectedArtist.bio}</p>
          <div className="artist-puzzle-tags">
            {selectedArtist.categories.slice(0, 3).map((category) => (
              <span key={category}>{category}</span>
            ))}
            {selectedArtist.acceptsCustom ? <span>Custom</span> : null}
          </div>
          <div className="mt-4">
            <PlatformLinks links={selectedArtist.platformLinks} compact />
          </div>
          <div className="artist-puzzle-actions">
            <a href={`/artists/${selectedArtist.slug}`}>
              View artist profile
            </a>
            {selectedArtist.shopUrl ? (
              <a href={selectedArtist.shopUrl} target="_blank" rel="noreferrer">
                Visit artist shop
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ArtistPuzzleLabel({
  artist,
  centerX,
  centerY,
  layout,
  tone,
}: {
  artist: Artist;
  centerX: number;
  centerY: number;
  layout: (typeof LABEL_LAYOUTS)[number];
  tone: string;
}) {
  const nameLines = splitArtistName(artist.brandName, layout.maxNameLength);
  const avatarCenterY = centerY + layout.avatarY;
  const location = locationParts(artist);
  const clipId = `artist-avatar-${useId().replace(/:/g, "")}`;

  return (
    <g className="artist-puzzle-label" pointerEvents="none">
      {artist.avatarUrl ? (
        <defs>
          <clipPath id={clipId}>
            <circle cx={centerX} cy={avatarCenterY} r="6.7" />
          </clipPath>
        </defs>
      ) : null}
      <circle className="artist-puzzle-avatar-shell" cx={centerX} cy={avatarCenterY} r="8.5" />
      <circle className="artist-puzzle-avatar-core" cx={centerX} cy={avatarCenterY} r="6.7" fill={tone} />
      {artist.avatarUrl ? (
        <image
          className="artist-puzzle-avatar-image"
          href={artist.avatarUrl}
          x={centerX - 6.7}
          y={avatarCenterY - 6.7}
          width="13.4"
          height="13.4"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <text className="artist-puzzle-initials" x={centerX} y={avatarCenterY + 1.65} textAnchor="middle">
          {initials(artist.brandName)}
        </text>
      )}
      {nameLines.map((line, lineIndex) => (
        <text className="artist-puzzle-name" key={`${artist.id}-${line}`} x={centerX} y={centerY + layout.nameY + lineIndex * layout.lineGap} textAnchor="middle">
          {line}
        </text>
      ))}
      <text className="artist-puzzle-place artist-puzzle-place-city" x={centerX + layout.locationX} y={centerY + layout.locationY - 2} textAnchor="middle">
        {location.city}
      </text>
      <text className="artist-puzzle-place artist-puzzle-place-country" x={centerX + layout.locationX} y={centerY + layout.locationY + 2.1} textAnchor="middle">
        {location.country}
      </text>
    </g>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function countryCode(country: string) {
  const codes: Record<string, string> = {
    Australia: "AU",
    Canada: "CA",
    China: "CN",
    Japan: "JP",
    "United Kingdom": "UK",
    "United States": "US",
  };
  return codes[country] ?? country;
}

function locationParts(artist: Artist) {
  const cityCodes: Record<string, string> = {
    kyoto: "KYO",
    lisbon: "LIS",
    london: "LDN",
    "los angeles": "LA",
    melbourne: "MEL",
    seoul: "SEL",
    suzhou: "SUZ",
    vancouver: "VAN",
  };
  const normalizedCity = artist.city.trim().toLowerCase();
  const city = cityCodes[normalizedCity] ?? artist.city.slice(0, 3).toUpperCase();

  return {
    city,
    country: countryCode(artist.country),
  };
}

function splitArtistName(name: string, maxLength = 13) {
  const words = name.split(" ");

  if (name.length <= maxLength) {
    return [name];
  }

  if (words.length === 1) {
    return [compactText(name, maxLength)];
  }

  if (words.length === 2) {
    return words.map((word) => compactText(word, maxLength));
  }

  const midpoint = Math.ceil(words.length / 2);
  return [compactText(words.slice(0, midpoint).join(" "), maxLength), compactText(words.slice(midpoint).join(" "), maxLength)];
}

function compactText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
