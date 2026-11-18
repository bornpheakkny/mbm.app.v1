import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cx } from '@/utils/cx';
import styles from './ThemeToggle.module.css';

/** Switches between light and dark mode; the choice is remembered on this device */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={cx('icon-btn icon-btn--outline', styles.toggle, className)}
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
