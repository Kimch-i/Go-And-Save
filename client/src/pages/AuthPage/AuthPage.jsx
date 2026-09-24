import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import Logo from '../../components/atoms/Logo/Logo.jsx';
import TextInput from '../../components/atoms/TextInput/TextInput.jsx';
import Checkbox from '../../components/atoms/Checkbox/Checkbox.jsx';
import Button from '../../components/atoms/Button/Button.jsx';
import Footer from '../../components/organisms/Footer/Footer.jsx';
import DemoNotice from '../../components/molecules/DemoNotice/DemoNotice.jsx';
import * as storage from '../../services/storage.js';
import { listTrips, createTrip } from '../../api/index.js';
import { plannerLinkForTrip } from '../../lib/tripLink.js';
import { plural } from '../../lib/format.js';
import styles from './AuthPage.module.css';

import { listTrips, createTrip, signUp, logIn as apiLogIn } from '../../api/index.js';

function validate(mode, name, email, password) {
  const errors = {};
  if (mode === 'signup' && !name.trim()) errors.name = 'Enter your name.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter an email like you@email.com.';
  if (password.length < 8) errors.password = 'Use at least 8 characters.';
  return errors;
}

// Log in and Sign up on one route. The account is kept in localStorage until the API has JWT login.
export default function AuthPage({ session, vehicles, onLogIn }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState(params.get('tab') === 'signup' ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [showForgotNote, setShowForgotNote] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [tripCount, setTripCount] = useState(0);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    listTrips().then((trips) => setTripCount(trips.length)).catch(() => {});
  }, []);

  const cameToSave = params.get('reason') === 'save';
  const isSignup = mode === 'signup';

  if (session && !cameToSave && !leaving) {
    return <Navigate to="/profile" replace />;
  }

  function switchTo(next) {
    setMode(next);
    setErrors({});
    setShowForgotNote(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate(mode, name, email, password);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0]).focus();
      return;
    }

    setFormError('');
    try {
      const { token, user } = isSignup
        ? await signUp({ name: name.trim(), email: email.trim(), password })
        : await apiLogIn({ email: email.trim(), password });

      setLeaving(true);
      onLogIn(user.name, user.email, token);

      const pending = storage.takePendingTrip();
      if (pending) {
        try {
          await createTrip(pending);
          navigate(plannerLinkForTrip(pending, { saved: '1' }));
        } catch {
          navigate(plannerLinkForTrip(pending));
        }
        return;
      }
      navigate('/');
    } catch (error) {
      setFormError(error.message);
    }
  }

  const vehicleCount = vehicles.length;
  const migrateText = tripCount || vehicleCount
    ? `You have ${plural(tripCount, 'trip')} and ${plural(vehicleCount, 'vehicle')} saved on this device. Signing up moves them to your account.`
    : 'Your vehicles and trips will follow you to any device.';

  return (
    <>
      <DemoNotice />
      <main className={styles.auth}>
        <div className={styles.brand}>
          <Logo />
        </div>

        <h1 className="sr-only">{isSignup ? 'Sign up' : 'Log in'}</h1>

        {cameToSave && (
          <p className={`${styles.notice} ${styles.reason}`}>
            Log in to save this trip. It is kept on this device until you do.
          </p>
        )}

        <div className={styles.tabs} role="tablist" aria-label="Account">
          <button type="button" role="tab" id="tab-login" aria-selected={!isSignup} aria-controls="auth-form"
            onClick={() => switchTo('login')}>
            Log in
          </button>
          <button type="button" role="tab" id="tab-signup" aria-selected={isSignup} aria-controls="auth-form"
            onClick={() => switchTo('signup')}>
            Sign up
          </button>
        </div>

        <form id="auth-form" role="tabpanel" aria-labelledby={isSignup ? 'tab-signup' : 'tab-login'}
          onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <TextInput label="Your name" id="name" value={name} onChange={setName}
              autoComplete="name" placeholder="Juan dela Cruz" error={errors.name} />
          )}

          <TextInput label="Email" id="email" type="email" value={email} onChange={setEmail}
            autoComplete="email" placeholder="you@email.com" error={errors.email} />

          <TextInput label="Password" id="password" type="password" value={password} onChange={setPassword}
            autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="At least 8 characters"
            error={errors.password} />

          {!isSignup && (
            <>
              <div className={styles.row}>
                <Checkbox label="Remember me" id="remember" checked={remember} onChange={setRemember} />
                <Button variant="link" onClick={() => setShowForgotNote(true)}>Forgot password?</Button>
              </div>
              {showForgotNote && (
                <p className={`${styles.forgot} small muted`}>
                  Password reset arrives with the server. For now, sign up again with the same email.
                </p>
              )}
            </>
          )}

          {formError && <p className={`${styles.notice} small`} role="alert">{formError}</p>}
          
          <Button type="submit">{isSignup ? 'Create account' : 'Log in'}</Button>

          {isSignup && <p className={styles.notice}>{migrateText}</p>}
        </form>

        {!isSignup && (
          <p className={`${styles.guest} small`}>
            <Link to="/">Keep using it without an account</Link>
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
