import { useState } from 'react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Alert } from '@component/modals/alert-banner/ts/Alert';
import { CategoryBadge } from '@component/info/category-badge/ts/CategoryBadge';
import { SegmentedControl } from '@component/input/segmented-control/ts/SegmentedControl';
import { UsageBar } from '@component/info/usage-bar/ts/UsageBar';
import { useTheme } from '@context/theme-provider/ts/ThemeContext';
import { usePreferences } from '@util/util-hook/use-preferences/ts/usePreferences';
import { errorMessage } from '@api/ApiService';
import type { Preferences } from '@type/type-model/ts/Model.type';
import styles from '../../css/main/AccountPage.module.css';

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
    <section className="pheakkornyMbmCard">
      <div className="pheakkornyMbmCardTitle">
        <h2>
          <span className="pheakkornyMbmCardIcon">
            <Palette size={17} />
          </span>
          Appearance
        </h2>
      </div>

      <div className="pheakkornyMbmForm">
        {error && (
          <Alert onClose={() => setError(null)}>Couldn't save: {error}</Alert>
        )}

        <div className={styles.pheakkornyMbmAccountPageSetting}>
          <div className={styles.pheakkornyMbmAccountPageSettingText}>
            <span className="pheakkornyMbmFieldLabel">Theme</span>
            <span className="pheakkornyMbmFieldHint">Saved on this device. "System" follows your computer or phone.</span>
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

        <hr className="pheakkornyMbmDivider" />

        <div className={styles.pheakkornyMbmAccountPageSetting}>
          <div className={styles.pheakkornyMbmAccountPageSettingText}>
            <span className="pheakkornyMbmFieldLabel">Usage bars</span>
            <span className="pheakkornyMbmFieldHint">
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

        <div className={styles.pheakkornyMbmAccountPageSetting}>
          <div className={styles.pheakkornyMbmAccountPageSettingText}>
            <span className="pheakkornyMbmFieldLabel">Category badges</span>
            <span className="pheakkornyMbmFieldHint">Change a category's color on the Categories page — any color works.</span>
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

        <div className={styles.pheakkornyMbmAccountPagePreview} aria-label="Preview">
          <span className={styles.pheakkornyMbmAccountPagePreviewLabel}>Preview</span>
          {SAMPLE.map(([name, color, spent, budget]) => (
            <div key={name} className={styles.pheakkornyMbmAccountPagePreviewRow}>
              <CategoryBadge name={name} color={color} />
              <UsageBar used={spent} budget={budget} color={color} className={styles.pheakkornyMbmAccountPagePreviewBar} />
              <span className={styles.pheakkornyMbmAccountPagePreviewPct}>{Math.round((spent / budget) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
