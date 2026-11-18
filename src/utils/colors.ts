import { CATEGORY_COLORS } from '@/constants';

/** Look up a category color by name, falling back to gray */
export const colorOf = (name: string) => CATEGORY_COLORS[name] ?? CATEGORY_COLORS.gray;
