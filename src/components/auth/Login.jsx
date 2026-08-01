import { useEffect, useState } from 'react';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { auth } from '../../firebase';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem('ledger_email') || '');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    // Remove credentials saved by older builds; Firebase persistence handles login safely.
    localStorage.removeItem('ledger_dev_password');
    localStorage.removeItem('ledger_dev_email');
  }, []);

  const friendlyError = (authError) => {
    if (authError.code === 'auth/invalid-credential') return 'That email or password does not match our records.';
    if (authError.code === 'auth/email-already-in-use') return 'An account with this email already exists.';
    if (authError.code === 'auth/weak-password') return 'Use a password with at least 6 characters.';
    return authError.message.replace('Firebase: ', '');
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) localStorage.setItem('ledger_email', email);
      else localStorage.removeItem('ledger_email');
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (authError) {
      setError(friendlyError(authError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-intro">
        <span className="auth-logo"><img src="/icon-192.png" alt="100 Days" /></span>
        <span className="eyebrow">Your personal focus system</span>
        <h1>Small promises.<br />Kept every day.</h1>
        <p>Build a 100-day practice around the routines that matter to you, then watch your consistency grow.</p>
        <div className="auth-feature"><span><Check size={14} /></span> Your tasks, your categories, your pace</div>
        <div className="auth-feature"><span><Check size={14} /></span> Synced privately across your devices</div>
      </section>

      <section className="auth-card">
        <div className="auth-card-heading">
          <span className="auth-lock"><LockKeyhole size={19} /></span>
          <div><h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2><p>{isRegistering ? 'Start shaping your next 100 days.' : 'Continue where you left off.'}</p></div>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {error && <div className="error-banner" role="alert">{error}</div>}
          <label className="field"><span>Email</span><input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label className="field"><span>Password</span><input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={6} required /></label>
          <label className="remember-row">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
            <span>Remember my email</span>
          </label>
          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? 'One moment…' : isRegistering ? 'Create account' : 'Sign in'} {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <button className="google-button" onClick={handleGoogleLogin} disabled={loading}>
          <span className="google-mark">G</span> Continue with Google
        </button>
        <button className="auth-switch" onClick={() => { setIsRegistering((current) => !current); setError(''); }}>
          {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
}
