import Button from '../../atoms/Button/Button.jsx';
import styles from './EmptyState.module.css';

export default function EmptyState({ title, message, actionLabel, actionTo, onAction, variant = 'empty' }) {
  const isError = variant === 'error';

  return (
    <div className={`${styles.empty} ${isError ? styles.error : ''}`} role={isError ? 'alert' : undefined}>
      {title && <p className={styles.title}>{title}</p>}
      {message && <p>{message}</p>}
      {actionLabel && (
        <div className={styles.action}>
          <Button variant="ghost" to={actionTo} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
