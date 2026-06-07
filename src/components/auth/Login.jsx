import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { auth } from '../../firebase';
// Notice there is now only ONE import from 'firebase/auth'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
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
      // Clean up the ugly Firebase error messages for the user
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
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-mono text-gray-500 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-2 bg-transparent focus:border-gray-800 outline-none transition font-mono"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#2c2b2a] text-[#fdfbf7] py-3 rounded font-mono uppercase tracking-widest text-sm hover:bg-[#1a1918] transition mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Access Ledger')}
          </button>

          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-mono text-gray-500 hover:text-[#2c2b2a] transition"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need to start your journey? Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}