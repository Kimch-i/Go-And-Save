import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import Logo from '../../atoms/Logo/Logo.jsx';
import styles from './Header.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Planner', end: true },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/prices', label: 'Prices' },
  { to: '/trips', label: 'Trips' },
];

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

export default function Header({ session, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const navLinks = NAV_LINKS.map((link) => (
    <NavLink key={link.to} to={link.to} end={link.end} className={styles.navLink} onClick={closeMenu}>
      {link.label}
    </NavLink>
  ));

  return (
    <header className={styles.header}>
      <div className={`shell ${styles.bar}`}>
        <Logo />

        <nav className={styles.nav} aria-label="Main">
          {navLinks}
        </nav>

        <div className={styles.right}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="drawer"
            aria-label="Menu"
          >
            <MenuIcon />
          </button>

          {session ? (
            <Link to="/profile" className={styles.avatar} aria-label="Your profile" onClick={closeMenu}>
              {initials(session.name)}
            </Link>
          ) : (
            <Link to="/auth" className={styles.avatar} aria-label="Log in" onClick={closeMenu}>
              G
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav id="drawer" className={styles.drawer} aria-label="Main">
          <div className="shell">
            {navLinks}
            {session ? (
              <NavLink to="/profile" className={styles.navLink} onClick={closeMenu}>Profile</NavLink>
            ) : (
              <NavLink to="/auth" className={styles.navLink} onClick={closeMenu}>Log in</NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v1.8M8 13.2V15M15 8h-1.8M2.8 8H1M12.9 3.1l-1.3 1.3M4.4 11.6l-1.3 1.3M12.9 12.9l-1.3-1.3M4.4 4.4L3.1 3.1"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1z"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
