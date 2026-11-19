import { CATEGORY_COLORS } from '@util/util-constant/UtilConstant';

export interface CategoryColor {
  /** Soft badge background */
  bg: string;
  /** Text on the soft background */
  fg: string;
  /** The color itself (dots, solid badges, bars) */
  solid: string;
  /** Readable text on top of `solid` */
  on: string;
}

const HEX = /^#[0-9a-f]{6}$/i;

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: string, b: string, amountOfB: number) => {
  const [x, y] = [toRgb(a), toRgb(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * amountOfB));
};

/** WCAG relative luminance (0 = black, 1 = white) */
function luminance(hex: string) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
};

/** Text color for a solid background: white, or near-black for light colors */
const onColor = (solid: string) => (contrast(solid, '#ffffff') >= 3 ? '#ffffff' : '#0f172a');

const cache = new Map<string, CategoryColor>();

/** Build badge colors from any hex color: a light tint background and text dark enough to read on it (≥ 4.5:1) */
function fromHex(hex: string): CategoryColor {
  const solid = hex.toLowerCase();
  const bg = mix(solid, '#ffffff', 0.85);
  let fg = solid;
  for (let step = 0; step < 10 && contrast(fg, bg) < 4.5; step++) fg = mix(fg, '#000000', 0.15);
  return { bg, fg, solid, on: onColor(solid) };
}

/**
 * Colors for a category color value: a preset name ("teal") or a custom "#rrggbb".
 * Unknown values fall back to gray.
 */
export function colorOf(color: string): CategoryColor {
  const hit = cache.get(color);
  if (hit) return hit;
  const preset = CATEGORY_COLORS[color];
  const result = preset
    ? { ...preset, on: onColor(preset.solid) }
    : HEX.test(color)
      ? fromHex(color)
      : { ...CATEGORY_COLORS.gray, on: onColor(CATEGORY_COLORS.gray.solid) };
  cache.set(color, result);
  return result;
}

export const isCustomColor = (color: string) => HEX.test(color);
