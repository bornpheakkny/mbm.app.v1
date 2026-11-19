/** Join class names, skipping falsy values: cx(styles.row, active && styles.active) */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Pick a CSS-module variant class by value: variant(styles, 'pheakkornyMbmAlert', 'error')
 * -> styles.pheakkornyMbmAlertError. Values may be kebab-case ('danger-soft' -> DangerSoft).
 */
export function variant(styles: Record<string, string>, prefix: string, key: string | null | undefined | false) {
  if (!key) return undefined;
  return styles[prefix + key.replace(/(^|[-_])(\w)/g, (_m, _s, c: string) => c.toUpperCase())];
}
