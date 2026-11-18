/** Named category colors (same names the API stores) → [background, text] */
export const CATEGORY_COLORS: Record<string, { bg: string; fg: string; solid: string }> = {
  gray: { bg: '#f1f5f9', fg: '#475569', solid: '#94a3b8' },
  red: { bg: '#fee2e2', fg: '#b91c1c', solid: '#ef4444' },
  orange: { bg: '#ffedd5', fg: '#c2410c', solid: '#f97316' },
  yellow: { bg: '#fef9c3', fg: '#a16207', solid: '#eab308' },
  green: { bg: '#dcfce7', fg: '#15803d', solid: '#22c55e' },
  teal: { bg: '#ccfbf1', fg: '#0f766e', solid: '#14b8a6' },
  blue: { bg: '#dbeafe', fg: '#1d4ed8', solid: '#3b82f6' },
  purple: { bg: '#ede9fe', fg: '#6d28d9', solid: '#8b5cf6' },
  magenta: { bg: '#fce7f3', fg: '#be185d', solid: '#ec4899' },
};

export const COLOR_NAMES = Object.keys(CATEGORY_COLORS);

export const colorOf = (name: string) => CATEGORY_COLORS[name] ?? CATEGORY_COLORS.gray;
