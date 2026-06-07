import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { auth } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] p-4 font-serif">
      <div className="w-full max-w-md bg-white border border-[#e5e0d3] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-[#2c2b2a] text-[#fdfbf7] p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-[#fdfbf7]/10 rounded-full flex items-center justify-center mb-4">
            <Lock size={24} className="text-[#fdfbf7]" />
          </div>
          <h1 className="text-4xl italic mb-2">100 Days</h1>
          <p className="font-mono text-sm opacity-80 uppercase tracking-widest">Challenge Ledger</p>
        </div>
        
        <form onSubmit={handleAuth} className="p-8 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm font-mono rounded border border-red-200">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full border-b border-gray-300 py-2 bg-transparent focus:border-gray-800 outline-none transition font-mono"
              required={!isRegistering && email === ''}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 bg-transparent focus:border-gray-800 outline-none transition font-mono"
              required={!isRegistering && password === ''}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2c2b2a] text-[#fdfbf7] py-3 rounded font-mono uppercase tracking-widest text-sm hover:bg-[#1a1918] transition mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Access Ledger')}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e0d3]"></div>
            </div>
            <div className="relative flex justify-center text-xs font-mono">
              <span className="bg-white px-2 text-gray-500 uppercase tracking-widest">Or</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border border-[#e5e0d3] text-[#2c2b2a] py-3 rounded font-mono uppercase tracking-widest text-sm hover:bg-[#fdfbf7] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.86C4.03 20.65 7.74 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.86z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.74 1 4.03 3.35 2.18 7.05l3.66 2.86c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="text-center mt-6">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-mono text-gray-500 hover:text-[#2c2b2a] transition"
            >
              {isRegistering ? (
                <>Already have an account? <strong className="font-bold text-[#2c2b2a]">Sign In</strong></>
              ) : (
                <>Need to start your journey? <strong className="font-bold text-[#2c2b2a]">Create Account</strong></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}