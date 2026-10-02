import { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

// A small modal that matches the rest of the app (dark/light theme tokens,
// same radius and shadow as everything else) instead of the browser's own
// native confirm() popup, which looks nothing like GAS.
export default function ConfirmDialog({ title, message, confirmLabel = 'Remove', onConfirm, onCancel }) {
  // Escape closes it, same as clicking the backdrop.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
        <p id="confirm-dialog-message" className={`${styles.message} small muted`}>{message}</p>
        <div className={styles.actions}>
          {/* Focus lands here, not on confirm, so the safe choice is what
              Enter/Space triggers if the user doesn't move first. */}
          <button type="button" className={styles.cancel} autoFocus onClick={onCancel}>Cancel</button>
          <button type="button" className={styles.confirm} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
