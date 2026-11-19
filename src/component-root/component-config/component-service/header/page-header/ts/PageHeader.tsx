import type { ReactNode } from 'react';
import styles from '../css/PageHeader.module.css';

/** Page title, short description and action buttons (wrap below the title on phones) */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className={styles.pheakkornyMbmPageHeader}>
      <div className={styles.pheakkornyMbmPageHeaderText}>
        {eyebrow && <div className={styles.pheakkornyMbmPageHeaderEyebrow}>{eyebrow}</div>}
        <h1 className={styles.pheakkornyMbmPageHeaderTitle}>{title}</h1>
        {description && <p className={styles.pheakkornyMbmPageHeaderDesc}>{description}</p>}
      </div>
      {actions && <div className={styles.pheakkornyMbmPageHeaderActions}>{actions}</div>}
    </header>
  );
}
