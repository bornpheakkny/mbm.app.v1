/** Join class names, skipping falsy values: cx(styles.row, active && styles.active) */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
