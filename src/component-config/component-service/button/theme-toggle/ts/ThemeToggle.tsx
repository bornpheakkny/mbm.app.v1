import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@context/theme-provider/ts/ThemeContext';
import { cx } from '@util/util-consumption/class-name/ts/ClassName';
import styles from '../css/ThemeToggle.module.css';

/** Switches between light and dark mode; the choice is remembered on this device */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={cx('pheakkornyMbmIconBtn pheakkornyMbmIconBtnOutline', styles.pheakkornyMbmThemeToggle, className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
