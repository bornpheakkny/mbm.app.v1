import { useState } from 'react';
import { APP_NAME } from '@/constants';

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
    <div className="recovery">
      <p className="small">
        Save these somewhere safe (a password manager or printed). If you lose your phone or can't get email codes, each
        one lets you sign in once. <strong>They won't be shown again.</strong>
      </p>
      <ol className="recovery__codes">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <div className="row-actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={download}>
          Download .txt
        </button>
      </div>
    </div>
  );
}
