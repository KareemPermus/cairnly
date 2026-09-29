import { useState } from 'react';
import styles from './ProjectDetail.module.css';

export default function DeleteProjectButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!confirming)
    return <button type="button" className={styles.btnDanger} onClick={() => setConfirming(true)}>Delete</button>;

  return (
    <div className={styles.confirm}>
      <span>{error ? 'Delete failed.' : 'Delete this project?'}</span>
      <button type="button" className={styles.btnDanger} disabled={busy}
        onClick={async () => {
          setBusy(true); setError(false);
          try { await onDelete(); } catch { setError(true); setBusy(false); }
        }}>
        {busy ? 'Deleting…' : 'Confirm'}
      </button>
      <button type="button" className={styles.btnGhost} onClick={() => setConfirming(false)}>Cancel</button>
    </div>
  );
}