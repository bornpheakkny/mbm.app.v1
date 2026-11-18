export type Theme = 'light' | 'dark';

/** localStorage key for the chosen theme (also read by the inline script in index.html) */
export const THEME_KEY = 'mbm_theme';

/** Recharts takes colors as SVG attributes, so they can't use CSS variables */
export const CHART_COLORS: Record<
  Theme,
  { grid: string; axis: string; budgeted: string; actual: string; income: string; expenses: string; tooltipBg: string; tooltipBorder: string; text: string; cursor: string }
> = {
  light: {
    grid: '#e2e8f0',
    axis: '#64748b',
    budgeted: '#cbd5e1',
    actual: '#0f766e',
    income: '#22c55e',
    expenses: '#f97316',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e5e7eb',
    text: '#0f172a',
    cursor: 'rgb(15 23 42 / 0.05)',
  },
  dark: {
    grid: '#253149',
    axis: '#94a3b8',
    budgeted: '#475569',
    actual: '#14b8a6',
    income: '#4ade80',
    expenses: '#fb923c',
    tooltipBg: '#121a2b',
    tooltipBorder: '#253149',
    text: '#e2e8f0',
    cursor: 'rgb(255 255 255 / 0.05)',
  },
};
