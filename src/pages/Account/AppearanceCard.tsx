import { useState } from 'react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Alert } from '@/components/Alert';
import { CategoryBadge } from '@/components/CategoryBadge';
import { SegmentedControl } from '@/components/SegmentedControl';
import { UsageBar } from '@/components/UsageBar';
import { useTheme } from '@/context/ThemeContext';
import { usePreferences } from '@/hooks/usePreferences';
import { errorMessage } from '@/services';
import type { Preferences } from '@/types';
import styles from './AccountPage.module.css';

/** Sample rows for the live preview: [name, color, spent, budget] */
const SAMPLE: [string, string, number, number][] = [
  ['Rent', 'purple', 450, 450],
  ['Groceries', 'green', 231, 250],
  ['Transport', 'blue', 104, 90],
];

/** Theme, usage bar colors and badge style — saved to the account (theme is per device) */
export function AppearanceCard() {
  const { preference, setPreference } = useTheme();
  const { preferences, update } = usePreferences();
  const [error, setError] = useState<string | null>(null);

  const save = (patch: Partial<Preferences>) => {
    setError(null);
    update(patch).catch((err) => setError(errorMessage(err)));
  };

  return (
    <section className="card">
      <div className="card__title">
        <h2>
          <span className="card__icon">
            <Palette size={17} />
          </span>
          Appearance
        </h2>
      </div>

      <div className="form">
        {error && (
          <Alert onClose={() => setError(null)}>Couldn't save: {error}</Alert>
        )}

        <div className={styles.setting}>
          <div className={styles.settingText}>
            <span className="field__label">Theme</span>
            <span className="field__hint">Saved on this device. "System" follows your computer or phone.</span>
          </div>
          <SegmentedControl
            aria-label="Theme"
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ]}
          />
        </div>

        <hr className="divider" />

        <div className={styles.setting}>
          <div className={styles.settingText}>
            <span className="field__label">Usage bars</span>
            <span className="field__hint">
              {preferences.barColor === 'category'
                ? 'Each bar uses its category color. Over budget is striped red.'
                : 'Teal while on track, amber from 90%, striped red when over budget.'}
            </span>
          </div>
          <SegmentedControl
            aria-label="Usage bar colors"
            value={preferences.barColor}
            onChange={(barColor) => save({ barColor })}
            options={[
              { value: 'category', label: 'Category color' },
              { value: 'status', label: 'Budget status' },
            ]}
          />
        </div>

        <div className={styles.setting}>
          <div className={styles.settingText}>
            <span className="field__label">Category badges</span>
            <span className="field__hint">Change a category's color on the Categories page — any color works.</span>
          </div>
          <SegmentedControl
            aria-label="Badge style"
            value={preferences.badgeStyle}
            onChange={(badgeStyle) => save({ badgeStyle })}
            options={[
              { value: 'soft', label: 'Soft' },
              { value: 'solid', label: 'Solid' },
              { value: 'outline', label: 'Outline' },
            ]}
          />
        </div>

        <div className={styles.preview} aria-label="Preview">
          <span className={styles.previewLabel}>Preview</span>
          {SAMPLE.map(([name, color, spent, budget]) => (
            <div key={name} className={styles.previewRow}>
              <CategoryBadge name={name} color={color} />
              <UsageBar used={spent} budget={budget} color={color} className={styles.previewBar} />
              <span className={styles.previewPct}>{Math.round((spent / budget) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
