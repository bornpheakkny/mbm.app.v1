import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { APP_NAME } from '@/constants';
import styles from './RecoveryCodes.module.css';

/** Shows freshly generated backup codes once, with copy / download */
export function RecoveryCodes({ codes, email }: { codes: string[]; email: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${APP_NAME} backup codes for ${email}\nEach code works once.\n\n${codes.join('\n')}\n`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — the user can still download or write them down
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-manager-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.recovery}>
      <p className="small muted">
        Keep these somewhere safe, like a password manager. If you lose your phone or can't get email codes, each one
        lets you sign in once. <strong>They won't be shown again.</strong>
      </p>
      <ol className={styles.codes}>
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <div className="row-actions row-actions--start">
        <button type="button" className="btn btn--secondary btn--sm" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={download}>
          <Download size={15} />
          Download .txt
        </button>
      </div>
    </div>
  );
}
