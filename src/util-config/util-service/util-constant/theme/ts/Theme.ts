export type Theme = 'light' | 'dark';

/** localStorage key for the chosen theme (also read by the inline script in index.html) */
export const THEME_KEY = 'mbm_theme';

/** Recharts takes colors as SVG attributes, so they can't use CSS variables */
export const CHART_COLORS: Record<
  Theme,
  { grid: string; axis: string; budgeted: string; actual: string; income: string; expenses: string; tooltipBg: string; tooltipBorder: string; text: string; cursor: string }
> = {
  light: {
    grid: '#e9edf2',
    axis: '#8391a7',
    budgeted: '#d5dde7',
    actual: '#0d9488',
    income: '#10b981',
    expenses: '#f59e0b',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e4e8ee',
    text: '#0f172a',
    cursor: 'rgb(15 23 42 / 0.04)',
  },
  dark: {
    grid: '#1f2b44',
    axis: '#7c8aa5',
    budgeted: '#33425f',
    actual: '#2dd4bf',
    income: '#34d399',
    expenses: '#fbbf24',
    tooltipBg: '#152036',
    tooltipBorder: '#23314d',
    text: '#e5ebf5',
    cursor: 'rgb(255 255 255 / 0.04)',
  },
};
