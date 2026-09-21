import { USING_MOCK_API } from '../../../api/index.js';
import styles from './DemoNotice.module.css';

// Shown only while the simulated backend is switched on. It disappears by
// itself the moment VITE_USE_MOCK_API is set to false, because it reads the
// same variable the API layer does.
//
// Kept from the course template on purpose. A deployment that quietly pretends
// to have a server is the difference between a deliberate staging site and a
// submission hoping nobody checks.
export default function DemoNotice() {
  if (!USING_MOCK_API) return null;

  return (
    <div className={styles.notice} role="status">
      <div className="shell">
        <strong>Demo mode.</strong> This deployment runs on a <strong>simulated backend</strong>.
        Routes, traffic times, car specs and DOE prices are sample data, and anything you save is
        stored in your own browser only. The full version runs against an Express API and a
        PostgreSQL database. See the README.
      </div>
    </div>
  );
}
