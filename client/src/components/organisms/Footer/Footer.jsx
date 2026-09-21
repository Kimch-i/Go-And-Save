import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <p>
          Fuel prices from DOE weekly monitoring, Luzon.
          <br />
          Estimates only. Real consumption varies with driving style and road conditions.
        </p>
        <p>Kimchi · Go and Save · © 2026</p>
      </div>
    </footer>
  );
}
