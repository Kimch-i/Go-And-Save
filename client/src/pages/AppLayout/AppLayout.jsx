import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import Header from '../../components/organisms/Header/Header.jsx';
import Footer from '../../components/organisms/Footer/Footer.jsx';
import DemoNotice from '../../components/molecules/DemoNotice/DemoNotice.jsx';
import styles from './AppLayout.module.css';

export default function AppLayout({ session, theme, onToggleTheme }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header session={session} theme={theme} onToggleTheme={onToggleTheme} />
      <DemoNotice />
      <main className={styles.main}>
        <div className="shell">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}
