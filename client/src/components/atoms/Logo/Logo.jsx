import { Link } from 'react-router';
import styles from './Logo.module.css';

export default function Logo() {
  return (
    <Link to="/" className={styles.logo} aria-label="GAS home">
      <svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M4 19a10 10 0 1 1 18 0" fill="none" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M4 19A10 10 0 0 1 7.4 11.4" fill="none" stroke="var(--brand-fill)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="13" y1="19" x2="18.5" y2="13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="19" r="2" fill="currentColor" />
      </svg>
      <span aria-hidden="true">GAS</span>
    </Link>
  );
}
