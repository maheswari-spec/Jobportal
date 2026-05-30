import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Sparkles, Mail, Lock, Shield } from 'lucide-react';
// Firebase imports (ensure `firebase` is installed in frontend)
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Initialize client Firebase app (provide your own env vars)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};
try {
  initializeApp(firebaseConfig);
} catch (e) {
  // ignore if already initialized in HMR
}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Real Firebase Google login implementation
  const handleFirebaseSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const currentUser = credential.user;
      const idToken = await currentUser.getIdToken();

      // Store Firebase ID token (short-lived) for attaching to backend requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('firebaseIdToken', idToken);
      }

      // Call backend to exchange/verify token and create local session (backend will verify ID token)
      const res = await api.post('/auth/firebase-login', { role: 'candidate' });
      setAuth(res.data.user, res.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebaseIdToken');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Firebase sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-800 p-8 shadow-2xl border border-slate-700">
        
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <Sparkles size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your AI Job Portal account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/50 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3.5 left-3.5 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute top-3.5 left-3.5 text-slate-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute bg-slate-800 px-3 text-xs text-slate-500 uppercase">Or connect with</span>
          <div className="h-[1px] w-full bg-slate-700"></div>
        </div>

        {/* Firebase Button */}
        <button
          onClick={handleFirebaseSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-900/80 active:scale-[0.98] transition-all"
        >
          <Shield size={16} className="text-primary-400" />
          Firebase SSO (Google/Email)
        </button>

        <p className="mt-8 text-center text-xs text-slate-400">
          New to the platform?{' '}
          <Link to="/register" className="font-bold text-primary-400 hover:text-primary-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
